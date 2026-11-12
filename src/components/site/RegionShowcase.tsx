import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, MapPin, Building2 } from "lucide-react";
import { getPropertyMedia, type PropertyRecord } from "@/data/properties";
import { regionForCity, type Region, REGION_PRESETS } from "@/data/regions";
import { useTranslation } from "@/hooks/useLanguage";

const REGION_FALLBACK_IMAGES: Record<string, string> = {
  istanbul: "/images/properties/hero-main.jpg",
  antalya:
    "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80",
  bodrum:
    "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
  sakarya:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  izmir:
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  fethiye:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  ankara:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
};

const REGION_DESCRIPTIONS: Record<string, string> = {
  istanbul:
    "Türkiye's financial and cultural capital. Prime Bosphorus mansions, elite Levent towers, and historic Galata freehold residences eligible for Turkish Citizenship by Investment.",
  antalya:
    "The Turkish Riviera's crown jewel. Mediterranean beachfront villas, championship golf compounds in Belek, and high-yield luxury vacation residences.",
  bodrum:
    "The playground of international elite. Cliffside Aegean villas with private yacht berths, secluded bays in Yalıkavak, and signature luxury hospitality developments.",
  sakarya:
    "Tranquil natural retreats and lakeside Sapanca villas. Expansive freehold estates and family residences surrounded by lush forested mountains.",
  izmir:
    "Aegean cosmopolitan lifestyle. Modern waterfront promenades, Urla vineyard estates, and premier high-rise residential towers in Alsancak.",
  fethiye:
    "Turquoise Coast paradise. Contemporary hillside villas overlooking the Blue Lagoon, marina residences, and idyllic pine-clad valley compounds.",
  ankara:
    "The diplomatic and government center. Prestigious ambassadorial residences, elite gated communities in Çankaya, and capital property assets.",
};

/**
 * "Where we work": an interactive accordion showcase of prime regions.
 * Clicking a region expands an inline interactive card with high-res photo,
 * curated description, key districts, and direct "Explore Properties" CTA without page redirection.
 */
export function RegionShowcase({
  regions,
  properties,
}: {
  regions: Region[];
  properties: PropertyRecord[];
}) {
  const { t } = useTranslation();

  // Guarantee key regions (Istanbul, Antalya, Bodrum, etc.) are always present for the editorial showcase
  const effectiveRegions: Region[] =
    regions.length >= 2
      ? regions
      : [
          ...regions,
          ...REGION_PRESETS.filter((p) => !regions.some((r) => r.slug === p.slug)).map(
            (p, idx) => ({
              ...p,
              sortOrder: regions.length + idx,
            }),
          ),
        ];

  const rows = effectiveRegions.map((region) => {
    const listings = properties.filter((p) => regionForCity(p.city, [region]));
    const cover =
      region.heroImage ||
      (listings[0] ? getPropertyMedia(listings[0]).cover : "") ||
      REGION_FALLBACK_IMAGES[region.slug] ||
      "/images/properties/hero-main.jpg";
    const description =
      region.summary?.trim() ||
      REGION_DESCRIPTIONS[region.slug] ||
      "Curated luxury residences, verified title deeds, and premier investment opportunities.";
    return { region, count: listings.length, cover, description };
  });

  const [activeSlug, setActiveSlug] = useState<string>(rows[0]?.region.slug || "istanbul");

  const selectRegion = (slug: string) => {
    setActiveSlug((prev) => (prev === slug ? "" : slug));
  };

  const currentActiveIndex = rows.findIndex(
    (r) => r.region.slug === (activeSlug || rows[0]?.region.slug),
  );
  const current = rows[Math.max(0, currentActiveIndex)] || rows[0]!;

  return (
    <section
      data-regions
      id="regions-showcase"
      className="relative border-y border-[#DEE0DD] bg-[#FAF9F5] py-12 md:py-20"
      style={{ fontFamily: '"Geist", "Inter", sans-serif' }}
    >
      <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
        <div>
          <p className="kicker text-[#C5A059] font-medium tracking-[0.2em] uppercase text-xs">
            {t.home.regionsEyebrow}
          </p>
          <h2 className="headline mt-3 max-w-xl text-3xl md:text-5xl font-light text-[#163038] tracking-tight">
            {t.home.regionsTitle}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#5C6F73]">
            {t.home.regionsSubtitle}
          </p>

          <div className="mt-10 border-t border-[#DEE0DD]">
            {rows.map(({ region, count, cover, description }, i) => {
              const isOpen = activeSlug === region.slug;
              return (
                <div
                  key={region.slug}
                  className="border-b border-[#DEE0DD] transition-colors duration-200"
                >
                  {/* Region Row Header (Button for interactive accordion expansion) */}
                  <button
                    type="button"
                    onClick={() => selectRegion(region.slug)}
                    onMouseEnter={() => {
                      if (typeof window !== "undefined" && window.innerWidth >= 1024) {
                        setActiveSlug(region.slug);
                      }
                    }}
                    aria-expanded={isOpen}
                    aria-controls={`region-content-${region.slug}`}
                    className={`group w-full text-left grid min-h-[5.5rem] grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 py-5 transition-all duration-300 md:grid-cols-[3rem_minmax(0,1fr)_auto] md:gap-5 cursor-pointer bg-transparent border-0 outline-none ${
                      isOpen ? "bg-[#163038]/4" : "hover:bg-[#163038]/2"
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold tracking-wider transition-colors ${
                        isOpen ? "text-[#C5A059]" : "text-[#5C6F73]"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span className="min-w-0">
                      <span
                        className={`block truncate text-[1.9rem] md:text-4xl font-light transition-colors ${
                          isOpen
                            ? "text-[#163038] font-normal"
                            : "text-[#163038]/90 group-hover:text-[#163038]"
                        }`}
                        style={{
                          fontFamily: '"Cormorant Garamond", "Instrument Serif", Georgia, serif',
                        }}
                      >
                        {region.name}
                      </span>
                      <span className="mt-1 block truncate text-xs text-[#5C6F73]">
                        {region.country}
                        {region.districts.length
                          ? ` · ${region.districts.slice(0, 3).join(", ")}`
                          : ""}
                        {` · ${count} ${t.properties.regionListingsLabel}`}
                      </span>
                    </span>

                    <span
                      className={`flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full border transition-all duration-300 ${
                        isOpen
                          ? "border-[#163038] bg-[#163038] text-white rotate-180"
                          : "border-[#DEE0DD] bg-white text-[#163038] group-hover:border-[#C5A059]"
                      }`}
                      aria-hidden="true"
                    >
                      <ChevronDown className="h-4 w-4 transition-transform duration-300" />
                    </span>
                  </button>

                  {/* Inline Expandable Accordion Drawer (Expanded directly below the selector on mobile) */}
                  <div
                    id={`region-content-${region.slug}`}
                    data-region-mobile-card
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100 pb-6 pt-1"
                        : "grid-rows-[0fr] opacity-0 pb-0 pt-0 pointer-events-none"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="rounded-[16px] bg-white border border-[#DEE0DD] p-4 sm:p-6 shadow-sm flex flex-col gap-5">
                        {/* High-Resolution Region Photo preview on mobile/tablet */}
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[12px] bg-[#163038]/10 lg:hidden">
                          <img
                            src={cover}
                            alt={`${region.name} real estate`}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-3 text-white">
                            <p className="text-xs uppercase tracking-widest text-[#C5A059]">
                              {region.country}
                            </p>
                            <p className="text-xl font-medium">{region.name}</p>
                          </div>
                        </div>

                        {/* Editorial Summary & Highlights */}
                        <div className="space-y-3">
                          <p className="text-sm leading-relaxed text-[#2C3E42]">{description}</p>

                          {/* District badges */}
                          {region.districts.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[11px] font-medium text-[#5C6F73] flex items-center gap-1 mr-1">
                                <MapPin className="h-3 w-3 text-[#C5A059]" />
                                Key Districts:
                              </span>
                              {region.districts.slice(0, 5).map((d) => (
                                <span
                                  key={d}
                                  className="rounded-full bg-[#163038]/5 px-2.5 py-1 text-[11px] font-medium text-[#163038]"
                                >
                                  {d}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Exact CTA Button: Explore Properties */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[#DEE0DD]/60">
                          <div className="flex items-center gap-2 text-xs text-[#5C6F73]">
                            <Building2 className="h-4 w-4 text-[#C5A059]" />
                            <span>
                              {count > 0
                                ? `${count} published residences available`
                                : "Private investment portfolio available on request"}
                            </span>
                          </div>

                          <Link
                            to="/properties"
                            search={{ region: region.slug }}
                            className="group inline-flex items-center gap-2 rounded-full bg-[#163038] px-5 py-2.5 text-xs font-semibold text-white no-underline shadow-sm transition-all duration-300 hover:bg-[#10785F] hover:shadow-md"
                          >
                            <span>Explore Properties</span>
                            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right-Side Desktop Sticky Visual Preview Panel */}
        <div className="relative hidden lg:block" aria-hidden="true">
          <div className="sticky top-28 aspect-[4/5] overflow-hidden rounded-[20px] bg-[#163038] shadow-2xl border border-[#DEE0DD]">
            {rows.map(({ region, cover }, i) =>
              cover ? (
                <img
                  key={region.slug}
                  src={cover}
                  alt=""
                  loading="lazy"
                  className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
                    region.slug === (activeSlug || rows[0]?.region.slug)
                      ? "scale-100 opacity-100"
                      : "scale-105 opacity-0 pointer-events-none"
                  }`}
                />
              ) : null,
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(14,35,42,0.92)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              <p className="kicker text-[#C5A059] font-medium tracking-[0.2em] uppercase text-xs">
                {current.region.country}
              </p>
              <p
                className="mt-2 text-4xl font-light text-white"
                style={{
                  fontFamily: '"Cormorant Garamond", "Instrument Serif", Georgia, serif',
                }}
              >
                {current.region.name}
              </p>
              <p className="mt-3 line-clamp-3 max-w-sm text-xs leading-relaxed text-white/80">
                {current.description}
              </p>
              <div className="mt-5">
                <Link
                  to="/properties"
                  search={{ region: current.region.slug }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm transition-all hover:bg-white hover:text-[#163038]"
                >
                  <span>Explore Properties in {current.region.name}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
