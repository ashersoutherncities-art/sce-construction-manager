# SCE Construction Manager

Professional construction project management software built by Southern Cities Enterprises LLC.

**Live:** [sce-construction-manager.vercel.app](https://sce-construction-manager.vercel.app)

## Tech Stack

- **Framework:** Next.js 14 (Pages Router)
- **Styling:** Tailwind CSS 3.4
- **Auth:** NextAuth.js
- **Database:** SQLite (local) / Vercel Postgres (production)
- **Fonts:** Montserrat (body), Playfair Display (headings)

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── components/
│   ├── landing/          # Landing page components
│   │   ├── Button.tsx       Reusable CTA button (primary/secondary/outline/ghost)
│   │   ├── Navbar.tsx       Sticky nav with mobile hamburger menu
│   │   ├── Hero.tsx         Hero section with gradient background
│   │   ├── FeatureCard.tsx  Feature grid cards with hover effects
│   │   ├── BenefitItem.tsx  Numbered benefit items
│   │   └── Footer.tsx       Site footer with branding
│   ├── Layout.tsx
│   ├── StatusBadge.tsx
│   └── Toast.tsx
├── pages/
│   ├── index.tsx         # Landing page
│   ├── login.tsx         # Login form
│   ├── signup.tsx        # Registration
│   ├── dashboard.tsx     # Main dashboard
│   ├── project/[id].tsx  # Project detail view
│   └── api/              # API routes
├── styles/
│   └── globals.css       # Tailwind + custom styles
└── tailwind.config.js    # SCE brand colors & fonts
```

## Brand Colors

| Name   | Hex       | Usage                |
|--------|-----------|----------------------|
| Navy   | `#132452` | Primary, backgrounds |
| Orange | `#fa8c41` | Accents, CTAs        |
| Light  | `#F6F6FF` | Section backgrounds  |
| Gray   | `#6F6E77` | Body text            |

## Deployment

Deployed automatically to Vercel. Push to `main` to trigger a new build.

```bash
npx vercel --prod
```

## License

© 2026 Southern Cities Enterprises LLC. All rights reserved.
