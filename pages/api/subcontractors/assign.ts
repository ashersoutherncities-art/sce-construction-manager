import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(401).json({ error: 'User not found' });

  if (req.method === 'GET') {
    const { projectId } = req.query;
    const where: any = {};
    if (projectId) where.projectId = projectId;

    // Only show assignments for user's projects
    const assignments = await prisma.subcontractorAssignment.findMany({
      where: { ...where, userId: user.id },
      include: {
        subcontractor: true,
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, assignments });
  }

  if (req.method === 'POST') {
    const { projectId, subcontractorId, task, amount, startDate, endDate, notes } = req.body;

    if (!projectId || !subcontractorId || !task) {
      return res.status(400).json({ error: 'projectId, subcontractorId, and task required' });
    }

    const assignment = await prisma.subcontractorAssignment.create({
      data: {
        task,
        amount: amount ? parseFloat(amount) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        notes: notes || null,
        projectId,
        subcontractorId,
        userId: user.id,
      },
      include: { subcontractor: true, project: true },
    });

    return res.status(200).json({ success: true, assignment });
  }

  if (req.method === 'PUT') {
    const { id, status, notes } = req.body;
    if (!id) return res.status(400).json({ error: 'Assignment id required' });

    const assignment = await prisma.subcontractorAssignment.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: { subcontractor: true, project: true },
    });

    return res.status(200).json({ success: true, assignment });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
