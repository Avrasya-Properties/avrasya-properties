-- Grant managers permission to delete marketing offers cleanly and sync public listings.
DROP POLICY IF EXISTS manager_delete ON public.marketing_offers;
CREATE POLICY manager_delete ON public.marketing_offers
  FOR DELETE TO authenticated
  USING ((SELECT private.manager()));

GRANT DELETE ON public.marketing_offers TO authenticated;

NOTIFY pgrst, 'reload schema';

