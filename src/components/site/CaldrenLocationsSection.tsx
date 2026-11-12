import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "@/hooks/useLanguage";
import { useCurrency } from "@/hooks/usePreferences";
import {
  type PropertyRecord,
  comparableUsd,
  convertUsdPrice,
  getPropertyMedia,
} from "@/data/properties";
import { PLACEHOLDER_IMAGES, resolvePlaceholderSrc } from "@/data/placeholders";
import { type Region, publicRegions, slugifyRegion } from "@/data/regions";
import type { SiteSettings } from "@/admin/demo";
import { useSiteSettings } from "@/admin/store";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface RegionData {
  index: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  avgPriceM2: string;
  priceGrowthYoY: string;
  indicativeYield?: string;
  defaultResidencesCount: number;
  featuredFallbackTitle: string;
  featuredFallbackPriceUsd: number;
  featuredFallbackSlug: string;
  featuredThumb: string;
  imageSrc: string;
  imageAlt: string;
  slotIndex: number;
  districts?: string[];
}

export const REGIONS_DATA: RegionData[] = [
  {
    index: "01",
    slug: "istanbul",
    name: "Istanbul",
    tagline: "Financial & Cultural Capital",
    description:
      "Türkiye's economic powerhouse where Bosphorus heritage meets modern prime towers. From Maslak to Beşiktaş, high-liquidity freehold assets drive resilient rental yields and capital growth.",
    avgPriceM2: "$3,850",
    priceGrowthYoY: "+18%",
    defaultResidencesCount: 18,
    featuredFallbackTitle: "Aurelia Bosphorus Residence",
    featuredFallbackPriceUsd: 1850000,
    featuredFallbackSlug: "topkapi-two-apartment-package-480",
    featuredThumb: "/images/properties/hero-main.jpg",
    imageSrc: "/images/properties/hero-main.jpg",
    imageAlt: "Panoramic view of Istanbul financial towers and the Bosphorus strait",
    slotIndex: 0,
  },
  {
    index: "02",
    slug: "bodrum",
    name: "Bodrum",
    tagline: "Aegean Riviera & Yachting Marinas",
    description:
      "Low-slung travertine and natural stone architecture overlooking the Aegean Sea. Prime bays in Yalıkavak and Türkbükü command exceptional seasonal foreign-currency yields.",
    avgPriceM2: "$5,200",
    priceGrowthYoY: "+22%",
    defaultResidencesCount: 6,
    featuredFallbackTitle: "Yalıkavak Horizon Cliffside Villa",
    featuredFallbackPriceUsd: 1250000,
    featuredFallbackSlug: "ferikoy-garden-duplex-central",
    featuredThumb: "/images/properties/sisli-residence.jpg",
    imageSrc: "/images/properties/sisli-residence.jpg",
    imageAlt: "Private architectural stone villa in Bodrum overlooking the Aegean coast",
    slotIndex: 1,
  },
  {
    index: "03",
    slug: "antalya",
    name: "Antalya",
    tagline: "Mediterranean Coast & 300 Days of Sun",
    description:
      "With direct year-round international flights, Konyaaltı and Lara combine resort-grade waterfront living with high occupancy rates and qualifying Turkish Citizenship portfolios.",
    avgPriceM2: "$2,650",
    priceGrowthYoY: "+15%",
    defaultResidencesCount: 5,
    featuredFallbackTitle: "Konyaaltı Seafront Sky Residence",
    featuredFallbackPriceUsd: 420000,
    featuredFallbackSlug: "atasehir-modern-2bed-citizenship",
    featuredThumb: "/images/properties/bosphorus-terrace.jpg",
    imageSrc: "/images/properties/bosphorus-terrace.jpg",
    imageAlt: "Luxury seaside residence terrace in Antalya overlooking the Mediterranean",
    slotIndex: 2,
  },
  {
    index: "04",
    slug: "sakarya",
    name: "Sakarya",
    tagline: "Sapanca Lake & Woodland Sanctuaries",
    description:
      "Less than an hour east of Istanbul, Sapanca and Sakarya offer private gated nature estates framed by alpine forests and thermal springs — prized for family retreats and wellness living.",
    avgPriceM2: "$2,400",
    priceGrowthYoY: "+14%",
    defaultResidencesCount: 4,
    featuredFallbackTitle: "Sapanca Lakeview Sanctuary Villa",
    featuredFallbackPriceUsd: 540000,
    featuredFallbackSlug: "maslak-executive-tower-residence",
    featuredThumb: "/images/properties/orya-park-exterior.jpg",
    imageSrc: "/images/properties/orya-park-exterior.jpg",
    imageAlt: "Private gated garden villa estate nestled in the forests of Sapanca",
    slotIndex: 3,
  },
];

export interface CaldrenLocationsSectionProps {
  properties?: PropertyRecord[];
  title?: string;
  subtitle?: string;
  settings?: SiteSettings;
  regions?: Region[];
}

export const CaldrenLocationsSection: React.FC<CaldrenLocationsSectionProps> = ({
  properties = [],
  title = "Four regions,",
  subtitle = "We work only where architecture, demand and quality of life align — each market guided by an Avrasya advisor and our in-house attorney.",
  settings: propSettings,
  regions: propRegions,
}) => {
  const { t } = useTranslation();
  const [currency] = useCurrency();
  const hookSettings = useSiteSettings();
  const effectiveSettings = propSettings || hookSettings;

  const dynamicRegionsList = useMemo(() => {
    const raw =
      propRegions || (effectiveSettings?.regions ? publicRegions(effectiveSettings.regions) : []);
    if (!raw || raw.length === 0) {
      return REGIONS_DATA;
    }
    return raw.map((reg, idx) => {
      const fallback =
        REGIONS_DATA.find((r) => r.slug === reg.slug) || REGIONS_DATA[idx % REGIONS_DATA.length]!;
      const matchingCount = properties.filter((p) => {
        const citySlug = slugifyRegion(p.city || "");
        const locSlug = slugifyRegion(p.location_label || "");
        return (
          citySlug === reg.slug ||
          locSlug === reg.slug ||
          (reg.districts &&
            reg.districts.some(
              (d) => slugifyRegion(d) === locSlug || slugifyRegion(d) === citySlug,
            ))
        );
      }).length;

      return {
        index: String(idx + 1).padStart(2, "0"),
        slug: reg.slug,
        name: reg.name,
        tagline: reg.summary || fallback.tagline,
        description: reg.summary || fallback.description,
        avgPriceM2: fallback.avgPriceM2 || "$3,200",
        priceGrowthYoY: fallback.priceGrowthYoY || "+15%",
        defaultResidencesCount: matchingCount > 0 ? matchingCount : fallback.defaultResidencesCount,
        featuredFallbackTitle: fallback.featuredFallbackTitle,
        featuredFallbackPriceUsd: fallback.featuredFallbackPriceUsd,
        featuredFallbackSlug: fallback.featuredFallbackSlug,
        featuredThumb: reg.heroImage || fallback.featuredThumb,
        imageSrc: reg.heroImage || reg.ogImage || fallback.imageSrc,
        imageAlt: `${reg.name} luxury residences and architecture`,
        slotIndex: fallback.slotIndex ?? idx,
      };
    });
  }, [propRegions, effectiveSettings?.regions, properties]);

  const [activeSlug, setActiveSlug] = useState<string>("istanbul");

  useEffect(() => {
    if (dynamicRegionsList.length > 0 && !dynamicRegionsList.some((r) => r.slug === activeSlug)) {
      setActiveSlug(dynamicRegionsList[0]!.slug);
    }
  }, [dynamicRegionsList, activeSlug]);

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const contentWrapRef = useRef<HTMLDivElement>(null);

  const activeRegion = useMemo(() => {
    return dynamicRegionsList.find((r) => r.slug === activeSlug) ?? dynamicRegionsList[0]!;
  }, [dynamicRegionsList, activeSlug]);

  const activeIndex = dynamicRegionsList.findIndex((r) => r.slug === activeSlug);
  const currentIdx = activeIndex >= 0 ? activeIndex : 0;

  const handlePrev = () => {
    const prevIdx = (currentIdx - 1 + dynamicRegionsList.length) % dynamicRegionsList.length;
    setActiveSlug(dynamicRegionsList[prevIdx]!.slug);
  };

  const handleNext = () => {
    const nextIdx = (currentIdx + 1) % dynamicRegionsList.length;
    setActiveSlug(dynamicRegionsList[nextIdx]!.slug);
  };

  // Find matching properties in catalogue
  const regionFeaturedProperty = useMemo(() => {
    const matches = properties.filter((p) => {
      const citySlug = slugifyRegion(p.city || "istanbul");
      return citySlug === activeRegion.slug;
    });
    const featured = matches[0];
    if (featured) {
      const priceUsd = comparableUsd(featured.price) ?? activeRegion.featuredFallbackPriceUsd;
      const thumb =
        featured.cover || getPropertyMedia(featured).cover || activeRegion.featuredThumb;
      return {
        title: featured.marketing_title || activeRegion.featuredFallbackTitle,
        priceUsd,
        slug: featured.slug,
        thumb,
        location: featured.location_label || featured.city,
        count: matches.length,
      };
    }
    return {
      title: activeRegion.featuredFallbackTitle,
      priceUsd: activeRegion.featuredFallbackPriceUsd,
      slug: activeRegion.featuredFallbackSlug,
      thumb: activeRegion.featuredThumb,
      location: activeRegion.name,
      count: activeRegion.defaultResidencesCount,
    };
  }, [properties, activeRegion]);

  // Section ScrollTrigger entrance animation
  useEffect(() => {
    if (typeof window === "undefined" || navigator.userAgent.includes("jsdom")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        const words = headerRef.current.querySelectorAll("[data-loc-anim]");
        gsap.fromTo(
          words,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 85%",
            },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Animate content on active tab switch
  useEffect(() => {
    if (typeof window === "undefined" || navigator.userAgent.includes("jsdom")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (imageWrapRef.current) {
      gsap.fromTo(
        imageWrapRef.current,
        { opacity: 0.4, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" },
      );
    }
    if (contentWrapRef.current) {
      gsap.fromTo(
        contentWrapRef.current,
        { opacity: 0.4, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      );
    }
  }, [activeSlug]);

  const fallbackSlot = PLACEHOLDER_IMAGES.locationsPage[activeRegion.slotIndex]!;
  const displayImageSrc = activeRegion.imageSrc || resolvePlaceholderSrc(fallbackSlot);

  const formattedPrice = useMemo(() => {
    return convertUsdPrice(regionFeaturedProperty.priceUsd, currency);
  }, [regionFeaturedProperty.priceUsd, currency]);

  return (
    <section
      ref={sectionRef}
      data-framer-name="Locations Section"
      className="relative z-[2] w-full overflow-hidden bg-[#F9F8F5] py-16 sm:py-24 lg:py-28"
      style={{ fontFamily: '"Geist", "Inter", sans-serif' }}
    >
      <div className="mx-auto w-full max-w-[1312px] px-5 sm:px-8 lg:px-[64px]">
        {/* 1. Header (Reference Image 3: "Four cities, one standard.") */}
        <div
          ref={headerRef}
          className="flex flex-col items-start justify-between gap-6 pb-10 lg:flex-row lg:items-end lg:pb-14"
        >
          <div data-loc-anim className="max-w-[700px]">
            <h2 className="m-0 text-[42px] font-normal leading-[1.04] tracking-[-0.04em] text-[#163038] sm:text-[64px] lg:text-[84px]">
              <span>{title}</span>
              <br />
              <span
                className="italic font-normal tracking-[-0.02em] text-[#163038]"
                style={{
                  fontFamily: '"Cormorant Garamond", "Instrument Serif", Georgia, serif',
                }}
              >
                one standard.
              </span>
            </h2>
          </div>

          <div data-loc-anim className="w-full max-w-[420px] pb-1">
            <p className="m-0 text-[14px] sm:text-[15px] font-normal leading-[1.6] text-[#5C6F73]">
              {subtitle}
            </p>
          </div>
        </div>

        {/* 2. Numbered City Tabs Bar (01 Istanbul  02 Bodrum  03 Antalya  04 Sakarya) */}
        <div
          role="tablist"
          aria-label="Select Region"
          className="grid w-full grid-cols-2 border-b border-[#DEE0DD] sm:grid-cols-4"
        >
          {dynamicRegionsList.map((reg) => {
            const isActive = activeSlug === reg.slug;
            return (
              <button
                key={reg.slug}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => setActiveSlug(reg.slug)}
                onMouseEnter={() => {
                  if (typeof window !== "undefined" && window.innerWidth >= 1024) {
                    setActiveSlug(reg.slug);
                  }
                }}
                className={`group relative flex items-center gap-2 py-4 text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "border-b-2 border-[#163038] font-medium text-[#163038]"
                    : "border-b border-transparent font-normal text-[#5C6F73] hover:text-[#163038]"
                }`}
              >
                <span
                  className={`text-[13px] sm:text-[14px] tabular-nums transition-colors ${
                    isActive
                      ? "text-[#163038] font-semibold"
                      : "text-[#5C6F73] group-hover:text-[#163038]"
                  }`}
                >
                  {reg.index}
                </span>
                <span className="text-[14px] sm:text-[15px] tracking-[-0.01em]">{reg.name}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Prev / Next Controls Bar (< lg) */}
        <div className="mt-4 flex items-center justify-between border-b border-[#DEE0DD] pb-3 lg:hidden">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous location"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#163038]/20 bg-white text-[#163038] transition-colors hover:bg-[#163038] hover:text-white cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A059]">
              {activeRegion.index} / {String(dynamicRegionsList.length).padStart(2, "0")}
            </span>
            <span className="text-sm font-medium text-[#163038]">{activeRegion.name}</span>
          </div>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next location"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#163038]/20 bg-white text-[#163038] transition-colors hover:bg-[#163038] hover:text-white cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* 3. Interactive Region Showcase (Left Portrait Visual + Right Stats & Details) */}
        <div className="mt-8 sm:mt-12 grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          {/* Left Column: Portrait Architectural Visual */}
          <div className="lg:col-span-6">
            <div
              ref={imageWrapRef}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-[#DEE0DD]/40 shadow-[0_20px_45px_rgba(22,48,56,0.1)]"
            >
              <img
                src={displayImageSrc}
                alt={activeRegion.imageAlt}
                className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = resolvePlaceholderSrc(fallbackSlot);
                }}
              />

              {/* On-image Mobile Touch Arrows (< lg) */}
              <div className="pointer-events-none absolute inset-y-0 inset-x-2 flex items-center justify-between lg:hidden z-10">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous location photo"
                  className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#163038]/70 text-white backdrop-blur-md shadow-md transition-colors hover:bg-[#163038] cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next location photo"
                  className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#163038]/70 text-white backdrop-blur-md shadow-md transition-colors hover:bg-[#163038] cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Glassmorphic Badge Overlay */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full border border-white/30 bg-[#163038]/75 px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-white backdrop-blur-md shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2DD4BF]" />
                <span>{activeRegion.tagline}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Description, Stats, Featured Property, CTA */}
          <div ref={contentWrapRef} className="flex flex-col gap-8 lg:col-span-6 lg:pl-6">
            <div>
              <h3 className="text-[38px] font-normal leading-[1.08] tracking-[-0.03em] text-[#163038] sm:text-[48px] lg:text-[56px]">
                {activeRegion.name}
              </h3>
              <p className="mt-4 text-[15px] font-normal leading-[1.65] text-[#5C6F73]">
                {activeRegion.description}
              </p>
            </div>

            {/* 3-Column Metrics Row */}
            <div className="grid grid-cols-3 gap-4 border-y border-[#DEE0DD] py-6">
              <div>
                <p className="text-[24px] sm:text-[30px] font-medium tracking-tight text-[#163038]">
                  {activeRegion.avgPriceM2}
                </p>
                <p className="mt-1 text-[11.5px] uppercase tracking-[0.08em] text-[#5C6F73]">
                  Avg. price / m²
                </p>
              </div>

              <div>
                <p className="text-[24px] sm:text-[30px] font-medium tracking-tight text-[#10785F]">
                  {activeRegion.priceGrowthYoY}
                </p>
                <p className="mt-1 text-[11.5px] uppercase tracking-[0.08em] text-[#5C6F73]">
                  Price growth YoY
                </p>
              </div>

              <div>
                <p className="text-[24px] sm:text-[30px] font-medium tracking-tight text-[#163038]">
                  {regionFeaturedProperty.count}
                </p>
                <p className="mt-1 text-[11.5px] uppercase tracking-[0.08em] text-[#5C6F73]">
                  Residences
                </p>
              </div>
            </div>

            {/* Featured Property Micro-Card (Exact matching Caldren layout) */}
            <Link
              to="/properties/$slug"
              params={{ slug: regionFeaturedProperty.slug }}
              className="group flex items-center justify-between gap-4 rounded-[14px] border border-[#DEE0DD] bg-white p-3.5 shadow-xs transition-all duration-300 hover:border-[#C5A059] hover:shadow-md no-underline"
            >
              <div className="flex items-center gap-3.5 overflow-hidden">
                <img
                  src={regionFeaturedProperty.thumb}
                  alt={regionFeaturedProperty.title}
                  className="h-[58px] w-[78px] shrink-0 rounded-[8px] object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = resolvePlaceholderSrc(
                      PLACEHOLDER_IMAGES.hero.towerSkyline,
                    );
                  }}
                />
                <div className="min-w-0">
                  <span className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#C5A059]">
                    FEATURED PROPERTY
                  </span>
                  <h4 className="truncate text-[14px] font-semibold text-[#163038] group-hover:text-[#10785F] transition-colors">
                    {regionFeaturedProperty.title}
                  </h4>
                  <span className="text-[11px] text-[#5C6F73]">
                    {regionFeaturedProperty.location}
                  </span>
                </div>
              </div>

              <div className="shrink-0 text-right pr-2">
                <span className="text-[15px] font-semibold text-[#163038]">{formattedPrice}</span>
              </div>
            </Link>

            {/* Action Explore Button */}
            <div>
              <Link
                to="/properties"
                search={{ region: activeRegion.slug }}
                className="group inline-flex h-[48px] items-center gap-3 rounded-full bg-[#163038] px-6 text-[13.5px] font-medium text-white no-underline shadow-md transition-all duration-300 hover:bg-[#10785F] hover:shadow-lg"
              >
                <span>Explore properties in {activeRegion.name}</span>
                <span
                  aria-hidden="true"
                  className="text-[14px] transition-transform duration-300 group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaldrenLocationsSection;
