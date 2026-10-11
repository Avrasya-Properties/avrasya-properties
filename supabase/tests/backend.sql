\set ON_ERROR_STOP on
begin;
create schema test;
create function test.ok(condition boolean,label text) returns void language plpgsql as $$begin if condition is distinct from true then raise exception 'FAILED: %',label;end if;raise notice 'PASS: %',label;end$$;
create function test.denied(statement text,label text) returns void language plpgsql security invoker as $$begin begin execute statement;exception when insufficient_privilege or check_violation or raise_exception or serialization_failure or foreign_key_violation or unique_violation then raise notice 'PASS: % (%)',label,sqlerrm;return;end;raise exception 'FAILED: expected denial: %',label;end$$;
grant usage on schema test to anon,authenticated,service_role;
grant execute on all functions in schema test to anon,authenticated,service_role;
insert into auth.users(id) select ('00000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid from generate_series(1,6) i;
insert into auth.sessions(id,user_id) select ('00000000-0000-4000-8000-'||lpad((100+i)::text,12,'0'))::uuid,('00000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid from generate_series(1,6) i;
insert into public.staff_profiles(id,email,name,role,is_active) values
('00000000-0000-4000-8000-000000000001','owner@example.test','Owner','admin',true),
('00000000-0000-4000-8000-000000000002','manager@example.test','Manager','manager',true),
('00000000-0000-4000-8000-000000000003','agent@example.test','Agent','agent',true),
('00000000-0000-4000-8000-000000000004','other@example.test','Other agent','agent',true),
('00000000-0000-4000-8000-000000000005','viewer@example.test','Viewer','viewer',true),
('00000000-0000-4000-8000-000000000006','inactive@example.test','Inactive','agent',false);
insert into site_settings(singleton_key) values('default');
insert into contacts(id,name,assigned_agent_id) values
('00000000-0000-4000-8000-000000001001','Assigned buyer','00000000-0000-4000-8000-000000000003'),
('00000000-0000-4000-8000-000000001002','Other buyer','00000000-0000-4000-8000-000000000004');
insert into physical_units(id,unit_number,status) values
('00000000-0000-4000-8000-000000002001','A-21','Available'),
('00000000-0000-4000-8000-000000002002','A-22','Available');
set local role anon;
select test.denied('select * from contacts','Anonymous cannot read contacts');
select test.denied('insert into enquiries(ref_number,name,email,phone,topic,message,source) values(''fake'',''Fake'',''fake@example.test'',''1234567'',''Test'',''Message'',''Website'')','Anonymous cannot bypass submission endpoint');
select test.denied('select public.publish_offer_atomic(null,null)','Legacy publication bypass is revoked');
select test.denied('select public.convert_enquiry_to_lead(null,null)','Legacy conversion bypass is revoked');
select test.denied('select public.create_reservation_atomic(null,null,null,null,null,null,null,72)','Legacy reservation bypass is revoked');
select test.ok((select count(*) from published_catalogue())=0,'No drafts in public catalogue');
reset role;
select set_config('request.jwt.claims','{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000005","session_id":"00000000-0000-4000-8000-000000000105"}',true);
set local role authenticated;
select test.ok((select count(*) from contacts)=2,'Viewer can read CRM');
select test.denied('insert into contacts(name) values(''Nope'')','Viewer cannot create contacts');
select test.denied('select save_offer(''{"ref":"NO","slug":"no","marketing_title":"No"}'',null)','Viewer cannot use write RPC');
reset role;
select set_config('request.jwt.claims','{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000003","session_id":"00000000-0000-4000-8000-000000000103"}',true);
set local role authenticated;
select test.ok((select count(*) from contacts)=1,'Agent reads only assigned contacts');
select test.ok((select name from contacts limit 1)='Assigned buyer','Agent cannot see another advisor buyer');
select test.denied('insert into leads(contact_id,assigned_agent_id) values(''00000000-0000-4000-8000-000000001002'',''00000000-0000-4000-8000-000000000003'')','Agent cannot attach another advisor contact');
select test.denied('insert into staff_profiles(id,email,name,role) values(gen_random_uuid(),''a@b.test'',''Self promotion'',''admin'')','Agent cannot promote themselves');
select test.denied('select save_offer(''{}'',null)','Agent cannot edit inventory through RPC');
reset role;
select set_config('request.jwt.claims','{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000002","session_id":"00000000-0000-4000-8000-000000000102"}',true);
set local role authenticated;
select save_offer('{"ref":"TEST-1","cover_image_path":"/images/test.jpg","slug":"verified-unit","marketing_title":"Verified unit","district":"Istanbul","city":"Istanbul","record_type":"unit_offer","mode":"sale","price_type":"fixed","amount":420000,"currency":"USD","availability":"Available","publication":"Published"}',null);
select test.ok((select count(*) from published_catalogue())=1,'Manager publication creates one public snapshot');
select save_offer(jsonb_build_object('id',(select id from marketing_offers where ref='TEST-1'),'gallery_images',jsonb_build_array('https://approved.example/photo.jpg'),'floor_plan','https://approved.example/plan.jpg'),(select version from marketing_offers where ref='TEST-1'));
select test.ok((select source_record->'details'->'gallery_images'->>0 from marketing_offers where ref='TEST-1')='https://approved.example/photo.jpg','Listing gallery is saved');
select test.ok((select published_snapshot->'details'->>'floor_plan' from marketing_offers where ref='TEST-1')='https://approved.example/plan.jpg','Published floor plan follows saved listing');
select test.denied(format('select save_offer(%L::jsonb,%s)',jsonb_build_object('id',(select id from marketing_offers where ref='TEST-1'),'gallery_images',jsonb_build_array('javascript:alert(1)')),(select version from marketing_offers where ref='TEST-1')),'Unsafe gallery links rejected');

select test.denied(format('select save_offer(%L::jsonb,0)',jsonb_build_object('id',(select id from marketing_offers where ref='TEST-1'),'marketing_title','Stale edit')),'Stale offer edits are rejected');
select link_physical_unit((select id from marketing_offers where ref='TEST-1'),'00000000-0000-4000-8000-000000002001',(select version from marketing_offers where ref='TEST-1'));
insert into leads(id,contact_id,assigned_agent_id,stage,shortlist) values('00000000-0000-4000-8000-000000003001','00000000-0000-4000-8000-000000001001','00000000-0000-4000-8000-000000000003','Qualified',array[(select id from marketing_offers where ref='TEST-1')]);
select convert_lead('00000000-0000-4000-8000-000000003001');
select test.ok((select count(*) from deals where lead_id='00000000-0000-4000-8000-000000003001')=1,'Lead conversion creates one opportunity');
select convert_lead('00000000-0000-4000-8000-000000003001');
select test.ok((select count(*) from deals)=1,'Lead conversion is idempotent');
select test.ok((select count(*) from deal_selected_units)=0,'Shortlist does not select purchased units');
select test.denied('select transition_deal('''||(select id from deals)::text||''',''Won'',1)','Cannot skip transaction stages');
select save_deal(jsonb_build_object('id',(select id from deals),'total_amount',420000,'currency','USD'),(select version from deals),array[(select id from marketing_offers where ref='TEST-1')]);
select transition_deal((select id from deals),'Offer Prepared',(select version from deals));
select transition_deal((select id from deals),'Offer Accepted',(select version from deals));
select transition_deal((select id from deals),'Reserved',(select version from deals));
select test.ok((select status from physical_units where unit_number='A-21')='Reserved','Selected unit is reserved');
select test.ok((select status from physical_units where unit_number='A-22')='Available','Unselected unit stays available');
select test.denied('update physical_units set status=''Available'' where unit_number=''A-21''','Direct API cannot release reserved unit');
select transition_deal((select id from deals),'Due Diligence',(select version from deals));
select transition_deal((select id from deals),'Contract',(select version from deals));
select transition_deal((select id from deals),'Won',(select version from deals));
select test.ok((select status from physical_units where unit_number='A-21')='Sold','Won sale changes only selected unit');
select test.ok((select availability from marketing_offers where ref='TEST-1')='Sold','Offer availability follows completion');
select test.ok((select published_snapshot->>'availability' from marketing_offers where ref='TEST-1')='Sold','Published snapshot availability follows completion');
select test.denied('select transition_deal('''||(select id from deals)::text||''',''Opportunity'',(select version from deals))','Closed transactions cannot reopen');
select test.denied('select save_deal(jsonb_build_object(''id'',(select id from deals),''total_amount'',1),(select version from deals),''{}'')','Closed transactions cannot be edited');
select save_offer('{"ref":"TEST-2","slug":"unidentified-unit","marketing_title":"Unidentified unit","district":"Istanbul","record_type":"unit_type","mode":"sale","price_type":"on-request","availability":"Available","publication":"Draft"}',null);
select test.denied('select bulk_publication(array[(select id from marketing_offers where ref=''TEST-2''),gen_random_uuid()],''Published'')','Bulk publication rejects missing records atomically');
select test.ok((select publication from marketing_offers where ref='TEST-2')='Draft','Failed bulk publication does not change prior records');
select staff_create_enquiry('{"name":"Buyer A","email":"","phone":"","topic":"Advice","budget":"TRY 15–20m","message":"Please contact me.","source":"Contact Brief"}');
select convert_enquiry((select id from enquiries where name='Buyer A'));
select convert_enquiry((select id from enquiries where name='Buyer A'));
select test.ok((select count(*) from leads where enquiry_id in(select id from enquiries where name='Buyer A'))=1,'Enquiry conversion is idempotent');
select test.ok((select budget_min is null and budget_max is null from leads where enquiry_id in(select id from enquiries where name='Buyer A')),'Ambiguous budgets remain unparsed');
select staff_create_enquiry('{"name":"Exact TRY buyer","email":"exact@example.test","phone":"","topic":"Advice","budget":"TRY 15,000,000","message":"Please contact me.","source":"Contact Brief"}');
select convert_enquiry((select id from enquiries where name='Exact TRY buyer'));
select test.ok((select budget_min is null and budget_max=15000000 and currency='TRY' from leads where enquiry_id in(select id from enquiries where name='Exact TRY buyer')),'Exact enquiry budgets preserve their supplied currency');
reset role;
select test.ok((select count(*) from audit_events)>0,'Writes produce an audit trail');
set local role anon;
select test.ok((select count(*) from published_catalogue())=1,'Anonymous reads only the published snapshot');
select test.denied('select assigned_agent_id from marketing_offers','Public catalogue cannot expose staff assignments');
select test.denied('select source_record from marketing_offers','Original review payloads stay private');
reset role;
select set_config('request.jwt.claims','{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000006","session_id":"00000000-0000-4000-8000-000000000106"}',true);
set local role authenticated;
select test.ok((select count(*) from contacts)=0,'Inactive staff cannot read CRM');
select test.denied('select convert_lead(''00000000-0000-4000-8000-000000003001'')','Inactive staff cannot call transactions');
reset role;
select set_config('request.jwt.claims','{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000003","session_id":"00000000-0000-4000-8000-000000009999"}',true);
set local role authenticated;
select test.ok((select count(*) from contacts)=0,'Revoked Auth sessions lose access immediately');
reset role;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
set local role service_role;
select accept_enquiry('{"name":"Public buyer","email":"public@example.test","phone":"+90 555 1234567","topic":"Advice","message":"Please contact me","budget":"USD 400k","idempotency_key":"00000000-0000-4000-8000-000000004001"}','test-ip','payload-hash');
select accept_enquiry('{"name":"Public buyer","email":"public@example.test","phone":"+90 555 1234567","topic":"Advice","message":"Please contact me","budget":"USD 400k","idempotency_key":"00000000-0000-4000-8000-000000004001"}','test-ip','payload-hash');
reset role;
select test.ok((select count(*) from enquiries where name='Public buyer')=1,'Public submissions are idempotent');
select test.ok((select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity)=0,'Every exposed table has RLS');
select test.ok(not has_function_privilege('authenticated','public.complete_deal_win(uuid,uuid)','EXECUTE'),'Legacy completion bypass is revoked');
select test.denied('update staff_profiles set is_active=false where role=''admin''','Last administrator is protected');
rollback;
