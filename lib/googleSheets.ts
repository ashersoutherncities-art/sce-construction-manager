import { google } from 'googleapis';
import fs from 'fs';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'];

export async function getGoogleAuth() {
  // Use the credentials file path with domain-wide delegation
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
    `${process.env.HOME}/.openclaw/workspace/google-integrations/credentials/service-account.json`;
  
  const keyFile = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  
  // Create JWT client with domain-wide delegation
  const auth = new google.auth.JWT({
    email: keyFile.client_email,
    key: keyFile.private_key,
    scopes: SCOPES,
    subject: 'asher@developthesouth.com' // Impersonate this user
  });

  return auth;
}

export async function getSheetsClient() {
  const auth = await getGoogleAuth();
  return google.sheets({ version: 'v4', auth });
}

export async function getDriveClient() {
  const auth = await getGoogleAuth();
  return google.drive({ version: 'v3', auth });
}

// Project Database Schema
export interface Project {
  id: string;
  timestamp: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  propertyAddress: string;
  propertyType: string;
  currentCondition: string;
  scopeRequirements: string;
  budgetMin: number;
  budgetMax: number;
  timelineExpectation: string;
  photoFolderId: string;
  status: 'new' | 'analyzing' | 'quoted' | 'accepted' | 'in-progress' | 'completed';
}

// Vendor Database Schema
export interface Vendor {
  id: string;
  name: string;
  trade: string;
  location: string;
  phone: string;
  email: string;
  reliabilityScore: number; // 1-10
  pricingTier: 'competitive' | 'mid' | 'premium';
  performanceNotes: string;
  lastUpdated: string;
  totalJobs: number;
  successfulJobs: number;
}

export async function addProjectToSheet(project: Omit<Project, 'id'>) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_PROJECT_DB_ID;

  const projectId = `PRJ-${Date.now()}`;
  const row = [
    projectId,
    project.timestamp,
    project.clientName,
    project.clientEmail,
    project.clientPhone,
    project.propertyAddress,
    project.propertyType,
    project.currentCondition,
    project.scopeRequirements,
    project.budgetMin,
    project.budgetMax,
    project.timelineExpectation,
    project.photoFolderId,
    project.status,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Projects!A:N',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [row],
    },
  });

  return projectId;
}

export async function getProjects() {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_PROJECT_DB_ID;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Projects!A2:Q', // Extended to column Q for cached analysis
  });

  const rows = response.data.values || [];
  return rows.map((row) => ({
    id: row[0],
    timestamp: row[1],
    clientName: row[2],
    clientEmail: row[3],
    clientPhone: row[4],
    propertyAddress: row[5],
    propertyType: row[6],
    currentCondition: row[7],
    scopeRequirements: row[8],
    budgetMin: parseFloat(row[9]),
    budgetMax: parseFloat(row[10]),
    timelineExpectation: row[11],
    photoFolderId: row[12],
    status: row[13],
    cachedScopeOfWork: (row[14] && typeof row[14] === 'string' && row[14].trim()) ? JSON.parse(row[14]) : null,
    cachedCostEstimate: (row[15] && typeof row[15] === 'string' && row[15].trim()) ? JSON.parse(row[15]) : null,
    photoCount: row[16] ? parseInt(row[16]) : 0,
  })) as Project[];
}

export async function updateProjectStatus(projectId: string, status: Project['status']) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_PROJECT_DB_ID;

  // Find row with projectId
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Projects!A:A',
  });

  const rows = response.data.values || [];
  const rowIndex = rows.findIndex(row => row[0] === projectId);

  if (rowIndex === -1) throw new Error('Project not found');

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Projects!N${rowIndex + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[status]],
    },
  });
}

export async function updateProjectPhotos(projectId: string, photoIds: string[]) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_PROJECT_DB_ID;

  // Find row with projectId
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Projects!A:A',
  });

  const rows = response.data.values || [];
  const rowIndex = rows.findIndex(row => row[0] === projectId);

  if (rowIndex === -1) throw new Error('Project not found');

  // Store photo IDs as comma-separated string in a new column (O)
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Projects!O${rowIndex + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[photoIds.join(',')]],
    },
  });
}

export async function getProjectPhotos(projectId: string): Promise<string[]> {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_PROJECT_DB_ID;

  // Find row with projectId
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Projects!A:O',
  });

  const rows = response.data.values || [];
  const row = rows.find(r => r[0] === projectId);

  if (!row || !row[14]) return [];

  return row[14].split(',').filter((id: string) => id.trim());
}

export async function updateProjectFolder(projectId: string, folderId: string) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_PROJECT_DB_ID;

  // Find row with projectId
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Projects!A:A',
  });

  const rows = response.data.values || [];
  const rowIndex = rows.findIndex(row => row[0] === projectId);

  if (rowIndex === -1) throw new Error('Project not found');

  // Update folder ID in column M (photoFolderId)
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Projects!M${rowIndex + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[folderId]],
    },
  });
}

export async function getVendors(trade?: string, location?: string) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_VENDOR_DB_ID;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Vendors!A2:K',
  });

  const rows = response.data.values || [];
  let vendors = rows.map((row) => ({
    id: row[0],
    name: row[1],
    trade: row[2],
    location: row[3],
    phone: row[4],
    email: row[5],
    reliabilityScore: parseFloat(row[6]),
    pricingTier: row[7],
    performanceNotes: row[8],
    lastUpdated: row[9],
    totalJobs: parseInt(row[10]),
    successfulJobs: parseInt(row[11]),
  })) as Vendor[];

  if (trade) {
    vendors = vendors.filter(v => v.trade.toLowerCase().includes(trade.toLowerCase()));
  }

  if (location) {
    vendors = vendors.filter(v => v.location.toLowerCase().includes(location.toLowerCase()));
  }

  return vendors;
}

export async function addOrUpdateVendor(vendor: Partial<Vendor> & { name: string; trade: string }) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_VENDOR_DB_ID;

  // Check if vendor exists
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Vendors!A:K',
  });

  const rows = response.data.values || [];
  const existingIndex = rows.findIndex(row => row[1] === vendor.name && row[2] === vendor.trade);

  const vendorId = vendor.id || `VND-${Date.now()}`;
  const row = [
    vendorId,
    vendor.name,
    vendor.trade,
    vendor.location || '',
    vendor.phone || '',
    vendor.email || '',
    vendor.reliabilityScore || 5,
    vendor.pricingTier || 'mid',
    vendor.performanceNotes || '',
    new Date().toISOString(),
    vendor.totalJobs || 0,
    vendor.successfulJobs || 0,
  ];

  if (existingIndex !== -1) {
    // Update existing
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Vendors!A${existingIndex + 1}:K${existingIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
  } else {
    // Add new
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Vendors!A:K',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
  }

  return vendorId;
}

// Save cached analysis results
export async function saveCachedAnalysis(
  projectId: string,
  scopeOfWork: any,
  costEstimate: any,
  photoCount: number
) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_PROJECT_DB_ID;

  // Find project row
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Projects!A:A',
  });

  const rows = response.data.values || [];
  const rowIndex = rows.findIndex((row) => row[0] === projectId);

  if (rowIndex === -1) {
    throw new Error('Project not found');
  }

  // Update columns O, P, Q (cached analysis)
  // Use RAW to prevent Google Sheets from interpreting JSON as formulas
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Projects!O${rowIndex + 1}:Q${rowIndex + 1}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        scopeOfWork ? JSON.stringify(scopeOfWork) : '',
        costEstimate ? JSON.stringify(costEstimate) : '',
        photoCount.toString(),
      ]],
    },
  });
}

// Clear cached analysis when new photos added
export async function clearCachedAnalysis(projectId: string) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_PROJECT_DB_ID;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Projects!A:A',
  });

  const rows = response.data.values || [];
  const rowIndex = rows.findIndex((row) => row[0] === projectId);

  if (rowIndex === -1) {
    throw new Error('Project not found');
  }

  // Clear columns O, P, Q
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Projects!O${rowIndex + 1}:Q${rowIndex + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['', '', '0']],
    },
  });
}
