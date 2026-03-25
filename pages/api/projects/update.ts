import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { uploadPhotoToFolder } from '@/lib/googleDrive';
import { updateProjectPhotos, getProjectPhotos } from '@/lib/googleSheets';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({ multiples: true });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      }
    );

    const projectId = Array.isArray(fields.projectId) ? fields.projectId[0] : fields.projectId;
    let folderId = Array.isArray(fields.folderId) ? fields.folderId[0] : fields.folderId;

    if (!projectId) {
      return res.status(400).json({ error: 'Missing projectId' });
    }

    // Create folder if it doesn't exist
    if (!folderId || folderId === '') {
      const { createProjectFolder } = await import('@/lib/googleDrive');
      folderId = await createProjectFolder(projectId);
      
      // Update project with new folder ID
      const { updateProjectFolder } = await import('@/lib/googleSheets');
      await updateProjectFolder(projectId, folderId);
    }

    // Get existing photos
    const existingPhotoIds = await getProjectPhotos(projectId);

    // Upload new photos
    const newPhotoIds: string[] = [];
    const photoFiles = Object.values(files).flat();
    
    for (const file of photoFiles) {
      if (file && 'filepath' in file) {
        const fileBuffer = fs.readFileSync(file.filepath);
        const photoId = await uploadPhotoToFolder(
          folderId,
          file.originalFilename || 'photo.jpg',
          fileBuffer,
          'additional'
        );
        newPhotoIds.push(photoId);
      }
    }

    // Combine existing and new photo IDs
    const allPhotoIds = [...existingPhotoIds, ...newPhotoIds];

    // Update project with all photo IDs
    await updateProjectPhotos(projectId, allPhotoIds);

    return res.status(200).json({
      success: true,
      newPhotoIds,
      totalPhotos: allPhotoIds.length,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({ error: 'Failed to update project' });
  }
}
