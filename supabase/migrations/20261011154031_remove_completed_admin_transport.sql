-- Remove the unused transport enabled only for the completed one-time administrator setup.
-- It was absent before this session. RESTRICT preserves any new external dependency.
drop extension if exists pg_net restrict;
