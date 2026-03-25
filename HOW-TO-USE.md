# How to Use SCE Construction Manager

## Quick Start

1. **Start the server:**
   ```bash
   cd /Users/ashborn/.openclaw/workspace/sce-construction-manager
   npm run dev
   ```

2. **Open your browser:**
   - Navigate to: `http://localhost:3000`

## Complete Workflow Example

### Scenario: New Kitchen Remodel Project

#### Step 1: Create Project
1. Click "New Project Intake" from homepage
2. Fill in the form:
   - **Client Name:** Jane Smith
   - **Email:** jane@example.com
   - **Phone:** 704-555-1234
   - **Address:** 123 Main St, Charlotte, NC
   - **Property Type:** Single Family
   - **Current Condition:** "Kitchen is outdated, cabinets are damaged, appliances from 1990s"
   - **Scope:** "Full kitchen remodel - new cabinets, countertops, appliances, flooring"
   - **Budget:** $30,000 - $50,000
   - **Timeline:** 4-6 weeks
3. Upload photos of the kitchen
4. Click "Submit Project"

#### Step 2: AI Photo Analysis
1. Go to Dashboard
2. Click on the new project
3. Click "Analyze Photos" button
4. Wait for AI analysis (15-30 seconds)
5. Review the scope of work:
   - Cabinet replacement recommendations
   - Countertop material suggestions
   - Appliance upgrade priorities
   - Flooring options
   - ARV impact estimates

#### Step 3: Generate Cost Estimate
1. Click "Generate Detailed Estimate"
2. Review line-item breakdown:
   - Labor costs per task
   - Material costs
   - Timeline for each phase
   - Total project cost with contingency

#### Step 4: Find Vendors
1. Go to Vendors page
2. Search for "Plumber" or "Electrician"
3. Review reliability scores
4. Check pricing tiers
5. Contact vendors directly

## Key Pages

### 🏠 Homepage (`/`)
- Overview of system features
- Quick access to all sections
- Stats dashboard

### 📋 Project Intake (`/intake`)
- Create new projects
- Upload property photos
- Capture all project requirements

### 🤖 AI Analysis (`/analyze`)
- Upload photos for analysis
- Get instant scope of work
- See cost and ARV estimates

### 📊 Dashboard (`/dashboard`)
- View all projects
- Filter by status
- Quick access to project details

### 👷 Vendors (`/vendors`)
- Browse vendor database
- Add new vendors
- Track performance and reliability

### 🔍 Project Detail (`/project/[id]`)
- Full project information
- AI analysis results
- Cost estimates
- Next actions

## Tips & Tricks

### Getting Better AI Analysis
- Upload 5-10 clear photos
- Include different angles
- Show problem areas clearly
- Include overall space shots

### Photo Types to Include
- Wide shots of each room
- Close-ups of damage/wear
- Existing fixtures and finishes
- Problem areas (leaks, cracks, etc.)
- Outdoor/curb appeal shots

### Using the Dashboard
- **Filter by status:**
  - New - Just created
  - Analyzing - AI working on it
  - Quoted - Estimate ready
  - In Progress - Work started
  - Completed - Project done

- **Quick actions:**
  - Click any project ID to view details
  - Use search to find projects
  - Export data (coming soon)

### Managing Vendors
- Keep reliability scores updated
- Add performance notes after each job
- Track total jobs vs successful jobs
- Filter by trade for quick recommendations

## Common Tasks

### Add a New Vendor
1. Go to `/vendors`
2. Click "+ Add Vendor"
3. Fill in:
   - Name
   - Trade (e.g., "Electrician")
   - Location
   - Contact info
   - Pricing tier
   - Initial reliability score (5/10)
4. Submit

### Analyze Existing Project Photos
1. Go to `/dashboard`
2. Find your project
3. Click to view details
4. Click "Analyze Photos"
5. Wait for results

### Generate Bid Sheet (Coming Soon)
1. Complete AI analysis
2. Generate cost estimate
3. Click "Create Bid Sheet"
4. Download PDF with cover letter

## Keyboard Shortcuts

- `Home` → Go to homepage
- `N` → New project intake
- `D` → Dashboard
- `V` → Vendors

## Troubleshooting

### Photos won't upload
- Check file size (max 10MB each)
- Use JPG or PNG format
- Try fewer photos at once

### AI analysis stuck
- Refresh the page
- Check your OpenAI API key in `.env`
- Verify you have API credits

### Project not appearing
- Refresh the dashboard
- Check browser console for errors
- Verify the project was created (should show success message)

### Mock storage resets
- This is expected - mock storage clears on server restart
- To persist data, configure Google Sheets (see REPAIR-SUMMARY.md)

## Next Steps

### For Testing
- Use the app as-is with mock storage
- Perfect for demos and development
- No external setup required

### For Production
1. Set up Google Sheets for project storage
2. Configure Google Drive for photo storage
3. Enable Google Maps API for address autocomplete
4. See REPAIR-SUMMARY.md for configuration details

## Support

If something isn't working:
1. Check the browser console (F12)
2. Check server logs in terminal
3. Review REPAIR-SUMMARY.md for known issues
4. Verify .env configuration

## API Endpoints

For custom integrations:

```bash
# List all projects
GET /api/projects/list

# Create project
POST /api/projects/create

# List vendors
GET /api/vendors/list

# Add vendor
POST /api/vendors/update

# Analyze photos
POST /api/ai/analyze-photos
{
  "photoUrls": ["data:image/jpeg;base64,..."]
}

# Generate cost estimate
POST /api/ai/estimate-cost
{
  "scopeOfWork": {...}
}
```

---

**You're all set!** Start creating projects and let the AI do the heavy lifting. 🚀
