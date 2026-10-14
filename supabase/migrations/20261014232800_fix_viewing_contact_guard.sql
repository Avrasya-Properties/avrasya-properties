-- A shared trigger must not bind lead-only fields for a viewing's row type.
create or replace function private.crm_guard() returns trigger language plpgsql set search_path='' as $$
declare contact_owner uuid;
begin
 if tg_table_name in ('leads','viewings','deals') and not private.manager() then
  select assigned_agent_id into contact_owner from public.contacts where id=new.contact_id;
  if contact_owner is distinct from auth.uid() then raise exception 'Contact is not assigned to you';end if;
 end if;
 -- Keep these as separate branches: SQL AND expressions can bind every field
 -- while planning, even when an earlier condition evaluates to false.
 if tg_table_name='leads' then
  if tg_op='UPDATE' then
   if new.deal_id is distinct from old.deal_id then raise exception 'Use Convert to deal to link an opportunity';end if;
  end if;
 end if;
 return new;
end $$;
revoke all on function private.crm_guard() from public,anon;
grant execute on function private.crm_guard() to authenticated;
notify pgrst,'reload schema';
