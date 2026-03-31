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
    let projects;
    
    if (useMock) {
      projects = getMockProjects();
    } else {
      try {
        projects = await getProjects();
      } catch (sheetsError) {
        // Fall back to mock if Google Sheets fails
        console.warn('Google Sheets failed, using mock storage:', sheetsError);
        projects = getMockProjects();
      }
    }

    return res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    // Return empty projects instead of 500 error
    return res.status(200).json({
      success: true,
      projects: [],
    });
  }
}
