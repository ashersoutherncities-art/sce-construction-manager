import type { NextApiRequest, NextApiResponse } from 'next';
import { recommendVendors } from '@/lib/vendors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { trade, location, budgetTier } = req.body;

    if (!trade || !location) {
      return res.status(400).json({ error: 'Trade and location required' });
    }

    const recommendations = await recommendVendors(trade, location, budgetTier || 'mid');

    return res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error('Error recommending vendors:', error);
    return res.status(500).json({ error: 'Failed to recommend vendors' });
  }
}
