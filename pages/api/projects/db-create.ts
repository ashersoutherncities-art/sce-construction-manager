import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  // Ensure user exists in DB
  let user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: session.user.email,
        name: session.user.name || 'User',
        role: 'USER',
      },
    });
  }

  const { name, address, city, state, clientName, clientEmail, clientPhone, propertyType, description, costEstimate, status } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'Project name is required' });
  }

  const project = await prisma.project.create({
    data: {
      name,
      address,
      city,
      state,
      clientName,
      clientEmail,
      clientPhone,
      propertyType,
      description,
      costEstimate: costEstimate ? parseFloat(costEstimate) : null,
      status: status || 'intake',
      userId: user.id,
    },
  });

  return res.json({ success: true, project });
}
