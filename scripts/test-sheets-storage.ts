#!/usr/bin/env node
/**
 * Test Google Sheets Storage
 * 
 * Verifies that projects can be saved to Google Sheets
 */

import 'dotenv/config';
import { addProjectToSheet, getProjects } from '../lib/googleSheets';

async function testSheetsStorage() {
  console.log('📊 Testing Google Sheets Storage...\n');

  // Test project data
  const testProject = {
    timestamp: new Date().toISOString(),
    clientName: 'Test Client',
    clientEmail: 'test@example.com',
    clientPhone: '555-1234',
    propertyAddress: '123 Test St, Charlotte, NC',
    propertyType: 'Single Family',
    currentCondition: 'Good',
    scopeRequirements: 'Kitchen renovation',
    budgetMin: 50000,
    budgetMax: 75000,
    timelineExpectation: '2-3 months',
    photoFolderId: 'test-folder-id',
    status: 'new' as const,
  };

  try {
    // 1. Add test project
    console.log('1️⃣ Adding test project to Google Sheets...');
    const projectId = await addProjectToSheet(testProject);
    console.log(`✅ Project created with ID: ${projectId}`);

    // 2. Retrieve projects
    console.log('\n2️⃣ Retrieving projects from Google Sheets...');
    const projects = await getProjects();
    console.log(`✅ Found ${projects.length} project(s)`);

    // 3. Display the test project
    const savedProject = projects.find(p => p.id === projectId);
    if (savedProject) {
      console.log('\n3️⃣ Test project data:');
      console.log(JSON.stringify(savedProject, null, 2));
    } else {
      throw new Error('Test project not found in retrieved projects');
    }

    console.log('\n✨ Google Sheets storage test PASSED!');
    console.log('\n📝 Next steps:');
    console.log('- View Projects Sheet: https://docs.google.com/spreadsheets/d/' + process.env.GOOGLE_SHEETS_PROJECT_DB_ID);
    console.log('- View Vendors Sheet: https://docs.google.com/spreadsheets/d/' + process.env.GOOGLE_SHEETS_VENDOR_DB_ID);
    console.log('- View Photo Storage: https://drive.google.com/drive/folders/' + process.env.GOOGLE_DRIVE_FOLDER_ID);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testSheetsStorage();
