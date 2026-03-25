# Testing Guide

This document provides comprehensive testing instructions for the SCE Construction Manager.

---

## Quick Tests

### 1. Test OpenAI Connection

```bash
npm run test:openai
```

**Expected output:**
```
✅ API key found
✅ Response received
✅ JSON parsing successful
🎉 All tests passed!
```

### 2. Test Photo Analysis

```bash
npm run test:photos
```

**Expected output:**
```
✅ API key found
📸 Testing with sample kitchen image
✅ Response received in ~6s
✅ Successfully parsed JSON response
📊 Analysis Results with recommendations
🎉 Photo analysis test completed successfully!
```

---

## Manual Testing

### Test 1: Project Intake Form

1. Start the dev server: `npm run dev`
2. Go to http://localhost:3001/intake
3. Fill out the form with test data:
   ```
   Client Name: John Doe
   Email: test@example.com
   Phone: (704) 555-1234
   Property Address: 123 Test St, Charlotte, NC 28205
   Property Type: Single Family
   Current Condition: Kitchen needs updating, bathroom renovations
   Scope Requirements: Full kitchen remodel, 2 bathroom updates, new flooring throughout
   Budget Min: 30000
   Budget Max: 50000
   Timeline: 4-6 weeks
   ```
4. Upload 2-3 test photos (any images work)
5. Click **Submit Project**

**Expected result:**
- ✅ Form submits successfully
- ✅ Project ID is generated
- ✅ Redirects to project page or dashboard
- ✅ Photos are uploaded to Google Drive
- ✅ Project appears in Google Sheets

### Test 2: Address Autocomplete

**Prerequisites:** Google Maps API key configured in `.env`

1. Go to http://localhost:3001/intake
2. Click on the **Property Address** field
3. Start typing: "123 Main St, Charlotte"

**Expected result:**
- ✅ Autocomplete suggestions appear as you type
- ✅ Can select an address from dropdown
- ✅ Selected address fills the input field
- ✅ Field is restricted to US addresses

**Without API key:**
- ✅ Field works as regular text input
- ✅ No JavaScript errors
- ✅ No loading spinner stuck
- ✅ Can type address manually

### Test 3: AI Photo Analysis

**Prerequisites:** 
- Project created with photos uploaded
- OpenAI API key configured

1. From dashboard or project page, find your test project
2. Click **"Analyze Photos"** button
3. Wait 20-30 seconds

**Expected result:**
- ✅ Analysis starts (loading indicator)
- ✅ Completes within 30 seconds
- ✅ Shows scope of work with:
  - Overall summary
  - Categorized recommendations (Kitchen, Bathrooms, etc.)
  - Priority levels (high/medium/low)
  - Cost estimates per item
  - ARV impact descriptions
  - Total estimated cost
  - Estimated ARV increase

### Test 4: Cost Estimate Generation

**Prerequisites:** Photo analysis completed

1. After analysis completes, click **"Generate Cost Estimate"**
2. Wait 10-15 seconds

**Expected result:**
- ✅ Estimate generates successfully
- ✅ Shows line items with:
  - Category and task description
  - Separated labor costs
  - Separated material costs
  - Timeline per task
  - Notes
- ✅ Shows subtotal
- ✅ Shows 10% contingency
- ✅ Shows total cost
- ✅ Shows overall timeline

### Test 5: Bid PDF Generation

**Prerequisites:** Cost estimate generated

1. Click **"Generate Bid PDF"**
2. Wait 5 seconds

**Expected result:**
- ✅ PDF downloads automatically
- ✅ Contains professional cover letter
- ✅ Shows SCE branding (navy & orange)
- ✅ Includes line-item breakdown
- ✅ Shows payment terms
- ✅ Includes terms & conditions
- ✅ PDF is formatted correctly
- ✅ All text is readable

### Test 6: Dashboard

1. Go to http://localhost:3001/dashboard
2. View all projects

**Expected result:**
- ✅ Dashboard loads
- ✅ Shows all created projects
- ✅ Can filter by status
- ✅ Can search projects
- ✅ Shows project statistics
- ✅ Quick actions work (view, edit, delete)

### Test 7: Vendor Management

1. Go to http://localhost:3001/vendors
2. Click **"+ Add Vendor"**
3. Fill in vendor details:
   ```
   Name: Test Plumbing Co
   Trade: Plumber
   Location: Charlotte, NC
   Phone: (704) 555-9999
   Email: test@plumbing.com
   Pricing Tier: Mid-Range
   Reliability Score: 8
   ```
4. Save vendor

**Expected result:**
- ✅ Vendor is added to database
- ✅ Appears in vendor list
- ✅ Can edit vendor details
- ✅ Can view vendor history

### Test 8: Vendor Recommendations

**Prerequisites:** Multiple vendors added in different trades

1. From a project with analysis, request vendor recommendations
2. Wait for recommendations

**Expected result:**
- ✅ Shows top 3 vendors per trade
- ✅ Matches vendors by:
  - Trade type (from scope)
  - Location (Charlotte area)
  - Budget tier
  - Reliability score
- ✅ Shows match score and reasoning
- ✅ Displays contact information
- ✅ Can select vendors for project

---

## Error Testing

### Test Error Handling

**Test 1: Invalid API Key**
1. Change OpenAI API key in `.env` to invalid value
2. Try to analyze photos
3. **Expected:** Clear error message, no crash

**Test 2: No Photos**
1. Create project without photos
2. Try to analyze
3. **Expected:** Error message "No photos provided"

**Test 3: Large File Upload**
1. Try to upload file > 10MB
2. **Expected:** Error message about file size

**Test 4: Missing Required Fields**
1. Leave required fields empty in intake form
2. Try to submit
3. **Expected:** Form validation prevents submission

**Test 5: Network Error**
1. Disconnect internet
2. Try to create project
3. **Expected:** Clear error message

---

## Performance Testing

### Response Times

| Operation | Expected Time | Notes |
|-----------|---------------|-------|
| Page load | < 2 seconds | All pages |
| Form submission | < 1 second | Without photos |
| Photo upload | 2-5 seconds | Per photo, depends on size |
| AI analysis | 20-30 seconds | Depends on photo count |
| Cost estimate | 10-15 seconds | After analysis |
| PDF generation | < 5 seconds | |
| Vendor search | < 1 second | |

### Load Testing (Optional)

For production deployment:
1. Use tools like Apache Bench or LoadForge
2. Test with 10-50 concurrent users
3. Monitor response times
4. Check for memory leaks

---

## Browser Testing

### Supported Browsers

Test in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Mobile Testing

Test on:
- ✅ iPhone (Safari)
- ✅ Android (Chrome)

**Check:**
- Responsive design
- Touch interactions
- File upload works
- Forms are usable
- PDF downloads work

---

## Google Sheets Integration

### Test Sheet Updates

1. Create a project
2. Check Google Sheets:
   - Go to https://sheets.google.com
   - Open "SCE Projects Database"
   - Verify new row with project data

**Expected columns:**
- Timestamp
- Project ID
- Client info
- Property details
- Status
- Photo folder link

### Test Vendor Sheet

1. Add a vendor
2. Check Google Sheets:
   - Open "SCE Vendors Database"
   - Verify new row with vendor data

---

## Google Drive Integration

### Test Photo Upload

1. Create project with photos
2. Check Google Drive:
   - Go to https://drive.google.com
   - Find "SCE Project Photos" folder
   - Find project subfolder (by ID)
   - Check "before" folder has uploaded photos

**Expected structure:**
```
SCE Project Photos/
  └── PROJECT-001/
      ├── before/
      │   ├── photo1.jpg
      │   └── photo2.jpg
      ├── during/
      └── after/
```

---

## Debugging Tips

### Check Logs

**Browser console:**
```
# Open DevTools (F12)
# Look for errors in Console tab
# Check Network tab for failed requests
```

**Server logs:**
```
# Terminal running npm run dev
# Shows API errors and stack traces
```

### Common Issues

**"Module not found"**
```bash
rm -rf node_modules .next
npm install
npm run dev
```

**"Environment variable not found"**
- Check `.env` file exists
- Verify all required keys are set
- Restart dev server after changing `.env`

**"API request failed"**
- Check API key is valid
- Verify API credits/quota
- Check network connection
- Look at server logs for details

**"Photos not loading"**
- Verify Google Drive folder ID
- Check service account permissions
- Try re-uploading photos
- Check photo file format (jpg, png)

---

## Automated Testing (Future)

To add automated tests:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

Create tests in `__tests__` directory:
- Unit tests for components
- Integration tests for API routes
- End-to-end tests with Playwright

---

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All manual tests pass
- [ ] Error handling works correctly
- [ ] Performance meets targets
- [ ] Mobile responsive verified
- [ ] Browser compatibility checked
- [ ] API keys are production keys (not test keys)
- [ ] Environment variables configured
- [ ] Google Sheets/Drive permissions set
- [ ] Domain configured correctly
- [ ] SSL/HTTPS enabled
- [ ] Backups configured

---

## Reporting Issues

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/device
5. Error messages (from console)
6. Screenshots if applicable

---

**Testing complete?** → Ready for production! 🚀

**Found issues?** → Check QUICKSTART.md troubleshooting section or contact: dariuswalton906@gmail.com
