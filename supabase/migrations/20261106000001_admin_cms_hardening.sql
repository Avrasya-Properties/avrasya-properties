-- ============================================================================
-- Migration: 20261106000001_admin_cms_hardening.sql
-- Description: Milestone M1: Admin Panel & CMS Backend Hardening:
--   1. RBAC Alignment: Document explicit role hierarchy (Super Admin -> admin,
--      Admin -> manager, Editor -> agent, Viewer -> viewer).
--   2. Services Hardening: Add icon, cta_label, cta_link columns.
--   3. Marketing Offers SEO Hardening: Add seo_title, seo_description, og_image_url.
--   4. Site Settings Dynamic Layout: Add navigation_items and footer_settings JSONB.
--   5. Storage Metadata & RLS: Allow authenticated staff uploads and file management.
--   6. Content Audit Triggers: Record inserts, updates, and deletes across CMS entities.
-- Idempotency: All statements use IF NOT EXISTS / OR REPLACE / DROP ... IF EXISTS.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ROLE-BASED ACCESS CONTROL (RBAC) ALIGNMENT
-- ----------------------------------------------------------------------------
-- The platform enforces four administrative roles mapped to the staff_role enum:
--   - 'admin'   => Super Admin : Full control, staff accounts, backups, last-admin guard.
--   - 'manager' => Admin       : Inventory management, CMS pages, services, inquiries.
--   - 'agent'   => Editor      : Assigned listing drafting, CRM leads, viewing records.
--   - 'viewer'  => Viewer      : Read-only analytics & auditing access.
COMMENT ON TYPE public.staff_role IS 'Administrative RBAC roles: admin (Super Admin), manager (Admin), agent (Editor), viewer (Viewer)';

-- ----------------------------------------------------------------------------
-- 2. SERVICES ENHANCEMENTS
-- ----------------------------------------------------------------------------
-- Support custom Lucide icon identifiers, CTA button labels, and CTA button destinations.
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS cta_label TEXT,
  ADD COLUMN IF NOT EXISTS cta_link TEXT;

COMMENT ON COLUMN public.services.icon IS 'Lucide icon identifier (e.g. ShieldCheck, Briefcase, KeyRound)';
COMMENT ON COLUMN public.services.cta_label IS 'Call-to-action button label text';
COMMENT ON COLUMN public.services.cta_link IS 'Call-to-action button URL or internal route path';

-- ----------------------------------------------------------------------------
-- 3. MARKETING OFFERS DYNAMIC SEO & OG TAGS
-- ----------------------------------------------------------------------------
-- Entity-level dynamic SEO metadata controls for property listings.
ALTER TABLE public.marketing_offers
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url TEXT;

COMMENT ON COLUMN public.marketing_offers.seo_title IS 'Custom page title override for search engine optimization';
COMMENT ON COLUMN public.marketing_offers.seo_description IS 'Custom meta description for search engine result snippets';
COMMENT ON COLUMN public.marketing_offers.og_image_url IS 'Open Graph image preview URL for social sharing cards';

-- Stored procedure update: Allow saving and snapshotting SEO columns atomically
CREATE OR REPLACE FUNCTION private.save_offer(p_data jsonb, p_version integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  old_row public.marketing_offers;
  r public.marketing_offers;
  wanted public.publication_status;
  snapshot jsonb;
begin
  if not private.manager() then
    raise exception 'Manager access required' using errcode='42501';
  end if;

  if p_data->>'id' is not null then
    select * into old_row from public.marketing_offers where id=(p_data->>'id')::uuid for update;
    if not found then
      raise exception 'Offer not found';
    end if;
    if old_row.version is distinct from p_version then
      raise exception 'This offer changed. Refresh before saving' using errcode='40001';
    end if;
    if exists(select 1 from public.reservations where offer_id=old_row.id and status='active') and
       ((p_data ? 'availability' and (p_data->>'availability')::public.property_availability is distinct from old_row.availability) or
        (p_data ? 'mode' and p_data->>'mode' is distinct from old_row.mode)) then
      raise exception 'Reserved inventory requires a deal transition';
    end if;
  else
    old_row.id = gen_random_uuid();
    old_row.version = 0;
    old_row.created_at = now();
    old_row.publication = 'Draft';
    old_row.availability = 'Unknown';
    old_row.mode = 'sale';
    old_row.city = 'Istanbul';
    old_row.side = 'unknown';
    old_row.price_basis = 'advertised';
    old_row.cbi_eligible = false;
    old_row.cbi_verified = false;
    old_row.claims_requiring_confirmation = '{}';
  end if;

  -- Explicit fields prevent actor, verified-claim, and snapshot forgery.
  r = jsonb_populate_record(
    old_row,
    (
      select coalesce(jsonb_object_agg(key, value), '{}')
      from jsonb_each(p_data)
      where key = any(array[
        'ref','slug','marketing_title','district','city','record_type','mode',
        'layout_label','bathrooms','gross_m2','net_m2','area_m2','amount','currency',
        'price_type','price_basis','availability','publication','assigned_agent_id',
        'cover_image_path','description','source_note','side','tapu_status','project_id',
        'seo_title','seo_description','og_image_url'
      ])
    )
  );

  if nullif(trim(r.marketing_title), '') is null or nullif(trim(r.ref), '') is null or r.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Title, reference and a valid slug are required';
  end if;
  if r.price_type <> 'on-request' and (r.amount is null or r.currency is null) then
    raise exception 'Price and currency are required';
  end if;
  if r.price_basis = 'installment_schedule' and r.currency is distinct from old_row.currency and old_row.version > 0 then
    raise exception 'Confirm a new price basis before changing an instalment offer currency';
  end if;

  wanted = r.publication;
  r.version = old_row.version + 1;
  r.updated_by = auth.uid();
  r.created_by = coalesce(old_row.created_by, auth.uid());
  r.updated_at = now();

  if p_data ? 'gallery_images' then
    if jsonb_typeof(p_data->'gallery_images') <> 'array' or jsonb_array_length(p_data->'gallery_images') > 20 then
      raise exception 'Use up to 20 gallery photos';
    end if;
    if exists(select 1 from jsonb_array_elements_text(p_data->'gallery_images') value where length(value) > 2048 or value !~ '^(https://|/images/)[^[:space:]]+$') then
      raise exception 'Use valid image links';
    end if;
    r.source_record = jsonb_set(
      coalesce(r.source_record, '{}'),
      '{details}',
      coalesce(r.source_record->'details', '{}') || jsonb_build_object('gallery_images', p_data->'gallery_images')
    );
  end if;

  if p_data ? 'floor_plan' then
    if p_data->>'floor_plan' is not null and (length(p_data->>'floor_plan') > 2048 or p_data->>'floor_plan' !~ '^(https://|/images/)[^[:space:]]+$') then
      raise exception 'Use a valid floor plan image link';
    end if;
    r.source_record = jsonb_set(
      coalesce(r.source_record, '{}'),
      '{details}',
      coalesce(r.source_record->'details', '{}') || jsonb_build_object('floor_plan', p_data->'floor_plan')
    );
  end if;

  if p_data ? 'highlights' then
    if jsonb_typeof(p_data->'highlights') <> 'array' or jsonb_array_length(p_data->'highlights') > 30 then
      raise exception 'Use up to 30 property highlights';
    end if;
    if exists(select 1 from jsonb_array_elements(p_data->'highlights') value where jsonb_typeof(value) <> 'string' or length(value#>>'{}') > 300) then
      raise exception 'Use text highlights under 300 characters';
    end if;
    r.source_record = jsonb_set(
      coalesce(r.source_record, '{}'),
      '{details}',
      coalesce(r.source_record->'details', '{}') || jsonb_build_object(
        'highlights',
        (select coalesce(jsonb_agg(trim(value)), '[]') from jsonb_array_elements_text(p_data->'highlights') value where trim(value) <> '')
      )
    );
  end if;

  if p_data ? 'seo_title' and length(p_data->>'seo_title') > 255 then
    raise exception 'SEO title must be 255 characters or less';
  end if;
  if p_data ? 'seo_description' and length(p_data->>'seo_description') > 1000 then
    raise exception 'SEO description must be 1000 characters or less';
  end if;
  if p_data ? 'og_image_url' and p_data->>'og_image_url' is not null and (length(p_data->>'og_image_url') > 2048 or p_data->>'og_image_url' !~ '^(https://|/images/)[^[:space:]]+$') then
    raise exception 'Use a valid Open Graph image link';
  end if;

  if wanted = 'Published' then
    if nullif(trim(r.district), '') is null then
      raise exception 'Confirm the location before publishing';
    end if;
    if nullif(trim(r.cover_image_path), '') is null then
      raise exception 'Select a cover image before publishing';
    end if;

    snapshot = jsonb_build_object(
      'id', r.id,
      'ref', r.ref,
      'bathrooms', r.bathrooms,
      'tapu_status', r.tapu_status,
      'source_note', r.source_note,
      'slug', r.slug,
      'marketing_title', r.marketing_title,
      'city', r.city,
      'location_label', r.district,
      'side', r.side,
      'record_type', r.record_type,
      'mode', r.mode,
      'layout_label', r.layout_label,
      'price', (case when r.price_basis = old_row.price_basis then coalesce(r.source_record->'price', '{}'::jsonb) else '{}'::jsonb end) ||
               jsonb_build_object('amount', r.amount, 'currency', r.currency, 'basis', case when r.price_type = 'on-request' then 'on_request' when r.price_type = 'from' and r.price_basis = 'advertised' then 'from' else r.price_basis::text end, 'status', 'staff-published'),
      'areas', (select coalesce(jsonb_agg(x), '[]') from (
                  select jsonb_build_object('value_m2', r.gross_m2, 'basis', 'gross') x where r.gross_m2 is not null
                  union all
                  select jsonb_build_object('value_m2', r.net_m2, 'basis', 'net') where r.net_m2 is not null
                  union all
                  select jsonb_build_object('value_m2', r.area_m2, 'basis', 'unspecified') where r.area_m2 is not null
                ) a),
      'source_ids', coalesce(r.source_record->'source_ids', '[]'::jsonb),
      'availability_verified', r.availability = 'Available',
      'cover', r.cover_image_path,
      'availability', r.availability,
      'seo_title', r.seo_title,
      'seo_description', r.seo_description,
      'og_image_url', r.og_image_url,
      'details', coalesce(r.source_record->'details', '{}'::jsonb) || jsonb_build_object(
        'project', (select name from public.projects where id = r.project_id),
        'note', r.description,
        'cbi_verified', r.cbi_verified and r.cbi_eligible,
        'claims_requiring_confirmation', coalesce(to_jsonb(r.claims_requiring_confirmation), '[]')
      )
    );

    r.published_snapshot = snapshot;
    r.published_at = now();
  end if;

  if old_row.version = 0 then
    insert into public.marketing_offers select (r).*;
  else
    if old_row.slug <> r.slug then
      insert into public.property_slug_redirects(old_slug, new_slug, target_offer_id)
      values(old_row.slug, r.slug, r.id)
      on conflict(old_slug) do update set new_slug = excluded.new_slug, target_offer_id = excluded.target_offer_id;
    end if;

    update public.marketing_offers set
      ref = r.ref,
      slug = r.slug,
      marketing_title = r.marketing_title,
      district = r.district,
      city = r.city,
      record_type = r.record_type,
      mode = r.mode,
      layout_label = r.layout_label,
      bathrooms = r.bathrooms,
      gross_m2 = r.gross_m2,
      net_m2 = r.net_m2,
      area_m2 = r.area_m2,
      amount = r.amount,
      currency = r.currency,
      price_type = r.price_type,
      price_basis = r.price_basis,
      availability = r.availability,
      publication = r.publication,
      assigned_agent_id = r.assigned_agent_id,
      cover_image_path = r.cover_image_path,
      description = r.description,
      source_note = r.source_note,
      source_record = r.source_record,
      side = r.side,
      tapu_status = r.tapu_status,
      project_id = r.project_id,
      seo_title = r.seo_title,
      seo_description = r.seo_description,
      og_image_url = r.og_image_url,
      version = r.version,
      published_snapshot = r.published_snapshot,
      published_at = r.published_at,
      updated_by = r.updated_by
    where id = r.id;
  end if;

  if wanted is distinct from old_row.publication or wanted = 'Published' then
    insert into public.publication_history(offer_id, old_status, new_status, snapshot, changed_by)
    values(r.id, old_row.publication, wanted, r.published_snapshot, auth.uid());
  end if;

  return (select to_jsonb(saved) from public.marketing_offers saved where saved.id = r.id);
end $function$;

-- ----------------------------------------------------------------------------
-- 4. SITE SETTINGS DYNAMIC NAVIGATION & FOOTER MANAGEMENT
-- ----------------------------------------------------------------------------
-- Explicit JSONB columns for dynamic navigation items and footer settings.
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS navigation_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS footer_settings JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.site_settings DROP CONSTRAINT IF EXISTS site_navigation_items_array;
ALTER TABLE public.site_settings ADD CONSTRAINT site_navigation_items_array
  CHECK (jsonb_typeof(navigation_items) = 'array');

ALTER TABLE public.site_settings DROP CONSTRAINT IF EXISTS site_footer_settings_object;
ALTER TABLE public.site_settings ADD CONSTRAINT site_footer_settings_object
  CHECK (jsonb_typeof(footer_settings) = 'object');

COMMENT ON COLUMN public.site_settings.navigation_items IS 'Dynamic public navbar links: Array<{ label: string, href: string, order: number, is_visible: boolean }>';
COMMENT ON COLUMN public.site_settings.footer_settings IS 'Dynamic footer configuration: { columns: Array<{ title: string, links: Array<{ label: string, href: string }> }>, note?: string }';

-- Upgrade website design guard to safely accept structured layout fields
CREATE OR REPLACE FUNCTION private.guard_website_design() RETURNS TRIGGER LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM jsonb_each(new.website_design) e
    WHERE (
      e.key IN ('logoDark','logoLight','heroMain','heroAlt','footerImage')
      AND jsonb_typeof(e.value) = 'string'
      AND e.value#>>'{}' <> ''
      AND e.value#>>'{}' !~ '^(https://|/images/)[^[:space:]]+$'
    )
  ) THEN
    RAISE EXCEPTION 'Use normal text and safe image links in website appearance';
  END IF;
  RETURN new;
END $$;

-- ----------------------------------------------------------------------------
-- 5. STORAGE FILES METADATA & ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
ALTER TABLE public.storage_files ENABLE ROW LEVEL SECURITY;

-- Grant standard DML to authenticated staff
REVOKE ALL ON public.storage_files FROM public, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.storage_files TO authenticated;

-- Drop legacy/redundant policies
DROP POLICY IF EXISTS "staff_manage_storage_files" ON public.storage_files;
DROP POLICY IF EXISTS "manager_read" ON public.storage_files;
DROP POLICY IF EXISTS "manager_insert" ON public.storage_files;
DROP POLICY IF EXISTS "manager_update" ON public.storage_files;
DROP POLICY IF EXISTS "staff_read_storage_files" ON public.storage_files;
DROP POLICY IF EXISTS "staff_insert_storage_files" ON public.storage_files;
DROP POLICY IF EXISTS "staff_update_storage_files" ON public.storage_files;
DROP POLICY IF EXISTS "staff_delete_storage_files" ON public.storage_files;

-- Read: All authenticated staff can inspect metadata for uploaded assets
CREATE POLICY "staff_read_storage_files" ON public.storage_files
  FOR SELECT TO authenticated
  USING ((SELECT private.staff_role()) IS NOT NULL);

-- Insert: Staff can record metadata when uploading to marketing or document buckets
CREATE POLICY "staff_insert_storage_files" ON public.storage_files
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT private.staff_role()) IN ('admin', 'manager', 'agent')
    AND bucket IN ('public-marketing', 'private-documents', 'private-source')
  );

-- Update: Staff can update asset tags, relations, and metadata
CREATE POLICY "staff_update_storage_files" ON public.storage_files
  FOR UPDATE TO authenticated
  USING (
    (SELECT private.staff_role()) IN ('admin', 'manager', 'agent')
  )
  WITH CHECK (
    (SELECT private.staff_role()) IN ('admin', 'manager', 'agent')
    AND bucket IN ('public-marketing', 'private-documents', 'private-source')
  );

-- Delete: Managers and Admins can delete assets; Agents can delete their own uploaded files
CREATE POLICY "staff_delete_storage_files" ON public.storage_files
  FOR DELETE TO authenticated
  USING (
    (SELECT private.manager()) OR (uploaded_by = (SELECT auth.uid()))
  );

-- Supabase Storage Objects bucket policy hardening for staff uploads
DROP POLICY IF EXISTS "manager_media" ON storage.objects;
DROP POLICY IF EXISTS "staff_media_storage" ON storage.objects;
CREATE POLICY "staff_media_storage" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'public-marketing'
    AND (SELECT private.staff_role()) IN ('admin', 'manager', 'agent')
  )
  WITH CHECK (
    bucket_id = 'public-marketing'
    AND (SELECT private.staff_role()) IN ('admin', 'manager', 'agent')
  );

DROP POLICY IF EXISTS "manager_private" ON storage.objects;
DROP POLICY IF EXISTS "staff_private_storage" ON storage.objects;
CREATE POLICY "staff_private_storage" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id IN ('private-source', 'private-documents')
    AND (SELECT private.staff_role()) IN ('admin', 'manager', 'agent')
  )
  WITH CHECK (
    bucket_id IN ('private-source', 'private-documents')
    AND (SELECT private.staff_role()) IN ('admin', 'manager', 'agent')
  );

-- ----------------------------------------------------------------------------
-- 6. IMMUTABLE CONTENT AUDIT LOGGING TRIGGERS
-- ----------------------------------------------------------------------------
-- Record all mutations on marketing_offers, site_settings, services, and content_pages.
CREATE OR REPLACE FUNCTION private.audit_record() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_role text := coalesce(private.staff_role()::text, 'system');
  v_target_id uuid;
  v_old jsonb;
  v_new jsonb;
BEGIN
  IF tg_op = 'DELETE' THEN
    v_target_id := old.id;
    v_old := to_jsonb(old);
    v_new := NULL;
  ELSIF tg_op = 'UPDATE' THEN
    v_target_id := new.id;
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
  ELSE -- INSERT
    v_target_id := new.id;
    v_old := NULL;
    v_new := to_jsonb(new);
  END IF;

  IF v_actor_id IS NOT NULL THEN
    INSERT INTO public.audit_events (
      actor_id,
      actor_role,
      action,
      target_table,
      target_id,
      old_values,
      new_values
    ) VALUES (
      v_actor_id,
      v_role,
      tg_op,
      tg_table_name,
      v_target_id,
      v_old,
      v_new
    );
  END IF;

  IF tg_op = 'DELETE' THEN
    RETURN old;
  ELSE
    RETURN new;
  END IF;
END $$;

REVOKE ALL ON FUNCTION private.audit_record() FROM public, anon, authenticated;

-- Attach triggers to all core content & CMS tables
DROP TRIGGER IF EXISTS record_audit ON public.marketing_offers;
CREATE TRIGGER record_audit AFTER INSERT OR UPDATE OR DELETE ON public.marketing_offers
  FOR EACH ROW EXECUTE FUNCTION private.audit_record();

DROP TRIGGER IF EXISTS record_audit ON public.site_settings;
CREATE TRIGGER record_audit AFTER INSERT OR UPDATE OR DELETE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION private.audit_record();

DROP TRIGGER IF EXISTS record_audit ON public.services;
CREATE TRIGGER record_audit AFTER INSERT OR UPDATE OR DELETE ON public.services
  FOR EACH ROW EXECUTE FUNCTION private.audit_record();

DROP TRIGGER IF EXISTS record_audit ON public.content_pages;
CREATE TRIGGER record_audit AFTER INSERT OR UPDATE OR DELETE ON public.content_pages
  FOR EACH ROW EXECUTE FUNCTION private.audit_record();

DROP TRIGGER IF EXISTS record_audit ON public.content_sections;
CREATE TRIGGER record_audit AFTER INSERT OR UPDATE OR DELETE ON public.content_sections
  FOR EACH ROW EXECUTE FUNCTION private.audit_record();

-- Read policy: Super Admin and Admin can review audit records
DROP POLICY IF EXISTS admin_read ON public.audit_events;
DROP POLICY IF EXISTS staff_read_audit ON public.audit_events;
CREATE POLICY staff_read_audit ON public.audit_events
  FOR SELECT TO authenticated
  USING ((SELECT private.manager()));
