-- Remove only duplicate, non-constraint indexes introduced by admin_connection.
-- Equivalent original indexes and the rate-limit unique constraint remain in place.
set local lock_timeout = '5s';
drop index if exists public.contacts_agent_idx;
drop index if exists public.deals_agent_idx;
drop index if exists public.enquiries_created_idx;
drop index if exists public.leads_agent_idx;
drop index if exists public.rate_limit_unique_window;
drop index if exists public.tasks_assignee_idx;
drop index if exists public.viewings_agent_idx;
