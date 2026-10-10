import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CONTACT, TYPE_LABEL, areaText, getProperty, humanKey, legacyRecords, locationText, priceDisplay, properties, sideText, waLink, type PropertyRecord } from "@/data/properties";
import { ImageFallback, PropertyCard } from "@/components/site/PropertyCard";
import { Enquiry } from "@/components/site/Enquiry";

export const Route = createFileRoute("/properties/$slug")({
  loader: ({ params }) => {
    const r = getProperty(params.slug);
    if (r) return { record: r, legacy: false };
    if (legacyRecords.some((l) => l.slug === params.slug)) return { record: null, legacy: true };
    throw notFound();
  },
  head: ({ loaderData }) => {
    const r = loaderData?.record;
    const title = r ? `${r.marketing_title} — Avrasya Properties` : "Availability to confirm — Avrasya Properties";
    const desc = r ? `${r.layout_label ?? TYPE_LABEL[r.record_type]} in ${locationText(r)}. ${priceDisplay(r.price).main} (source-advertised, subject to confirmation).` : "This listing is being re-confirmed with the project.";
    return { meta: [{ title }, { name: "description", content: desc }, { property: "og:title", content: title }, { property: "og:description", content: desc }, ...(r ? [] : [{ name: "robots", content: "noindex" }])] };
  },
  component: Detail,
});

function Detail() {
  const { record } = Route.useLoaderData();
  if (!record) return <Legacy />;
  return <RecordView r={record} />;
}

function Legacy() {
  return (
    <div className="container-site max-w-2xl py-24">
      <p className="eyebrow eyebrow-mark">Availability to confirm</p>
      <h1 className="headline mt-3">We're re-confirming this listing with the project.</h1>
      <p className="mt-4 text-muted-foreground">This earlier listing is not part of our current source-backed collection. Ask us for its current status, or browse offers we can document today.</p>
      <div className="mt-8 flex flex-wrap gap-3"><Link to="/properties" className="btn btn-primary">Browse offers</Link><a href={waLink("Hello, I'd like to ask about an earlier Avrasya listing.")} target="_blank" rel="noreferrer" className="btn btn-outline">Ask on WhatsApp</a></div>
    </div>
  );
}

function Fact({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-4 border-b py-3 text-sm"><span className="text-muted-foreground">{k}</span><span className="text-right">{v}</span></div>;
}

const usd = (n: number) => "$" + n.toLocaleString("en-US");
const tryf = (n: number) => "TRY " + n.toLocaleString("en-US");

function PriceBlock({ r }: { r: PropertyRecord }) {
  const p = r.price;
  const rows: [string, string][] = [];
  if (p.previous_advertised_amount) rows.push(["Formerly advertised", usd(p.previous_advertised_amount)]);
  if (p.list_price) rows.push(["Source list price", usd(p.list_price)]);
  if (p.expenses_amount) rows.push(["Stated expenses (beside cash price)", usd(p.expenses_amount)]);
  const inst = r.details.installment_offer as { total: number; down_payment_percent: number; months: number } | undefined;
  if (inst) rows.push(["Separate instalment offer", `${usd(inst.total)} · ${inst.down_payment_percent}% down · ${inst.months} months`]);
  if (p.basis === "installment_schedule") {
    rows.push([`Down payment (${p.down_payment_percent}%)`, tryf(p.down_payment_amount!)]);
    rows.push([`At delivery (${p.delivery_payment_percent}%)`, tryf(p.delivery_payment_amount!)]);
    rows.push(["Instalments", `${p.installment_count} × ${tryf(p.installment_amount!)}`]);
  }
  p.source_offers?.forEach((o, i) => rows.push([`Source offer ${i + 1} (starting from)`, `${usd(o.amount)}${o.area_m2 ? ` · ${o.area_m2} m² gross` : " · area not supplied"}`]));
  if (p.basis === "scope_unconfirmed" && p.amount) rows.push(["Flyer amount", `${usd(p.amount)} — whether this covers both layouts or one is unconfirmed`]);
  if (!rows.length) return null;
  return <div className="mt-6 border bg-background p-4">{rows.map(([k, v]) => <Fact key={k} k={k} v={v} />)}<p className="pt-3 text-xs text-muted-foreground">Source-stated terms. {p.basis === "installment_schedule" ? "Please request confirmation of the full price; no USD conversion is shown." : "Current terms are confirmed on request."}</p></div>;
}

function RecordView({ r }: { r: PropertyRecord }) {
  const p = priceDisplay(r.price);
  const d = r.details;
  const facts = Object.entries(d).filter(([k, v]) => typeof v === "string" && k !== "note" && k !== "project" && k !== "unit_area_unconfirmed");
  const claims = (d.claims_requiring_confirmation as string[] | undefined) ?? [];
  const plan = d.supporting_plan as Record<string, unknown> | undefined;
  const related = properties.filter((x) => x.slug !== r.slug && x.side === r.side).slice(0, 3);

  return (
    <>
      <div className="border-b"><nav className="container-site flex gap-2 py-3 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/">Home</Link>/<Link to="/properties">Properties</Link>/<span className="text-foreground">{r.marketing_title}</span>
      </nav></div>
      <section className="container-site py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow eyebrow-mark">{TYPE_LABEL[r.record_type]} · {locationText(r)}</p>
            <h1 className="display-hero mt-3 !text-4xl md:!text-5xl">{r.marketing_title}</h1>
            <p className="mt-3 text-muted-foreground">{r.layout_label ?? "Layout not supplied"} · {areaText(r)}</p>
          </div>
          <div className="md:text-right">
            <p className="eyebrow !text-muted-foreground">Indicative price</p>
            <p className="font-display text-4xl">{p.main}</p>
            <p className="text-xs text-muted-foreground">{p.note} · subject to confirmation</p>
          </div>
        </div>
        <div className="mt-8 aspect-[16/7] overflow-hidden border"><ImageFallback r={r} /></div>
      </section>

      <section className="container-site grid gap-8 pb-16 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-8">
          <div className="border bg-card p-6 md:p-8">
            <p className="eyebrow">Section 01 · Fact sheet</p>
            <h2 className="headline mt-2 !text-2xl">Specifications as supplied</h2>
            <div className="mt-6 grid gap-x-10 md:grid-cols-2">
              <Fact k="Location" v={locationText(r)} />
              <Fact k="Side" v={sideText(r)} />
              <Fact k="Layout" v={r.layout_label ?? "Not supplied"} />
              <Fact k="Area" v={areaText(r)} />
              {typeof d.project === "string" && <Fact k="Project" v={d.project} />}
              {["block", "floor", "unit"].map((k) => d[k] != null && <Fact key={k} k={humanKey(k)} v={String(d[k])} />)}
              {facts.filter(([k]) => !["block", "floor", "unit"].includes(k)).map(([k, v]) => <Fact key={k} k={humanKey(k)} v={v as string} />)}
            </div>
            <PriceBlock r={r} />
            {typeof d.note === "string" && <p className="mt-6 text-sm text-muted-foreground">{d.note}</p>}
          </div>

          {plan && (
            <div className="border bg-card p-6 md:p-8">
              <p className="eyebrow">Section 02 · Supporting type plan</p>
              <p className="mt-2 text-sm text-muted-foreground">Type-plan ranges, not confirmed measurements of this unit.</p>
              <div className="mt-4">{Object.entries(plan).filter(([, v]) => typeof v !== "object").map(([k, v]) => <Fact key={k} k={humanKey(k)} v={String(v)} />)}</div>
            </div>
          )}

          {claims.length > 0 && (
            <details className="border bg-card p-6 md:p-8">
              <summary className="flex items-center justify-between font-medium">Source marketing statements to confirm ({claims.length})<span className="text-brass">+</span></summary>
              <ul className="faq-body mt-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{claims.map((c) => <li key={c}>{c}</li>)}</ul>
              <p className="mt-3 text-xs text-muted-foreground">These appear on the developer's material. They are not Avrasya promises and require independent confirmation.</p>
            </details>
          )}

          <div className="border bg-card p-6 md:p-8">
            <p className="eyebrow">Due diligence</p>
            <h2 className="headline mt-2 !text-2xl">Independent checks before commitment</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[["Title & encumbrance check", "Coordinated review of the title deed record before any deposit."], ["Independent valuation", "Valuation by a licensed appraiser, arranged through qualified partners."], ["Payment documentation", "Currency and payment records prepared with banks and advisers."], ["Independent legal review", "Contracts reviewed by a Turkish lawyer you appoint."]].map(([t, x], i) => (
                <div key={t} className="bg-background p-5"><p className="text-sm font-semibold">{i + 1}. {t}</p><p className="mt-1 text-sm text-muted-foreground">{x}</p></div>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border bg-card p-6">
            <p className="text-xs text-muted-foreground">Ref: {r.slug}</p>
            <h2 className="mt-2 font-display text-xl">{r.record_type === "project" ? "Enquire about this project" : r.price.basis === "conflicting_starting_prices" ? "Request current options" : "Enquire about this offer"}</h2>
            <p className="mb-5 mt-1 text-sm text-muted-foreground">We confirm current price and availability with the project before you decide.</p>
            <Enquiry defaultTopic={r.marketing_title} compact />
          </div>
        </aside>
      </section>

      {related.length > 0 && (
        <section className="container-site border-t pb-20 pt-12">
          <p className="eyebrow eyebrow-mark">Related on the {r.side === "unknown" ? "collection" : `${r.side}an side`}</p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">{related.map((x) => <PropertyCard key={x.slug} r={x} />)}</div>
        </section>
      )}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t bg-card p-3 lg:hidden">
        <a href={waLink(`Hello, I'm interested in ${r.marketing_title} (${r.slug}).`)} target="_blank" rel="noreferrer" className="btn btn-primary flex-1">WhatsApp</a>
        <a href={CONTACT.phoneHref} className="btn btn-outline flex-1">Call</a>
      </div>
    </>
  );
}
