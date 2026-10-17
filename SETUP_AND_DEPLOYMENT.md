# Setup & Deployment Guide

## 1. Prerequisites

- Node.js >= 20 or Bun >= 1.4
- Supabase Project (`ufcpvjhzitmxgitoaolx` or equivalent)
- Supabase CLI installed (`supabase`)

---

## 2. Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure credentials:
   - `VITE_SUPABASE_URL`: Your Supabase API URL.
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Public publishable key (the older name `VITE_SUPABASE_ANON_KEY` is not read by the code).
   - `SUPABASE_SERVICE_ROLE_KEY`: Secret service-role key (server only, never commit).

---

## 3. Database Migrations

All schema definitions, triggers, and functions are tracked under `supabase/migrations/`:

| Migration File                                           | Description                                                       |
| :------------------------------------------------------- | :---------------------------------------------------------------- |
| `20261011000001_core_and_staff_auth.sql`                 | Core enums, `staff_profiles`, last admin protection trigger       |
| `20261011000002_inventory_and_properties.sql`            | Developers, projects, physical units, offers, pricing schedules   |
| `20261011000003_crm_and_enquiries.sql`                   | Contacts, buyer requirements, shortlists, enquiries, leads, tasks |
| `20261011000004_transactions_and_rentals.sql`            | Deals, reservations, payments, leases, rent charges, maintenance  |
| `20261011000005_cms_website_and_system.sql`              | Site settings, content pages, catalog documents, audit events     |
| `20261011000006_rls_and_security_policies.sql`           | Row Level Security policies, storage buckets & permissions        |
| `20261011000007_business_functions_and_transactions.sql` | Stored procedures: publish, reservations, deals, rent charges     |
| `20261011000008_security_hardening_grants.sql`           | Revokes public execute grants on security definer functions       |

To apply migrations on a new environment:

```bash
# CAUTION: do NOT run `supabase db push` against the live project without review (see docs/BACKEND_DEPLOYMENT.md).
# The original remote migrations were not reconstructed, so replaying every file can fail on non-idempotent policies.
# Apply new migrations (for example 20261017000001_regions_and_snapshot_hardening.sql) one at a time via the
# Supabase SQL editor after testing on a staging copy.
supabase db push
# OR apply files sequentially with psql / Supabase SQL Editor
```

---

## 4. Initial Staff Administrator Bootstrap

To safely bootstrap the initial administrator without hardcoded passwords:

1. Run the administrative bootstrap service in a secure environment:

   ```ts
   import { AuthService } from "./backend/services/auth.service";

   await AuthService.bootstrapInitialAdmin({
     email: process.env.INITIAL_ADMIN_EMAIL!,
     password: process.env.INITIAL_ADMIN_PASSWORD!,
     name: "System Administrator",
   });
   ```

2. The user will be created in Supabase Auth, their email automatically confirmed, and a corresponding row with role `'admin'` and `is_active: true` inserted into `staff_profiles`.
3. The administrator can then onboard subsequent staff via `AuthService.createStaffUser`.

---

## 5. Running Tests

Execute the comprehensive test suite with bun:

```bash
bun test
```

Ran across 32 tests covering RBAC, security defenses, domain validation, atomic reservations, rent charge generation, and importer reconciliation.

---

## 6. Running Background Jobs

Background jobs can be triggered directly or configured via Supabase Edge Functions / pg_cron:

- **Reservation Auto-Release**:
  ```bash
  bun run backend/jobs/reservation-expiry.job.ts
  ```
- **Rent Charge Generation**:
  ```bash
  bun run backend/jobs/rent-charge.job.ts
  ```
- **Exchange Rate Daily Sync**:
  ```bash
  bun run backend/jobs/exchange-rate.job.ts
  ```
