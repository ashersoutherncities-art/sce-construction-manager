# Google Maps API Setup Guide

This guide will help you set up Google Maps API for address autocomplete in the SCE Construction Manager.

---

## Why Use Address Autocomplete?

- **Faster data entry** - Users can type partial addresses and select from suggestions
- **Fewer errors** - Reduces typos and invalid addresses
- **Better UX** - Professional, modern input experience
- **Optional** - The app works fine without it (graceful fallback to regular text input)

---

## Setup Steps

### 1. Create or Select a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click on the project dropdown at the top
4. Either:
   - Select an existing project (like "asher-new-project" if you already have one)
   - Or click "New Project" to create a fresh one

### 2. Enable Required APIs

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for and enable:
   - **Places API** (required for address suggestions)
   - **Maps JavaScript API** (required for displaying the map picker)

### 3. Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API Key**
3. A new API key will be generated
4. **Important:** Click **Restrict Key** to secure it

### 4. Restrict the API Key (Recommended)

**Application Restrictions:**
- Select **HTTP referrers (web sites)**
- Add these referrer restrictions:
  ```
  http://localhost:3000/*
  http://localhost:3001/*
  https://your-production-domain.com/*
  ```

**API Restrictions:**
- Select **Restrict key**
- Choose only these APIs:
  - Places API
  - Maps JavaScript API

**Why restrict?**
- Prevents unauthorized use of your API key
- Reduces risk of quota exhaustion
- Limits potential costs if key is exposed

### 5. Add Key to Your .env File

1. Copy the API key from Google Cloud Console
2. Open `/Users/ashborn/.openclaw/workspace/sce-construction-manager/.env`
3. Add or update this line:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...your-key-here
   ```
4. Save the file
5. Restart your dev server (`npm run dev`)

---

## Testing

### 1. Start the App

```bash
npm run dev
```

### 2. Go to Project Intake Form

Visit: http://localhost:3000/intake

### 3. Test Address Field

1. Click on the **Property Address** field
2. Start typing an address (e.g., "123 Main St, Charlotte")
3. You should see autocomplete suggestions appear
4. Click on a suggestion to fill in the full address

**If it doesn't work:**
- Check browser console for errors
- Verify API key is set correctly in `.env`
- Ensure APIs are enabled in Google Cloud
- Try a different address
- Check restrictions on your API key

---

## Pricing

### Free Tier (Monthly)
- **Autocomplete**: First $200 credit = ~100,000 requests
- **Maps JavaScript API**: Free with Place Autocomplete

### Cost per Request (after free tier)
- **Autocomplete per session**: $0.017
- **Typical monthly usage for 8 projects**: ~$5-10

**Note:** You can set billing alerts in Google Cloud to monitor usage.

---

## Troubleshooting

### "Google Maps API key not configured" message

**Solution:** Add the key to `.env` and restart the server.

### Address field shows loading spinner forever

**Possible causes:**
1. Invalid API key
2. APIs not enabled
3. Referrer restrictions too strict
4. Network issues

**Check:**
```bash
# Browser console should show errors
# Look for messages like:
# - "Google Maps JavaScript API error: InvalidKeyMapError"
# - "This API key is not authorized to use this service or API"
```

### Autocomplete shows wrong region

**Solution:** The component is set to US addresses by default. To change:

Edit `components/AddressAutocomplete.tsx`:
```typescript
componentRestrictions: { country: 'us' }, // Change 'us' to your country code
```

### Want to use without API key?

**Good news:** The app already has graceful fallback!

If no API key is configured:
- The address field works as a regular text input
- No JavaScript errors
- Users can still type addresses manually
- No degradation in core functionality

---

## Alternative: Skip Google Maps Setup

If you don't want to set up Google Maps API:

1. Leave `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` empty in `.env`
2. The address field will work as a regular text input
3. Everything else in the app works perfectly

**When to skip:**
- Low volume usage (< 5 projects/week)
- Tight budget constraints
- Prefer simpler setup
- Users are comfortable typing full addresses

**When to use:**
- High volume intake (> 10 projects/week)
- Want professional UX
- Budget allows (~$5-10/month)
- Team prefers modern tools

---

## Security Best Practices

1. **Never commit API keys to Git**
   - Already handled: `.env` is in `.gitignore`

2. **Use environment-specific keys**
   - Development key for local testing
   - Production key for deployed app

3. **Enable billing alerts**
   - Go to Google Cloud Console → Billing
   - Set budget alerts (e.g., $20/month)

4. **Monitor usage regularly**
   - Check Google Cloud Console → APIs & Services → Dashboard
   - Review quotas and requests

5. **Rotate keys if exposed**
   - Delete old key
   - Create new key
   - Update `.env` immediately

---

## Summary

✅ **Optional but recommended** - Improves UX significantly  
✅ **Free for typical usage** - ~100,000 requests/month included  
✅ **Graceful fallback** - Works without it  
✅ **5-minute setup** - Quick and easy  
✅ **Secure** - Restrict keys properly  

**Ready to set up?** Follow steps 1-5 above, restart the server, and test!

---

**Questions?** Check the main troubleshooting guide or contact: dariuswalton906@gmail.com
