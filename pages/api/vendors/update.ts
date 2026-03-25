import type { NextApiRequest, NextApiResponse } from 'next';
import { addOrUpdateVendor } from '@/lib/googleSheets';
import { addOrUpdateMockVendor } from '@/lib/mockStorage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const vendor = req.body;

    if (!vendor.name || !vendor.trade) {
      return res.status(400).json({ error: 'Name and trade required' });
    }

    // Use mock storage if Google Sheets not configured
    const useMock = !process.env.GOOGLE_SHEETS_VENDOR_DB_ID;
    const vendorId = useMock ? addOrUpdateMockVendor(vendor) : await addOrUpdateVendor(vendor);

    return res.status(200).json({
      success: true,
      vendorId,
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return res.status(500).json({ error: 'Failed to update vendor' });
  }
}
