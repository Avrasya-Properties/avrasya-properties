# Avrasya Properties — Luxury Real Estate & Citizenship Advisory Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-SSR-FF4154)](https://tanstack.com/start)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%2B_RLS-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

**Avrasya Properties** is a full-stack luxury real estate, investment advisory, and Turkish Citizenship by Investment (Law No. 5901) platform built with **React 19**, **TanStack Start (SSR)**, **Tailwind CSS v4**, **GSAP + Lenis**, **Three.js WebGL**, and **Supabase (PostgreSQL + Row-Level Security + Edge Functions)**, deployed on **Cloudflare Workers / Pages**.

---

## Architecture & Tech Stack

- **Frontend & SSR Framework:** React 19, TanStack Start (`@tanstack/react-start`), TanStack Router (`@tanstack/react-router`), TanStack Query (`@tanstack/react-query`)
- **Styling & Design System:** Tailwind CSS v4 (`@tailwindcss/vite`), dual-theme **Light Mode** (_Warm Ivory & Deep Forest Petrol_) and **Dark Mode** (_Anatolian Nocturne Sanctuary_), full RTL layout support
- **Interactive 3D & Motion Engine:**
  - **Three.js WebGL:** Interactive 3D Turkish Passport (`PassportCanvas`) and Modernist Residence (`ArchitecturalBuildingCanvas`) with touch-orbit physics (`touch-action: pan-y`), responsive camera framing, and progressive CSS 3D fallbacks
  - **GSAP + ScrollTrigger + Lenis:** Choreographed 3D cylinder perspective gallery, pinned project showcase, kinetic typography, and smooth scroll synchronization
- **Multilingual Localization (7 Languages):** English (`en`), Turkish (`tr`), Arabic (`ar` — RTL), Russian (`ru`), Persian (`fa` — RTL), Chinese (`zh`), and Bengali (`bn`)
- **Backend & Database:** Supabase PostgreSQL with strict Row-Level Security (RLS), atomic RPC transactions, Storage buckets (`public-marketing`, `private-documents`), and Deno Edge Functions (`submit-enquiry`, `admin-access`, `staff-accounts`)

---

## Repository Structure

```text
avrasya-properties/
├── .github/workflows/       # CI/CD pipelines (unit tests, RLS migration checks, E2E smoke tests)
├── backend/                 # Domain services, validators, scheduled jobs, and Google Drive importer
│   ├── importer/            # Source manifest, Drive client, and SQL reconciliation engine
│   ├── jobs/                # Exchange rate, rent charge, and reservation expiry jobs
│   ├── services/            # Auth, CMS, CRM, Enquiry, Inventory, Rental, and Transaction services
│   ├── tests/               # Backend domain, contract, importer, and security test suites
│   └── validators/          # Zod schemas and domain input validators
├── docs/                    # Architecture, deployment, admin guide, and security audit documentation
│   └── audits/              # Historical audit reports and action plans
├── public/                  # Static assets, 3D textures, partner logos, and _headers rules
├── scripts/                 # Automated smoke tests and endpoint verification scripts
├── src/
│   ├── admin/               # Staff workspace, CMS editor, media library, and RBAC management
│   ├── components/
│   │   ├── 3d/              # Three.js WebGL canvases and progressive CSS 3D fallback cards
│   │   ├── framer/          # Interactive Showreel & Private Viewing modal components
│   │   ├── site/            # Public website sections, navigation chrome, theme & language switchers
│   │   └── ui/              # Accessible Radix UI primitives
│   ├── data/                # Live Supabase query loaders, region normalizers, and fallback catalogue
│   ├── hooks/               # Theme, Language (i18n), Currency/Shortlist preferences, and Live Contact hooks
│   ├── i18n/                # Complete 7-language translation dictionaries (EN, TR, AR, RU, FA, ZH, BN)
│   ├── lib/                 # Security sanitizers, Supabase clients, GSAP/Lenis animation helpers
│   ├── routes/              # File-based TanStack Router routes (public pages, sitemap.xml, /admin/*)
│   ├── test/                # Vitest unit, integration, adversarial, and E2E test suites
│   ├── router.tsx           # TanStack Router + SSR QueryClient configuration
│   ├── server.ts            # SSR entry wrapper with catastrophic error normalization & security headers
│   └── styles.css           # Tailwind v4 design tokens, Dark/Light mode rules, and RTL typography
├── supabase/
│   ├── functions/           # Deno Edge Functions (submit-enquiry, admin-access, staff-accounts)
│   ├── migrations/          # Transactional PostgreSQL schema, RLS policies, and RPC migrations
│   └── tests/               # Isolated CI database fixtures and SQL verification scripts
├── .env.example             # Environment variable template (placeholders only)
├── package.json             # Project dependencies and scripts (locked with bun.lock)
├── vite.config.ts           # Vite + TanStack Start + Nitro Cloudflare configuration
└── wrangler.json            # Cloudflare Workers deployment configuration
```

---

## Getting Started & Development

### Prerequisites

- [Bun](https://bun.sh/) `>= 1.4.x`
- Node.js `>= 22.x`

### Installation & Local Development

```bash
# 1. Install dependencies using the frozen lockfile
bun install --frozen-lockfile

# 2. Copy the environment template and configure local keys
cp .env.example .env

# 3. Start the development server (http://localhost:8080)
bun run dev
```

### Verification & Quality Gates

```bash
# Run the full Vitest unit & integration test suite
bun run test

# Run strict TypeScript typechecking
bun run typecheck

# Run ESLint static analysis
bun run lint

# Build production SSR + client bundles
bun run build
```

---

## Security & Environment Configuration

1. **Zero Secret Exposure in Client Bundles:**
   - Only `VITE_SUPABASE_URL` and the public `VITE_SUPABASE_PUBLISHABLE_KEY` are exposed to browser code.
   - `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, and `GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON` are strictly server-only secrets configured in Supabase Edge Function secrets or server environment variables.
   - `.env`, `.env.*`, `*.local`, `*.pem`, `*.key`, and `service_account*.json` are git-ignored and verified by `src/test/security-hygiene.test.ts`.
2. **Row-Level Security (RLS) & Isolated Clients:**
   - Public visitors query through a dedicated non-persisted `publicSupabase` client (`persistSession: false`), reading only published snapshots (`publication_status = 'Published'`).
   - Staff operations require authenticated sessions verified by PostgreSQL RLS policies and server-authorized RPCs.
3. **Input Validation, XSS Prevention & HTTP Security Headers:**
   - Public enquiries are sanitized (`sanitizeEnquiryField`) and submitted through the rate-limited, origin-checked `submit-enquiry` Edge Function with idempotency keys and honeypot protection.
   - Dynamic CMS and partner links are validated through `sanitizeSafeUrl` (blocking `javascript:`, `data:`, `vbscript:`, and protocol-relative `//` URLs).
   - Structured JSON-LD payloads are escaped via `escapeJsonLd` to prevent `</script>` breakout.
   - Both SSR responses (`src/server.ts`) and static asset responses (`public/_headers`) enforce `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `Cross-Origin-Opener-Policy`.

---

## Documentation Index

Detailed architectural and operational guides are located in [`docs/`](./docs):

- [`docs/BACKEND_ARCHITECTURE.md`](./docs/BACKEND_ARCHITECTURE.md) — Database schema, RLS policies, and service layer architecture
- [`docs/BACKEND_DEPLOYMENT.md`](./docs/BACKEND_DEPLOYMENT.md) — Production Supabase & Edge Function deployment runbook
- [`docs/SETUP_AND_DEPLOYMENT.md`](./docs/SETUP_AND_DEPLOYMENT.md) — Environment setup and Cloudflare deployment guide
- [`docs/ADMIN_GUIDE.md`](./docs/ADMIN_GUIDE.md) — Staff workspace, CMS, inventory, and CRM operations manual
- [`docs/BACKUP_AND_RESTORE.md`](./docs/BACKUP_AND_RESTORE.md) — Database snapshot and disaster recovery procedures
- [`docs/DESIGN.md`](./docs/DESIGN.md) — Architectural monograph design system and motion specifications
- [`docs/PRODUCT.md`](./docs/PRODUCT.md) — Product overview and feature matrix
