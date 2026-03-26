import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { updateProjectStatus } from '@/lib/googleSheets';
import { updateMockProjectStatus } from '@/lib/mockStorage';

const VALID_STATUSES = ['intake', 'analyzing', 'underwriting', 'accepted', 'closed'] as const;
type ProjectStatus = (typeof VALID_STATUSES)[number];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Require authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { projectId, status } = req.body;

  if (!projectId || !status) {
    return res.status(400).json({ error: 'Missing projectId or status' });
  }

  if (!VALID_STATUSES.includes(status as ProjectStatus)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
    });
  }

  try {
    const useMock = !process.env.GOOGLE_SHEETS_PROJECT_DB_ID;

    if (useMock) {
      updateMockProjectStatus(projectId, status);
    } else {
      await updateProjectStatus(projectId, status);
    }

    console.log(`📋 Status updated: ${projectId} → ${status} by ${session.user?.email || 'unknown'}`);

    return res.status(200).json({
      success: true,
      projectId,
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user?.email || 'unknown',
    });
  } catch (error) {
    console.error('❌ Error updating project status:', error);
    return res.status(500).json({ error: 'Failed to update project status' });
  }
}
