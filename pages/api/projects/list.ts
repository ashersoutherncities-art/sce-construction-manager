import type { NextApiRequest, NextApiResponse } from 'next';
import { getProjects } from '@/lib/googleSheets';
import { getMockProjects } from '@/lib/mockStorage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use mock storage if Google Sheets not configured
    const useMock = !process.env.GOOGLE_SHEETS_PROJECT_DB_ID;
    const projects = useMock ? getMockProjects() : await getProjects();

    return res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
}
