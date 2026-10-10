-- Migration: 20261011000002_inventory_and_properties.sql
-- Description: Inventory domain (developers, projects, buildings, physical units, offers, packages, pricing, history)

CREATE TABLE IF NOT EXISTS public.developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  contact_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID REFERENCES public.developers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  district TEXT,
  city TEXT NOT NULL DEFAULT 'Istanbul',
  side TEXT CHECK (side IN ('Europe', 'Asia', 'unknown')),
  tapu_status TEXT,
  delivery_date DATE,
  delivery_month_year TEXT,
  delivery_relative TEXT,
  delivery_source TEXT,
  cbi_claim_verified BOOLEAN NOT NULL DEFAULT false,
  cbi_claim_source TEXT,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_district ON public.projects(district);

CREATE TABLE IF NOT EXISTS public.buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  building_code TEXT,
  total_floors INT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.physical_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
  unit_number TEXT,
  floor INT,
  layout_label TEXT,
  bedrooms INT,
  bathrooms INT,
  gross_m2 NUMERIC(10,2),
  net_m2 NUMERIC(10,2),
  unspecified_m2 NUMERIC(10,2),
  status property_availability NOT NULL DEFAULT 'Unknown',
  tapu_status TEXT,
  orientation TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_physical_units_project ON public.physical_units(project_id);
CREATE INDEX IF NOT EXISTS idx_physical_units_status ON public.physical_units(status);

CREATE TABLE IF NOT EXISTS public.marketing_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  marketing_title TEXT NOT NULL,
  title_provenance TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  physical_unit_id UUID REFERENCES public.physical_units(id) ON DELETE SET NULL,
  record_type property_record_type NOT NULL DEFAULT 'unit_offer',
  mode TEXT NOT NULL DEFAULT 'sale' CHECK (mode IN ('sale', 'rent')),
  layout_label TEXT,
  bathrooms INT,
  district TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Istanbul',
  side TEXT CHECK (side IN ('Europe', 'Asia', 'unknown')),
  tapu_status TEXT,
  gross_m2 NUMERIC(10,2),
  net_m2 NUMERIC(10,2),
  area_m2 NUMERIC(10,2),
  amount NUMERIC(15,2),
  currency currency_code,
  price_type price_type NOT NULL DEFAULT 'fixed',
  price_basis price_basis_type NOT NULL DEFAULT 'fixed',
  expenses_amount NUMERIC(15,2),
  availability property_availability NOT NULL DEFAULT 'Unknown',
  publication publication_status NOT NULL DEFAULT 'Draft',
  assigned_agent_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  cover_image_path TEXT,
  description TEXT,
  source_note TEXT,
  claims_requiring_confirmation TEXT[] NOT NULL DEFAULT '{}',
  cbi_eligible BOOLEAN NOT NULL DEFAULT false,
  cbi_verified BOOLEAN NOT NULL DEFAULT false,
  version INT NOT NULL DEFAULT 1,
  published_snapshot JSONB,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketing_offers_slug ON public.marketing_offers(slug);
CREATE INDEX IF NOT EXISTS idx_marketing_offers_publication ON public.marketing_offers(publication);
CREATE INDEX IF NOT EXISTS idx_marketing_offers_availability ON public.marketing_offers(availability);
CREATE INDEX IF NOT EXISTS idx_marketing_offers_agent ON public.marketing_offers(assigned_agent_id);

CREATE TABLE IF NOT EXISTS public.package_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_offer_id UUID NOT NULL REFERENCES public.marketing_offers(id) ON DELETE CASCADE,
  member_unit_id UUID REFERENCES public.physical_units(id) ON DELETE CASCADE,
  member_offer_id UUID REFERENCES public.marketing_offers(id) ON DELETE CASCADE,
  share_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'General',
  icon TEXT
);

CREATE TABLE IF NOT EXISTS public.offer_amenities (
  offer_id UUID NOT NULL REFERENCES public.marketing_offers(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (offer_id, amenity_id)
);

CREATE TABLE IF NOT EXISTS public.pricing_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.marketing_offers(id) ON DELETE CASCADE,
  option_name TEXT NOT NULL,
  amount NUMERIC(15,2),
  currency currency_code NOT NULL,
  basis price_basis_type NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  down_payment_amount NUMERIC(15,2),
  down_payment_percent NUMERIC(5,2),
  delivery_payment_amount NUMERIC(15,2),
  delivery_payment_percent NUMERIC(5,2),
  installment_amount NUMERIC(15,2),
  installment_count INT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.instalment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pricing_option_id UUID NOT NULL REFERENCES public.pricing_options(id) ON DELETE CASCADE,
  installment_no INT NOT NULL,
  due_month_offset INT,
  due_date DATE,
  amount NUMERIC(15,2) NOT NULL,
  currency currency_code NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.marketing_offers(id) ON DELETE CASCADE,
  old_amount NUMERIC(15,2),
  new_amount NUMERIC(15,2),
  currency currency_code,
  basis price_basis_type,
  changed_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.availability_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES public.marketing_offers(id) ON DELETE CASCADE,
  physical_unit_id UUID REFERENCES public.physical_units(id) ON DELETE CASCADE,
  old_status property_availability,
  new_status property_availability NOT NULL,
  changed_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.publication_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.marketing_offers(id) ON DELETE CASCADE,
  old_status publication_status,
  new_status publication_status NOT NULL,
  snapshot JSONB,
  changed_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_slug_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_slug TEXT NOT NULL UNIQUE,
  new_slug TEXT NOT NULL,
  target_offer_id UUID NOT NULL REFERENCES public.marketing_offers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
