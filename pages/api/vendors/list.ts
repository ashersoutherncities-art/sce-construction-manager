import type { NextApiRequest, NextApiResponse } from 'next';
import { getVendors } from '@/lib/googleSheets';
import { getMockVendors } from '@/lib/mockStorage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use mock storage if Google Sheets not configured
    const useMock = !process.env.GOOGLE_SHEETS_VENDOR_DB_ID;
    const vendors = useMock ? getMockVendors() : await getVendors();

    return res.status(200).json({
      success: true,
      vendors,
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return res.status(500).json({ error: 'Failed to fetch vendors' });
  }
}
