import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin } from "lucide-react";
import {
  areaText,
  comparableUsd,
  convertUsdPrice,
  getPropertyMedia,
  locationText,
  priceDisplay,
  TYPE_LABEL,
  type PropertyRecord,
} from "@/data/properties";
import { useCurrency } from "@/hooks/usePreferences";
import { PLACEHOLDER_IMAGES, resolvePlaceholderSrc } from "@/data/placeholders";

/** Compact horizontal row used by the catalogue's List view. */
export function PropertyListRow({ r }: { r: PropertyRecord }) {
  const [currency] = useCurrency();
  const media = getPropertyMedia(r);
  const usd = comparableUsd(r.price);
  const price = priceDisplay(r.price);
  const shown = currency !== "USD" && usd != null ? convertUsdPrice(usd, currency) : price.main;
  const src = media.cover?.trim()
    ? media.cover
    : resolvePlaceholderSrc(PLACEHOLDER_IMAGES.aboutArcGallery[0]!);

  return (
    <Link
      to="/properties/$slug"
      params={{ slug: r.slug }}
      data-testid="property-list-row"
      className="group flex flex-col overflow-hidden rounded-[8px] border border-[#DEE0DD] bg-white no-underline transition-shadow duration-300 hover:shadow-lg sm:flex-row"
    >
      <div className="aspect-[16/10] w-full shrink-0 overflow-hidden bg-[#F7F6F2] sm:aspect-auto sm:h-[170px] sm:w-[260px]">
        <img
          src={src}
          alt={r.marketing_title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C5A059]">
            {TYPE_LABEL[r.record_type]}
          </p>
          <h3 className="mt-1 line-clamp-2 text-[20px] font-normal tracking-[-0.02em] text-[#163038]">
            {r.marketing_title}
          </h3>
          <p className="mt-1 inline-flex items-center gap-1 text-[13px] text-[#5C6F73]">
            <MapPin className="h-3.5 w-3.5" /> {locationText(r)}
            {areaText(r) ? ` · ${areaText(r)}` : ""}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[17px] font-medium text-[#163038]">{shown}</span>
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#163038]">
            View <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
