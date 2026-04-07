import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const subcontractors = await prisma.subcontractor.findMany({
      include: {
        assignments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const vendors = subcontractors.map((sub) => {
      const totalJobs = sub.assignments.length;
      const completedJobs = sub.assignments.filter((a) => a.status === 'completed').length;
      return {
        id: sub.id,
        name: sub.name,
        company: sub.company,
        trade: sub.trade,
        phone: sub.phone,
        email: sub.email,
        licenseNumber: sub.licenseNumber,
        location: sub.location || '',
        rating: sub.rating,
        notes: sub.notes,
        totalJobs,
        successfulJobs: completedJobs,
        reliabilityScore: sub.rating,
        pricingTier: 'mid',
        performanceNotes: sub.notes || '',
      };
    });

    return res.status(200).json({ success: true, vendors });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return res.status(500).json({ error: 'Failed to fetch vendors' });
  }
}
