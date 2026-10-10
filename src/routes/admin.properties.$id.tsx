import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHead, Status, btnGhost, btnPrimary, field } from "@/admin/Shell";
import { AVAIL, USERS, can, fmtMoney, publishIssues, upsert, useDB, useSession, type Property } from "@/admin/store";

export const Route = createFileRoute("/admin/properties/$id")({ component: Editor });
const TABS = ["Essentials", "Pricing", "Media", "Source & Review", "Website Preview"] as const;

function Editor() {
  const { id } = Route.useParams(); const db = useDB(); const user = useSession();
  const saved = db.properties.find((p) => p.id === id);
  const [d, setD] = useState<Property | undefined>(saved); const [tab, setTab] = useState<(typeof TABS)[number]>("Essentials");
  if (!saved || !d) return <p>Property not found. <Link to="/admin/properties" className="text-brass-text">Back to inventory</Link></p>;
  const ro = !can(user, "edit-inventory");
  const f = <K extends keyof Property>(k: K, v: Property[K]) => setD({ ...d, [k]: v });
  const num = (v: string) => (v === "" ? null : Number(v));
  const save = (patch: Partial<Property> = {}) => { try { const n = upsert<Property>("properties", { ...d, ...patch }); setD(n); toast.success("Saved"); } catch (e) { toast.error((e as Error).message); } };
  const issues = publishIssues(d, db.properties);
  const inp = (label: string, k: keyof Property, type = "text") => (
    <label className="text-sm">{label}<input disabled={ro} type={type} className={field} value={(d[k] as string | number | null) ?? ""} onChange={(e) => f(k, (type === "number" ? num(e.target.value) : e.target.value) as never)} placeholder={type === "number" ? "Unknown" : ""} /></label>
  );
  return (
    <>
      <PageHead title={d.title || "Untitled property"} crumbs={`Inventory / Properties / ${d.ref}`} action={!ro && <div className="flex gap-2">
        <button className={btnGhost} onClick={() => save()}>Save draft</button>
        {can(user, "publish") && d.publication !== "Published" && <button className={btnPrimary} onClick={() => issues.length ? (setTab("Source & Review"), toast.error("Publishing blocked — see fix list")) : save({ publication: "Published" })}>Publish</button>}
        {can(user, "publish") && d.publication === "Published" && <button className={btnGhost} onClick={() => save({ publication: "Draft" })}>Unpublish</button>}
      </div>} />
      <div className="mb-4 flex gap-1 overflow-x-auto border-b">{TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap px-3 py-2 text-sm ${tab === t ? "border-b-2 border-brass font-medium" : "text-muted-foreground"}`}>{t}</button>)}</div>
      <div className="max-w-3xl rounded-md border bg-card p-4">
        {tab === "Essentials" && <div className="grid gap-3 sm:grid-cols-2">
          {inp("Title", "title")}{inp("Slug", "slug")}{inp("Reference", "ref")}{inp("District", "district")}{inp("City", "city")}{inp("Layout (e.g. 2+1)", "layout")}{inp("Bathrooms", "bathrooms", "number")}
          {inp("Gross area m²", "grossM2", "number")}{inp("Net area m²", "netM2", "number")}{inp("Area m² (basis unspecified)", "areaM2", "number")}
          <label className="text-sm">Availability<select disabled={ro} className={field} value={d.availability} onChange={(e) => f("availability", e.target.value as Property["availability"])}>{AVAIL.map((a) => <option key={a}>{a}</option>)}</select></label>
          <label className="text-sm">Agent<select disabled={ro} className={field} value={d.agentId} onChange={(e) => f("agentId", e.target.value)}>{USERS.filter((u) => u.role !== "viewer").map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
          <label className="text-sm sm:col-span-2">Description<textarea disabled={ro} className={`${field} h-28 py-2`} value={d.description} onChange={(e) => f("description", e.target.value)} /></label>
        </div>}
        {tab === "Pricing" && <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Price type<select disabled={ro} className={field} value={d.priceType} onChange={(e) => f("priceType", e.target.value as Property["priceType"])}><option value="fixed">Fixed</option><option value="from">From</option><option value="on-request">On request</option></select></label>
          <label className="text-sm">Sale / rent<select disabled={ro} className={field} value={d.mode} onChange={(e) => f("mode", e.target.value as Property["mode"])}><option value="sale">Sale</option><option value="rent">Rent (monthly)</option></select></label>
          {inp("Amount", "amount", "number")}
          <label className="text-sm">Currency<select disabled={ro} className={field} value={d.currency ?? ""} onChange={(e) => f("currency", (e.target.value || null) as Property["currency"])}><option value="">—</option><option>USD</option><option>TRY</option><option>EUR</option></select></label>
          <p className="text-xs text-muted-foreground sm:col-span-2">No automatic currency conversion is performed.</p>
        </div>}
        {tab === "Media" && <div>
          <p className="mb-2 text-xs text-muted-foreground">Images up to 5 MB (JPG/PNG/WebP). Stored in this browser only.</p>
          {!ro && <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 5e6) return toast.error("File exceeds 5 MB"); const r = new FileReader(); r.onload = () => f("cover", r.result as string); r.readAsDataURL(file); return undefined; }} />}
          {d.cover && <div className="mt-3"><img src={d.cover} alt="Cover" className="h-48 rounded-sm object-cover" />{!ro && <button className="mt-2 text-sm text-destructive" onClick={() => confirm("Remove cover image?") && f("cover", null)}>Remove</button>}</div>}
        </div>}
        {tab === "Source & Review" && <div className="space-y-3 text-sm">
          <p>Publication: <Status v={d.publication} /> · Availability: <Status v={d.availability} /> <span className="text-xs text-muted-foreground">(independent)</span></p>
          {d.sourceNote && <p className="rounded-sm border border-brass bg-warn-bg p-2 text-xs">Source claims requiring confirmation: {d.sourceNote}</p>}
          <h3 className="font-medium">Publish checklist</h3>
          {issues.length === 0 ? <p className="text-primary">Ready to publish.</p> : <ul className="list-disc pl-5 text-destructive">{issues.map((i) => <li key={i}>{i}</li>)}</ul>}
          {!ro && d.publication === "Draft" && <button className={btnGhost} onClick={() => save({ publication: "In Review" })}>Send to review</button>}
        </div>}
        {tab === "Website Preview" && <article className="mx-auto max-w-md">
          <p className="mb-2 text-[11px] uppercase text-brass-text">Local preview · not public</p>
          {d.cover ? <img src={d.cover} alt="" className="aspect-[4/3] w-full rounded-sm object-cover" /> : <div className="aspect-[4/3] rounded-sm bg-muted" />}
          <h2 className="mt-3 font-display text-2xl">{d.title || "Untitled"}</h2><p className="text-sm text-muted-foreground">{d.district}, {d.city} · {d.layout ?? "Layout to confirm"}</p>
          <p className="mt-2 text-lg tabular-nums">{d.priceType === "on-request" ? "Price on request" : `${d.priceType === "from" ? "From " : ""}${fmtMoney(d.amount, d.currency)}`}</p>
          <p className="mt-2 text-sm">{d.description}</p>
        </article>}
      </div>
    </>
  );
}
