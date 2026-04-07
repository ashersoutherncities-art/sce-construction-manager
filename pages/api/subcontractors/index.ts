import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const subs = await prisma.subcontractor.findMany({
      include: {
        assignments: {
          include: { project: { select: { id: true, name: true, status: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, subcontractors: subs });
  }

  if (req.method === 'POST') {
    const { name, company, trade, phone, email, licenseNumber, location, notes } = req.body;
    if (!name || !trade) {
      return res.status(400).json({ success: false, error: 'name and trade required' });
    }

    const sub = await prisma.subcontractor.create({
      data: { name, company, trade, phone, email, licenseNumber, location, notes },
    });
    return res.json({ success: true, subcontractor: sub });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
