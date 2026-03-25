# ⚡ Quick Start Guide

Get the SCE Construction Manager running in **5 minutes**.

---

## 🚀 Setup Steps

### 1. Install Dependencies (30 seconds)

```bash
cd /Users/ashborn/.openclaw/workspace/sce-construction-manager
npm install
```

### 2. Configure Environment (2 minutes)

```bash
cp .env.example .env
nano .env
```

**Minimum Required (to start):**

```env
# OpenAI (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-key-here

# Google Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=asherbot@asher-new-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...your key here...
-----END PRIVATE KEY-----
"

# Google Maps API (OPTIONAL - for address autocomplete)
# Get from: https://console.cloud.google.com/apis/credentials
# Enable: Places API and Maps JavaScript API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** 
- You'll need Google Sheets IDs after running setup (Step 4)
- Google Maps API key is optional but recommended for address autocomplete

### 3. Start Development Server (10 seconds)

```bash
npm run dev
```

Visit: **http://localhost:3000**

You should see the SCE homepage! 🎉

### 4. Initialize Google Sheets (1 minute)

**In a new terminal:**

```bash
cd /Users/ashborn/.openclaw/workspace/sce-construction-manager
npm run setup:sheets
```

This creates:
- Projects Database spreadsheet
- Vendors Database spreadsheet  
- Photo Storage folder in Google Drive

**Copy the output IDs** and add to `.env`:

```env
GOOGLE_SHEETS_PROJECT_DB_ID=1abc...
GOOGLE_SHEETS_VENDOR_DB_ID=1def...
GOOGLE_DRIVE_FOLDER_ID=1ghi...
```

**Restart the dev server** (Ctrl+C, then `npm run dev` again)

### 5. Create Your First Project (1 minute)

1. Go to http://localhost:3000
2. Click **"New Project Intake"**
3. Fill out the form (use test data):
   - Client: John Doe
   - Email: test@example.com
   - Phone: (704) 555-1234
   - Address: 123 Test St, Charlotte, NC 28205
   - Property Type: Single Family
   - Condition: "Needs kitchen and bathroom updates"
   - Scope: "Remodel kitchen, update 2 bathrooms, new flooring"
   - Budget: $30,000 - $50,000
4. Upload 2-3 sample photos (any images work for testing)
5. Click **Submit**

✅ **Success!** You should see your project ID and be redirected to the project page.

---

## 🧪 Test the AI Features

### Test Photo Analysis

1. From your project page, click **"Analyze Photos"**
2. Wait 20-30 seconds
3. See AI-generated scope of work with cost estimates

### Test Bid Generation

1. After analysis completes, click **"Generate Cost Estimate"**
2. Review the detailed breakdown
3. Click **"Generate Bid PDF"**
4. Download your professional branded bid sheet

---

## 📊 Check Your Data

### View in Google Sheets

1. Go to Google Sheets (sheets.google.com)
2. Find **"SCE Projects Database"**
3. See your project in the table
4. Find **"SCE Vendors Database"** (empty initially)

### View in Google Drive

1. Go to Google Drive (drive.google.com)
2. Find **"SCE Project Photos"** folder
3. See your project ID subfolder
4. Check the "before" subfolder for uploaded photos

---

## 👷 Add Test Vendors

1. Go to **Vendors** page
2. Click **"+ Add Vendor"**
3. Add a test vendor:
   - Name: "John's Plumbing"
   - Trade: "Plumber"
   - Location: "Charlotte, NC"
   - Phone: (704) 555-9999
   - Pricing: Mid-Range
   - Reliability Score: 8 (default)
4. Add 2-3 more in different trades (Electrician, Carpenter, etc.)

---

## 🎯 Next Steps

### Learn the System

1. Read **USER-GUIDE.md** for detailed usage instructions
2. Watch the workflow: Intake → Analysis → Estimate → Bid
3. Explore the Dashboard (view all projects, filter by status)

### Go Live

1. Read **DEPLOYMENT.md** for production deployment
2. Deploy to Vercel (recommended) or self-host
3. Add your real vendor database
4. Start using for actual projects!

### Optional: WhatsApp Monitoring

1. Install and configure `wacli` skill
2. Enable in `.env`: `WACLI_ENABLED=true`
3. Run: `npm run monitor:whatsapp`
4. Auto-update vendor data from your messages

---

## 🆘 Troubleshooting

### "Module not found" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Google Sheets authentication failed

- Check that private key is properly escaped in `.env`
- Verify service account email is correct
- Ensure sheets setup was run successfully

### Photos not uploading

- Check file size (must be under 10MB)
- Verify Google Drive folder ID in `.env`
- Ensure service account has write permissions

### AI analysis failing

**Test the OpenAI connection first:**
```bash
npm run test:openai
npm run test:photos
```

Common issues:
- Verify OpenAI API key is correct (starts with `sk-proj-`)
- Check API key has credits at https://platform.openai.com/usage
- Ensure you have access to GPT-4o model
- Try with fewer photos (5-10 max recommended)
- Check photo URLs are publicly accessible

**Error: "Invalid model"**
- Make sure you have GPT-4o access (may require paid account)
- Alternative: Change model in `lib/openai.ts` to `gpt-4-turbo` or `gpt-4`

### Address autocomplete not working

**If address field doesn't show suggestions:**

1. Check if Google Maps API key is set in `.env`:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key-here
   ```

2. Enable required APIs in Google Cloud Console:
   - Places API
   - Maps JavaScript API

3. If API key not configured, the field will work as a regular text input (graceful fallback)

4. Check browser console for any Google Maps errors

**To get a Google Maps API key:**
1. Go to https://console.cloud.google.com/
2. Create or select a project
3. Enable "Places API" and "Maps JavaScript API"
4. Go to Credentials → Create Credentials → API Key
5. Copy the key to your `.env` file
6. Restart the dev server

---

## 📚 Full Documentation

### Core Docs
- **README.md** - Technical details and API reference
- **USER-GUIDE.md** - Complete user manual
- **DEPLOYMENT.md** - Production deployment guide
- **HANDOFF.md** - System overview and handoff docs

### Setup Guides (in /docs/)
- **GOOGLE-MAPS-SETUP.md** - Complete Google Maps API setup
- **TESTING.md** - Testing procedures and debugging
- **FIXES-APPLIED.md** - Recent fixes and improvements

---

## ✅ You're Ready!

The system is now running locally. You can:

- ✅ Create projects
- ✅ Upload photos
- ✅ Analyze with AI
- ✅ Generate bids
- ✅ Manage vendors
- ✅ Track everything in dashboard

**Start creating real projects when ready!**

---

**Questions?** Check the documentation or email: dariuswalton906@gmail.com

**Happy Building! 🏗️**
