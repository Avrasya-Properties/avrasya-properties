# Backend and admin audit

Audited repository baseline: f386cee16632231f933e473d094f82b367c88603.

## Verified current state

The repository has no Supabase client dependency, migration directory, server authentication integration, or backend repository implementation. `src/admin/store.ts` implements a demo with browser-local storage and fixed fictional users. Public listing routes use `src/data/properties.ts`, not admin inventory.

GitHub access was available for this review. The execution environment was offline, and the Supabase plugin was not connected in this ChatGPT session. The existing project reference, schema, policies, storage and deployment environment could not be inspected. This change must not be described as a completed backend.

## Corrections in this change

- New immutable snapshots after mutations, preserved previous state on storage failure, and cross-tab invalidation.
- Role checks inside every existing write path. Record ownership comes from stored data, rather than a caller-supplied owner.
- Settings, resets, backups and imports restricted by role. Import validates schema versions, identifiers, foreign references, enums, dates and numeric bounds before replacement.
- Atomic bulk publication updates; a missing record does not leave a partially updated selection.
- Inquiry conversion is idempotent, rejects ambiguous duplicate matches, avoids blank-detail matches, preserves ambiguous budget text and translates public slugs into internal property IDs.
- Inquiry archiving preserves history. Qualification and conversion are separate states.
- Lead-to-deal conversion is idempotent and starts with no purchased units and no invented agreed amount.
- Explicit deal-unit editor and sequential transitions. Reservations require available individual units, source review and an agreed amount; reserved and completed transactions cannot be edited silently.
- Completion changes only agreed units and distinguishes sales from rentals. Lost reservations release their selected units.
- Unknown source bathrooms, title-deed status and citizenship eligibility are not inferred into the demo seed.
- Contact editing, duplicate review, explicit Istanbul input and demo upload limits.
- Production builds disable fixed demo sign-in unless explicitly opted in.
- Public WhatsApp drafts no longer write fictitious incoming inquiries into a visitor’s browser.

These are demo workflow and data-integrity improvements, not server security controls.

## Production backend completion map

| Area | Current gap | Required implementation and proof |
| --- | --- | --- |
| Authentication | Fixed demo accounts | Supabase Auth, invitations, recovery, logout/session refresh; role assigned server-side; prove disabled users lose access |
| Permissions | Browser-only checks | Database RLS and storage policies; admin/manager/agent/viewer tests using real JWTs; prove owner spoofing and role elevation fail |
| Staff | Static users | Profiles and active memberships linked to auth users; controlled role/assignment administration |
| Inventory | Local records, static public catalogue | Persist listing metadata, publication states, availability, projects and physical units separately; return only a public projection of published records |
| Publishing | Local preview only | Connect public list/detail/search to published data with caching/invalidation; prove edits, unpublishing and sold/rented availability on another browser |
| Enquiries | Manual demo entry; WhatsApp is external | Server submission endpoint with validation, abuse controls and idempotency; persist consent/source attribution; visitors must not read CRM records |
| CRM | Local contacts/leads/shortlists/activity | Persistent related entities, unique source inquiry links, assignment rules, atomic conversion and immutable server audit trail |
| Deals | Browser transaction simulation | Atomic reservation/completion functions with locks and unit constraints; concurrent reservation tests; reviewed reversals; currencies stay separate |
| Calendar/tasks | Local agenda | Persistent follow-ups, assignees and viewing times; conflict policy, cancellation, reminders and overdue queries |
| Media | Local base64 covers and static files | Storage buckets, signed private documents, public listing media, MIME/size validation, ownership and safe deletion; verify persistence beyond browser storage |
| CMS | Partial browser settings | Shared persisted settings and page/section content; all exposed controls must have consumers; revisions and publish/rollback |
| Currency | Browser feed, detached admin controls | Connect enable/manual-rate settings, validate provider results and timestamps, deduplicate refreshes, label indicative conversions |
| Analytics | Demo-derived metrics | Aggregate permitted persistent records; do not sum incompatible currencies; explicit pipeline and booked revenue definitions |
| Backup | JSON of local records | Project backup/restore process, media export, retention and restore drill; not a public service-key download |
| Operations | No live integration evidence | Environment separation, migrations, deployment config, logging, error reporting and health checks; never commit secrets |

## Proposed server permission contract to confirm against the client’s team

| Role | Listings/projects | CRM | Shared CMS | Staff/security |
| --- | --- | --- | --- | --- |
| Admin | Manage/publish | All assigned teams | Manage/publish | Manage roles, invites and controlled exports |
| Manager | Manage/publish | Team records and assignment | Manage/publish | No administrator role elevation |
| Agent | View approved inventory | Own assigned records, notes, tasks and viewings | Read-only | Own profile only |
| Viewer | Approved read-only views | Only explicitly authorized read-only records | Read-only | None |
| Anonymous visitor | Published public projection | Submit validated enquiry through protected endpoint; no CRM reads | Public published values only | None |

Authorization must be enforced in PostgreSQL/RLS or trusted server functions. Hiding a button is not permission enforcement. Agent reassignment, unassigned inquiries and manager team scope need explicit client rules.

## Data import requirements

Use the supplied Drive folder as a source manifest, not a production seed of fictional customers. Preserve source file ID, provenance and original currency/area basis. Keep unknown facts null. Separate developments, offers, packages and physical units so a package cannot sell or reserve unrelated inventory. Review duplicate offers, inconsistent prices and unanchored relative dates before publishing. Media rights and legal claims require client confirmation.

Do not import demo contacts, leads, deals, tasks or account passwords into production. Existing browser-local business records, if any, need an explicit reviewed import rather than a reset.

## Required acceptance checks before declaring completion

1. Apply reviewed versioned migrations to the identified project and generate database types.
2. Anonymous, agent, manager, viewer and disabled-user policy tests; test storage policies and direct API bypasses.
3. Create/update/publish/unpublish one listing and verify public list and detail from a separate browser.
4. Submit one real website enquiry, convert it twice, and prove only one contact/lead/opportunity link is created.
5. Run concurrent reservations against the same physical unit and prove only one succeeds.
6. Complete a sale and a rental without modifying shortlist alternatives; test cancellation and reviewed reversals.
7. Confirm uploads, contacts, tasks, viewings, CMS settings and assignments survive logout, refresh and use on another device.
8. Verify email/reminder providers only after configuration; no false “sent” messages.
9. Run production build, type checking, test suite, browser journeys and a backup restore drill in staging.
10. Record remaining failures and disabled/unconfigured controls. Do not call an unconnected demo a completed backend.

## Access needed to continue live work

Connect the existing Supabase project in this ChatGPT session and supply its project reference. Restore a running execution environment for installation, type checks, browser tests and local migration tests. Project reference and public URL are sufficient identifiers; do not paste a service-role key or database password into chat. Repository changes remain reviewable on a branch until the integration is verified.
