import { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Heart, MessageSquare } from "lucide-react";
import {
  areaText,
  comparableUsd,
  convertUsdPrice,
  getPropertyMedia,
  locationText,
  priceDisplay,
  sideText,
  TYPE_LABEL,
  type PropertyRecord,
} from "@/data/properties";
import { useCurrency, useShortlist } from "@/hooks/usePreferences";
import { useLiveContact } from "@/hooks/useLiveContact";
import { useLanguage } from "@/hooks/useLanguage";
import { PLACEHOLDER_IMAGES, resolvePlaceholderSrc } from "@/data/placeholders";

export interface PropertyCardProps {
  r: PropertyRecord;
  index?: number;
}

/**
 * Caldren-inspired Property Card (`ms0iib6H2.DjW300_u.mjs` `.framer-oddzss`)
 * adapted to Avrasya's `PropertyRecord` schema, currency switcher,
 * shortlist persistence, WhatsApp inquiry link, and PDF compliance rules.
 */
export function PropertyCard({ r, index }: PropertyCardProps) {
  const [currency] = useCurrency();
  const { isSaved, toggle: toggleSave } = useShortlist();
  const contact = useLiveContact();
  const { t } = useLanguage();

  const saved = isSaved(r.slug);
  const media = getPropertyMedia(r);
  const usdVal = comparableUsd(r.price);
  const priceObj = priceDisplay(r.price);

  const displayPrice =
    currency !== "USD" && usdVal != null ? convertUsdPrice(usdVal, currency) : priceObj.main;

  // PDF Compliance (Page 8): Never label a single property under $400,000 USD as Citizenship Eligible on its own.
  const isCbiVerified = r.details["cbi_verified"] === true;
  const qualifiesStandalone = isCbiVerified && (usdVal == null || usdVal >= 400_000);
  const qualifiesViaBundle = isCbiVerified && usdVal != null && usdVal < 400_000;

  const statusPillLabel =
    r.record_type === "package"
      ? "PORTFOLIO PACKAGE"
      : qualifiesStandalone
        ? t.propertyCard.cbiVerified.toUpperCase()
        : r.mode === "rent"
          ? t.propertyCard.forRent.toUpperCase()
          : t.propertyCard.forSale.toUpperCase();

  // Structured placeholder fallback when cover photo is absent
  const fallbackSlot =
    PLACEHOLDER_IMAGES.aboutArcGallery[(index ?? 0) % PLACEHOLDER_IMAGES.aboutArcGallery.length]!;
  const imageSrc =
    media.cover && media.cover.trim().length > 0
      ? media.cover
      : resolvePlaceholderSrc(fallbackSlot);

  const locationStr = locationText(r);
  const sideStr = sideText(r);
  const areaStr = areaText(r);
  const typeStr = TYPE_LABEL[r.record_type];

  const waHref = `${contact.whatsapp}?text=${encodeURIComponent(
    `Hello Avrasya Properties, I would like to inquire about "${r.marketing_title}" (${locationStr}).`,
  )}`;

  const cardRef = useRef<HTMLElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -(y * 5), y: x * 5 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const formattedIndex = String((index ?? 0) + 1).padStart(2, "0");

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-framer-name="Property"
      className="group relative flex h-[480px] w-full flex-col justify-between overflow-hidden rounded-[24px] border border-[#163038]/15 bg-[#0E2228] shadow-[0_20px_50px_rgba(14,34,40,0.18)] transition-all duration-500 will-change-transform hover:-translate-y-1 hover:border-[#C5A059]/60 hover:shadow-[0_28px_64px_rgba(14,34,40,0.32)] sm:h-[520px]"
      style={{
        fontFamily: '"Geist", "Inter", sans-serif',
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
    >
      {/* Full-Bleed Architectural Media Container with Dark Gradient Scrim */}
      <div className="absolute inset-0 overflow-hidden bg-[#142A30]">
        <Link
          to="/properties/$slug"
          params={{ slug: r.slug }}
          tabIndex={-1}
          aria-hidden="true"
          className="block h-full w-full no-underline"
        >
          <img
            src={imageSrc}
            alt={r.marketing_title}
            loading="lazy"
            className="block h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
          />
        </Link>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0E2228] via-[#0E2228]/55 to-black/20"
        />
      </div>

      {/* Top Card Bar: Status / CBI Badges Left + District & Shortlist Toggle Right */}
      <div className="relative z-10 flex items-start justify-between gap-2 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[10px] font-medium uppercase leading-none tracking-[0.12em] text-[#C5A059] backdrop-blur-md transition-colors group-hover:border-[#C5A059]/50">
            {statusPillLabel}
          </span>
          {qualifiesViaBundle && (
            <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-[#0E2228]/80 px-2.5 py-1 text-[9.5px] font-medium uppercase leading-none tracking-[0.1em] text-white backdrop-blur-md">
              Combinable for $400k+
            </span>
          )}
          {r.ref && (
            <span className="rounded-full bg-black/40 px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-white/85 backdrop-blur-md">
              {r.ref}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-black/35 px-3 py-1 text-[11px] font-medium text-white/85 backdrop-blur-md sm:inline-block">
            {locationStr}
          </span>
          <button
            type="button"
            onClick={() => toggleSave(r.slug)}
            aria-label={saved ? t.propertyCard.saved : t.propertyCard.save}
            aria-pressed={saved}
            className={`flex h-[34px] w-[34px] shrink-0 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 ${
              saved
                ? "border-[#C5A059] bg-[#C5A059] text-[#0E2228] shadow-sm"
                : "border-white/20 bg-black/40 text-white backdrop-blur-md hover:border-[#C5A059] hover:bg-black/65"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* Bottom Content Overlay Bar */}
      <div className="relative z-10 flex flex-col gap-3 p-5 sm:p-6">
        {/* Index Number + Converted Price Row */}
        <div className="flex items-end justify-between gap-3">
          <span className="font-serif text-[13px] font-semibold tracking-[0.16em] uppercase text-[#C5A059]">
            {formattedIndex}
          </span>
          <div className="flex flex-col items-end text-right">
            <span className="text-[18px] font-semibold leading-tight tracking-[-0.01em] text-white tabular-nums sm:text-[20px]">
              {displayPrice}
            </span>
            {priceObj.note && (
              <span className="mt-0.5 max-w-[180px] truncate text-[11px] font-normal text-[#C5A059]">
                {priceObj.note}
              </span>
            )}
          </div>
        </div>

        {/* Serif Residence Title & Location Subtitle */}
        <div className="space-y-1.5">
          <h3
            className="m-0 font-serif text-[21px] font-light leading-[1.2] text-white sm:text-[24px]"
            style={{ fontFamily: '"Cormorant Garamond", "Instrument Serif", Georgia, serif' }}
          >
            <Link
              to="/properties/$slug"
              params={{ slug: r.slug }}
              className="text-white no-underline transition-colors group-hover:text-[#C5A059]"
            >
              {r.marketing_title}
            </Link>
          </h3>
          <p className="m-0 line-clamp-2 text-[12.5px] leading-[1.45] text-white/75">
            {r.marketing_title} in {locationStr}.
          </p>
        </div>

        {/* Compact Specs Strip */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/12 pt-2.5 text-[11.5px] font-normal text-white/75">
          {r.layout_label && <span className="font-medium text-white/90">{r.layout_label}</span>}
          <span>{sideStr}</span>
          <span className="max-w-[160px] truncate">{areaStr}</span>
          <span>{typeStr}</span>
        </div>

        {/* Bottom Interactive Pill CTA + WhatsApp Action */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <Link
            to="/properties/$slug"
            params={{ slug: r.slug }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12px] font-medium text-white no-underline backdrop-blur-sm transition-all duration-300 hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-[#0E2228]"
          >
            <span>View Residence</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>

          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            aria-label={`${t.propertyCard.inquireWhatsApp}: ${r.marketing_title}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-3.5 py-2 text-[11.5px] font-medium text-white/85 no-underline backdrop-blur-sm transition-colors hover:border-[#C5A059] hover:text-[#C5A059]"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
            <ArrowUpRight className="h-3 w-3 opacity-70" />
          </a>
        </div>
      </div>
    </article>
  );
}
