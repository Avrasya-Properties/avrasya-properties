# Publishing repair

## Why properties were missing

The committed `.env` enabled `VITE_ENABLE_ADMIN_DEMO=true`. In that mode the admin
stored edits in the current browser and the website read a bundled catalogue.
Publishing a browser record never wrote to Supabase. The hosted project was
checked on 14 October 2026: it contained 22 imported drafts, no published offers,
and no recent listing writes.

Normal development, production, staging and preview builds now ignore that demo
flag. A demo requires an explicitly named `demo` or `test` build as well as the
flag. Use the real Supabase Auth administrator for the live panel. Browser demo
accounts and demo records are not real database accounts or listings. Old browser
records are preserved locally, but are not automatically imported or published.

## Active connections

| Action | Active implementation | Public website |
| --- | --- | --- |
| Create/edit/publish listing | `src/admin/remote.ts` → `save_offer` | `published_catalogue` → shared property cards/details |
| Draft/review/archive | Guarded publication RPCs | Only Published snapshots are readable |
| Shared settings/filter options | `site_settings` with optimistic revision checks | Query-backed header/homepage/footer/filter options |
| Pages, sections, services, FAQs, brochures | `src/admin/management.ts` with database permissions | Public content queries |
| Customer enquiry | Public Edge Function with consent and retry key | Real server receipt; no local success fallback |
| Website refresh | Database `website_revision`, safe browser signals and fallback reads | Changed revision invalidates public queries and route loaders |

`backend/services` is a separate, unwired implementation from an earlier change.
The current admin does not call those classes. Their validation tests do not prove
that the admin or public website works. Future work must use the active map above
and the canonical migration/RPC contracts rather than wiring those legacy services
directly: several still use obsolete columns or revoked RPCs.

## Changes

- Disabled the committed demo flag and guarded normal builds against an accidental flag.
- Added the missing districts, layouts and budget range database fields.
- Connected custom budget tiers to actual property filtering.
- Added a public revision containing no property, draft, customer or staff payload.
  A visible website checks it every five seconds, and refreshes changed public data.
  Hidden tabs catch up on focus; ordinary query refreshes remain as a fallback.
- Restored shorter public query freshness and focus refresh behaviour.
- Enquiries now send consent, a stable idempotency key and the honeypot field.
  Backend errors are shown honestly and cannot produce a demo receipt.
- Added machine-readable deployment mode/database metadata and a plain live-data
  label in the admin panel.

## Verification scope

Unit tests cover mode guards, real enquiry request/response handling, form retries,
settings compatibility, custom budgets, revision refresh and cleanup. These are
regression tests, not evidence of a deployed write.

The persistent browser test uses a disposable PostgreSQL database through
PostgREST, real guarded RPCs and a local Auth adapter. It creates and publishes a
property, reads it from a separate visitor browser context, verifies details and
settings, updates an already-open page and unpublishes it. Browser storage/events
cannot make the separate visitor check pass. No test fixtures are added permanently
to the hosted project.

Hosted API connectivity checks are explicitly separate from website checks. A
zero-row successful catalogue response does not prove publication works. Supply
the actual deployed website URL for hosted page verification. The admin and website
must both report live mode and the expected database hostname.

## Release and remaining setup

Apply `website_revision_and_search_settings` before deploying the frontend.
Preserve the imported drafts; publishing remains a deliberate staff action.
Deploy the updated main branch through the existing Lovable/hosting connection.
Check `meta[name="avrasya-data-mode"]` is `live` and
`meta[name="avrasya-database"]` is `ufcpvjhzitmxgitoaolx.supabase.co` on the released site.

Website enquiries still require the actual website origins in the Edge Function's
`WEBSITE_ALLOWED_ORIGINS` secret. An unset allowlist intentionally returns an error,
and is not evidence of a successful customer submission. Auth redirects, mail
delivery and scheduled jobs need their own configured, hosted checks.

Rollback: revert the frontend repair if necessary. The additive migration can stay
in place; it neither publishes nor deletes business records. Remove its triggers
and revision table only through a reviewed follow-up migration if required.
