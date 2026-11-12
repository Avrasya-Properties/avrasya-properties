import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
import { CaldrenSkyCtaSection } from "@/components/site/CaldrenSkyCtaSection";
import { meta } from "@/components/site/TextPage";
import { PropertyCard } from "@/components/site/PropertyCard";
import { useSiteSettings } from "@/admin/store";
import { publicRegions, REGION_PRESETS, slugifyRegion } from "@/data/regions";
import { loadPublicSettings, useCatalogue } from "@/data/live";
import { useCurrency } from "@/hooks/usePreferences";
import { comparableUsd, convertUsdPrice, priceDisplay } from "@/data/properties";
import { PLACEHOLDER_IMAGES, resolvePlaceholderSrc } from "@/data/placeholders";
import { REGIONS_DATA, type RegionData } from "@/components/site/CaldrenLocationsSection";

export const Route = createFileRoute("/regions/$slug")({
  loader: async ({ params }) => {
    try {
      const settings = await loadPublicSettings();
      const all = publicRegions(settings.regions);
      const found =
        all.find((r) => r.slug === params.slug) ||
        REGION_PRESETS.find((r) => r.slug === params.slug);
      return { region: found ?? null, slug: params.slug };
    } catch {
      const fallback = REGION_PRESETS.find((r) => r.slug === params.slug) ?? null;
      return { region: fallback, slug: params.slug };
    }
  },
  head: ({ loaderData, params }) => {
    const r = loaderData?.region;
    const fallbackTitle = `${params.slug.charAt(0).toUpperCase() + params.slug.slice(1)} Real Estate · Avrasya Properties`;
    const title = r?.seoTitle || fallbackTitle;
    const fallbackDesc =
      r?.summary ||
      `Curated apartments, villas, and citizenship-eligible residences in ${params.slug}, Türkiye — verified by Avrasya Properties.`;
    const desc = r?.seoDescription || fallbackDesc;
    const image =
      r?.ogImage || r?.heroImage || "https://avrasyaproperties.com/images/properties/hero-main.jpg";
    return meta(title, desc, { image, path: `/regions/${params.slug}` });
  },
  component: RegionLanding,
});

function RegionLanding() {
  const { slug } = Route.useParams();
  const settings = useSiteSettings();
  const catalogue = useCatalogue();
  const properties = catalogue.properties;
  const [currency] = useCurrency();

  const allPublic = useMemo(() => publicRegions(settings.regions), [settings.regions]);
  const regionFromStore = useMemo(() => allPublic.find((r) => r.slug === slug), [allPublic, slug]);
  const presetMatch = REGION_PRESETS.find((r: { slug: string }) => r.slug === slug);
  const showcaseMatch = REGIONS_DATA.find((r: RegionData) => r.slug === slug);

  const region = useMemo(() => {
    if (regionFromStore) {
      return {
        slug: regionFromStore.slug,
        name: regionFromStore.name,
        tagline: showcaseMatch?.tagline ?? `${regionFromStore.name}, ${regionFromStore.country}`,
        description: regionFromStore.summary || showcaseMatch?.description || "",
        districts: regionFromStore.districts,
      };
    }
    if (showcaseMatch) {
      return {
        slug: showcaseMatch.slug,
        name: showcaseMatch.name,
        tagline: showcaseMatch.tagline,
        description: showcaseMatch.description,
        districts: showcaseMatch.districts ?? [],
      };
    }
    if (presetMatch) {
      return {
        slug: presetMatch.slug,
        name: presetMatch.name,
        tagline: `${presetMatch.name}, ${presetMatch.country}`,
        description: presetMatch.summary,
        districts: presetMatch.districts,
      };
    }
    return null;
  }, [regionFromStore, showcaseMatch, presetMatch]);

  const regionListings = useMemo(() => {
    if (!region) return [];
    return properties.filter((p) => slugifyRegion(p.city || "istanbul") === region.slug);
  }, [properties, region]);

  if (!region) {
    return (
      <div
        className="min-h-screen bg-white text-[#0e0e0c]"
        style={{ fontFamily: '"Geist", "Inter", sans-serif' }}
      >
        <section className="mx-auto max-w-[1312px] px-5 pt-20 pb-16 sm:px-8 lg:px-[64px]">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#b08d44]">
            Regions · Türkiye
          </p>
          <h1 className="mt-4 text-[48px] font-normal leading-[1.05] tracking-[-0.04em] sm:text-[72px]">
            Region not available
          </h1>
          <p className="mt-4 max-w-xl text-[16px] text-[#63615b]">
            This region page isn’t published yet, or the link you followed is out of date. Explore
            our active locations below.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {allPublic.map((r) => (
              <Link
                key={r.slug}
                to="/regions/$slug"
                params={{ slug: r.slug }}
                className="inline-flex h-[44px] items-center gap-2 rounded-full bg-[#0e0e0c] px-6 text-[13px] text-white no-underline"
              >
                <MapPin className="h-3.5 w-3.5 text-[#b08d44]" /> {r.name}
              </Link>
            ))}
            <Link
              to="/why-turkiye"
              className="inline-flex h-[44px] items-center gap-2 rounded-full border border-[#0e0e0c]/20 px-6 text-[13px] text-[#0e0e0c] no-underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All Locations
            </Link>
          </div>
        </section>
        <CaldrenSkyCtaSection />
      </div>
    );
  }

  const slotIdx = showcaseMatch?.slotIndex ?? 0;
  const placeholderSlot = PLACEHOLDER_IMAGES.locationsPage[slotIdx]!;
  const heroPlaceholderSrc = resolvePlaceholderSrc(placeholderSlot);
  const featuredProp = regionListings[0];
  const featuredUsd = featuredProp ? comparableUsd(featuredProp.price) : null;

  return (
    <div
      className="min-h-screen w-full bg-white text-[#0e0e0c]"
      style={{ fontFamily: '"Geist", "Inter", sans-serif' }}
    >
      {/* 1. Caldren Page Header */}
      <section className="mx-auto flex w-full max-w-[1312px] flex-col items-start justify-between gap-8 px-5 pt-14 pb-10 sm:px-8 lg:flex-row lg:items-end lg:px-[64px] lg:pt-[96px] lg:pb-[48px]">
        <div className="max-w-[760px]">
          <Link
            to="/why-turkiye"
            className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.14em] text-[#63615b] no-underline hover:text-[#0e0e0c]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Locations Index
          </Link>
          <h1 className="m-0 text-[52px] font-normal leading-[1.03] tracking-[-0.04em] text-[#0e0e0c] sm:text-[76px] lg:text-[112px]">
            <span>{region.name},</span>
            <br />
            <span
              className="italic font-normal tracking-[-0.02em]"
              style={{
                fontFamily: '"Instrument Serif", "Cormorant Garamond", Georgia, serif',
              }}
            >
              considered.
            </span>
          </h1>
        </div>

        <div className="w-full max-w-[400px] pb-2">
          <p className="m-0 text-[16px] font-normal leading-[1.55] tracking-[-0.01em] text-[#63615b]">
            {region.tagline} — curated residences, SPK-licensed valuation, and title review by
            Avrasya’s in-house attorney.
          </p>
        </div>
      </section>

      {/* 2. Caldren Numbered City Index Tab Bar */}
      <div className="border-b border-[#0e0e0c]/10 bg-white">
        <div className="mx-auto grid w-full max-w-[1312px] grid-cols-2 px-5 sm:grid-cols-4 sm:px-8 lg:px-[64px]">
          {REGIONS_DATA.map((reg: RegionData) => {
            const isActive = reg.slug === region.slug;
            return (
              <Link
                key={reg.slug}
                to="/regions/$slug"
                params={{ slug: reg.slug }}
                className={`flex items-center gap-[8px] py-[18px] no-underline transition-colors ${
                  isActive
                    ? "border-t-2 border-[#0e0e0c] font-medium text-[#0e0e0c]"
                    : "border-t border-[#0e0e0c]/12 font-normal text-[#63615b] hover:text-[#0e0e0c]"
                }`}
              >
                <span className="text-[15px] tabular-nums">{reg.index}</span>
                <span className="text-[15px] tracking-[-0.01em]">{reg.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. Caldren 2-Column Region Overview Section */}
      <section className="mx-auto flex w-full max-w-[1312px] flex-col items-center gap-10 px-5 py-16 sm:px-8 lg:flex-row lg:gap-[80px] lg:px-[64px] lg:py-[72px]">
        <div className="relative h-[460px] w-full overflow-hidden bg-[#f4f3ef] sm:h-[620px] lg:h-[760px] lg:w-[52%] lg:shrink-0">
          <img
            src={heroPlaceholderSrc}
            alt={placeholderSlot.alt}
            className="block h-full w-full object-cover object-center"
          />
          <div className="pointer-events-none absolute top-5 left-5 rounded-full bg-white/95 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#0e0e0c]">
            {showcaseMatch?.index ?? "01"} · {region.name}
          </div>
        </div>

        <div className="flex flex-1 flex-col items-start justify-center gap-[32px]">
          <div className="flex w-full flex-col items-start gap-[20px]">
            <h2 className="m-0 text-[56px] font-normal leading-[0.95] tracking-[-0.06em] text-[#0e0e0c] sm:text-[76px] lg:text-[96px]">
              {region.name}
            </h2>
            <p className="m-0 text-[17px] font-normal leading-[1.5] tracking-[-0.01em] text-[#3f3e3a] sm:text-[19px]">
              {region.description}
            </p>

            {region.districts.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {region.districts.map((d: string) => (
                  <Link
                    key={d}
                    to="/properties"
                    search={
                      region.slug === "istanbul" ? { loc: d } : { region: region.slug, loc: d }
                    }
                    className="rounded-full border border-[#0e0e0c]/15 bg-[#faf9f6] px-3.5 py-1.5 text-[12px] text-[#0e0e0c] no-underline transition-colors hover:border-[#b08d44] hover:bg-[#b08d44] hover:text-white"
                  >
                    {d}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="grid w-full grid-cols-3 gap-4 border-t border-[#0e0e0c]/12 pt-[24px] sm:gap-[32px]">
            <div className="flex flex-col gap-[4px]">
              <span className="text-[24px] font-normal leading-[1.1] tracking-[-0.03em] text-[#0e0e0c] tabular-nums sm:text-[34px]">
                {showcaseMatch?.avgPriceM2 ?? "$3,850"}
              </span>
              <span className="text-[12px] text-[#63615b] sm:text-[13px]">
                Avg. price / m² (indicative)
              </span>
            </div>
            <div className="flex flex-col gap-[4px]">
              <span className="text-[24px] font-normal leading-[1.1] tracking-[-0.03em] text-[#0e0e0c] tabular-nums sm:text-[34px]">
                {showcaseMatch?.indicativeYield ?? "6.5–8.0%"}
              </span>
              <span className="text-[12px] text-[#63615b] sm:text-[13px]">
                Gross yield (indicative)
              </span>
            </div>
            <div className="flex flex-col gap-[4px]">
              <span className="text-[24px] font-normal leading-[1.1] tracking-[-0.03em] text-[#0e0e0c] tabular-nums sm:text-[34px]">
                {regionListings.length || showcaseMatch?.defaultResidencesCount || 4}
              </span>
              <span className="text-[12px] text-[#63615b] sm:text-[13px]">Residences</span>
            </div>
          </div>

          {featuredProp && (
            <Link
              to="/properties/$slug"
              params={{ slug: featuredProp.slug }}
              className="group flex w-full items-center gap-[18px] bg-[#f4f3ef] py-[12px] pr-[20px] pl-[12px] no-underline transition-colors hover:bg-[#ebe9e2]"
            >
              <div className="h-[72px] w-[96px] shrink-0 overflow-hidden bg-[#e3e2dd]">
                <img
                  src={featuredProp.cover || heroPlaceholderSrc}
                  alt={featuredProp.marketing_title}
                  className="block h-full w-full object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#63615b]">
                  FEATURED PROPERTY
                </span>
                <span className="truncate text-[16px] text-[#0e0e0c] sm:text-[17px]">
                  {featuredProp.marketing_title}
                </span>
              </div>
              <span className="shrink-0 text-[15px] font-medium text-[#0e0e0c] tabular-nums">
                {featuredUsd != null
                  ? convertUsdPrice(featuredUsd, currency)
                  : priceDisplay(featuredProp.price).main}
              </span>
            </Link>
          )}

          <Link
            to="/properties"
            search={region.slug === "istanbul" ? {} : { region: region.slug }}
            className="inline-flex h-[47px] items-center justify-center gap-[10px] rounded-full bg-[#0e0e0c] px-[26px] text-[14px] text-white no-underline transition-colors hover:bg-[#b08d44]"
          >
            <span>Explore properties in {region.name}</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 4. Regional Portfolio Grid */}
      <section className="mx-auto w-full max-w-[1312px] border-t border-[#0e0e0c]/10 px-5 py-20 sm:px-8 lg:px-[64px]">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#b08d44]">
              Verified Portfolio · {region.name}
            </p>
            <h2 className="mt-2 text-[32px] font-normal tracking-[-0.03em] text-[#0e0e0c] sm:text-[42px]">
              Available residences in {region.name}
            </h2>
          </div>
          <Link
            to="/properties"
            search={region.slug === "istanbul" ? {} : { region: region.slug }}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0e0e0c] no-underline hover:text-[#b08d44]"
          >
            <span>Open full filter view</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {regionListings.length === 0 ? (
          <div className="rounded-[6px] border border-[#0e0e0c]/12 bg-[#f4f3ef] p-12 text-center">
            <h3 className="text-[24px] font-normal text-[#0e0e0c]">
              Private &amp; Off-Market Inventory in {region.name}
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-[14px] text-[#63615b]">
              We are currently curating new residences in {region.name}. Share your brief with an
              Avrasya advisor to receive our private off-market shortlist.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/contact"
                className="inline-flex h-[44px] items-center rounded-full bg-[#0e0e0c] px-6 text-[13px] font-medium text-white no-underline"
              >
                Request {region.name} Shortlist
              </Link>
              <Link
                to="/properties"
                className="inline-flex h-[44px] items-center rounded-full border border-[#0e0e0c]/20 bg-white px-6 text-[13px] font-medium text-[#0e0e0c] no-underline"
              >
                Browse Istanbul Portfolio
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-[24px] gap-y-[48px] md:grid-cols-2 lg:grid-cols-3 lg:gap-y-[56px]">
            {regionListings.map((p, idx) => (
              <PropertyCard key={p.slug} r={p} index={idx} />
            ))}
          </div>
        )}
      </section>

      <CaldrenSkyCtaSection />
    </div>
  );
}
