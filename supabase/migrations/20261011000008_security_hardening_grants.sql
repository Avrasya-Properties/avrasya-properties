-- Migration: 20261011000008_security_hardening_grants.sql
-- Description: Revoke execution grants from anon/public on SECURITY DEFINER and trigger functions, restricting RPC access

-- 1. Trigger functions: Only postgres/superuser/internal execution needed
REVOKE ALL ON FUNCTION public.check_last_admin_protection() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_lease_overlap() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_rent_allocation_currency() FROM PUBLIC, anon, authenticated;

-- 2. Sensitive administrative RPC functions: Revoke from public and anon
REVOKE ALL ON FUNCTION public.publish_offer_atomic(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.publish_offer_atomic(UUID, UUID) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.unpublish_offer(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.unpublish_offer(UUID, UUID) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.complete_deal_win(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_deal_win(UUID, UUID) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.create_reservation_atomic(UUID, UUID, UUID, UUID, UUID, NUMERIC, currency_code, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_reservation_atomic(UUID, UUID, UUID, UUID, UUID, NUMERIC, currency_code, INT) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.reserve_package_atomic(UUID, UUID, UUID, UUID, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reserve_package_atomic(UUID, UUID, UUID, UUID, INT) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.release_expired_reservations() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.release_expired_reservations() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.convert_enquiry_to_lead(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.convert_enquiry_to_lead(UUID, UUID) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.generate_rent_charges_for_month(INT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_rent_charges_for_month(INT, INT) TO authenticated, service_role;

-- 3. Auth helper functions: Allow authenticated, revoke from anon
REVOKE ALL ON FUNCTION public.get_current_staff_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_current_staff_role() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_active_staff() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_active_staff() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_manager() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_manager() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_agent() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_agent() TO authenticated, service_role;
