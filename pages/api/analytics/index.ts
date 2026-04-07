import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(401).json({ error: 'User not found' });

  try {
    // Projects by status
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: {
        budgets: { include: { payments: true } },
        invoices: true,
        subcontractorAssignments: {
          include: { subcontractor: true },
        },
      },
    });

    const statusCounts: Record<string, number> = {};
    projects.forEach((p) => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });

    // Budget utilization per project
    const budgetData = projects.map((p) => {
      const totalBudget = p.budgets.reduce((sum, b) => sum + b.totalBudget, 0);
      const amountSpent = p.budgets.reduce((sum, b) => sum + b.amountSpent, 0);
      const invoiceTotal = p.invoices.reduce((sum, i) => sum + i.amount, 0);
      return {
        projectName: p.name,
        projectId: p.id,
        totalBudget,
        amountSpent,
        invoiceTotal,
        utilization: totalBudget > 0 ? Math.round((amountSpent / totalBudget) * 100) : 0,
      };
    });

    // Subcontractor performance
    const subs = await prisma.subcontractor.findMany({
      include: { assignments: true },
    });

    const subPerformance = subs.map((sub) => {
      const total = sub.assignments.length;
      const completed = sub.assignments.filter((a) => a.status === 'completed').length;
      const inProgress = sub.assignments.filter((a) => a.status === 'in_progress').length;
      return {
        name: sub.name,
        company: sub.company,
        trade: sub.trade,
        rating: sub.rating,
        totalAssignments: total,
        completed,
        inProgress,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    // Summary stats
    const totalBudget = budgetData.reduce((sum, b) => sum + b.totalBudget, 0);
    const totalSpent = budgetData.reduce((sum, b) => sum + b.amountSpent, 0);
    const totalInvoiced = budgetData.reduce((sum, b) => sum + b.invoiceTotal, 0);

    return res.status(200).json({
      success: true,
      analytics: {
        projectCount: projects.length,
        statusCounts,
        budgetData,
        subPerformance,
        summary: {
          totalBudget,
          totalSpent,
          totalInvoiced,
          overallUtilization: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}
