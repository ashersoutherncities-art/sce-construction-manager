# Quick Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com with GitHub)
- This project pushed to a GitHub repository

---

## Step-by-Step Deployment

### 1. Push to GitHub (if not already done)

```bash
cd /Users/ashborn/.openclaw/workspace/sce-construction-manager

# Initialize git (if needed)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - SCE Construction Manager"

# Create repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/sce-construction-manager.git
git branch -M main
git push -u origin main
```

---

### 2. Deploy to Vercel

#### Option A: Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js — no config needed
5. Click "Deploy"

#### Option B: Vercel CLI (Fastest)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project directory)
cd /Users/ashborn/.openclaw/workspace/sce-construction-manager
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: sce-construction-manager
# - Directory: ./ (press Enter)
# - Settings confirmed? Yes

# Production deployment
vercel --prod
```

---

### 3. Add Environment Variables

**In Vercel Dashboard:**

1. Go to your project → Settings → Environment Variables
2. Add the following variables:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL = [your-service-account@project.iam.gserviceaccount.com]
GOOGLE_PRIVATE_KEY = [-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n]
GOOGLE_SHEETS_PROJECT_DB_ID = [your-project-sheet-id]
GOOGLE_SHEETS_VENDOR_DB_ID = [your-vendor-sheet-id]
GOOGLE_DRIVE_FOLDER_ID = [your-drive-folder-id]
OPENAI_API_KEY = [sk-...]
NEXT_PUBLIC_APP_URL = [https://sce-construction-manager.vercel.app]
WACLI_ENABLED = false
```

**Important Notes:**
- For `GOOGLE_PRIVATE_KEY`: Copy the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Make sure to preserve `\n` characters (they represent line breaks)
- Set these for "Production" environment
- Can optionally set for "Preview" and "Development" too

**Via Vercel CLI:**

```bash
# Add each variable
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL production
# (paste value when prompted)

vercel env add GOOGLE_PRIVATE_KEY production
# (paste entire private key including BEGIN/END markers)

vercel env add GOOGLE_SHEETS_PROJECT_DB_ID production
vercel env add GOOGLE_SHEETS_VENDOR_DB_ID production
vercel env add GOOGLE_DRIVE_FOLDER_ID production
vercel env add OPENAI_API_KEY production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add WACLI_ENABLED production
```

---

### 4. Redeploy with Environment Variables

After adding environment variables, redeploy:

**Dashboard:**
- Go to Deployments tab
- Click "..." next to latest deployment
- Click "Redeploy"

**CLI:**
```bash
vercel --prod
```

---

### 5. Get Your Production URL

After successful deployment:

**Your app is live at:**
```
https://sce-construction-manager.vercel.app
```

Or custom URL if you configured one:
```
https://projects.southerncitiesinvestors.com
```

---

### 6. Update Landing Page URLs

Update `sce1-full-featured/construction-manager.html`:

**Find and replace:**
```html
<!-- OLD -->
http://localhost:3000

<!-- NEW -->
https://sce-construction-manager.vercel.app
```

**Update status banner:**
```html
<!-- OLD -->
<div class="status-banner">
    <p>🚧 <strong>Development Environment</strong> — This tool is currently running locally. Production deployment coming soon.</p>
</div>

<!-- NEW -->
<div class="status-banner">
    <p>🚀 <strong>Live & Ready</strong> — Streamline your construction projects with our AI-powered management tool.</p>
</div>
```

---

## Custom Domain Setup (Optional)

### Add Custom Domain

**In Vercel Dashboard:**
1. Project Settings → Domains
2. Add domain: `projects.southerncitiesinvestors.com`
3. Vercel provides DNS instructions

**Update DNS at your registrar:**
```
Type: CNAME
Name: projects
Value: cname.vercel-dns.com
```

**Vercel automatically:**
- Provisions SSL certificate
- Redirects HTTP → HTTPS
- Handles all HTTPS configuration

**DNS propagation time:** 5-30 minutes

---

## Verify Deployment

### Test Checklist

Visit your production URL and test:

- [ ] Home page loads
- [ ] Project intake form works
- [ ] Photo upload functional
- [ ] AI analysis generates scope
- [ ] Cost estimation works
- [ ] Google Sheets data saves
- [ ] Google Drive photos upload
- [ ] No console errors
- [ ] Mobile responsive works

### Check Logs

**Vercel Dashboard:**
- Deployments → [Your deployment] → Runtime Logs
- View real-time errors and console logs

**CLI:**
```bash
vercel logs [deployment-url]
```

---

## Troubleshooting

### Build Fails

**Error:** "Cannot find module..."
```bash
# Make sure all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Environment Variables Not Working

**Check:**
1. Variables set for "Production" environment
2. No typos in variable names
3. No extra spaces before/after values
4. Private key includes BEGIN/END markers
5. Redeploy after adding variables

### Google Sheets 401 Unauthorized

**Fix:**
1. Verify service account email is correct
2. Check private key format (must include \n)
3. Ensure service account has access to sheets
4. Share sheets with service account email

### OpenAI API Errors

**Fix:**
1. Verify API key is valid (starts with sk-)
2. Check OpenAI account has credits
3. Review usage limits in OpenAI dashboard

---

## Cost Monitoring

### Vercel Usage

**Free Tier Includes:**
- 100GB bandwidth/month
- 100 build hours/month
- Unlimited deployments
- Automatic SSL

**Monitor usage:**
- Vercel Dashboard → Settings → Usage

### OpenAI Costs

**Monitor usage:**
- platform.openai.com → Usage
- Set usage limits to prevent surprises

**Estimated costs:**
- Photo analysis: ~$0.50-1.00 per property
- Cost estimation: ~$0.10-0.20 per estimate

---

## Automatic Deployments

### Setup (if using GitHub)

**Vercel automatically deploys when you push to GitHub:**

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push

# Vercel automatically:
# 1. Detects push
# 2. Builds project
# 3. Deploys to production
# 4. Notifies you via email
```

**Production domains:**
- `main` branch → Production
- Other branches → Preview deployments

---

## Rollback (if needed)

### Via Dashboard
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → Promote to Production

### Via CLI
```bash
vercel rollback [deployment-url]
```

---

## Support

**Vercel Documentation:** vercel.com/docs  
**Vercel Support:** vercel.com/support  
**Discord:** vercel.com/discord  

---

## Summary

**Deployment Time:** ~15-30 minutes (including environment variables)

**What You Get:**
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments from Git
- ✅ Zero configuration
- ✅ Free SSL certificate
- ✅ 99.99% uptime SLA
- ✅ Real-time logs and monitoring

**Next Steps:**
1. Push code to GitHub
2. Deploy to Vercel
3. Add environment variables
4. Update landing page URLs
5. Test production deployment
6. (Optional) Add custom domain
7. Share with Darius! 🎉

---

**You're ready to deploy!** 🚀
