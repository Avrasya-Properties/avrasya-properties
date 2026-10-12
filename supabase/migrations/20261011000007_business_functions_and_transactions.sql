-- Migration: 20261011000007_business_functions_and_transactions.sql
-- Description: Core business logic, transactional workflows, lease rules, and audit logging triggers

-- 1. Lease Overlapping Prevention Trigger
CREATE OR REPLACE FUNCTION public.check_lease_overlap()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  conflict_count INT;
BEGIN
  IF NEW.status = 'active' THEN
    SELECT COUNT(*) INTO conflict_count
    FROM public.leases
    WHERE physical_unit_id = NEW.physical_unit_id
      AND status = 'active'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (start_date <= NEW.end_date AND end_date >= NEW.start_date);

    IF conflict_count > 0 THEN
      RAISE EXCEPTION 'Overlapping active lease already exists for physical unit %.', NEW.physical_unit_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER trg_leases_overlap_check
    BEFORE INSERT OR UPDATE ON public.leases
    FOR EACH ROW
    EXECUTE FUNCTION public.check_lease_overlap();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Prevent Cross-Currency Payment Allocations
CREATE OR REPLACE FUNCTION public.check_rent_allocation_currency()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  charge_curr currency_code;
  payment_curr currency_code;
BEGIN
  SELECT currency INTO charge_curr FROM public.rent_charges WHERE id = NEW.charge_id;
  SELECT currency INTO payment_curr FROM public.recorded_payments WHERE id = NEW.recorded_payment_id;

  IF charge_curr != payment_curr THEN
    RAISE EXCEPTION 'Cross-currency payment allocation rejected: charge is % but payment is %.', charge_curr, payment_curr;
  END IF;

  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER trg_rent_alloc_currency_check
    BEFORE INSERT OR UPDATE ON public.rent_payment_allocations
    FOR EACH ROW
    EXECUTE FUNCTION public.check_rent_allocation_currency();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Atomic Offer Publication
CREATE OR REPLACE FUNCTION public.publish_offer_atomic(
  p_offer_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_offer public.marketing_offers%ROWTYPE;
  v_snapshot JSONB;
BEGIN
  SELECT * INTO v_offer
  FROM public.marketing_offers
  WHERE id = p_offer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer % not found.', p_offer_id;
  END IF;

  -- Validation
  IF char_length(trim(v_offer.marketing_title)) = 0 THEN
    RAISE EXCEPTION 'Title cannot be empty.';
  END IF;
  IF NOT (v_offer.slug ~ '^[a-z0-9-]+$') THEN
    RAISE EXCEPTION 'Slug must contain only lowercase alphanumeric characters and hyphens.';
  END IF;
  IF char_length(trim(v_offer.district)) = 0 THEN
    RAISE EXCEPTION 'District / location cannot be empty.';
  END IF;
  IF v_offer.price_type != 'on-request' AND (v_offer.amount IS NULL OR v_offer.currency IS NULL) THEN
    RAISE EXCEPTION 'Price amount and currency must be specified unless marked on-request.';
  END IF;

  -- Build frozen publication snapshot
  v_snapshot := jsonb_build_object(
    'id', v_offer.id,
    'ref', v_offer.ref,
    'slug', v_offer.slug,
    'marketing_title', v_offer.marketing_title,
    'record_type', v_offer.record_type,
    'mode', v_offer.mode,
    'layout_label', v_offer.layout_label,
    'bathrooms', v_offer.bathrooms,
    'district', v_offer.district,
    'city', v_offer.city,
    'side', v_offer.side,
    'tapu_status', v_offer.tapu_status,
    'gross_m2', v_offer.gross_m2,
    'net_m2', v_offer.net_m2,
    'area_m2', v_offer.area_m2,
    'amount', v_offer.amount,
    'currency', v_offer.currency,
    'price_type', v_offer.price_type,
    'price_basis', v_offer.price_basis,
    'expenses_amount', v_offer.expenses_amount,
    'availability', v_offer.availability,
    'cover_image_path', v_offer.cover_image_path,
    'description', v_offer.description,
    'source_note', v_offer.source_note,
    'claims_requiring_confirmation', v_offer.claims_requiring_confirmation,
    'cbi_eligible', v_offer.cbi_eligible,
    'version', v_offer.version + 1,
    'published_at', now()
  );

  -- Record publication history
  INSERT INTO public.publication_history (
    offer_id, old_status, new_status, snapshot, changed_by, reason
  ) VALUES (
    v_offer.id, v_offer.publication, 'Published', v_snapshot, p_user_id, 'Atomic publication'
  );

  -- Update offer
  UPDATE public.marketing_offers
  SET publication = 'Published',
      published_snapshot = v_snapshot,
      published_at = now(),
      version = version + 1,
      updated_by = p_user_id,
      updated_at = now()
  WHERE id = p_offer_id;

  -- Record audit event
  INSERT INTO public.audit_events (
    actor_id, actor_role, action, target_table, target_id, new_values
  ) VALUES (
    p_user_id, 'manager', 'PUBLISH_OFFER', 'marketing_offers', p_offer_id, v_snapshot
  );

  RETURN v_snapshot;
END;
$$;

-- 4. Atomic Unpublish
CREATE OR REPLACE FUNCTION public.unpublish_offer(
  p_offer_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_old_pub publication_status;
BEGIN
  SELECT publication INTO v_old_pub
  FROM public.marketing_offers
  WHERE id = p_offer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer % not found.', p_offer_id;
  END IF;

  INSERT INTO public.publication_history (
    offer_id, old_status, new_status, changed_by, reason
  ) VALUES (
    p_offer_id, v_old_pub, 'Draft', p_user_id, 'Unpublished to Draft'
  );

  UPDATE public.marketing_offers
  SET publication = 'Draft',
      version = version + 1,
      updated_by = p_user_id,
      updated_at = now()
  WHERE id = p_offer_id;

  INSERT INTO public.audit_events (
    actor_id, action, target_table, target_id
  ) VALUES (
    p_user_id, 'UNPUBLISH_OFFER', 'marketing_offers', p_offer_id
  );
END;
$$;

-- 5. Atomic Reservation Creation
CREATE OR REPLACE FUNCTION public.create_reservation_atomic(
  p_deal_id UUID,
  p_offer_id UUID,
  p_unit_id UUID,
  p_contact_id UUID,
  p_user_id UUID,
  p_deposit NUMERIC,
  p_currency currency_code,
  p_duration_hours INT DEFAULT 72
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_res_id UUID;
  v_unit_status property_availability;
  v_offer_avail property_availability;
BEGIN
  IF p_unit_id IS NOT NULL THEN
    SELECT status INTO v_unit_status
    FROM public.physical_units
    WHERE id = p_unit_id
    FOR UPDATE;

    IF v_unit_status IN ('Reserved', 'Sold', 'Rented') THEN
      RAISE EXCEPTION 'Physical unit % is not available (status: %).', p_unit_id, v_unit_status;
    END IF;

    IF EXISTS (SELECT 1 FROM public.reservations WHERE physical_unit_id = p_unit_id AND status = 'active' AND expires_at > now()) THEN
      RAISE EXCEPTION 'Physical unit % already has an active reservation.', p_unit_id;
    END IF;

    UPDATE public.physical_units
    SET status = 'Reserved', updated_at = now()
    WHERE id = p_unit_id;

    INSERT INTO public.availability_history (physical_unit_id, old_status, new_status, changed_by, reason)
    VALUES (p_unit_id, v_unit_status, 'Reserved', p_user_id, 'Reservation created');
  END IF;

  IF p_offer_id IS NOT NULL THEN
    SELECT availability INTO v_offer_avail
    FROM public.marketing_offers
    WHERE id = p_offer_id
    FOR UPDATE;

    IF v_offer_avail IN ('Reserved', 'Sold', 'Rented') THEN
      RAISE EXCEPTION 'Marketing offer % is not available (status: %).', p_offer_id, v_offer_avail;
    END IF;

    UPDATE public.marketing_offers
    SET availability = 'Reserved', updated_at = now()
    WHERE id = p_offer_id;

    INSERT INTO public.availability_history (offer_id, old_status, new_status, changed_by, reason)
    VALUES (p_offer_id, v_offer_avail, 'Reserved', p_user_id, 'Reservation created');
  END IF;

  INSERT INTO public.reservations (
    deal_id, offer_id, physical_unit_id, contact_id, reserved_by,
    deposit_amount, deposit_currency, reserved_from, expires_at, status
  ) VALUES (
    p_deal_id, p_offer_id, p_unit_id, p_contact_id, p_user_id,
    p_deposit, p_currency, now(), now() + (p_duration_hours || ' hours')::interval, 'active'
  )
  RETURNING id INTO v_res_id;

  INSERT INTO public.audit_events (actor_id, action, target_table, target_id)
  VALUES (p_user_id, 'CREATE_RESERVATION', 'reservations', v_res_id);

  RETURN v_res_id;
END;
$$;

-- 6. Atomic Package Reservation
CREATE OR REPLACE FUNCTION public.reserve_package_atomic(
  p_deal_id UUID,
  p_package_offer_id UUID,
  p_contact_id UUID,
  p_user_id UUID,
  p_duration_hours INT DEFAULT 72
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_res_id UUID;
  v_member RECORD;
BEGIN
  PERFORM 1 FROM public.marketing_offers WHERE id = p_package_offer_id FOR UPDATE;

  FOR v_member IN (
    SELECT pm.member_unit_id, u.status
    FROM public.package_memberships pm
    JOIN public.physical_units u ON u.id = pm.member_unit_id
    WHERE pm.package_offer_id = p_package_offer_id
    FOR UPDATE OF u
  ) LOOP
    IF v_member.status IN ('Reserved', 'Sold', 'Rented') THEN
      RAISE EXCEPTION 'Constituent unit % is not available (status: %).', v_member.member_unit_id, v_member.status;
    END IF;
  END LOOP;

  FOR v_member IN (
    SELECT member_unit_id FROM public.package_memberships WHERE package_offer_id = p_package_offer_id
  ) LOOP
    UPDATE public.physical_units SET status = 'Reserved', updated_at = now() WHERE id = v_member.member_unit_id;
    INSERT INTO public.availability_history (physical_unit_id, old_status, new_status, changed_by, reason)
    VALUES (v_member.member_unit_id, 'Available', 'Reserved', p_user_id, 'Package reservation constituent');
  END LOOP;

  UPDATE public.marketing_offers SET availability = 'Reserved', updated_at = now() WHERE id = p_package_offer_id;

  INSERT INTO public.reservations (
    deal_id, offer_id, contact_id, reserved_by, reserved_from, expires_at, status
  ) VALUES (
    p_deal_id, p_package_offer_id, p_contact_id, p_user_id, now(), now() + (p_duration_hours || ' hours')::interval, 'active'
  ) RETURNING id INTO v_res_id;

  RETURN v_res_id;
END;
$$;

-- 7. Deal Win Completion (Marks ONLY Selected Units Sold, NEVER entire Shortlist)
CREATE OR REPLACE FUNCTION public.complete_deal_win(
  p_deal_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_selected RECORD;
BEGIN
  PERFORM 1 FROM public.deals WHERE id = p_deal_id FOR UPDATE;

  FOR v_selected IN (
    SELECT dsu.physical_unit_id, dsu.offer_id
    FROM public.deal_selected_units dsu
    WHERE dsu.deal_id = p_deal_id
  ) LOOP
    IF v_selected.physical_unit_id IS NOT NULL THEN
      UPDATE public.physical_units
      SET status = 'Sold', updated_at = now()
      WHERE id = v_selected.physical_unit_id;

      INSERT INTO public.availability_history (physical_unit_id, old_status, new_status, changed_by, reason)
      VALUES (v_selected.physical_unit_id, 'Reserved', 'Sold', p_user_id, 'Deal won');
    END IF;

    IF v_selected.offer_id IS NOT NULL THEN
      UPDATE public.marketing_offers
      SET availability = 'Sold', updated_at = now()
      WHERE id = v_selected.offer_id;

      INSERT INTO public.availability_history (offer_id, old_status, new_status, changed_by, reason)
      VALUES (v_selected.offer_id, 'Reserved', 'Sold', p_user_id, 'Deal won');
    END IF;
  END LOOP;

  UPDATE public.reservations
  SET status = 'converted', updated_at = now()
  WHERE deal_id = p_deal_id AND status = 'active';

  UPDATE public.deals
  SET stage = 'Won',
      actual_close_date = now(),
      version = version + 1,
      updated_at = now()
  WHERE id = p_deal_id;

  INSERT INTO public.audit_events (actor_id, action, target_table, target_id)
  VALUES (p_user_id, 'COMPLETE_DEAL_WIN', 'deals', p_deal_id);
END;
$$;

-- 8. Reservation Expiry Background Job Function
CREATE OR REPLACE FUNCTION public.release_expired_reservations()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_count INT := 0;
  v_res RECORD;
BEGIN
  FOR v_res IN (
    SELECT id, offer_id, physical_unit_id
    FROM public.reservations
    WHERE status = 'active' AND expires_at < now()
    FOR UPDATE
  ) LOOP
    UPDATE public.reservations
    SET status = 'expired', updated_at = now()
    WHERE id = v_res.id;

    IF v_res.physical_unit_id IS NOT NULL THEN
      UPDATE public.physical_units
      SET status = 'Available', updated_at = now()
      WHERE id = v_res.physical_unit_id AND status = 'Reserved';

      INSERT INTO public.availability_history (physical_unit_id, old_status, new_status, reason)
      VALUES (v_res.physical_unit_id, 'Reserved', 'Available', 'Automatic reservation expiration');
    END IF;

    IF v_res.offer_id IS NOT NULL THEN
      UPDATE public.marketing_offers
      SET availability = 'Available', updated_at = now()
      WHERE id = v_res.offer_id AND availability = 'Reserved';

      INSERT INTO public.availability_history (offer_id, old_status, new_status, reason)
      VALUES (v_res.offer_id, 'Reserved', 'Available', 'Automatic reservation expiration');
    END IF;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- 9. Idempotent Enquiry to Lead Conversion
CREATE OR REPLACE FUNCTION public.convert_enquiry_to_lead(
  p_enquiry_id UUID,
  p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_enq public.enquiries%ROWTYPE;
  v_contact_id UUID;
  v_lead_id UUID;
  v_budget_num NUMERIC;
BEGIN
  SELECT * INTO v_enq FROM public.enquiries WHERE id = p_enquiry_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Enquiry % not found.', p_enquiry_id;
  END IF;

  IF v_enq.lead_id IS NOT NULL THEN
    RETURN v_enq.lead_id;
  END IF;

  SELECT id INTO v_contact_id
  FROM public.contacts
  WHERE (lower(email) = lower(v_enq.email) AND email IS NOT NULL)
     OR (phone = v_enq.phone AND phone IS NOT NULL)
  LIMIT 1;

  IF v_contact_id IS NULL THEN
    INSERT INTO public.contacts (
      name, email, phone, kind, roles, language, notes, created_by
    ) VALUES (
      v_enq.name, v_enq.email, v_enq.phone, 'person', '{"buyer"}', 'English',
      'Converted from enquiry ' || v_enq.ref_number || ': ' || v_enq.topic, p_user_id
    ) RETURNING id INTO v_contact_id;
  END IF;

  BEGIN
    v_budget_num := NULLIF(regexp_replace(v_enq.budget, '[^0-9.]', '', 'g'), '')::NUMERIC;
  EXCEPTION
    WHEN OTHERS THEN v_budget_num := NULL;
  END;

  INSERT INTO public.leads (
    contact_id, enquiry_id, source, assigned_agent_id,
    budget_min, budget_max, currency, stage, shortlist, created_by
  ) VALUES (
    v_contact_id, v_enq.id, v_enq.source, p_user_id,
    CASE WHEN v_budget_num IS NOT NULL THEN v_budget_num * 0.8 ELSE NULL END,
    v_budget_num, 'USD', 'Qualified',
    CASE WHEN v_enq.offer_id IS NOT NULL THEN ARRAY[v_enq.offer_id] ELSE '{}' END,
    p_user_id
  ) RETURNING id INTO v_lead_id;

  UPDATE public.enquiries
  SET lead_id = v_lead_id, contact_id = v_contact_id, status = 'Qualified', updated_at = now()
  WHERE id = p_enquiry_id;

  INSERT INTO public.activities (user_id, kind, text, ref_kind, ref_id)
  VALUES (p_user_id, 'lead', 'Enquiry ' || v_enq.ref_number || ' converted to lead', 'leads', v_lead_id);

  RETURN v_lead_id;
END;
$$;

-- 10. Generate Recurring Rent Charges
CREATE OR REPLACE FUNCTION public.generate_rent_charges_for_month(
  p_year INT,
  p_month INT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_count INT := 0;
  v_lease RECORD;
  v_period_start DATE;
  v_period_end DATE;
  v_days_in_month INT;
  v_due_day INT;
  v_due_date DATE;
BEGIN
  v_period_start := make_date(p_year, p_month, 1);
  v_days_in_month := EXTRACT(DAY FROM (v_period_start + interval '1 month - 1 day'));
  v_period_end := make_date(p_year, p_month, v_days_in_month);

  FOR v_lease IN (
    SELECT id, rent_amount, rent_currency, payment_due_day
    FROM public.leases
    WHERE status = 'active'
      AND start_date <= v_period_end
      AND end_date >= v_period_start
  ) LOOP
    v_due_day := LEAST(v_lease.payment_due_day, v_days_in_month);
    v_due_date := make_date(p_year, p_month, v_due_day);

    INSERT INTO public.rent_charges (
      lease_id, period_start, period_end, due_date, charge_amount, currency, status
    ) VALUES (
      v_lease.id, v_period_start, v_period_end, v_due_date, v_lease.rent_amount, v_lease.rent_currency, 'pending'
    )
    ON CONFLICT (lease_id, period_start) DO NOTHING;

    IF FOUND THEN
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;
