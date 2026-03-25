import type { NextApiRequest, NextApiResponse } from 'next';
import { generateCostEstimate, ScopeOfWork } from '@/lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { scopeOfWork } = req.body as { scopeOfWork: ScopeOfWork };

    if (!scopeOfWork) {
      return res.status(400).json({ error: 'Scope of work required' });
    }

    const costEstimate = await generateCostEstimate(scopeOfWork);

    return res.status(200).json({
      success: true,
      costEstimate,
    });
  } catch (error) {
    console.error('Error generating cost estimate:', error);
    return res.status(500).json({ error: 'Failed to generate cost estimate' });
  }
}
