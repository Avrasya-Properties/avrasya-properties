import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BUDGETS, LAYOUTS, LOCATIONS, TYPE_LABEL, filterProperties, properties, unmatchablePrices, type Filters } from "@/data/properties";
import { PageIntro } from "@/components/site/Chrome";
import { PropertyCard } from "@/components/site/PropertyCard";
import { meta } from "@/components/site/TextPage";

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

export const Route = createFileRoute("/properties/")({
  validateSearch: (s: Record<string, unknown>): Filters => ({ q: str(s["q"]), loc: str(s["loc"]), side: str(s["side"]), layout: str(s["layout"]), type: str(s["type"]), budget: str(s["budget"]), sort: str(s["sort"]) }),
  head: () => meta("Offers & projects in Istanbul", "Browse 18 source-backed Istanbul offers, packages and project introductions. Prices and availability subject to confirmation."),
  component: Catalog,
});

function Catalog() {
  const f = Route.useSearch();
  const navigate = useNavigate({ from: "/properties/" });
  const list = filterProperties(f);
  const set = (k: keyof Filters, v: string) => navigate({ search: (p) => ({ ...p, [k]: v || undefined }), replace: true, resetScroll: false });
  const active = Object.entries(f).filter(([k, v]) => v && k !== "sort");
  const lbl = "eyebrow !text-muted-foreground !text-[0.65rem] mb-1.5 block";
  const sel = (k: keyof Filters, label: string, any: string, opts: [string, string][]) => (
    <label className="block">
      <span className={lbl}>{label}</span>
      <select className="field" value={f[k] ?? ""} onChange={(e) => set(k, e.target.value)}>
        <option value="">{any}</option>
        {opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </label>
  );

  return (
    <>
      <PageIntro eyebrow="A considered selection" title={<>Offers & projects in <em>Türkiye.</em></>}
        aside={<p className="text-xs uppercase tracking-wider text-muted-foreground">01 / Inventory · Istanbul · {properties.length} offers and projects</p>}>
        <p>Source-advertised Istanbul opportunities, with project-supplied details clearly identified. Availability and terms are subject to confirmation.</p>
      </PageIntro>
      <section className="container-site py-8">
        <div className="border bg-card p-5">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-[1.6fr_repeat(5,1fr)]">
            <label className="block">
              <span className={lbl}>Search title or area</span>
              <input className="field" type="search" placeholder="e.g. Şişli, Oryapark, duplex" defaultValue={f.q ?? ""} onChange={(e) => set("q", e.target.value)} />
            </label>
            {sel("loc", "District / area", "All locations", LOCATIONS.map((l) => [l, l]))}
            {sel("side", "Side", "Both sides", [["Europe", "European side"], ["Asia", "Asian side"]])}
            {sel("layout", "Layout", "All layouts", LAYOUTS.map((l) => [l, l]))}
            {sel("type", "Record type", "All types", Object.entries(TYPE_LABEL))}
            {sel("budget", "Budget (USD)", "Any budget", BUDGETS.map((b) => [b.id, b.label]))}
          </div>
          <div className="mt-4 flex flex-col gap-3 border-t pt-4 text-xs md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Applied filters:</span>
              {active.length ? active.map(([k, v]) => (
                <button key={k} className="rounded-sm border bg-secondary px-2 py-1" onClick={() => set(k as keyof Filters, "")} aria-label={`Remove ${k} filter`}>{k === "budget" ? BUDGETS.find((b) => b.id === v)?.label : k === "type" ? TYPE_LABEL[v as keyof typeof TYPE_LABEL] : v} ×</button>
              )) : <span>None</span>}
              {active.length > 0 && <Link to="/properties" search={{}} className="text-brass-text underline">Clear all filters</Link>}
            </div>
            <div className="flex items-center gap-4">
              <span aria-live="polite"><strong>{list.length}</strong> of {properties.length} offers and projects</span>
              <label className="flex items-center gap-2">Sort by
                <select className="field !min-h-9 !w-auto" value={f.sort ?? ""} onChange={(e) => set("sort", e.target.value)}>
                  <option value="">Featured order</option>
                  <option value="price-asc">USD price: low to high</option>
                  <option value="price-desc">USD price: high to low</option>
                </select>
              </label>
            </div>
          </div>
          {(f.budget || f.sort) && (
            <p className="mt-3 text-xs text-muted-foreground">
              {f.budget ? "Budget matching" : "Price sorting"} uses USD amounts only. {unmatchablePrices().length} records with TRY schedules, unresolved offers or prices on request are {f.budget ? "excluded" : "listed last"}.
              {f.budget && <> <button className="underline" onClick={() => set("budget", "")}>View them without a budget filter</button>.</>}
              {" "}Package prices are totals for several apartments.
            </p>
          )}
        </div>

        {list.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list.map((r) => <PropertyCard key={r.slug} r={r} />)}</div>
        ) : (
          <div className="mt-10 border bg-card p-12 text-center">
            <h2 className="headline">No offers match these filters.</h2>
            <p className="mt-3 text-muted-foreground">Try widening your search, or tell us what you're looking for.</p>
            <div className="mt-6 flex justify-center gap-3"><Link to="/properties" search={{}} className="btn btn-outline">Clear all filters</Link><Link to="/contact" className="btn btn-primary">Describe your brief</Link></div>
          </div>
        )}

        <p className="mt-12 border bg-card p-5 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Inventory notes:</strong> Records come from project-supplied marketing material and are not independently verified live inventory. Prices, availability, specifications and investment or citizenship eligibility must be confirmed before purchase. Gross, net and unspecified area bases are shown as supplied.
        </p>
      </section>
    </>
  );
}
