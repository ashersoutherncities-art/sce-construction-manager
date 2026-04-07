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
    const { projectId } = req.query;
    const where: any = { userId: user.id };
    if (projectId) where.projectId = projectId;

    const assignments = await prisma.subcontractorAssignment.findMany({
      where,
      include: {
        subcontractor: true,
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, assignments });
  }

  if (req.method === 'POST') {
    const { projectId, subcontractorId, task, amount, startDate, endDate, notes } = req.body;
    if (!projectId || !subcontractorId || !task) {
      return res.status(400).json({ success: false, error: 'projectId, subcontractorId, and task required' });
    }

    const assignment = await prisma.subcontractorAssignment.create({
      data: {
        projectId,
        subcontractorId,
        userId: user.id,
        task,
        amount: amount ? parseFloat(amount) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        notes,
      },
      include: { subcontractor: true, project: { select: { id: true, name: true } } },
    });
    return res.json({ success: true, assignment });
  }

  if (req.method === 'PATCH') {
    const { id, status, notes } = req.body;
    if (!id || !status) {
      return res.status(400).json({ success: false, error: 'id and status required' });
    }

    const assignment = await prisma.subcontractorAssignment.update({
      where: { id },
      data: { status, ...(notes !== undefined ? { notes } : {}) },
    });
    return res.json({ success: true, assignment });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
