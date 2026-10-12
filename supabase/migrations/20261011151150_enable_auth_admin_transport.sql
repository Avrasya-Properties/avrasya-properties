-- The user now explicitly requests creation of admin@avrasyaproperties.com through Supabase Auth.
-- Read-only checks confirmed pg_net is not installed, so no existing net service is affected.
-- Enable only the documented HTTP transport for the Auth Admin API; change no existing grants or policies.
create extension if not exists pg_net;
