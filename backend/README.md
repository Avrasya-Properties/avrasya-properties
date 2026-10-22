# `backend/` is a legacy reference layer - do not run it against the live project

The production site does **not** import anything from this folder. The live backend is the SQL in
`supabase/migrations/` plus the Edge Functions in `supabase/functions/`, called from `src/` through
`src/lib/supabase.ts`, `src/admin/remote.ts` and `src/lib/public-enquiry.ts`.

Known mismatches with the live schema (verified by audit, October 2026):

- `jobs/exchange-rate.job.ts` filters `site_settings.id = 'default'` (the id is a UUID; the key is `singleton_key`) and writes an `exchange_rates` column that does not exist (the columns are `exchange_rate_eur/try/gbp`).
- `jobs/reservation-expiry.job.ts` inserts `audit_events(actor_user_id, entity_type, after_state)`; the real columns are `actor_id, target_table, new_values`. Use the RPC `public.expire_reservations` (service role) instead.
- `services/*` use table access that `20261011001126_admin_connection.sql` revoked for the browser roles.
- `config.ts` falls back to the anon key when `SUPABASE_SERVICE_ROLE_KEY` is missing, so jobs fail silently.

Nothing schedules reservation expiry, rent charges or exchange-rate sync today.
See `docs/SPEC-regions-and-redesign.md` for the plan and the hand-over notes for owner actions.