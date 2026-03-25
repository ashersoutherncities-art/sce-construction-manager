import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function openDb(): Promise<Database> {
  if (db) return db;
  
  const dbPath = path.join(process.cwd(), 'data.db');
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  
  return db;
}
