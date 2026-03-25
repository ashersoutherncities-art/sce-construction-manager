# Google Maps API Setup Guide

## Current Status
✅ AddressAutocomplete component implemented  
✅ TypeScript types installed  
⚠️ API key needed for full functionality

## Quick Setup (5 minutes)

### 1. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **asher-new-project** (or create new)
3. Navigate to **APIs & Services → Credentials**
4. Click **+ CREATE CREDENTIALS → API key**
5. Copy the generated key
6. Click **Edit API key** (restrict it):
   - **Application restrictions**: HTTP referrers
   - Add referrers:
     - `http://localhost:3000/*`
     - `https://yourdomain.com/*` (add your production domain)
   - **API restrictions**: Restrict key
   - Select: **Places API**
   - Click **Save**

### 2. Enable Required APIs

1. Go to **APIs & Services → Library**
2. Search and enable:
   - ✅ **Places API**
   - ✅ **Maps JavaScript API**

### 3. Add API Key to Project

```bash
# Edit .env file
echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE" >> .env
```

Or manually add to `.env`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_KEY
```

### 4. Test It

```bash
npm run dev
```

Visit http://localhost:3000/intake and type "123 Main" in the Property Address field - you should see dropdown suggestions appear!

## Features Implemented

✅ Real-time address suggestions as you type  
✅ Dropdown appears below input field  
✅ Click to auto-fill complete address  
✅ Restricted to US addresses only  
✅ Loading spinner while API loads  
✅ Graceful fallback (regular input) if no key  
✅ Auto-cleanup on component unmount

## Pricing

Google Maps Places Autocomplete pricing (as of 2024):
- **Autocomplete - Per Session**: $2.83 per 1,000 requests
- **$200 free credit per month** (covers ~70,000 requests)

For typical usage (construction intake forms), you'll likely stay within free tier.

## Troubleshooting

**Issue**: No suggestions appearing  
**Fix**: Check browser console for errors. Verify API key is correct and Places API is enabled.

**Issue**: "This API project is not authorized to use this API"  
**Fix**: Go to Google Cloud Console → APIs & Services → Library → Enable "Places API"

**Issue**: Loading forever  
**Fix**: Check that NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set in .env and restart dev server

## Alternative: No API Key Required

The component gracefully falls back to a regular text input if no API key is configured. However, you lose:
- Real-time suggestions
- Address validation
- Auto-formatted addresses

For production use, **strongly recommended** to set up the API key.
