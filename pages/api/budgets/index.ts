import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  if (req.method === 'GET') {
    const budgets = await prisma.budget.findMany({
      where: { userId: user.id },
      include: {
        project: { select: { id: true, name: true, status: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, budgets });
  }

  if (req.method === 'POST') {
    const { projectId, totalBudget, category, notes } = req.body;
    if (!projectId || !totalBudget) {
      return res.status(400).json({ success: false, error: 'projectId and totalBudget required' });
    }

    const budget = await prisma.budget.create({
      data: {
        projectId,
        userId: user.id,
        totalBudget: parseFloat(totalBudget),
        category: category || 'General',
        notes,
      },
    });
    return res.json({ success: true, budget });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
