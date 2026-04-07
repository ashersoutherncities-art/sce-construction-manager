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
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  // Projects by status
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, status: true, costEstimate: true, progress: true, createdAt: true },
  });

  const projectsByStatus: Record<string, number> = {};
  for (const p of projects) {
    projectsByStatus[p.status] = (projectsByStatus[p.status] || 0) + 1;
  }

  // Budget summary
  const budgets = await prisma.budget.findMany({
    where: { userId: user.id },
    include: { project: { select: { name: true } } },
  });

  const totalBudget = budgets.reduce((sum, b) => sum + b.totalBudget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.amountSpent, 0);
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const budgetByProject = budgets.map((b) => ({
    projectName: b.project.name,
    totalBudget: b.totalBudget,
    amountSpent: b.amountSpent,
    utilization: b.totalBudget > 0 ? (b.amountSpent / b.totalBudget) * 100 : 0,
  }));

  // Invoices summary
  const invoices = await prisma.invoice.findMany({
    where: { project: { userId: user.id } },
  });

  const invoicesByStatus: Record<string, number> = {};
  const invoiceAmountByStatus: Record<string, number> = {};
  for (const inv of invoices) {
    invoicesByStatus[inv.status] = (invoicesByStatus[inv.status] || 0) + 1;
    invoiceAmountByStatus[inv.status] = (invoiceAmountByStatus[inv.status] || 0) + inv.amount;
  }

  // Subcontractor performance
  const assignments = await prisma.subcontractorAssignment.findMany({
    where: { userId: user.id },
    include: { subcontractor: { select: { name: true, trade: true, rating: true } } },
  });

  const subPerformance: Record<string, { name: string; trade: string; total: number; completed: number; inProgress: number; rating: number }> = {};
  for (const a of assignments) {
    const key = a.subcontractorId;
    if (!subPerformance[key]) {
      subPerformance[key] = {
        name: a.subcontractor.name,
        trade: a.subcontractor.trade,
        total: 0,
        completed: 0,
        inProgress: 0,
        rating: a.subcontractor.rating,
      };
    }
    subPerformance[key].total++;
    if (a.status === 'completed') subPerformance[key].completed++;
    if (a.status === 'in_progress') subPerformance[key].inProgress++;
  }

  // Monthly project creation trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recentProjects = projects.filter((p) => p.createdAt >= sixMonthsAgo);
  const monthlyTrend: Record<string, number> = {};
  for (const p of recentProjects) {
    const month = p.createdAt.toISOString().slice(0, 7);
    monthlyTrend[month] = (monthlyTrend[month] || 0) + 1;
  }

  return res.json({
    success: true,
    analytics: {
      projects: {
        total: projects.length,
        byStatus: projectsByStatus,
        averageProgress: projects.length > 0 ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length) : 0,
      },
      budget: {
        totalBudget,
        totalSpent,
        remaining: totalBudget - totalSpent,
        utilization: Math.round(budgetUtilization),
        byProject: budgetByProject,
      },
      invoices: {
        total: invoices.length,
        byStatus: invoicesByStatus,
        amountByStatus: invoiceAmountByStatus,
      },
      subcontractors: {
        total: Object.keys(subPerformance).length,
        performance: Object.values(subPerformance),
      },
      trends: {
        monthly: monthlyTrend,
      },
    },
  });
}
