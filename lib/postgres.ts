import { sql } from '@vercel/postgres';

export async function query(sqlQuery: string, params: any[] = []) {
  try {
    const result = await sql.query(sqlQuery, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function initialize() {
  try {
    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        picture TEXT,
        googleId TEXT,
        createdAt TIMESTAMP DEFAULT NOW(),
        lastLogin TIMESTAMP DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        userId INTEGER REFERENCES users(id),
        name TEXT NOT NULL,
        address TEXT,
        city TEXT,
        state TEXT,
        status TEXT DEFAULT 'intake' CHECK (status IN ('intake', 'analyzing', 'underwriting', 'accepted', 'closed')),
        analysis TEXT,
        costEstimate NUMERIC,
        createdAt TIMESTAMP DEFAULT NOW(),
        statusChangedAt TIMESTAMP DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS contractors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        businessName TEXT,
        services TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        city TEXT,
        state TEXT DEFAULT 'NC',
        followers INTEGER,
        facebookUrl TEXT,
        sourceDate TIMESTAMP DEFAULT NOW(),
        verified BOOLEAN DEFAULT FALSE,
        notes TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS scrape_log (
        id SERIAL PRIMARY KEY,
        url TEXT,
        status TEXT,
        dataExtracted TEXT,
        error TEXT,
        createdAt TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}
