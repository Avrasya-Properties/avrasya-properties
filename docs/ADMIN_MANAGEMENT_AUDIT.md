# Admin management audit

This repair keeps the current website design and existing data. It adds controls to the existing database rather than creating another browser-only store.

| Area | Management and website connection |
| --- | --- |
| Properties | Existing details, prices, gallery, floor plan, publish/unpublish and shared website preview remain in use. Related features, plans and package contents have direct management links. |
| Developments | Registered developments appear even with no listings. Add and Edit controls lead to the registered records. Renaming a development or changing delivery information refreshes already published listings. |
| Developers and apartments | Developer names, floor and bedroom information reach public details. Apartment availability follows the linked unit. Reserved and closed identity/availability still require a deal transition. |
| Features and plans | Add/edit/remove listing features, payment alternatives, instalment dates and amounts, and package members. Related edits refresh the approved public snapshot and its cross-device revision. |
| Buyers | Existing contacts and lead conversion remain. Buyer requirements and separate shortlists can be maintained; a shortlist does not select purchased units. |
| Tasks and viewings | Existing creation/status controls remain. Edit controls update details and preserve Istanbul time. |
| Deals | Existing ordered transitions and selected-unit protections remain. Links open documents, payment schedules, receipts and commissions. |
| Receipts | Record a real received payment against a deal and optional matching-currency schedule. Retries do not duplicate it. Original receipts cannot be edited/deleted; Record reversal keeps the original and updates the schedule. |
| Commissions | Managers can record agent allocations and their review/payment status independently of a deal's stage. |
| Rentals | Lease creation now includes required deposit fields. Managers can maintain lease terms, charges, deposits, providers and maintenance. Deal completion remains responsible for Sold/Rented inventory. |
| Website appearance | Save logos, two homepage photos/titles, footer description and optional footer image. Defaults preserve the existing branding. The preloader opacity control now affects the skyline. |
| Pages | Existing content-page and section editing now also covers privacy, terms, cookies and investment disclaimer. Draft custom content leaves the original template in place. Published content replaces that page's body; the layout/header/footer stay shared. |
| Services and questions | Existing publish/order/edit controls stay connected to public queries. |
| Brochures | Upload a PDF or use an HTTPS download link. Full HTTPS URLs remain exact links; Storage-relative paths are resolved through the public marketing bucket. |
| Histories and sources | Price, availability, publication, imports and audit history stay view-only. Source review shows the extracted details. Review is not automatic publication or verification of supplier claims. |
| Permissions | Admin/manager write rules remain server-enforced. View-only users cannot mutate records or create receipts. Customer/financial tables stay private. Older editable tables gain revision checks to reject stale saves. |

## Verification

The workflow runs the complete migration chain in disposable PostgreSQL, existing permissions/transaction checks, new management SQL checks, frontend tests, build and type checking, existing admin/mobile journeys and expanded persistent browser journeys. These exercise real saved records and anonymous website reads; they do not write test records to production.

The new persistent viewing check found an existing shared-trigger bug: it bound a lead-only `deal_id` field for viewing rows. A separate migration fixes that trigger without relaxing contact assignment checks. Managed WhatsApp links also preserve an existing phone query instead of adding a second question mark.

The additive migration must be applied before releasing the new frontend. It does not publish drafts, reset accounts, replace existing content, or alter existing receipt amounts. Newly added appearance settings default to the original assets.

## Deployment checks

Repository and isolated browser checks do not identify which revision a separately hosted Lovable preview or public domain is serving. Publish the merged version in Lovable and verify the actual URL. Public enquiry submission still depends on the deployment's allowed-origin configuration; Auth recovery depends on its approved redirect URLs and mail settings. These deployment settings are separate from saving and publishing properties.

The live Supabase security review found no new database permission warnings. It still reports [leaked-password protection disabled](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), an Auth dashboard setting. The rate-limit table intentionally has no visitor/staff access policy because it is server-only.
