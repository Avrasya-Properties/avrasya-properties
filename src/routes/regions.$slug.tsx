import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { loadPublicSettings, useCatalogue } from "@/data/live";
import { DEMO_MODE } from "@/lib/supabase";
import { useSiteSettings } from "@/admin/store";
import { normalizeRegions, publicRegions, regionForCity, type Region } from "@/data/regions";
import { PageIntro } from "@/components/site/Chrome";
import { HeroBackdrop } from "@/components/site/hero/HeroBackdrop";
import { PropertyCard } from "@/components/site/PropertyCard";
import { meta } from "@/components/site/TextPage";
import { useTranslation } from "@/hooks/useLanguage";

export const Route = createFileRoute("/regions/$slug")({
  loader: async ({ params }) => {
    // A failed settings read must surface as an error, never as a 404 (a 404 here would be indexed).
    let settings: Awaited<ReturnType<typeof loadPublicSettings>> | null = null;
    try {
      settings = await loadPublicSettings();
    } catch (error) {
      if (!DEMO_MODE) throw error;
    }
    const regions = publicRegions(normalizeRegions(settings?.regions, settings?.districts));
    const region = regions.find((r) => r.slug === params.slug) ?? null;
    // In the browser-only demo the server cannot see localStorage, so only production data may decide a 404 here.
    if (!region && !DEMO_MODE) throw notFound();
    return { region };
  },
  head: ({ loaderData }) => {
    const r = loaderData?.region;
    if (!r) return meta("Property by region", "Browse published property and investment opportunities by region.", { path: "/properties" });
    return meta(
      r.seoTitle || `Property in ${r.name} — Avrasya Properties`,
      r.seoDescription || r.summary || `Browse published property and investment opportunities in ${r.name}, ${r.country}.`,
      { path: `/regions/${r.slug}`, ...(r.heroImage ? { image: r.heroImage.startsWith("/") ? `https://avrasyaproperties.com${r.heroImage}` : r.heroImage } : {}) },
    );
  },
  notFoundComponent: () => (
    <section className="container-site py-24 text-center">
      <h1 className="headline text-3xl">Region not found</h1>
      <Link to="/properties" className="btn btn-primary mt-6">Browse all properties</Link>
    </section>
  ),
  component: RegionPage,
});

function RegionPage() {
  const { t } = useTranslation();
  const loaded = Route.useLoaderData();
  const settings = useSiteSettings();
  const { slug } = Route.useParams();
  // The loader copy is authoritative (it reruns whenever the website revision changes); the store fills in for the browser-only demo.
  const live: Region | null = loaded.region ?? publicRegions(settings.regions).find((r) => r.slug === slug) ?? null;
  const catalogue = useCatalogue();
  if (!live) {
    return (
      <section className="container-site py-24 text-center">
        <h1 className="headline text-3xl">Region not found</h1>
        <Link to="/properties" className="btn btn-primary mt-6">Browse all properties</Link>
      </section>
    );
  }
  const listings = catalogue.properties.filter((r) => regionForCity(r.city, [live]));

  return (
    <>
      {live.heroImage ? (
        <section className="relative isolate overflow-hidden bg-night text-on-dark">
          <HeroBackdrop image={live.heroImage} />
          <div className="container-site relative z-10 flex min-h-[min(70svh,38rem)] flex-col justify-end gap-8 pb-14 pt-24 md:flex-row md:items-end md:justify-between md:pb-20">
            <div className="max-w-3xl">
              <p className="kicker text-brass-light">{live.country}</p>
              <h1 className="display-hero mt-4">{live.name}</h1>
              {live.summary && <p className="mt-6 max-w-2xl text-base leading-relaxed text-on-dark-muted md:text-lg">{live.summary}</p>}
            </div>
            <p className="md:text-right">
              <span className="numeral block text-5xl">{listings.length}</span>
              <span className="kicker mt-2 block text-on-dark-muted">{t.properties.regionListingsLabel}</span>
            </p>
          </div>
        </section>
      ) : (
        <PageIntro
          eyebrow={`${live.country}`}
          title={<>{live.name}</>}
          aside={
            <p className="text-on-dark md:text-right">
              <span className="numeral block text-5xl">{listings.length}</span>
              <span className="kicker mt-2 block text-on-dark-muted">{t.properties.regionListingsLabel}</span>
            </p>
          }
        >
          {live.summary && <p>{live.summary}</p>}
        </PageIntro>
      )}

      {live.districts.length > 0 && (
        <section className="container-site py-12 md:py-16">
          <h2 className="headline">{t.properties.regionDistrictsTitle}</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {live.districts.map((d) => (
              <li key={d}>
                <Link to="/properties" search={{ region: live.slug, loc: d }} className="inline-flex min-h-11 items-center gap-1.5 border border-border bg-card px-4 text-sm font-medium transition-colors hover:border-brass hover:text-brass-text">
                  <MapPin className="h-3.5 w-3.5 text-brass" />
                  {d}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="container-site pb-16">
        {listings.length ? (
          <div data-scroll-x className="snap-rail">
            {listings.map((r) => <PropertyCard key={r.slug} r={r} />)}
          </div>
        ) : (
          <div className="rounded-xs border border-border/80 bg-card p-8 text-center">
            <p className="mx-auto max-w-md text-sm text-muted-foreground">{t.properties.regionEmpty}</p>
            <Link to="/contact" className="btn btn-primary mt-5">{t.cta.requestConsultation}</Link>
          </div>
        )}
        <div className="mt-8">
          <Link to="/properties" search={{ region: live.slug }} className="btn btn-outline">{t.properties.regionViewListings}</Link>
        </div>
      </section>
    </>
  );
}