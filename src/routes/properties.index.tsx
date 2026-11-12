import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  Heart,
  LayoutGrid,
  List as ListIcon,
  Map as MapIcon,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BUDGETS,
  DEFAULT_AMENITY_CATALOG,
  filterProperties,
  LAYOUTS,
  LOCATIONS,
  PROPERTY_CATEGORIES,
  TYPE_LABEL,
  type Filters,
  type RecordType,
  type SupportedCurrency,
} from "@/data/properties";
import { PropertyCard } from "@/components/site/PropertyCard";
import { PropertyListRow } from "@/components/site/PropertyListRow";
import { CaldrenSkyCtaSection } from "@/components/site/CaldrenSkyCtaSection";
import { useCurrency, useShortlist } from "@/hooks/usePreferences";
import { useLanguage } from "@/hooks/useLanguage";
import { meta } from "@/components/site/TextPage";
import { useCatalogue } from "@/data/live";
import { useSiteSettings } from "@/admin/store";
import { allDistricts, allNeighborhoods, publicRegions } from "@/data/regions";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type PropertiesSearch = Filters & {
  savedOnly?: boolean | undefined;
  view?: "grid" | "list" | "map" | undefined;
};

const PRICE_HISTOGRAM_HEIGHTS = [16, 26, 40, 52, 46, 36, 28, 22, 18, 12];

export const Route = createFileRoute("/properties/")({
  validateSearch: (raw: Record<string, unknown>): PropertiesSearch => {
    const s = (k: string) =>
      typeof raw[k] === "string" && raw[k] ? (raw[k] as string) : undefined;
    const n = (k: string) => {
      const val = Number(raw[k]);
      return raw[k] !== undefined && raw[k] !== "" && Number.isFinite(val) ? val : undefined;
    };
    return {
      q: s("q"),
      region: s("region"),
      loc: s("loc"),
      neighborhood: s("neighborhood"),
      side: s("side"),
      layout: s("layout"),
      type: s("type"),
      category: s("category"),
      project: s("project"),
      budget: s("budget"),
      minPrice: n("minPrice"),
      maxPrice: n("maxPrice"),
      bedrooms: n("bedrooms"),
      bathrooms: n("bathrooms"),
      minArea: n("minArea"),
      maxArea: n("maxArea"),
      availability: s("availability"),
      completionStatus: s("completionStatus"),
      sort: s("sort"),
      view: raw["view"] === "map" ? "map" : raw["view"] === "list" ? "list" : undefined,
      cbiOnly: raw["cbiOnly"] === true || raw["cbiOnly"] === "true" || undefined,
      savedOnly: raw["savedOnly"] === true || raw["savedOnly"] === "true" || undefined,
    };
  },
  head: () =>
    meta(
      "Properties · Avrasya Properties",
      "Verified homes, apartments, and investment packages in Istanbul. Filter by district, price, layout, or $400,000+ citizenship eligibility.",
    ),
  component: PropertiesIndex,
});

function PropertiesIndex() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/properties/" });
  const [currency, setCurrency] = useCurrency();
  const { shortlist: savedIds } = useShortlist();
  const [openDropdown, setOpenDropdown] = useState<null | "price" | "sort">(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedMapSlug, setSelectedMapSlug] = useState<string | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const filterBarRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const { t } = useLanguage();
  const catalogue = useCatalogue();
  const settings = useSiteSettings();
  const regions = useMemo(() => publicRegions(settings.regions), [settings.regions]);
  const budgets: readonly { id: string; label: string; min: number; max: number }[] = settings
    .budgetRanges?.length
    ? settings.budgetRanges
    : BUDGETS;

  const districtOptions = useMemo(() => {
    const activeRegion = search.region ? regions.find((r) => r.slug === search.region) : undefined;
    const configured = activeRegion
      ? activeRegion.districts
      : regions.length > 0
        ? allDistricts(regions)
        : settings.districts;
    return [...new Set([...(configured ?? []), ...LOCATIONS])];
  }, [regions, search.region, settings.districts]);

  const neighborhoodOptions = useMemo(() => {
    const fromRegions = allNeighborhoods(regions, search.loc);
    const fromCatalogue = catalogue.properties
      .filter((r) => !search.loc || r.location_label === search.loc)
      .map((r) => String(r.details["neighborhood"] ?? "").trim())
      .filter(Boolean);
    return [...new Set([...fromRegions, ...fromCatalogue])];
  }, [regions, search.loc, catalogue.properties]);

  const projectOptions = useMemo(() => {
    return [
      ...new Set(
        catalogue.properties.map((r) => String(r.details["project"] ?? "").trim()).filter(Boolean),
      ),
    ];
  }, [catalogue.properties]);

  const categoryOptions = useMemo((): string[] => {
    const configured = settings.propertyCategories?.length
      ? settings.propertyCategories
      : [...PROPERTY_CATEGORIES];
    const names: string[] = (configured as readonly unknown[]).map((c) => String(c));
    return Array.from(new Set<string>(names));
  }, [settings.propertyCategories]);

  const list = useMemo(() => {
    const filtered = filterProperties(search, catalogue.properties, budgets, regions);
    if (!search.savedOnly) return filtered;
    return filtered.filter((r) => savedIds.includes(r.slug));
  }, [search, catalogue.properties, budgets, regions, savedIds]);

  const setParam = <K extends keyof PropertiesSearch>(key: K, value: PropertiesSearch[K]) => {
    void navigate({
      search: (prev: PropertiesSearch) => {
        const next: PropertiesSearch = { ...prev, [key]: value };
        if (!value) {
          delete next[key];
        }
        return next;
      },
      replace: true,
    });
  };

  const resetAll = () => {
    setOpenDropdown(null);
    void navigate({ search: {}, replace: true });
  };

  // GSAP Entrance Animations matching Caldren's `/properties` page
  useEffect(() => {
    if (typeof window === "undefined" || navigator.userAgent.includes("jsdom")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        const els = headerRef.current.querySelectorAll("[data-prop-hero]");
        gsap.fromTo(
          els,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.1,
            ease: "power3.out",
          },
        );
      }

      if (filterBarRef.current) {
        gsap.fromTo(
          filterBarRef.current,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            delay: 0.18,
            ease: "power3.out",
          },
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || navigator.userAgent.includes("jsdom")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!gridRef.current || list.length === 0) return;

    const cards = gridRef.current.querySelectorAll("[data-prop-card-item]");
    if (!cards.length) return;

    gsap.fromTo(
      cards,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.06,
        ease: "power3.out",
        overwrite: "auto",
      },
    );
  }, [list.length, search.loc, search.type, search.budget, search.sort, search.layout]);

  const sortOptions = [
    { key: "", label: "Featured" },
    { key: "featured", label: "Featured First" },
    { key: "newest", label: "Newest Listings" },
    { key: "oldest", label: "Oldest Listings" },
    { key: "price-asc", label: t.properties.sortLowest },
    { key: "price-desc", label: t.properties.sortHighest },
    { key: "area-desc", label: "Area: Large to Small" },
    { key: "area-asc", label: "Area: Small to Large" },
  ] as const;

  const currentBudgetLabel =
    budgets.find((b) => b.id === search.budget)?.label ?? t.properties.allBudgets;

  const formattedCount = String(list.length).padStart(2, "0");

  return (
    <div
      ref={pageRef}
      className="min-h-screen w-full bg-[#F9F8F5] text-[#163038]"
      style={{ fontFamily: '"Geist", "Inter", sans-serif' }}
    >
      {/* 1. Caldren Page Header (.framer-hu4qot: max-w 1312px, pt-96px pb-56px px-64px, space-between, items-end) */}
      <section
        ref={headerRef}
        data-framer-name="Page Header"
        className="mx-auto flex w-full max-w-[1312px] flex-col items-start justify-between gap-8 px-5 pt-14 pb-10 sm:px-8 lg:flex-row lg:items-end lg:px-[64px] lg:pt-[96px] lg:pb-[56px]"
      >
        <div data-prop-hero className="max-w-[780px]">
          <p className="sr-only">
            {t.properties.eyebrow} — {t.properties.title} {t.properties.titleEm}
          </p>
          <h1 className="m-0 text-[52px] font-normal leading-[1.03] tracking-[-0.04em] text-[#163038] sm:text-[76px] lg:text-[112px]">
            <span>Every residence,</span>
            <br />
            <span
              className="italic font-normal tracking-[-0.02em] text-[#163038]"
              style={{
                fontFamily: '"Cormorant Garamond", "Instrument Serif", Georgia, serif',
              }}
            >
              considered.
            </span>
          </h1>
        </div>

        {/* Right Count Block (.framer-1w2l7p4: width 280px, gap 10px) */}
        <div data-prop-hero className="flex w-full max-w-[290px] flex-col items-start gap-[10px]">
          <div className="text-[48px] font-normal leading-none tracking-[-0.04em] text-[#163038] tabular-nums sm:text-[64px]">
            {formattedCount}
          </div>
          <p className="m-0 text-[15px] font-normal leading-[1.45] tracking-[-0.01em] text-[#5C6F73]">
            Residences and verified packages available now across Istanbul, Bodrum, Antalya and
            Sakarya.
          </p>
        </div>
      </section>

      {/* 2. Caldren Filter Bar (.framer-brcnnd -> .framer-1qccw: bg #F7F6F2, rounded 4px, p-8px) */}
      <section
        ref={filterBarRef}
        aria-label="Filter properties"
        data-framer-name="Filter Bar"
        className="mx-auto w-full max-w-[1312px] px-5 sm:px-8 lg:px-[64px]"
      >
        <div className="relative flex flex-col items-stretch rounded-[8px] border border-[#DEE0DD] bg-[#F7F6F2] p-[8px] shadow-xs lg:flex-row lg:items-center">
          {/* Column 1: LOCATION / DISTRICT */}
          <div className="flex flex-1 flex-col gap-[4px] px-[18px] py-[10px] lg:px-[22px] lg:py-[12px]">
            <label
              htmlFor="f-district"
              className="text-[10px] font-semibold uppercase leading-[1.2] tracking-[0.14em] text-[#5C6F73]"
            >
              LOCATION
            </label>
            <div className="relative flex items-center">
              <select
                id="f-district"
                value={search.loc ?? ""}
                onChange={(e) => setParam("loc", e.target.value || undefined)}
                className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-[14px] font-medium text-[#163038] focus:outline-none"
              >
                <option value="">{t.properties.allDistricts}</option>
                {districtOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-[#5C6F73]" />
            </div>
          </div>

          {/* Column 2: PROPERTY TYPE */}
          <div className="flex flex-1 flex-col gap-[4px] border-t border-[#DEE0DD] px-[18px] py-[10px] lg:border-t-0 lg:border-l lg:px-[22px] lg:py-[12px]">
            <label
              htmlFor="f-record-type"
              className="text-[10px] font-semibold uppercase leading-[1.2] tracking-[0.14em] text-[#5C6F73]"
            >
              PROPERTY TYPE
            </label>
            <div className="relative flex items-center">
              <select
                id="f-record-type"
                value={search.type ?? ""}
                onChange={(e) => setParam("type", e.target.value || undefined)}
                className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-[14px] font-medium text-[#163038] focus:outline-none"
              >
                <option value="">{t.properties.allTypes}</option>
                {(Object.keys(TYPE_LABEL) as RecordType[]).map((rt) => (
                  <option key={rt} value={rt}>
                    {TYPE_LABEL[rt]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-[#5C6F73]" />
            </div>
          </div>

          {/* Column 3: PRICE */}
          <div className="relative flex flex-1 flex-col gap-[4px] border-t border-[#DEE0DD] px-[18px] py-[10px] lg:border-t-0 lg:border-l lg:px-[22px] lg:py-[12px]">
            <div className="flex items-center justify-between">
              <label
                htmlFor="f-budget"
                className="text-[10px] font-semibold uppercase leading-[1.2] tracking-[0.14em] text-[#5C6F73]"
              >
                PRICE
              </label>
            </div>
            <div className="relative flex items-center">
              <select
                id="f-budget"
                value={search.budget ?? ""}
                onChange={(e) => setParam("budget", e.target.value || undefined)}
                className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-[14px] font-medium text-[#163038] focus:outline-none"
              >
                <option value="">{t.properties.allBudgets}</option>
                {budgets.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-[#5C6F73]" />
            </div>
          </div>

          {/* Column 4: BEDROOMS / LAYOUT */}
          <div className="relative flex flex-1 flex-col gap-[4px] border-t border-[#DEE0DD] px-[18px] py-[10px] lg:border-t-0 lg:border-l lg:px-[22px] lg:py-[12px]">
            <label
              htmlFor="f-bedrooms"
              className="text-[10px] font-semibold uppercase leading-[1.2] tracking-[0.14em] text-[#5C6F73]"
            >
              BEDROOMS
            </label>
            <div className="relative flex items-center">
              <select
                id="f-bedrooms"
                value={search.layout ?? ""}
                onChange={(e) => setParam("layout", e.target.value || undefined)}
                className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-[14px] font-medium text-[#163038] focus:outline-none"
              >
                <option value="">{t.properties.allLayouts}</option>
                {LAYOUTS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-[#5C6F73]" />
            </div>
          </div>

          {/* Column 5: Search Button (.framer-tboi5m: bg #163038, rounded 6px) */}
          <button
            type="button"
            onClick={() => {
              const qInput = document.getElementById("f-q");
              qInput?.focus();
            }}
            className="mt-2 inline-flex shrink-0 items-center justify-center gap-[10px] rounded-[6px] bg-[#163038] px-[32px] py-[16px] text-[14px] font-medium text-white transition-all duration-300 hover:bg-[#10785F] shadow-xs lg:mt-0 cursor-pointer"
          >
            <span>Search</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>

        {/* Secondary Search & Region/Side/Currency Bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-[#DEE0DD] bg-[#F7F6F2] px-4 py-3">
          <div className="relative flex min-w-[240px] flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-[#5C6F73]" />
            <input
              id="f-q"
              type="search"
              value={search.q ?? ""}
              onChange={(e) => setParam("q", e.target.value || undefined)}
              placeholder={t.properties.searchPlaceholder}
              aria-label={t.properties.searchPlaceholder}
              className="w-full rounded-full border border-[#DEE0DD] bg-white py-1.5 pr-8 pl-8 text-[13px] text-[#163038] placeholder:text-[#5C6F73]/70 focus:border-[#163038] focus:outline-none"
            />
            {search.q && (
              <button
                type="button"
                onClick={() => setParam("q", undefined)}
                aria-label="Clear search"
                className="absolute right-2.5 text-[#5C6F73] hover:text-[#163038]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {regions.length > 1 && (
              <div className="flex items-center gap-1.5">
                <label
                  htmlFor="f-region"
                  className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#5C6F73]"
                >
                  {t.properties.filterRegion}
                </label>
                <select
                  id="f-region"
                  value={search.region ?? ""}
                  onChange={(e) => setParam("region", e.target.value || undefined)}
                  className="rounded-full border border-[#DEE0DD] bg-white px-3 py-1 text-[12px] text-[#163038]"
                >
                  <option value="">{t.properties.allRegions}</option>
                  {regions.map((r) => (
                    <option key={r.slug} value={r.slug}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <label
                htmlFor="f-side"
                className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#5C6F73]"
              >
                Side
              </label>
              <select
                id="f-side"
                value={search.side ?? ""}
                onChange={(e) => setParam("side", e.target.value || undefined)}
                className="rounded-full border border-[#DEE0DD] bg-white px-3 py-1 text-[12px] text-[#163038]"
              >
                <option value="">{t.properties.allSides}</option>
                <option value="Europe">{t.properties.sideEurope}</option>
                <option value="Asia">{t.properties.sideAsia}</option>
              </select>
            </div>

            <div
              role="group"
              aria-label="Display currency"
              className="inline-flex items-center rounded-full border border-[#DEE0DD] bg-white p-0.5"
            >
              {(["USD", "EUR", "GBP", "TRY"] as SupportedCurrency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                    currency === c
                      ? "bg-[#163038] text-white"
                      : "text-[#5C6F73] hover:text-[#163038]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              aria-expanded={showAdvanced}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                showAdvanced
                  ? "border-[#163038] bg-[#163038] text-white"
                  : "border-[#DEE0DD] bg-white text-[#163038] hover:border-[#163038]"
              }`}
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span>More Filters</span>
            </button>

            <div
              role="group"
              aria-label="View mode"
              className="inline-flex items-center rounded-full border border-[#DEE0DD] bg-white p-0.5"
            >
              <button
                type="button"
                onClick={() => setParam("view", undefined)}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                  search.view !== "map" && search.view !== "list"
                    ? "bg-[#163038] text-white"
                    : "text-[#5C6F73] hover:text-[#163038]"
                }`}
              >
                <LayoutGrid className="h-3 w-3" /> Grid
              </button>
              <button
                type="button"
                onClick={() => setParam("view", "list")}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${search.view === "list" ? "bg-[#163038] text-white" : "text-[#5C6F73] hover:text-[#163038]"}`}
              >
                <ListIcon className="h-3 w-3" /> List
              </button>
              <button
                type="button"
                onClick={() => setParam("view", "map")}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                  search.view === "map"
                    ? "bg-[#163038] text-white"
                    : "text-[#5C6F73] hover:text-[#163038]"
                }`}
              >
                <MapIcon className="h-3 w-3" /> Map
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Multi-Criteria Filter Drawer */}
        {showAdvanced && (
          <div className="mt-3 grid grid-cols-1 gap-3 rounded-[8px] border border-[#DEE0DD] bg-white p-4 shadow-xs sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C6F73] mb-1">
                Neighborhood
              </label>
              <select
                value={search.neighborhood ?? ""}
                onChange={(e) => setParam("neighborhood", e.target.value || undefined)}
                className="w-full rounded-[6px] border border-[#DEE0DD] bg-[#F7F6F2] px-3 py-1.5 text-[13px] text-[#163038]"
              >
                <option value="">All Neighborhoods</option>
                {neighborhoodOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C6F73] mb-1">
                Property Category
              </label>
              <select
                value={search.category ?? ""}
                onChange={(e) => setParam("category", e.target.value || undefined)}
                className="w-full rounded-[6px] border border-[#DEE0DD] bg-[#F7F6F2] px-3 py-1.5 text-[13px] text-[#163038]"
              >
                <option value="">All Categories</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C6F73] mb-1">
                Development / Project
              </label>
              <select
                value={search.project ?? ""}
                onChange={(e) => setParam("project", e.target.value || undefined)}
                className="w-full rounded-[6px] border border-[#DEE0DD] bg-[#F7F6F2] px-3 py-1.5 text-[13px] text-[#163038]"
              >
                <option value="">All Developments</option>
                {projectOptions.map((proj) => (
                  <option key={proj} value={proj}>
                    {proj}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C6F73] mb-1">
                Completion Status
              </label>
              <select
                value={search.completionStatus ?? ""}
                onChange={(e) => setParam("completionStatus", e.target.value || undefined)}
                className="w-full rounded-[6px] border border-[#DEE0DD] bg-[#F7F6F2] px-3 py-1.5 text-[13px] text-[#163038]"
              >
                <option value="">Any Status</option>
                <option value="Ready">Ready to Move</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Off-Plan">Off-Plan</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C6F73] mb-1">
                Min Area (m²)
              </label>
              <input
                type="number"
                placeholder="e.g. 80"
                value={search.minArea ?? ""}
                onChange={(e) =>
                  setParam("minArea", e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full rounded-[6px] border border-[#DEE0DD] bg-[#F7F6F2] px-3 py-1.5 text-[13px] text-[#163038]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C6F73] mb-1">
                Max Area (m²)
              </label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={search.maxArea ?? ""}
                onChange={(e) =>
                  setParam("maxArea", e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full rounded-[6px] border border-[#DEE0DD] bg-[#F7F6F2] px-3 py-1.5 text-[13px] text-[#163038]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C6F73] mb-1">
                Min Price (USD)
              </label>
              <input
                type="number"
                placeholder="e.g. 250000"
                value={search.minPrice ?? ""}
                onChange={(e) =>
                  setParam("minPrice", e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full rounded-[6px] border border-[#DEE0DD] bg-[#F7F6F2] px-3 py-1.5 text-[13px] text-[#163038]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C6F73] mb-1">
                Max Price (USD)
              </label>
              <input
                type="number"
                placeholder="e.g. 1500000"
                value={search.maxPrice ?? ""}
                onChange={(e) =>
                  setParam("maxPrice", e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full rounded-[6px] border border-[#DEE0DD] bg-[#F7F6F2] px-3 py-1.5 text-[13px] text-[#163038]"
              />
            </div>
          </div>
        )}
      </section>

      {/* 3. Caldren Results Row (.framer-1tr7ym2: max-w 1312px, pt-36px pb-28px px-64px, space-between) */}
      <section
        data-framer-name="Results Row"
        className="mx-auto flex w-full max-w-[1312px] flex-wrap items-center justify-between gap-4 px-5 pt-8 pb-6 sm:px-8 lg:px-[64px] lg:pt-[36px] lg:pb-[28px]"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[14px] font-normal tracking-[-0.01em] text-[#5C6F73]">
            <strong className="font-medium text-[#163038] tabular-nums">{list.length}</strong>{" "}
            {list.length === 1 ? "residence" : "residences"}
          </span>

          <span className="text-[#163038]/20">|</span>

          <button
            type="button"
            onClick={() => setParam("cbiOnly", search.cbiOnly ? undefined : true)}
            aria-pressed={Boolean(search.cbiOnly)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors ${
              search.cbiOnly
                ? "border-[#163038] bg-[#163038] text-white"
                : "border-[#DEE0DD] bg-white text-[#163038] hover:border-[#163038]"
            }`}
          >
            <span>{t.properties.cbiOnly}</span>
          </button>

          <button
            type="button"
            onClick={() => setParam("savedOnly", search.savedOnly ? undefined : true)}
            aria-pressed={Boolean(search.savedOnly)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors ${
              search.savedOnly
                ? "border-[#C5A059] bg-[#C5A059] text-white"
                : "border-[#DEE0DD] bg-white text-[#163038] hover:border-[#163038]"
            }`}
          >
            <Heart className={`h-3 w-3 ${search.savedOnly ? "fill-current" : ""}`} />
            <span>
              {t.properties.savedOnly} ({savedIds.length})
            </span>
          </button>

          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#5C6F73] transition-colors hover:text-[#163038]"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{t.properties.resetFilters}</span>
          </button>
        </div>

        {/* Right: Caldren Sort Trigger & Dropdown (.framer-10m6c9y / .framer-cjwmkm) */}
        <div className="relative flex items-center gap-2">
          <label htmlFor="f-sort" className="text-[14px] text-[#5C6F73]">
            {t.properties.sortBy}:
          </label>
          <select
            id="f-sort"
            value={search.sort ?? ""}
            onChange={(e) => setParam("sort", e.target.value || undefined)}
            className="cursor-pointer appearance-none bg-transparent pr-5 text-[14px] font-medium text-[#163038] focus:outline-none"
          >
            {sortOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-label="Open sort menu"
            onClick={() => setOpenDropdown((prev) => (prev === "sort" ? null : "sort"))}
            className="inline-flex items-center justify-center text-[#163038]"
          >
            <ChevronDown className="h-4 w-4" />
          </button>

          {openDropdown === "sort" && (
            <div className="absolute top-full right-0 z-30 mt-2 flex w-[220px] flex-col gap-0.5 rounded-[6px] border border-[#DEE0DD] bg-white p-2 shadow-[0_24px_60px_rgba(22,48,56,0.12)]">
              {sortOptions.map((opt) => {
                const isSelected = (search.sort ?? "") === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setParam("sort", opt.key || undefined);
                      setOpenDropdown(null);
                    }}
                    className={`flex items-center justify-between rounded-[4px] px-3.5 py-2.5 text-left text-[14px] transition-all hover:translate-x-1 hover:bg-[#F7F6F2] ${
                      isSelected ? "font-medium text-[#163038]" : "text-[#5C6F73]"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#163038]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. Caldren 3-Column Property Grid (.framer-gyeasi: max-w 1312px, grid-cols-3, gap 56px 24px, pb-120px) */}
      <section
        data-framer-name="Grid Section"
        className="mx-auto w-full max-w-[1312px] px-5 pb-24 sm:px-8 lg:px-[64px] lg:pb-[120px]"
      >
        {catalogue.isPending ? (
          <div className="py-24 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#163038] border-t-transparent" />
            <p className="mt-4 text-sm text-[#5C6F73]">{t.common.loading}</p>
          </div>
        ) : catalogue.isError ? (
          <div className="rounded-[6px] border border-red-500/20 bg-red-500/5 p-12 text-center">
            <h3 className="text-xl font-medium text-[#163038]">{t.common.error}</h3>
            <button
              type="button"
              onClick={() => void catalogue.refetch()}
              className="mt-6 inline-flex items-center rounded-full bg-[#163038] px-6 py-2.5 text-xs font-medium uppercase tracking-widest text-white"
            >
              {t.common.retry}
            </button>
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-[6px] border border-[#DEE0DD] bg-[#F7F6F2] p-12 text-center">
            <SlidersHorizontal className="mx-auto h-6 w-6 text-[#C5A059]" />
            <h3 className="mt-4 text-[24px] font-normal tracking-[-0.02em] text-[#163038]">
              {t.properties.noResultsTitle}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-[14px] text-[#5C6F73]">
              {t.properties.noResultsDesc}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex h-[44px] items-center justify-center rounded-full bg-[#163038] px-6 text-[13px] font-medium text-white"
              >
                {t.properties.resetFilters}
              </button>
              <Link
                to="/contact"
                className="inline-flex h-[44px] items-center justify-center rounded-full border border-[#DEE0DD] bg-white px-6 text-[13px] font-medium text-[#163038] no-underline"
              >
                {t.cta.requestConsultation}
              </Link>
            </div>
          </div>
        ) : search.view === "list" ? (
          <div className="flex flex-col gap-5">
            {list.map((r) => (
              <PropertyListRow key={r.slug} r={r} />
            ))}
          </div>
        ) : search.view === "map" ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="relative min-h-[520px] overflow-hidden rounded-[8px] border border-[#DEE0DD] bg-[#163038] p-6 text-white flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C5A059]">
                    Interactive Portfolio Atlas
                  </p>
                  <h3 className="mt-1 text-xl font-medium">
                    {list.length} Properties Mapped Across Türkiye
                  </h3>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                  Click any pin to preview residence
                </span>
              </div>

              <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {list.map((r) => {
                  const isActive = (selectedMapSlug ?? list[0]?.slug) === r.slug;
                  const coords = r.details["coordinates"] as
                    | { lat?: number; lng?: number }
                    | undefined;
                  return (
                    <button
                      key={r.slug}
                      type="button"
                      onClick={() => setSelectedMapSlug(r.slug)}
                      className={`flex flex-col items-start gap-1 rounded-[6px] border p-3 text-left transition-all ${
                        isActive
                          ? "border-[#C5A059] bg-[#C5A059]/20 text-white"
                          : "border-white/15 bg-white/5 text-white/80 hover:border-white/40"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C5A059]">
                        <MapPin className="h-3 w-3" /> {r.location_label || r.city}
                      </span>
                      <span className="line-clamp-1 text-xs font-medium">{r.marketing_title}</span>
                      {coords?.lat && coords?.lng && (
                        <span className="font-mono text-[10px] text-white/50">
                          {coords.lat.toFixed(3)}°, {coords.lng.toFixed(3)}°
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-white/60">
                Coordinates verified with municipal district boundaries and cadastral parcel data.
              </p>
            </div>

            <div>
              {(() => {
                const activeProp = list.find((r) => r.slug === selectedMapSlug) ?? list[0];
                return activeProp ? <PropertyCard r={activeProp} index={0} /> : null;
              })()}
            </div>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-1 gap-x-[28px] gap-y-[32px] md:grid-cols-2 lg:grid-cols-3 lg:gap-y-[40px]"
          >
            {list.map((r, index) => (
              <div key={r.slug} data-prop-card-item>
                <PropertyCard r={r} index={index} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Caldren Night-Sky Starfield Final CTA (.framer-ddjg80) */}
      <CaldrenSkyCtaSection />
    </div>
  );
}
