#!/usr/bin/env node

// Test project creation endpoint
const http = require('http');

const testData = {
  clientName: 'Test Client',
  clientEmail: 'test@example.com',
  clientPhone: '555-1234',
  propertyAddress: '123 Test St, Charlotte, NC',
  propertyType: 'Single-Family',
  currentCondition: 'Good',
  scopeRequirements: 'Kitchen renovation',
  budgetMin: '50000',
  budgetMax: '75000',
  timelineExpectation: '3 months'
};

// Create FormData boundary and body
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

console.log('Testing project creation endpoint...');
console.log('Expected: Should use mock storage since GOOGLE_SHEETS_PROJECT_DB_ID is empty\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response: ${data}\n`);

    try {
      const parsed = JSON.parse(data);
      if (parsed.success) {
        console.log('✅ SUCCESS: Project created successfully!');
        console.log(`   Project ID: ${parsed.projectId}`);
        console.log(`   Folder ID: ${parsed.folderId}`);
        console.log('\nMock storage is working correctly.');
      } else {
        console.log('❌ FAILED: Project creation failed');
        console.log(`   Error: ${parsed.error || 'Unknown error'}`);
      }
    } catch (e) {
      console.log('❌ FAILED: Could not parse response');
      console.log(`   Raw response: ${data}`);
    }

    process.exit(parsed.success ? 0 : 1);
  });
});

req.on('error', (error) => {
  console.error('❌ FAILED: Request error');
  console.error(`   ${error.message}`);
  process.exit(1);
});

req.write(body);
req.end();
