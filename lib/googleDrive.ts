import { getDriveClient } from './googleSheets';
import fs from 'fs';
import { Readable } from 'stream';

export async function createProjectFolder(projectId: string) {
  const drive = await getDriveClient();
  const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  const folderMetadata: {
    name: string;
    mimeType: string;
    parents?: string[];
  } = {
    name: projectId,
    mimeType: 'application/vnd.google-apps.folder',
  };
  
  if (parentFolderId) {
    folderMetadata.parents = [parentFolderId];
  }

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id',
  });

  const folderId = folder.data.id!;

  // Create subfolders
  const subfolders = ['before', 'during', 'after'];
  for (const subfolder of subfolders) {
    await drive.files.create({
      requestBody: {
        name: subfolder,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [folderId],
      },
      fields: 'id',
    });
  }

  return folderId;
}

export async function uploadPhotoToFolder(
  folderId: string,
  fileName: string,
  fileBuffer: Buffer,
  category: 'before' | 'during' | 'after'
) {
  const drive = await getDriveClient();

  // Get subfolder ID
  const response = await drive.files.list({
    q: `'${folderId}' in parents and name='${category}' and mimeType='application/vnd.google-apps.folder'`,
    fields: 'files(id, name)',
  });

  const subfolders = response.data.files || [];
  if (subfolders.length === 0) {
    throw new Error(`Subfolder '${category}' not found`);
  }

  const subfolderId = subfolders[0].id!;

  // Upload file
  const fileMetadata = {
    name: fileName,
    parents: [subfolderId],
  };

  const media = {
    mimeType: 'image/jpeg',
    body: Readable.from(fileBuffer),
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id',
  });

  return file.data.id!;
}

export async function getPhotosFromFolder(folderId: string, category?: 'before' | 'during' | 'after') {
  const drive = await getDriveClient();

  let parentId = folderId;

  if (category) {
    // Get subfolder ID
    const response = await drive.files.list({
      q: `'${folderId}' in parents and name='${category}' and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name)',
    });

    const subfolders = response.data.files || [];
    if (subfolders.length === 0) {
      return [];
    }
    parentId = subfolders[0].id!;
  }

  // Get photos
  const response = await drive.files.list({
    q: `'${parentId}' in parents and mimeType contains 'image/'`,
    fields: 'files(id, name, webViewLink, webContentLink, thumbnailLink, createdTime)',
  });

  return response.data.files || [];
}

export async function downloadPhoto(fileId: string): Promise<Buffer> {
  const drive = await getDriveClient();

  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );

  return Buffer.from(response.data as ArrayBuffer);
}

export async function getPhotoUrlsFromFolder(folderId: string): Promise<string[]> {
  const drive = await getDriveClient();
  const photoUrls: string[] = [];

  // Get all subfolders (before, during, after)
  const subfolderResponse = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
    fields: 'files(id, name)',
  });

  const subfolders = subfolderResponse.data.files || [];

  // Get photos from each subfolder (limit to 15 for performance)
  let photoCount = 0;
  const MAX_PHOTOS = 15;
  
  for (const subfolder of subfolders) {
    if (photoCount >= MAX_PHOTOS) break;
    
    const photosResponse = await drive.files.list({
      q: `'${subfolder.id}' in parents and mimeType contains 'image/'`,
      fields: 'files(id)',
      pageSize: Math.min(10, MAX_PHOTOS - photoCount),
    });

    const photos = photosResponse.data.files || [];
    
    // Download as base64 (works reliably, but optimize size)
    for (const photo of photos) {
      if (photoCount >= MAX_PHOTOS) break;
      
      try {
        // Download photo at reduced quality for faster loading
        const response = await drive.files.get(
          { fileId: photo.id!, alt: 'media' },
          { responseType: 'arraybuffer' }
        );
        
        // Convert to base64 data URL (JPEG assumed)
        const buffer = Buffer.from(response.data as ArrayBuffer);
        const base64 = buffer.toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64}`;
        
        photoUrls.push(dataUrl);
        photoCount++;
      } catch (error) {
        console.error(`Failed to download photo ${photo.id}:`, error);
      }
    }
  }

  return photoUrls;
}
