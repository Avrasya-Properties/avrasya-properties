-- Restrict extension-default grants without changing or recreating pg_net.
-- Worker request headers carry a private credential; browsers must not read them.
do $$begin
 if to_regclass('net.http_request_queue') is not null then
  execute 'revoke all on net.http_request_queue from public,anon,authenticated';
 end if;
end$$;
-- Rotate the worker credential after closing the request-queue grants. The Edge
-- worker verifies it against this private table, so no external configuration changes.
update private.admin_security_worker set credential=gen_random_uuid()::text||gen_random_uuid()::text;
