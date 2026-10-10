import { Link } from "@tanstack/react-router";
import { Tilt } from "./Motion";
import { areaText, locationText, priceDisplay, TYPE_LABEL, type PropertyRecord } from "@/data/properties";

/** Dignified stand-in: original source flyers are held on file and not yet packaged for the web. */
export function ImageFallback({ r, className = "" }: { r: PropertyRecord; className?: string }) {
  return (
    <div className={`img-hover flex h-full w-full flex-col items-center justify-center gap-2 bg-secondary p-6 text-center ${className}`}>
      <span className="eyebrow !text-brass">Source project material</span>
      <span className="font-display text-lg text-ink">{(r.details["project"] as string) ?? r.location_label ?? "Istanbul"}</span>
      <span className="border border-border px-2 py-0.5 text-[0.7rem] text-muted-foreground">Original flyer available on request</span>
    </div>
  );
}

export function PropertyCard({ r }: { r: PropertyRecord }) {
  const p = priceDisplay(r.price);
  return (
    <Tilt className="h-full"><article data-reveal className="group flex h-full flex-col border bg-card">
      <Link to="/properties/$slug" params={{ slug: r.slug }} className="relative block aspect-[4/3] overflow-hidden" tabIndex={-1} aria-hidden>
        <ImageFallback r={r} />
        {r.layout_label && r.layout_label.length < 14 && (
          <span className="absolute left-3 top-3 rounded-sm bg-primary px-1.5 py-0.5 text-[0.68rem] font-semibold text-primary-foreground">{r.layout_label}</span>
        )}
        <span className="absolute right-3 top-3 rounded-sm border bg-card px-1.5 py-0.5 text-[0.68rem]">{TYPE_LABEL[r.record_type]}</span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-muted-foreground"><span className="text-brass">◆</span> {locationText(r)}</p>
        <h3 className="mt-2 font-sans text-lg font-medium leading-snug">
          <Link to="/properties/$slug" params={{ slug: r.slug }} className="link-u">{r.marketing_title}</Link>
        </h3>
        <p className={`mt-1 text-xs ${r.areas.length ? "text-muted-foreground" : "text-warn"}`}>{areaText(r)}</p>
        <div className="mt-auto flex items-end justify-between gap-3 border-t pt-4 mt-5">
          <div>
            <p className="eyebrow !text-muted-foreground !text-[0.62rem]">Indicative price</p>
            <p className="text-lg font-semibold">{p.main}</p>
            <p className="text-[0.7rem] text-muted-foreground">{p.note}</p>
          </div>
          <Link to="/properties/$slug" params={{ slug: r.slug }} className="btn btn-outline !px-3 !text-[0.7rem] shrink-0">
            View <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    </article></Tilt>
  );
}
