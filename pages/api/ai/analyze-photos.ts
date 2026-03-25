import type { NextApiRequest, NextApiResponse } from 'next';
import { analyzePropertyPhotos } from '@/lib/openai';
import { getPhotosFromFolder } from '@/lib/googleDrive';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { folderId, photoUrls } = req.body;

    let urls = photoUrls || [];

    // If folderId provided, get photos from Google Drive
    if (folderId && urls.length === 0) {
      const photos = await getPhotosFromFolder(folderId, 'before');
      urls = photos.map((p) => p.thumbnailLink || p.webViewLink || '').filter(Boolean);
    }

    if (urls.length === 0) {
      return res.status(400).json({ error: 'No photos provided' });
    }

    // Analyze photos with AI
    const scopeOfWork = await analyzePropertyPhotos(urls);

    return res.status(200).json({
      success: true,
      scopeOfWork,
    });
  } catch (error) {
    console.error('Error analyzing photos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze photos';
    return res.status(500).json({ 
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined
    });
  }
}
