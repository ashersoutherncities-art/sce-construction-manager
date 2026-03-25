# SCE Construction Manager - User Guide

## 📚 Table of Contents

1. [Getting Started](#getting-started)
2. [Creating a New Project](#creating-a-new-project)
3. [AI Photo Analysis](#ai-photo-analysis)
4. [Generating Bids](#generating-bids)
5. [Managing Vendors](#managing-vendors)
6. [Project Dashboard](#project-dashboard)
7. [Tips & Best Practices](#tips--best-practices)

---

## 🚀 Getting Started

### Accessing the System

Visit: `https://your-deployment-url.vercel.app`

**Main Navigation:**
- **Home** - Overview and quick access
- **New Project** - Create project intake
- **Dashboard** - View all projects
- **Photo Analysis** - Analyze property photos
- **Vendors** - Manage vendor database

---

## 📋 Creating a New Project

### Step 1: Navigate to Intake Form

Click **"New Project Intake"** from the homepage or **"New Project"** in the navigation.

### Step 2: Fill Out Client Information

**Required Fields:**
- Client Name
- Client Email
- Client Phone Number

**Tips:**
- Use full legal names for clients
- Double-check email addresses (this is where bids are sent)
- Format phone as: (704) 555-1234

### Step 3: Enter Property Details

**Required Fields:**
- Property Address (full street address including city, state, zip)
- Property Type (dropdown: Single Family, Multi-Family, Condo, Townhouse, Commercial)
- Current Condition (detailed description)

**Best Practice:**
```
Current Condition Example:
"1980s construction, original fixtures throughout. Kitchen needs full gut renovation. 
Bathrooms dated with pink tile. Flooring is mix of carpet and vinyl. Exterior paint peeling. 
Roof appears 15+ years old."
```

### Step 4: Define Project Scope

**Required Field:**
- Scope Requirements (what work needs to be done)

**Optional but Recommended:**
- Budget Min & Max (helps with vendor selection)
- Timeline Expectation (e.g., "4-6 weeks", "ASAP", "Flexible")

**Best Practice:**
```
Scope Requirements Example:
"Full kitchen remodel (cabinets, countertops, appliances), both bathrooms updated, 
new flooring throughout (LVP preferred), interior paint, exterior paint and siding repair, 
basic landscaping cleanup."
```

### Step 5: Upload Photos

**Recommended:**
- Minimum 5-10 photos
- Cover all major areas mentioned in scope
- Include before photos of problem areas

**Photo Tips:**
- ✅ Good lighting (natural light preferred)
- ✅ Wide angle shots showing full rooms
- ✅ Close-ups of specific issues (water damage, cracks, etc.)
- ✅ Exterior shots from multiple angles
- ❌ Avoid blurry photos
- ❌ Don't include photos with people visible

### Step 6: Submit

Click **"Submit Project"** 

The system will:
1. Create project entry in database
2. Generate unique Project ID (e.g., `PRJ-1711234567890`)
3. Create Google Drive folder
4. Upload photos to "before" subfolder
5. Set status to "new"

You'll be redirected to the project page.

---

## 🤖 AI Photo Analysis

### When to Use

- After uploading property photos
- Need quick scope of work assessment
- Want ARV impact analysis
- Exploring renovation options

### How to Use

#### Method 1: From Project Page

1. Go to Dashboard
2. Click on a project
3. Click **"Analyze Photos"** button
4. Wait 20-30 seconds for AI analysis
5. Review generated scope of work

#### Method 2: Direct Analysis

1. Go to **Photo Analysis** page
2. Enter Google Drive Folder ID (from project)
3. Click **"Analyze"**

### Understanding Results

**Analysis Includes:**

1. **Summary** - Overall property assessment
2. **Recommendations by Category:**
   - Kitchen
   - Bathrooms
   - Flooring
   - Interior
   - Exterior
   - Systems (HVAC, Plumbing, Electrical)
   - Other

3. **Each Recommendation Includes:**
   - Task description
   - Priority (High, Medium, Low)
   - Estimated cost
   - ARV impact analysis
   - Notes/reasoning

4. **Totals:**
   - Total estimated cost
   - Estimated ARV increase

**Example Output:**

```
Category: Kitchen
Task: Full kitchen remodel with new cabinets, quartz countertops, and stainless appliances
Priority: High
Estimated Cost: $25,000
ARV Impact: +$35,000-40,000 (Kitchen is primary value driver)
Notes: Current kitchen is 1980s dated. Modern kitchen essential for Charlotte market.
```

### What to Do Next

1. **Review Recommendations** - Adjust based on actual budget/goals
2. **Generate Cost Estimate** - Click "Generate Estimate" button
3. **Modify if Needed** - Edit scope before generating bid
4. **Save for Later** - Scope is saved to project

---

## 💰 Generating Bids

### Step 1: Have Scope of Work Ready

Either:
- Generated from AI photo analysis, OR
- Manually created from project requirements

### Step 2: Generate Cost Estimate

Click **"Generate Cost Estimate"** on project page.

AI will create detailed breakdown:
- Labor costs per task
- Material costs per task
- Timeline estimates
- Total with 10% contingency

**Example:**

| Category/Task | Labor | Materials | Total | Timeline |
|---------------|-------|-----------|-------|----------|
| Kitchen Demo & Install Cabinets | $3,500 | $12,000 | $15,500 | 5-7 days |
| Quartz Countertops | $1,200 | $3,800 | $5,000 | 2-3 days |
| Appliance Installation | $800 | $4,200 | $5,000 | 1 day |

### Step 3: Review and Adjust

- Check costs against your actual pricing
- Adjust labor rates if needed
- Modify material costs based on supplier relationships
- Update timelines

### Step 4: Generate PDF Bid

Click **"Generate Bid PDF"**

The system creates:
1. **Cover Letter** - Personalized to client and property
2. **Detailed Breakdown** - Professional line-item format
3. **Payment Terms** - Standard SCE terms (customizable)
4. **Terms & Conditions** - Legal protections
5. **Branding** - SCE colors and logo throughout

### Step 5: Download and Send

- PDF downloads automatically
- Filename: `SCE-Bid-PRJ-XXXXX.pdf`
- Email to client or upload to client portal

**Pro Tip:** Review the cover letter before sending. AI generates professional content but you may want to personalize further.

---

## 👷 Managing Vendors

### Viewing Vendors

**Navigate to:** Vendors page

**Filter by Trade:**
- Use search box to filter (e.g., "plumber", "electrician")
- Results update in real-time

**Vendor Card Shows:**
- Name and Trade
- Reliability Score (1-10, color-coded)
- Location
- Success Rate (%)
- Pricing Tier
- Total Jobs Completed
- Contact Info
- Performance Notes

**Reliability Score Colors:**
- 🟢 Green (8-10): Highly reliable
- 🟡 Yellow (5-7): Moderately reliable
- 🔴 Red (1-4): Use with caution

### Adding a New Vendor

1. Click **"+ Add Vendor"**
2. Fill out form:
   - Name (required)
   - Trade (required)
   - Location (defaults to Charlotte, NC)
   - Phone
   - Email
   - Pricing Tier (competitive, mid, premium)
   - Performance Notes
3. Click **"Add Vendor"**

Vendor is added to database immediately.

### Getting Vendor Recommendations

**On Project Page:**

1. Go to project details
2. Scroll to "Vendor Recommendations"
3. Select trade (e.g., "Plumber")
4. Select budget tier
5. Click "Get Recommendations"

**System Returns:**
- Top 3 vendors for that trade
- Match score (0-100)
- Reasons for recommendation (e.g., "High reliability score", "Local to Charlotte area")

**Recommendation Algorithm Considers:**
- Reliability score (0-50 points)
- Success rate (0-30 points)
- Pricing tier match (0-20 points)
- Location proximity
- Recent activity

### Updating Vendor Info

**Manual Update:**
1. Go to Vendors page
2. Find vendor
3. Click "Edit" (if implemented)
4. Update fields
5. Save

**Automatic Updates (via WhatsApp):**

If WhatsApp monitoring is enabled:
- System scans your messages for vendor mentions
- Extracts feedback (positive/negative)
- Auto-adjusts reliability scores
- Adds performance notes

**Example:**
```
Your message: "John's Plumbing did an excellent job on the Smith project. On time and quality work."

System detects:
- Vendor: John's Plumbing
- Trade: Plumbing
- Sentiment: Positive
- Action: +0.5 reliability score, adds note "Excellent work on Smith project"
```

---

## 📊 Project Dashboard

### Overview Stats

Top of dashboard shows:
- **Total Projects** - All projects in system
- **In Progress** - Active construction jobs
- **Quoted** - Bids sent, awaiting client decision
- **Completed** - Finished projects

### Filtering Projects

Click status buttons to filter:
- **All** - Shows everything
- **New** - Just submitted, not yet quoted
- **Analyzing** - AI analysis in progress
- **Quoted** - Bid sent to client
- **Accepted** - Client approved, ready to start
- **In Progress** - Construction underway
- **Completed** - Job finished

### Project Table

**Columns:**
- Project ID (clickable to view details)
- Client Name
- Property Address
- Status (color-coded badge)
- Budget (max budget from intake)
- Date Created
- Actions (View button)

**Sorting:** Click column headers to sort

**Quick Actions:**
- Click project ID or "View →" to see full details
- Status badges are color-coded for quick scanning

### Project Detail Page

Click any project to see:
- Full client information
- Property details
- Current status
- Scope of work (if generated)
- Cost estimate (if generated)
- Photo gallery (organized by before/during/after)
- Vendor assignments
- Timeline
- Notes/history

---

## 💡 Tips & Best Practices

### For Best AI Results

**Photo Quality:**
- ✅ 5-10 photos minimum
- ✅ Well-lit, clear shots
- ✅ Cover all areas mentioned in scope
- ❌ Avoid dark/blurry photos

**Scope Description:**
- ✅ Be specific and detailed
- ✅ Mention exact finishes/materials if known
- ✅ Include any client preferences
- ❌ Don't be vague ("fix everything")

**Example Good Scope:**
```
Kitchen: Full remodel with white shaker cabinets, quartz countertops (prefer white/gray), 
stainless steel appliances (mid-range), subway tile backsplash, under-cabinet lighting, 
new sink and faucet.

Bathrooms: Both full baths - new vanities (36" for main, 24" for hall), granite tops, 
tile surrounds for tub/shower, new toilets and faucets, modern light fixtures.

Flooring: LVP throughout main living areas (prefer gray/brown), carpet in bedrooms 
(neutral beige).
```

### Managing Multiple Jobs

**Use Status Updates:**
- Update project status as it progresses
- Keeps dashboard organized
- Easy to see what needs attention

**Typical Status Flow:**
```
New → Analyzing → Quoted → Accepted → In Progress → Completed
```

**Priority System:**
- Filter by "Quoted" to follow up with clients
- Check "Accepted" for projects ready to start
- Monitor "In Progress" for active jobs

### Vendor Management

**Keep Notes Updated:**
- After each job, add performance notes
- Update reliability scores based on actual performance
- Track pricing (competitive vs premium)

**Build Your Database:**
- Add vendors as you discover them
- Include vendors from WhatsApp conversations
- Rate honestly (helps with future recommendations)

**Reliability Score Guide:**
```
9-10: Outstanding - First choice for all jobs
7-8:  Good - Reliable, use regularly
5-6:  Average - Use when others unavailable
3-4:  Below Average - Use with caution
1-2:  Poor - Avoid unless desperate
```

### Budget & Timeline Management

**Setting Realistic Budgets:**
- Research Charlotte market rates
- Build in 10-15% contingency
- Consider material supply chain delays

**Timeline Expectations:**
```
Small job (bathroom): 1-2 weeks
Medium job (kitchen): 3-4 weeks
Large job (full rehab): 6-10 weeks
Add 20% buffer for scheduling conflicts
```

### Client Communication

**Best Practices:**
- Send bid within 24-48 hours of site visit
- Follow up after 3-5 days if no response
- Keep clients updated on status changes
- Use professional branded bids (builds trust)

**Email Template for Bid Submission:**
```
Subject: Proposal for [Property Address]

Hi [Client Name],

Thank you for the opportunity to bid on your project at [Property Address]. 
Please find attached our detailed proposal.

We've analyzed the property and developed a comprehensive scope of work focused 
on maximizing value while staying within your budget parameters.

The attached bid includes:
- Detailed line-item breakdown
- Timeline estimates
- Payment terms
- Our standard terms and conditions

Please review and let me know if you have any questions. I'm happy to discuss 
any aspect of the proposal.

Looking forward to working with you!

Best regards,
Darius Walton
Southern Cities Enterprises
```

---

## 🆘 Troubleshooting

### Photos Not Uploading

**Check:**
- File size under 10MB per photo
- File format: JPG, PNG, HEIC
- Internet connection stable

**Solution:** Try uploading in smaller batches (5 at a time)

### AI Analysis Stuck

**Wait:** Analysis can take 30-60 seconds for large photo sets

**If over 2 minutes:**
- Refresh page
- Try again with fewer photos
- Contact support if persistent

### Bid PDF Not Generating

**Check:**
- Cost estimate was generated first
- All required project fields filled out
- Browser allows pop-ups from this site

**Solution:** Try different browser or contact support

### Vendor Recommendations Empty

**Likely Cause:** No vendors in database for that trade

**Solution:** 
1. Add vendors manually
2. Run WhatsApp monitor to import from messages
3. Check trade spelling (case-sensitive)

---

## 📞 Support

**Email:** dariuswalton906@gmail.com  
**System Issues:** Check DEPLOYMENT.md for troubleshooting  
**Feature Requests:** Submit via GitHub Issues

---

**Happy Building! 🏗️**

*Southern Cities Enterprises - Construction Management Made Easy*
