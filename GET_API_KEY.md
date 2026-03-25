# Get Google Maps API Key - Quick Guide

## Option 1: Using Google Cloud Console (5 minutes)

### Step 1: Go to Google Cloud Console
Open: https://console.cloud.google.com/

### Step 2: Select Your Project
- Click the project dropdown at the top
- Select: **asher-new-project**
- (You should already have this project with the service account: asherbot@asher-new-project.iam.gserviceaccount.com)

### Step 3: Enable Required APIs
1. Click the hamburger menu (☰) → **APIs & Services** → **Library**
2. Search for "**Places API**" and click it
3. Click **ENABLE** button
4. Go back, search for "**Maps JavaScript API**"
5. Click **ENABLE** button

### Step 4: Create API Key
1. Click the hamburger menu (☰) → **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **API key**
4. A popup will show your new key - **COPY IT** (you'll need it in a moment)
5. Click **CLOSE**

### Step 5: Restrict the API Key (Important for Security)
1. Find your new key in the list and click the pencil icon (Edit)
2. Under **API restrictions**:
   - Select "Restrict key"
   - Check these two APIs:
     - ✅ Maps JavaScript API
     - ✅ Places API
3. Under **Application restrictions**:
   - Select "HTTP referrers (web sites)"
   - Click **ADD AN ITEM**
   - Add: `http://localhost:*/*`
   - Click **ADD AN ITEM** again
   - Add: `https://*.vercel.app/*` (if deploying to Vercel)
4. Click **SAVE** at the bottom

### Step 6: Add to Your Project
```bash
cd /Users/ashborn/.openclaw/workspace/sce-construction-manager
echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE" >> .env
```

Or manually edit `.env` and add this line:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...your-actual-key
```

### Step 7: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 8: Test It!
1. Open: http://localhost:3001/test-autocomplete
2. Type "123 Main St, Charlotte, NC"
3. You should see dropdown suggestions!

---

## Option 2: One-Click Setup (Requires gcloud CLI)

If you have gcloud installed:
```bash
cd /Users/ashborn/.openclaw/workspace/sce-construction-manager
./scripts/enable-google-maps.sh
```

---

## Pricing Info

**Google Maps Platform Pricing:**
- Places Autocomplete: $2.83 per 1,000 requests
- **FREE TIER**: $200 credit per month (~70,000 requests)

For a construction intake form, you'll likely use:
- ~10-50 requests per day = ~300-1,500/month
- **Well within free tier!** ✅

---

## Troubleshooting

### "This API project is not authorized to use this API"
**Fix**: Go back to Step 3 and enable Places API and Maps JavaScript API

### No suggestions appearing
**Fix**: 
1. Open browser console (F12 → Console tab)
2. Look for error messages
3. Check that API key is copied correctly (no extra spaces)
4. Make sure you restarted the dev server

### "RefererNotAllowedMapError"
**Fix**: Go back to Step 5 and add `http://localhost:*/*` to HTTP referrers

### Still not working?
Check the browser console for specific error messages and search for them on Google. The error messages are usually very specific about what's wrong.

---

## Already Have an API Key?

Just add it to `.env`:
```bash
echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-existing-key" >> .env
```

Then restart: `npm run dev`
