# Avrasya Properties - Backend Architecture

## 1. Architectural Principles

1. **Strict Separation of Concerns**: Physical inventory (developments, buildings, physical units) is strictly decoupled from marketing offers/advertisements (`marketing_offers`). Multiple offers can target one physical unit, and package offers can bundle multiple units (`package_memberships`).
2. **Snapshot Publication Model**: Drafts are completely isolated from live listings. Publishing is an atomic stored procedure (`publish_offer_atomic`) that freezes a JSON snapshot into `published_snapshot` and records an immutable log in `publication_history`.
3. **Multi-Currency Strictness**: All amounts use exact numeric values with explicit ISO currency codes (`USD`, `TRY`, `EUR`, `GBP`). Cross-currency aggregation is prohibited.
4. **CRM Integrity**: Contacts, Leads, Deals, and Enquiries have explicit relationship lifecycles. Exploratory buyer shortlists are strictly segregated from deal-selected units (`deal_selected_units`). Winning a deal marks only the selected units as Sold.
5. **Defense in Depth**:
   - PostgreSQL Row Level Security (RLS) on all exposed tables.
   - Dedicated storage buckets (`public-marketing`, `private-source`, `private-documents`).
   - Server-enforced rate limiting (`rate_limit_entries`) and bot honeypot validation (`website_hp`).
   - CSV formula injection escaping (`sanitizeCsvCell`).
   - Database triggers preventing overlapping leases and cross-currency payment allocations.

---

## 2. Relational Database Schema

### Core & Staff Auth
- `staff_profiles`: Authoritative staff records linked to Supabase Auth (`auth.users`).
  - Roles: `admin`, `manager`, `agent`, `viewer`.
  - Guard Trigger: `guard_last_admin` prevents removal or demotion of the final active administrator.

### Inventory Domain
- `developers`: Property development companies.
- `projects`: Master developments with location metadata.
- `buildings`: Blocks / towers within projects.
- `physical_units`: Actual physical apartments (with floor, unit number, internal specs).
- `marketing_offers`: Public or draft listings.
  - Types: `unit_offer`, `unit_type`, `package`, `project`, `ambiguous_offer`.
  - Statuses: `Draft`, `In Review`, `Published`, `Archived`.
- `package_memberships`: Maps package offers to constituent physical units.
- `amenities` & `offer_amenities`: Standardized amenity catalog.
- `pricing_options`: Cash, installment schedules, and promo prices.
- `instalment_schedules`: Detailed payment milestone breakdowns.
- `price_history`: Dated price revisions with provenance.
- `availability_history`: Historical status shifts (`Available`, `Reserved`, `Sold`, `Rented`).
- `publication_history`: Immutable publication events with author and diff notes.
- `property_slug_redirects`: Tracks 301/302 redirects when URLs change.

### CRM Domain
- `contacts`: Buyers, investors, tenants, landlords, vendors.
- `buyer_requirements`: Structured search criteria (districts, budget range, bedrooms, CBI intent).
- `contact_shortlists`: Properties favorited by buyers (separate from contracted units).
- `enquiries`: Incoming consultation requests from web forms and WhatsApp clicks.
- `leads`: Qualified sales opportunities with stage progression.
- `contact_merges`: Audited history of deduplication merges with full JSON state preservation.
- `tasks`, `viewings`, `activities`, `notes`: CRM interaction tracking.

### Transactions Domain
- `deals`: Sales and lease transactions.
- `deal_selected_units`: The exact physical units and offers subject to this transaction.
- `reservations`: Time-limited property holds (with locking and auto-expiry).
- `payment_milestones` & `recorded_payments`: Received deposits and installments with exact currency verification.
- `commission_allocations`: Agent fee distributions.

### Rental Management Domain
- `leases`: Tenancy contracts with duration, rental rate, and payment due day.
  - Guard Trigger: `check_overlapping_lease` rejects overlapping tenancies on the same physical unit.
- `rent_charges`: Monthly billing records with short-month due date clamping.
- `rent_payment_allocations`: Payments applied to rent charges.
  - Guard Trigger: `check_cross_currency_allocation` prevents currency mismatches.
- `rental_deposits`: Security deposits tracked separately from rental income.
- `vendors`: Maintenance contractors and service providers.
- `maintenance_tickets`: Maintenance issues, priority, and repair costs.

### CMS & System
- `site_settings`: Global brand configuration, contacts, and exchange rate cache.
- `content_pages` & `content_sections`: Structured marketing page builder.
- `services` & `faqs`: Catalog service phases and answers.
- `catalog_documents`: PDF brochures and catalogs.
- `audit_events`: Tamper-evident operational audit logs.
- `rate_limit_entries`: IP-based request throttler.
- `source_files` & `import_runs`: Provenance tracking for Google Drive material.

---

## 3. Storage Architecture

| Bucket Name | Access Level | Allowed MIME Types | Max Size | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `public-marketing` | Public Read | Images (JPEG, PNG, WebP) | 10 MB | Approved website photos and floorplans |
| `private-source` | Staff Authenticated | All Media, PDF, Video | 100 MB | Raw Drive assets and unapproved drafts |
| `private-documents` | Staff / Admin Only | PDF, Docs, Images | 25 MB | Contracts, passports, payment receipts |

---

## 4. Background Jobs & Scheduled Workers

1. **Reservation Expiry Job** (`backend/jobs/reservation-expiry.job.ts`):
   - Frequency: Every 15 minutes.
   - Action: Invokes `release_expired_reservations()`, updating expired holds to Available.
2. **Monthly Rent Charge Job** (`backend/jobs/rent-charge.job.ts`):
   - Frequency: Monthly (1st of every month).
   - Action: Invokes `generate_rent_charges_for_month(year, month)` to create billing charges idempotently.
3. **Exchange Rate Sync Job** (`backend/jobs/exchange-rate.job.ts`):
   - Frequency: Daily at 06:00 UTC.
   - Action: Fetches reference rates from Frankfurter Open API, updating `site_settings.exchange_rates`.
