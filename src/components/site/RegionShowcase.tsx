import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { getPropertyMedia, type PropertyRecord } from "@/data/properties";
import { regionForCity, type Region } from "@/data/regions";
import { useTranslation } from "@/hooks/useLanguage";

/**
 * "Where we work": an editorial index of the regions staff publish in Settings. Each row is a real link to
 * the region page; on wide screens a sticky preview panel follows hover/focus. Renders nothing for fewer
 * than two regions (a single-region site keeps its district explorer instead).
 */
export function RegionShowcase({ regions, properties }: { regions: Region[]; properties: PropertyRecord[] }) {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  if (regions.length < 2) return null;

  const rows = regions.map((region) => {
    const listings = properties.filter((p) => regionForCity(p.city, [region]));
    const cover = region.heroImage || (listings[0] ? getPropertyMedia(listings[0]).cover : "") || "";
    return { region, count: listings.length, cover };
  });
  const current = rows[Math.min(active, rows.length - 1)]!;

  return (
    <section data-regions className="relative border-y border-border/80 bg-background py-16 md:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
        <div>
          <p className="kicker text-brass-text">{t.home.regionsEyebrow}</p>
          <h2 className="headline mt-3 max-w-xl">{t.home.regionsTitle}</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{t.home.regionsSubtitle}</p>

          <ul className="mt-10 border-t border-border">
            {rows.map(({ region, count }, i) => (
              <li key={region.slug} className="border-b border-border">
                <Link
                  to="/regions/$slug"
                  params={{ slug: region.slug }}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="group grid min-h-[5.5rem] grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 py-5 transition-colors hover:bg-secondary/60 md:grid-cols-[3rem_minmax(0,1fr)_auto] md:gap-5"
                >
                  <span className="kicker text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="numeral block truncate text-[2.1rem] transition-colors group-hover:text-brass md:text-5xl">{region.name}</span>
                    <span className="mt-1.5 block truncate text-xs text-muted-foreground">
                      {region.country}
                      {region.districts.length ? ` · ${region.districts.slice(0, 3).join(", ")}` : ""}
                      {` · ${count} ${t.properties.regionListingsLabel}`}
                    </span>
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border transition-colors group-hover:border-brass group-hover:bg-brass group-hover:text-night" aria-hidden="true">
                    <ArrowUpRight className="h-4 w-4 rtl-flip" />
                  </span>
                  <span className="sr-only">{t.home.regionsOpen}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative hidden lg:block" aria-hidden="true">
          <div className="sticky top-28 aspect-[4/5] overflow-hidden bg-night">
            {rows.map(({ region, cover }, i) =>
              cover ? (
                <img
                  key={region.slug}
                  src={cover}
                  alt=""
                  loading="lazy"
                  className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${i === active ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}
                />
              ) : null,
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(7,25,30,0.9)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-on-dark">
              <p className="kicker text-brass-light">{current.region.country}</p>
              <p className="numeral mt-2 text-5xl">{current.region.name}</p>
              {current.region.summary && <p className="mt-3 line-clamp-3 max-w-sm text-sm leading-relaxed text-on-dark-muted">{current.region.summary}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}