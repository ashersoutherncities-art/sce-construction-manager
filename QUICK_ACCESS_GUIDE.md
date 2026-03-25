# 🚀 Quick Access Guide — SCE Construction Manager

**One-page reference for accessing and deploying the construction manager**

---

## 📍 Current Status

### ✅ Integration Complete
- Navigation link added to main site header
- CTA button added to homepage
- Full landing page created at `/construction-manager.html`

### 🔴 Local Development Only
- Tool runs at `http://localhost:3000`
- Only accessible from your Mac mini
- Requires `npm run dev` to be running

---

## 🎯 How to Access Right Now

### Start the Tool Locally:

```bash
# 1. Navigate to project
cd /Users/ashborn/.openclaw/workspace/sce-construction-manager

# 2. Start development server
npm run dev

# 3. Open in browser
# http://localhost:3000
```

### Access from SCE1 Website:

**Option 1:** Click "Project Manager" in top navigation  
**Option 2:** Click "Manage Your Projects" button on homepage (Investor Services section)  
**Option 3:** Go directly to `/construction-manager.html`

All three routes lead to the landing page, which has a "Launch Project Manager" button pointing to localhost:3000.

---

## 🚀 Deploy to Production (Make It Live)

### Option 1: Vercel (Recommended) — 15 Minutes

**Prerequisites:**
- GitHub account
- Vercel account (sign up at vercel.com)

**Steps:**

```bash
# 1. Push to GitHub (if not already)
cd /Users/ashborn/.openclaw/workspace/sce-construction-manager
git init
git add .
git commit -m "SCE Construction Manager"
# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/sce-construction-manager.git
git push -u origin main

# 2. Install Vercel CLI
npm install -g vercel

# 3. Login to Vercel
vercel login

# 4. Deploy
vercel
# Follow prompts, accept defaults

# 5. Deploy to production
vercel --prod
```

**Add Environment Variables in Vercel Dashboard:**
- Go to project → Settings → Environment Variables
- Add all variables from your `.env` file
- Redeploy after adding variables

**Result:** Tool accessible at `https://sce-construction-manager.vercel.app`

**Full guide:** See `deploy-vercel.md` in project directory

---

## 🔄 After Deployment

### Update Landing Page URLs:

**File:** `/Users/ashborn/.openclaw/workspace/sce1-full-featured/construction-manager.html`

**Find and replace:**
```
http://localhost:3000
↓
https://sce-construction-manager.vercel.app
```

**Update status banner:**
```html
<!-- Change from: -->
🚧 Development Environment — This tool is currently running locally...

<!-- To: -->
🚀 Live & Ready — Start managing your construction projects now!
```

---

## 📂 File Locations

### Website Integration:
```
/Users/ashborn/.openclaw/workspace/sce1-full-featured/
├── header.html (modified — added nav link)
├── index.html (modified — added CTA button)
└── construction-manager.html (new — landing page)
```

### Construction Manager Tool:
```
/Users/ashborn/.openclaw/workspace/sce-construction-manager/
├── pages/ (Next.js app pages)
├── components/ (React components)
├── lib/ (API integrations)
├── .env (environment variables — DO NOT COMMIT)
├── package.json
└── [documentation files]
```

---

## 🔐 Environment Variables Needed

Copy these from your `.env` file to Vercel:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_PRIVATE_KEY
GOOGLE_SHEETS_PROJECT_DB_ID
GOOGLE_SHEETS_VENDOR_DB_ID
GOOGLE_DRIVE_FOLDER_ID
OPENAI_API_KEY
NEXT_PUBLIC_APP_URL
WACLI_ENABLED
```

---

## 🧪 Test Checklist

### Before Deployment:
- [x] Navigation link works
- [x] CTA button works
- [x] Landing page loads
- [x] Tool launches locally

### After Deployment:
- [ ] Production URL loads
- [ ] All features work
- [ ] Google Sheets saves data
- [ ] Photo uploads work
- [ ] AI analysis generates results
- [ ] Mobile responsive

---

## 💰 Costs

### Development (Current):
**Free** — Running locally, no hosting costs

### Production (After Deployment):
- Vercel: **Free** (100GB bandwidth/month)
- OpenAI: **~$10-20/month** (based on usage)
- Google Cloud: **~$0-5/month** (minimal usage)
- **Total: ~$10-25/month**

---

## 📖 Documentation Files

**Quick Reference:**
- `INTEGRATION_COMPLETE.md` — Summary of integration work
- `QUICK_ACCESS_GUIDE.md` — This file

**Deployment:**
- `deploy-vercel.md` — Step-by-step Vercel deployment
- `WEBSITE_INTEGRATION.md` — Full integration details

**User Guides:**
- `README.md` — Main documentation
- `HOW-TO-USE.md` — User guide
- `QUICKSTART.md` — Quick start

---

## 🆘 Troubleshooting

### Tool won't start locally:
```bash
cd /Users/ashborn/.openclaw/workspace/sce-construction-manager
npm install
npm run dev
```

### Landing page not loading:
- Check that `construction-manager.html` exists in `sce1-full-featured/` directory
- Make sure you're accessing the right domain

### Production deployment fails:
- Verify all environment variables are set in Vercel
- Check that `.env` variables are correct locally
- Review Vercel logs for specific errors

---

## 🎯 Quick Commands

```bash
# Start local development
cd /Users/ashborn/.openclaw/workspace/sce-construction-manager && npm run dev

# Deploy to Vercel
vercel --prod

# Check Vercel logs
vercel logs

# Update landing page (after deployment)
code /Users/ashborn/.openclaw/workspace/sce1-full-featured/construction-manager.html
```

---

## ✅ What's Done

1. ✅ Three access points added to SCE1 website
2. ✅ Full landing page with tool description
3. ✅ Mobile-responsive design
4. ✅ SCE branding maintained
5. ✅ Local testing complete
6. ✅ Documentation complete

---

## 🔄 What's Next

1. Deploy to Vercel (~15-30 minutes)
2. Add environment variables
3. Update landing page URLs
4. Test production deployment
5. (Optional) Configure custom domain
6. Share with team! 🎉

---

## 📞 Need Help?

**Read These First:**
1. `INTEGRATION_COMPLETE.md` — What was done
2. `deploy-vercel.md` — How to deploy
3. `WEBSITE_INTEGRATION.md` — Technical details

**Contact:**
- Developer: Asher (via Darius)
- Email: dariuswalton906@gmail.com

---

**🎉 You're ready to deploy!**

**Estimated time to production:** 30-60 minutes

---

**Built for Southern Cities Enterprises** 🏗️
