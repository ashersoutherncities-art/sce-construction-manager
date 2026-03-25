import type { NextApiRequest, NextApiResponse } from 'next';
import { generateCostEstimate } from '@/lib/openai';
import type { ScopeOfWork } from '@/lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { scopeOfWork } = req.body as { scopeOfWork: ScopeOfWork };

    if (!scopeOfWork) {
      return res.status(400).json({ error: 'Scope of work is required' });
    }

    // Generate detailed cost estimate
    const estimate = await generateCostEstimate(scopeOfWork);

    return res.status(200).json({
      success: true,
      estimate,
    });
  } catch (error) {
    console.error('Error generating estimate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate estimate';
    return res.status(500).json({ 
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined
    });
  }
}
