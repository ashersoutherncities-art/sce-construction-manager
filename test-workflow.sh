#!/bin/bash

# Test the complete SCE Construction Manager workflow
BASE_URL="http://localhost:3000"

echo "🧪 Testing SCE Construction Manager End-to-End Workflow"
echo "================================================"
echo ""

# Test 1: Homepage
echo "✅ Test 1: Homepage loads"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/)
if [ "$STATUS" -eq 200 ]; then
  echo "   ✓ Homepage: OK (HTTP $STATUS)"
else
  echo "   ✗ Homepage: FAILED (HTTP $STATUS)"
  exit 1
fi
echo ""

# Test 2: Intake Page
echo "✅ Test 2: Intake page loads"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/intake)
if [ "$STATUS" -eq 200 ]; then
  echo "   ✓ Intake page: OK (HTTP $STATUS)"
else
  echo "   ✗ Intake page: FAILED (HTTP $STATUS)"
  exit 1
fi
echo ""

# Test 3: Analyze Page
echo "✅ Test 3: Analyze page loads"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/analyze)
if [ "$STATUS" -eq 200 ]; then
  echo "   ✓ Analyze page: OK (HTTP $STATUS)"
else
  echo "   ✗ Analyze page: FAILED (HTTP $STATUS)"
  exit 1
fi
echo ""

# Test 4: Dashboard
echo "✅ Test 4: Dashboard loads"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/dashboard)
if [ "$STATUS" -eq 200 ]; then
  echo "   ✓ Dashboard: OK (HTTP $STATUS)"
else
  echo "   ✗ Dashboard: FAILED (HTTP $STATUS)"
  exit 1
fi
echo ""

# Test 5: Vendors Page
echo "✅ Test 5: Vendors page loads"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/vendors)
if [ "$STATUS" -eq 200 ]; then
  echo "   ✓ Vendors page: OK (HTTP $STATUS)"
else
  echo "   ✗ Vendors page: FAILED (HTTP $STATUS)"
  exit 1
fi
echo ""

# Test 6: API - List Vendors
echo "✅ Test 6: Vendors API works"
RESPONSE=$(curl -s $BASE_URL/api/vendors/list)
if echo "$RESPONSE" | grep -q '"success":true'; then
  VENDOR_COUNT=$(echo "$RESPONSE" | grep -o '"id":' | wc -l | tr -d ' ')
  echo "   ✓ Vendors API: OK ($VENDOR_COUNT vendors returned)"
else
  echo "   ✗ Vendors API: FAILED"
  echo "   Response: $RESPONSE"
  exit 1
fi
echo ""

# Test 7: API - List Projects
echo "✅ Test 7: Projects API works"
RESPONSE=$(curl -s $BASE_URL/api/projects/list)
if echo "$RESPONSE" | grep -q '"success":true'; then
  PROJECT_COUNT=$(echo "$RESPONSE" | grep -o '"id":' | wc -l | tr -d ' ')
  echo "   ✓ Projects API: OK ($PROJECT_COUNT projects)"
else
  echo "   ✗ Projects API: FAILED"
  echo "   Response: $RESPONSE"
  exit 1
fi
echo ""

# Test 8: Create a test project
echo "✅ Test 8: Create test project"
RESPONSE=$(curl -s -X POST $BASE_URL/api/projects/create \
  -F "clientName=Test Client" \
  -F "clientEmail=test@example.com" \
  -F "clientPhone=704-555-0100" \
  -F "propertyAddress=123 Test St, Charlotte, NC" \
  -F "propertyType=single-family" \
  -F "currentCondition=Needs renovation" \
  -F "scopeRequirements=Full kitchen and bathroom remodel" \
  -F "budgetMin=50000" \
  -F "budgetMax=100000" \
  -F "timelineExpectation=6-8 weeks")

if echo "$RESPONSE" | grep -q '"success":true'; then
  PROJECT_ID=$(echo "$RESPONSE" | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
  echo "   ✓ Project created: $PROJECT_ID"
else
  echo "   ✗ Project creation: FAILED"
  echo "   Response: $RESPONSE"
  exit 1
fi
echo ""

# Test 9: Verify project appears in list
echo "✅ Test 9: Verify new project in list"
RESPONSE=$(curl -s $BASE_URL/api/projects/list)
if echo "$RESPONSE" | grep -q "$PROJECT_ID"; then
  echo "   ✓ New project appears in list"
else
  echo "   ✗ New project NOT in list"
  echo "   Response: $RESPONSE"
  exit 1
fi
echo ""

echo "================================================"
echo "🎉 All tests passed!"
echo ""
echo "📝 Summary:"
echo "   • All page routes working (/intake, /analyze, /dashboard, /vendors)"
echo "   • Vendor API working (mock data)"
echo "   • Project creation working"
echo "   • Projects appear in dashboard"
echo ""
echo "⚠️  Note: Photo analysis requires actual OpenAI API calls"
echo "   and cannot be fully tested without images."
echo ""
echo "✅ App is functional and ready for use!"
