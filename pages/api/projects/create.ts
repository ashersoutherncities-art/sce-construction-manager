import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { addProjectToSheet } from '@/lib/googleSheets';
import { createProjectFolder, uploadPhotoToFolder } from '@/lib/googleDrive';
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

    // Extract form data
    const clientName = Array.isArray(fields.clientName) ? fields.clientName[0] : fields.clientName;
    const clientEmail = Array.isArray(fields.clientEmail)
      ? fields.clientEmail[0]
      : fields.clientEmail;
    const clientPhone = Array.isArray(fields.clientPhone)
      ? fields.clientPhone[0]
      : fields.clientPhone;
    const propertyAddress = Array.isArray(fields.propertyAddress)
      ? fields.propertyAddress[0]
      : fields.propertyAddress;
    const propertyType = Array.isArray(fields.propertyType)
      ? fields.propertyType[0]
      : fields.propertyType;
    const currentCondition = Array.isArray(fields.currentCondition)
      ? fields.currentCondition[0]
      : fields.currentCondition;
    const scopeRequirements = Array.isArray(fields.scopeRequirements)
      ? fields.scopeRequirements[0]
      : fields.scopeRequirements;
    const budgetMin = Array.isArray(fields.budgetMin) ? fields.budgetMin[0] : fields.budgetMin;
    const budgetMax = Array.isArray(fields.budgetMax) ? fields.budgetMax[0] : fields.budgetMax;
    const timelineExpectation = Array.isArray(fields.timelineExpectation)
      ? fields.timelineExpectation[0]
      : fields.timelineExpectation;

    // Use mock storage if Google Sheets not configured
    const useMock = !process.env.GOOGLE_SHEETS_PROJECT_DB_ID;
    
    let projectId: string;
    let folderId: string = '';
    
    if (useMock) {
      const { addMockProject } = await import('@/lib/mockStorage');
      projectId = addMockProject({
        timestamp: new Date().toISOString(),
        clientName: clientName || '',
        clientEmail: clientEmail || '',
        clientPhone: clientPhone || '',
        propertyAddress: propertyAddress || '',
        propertyType: propertyType || '',
        currentCondition: currentCondition || '',
        scopeRequirements: scopeRequirements || '',
        budgetMin: parseFloat(budgetMin || '0'),
        budgetMax: parseFloat(budgetMax || '0'),
        timelineExpectation: timelineExpectation || '',
        photoFolderId: '',
        status: 'new',
      });
      folderId = `mock-folder-${projectId}`;
    } else {
      // Create project in Google Sheets
      projectId = await addProjectToSheet({
        timestamp: new Date().toISOString(),
        clientName: clientName || '',
        clientEmail: clientEmail || '',
        clientPhone: clientPhone || '',
        propertyAddress: propertyAddress || '',
        propertyType: propertyType || '',
        currentCondition: currentCondition || '',
        scopeRequirements: scopeRequirements || '',
        budgetMin: parseFloat(budgetMin || '0'),
        budgetMax: parseFloat(budgetMax || '0'),
        timelineExpectation: timelineExpectation || '',
        photoFolderId: '',
        status: 'new',
      });

      // Create folder in Google Drive
      folderId = await createProjectFolder(projectId);
      
      // Update project with folder ID
      const { updateProjectFolder } = await import('@/lib/googleSheets');
      await updateProjectFolder(projectId, folderId);
    }

    // Upload photos if any (skip if using mock storage)
    const photoIds: string[] = [];
    if (!useMock) {
      const photoFiles = Object.values(files).flat();
      for (const file of photoFiles) {
        if (file && 'filepath' in file) {
          const fileBuffer = fs.readFileSync(file.filepath);
          const photoId = await uploadPhotoToFolder(folderId, file.originalFilename || 'photo.jpg', fileBuffer, 'before');
          photoIds.push(photoId);
        }
      }
      
      // Update project with photo IDs
      const { updateProjectPhotos } = await import('@/lib/googleSheets');
      await updateProjectPhotos(projectId, photoIds);
    }

    return res.status(200).json({
      success: true,
      projectId,
      folderId,
      photoIds,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ error: 'Failed to create project' });
  }
}
