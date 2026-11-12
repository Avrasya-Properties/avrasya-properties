# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary Visitors**: High-net-worth international investors, foreign property buyers, and diaspora families seeking citizenship by investment in Turkey and luxury residences across key Turkish metropolitan and coastal markets (Istanbul, Antalya, Bodrum, etc.).
- **Internal Operators**: Avrasya sales agents, property consultants, and administrators managing client inquiries, viewing requests, property catalogues, and website content.

## Product Purpose

Avrasya Properties markets and sells premium real estate eligible for Turkish citizenship by investment. It exists to provide an elite, transparent bridge between foreign capital and vetted Turkish real estate developments, guiding clients through property selection, legal due diligence, and citizenship acquisition. Success is defined by high-intent client inquiries, booked VIP private viewings, and completed citizenship-qualifying property sales.

## Positioning

Curated, legally-verified Turkish luxury real estate paired with an end-to-end citizenship advisory. Unlike transactional real estate listing portals or generic agencies, Avrasya provides an architectural, concierge-grade digital experience with transparent unit availability, verified legal eligibility, and white-glove advisory from inquiry to title deed handover.

## Operating Context

- International buyers evaluating multi-hundred-thousand-dollar property acquisitions remotely from overseas on desktop and mobile devices.
- High-touch decision journey requiring legal reassurance, currency transparency, timeline clarity, and seamless private consultation scheduling.
- Integrated operational workflow where public inquiries instantly feed into an internal inquiry pipeline and administrative CRM backed by Supabase.

## Capabilities and Constraints

- **Catalogue & Unit Inventory**: Filterable luxury properties and development unit matrices with status (Ready / Under Construction), citizenship eligibility badges, location, price, and bedroom breakdowns.
- **VIP Viewing Scheduling**: Interactive date and time-slot booking modal (`CaldrenViewingModal`) connected directly to the inquiry intake pipeline with zero data loss.
- **Financial & Legal Tools**: Interactive mortgage calculator and citizenship eligibility evaluation timelines.
- **Live CMS Synchronization**: Dynamic hero statements (preserving GSAP entrance animations), metric counters, locations, and service timelines synchronized reactively with backend settings.
- **Data Integrity Constraints**: Real estate area metrics must strictly distinguish between gross and net square meters; source marketing data must remain clearly delineated from live confirmed inventory.
- **Security & RBAC**: Strict separation of client environment variables from administrative service keys; role-based access control (Super Admin, Admin, Editor, Viewer).

## Brand Commitments

- **Brand Name**: Avrasya Properties.
- **Brand Voice**: Refined, authoritative, trustworthy, discreetly luxurious, and architecturally sophisticated.
- **Visual References**: Curated blend of Caldren (editorial luxury real estate, warm architectural neutrals, refined typography) and Bildora (modern structural precision, engineering rigor, and metric proof).
- **Core Assets**: Brand palette definitions (`avrasya-brand-palette.pdf`), inspiration tokens and components in `inspo/`, and structured property data in `AVRASYA_SOURCE_DATA.json`.

## Evidence on Hand

- Component and design token extractions located in `inspo/caldren/` and `inspo/bildora/`.
- Verified editorial property and offer records in `AVRASYA_SOURCE_DATA.json`.
- Brand palette specification in `avrasya-brand-palette.pdf`.
- Operational admin panel, CMS, and public site implementation in `avrasya-properties/`.

## Product Principles

1. **Trust and Legal Transparency Above All**: High-stakes international investments demand absolute clarity on legal requirements, citizenship criteria, and accurate property details.
2. **Editorial Architectural Craft**: Avoid generic listing tropes; present every development with architectural dignity, refined typography, and purposeful motion.
3. **Frictionless Conversion Velocity**: Empower buyers to calculate figures, inspect floor plans, and book VIP viewings without cognitive friction or broken workflows.
4. **Synchronized Single Truth**: Ensure all public customer-facing displays faithfully mirror verified backend data and CMS configurations in real time.

## Accessibility & Inclusion

- WCAG AA contrast standards across dark and neutral luxury palettes.
- Multilingual readiness for international investor clientele.
- Full keyboard navigation and ARIA semantics across custom interactive widgets (viewing scheduler, calculators, unit tables, and modals).

