import { openDb } from './db';

export interface Contractor {
  id?: number;
  name: string;
  businessName?: string;
  services?: string;
  phone?: string;
  email?: string;
  website?: string;
  city?: string;
  state?: string;
  followers?: number;
  facebookUrl?: string;
  sourceDate?: string;
  verified?: boolean;
  notes?: string;
}

export interface ScrapeLog {
  id?: number;
  url: string;
  status: 'success' | 'error' | 'blocked' | 'not_found';
  extractedData?: string;
  errorMessage?: string;
  scrapedAt?: string;
}

/** Initialize contractors + scrape_log tables */
export async function initContractorDb() {
  const db = await openDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS contractors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      businessName TEXT,
      services TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      city TEXT,
      state TEXT DEFAULT 'NC',
      followers INTEGER,
      facebookUrl TEXT,
      sourceDate TEXT DEFAULT (datetime('now')),
      verified BOOLEAN DEFAULT 0,
      notes TEXT,
      UNIQUE(name, phone)
    );

    CREATE TABLE IF NOT EXISTS scrape_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      status TEXT NOT NULL,
      extractedData TEXT,
      errorMessage TEXT,
      scrapedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_contractors_name ON contractors(name);
    CREATE INDEX IF NOT EXISTS idx_contractors_phone ON contractors(phone);
    CREATE INDEX IF NOT EXISTS idx_contractors_email ON contractors(email);
    CREATE INDEX IF NOT EXISTS idx_contractors_city ON contractors(city);
  `);

  return db;
}

/** Check for duplicate contractors by phone, email, or similar name */
export async function findDuplicates(contractor: Contractor): Promise<Contractor[]> {
  const db = await initContractorDb();
  const duplicates: Contractor[] = [];

  // Check by phone
  if (contractor.phone) {
    const normalizedPhone = contractor.phone.replace(/\D/g, '');
    const byPhone = await db.all<Contractor[]>(
      `SELECT * FROM contractors WHERE REPLACE(REPLACE(REPLACE(REPLACE(phone, '-', ''), '(', ''), ')', ''), ' ', '') = ?`,
      normalizedPhone
    );
    duplicates.push(...byPhone);
  }

  // Check by email
  if (contractor.email) {
    const byEmail = await db.all<Contractor[]>(
      `SELECT * FROM contractors WHERE LOWER(email) = LOWER(?)`,
      contractor.email
    );
    duplicates.push(...byEmail);
  }

  // Check by name similarity (exact match or contained)
  if (contractor.name) {
    const byName = await db.all<Contractor[]>(
      `SELECT * FROM contractors WHERE LOWER(name) = LOWER(?) OR LOWER(businessName) = LOWER(?)`,
      contractor.name, contractor.name
    );
    duplicates.push(...byName);
  }

  // Check by Facebook URL
  if (contractor.facebookUrl) {
    const byFb = await db.all<Contractor[]>(
      `SELECT * FROM contractors WHERE facebookUrl = ?`,
      contractor.facebookUrl
    );
    duplicates.push(...byFb);
  }

  // Deduplicate the results
  const seen = new Set<number>();
  return duplicates.filter(d => {
    if (d.id && seen.has(d.id)) return false;
    if (d.id) seen.add(d.id);
    return true;
  });
}

/** Insert a contractor (after dedup check) */
export async function insertContractor(contractor: Contractor): Promise<{ id: number; duplicates: Contractor[] }> {
  const db = await initContractorDb();
  const duplicates = await findDuplicates(contractor);

  const result = await db.run(
    `INSERT INTO contractors (name, businessName, services, phone, email, website, city, state, followers, facebookUrl, verified, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    contractor.name,
    contractor.businessName || null,
    contractor.services || null,
    contractor.phone || null,
    contractor.email || null,
    contractor.website || null,
    contractor.city || null,
    contractor.state || 'NC',
    contractor.followers || null,
    contractor.facebookUrl || null,
    contractor.verified ? 1 : 0,
    contractor.notes || null
  );

  return { id: result.lastID!, duplicates };
}

/** Get all contractors with optional filters */
export async function getContractors(filters?: {
  verified?: boolean;
  city?: string;
  state?: string;
  search?: string;
}): Promise<Contractor[]> {
  const db = await initContractorDb();
  let query = 'SELECT * FROM contractors WHERE 1=1';
  const params: any[] = [];

  if (filters?.verified !== undefined) {
    query += ' AND verified = ?';
    params.push(filters.verified ? 1 : 0);
  }
  if (filters?.city) {
    query += ' AND LOWER(city) = LOWER(?)';
    params.push(filters.city);
  }
  if (filters?.state) {
    query += ' AND LOWER(state) = LOWER(?)';
    params.push(filters.state);
  }
  if (filters?.search) {
    query += ' AND (LOWER(name) LIKE ? OR LOWER(businessName) LIKE ? OR LOWER(services) LIKE ?)';
    const term = `%${filters.search.toLowerCase()}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY sourceDate DESC';
  return db.all<Contractor[]>(query, ...params);
}

/** Update contractor */
export async function updateContractor(id: number, updates: Partial<Contractor>): Promise<void> {
  const db = await initContractorDb();
  const fields = Object.entries(updates)
    .filter(([key]) => key !== 'id')
    .map(([key]) => `${key} = ?`);
  const values = Object.entries(updates)
    .filter(([key]) => key !== 'id')
    .map(([, val]) => val);

  if (fields.length === 0) return;

  await db.run(
    `UPDATE contractors SET ${fields.join(', ')} WHERE id = ?`,
    ...values, id
  );
}

/** Delete contractor */
export async function deleteContractor(id: number): Promise<void> {
  const db = await initContractorDb();
  await db.run('DELETE FROM contractors WHERE id = ?', id);
}

/** Toggle verified status */
export async function toggleVerified(id: number): Promise<void> {
  const db = await initContractorDb();
  await db.run('UPDATE contractors SET verified = NOT verified WHERE id = ?', id);
}

/** Log a scrape attempt */
export async function logScrape(log: ScrapeLog): Promise<void> {
  const db = await initContractorDb();
  await db.run(
    `INSERT INTO scrape_log (url, status, extractedData, errorMessage)
     VALUES (?, ?, ?, ?)`,
    log.url, log.status, log.extractedData || null, log.errorMessage || null
  );
}

/** Get scrape logs */
export async function getScrapeLogs(limit = 50): Promise<ScrapeLog[]> {
  const db = await initContractorDb();
  return db.all<ScrapeLog[]>('SELECT * FROM scrape_log ORDER BY scrapedAt DESC LIMIT ?', limit);
}

/** Export contractors as CSV string */
export async function exportContractorsCSV(filters?: { verified?: boolean }): Promise<string> {
  const contractors = await getContractors(filters);
  const headers = ['ID', 'Name', 'Business Name', 'Services', 'Phone', 'Email', 'Website', 'City', 'State', 'Followers', 'Facebook URL', 'Source Date', 'Verified', 'Notes'];
  
  const rows = contractors.map(c => [
    c.id,
    escapeCSV(c.name),
    escapeCSV(c.businessName),
    escapeCSV(c.services),
    escapeCSV(c.phone),
    escapeCSV(c.email),
    escapeCSV(c.website),
    escapeCSV(c.city),
    escapeCSV(c.state),
    c.followers || '',
    escapeCSV(c.facebookUrl),
    c.sourceDate || '',
    c.verified ? 'Yes' : 'No',
    escapeCSV(c.notes),
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

function escapeCSV(val?: string | null): string {
  if (!val) return '';
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

/** Merge two contractors (keep target, merge fields from source, delete source) */
export async function mergeContractors(targetId: number, sourceId: number): Promise<void> {
  const db = await initContractorDb();
  const [target, source] = await Promise.all([
    db.get<Contractor>('SELECT * FROM contractors WHERE id = ?', targetId),
    db.get<Contractor>('SELECT * FROM contractors WHERE id = ?', sourceId),
  ]);

  if (!target || !source) throw new Error('Contractor not found');

  // Merge: fill in missing fields from source
  const merged: Partial<Contractor> = {};
  const fields: (keyof Contractor)[] = ['businessName', 'services', 'phone', 'email', 'website', 'city', 'state', 'followers', 'facebookUrl', 'notes'];
  
  for (const field of fields) {
    if (!target[field] && source[field]) {
      (merged as any)[field] = source[field];
    }
  }

  // Merge services (combine unique)
  if (target.services && source.services) {
    const allServices = new Set([
      ...target.services.split(',').map(s => s.trim()),
      ...source.services.split(',').map(s => s.trim()),
    ]);
    merged.services = Array.from(allServices).join(', ');
  }

  // Merge notes
  if (target.notes && source.notes && target.notes !== source.notes) {
    merged.notes = `${target.notes}\n---\n${source.notes}`;
  }

  if (Object.keys(merged).length > 0) {
    await updateContractor(targetId, merged);
  }

  await deleteContractor(sourceId);
}
