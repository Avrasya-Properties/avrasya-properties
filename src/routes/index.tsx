import { useWhatsAppLink } from "@/hooks/useLiveContact";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useLanguage";
import {
  ArrowRight,
  Building,
  Calculator,
  CheckCircle2,
  Compass,
  FileCheck2,
  Heart,
  Landmark,
  MapPin,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import {
  BUDGETS,
  LAYOUTS,
  areaText,
  comparableUsd,
  convertUsdPrice,
  getLiveProperties,
  getPropertyMedia,
  locationText,
  priceDisplay,
  sideText,
  type PropertyRecord,
} from "@/data/properties";
import { Logo } from "@/components/site/Chrome";
import { Marquee, Tilt,MotionRoot } from "@/components/site/Motion";
import { ImageFallback,PropertyCard } from "@/components/site/PropertyCard";
import { BosphorusNavigator } from "@/components/site/BosphorusNavigator";
import { meta } from "@/components/site/TextPage";
import { useCurrency, useShortlist } from "@/hooks/usePreferences";
import { useCatalogue, loadPublicSettings } from "@/data/live";
import { useSiteSettings } from "@/admin/store";
import { AcquisitionCalculator } from "@/components/site/AcquisitionCalculator";

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
  const LOCATIONS = settings.districts?.length
    ? settings.districts
    : Array.from(new Set(properties.map((r) => r.location_label).filter((x): x is string => !!x)));
  const LAYOUTS = settings.layouts?.length ? settings.layouts : ["1+1", "2+1", "3+1", "4+1", "Penthouse", "Duplex"];
  const BUDGETS = settings.budgetRanges?.length ? settings.budgetRanges : [
    { id: "u300", label: "Up to $300,000", min: 0, max: 300000 },
    { id: "300-450", label: "$300,000 – $450,000", min: 300000, max: 450000 },
    { id: "450-600", label: "$450,000 – $600,000", min: 450000, max: 600000 },
    { id: "600-1m", label: "$600,000 – $1,000,000", min: 600000, max: 1000000 },
    { id: "1m-plus", label: "$1,000,000+", min: 1000000, max: 99999999 },
  ];

  const navigate = useNavigate();
  const [heroView, setHeroView] = useState<"skyline" | "terrace">("skyline");
  const heroImages = {
    skyline: "/images/properties/hero-main.jpg",
    terrace: "/images/properties/bosphorus-terrace.jpg",
  };
  const [search, setSearch] = useState({ loc: "", layout: "", budget: "" });

  return (
    <div data-home-page>

      {/* Hero Section */}
      <section
        data-home-hero
        className="home-hero relative overflow-hidden pt-8 pb-10 md:pt-12 md:pb-16 bg-[#07191e] text-on-dark"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #07191e 0%, #0c272d 45%, #061519 100%), radial-gradient(circle at 18% 28%, rgba(20, 68, 76, 0.4) 0%, transparent 60%)",
        }}
      >
        <div className="container-site relative z-10">
          {/* 2-Column Split: Editorial Green Gradient Left / Architectural Property Cut Right */}
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8 items-center">
            
            {/* Left Column (7 cols): Editorial Copy & Key Investment Metrics */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className="eyebrow !text-brass-text">
                  {locale === "en" && settings.eyebrowText ? settings.eyebrowText : t.home.heroEyebrow}
                </span>
              </div>
              <h1 className="display-hero">
                <span className="split-line">
                  <span style={{ ["--d" as string]: "150ms" }}>
                    {locale === "en" && settings.heroHeadline ? settings.heroHeadline : `${t.home.heroTitle} ${t.home.heroTitleEm}`}
                  </span>
                </span>
              </h1>

              <p
                data-reveal
                style={{ ["--d" as string]: "350ms" }}
                className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed"
              >
                {locale === "en" && settings.heroSubtitle ? settings.heroSubtitle : t.home.heroSubtitle}
              </p>

              {/* Key Highlights Bar with tactile hover micro-lift */}
              <div
                data-reveal
                style={{ ["--d" as string]: "450ms" }}
                className="mt-8 grid grid-cols-2 gap-4 border-t border-border/80 pt-6 sm:grid-cols-4"
              >
                <div className="group rounded-xs p-2 transition-all duration-300 hover:bg-white/5">
                  <p className="font-display text-2xl md:text-3xl font-semibold text-foreground group-hover:text-brass transition-colors">
                    {properties.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.properties.allTypes}</p>
                </div>
                <div className="group rounded-xs p-2 transition-all duration-300 hover:bg-white/5">
                  <p className="font-display text-2xl md:text-3xl font-semibold text-foreground group-hover:text-brass transition-colors">
                    {LOCATIONS.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.home.filterDistrict}</p>
                </div>
                <div className="group rounded-xs p-2 transition-all duration-300 hover:bg-white/5">
                  <p className="font-display text-2xl md:text-3xl font-semibold text-brass">100%</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.home.stat1Title}</p>
                </div>
                <div className="group rounded-xs p-2 transition-all duration-300 hover:bg-white/5">
                  <p className="font-display text-2xl md:text-3xl font-semibold text-foreground group-hover:text-brass transition-colors">
                    ${settings.cbiThresholdUsd ? `${Math.round(settings.cbiThresholdUsd / 1000)}K` : "400K"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.home.cbiEyebrow.split("·")[0] || "CBI"}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                data-reveal
                style={{ ["--d" as string]: "500ms" }}
                className="mt-8 flex flex-wrap items-center gap-3.5"
              >
                <Link to="/contact" className="btn btn-primary gap-1.5 shadow-sm btn-shimmer">
                  <span>{t.nav.bookConsultation}</span>
                  <ArrowRight className="h-4 w-4 rtl-flip" />
                </Link>
                <a
                  href={waLink("Inquiry regarding prime Istanbul real estate opportunities")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn !bg-white/10 !border !border-white/20 !text-white hover:!bg-white/20 hover:!border-brass/50 text-xs gap-1.5 shadow-xs"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-brass" />
                  <span>{t.nav.advisoryDesk}</span>
                </a>
              </div>
            </div>

            {/* Right Column (5 cols): Architectural Cut with Istanbul Real Estate & Ambient AVRASYA Typography */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              {/* Avrasya Brand Typography sitting as an elegant architectural backdrop behind the card */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-8 sm:-top-10 lg:-top-12 left-0 right-0 z-0 select-none overflow-hidden"
              >
                <span
                  className="font-display text-[3.8rem] sm:text-[5rem] lg:text-[6.2rem] xl:text-[7.2rem] font-bold tracking-[0.18em] leading-none text-transparent bg-clip-text bg-gradient-to-r from-brass/35 via-white/20 to-transparent block opacity-40"
                >
                  AVRASYA
                </span>
                <span className="font-sans text-[0.6rem] sm:text-xs tracking-[0.4em] uppercase text-brass/60 pl-1 block -mt-1 lg:-mt-2">
                  PROPERTIES · LUXURY ADVISORY
                </span>
              </div>

              {/* Outer Architectural Container with 3D Tilt & Glassmorphic Elevation */}
              <Tilt max={3} className="relative z-10">
                <div className="group relative w-full h-[400px] sm:h-[460px] lg:h-[490px] rounded-xs overflow-hidden border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] bg-[#07191e]">
                  
                  {/* Architectural Cut Inner Wrapper with polygon clip on desktop */}
                  <div className="relative w-full h-full overflow-hidden [clip-path:polygon(0_0,_100%_0,_100%_100%,_0_100%)] lg:[clip-path:polygon(7%_0,_100%_0,_100%_100%,_0%_100%)]">
                    {/* Architectural Hairline Accent Line along the Cut */}
                    <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-brass via-brass/40 to-transparent pointer-events-none z-30 hidden lg:block" />

                    {/* Istanbul Luxury Real Estate Photograph */}
                    <img
                      src={heroImages[heroView]}
                      alt="Istanbul Luxury Real Estate & Bosphorus Strait Frontline"
                      className="h-full w-full object-cover object-center transition-all duration-1000 ease-out group-hover:scale-105"
                    />

                    {/* Multi-layered Architectural Gradient Scrims */}
                    {/* Left Blend: softly bleeds the photo into the emerald green background */}
                    <div
                      className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-r from-[#07191e] via-[#07191e]/50 to-transparent"
                      style={{ width: "65%" }}
                    />
                    {/* Bottom Vignette: protects text legibility for floating card */}
                    <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  </div>

                  {/* Top Floating Glass Badges */}
                  <div className="absolute top-4 right-4 z-30 flex items-center gap-2 rounded-xs px-3 py-1.5 backdrop-blur-md bg-black/60 border border-white/15 text-xs text-white/90 shadow-md">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-medium tracking-wide">Bosphorus Prime · Istanbul</span>
                  </div>

                  {/* Interactive View Switcher Tabs */}
                  <div className="absolute top-4 left-4 z-30 hidden sm:flex items-center gap-1 p-0.5 rounded-xs backdrop-blur-md bg-black/65 border border-white/15 text-[0.68rem]">
                    <button
                      type="button"
                      onClick={() => setHeroView("skyline")}
                      className={`px-2.5 py-1 rounded-xs transition-all ${
                        heroView === "skyline"
                          ? "bg-brass text-primary font-semibold shadow-xs"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      Waterfront Tower
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroView("terrace")}
                      className={`px-2.5 py-1 rounded-xs transition-all ${
                        heroView === "terrace"
                          ? "bg-brass text-primary font-semibold shadow-xs"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      Penthouse Deck
                    </button>
                  </div>

                  {/* Bottom Floating Glassmorphic Details Card */}
                  <div className="absolute bottom-4 left-4 right-4 z-20 backdrop-blur-md bg-black/55 border border-white/15 rounded-xs p-4 shadow-[0_20px_40px_rgba(0,0,0,0.55)] transition-all duration-300 hover:bg-black/70 hover:border-brass/40">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-wider text-brass font-semibold">
                          <span>{heroView === "skyline" ? "Straitfront Skyscraper" : "Panoramic Penthouse"}</span>
                          <span className="text-white/40">·</span>
                          <span className="text-white/70">41.0422° N, 29.0064° E</span>
                        </div>
                        <p className="font-display text-base sm:text-lg font-medium text-white truncate mt-0.5">
                          {heroView === "skyline" ? "Bosphorus Coastline Residences" : "Bosphorus Strait Private Deck"}
                        </p>
                        <p className="text-xs text-white/70 truncate mt-0.5">
                          Direct Title Clearance · Prime European & Asian Corridors
                        </p>
                      </div>
                      <Link
                        to="/contact"
                        className="shrink-0 btn !min-h-9 !px-4 !text-xs !bg-brass !text-[#07191e] hover:!bg-white font-semibold shadow-xs transition-colors"
                      >
                        {t.common.inquire}
                      </Link>
                    </div>
                  </div>

                </div>
              </Tilt>
            </div>

          </div>

          {/* Instant Search Bar as Floating Glass Capsule */}
          <form
            data-reveal
            className="home-search mt-8 grid gap-4 rounded-xs border border-border/90 bg-card/95 backdrop-blur-md p-4 text-foreground shadow-[0_12px_36px_-10px_rgba(23,43,51,0.12)] sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end md:p-5 transition-shadow duration-300 hover:shadow-[0_16px_44px_-10px_rgba(23,43,51,0.16)]"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({
                to: "/properties",
                search: {
                  loc: search.loc || undefined,
                  layout: search.layout || undefined,
                  budget: search.budget || undefined,
                },
              });
            }}
          >
            <label className="block">
              <span className="eyebrow !text-muted-foreground !text-[0.65rem] mb-1.5 block">
                {t.home.filterDistrict}
              </span>
              <select
                className="field transition-all duration-200 focus:border-brass/80"
                value={search.loc}
                onChange={(e) => setSearch({ ...search, loc: e.target.value })}
              >
                <option value="">{t.home.filterAllDistricts}</option>
                {LOCATIONS.map((l: string) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="eyebrow !text-muted-foreground !text-[0.65rem] mb-1.5 block">
                {t.home.filterLayout}
              </span>
              <select
                className="field transition-all duration-200 focus:border-brass/80"
                value={search.layout}
                onChange={(e) => setSearch({ ...search, layout: e.target.value })}
              >
                <option value="">{t.home.filterAllLayouts}</option>
                {LAYOUTS.map((l: string) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="eyebrow !text-muted-foreground !text-[0.65rem] mb-1.5 block">
                {t.home.filterBudget} (USD)
              </span>
              <select
                className="field transition-all duration-200 focus:border-brass/80"
                value={search.budget}
                onChange={(e) => setSearch({ ...search, budget: e.target.value })}
              >
                <option value="">{t.home.filterAnyBudget}</option>
                {BUDGETS.map((b: { id: string; label: string }) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className="btn btn-primary w-full md:w-auto shadow-xs gap-1.5 btn-shimmer">
              <span>{t.home.filterSearchBtn}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl-flip transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </form>
        </div>
      </section>

      {/* Marquee Ticker */}
      <Marquee
        items={[
          "Şişli Luxury Corridors",
          "Maslak Skyscraper District",
          "Beşiktaş Bosphorus Panorama",
          "Ataşehir Financial Center",
          "Citizenship investment advice",
          "Topkapı Family Residences",
          "Bomontiada Cultural Axis",
          "Ataköy Marina Coastline",
        ]}
      />

      {/* Unified Handpicked Portfolio & Bosphorus Corridor Intelligence Section */}
      <section data-home-collection className="relative border-y border-border/80 bg-background py-14 md:py-20 overflow-hidden">
        <div className="container-site relative z-10 space-y-12">
          {/* Combined Section Header */}
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-border/70 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="pulse-live h-2 w-2 rounded-full bg-emerald-500 mr-1" />
                <p className="eyebrow !text-brass-text">{t.home.editorialEyebrow}</p>
              </div>
              <h2 className="headline text-3xl md:text-5xl text-foreground">
                {t.home.editorialTitle} <em className="italic text-brass font-normal">{t.home.editorialTitleEm}</em>
              </h2>
            </div>
            <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
              {t.home.editorialSubtitle}
            </p>
          </div>

          {/* Published Properties / Collection Status */}
          {loading ? (
            <p role="status" className="rounded-xs border border-border/70 bg-card p-6 text-sm text-muted-foreground">
              {t.common.loading}
            </p>
          ) : unavailable ? (
            <div role="alert" className="rounded-xs border border-destructive/30 bg-card p-6">
              <p className="text-sm text-foreground">{t.common.error}</p>
              <button onClick={retry} className="btn btn-outline mt-4 text-xs">
                {t.common.retry}
              </button>
            </div>
          ) : !properties.length ? (
            <div
              data-empty-collection
              className="rounded-xs border border-border/70 bg-card/60 p-5 md:p-6 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-brass" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-brass-text">
                    {t.home.editorialEyebrow}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {t.properties.noResultsTitle}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-xl leading-relaxed">
                  {t.properties.noResultsDesc}
                </p>
              </div>
              <Link to="/contact" className="btn btn-outline text-xs shrink-0 hover:border-brass hover:text-brass">
                {t.cta.requestConsultation}
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {EDITORIAL.map((r) => (
                <PropertyCard key={r.slug} r={r} />
              ))}
            </div>
          )}

          {/* Seamlessly Integrated Corridor Navigator */}
          <div className="border-t border-border/70 pt-8">
            <BosphorusNavigator embedded />
          </div>
        </div>
      </section>

      {/* Advisory Directory Process Framework */}
      <section className="border-y border-border/80 bg-card py-20">
        <div className="container-site">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow eyebrow-mark">{t.footer.investorJourney}</p>
              <h2 className="headline mt-2 text-3xl md:text-4xl">{t.services.coreServicesTitle}</h2>
            </div>
            <Link
              to="/services"
              className="group hidden text-xs font-semibold uppercase tracking-wider md:flex items-center gap-1 hover:text-brass transition-colors"
            >
              <span>{t.nav.advisoryServices}</span> <ArrowRight className="h-3.5 w-3.5 rtl-flip arrow" />
            </Link>
          </div>

          <div data-reveal className="mt-10 divide-y border border-border/80 rounded-xs bg-background overflow-hidden shadow-xs">
            {[
              [
                "01",
                "Step 01 · Explore & Plan",
                "Understanding your lifestyle, family goals, and finding the right home",
                [
                  ["Personal Guidance", "We discuss your goals, family needs, and preferred budget."],
                  ["Handpicked Homes", "Tour top Istanbul neighborhoods with verified, trusted properties."],
                  ["Easy Preparation", "We guide you through Turkish tax ID setup and bank account opening."],
                ],
              ],
              [
                "02",
                "Step 02 · Secure & Purchase",
                "Independent legal checks, fair price valuation, and official deed transfer",
                [
                  ["Clean Ownership Check", "We verify at the Land Registry that the property is completely debt-free."],
                  ["Fair Market Appraisal", "Independent government-certified appraisal confirming true market value."],
                  ["Official Deed Transfer", "We register the official title deed (Tapu) directly into your name."],
                ],
              ],
              [
                "03",
                "Step 03 · Move In & Prosper",
                "Collecting keys, connecting utilities, and optional rental management",
                [
                  ["Key Handover & Move-In", "We inspect your home, hand over your keys, and connect all utilities."],
                  ["Rental Management", "We place reliable tenants so your property generates steady returns."],
                  ["Ongoing Care", "Continuous support whenever you wish to rent, sell, or upgrade in the future."],
                ],
              ],
            ].map(([n, h, s, items]) => (
              <div
                key={n as string}
                className="group grid gap-6 p-5 transition-colors duration-300 hover:bg-secondary/40 md:grid-cols-4 md:p-7"
              >
                <div>
                  <p className="eyebrow !text-brass">{h as string}</p>
                  <p className="mt-1 font-display text-2xl transition-transform duration-300 group-hover:translate-x-1 font-medium">
                    {s as string}
                  </p>
                </div>
                {(items as string[][]).map(([t, d]) => (
                  <div key={t} className="space-y-1.5">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-brass shrink-0" /> {t}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{d}</p>
                  </div>
                ))}
              </div>
            ))}

            <div className="flex flex-col sm:flex-row justify-between items-center bg-card px-6 py-4 text-xs text-muted-foreground border-t gap-2">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brass" />
                Dedicated client care, honest guidance, and legal safety at every step
              </span>
              <Link to="/services" className="font-semibold text-foreground underline hover:text-brass">
                Explore our complete services →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Title Deed (Tapu) & Acquisition Cost Ledger */}
      <section className="container-site pb-14 md:pb-20">
        <AcquisitionCalculator />
      </section>

      {/* Sovereign Gateway & Private Portfolio Consultation CTA (Combined Advisory & CBI Band) */}
      <section className="border-t bg-ink text-on-dark relative overflow-hidden py-20 md:py-28">
        {/* Art-Directed Family Backdrop with Feathered Side-Fades & Vignette */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {/* Base image with radial and lateral gradient mask */}
          <img
            src="/images/family-future.png"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center lg:object-[50%_35%] scale-105 motion-safe:transition-transform motion-safe:duration-1000 opacity-45 sm:opacity-52"
            style={{
              maskImage:
                "radial-gradient(ellipse 72% 68% at 50% 42%, rgba(0,0,0,1) 20%, rgba(0,0,0,0.4) 65%, transparent 100%), linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 72% 68% at 50% 42%, rgba(0,0,0,1) 20%, rgba(0,0,0,0.4) 65%, transparent 100%), linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, transparent 100%)",
              filter: "contrast(1.08) brightness(0.92)",
            }}
          />

          {/* Deep Horizontal Side-Fades (smoothly dissolving flanks into canvas ink) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, #07191e 0%, rgba(7,25,30,0.94) 14%, rgba(7,25,30,0.42) 32%, transparent 46%, transparent 54%, rgba(7,25,30,0.42) 68%, rgba(7,25,30,0.94) 86%, #07191e 100%)",
            }}
          />

          {/* Vertical Top/Bottom Transitions & Contrast Scrim */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, #07191e 0%, rgba(7,25,30,0.72) 16%, rgba(7,25,30,0.42) 46%, rgba(7,25,30,0.85) 86%, #07191e 100%)",
            }}
          />

          {/* Luxury Brass Ambient Glows */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_45%_at_50%_0%,rgba(197,160,89,0.22),transparent_75%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(197,160,89,0.14),transparent_50%)]" />
        </div>

        <div className="container-site relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brass/50 bg-brass/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brass backdrop-blur-md shadow-[0_0_20px_rgba(197,160,89,0.15)]">
            <ShieldCheck className="h-3.5 w-3.5 text-brass" /> {t.home.cbiEyebrow}
          </div>

          <h2 className="headline mx-auto mt-4 max-w-3xl text-3xl md:text-5xl text-on-dark leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)]">
            {t.home.cbiTitle}{" "}
            <em className="italic text-brass font-normal">{t.home.cbiTitleEm}</em>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-on-dark-muted text-sm md:text-base leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            {t.home.cbiSubtitle}
          </p>

          {/* 3 Metric Parameter Cards (Floating glassmorphism with spatial elevation) */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-y border-white/10 py-6 sm:grid-cols-3 max-w-3xl mx-auto text-left relative z-10">
            <div className="group rounded-md bg-[#07191e]/80 border border-white/15 p-5 backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-brass/70 hover:shadow-[0_16px_40px_rgba(197,160,89,0.18)]">
              <p className="eyebrow !text-brass flex items-center justify-between">
                <span>{t.calculator.cbiEligibilityStatus}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-brass/80 group-hover:scale-125 transition-transform" />
              </p>
              <p className="font-display text-2xl font-semibold text-on-dark mt-1">
                ${settings.cbiThresholdUsd.toLocaleString("en-US")} USD
              </p>
              <p className="text-[0.7rem] text-on-dark-muted mt-0.5">{t.home.cbiPillar3Desc}</p>
            </div>
            <div className="group rounded-md bg-[#07191e]/80 border border-white/15 p-5 backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-brass/70 hover:shadow-[0_16px_40px_rgba(197,160,89,0.18)]">
              <p className="eyebrow !text-brass flex items-center justify-between">
                <span>{t.home.cbiPillar3Title}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-brass/80 group-hover:scale-125 transition-transform" />
              </p>
              <p className="font-display text-2xl font-semibold text-on-dark mt-1">3 Years</p>
              <p className="text-[0.7rem] text-on-dark-muted mt-0.5">{t.home.cbiPillar3Desc}</p>
            </div>
            <div className="group rounded-md bg-[#07191e]/80 border border-white/15 p-5 backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-brass/70 hover:shadow-[0_16px_40px_rgba(197,160,89,0.18)] col-span-2 sm:col-span-1">
              <p className="eyebrow !text-brass flex items-center justify-between">
                <span>{t.home.cbiPillar1Title}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-brass/80 group-hover:scale-125 transition-transform" />
              </p>
              <p className="font-display text-2xl font-semibold text-on-dark mt-1">{t.home.cbiPillar1Title}</p>
              <p className="text-[0.7rem] text-on-dark-muted mt-0.5">{t.home.cbiPillar1Desc}</p>
            </div>
          </div>

          {/* Combined Action Buttons */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-3 relative z-10">
            <Link to="/contact" className="btn btn-primary btn-shimmer shadow-lg shadow-brass/20">
              {t.cta.requestConsultation}
            </Link>
            <a
              href={waLink("Hello Avrasya Properties, I would like to schedule a private portfolio consultation regarding Istanbul real estate and Turkish citizenship.")}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline !border-white/20 !bg-white/10 !text-white hover:!bg-white/20 backdrop-blur-md shadow-sm gap-1.5"
            >
              <MessageSquare className="h-3.5 w-3.5 text-brass" /> {t.cta.chatWhatsApp}
            </a>
            <Link
              to="/calculator"
              className="btn btn-light shadow-md gap-2 hover:scale-[1.02] transition-transform"
            >
              <Calculator className="h-4 w-4 text-brass" />
              <span>{t.footer.acquisitionCalculator}</span>
            </Link>
            <Link
              to="/citizenship"
              className="btn btn-outline !border-white/20 !bg-white/10 !text-white hover:!bg-white/20 backdrop-blur-md transition-colors"
            >
              {t.footer.citizenshipAdvice}
            </Link>
          </div>
        </div>

        {/* Elegant typography watermark with enhanced opacity & warm brass aura */}
        <div
          aria-hidden
          data-parallax="0.2"
          className="outline-word pointer-events-none absolute -bottom-8 sm:-bottom-12 md:-bottom-16 lg:-bottom-20 right-0 sm:right-4 md:right-8 select-none text-[7.5rem] sm:text-[11rem] md:text-[15rem] lg:text-[19rem] xl:text-[22rem] outline-light !opacity-45 md:!opacity-52 tracking-widest leading-none z-0"
          style={{
            WebkitTextStroke: "1.75px rgba(220, 185, 125, 0.65)",
            filter: "drop-shadow(0 0 40px rgba(197, 160, 89, 0.32))",
          }}
        >
          TÜRKİYE
        </div>
      </section>
    </div>
  );
}

