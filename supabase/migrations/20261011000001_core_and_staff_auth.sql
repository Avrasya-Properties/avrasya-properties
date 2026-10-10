-- Migration: 20261011000001_core_and_staff_auth.sql
-- Description: Core types, staff profiles, and administrative authorization safeguards

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
  CREATE TYPE staff_role AS ENUM ('admin', 'manager', 'agent', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE currency_code AS ENUM ('USD', 'TRY', 'EUR', 'GBP');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE property_record_type AS ENUM ('unit_offer', 'unit_type', 'package', 'project', 'ambiguous_offer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE price_basis_type AS ENUM (
    'cash', 'installment_schedule', 'package', 'fixed', 'from',
    'on_request', 'conflicting_starting_prices', 'scope_unconfirmed',
    'special_offer', 'advertised'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE price_type AS ENUM ('fixed', 'from', 'on-request');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE property_availability AS ENUM ('Available', 'Under Offer', 'Reserved', 'Sold', 'Rented', 'Off Market', 'Unknown');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE publication_status AS ENUM ('Draft', 'In Review', 'Published', 'Archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE contact_kind AS ENUM ('person', 'company');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE lead_stage AS ENUM ('New', 'Contacted', 'Qualified', 'Viewing', 'Negotiation', 'Converted', 'Lost', 'On Hold');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE deal_stage AS ENUM ('Opportunity', 'Offer Prepared', 'Offer Accepted', 'Reserved', 'Due Diligence', 'Contract', 'Won', 'Lost');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE viewing_status AS ENUM ('Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No-show');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('Low', 'Normal', 'High');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE lease_status AS ENUM ('draft', 'active', 'terminated', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE maintenance_priority AS ENUM ('Low', 'Normal', 'High', 'Urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE maintenance_status AS ENUM ('reported', 'assigned', 'in_progress', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE import_run_type AS ENUM ('dry_run', 'full_import', 'sync');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE import_run_status AS ENUM ('running', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Staff Profiles (Authoritative protected identity linked to auth.users)
CREATE TABLE IF NOT EXISTS public.staff_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role staff_role NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on email and role
CREATE INDEX IF NOT EXISTS idx_staff_profiles_role ON public.staff_profiles(role);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_is_active ON public.staff_profiles(is_active);

-- Safeguard: Prevent deleting or demoting the last active administrator
CREATE OR REPLACE FUNCTION public.check_last_admin_protection()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  active_admin_count INT;
BEGIN
  IF (TG_OP = 'DELETE' AND OLD.role = 'admin' AND OLD.is_active = true) OR
     (TG_OP = 'UPDATE' AND OLD.role = 'admin' AND OLD.is_active = true AND (NEW.role != 'admin' OR NEW.is_active = false)) THEN
    SELECT COUNT(*) INTO active_admin_count
    FROM public.staff_profiles
    WHERE role = 'admin' AND is_active = true AND id != OLD.id;

    IF active_admin_count < 1 THEN
      RAISE EXCEPTION 'Cannot demote or remove the last active administrator.';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_staff_profiles_last_admin ON public.staff_profiles;
CREATE TRIGGER trg_staff_profiles_last_admin
  BEFORE UPDATE OR DELETE ON public.staff_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_last_admin_protection();

-- Auth helper functions
CREATE OR REPLACE FUNCTION public.get_current_staff_role()
RETURNS staff_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT role FROM public.staff_profiles
  WHERE id = auth.uid() AND is_active = true;
$$;

CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE id = auth.uid() AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager') AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_agent()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager', 'agent') AND is_active = true
  );
$$;
