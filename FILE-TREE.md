# 📁 SCE Construction Manager - File Structure

```
sce-construction-manager/
│
├── 📄 START-HERE.md                    ← 🎯 BEGIN HERE - Navigation guide
├── 📄 QUICKSTART.md                    ← ⚡ 5-minute setup guide
├── 📄 SUMMARY.md                       ← 💼 Executive overview & ROI
├── 📄 USER-GUIDE.md                    ← 📖 Complete user manual
├── 📄 README.md                        ← 🛠️  Technical documentation
├── 📄 DEPLOYMENT.md                    ← 🚀 Production deployment guide
├── 📄 HANDOFF.md                       ← 📦 Complete system handoff
├── 📄 PROJECT-STATUS.md                ← ✅ Project completion report
├── 📄 FILE-TREE.md                     ← 📁 This file
│
├── ⚙️  Configuration Files
│   ├── package.json                    ← Dependencies & scripts
│   ├── tsconfig.json                   ← TypeScript config
│   ├── tailwind.config.js              ← Tailwind (SCE colors)
│   ├── postcss.config.js               ← PostCSS config
│   ├── next.config.js                  ← Next.js config
│   ├── .env.example                    ← Environment template
│   └── .gitignore                      ← Git ignore rules
│
├── 🎨 Styles
│   └── styles/
│       └── globals.css                 ← Global styles (Tailwind + custom)
│
├── 🧩 Components
│   └── components/
│       └── Layout.tsx                  ← Shared layout (header/footer/nav)
│
├── 📄 Pages (Frontend)
│   └── pages/
│       ├── _app.tsx                    ← App wrapper (fonts, globals)
│       ├── index.tsx                   ← 🏠 Homepage
│       ├── intake.tsx                  ← 📋 Project intake form
│       ├── dashboard.tsx               ← 📊 Project dashboard
│       └── vendors.tsx                 ← 👷 Vendor management
│
├── 🔌 API Routes (Backend)
│   └── pages/api/
│       │
│       ├── projects/
│       │   ├── create.ts               ← Create new project
│       │   └── list.ts                 ← List all projects
│       │
│       ├── ai/
│       │   ├── analyze-photos.ts       ← 🤖 AI photo analysis
│       │   └── estimate-cost.ts        ← 💰 AI cost estimation
│       │
│       ├── bids/
│       │   └── generate.ts             ← 📄 Generate PDF bids
│       │
│       └── vendors/
│           ├── list.ts                 ← List vendors
│           ├── recommend.ts            ← 🎯 Smart recommendations
│           └── update.ts               ← Add/update vendors
│
├── 📚 Libraries (Core Logic)
│   └── lib/
│       ├── googleSheets.ts             ← 📊 Google Sheets integration
│       ├── googleDrive.ts              ← 📁 Google Drive integration
│       ├── openai.ts                   ← 🤖 OpenAI AI functions
│       ├── pdfGenerator.ts             ← 📄 PDF bid generation
│       └── vendors.ts                  ← 👷 Vendor logic & algorithms
│
├── 🔧 Scripts (Utilities)
│   └── scripts/
│       ├── setup-google-sheets.ts      ← 🏗️  Initial Google setup
│       └── whatsapp-monitor.ts         ← 📱 WhatsApp monitoring
│
└── 📦 Dependencies
    ├── node_modules/                   ← 215 packages installed
    └── package-lock.json               ← Dependency lock file

```

---

## 📊 File Count Summary

| Category | Count | Purpose |
|----------|-------|---------|
| **Documentation** | 9 | Setup, usage, deployment guides |
| **Configuration** | 7 | App config, dependencies, environment |
| **Frontend Pages** | 4 | User-facing pages |
| **API Routes** | 8 | Backend endpoints |
| **Components** | 1 | Reusable UI components |
| **Libraries** | 5 | Core business logic |
| **Scripts** | 2 | Setup & automation utilities |
| **Styles** | 1 | Global CSS |
| **Total** | **37 files** | Complete system |

---

## 🎯 Key Files by User Type

### For Darius (Getting Started)
1. **START-HERE.md** - Where to begin
2. **QUICKSTART.md** - 5-minute setup
3. **SUMMARY.md** - What you're getting
4. **USER-GUIDE.md** - How to use everything

### For Developers (Technical)
1. **README.md** - API documentation
2. **lib/*.ts** - Core business logic
3. **pages/api/*.ts** - Backend endpoints
4. **tsconfig.json** - TypeScript setup

### For DevOps (Deployment)
1. **DEPLOYMENT.md** - Hosting guide
2. **.env.example** - Environment template
3. **next.config.js** - Next.js config
4. **package.json** - Dependencies

### For Team (Usage)
1. **USER-GUIDE.md** - Complete manual
2. **QUICKSTART.md** - Quick reference
3. **pages/*.tsx** - The actual app pages

---

## 🔍 What Each Folder Does

### `/pages` - Frontend Interface
All user-facing pages. Built with React + TypeScript.
- Homepage (marketing/overview)
- Intake form (create projects)
- Dashboard (view all projects)
- Vendors (manage vendor database)

### `/pages/api` - Backend Logic
All server-side processing. Handles:
- Database operations (Google Sheets)
- AI processing (OpenAI)
- PDF generation
- File uploads

### `/lib` - Core Business Logic
Reusable functions for:
- Google Sheets CRUD operations
- Google Drive file management
- AI analysis & estimation
- PDF generation
- Vendor algorithms

### `/components` - Reusable UI
Shared components used across pages:
- Layout (header, footer, nav)
- (More components can be added as needed)

### `/scripts` - Utility Scripts
One-time or automated tasks:
- Google Sheets setup
- WhatsApp monitoring
- (Future: data migration, backups, etc.)

### `/styles` - Global Styling
CSS files loaded globally:
- Tailwind base styles
- SCE brand colors
- Custom scrollbar
- Font imports

---

## 🎨 Branding Files Location

### Colors (Navy #132452, Orange #fa8c41)
- Defined in: `tailwind.config.js`
- Used in: All `.tsx` files via Tailwind classes
- Also in: `styles/globals.css` (CSS variables)

### Fonts (Montserrat, Playfair Display)
- Imported in: `pages/_app.tsx`
- Applied in: `tailwind.config.js` (font-sans, font-serif)

### Logo
- Location: `public/logos/` (add logo here)
- Used in: Layout component, PDF generator

---

## 🗄️ Database Schema Location

### Projects Database
- **Code:** `lib/googleSheets.ts` → `Project` interface
- **Spreadsheet:** Created by `scripts/setup-google-sheets.ts`
- **Columns:** 14 fields (ID, timestamp, client info, property, budget, etc.)

### Vendors Database
- **Code:** `lib/googleSheets.ts` → `Vendor` interface
- **Spreadsheet:** Created by `scripts/setup-google-sheets.ts`
- **Columns:** 12 fields (ID, name, trade, reliability, pricing, etc.)

---

## 🔌 Integration Points

### Google Sheets
- **Files:** `lib/googleSheets.ts`
- **APIs:** Projects CRUD, Vendors CRUD
- **Auth:** Service account credentials in `.env`

### Google Drive
- **Files:** `lib/googleDrive.ts`
- **APIs:** Upload, organize, retrieve photos
- **Auth:** Same service account as Sheets

### OpenAI
- **Files:** `lib/openai.ts`
- **Models:** GPT-4 Vision (photos), GPT-4 Turbo (costs)
- **Auth:** API key in `.env`

### WhatsApp
- **Files:** `scripts/whatsapp-monitor.ts`, `lib/vendors.ts`
- **Tool:** wacli (external CLI)
- **Auth:** wacli configuration (separate)

---

## 📝 Documentation Hierarchy

```
START-HERE.md
    ├─→ For quick start: QUICKSTART.md
    ├─→ For overview: SUMMARY.md
    ├─→ For usage: USER-GUIDE.md
    ├─→ For deployment: DEPLOYMENT.md
    ├─→ For technical: README.md
    └─→ For handoff: HANDOFF.md
```

---

## 🚀 Entry Points

### Development
```bash
npm run dev
# Starts at http://localhost:3000
# Entry: pages/index.tsx (homepage)
```

### Production Build
```bash
npm run build
npm start
# Optimized production server
```

### Setup Scripts
```bash
npm run setup:sheets
# Entry: scripts/setup-google-sheets.ts

npm run monitor:whatsapp
# Entry: scripts/whatsapp-monitor.ts
```

---

## 🔐 Sensitive Files (Never Commit)

- `.env` - Contains API keys (in .gitignore ✅)
- `node_modules/` - Dependencies (in .gitignore ✅)
- `.next/` - Build output (in .gitignore ✅)

Safe to commit:
- `.env.example` - Template only
- All other files

---

## 💡 Adding New Features

### New Page
1. Create `pages/your-page.tsx`
2. Add to nav in `components/Layout.tsx`

### New API Endpoint
1. Create `pages/api/your-route.ts`
2. Export default async handler function
3. Call from frontend with `fetch('/api/your-route')`

### New Component
1. Create `components/YourComponent.tsx`
2. Import and use in pages

### New Library Function
1. Add to relevant `lib/*.ts` file
2. Export the function
3. Import where needed

---

## 📦 Dependencies (Key Packages)

| Package | Version | Purpose |
|---------|---------|---------|
| next | 14.1.0 | React framework |
| react | 18.2.0 | UI library |
| typescript | 5.3.3 | Type safety |
| tailwindcss | 3.4.1 | Styling |
| googleapis | 131.0.0 | Google Sheets/Drive |
| openai | 4.28.0 | AI integration |
| jspdf | 2.5.1 | PDF generation |
| formidable | 3.5.1 | File uploads |

**Total packages:** 215 (including sub-dependencies)

---

## 🎯 Most Important Files (Start Here)

### If You're Darius:
1. `START-HERE.md` - Navigation
2. `QUICKSTART.md` - Setup in 5 min
3. `USER-GUIDE.md` - How to use

### If You're a Developer:
1. `README.md` - Technical overview
2. `lib/googleSheets.ts` - Database logic
3. `lib/openai.ts` - AI integration
4. `pages/api/` - All endpoints

### If You're Deploying:
1. `DEPLOYMENT.md` - Complete guide
2. `.env.example` - What you need
3. `package.json` - Dependencies

---

**File Structure Complete ✅**

*Last Updated: March 22, 2024*
