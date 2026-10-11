# Backend integration deployment
Target: [Avrasya Supabase project](https://supabase.com/dashboard/project/ufcpvjhzitmxgitoaolx).

## Current status
On 2026-10-11, the owner explicitly approved the reviewed migration. Supabase recorded:
- `20261011001126_admin_connection`: private authorization, scoped policies/grants, integrity checks, audit triggers and guarded RPCs.
- `20261011001320_admin_connection_index_cleanup`: removes seven redundant non-constraint indexes while retaining equivalent original indexes and the rate-limit uniqueness constraint.

Both exact recorded migrations are committed under `supabase/migrations/`. The original eight remote migrations predate this integration and are not reconstructed here. The reviewed SQL remains at `supabase/changes/admin_connection.sql` for reference; do not reapply it.

The `submit-enquiry` Edge Function is deployed as version 1 with custom publishable-key authentication. It deliberately accepts anonymous enquiries and verifies the project key, origin, consent and payload; JWT verification is disabled for this function. Internal service credentials stay in the Edge Function runtime.

All 22 imported offers remain Draft. There are still no Auth users/staff; first admin setup is deferred at the owner's request. Anonymous hosted reads, membership enforcement and advisor checks are recorded in the audit. Website/admin code remains on the review branch; main is unchanged.

## Remaining activation
1. Set Edge Function secret `WEBSITE_ALLOWED_ORIGINS` to the exact approved website origins, comma-separated. The function fails closed without it. The connected MCP does not expose secret management; configure it in [Edge Function secrets](https://supabase.com/dashboard/project/ufcpvjhzitmxgitoaolx/functions/secrets). Do not guess the production or preview domain.
2. Configure Auth Site URL and redirect URLs, including `https://YOUR_DOMAIN/admin/recover`; configure the intended SMTP provider and disable public staff registration. Membership independently protects access.
3. Create the owner's Auth account and staff membership using the procedure below.
4. Keep `VITE_ENABLE_ADMIN_DEMO=false`. Merge/deploy the reviewed application branch when ready for hosted acceptance tests.
5. Complete the post-deployment tests below: actual sign-in/recovery email, Storage transfers, website management changes and one consented test enquiry. No real account or client-data mutation is created by the read-only hosted check script.

Supabase supplies the function's internal URL/service-role environment variables. Never copy service-role keys into GitHub frontend files or Vite variables. Do not run CI bootstrap/baseline/fixtures against the live project.

## Administrator and team accounts
The requested administrator was created in Supabase Auth and verified through password sign-in and protected staff reads: admin@avrasyaproperties.com. The password supplied by the owner is not stored in this repository. The one-time setup endpoint is disabled.

Administrators create real accounts under Website and team > Team accounts. Enter the person's name, email, role and a private temporary password of at least 12 characters. Email confirmation is completed during this administrator-only setup. Share credentials privately. Existing accounts can be disabled or their role changed; email changes require updating Auth and the profile together through an owner-reviewed process. The last active administrator cannot be disabled or demoted.

## Publishing inventory
Imported offers remain drafts. Review title, price basis, currency, location, source uncertainties and media before publication. Marketing packages, unit types and ambiguous offers are not physical units. Create the actual building/unit identity in Management and link an individual offer before reserving it. Marking a deal won changes only selected units to Sold/Rented according to the listing mode; it does not record payment receipt.

Staff accounts are checked against an active membership, existing Auth user and live Auth session. Managers/admins manage inventory/content and all CRM; agents access their assigned CRM; viewers have read-only staff access. Source files and private documents are limited to managers/admins.

## Website content
Company profile/contact/hero/rates/announcement fields are shared settings. Services and FAQs publish from their own tables. Catalogue download paths must point to a public-marketing object or an existing site `/downloads/` path.

Authored pages use their route slug (about, services, citizenship, why-turkiye, investment-in-turkiye, investment-catalog). Create content sections for the page. The page editor handles paragraphs and the contact-form switch without requiring JSON. Stored format:
```json
{"paragraphs":["First paragraph.","Second paragraph."],"enquiry":true}
```
Sections render in sort order. Draft/archived authored pages display an unavailable state. Built-in source pages are the default until an authored record/sections exist. No raw HTML or client JavaScript is rendered from content JSON.

## Reservation expiry
Website and team > Reservations > Release expired reservations performs the guarded release. A server scheduler can call `expire_reservations` using service-role credentials every five minutes. No external scheduler is configured or represented as active by this change. Deploy and verify a scheduled job before relying on unattended expiry.

## Optional CAPTCHA
The endpoint supports `TURNSTILE_SECRET_KEY` and a `captchaToken` payload. The current public form does not render a challenge widget; do not enable that secret until the widget/site key is connected. Baseline controls are validation, consent, honeypot, hashed-IP rate limiting, origin checks and idempotent receipts.

## Preflight and post-deployment checks
- Confirm current staff/users, offers and migration history; check nonnegative prices/positive supplied areas, lead budget ordering and viewing end > start.
- Verify anonymous access cannot read CRM, staff assignments, source review payloads or draft offers.
- Sign in as actual admin/manager/agent/viewer; test disabled membership and revoked sessions.
- Create a contact and reload from another staff browser. Publish/unpublish an offer and check the public list/detail/slug redirect.
- Submit a real test enquiry with consent; verify one inbox record and retry idempotency. Check rate errors do not reveal server details.
- Convert enquiry -> lead -> opportunity; explicitly select verified units and agreed currency/amount; test reservation conflict, loss/release, expiration and sale/rental completion.
- Upload a cover and verify public retrieval. Upload/check private documents separately if introduced.
- Change company contact and homepage settings and verify a new anonymous browser sees them; verify services/FAQs/CMS content and document links.
- Verify password recovery email and redirect on the actual website origin. CI Auth fixtures do not test hosted email delivery.
- Inspect advisors and logs. Do not claim live readiness until these hosted checks pass.

## Backups and rollback
Administrator JSON exports cover application tables/metadata only; they are not a full database/Storage backup. Production restore and factory reset are disabled in the UI. Restore a database snapshot only through a reviewed maintenance procedure. If activation fails, keep the existing main deployment and investigate; do not re-enable bypassable legacy RPC grants as a shortcut.
