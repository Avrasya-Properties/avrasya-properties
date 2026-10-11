# Backend integration deployment
Target: [Avrasya Supabase project](https://supabase.com/dashboard/project/ufcpvjhzitmxgitoaolx).

## Current status
The repository implementation is reviewable. The live database still has its original eight migrations, 22 draft marketing offers, seven projects and no staff/Auth accounts at inspection. Automatic approval review rejected applying the broad permission migration because changing live policies/grants could cause lockout or disruption. No live database changes or Edge Function deployment were performed. No imported offer was published.

Review [the SQL change](../supabase/changes/admin_connection.sql). It preserves the existing tables and inventory, adds private authorization helpers, removes bypassable legacy RPC execution, replaces permissive staff policies with scoped access, adds constraints/audit triggers and guarded RPCs. The existing source record JSON is added as provenance on matching imported offers; current imported prices and statuses are preserved.

## Apply after approval
1. Confirm the target project and export a database backup/snapshot. Run the preflight queries below.
2. Generate the migration with `supabase migration new admin_connection` (inspect `supabase migration --help` for the installed CLI). Copy the reviewed SQL into that CLI-created file. Existing remote migration identifiers start with `20261011`; ensure the new generated version sorts after the existing remote history. If applying through MCP, use `apply_migration` and then retrieve/commit its recorded version, rather than inventing a migration filename.
3. Apply the reviewed SQL as one transaction. Do not apply the CI bootstrap/baseline/fixtures. Check the migration record, security/performance advisors and authorization tests afterward.
4. Deploy `supabase/functions/submit-enquiry/index.ts` with its deno.json. It uses custom publishable-key authentication and deliberately permits anonymous enquiries; JWT verification is disabled for this function. All database writes use a server-only service key plus a service-only validated RPC.
5. Set the Edge Function secret `WEBSITE_ALLOWED_ORIGINS` to a comma-separated list of exact website origins, including preview origins only when needed. The function fails closed without this setting. Supabase supplies its internal URL/service-role environment variables. Never copy a service-role key to GitHub frontend files or Vite variables.
6. Configure Auth Site URL and allowed redirect URLs, including `https://YOUR_DOMAIN/admin/recover`. Configure the intended email/SMTP provider and disable public staff registration in Auth settings. Staff membership is independently required even when Auth signup is enabled.
7. Keep `VITE_ENABLE_ADMIN_DEMO=false`. The project URL and publishable key already identify this project; environment variables may override these public values. Build and deploy the reviewed branch only after the migration succeeds.

## First administrator (owner chose setup later)
Create/invite the owner's real Auth account through Supabase Auth. Copy its UUID. In the SQL editor as the project owner, run:
```sql
insert into public.staff_profiles(id,email,name,role,is_active)
select id,email,'OWNER NAME','admin',true
from auth.users
where id='REPLACE_WITH_AUTH_USER_UUID'::uuid
on conflict(id) do nothing;
```
Check that exactly one intended user was added. No shared/demo production password is created. The owner can then add staff profiles for existing Auth users in Management > Staff access. Roles are protected database membership, never user-editable Auth metadata. The last active administrator cannot be disabled/demoted.

## Publishing inventory
Imported offers remain drafts. Review title, price basis, currency, location, source uncertainties and media before publication. Marketing packages, unit types and ambiguous offers are not physical units. Create the actual building/unit identity in Management and link an individual offer before reserving it. Marking a deal won changes only selected units to Sold/Rented according to the listing mode; it does not record payment receipt.

Staff accounts are checked against an active membership, existing Auth user and live Auth session. Managers/admins manage inventory/content and all CRM; agents access their assigned CRM; viewers have read-only staff access. Source files and private documents are limited to managers/admins.

## Website content
Company profile/contact/hero/rates/announcement fields are shared settings. Services and FAQs publish from their own tables. Catalogue download paths must point to a public-marketing object or an existing site `/downloads/` path.

Authored pages use their route slug (about, services, citizenship, why-turkiye, investment-in-turkiye, investment-catalog). Create content sections for the page. Supported `content_json`:
```json
{"paragraphs":["First paragraph.","Second paragraph."],"enquiry":true}
```
Sections render in sort order. Draft/archived authored pages display an unavailable state. Built-in source pages are the default until an authored record/sections exist. No raw HTML or client JavaScript is rendered from content JSON.

## Reservation expiry
Management > Reservations > Release expired reservations performs the guarded release. A server scheduler can call `expire_reservations` using service-role credentials every five minutes. No external scheduler is configured or represented as active by this change. Deploy and verify a scheduled job before relying on unattended expiry.

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
