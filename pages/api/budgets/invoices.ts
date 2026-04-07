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
    const { projectId } = req.query;
    const where = projectId ? { projectId: projectId as string } : {};
    const invoices = await prisma.invoice.findMany({
      where,
      include: { project: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, invoices });
  }

  if (req.method === 'POST') {
    const { projectId, invoiceNumber, vendor, amount, dueDate, description } = req.body;
    if (!projectId || !invoiceNumber || !vendor || !amount) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const invoice = await prisma.invoice.create({
      data: {
        projectId,
        invoiceNumber,
        vendor,
        amount: parseFloat(amount),
        dueDate: dueDate ? new Date(dueDate) : null,
        description,
      },
    });
    return res.json({ success: true, invoice });
  }

  if (req.method === 'PATCH') {
    const { id, status, paidDate } = req.body;
    if (!id || !status) {
      return res.status(400).json({ success: false, error: 'id and status required' });
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidDate: status === 'paid' ? (paidDate ? new Date(paidDate) : new Date()) : null,
      },
    });

    // Update budget spent amount if invoice is paid
    if (status === 'paid') {
      const budget = await prisma.budget.findFirst({ where: { projectId: invoice.projectId } });
      if (budget) {
        await prisma.budget.update({
          where: { id: budget.id },
          data: { amountSpent: { increment: invoice.amount } },
        });
      }
    }

    return res.json({ success: true, invoice });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
