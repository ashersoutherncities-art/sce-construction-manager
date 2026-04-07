import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, name, trade, location, phone, email, reliabilityScore, performanceNotes, company, licenseNumber } = req.body;

    if (!name || !trade) {
      return res.status(400).json({ error: 'Name and trade required' });
    }

    if (id) {
      const updated = await prisma.subcontractor.update({
        where: { id },
        data: {
          name,
          trade,
          location: location || null,
          phone: phone || null,
          email: email || null,
          rating: reliabilityScore || 0,
          notes: performanceNotes || null,
          company: company || null,
          licenseNumber: licenseNumber || null,
        },
      });
      return res.status(200).json({ success: true, vendorId: updated.id });
    }

    const created = await prisma.subcontractor.create({
      data: {
        name,
        trade,
        location: location || null,
        phone: phone || null,
        email: email || null,
        rating: reliabilityScore || 5,
        notes: performanceNotes || null,
        company: company || null,
        licenseNumber: licenseNumber || null,
      },
    });

    return res.status(200).json({ success: true, vendorId: created.id });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return res.status(500).json({ error: 'Failed to update vendor' });
  }
}
