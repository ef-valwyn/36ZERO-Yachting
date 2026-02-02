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

We use a staging-first deployment workflow:

| Branch | Environment | Database | URL |
|--------|-------------|----------|-----|
| `develop` | Staging | Neon preview branch | Vercel preview URL |
| `main` | Production | Neon main branch | 36zeroyachting.com |

**Workflow:**
1. Create feature branches from `develop`
2. Open PR to `develop` → triggers Neon preview branch creation
3. Test on staging environment (Vercel preview deployment)
4. Merge to `develop` when ready
5. When staging is verified, open PR from `develop` → `main`
6. Merge to `main` → deploys to production

**Commands:**
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# After work is done, push and create PR to develop
git push -u origin feature/my-feature

# When staging is ready for production
git checkout main
git pull origin main
git merge develop
git push origin main
```

### Vercel Setup

1. Import the monorepo to Vercel
2. Configure build settings:
   - **Yachting**: `apps/yachting`
   - **LAP**: `apps/lap` (or use rewrites)
3. Add environment variables
4. Configure domains:
   - `36zeroyachting.com` → Yachting app (Production: `main` branch)
   - Preview deployments auto-generated for PRs

### Domain Configuration

```js
// next.config.ts - Path-based routing
// LAP routes are handled via /lap path within the main app
// Domain: 36zeroyachting.com/lap
async rewrites() {
  return [
    // All routes are handled within the same app
    // /lap/* routes are available at 36zeroyachting.com/lap
  ];
}
```

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
