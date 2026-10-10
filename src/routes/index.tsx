import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BUDGETS, LAYOUTS, LOCATIONS, areaText, getProperty, locationText, priceDisplay, properties, type PropertyRecord } from "@/data/properties";
import { CtaBand, Logo } from "@/components/site/Chrome";
import { Marquee, Tilt } from "@/components/site/Motion";
import { PropertyCard } from "@/components/site/PropertyCard";
import { meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/")({
  head: () => meta("Istanbul property advisory for international buyers", "Explore 18 source-backed Istanbul offers and projects with an Istanbul-based advisory team guiding search, verification and ownership."),
  component: Home,
});

const FEATURED = ["sisli-block5-floor2-unit21-497", "atasehir-173-1-1-420", "sisli-ferikoy-duplex-490"].map((s) => getProperty(s)!) as PropertyRecord[];
const EDITORIAL = ["pearl-topkapi-2-1-410", "rams-park-house-maslak-1-1xs", "oryapark-1-1-325"].map((s) => getProperty(s)!) as PropertyRecord[];

function Preloader() {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    try { sessionStorage.setItem("avr-pre", "1"); } catch { /* storage unavailable */ }
    const t = setTimeout(() => setGone(true), 1800);
    return () => clearTimeout(t);
  }, []);
  if (gone) return null;
  return (
    <div id="avr-pre" className="pl-curtain blueprint fixed inset-0 z-[70] flex flex-col items-center justify-center gap-6 bg-background" aria-hidden>
      <script dangerouslySetInnerHTML={{ __html: `try{if(sessionStorage.getItem('avr-pre'))document.getElementById('avr-pre').style.display='none'}catch(e){}` }} />
      <div className="pl-logo"><Logo className="h-20 md:h-28" /></div>
      <div className="h-px w-56 bg-border"><div className="pl-bar h-px w-full bg-brass" /></div>
      <p className="pl-text eyebrow">Istanbul · Türkiye</p>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-primary" />
    </div>
  );
}

function Home() {
  const [sel, setSel] = useState(0);
  const f = FEATURED[sel]!;
  const fp = priceDisplay(f.price);
  const navigate = useNavigate();
  const [search, setSearch] = useState({ loc: "", layout: "", budget: "" });

  return (
    <>
      <Preloader />
      <section className="container-site pt-10 md:pt-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow eyebrow-mark">International consultancy · Istanbul</p>
            <h1 className="display-hero mt-4">
              <span className="split-line"><span style={{ ["--d" as string]: "200ms" }}>An Istanbul address.</span></span>
              <span className="split-line"><em style={{ ["--d" as string]: "340ms" }} className="inline-block animate-none"><span className="inline-block" style={{ animation: "lineUp 1000ms cubic-bezier(.2,.8,.2,1) 340ms both" }}>A considered choice.</span></em></span>
            </h1>
          </div>
          <p data-reveal style={{ ["--d" as string]: "400ms" }} className="max-w-sm text-muted-foreground md:text-right">
            Avrasya Properties helps international buyers explore property opportunities in Türkiye, with an Istanbul-based point of contact from the initial brief through purchase coordination and ownership planning.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <Tilt max={3}><div className="border bg-card">
            <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
              <div data-parallax="0.12" className="blueprint absolute -inset-16" />
              <div key={f.slug} className="hero-zoom fade-swap relative flex h-full items-center justify-around gap-6 px-8">
                <div className="tower-scene hidden sm:block"><div className="tower"><i /><i /><i /><i /><i /></div></div>
                <div className="lift max-w-xs">
                  <p className="eyebrow !text-brass">Source project material</p>
                  <p className="mt-2 font-display text-3xl leading-tight md:text-4xl">{f.details.project ?? f.location_label}</p>
                  <p className="mt-3 text-xs text-muted-foreground">Original flyer available on request</p>
                </div>
              </div>
              <span className="absolute left-4 top-4 rounded-sm bg-primary px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-primary-foreground">Selected · {f.location_label}</span>
            </div>
            <div key={f.slug + "f"} className="fade-swap grid grid-cols-2 gap-4 p-5 text-sm md:grid-cols-[2fr_1fr_1.4fr_1fr_auto] md:items-end">
              <div><p className="eyebrow !text-muted-foreground !text-[0.6rem]">Selected offer</p><p className="truncate">{f.marketing_title}</p></div>
              <div><p className="eyebrow !text-muted-foreground !text-[0.6rem]">District</p><p>{locationText(f)}</p></div>
              <div><p className="eyebrow !text-muted-foreground !text-[0.6rem]">Layout · Area</p><p>{f.layout_label} · {areaText(f)}</p></div>
              <div><p className="eyebrow !text-muted-foreground !text-[0.6rem]">Indicative price</p><p className="font-semibold">{fp.main}</p></div>
              <Link to="/properties/$slug" params={{ slug: f.slug }} className="group col-span-2 text-sm underline-offset-4 hover:underline md:col-span-1">View details <span className="arrow">→</span></Link>
            </div>
          </div></Tilt>
          <div>
            <div className="flex justify-between border-b pb-2 text-[0.65rem] uppercase tracking-wider text-muted-foreground"><span>Featured (03)</span><span>Select to inspect</span></div>
            <div className="mt-3 space-y-3" role="tablist" aria-label="Featured offers">
              {FEATURED.map((r, i) => (
                <button key={r.slug} role="tab" data-reveal style={{ ["--d" as string]: `${300 + i * 120}ms` }} aria-selected={i === sel} onClick={() => setSel(i)}
                  className={`block w-full border bg-card p-4 text-left transition-all duration-300 hover:-translate-x-1 hover:shadow-lg ${i === sel ? "border-l-4 border-l-brass" : "hover:border-brass"}`}>
                  <span className="text-xs text-brass-text">0{i + 1}</span>
                  <span className="mt-1 block text-sm font-medium">{r.marketing_title}</span>
                  <span className="block text-xs text-muted-foreground">{r.location_label} · {r.layout_label}</span>
                  <span className="mt-2 flex justify-between text-xs"><span>{priceDisplay(r.price).main}</span><span className="text-muted-foreground">{i === sel ? "Selected" : "Inspect →"}</span></span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <form data-reveal className="mt-8 grid gap-4 border bg-card p-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
          onSubmit={(e) => { e.preventDefault(); navigate({ to: "/properties", search: { loc: search.loc || undefined, layout: search.layout || undefined, budget: search.budget || undefined } }); }}>
          {([["loc", "Location / district", "All locations", LOCATIONS.map((l) => [l, l])], ["layout", "Layout", "All layouts", LAYOUTS.map((l) => [l, l])], ["budget", "Indicative budget (USD)", "Any budget", BUDGETS.map((b) => [b.id, b.label])]] as const).map(([k, l, any, opts]) => (
            <label key={k} className="block">
              <span className="eyebrow !text-muted-foreground !text-[0.65rem] mb-1.5 block">{l}</span>
              <select className="field" value={search[k]} onChange={(e) => setSearch({ ...search, [k]: e.target.value })}>
                <option value="">{any}</option>
                {opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
              </select>
            </label>
          ))}
          <button className="btn btn-primary">Search offers ({properties.length})</button>
        </form>
      </section>

      <Marquee items={["Şişli", "Beşiktaş", "Maslak", "Ataşehir", "Ümraniye", "Feriköy", "Topkapı", "Ataköy", "Güneşli"]} />
      <section className="container-site py-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><p className="eyebrow eyebrow-mark">Selected offers</p><h2 className="headline mt-3">Editorial portfolio selection</h2></div>
          <p className="max-w-md text-sm text-muted-foreground">Source-advertised offers from central and Asian-side Istanbul. Prices and availability are confirmed with each project before any commitment.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">{EDITORIAL.map((r) => <PropertyCard key={r.slug} r={r} />)}</div>
        <Link to="/properties" className="group mt-8 inline-block text-sm font-medium">View all {properties.length} offers and projects <span className="arrow">→</span></Link>
      </section>

      <section className="border-y bg-card">
        <div className="container-site py-20">
          <div className="flex items-end justify-between"><div><p className="eyebrow eyebrow-mark">Process framework</p><h2 className="headline mt-3">The advisory directory</h2></div>
            <Link to="/services" className="group hidden text-xs font-semibold uppercase tracking-wider md:block">View all 10 services <span className="arrow">→</span></Link></div>
          <div data-reveal className="mt-10 divide-y border">
            {[
              ["01", "Plan", "Pre-acquisition assessment and shortlist", [["Investment Advisory", "Goals, budget and risk discussion before any shortlist."], ["Property Selection", "Area comparisons, project claims and realistic timelines."], ["Citizenship Consultancy", "Questions prepared for qualified, current legal review."]]],
              ["02", "Purchase", "Verification, contracting and closing", [["Legal & Administrative Coordination", "Tax number, bank, translation and independent title checks."], ["Property Acquisition", "Payment and title-transfer coordination."], ["Residence Permit Support", "Document preparation and appointment coordination."]]],
              ["03", "Own", "Ongoing ownership support", [["Property Management", "Handover, utilities and maintenance arrangements."], ["Rental Strategy", "Tenancy positioning with local partners."], ["Resale Strategy", "Holding-period and exit planning discussions."]]],
            ].map(([n, h, s, items]) => (
              <div key={n as string} className="group grid gap-6 p-6 transition-colors duration-300 hover:bg-secondary md:grid-cols-4">
                <div><p className="eyebrow">Phase {n as string}</p><p className="mt-1 font-display text-2xl transition-transform duration-300 group-hover:translate-x-2">{h as string}</p><p className="mt-1 text-xs text-muted-foreground">{s as string}</p></div>
                {(items as string[][]).map(([t, d]) => <div key={t}><p className="text-sm font-semibold">{t}</p><p className="mt-1 text-sm text-muted-foreground">{d}</p></div>)}
              </div>
            ))}
            <div className="flex justify-between bg-background px-6 py-3 text-xs"><span>◆ International Investor Support — across all three phases</span><Link to="/services" className="underline">Explore full service catalogue</Link></div>
          </div>
        </div>
      </section>

      <section className="container-site py-16">
        <div data-reveal="mask" className="relative flex flex-col gap-6 overflow-hidden bg-primary p-8 text-on-dark md:flex-row md:items-center md:justify-between md:p-12">
          <div className="max-w-2xl">
            <p className="eyebrow !text-brass">Official rules apply · Guidance is not eligibility</p>
            <h2 className="headline mt-3">Turkish citizenship through property: <em>clarity before commitment.</em></h2>
            <p className="mt-4 text-on-dark-muted">Thresholds and holding conditions are set by Turkish authorities and change over time. Every case needs current, independent legal review; approval rests entirely with government authorities.</p>
          </div>
          <div aria-hidden data-parallax="0.2" className="outline-word pointer-events-none absolute -bottom-10 right-0 select-none text-[10rem] outline-light">Türkiye</div>
          <Link to="/citizenship" className="btn btn-light relative shrink-0">Read citizenship guide</Link>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
