import type { NextApiRequest, NextApiResponse } from 'next';
import { clearCachedAnalysis } from '@/lib/googleSheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Missing projectId' });
    }

    await clearCachedAnalysis(projectId);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error clearing analysis cache:', error);
    return res.status(500).json({ error: 'Failed to clear analysis cache' });
  }
}
