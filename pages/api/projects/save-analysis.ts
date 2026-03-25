import type { NextApiRequest, NextApiResponse } from 'next';
import { saveCachedAnalysis } from '@/lib/googleSheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectId, scopeOfWork, costEstimate, photoCount } = req.body;

    console.log('💾 Saving analysis cache:', { projectId, photoCount, hasScopeOfWork: !!scopeOfWork, hasCostEstimate: !!costEstimate });

    if (!projectId) {
      return res.status(400).json({ error: 'Missing projectId' });
    }

    await saveCachedAnalysis(projectId, scopeOfWork, costEstimate, photoCount);

    console.log('✅ Analysis cache saved successfully');
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error saving analysis cache:', error);
    return res.status(500).json({ error: 'Failed to save analysis cache' });
  }
}
