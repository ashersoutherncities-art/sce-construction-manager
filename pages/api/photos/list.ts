import type { NextApiRequest, NextApiResponse } from 'next';
import { getPhotoUrlsFromFolder } from '@/lib/googleDrive';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { folderId } = req.query;

    if (!folderId || typeof folderId !== 'string') {
      return res.status(400).json({ error: 'Missing folderId parameter' });
    }

    const photos = await getPhotoUrlsFromFolder(folderId);

    return res.status(200).json({
      success: true,
      photos,
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return res.status(500).json({ error: 'Failed to fetch photos' });
  }
}
