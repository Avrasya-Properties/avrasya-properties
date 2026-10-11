# Using the Avrasya workspace

Sign in at /admin/login with admin@avrasyaproperties.com and the password supplied privately by the owner. Production uses Supabase Auth, not demo credentials.

| Role | What the workspace is for |
| --- | --- |
| Administrator | All listings, website content, client work, exports and team access. Create and disable staff accounts. |
| Office manager | Run daily operations, edit listings and website content, manage contacts, deals, viewings, leases and maintenance. Cannot create accounts or change team access. |
| Agent | Work with assigned buyers, contacts, deals, viewings and tasks. Cannot publish listings or edit website content. |
| View only | Read available information without changing it. |

These are access levels within one workspace. Separate portals are unnecessary until there is a specific customer or tenant workflow.

## Listings
Review imported drafts before publishing. Edit property details, location, price and currency. Add a cover, gallery and floor-plan image. Save changes before linking a registered apartment. Public pages use the published snapshot; unpublish a listing to remove it from public browsing.

An offer may describe a property type or investment package rather than a specific apartment. Link a real registered apartment before reserving or completing a deal. A completed sale/rental updates the selected apartment's availability but does not imply a payment was received.

## Website content
Website settings contains company details, homepage text, contact information and exchange rates. Website and team contains pages, sections, services, questions and answers and brochures.
Create a supported website page, add sections, enter plain paragraphs and optionally show a contact form. Set the page to Published when ready. Draft pages are not public. Services and questions have their own Published switch.

Uploaded marketing images must be genuine client-approved images. Link brochures to approved public downloads. Production has no stock-image picker.

## Client work
Read incoming enquiries, assign a staff member and create a buyer enquiry when needed. Contacts hold people and their details. Deals track agreed transactions; viewings track visits; tasks track follow-up work. Leases and maintenance support rental management. Recorded payments are read-only records; this is not a payment gateway or accounting application.

## Accounts and records
Only an administrator can create team accounts. Disable departed staff to remove access. Export records before maintenance; exports do not include linked files and are not full database backups. Live restore and reset are disabled.

No fictional live staff accounts or client records were added. The imported client offers were preserved. The confirmed placeholder licence number was removed. Demo builds are separate browser-only previews, enabled explicitly with VITE_ENABLE_ADMIN_DEMO=true; their records never become production accounts.

## Remaining deployment checks
Set the real website origin for enquiry submission and Auth redirects. Verify password recovery email delivery using the deployed website. See BACKEND_DEPLOYMENT.md. Automated fixtures test behavior in isolation and do not prove hosted email delivery.
