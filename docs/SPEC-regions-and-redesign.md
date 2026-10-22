# Spec: Regions, hardening and redesign

Status: in progress. Branch: `feat/backend-implementation` (working tree was clean at start; 113/113 tests, tsc clean).

## Goals
1. Admins can add **regions** (e.g. Istanbul, Antalya, Bodrum) with their own districts; public filters, pages and SEO follow.
2. Admin panel, Supabase backend and public site stay in sync (no dead settings, no hardcoded content the admin cannot change).
3. Premium, non-generic visual design with GSAP scroll effects and restrained 3D; perfect mobile layout.
4. **Do not break what works**: existing tests and route ids stay green; production data keeps working.

## Constraints
- No live-DB access from the build environment: SQL ships as new migration files and is NOT applied by this work.
- No fabricated business content (stats, team, yields). Placeholders are flagged for the owner.
- Every new i18n string exists in en/tr/ar/ru/fa (key-parity test).
- `homepage.test.tsx` mocks `Chrome` (Logo, CtaBand only) and `Motion` (Tilt, Marquee, MotionRoot only): new effects go in new modules.
- `scripts/mobile-smoke.mjs` hooks (h1 textContent, `[data-reveal]` gets `is-in`, `#mobile-nav`, ...) are preserved.

## Data model: regions
New table `public.regions` (slug unique, name, country, summary, hero_image, districts text[], zones text[], has_zones bool, sort_order, is_published, seo_title, seo_description, lat, lng).
- `projects.region_id` and `marketing_offers.region_id` (nullable FK, backfilled to `istanbul`).
- `city` is kept and mirrored from the region name (backward compatible). `side` stays valid (`unknown` for non-Istanbul regions); Europe/Asia UI shows only for regions with `has_zones`.
- `save_offer` accepts `region_id`, stops forcing `city='Istanbul'`, and builds the public snapshot from an **allow-list** (fixes the `source_record`/`source_note` leak). Snapshot gains `region {slug,name}`.
- `public.published_regions()` RPC (anon, published only) + admin CRUD through the existing `MODULES` mechanism.
- Demo mode mirrors the same shape in localStorage so everything is testable without Supabase.

## Public site
- Catalogue schema relaxed (`side` string, per-row `safeParse`) so one bad row cannot blank the catalogue.
- Properties filter: region -> district (cascading), zone only for regions with zones; URL `?region=&loc=`.
- Region pages `/regions/$slug` (SEO + sitemap), region cards on home.
- Meta/canonical/robots driven by admin SEO settings.

## Fix list (ranked, from the audits)
P1 public: duplicate fact rows + raw `details` leak (PropertyDetails), 307 -> 301 redirect, over-eager website-revision refresh, services/FAQs ignored by Services page, demo `loadCatalogue` ignoring demo DB, reduced-motion infinite loop, contrast/skip link.
P1 backend: snapshot allow-list, CORS `*` on admin functions, hardcoded publishable key, Turnstile mismatch, anon `site_settings select *`, doc/env drift, dead `backend/` layer documented as legacy, scheduler for expiry/FX documented.

## Design direction
"Quiet architectural monograph": remove glass/shimmer/pulse and invented content; Cormorant display + Manrope UI, hairline rules, oversized numerals, pinned masked hero, scroll-scrubbed process, snap rail on mobile, CSS 3D depth + optional lazy three.js (desktop, WebGL, no reduced-motion only).

## Verification
tsc, vitest, production build, browser checks at 320/375/768/1280 in demo mode, `mobile-smoke.mjs`. Not verifiable here (needs live Supabase/Cloudflare): applying migrations, Edge function deploy, email, Turnstile, scheduler. Listed as owner actions.
