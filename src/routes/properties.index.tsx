import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Grid3X3,
  List,
  Heart,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Building2,
  MapPin,
  CheckCircle2,
  X,
  Share2,
  MessageSquare,
} from "lucide-react";
import {
  BUDGETS,
  LAYOUTS,
  TYPE_LABEL,
  areaText,
  comparableUsd,
  convertUsdPrice,
  filterProperties,
  getPropertyMedia,
  locationText,
  priceDisplay,
  sideText,
  unmatchablePrices,
  waLink,
  type Filters,
  type PropertyRecord,
} from "@/data/properties";
import { useCatalogue } from "@/data/live";
import { PageIntro } from "@/components/site/Chrome";
import { PropertyCard } from "@/components/site/PropertyCard";
import { meta } from "@/components/site/TextPage";
import { useCurrency, useShortlist } from "@/hooks/usePreferences";

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
const bool = (v: unknown) => (v === "true" || v === true ? true : undefined);

export const Route = createFileRoute("/properties/")({
  validateSearch: (s: Record<string, unknown>): Filters & { savedOnly?: boolean | undefined } => ({
    q: str(s["q"]),
    loc: str(s["loc"]),
    side: str(s["side"]),
    layout: str(s["layout"]),
    type: str(s["type"]),
    budget: str(s["budget"]),
    sort: str(s["sort"]),
    cbiOnly: bool(s["cbiOnly"]),
    savedOnly: bool(s["savedOnly"]),
  }),
  head: () =>
    meta(
      "Istanbul Property Listings — Avrasya Properties",
      "Browse published Istanbul residential developments and investment packages across Maslak, Şişli, Ataşehir, and Beşiktaş. Direct advisory with legal title due diligence."
    ),
  component: Catalog,
});

function Catalog() {
  const catalogue=useCatalogue();
  const properties=catalogue.properties;
  const LOCATIONS=Array.from(new Set(properties.map(r=>r.location_label).filter((x):x is string=>!!x)));
  const f = Route.useSearch();
  const navigate = useNavigate({ from: "/properties/" });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currency] = useCurrency();
  const { shortlist, count: savedCount, isSaved, toggle } = useShortlist();

  let list = filterProperties(f, properties);
  if (f.savedOnly) {
    list = list.filter((r) => shortlist.includes(r.slug));
  }

  const set = (k: keyof (Filters & { savedOnly?: boolean | undefined }), v: unknown) =>
    navigate({
      search: (p) => ({ ...p, [k]: v || undefined }),
      replace: true,
      resetScroll: false,
    });

  const active = Object.entries(f).filter(([k, v]) => v && k !== "sort");
  const lbl = "eyebrow !text-muted-foreground !text-[0.65rem] mb-1.5 block";

  const sel = (k: keyof Filters, label: string, any: string, opts: [string, string][]) => (
    <label className="block">
      <span className={lbl}>{label}</span>
      <select className="field text-xs md:text-sm" value={String(f[k] ?? "")} onChange={(e) => set(k, e.target.value)}>
        <option value="">{any}</option>
        {opts.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <>
      <PageIntro
        eyebrow="Istanbul Portfolio Collection"
        title={<>Curated Offers & Developments in <em>Istanbul.</em></>}
        aside={
          <div className="flex flex-col gap-1 text-right">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Prime Corridors · European & Asian Side
            </span>
            <span className="text-xs text-foreground font-medium">{properties.length} Published Opportunities</span>
          </div>
        }
      >
        <p>
          Source-backed investment opportunities across central and Asian-side Istanbul. Every property is subject to preliminary title deed, zoning, and legal clearance before acquisition.
        </p>
      </PageIntro>

      <section className="container-site py-8">
        {catalogue.isPending && <p role="status">Loading current offers…</p>}
        {catalogue.isError && <p role="alert">The catalogue is temporarily unavailable. Please contact our advisory team.</p>}
        {/* Search & Filter Panel */}
        <div className="rounded-xs border border-border/80 bg-card p-5 shadow-xs">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.5fr_repeat(5,1fr)]">
            <label className="block">
              <span className={lbl}>Keyword or District Search</span>
              <div className="relative">
                <input
                  className="field pl-8"
                  type="search"
                  placeholder="e.g. Şişli, Maslak, Duplex, Terrace"
                  defaultValue={f.q ?? ""}
                  onChange={(e) => set("q", e.target.value)}
                />
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </label>
            {sel("loc", "District", "All Districts", LOCATIONS.map((l) => [l, l]))}
            {sel("side", "Continent", "Both Continents", [
              ["Europe", "European Side"],
              ["Asia", "Asian Side"],
            ])}
            {sel("layout", "Layout", "All Layouts", LAYOUTS.map((l) => [l, l]))}
            {sel("type", "Asset Type", "All Types", Object.entries(TYPE_LABEL))}
            {sel("budget", "Target Budget", "Any Budget", BUDGETS.map((b) => [b.id, b.label]))}
          </div>

          {/* Quick Toggle Bars & Active Filters */}
          <div className="mt-4 flex flex-col gap-3 border-t border-border/60 pt-4 text-xs md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {/* Citizenship Only Pill Toggle */}
              <button
                onClick={() => set("cbiOnly", !f.cbiOnly)}
                className={`flex items-center gap-1.5 rounded-xs border px-2.5 py-1 text-xs font-semibold transition-all ${
                  f.cbiOnly
                    ? "border-brass bg-brass text-primary shadow-xs"
                    : "border-border bg-secondary hover:border-brass/70 text-foreground"
                }`}
              >
                <span>Citizenship eligibility verified</span>
              </button>

              {/* Saved Shortlist Filter */}
              <button
                onClick={() => set("savedOnly", !f.savedOnly)}
                className={`flex items-center gap-1.5 rounded-xs border px-2.5 py-1 text-xs font-semibold transition-all ${
                  f.savedOnly
                    ? "border-destructive bg-destructive text-white shadow-xs"
                    : "border-border bg-secondary hover:border-destructive/60 text-foreground"
                }`}
              >
                <Heart className={`h-3 w-3 ${f.savedOnly ? "fill-white" : ""}`} />
                <span>Saved Shortlist ({savedCount})</span>
              </button>

              <span className="text-muted-foreground ml-2">Filters:</span>
              {active.length > 0 ? (
                active.map(([k, v]) => (
                  <button
                    key={k}
                    className="flex items-center gap-1 rounded-xs border border-border/80 bg-secondary/80 px-2 py-0.5 text-xs hover:bg-secondary"
                    onClick={() => set(k as keyof Filters, undefined)}
                    aria-label={`Remove ${k} filter`}
                  >
                    <span>
                      {k === "budget"
                        ? BUDGETS.find((b) => b.id === v)?.label
                        : k === "type"
                        ? TYPE_LABEL[v as keyof typeof TYPE_LABEL]
                        : String(v)}
                    </span>
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                ))
              ) : (
                <span className="text-muted-foreground">All active</span>
              )}

              {active.length > 0 && (
                <Link to="/properties" search={{}} className="text-brass font-medium underline ml-1">
                  Reset filters
                </Link>
              )}
            </div>

            {/* View Mode & Sorting Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-muted-foreground" aria-live="polite">
                <strong>{list.length}</strong> of {properties.length} results
              </span>

              {/* Grid / List Switcher */}
              <div className="flex rounded-xs border border-border bg-secondary/50 p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex h-7 w-7 items-center justify-center rounded-xs transition-colors ${
                    viewMode === "grid" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex h-7 w-7 items-center justify-center rounded-xs transition-colors ${
                    viewMode === "list" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <label className="flex items-center gap-2 font-medium">
                Sort:
                <select
                  className="field !min-h-8 !w-auto text-xs"
                  value={f.sort ?? ""}
                  onChange={(e) => set("sort", e.target.value)}
                >
                  <option value="">Curated Order</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {/* Listings Result Grid / List */}
        {list.length ? (
          viewMode === "grid" ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((r) => (
                <PropertyCard key={r.slug} r={r} />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="mt-8 space-y-3">
              {list.map((r) => {
                const media = getPropertyMedia(r);
                const p = priceDisplay(r.price);
                const usd = comparableUsd(r.price);
                const displayPrice = currency === "USD"||comparableUsd(r.price)===null ? p.main : convertUsdPrice(usd, currency);
                const isCbi = r.details["cbi_verified"]===true;
                const saved = isSaved(r.slug);

                return (
                  <div
                    key={r.slug}
                    className="group flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-xs border border-border/80 bg-card p-4 transition-all hover:border-brass/70 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <Link
                        to="/properties/$slug"
                        params={{ slug: r.slug }}
                        className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xs bg-[#0C1E23]"
                      >
                        <img
                          src={media.cover}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.src = "/images/properties/hero-main.jpg";
                          }}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        {isCbi && (
                          <span className="absolute bottom-1 left-1 rounded-xs bg-brass px-1 py-0.5 text-[9px] font-bold text-primary">
                            CBI
                          </span>
                        )}
                      </Link>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-brass-text uppercase text-[0.65rem]">
                            {TYPE_LABEL[r.record_type]}
                          </span>
                          <span>·</span>
                          <span>{locationText(r)}</span>
                          <span>·</span>
                          <span>{sideText(r)}</span>
                        </div>

                        <h3 className="font-display text-base md:text-lg font-medium text-foreground truncate mt-0.5">
                          <Link to="/properties/$slug" params={{ slug: r.slug }} className="hover:text-brass">
                            {r.marketing_title}
                          </Link>
                        </h3>

                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r.layout_label ?? "Layout to confirm"} · {areaText(r)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="eyebrow !text-muted-foreground !text-[0.6rem]">Indicative Valuation</p>
                        <p className="font-display text-xl font-semibold text-foreground tracking-tight">
                          {displayPrice}
                        </p>
                        {currency !== "USD" && usd && (
                          <p className="text-[0.65rem] text-muted-foreground">USD {p.main}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggle(r.slug)}
                          className={`flex h-9 w-9 items-center justify-center rounded-xs border transition-colors ${
                            saved
                              ? "border-destructive bg-destructive text-white"
                              : "border-border hover:border-brass text-muted-foreground"
                          }`}
                          title="Save to shortlist"
                        >
                          <Heart className={`h-4 w-4 ${saved ? "fill-white" : ""}`} />
                        </button>
                        <Link
                          to="/properties/$slug"
                          params={{ slug: r.slug }}
                          className="btn btn-primary !min-h-9 !px-3 text-xs"
                        >
                          Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Empty State */
          <div className="mt-10 rounded-xs border border-border/80 bg-card p-12 text-center">
            <h2 className="headline text-2xl">No listings match the selected criteria.</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
              {f.savedOnly
                ? "You haven't saved any listings to your private shortlist yet. Click the heart icon on any card to save it."
                : "Try widening your district or layout filters, or request a bespoke off-market portfolio search directly from our Istanbul team."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/properties" search={{}} className="btn btn-outline">
                Clear All Filters
              </Link>
              <Link to="/contact" className="btn btn-primary">
                Request Bespoke Shortlist
              </Link>
            </div>
          </div>
        )}

        {/* Disclaimer Note */}
        <div className="mt-12 rounded-xs border border-border/80 bg-card p-5 text-xs leading-relaxed text-muted-foreground flex items-start gap-3">
          <CheckCircle2 className="h-4 w-4 text-brass shrink-0 mt-0.5" />
          <p>
            <strong className="text-foreground">Official Advisory Standard:</strong> All property specifications, valuations, area measurements (gross/net), and citizenship eligibility criteria originate from project developers and are pre-screened on file. Prior to contractual commitments, our team coordinates an independent title deed audit (Tapu kaydı) and licensed valuation report (SPK değerleme).
          </p>
        </div>
      </section>
    </>
  );
}

