# Environment Variables Quick Setup Guide

## 🚀 Fast Track: Set These in Vercel Dashboard

**Vercel Project:** https://vercel.com/ashersoutherncities-6061s-projects/sce-construction-manager/settings/environment-variables

Copy these values from your local `.env` file and paste into Vercel dashboard:

---

### 1. OPENAI_API_KEY
**Where to find it:** Local `.env` file  
**What it's for:** AI photo analysis and cost estimation  
**Format:** `sk-proj-...`

---

### 2. GOOGLE_SERVICE_ACCOUNT_EMAIL
**Where to find it:** Local `.env` file  
**What it's for:** Google Sheets/Drive access  
**Current value:** `asherbot@asher-new-project.iam.gserviceaccount.com`

---

### 3. GOOGLE_PRIVATE_KEY
**Where to find it:** Local `.env` file  
**What it's for:** Google Sheets/Drive authentication  
**IMPORTANT:** Wrap the entire value in double quotes in Vercel  
**Format:** 
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgk...\n-----END PRIVATE KEY-----\n"
```

---

### 4. GOOGLE_SHEETS_PROJECTS_ID
**Where to find it:** Local `.env` file (may be named `GOOGLE_SHEETS_PROJECT_DB_ID` or similar)  
**What it's for:** Projects database spreadsheet  
**Format:** Long alphanumeric string from Google Sheets URL

---

### 5. GOOGLE_SHEETS_VENDORS_ID
**Where to find it:** Local `.env` file (may be named `GOOGLE_SHEETS_VENDOR_DB_ID` or similar)  
**What it's for:** Vendors database spreadsheet  
**Format:** Long alphanumeric string from Google Sheets URL

---

### 6. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
**Where to find it:** Local `.env` file  
**What it's for:** Address autocomplete in forms  
**Format:** `AIzaSy...`

---

### 7. NEXT_PUBLIC_APP_URL
**Value:** `https://sce-construction-manager.vercel.app`  
**What it's for:** App base URL for redirects and links

---

## 📋 Step-by-Step

1. Open local `.env` file:
   ```bash
   cd /Users/ashborn/.openclaw/workspace/sce-construction-manager
   cat .env
   ```

2. Copy each value

3. Go to Vercel dashboard:
   - Click **Settings** → **Environment Variables**
   - Click **Add New**
   - Paste variable name and value
   - Select **Production, Preview, Development**
   - Click **Save**

4. Repeat for all 7 variables

5. Redeploy (or wait for auto-deploy):
   ```bash
   vercel --prod
   ```

---

## ✅ Test After Setup

Visit https://sce-construction-manager.vercel.app and test:
- ✓ Create a new project (should save to Google Sheets)
- ✓ Upload photos and analyze (requires OpenAI key)
- ✓ Type an address (autocomplete should work)
- ✓ View vendors list

---

**Questions?** Check the full deployment guide: `VERCEL-DEPLOYMENT-COMPLETE.md`
