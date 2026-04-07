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

  const { budgetId, amount, method, reference, notes } = req.body;

  if (!budgetId || !amount) {
    return res.status(400).json({ error: 'budgetId and amount required' });
  }

  try {
    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        method: method || null,
        reference: reference || null,
        notes: notes || null,
        budgetId,
      },
    });

    // Update budget amountSpent
    const totalPayments = await prisma.payment.aggregate({
      where: { budgetId },
      _sum: { amount: true },
    });
    await prisma.budget.update({
      where: { id: budgetId },
      data: { amountSpent: totalPayments._sum.amount || 0 },
    });

    return res.status(200).json({ success: true, payment });
  } catch (error) {
    console.error('Error creating payment:', error);
    return res.status(500).json({ error: 'Failed to create payment' });
  }
}
