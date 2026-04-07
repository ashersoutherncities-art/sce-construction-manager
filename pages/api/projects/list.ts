import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized - please log in' });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: {
        budgets: true,
        invoices: true,
        subcontractorAssignments: {
          include: { subcontractor: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      projects,
      userEmail: session.user.email,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({
      success: false,
      error: 'Error fetching projects',
      details: (error as any).message,
    });
  }
}
