import { useWhatsAppLink } from "@/hooks/useLiveContact";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  TrendingUp,
} from "lucide-react";
import {
  BUDGETS,
  LAYOUTS,
  areaText,
  comparableUsd,
  convertUsdPrice,
  getPropertyMedia,
  locationText,
  priceDisplay,
  sideText,
    type PropertyRecord,
} from "@/data/properties";
import { CtaBand, Logo } from "@/components/site/Chrome";
import { Marquee, Tilt,MotionRoot } from "@/components/site/Motion";
import { ImageFallback,PropertyCard } from "@/components/site/PropertyCard";
import { BosphorusNavigator } from "@/components/site/BosphorusNavigator";
import { AcquisitionCalculator } from "@/components/site/AcquisitionCalculator";
import { meta } from "@/components/site/TextPage";
import { useCurrency, useShortlist } from "@/hooks/usePreferences";
import { useCatalogue } from "@/data/live";
import { useSiteSettings } from "@/admin/store";

export const Route = createFileRoute("/")({
  head: () =>
    meta(
      "Avrasya Properties — Istanbul Luxury Real Estate & Investment Advisory",
      "Istanbul property advisory for international buyers. Explore published property opportunities, independent legal review, and citizenship advisory services."
    ),
  component: Home,
});


function Home() {
 const catalogue=useCatalogue();
 return <><HomeCollection properties={catalogue.properties} loading={catalogue.isPending} unavailable={catalogue.isError} retry={()=>void catalogue.refetch()}/><MotionRoot/></>;
}
function HomeCollection({properties,loading,unavailable,retry}:{properties:PropertyRecord[];loading:boolean;unavailable:boolean;retry:()=>void}) {
  const waLink=useWhatsAppLink();
 const FEATURED=properties.slice(0,3);
 const EDITORIAL=properties.length>3?properties.slice(3,6):properties.slice(0,3);
 const LOCATIONS=Array.from(new Set(properties.map(r=>r.location_label).filter((x):x is string=>!!x)));

  const settings = useSiteSettings();
  const [sel, setSel] = useState(0);
  const featuredIndex=Math.max(0,Math.min(sel,FEATURED.length-1));
  const f = FEATURED[featuredIndex];
  const media = f?getPropertyMedia(f):null;
  const fp = f?priceDisplay(f.price):null;
  const navigate = useNavigate();
  const [currency] = useCurrency();
  const { isSaved, toggle } = useShortlist();
  const saved = f?isSaved(f.slug):false;
  const fUsd = f?comparableUsd(f.price):null;
  const fDisplayPrice = currency === "USD"||fUsd===null ? fp?.main||"" : convertUsdPrice(fUsd, currency);
  const [search, setSearch] = useState({ loc: "", layout: "", budget: "" });

  return (
    <div data-home-page>

      {/* Hero Section */}
      <section data-home-hero className="home-hero relative overflow-hidden pt-10 pb-10 md:pt-14 md:pb-20 bg-primary text-on-dark">
        {/* Ambient Brand Watermark in Hero */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-4 lg:right-10 top-8 lg:top-6 hidden select-none md:flex md:flex-col items-end text-right opacity-30 dark:opacity-20 z-0"
        >
          <span className="outline-word text-[7.5rem] lg:text-[10rem] leading-[0.9] tracking-tight">
            AVRASYA
          </span>
          <span className="outline-word text-[2.2rem] lg:text-[3rem] tracking-[0.32em] mt-1.5 uppercase leading-none pr-1">
            PROPERTIES
          </span>
        </div>

        <div className="container-site relative z-10">
          {/* Header Typography & Intro */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="eyebrow">
                  {settings.eyebrowText || "Private Advisory · Istanbul · Europe & Asia"}
                </span>
              </div>
              <h1 className="display-hero"><span className="split-line"><span style={{["--d" as string]:"150ms"}}>{settings.heroHeadline}</span></span></h1>

              <p
                data-reveal
                style={{ ["--d" as string]: "350ms" }}
                className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed"
              >
                {settings.heroSubtitle || "Avrasya Properties provides international private investors and families with an independent, Istanbul-based advisory partner — coordinating pre-acquisition legal due diligence, curated shortlists, and seamless title deed transfer."}
              </p>

              {/* Key Highlights Bar */}
              <div
                data-reveal
                style={{ ["--d" as string]: "450ms" }}
                className="mt-8 grid grid-cols-2 gap-4 border-t border-border/80 pt-6 sm:grid-cols-4"
              >
                <div>
                  <p className="font-display text-2xl md:text-3xl font-semibold text-foreground">{properties.length}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Published offers</p>
                </div>
                <div>
                  <p className="font-display text-2xl md:text-3xl font-semibold text-foreground">{LOCATIONS.length}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Listed districts</p>
                </div>
                <div>
                  <p className="font-display text-2xl md:text-3xl font-semibold text-brass">Review</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Independent title checks</p>
                </div>
                <div>
                  <p className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                    ${settings.cbiThresholdUsd ? `${Math.round(settings.cbiThresholdUsd / 1000)}K` : "400K"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Citizenship reference amount</p>
                </div>
              </div>
            </div>

            {/* Direct Quick Action CTAs */}
            <div data-reveal style={{ ["--d" as string]: "400ms" }} className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <Link to="/properties" className="btn btn-primary gap-2 shadow-sm">
                <span>{properties.length?`Browse ${properties.length} ${properties.length===1?"property":"properties"}`:"Explore properties"}</span> <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="btn btn-outline gap-1.5">
                <span>Book Consultation</span>
              </Link>
            </div>
          </div>

          {/* Interactive Hero Showcase Grid */}
          {f&&media&&fp&&<div className="mt-8 grid min-w-0 gap-6 text-foreground lg:mt-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
            {/* Main Interactive Spotlight Card */}
            <Tilt max={3}>
              <div className="relative overflow-hidden rounded-xs border border-border/80 bg-card shadow-lg transition-all">
                {/* Photo Aspect Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-muted group">
                  <ImageFallback r={f}/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2 z-10">
                    <span className="rounded-xs bg-primary/90 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold tracking-wider text-primary-foreground shadow-xs">
                      Spotlight · {f.location_label}
                    </span>
                    {f.details["cbi_verified"]===true && (
                      <span className="flex items-center gap-1 rounded-xs bg-brass px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-xs">
                        Citizenship eligibility verified
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

                </div>

                <div className="border-t bg-card p-5"><p className="eyebrow">Featured property</p><h2 className="mt-2 break-words font-display text-2xl text-foreground md:text-3xl">{f.marketing_title}</h2><p className="mt-2 text-sm text-muted-foreground">{locationText(f)} · {sideText(f)}</p></div>

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
                    <p className="text-xs font-semibold text-primary">{f.availability||"To confirm"}</p>
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
                  const isCur = i === featuredIndex;
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
                            {currency === "USD"||comparableUsd(r.price)===null
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
          </div>}

          {/* Instant Search Bar */}
          <form
            data-reveal
            className="home-search mt-8 grid gap-4 rounded-xs border border-border/80 bg-card p-4 text-foreground shadow-sm sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end md:p-5"
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
                District
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
                Apartment layout
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
                Budget (USD)
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
              <span>Find a property</span>
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
          "Citizenship investment advice",
          "Topkapı Family Residences",
          "Bomontiada Cultural Axis",
          "Ataköy Marina Coastline",
        ]}
      />

      {/* Curated Editorial Selection Section */}
      <section data-home-collection className="container-site py-12 md:py-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-1.5">
              <p className="eyebrow eyebrow-mark">Handpicked Portfolio</p>
            </div>
            <h2 className="headline mt-2 text-3xl md:text-4xl">Selected properties</h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
            Source-advertised offers from prime European and Asian-side Istanbul corridors. Confirm specifications, pricing, availability and any citizenship claims with an advisor before commitment.
          </p>
        </div>

        {loading?<p role="status" className="mt-8 rounded border bg-card p-6">Loading the property collection…</p>:unavailable?<div role="alert" className="mt-8 rounded border bg-card p-6"><p>The property collection could not be loaded.</p><button onClick={retry} className="btn btn-outline mt-4">Try again</button></div>:!properties.length?<div data-empty-collection className="mt-8 rounded border bg-card p-6 md:p-8"><h3 className="font-display text-2xl">Our next collection is being prepared.</h3><p className="mt-3 max-w-xl text-sm text-muted-foreground">Our team can help you find current opportunities while reviewed listings are being added.</p><Link to="/contact" className="btn btn-outline mt-5">Ask about available properties</Link></div>:<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EDITORIAL.map((r) => (
            <PropertyCard key={r.slug} r={r} />
          ))}
        </div>}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-6">
          <Link to="/properties" className="group text-sm font-semibold text-foreground flex items-center gap-2">
            <span>{properties.length?`Explore all ${properties.length} ${properties.length===1?"property":"properties"}`:"Explore our property search"}</span>
            <ArrowRight className="h-4 w-4 arrow text-brass" />
          </Link>
          <span className="text-xs text-muted-foreground">
            Availability and specifications are shown for each published offer.
          </span>
        </div>
      </section>

      {/* Bosphorus Cross-Strait Geographical Corridor Navigator */}
      <BosphorusNavigator />

      {/* Turkish Citizenship Banner with Value Barometer */}
      <section className="container-site pt-20 pb-12">
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
              The configured investment reference is {settings.cbiThresholdUsd.toLocaleString("en-US")} USD. A purchase price alone does not confirm eligibility. Confirm the applicable rules, title conditions, valuation and family requirements with an independent legal advisor before committing.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 border-y border-on-dark/15 py-6 sm:grid-cols-3">
              <div>
                <p className="eyebrow !text-brass">Investment reference</p>
                <p className="font-display text-2xl font-semibold text-on-dark mt-1">${settings.cbiThresholdUsd.toLocaleString("en-US")} USD</p>
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

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#calculator" className="btn btn-light shadow-sm gap-2">
                <Calculator className="h-4 w-4 text-brass" />
                <span>Calculate Total All-In Closing Costs</span>
              </a>
              <Link to="/citizenship" className="btn btn-outline !border-on-dark/40 !text-on-dark hover:!bg-on-dark/10">
                Official CBI Guide & Requirements
              </Link>
              <a
                href={waLink("Hello Avrasya Properties, I would like to consult on Turkish Citizenship by Investment ($400,000 CBI).")}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline !border-on-dark/40 !text-on-dark hover:!bg-on-dark/10"
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

      {/* Interactive Title Deed (Tapu) & Acquisition Cost Ledger */}
      <section className="container-site pb-20">
        <AcquisitionCalculator />
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
              <span>View advisory services</span> <ArrowRight className="h-3.5 w-3.5 arrow" />
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

      <CtaBand />
    </div>
  );
}

