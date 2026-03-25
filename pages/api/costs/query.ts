import type { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, search, assembly, quantity } = req.query;

    const dbPath = path.join(process.env.HOME || '', '.openclaw/workspace/construction-costs/costs.db');
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    let results;

    switch (type) {
      case 'material':
        results = await db.all(
          `SELECT category, item, unit, cost_low, cost_high, notes 
           FROM material_costs 
           WHERE item LIKE ? OR category LIKE ?
           ORDER BY category, item`,
          [`%${search}%`, `%${search}%`]
        );
        break;

      case 'labor':
        results = await db.all(
          `SELECT trade, skill_level, rate_per_hour, notes 
           FROM labor_rates 
           WHERE trade LIKE ?
           ORDER BY trade, skill_level`,
          [`%${search}%`]
        );
        break;

      case 'assembly':
        results = await db.all(
          `SELECT assembly_name, unit, material_cost, labor_cost, total_cost, productivity, notes 
           FROM assembly_costs 
           WHERE assembly_name LIKE ?
           ORDER BY assembly_name`,
          [`%${search}%`]
        );
        break;

      case 'markup':
        results = await db.all(
          `SELECT factor_type, percentage, description 
           FROM markup_factors 
           ORDER BY factor_type`
        );
        break;

      case 'estimate':
        if (!assembly || !quantity) {
          await db.close();
          return res.status(400).json({ error: 'Missing assembly or quantity' });
        }

        const assemblyData = await db.get(
          `SELECT assembly_name, unit, material_cost, labor_cost, total_cost 
           FROM assembly_costs 
           WHERE assembly_name LIKE ? 
           LIMIT 1`,
          [`%${assembly}%`]
        );

        if (!assemblyData) {
          await db.close();
          return res.status(404).json({ error: 'Assembly not found' });
        }

        const qty = parseFloat(quantity as string);
        results = {
          assembly: assemblyData.assembly_name,
          unit: assemblyData.unit,
          quantity: qty,
          material_total: assemblyData.material_cost * qty,
          labor_total: assemblyData.labor_cost * qty,
          total_cost: assemblyData.total_cost * qty,
          unit_costs: {
            material: assemblyData.material_cost,
            labor: assemblyData.labor_cost,
            total: assemblyData.total_cost,
          },
        };
        break;

      default:
        await db.close();
        return res.status(400).json({ error: 'Invalid query type' });
    }

    await db.close();
    return res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('Cost query error:', error);
    return res.status(500).json({ 
      error: 'Database query failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
