
-- Preserve imported inventory. Authorization uses current protected staff membership and a live Auth session.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
revoke all on all tables in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public;
create or replace function private.staff_role() returns public.staff_role
language sql stable security definer set search_path = ''
as $$ select s.role from public.staff_profiles s join auth.users u on u.id=s.id
where s.id=(select auth.uid()) and s.is_active
and exists(select 1 from auth.sessions a where a.user_id=s.id and a.id::text=(select auth.jwt()->>'session_id')) $$;
revoke all on function private.staff_role() from public, anon;
grant execute on function private.staff_role() to authenticated;
create or replace function private.manager() returns boolean language sql stable set search_path=''
as $$ select coalesce(private.staff_role() in ('admin','manager'),false) $$;
create or replace function private.writer(p_owner uuid) returns boolean language sql stable set search_path=''
as $$ select coalesce(private.staff_role() in ('admin','manager') or (private.staff_role()='agent' and p_owner=(select auth.uid())),false) $$;
create or replace function private.reader(p_owner uuid) returns boolean language sql stable set search_path=''
as $$ select coalesce(private.staff_role() in ('admin','manager','viewer') or (private.staff_role()='agent' and p_owner=(select auth.uid())),false) $$;
revoke all on function private.manager(),private.writer(uuid),private.reader(uuid) from public,anon;
grant execute on function private.manager(),private.writer(uuid),private.reader(uuid) to authenticated;
drop policy "staff_read_profiles" on public.staff_profiles;
drop policy "admin_manage_staff" on public.staff_profiles;
drop policy "public_read_site_settings" on public.site_settings;
drop policy "public_read_published_offers" on public.marketing_offers;
drop policy "public_read_pricing_options" on public.pricing_options;
drop policy "public_read_instalment_schedules" on public.instalment_schedules;
drop policy "public_read_projects" on public.projects;
drop policy "public_read_developers" on public.developers;
drop policy "public_read_amenities" on public.amenities;
drop policy "public_read_offer_amenities" on public.offer_amenities;
drop policy "public_read_package_memberships" on public.package_memberships;
drop policy "public_read_redirects" on public.property_slug_redirects;
drop policy "public_read_content_pages" on public.content_pages;
drop policy "manager_manage_pricing" on public.pricing_options;
drop policy "public_read_content_sections" on public.content_sections;
drop policy "public_read_services" on public.services;
drop policy "public_read_faqs" on public.faqs;
drop policy "public_read_catalog_documents" on public.catalog_documents;
drop policy "public_insert_enquiry" on public.enquiries;
drop policy "staff_read_enquiries" on public.enquiries;
drop policy "staff_manage_enquiries" on public.enquiries;
drop policy "staff_manage_inventory_managers" on public.marketing_offers;
drop policy "agent_update_own_offers" on public.marketing_offers;
drop policy "manager_manage_schedules" on public.instalment_schedules;
drop policy "staff_read_units" on public.physical_units;
drop policy "manager_manage_units" on public.physical_units;
drop policy "staff_read_buildings" on public.buildings;
drop policy "manager_manage_buildings" on public.buildings;
drop policy "manager_manage_projects" on public.projects;
drop policy "manager_manage_developers" on public.developers;
drop policy "manager_manage_amenities" on public.amenities;
drop policy "manager_manage_offer_amenities" on public.offer_amenities;
drop policy "manager_manage_packages" on public.package_memberships;
drop policy "staff_read_history" on public.price_history;
drop policy "staff_read_avail_history" on public.availability_history;
drop policy "staff_read_publ_history" on public.publication_history;
drop policy "manager_manage_redirects" on public.property_slug_redirects;
drop policy "staff_read_contacts" on public.contacts;
drop policy "staff_manage_contacts" on public.contacts;
drop policy "staff_read_leads" on public.leads;
drop policy "staff_manage_reservations" on public.reservations;
drop policy "staff_manage_checklists" on public.document_checklists;
drop policy "staff_manage_leads" on public.leads;
drop policy "staff_read_buyer_reqs" on public.buyer_requirements;
drop policy "staff_manage_buyer_reqs" on public.buyer_requirements;
drop policy "staff_read_shortlists" on public.contact_shortlists;
drop policy "staff_manage_shortlists" on public.contact_shortlists;
drop policy "staff_read_tasks" on public.tasks;
drop policy "staff_manage_tasks" on public.tasks;
drop policy "staff_read_viewings" on public.viewings;
drop policy "staff_manage_viewings" on public.viewings;
drop policy "staff_read_activities" on public.activities;
drop policy "staff_insert_activities" on public.activities;
drop policy "staff_manage_milestones" on public.payment_milestones;
drop policy "staff_read_payments" on public.recorded_payments;
drop policy "staff_read_notes" on public.notes;
drop policy "staff_manage_notes" on public.notes;
drop policy "staff_manage_merges" on public.contact_merges;
drop policy "staff_read_deals" on public.deals;
drop policy "staff_manage_deals" on public.deals;
drop policy "staff_manage_selected_units" on public.deal_selected_units;
drop policy "staff_manage_revisions" on public.offer_revisions;
drop policy "manager_manage_payments" on public.recorded_payments;
drop policy "manager_manage_commissions" on public.commission_allocations;
drop policy "agent_read_own_commissions" on public.commission_allocations;
drop policy "staff_read_leases" on public.leases;
drop policy "manager_manage_leases" on public.leases;
drop policy "staff_read_charges" on public.rent_charges;
drop policy "manager_manage_charges" on public.rent_charges;
drop policy "manager_manage_allocations" on public.rent_payment_allocations;
drop policy "manager_manage_deposits" on public.rental_deposits;
drop policy "staff_read_vendors" on public.vendors;
drop policy "manager_manage_vendors" on public.vendors;
drop policy "staff_manage_tickets" on public.maintenance_tickets;
drop policy "manager_manage_settings" on public.site_settings;
drop policy "manager_manage_pages" on public.content_pages;
drop policy "manager_manage_sections" on public.content_sections;
drop policy "manager_manage_services" on public.services;
drop policy "manager_manage_faqs" on public.faqs;
drop policy "manager_manage_catalog" on public.catalog_documents;
drop policy "staff_read_audit" on public.audit_events;
drop policy "staff_read_own_notifications" on public.notifications;
drop policy "staff_update_own_notifications" on public.notifications;
drop policy "staff_manage_storage_files" on public.storage_files;
drop policy "admin_manage_source_files" on public.source_files;
drop policy "admin_manage_candidates" on public.extraction_candidates;
drop policy "admin_manage_import_runs" on public.import_runs;
drop policy "rate_limit_policy" on public.rate_limit_entries;
drop policy "public_view_marketing_media" on storage.objects;
drop policy "staff_manage_marketing_media" on storage.objects;
drop policy "staff_view_source_media" on storage.objects;
drop policy "admin_manage_source_media" on storage.objects;
drop policy "staff_view_documents" on storage.objects;
drop policy "agent_manage_documents" on storage.objects;
alter table public.staff_profiles enable row level security;
grant select on public.staff_profiles to authenticated;
alter table public.developers enable row level security;
grant select on public.developers to authenticated;
alter table public.projects enable row level security;
grant select on public.projects to authenticated;
alter table public.buildings enable row level security;
grant select on public.buildings to authenticated;
alter table public.physical_units enable row level security;
grant select on public.physical_units to authenticated;
alter table public.marketing_offers enable row level security;
grant select on public.marketing_offers to authenticated;
alter table public.package_memberships enable row level security;
grant select on public.package_memberships to authenticated;
alter table public.amenities enable row level security;
grant select on public.amenities to authenticated;
alter table public.offer_amenities enable row level security;
grant select on public.offer_amenities to authenticated;
alter table public.pricing_options enable row level security;
grant select on public.pricing_options to authenticated;
alter table public.instalment_schedules enable row level security;
grant select on public.instalment_schedules to authenticated;
alter table public.price_history enable row level security;
grant select on public.price_history to authenticated;
alter table public.availability_history enable row level security;
grant select on public.availability_history to authenticated;
alter table public.publication_history enable row level security;
grant select on public.publication_history to authenticated;
alter table public.property_slug_redirects enable row level security;
grant select on public.property_slug_redirects to authenticated;
alter table public.contacts enable row level security;
grant select on public.contacts to authenticated;
alter table public.buyer_requirements enable row level security;
grant select on public.buyer_requirements to authenticated;
alter table public.contact_shortlists enable row level security;
grant select on public.contact_shortlists to authenticated;
alter table public.enquiries enable row level security;
grant select on public.enquiries to authenticated;
alter table public.leads enable row level security;
grant select on public.leads to authenticated;
alter table public.tasks enable row level security;
grant select on public.tasks to authenticated;
alter table public.viewings enable row level security;
grant select on public.viewings to authenticated;
alter table public.activities enable row level security;
grant select on public.activities to authenticated;
alter table public.notes enable row level security;
grant select on public.notes to authenticated;
alter table public.contact_merges enable row level security;
grant select on public.contact_merges to authenticated;
alter table public.deals enable row level security;
grant select on public.deals to authenticated;
alter table public.deal_selected_units enable row level security;
grant select on public.deal_selected_units to authenticated;
alter table public.offer_revisions enable row level security;
grant select on public.offer_revisions to authenticated;
alter table public.reservations enable row level security;
grant select on public.reservations to authenticated;
alter table public.document_checklists enable row level security;
grant select on public.document_checklists to authenticated;
alter table public.payment_milestones enable row level security;
grant select on public.payment_milestones to authenticated;
alter table public.recorded_payments enable row level security;
grant select on public.recorded_payments to authenticated;
alter table public.commission_allocations enable row level security;
grant select on public.commission_allocations to authenticated;
alter table public.leases enable row level security;
grant select on public.leases to authenticated;
alter table public.rent_charges enable row level security;
grant select on public.rent_charges to authenticated;
alter table public.rent_payment_allocations enable row level security;
grant select on public.rent_payment_allocations to authenticated;
alter table public.rental_deposits enable row level security;
grant select on public.rental_deposits to authenticated;
alter table public.vendors enable row level security;
grant select on public.vendors to authenticated;
alter table public.maintenance_tickets enable row level security;
grant select on public.maintenance_tickets to authenticated;
alter table public.site_settings enable row level security;
grant select on public.site_settings to authenticated;
alter table public.content_pages enable row level security;
grant select on public.content_pages to authenticated;
alter table public.content_sections enable row level security;
grant select on public.content_sections to authenticated;
alter table public.services enable row level security;
grant select on public.services to authenticated;
alter table public.faqs enable row level security;
grant select on public.faqs to authenticated;
alter table public.catalog_documents enable row level security;
grant select on public.catalog_documents to authenticated;
alter table public.audit_events enable row level security;
grant select on public.audit_events to authenticated;
alter table public.notifications enable row level security;
grant select on public.notifications to authenticated;
alter table public.storage_files enable row level security;
grant select on public.storage_files to authenticated;
alter table public.source_files enable row level security;
grant select on public.source_files to authenticated;
alter table public.extraction_candidates enable row level security;
grant select on public.extraction_candidates to authenticated;
alter table public.import_runs enable row level security;
grant select on public.import_runs to authenticated;
alter table public.rate_limit_entries enable row level security;
grant select on public.rate_limit_entries to authenticated;
create policy staff_read on public.developers for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.developers for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.developers for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.developers to authenticated;
create policy staff_read on public.projects for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.projects for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.projects for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.projects to authenticated;
create policy staff_read on public.buildings for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.buildings for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.buildings for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.buildings to authenticated;
create policy staff_read on public.physical_units for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.physical_units for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.physical_units for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.physical_units to authenticated;
create policy staff_read on public.marketing_offers for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.marketing_offers for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.marketing_offers for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.marketing_offers to authenticated;
create policy staff_read on public.package_memberships for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.package_memberships for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.package_memberships for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.package_memberships to authenticated;
create policy staff_read on public.amenities for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.amenities for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.amenities for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.amenities to authenticated;
create policy staff_read on public.offer_amenities for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.offer_amenities for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.offer_amenities for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.offer_amenities to authenticated;
create policy staff_read on public.pricing_options for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.pricing_options for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.pricing_options for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.pricing_options to authenticated;
create policy staff_read on public.instalment_schedules for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.instalment_schedules for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.instalment_schedules for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.instalment_schedules to authenticated;
create policy staff_read on public.property_slug_redirects for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.property_slug_redirects for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.property_slug_redirects for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.property_slug_redirects to authenticated;
create policy staff_read on public.site_settings for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.site_settings for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.site_settings for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.site_settings to authenticated;
create policy staff_read on public.content_pages for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.content_pages for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.content_pages for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.content_pages to authenticated;
create policy staff_read on public.content_sections for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.content_sections for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.content_sections for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.content_sections to authenticated;
create policy staff_read on public.services for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.services for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.services for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.services to authenticated;
create policy staff_read on public.faqs for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.faqs for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.faqs for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.faqs to authenticated;
create policy staff_read on public.catalog_documents for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.catalog_documents for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.catalog_documents for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.catalog_documents to authenticated;
create policy staff_read on public.source_files for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.source_files for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.source_files for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.source_files to authenticated;
create policy staff_read on public.extraction_candidates for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.extraction_candidates for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.extraction_candidates for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.extraction_candidates to authenticated;
create policy staff_read on public.import_runs for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.import_runs for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.import_runs for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.import_runs to authenticated;
create policy staff_read on public.vendors for select to authenticated using ((select private.staff_role()) is not null);
create policy manager_insert on public.vendors for insert to authenticated with check ((select private.manager()));
create policy manager_update on public.vendors for update to authenticated using ((select private.manager())) with check ((select private.manager()));
grant insert,update on public.vendors to authenticated;
create policy scoped_read on public.contacts for select to authenticated using (private.reader(assigned_agent_id));
create policy scoped_insert on public.contacts for insert to authenticated with check (private.writer(assigned_agent_id));
create policy scoped_update on public.contacts for update to authenticated using (private.writer(assigned_agent_id)) with check (private.writer(assigned_agent_id));
create policy scoped_read on public.leads for select to authenticated using (private.reader(assigned_agent_id));
create policy scoped_insert on public.leads for insert to authenticated with check (private.writer(assigned_agent_id));
create policy scoped_update on public.leads for update to authenticated using (private.writer(assigned_agent_id)) with check (private.writer(assigned_agent_id));
create policy scoped_read on public.tasks for select to authenticated using (private.reader(assignee_id));
create policy scoped_insert on public.tasks for insert to authenticated with check (private.writer(assignee_id));
create policy scoped_update on public.tasks for update to authenticated using (private.writer(assignee_id)) with check (private.writer(assignee_id));
create policy scoped_read on public.viewings for select to authenticated using (private.reader(agent_id));
create policy scoped_insert on public.viewings for insert to authenticated with check (private.writer(agent_id));
create policy scoped_update on public.viewings for update to authenticated using (private.writer(agent_id)) with check (private.writer(agent_id));
create policy scoped_read on public.deals for select to authenticated using (private.reader(assigned_agent_id));
create policy scoped_insert on public.deals for insert to authenticated with check (private.writer(assigned_agent_id));
create policy scoped_update on public.deals for update to authenticated using (private.writer(assigned_agent_id)) with check (private.writer(assigned_agent_id));

grant insert,update on public.contacts,public.leads,public.tasks,public.viewings to authenticated;
-- Deals and selected units are written only through guarded atomic operations.
create policy staff_read on public.staff_profiles for select to authenticated using ((select private.staff_role()) is not null);
create policy admin_insert on public.staff_profiles for insert to authenticated with check ((select private.staff_role())='admin');
create policy admin_update on public.staff_profiles for update to authenticated using ((select private.staff_role())='admin') with check ((select private.staff_role())='admin');
grant insert,update on public.staff_profiles to authenticated;
alter table public.enquiries add column assigned_agent_id uuid references public.staff_profiles(id);
create index enquiries_assigned_agent_idx on public.enquiries(assigned_agent_id);
create policy scoped_read on public.enquiries for select to authenticated using (private.reader(assigned_agent_id));
create policy scoped_update on public.enquiries for update to authenticated using (private.writer(assigned_agent_id)) with check(private.writer(assigned_agent_id));
grant update(status,notes,assigned_agent_id) on public.enquiries to authenticated;
create policy staff_read on public.activities for select to authenticated using (private.reader(user_id));
create policy staff_insert on public.activities for insert to authenticated with check (user_id=(select auth.uid()) and (select private.staff_role()) in ('admin','manager','agent'));
grant insert(user_id,kind,text,ref_kind,ref_id) on public.activities to authenticated;
create policy admin_read on public.audit_events for select to authenticated using ((select private.staff_role())='admin');
create policy own_read on public.notifications for select to authenticated using (recipient_id=(select auth.uid()) and (select private.staff_role()) is not null);
create policy own_update on public.notifications for update to authenticated using(recipient_id=(select auth.uid()) and (select private.staff_role()) is not null) with check(recipient_id=(select auth.uid()));
grant update(is_read,read_at) on public.notifications to authenticated;
create table public.notification_receipts(user_id uuid references public.staff_profiles(id) on delete cascade,notification_key text not null,read_at timestamptz default now(),primary key(user_id,notification_key));
alter table public.notification_receipts enable row level security;
create policy own_receipt on public.notification_receipts for all to authenticated using(user_id=(select auth.uid()) and (select private.staff_role()) is not null) with check(user_id=(select auth.uid()) and (select private.staff_role()) is not null);
grant select,insert,delete on public.notification_receipts to authenticated;
create policy public_snapshot on public.marketing_offers for select to anon using(publication='Published' and published_snapshot is not null);
grant select(publication,published_snapshot) on public.marketing_offers to anon;
create function public.published_catalogue() returns setof jsonb language sql stable security invoker set search_path=''
as $$select published_snapshot from public.marketing_offers where publication='Published' and published_snapshot is not null$$;
revoke all on function public.published_catalogue() from public;
grant execute on function public.published_catalogue() to anon,authenticated;
grant select on public.site_settings,public.services,public.faqs,public.catalog_documents to anon;
create policy public_read on public.site_settings for select to anon using(true);
create policy public_read on public.services for select to anon using(is_published);
create policy public_read on public.faqs for select to anon using(is_published);
create policy public_read on public.catalog_documents for select to anon using(is_published);
create policy parent_read on public.deal_selected_units for select to authenticated using(exists(select 1 from public.deals d where d.id=deal_selected_units.deal_id and private.reader(d.assigned_agent_id)));
create policy parent_read on public.offer_revisions for select to authenticated using(exists(select 1 from public.deals d where d.id=offer_revisions.deal_id and private.reader(d.assigned_agent_id)));
create policy parent_read on public.reservations for select to authenticated using(exists(select 1 from public.deals d where d.id=reservations.deal_id and private.reader(d.assigned_agent_id)));
create policy parent_read on public.document_checklists for select to authenticated using(exists(select 1 from public.deals d where d.id=document_checklists.deal_id and private.reader(d.assigned_agent_id)));
create policy parent_read on public.payment_milestones for select to authenticated using(exists(select 1 from public.deals d where d.id=payment_milestones.deal_id and private.reader(d.assigned_agent_id)));
create policy parent_read on public.recorded_payments for select to authenticated using(exists(select 1 from public.deals d where d.id=recorded_payments.deal_id and private.reader(d.assigned_agent_id)));
create policy parent_read on public.commission_allocations for select to authenticated using(exists(select 1 from public.deals d where d.id=commission_allocations.deal_id and private.reader(d.assigned_agent_id)));
create policy manager_read on public.price_history for select to authenticated using((select private.manager()));
create policy manager_insert on public.price_history for insert to authenticated with check((select private.manager()));
create policy manager_update on public.price_history for update to authenticated using((select private.manager())) with check((select private.manager()));
grant insert,update on public.price_history to authenticated;
create policy manager_read on public.availability_history for select to authenticated using((select private.manager()));
create policy manager_insert on public.availability_history for insert to authenticated with check((select private.manager()));
create policy manager_update on public.availability_history for update to authenticated using((select private.manager())) with check((select private.manager()));
grant insert,update on public.availability_history to authenticated;
create policy manager_read on public.publication_history for select to authenticated using((select private.manager()));
create policy manager_insert on public.publication_history for insert to authenticated with check((select private.manager()));
create policy manager_update on public.publication_history for update to authenticated using((select private.manager())) with check((select private.manager()));
grant insert,update on public.publication_history to authenticated;
create policy manager_read on public.buyer_requirements for select to authenticated using((select private.manager()));
create policy manager_insert on public.buyer_requirements for insert to authenticated with check((select private.manager()));
create policy manager_update on public.buyer_requirements for update to authenticated using((select private.manager())) with check((select private.manager()));
grant insert,update on public.buyer_requirements to authenticated;
create policy manager_read on public.contact_shortlists for select to authenticated using((select private.manager()));
create policy manager_insert on public.contact_shortlists for insert to authenticated with check((select private.manager()));
create policy manager_update on public.contact_shortlists for update to authenticated using((select private.manager())) with check((select private.manager()));
grant insert,update on public.contact_shortlists to authenticated;
create policy manager_read on public.notes for select to authenticated using((select private.manager()));
create policy manager_insert on public.notes for insert to authenticated with check((select private.manager()));
create policy manager_update on public.notes for update to authenticated using((select private.manager())) with check((select private.manager()));
grant insert,update on public.notes to authenticated;
create policy manager_read on public.contact_merges for select to authenticated using((select private.manager()));
create policy manager_insert on public.contact_merges for insert to authenticated with check((select private.manager()));
create policy manager_update on public.contact_merges for update to authenticated using((select private.manager())) with check((select private.manager()));
grant insert,update on public.contact_merges to authenticated;
create policy manager_read on public.leases for select to authenticated using((select private.manager()));
create policy manager_insert on public.leases for insert to authenticated with check((select private.manager()));
create policy manager_update on public.leases for update to authenticated using((select private.manager())) with check((select private.manager()));
grant insert,update on public.leases to authenticated;
create policy manager_read on public.rent_charges for select to authenticated using((select private.manager()));
create policy manager_insert on public.rent_charges for insert to authenticated with check((select private.manager()));
create policy manager_update on public.rent_charges for update to authenticated using((select private.manager())) with check((select private.manager()));
grant insert,update on public.rent_charges to authenticated;
create policy manager_read on public.rent_payment_allocations for select to authenticated using((select private.manager()));
create policy manager_insert on public.rent_payment_allocations for insert to authenticated with check((select private.manager()));
create policy manager_update on public.rent_payment_allocations for update to authenticated using((select private.manager())) with check((select private.manager()));
grant insert,update on public.rent_payment_allocations to authenticated;
create policy manager_read on public.rental_deposits for select to authenticated using((select private.manager()));
create policy manager_insert on public.rental_deposits for insert to authenticated with check((select private.manager()));
create policy manager_update on public.rental_deposits for update to authenticated using((select private.manager())) with check((select private.manager()));
grant insert,update on public.rental_deposits to authenticated;
create policy manager_read on public.maintenance_tickets for select to authenticated using((select private.manager()));
create policy manager_insert on public.maintenance_tickets for insert to authenticated with check((select private.manager()));
create policy manager_update on public.maintenance_tickets for update to authenticated using((select private.manager())) with check((select private.manager()));
grant insert,update on public.maintenance_tickets to authenticated;
create policy manager_read on public.storage_files for select to authenticated using((select private.manager()));
create policy manager_insert on public.storage_files for insert to authenticated with check((select private.manager()));
create policy manager_update on public.storage_files for update to authenticated using((select private.manager())) with check((select private.manager()));
grant insert,update on public.storage_files to authenticated;

create policy public_media on storage.objects for select to anon,authenticated using(bucket_id='public-marketing');
create policy manager_media on storage.objects for all to authenticated using(bucket_id='public-marketing' and (select private.manager())) with check(bucket_id='public-marketing' and (select private.manager()));
create policy manager_private on storage.objects for all to authenticated using(bucket_id in ('private-source','private-documents') and (select private.manager())) with check(bucket_id in ('private-source','private-documents') and (select private.manager()));
-- Prevent active leases overlapping even under concurrent requests.
create extension if not exists btree_gist with schema extensions;
alter table public.leases add constraint active_lease_no_overlap exclude using gist (physical_unit_id with =, daterange(start_date,end_date,'[)') with &&) where(status='active');
alter table public.marketing_offers add constraint offer_nonnegative check((amount is null or amount>=0) and (gross_m2 is null or gross_m2>0) and (net_m2 is null or net_m2>0) and (area_m2 is null or area_m2>0));
alter table public.leads add constraint lead_budget_valid check((budget_min is null or budget_min>=0) and (budget_max is null or budget_max>=0) and (budget_min is null or budget_max is null or budget_min<=budget_max) and (stage<>'Lost' or nullif(trim(loss_reason),'') is not null) and (stage<>'Converted' or deal_id is not null));
alter table public.viewings add constraint viewing_time_valid check(end_time>start_time);
alter table public.deals add constraint deal_amount_valid check(total_amount is null or total_amount>0);
create unique index one_active_offer_reservation on public.reservations(offer_id) where status='active' and offer_id is not null;
create unique index one_active_unit_reservation on public.reservations(physical_unit_id) where status='active' and physical_unit_id is not null;
create unique index one_deal_per_lead on public.deals(lead_id) where lead_id is not null;
create unique index one_lead_per_enquiry on public.leads(enquiry_id) where enquiry_id is not null;
create unique index unique_deal_offer on public.deal_selected_units(deal_id,offer_id) where offer_id is not null;
create unique index rate_limit_unique_window on public.rate_limit_entries(rate_key,window_start);

alter table public.marketing_offers add column source_record jsonb;
create or replace function private.touch_record() returns trigger language plpgsql security definer set search_path='' as $$
begin
new.updated_at=clock_timestamp();
if tg_op='INSERT' and to_jsonb(new)?'created_by' then new=jsonb_populate_record(new,jsonb_build_object('created_by',auth.uid())); end if;
return new;
end $$;
revoke all on function private.touch_record() from public,anon,authenticated;
create trigger record_updated before insert or update on public.staff_profiles for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.developers for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.projects for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.buildings for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.physical_units for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.marketing_offers for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.contacts for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.buyer_requirements for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.enquiries for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.leads for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.tasks for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.viewings for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.notes for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.deals for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.reservations for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.document_checklists for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.leases for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.maintenance_tickets for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.site_settings for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.content_pages for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.content_sections for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.services for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.faqs for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.catalog_documents for each row execute function private.touch_record();
create trigger record_updated before insert or update on public.source_files for each row execute function private.touch_record();

create or replace function private.audit_record() returns trigger language plpgsql security definer set search_path='' as $$
begin
if auth.uid() is not null then
insert into public.audit_events(actor_id,actor_role,action,target_table,target_id,old_values,new_values)
values(auth.uid(),private.staff_role()::text,tg_op,tg_table_name,new.id,case when tg_op='UPDATE' then to_jsonb(old) end,to_jsonb(new));
end if; return new;
end $$;
revoke all on function private.audit_record() from public,anon,authenticated;
create trigger record_audit after insert or update on public.marketing_offers for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.contacts for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.leads for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.tasks for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.viewings for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.deals for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.enquiries for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.site_settings for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.staff_profiles for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.content_pages for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.services for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.faqs for each row execute function private.audit_record();

create or replace function private.crm_guard() returns trigger language plpgsql set search_path='' as $$
declare contact_owner uuid;
begin
if tg_table_name in ('leads','viewings','deals') and not private.manager() then
select assigned_agent_id into contact_owner from public.contacts where id=new.contact_id;
if contact_owner is distinct from auth.uid() then raise exception 'Contact is not assigned to you'; end if;
end if;
if tg_table_name='leads' and tg_op='UPDATE' and new.deal_id is distinct from old.deal_id then
raise exception 'Use Convert to deal to link an opportunity';
end if;
return new;
end $$;
revoke all on function private.crm_guard() from public,anon;
grant execute on function private.crm_guard() to authenticated;
create trigger guard_lead before insert or update on public.leads for each row when(current_user='authenticated') execute function private.crm_guard();
create trigger guard_viewing before insert or update on public.viewings for each row when(current_user='authenticated') execute function private.crm_guard();
create or replace function public.check_last_admin_protection() returns trigger language plpgsql security definer set search_path='' as $$
begin
perform pg_advisory_xact_lock(84721001);
if (tg_op='DELETE' and old.role='admin' and old.is_active) or
(tg_op='UPDATE' and old.role='admin' and old.is_active and (new.role<>'admin' or not new.is_active)) then
if not exists(select 1 from public.staff_profiles where role='admin' and is_active and id<>old.id) then raise exception 'Cannot remove the last active administrator'; end if;
end if;
if tg_op='DELETE' then return old; end if;return new;
end $$;
create or replace function private.save_offer(p_data jsonb,p_version integer) returns jsonb language plpgsql security definer set search_path='' as $$
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
r=jsonb_populate_record(old_row,(select coalesce(jsonb_object_agg(key,value),'{}') from jsonb_each(p_data) where key=any(array['ref','slug','marketing_title','district','city','record_type','mode','layout_label','bathrooms','gross_m2','net_m2','area_m2','amount','currency','price_type','availability','publication','assigned_agent_id','cover_image_path','description','source_note','side','tapu_status','project_id'])));
if nullif(trim(r.marketing_title),'') is null or nullif(trim(r.ref),'') is null or r.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then raise exception 'Title, reference and a valid slug are required'; end if;
if r.price_type<>'on-request' and (r.amount is null or r.currency is null) then raise exception 'Price and currency are required';end if;
wanted=r.publication;
r.version=old_row.version+1;r.updated_by=auth.uid();r.created_by=coalesce(old_row.created_by,auth.uid());r.updated_at=now();
if wanted='Published' then
if nullif(trim(r.district),'') is null then raise exception 'Confirm the location before publishing';end if;
snapshot=coalesce(r.source_record,'{}'::jsonb)||jsonb_build_object('id',r.id,'slug',r.slug,'marketing_title',r.marketing_title,'city',r.city,'location_label',r.district,'side',r.side,'record_type',r.record_type,'mode',r.mode,'layout_label',r.layout_label,
'price',coalesce(r.source_record->'price','{}'::jsonb)||jsonb_build_object('amount',r.amount,'currency',r.currency,'basis',case when r.price_type='on-request' then 'on_request' when r.price_type='from' and r.price_basis='advertised' then 'from' else r.price_basis::text end,'status','staff-published'),
'areas',(select coalesce(jsonb_agg(x),'[]') from (select jsonb_build_object('value_m2',r.gross_m2,'basis','gross') x where r.gross_m2 is not null union all select jsonb_build_object('value_m2',r.net_m2,'basis','net') where r.net_m2 is not null union all select jsonb_build_object('value_m2',r.area_m2,'basis','unspecified') where r.area_m2 is not null) a),
'source_ids',coalesce(r.source_record->'source_ids','[]'::jsonb),'availability_verified',r.availability='Available',
'cover',r.cover_image_path,'availability',r.availability,
'details',coalesce(r.source_record->'details','{}'::jsonb)||jsonb_build_object('project',(select name from public.projects where id=r.project_id),'note',r.description,'cbi_verified',r.cbi_verified and r.cbi_eligible,'claims_requiring_confirmation',coalesce(to_jsonb(r.claims_requiring_confirmation),'[]')));
r.published_snapshot=snapshot;r.published_at=now();
end if;
if old_row.version=0 then insert into public.marketing_offers select (r).*;
else
if old_row.slug<>r.slug then insert into public.property_slug_redirects(old_slug,new_slug,target_offer_id) values(old_row.slug,r.slug,r.id) on conflict(old_slug) do update set new_slug=excluded.new_slug,target_offer_id=excluded.target_offer_id; end if;
update public.marketing_offers set ref=r.ref,slug=r.slug,marketing_title=r.marketing_title,district=r.district,city=r.city,record_type=r.record_type,mode=r.mode,layout_label=r.layout_label,bathrooms=r.bathrooms,gross_m2=r.gross_m2,net_m2=r.net_m2,area_m2=r.area_m2,amount=r.amount,currency=r.currency,price_type=r.price_type,availability=r.availability,publication=r.publication,assigned_agent_id=r.assigned_agent_id,cover_image_path=r.cover_image_path,description=r.description,source_note=r.source_note,side=r.side,tapu_status=r.tapu_status,project_id=r.project_id,version=r.version,published_snapshot=r.published_snapshot,published_at=r.published_at,updated_by=r.updated_by where id=r.id;
end if;
if wanted is distinct from old_row.publication or wanted='Published' then
insert into public.publication_history(offer_id,old_status,new_status,snapshot,changed_by) values(r.id,old_row.publication,wanted,r.published_snapshot,auth.uid());
end if;
return (select to_jsonb(saved) from public.marketing_offers saved where saved.id=r.id);
end $$;
create function public.save_offer(p_data jsonb,p_version integer default null) returns jsonb language sql security invoker set search_path='' as $$select private.save_offer(p_data,p_version)$$;

create or replace function private.convert_enquiry(p_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare e public.enquiries;c uuid;l uuid;n int;owner uuid;
begin
select * into e from public.enquiries where id=p_id for update;
if not private.writer(e.assigned_agent_id) then raise exception 'Enquiry access denied' using errcode='42501';end if;
if not found then raise exception 'Enquiry not found';end if;
if e.lead_id is not null then return e.lead_id;end if;
if e.status='Archived' then raise exception 'Restore the archived enquiry before conversion';end if;
-- Serialize matching identities so simultaneous conversions cannot create duplicate contacts.
perform pg_advisory_xact_lock(hashtextextended(lower(trim(e.email))||regexp_replace(e.phone,'\D','','g'),0));
select count(*),(array_agg(id))[1] into n,c from public.contacts where
(nullif(trim(e.email),'') is not null and lower(trim(email))=lower(trim(e.email))) or
(nullif(regexp_replace(e.phone,'\D','','g'),'') is not null and regexp_replace(phone,'\D','','g')=regexp_replace(e.phone,'\D','','g'));
if n>1 then raise exception 'Multiple contacts match this enquiry. Review the duplicate identities first';end if;
owner=coalesce(e.assigned_agent_id,auth.uid());
if c is not null and not private.manager() and not exists(select 1 from public.contacts where id=c and assigned_agent_id=auth.uid()) then raise exception 'A matching contact belongs to another advisor. Ask a manager to review it';end if;
if c is null then insert into public.contacts(name,email,phone,assigned_agent_id,language,created_by,notes)
values(e.name,nullif(e.email,''),nullif(e.phone,''),owner,'',auth.uid(),'Original enquiry budget: '||coalesce(e.raw_budget_text,e.budget,'')) returning id into c;end if;
insert into public.leads(contact_id,enquiry_id,source,assigned_agent_id,stage,shortlist,created_by)
values(c,e.id,e.source,owner,'Qualified',case when e.offer_id is not null then array[e.offer_id] else '{}'::uuid[] end,auth.uid()) returning id into l;
-- Preserve free-text budget; never invent numeric ranges or assume currency.
update public.enquiries set contact_id=c,lead_id=l,status='Qualified',assigned_agent_id=owner where id=e.id;
return l;
end $$;
create function public.convert_enquiry(p_id uuid) returns uuid language sql security invoker set search_path='' as $$select private.convert_enquiry(p_id)$$;
create or replace function private.convert_lead(p_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare l public.leads;d uuid;
begin
select * into l from public.leads where id=p_id for update;
if not found or not private.writer(l.assigned_agent_id) then raise exception 'Lead access denied' using errcode='42501';end if;
if l.deal_id is not null then return l.deal_id;end if;
if l.stage='Lost' then raise exception 'Review a lost lead before converting';end if;
insert into public.deals(title,contact_id,lead_id,assigned_agent_id,currency,created_by)
select c.name||' — deal',c.id,l.id,coalesce(l.assigned_agent_id,auth.uid()),l.currency,auth.uid() from public.contacts c where c.id=l.contact_id returning id into d;
update public.leads set stage='Converted',deal_id=d where id=l.id;
return d;
end $$;
create function public.convert_lead(p_id uuid) returns uuid language sql security invoker set search_path='' as $$select private.convert_lead(p_id)$$;
create or replace function private.save_deal(p_data jsonb,p_version integer,p_offers uuid[]) returns uuid language plpgsql security definer set search_path='' as $$
declare d public.deals;o public.marketing_offers;k uuid;owner uuid;
begin
select * into d from public.deals where id=(p_data->>'id')::uuid for update;
if not found or not private.writer(d.assigned_agent_id) then raise exception 'Deal access denied' using errcode='42501';end if;
if d.version is distinct from p_version then raise exception 'Deal changed. Refresh before saving' using errcode='40001';end if;
if d.stage in ('Reserved','Due Diligence','Contract','Won','Lost') then raise exception 'Reserved and closed deals require a reviewed transition';end if;
if coalesce(array_length(p_offers,1),0)<> (select count(distinct x) from unnest(p_offers) x) then raise exception 'Duplicate units selected';end if;
d=jsonb_populate_record(d,p_data-'id'-'stage'-'version'-'created_by'-'lead_id'-'contact_id'-'assigned_agent_id');
if nullif(trim(d.title),'') is null then raise exception 'Deal title required';end if;
update public.deals set title=d.title,total_amount=d.total_amount,currency=d.currency,expected_close_date=d.expected_close_date,version=version+1 where id=d.id;
delete from public.deal_selected_units where deal_id=d.id;
foreach k in array coalesce(p_offers,'{}'::uuid[]) loop
select * into o from public.marketing_offers where id=k;
if not found then raise exception 'Selected offer does not exist';end if;
insert into public.deal_selected_units(deal_id,offer_id,physical_unit_id,currency) values(d.id,k,o.physical_unit_id,d.currency);
end loop;
return d.id;
end $$;
create function public.save_deal(p_data jsonb,p_version integer,p_offers uuid[]) returns uuid language sql security invoker set search_path='' as $$select private.save_deal(p_data,p_version,p_offers)$$;
create or replace function private.transition_deal(p_id uuid,p_stage public.deal_stage,p_version integer) returns void language plpgsql security definer set search_path='' as $$
declare d public.deals;s record;u public.physical_units;o public.marketing_offers;target public.property_availability;steps text[]=array['Opportunity','Offer Prepared','Offer Accepted','Reserved','Due Diligence','Contract','Won'];
begin
select * into d from public.deals where id=p_id for update;
if not found or not private.writer(d.assigned_agent_id) then raise exception 'Deal access denied' using errcode='42501';end if;
if d.version is distinct from p_version then raise exception 'Deal changed. Refresh before retrying' using errcode='40001';end if;
if d.stage=p_stage then return;end if;
if d.stage in ('Won','Lost') then raise exception 'Closed deals require a reviewed reversal';end if;
if p_stage<>'Lost' and array_position(steps,p_stage::text) is distinct from array_position(steps,d.stage::text)+1 then raise exception 'Advance one stage at a time';end if;
if p_stage in ('Reserved','Due Diligence','Contract','Won') then
if d.total_amount is null or d.total_amount<=0 or not exists(select 1 from public.deal_selected_units where deal_id=d.id) then raise exception 'Choose identified units and an agreed price before reserving';end if;
-- Global order avoids deadlocks for multi-unit transactions.
for s in select x.* from public.deal_selected_units x where x.deal_id=d.id order by x.physical_unit_id,x.offer_id loop
select * into o from public.marketing_offers where id=s.offer_id for update;
if not found or o.record_type<>'unit_offer' or o.physical_unit_id is null or o.physical_unit_id is distinct from s.physical_unit_id then raise exception 'Only offers linked to verified physical units can be reserved';end if;
select * into u from public.physical_units where id=s.physical_unit_id for update;
if not found or nullif(trim(u.unit_number),'') is null then raise exception 'Confirm unit identity first';end if;
if p_stage='Reserved' then
if u.status not in ('Available','Under Offer') or o.availability not in ('Available','Under Offer') then raise exception 'Selected unit is not available';end if;
insert into public.reservations(deal_id,offer_id,physical_unit_id,contact_id,reserved_by,reserved_from,expires_at)
values(d.id,o.id,u.id,d.contact_id,auth.uid(),now(),now()+interval '72 hours');
update public.physical_units set status='Reserved' where id=u.id;
update public.marketing_offers set availability='Reserved',version=version+1 where physical_unit_id=u.id;
elsif not exists(select 1 from public.reservations where deal_id=d.id and physical_unit_id=u.id and status='active' and expires_at>now()) then raise exception 'Reservation expired or belongs to another deal';end if;
if p_stage='Won' then
target=case when o.mode='rent' then 'Rented'::public.property_availability else 'Sold'::public.property_availability end;
update public.physical_units set status=target where id=u.id;
update public.marketing_offers set availability=target,version=version+1 where physical_unit_id=u.id;
end if;
end loop;
end if;
if p_stage='Won' then update public.reservations set status='converted' where deal_id=d.id and status='active';
elsif p_stage='Lost' then
for s in select * from public.reservations where deal_id=d.id and status='active' order by physical_unit_id for update loop
perform 1 from public.physical_units where id=s.physical_unit_id for update;
update public.reservations set status='cancelled',cancellation_reason='Deal lost' where id=s.id;
update public.physical_units set status='Available' where id=s.physical_unit_id and status='Reserved';
update public.marketing_offers set availability='Available',version=version+1 where physical_unit_id=s.physical_unit_id and availability='Reserved';
end loop;
end if;
update public.deals set stage=p_stage,version=version+1,actual_close_date=case when p_stage='Won' then now() else actual_close_date end where id=d.id;
end $$;
create function public.transition_deal(p_id uuid,p_stage public.deal_stage,p_version integer) returns void language sql security invoker set search_path='' as $$select private.transition_deal(p_id,p_stage,p_version)$$;
create function private.bulk_publication(p_ids uuid[],p_publication public.publication_status) returns void language plpgsql security definer set search_path='' as $$
declare r public.marketing_offers;
begin
if not private.manager() then raise exception 'Manager access required' using errcode='42501';end if;
if (select count(*) from public.marketing_offers where id=any(p_ids))<>(select count(distinct x) from unnest(p_ids) x) then raise exception 'Selected offer missing';end if;
for r in select * from public.marketing_offers where id=any(p_ids) order by id for update loop
perform private.save_offer(jsonb_build_object('id',r.id,'publication',p_publication),r.version);
end loop;
end $$;
create function public.bulk_publication(p_ids uuid[],p_publication public.publication_status) returns void language sql security invoker set search_path='' as $$select private.bulk_publication(p_ids,p_publication)$$;
create function private.link_physical_unit(p_offer uuid,p_unit uuid,p_version integer) returns void language plpgsql security definer set search_path='' as $$
declare o public.marketing_offers;u public.physical_units;
begin
if not private.manager() then raise exception 'Manager access required' using errcode='42501';end if;
select * into o from public.marketing_offers where id=p_offer for update;
select * into u from public.physical_units where id=p_unit;
if o.id is null or u.id is null or nullif(trim(u.unit_number),'') is null or o.record_type<>'unit_offer' then raise exception 'Choose an individual offer and an identified physical unit';end if;
if o.version is distinct from p_version then raise exception 'Offer changed';end if;
if exists(select 1 from public.reservations where (offer_id=o.id or physical_unit_id=u.id) and status='active') then raise exception 'Cannot relink reserved inventory';end if;
update public.marketing_offers set physical_unit_id=u.id,version=version+1 where id=o.id;
end $$;
create function public.link_physical_unit(p_offer uuid,p_unit uuid,p_version integer) returns void language sql security invoker set search_path='' as $$select private.link_physical_unit(p_offer,p_unit,p_version)$$;
revoke all on function private.save_offer(jsonb,integer) from public,anon;
revoke all on function public.save_offer(jsonb,integer) from public,anon;
grant execute on function private.save_offer(jsonb,integer),public.save_offer(jsonb,integer) to authenticated;
revoke all on function private.convert_enquiry(uuid) from public,anon;
revoke all on function public.convert_enquiry(uuid) from public,anon;
grant execute on function private.convert_enquiry(uuid),public.convert_enquiry(uuid) to authenticated;
revoke all on function private.convert_lead(uuid) from public,anon;
revoke all on function public.convert_lead(uuid) from public,anon;
grant execute on function private.convert_lead(uuid),public.convert_lead(uuid) to authenticated;
revoke all on function private.save_deal(jsonb,integer,uuid[]) from public,anon;
revoke all on function public.save_deal(jsonb,integer,uuid[]) from public,anon;
grant execute on function private.save_deal(jsonb,integer,uuid[]),public.save_deal(jsonb,integer,uuid[]) to authenticated;
revoke all on function private.transition_deal(uuid,public.deal_stage,integer) from public,anon;
revoke all on function public.transition_deal(uuid,public.deal_stage,integer) from public,anon;
grant execute on function private.transition_deal(uuid,public.deal_stage,integer),public.transition_deal(uuid,public.deal_stage,integer) to authenticated;
revoke all on function private.bulk_publication(uuid[],public.publication_status) from public,anon;
revoke all on function public.bulk_publication(uuid[],public.publication_status) from public,anon;
grant execute on function private.bulk_publication(uuid[],public.publication_status),public.bulk_publication(uuid[],public.publication_status) to authenticated;
revoke all on function private.link_physical_unit(uuid,uuid,integer) from public,anon;
revoke all on function public.link_physical_unit(uuid,uuid,integer) from public,anon;
grant execute on function private.link_physical_unit(uuid,uuid,integer),public.link_physical_unit(uuid,uuid,integer) to authenticated;
-- Retire bypassable legacy writes; the client uses only the guarded RPCs above.
revoke insert,update on public.marketing_offers from authenticated;
create index if not exists contacts_agent_idx on public.contacts(assigned_agent_id);
create index if not exists leads_agent_idx on public.leads(assigned_agent_id);
create index if not exists tasks_assignee_idx on public.tasks(assignee_id);
create index if not exists viewings_agent_idx on public.viewings(agent_id);
create index if not exists deals_agent_idx on public.deals(assigned_agent_id);
create index if not exists enquiries_created_idx on public.enquiries(created_at desc);
update public.marketing_offers set source_record='{"slug":"besiktas-studio-package-500","marketing_title":"Beşiktaş Furnished Studio Package","title_provenance":"proposed editorial title unless project name explicitly supplied","city":"Istanbul","location_label":"Beşiktaş","side":"Europe","record_type":"package","layout_label":"Source: 2 duplex studio apartments; 4 studio units in total","price":{"currency":"USD","amount":500000,"basis":"package","status":"source_stated_not_live"},"areas":[],"source_ids":["1nMCCsFYht0p7z0E8cl1pfq0Fyrum5Rl5"],"availability_verified":false,"citizenship_eligibility":"not_independently_verified","price_effective_date":null,"details":{"package_composition_requires_confirmation":true,"delivery_source":"31 December 2026","features_source":["Fully furnished"],"claims_requiring_confirmation":["5% annual USD rental guarantee","Citizenship eligibility","15-minute walk to sea","Close to metro","15-minute walk to university"],"note":"Do not treat the package price as a per-studio price or infer separate legal units."}}'::jsonb where slug='besiktas-studio-package-500';
update public.marketing_offers set source_record='{"slug":"rams-park-house-maslak-1-1xs","marketing_title":"RAMS Park House Maslak — 1+1 XS","title_provenance":"proposed editorial title unless project name explicitly supplied","city":"Istanbul","location_label":"Maslak","side":"Europe","record_type":"unit_type","layout_label":"1+1 XS","price":{"currency":"USD","amount":270000,"basis":"cash","status":"source_stated_not_live"},"areas":[{"value_m2":50,"basis":"gross"}],"source_ids":["16f3WWtbiAHLg0NGeDMQEO582_8_VsPkS"],"availability_verified":false,"citizenship_eligibility":"not_independently_verified","price_effective_date":null,"details":{"project":"RAMS Park House Maslak","installment_offer":{"currency":"USD","total":295000,"down_payment_percent":50,"months":30},"delivery_source":null}}'::jsonb where slug='rams-park-house-maslak-1-1xs';
update public.marketing_offers set source_record='{"slug":"sisli-ferikoy-duplex-182","marketing_title":"Feriköy Entry Duplex","title_provenance":"proposed editorial title unless project name explicitly supplied","city":"Istanbul","location_label":"Şişli–Feriköy","side":"Europe","record_type":"unit_offer","layout_label":"1+1 Duplex","price":{"currency":"USD","amount":182000,"basis":"cash","status":"source_stated_not_live"},"areas":[],"source_ids":["1Pwr8oecAaIyJxeZvqC5ndJVnKebKMPcs"],"availability_verified":false,"citizenship_eligibility":"not_independently_verified","price_effective_date":null,"details":{"status_source":"Ready to move","title_deed_source":"Ready","claims_requiring_confirmation":["High ROI","Investment & Citizenship"],"note":"Not established as independently citizenship-qualifying."}}'::jsonb where slug='sisli-ferikoy-duplex-182';
update public.marketing_offers set source_record='{"slug":"pearl-topkapi-2-1-410","marketing_title":"Pearl Residence Topkapı — 2+1","title_provenance":"proposed editorial title unless project name explicitly supplied","city":"Istanbul","location_label":"Topkapı–Zeytinburnu","side":"Europe","record_type":"unit_offer","layout_label":"2+1","price":{"currency":"USD","amount":410000,"basis":"cash","status":"source_stated_not_live","previous_advertised_amount":440000},"areas":[{"value_m2":127,"basis":"unspecified"}],"source_ids":["1L2Sempbh5Dpxs05zWOlNXXO7Q11P0H3v"],"availability_verified":false,"citizenship_eligibility":"not_independently_verified","price_effective_date":null,"details":{"project":"Pearl Residence","floor":"1","title_deed_source":"Ready","claims_requiring_confirmation":["1% VAT","Exemption from title deed transfer tax","Airbnb and short-term rental approved","High rental income","Fatih 5 min","Taksim 15 min","Istinye University 5 min","Bakirkoy coast and Fisekhane 10 min","Istanbul Airport 35 min","Walking distance to E-5, Metrobus, tram and metro"],"note":"No live discount or offer-expiry date established."}}'::jsonb where slug='pearl-topkapi-2-1-410';
update public.marketing_offers set source_record='{"slug":"gunesli-2-1-installment","marketing_title":"Güneşli 2+1 — Installment Offer","title_provenance":"proposed editorial title unless project name explicitly supplied","city":"Istanbul","location_label":"Güneşli","side":"Europe","record_type":"unit_offer","layout_label":"2+1","price":{"currency":"TRY","amount":null,"basis":"installment_schedule","status":"source_stated_not_live","down_payment_amount":6105000,"down_payment_percent":40,"delivery_payment_amount":4579000,"delivery_payment_percent":30,"installment_amount":190799,"installment_count":24,"calculated_component_sum":15263176,"calculation_note":"6,105,000 + 4,579,000 + 24 × 190,799; derived sum, not a printed total. Percentage amounts do not reconcile to one exact total."},"areas":[{"value_m2":98.85,"basis":"unspecified"}],"source_ids":["15sT4aVhH-wjWtG_ojhUsig-WWtqcJGyg"],"availability_verified":false,"citizenship_eligibility":"not_independently_verified","price_effective_date":null,"details":{"claims_requiring_confirmation":["No title deed costs","Expert fee waived","1% VAT","Altinbas University 8 min","Erdem Hospital 3 min","Ataturk Olympic Stadium 15 min","TEM highway 12 min","Istanbul Airport 25 min","Mall of Istanbul 12 min","Metro 5 min"],"note":"Do not convert to USD without a verified quote date and documented historical rate. Do not merge with a differently sized Gunesli offer."}}'::jsonb where slug='gunesli-2-1-installment';
update public.marketing_offers set source_record='{"slug":"sisli-ferikoy-duplex-490","marketing_title":"Feriköy City-View Duplex","title_provenance":"proposed editorial title unless project name explicitly supplied","city":"Istanbul","location_label":"Şişli–Feriköy","side":"Europe","record_type":"unit_offer","layout_label":"2+1 Duplex","price":{"currency":"USD","amount":490000,"basis":"cash","status":"source_stated_not_live"},"areas":[],"source_ids":["1PgBe9AUmm5IwyM8GDyeGuDj8Bi-1o9GH"],"availability_verified":false,"citizenship_eligibility":"not_independently_verified","price_effective_date":null,"details":{"status_source":"Ready to move","title_deed_source":"Ready","claims_requiring_confirmation":["Open city view","High ROI","Citizenship eligible","Nisantasi 5 min","Osmanbey 5 min","Osmanbey Metro 10 min walk","Taksim 20 min walk"]}}'::jsonb where slug='sisli-ferikoy-duplex-490';
update public.marketing_offers set source_record='{"slug":"gunesli-400-offer","marketing_title":"Güneşli 1+1 / 2+1 — Offer Details on Request","title_provenance":"proposed editorial title unless project name explicitly supplied","city":"Istanbul","location_label":"Güneşli","side":"Europe","record_type":"ambiguous_offer","layout_label":"1+1 garden and 2+1 advertised together","price":{"currency":"USD","amount":400000,"basis":"scope_unconfirmed","status":"source_stated_not_live"},"areas":[{"layout":"1+1 garden","value_m2":85,"basis":"unspecified"},{"layout":"2+1","value_m2":95,"basis":"unspecified"}],"source_ids":["1tTzR8Jsw4VTic1NQ6l4nD-FgvrVq6_qn","1LwJ5TbfuZ6t9A6818eDKGbuyCs3SjK2G"],"availability_verified":false,"citizenship_eligibility":"not_independently_verified","price_effective_date":null,"details":{"title_deed_source":"Ready","claims_requiring_confirmation":["Citizenship eligible","No title deed fees","Property valuation fee waived","1% VAT","Altinbas University 3 min","Ataturk Olympiad 5 min","Tema Istanbul 10 min","Istanbul Airport 40 min","Mall of Istanbul 5 min","Metro 2 min"],"note":"Same offer appears in two differently designed flyers. It is unclear whether $400,000 is a bundle price, alternative unit price, or another condition. One enquiry-led record; no exact-price budget matching until clarified."}}'::jsonb where slug='gunesli-400-offer';
update public.marketing_offers set source_record='{"slug":"terrace-duplex-487-location-pending","marketing_title":"1+1 Duplex with Private Terrace","title_provenance":"proposed editorial title unless project name explicitly supplied","city":"Istanbul","location_label":"Location to confirm","side":"unknown","record_type":"unit_offer","layout_label":"1+1 Duplex","price":{"currency":"USD","amount":487000,"basis":"cash","status":"source_stated_not_live"},"areas":[{"value_m2":183,"basis":"unspecified"}],"source_ids":["1kYBzTHpNqTtN-qcQQkQhZ5No3vFhVD0S"],"availability_verified":false,"citizenship_eligibility":"not_independently_verified","price_effective_date":null,"details":{"floor":"4","features_source":["Private terrace","24/7 security"],"status_source":"Ready project","title_deed_source":"Ready (Mülkiyet)","promotion_source":"Special offer for September; year not printed","claims_requiring_confirmation":["Osmanbey Metro 8 min walking","Taksim 20 min walking"],"note":"Do not label the September promotion as current in October. Nearby landmarks do not establish exact district/address."}}'::jsonb where slug='terrace-duplex-487-location-pending';
update public.marketing_offers set source_record='{"slug":"turkerler-ciftci-towers","marketing_title":"Türkerler Çiftçi Towers — Beşiktaş","title_provenance":"proposed editorial title unless project name explicitly supplied","city":"Istanbul","location_label":"Beşiktaş","side":"Europe","record_type":"project","layout_label":null,"price":{"currency":null,"amount":null,"basis":"on_request","status":"not_supplied"},"areas":[],"source_ids":["1p-U-XgaWFlV4LY0Fd_B62VTxn8dlWhH0"],"availability_verified":false,"citizenship_eligibility":"not_independently_verified","price_effective_date":null,"details":{"project":"Türkerler Çiftçi Towers","project_specs_source":{"height_m":196,"floors":45,"shopping_mall_commercial_area_m2":40000,"architecture":"John McAslan & Partners","engineering":"ARUP"},"note":"Project-level figures. Do not use 45 as an apartment floor or 40,000 m2 as unit area. No specific unit layouts/prices supplied."}}'::jsonb where slug='turkerler-ciftci-towers';
update public.marketing_offers set source_record='{"slug":"atakoy-sea-view-999","marketing_title":"Ataköy Sea-View Residence","title_provenance":"proposed editorial title unless project name explicitly supplied","city":"Istanbul","location_label":"Ataköy","side":"Europe","record_type":"unit_offer","layout_label":null,"price":{"currency":"USD","amount":999000,"basis":"special_offer","status":"source_stated_not_live"},"areas":[{"value_m2":126.98,"basis":"unspecified"}],"source_ids":["15-2VUnvflnsV0oHeuqW_gTjMoZoY-PnX"],"availability_verified":false,"citizenship_eligibility":"not_independently_verified","price_effective_date":null,"details":{"status_source":"Ready to move in","claims_requiring_confirmation":["Direct sea view","Private shoreline","Last one"],"note":"Do not publish live scarcity claim or guess the layout/project name."}}'::jsonb where slug='atakoy-sea-view-999';
update public.marketing_offers set source_record='{"slug":"sisli-duplex-460","marketing_title":"Şişli 2+1 Duplex","title_provenance":"proposed editorial title unless project name explicitly supplied","city":"Istanbul","location_label":"Şişli","side":"Europe","record_type":"unit_offer","layout_label":"2+1 Duplex","price":{"currency":"USD","amount":460000,"basis":"cash","status":"source_stated_not_live"},"areas":[],"source_ids":["1eHM1CnKD068A-ohABmQVYDulkxp9xmGa"],"availability_verified":false,"citizenship_eligibility":"not_independently_verified","price_effective_date":null,"details":{"status_source":"Ready to move","title_deed_source":"Ready","claims_requiring_confirmation":["Citizenship eligible","High ROI","Osmanbey Metro 10 min walk","Taksim 20 min walk"],"note":"Keep distinct from $490,000 Ferikoy duplex; identity is not established as the same unit."}}'::jsonb where slug='sisli-duplex-460';
update public.marketing_offers set source_record='{"slug":"topkapi-two-apartment-package-480","marketing_title":"Topkapı Two-Apartment Package","title_provenance":"proposed editorial title unless project name explicitly supplied","city":"Istanbul","location_label":"Topkapı","side":"Europe","record_type":"package","layout_label":"Two apartments; layouts not supplied","price":{"currency":"USD","amount":480000,"basis":"package","status":"source_stated_not_live"},"areas":[{"value_m2":66,"basis":"gross","scope":"each apartment","unit_count":2}],"source_ids":["1f7crcms0n5tBTK0diOF8pvDNv6T7dUt5"],"availability_verified":false,"citizenship_eligibility":"not_independently_verified","price_effective_date":null,"details":{"status_source":"Ready to move","features_source":["24/7 security"],"claims_requiring_confirmation":["Citizenship package","Airbnb","High rental income","Metro walking distance","On E5"],"note":"Package price, not per apartment. Two × 66 m2 gross; do not invent room layouts or merge with the separate 127 m2 Pearl offer."}}'::jsonb where slug='topkapi-two-apartment-package-480';
update public.marketing_offers set source_record='{"slug":"atasehir-173-1-1-420","marketing_title":"Ataşehir 173 — 1+1 Residence","title_provenance":"proposed editorial title unless project name explicitly supplied","city":"Istanbul","location_label":"Ataşehir","side":"Asia","record_type":"unit_type","layout_label":"1+1","price":{"currency":"USD","amount":420000,"basis":"cash","status":"source_stated_not_live"},"areas":[],"source_ids":["1Mv--JnZBe6mwHhjeL68CVe77pOWAL3CJ","1mHk4aqBP_n_N47BHEl5r_Sr4C2FECKHq","1PFRXtHXED-V-z_L-tWiEn5D8ANQVhgH8"],"availability_verified":false,"citizenship_eligibility":"not_independently_verified","price_effective_date":null,"details":{"project":"Ataşehir 173","developer_source":"DAP Yapı","project_layouts_source":["1+1","2+1","3+1"],"project_features_source":["Balconies","USD and TRY installment alternatives","Up to 24-month installments"],"delivery_source":"18 months; anchor date not established","claims_requiring_confirmation":["Emlak Konut assurance / government guarantee wording","Ready title deed","No extra fees","No expertise report needed","Citizenship suitability","5 min to Atasehir Finance Center","Near hospitals, schools, malls and transportation"],"note":"Only the 1+1 has a supplied price. Do not apply $420,000 to 2+1/3+1."}}'::jsonb where slug='atasehir-173-1-1-420';
update public.marketing_offers set source_record='{"slug":"oryapark-1-1-325","marketing_title":"Avrupa Residence Oryapark — 1+1","title_provenance":"proposed editorial title unless project name explicitly supplied","city":"Istanbul","location_label":"Ümraniye","side":"Asia","record_type":"unit_type","layout_label":"1+1","price":{"currency":"USD","amount":325000,"basis":"advertised","status":"source_stated_not_live"},"areas":[{"value_m2":79,"basis":"unspecified"}],"source_ids":["1OO60sr7XWdqldnGULjR_XyWnfk-orgCo"],"availability_verified":false,"citizenship_eligibility":"not_independently_verified","price_effective_date":null,"details":{"project":"Avrupa Residence Oryapark","developer_source":"Artaş","delivery_source":"3 months later; anchor date not established","note":"79 m2 is not explicitly labelled gross in this flyer. Do not inherit the 2+1 area basis or explicit delivery date automatically."}}'::jsonb where slug='oryapark-1-1-325';
update public.marketing_offers set source_record='{"slug":"oryapark-2-1-quote","marketing_title":"Avrupa Residence Oryapark — 2+1","title_provenance":"proposed editorial title unless project name explicitly supplied","city":"Istanbul","location_label":"Ümraniye","side":"Asia","record_type":"unit_type","layout_label":"2+1","price":{"currency":"USD","amount":null,"basis":"conflicting_starting_prices","status":"requires_confirmation","source_offers":[{"amount":475000,"basis":"starting_from","source_id":"1O0nFmQk9A4rj3-Jgblwb1C3A_negl2Ao","area_m2":null},{"amount":515000,"basis":"starting_from","source_id":"16yjkxBghSvQP7SXsPwCyGRM3jFT36olO","gross_area_m2":136,"kitchen":"closed"}]},"areas":[{"value_m2":136,"basis":"gross"}],"source_ids":["16yjkxBghSvQP7SXsPwCyGRM3jFT36olO","1OoDj6OVodRx1Yr5et7Kpwr0qXF7VUoxg","1O0nFmQk9A4rj3-Jgblwb1C3A_negl2Ao","1-C-UT26lzMbVxPN-Ngx7hcm2Bm2WQVDM","1UqKK8LlQ3zW3GT0hMDFv4c2Z1PTksGMi","1bjtgyqkScE5npFFVfJgq-SpVQ3WH9Irf"],"availability_verified":false,"citizenship_eligibility":"not_independently_verified","price_effective_date":null,"details":{"project":"Avrupa Residence Oryapark","developer_source":"Artaş / Artaş Holding","kitchen_source":"Closed, for 136 m2 / $515,000 offer","delivery_source":"30 November 2026 in text note; other flyers say 3 months later","title_deed_source":"Ready","claims_requiring_confirmation":["Valuation report ready","Citizenship suitability","High rental income","Amazing view","Full facilities","Close to metro/shopping mall/Financial Center"],"note":"One grouped 2+1 record pending clarification. Do not imply the $475,000 variant has 136 m2 or the same kitchen. Identical $515,000 flyer exists in two folders and must not create two listings."}}'::jsonb where slug='oryapark-2-1-quote';
update public.marketing_offers set source_record='{"slug":"sisli-1-1-july-2027-488","marketing_title":"Avrupa Konutları Şişli — Ground-Floor 1+1","title_provenance":"proposed editorial title unless project name explicitly supplied","city":"Istanbul","location_label":"Şişli","side":"Europe","record_type":"unit_offer","layout_label":"1+1","price":{"currency":"USD","amount":488000,"basis":"cash","status":"source_stated_not_live","previous_advertised_amount":651000},"areas":[{"value_m2":81.27,"basis":"gross"}],"source_ids":["1ryaPLeqKEYWGBD-amStBEkVsDdwx4KYc"],"availability_verified":false,"citizenship_eligibility":"not_independently_verified","price_effective_date":null,"details":{"project":"Avrupa Konutları Şişli","block":"5","floor":"Ground floor","title_deed_source":"Ready","delivery_source":null,"claims_requiring_confirmation":["Citizenship suitability","No appraisal required"],"note":"Legacy slug retained for route compatibility only. Despite its slug, this Drive flyer supplies no July 2027 delivery date. Do not show a live discount without confirmation."}}'::jsonb where slug='sisli-1-1-july-2027-488';
update public.marketing_offers set source_record='{"slug":"sisli-block5-floor2-unit21-497","marketing_title":"Avrupa Konutları Şişli — 1+1, Unit 21","title_provenance":"proposed editorial title unless project name explicitly supplied","city":"Istanbul","location_label":"Şişli","side":"Europe","record_type":"unit_offer","layout_label":"1+1","price":{"currency":"USD","amount":497000,"basis":"cash","status":"source_stated_not_live"},"areas":[{"value_m2":81.27,"basis":"unspecified"}],"source_ids":["1NIQ-gl4CN6ZR1GY1Wsc8xX4wXeg-Ov3_"],"availability_verified":false,"citizenship_eligibility":"not_independently_verified","price_effective_date":null,"details":{"project":"Avrupa Konutları Şişli","block":"5","floor":"2","unit":"21","delivery_source":"August 2027","title_deed_source":"Ready","features_source":["Landscape view"],"note":"Separate unit from ground-floor $488,000 offer. Area shown as 81.27 m2 without explicit gross/net label. Do not inherit ground-floor metadata. Flyer includes Is GYO branding."}}'::jsonb where slug='sisli-block5-floor2-unit21-497';
update public.marketing_offers set source_record='{"slug":"avrupa-gunesli-b10-f2-u40","marketing_title":"Avrupa Konutları Güneşli — Block 10, Unit 40","title_provenance":"proposed editorial title unless project name explicitly supplied","city":"Istanbul","location_label":"Güneşli","side":"Europe","record_type":"unit_offer","layout_label":"2+1","price":{"currency":"USD","amount":418000,"basis":"cash","status":"source_stated_not_live","expenses_amount":21000,"calculated_price_plus_expenses":439000,"list_price":486800},"areas":[],"source_ids":["1Thn5zFLowvQAKpsZkt0s2mG8_knyOaLn","1WAau8qqACO1yWbk9uPAffAzB_lhbAPUK","1ohOI4dvHW2m_Clnaza2DzuHUzpkXkHQ7"],"availability_verified":false,"citizenship_eligibility":"not_independently_verified","price_effective_date":null,"details":{"project":"Avrupa Konutları Güneşli","block":"10","floor":"2","unit":"40","kitchen_source":"Open","unit_area_unconfirmed":true,"supporting_plan":{"type":"2+1 G","gross_range_m2":[116.28,116.53],"net_range_m2":[69.58,70.01],"net_plus_open_balcony_range_m2":[74.52,74.95],"balcony_m2":4.94,"bathrooms_drawn":2,"exact_unit_match":"not_confirmed"},"note":"Family-plan ranges, not exact areas for unit 40. $439,000 is arithmetic cash price + stated expenses, not a verified all-inclusive transaction total. Source video shows door 06 and is not verified as unit 40."}}'::jsonb where slug='avrupa-gunesli-b10-f2-u40';

create unique index unique_deal_unit on public.deal_selected_units(deal_id,physical_unit_id) where physical_unit_id is not null;
grant select(id) on public.marketing_offers to anon;
grant select on public.property_slug_redirects to anon;
create policy public_redirect on public.property_slug_redirects for select to anon using(exists(select 1 from public.marketing_offers m where m.id=target_offer_id and m.publication='Published' and m.published_snapshot is not null));
create function public.published_redirect(p_slug text) returns text language sql stable security invoker set search_path='' as $$select new_slug from public.property_slug_redirects where old_slug=p_slug$$;
revoke all on function public.published_redirect(text) from public;
grant execute on function public.published_redirect(text) to anon;
create function private.staff_create_enquiry(p_data jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
if private.staff_role() not in ('admin','manager','agent') or private.staff_role() is null then raise exception 'Staff access required' using errcode='42501';end if;
if length(trim(p_data->>'name'))<2 or nullif(trim(p_data->>'topic'),'') is null or length(trim(p_data->>'message'))<5 then raise exception 'Name, topic and message required';end if;
insert into public.enquiries(ref_number,name,email,phone,topic,budget,raw_budget_text,message,source,property_slug,offer_id,assigned_agent_id)
values('AVR-'||gen_random_uuid()::text,trim(p_data->>'name'),coalesce(p_data->>'email',''),coalesce(p_data->>'phone',''),p_data->>'topic',p_data->>'budget',p_data->>'budget',p_data->>'message',coalesce(p_data->>'source','Contact Brief'),p_data->>'property_slug',(select id from public.marketing_offers where slug=p_data->>'property_slug'),auth.uid()) returning id into result;
return result;
end $$;
create function public.staff_create_enquiry(p_data jsonb) returns uuid language sql security invoker set search_path='' as $$select private.staff_create_enquiry(p_data)$$;
revoke all on function private.staff_create_enquiry(jsonb),public.staff_create_enquiry(jsonb) from public,anon;
grant execute on function private.staff_create_enquiry(jsonb),public.staff_create_enquiry(jsonb) to authenticated;
alter table public.enquiries add column payload_hash text;
create function private.accept_enquiry(p_data jsonb,p_rate_key text,p_payload_hash text) returns text language plpgsql security definer set search_path='' as $$
declare counter integer;receipt text;previous_hash text;bucket timestamptz=date_trunc('hour',now());offer uuid;
begin
if current_setting('request.jwt.claims',true)::jsonb->>'role' is distinct from 'service_role' and session_user<>'postgres' then raise exception 'Server access required' using errcode='42501';end if;
if length(trim(coalesce(p_data->>'name','')))<2 or length(p_data->>'name')>200 or
coalesce(p_data->>'email','') !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' or length(p_data->>'email')>254 or
length(regexp_replace(coalesce(p_data->>'phone',''),'\D','','g')) not between 7 and 18 or
length(trim(coalesce(p_data->>'message',''))) not between 5 and 4000 or
length(coalesce(p_data->>'topic','')) not between 1 and 200 or length(coalesce(p_data->>'budget',''))>200 then raise exception 'Invalid enquiry';end if;
if p_data->>'idempotency_key' !~ '^[0-9a-fA-F-]{36}$' then raise exception 'Invalid submission key';end if;
perform pg_advisory_xact_lock(hashtextextended(p_data->>'idempotency_key',0));
select ref_number,payload_hash into receipt,previous_hash from public.enquiries where idempotency_key=p_data->>'idempotency_key';
if found then if previous_hash is distinct from p_payload_hash then raise exception 'Submission key already used';end if;return receipt;end if;
insert into public.rate_limit_entries(rate_key,window_start,count) values(p_rate_key,bucket,1)
on conflict(rate_key,window_start) do update set count=public.rate_limit_entries.count+1 returning count into counter;
if counter>5 then raise exception 'Too many enquiries. Please try later' using errcode='P0001';end if;
select id into offer from public.marketing_offers where slug=p_data->>'property_slug' and publication='Published';
receipt='AVR-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12));
insert into public.enquiries(ref_number,name,email,phone,topic,budget,raw_budget_text,message,source,property_slug,offer_id,idempotency_key,ip_hash,payload_hash)
values(receipt,trim(p_data->>'name'),lower(trim(p_data->>'email')),trim(p_data->>'phone'),p_data->>'topic',p_data->>'budget',p_data->>'budget',trim(p_data->>'message'),'Website Consultation',case when offer is not null then p_data->>'property_slug' end,offer,p_data->>'idempotency_key',p_rate_key,p_payload_hash);
return receipt;
end $$;
create function public.accept_enquiry(p_data jsonb,p_rate_key text,p_payload_hash text) returns text language sql security invoker set search_path='' as $$select private.accept_enquiry(p_data,p_rate_key,p_payload_hash)$$;
revoke all on function private.accept_enquiry(jsonb,text,text),public.accept_enquiry(jsonb,text,text) from public,anon,authenticated;
grant usage on schema private to service_role;
grant execute on function private.accept_enquiry(jsonb,text,text),public.accept_enquiry(jsonb,text,text) to service_role;

create function private.website_page(p_slug text) returns jsonb language sql stable security definer set search_path='' as $$
select case when p.published_status<>'Published' then jsonb_build_object('published',false)
else jsonb_build_object('published',true,'title',p.title,'meta_description',p.meta_description,'sections',(select coalesce(jsonb_agg(jsonb_build_object('title',s.title,'content_json',s.content_json) order by s.sort_order,s.id),'[]') from public.content_sections s where s.page_id=p.id)) end
from public.content_pages p where p.slug=p_slug $$;
create function public.website_page(p_slug text) returns jsonb language sql stable security invoker set search_path='' as $$select private.website_page(p_slug)$$;
revoke all on function private.website_page(text),public.website_page(text) from public;
grant usage on schema private to anon;
grant execute on function private.website_page(text),public.website_page(text) to anon,authenticated;

create function private.activity_guard() returns trigger language plpgsql set search_path='' as $$
declare allowed boolean=false;
begin
if new.user_id is distinct from auth.uid() then raise exception 'Activity actor mismatch';end if;
if private.manager() then return new;end if;
if new.ref_kind in ('lead','leads') then select exists(select 1 from public.leads where id=new.ref_id and private.writer(assigned_agent_id)) into allowed;
elsif new.ref_kind in ('task','tasks') then select exists(select 1 from public.tasks where id=new.ref_id and private.writer(assignee_id)) into allowed;
elsif new.ref_kind in ('contact','contacts') then select exists(select 1 from public.contacts where id=new.ref_id and private.writer(assigned_agent_id)) into allowed;
elsif new.ref_kind in ('deal','deals') then select exists(select 1 from public.deals where id=new.ref_id and private.writer(assigned_agent_id)) into allowed;end if;
if not allowed then raise exception 'Activity requires an assigned parent record';end if;
return new;
end $$;
revoke all on function private.activity_guard() from public,anon;
grant execute on function private.activity_guard() to authenticated;
create trigger activity_guard before insert on public.activities for each row when(current_user='authenticated') execute function private.activity_guard();

create function private.unit_guard() returns trigger language plpgsql set search_path='' as $$
begin
if old.status in ('Reserved','Sold','Rented') and (new.status is distinct from old.status or new.unit_number is distinct from old.unit_number or new.project_id is distinct from old.project_id or new.building_id is distinct from old.building_id) then raise exception 'Reserved or closed units require a reviewed transaction';end if;return new;
end $$;
revoke all on function private.unit_guard() from public,anon;
grant execute on function private.unit_guard() to authenticated;
create trigger guard_unit before update on public.physical_units for each row when(current_user='authenticated') execute function private.unit_guard();
create function private.expire_reservations() returns integer language plpgsql security definer set search_path='' as $$
declare r record;counter integer=0;
begin
if not private.manager() and coalesce(auth.jwt()->>'role','')<>'service_role' and not(session_user='postgres' and auth.uid() is null) then raise exception 'Manager or scheduler access required' using errcode='42501';end if;
for r in select id,physical_unit_id,offer_id from public.reservations where status='active' and expires_at<=now() order by physical_unit_id loop
perform 1 from public.physical_units where id=r.physical_unit_id for update;
update public.reservations set status='expired' where id=r.id and status='active' and expires_at<=now();
if found then
update public.physical_units set status='Available' where id=r.physical_unit_id and status='Reserved';
update public.marketing_offers set availability='Available',version=version+1 where physical_unit_id=r.physical_unit_id and availability='Reserved';
counter=counter+1;
end if;end loop;
return counter;
end $$;
create function public.expire_reservations() returns integer language sql security invoker set search_path='' as $$select private.expire_reservations()$$;
revoke all on function private.expire_reservations(),public.expire_reservations() from public,anon;
grant execute on function private.expire_reservations(),public.expire_reservations() to authenticated,service_role;
create function private.refresh_snapshot_availability() returns trigger language plpgsql set search_path='' as $$
begin
if new.published_snapshot is not null and new.availability is distinct from old.availability then
new.published_snapshot=jsonb_set(jsonb_set(new.published_snapshot,'{availability}',to_jsonb(new.availability)),'{availability_verified}',to_jsonb(new.availability='Available'));
end if;return new;
end $$;
revoke all on function private.refresh_snapshot_availability() from public,anon,authenticated;
create trigger snapshot_availability before update on public.marketing_offers for each row execute function private.refresh_snapshot_availability();
-- A scheduler can call the service-only RPC every five minutes. No external cron is created here.

grant update on public.notification_receipts to authenticated;

alter table public.contacts add constraint contact_name_valid check(length(trim(name)) between 1 and 200);
alter table public.tasks add constraint task_title_valid check(length(trim(title)) between 1 and 500);
alter table public.site_settings add constraint settings_values_valid check(preloader_opacity between 0 and 1 and exchange_rate_eur>0 and exchange_rate_try>0 and exchange_rate_gbp>0 and cbi_threshold_usd>0);
create trigger record_audit after insert or update on public.projects for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.buildings for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.physical_units for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.content_sections for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.catalog_documents for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.leases for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.vendors for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.maintenance_tickets for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.extraction_candidates for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.document_checklists for each row execute function private.audit_record();
