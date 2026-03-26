import type { NextApiRequest, NextApiResponse } from 'next';
import {
  insertContractor,
  getContractors,
  updateContractor,
  deleteContractor,
  toggleVerified,
  exportContractorsCSV,
  mergeContractors,
  getScrapeLogs,
  Contractor,
} from '../../../lib/contractorDb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        const { action, verified, city, state, search } = req.query;

        // Export CSV
        if (action === 'export') {
          const csv = await exportContractorsCSV({
            verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
          });
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename=contractors.csv');
          return res.status(200).send(csv);
        }

        // Get scrape logs
        if (action === 'logs') {
          const logs = await getScrapeLogs();
          return res.status(200).json({ logs });
        }

        // List contractors
        const contractors = await getContractors({
          verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
          city: city as string,
          state: state as string,
          search: search as string,
        });
        return res.status(200).json({ contractors });
      }

      case 'POST': {
        const { action, contractor, targetId, sourceId } = req.body;

        // Import a single contractor
        if (!action || action === 'import') {
          if (!contractor || !contractor.name) {
            return res.status(400).json({ error: 'Contractor name is required' });
          }
          const result = await insertContractor(contractor as Contractor);
          return res.status(201).json({
            message: 'Contractor imported',
            id: result.id,
            duplicates: result.duplicates,
            hasDuplicates: result.duplicates.length > 0,
          });
        }

        // Merge contractors
        if (action === 'merge') {
          if (!targetId || !sourceId) {
            return res.status(400).json({ error: 'targetId and sourceId are required' });
          }
          await mergeContractors(targetId, sourceId);
          return res.status(200).json({ message: 'Contractors merged' });
        }

        return res.status(400).json({ error: 'Unknown action' });
      }

      case 'PUT': {
        const { id, ...updates } = req.body;
        if (!id) return res.status(400).json({ error: 'ID required' });

        if (updates.toggleVerified) {
          await toggleVerified(id);
          return res.status(200).json({ message: 'Verified status toggled' });
        }

        await updateContractor(id, updates);
        return res.status(200).json({ message: 'Contractor updated' });
      }

      case 'DELETE': {
        const id = parseInt(req.query.id as string || req.body.id);
        if (!id) return res.status(400).json({ error: 'ID required' });
        await deleteContractor(id);
        return res.status(200).json({ message: 'Contractor deleted' });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err: any) {
    console.error('Contractor import API error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
