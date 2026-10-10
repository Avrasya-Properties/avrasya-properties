-- Migration: 20261011000003_crm_and_enquiries.sql
-- Description: CRM domain (contacts, buyer requirements, shortlists, enquiries, leads, tasks, viewings, activities, notes, contact merges)

CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kind contact_kind NOT NULL DEFAULT 'person',
  email TEXT,
  phone TEXT,
  secondary_phone TEXT,
  company_name TEXT,
  tax_id TEXT,
  roles TEXT[] NOT NULL DEFAULT '{"buyer"}',
  language TEXT NOT NULL DEFAULT 'English',
  assigned_agent_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(lower(email));
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON public.contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_agent ON public.contacts(assigned_agent_id);

CREATE TABLE IF NOT EXISTS public.buyer_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  districts TEXT[] NOT NULL DEFAULT '{}',
  side TEXT,
  property_types TEXT[] NOT NULL DEFAULT '{}',
  layouts TEXT[] NOT NULL DEFAULT '{}',
  budget_min NUMERIC(15,2),
  budget_max NUMERIC(15,2),
  currency currency_code NOT NULL DEFAULT 'USD',
  cbi_required BOOLEAN NOT NULL DEFAULT false,
  timeline TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_shortlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES public.marketing_offers(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contact_id, offer_id)
);

CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  topic TEXT NOT NULL,
  budget TEXT,
  raw_budget_text TEXT,
  message TEXT NOT NULL,
  source TEXT NOT NULL,
  property_slug TEXT,
  offer_id UUID REFERENCES public.marketing_offers(id) ON DELETE SET NULL,
  campaign_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Archived')),
  ip_hash TEXT,
  user_agent TEXT,
  idempotency_key TEXT UNIQUE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  lead_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_email ON public.enquiries(lower(email));
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries(created_at DESC);

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'Website',
  assigned_agent_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  districts TEXT NOT NULL DEFAULT '',
  layout TEXT NOT NULL DEFAULT '',
  budget_min NUMERIC(15,2),
  budget_max NUMERIC(15,2),
  currency currency_code NOT NULL DEFAULT 'USD',
  stage lead_stage NOT NULL DEFAULT 'New',
  loss_reason TEXT,
  next_follow_up TIMESTAMPTZ,
  shortlist UUID[] NOT NULL DEFAULT '{}',
  deal_id UUID,
  created_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_contact ON public.leads(contact_id);
CREATE INDEX IF NOT EXISTS idx_leads_agent ON public.leads(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);

ALTER TABLE public.enquiries
  ADD CONSTRAINT fk_enquiries_lead
  FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ NOT NULL,
  priority task_priority NOT NULL DEFAULT 'Normal',
  is_done BOOLEAN NOT NULL DEFAULT false,
  done_at TIMESTAMPTZ,
  link_kind TEXT CHECK (link_kind IN ('lead', 'contact', 'deal', 'property', 'viewing')),
  link_id UUID,
  created_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

CREATE TABLE IF NOT EXISTS public.viewings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES public.marketing_offers(id) ON DELETE SET NULL,
  physical_unit_id UUID REFERENCES public.physical_units(id) ON DELETE SET NULL,
  agent_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status viewing_status NOT NULL DEFAULT 'Scheduled',
  notes TEXT NOT NULL DEFAULT '',
  outcome TEXT,
  created_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_viewings_agent ON public.viewings(agent_id);
CREATE INDEX IF NOT EXISTS idx_viewings_contact ON public.viewings(contact_id);

CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  kind TEXT NOT NULL,
  text TEXT NOT NULL,
  ref_kind TEXT,
  ref_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_kind ON public.activities(kind);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);

CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  author_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_merges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_contact_id UUID NOT NULL,
  target_contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  merged_by UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE RESTRICT,
  merge_reason TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
