import { useWhatsAppLink } from "@/hooks/useLiveContact";
import { useState,useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, MapPin, MessageSquare, ArrowRight } from "lucide-react";
import {
  areaText,
  comparableUsd,
  convertUsdPrice,
  getPropertyMedia,
  locationText,
  priceDisplay,
  type PropertyRecord,
} from "@/data/properties";
import { showsSide } from "@/data/regions";
import { useCurrency, useShortlist } from "@/hooks/usePreferences";
import { useLanguage } from "@/hooks/useLanguage";

export function ImageFallback({ r, className = "" }: { r: PropertyRecord; className?: string }) {
  const { t } = useLanguage();
  const media = getPropertyMedia(r);
  const [imgSrc, setImgSrc] = useState(media.cover);
  const [loaded, setLoaded] = useState(false);
  useEffect(()=>{setImgSrc(media.cover);setLoaded(false);},[media.cover]);

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[#0C1E23] ${className}`}>
      {imgSrc?<img
        src={imgSrc}
        alt={r.marketing_title}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setImgSrc("")}
        className={`h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
          loaded ? "opacity-100" : "opacity-90"
        }`}
      />
      :<span className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-white/70">{t.propertyCard.photoNotSupplied}</span>}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
    </div>
  );
}

export function PropertyCard({ r }: { r: PropertyRecord }) {
  const waLink = useWhatsAppLink();
  const p = priceDisplay(r.price);
  const media = getPropertyMedia(r);
  const [currency] = useCurrency();
  const { isSaved, toggle } = useShortlist();
  const { t, isRtl } = useLanguage();
  const saved = isSaved(r.slug);
  const usdVal = comparableUsd(r.price);
  const displayPrice = currency === "USD" || usdVal === null ? (p.main === "Price on request" ? t.common.priceOnRequest : p.main) : convertUsdPrice(usdVal, currency);
  const isCbiEligible = r.details["cbi_verified"] === true;

  const sideLabel =
    r.side === "Europe"
      ? t.common.sideEurope
      : r.side === "Asia"
        ? t.common.sideAsia
        : t.common.sideUnknown;

  const typeLabel =
    r.record_type === "unit_offer"
      ? t.common.unitOffer
      : r.record_type === "unit_type"
        ? t.common.unitType
        : r.record_type === "package"
          ? t.common.multiApartmentPackage
          : r.record_type === "project"
            ? t.common.projectIntroduction
            : t.common.offerToConfirm;

  return (
    <div className="h-full">
      <article className="group relative flex h-full flex-col overflow-hidden border border-border bg-card card-elevate">
        {/* Photograph */}
        <div className="relative aspect-[4/3] overflow-hidden bg-night img-zoom-container">
          <Link to="/properties/$slug" params={{ slug: r.slug }} className="block h-full w-full" tabIndex={-1} aria-label={r.marketing_title}>
            <ImageFallback r={r} />
          </Link>

          <div className="pointer-events-none absolute start-3 top-3 z-10 flex max-w-[calc(100%-5rem)] flex-wrap gap-1.5">
            {r.layout_label && (
              <span className="max-w-full truncate bg-night/90 px-2.5 py-1 text-[0.68rem] font-semibold tracking-wider text-white">{r.layout_label}</span>
            )}
            {isCbiEligible && (
              <span className="bg-brass px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-night">{t.propertyCard.cbiVerified}</span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(r.slug);
            }}
            aria-label={saved ? "Remove from saved shortlist" : "Save to shortlist"}
            aria-pressed={saved}
            className={`absolute end-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
              saved ? "bg-destructive text-white" : "bg-white/90 text-night hover:bg-white"
            }`}
          >
            <Heart className={`h-4 w-4 ${saved ? "fill-white" : ""}`} />
          </button>

          <p className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex items-center gap-1.5 text-[0.72rem] font-medium text-white">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-brass-light" />
            <span className="truncate">
              {r.location_label ?? r.city}
              {showsSide(r.city, r.side) ? ` · ${sideLabel}` : ""}
            </span>
          </p>
        </div>

        {/* Details */}
        <div className="property-card-body flex flex-1 flex-col p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="kicker !text-[0.62rem] text-brass-text">{typeLabel}</span>
            <span className="truncate text-[0.62rem] font-medium uppercase tracking-wider text-muted-foreground">Ref {r.ref || r.slug}</span>
          </div>

          <h3 className="font-display text-[1.45rem] font-medium leading-[1.15] text-foreground">
            <Link to="/properties/$slug" params={{ slug: r.slug }} className="after:absolute after:inset-0 after:content-[''] hover:underline">
              {r.marketing_title}
            </Link>
          </h3>

          {(r.areas.length > 0 || media.tags.length > 0) && (
            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
              {[r.areas.length > 0 ? areaText(r) : "", ...media.tags.slice(0, 1)].filter(Boolean).join(" · ")}
            </p>
          )}

          <div className="property-card-price mt-auto flex items-end justify-between gap-3 border-t border-border pt-4">
            <div>
              <p className="kicker !text-[0.6rem] text-muted-foreground">{r.mode === "rent" ? t.propertyCard.forRent : t.propertyCard.forSale}</p>
              <p className="font-display mt-1 text-[1.7rem] font-medium leading-none text-foreground">{displayPrice}</p>
              {currency !== "USD" && usdVal && <p className="mt-1 text-[0.68rem] font-medium text-muted-foreground">USD ${usdVal.toLocaleString("en-US")}</p>}
            </div>

            <div className="property-card-actions relative z-20 flex items-center gap-2">
              <a
                href={waLink(`Hello Avrasya, I would like to inquire about: ${r.marketing_title} (${r.slug})`)}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 w-11 items-center justify-center border border-border bg-card transition-colors hover:border-brass hover:text-brass"
                title={t.propertyCard.inquireWhatsApp}
                aria-label={t.propertyCard.inquireWhatsApp}
              >
                <MessageSquare className="h-4 w-4" />
              </a>
              <Link to="/properties/$slug" params={{ slug: r.slug }} className="btn btn-outline shrink-0 gap-1.5 !px-3.5 !text-[0.72rem]">
                <span>{t.propertyCard.viewDetails}</span> <ArrowRight className="arrow h-3 w-3 rtl-flip" />
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}