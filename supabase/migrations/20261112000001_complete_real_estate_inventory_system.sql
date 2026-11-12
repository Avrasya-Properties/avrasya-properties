-- ============================================================================
-- Migration: 20261112000001_complete_real_estate_inventory_system.sql
-- Description: Complete Real Estate Inventory, Property, Region, Development,
--   Multi-Category Media Gallery, Floor Plan, Document & Multilingual System.
--   1. Extends property_availability enum with 'Unavailable' and 'Coming Soon'.
--   2. Extends marketing_offers with comprehensive real estate inventory fields,
--      structured gallery_items, floor_plans, documents, specs, payment_plan,
--      coordinates, 3D model URL, and 7-language translations.
--   3. Extends projects (developments) and developers with full project metadata,
--      unit relationships, galleries, brochures, floor plans, and 3D assets.
--   4. Safely migrates existing single-image and gallery_images records into
--      structured gallery_items and floor_plans without data loss.
--   5. Upgrades private.save_offer to persist all fields, enforce public/private
--      document separation in published_snapshot, and log price/availability changes.
-- ============================================================================

-- 1. Extend property_availability enum safely
ALTER TYPE public.property_availability ADD VALUE IF NOT EXISTS 'Unavailable';
ALTER TYPE public.property_availability ADD VALUE IF NOT EXISTS 'Coming Soon';

-- 2. Extend marketing_offers with comprehensive real estate columns
ALTER TABLE public.marketing_offers
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS property_category TEXT NOT NULL DEFAULT 'Apartment',
  ADD COLUMN IF NOT EXISTS neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS developer_name TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS coordinates JSONB,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bedrooms INT,
  ADD COLUMN IF NOT EXISTS living_rooms INT,
  ADD COLUMN IF NOT EXISTS original_price NUMERIC(15,2),
  ADD COLUMN IF NOT EXISTS discounted_price NUMERIC(15,2),
  ADD COLUMN IF NOT EXISTS rental_price NUMERIC(15,2),
  ADD COLUMN IF NOT EXISTS price_per_m2 NUMERIC(15,2),
  ADD COLUMN IF NOT EXISTS price_visibility TEXT NOT NULL DEFAULT 'show',
  ADD COLUMN IF NOT EXISTS last_price_update TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS gallery_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS floor_plans JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS model_3d_url TEXT,
  ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_marketing_offers_neighborhood ON public.marketing_offers(neighborhood);
CREATE INDEX IF NOT EXISTS idx_marketing_offers_category ON public.marketing_offers(property_category);
CREATE INDEX IF NOT EXISTS idx_marketing_offers_featured ON public.marketing_offers(featured);
CREATE INDEX IF NOT EXISTS idx_marketing_offers_project ON public.marketing_offers(project_id);

-- 3. Extend projects (developments) with full development management columns
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_path TEXT,
  ADD COLUMN IF NOT EXISTS gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS construction_status TEXT DEFAULT 'Ready',
  ADD COLUMN IF NOT EXISTS launch_date DATE,
  ADD COLUMN IF NOT EXISTS total_units INT,
  ADD COLUMN IF NOT EXISTS available_units INT,
  ADD COLUMN IF NOT EXISTS amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS payment_plans JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS brochures JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS floor_plans JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS coordinates JSONB,
  ADD COLUMN IF NOT EXISTS model_3d_url TEXT,
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS publication public.publication_status NOT NULL DEFAULT 'Published',
  ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 4. Extend developers with logo, description, website, and publication status
ALTER TABLE public.developers
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;

-- 5. Extend site_settings with configurable property_categories, amenity_catalog, and developments
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS property_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS amenity_catalog JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS developments JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS developers_catalog JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 6. Migrate existing single-image and gallery_images records into gallery_items & floor_plans
UPDATE public.marketing_offers
SET gallery_items = (
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'id', 'migrated-' || ordinality,
      'url', url_val,
      'category', CASE WHEN ordinality = 1 THEN 'Exterior' ELSE 'Interior' END,
      'caption', '',
      'alt', marketing_title || ' photo ' || ordinality,
      'isPrimary', (url_val = cover_image_path OR (cover_image_path IS NULL AND ordinality = 1)),
      'sortOrder', ordinality - 1
    )
  ), '[]'::jsonb)
  FROM (
    SELECT DISTINCT ON (u.url_val) u.url_val, u.ordinality
    FROM (
      SELECT cover_image_path AS url_val, 1 AS ordinality
      WHERE cover_image_path IS NOT NULL AND trim(cover_image_path) <> ''
      UNION ALL
      SELECT value AS url_val, (row_number() OVER () + 1)::int AS ordinality
      FROM jsonb_array_elements_text(
        CASE
          WHEN jsonb_typeof(source_record->'details'->'gallery_images') = 'array'
          THEN source_record->'details'->'gallery_images'
          ELSE '[]'::jsonb
        END
      ) value
    ) u
    ORDER BY u.url_val, u.ordinality
  ) deduped
)
WHERE jsonb_array_length(coalesce(gallery_items, '[]'::jsonb)) = 0
  AND (
    (cover_image_path IS NOT NULL AND trim(cover_image_path) <> '')
    OR jsonb_typeof(source_record->'details'->'gallery_images') = 'array'
  );

UPDATE public.marketing_offers
SET floor_plans = jsonb_build_array(
  jsonb_build_object(
    'id', 'migrated-fp-1',
    'title', coalesce(layout_label, 'Standard Layout') || ' Floor Plan',
    'unitType', coalesce(layout_label, 'Standard'),
    'imageUrl', source_record->'details'->>'floor_plan',
    'areaM2', coalesce(gross_m2, net_m2, area_m2)
  )
)
WHERE jsonb_array_length(coalesce(floor_plans, '[]'::jsonb)) = 0
  AND source_record->'details'->>'floor_plan' IS NOT NULL
  AND trim(source_record->'details'->>'floor_plan') <> '';

-- 7. Upgrade private.save_offer to handle full inventory, media, floor plans, documents, and translations
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
  public_docs jsonb;
  primary_gallery_url text;
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
    old_row.property_category = 'Apartment';
    old_row.price_visibility = 'show';
    old_row.featured = false;
    old_row.cbi_eligible = false;
    old_row.cbi_verified = false;
    old_row.claims_requiring_confirmation = '{}';
    old_row.payment_plan = '{}'::jsonb;
    old_row.specs = '{}'::jsonb;
    old_row.gallery_items = '[]'::jsonb;
    old_row.floor_plans = '[]'::jsonb;
    old_row.documents = '[]'::jsonb;
    old_row.translations = '{}'::jsonb;
  end if;

  r = jsonb_populate_record(
    old_row,
    (
      select coalesce(jsonb_object_agg(key, value), '{}')
      from jsonb_each(p_data)
      where key = any(array[
        'ref','slug','marketing_title','short_description','district','neighborhood','city',
        'record_type','property_category','mode','layout_label','bedrooms','bathrooms','living_rooms',
        'gross_m2','net_m2','area_m2','amount','original_price','discounted_price','rental_price',
        'price_per_m2','price_visibility','currency','price_type','price_basis','availability',
        'publication','featured','assigned_agent_id','cover_image_path','description','source_note',
        'side','tapu_status','project_id','developer_name','address','coordinates','payment_plan',
        'specs','gallery_items','floor_plans','documents','virtual_tour_url','video_url',
        'model_3d_url','translations','seo_title','seo_description','og_image_url'
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

  if r.amount is distinct from old_row.amount then
    r.last_price_update = now();
  end if;

  -- Synchronize gallery_images and primary cover from gallery_items when provided
  if jsonb_typeof(r.gallery_items) = 'array' and jsonb_array_length(r.gallery_items) > 0 then
    select item->>'url' into primary_gallery_url
    from jsonb_array_elements(r.gallery_items) item
    where (item->>'isPrimary')::boolean is true
    limit 1;
    if primary_gallery_url is not null and trim(primary_gallery_url) <> '' then
      r.cover_image_path = primary_gallery_url;
    end if;
  end if;

  if p_data ? 'gallery_images' then
    if jsonb_typeof(p_data->'gallery_images') <> 'array' or jsonb_array_length(p_data->'gallery_images') > 60 then
      raise exception 'Use up to 60 gallery photos';
    end if;
    r.source_record = jsonb_set(
      coalesce(r.source_record, '{}'),
      '{details}',
      coalesce(r.source_record->'details', '{}') || jsonb_build_object('gallery_images', p_data->'gallery_images')
    );
  end if;

  if p_data ? 'floor_plan' then
    r.source_record = jsonb_set(
      coalesce(r.source_record, '{}'),
      '{details}',
      coalesce(r.source_record->'details', '{}') || jsonb_build_object('floor_plan', p_data->'floor_plan')
    );
  end if;

  if p_data ? 'highlights' then
    if jsonb_typeof(p_data->'highlights') <> 'array' or jsonb_array_length(p_data->'highlights') > 50 then
      raise exception 'Use up to 50 property highlights';
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

  -- Filter out private documents before building any public snapshot
  select coalesce(jsonb_agg(doc), '[]'::jsonb) into public_docs
  from jsonb_array_elements(coalesce(r.documents, '[]'::jsonb)) doc
  where coalesce((doc->>'isPublic')::boolean, false) is true;

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
               jsonb_build_object(
                 'amount', r.amount,
                 'currency', r.currency,
                 'basis', case when r.price_type = 'on-request' then 'on_request' when r.price_type = 'from' and r.price_basis = 'advertised' then 'from' else r.price_basis::text end,
                 'status', 'staff-published',
                 'previous_advertised_amount', r.original_price
               ),
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
        'project', coalesce((select name from public.projects where id = r.project_id), r.source_record->'details'->>'project'),
        'developer', r.developer_name,
        'neighborhood', r.neighborhood,
        'property_category', r.property_category,
        'short_description', r.short_description,
        'note', r.description,
        'featured', r.featured,
        'bedrooms', r.bedrooms,
        'living_rooms', r.living_rooms,
        'address', r.address,
        'coordinates', r.coordinates,
        'specs', r.specs,
        'payment_plan', r.payment_plan,
        'gallery_items', r.gallery_items,
        'floor_plans', r.floor_plans,
        'documents', public_docs,
        'virtual_tour_url', r.virtual_tour_url,
        'video_url', r.video_url,
        'model_3d_url', r.model_3d_url,
        'translations', r.translations,
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
      short_description = r.short_description,
      district = r.district,
      neighborhood = r.neighborhood,
      city = r.city,
      record_type = r.record_type,
      property_category = r.property_category,
      mode = r.mode,
      layout_label = r.layout_label,
      bedrooms = r.bedrooms,
      bathrooms = r.bathrooms,
      living_rooms = r.living_rooms,
      gross_m2 = r.gross_m2,
      net_m2 = r.net_m2,
      area_m2 = r.area_m2,
      amount = r.amount,
      original_price = r.original_price,
      discounted_price = r.discounted_price,
      rental_price = r.rental_price,
      price_per_m2 = r.price_per_m2,
      price_visibility = r.price_visibility,
      last_price_update = r.last_price_update,
      currency = r.currency,
      price_type = r.price_type,
      price_basis = r.price_basis,
      availability = r.availability,
      publication = r.publication,
      featured = r.featured,
      assigned_agent_id = r.assigned_agent_id,
      cover_image_path = r.cover_image_path,
      description = r.description,
      source_note = r.source_note,
      source_record = r.source_record,
      side = r.side,
      tapu_status = r.tapu_status,
      project_id = r.project_id,
      developer_name = r.developer_name,
      address = r.address,
      coordinates = r.coordinates,
      payment_plan = r.payment_plan,
      specs = r.specs,
      gallery_items = r.gallery_items,
      floor_plans = r.floor_plans,
      documents = r.documents,
      virtual_tour_url = r.virtual_tour_url,
      video_url = r.video_url,
      model_3d_url = r.model_3d_url,
      translations = r.translations,
      seo_title = r.seo_title,
      seo_description = r.seo_description,
      og_image_url = r.og_image_url,
      version = r.version,
      published_snapshot = r.published_snapshot,
      published_at = r.published_at,
      updated_by = r.updated_by,
      updated_at = r.updated_at
    where id = r.id;

    if old_row.availability is distinct from r.availability then
      insert into public.availability_history(offer_id, old_status, new_status, changed_by)
      values(r.id, old_row.availability, r.availability, auth.uid());
    end if;

    if old_row.amount is distinct from r.amount then
      insert into public.price_history(offer_id, old_amount, new_amount, currency, basis, changed_by)
      values(r.id, old_row.amount, r.amount, r.currency, r.price_basis, auth.uid());
    end if;
  end if;

  if wanted is distinct from old_row.publication or wanted = 'Published' then
    insert into public.publication_history(offer_id, old_status, new_status, snapshot, changed_by)
    values(r.id, old_row.publication, wanted, r.published_snapshot, auth.uid());
  end if;

  return (select to_jsonb(saved) from public.marketing_offers saved where saved.id = r.id);
end $function$;

