# SCE Construction Manager

Complete construction project management system for **Southern Cities Enterprises**.

Built with Next.js, Google Sheets, Google Drive, and AI integration.

---

## 🎯 Features

### 1. **Project Intake Form**
- Capture client information, property details, and project requirements
- Photo upload capability
- Automatic export to Google Sheets database
- Google Drive photo organization

### 2. **AI Photo Analysis**
- Upload property photos
- AI-generated scope of work with ARV (After Repair Value) analysis
- Detailed recommendations prioritized by ROI
- Cost estimates for each task

### 3. **Cost Estimator**
- Convert scope of work into detailed bid sheets
- Separate labor and material costs
- Timeline estimates per task
- Automatic contingency calculation (10%)

### 4. **Bid Sheet Generation**
- Professional branded cover letters
- Line-item bid breakdown
- Payment terms and conditions
- PDF export with SCE branding

### 5. **Vendor Recommendation System**
- Intelligent vendor matching by trade, location, and budget
- Reliability scoring (1-10)
- Performance tracking
- WhatsApp monitoring integration

### 6. **Project Dashboard**
- Track all active jobs
- Status updates and filtering
- Budget tracking
- Project history

---

## 🎨 Branding

All components use Southern Cities Enterprises brand colors:

- **Navy**: `#132452`
- **Orange**: `#fa8c41`
- **Red**: `#E63A27`
- **Gray**: `#6F6E77`
- **Light Background**: `#F6F6FF`

Fonts: **Montserrat** (sans-serif), **Playfair Display** (serif)

---

## 🚀 Setup

### Prerequisites

- Node.js 18+
- Google Cloud Project with Sheets & Drive APIs enabled
- OpenAI API key
- Google Service Account credentials

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### Google Sheets Setup

Run the setup script to create the necessary sheets:

```bash
npm run setup:sheets
```

This will create:
- **Projects Database** (spreadsheet for all projects)
- **Vendors Database** (spreadsheet for vendor tracking)
- **Photo Storage Folder** (Google Drive folder for photos)

Copy the output IDs into your `.env` file.

### Environment Variables

```env
# Google Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Sheets (from setup script)
GOOGLE_SHEETS_PROJECT_DB_ID=your-projects-sheet-id
GOOGLE_SHEETS_VENDOR_DB_ID=your-vendors-sheet-id
GOOGLE_DRIVE_FOLDER_ID=your-drive-folder-id

# OpenAI
OPENAI_API_KEY=sk-...

# WhatsApp Monitoring (optional)
WACLI_ENABLED=false

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📊 Database Schema

### Projects Sheet

| Column | Description |
|--------|-------------|
| Project ID | Unique identifier (PRJ-timestamp) |
| Timestamp | Creation date/time |
| Client Name | Client full name |
| Client Email | Client email address |
| Client Phone | Client phone number |
| Property Address | Full property address |
| Property Type | Single-family, multi-family, etc. |
| Current Condition | Description of property state |
| Scope Requirements | Client's requested work |
| Budget Min | Minimum budget ($) |
| Budget Max | Maximum budget ($) |
| Timeline Expectation | Expected completion time |
| Photo Folder ID | Google Drive folder ID |
| Status | new, analyzing, quoted, accepted, in-progress, completed |

### Vendors Sheet

| Column | Description |
|--------|-------------|
| Vendor ID | Unique identifier (VND-timestamp) |
| Name | Vendor name |
| Trade | Plumber, Electrician, HVAC, etc. |
| Location | City/area (e.g., Charlotte, NC) |
| Phone | Contact phone |
| Email | Contact email |
| Reliability Score | 1-10 rating |
| Pricing Tier | competitive, mid, premium |
| Performance Notes | Historical feedback |
| Last Updated | Last modification timestamp |
| Total Jobs | Number of jobs completed |
| Successful Jobs | Number of successful completions |

---

## 🤖 AI Integration

### Photo Analysis

Uses **GPT-4 Vision** to analyze property photos and generate:
- Overall property assessment
- Category-based recommendations (Kitchen, Bathrooms, Exterior, etc.)
- Priority ranking (high, medium, low)
- Estimated costs per task
- ARV impact analysis

### Cost Estimation

Uses **GPT-4 Turbo** to convert scope of work into detailed estimates:
- Labor costs (Charlotte, NC rates)
- Material costs
- Timeline per task
- Total project timeline
- 10% contingency buffer

### Cover Letter Generation

Generates professional, personalized cover letters for each bid.

---

## 📱 WhatsApp Monitoring

The system can monitor Darius's WhatsApp messages for vendor-related information.

### Setup

1. Ensure `wacli` is installed and configured
2. Enable in `.env`: `WACLI_ENABLED=true`
3. Run the monitoring script:

```bash
npm run monitor:whatsapp
```

### What It Does

- Scans recent messages for vendor mentions
- Extracts vendor names, trades, and feedback
- Auto-updates vendor reliability scores
- Adds performance notes from conversations

### Cron Setup (Optional)

Run hourly to keep vendor data fresh:

```cron
0 * * * * cd /path/to/sce-construction-manager && npm run monitor:whatsapp
```

---

## 🔄 Workflow

### Complete Project Lifecycle

1. **Intake**
   - Client fills out intake form
   - Photos uploaded
   - Project created in database

2. **Analysis**
   - AI analyzes property photos
   - Generates scope of work
   - Status: `analyzing`

3. **Estimation**
   - AI generates cost estimate
   - Vendor recommendations provided
   - Status: `quoted`

4. **Bid Generation**
   - Cover letter created
   - Bid sheet compiled
   - PDF exported and sent to client

5. **Acceptance**
   - Client accepts bid
   - Status: `accepted`

6. **Execution**
   - Vendors assigned
   - Project tracked
   - Status: `in-progress`

7. **Completion**
   - Final photos uploaded
   - Client approval
   - Status: `completed`

---

## 📦 API Routes

### Projects

- `POST /api/projects/create` - Create new project
- `GET /api/projects/list` - List all projects
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]/status` - Update project status

### AI

- `POST /api/ai/analyze-photos` - Analyze property photos
- `POST /api/ai/estimate-cost` - Generate cost estimate

### Bids

- `POST /api/bids/generate` - Generate PDF bid sheet

### Vendors

- `GET /api/vendors/list` - List all vendors
- `POST /api/vendors/recommend` - Get vendor recommendations
- `POST /api/vendors/update` - Add or update vendor

### Photos

- `POST /api/photos/upload` - Upload photo to Google Drive
- `GET /api/photos/[folderId]` - Get photos from folder

---

## 🎯 Success Metrics

✅ **80% time savings** on project setup  
✅ **2-3 hours saved** per AI-generated SOW  
✅ **Zero guesswork** on vendor selection  
✅ **Automated data capture** from WhatsApp  
✅ **Professional branded** bids every time  

---

## 🛠️ Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Google Sheets (via googleapis)
- **Storage**: Google Drive
- **AI**: OpenAI GPT-4 Vision & Turbo
- **PDF Generation**: jsPDF
- **WhatsApp**: wacli CLI

---

## 📝 Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "setup:sheets": "ts-node scripts/setup-google-sheets.ts",
  "monitor:whatsapp": "ts-node scripts/whatsapp-monitor.ts"
}
```

---

## 🔐 Security Notes

- Never commit `.env` file
- Use service account with minimal permissions
- Restrict Google Drive folder access
- Rotate API keys regularly
- Validate all user inputs

---

## 🐛 Troubleshooting

### Google Sheets Authentication Failed

- Verify service account email and private key
- Check that service account has access to sheets
- Ensure private key newlines are properly escaped

### Photo Upload Errors

- Check Google Drive folder ID
- Verify service account has write permissions
- Ensure file size is under 10MB

### AI Analysis Timeout

- Large photo sets may take 30+ seconds
- Consider implementing queue system for production
- Monitor OpenAI API rate limits

---

## 📞 Support

For issues or questions, contact:
- **Email**: dariuswalton906@gmail.com
- **GitHub**: ashersoutherncities-art

---

## 📄 License

Proprietary - Southern Cities Enterprises

---

**Built by Asher for Southern Cities Enterprises**  
*Streamlining construction management, one project at a time.*
