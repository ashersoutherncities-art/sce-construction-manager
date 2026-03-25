#!/usr/bin/env node
/**
 * Google Sheets Setup Script
 * 
 * Creates the necessary Google Sheets with proper structure
 * for the SCE Construction Manager system.
 */

import { google } from 'googleapis';

async function setupSheets() {
  // Use the credentials file path - simpler and more reliable
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
    `${process.env.HOME}/.openclaw/workspace/google-integrations/credentials/service-account.json`;
  
  // Load the service account key file
  const fs = await import('fs');
  const keyFile = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  
  // Create JWT client with domain-wide delegation
  const auth = new google.auth.JWT({
    email: keyFile.client_email,
    key: keyFile.private_key,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive'
    ],
    subject: 'asher@developthesouth.com' // Impersonate this user
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });

  console.log('📊 Creating Google Sheets for SCE Construction Manager...\n');

  // Create Projects Sheet
  console.log('1️⃣ Creating Projects Database...');
  const projectsSheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: 'SCE Projects Database',
      },
      sheets: [
        {
          properties: {
            title: 'Projects',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    },
  });

  const projectsSpreadsheetId = projectsSheet.data.spreadsheetId!;
  console.log(`✅ Projects Sheet created: ${projectsSpreadsheetId}`);

  // Add headers to Projects sheet
  await sheets.spreadsheets.values.update({
    spreadsheetId: projectsSpreadsheetId,
    range: 'Projects!A1:N1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        'Project ID',
        'Timestamp',
        'Client Name',
        'Client Email',
        'Client Phone',
        'Property Address',
        'Property Type',
        'Current Condition',
        'Scope Requirements',
        'Budget Min',
        'Budget Max',
        'Timeline Expectation',
        'Photo Folder ID',
        'Status',
      ]],
    },
  });

  // Create Vendors Sheet
  console.log('\n2️⃣ Creating Vendors Database...');
  const vendorsSheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: 'SCE Vendors Database',
      },
      sheets: [
        {
          properties: {
            title: 'Vendors',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    },
  });

  const vendorsSpreadsheetId = vendorsSheet.data.spreadsheetId!;
  console.log(`✅ Vendors Sheet created: ${vendorsSpreadsheetId}`);

  // Add headers to Vendors sheet
  await sheets.spreadsheets.values.update({
    spreadsheetId: vendorsSpreadsheetId,
    range: 'Vendors!A1:L1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        'Vendor ID',
        'Name',
        'Trade',
        'Location',
        'Phone',
        'Email',
        'Reliability Score',
        'Pricing Tier',
        'Performance Notes',
        'Last Updated',
        'Total Jobs',
        'Successful Jobs',
      ]],
    },
  });

  // Create Google Drive folder
  console.log('\n3️⃣ Creating Google Drive Photo Storage...');
  const folder = await drive.files.create({
    requestBody: {
      name: 'SCE Project Photos',
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  });

  const folderId = folder.data.id!;
  console.log(`✅ Photo Storage created: ${folderId}`);

  // Output environment variables
  console.log('\n📝 Add these to your .env file:\n');
  console.log(`GOOGLE_SHEETS_PROJECT_DB_ID=${projectsSpreadsheetId}`);
  console.log(`GOOGLE_SHEETS_VENDOR_DB_ID=${vendorsSpreadsheetId}`);
  console.log(`GOOGLE_DRIVE_FOLDER_ID=${folderId}`);

  console.log('\n✨ Setup complete!');
}

setupSheets().catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
