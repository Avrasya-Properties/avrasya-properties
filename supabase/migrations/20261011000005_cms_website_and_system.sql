-- Migration: 20261011000005_cms_website_and_system.sql
-- Description: Website CMS, site settings, audit events, notifications, storage metadata, source file tracking, import runs, and rate limiting

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_key TEXT NOT NULL UNIQUE DEFAULT 'default',
  company_name TEXT NOT NULL DEFAULT 'Avrasya Properties Group',
  registered_entity TEXT NOT NULL DEFAULT 'Avrasya Properties Group',
  tax_office TEXT NOT NULL DEFAULT 'Üsküdar / İstanbul',
  license_no TEXT NOT NULL DEFAULT 'İTO-34-78921',
  tagline TEXT NOT NULL DEFAULT 'Your Future Starts with the Right Investment.',
  email TEXT NOT NULL DEFAULT 'info@avrasyaproperties.com',
  phone TEXT NOT NULL DEFAULT '+90 545 924 80 42',
  whatsapp TEXT NOT NULL DEFAULT 'https://wa.me/905459248042',
  address TEXT NOT NULL DEFAULT 'Mimar Sinan Mahallesi, Selam-i Ali Efendi Caddesi, Ara Kafe Yanı No:17, 34672 Üsküdar / İstanbul, Türkiye',
  advisory_hours TEXT NOT NULL DEFAULT 'Mon – Fri: 09:30 – 18:30 TRT | Sat: By Private Appointment',
  hero_headline TEXT NOT NULL DEFAULT 'Curated Offers & Developments in Istanbul.',
  hero_subtitle TEXT NOT NULL DEFAULT 'Source-backed investment opportunities across central and Asian-side Istanbul. Every property is subject to preliminary title deed, zoning, and legal clearance before acquisition.',
  eyebrow_text TEXT NOT NULL DEFAULT 'Istanbul Portfolio Collection',
  cbi_threshold_usd NUMERIC(12,2) NOT NULL DEFAULT 400000,
  preloader_opacity NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  exchange_rate_eur NUMERIC(10,4) NOT NULL DEFAULT 0.892,
  exchange_rate_try NUMERIC(10,4) NOT NULL DEFAULT 49.17,
  exchange_rate_gbp NUMERIC(10,4) NOT NULL DEFAULT 0.756,
  enable_frankfurter_sync BOOLEAN NOT NULL DEFAULT true,
  announcement_text TEXT NOT NULL DEFAULT '',
  announcement_active BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial site_settings row if not exists
INSERT INTO public.site_settings (singleton_key)
VALUES ('default')
ON CONFLICT (singleton_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.content_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meta_description TEXT,
  published_status publication_status NOT NULL DEFAULT 'Published',
  published_version INT NOT NULL DEFAULT 1,
  updated_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.content_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.content_pages(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  title TEXT,
  content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page_id, section_key)
);

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT,
  description TEXT NOT NULL,
  process_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.catalog_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  edition TEXT,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  page_count INT,
  disclaimer TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  actor_role TEXT,
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_table_target ON public.audit_events(target_table, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON public.audit_events(created_at DESC);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, is_read);

CREATE TABLE IF NOT EXISTS public.storage_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  sha256 TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  related_entity_type TEXT,
  related_entity_id UUID,
  uploaded_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (bucket, path)
);

CREATE TABLE IF NOT EXISTS public.source_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drive_id TEXT NOT NULL UNIQUE,
  folder_name TEXT NOT NULL,
  filename TEXT NOT NULL,
  asset_path TEXT NOT NULL,
  drive_url TEXT,
  mime_type TEXT NOT NULL,
  bytes BIGINT NOT NULL,
  sha256 TEXT NOT NULL,
  import_status TEXT NOT NULL DEFAULT 'pending' CHECK (import_status IN ('pending', 'imported', 'failed', 'skipped')),
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_source_files_sha256 ON public.source_files(sha256);

CREATE TABLE IF NOT EXISTS public.extraction_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_file_id UUID REFERENCES public.source_files(id) ON DELETE SET NULL,
  candidate_type TEXT NOT NULL,
  raw_payload JSONB NOT NULL,
  normalized_payload JSONB NOT NULL,
  extraction_method TEXT NOT NULL,
  confidence NUMERIC(3,2) DEFAULT 1.0,
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'accepted', 'rejected', 'superseded')),
  reviewed_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.import_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type import_run_type NOT NULL DEFAULT 'full_import',
  total_sources INT NOT NULL DEFAULT 0,
  imported_sources INT NOT NULL DEFAULT 0,
  failed_sources INT NOT NULL DEFAULT 0,
  log_messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status import_run_status NOT NULL DEFAULT 'running',
  initiated_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.rate_limit_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (rate_key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_key ON public.rate_limit_entries(rate_key, window_start);
