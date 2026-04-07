import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId, invoiceNumber, vendor, amount, description, dueDate, status } = req.body;

  if (!projectId || !invoiceNumber || !vendor || !amount) {
    return res.status(400).json({ error: 'projectId, invoiceNumber, vendor, and amount required' });
  }

  try {
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        vendor,
        amount: parseFloat(amount),
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || 'pending',
        projectId,
      },
    });

    // Update budget amountSpent
    const budgets = await prisma.budget.findMany({ where: { projectId } });
    if (budgets.length > 0) {
      const totalInvoiced = await prisma.invoice.aggregate({
        where: { projectId },
        _sum: { amount: true },
      });
      await prisma.budget.update({
        where: { id: budgets[0].id },
        data: { amountSpent: totalInvoiced._sum.amount || 0 },
      });
    }

    return res.status(200).json({ success: true, invoice });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return res.status(500).json({ error: 'Failed to create invoice' });
  }
}
