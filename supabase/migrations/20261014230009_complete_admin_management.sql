-- Add management controls without changing listings, publication, or past payments.
alter table public.site_settings add column website_design jsonb not null default '{}'::jsonb
  check (jsonb_typeof(website_design)='object');
create function private.guard_website_design() returns trigger language plpgsql set search_path='' as $$
begin
 if exists(select 1 from jsonb_each(new.website_design) e where jsonb_typeof(e.value)<>'string' or length(e.value#>>'{}')>4000
 or (e.key in('logoDark','logoLight','heroMain','heroAlt','footerImage') and e.value#>>'{}'<>'' and e.value#>>'{}' !~ '^(https://|/images/)[^[:space:]]+$')) then raise exception 'Use normal text and safe image links in website appearance';end if;
 return new;
end $$;
revoke all on function private.guard_website_design() from public,anon,authenticated;
create trigger guard_website_design before insert or update on public.site_settings for each row execute function private.guard_website_design();
-- These older tables lacked a revision, so a stale edit could silently overwrite a colleague.
do $$declare name text;begin
 foreach name in array array['amenities','offer_amenities','pricing_options','instalment_schedules','package_memberships','payment_milestones','contact_shortlists','rent_charges','rental_deposits','vendors'] loop
 execute format('alter table public.%I add column updated_at timestamptz not null default now()',name);
 execute format('create trigger record_updated before insert or update on public.%I for each row execute function private.touch_record()',name);
 end loop;
end $$;

-- Enrich only the approved public snapshot, using explicit public fields.
-- No contacts, supplier records, team assignments, or private metadata enter it.
create function private.enrich_public_offer() returns trigger language plpgsql security definer set search_path='' as $$
declare project public.projects; unit public.physical_units; features jsonb; plans jsonb; members jsonb;
begin
 if new.publication<>'Published' or new.published_snapshot is null then return new; end if;
 select * into project from public.projects where id=new.project_id;
 select * into unit from public.physical_units where id=new.physical_unit_id;
 select coalesce(jsonb_agg(a.name order by a.name),'[]') into features
 from public.offer_amenities x join public.amenities a on a.id=x.amenity_id where x.offer_id=new.id;
 select coalesce(jsonb_agg(jsonb_build_object('name',p.option_name,'amount',p.amount,'currency',p.currency,'basis',p.basis,
 'down_payment_amount',p.down_payment_amount,'down_payment_percent',p.down_payment_percent,
 'delivery_payment_amount',p.delivery_payment_amount,'delivery_payment_percent',p.delivery_payment_percent,
 'installment_amount',p.installment_amount,'installment_count',p.installment_count,
 'schedule',(select coalesce(jsonb_agg(jsonb_build_object('number',s.installment_no,'date',s.due_date,'month',s.due_month_offset,'amount',s.amount,'currency',s.currency) order by s.installment_no),'[]') from public.instalment_schedules s where s.pricing_option_id=p.id)) order by p.is_default desc,p.option_name),'[]') into plans
 from public.pricing_options p where p.offer_id=new.id;
 select coalesce(jsonb_agg(jsonb_build_object('description',x.share_description,'title',case when m.publication='Published' then m.marketing_title else null end) order by x.id),'[]') into members
 from public.package_memberships x left join public.marketing_offers m on m.id=x.member_offer_id where x.package_offer_id=new.id;
 new.published_snapshot=jsonb_set(new.published_snapshot,'{details}',coalesce(new.published_snapshot->'details','{}')||jsonb_build_object(
 'project',project.name,'developer',(select name from public.developers where id=project.developer_id),
 'delivery',coalesce(project.delivery_date::text,project.delivery_month_year,project.delivery_relative),
 'floor',unit.floor,'bedrooms',unit.bedrooms,'amenities',features,'pricing_options',plans,'package_members',members));
 return new;
end $$;
revoke all on function private.enrich_public_offer() from public,anon,authenticated;
create trigger enrich_public_offer before insert or update on public.marketing_offers for each row execute function private.enrich_public_offer();

create function private.refresh_related_public_offers() returns trigger language plpgsql security definer set search_path='' as $$
declare prior jsonb=case when tg_op<>'INSERT' then to_jsonb(old) else '{}' end;
 current_record jsonb=case when tg_op<>'DELETE' then to_jsonb(new) else '{}' end; targets uuid[];
begin
 if tg_table_name='projects' then
 select array_agg(id) into targets from public.marketing_offers where project_id in ((prior->>'id')::uuid,(current_record->>'id')::uuid);
 elsif tg_table_name='developers' then
 select array_agg(m.id) into targets from public.marketing_offers m join public.projects p on p.id=m.project_id where p.developer_id in ((prior->>'id')::uuid,(current_record->>'id')::uuid);
 elsif tg_table_name='physical_units' then
 select array_agg(id) into targets from public.marketing_offers where physical_unit_id in ((prior->>'id')::uuid,(current_record->>'id')::uuid);
 -- The unit is authoritative for availability; reservation and sale guards still apply.
 update public.marketing_offers set availability=new.status,version=version+1 where id=any(targets) and availability is distinct from new.status;
 elsif tg_table_name='amenities' then
 select array_agg(offer_id) into targets from public.offer_amenities where amenity_id in ((prior->>'id')::uuid,(current_record->>'id')::uuid);
 elsif tg_table_name='instalment_schedules' then
 select array_agg(offer_id) into targets from public.pricing_options where id in ((prior->>'pricing_option_id')::uuid,(current_record->>'pricing_option_id')::uuid);
 elsif tg_table_name='package_memberships' then targets=array[(prior->>'package_offer_id')::uuid,(current_record->>'package_offer_id')::uuid];
 else targets=array[(prior->>'offer_id')::uuid,(current_record->>'offer_id')::uuid];end if;
 update public.marketing_offers set published_snapshot=published_snapshot where id=any(targets) and publication='Published';
 return null;
end $$;
revoke all on function private.refresh_related_public_offers() from public,anon,authenticated;
create trigger public_related_changed after update on public.projects for each row execute function private.refresh_related_public_offers();
create trigger public_related_changed after update on public.developers for each row execute function private.refresh_related_public_offers();
create trigger public_related_changed after update on public.physical_units for each row execute function private.refresh_related_public_offers();
create trigger public_related_changed after update on public.amenities for each row execute function private.refresh_related_public_offers();
create trigger public_related_changed after insert or update or delete on public.offer_amenities for each row execute function private.refresh_related_public_offers();
create trigger public_related_changed after insert or update or delete on public.pricing_options for each row execute function private.refresh_related_public_offers();
create trigger public_related_changed after insert or update or delete on public.instalment_schedules for each row execute function private.refresh_related_public_offers();
create trigger public_related_changed after insert or update or delete on public.package_memberships for each row execute function private.refresh_related_public_offers();

-- Managers may maintain deal documents and payment schedules. Receipts remain immutable.
create policy manager_insert on public.document_checklists for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.document_checklists for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.document_checklists to authenticated;
create policy manager_insert on public.payment_milestones for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.payment_milestones for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.payment_milestones to authenticated;
create function private.guard_payment_schedule() returns trigger language plpgsql set search_path='' as $$
declare paid numeric;
begin
 if new.expected_amount<=0 then raise exception 'Expected payment must be positive';end if;
 if tg_op='UPDATE' and (new.deal_id<>old.deal_id or new.currency<>old.currency) and exists(select 1 from public.recorded_payments where milestone_id=old.id) then raise exception 'A schedule with receipts cannot change deal or currency';end if;
 select coalesce(sum(case when is_reversal then -amount else amount end),0) into paid from public.recorded_payments where milestone_id=new.id;
 new.status=case when paid>=new.expected_amount then 'paid' when paid>0 then 'partial' when new.due_date<current_date then 'overdue' else 'pending' end;
 return new;
end $$;
revoke all on function private.guard_payment_schedule() from public,anon,authenticated;
create trigger guard_payment_schedule before insert or update on public.payment_milestones for each row execute function private.guard_payment_schedule();
create function private.guard_deal_document() returns trigger language plpgsql set search_path='' as $$
begin
 if new.status='verified' then
 if tg_op='INSERT' or old.status is distinct from new.status then new.verified_by=auth.uid();new.verified_at=now();
 else new.verified_by=old.verified_by;new.verified_at=old.verified_at;end if;
 else new.verified_by=null;new.verified_at=null;end if;
 return new;
end $$;
revoke all on function private.guard_deal_document() from public,anon,authenticated;
create trigger guard_deal_document before insert or update on public.document_checklists for each row execute function private.guard_deal_document();

create function private.refresh_payment_milestone(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare paid numeric;
begin
 if p_id is null then return;end if;
 select coalesce(sum(case when is_reversal then -amount else amount end),0) into paid from public.recorded_payments where milestone_id=p_id;
 update public.payment_milestones set status=case when paid>=expected_amount then 'paid' when paid>0 then 'partial' when due_date<current_date then 'overdue' else 'pending' end where id=p_id;
end $$;
revoke all on function private.refresh_payment_milestone(uuid) from public,anon,authenticated;
create function private.record_payment(p_data jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare receipt public.recorded_payments; prior public.recorded_payments; milestone public.payment_milestones;
begin
 if not private.manager() then raise exception 'Manager access required' using errcode='42501';end if;
 receipt.deal_id=(p_data->>'deal_id')::uuid;receipt.milestone_id=nullif(p_data->>'milestone_id','')::uuid;
 receipt.payment_reference=trim(p_data->>'payment_reference');receipt.amount=(p_data->>'amount')::numeric;
 receipt.currency=(p_data->>'currency')::public.currency_code;receipt.payment_date=(p_data->>'payment_date')::date;
 receipt.payment_method=trim(p_data->>'payment_method');receipt.notes=p_data->>'notes';
 if receipt.amount is null or receipt.amount<=0 or receipt.currency is null or receipt.payment_date is null or length(coalesce(receipt.payment_reference,'')) not between 1 and 200 or length(coalesce(receipt.payment_method,'')) not between 1 and 100 then raise exception 'Enter a positive amount, currency, date, payment reference and method';end if;
 perform 1 from public.deals where id=receipt.deal_id for update;if not found then raise exception 'Deal not found';end if;
 select * into prior from public.recorded_payments where deal_id=receipt.deal_id and payment_reference=receipt.payment_reference and not is_reversal;
 if found then
 if prior.amount is distinct from receipt.amount or prior.currency is distinct from receipt.currency or prior.milestone_id is distinct from receipt.milestone_id or prior.payment_date is distinct from receipt.payment_date or prior.payment_method is distinct from receipt.payment_method then raise exception 'This payment reference already records different details';end if;return prior.id;end if;
 if receipt.milestone_id is not null then
 select * into milestone from public.payment_milestones where id=receipt.milestone_id for update;
 if not found or milestone.deal_id<>receipt.deal_id or milestone.currency<>receipt.currency then raise exception 'Choose a payment schedule for this deal in the same currency';end if;end if;
 insert into public.recorded_payments(deal_id,milestone_id,payment_reference,amount,currency,payment_date,payment_method,notes,recorded_by)
 values(receipt.deal_id,receipt.milestone_id,receipt.payment_reference,receipt.amount,receipt.currency,receipt.payment_date,receipt.payment_method,receipt.notes,auth.uid()) returning id into receipt.id;
 perform private.refresh_payment_milestone(receipt.milestone_id);return receipt.id;
end $$;
create function public.record_payment(p_data jsonb) returns uuid language sql security invoker set search_path='' as $$select private.record_payment(p_data)$$;
revoke all on function private.record_payment(jsonb),public.record_payment(jsonb) from public,anon;
grant execute on function private.record_payment(jsonb),public.record_payment(jsonb) to authenticated;
create function private.reverse_payment(p_id uuid,p_reason text) returns uuid language plpgsql security definer set search_path='' as $$
declare payment public.recorded_payments; prior uuid; result uuid;
begin
 if not private.manager() then raise exception 'Manager access required' using errcode='42501';end if;
 if length(trim(coalesce(p_reason,''))) not between 5 and 2000 then raise exception 'Enter the reason for reversing this receipt';end if;
 -- Match receipt creation lock order: deal, receipt, then schedule.
 perform 1 from public.deals where id=(select deal_id from public.recorded_payments where id=p_id) for update;
 select * into payment from public.recorded_payments where id=p_id for update;
 if not found or payment.is_reversal then raise exception 'Choose an original receipt';end if;
 select id into prior from public.recorded_payments where reversal_for_id=p_id;if found then return prior;end if;
 if payment.milestone_id is not null then perform 1 from public.payment_milestones where id=payment.milestone_id for update;end if;
 insert into public.recorded_payments(deal_id,milestone_id,payment_reference,amount,currency,payment_date,payment_method,is_reversal,reversal_for_id,notes,recorded_by)
 values(payment.deal_id,payment.milestone_id,'Reversal: '||payment.payment_reference,payment.amount,payment.currency,current_date,payment.payment_method,true,payment.id,p_reason,auth.uid()) returning id into result;
 perform private.refresh_payment_milestone(payment.milestone_id);return result;
end $$;
create function public.reverse_payment(p_id uuid,p_reason text) returns uuid language sql security invoker set search_path='' as $$select private.reverse_payment(p_id,p_reason)$$;
revoke all on function private.reverse_payment(uuid,text),public.reverse_payment(uuid,text) from public,anon;
grant execute on function private.reverse_payment(uuid,text),public.reverse_payment(uuid,text) to authenticated;

-- Removing a feature/link/plan must also remove it from the public listing.
do $$declare name text;begin
 foreach name in array array['offer_amenities','pricing_options','instalment_schedules','package_memberships','contact_shortlists'] loop
 execute format('create policy manager_delete on public.%I for delete to authenticated using ((select private.manager()))',name);
 execute format('grant delete on public.%I to authenticated',name);
 end loop;
end $$;
notify pgrst,'reload schema';
