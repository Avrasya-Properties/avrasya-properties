CREATE OR REPLACE FUNCTION private.save_offer(p_data jsonb, p_version integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare old_row public.marketing_offers; r public.marketing_offers; wanted public.publication_status; snapshot jsonb;
begin
if not private.manager() then raise exception 'Manager access required' using errcode='42501'; end if;
if p_data->>'id' is not null then
select * into old_row from public.marketing_offers where id=(p_data->>'id')::uuid for update;
if not found then raise exception 'Offer not found'; end if;
if old_row.version is distinct from p_version then raise exception 'This offer changed. Refresh before saving' using errcode='40001'; end if;
if exists(select 1 from public.reservations where offer_id=old_row.id and status='active') and
((p_data->>'availability')::public.property_availability is distinct from old_row.availability or p_data->>'mode' is distinct from old_row.mode) then raise exception 'Reserved inventory requires a deal transition';end if;
else
old_row.id=gen_random_uuid();old_row.version=0;old_row.created_at=now();old_row.publication='Draft';old_row.availability='Unknown';old_row.mode='sale';old_row.city='Istanbul';old_row.side='unknown';old_row.price_basis='advertised';old_row.cbi_eligible=false;old_row.cbi_verified=false;old_row.claims_requiring_confirmation='{}';
end if;
-- Explicit fields prevent actor, verified-claim and snapshot forgery.
r=jsonb_populate_record(old_row,(select coalesce(jsonb_object_agg(key,value),'{}') from jsonb_each(p_data) where key=any(array['ref','slug','marketing_title','district','city','record_type','mode','layout_label','bathrooms','gross_m2','net_m2','area_m2','amount','currency','price_type','price_basis','availability','publication','assigned_agent_id','cover_image_path','description','source_note','side','tapu_status','project_id'])));
if nullif(trim(r.marketing_title),'') is null or nullif(trim(r.ref),'') is null or r.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then raise exception 'Title, reference and a valid slug are required'; end if;
if r.price_type<>'on-request' and (r.amount is null or r.currency is null) then raise exception 'Price and currency are required';end if;
if r.price_basis='installment_schedule' and r.currency is distinct from old_row.currency and old_row.version>0 then raise exception 'Confirm a new price basis before changing an instalment offer currency';end if;
wanted=r.publication;
r.version=old_row.version+1;r.updated_by=auth.uid();r.created_by=coalesce(old_row.created_by,auth.uid());r.updated_at=now();
if p_data ? 'gallery_images' then
 if jsonb_typeof(p_data->'gallery_images')<>'array' or jsonb_array_length(p_data->'gallery_images')>20 then raise exception 'Use up to 20 gallery photos';end if;
 if exists(select 1 from jsonb_array_elements_text(p_data->'gallery_images') value where length(value)>2048 or value !~ '^(https://|/images/)[^[:space:]]+$') then raise exception 'Use valid image links';end if;
 r.source_record=jsonb_set(coalesce(r.source_record,'{}'),'{details}',coalesce(r.source_record->'details','{}')||jsonb_build_object('gallery_images',p_data->'gallery_images'));
end if;
if p_data ? 'floor_plan' then
 if p_data->>'floor_plan' is not null and (length(p_data->>'floor_plan')>2048 or p_data->>'floor_plan' !~ '^(https://|/images/)[^[:space:]]+$') then raise exception 'Use a valid floor plan image link';end if;
 r.source_record=jsonb_set(coalesce(r.source_record,'{}'),'{details}',coalesce(r.source_record->'details','{}')||jsonb_build_object('floor_plan',p_data->'floor_plan'));
end if;
if wanted='Published' then
if nullif(trim(r.district),'') is null then raise exception 'Confirm the location before publishing';end if;
if nullif(trim(r.cover_image_path),'') is null then raise exception 'Select a cover image before publishing';end if;
snapshot=coalesce(r.source_record,'{}'::jsonb)||jsonb_build_object('id',r.id,'slug',r.slug,'marketing_title',r.marketing_title,'city',r.city,'location_label',r.district,'side',r.side,'record_type',r.record_type,'mode',r.mode,'layout_label',r.layout_label,
'price',(case when r.price_basis=old_row.price_basis then coalesce(r.source_record->'price','{}'::jsonb) else '{}'::jsonb end)||jsonb_build_object('amount',r.amount,'currency',r.currency,'basis',case when r.price_type='on-request' then 'on_request' when r.price_type='from' and r.price_basis='advertised' then 'from' else r.price_basis::text end,'status','staff-published'),
'areas',(select coalesce(jsonb_agg(x),'[]') from (select jsonb_build_object('value_m2',r.gross_m2,'basis','gross') x where r.gross_m2 is not null union all select jsonb_build_object('value_m2',r.net_m2,'basis','net') where r.net_m2 is not null union all select jsonb_build_object('value_m2',r.area_m2,'basis','unspecified') where r.area_m2 is not null) a),
'source_ids',coalesce(r.source_record->'source_ids','[]'::jsonb),'availability_verified',r.availability='Available',
'cover',r.cover_image_path,'availability',r.availability,
'details',coalesce(r.source_record->'details','{}'::jsonb)||jsonb_build_object('project',(select name from public.projects where id=r.project_id),'note',r.description,'cbi_verified',r.cbi_verified and r.cbi_eligible,'claims_requiring_confirmation',coalesce(to_jsonb(r.claims_requiring_confirmation),'[]')));
r.published_snapshot=snapshot;r.published_at=now();
end if;
if old_row.version=0 then insert into public.marketing_offers select (r).*;
else
if old_row.slug<>r.slug then insert into public.property_slug_redirects(old_slug,new_slug,target_offer_id) values(old_row.slug,r.slug,r.id) on conflict(old_slug) do update set new_slug=excluded.new_slug,target_offer_id=excluded.target_offer_id; end if;
update public.marketing_offers set ref=r.ref,slug=r.slug,marketing_title=r.marketing_title,district=r.district,city=r.city,record_type=r.record_type,mode=r.mode,layout_label=r.layout_label,bathrooms=r.bathrooms,gross_m2=r.gross_m2,net_m2=r.net_m2,area_m2=r.area_m2,amount=r.amount,currency=r.currency,price_type=r.price_type,price_basis=r.price_basis,availability=r.availability,publication=r.publication,assigned_agent_id=r.assigned_agent_id,cover_image_path=r.cover_image_path,description=r.description,source_note=r.source_note,source_record=r.source_record,side=r.side,tapu_status=r.tapu_status,project_id=r.project_id,version=r.version,published_snapshot=r.published_snapshot,published_at=r.published_at,updated_by=r.updated_by where id=r.id;
end if;
if wanted is distinct from old_row.publication or wanted='Published' then
insert into public.publication_history(offer_id,old_status,new_status,snapshot,changed_by) values(r.id,old_row.publication,wanted,r.published_snapshot,auth.uid());
end if;
return (select to_jsonb(saved) from public.marketing_offers saved where saved.id=r.id);
end $function$
