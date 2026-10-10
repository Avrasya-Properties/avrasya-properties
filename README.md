# Avrasya Properties — Private Client Real Estate & Advisory Portal

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald.svg)](https://avrasyaproperties.com)
[![Framework](https://img.shields.io/badge/Stack-TanStack%20Start%20%2F%20React%2019-17384A.svg)](https://tanstack.com/start)
[![Styling](https://img.shields.io/badge/CSS-Tailwind%20v4%20%2B%20Spatial%203D-B78C4D.svg)](https://tailwindcss.com)
[![Currency Engine](https://img.shields.io/badge/FX-Frankfurter%20ECB%20Real--Time-172B33.svg)](https://frankfurter.dev)
[![Licence](https://img.shields.io/badge/Licence-Taşınmaz%20Ticareti%20No.%203409821-D4AF37.svg)](https://ticaret.gov.tr)

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
bun run dev
# Server accessible at http://localhost:8080/

# 3. Production build validation (SSR + Client Bundles + Nitro Worker)
bun run build
```

---

## ⚖️ Statutory & Fiduciary Compliance

Avrasya Properties operates under strict buy-side fiduciary standards:
- **Ministry of Trade Licensing**: *Taşınmaz Ticareti Yetki Belgesi No. 3409821*
- **Istanbul Chamber of Commerce (İTO)**: *Sicil No. 849201*
- **Valuation Integrity**: All acquisitions are cross-referenced with independent Capital Markets Board (SPK) certified appraisal reports.
- **Legal Counsel**: Client representation is coordinated through independent members of the Istanbul Bar Association.

---

## 📞 International Advisory Desk

- **Headquarters**: Paşalimanı Caddesi No: 42, 34674 Üsküdar / Istanbul, Türkiye
- **Telephone**: +90 545 924 8042
- **Direct WhatsApp Desk**: [Chat on WhatsApp](https://wa.me/905459248042)
- **Official Inquiries**: info.avrasyaproperties@gmail.com
