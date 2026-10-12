-- Migration: 20261011000004_transactions_and_rentals.sql
-- Description: Transactions (deals, selected units, reservations, milestones, payments, commissions) and Rentals (leases, rent charges, payment allocations, deposits, vendors, maintenance)

CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE RESTRICT,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  assigned_agent_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE RESTRICT,
  stage deal_stage NOT NULL DEFAULT 'Opportunity',
  total_amount NUMERIC(15,2),
  currency currency_code NOT NULL DEFAULT 'USD',
  expected_close_date TIMESTAMPTZ,
  actual_close_date TIMESTAMPTZ,
  loss_reason TEXT,
  notes TEXT,
  version INT NOT NULL DEFAULT 1,
  created_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deals_contact ON public.deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_agent ON public.deals(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);

CREATE TABLE IF NOT EXISTS public.deal_selected_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES public.marketing_offers(id) ON DELETE SET NULL,
  physical_unit_id UUID REFERENCES public.physical_units(id) ON DELETE SET NULL,
  agreed_price NUMERIC(15,2),
  currency currency_code NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.offer_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  revision_number INT NOT NULL,
  offer_amount NUMERIC(15,2) NOT NULL,
  currency currency_code NOT NULL,
  payment_terms JSONB NOT NULL DEFAULT '{}'::jsonb,
  valid_until TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES public.marketing_offers(id) ON DELETE CASCADE,
  physical_unit_id UUID REFERENCES public.physical_units(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE RESTRICT,
  reserved_by UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE RESTRICT,
  deposit_amount NUMERIC(15,2),
  deposit_currency currency_code,
  reserved_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'converted', 'cancelled')),
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_expires_at ON public.reservations(expires_at);

CREATE TABLE IF NOT EXISTS public.document_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'uploaded', 'verified', 'rejected')),
  storage_path TEXT,
  verified_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  milestone_name TEXT NOT NULL,
  due_date DATE NOT NULL,
  expected_amount NUMERIC(15,2) NOT NULL,
  currency currency_code NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recorded_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.payment_milestones(id) ON DELETE SET NULL,
  payment_reference TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  currency currency_code NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL,
  proof_storage_path TEXT,
  is_reversal BOOLEAN NOT NULL DEFAULT false,
  reversal_for_id UUID REFERENCES public.recorded_payments(id),
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.commission_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE RESTRICT,
  role_in_deal TEXT NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  calculated_amount NUMERIC(15,2) NOT NULL,
  currency currency_code NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physical_unit_id UUID NOT NULL REFERENCES public.physical_units(id) ON DELETE RESTRICT,
  offer_id UUID REFERENCES public.marketing_offers(id) ON DELETE SET NULL,
  landlord_contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE RESTRICT,
  tenant_contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE RESTRICT,
  agent_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rent_amount NUMERIC(15,2) NOT NULL,
  rent_currency currency_code NOT NULL,
  payment_frequency TEXT NOT NULL DEFAULT 'monthly',
  payment_due_day INT NOT NULL DEFAULT 1 CHECK (payment_due_day BETWEEN 1 AND 31),
  deposit_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  deposit_currency currency_code NOT NULL,
  status lease_status NOT NULL DEFAULT 'draft',
  terms TEXT,
  created_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_lease_period CHECK (end_date > start_date)
);

CREATE INDEX IF NOT EXISTS idx_leases_unit ON public.leases(physical_unit_id);
CREATE INDEX IF NOT EXISTS idx_leases_status ON public.leases(status);

CREATE TABLE IF NOT EXISTS public.rent_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID NOT NULL REFERENCES public.leases(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  due_date DATE NOT NULL,
  charge_amount NUMERIC(15,2) NOT NULL,
  currency currency_code NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lease_id, period_start)
);

CREATE TABLE IF NOT EXISTS public.rent_payment_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charge_id UUID NOT NULL REFERENCES public.rent_charges(id) ON DELETE CASCADE,
  recorded_payment_id UUID NOT NULL REFERENCES public.recorded_payments(id) ON DELETE RESTRICT,
  allocated_amount NUMERIC(15,2) NOT NULL,
  currency currency_code NOT NULL,
  allocated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  allocated_by UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.rental_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID NOT NULL REFERENCES public.leases(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL,
  currency currency_code NOT NULL,
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'returned', 'retained_for_repairs')),
  received_date DATE NOT NULL,
  return_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  specialty TEXT NOT NULL,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physical_unit_id UUID NOT NULL REFERENCES public.physical_units(id) ON DELETE CASCADE,
  lease_id UUID REFERENCES public.leases(id) ON DELETE SET NULL,
  requester_contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority maintenance_priority NOT NULL DEFAULT 'Normal',
  status maintenance_status NOT NULL DEFAULT 'reported',
  estimated_cost NUMERIC(15,2),
  actual_cost NUMERIC(15,2),
  currency currency_code DEFAULT 'TRY',
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
