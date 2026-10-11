# Avrasya Properties
React / TanStack Start website and staff workspace backed by Supabase project `ufcpvjhzitmxgitoaolx`.

The database integration is applied to Supabase and the enquiry Edge Function is deployed. Website/admin code remains on the review branch. First administrator setup, exact allowed website origins and hosted acceptance checks are required before full activation. See [deployment instructions](docs/BACKEND_DEPLOYMENT.md).

## Development
```sh
bun install --frozen-lockfile
bun run dev
bun run test
bun run build
bun run typecheck
```

Production uses Supabase Auth, RLS-scoped data and server-authorized RPCs. The frontend contains only a publishable project key. Never add service-role keys or database credentials to Vite variables.

To use the fictional browser demo explicitly, set `VITE_ENABLE_ADMIN_DEMO=true`. Demo account details appear on the login screen only in that build mode. Demo records never seed or sync to production.

## Management
- Inventory edits, publication, physical unit registration/linking and cover uploads.
- Contacts, enquiries, leads, advisory tasks, viewing appointments and atomic deal transitions.
- Shared company/contact/hero settings, indicative FX settings and announcements.
- Development/building registry, staff permissions, services, FAQs, authored content pages/sections, catalogue metadata, leases, vendors, maintenance, source review, audit records.
- Reservations and recorded payments are read-only in the generic editor. Reserved or closed inventory requires a transaction transition.
- Administrator JSON export includes application tables and file metadata. It does not include Auth credentials or Storage file bytes. Production restore/reset is unavailable in the browser.

Public offers are returned only from published snapshots. Imported draft inventory stays private until staff publish it. Optional authored CMS sections replace built-in source pages; no raw HTML is accepted. Published services, FAQs and catalogue documents use shared database records.

## Validation
GitHub Actions runs unit tests, strict TypeScript, production build, fictional-demo browser journeys, isolated PostgreSQL migration/RLS tests, enquiry endpoint tests and persistent browser journeys through PostgREST. Browser Auth endpoints use test fixtures; no production user is created or real email sent. Hosted Auth/SMTP, storage transfers and the deployed enquiry endpoint require the post-deployment checks in the deployment guide.

`supabase/tests/bootstrap.sql`, `baseline.sql` and `browser-fixtures.sql` are **disposable CI fixtures**. Never run them against the live project.
