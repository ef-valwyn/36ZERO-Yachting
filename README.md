# 36ZERO Platform

A unified monorepo powering **36ZERO Yachting** (premium yacht brokerage), **Adventure Yachts** partnership, and **36ZERO LAP™** (Life Adventure Passage circumnavigation experience).

## 🏗️ Architecture

```
36zero-platform/
├── apps/
│   ├── yachting/          # Main site (36zeroyachting.com)
│   │   ├── /              # Homepage
│   │   ├── /vessels       # Yacht brokerage listings
│   │   ├── /adventure-yachts  # Adventure Yachts partnership
│   │   └── /lap           # LAP circumnavigation
│   └── lap/               # (Legacy - routes now in yachting app)
├── packages/
│   ├── ui/                # Shared design system & components
│   ├── database/          # Drizzle ORM schemas & Neon client
│   └── config/            # Shared configurations
├── turbo.json             # Turborepo configuration
└── package.json           # Root workspace config
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 10+
- Neon Postgres account
- Clerk account
- Mapbox account (for route maps)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd 36zero-platform

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Push database schema to Neon
npm run db:push

# Seed the database with passages and vessels
npm run db:seed

# Start development
npm run dev
```

### Development Commands

```bash
# Run all apps in development
npm run dev

# Run only the yachting app
npm run dev:yachting

# Run only the LAP app  
npm run dev:lap

# Build all apps
npm run build

# Database commands
npm run db:generate    # Generate migrations
npm run db:push        # Push schema to database
npm run db:seed        # Seed with sample data
npm run db:studio      # Open Drizzle Studio
```

## 📦 Packages

### @36zero/ui

Shared design system with 36ZERO brand styling:

- **Components**: Button, GlassCard, HeroVideo, Navigation, VesselCard, StepForm, RouteMap, Footer
- **Styles**: Tailwind config with brand colors (#071923 navy, #2f97dd blue)
- **Utilities**: cn(), formatPrice(), formatDate()

```tsx
import { Button, GlassCard, VesselCard } from '@36zero/ui';
```

### App Components

Brand-specific components in `apps/yachting/components/`:

- **Logo.tsx** - Main 36ZERO Yachting logo (full & mark variants)
- **LapLogo.tsx** - 36ZERO LAP™ logo for LAP pages
- **LogoLapMark.tsx** - LAP icon mark for cards/UI
- **AdventureYachtsLogoMark.tsx** - Adventure Yachts wordmark icon

```tsx
import Logo from '@/components/Logo';
import LogoLapMark from '@/components/LogoLapMark';
import AdventureYachtsLogoMark from '@/components/AdventureYachtsLogoMark';
```

### @36zero/database

Drizzle ORM with Neon Postgres:

- **Tables**: passages, stages, users, vessels, bookings, documents, inquiries
- **Relations**: Fully typed with Drizzle relations
- **Seed data**: 4 passages, 13 stages, 4 Adventure Yachts + brokerage vessels

```tsx
import { db, schema } from '@36zero/database';

const vessels = await db.query.vessels.findMany({
  where: eq(schema.vessels.status, 'available'),
});
```

## 🎨 Design System

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-navy` | `#071923` | Primary background |
| `brand-blue` | `#2f97dd` | Accent, CTAs, highlights |
| `accent-gold` | `#c9a962` | Warnings, featured |
| `accent-teal` | `#1a9e8c` | Success states |
| `accent-coral` | `#e07a5f` | Sold/unavailable |

### Typography

- **Font**: Inter Tight (Google Fonts)
- **H1**: 800 weight, uppercase, tracking-tighter
- **Body**: 300 weight for long-form, 400 for UI

### Glassmorphism

```css
.glass-card {
  background: rgba(7, 25, 35, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

## 🗄️ Database Schema

### Core Tables

**passages** - LAP circumnavigation passages
- 4 main passages covering the global route
- Pricing, dates, offshore requirements

**stages** - Individual route legs
- 13 stages with coordinates for mapping
- Logistics notes (flight hubs, transfers)

**vessels** - Unified vessel CMS (Brokerage + Adventure Yachts)
- Full specs, pricing, status, gallery images
- `isAdventureYacht` - Flag for Adventure Yachts partnership vessels
- `isVisible` - Control visibility on public listings
- `variant`, `availabilityText`, `sortOrder` - Adventure yacht display fields

**users** - Clerk-linked profiles
- Sailing experience, certifications
- Emergency contacts, document status

**bookings** - LAP reservations
- Passage selections, guest counts
- Payment tracking, status workflow

## 🔌 Integrations

### Clerk (Authentication)
User authentication and profile management. Syncs with our users table via webhooks.

### Stripe (Payments)
Handles deposits and full payments for LAP bookings and yacht inquiries.

### HubSpot (CRM)
Leads sync automatically:
- Brokerage inquiries tagged as "Brokerage Lead"
- LAP applications tagged as "LAP Prospect"

### Mapbox (Maps)
Interactive route visualization with custom dark styling and 36ZERO brand markers.

### Resend (Email)
Transactional emails:
- Booking confirmations
- Document upload reminders
- Onboarding packs

## 🌐 Deployment

### Git Workflow

**No direct pushes to `main` or `develop`.** All changes go through Pull Requests.

| Branch | Environment | Database | URL |
|--------|-------------|----------|-----|
| `main` | Production | Neon `production` | 36zeroyachting.com |
| `develop` | Staging | Neon `development` | dev.36zeroyachting.com |
| `feature/*` | Preview | Neon PR branch (auto) | Vercel preview URL |

### Day-to-Day Workflow

#### 1. Start Work
```bash
git checkout develop
git pull origin develop
git checkout -b feature/<short-name>
```

#### 2. Push + Preview
```bash
git add .
git commit -m "feat: description"
git push -u origin feature/<short-name>
```
- Vercel auto-creates a Preview deployment URL for that branch
- Neon auto-creates a preview database branch (via GitHub Actions)

#### 3. Merge to Staging
- Open PR: `feature/*` → `develop`
- Review and merge
- Vercel auto-deploys to `dev.36zeroyachting.com`
- Verify on staging

#### 4. Promote to Production
- Open PR: `develop` → `main`
- Review and merge
- Vercel auto-deploys to `36zeroyachting.com`

### Verification Checklist (One-Time Setup)

#### Confirm DB Routing
- [ ] Production site (`36zeroyachting.com`) uses Neon `production` branch
- [ ] Staging site (`dev.36zeroyachting.com`) uses Neon `development` branch

#### Confirm Vercel Environment Variables
You should see:
- `DATABASE_URL` (Production) → Neon production pooled URL
- `DATABASE_URL_UNPOOLED` (Production) → Neon production direct URL
- `DATABASE_URL` (Preview) → Neon development pooled URL
- `DATABASE_URL_UNPOOLED` (Preview) → Neon development direct URL

**No extra `PROD_*` or `STAGE_*` variables.**

### GitHub Branch Protection

Configure in GitHub repo → Settings → Branches:

**`main` branch:**
- ✅ Require a pull request before merging
- ✅ Require status checks to pass
- ✅ Block force pushes

**`develop` branch:**
- ✅ Require a pull request before merging
- ✅ Require status checks to pass

### Vercel Setup

| Setting | Value |
|---------|-------|
| Production Branch | `main` |
| Preview Branches | All other branches |
| Root Directory | `apps/yachting` |

**Domains:**
- `36zeroyachting.com` → Production (`main`)
- `www.36zeroyachting.com` → Production (`main`)
- `dev.36zeroyachting.com` → Preview, linked to `develop` branch

### Neon Database Branches

| Neon Branch | Purpose | Used By |
|-------------|---------|---------|
| `production` | Production data | Vercel Production (`main`) |
| `development` | Staging data | Vercel Preview (`develop`) |
| `preview/pr-*` | PR testing (auto-created) | Vercel Preview (feature branches) |
| `vercel-dev` | Local development (optional) | Local `npm run dev` |

**GitHub Actions** automatically create/delete Neon branches for PRs (see `.github/workflows/neon_workflow.yml`).

### Environment Variables

Use only these standard names across all environments:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Pooled connection (host contains `-pooler`) |
| `DATABASE_URL_UNPOOLED` | Direct connection (no pooler) |

**Vercel Environment Variable Setup:**

| Environment | DATABASE_URL | DATABASE_URL_UNPOOLED |
|-------------|--------------|----------------------|
| Production | `production` branch pooled URL | `production` branch direct URL |
| Preview | `development` branch pooled URL | `development` branch direct URL |
| Development | `vercel-dev` branch pooled URL | `vercel-dev` branch direct URL |

> ⚠️ Delete any legacy variable names like `PROD_DATABASE_URL`, `STAGE_DATABASE_URL`, etc.

## 📁 Key Files

```
apps/yachting/
├── app/
│   ├── layout.tsx              # Root layout with Clerk
│   ├── page.tsx                # Homepage with hero
│   ├── vessels/page.tsx        # Brokerage listings (fetches from API)
│   ├── adventure-yachts/page.tsx  # Adventure Yachts AY60 showcase
│   ├── api/
│   │   └── vessels/
│   │       ├── route.ts        # GET /api/vessels (all visible, adventure yachts first)
│   │       └── adventure-yachts/
│   │           └── route.ts    # GET /api/vessels/adventure-yachts (adventure only)
│   └── lap/
│       ├── page.tsx            # LAP circumnavigation
│       └── layout.tsx          # LAP-specific layout
├── components/
│   ├── Header.tsx              # Site navigation
│   ├── Logo.tsx                # Main 36ZERO logo (mark & full)
│   ├── LapLogo.tsx             # LAP-specific logo
│   ├── LogoLapMark.tsx         # LAP icon mark only
│   ├── AdventureYachtsLogoMark.tsx  # Adventure Yachts icon
│   └── SiteFooter.tsx          # Footer with links

packages/ui/
├── components/
│   ├── Button.tsx              # Primary/secondary/ghost
│   ├── GlassCard.tsx           # Glassmorphism cards
│   ├── HeroVideo.tsx           # Video background hero
│   ├── Navigation.tsx          # Responsive nav with mobile menu
│   ├── VesselCard.tsx          # Vessel listing card
│   ├── StepForm.tsx            # LAP booking wizard
│   ├── RouteMap.tsx            # Mapbox integration
│   └── Footer.tsx              # Site footer
├── styles/
│   └── globals.css             # Design system CSS
└── tailwind.config.ts          # Brand tokens

packages/database/
├── schema/index.ts             # Drizzle schema
├── seed/index.ts               # Sample data
├── client.ts                   # Neon connection
└── drizzle.config.ts           # Drizzle Kit config
```

## 🔒 Environment Variables

See `.env.example` for all required variables:

- `DATABASE_URL` - Neon connection string
- `NEXT_PUBLIC_CLERK_*` - Clerk authentication
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Map rendering
- `STRIPE_*` - Payment processing
- `HUBSPOT_*` - CRM integration
- `RESEND_API_KEY` - Email delivery

## 📝 Next Steps

1. **Phase 1**: Shell & Content
   - [x] Monorepo setup
   - [x] Design system
   - [x] Database schema
   - [x] Brand logos and icons
   - [x] Popup for La Grande Motte (World Premiere with Google OAuth, sign-up & tour request forms)
   - [ ] Configure inbound request handling (connect email service/CRM for form submissions)
   - [ ] Create contact us form for the CTA
   - [ ] Test for dead links, especially in the footer
   - [x] Update home landing text
   - [x] Switch order of LAP section and Available Vessels on home page
   - [ ] Remove About from nav bar, add About 36ZERO section on home page
   - [ ] Payload CMS integration

2. **Phase 2**: Brokerage & Assets
   - [x] Vessel listings page
   - [x] Adventure Yachts partnership page
   - [x] AY60 showcase with gallery & specs
   - [x] Unified CMS for vessels (isAdventureYacht flag, isVisible control, API routes)
   - [ ] Create detail pages for each vessel, backed by CMS
   - [ ] Add partnerships page (brand submission form for partnership/platform consideration)
   - [x] Upload spec sheet to Vercel Blob storage
   - [x] Upload all visual collateral to Vercel Blob storage, refresh code for url to point all images to this storage
   - [ ] Search with Meilisearch
   - [ ] Inquiry form

3. **Phase 3**: LAP & User Features
   - [x] Route visualization
   - [x] Booking flow
   - [x] 36ZERO LAP™ branding
   - [x] Connect Mapbox and update the 36ZERO LAP route map
   - [ ] Create detailed pages/subpages for the 4 passages
   - [ ] Configure account management page
   - [ ] User document vault
   - [ ] Profile dashboard

4. **Phase 4**: Automation & Personalization
   - [ ] Stripe checkout
   - [ ] HubSpot sync
   - [ ] Email sequences
   - [ ] Webhook handlers

5. **Phase 5**: Personalization (Long-term)
   - [ ] Adjust page appearance based on user personas
   - [ ] Manual persona selector with dynamic content:
     - **Remote Worker**: Focus on technology, connectivity, ability to work from boat
     - **Family**: Highlight space, Ocean education programs, family-friendly features
     - **Explorer**: Technical specs, range capabilities, expedition features

## 📄 License

Proprietary - 36ZERO Yachting
