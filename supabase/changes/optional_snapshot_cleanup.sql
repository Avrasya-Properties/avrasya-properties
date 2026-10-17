-- OPTIONAL, run by hand after 20261017000001_regions_and_snapshot_hardening.sql, ideally on a staging copy first.
--
-- The new save_offer stops copying importer-only keys into the public snapshot, but listings that were ALREADY
-- published keep the keys they had. Re-saving a listing rebuilds its snapshot; this removes the keys in bulk.
-- It updates published rows directly, so check that no trigger on marketing_offers objects to it (audit and
-- website-revision triggers will fire, which is expected). Preview first:
--
--   select slug from public.marketing_offers
--   where published_snapshot ?| array['title_provenance','citizenship_eligibility','price_effective_date'];
--
update public.marketing_offers
set published_snapshot = published_snapshot - 'title_provenance' - 'citizenship_eligibility' - 'price_effective_date'
where published_snapshot is not null
  and published_snapshot ?| array['title_provenance','citizenship_eligibility','price_effective_date'];