/**
 * Materials Price API
 * GET /api/materials - list all materials (with optional filters)
 * GET /api/materials?category=Lumber
 * GET /api/materials?search=drywall
 * GET /api/materials?category=Drywall&subcategory=Sheets
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), '..', 'materials-db', 'materials.db');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = new Database(DB_PATH, { readonly: true });

    const { category, subcategory, search, limit = '200' } = req.query;

    let sql = `SELECT id, category, subcategory, name, unit, price, brand, sku, in_stock, last_updated 
               FROM materials WHERE 1=1`;
    const params: any[] = [];

    if (category) {
      sql += ` AND category = ?`;
      params.push(category);
    }
    if (subcategory) {
      sql += ` AND subcategory = ?`;
      params.push(subcategory);
    }
    if (search) {
      sql += ` AND (name LIKE ? OR category LIKE ? OR subcategory LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    sql += ` ORDER BY category, subcategory, name LIMIT ?`;
    params.push(parseInt(limit as string));

    const materials = db.prepare(sql).all(...params);

    const categories = db.prepare(`SELECT DISTINCT category FROM materials ORDER BY category`).all();

    db.close();

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json({
      success: true,
      count: materials.length,
      categories: categories.map((c: any) => c.category),
      materials,
    });
  } catch (err: any) {
    console.error('Materials API error:', err);
    // Return empty if DB not available
    return res.status(200).json({
      success: true,
      count: 0,
      categories: [],
      materials: [],
      note: 'Materials database not available',
    });
  }
}
