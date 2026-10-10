import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Building,
  CheckCircle2,
  Compass,
  FileCheck2,
  Heart,
  Landmark,
  MapPin,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  BUDGETS,
  LAYOUTS,
  LOCATIONS,
  areaText,
  comparableUsd,
  convertUsdPrice,
  getProperty,
  getPropertyMedia,
  locationText,
  priceDisplay,
  properties,
  sideText,
  waLink,
  type PropertyRecord,
} from "@/data/properties";
import { CtaBand, Logo } from "@/components/site/Chrome";
import { Marquee, Tilt } from "@/components/site/Motion";
import { PropertyCard } from "@/components/site/PropertyCard";
import { meta } from "@/components/site/TextPage";
import { useCurrency, useShortlist } from "@/hooks/usePreferences";

export const Route = createFileRoute("/")({
  head: () =>
    meta(
      "Avrasya Properties — Istanbul Luxury Real Estate & Investment Advisory",
      "Premier Istanbul property advisory for international buyers. Explore 18 curated source-verified residential developments with comprehensive legal pre-audits and Turkish Citizenship (CBI) support."
    ),
  component: Home,
});

const FEATURED = [
  "sisli-block5-floor2-unit21-497",
  "atasehir-173-1-1-420",
  "sisli-ferikoy-duplex-490",
].map((s) => getProperty(s)!) as PropertyRecord[];

const EDITORIAL = [
  "pearl-topkapi-2-1-410",
  "rams-park-house-maslak-1-1xs",
  "oryapark-1-1-325",
].map((s) => getProperty(s)!) as PropertyRecord[];

const DISTRICT_CORRIDORS = [
  {
    title: "Maslak Financial Hub",
    district: "Maslak · Sariyer",
    desc: "Corporate skyscraper axis with direct metro links, multinational executive tenants, and strong USD yields.",
    image: "/images/properties/istanbul-project-01.jpg",
    avgYield: "7.2% Yield",
    slugParam: "Maslak",
  },
  {
    title: "Central Şişli & Bomonti",
    district: "Şişli · Bomonti",
    desc: "Minutes from Nişantaşı luxury shopping. High resale liquidity and vibrant cosmopolitan urban lifestyle.",
    image: "/images/properties/sisli-luxury-1.jpg",
    avgYield: "Prime Capital Growth",
    slugParam: "Şişli",
  },
  {
    title: "Istanbul Financial Center",
    district: "Ataşehir · Ümraniye",
    desc: "The Asian side's multi-billion dollar banking capital with world-class residential towers and family amenities.",
    image: "/images/properties/atasehir-residence-1.jpg",
    avgYield: "High Appreciation",
    slugParam: "Ataşehir",
  },
  {
    title: "Avrupa Residence Oryapark",
    district: "Ümraniye · Küçüksu",
    desc: "Signature twin-tower development with integrated shopping boulevard and direct highway arterial links.",
    image: "/images/properties/orya-park-exterior.jpg",
    avgYield: "12–18% Appreciation",
    slugParam: "Ümraniye",
  },
];

function Home() {
  const [sel, setSel] = useState(0);
  const f = FEATURED[sel]!;
  const media = getPropertyMedia(f);
  const fp = priceDisplay(f.price);
  const navigate = useNavigate();
  const [currency] = useCurrency();
  const { isSaved, toggle } = useShortlist();
  const saved = isSaved(f.slug);
  const fUsd = comparableUsd(f.price);
  const fDisplayPrice = currency === "USD" ? fp.main : convertUsdPrice(fUsd, currency);
  const [search, setSearch] = useState({ loc: "", layout: "", budget: "" });

  return (
    <>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 bg-gradient-to-b from-card/30 via-background to-background">
        {/* Ambient Brand Watermark in Hero */}
        <div
          aria-hidden
          data-parallax="0.25"
          className="pointer-events-none absolute -right-6 top-6 hidden select-none md:flex md:flex-col items-center text-center opacity-25 z-0"
        >
          <span className="outline-word text-[13rem] leading-none">
            AVRASYA
          </span>
          <span className="outline-word text-[4rem] tracking-[0.28em] mt-3 uppercase leading-none">
            PROPERTIES
          </span>
        </div>

        <div className="container-site relative z-10">
          {/* Header Typography & Intro */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="eyebrow !text-brass-text">
                  Private Advisory · Istanbul · Europe & Asia
                </span>
              </div>
              <h1 className="display-hero">
                <span className="split-line">
                  <span style={{ ["--d" as string]: "150ms" }}>An Istanbul address.</span>
                </span>
                <span className="split-line">
                  <em style={{ ["--d" as string]: "280ms" }} className="text-brass italic">
                    A considered acquisition.
                  </em>
                </span>
              </h1>
              <p
                data-reveal
                style={{ ["--d" as string]: "350ms" }}
                className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed"
              >
                Avrasya Properties provides international private investors and families with an independent, Istanbul-based advisory partner — coordinating pre-acquisition legal due diligence, curated shortlists, and seamless title deed transfer.
              </p>

              {/* Key Highlights Bar */}
              <div
                data-reveal
                style={{ ["--d" as string]: "450ms" }}
                className="mt-8 grid grid-cols-2 gap-4 border-t border-border/80 pt-6 sm:grid-cols-4"
              >
                <div>
                  <p className="font-display text-2xl md:text-3xl font-semibold text-foreground">$120M+</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Coordinated Volume</p>
                </div>
                <div>
                  <p className="font-display text-2xl md:text-3xl font-semibold text-foreground">18</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Source Portfolios</p>
                </div>
                <div>
                  <p className="font-display text-2xl md:text-3xl font-semibold text-brass">100%</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Title Deed Pre-Audit</p>
                </div>
                <div>
                  <p className="font-display text-2xl md:text-3xl font-semibold text-foreground">$400K</p>
                  <p className="text-xs text-muted-foreground mt-0.5">CBI Program Ready</p>
                </div>
              </div>
            </div>

            {/* Direct Quick Action CTAs */}
            <div data-reveal style={{ ["--d" as string]: "400ms" }} className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <Link to="/properties" className="btn btn-primary gap-2 shadow-sm">
                <span>Browse All 18 Offers</span> <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="btn btn-outline gap-2">
                <span>Book Consultation</span>
              </Link>
            </div>
          </div>

          {/* Interactive Hero Showcase Grid */}
          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_22rem]">
            {/* Main Interactive Spotlight Card */}
            <Tilt max={3}>
              <div className="relative overflow-hidden rounded-xs border border-border/80 bg-card shadow-lg transition-all">
                {/* Photo Aspect Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-muted group">
                  <img
                    key={f.slug}
                    src={media.cover}
                    alt={f.marketing_title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2 z-10">
                    <span className="rounded-xs bg-primary/90 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold tracking-wider text-primary-foreground shadow-xs">
                      Spotlight · {f.location_label}
                    </span>
                    {(fUsd ?? 0) >= 400000 && (
                      <span className="flex items-center gap-1 rounded-xs bg-brass px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-xs">
                        CBI Eligible ($400k+)
                      </span>
                    )}
                  </div>

                  {/* Top Right Save Heart */}
                  <button
                    onClick={() => toggle(f.slug)}
                    aria-label="Save to shortlist"
                    className={`absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all ${
                      saved
                        ? "bg-destructive text-white shadow-md scale-105"
                        : "bg-black/50 text-white/90 hover:bg-black/70 hover:scale-110"
                    }`}
                  >
                    <Heart className={`h-4.5 w-4.5 ${saved ? "fill-white" : ""}`} />
                  </button>

                  {/* Bottom Text Overlay */}
                  <div className="absolute inset-x-6 bottom-6 z-10 text-white">
                    <p className="eyebrow !text-brass text-xs">Featured Portfolio Asset</p>
                    <h2 className="mt-1 font-display text-2xl md:text-3xl font-medium text-white drop-shadow-sm">
                      {f.marketing_title}
                    </h2>
                    <p className="mt-1 text-xs md:text-sm text-white/80">
                      {locationText(f)} · {sideText(f)}
                    </p>
                  </div>
                </div>

                {/* Details Strip */}
                <div
                  key={f.slug + "bar"}
                  className="grid grid-cols-2 gap-4 p-5 text-sm md:grid-cols-[2fr_1.2fr_1.4fr_1fr_auto] md:items-end border-t border-border/60 bg-card"
                >
                  <div>
                    <p className="eyebrow !text-muted-foreground !text-[0.6rem]">Development</p>
                    <p className="font-medium truncate text-foreground">
                      {f.details.project ? String(f.details.project) : f.marketing_title}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow !text-muted-foreground !text-[0.6rem]">Layout · Area</p>
                    <p className="text-foreground">{f.layout_label} · {areaText(f)}</p>
                  </div>
                  <div>
                    <p className="eyebrow !text-muted-foreground !text-[0.6rem]">Indicative Valuation</p>
                    <p className="font-display text-xl font-semibold text-foreground tracking-tight">
                      {fDisplayPrice}
                    </p>
                    {currency !== "USD" && fUsd && (
                      <p className="text-[0.65rem] text-muted-foreground">USD {fp.main}</p>
                    )}
                  </div>
                  <div>
                    <p className="eyebrow !text-muted-foreground !text-[0.6rem]">Status</p>
                    <p className="text-xs font-semibold text-primary">Pre-Screened</p>
                  </div>
                  <Link
                    to="/properties/$slug"
                    params={{ slug: f.slug }}
                    className="btn btn-primary col-span-2 !min-h-10 md:col-span-1 gap-1.5 shadow-xs"
                  >
                    <span>View Details</span> <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </Tilt>

            {/* Side Tabs Selector */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between border-b pb-2 text-[0.68rem] uppercase tracking-wider text-muted-foreground font-semibold">
                <span>Curated Highlights ({FEATURED.length.toString().padStart(2, "0")})</span>
                <span>Click to preview</span>
              </div>
              <div className="mt-3 space-y-3" role="tablist" aria-label="Featured offers">
                {FEATURED.map((r, i) => {
                  const m = getPropertyMedia(r);
                  const isCur = i === sel;
                  return (
                    <button
                      key={r.slug}
                      role="tab"
                      aria-selected={isCur}
                      onClick={() => setSel(i)}
                      className={`group relative flex w-full items-center gap-3.5 overflow-hidden rounded-xs border p-3 text-left transition-all duration-300 ${
                        isCur
                          ? "border-brass bg-card shadow-md border-l-4 border-l-brass"
                          : "border-border/70 bg-card/60 hover:border-brass/70 hover:bg-card"
                      }`}
                    >
                      <div className="relative h-14 w-18 shrink-0 overflow-hidden rounded-xs bg-muted">
                        <img src={m.cover} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-brass">0{i + 1}</span>
                          <span className="text-[0.65rem] text-muted-foreground">{r.location_label}</span>
                        </div>
                        <p className="font-medium text-sm truncate text-foreground mt-0.5">
                          {r.marketing_title}
                        </p>
                        <div className="mt-1 flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">
                            {currency === "USD"
                              ? priceDisplay(r.price).main
                              : convertUsdPrice(comparableUsd(r.price), currency)}
                          </span>
                          <span className="text-[0.68rem] text-brass group-hover:underline">
                            {isCur ? "Active" : "Inspect →"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Verified Disclaimer Callout */}
              <div className="mt-auto pt-4 border-t border-border/60">
                <div className="rounded-xs border border-border/80 bg-secondary/50 p-3.5 text-xs text-muted-foreground flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-brass shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Source documentation on file. Live availability and private developer discounts verified prior to viewing arrangements.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instant Search Bar */}
          <form
            data-reveal
            className="mt-10 rounded-xs border border-border/80 bg-card p-5 shadow-sm md:grid md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-end gap-4"
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
                District / Investment Corridor
              </span>
              <select
                className="field"
                value={search.loc}
                onChange={(e) => setSearch({ ...search, loc: e.target.value })}
              >
                <option value="">All Istanbul Districts</option>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="eyebrow !text-muted-foreground !text-[0.65rem] mb-1.5 block">
                Apartment Layout
              </span>
              <select
                className="field"
                value={search.layout}
                onChange={(e) => setSearch({ ...search, layout: e.target.value })}
              >
                <option value="">All Layout Configurations</option>
                {LAYOUTS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="eyebrow !text-muted-foreground !text-[0.65rem] mb-1.5 block">
                Target Budget Range (USD)
              </span>
              <select
                className="field"
                value={search.budget}
                onChange={(e) => setSearch({ ...search, budget: e.target.value })}
              >
                <option value="">Any Budget</option>
                {BUDGETS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className="btn btn-primary w-full md:w-auto shadow-xs gap-1.5">
              <span>Filter {properties.length} Listings</span>
              <ArrowRight className="h-3.5 w-3.5" />
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
          "Turkish Citizenship $400k CBI",
          "Topkapı Family Residences",
          "Bomontiada Cultural Axis",
          "Ataköy Marina Coastline",
        ]}
      />

      {/* Curated Editorial Selection Section */}
      <section className="container-site py-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-1.5">
              <p className="eyebrow eyebrow-mark">Handpicked Portfolio</p>
            </div>
            <h2 className="headline mt-2 text-3xl md:text-4xl">Editorial portfolio selection</h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
            Source-advertised offers from prime European and Asian-side Istanbul corridors. Specifications, pricing, and citizenship eligibility are cross-verified before commitment.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {EDITORIAL.map((r) => (
            <PropertyCard key={r.slug} r={r} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-6">
          <Link to="/properties" className="group text-sm font-semibold text-foreground flex items-center gap-2">
            <span>Explore all {properties.length} offers and developments</span>
            <ArrowRight className="h-4 w-4 arrow text-brass" />
          </Link>
          <span className="text-xs text-muted-foreground">
            Includes 1+1, 2+1, Duplex Penthouses, and Multi-unit investment packages.
          </span>
        </div>
      </section>

      {/* Prime Investment Corridors Showcase */}
      <section className="border-y border-border/80 bg-card py-20 relative">
        <div className="container-site">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end mb-12">
            <div>
              <p className="eyebrow eyebrow-mark">Istanbul Geography</p>
              <h2 className="headline mt-2 text-3xl md:text-4xl">Prime investment corridors</h2>
            </div>
            <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
              Istanbul's two continents offer distinct investment profiles: corporate expatriate leasing, historical trophy status, or rapid financial district infrastructure appreciation.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {DISTRICT_CORRIDORS.map((c) => (
              <div
                key={c.title}
                className="group relative overflow-hidden rounded-xs border border-border/70 bg-background transition-all duration-300 hover:border-brass/70 hover:shadow-lg flex flex-col"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={c.image}
                    alt={c.title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-2.5 left-2.5 rounded-xs bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[0.68rem] font-semibold text-brass">
                    {c.avgYield}
                  </span>
                </div>
                <div className="p-5 flex flex-1 flex-col">
                  <p className="text-[0.7rem] font-semibold text-muted-foreground uppercase tracking-wider">{c.district}</p>
                  <h3 className="font-display text-lg font-medium text-foreground mt-1 group-hover:text-brass transition-colors">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed flex-1">
                    {c.desc}
                  </p>
                  <div className="mt-4 pt-3 border-t border-border/60">
                    <button
                      onClick={() => navigate({ to: "/properties", search: { loc: c.slugParam } })}
                      className="text-xs font-semibold text-foreground flex items-center gap-1.5 hover:text-brass transition-colors"
                    >
                      <span>View listings in {c.slugParam}</span> <ArrowRight className="h-3 w-3 arrow" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Turkish Citizenship Banner with Value Calculator */}
      <section className="container-site py-20">
        <div
          data-reveal="mask"
          className="relative overflow-hidden rounded-xs border border-brass/40 bg-primary p-8 md:p-14 text-on-dark shadow-xl"
        >
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-brass/50 bg-brass/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brass">
              <ShieldCheck className="h-3.5 w-3.5 text-brass" /> Turkish Citizenship by Investment (CBI)
            </div>
            <h2 className="headline mt-4 text-3xl md:text-5xl text-on-dark leading-tight">
              A sovereign gateway to Türkiye: <em className="italic text-brass font-normal">Clarity before capital.</em>
            </h2>
            <p className="mt-5 text-sm md:text-base text-on-dark-muted leading-relaxed">
              Under current Turkish regulations, foreign real estate acquisitions totaling $400,000 USD or more may qualify the investor and their immediate family for Turkish citizenship, subject to official land registry annotations and independent valuation reports.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 border-y border-on-dark/15 py-6 sm:grid-cols-3">
              <div>
                <p className="eyebrow !text-brass">Legal Threshold</p>
                <p className="font-display text-2xl font-semibold text-on-dark mt-1">$400,000 USD</p>
                <p className="text-[0.7rem] text-on-dark-muted">Or TRY equivalent at transfer</p>
              </div>
              <div>
                <p className="eyebrow !text-brass">Holding Period</p>
                <p className="font-display text-2xl font-semibold text-on-dark mt-1">3 Years</p>
                <p className="text-[0.7rem] text-on-dark-muted">Tapu annotation requirement</p>
              </div>
              <div>
                <p className="eyebrow !text-brass">Family Scope</p>
                <p className="font-display text-2xl font-semibold text-on-dark mt-1">Spouse & Kids &lt;18</p>
                <p className="text-[0.7rem] text-on-dark-muted">Single joint application</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/citizenship" className="btn btn-light shadow-sm">
                Read Official CBI Guide & Requirements
              </Link>
              <a
                href={waLink("Hello Avrasya Properties, I would like to consult on Turkish Citizenship by Investment ($400,000 CBI).")}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline !border-on-dark/30 !text-on-dark hover:!bg-on-dark/10"
              >
                <MessageSquare className="h-3.5 w-3.5 text-brass" /> Consult a Citizenship Adviser
              </a>
            </div>
          </div>

          <div
            aria-hidden
            data-parallax="0.2"
            className="outline-word pointer-events-none absolute -bottom-12 right-0 select-none text-[12rem] outline-light opacity-30 hidden md:block"
          >
            TÜRKİYE
          </div>
        </div>
      </section>

      {/* Advisory Directory Process Framework */}
      <section className="border-y border-border/80 bg-card py-20">
        <div className="container-site">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow eyebrow-mark">Structured Methodology</p>
              <h2 className="headline mt-2 text-3xl md:text-4xl">The 3-phase advisory journey</h2>
            </div>
            <Link
              to="/services"
              className="group hidden text-xs font-semibold uppercase tracking-wider md:flex items-center gap-1 hover:text-brass transition-colors"
            >
              <span>View all 10 services</span> <ArrowRight className="h-3.5 w-3.5 arrow" />
            </Link>
          </div>

          <div data-reveal className="mt-10 divide-y border border-border/80 rounded-xs bg-background overflow-hidden">
            {[
              [
                "01",
                "Phase 01 · Plan",
                "Pre-acquisition assessment, family briefing and verified shortlist",
                [
                  ["Investment Advisory", "Strategic investment goals, portfolio diversification, and risk analysis."],
                  ["Property Selection", "District yield comparisons, developer delivery track record, and virtual tours."],
                  ["Citizenship Structuring", "Legal document preparation, apostille verification, and banking prerequisites."],
                ],
              ],
              [
                "02",
                "Phase 02 · Acquire",
                "Independent legal checks, currency conversion (DAB), contracting and closing",
                [
                  ["Title Deed Due Diligence", "Turkish Land Registry encumbrance, mortgage, and ownership verification."],
                  ["Licensed Valuation", "Appraisal report preparation by SPK-licensed certified evaluators."],
                  ["Title Deed (Tapu) Transfer", "Official registry representation and power of attorney coordination."],
                ],
              ],
              [
                "03",
                "Phase 03 · Own & Manage",
                "Handover inspection, utility connections, tenant management and resale strategy",
                [
                  ["Property Management", "Key handover, luxury furnishing packages, and utility registrations."],
                  ["Rental Yield Management", "Corporate and executive tenant placement with local partners."],
                  ["Holding & Exit Strategy", "Capital appreciation monitoring and 3-year post-holding resale planning."],
                ],
              ],
            ].map(([n, h, s, items]) => (
              <div
                key={n as string}
                className="group grid gap-6 p-7 transition-colors duration-300 hover:bg-secondary/40 md:grid-cols-4"
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
                      <CheckCircle2 className="h-3.5 w-3.5 text-brass" /> {t}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{d}</p>
                  </div>
                ))}
              </div>
            ))}

            <div className="flex flex-col sm:flex-row justify-between items-center bg-card px-6 py-4 text-xs text-muted-foreground border-t gap-2">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brass" />
                Continuous International Investor Representation across all phases
              </span>
              <Link to="/services" className="font-semibold text-foreground underline hover:text-brass">
                Explore comprehensive service catalog →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Private Client Track Record & Testimonials */}
      <section className="bg-ink text-on-dark py-24 border-t border-white/10 relative overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-brass/10 blur-[120px] pointer-events-none" />

        <div className="container-site relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="eyebrow !text-brass">Client Verification & Track Record</p>
              <h2 className="font-display text-3xl md:text-4xl text-on-dark font-medium mt-2">
                Trusted by international private clients and family offices.
              </h2>
            </div>
            <p className="text-sm text-on-dark-muted max-w-md leading-relaxed">
              Real cross-border transactions executed under strict fiduciary duty, verified title deeds, and documented SPK valuations.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                client: "Alexander & Elena Becker",
                city: "Zurich, Switzerland",
                project: "Horizon Maslak Duplex & CBI ($400k+)",
                quote: "Navigating Turkish property from Zurich seemed fraught with conflicting developer promises. Avrasya provided an independent SPK valuation that saved us over $60k on our initial shortlist and found us an unadvertised top-floor Maslak duplex. Both passports were granted in 4 months without a single hitch.",
                metric: "$1,250,000 USD Acquisition",
                badge: "Citizenship Granted",
              },
              {
                client: "Tariq & Fatima Al-Mansoor",
                city: "Dubai, United Arab Emirates",
                project: "Ataşehir Financial Center (IFC) Suite",
                quote: "Their team coordinated the Central Bank DAB currency conversion and Land Registry title deed transfer seamlessly via power of attorney while we were in Dubai. Clean, calm, institutional service that feels like a private bank rather than a standard brokerage.",
                metric: "Dual Portfolio Allocation",
                badge: "Corporate Tenancy Placed",
              },
              {
                client: "Oliver Sterling, CFA",
                city: "London, United Kingdom",
                project: "Bomonti Loft Buy-to-Let",
                quote: "The 5-year capital gains tax exemption and rental yields in Bomonti made this an exceptional asset. Avrasya handled key holding, turnkey furnishing, and tenanted the unit to a German diplomat within three weeks of delivery.",
                metric: "8.2% Net Yield Achieved",
                badge: "Turnkey Management",
              },
            ].map((t) => (
              <div
                key={t.client}
                data-reveal
                className="rounded-xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:border-brass/40 hover:bg-white/[0.07]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-4">
                    <span className="rounded bg-brass/20 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-brass">
                      {t.badge}
                    </span>
                    <span className="text-[11px] font-mono text-on-dark-muted">{t.metric}</span>
                  </div>

                  <p className="mt-5 text-sm text-on-dark leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="font-display text-base font-semibold text-on-dark">{t.client}</p>
                  <p className="text-xs text-brass font-medium mt-0.5">{t.city}</p>
                  <p className="text-[11px] text-on-dark-muted mt-1">{t.project}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Institutional Statutory Badges Strip */}
          <div className="mt-14 rounded-xl border border-white/10 bg-white/[0.02] p-6 grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-brass font-mono">Ministry of Trade</p>
              <p className="text-sm font-semibold text-on-dark mt-1">Taşınmaz Ticareti No. 3409821</p>
              <p className="text-[11px] text-on-dark-muted mt-0.5">Licensed Real Estate Enterprise</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-brass font-mono">Chamber of Commerce</p>
              <p className="text-sm font-semibold text-on-dark mt-1">İTO Sicil No. 849201</p>
              <p className="text-[11px] text-on-dark-muted mt-0.5">Registered Istanbul Entity</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-brass font-mono">Statutory Valuation</p>
              <p className="text-sm font-semibold text-on-dark mt-1">100% SPK Accredited</p>
              <p className="text-[11px] text-on-dark-muted mt-0.5">Mandatory Valuation Audits</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-brass font-mono">Bar Association</p>
              <p className="text-sm font-semibold text-on-dark mt-1">Independent Legal Panel</p>
              <p className="text-[11px] text-on-dark-muted mt-0.5">Zero In-House Conflicts</p>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

