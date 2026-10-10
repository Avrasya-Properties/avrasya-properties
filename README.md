# Avrasya Properties

TanStack Start / React / TypeScript website and an administrative workspace.

**Backend status:** the current admin stores records in browser localStorage. It has no production authentication, shared database, server authorization, persistent upload service, or public listing publishing API. Role controls demonstrate workflow behavior; they do not secure customer data. See [the backend audit](docs/BACKEND_AUDIT.md) for the verified gaps and completion checks.

The public catalogue currently reads source files in `src/data/`. Admin inventory changes do not update that catalogue. Website contact settings can be previewed in the same browser. Public consultation forms open WhatsApp drafts for visitors to review and send; a WhatsApp click is not proof that an enquiry was delivered.

## Development

```sh
bun install --frozen-lockfile
bun run dev
bun run test
bun run build
bun run typecheck
```

Demo sign-in is enabled during development. A production preview must explicitly opt in with `VITE_ENABLE_ADMIN_DEMO=true` at build time. Leave it false/unset on a production deployment. There is no production sign-in replacement yet.

Use fictional information in the demo. Browser backups contain personal records and embedded cover images but do not copy linked external images, PDFs or videos. Keep backups private.

## Administration

- Listing editing and publication checklists, with availability tracked separately.
- Manual enquiry logging and duplicate-safe conversion to leads.
- Lead requirements, shortlists, activity and conversion to opportunities.
- Contacts, tasks and viewings using Istanbul calendar input.
- Deal agreements with explicit units, amounts and stages. A shortlist is not a purchase agreement.
- Demo website settings and validated, administrator-only backup/restore.

Unknown source facts remain unknown. An asking price alone does not verify citizenship eligibility, and source records are not independent legal/title/availability verification.

## Checks

`.github/workflows/admin-checks.yml` runs the regression suite, a production build and type checking on pull requests. The browser smoke script exercises admin sign-in, contacts, inventory, inquiry-to-deal conversion, selected-unit completion, calendar/tasks and viewer restrictions. A passing build confirms compilation/bundling; live Supabase policies, migrations, authentication, shared persistence and cross-device publishing still require their own integration tests.
