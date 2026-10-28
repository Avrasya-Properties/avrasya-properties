import { ManagedPage } from "@/components/site/ManagedPage";
import { useWhatsAppLink } from "@/hooks/useLiveContact";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "@/hooks/useLanguage";
import { ArrowRight, Calculator, MessageSquare } from "lucide-react";
import { type PropertyRecord } from "@/data/properties";
import { MotionRoot } from "@/components/site/Motion";
import { PropertyCard } from "@/components/site/PropertyCard";
import { BosphorusNavigator } from "@/components/site/BosphorusNavigator";
import { HeroBackdrop } from "@/components/site/hero/HeroBackdrop";
import { LazySkylineScene } from "@/components/site/hero/LazySkylineScene";
import { RegionShowcase } from "@/components/site/RegionShowcase";
import { ProcessSteps, type ProcessStep } from "@/components/site/ProcessSteps";
import { meta } from "@/components/site/TextPage";
import { useCatalogue, loadPublicSettings } from "@/data/live";
import { useSiteSettings } from "@/admin/store";
import { AcquisitionCalculator } from "@/components/site/AcquisitionCalculator";
import { allDistricts, publicRegions, regionForCity, sameCity, slugifyRegion, type Region } from "@/data/regions";
export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    try {
      const settings = await context.queryClient.ensureQueryData({
        queryKey: ["site-settings"],
        queryFn: loadPublicSettings,
        staleTime: 60000,
      });
      return { settings };
    } catch {
      return { settings: null };
    }
  },
  head: ({ loaderData }) => {
    const s = loaderData?.settings;
    const title = s?.siteTitle?.trim() || "Avrasya Properties — Istanbul Luxury Real Estate & Investment Advisory";
    const desc = s?.metaDescription?.trim() || "Istanbul property advisory for international buyers. Explore published property opportunities, independent legal review, and citizenship advisory services.";
    const canonical = s?.siteUrl?.trim() || "https://avrasyaproperties.com";
    const image = s?.ogImage?.trim() || "https://avrasyaproperties.com/images/properties/hero-main.jpg";
    const noindex = s?.indexingEnabled === false;
    return meta(title, desc, { canonical, image, noindex });
  },
  component: Home,
});


function Home() {
  const catalogue = useCatalogue();
  return (
    <>
      <HomeCollection
        properties={catalogue.properties}
        loading={catalogue.isPending}
        unavailable={catalogue.isError}
        retry={() => void catalogue.refetch()}
      />
      <MotionRoot />
    </>
  );
}
const JOURNEY: ProcessStep[] = [
  {
    label: "Step 01 · Explore & Plan",
    title: "Understanding your lifestyle, family goals, and finding the right home",
    items: [
      ["Personal Guidance", "We discuss your goals, family needs, and preferred budget."],
      ["Handpicked Homes", "Tour top neighborhoods with verified, trusted properties."],
      ["Easy Preparation", "We guide you through Turkish tax ID setup and bank account opening."],
    ],
  },
  {
    label: "Step 02 · Secure & Purchase",
    title: "Independent legal checks, fair price valuation, and official deed transfer",
    items: [
      ["Clean Ownership Check", "We verify at the Land Registry that the property is completely debt-free."],
      ["Fair Market Appraisal", "Independent government-certified appraisal confirming true market value."],
      ["Official Deed Transfer", "We register the official title deed (Tapu) directly into your name."],
    ],
  },
  {
    label: "Step 03 · Move In & Prosper",
    title: "Collecting keys, connecting utilities, and optional rental management",
    items: [
      ["Key Handover & Move-In", "We inspect your home, hand over your keys, and connect all utilities."],
      ["Rental Management", "We place reliable tenants so your property generates steady returns."],
      ["Ongoing Care", "Continuous support whenever you wish to rent, sell, or upgrade in the future."],
    ],
  },
];

function HomeCollection({
  properties,
  loading,
  unavailable,
  retry,
}: {
  properties: PropertyRecord[];
  loading: boolean;
  unavailable: boolean;
  retry: () => void;
}) {
  const waLink = useWhatsAppLink();
  const { t, locale } = useTranslation();
  const EDITORIAL = properties.slice(0, 6);
  const settings = useSiteSettings();
  const rawRegions = publicRegions(settings.regions);
  const propertyCities = Array.from(new Set(properties.map((p) => p.city).filter(Boolean)));
  const extraRegions: Region[] = propertyCities
    .filter((cityName) => !regionForCity(cityName, rawRegions))
    .map((cityName) => ({
      slug: slugifyRegion(cityName),
      name: cityName,
      country: "Türkiye",
      summary: "",
      heroImage: "",
      districts: Array.from(new Set(properties.filter((p) => sameCity(p.city, cityName)).map((p) => p.location_label).filter((x): x is string => Boolean(x)))),
      hasSides: false,
      published: true,
      sortOrder: 99,
      seoTitle: "",
      seoDescription: "",
    }));
  const regions = [...rawRegions, ...extraRegions];
  const derived = Array.from(new Set(properties.map((r) => r.location_label).filter((x): x is string => !!x && x !== "Location to confirm")));
  const LOCATIONS = allDistricts(regions).length ? allDistricts(regions) : settings.districts?.length ? settings.districts : derived;
  const LAYOUTS = settings.layouts?.length ? settings.layouts : ["1+1", "2+1", "3+1", "4+1", "Penthouse", "Duplex"];
  const BUDGETS = settings.budgetRanges?.length
    ? settings.budgetRanges
    : [
        { id: "u300", label: "Up to $300,000", min: 0, max: 300000 },
        { id: "300-450", label: "$300,000 – $450,000", min: 300000, max: 450000 },
        { id: "450-600", label: "$450,000 – $600,000", min: 450000, max: 600000 },
        { id: "600-1m", label: "$600,000 – $1,000,000", min: 600000, max: 1000000 },
        { id: "1m-plus", label: "$1,000,000+", min: 1000000, max: 99999999 },
      ];

  const navigate = useNavigate();
  const heroImage = settings.websiteDesign?.["heroMain"] || "/images/properties/hero-main.jpg";
  const [search, setSearch] = useState({ region: "", loc: "", layout: "", budget: "" });
  const districtOptions = search.region ? (regions.find((r) => r.slug === search.region)?.districts ?? []) : LOCATIONS;
  // The Istanbul district explorer is Istanbul-specific: hide it only when regions are configured without Istanbul.
  const showIstanbulExplorer = !regions.length || !!regionForCity("Istanbul", regions);
  const cbiK = settings.cbiThresholdUsd ? `${Math.round(settings.cbiThresholdUsd / 1000)}K` : "400K";

  const selectCls = "field transition-colors";
  const labelCls = "kicker mb-1.5 block !text-[0.62rem] text-muted-foreground";

  return (
    <div data-home-page>
      {/* Hero: full-bleed photograph, parallax depth and an optional WebGL skyline model (desktop only) */}
      <section data-home-hero className="home-hero relative isolate overflow-hidden bg-night text-on-dark">
        <HeroBackdrop image={heroImage} />
        <LazySkylineScene className="absolute inset-y-0 end-0 z-0 hidden w-[46%] [mask-image:linear-gradient(90deg,transparent,#000_28%)] lg:block" />
        <div className="container-site relative z-10 grid min-h-[min(86svh,50rem)] items-center pb-28 pt-12 md:pb-32 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="kicker text-brass-light">{locale === "en" && settings.eyebrowText ? settings.eyebrowText : t.home.heroEyebrow}</p>
            <h1 className="display-hero mt-5 max-w-[16ch] text-on-dark lg:max-w-[14ch]">
              <span className="split-line">
                <span style={{ ["--d" as string]: "150ms" }}>
                  {locale === "en" && settings.heroHeadline ? settings.heroHeadline : `${t.home.heroTitle} ${t.home.heroTitleEm}`}
                </span>
              </span>
            </h1>
            <p data-reveal style={{ ["--d" as string]: "350ms" }} className="mt-6 max-w-xl text-base leading-relaxed text-on-dark-muted md:text-lg">
              {locale === "en" && settings.heroSubtitle ? settings.heroSubtitle : t.home.heroSubtitle}
            </p>
            <div data-reveal style={{ ["--d" as string]: "500ms" }} className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/contact" className="btn btn-light gap-2">
                <span>{t.nav.bookConsultation}</span>
                <ArrowRight className="h-4 w-4 rtl-flip" />
              </Link>
              <a
                href={waLink("Inquiry regarding property opportunities in Türkiye")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn !border !border-white/30 !bg-transparent !text-white gap-2"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{t.nav.advisoryDesk}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Facts drawn from live data only */}
        <div className="container-site relative z-10 pb-16 md:pb-20">
          <dl data-reveal className="grid grid-cols-2 gap-y-6 border-t border-white/20 pt-6 sm:grid-cols-4">
            {[
              [String(properties.length), t.properties.regionListingsLabel],
              [String(regions.length || 1), t.properties.filterRegion],
              [String(LOCATIONS.length), t.home.filterDistrict],
              [`$${cbiK}`, t.home.cbiEyebrow.split("·")[0] || "CBI"],
            ].map(([value, label]) => (
              <div key={label} className="flex flex-col-reverse">
                <dt className="kicker mt-2 text-on-dark-muted">{label}</dt>
                <dd className="numeral text-4xl text-on-dark md:text-5xl">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Search sits on the seam between hero and page */}
      <div className="container-site relative z-20 -mt-10 md:-mt-12">
        <form
          data-reveal
          className={`home-search grid gap-4 border border-border bg-card p-4 text-foreground shadow-[0_34px_60px_-44px_rgba(7,25,30,0.6)] sm:grid-cols-2 md:p-6 lg:items-end ${regions.length > 1 ? "lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]" : "lg:grid-cols-[repeat(3,minmax(0,1fr))_auto]"}`}
          onSubmit={(e) => {
            e.preventDefault();
            navigate({
              to: "/properties",
              search: {
                region: search.region || undefined,
                loc: search.loc || undefined,
                layout: search.layout || undefined,
                budget: search.budget || undefined,
              },
            });
          }}
        >
          {regions.length > 1 && (
            <label className="block">
              <span className={labelCls}>{t.properties.filterRegion}</span>
              <select className={selectCls} value={search.region} onChange={(e) => setSearch({ ...search, region: e.target.value, loc: "" })}>
                <option value="">{t.properties.allRegions}</option>
                {regions.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block">
            <span className={labelCls}>{t.home.filterDistrict}</span>
            <select className={selectCls} value={search.loc} onChange={(e) => setSearch({ ...search, loc: e.target.value })}>
              <option value="">{t.home.filterAllDistricts}</option>
              {districtOptions.map((l: string) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>{t.home.filterLayout}</span>
            <select className={selectCls} value={search.layout} onChange={(e) => setSearch({ ...search, layout: e.target.value })}>
              <option value="">{t.home.filterAllLayouts}</option>
              {LAYOUTS.map((l: string) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>{t.home.filterBudget} (USD)</span>
            <select className={selectCls} value={search.budget} onChange={(e) => setSearch({ ...search, budget: e.target.value })}>
              <option value="">{t.home.filterAnyBudget}</option>
              {BUDGETS.map((b: { id: string; label: string }) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-primary w-full gap-2 sm:col-span-2 lg:col-span-1 lg:w-auto">
            <span>{t.home.filterSearchBtn}</span>
            <ArrowRight className="h-3.5 w-3.5 rtl-flip" />
          </button>
        </form>
      </div>

      <ManagedPage slug="home" secondary>{null}</ManagedPage>

      <RegionShowcase regions={regions} properties={properties} />

      {/* Handpicked listings */}
      <section data-home-collection className="relative overflow-hidden bg-background py-16 md:py-24">
        <div className="container-site relative z-10 space-y-14">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="kicker text-brass-text">{t.home.editorialEyebrow}</p>
              <h2 data-reveal className="headline mt-3 max-w-2xl">
                {settings.websiteDesign?.["homeCollectionTitle"] || (
                  <>
                    {t.home.editorialTitle} <em className="font-normal italic text-brass">{t.home.editorialTitleEm}</em>
                  </>
                )}
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{settings.websiteDesign?.["homeCollectionText"] || t.home.editorialSubtitle}</p>
          </div>

          {loading ? (
            <p role="status" className="border border-border/70 bg-card p-6 text-sm text-muted-foreground">
              {t.common.loading}
            </p>
          ) : unavailable ? (
            <div role="alert" className="border border-destructive/30 bg-card p-6">
              <p className="text-sm text-foreground">{t.common.error}</p>
              <button onClick={retry} className="btn btn-outline mt-4 text-xs">
                {t.common.retry}
              </button>
            </div>
          ) : !properties.length ? (
            <div data-empty-collection className="flex flex-col justify-between gap-4 border border-border/70 bg-card p-5 sm:flex-row sm:items-center md:p-6">
              <div>
                <p className="kicker text-brass-text">{t.home.editorialEyebrow}</p>
                <h3 className="font-display mt-1 text-2xl text-foreground">{t.properties.noResultsTitle}</h3>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">{t.properties.noResultsDesc}</p>
              </div>
              <Link to="/contact" className="btn btn-outline shrink-0 text-xs">
                {t.cta.requestConsultation}
              </Link>
            </div>
          ) : (
            <div data-scroll-x className="snap-rail">
              {EDITORIAL.map((r) => (
                <PropertyCard key={r.slug} r={r} />
              ))}
            </div>
          )}

          {showIstanbulExplorer && (
            <div className="border-t border-border/70 pt-10">
              <BosphorusNavigator embedded />
            </div>
          )}
        </div>
      </section>

      <ProcessSteps
        eyebrow="How We Help You"
        title={settings.websiteDesign?.["homeJourneyTitle"] || "Your simple 3-step buying journey"}
        steps={JOURNEY}
        linkLabel={t.nav.advisoryServices}
      />

      <section className="container-site py-16 md:py-24">
        <AcquisitionCalculator />
      </section>

      {/* Citizenship and consultation band */}
      <section className="relative overflow-hidden bg-night py-20 text-on-dark md:py-32">
        <div aria-hidden data-parallax="0.2" className="outline-word outline-light pointer-events-none absolute -bottom-6 end-0 select-none text-[7rem] !opacity-40 sm:text-[12rem] md:text-[18rem] lg:text-[22rem]" style={{ WebkitTextStroke: "1.5px rgba(229,195,120,0.5)" }}>
          TÜRKİYE
        </div>
        <div className="container-site relative z-10">
          <p className="kicker text-brass-light">{t.home.cbiEyebrow}</p>
          <h2 data-reveal className="headline mt-4 max-w-3xl text-on-dark">
            {t.home.cbiTitle} <em className="font-normal italic text-brass-light">{t.home.cbiTitleEm}</em>
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-on-dark-muted md:text-base">{t.home.cbiSubtitle}</p>

          <dl className="mt-12 grid max-w-4xl gap-px overflow-hidden border border-white/15 bg-white/15 sm:grid-cols-3">
            {[
              [t.calculator.cbiEligibilityStatus, `$${settings.cbiThresholdUsd.toLocaleString("en-US")}`, t.home.cbiPillar3Desc],
              [t.home.cbiPillar3Title, "3 Years", t.home.cbiPillar3Desc],
              [t.home.cbiPillar1Title, t.home.cbiPillar1Title, t.home.cbiPillar1Desc],
            ].map(([label, value, desc]) => (
              <div key={label} className="bg-night p-6">
                <dt className="kicker text-brass-light">{label}</dt>
                <dd className="numeral mt-3 text-4xl">{value}</dd>
                <dd className="mt-2 text-xs leading-relaxed text-on-dark-muted">{desc}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link to="/contact" className="btn btn-light">
              {t.cta.requestConsultation}
            </Link>
            <a
              href={waLink("Hello Avrasya Properties, I would like to schedule a private portfolio consultation about property in Türkiye and Turkish citizenship.")}
              target="_blank"
              rel="noreferrer"
              className="btn !border !border-white/30 !bg-transparent !text-white gap-2"
            >
              <MessageSquare className="h-3.5 w-3.5" /> {t.cta.chatWhatsApp}
            </a>
            <Link to="/calculator" className="btn !border !border-white/30 !bg-transparent !text-white gap-2">
              <Calculator className="h-4 w-4" />
              <span>{t.footer.acquisitionCalculator}</span>
            </Link>
            <Link to="/citizenship" className="btn !border !border-white/30 !bg-transparent !text-white">
              {t.footer.citizenshipAdvice}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}