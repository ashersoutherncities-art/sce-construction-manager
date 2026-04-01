import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getProjects } from '@/lib/googleSheets';
import { getMockProjects } from '@/lib/mockStorage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ✅ NEW: Get session and verify user is authenticated
    const session = await getServerSession(req, res, authOptions);
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] [ProjectsList] Session check:`, {
      hasSession: !!session,
      userEmail: session?.user?.email,
    });

    if (!session || !session.user) {
      console.log(`[${timestamp}] [ProjectsList] ❌ UNAUTHORIZED - no session`);
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized - please log in' 
      });
    }

    console.log(`[${timestamp}] [ProjectsList] ✅ User authenticated:`, session.user.email);

    // Use mock storage if Google Sheets not configured
    const useMock = !process.env.GOOGLE_SHEETS_PROJECT_DB_ID;
    let projects;
    
    if (useMock) {
      projects = getMockProjects();
      // ✅ NEW: Filter mock projects by user email
      projects = projects.filter((p: any) => p.userEmail === session.user?.email || !p.userEmail);
    } else {
      try {
        projects = await getProjects();
        // ✅ NEW: Filter Google Sheets projects by user email
        projects = projects.filter((p: any) => p.userEmail === session.user?.email || !p.userEmail);
      } catch (sheetsError) {
        // Fall back to mock if Google Sheets fails
        console.warn('Google Sheets failed, using mock storage:', sheetsError);
        projects = getMockProjects();
        projects = projects.filter((p: any) => p.userEmail === session.user?.email || !p.userEmail);
      }
    }

    console.log(`[${timestamp}] [ProjectsList] ✅ Returning ${projects.length} projects for ${session.user.email}`);

    return res.status(200).json({
      success: true,
      projects,
      userEmail: session.user.email,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    // Return error instead of silently returning empty
    return res.status(500).json({
      success: false,
      error: 'Error fetching projects',
      details: (error as any).message,
    });
  }
}
