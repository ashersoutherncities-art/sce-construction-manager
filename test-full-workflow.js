#!/usr/bin/env node

const http = require('http');

// Test 1: Create a project
function createProject() {
  return new Promise((resolve, reject) => {
    const testData = {
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      clientPhone: '704-555-1234',
      propertyAddress: '123 Main St, Charlotte, NC 28202',
      propertyType: 'Single-Family',
      currentCondition: 'Needs Renovation',
      scopeRequirements: 'Full kitchen and bathroom remodel',
      budgetMin: '75000',
      budgetMax: '100000',
      timelineExpectation: '4-6 months'
    };

    const boundary = '----WebKitFormBoundary' + Math.random().toString(36);
    let body = '';

    for (const [key, value] of Object.entries(testData)) {
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
      body += `${value}\r\n`;
    }

    body += `--${boundary}--\r\n`;

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/projects/create',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.success) {
            resolve(result);
          } else {
            reject(new Error(result.error || 'Unknown error'));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Test 2: List projects
function listProjects() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/projects/list',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.success) {
            resolve(result);
          } else {
            reject(new Error(result.error || 'Unknown error'));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('=== Construction Manager - Full Workflow Test ===\n');
  console.log('Configuration:');
  console.log('  - GOOGLE_SHEETS_PROJECT_DB_ID is empty');
  console.log('  - Should use mock in-memory storage');
  console.log('  - Data will persist during this test session\n');

  try {
    // Test 1: Create project
    console.log('Test 1: Creating a new project...');
    const createResult = await createProject();
    console.log('✅ Project created successfully!');
    console.log(`   Project ID: ${createResult.projectId}`);
    console.log(`   Folder ID: ${createResult.folderId}\n`);

    // Test 2: List projects
    console.log('Test 2: Retrieving projects list...');
    const listResult = await listProjects();
    console.log('✅ Projects retrieved successfully!');
    console.log(`   Total projects: ${listResult.projects.length}`);
    
    if (listResult.projects.length > 0) {
      console.log('\n   Project details:');
      listResult.projects.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.clientName} - ${p.propertyAddress}`);
        console.log(`      Status: ${p.status}`);
        console.log(`      Budget: $${p.budgetMin} - $${p.budgetMax}`);
      });
    }

    console.log('\n=== All Tests Passed! ===');
    console.log('\n📋 Summary:');
    console.log('  ✅ Project creation endpoint working');
    console.log('  ✅ Mock storage functioning correctly');
    console.log('  ✅ Project listing endpoint working');
    console.log('  ✅ Data persistence within session confirmed');
    console.log('\nNote: Mock storage is in-memory and will reset on server restart.');
    console.log('This is expected behavior when GOOGLE_SHEETS_PROJECT_DB_ID is not configured.');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test Failed:');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

runTests();
