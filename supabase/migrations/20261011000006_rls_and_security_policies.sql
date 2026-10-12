-- Migration: 20261011000006_rls_and_security_policies.sql
-- Description: Row Level Security (RLS) policies and storage bucket configuration

-- 1. Enable RLS on all tables
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physical_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instalment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_slug_redirects ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_merges ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_selected_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recorded_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_allocations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extraction_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_entries ENABLE ROW LEVEL SECURITY;

-- 2. Staff Profiles Policies
CREATE POLICY "staff_read_profiles" ON public.staff_profiles
  FOR SELECT USING (public.is_active_staff());

CREATE POLICY "admin_manage_staff" ON public.staff_profiles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 3. Public Website Read Policies
CREATE POLICY "public_read_site_settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "public_read_published_offers" ON public.marketing_offers
  FOR SELECT USING (publication = 'Published' OR public.is_active_staff());

CREATE POLICY "public_read_pricing_options" ON public.pricing_options
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.marketing_offers WHERE id = pricing_options.offer_id AND (publication = 'Published' OR public.is_active_staff()))
  );

CREATE POLICY "public_read_instalment_schedules" ON public.instalment_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pricing_options po
      JOIN public.marketing_offers mo ON mo.id = po.offer_id
      WHERE po.id = instalment_schedules.pricing_option_id AND (mo.publication = 'Published' OR public.is_active_staff())
    )
  );

CREATE POLICY "public_read_projects" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "public_read_developers" ON public.developers
  FOR SELECT USING (true);

CREATE POLICY "public_read_amenities" ON public.amenities
  FOR SELECT USING (true);

CREATE POLICY "public_read_offer_amenities" ON public.offer_amenities
  FOR SELECT USING (true);

CREATE POLICY "public_read_package_memberships" ON public.package_memberships
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.marketing_offers WHERE id = package_memberships.package_offer_id AND (publication = 'Published' OR public.is_active_staff()))
  );

CREATE POLICY "public_read_redirects" ON public.property_slug_redirects
  FOR SELECT USING (true);

CREATE POLICY "public_read_content_pages" ON public.content_pages
  FOR SELECT USING (published_status = 'Published' OR public.is_active_staff());

CREATE POLICY "public_read_content_sections" ON public.content_sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.content_pages WHERE id = content_sections.page_id AND (published_status = 'Published' OR public.is_active_staff()))
  );

CREATE POLICY "public_read_services" ON public.services
  FOR SELECT USING (is_published = true OR public.is_active_staff());

CREATE POLICY "public_read_faqs" ON public.faqs
  FOR SELECT USING (is_published = true OR public.is_active_staff());

CREATE POLICY "public_read_catalog_documents" ON public.catalog_documents
  FOR SELECT USING (is_published = true OR public.is_active_staff());

-- 4. Public Enquiry Submission (Insert-only with validation, no public read)
CREATE POLICY "public_insert_enquiry" ON public.enquiries
  FOR INSERT WITH CHECK (
    char_length(name) >= 2 AND
    char_length(email) >= 5 AND
    char_length(phone) >= 7 AND
    char_length(message) >= 5 AND
    status = 'New' AND
    lead_id IS NULL AND
    contact_id IS NULL
  );

CREATE POLICY "staff_read_enquiries" ON public.enquiries
  FOR SELECT USING (public.is_active_staff());

CREATE POLICY "staff_manage_enquiries" ON public.enquiries
  FOR UPDATE USING (public.is_manager() OR (public.is_agent() AND EXISTS (SELECT 1 FROM public.leads l WHERE l.enquiry_id = enquiries.id AND l.assigned_agent_id = auth.uid())));

-- 5. Staff Inventory Management Policies
CREATE POLICY "staff_manage_inventory_managers" ON public.marketing_offers
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "agent_update_own_offers" ON public.marketing_offers
  FOR UPDATE USING (public.is_agent() AND assigned_agent_id = auth.uid())
  WITH CHECK (public.is_agent() AND assigned_agent_id = auth.uid());

CREATE POLICY "manager_manage_pricing" ON public.pricing_options
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "manager_manage_schedules" ON public.instalment_schedules
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "staff_read_units" ON public.physical_units
  FOR SELECT USING (public.is_active_staff());

CREATE POLICY "manager_manage_units" ON public.physical_units
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "staff_read_buildings" ON public.buildings
  FOR SELECT USING (public.is_active_staff());

CREATE POLICY "manager_manage_buildings" ON public.buildings
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "manager_manage_projects" ON public.projects
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "manager_manage_developers" ON public.developers
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "manager_manage_amenities" ON public.amenities
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "manager_manage_offer_amenities" ON public.offer_amenities
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "manager_manage_packages" ON public.package_memberships
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "staff_read_history" ON public.price_history
  FOR SELECT USING (public.is_active_staff());

CREATE POLICY "staff_read_avail_history" ON public.availability_history
  FOR SELECT USING (public.is_active_staff());

CREATE POLICY "staff_read_publ_history" ON public.publication_history
  FOR SELECT USING (public.is_active_staff());

CREATE POLICY "manager_manage_redirects" ON public.property_slug_redirects
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

-- 6. CRM Policies (Contacts, Leads, Tasks, Viewings, Activities, Notes)
CREATE POLICY "staff_read_contacts" ON public.contacts
  FOR SELECT USING (public.is_active_staff());

CREATE POLICY "staff_manage_contacts" ON public.contacts
  FOR ALL USING (public.is_manager() OR (public.is_agent() AND (assigned_agent_id IS NULL OR assigned_agent_id = auth.uid())))
  WITH CHECK (public.is_manager() OR (public.is_agent() AND (assigned_agent_id IS NULL OR assigned_agent_id = auth.uid())));

CREATE POLICY "staff_read_leads" ON public.leads
  FOR SELECT USING (public.is_active_staff());

CREATE POLICY "staff_manage_leads" ON public.leads
  FOR ALL USING (public.is_manager() OR (public.is_agent() AND (assigned_agent_id IS NULL OR assigned_agent_id = auth.uid())))
  WITH CHECK (public.is_manager() OR (public.is_agent() AND (assigned_agent_id IS NULL OR assigned_agent_id = auth.uid())));

CREATE POLICY "staff_read_buyer_reqs" ON public.buyer_requirements
  FOR SELECT USING (public.is_active_staff());

CREATE POLICY "staff_manage_buyer_reqs" ON public.buyer_requirements
  FOR ALL USING (public.is_agent());

CREATE POLICY "staff_read_shortlists" ON public.contact_shortlists
  FOR SELECT USING (public.is_active_staff());

CREATE POLICY "staff_manage_shortlists" ON public.contact_shortlists
  FOR ALL USING (public.is_agent());

CREATE POLICY "staff_read_tasks" ON public.tasks
  FOR SELECT USING (public.is_active_staff());

CREATE POLICY "staff_manage_tasks" ON public.tasks
  FOR ALL USING (public.is_manager() OR (public.is_agent() AND (assignee_id = auth.uid() OR created_by = auth.uid())))
  WITH CHECK (public.is_manager() OR (public.is_agent() AND (assignee_id = auth.uid() OR created_by = auth.uid())));

CREATE POLICY "staff_read_viewings" ON public.viewings
  FOR SELECT USING (public.is_active_staff());

CREATE POLICY "staff_manage_viewings" ON public.viewings
  FOR ALL USING (public.is_manager() OR (public.is_agent() AND agent_id = auth.uid()))
  WITH CHECK (public.is_manager() OR (public.is_agent() AND agent_id = auth.uid()));

CREATE POLICY "staff_read_activities" ON public.activities
  FOR SELECT USING (public.is_active_staff());

CREATE POLICY "staff_insert_activities" ON public.activities
  FOR INSERT WITH CHECK (public.is_active_staff());

CREATE POLICY "staff_read_notes" ON public.notes
  FOR SELECT USING (public.is_active_staff() AND (NOT is_private OR author_id = auth.uid() OR public.is_admin()));

CREATE POLICY "staff_manage_notes" ON public.notes
  FOR ALL USING (author_id = auth.uid() OR public.is_admin())
  WITH CHECK (author_id = auth.uid() OR public.is_admin());

CREATE POLICY "staff_manage_merges" ON public.contact_merges
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

-- 7. Transactions Policies (Deals, Selected Units, Reservations, Payments, Commissions)
CREATE POLICY "staff_read_deals" ON public.deals
  FOR SELECT USING (public.is_active_staff());

CREATE POLICY "staff_manage_deals" ON public.deals
  FOR ALL USING (public.is_manager() OR (public.is_agent() AND assigned_agent_id = auth.uid()))
  WITH CHECK (public.is_manager() OR (public.is_agent() AND assigned_agent_id = auth.uid()));

CREATE POLICY "staff_manage_selected_units" ON public.deal_selected_units
  FOR ALL USING (public.is_manager() OR (public.is_agent() AND EXISTS (SELECT 1 FROM public.deals WHERE id = deal_selected_units.deal_id AND assigned_agent_id = auth.uid())));

CREATE POLICY "staff_manage_revisions" ON public.offer_revisions
  FOR ALL USING (public.is_manager() OR (public.is_agent() AND EXISTS (SELECT 1 FROM public.deals WHERE id = offer_revisions.deal_id AND assigned_agent_id = auth.uid())));

CREATE POLICY "staff_manage_reservations" ON public.reservations
  FOR ALL USING (public.is_agent());

CREATE POLICY "staff_manage_checklists" ON public.document_checklists
  FOR ALL USING (public.is_agent());

CREATE POLICY "staff_manage_milestones" ON public.payment_milestones
  FOR ALL USING (public.is_manager());

CREATE POLICY "staff_read_payments" ON public.recorded_payments
  FOR SELECT USING (public.is_active_staff());

CREATE POLICY "manager_manage_payments" ON public.recorded_payments
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "manager_manage_commissions" ON public.commission_allocations
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "agent_read_own_commissions" ON public.commission_allocations
  FOR SELECT USING (agent_id = auth.uid());

-- 8. Rental Policies
CREATE POLICY "staff_read_leases" ON public.leases
  FOR SELECT USING (public.is_active_staff());

CREATE POLICY "manager_manage_leases" ON public.leases
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "staff_read_charges" ON public.rent_charges
  FOR SELECT USING (public.is_active_staff());

CREATE POLICY "manager_manage_charges" ON public.rent_charges
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "manager_manage_allocations" ON public.rent_payment_allocations
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "manager_manage_deposits" ON public.rental_deposits
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "staff_read_vendors" ON public.vendors
  FOR SELECT USING (public.is_active_staff());

CREATE POLICY "manager_manage_vendors" ON public.vendors
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "staff_manage_tickets" ON public.maintenance_tickets
  FOR ALL USING (public.is_agent());

-- 9. CMS & Settings Management
CREATE POLICY "manager_manage_settings" ON public.site_settings
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "manager_manage_pages" ON public.content_pages
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "manager_manage_sections" ON public.content_sections
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "manager_manage_services" ON public.services
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "manager_manage_faqs" ON public.faqs
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "manager_manage_catalog" ON public.catalog_documents
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

-- 10. Audit, Notifications & System
CREATE POLICY "staff_read_audit" ON public.audit_events
  FOR SELECT USING (public.is_manager());

CREATE POLICY "staff_read_own_notifications" ON public.notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "staff_update_own_notifications" ON public.notifications
  FOR UPDATE USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "staff_manage_storage_files" ON public.storage_files
  FOR ALL USING (public.is_active_staff());

CREATE POLICY "admin_manage_source_files" ON public.source_files
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "admin_manage_candidates" ON public.extraction_candidates
  FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY "admin_manage_import_runs" ON public.import_runs
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Rate limiting table is accessible by server/security definer functions
CREATE POLICY "rate_limit_policy" ON public.rate_limit_entries
  FOR ALL USING (true) WITH CHECK (true);

-- 11. Storage Buckets Creation and Policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('public-marketing', 'public-marketing', true, 26214400, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf', 'video/mp4']),
  ('private-source', 'private-source', false, 52428800, NULL),
  ('private-documents', 'private-documents', false, 26214400, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "public_view_marketing_media" ON storage.objects
  FOR SELECT USING (bucket_id = 'public-marketing');

CREATE POLICY "staff_manage_marketing_media" ON storage.objects
  FOR ALL USING (bucket_id = 'public-marketing' AND public.is_active_staff())
  WITH CHECK (bucket_id = 'public-marketing' AND public.is_active_staff());

CREATE POLICY "staff_view_source_media" ON storage.objects
  FOR SELECT USING (bucket_id = 'private-source' AND public.is_active_staff());

CREATE POLICY "admin_manage_source_media" ON storage.objects
  FOR ALL USING (bucket_id = 'private-source' AND public.is_admin())
  WITH CHECK (bucket_id = 'private-source' AND public.is_admin());

CREATE POLICY "staff_view_documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'private-documents' AND public.is_active_staff());

CREATE POLICY "agent_manage_documents" ON storage.objects
  FOR ALL USING (bucket_id = 'private-documents' AND public.is_agent())
  WITH CHECK (bucket_id = 'private-documents' AND public.is_agent());
