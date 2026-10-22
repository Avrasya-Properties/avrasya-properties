# Owner actions and placeholders

Everything below needs a person with access to Supabase, DNS/email or the business facts. None of it could be
done from the code environment. Items are ordered by what unblocks the most.

## 1. Apply the database migration (required for Regions to save)
File: `supabase/migrations/20261017000001_regions_and_snapshot_hardening.sql`

- Adds `site_settings.regions` (JSON) and replaces `private.save_offer` so the public snapshot is built from an explicit
  allow-list (it no longer spreads the importer's raw `source_record` into the anonymous catalogue).
- Run it in the Supabase SQL editor on a **staging copy first**, then production. It is idempotent.
- Do not use `supabase db push` on the live project (see `docs/BACKEND_DEPLOYMENT.md`).
- Until it is applied, the Regions tab can be viewed but saving a regions change shows a clear "apply the migration" error
  instead of silently dropping data.
- After applying: Admin -> Website settings -> Regions -> add a region, Publish, Save. Then open a listing and pick the region.

## 2. Redeploy the Edge Functions and set secrets
Redeploy `admin-access`, `staff-accounts`, `submit-enquiry`, then set (Supabase -> Edge Functions -> Secrets):

| Secret | Value | Notes |
|---|---|---|
| `WEBSITE_ALLOWED_ORIGINS` | `https://avrasyaproperties.com,https://www.avrasyaproperties.com` | Exact origins, comma separated. Required by `submit-enquiry` (503 without it). Once set it also locks `admin-access` and `staff-accounts` to these origins. Include any preview/staging origin you use for admin sign-in. |
| `RESEND_API_KEY`, `ADMIN_MAIL_FROM`, `ADMIN_SITE_URL` | your Resend key, a verified sender, the exact https site URL | Admin lock-out alerts, password recovery email, and new-enquiry alerts. |
| `ENQUIRY_NOTIFY_EMAIL` | e.g. `info@avrasyaproperties.com` (comma separated for several) | Staff email for every new website enquiry, with reply-to set to the visitor. Skipped silently when unset; the enquiry is still saved and visible in Admin -> Enquiries. |
| `WEBSITE_PUBLISHABLE_KEY` | only if you rotate the publishable key | Otherwise the built-in default is used. |
| `TURNSTILE_SECRET_KEY` | **leave unset** | The form has no Turnstile widget yet; setting this makes every enquiry fail. |

Also in the Supabase dashboard: Auth site URL and redirect URLs (including `/admin/recover`), SMTP, disable public sign-up,
enable leaked-password protection.

### Verifying the enquiry form after deploy
1. Redeploy `submit-enquiry` and set the secrets above (at least `WEBSITE_ALLOWED_ORIGINS`).
2. On the live site submit the contact form with a real email and a phone number with country code (the server
   requires both). You should get an `AVR-...` reference; the form never shows success without one.
3. Check Admin -> Enquiries for the record and, if configured, the `ENQUIRY_NOTIFY_EMAIL` inbox for the alert.
4. Resend: verify the sending domain (DNS) used in `ADMIN_MAIL_FROM`, otherwise the provider rejects the alert.

## 3. Scheduled jobs (nothing runs them today)
Reservation expiry, monthly rent charges and exchange-rate refresh have no scheduler. The `backend/` job files are a legacy
layer that does not match the live schema (see `backend/README.md`). Recommended: a Supabase cron (pg_cron) or an external
cron calling the service-role RPC `public.expire_reservations`, and a daily job updating `site_settings.exchange_rate_*`.

## 4. Business content only you can supply (placeholders / removals)
- **About page**: the invented team members (they were the demo staff names) and the "$120M+ / 38+ / 14 Yrs" figures were removed.
  Add real people and verifiable numbers through Admin -> Website pages / Page sections (slug `about`).
- **District explorer** (homepage, Istanbul): yields, appreciation, price-per-m2 and airport times are hardcoded estimates.
  They are now labelled "indicative", but please verify or replace them (`src/components/site/BosphorusNavigator.tsx`).
- **Structured data** (`src/routes/__root.tsx`): confirm the geo coordinates, opening hours and the two `sameAs` social URLs
  (instagram/linkedin) are your real profiles.
- **Hero copy for non-English languages** still comes from the translation files; the admin hero fields apply to English only.
- **Process steps** and other long marketing paragraphs on the homepage, About and Services pages are English text embedded in
  the page code (not translated for TR/AR/RU/FA). Translate or move them into managed pages.
- Per-region hero image, summary and SEO text: set them per region in Settings -> Regions.

## 5. Known gaps
- `.env` is tracked in git (it only holds the public project URL and publishable key). Add it to `.gitignore` and
  `git rm --cached .env` if you prefer.
- Staff-email enumeration on `admin-access` (429 for known vs 401 for unknown emails) and no per-IP throttle remain; they need a
  SQL change and a decision on the lock-out policy.
- The Auth "password verification attempt" hook needs a Supabase plan that supports it (see `docs/ADMIN_ACCESS_AUDIT.md`).