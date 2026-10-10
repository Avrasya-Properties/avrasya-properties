import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, MapPin, MessageSquare, ArrowRight, ShieldCheck } from "lucide-react";
import { Tilt } from "./Motion";
import {
  areaText,
  comparableUsd,
  convertUsdPrice,
  getPropertyMedia,
  locationText,
  priceDisplay,
  sideText,
  waLink,
  TYPE_LABEL,
  type PropertyRecord,
} from "@/data/properties";
import { useCurrency, useShortlist } from "@/hooks/usePreferences";

export function ImageFallback({ r, className = "" }: { r: PropertyRecord; className?: string }) {
  const media = getPropertyMedia(r);
  const [imgSrc, setImgSrc] = useState(media.cover);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[#0C1E23] ${className}`}>
      <img
        src={imgSrc}
        alt={r.marketing_title}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setImgSrc("/images/properties/hero-main.jpg")}
        className={`h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
          loaded ? "opacity-100" : "opacity-90"
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
    </div>
  );
}

export function PropertyCard({ r }: { r: PropertyRecord }) {
  const p = priceDisplay(r.price);
  const media = getPropertyMedia(r);
  const [currency] = useCurrency();
  const { isSaved, toggle } = useShortlist();
  const saved = isSaved(r.slug);
  const usdVal = comparableUsd(r.price);
  const displayPrice = currency === "USD" ? p.main : convertUsdPrice(usdVal, currency);
  const isCbiEligible = (usdVal ?? 0) >= 400000;

  return (
    <Tilt className="h-full">
      <article
        className="group relative flex h-full flex-col overflow-hidden rounded-xs border border-border/70 bg-card transition-all duration-300 hover:border-brass/70 hover:shadow-xl"
      >
        {/* Card Image Banner */}
        <div className="relative aspect-[16/11] overflow-hidden bg-[#0C1E23]">
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
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
            {r.layout_label && (
              <span className="rounded-xs bg-primary/90 backdrop-blur-xs px-2 py-0.5 text-[0.68rem] font-semibold tracking-wider text-primary-foreground shadow-xs">
                {r.layout_label}
              </span>
            )}
            {isCbiEligible && (
              <span className="flex items-center gap-1 rounded-xs bg-brass px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-primary shadow-xs">
                CBI $400k
              </span>
            )}
          </div>

          <div className="absolute right-3 top-3 flex items-center gap-1.5 z-10">
            {/* Heart Favorite Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle(r.slug);
              }}
              aria-label={saved ? "Remove from saved shortlist" : "Save to shortlist"}
              className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all ${
                saved
                  ? "bg-destructive text-white shadow-md scale-105"
                  : "bg-black/40 text-white/90 hover:bg-black/60 hover:scale-110"
              }`}
            >
              <Heart className={`h-4 w-4 ${saved ? "fill-white" : ""}`} />
            </button>
          </div>

          {/* Bottom Bar on Image */}
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-[0.7rem] text-white/90 z-10 pointer-events-none">
            <span className="flex items-center gap-1 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-xs">
              <MapPin className="h-3 w-3 text-brass" /> {r.location_label ?? "Istanbul"}
            </span>
            <span className="bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-xs font-medium">
              {sideText(r)}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="eyebrow !text-brass-text text-[0.65rem]">{TYPE_LABEL[r.record_type]}</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Ref: {r.slug.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <h3 className="font-display text-lg font-medium leading-snug text-foreground transition-colors group-hover:text-brass">
            <Link to="/properties/$slug" params={{ slug: r.slug }} className="hover:underline">
              {r.marketing_title}
            </Link>
          </h3>

          {/* Property Tag Pills & Verification Stamp */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-xs bg-primary/8 px-1.5 py-0.5 text-[0.62rem] font-medium text-foreground/80">
              <ShieldCheck className="h-3 w-3 text-brass" />
              <span>Verified Title</span>
            </span>
            {r.areas.length > 0 && (
              <span className="rounded-xs border border-border/70 bg-card px-1.5 py-0.5 text-[0.65rem] font-medium text-foreground">
                {areaText(r)}
              </span>
            )}
            {media.tags.slice(0, 1).map((t) => (
              <span
                key={t}
                className="rounded-xs border border-border/80 bg-secondary/60 px-1.5 py-0.5 text-[0.65rem] text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Pricing & CTA Footer */}
          <div className="mt-auto pt-4 border-t border-border/60 flex items-end justify-between gap-3 mt-4">
            <div>
              <p className="eyebrow !text-muted-foreground !text-[0.6rem]">Indicative Valuation</p>
              <p className="text-xl font-sans font-semibold text-foreground tracking-tight tabular-nums">
                {displayPrice}
              </p>
              {currency !== "USD" && usdVal && (
                <p className="text-[0.68rem] text-muted-foreground font-medium">USD ${usdVal.toLocaleString("en-US")}</p>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <a
                href={waLink(`Hello Avrasya, I would like to inquire about: ${r.marketing_title} (${r.slug})`)}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xs border border-border hover:border-brass hover:text-brass transition-colors"
                title="Enquire on WhatsApp"
              >
                <MessageSquare className="h-4 w-4" />
              </a>
              <Link
                to="/properties/$slug"
                params={{ slug: r.slug }}
                className="btn btn-outline !min-h-9 !px-3 !text-[0.72rem] gap-1 shrink-0"
              >
                <span>Details</span> <ArrowRight className="h-3 w-3 arrow" />
              </Link>
            </div>
          </div>
        </div>
      </article>
    </Tilt>
  );
}

