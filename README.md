# Avrasya Properties
React / TanStack Start website and staff workspace backed by Supabase project `ufcpvjhzitmxgitoaolx`.

The database integration is applied to Supabase and the enquiry Edge Function is deployed. Website/admin code remains on the review branch. First administrator setup, exact allowed website origins and hosted acceptance checks are required before full activation. See [deployment instructions](docs/BACKEND_DEPLOYMENT.md).

<<<<<<< HEAD
An institutional-grade luxury real estate acquisition portal and internal operations CMS for **Avrasya Properties**, headquartered on Istanbul’s Asian shoreline in Üsküdar overlooking the Bosphorus strait.

Designed specifically for cross-border private clients, international family offices, and foreign investors navigating the Turkish property market and the official **Turkish Citizenship by Investment ($400,000 CBI)** programme.

---

## 🏛️ Key Platform Capabilities

### 1. Real-Time Multi-Currency Engine (Frankfurter ECB Integration)

- Dynamic currency conversions across **USD ($)**, **EUR (€)**, **TRY (₺)**, and **GBP (£)**.
- Integrated directly with the European Central Bank feed via `https://api.frankfurter.dev/v1/latest?base=USD`.
- Client-side reactive broadcast (`useLiveRates`) ensures instant updates across all property cards, financial calculators, and inventory tables with an active sync indicator badge.

### 2. Interactive Turkish Citizenship by Investment ($400k CBI) Suite

- **Dynamic Cost Calculator**: Simulates property values ($400k to $2M+), family members (spouse + children under 18), and VAT (0% KDV) exemptions.
- Automatically calculates Title Deed Transfer Taxes (4% Tapu Harcı), SPK-accredited valuation appraisal fees, Central Bank DAB foreign exchange certificates, and bar-certified legal representation retainers.
- **6-Stage Legal Roadmap**: Interactive milestone tracker detailing statutory requirements under Turkish Law No. 5901.

### 3. Spatial 3D Motion & Architectural Parallax

- **Minimalist Grand Preloader**: High-impact vector emblem, precision hairline progress beam, and cubic-bezier curtain wipe on initial page entry.
- **Hardware-Accelerated Parallax**: Smooth Y-axis offset tracking via `[data-parallax]` in `MotionRoot`.
- **Pointer-Driven 3D Card Tilt**: True perspective card tilt (`rotateX`, `rotateY`, `perspective(1000px)`) with dynamic cursor-following ambient specular sheen on property showcases.
- **CAD Floor Plan Lightbox**: Architectural blueprint viewer with zoom and pan modes for off-plan and completed condominium inventory.

### 4. Enterprise Administrative Operations CMS (`/admin`)

- **Executive Command Center**: Live portfolio valuation totals, active pipeline deal distributions, and scheduled viewing calendars.
- **CRM & Deal Stages**: Full Kanban and tabular pipeline management for cross-border purchaser leads.
- **Editorial Publication Checklist**: Strict validation rules enforcing title deed verification, price integrity, and cover photo selection before public deployment.
- **Curated Media Studio**: Single-click architectural library presets or local drag-and-drop asset uploads.

---

## 📂 Architecture & Directory Structure

```
avrasya-properties/
├── public/
│   ├── favicon.svg             # Official white Avrasya architectural crest
│   ├── favicon.png             # Crisp high-DPI rendered emblem
│   └── images/
│       ├── avrasya-logo.svg    # Primary dark vector brandmark
│       ├── avrasya-logo-white.svg # Contrast white luxury brandmark
│       └── properties/         # High-resolution architectural photography
├── src/
│   ├── admin/                  # CMS shell, mock repository store & permissions
│   │   ├── Shell.tsx           # Administrative workspace layout & navigation
│   │   └── store.ts            # Reactive DB, inventory management & CRM state
│   ├── components/
│   │   ├── site/
│   │   │   ├── Chrome.tsx      # Header, live Istanbul clock, currency bar & footer
│   │   │   ├── Preloader.tsx   # Classic minimal luxury preloader & exit motion
│   │   │   ├── PropertyCard.tsx # 3D perspective cards with multi-currency pricing
│   │   │   └── Motion.tsx      # Parallax layers, 3D tilt engine & magnetic CTAs
│   │   └── ui/                 # Radix UI primitives, sheets, popovers & dialogs
│   ├── data/
│   │   └── properties.ts       # Verified Istanbul listings, corridors & specs
│   ├── hooks/
│   │   └── usePreferences.ts   # Frankfurter ECB live rates & saved shortlists
│   ├── routes/
│   │   ├── __root.tsx          # Root shell, preloader mount & global metadata
│   │   ├── index.tsx           # High-impact homepage & client testimonials
│   │   ├── properties.index.tsx# Catalog with Grid/List view & CBI filters
│   │   ├── properties.$slug.tsx# Multi-photo lightbox & CAD floor plan viewer
│   │   ├── citizenship.tsx     # $400k CBI interactive financial calculator
│   │   ├── why-turkiye.tsx     # District comparative analysis & macro drivers
│   │   ├── investment-in-turkiye.tsx # Master acquisition playbook & tax rules
│   │   ├── services.tsx        # 10 Core advisory pillars & 6-phase journey
│   │   ├── about.tsx           # Üsküdar headquarters, fiduciary charter & team
│   │   ├── contact.tsx         # Private consultation brief builder & WhatsApp desk
│   │   └── admin.*.tsx         # Command center, CRM Kanban, viewings & inventory
│   └── styles.css              # Tailwind v4 configuration & 3D CSS transform tokens
└── app.config.ts               # TanStack Start / Nitro bundler configuration
```

---

## 🛠️ Local Development & Build Workflow

### Prerequisites

- [Bun](https://bun.sh) (v1.2+) or Node.js (v20+)

### Setup

```bash
# 1. Install dependencies
bun install

# 2. Launch development server with hot-module reload
=======
## Development
```sh
bun install --frozen-lockfile
>>>>>>> 79a7162f934d90675238098147e8ead1264bc06f
bun run dev
bun run test
bun run build
bun run typecheck
```

Production uses Supabase Auth, RLS-scoped data and server-authorized RPCs. The frontend contains only a publishable project key. Never add service-role keys or database credentials to Vite variables.

To use the fictional browser demo explicitly, set `VITE_ENABLE_ADMIN_DEMO=true`. Demo account details appear on the login screen only in that build mode. Demo records never seed or sync to production.

<<<<<<< HEAD
Avrasya Properties operates under strict buy-side fiduciary standards:

- **Ministry of Trade Licensing**: _Taşınmaz Ticareti Yetki Belgesi No. 3409821_
- **Istanbul Chamber of Commerce (İTO)**: _Sicil No. 849201_
- **Valuation Integrity**: All acquisitions are cross-referenced with independent Capital Markets Board (SPK) certified appraisal reports.
- **Legal Counsel**: Client representation is coordinated through independent members of the Istanbul Bar Association.
=======
## Management
- Inventory edits, publication, physical unit registration/linking and cover uploads.
- Contacts, enquiries, leads, advisory tasks, viewing appointments and atomic deal transitions.
- Shared company/contact/hero settings, indicative FX settings and announcements.
- Development/building registry, staff permissions, services, FAQs, authored content pages/sections, catalogue metadata, leases, vendors, maintenance, source review, audit records.
- Reservations and recorded payments are read-only in the generic editor. Reserved or closed inventory requires a transaction transition.
- Administrator JSON export includes application tables and file metadata. It does not include Auth credentials or Storage file bytes. Production restore/reset is unavailable in the browser.
>>>>>>> 79a7162f934d90675238098147e8ead1264bc06f

Public offers are returned only from published snapshots. Imported draft inventory stays private until staff publish it. Optional authored CMS sections replace built-in source pages; no raw HTML is accepted. Published services, FAQs and catalogue documents use shared database records.

## Validation
GitHub Actions runs unit tests, strict TypeScript, production build, fictional-demo browser journeys, isolated PostgreSQL migration/RLS tests, enquiry endpoint tests and persistent browser journeys through PostgREST. Browser Auth endpoints use test fixtures; no production user is created or real email sent. Hosted Auth/SMTP, storage transfers and the deployed enquiry endpoint require the post-deployment checks in the deployment guide.

`supabase/tests/bootstrap.sql`, `baseline.sql` and `browser-fixtures.sql` are **disposable CI fixtures**. Never run them against the live project.
