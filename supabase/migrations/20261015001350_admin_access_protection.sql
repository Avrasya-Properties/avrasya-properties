-- Private state; neither anonymous visitors nor staff can edit login counters.
create table private.admin_login_state (
 user_id uuid primary key references auth.users(id) on delete cascade,
 failures integer not null default 0 check(failures between 0 and 3),
 first_failed_at timestamptz, locked_at timestamptz, blocked_until timestamptz,
 attempt_id uuid, attempt_until timestamptz, recovery_requested_at timestamptz
);
create table private.admin_security_mail (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 recipient text not null, created_at timestamptz not null default now(),
 attempts integer not null default 0, retry_after timestamptz not null default now(),
 sent_at timestamptz, provider_id text, last_error text
);
alter table private.admin_login_state enable row level security;
alter table private.admin_security_mail enable row level security;
revoke all on private.admin_login_state,private.admin_security_mail from public,anon,authenticated;

create function private.admin_login_begin(p_email text,p_attempt uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid; st private.admin_login_state;
begin
 select id into uid from public.staff_profiles where lower(email)=lower(trim(p_email)) and is_active;
 if uid is null then return jsonb_build_object('unknown',true);end if;
 insert into private.admin_login_state(user_id) values(uid) on conflict do nothing;
 select * into st from private.admin_login_state where user_id=uid for update;
 if st.blocked_until>now() then return jsonb_build_object('blocked_until',st.blocked_until);end if;
 if st.attempt_until>now() then return jsonb_build_object('busy',true);end if;
 if st.first_failed_at<now()-interval '15 minutes' or st.blocked_until is not null then
  update private.admin_login_state set failures=0,first_failed_at=null,blocked_until=null,locked_at=null where user_id=uid;
 end if;
 update private.admin_login_state set attempt_id=p_attempt,attempt_until=now()+interval '30 seconds' where user_id=uid;
 return jsonb_build_object('user_id',uid,'email',(select email from public.staff_profiles where id=uid));
end $$;
create function private.admin_login_finish(p_user uuid,p_attempt uuid,p_valid boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare st private.admin_login_state; email_to text; alert_id uuid;
begin
 select * into st from private.admin_login_state where user_id=p_user for update;
 if st.attempt_id is distinct from p_attempt or st.attempt_until<now() then raise exception 'Login attempt expired. Try again.';end if;
 update private.admin_login_state set attempt_id=null,attempt_until=null where user_id=p_user;
 if st.blocked_until>now() then return jsonb_build_object('blocked_until',st.blocked_until);end if;
 if p_valid is null then return jsonb_build_object('retry',true);end if;
 if p_valid then update private.admin_login_state set failures=0,first_failed_at=null where user_id=p_user;return jsonb_build_object('ok',true);end if;
 update private.admin_login_state set failures=least(failures+1,3),first_failed_at=coalesce(first_failed_at,now()),
 locked_at=case when failures=2 then now() else locked_at end,
 blocked_until=case when failures=2 then now()+interval '15 minutes' else blocked_until end
 where user_id=p_user returning * into st;
 if st.failures=3 then
  select case when lower(email)='admin@avrasyaproperties.com' then 'info.avrasyaproperties@gmail.com' else email end into email_to from public.staff_profiles where id=p_user;
  insert into private.admin_security_mail(user_id,recipient) values(p_user,email_to) returning id into alert_id;
 end if;
 return jsonb_build_object('blocked_until',st.blocked_until,'alert_id',alert_id);
end $$;
create function private.admin_recovery_begin(p_email text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid; st private.admin_login_state; profile public.staff_profiles;
begin
 select * into profile from public.staff_profiles where lower(email)=lower(trim(p_email)) and is_active;
 uid:=profile.id;if uid is null then return jsonb_build_object('unknown',true);end if;
 insert into private.admin_login_state(user_id) values(uid) on conflict do nothing;
 select * into st from private.admin_login_state where user_id=uid for update;
 if st.recovery_requested_at>now()-interval '60 seconds' then return jsonb_build_object('throttled',true);end if;
 update private.admin_login_state set recovery_requested_at=now() where user_id=uid;
 return jsonb_build_object('user_id',uid,'email',profile.email,'recipient',case when lower(profile.email)='admin@avrasyaproperties.com' then 'info.avrasyaproperties@gmail.com' else profile.email end);
end $$;
create function private.admin_recovery_finish(p_user uuid) returns void
language sql security definer set search_path='' as $$
 update private.admin_login_state set failures=0,first_failed_at=null,locked_at=null,blocked_until=null,attempt_id=null,attempt_until=null where user_id=p_user;
$$;
create function private.admin_mail_claim() returns jsonb
language plpgsql security definer set search_path='' as $$
declare messages jsonb;
begin
 with selected as(select id from private.admin_security_mail where sent_at is null and retry_after<=now() and attempts<10 order by created_at limit 3 for update skip locked),
 claimed as(update private.admin_security_mail m set attempts=attempts+1,retry_after=now()+interval '2 minutes' from selected s where m.id=s.id returning m.id,m.recipient,m.created_at,m.attempts)
 select coalesce(jsonb_agg(to_jsonb(claimed)),'[]'::jsonb) into messages from claimed;return messages;
end $$;
create function private.admin_mail_finish(p_id uuid,p_provider text,p_error text) returns void
language sql security definer set search_path='' as $$
 update private.admin_security_mail set sent_at=case when p_provider is not null then now() else null end,
 provider_id=p_provider,last_error=left(p_error,500),retry_after=now()+make_interval(secs=>least(3600,60*(2^least(attempts,6))::integer)) where id=p_id and sent_at is null;
$$;
-- Keep existing staff sessions working during a block. A fresh direct Auth login
-- cannot access admin data while the account's server-side block is active.
create or replace function private.staff_role() returns public.staff_role
language sql stable security definer set search_path='' as $$
 select s.role from public.staff_profiles s join auth.users u on u.id=s.id
 where s.id=(select auth.uid()) and s.is_active and exists(
 select 1 from auth.sessions a where a.user_id=s.id and a.id::text=(select auth.jwt()->>'session_id')
 and not exists(select 1 from private.admin_login_state l where l.user_id=s.id and l.blocked_until>now() and a.created_at>=l.locked_at))
$$;
-- Service-only public transport wrappers. No user-controllable JWT metadata.
create function public.admin_login_begin(p_email text,p_attempt uuid) returns jsonb language sql security invoker set search_path='' as $$select private.admin_login_begin(p_email,p_attempt)$$;
create function public.admin_login_finish(p_user uuid,p_attempt uuid,p_valid boolean) returns jsonb language sql security invoker set search_path='' as $$select private.admin_login_finish(p_user,p_attempt,p_valid)$$;
create function public.admin_recovery_begin(p_email text) returns jsonb language sql security invoker set search_path='' as $$select private.admin_recovery_begin(p_email)$$;
create function public.admin_recovery_finish(p_user uuid) returns void language sql security invoker set search_path='' as $$select private.admin_recovery_finish(p_user)$$;
create function public.admin_mail_claim() returns jsonb language sql security invoker set search_path='' as $$select private.admin_mail_claim()$$;
create function public.admin_mail_finish(p_id uuid,p_provider text,p_error text) returns void language sql security invoker set search_path='' as $$select private.admin_mail_finish(p_id,p_provider,p_error)$$;
revoke all on function private.admin_login_begin(text,uuid),private.admin_login_finish(uuid,uuid,boolean),private.admin_recovery_begin(text),private.admin_recovery_finish(uuid),private.admin_mail_claim(),private.admin_mail_finish(uuid,text,text) from public,anon,authenticated;
revoke all on function public.admin_login_begin(text,uuid),public.admin_login_finish(uuid,uuid,boolean),public.admin_recovery_begin(text),public.admin_recovery_finish(uuid),public.admin_mail_claim(),public.admin_mail_finish(uuid,text,text) from public,anon,authenticated;
grant usage on schema private to service_role;
grant execute on function private.admin_login_begin(text,uuid),private.admin_login_finish(uuid,uuid,boolean),private.admin_recovery_begin(text),private.admin_recovery_finish(uuid),private.admin_mail_claim(),private.admin_mail_finish(uuid,text,text) to service_role;
grant execute on function public.admin_login_begin(text,uuid),public.admin_login_finish(uuid,uuid,boolean),public.admin_recovery_begin(text),public.admin_recovery_finish(uuid),public.admin_mail_claim(),public.admin_mail_finish(uuid,text,text) to service_role;
-- Optional native Auth hook covers password attempts made directly against Auth.
-- Activate this hook in the Supabase Auth settings after the migration is verified.
create function private.admin_password_verification(event jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid := (event->>'user_id')::uuid; st private.admin_login_state; attempt uuid; profile_email text; result jsonb;
begin
 select email into profile_email from public.staff_profiles where id=uid and is_active;
 if profile_email is null then return jsonb_build_object('decision','continue');end if;
 select * into st from private.admin_login_state where user_id=uid for update;
 if st.blocked_until>now() then return jsonb_build_object('decision','reject','message','Sign-in is blocked for 15 minutes. Use password recovery if needed.','should_logout_user',false);end if;
 -- The gateway serializes and records its own attempt after Auth returns.
 if st.attempt_until>now() then return jsonb_build_object('decision','continue');end if;
 attempt:=gen_random_uuid();result:=private.admin_login_begin(profile_email,attempt);
 if result ? 'user_id' then result:=private.admin_login_finish(uid,attempt,(event->>'valid')::boolean);end if;
 if result->>'blocked_until' is not null then return jsonb_build_object('decision','reject','message','Three incorrect passwords. Sign-in is blocked for 15 minutes.','should_logout_user',false);end if;
 return jsonb_build_object('decision','continue');
end $$;
create function public.admin_password_verification(event jsonb) returns jsonb
language sql security invoker set search_path='' as $$select private.admin_password_verification(event)$$;
revoke all on function private.admin_password_verification(jsonb),public.admin_password_verification(jsonb) from public,anon,authenticated,service_role;
grant usage on schema private to supabase_auth_admin;
grant execute on function private.admin_password_verification(jsonb),public.admin_password_verification(jsonb) to supabase_auth_admin;

create function private.admin_recovery_session(p_user uuid,p_session uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from auth.sessions a join public.staff_profiles s on s.id=a.user_id where a.user_id=p_user and a.id=p_session and s.is_active);
$$;
create function public.admin_recovery_session(p_user uuid,p_session uuid) returns boolean language sql security invoker set search_path='' as $$select private.admin_recovery_session(p_user,p_session)$$;
revoke all on function private.admin_recovery_session(uuid,uuid),public.admin_recovery_session(uuid,uuid) from public,anon,authenticated;
grant execute on function private.admin_recovery_session(uuid,uuid),public.admin_recovery_session(uuid,uuid) to service_role;
create index admin_security_mail_user_idx on private.admin_security_mail(user_id);
create index admin_security_mail_due_idx on private.admin_security_mail(retry_after,created_at) where sent_at is null and attempts<10;
create function private.admin_mail_status() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('pending',(select count(*) from private.admin_security_mail where sent_at is null and attempts<10),'needs_attention',(select count(*) from private.admin_security_mail where sent_at is null and attempts>=10));
$$;
create function public.admin_mail_status() returns jsonb language sql security invoker set search_path='' as $$select private.admin_mail_status()$$;
revoke all on function private.admin_mail_status(),public.admin_mail_status() from public,anon,authenticated;
grant execute on function private.admin_mail_status(),public.admin_mail_status() to service_role;
-- A private worker credential is generated in the database, never sent to the browser.
create table private.admin_security_worker(singleton boolean primary key default true check(singleton),credential text not null);
alter table private.admin_security_worker enable row level security;
revoke all on private.admin_security_worker from public,anon,authenticated,service_role;
insert into private.admin_security_worker(credential) values(gen_random_uuid()::text||gen_random_uuid()::text);
create function private.admin_mail_worker_valid(p_key text) returns boolean language sql stable security definer set search_path='' as $$
 select length(p_key)=72 and exists(select 1 from private.admin_security_worker where credential=p_key);
$$;
create function public.admin_mail_worker_valid(p_key text) returns boolean language sql security invoker set search_path='' as $$select private.admin_mail_worker_valid(p_key)$$;
revoke all on function private.admin_mail_worker_valid(text),public.admin_mail_worker_valid(text) from public,anon,authenticated;
grant execute on function private.admin_mail_worker_valid(text),public.admin_mail_worker_valid(text) to service_role;
create function private.send_admin_security_alerts() returns bigint language plpgsql security definer set search_path='' as $$
declare request_id bigint;
begin
 select net.http_post(
  url:='https://ufcpvjhzitmxgitoaolx.supabase.co/functions/v1/admin-access',
  headers:=jsonb_build_object('Content-Type','application/json','X-Avrasya-Worker',(select credential from private.admin_security_worker)),
  body:='{"action":"deliver-alerts"}'::jsonb,
  timeout_milliseconds:=50000
 ) into request_id;
 return request_id;
end $$;
revoke all on function private.send_admin_security_alerts() from public,anon,authenticated,service_role;
-- Supabase provides these extensions. Plain CI PostgreSQL does not; it checks
-- the worker's authorization separately rather than inventing an HTTP extension.
do $$begin
 if exists(select 1 from pg_available_extensions where name='pg_cron') and exists(select 1 from pg_available_extensions where name='pg_net') then
  execute 'create extension if not exists pg_cron';
  execute 'create extension if not exists pg_net';
  execute $sql$select cron.schedule('avrasya-security-alerts','* * * * *','select private.send_admin_security_alerts()')$sql$;
 end if;
end$$;
-- The team editor already keeps sign-in email read-only; enforce that on direct
-- browser API updates too, so profile and Auth identities cannot drift apart.
create function private.guard_staff_login_email() returns trigger language plpgsql set search_path='' as $$
begin
 if new.email is distinct from old.email then raise exception 'Sign-in email must be changed through Authentication, together with the team record.' using errcode='23514';end if;
 return new;
end $$;
revoke all on function private.guard_staff_login_email() from public,anon,authenticated;
create trigger guard_staff_login_email before update on public.staff_profiles for each row when(current_user='authenticated') execute function private.guard_staff_login_email();
