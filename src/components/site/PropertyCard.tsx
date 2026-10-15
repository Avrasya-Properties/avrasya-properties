import { useWhatsAppLink } from "@/hooks/useLiveContact";
import { useState,useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, MapPin, MessageSquare, ArrowRight } from "lucide-react";
import { Tilt } from "./Motion";
import {
  areaText,
  comparableUsd,
  convertUsdPrice,
  getPropertyMedia,
  locationText,
  priceDisplay,
  type PropertyRecord,
} from "@/data/properties";
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
    <Tilt className="h-full">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-xs border border-border/80 bg-card card-elevate">
        {/* Card Image Banner */}
        <div className="relative aspect-[16/11] overflow-hidden bg-[#0C1E23] img-zoom-container">
          <Link
            to="/properties/$slug"
            params={{ slug: r.slug }}
            className="block h-full w-full"
            tabIndex={-1}
            aria-label={r.marketing_title}
          >
            <ImageFallback r={r} />
          </Link>

          {/* Top Badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 z-10 pointer-events-none rtl:left-auto rtl:right-3">
            {r.layout_label && (
              <span className="glass-pill-dark rounded-xs px-2.5 py-0.5 text-[0.68rem] font-semibold tracking-wider text-white">
                {r.layout_label}
              </span>
            )}
            {isCbiEligible && (
              <span className="flex items-center gap-1 rounded-xs bg-brass/95 backdrop-blur-xs px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-primary shadow-xs">
                {t.propertyCard.cbiVerified}
              </span>
            )}
          </div>

          <div className="absolute right-3 top-3 flex items-center gap-1.5 z-10 rtl:right-auto rtl:left-3">
            {/* Heart Favorite Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle(r.slug);
              }}
              aria-label={saved ? "Remove from saved shortlist" : "Save to shortlist"}
              className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 active:scale-90 ${
                saved
                  ? "bg-destructive text-white shadow-md scale-105"
                  : "bg-black/45 text-white/90 hover:bg-black/65 hover:scale-110"
              }`}
            >
              <Heart className={`h-4 w-4 transition-transform duration-300 ${saved ? "fill-white" : ""}`} />
            </button>
          </div>

          {/* Bottom Bar on Image */}
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-[0.7rem] text-white/95 z-10 pointer-events-none">
            <span className="flex items-center gap-1.5 glass-pill-dark px-2.5 py-1 rounded-xs">
              <MapPin className="h-3 w-3 text-brass" /> {r.location_label ?? "Istanbul"}
            </span>
            <span className="glass-pill-dark px-2.5 py-1 rounded-xs font-medium">
              {sideLabel}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="property-card-body flex flex-1 flex-col p-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="eyebrow !text-brass-text text-[0.65rem]">
              {typeLabel}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Ref: {r.ref || r.slug}
            </span>
          </div>

          <h3 className="font-display text-lg font-medium leading-snug text-foreground transition-colors duration-300 group-hover:text-brass">
            <Link to="/properties/$slug" params={{ slug: r.slug }} className="hover:underline">
              {r.marketing_title}
            </Link>
          </h3>

          {/* Property Tag Pills & Verification Stamp */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {r.areas.length > 0 && (
              <span className="rounded-xs border border-border/80 bg-secondary/50 px-2 py-0.5 text-[0.65rem] font-medium text-foreground">
                {areaText(r)}
              </span>
            )}
            {media.tags.slice(0, 1).map((tag) => (
              <span
                key={tag}
                className="rounded-xs border border-border/80 bg-secondary/40 px-2 py-0.5 text-[0.65rem] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Pricing & CTA Footer */}
          <div className="property-card-price mt-auto pt-4 border-t border-border/60 flex items-end justify-between gap-3 mt-4">
            <div>
              <p className="eyebrow !text-muted-foreground !text-[0.6rem]">{r.mode === "rent" ? t.propertyCard.forRent : t.propertyCard.forSale}</p>
              <p className="text-xl font-sans font-semibold text-foreground tracking-tight tabular-nums">
                {displayPrice}
              </p>
              {currency !== "USD" && usdVal && (
                <p className="text-[0.68rem] text-muted-foreground font-medium">
                  USD ${usdVal.toLocaleString("en-US")}
                </p>
              )}
            </div>

            <div className="property-card-actions flex items-center gap-1.5">
              <a
                href={waLink(
                  `Hello Avrasya, I would like to inquire about: ${r.marketing_title} (${r.slug})`,
                )}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xs border border-border/80 bg-card hover:border-brass hover:text-brass hover:scale-105 transition-all duration-300"
                title={t.propertyCard.inquireWhatsApp}
              >
                <MessageSquare className="h-4 w-4" />
              </a>
              <Link
                to="/properties/$slug"
                params={{ slug: r.slug }}
                className="btn btn-outline hover:border-brass hover:bg-primary hover:text-on-dark !min-h-9 !px-3.5 !text-[0.72rem] gap-1.5 shrink-0 transition-all duration-300"
              >
                <span>{t.propertyCard.viewDetails}</span> <ArrowRight className="h-3 w-3 arrow rtl-flip" />
              </Link>
            </div>
          </div>
        </div>
      </article>
    </Tilt>
  );
}
