-- Extension request logs must never carry a reusable worker credential. Issue a
-- random single-use nonce, store only its hash, and expire it after 90 seconds.
alter table private.admin_security_worker add column nonce_hash text,add column nonce_expires_at timestamptz;
create function private.issue_admin_worker_nonce() returns text
language plpgsql security definer set search_path='' as $$
declare nonce text:=gen_random_uuid()::text||gen_random_uuid()::text;
begin
 update private.admin_security_worker set nonce_hash=encode(sha256(convert_to(nonce,'UTF8')),'hex'),nonce_expires_at=now()+interval '90 seconds';
 return nonce;
end $$;
revoke all on function private.issue_admin_worker_nonce() from public,anon,authenticated,service_role;
create or replace function private.admin_mail_worker_valid(p_key text) returns boolean
language plpgsql volatile security definer set search_path='' as $$
declare accepted boolean;
begin
 if length(p_key) is distinct from 72 then return false;end if;
 update private.admin_security_worker set nonce_hash=null,nonce_expires_at=null
 where singleton and nonce_expires_at>now() and nonce_hash=encode(sha256(convert_to(p_key,'UTF8')),'hex')
 returning true into accepted;
 return coalesce(accepted,false);
end $$;
create or replace function private.send_admin_security_alerts() returns bigint
language plpgsql security definer set search_path='' as $$
declare request_id bigint;nonce text;
begin
 nonce:=private.issue_admin_worker_nonce();
 select net.http_post(
  url:='https://ufcpvjhzitmxgitoaolx.supabase.co/functions/v1/admin-access',
  headers:=jsonb_build_object('Content-Type','application/json','X-Avrasya-Worker',nonce),
  body:='{"action":"deliver-alerts"}'::jsonb,timeout_milliseconds:=50000
 ) into request_id;
 return request_id;
end $$;
-- Invalidate the old static credential without changing the extension or scheduler.
update private.admin_security_worker set credential=gen_random_uuid()::text||gen_random_uuid()::text,nonce_hash=null,nonce_expires_at=null;
