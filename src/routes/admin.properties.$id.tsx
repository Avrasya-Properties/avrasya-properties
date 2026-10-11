import { managedRows,linkUnit } from "@/admin/management";
import { rawRecord } from "@/admin/remote";
import type { Row } from "@/admin/mappers";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHead, Status, btnGhost, btnPrimary, field } from "@/admin/Shell";
import { AVAIL, DEMO_ENABLED, uploadImage, USERS, can, fmtMoney, publishIssues, upsert, useDB, useSession, type Property } from "@/admin/store";

export const Route = createFileRoute("/admin/properties/$id")({ component: Editor });
const TABS = ["Essentials", "Pricing", "Media", "Source & Review", "Website Preview"] as const;

function Editor() {
  const { id } = Route.useParams(); const db = useDB(); const user = useSession();
  const saved = db.properties.find((p) => p.id === id);
  const [units,setUnits]=useState<Row[]>([]);const [unitId,setUnitId]=useState("");
  useEffect(()=>{if(DEMO_ENABLED)return;void managedRows("physical_units").then(setUnits).catch(error=>toast.error(error.message));},[]);
  const [d, setD] = useState<Property | undefined>(saved); const [tab, setTab] = useState<(typeof TABS)[number]>("Essentials");
  useEffect(() => { setD(saved); }, [id]);
  if (!saved || !d) return <p>Property not found. <Link to="/admin/properties" className="text-brass-text">Back to inventory</Link></p>;
  const ro = !can(user, "edit-inventory");
  const f = <K extends keyof Property>(k: K, v: Property[K]) => setD({ ...d, [k]: v });
  const num = (v: string) => (v === "" ? null : Number(v));
  const save = async (patch: Partial<Property> = {}) => { try { const n = await upsert<Property>("properties", { ...d, ...patch }); setD(n); toast.success("Saved"); } catch (e) { toast.error((e as Error).message); } };
  const issues = publishIssues(d, db.properties);
  const inp = (label: string, k: keyof Property, type = "text") => (
    <label className="text-sm">{label}<input disabled={ro} type={type} className={field} value={(d[k] as string | number | null) ?? ""} onChange={(e) => f(k, (type === "number" ? num(e.target.value) : e.target.value) as never)} placeholder={type === "number" ? "Unknown" : ""} /></label>
  );
  return (
    <>
      <PageHead title={d.title || "Untitled property"} crumbs={`Inventory / Properties / ${d.ref}`} action={!ro && <div className="flex gap-2">
        <button className={btnGhost} onClick={() => save()}>Save changes</button>
        {can(user, "publish") && d.publication !== "Published" && <button className={btnPrimary} onClick={() => issues.length ? (setTab("Source & Review"), toast.error("Publishing blocked — see fix list")) : save({ publication: "Published" })}>Publish</button>}
        {can(user, "publish") && d.publication === "Published" && <button className={btnGhost} onClick={() => save({ publication: "Draft" })}>Unpublish</button>}
      </div>} />
      <div className="mb-4 flex gap-1 overflow-x-auto border-b">{TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap px-3 py-2 text-sm ${tab === t ? "border-b-2 border-brass font-medium" : "text-muted-foreground"}`}>{t}</button>)}</div>
      <div className="max-w-3xl rounded-md border bg-card p-4">
        {tab === "Essentials" && <div className="grid gap-3 sm:grid-cols-2">
          {inp("Title", "title")}{inp("Slug", "slug")}{inp("Reference", "ref")}{inp("District", "district")}{inp("City", "city")}{inp("Layout (e.g. 2+1)", "layout")}{inp("Bathrooms", "bathrooms", "number")}
          <label className="text-sm">Development name<input disabled={ro} className={field} value={d.project} onChange={e=>f("project",e.target.value)} placeholder="Use a registered development name"/></label>
          {!DEMO_ENABLED&&<div className="sm:col-span-2 rounded border p-3"><label className="block text-sm">Verified physical unit<select disabled={ro} className={field} value={unitId||String(rawRecord("properties",id)?.["physical_unit_id"]||"")} onChange={e=>setUnitId(e.target.value)}><option value="">No identified unit</option>{units.map(unit=><option key={String(unit["id"])} value={String(unit["id"])}>{String(unit["unit_number"])} · {String(unit["layout_label"]||"")}</option>)}</select></label><button disabled={ro||!unitId} className={btnGhost+" mt-2"} onClick={async()=>{try{await linkUnit(id,unitId,Number(rawRecord("properties",id)?.["version"]));toast.success("Physical unit linked");}catch(error){toast.error((error as Error).message);}}}>Link verified unit</button><p className="mt-2 text-xs text-muted-foreground">Create the actual unit number in Management before reserving this offer. Packages and unit types cannot be reserved as individual units.</p></div>}
          {inp("Gross area m²", "grossM2", "number")}{inp("Net area m²", "netM2", "number")}{inp("Area m² (basis unspecified)", "areaM2", "number")}
          <label className="text-sm">Record type<select disabled={ro} className={field} value={d.type} onChange={(e) => f("type", e.target.value)}><option value="unit offer">Individual unit offer</option><option value="package">Packaged offer</option><option value="unit type">Unit type / not an identified unit</option><option value="ambiguous offer">Offer to confirm</option><option value="project">Development / project</option></select></label>
          <label className="text-sm">Availability<select disabled={ro} className={field} value={d.availability} onChange={(e) => f("availability", e.target.value as Property["availability"])}>{AVAIL.map((a) => <option key={a}>{a}</option>)}</select></label>
          <label className="text-sm">Agent<select disabled={ro} className={field} value={d.agentId} onChange={(e) => f("agentId", e.target.value)}>{USERS.filter((u) => u.role !== "viewer").map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
          <label className="text-sm sm:col-span-2">Description<textarea disabled={ro} className={`${field} h-28 py-2`} value={d.description} onChange={(e) => f("description", e.target.value)} /></label>
        </div>}
        {tab === "Pricing" && <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Price type<select disabled={ro} className={field} value={d.priceType} onChange={(e) => f("priceType", e.target.value as Property["priceType"])}><option value="fixed">Fixed</option><option value="from">From</option><option value="on-request">On request</option></select></label>
          <label className="text-sm">Sale / rent<select disabled={ro} className={field} value={d.mode} onChange={(e) => f("mode", e.target.value as Property["mode"])}><option value="sale">Sale</option><option value="rent">Rent (monthly)</option></select></label>
          {inp("Amount", "amount", "number")}
          <label className="text-sm">Currency<select disabled={ro} className={field} value={d.currency ?? ""} onChange={(e) => f("currency", (e.target.value || null) as Property["currency"])}><option value="">—</option><option>USD</option><option>TRY</option><option>EUR</option><option>GBP</option></select></label>
          <p className="text-xs text-muted-foreground sm:col-span-2">No automatic currency conversion is performed.</p>
        </div>}
        {tab === "Media" && <div>
          <p className="mb-2 text-xs text-muted-foreground">Select a high-resolution project visual preset or upload a cover (JPEG, PNG or WebP, up to {DEMO_ENABLED ? "1 MB" : "5 MB"}). {DEMO_ENABLED ? "Demo uploads remain in this browser." : "Uploads are stored in Supabase Storage."}</p>
          {!ro && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold text-foreground uppercase tracking-wider">Stock Architectural Library</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {[
                    { label: "Bosphorus Hero", url: "/images/properties/hero-main.jpg" },
                    { label: "Maslak Tower", url: "/images/properties/maslak-tower.jpg" },
                    { label: "Feriköy Penthouse", url: "/images/properties/ferikoy-duplex.jpg" },
                    { label: "Ataşehir Sky", url: "/images/properties/atasehir-sky.jpg" },
                    { label: "Topkapı Pearl", url: "/images/properties/topkapi-pearl.jpg" },
                    { label: "Şişli Residence", url: "/images/properties/sisli-residence.jpg" },
                    { label: "Bosphorus Terrace", url: "/images/properties/bosphorus-terrace.jpg" },
                    { label: "Master Suite", url: "/images/properties/master-suite.jpg" },
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.url}
                      onClick={() => f("cover", preset.url)}
                      className={`group relative overflow-hidden rounded-md border text-left transition-all ${
                        d.cover === preset.url ? "ring-2 ring-brass border-brass" : "hover:border-foreground/40"
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="aspect-[4/3] w-full object-cover" />
                      <span className="block truncate bg-card/90 p-1 text-[10px] font-medium text-foreground">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Custom Upload</p>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={async (e) => { const file=e.target.files?.[0];if(!file)return;try{if(DEMO_ENABLED){if(file.size>1e6)throw new Error("Demo cover exceeds 1 MB.");const reader=new FileReader();reader.onerror=()=>toast.error("The image could not be read");reader.onload=()=>f("cover",reader.result as string);reader.readAsDataURL(file);}else{f("cover",await uploadImage(file));toast.success("Image uploaded. Save the listing to apply it.");}}catch(error){toast.error((error as Error).message);}}} />
              </div>
            </div>
          )}
          {d.cover && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-1">Active Cover Image:</p>
              <img src={d.cover} alt="Cover" className="h-48 w-auto rounded-md object-cover border" />
              {!ro && <button className="mt-2 text-xs font-medium text-destructive hover:underline" onClick={() => confirm("Remove cover image?") && f("cover", null)}>Remove cover image</button>}
            </div>
          )}
        </div>}
        {tab === "Source & Review" && <div className="space-y-3 text-sm">
          <p>Publication: <Status v={d.publication} /> · Availability: <Status v={d.availability} /> <span className="text-xs text-muted-foreground">(independent)</span></p>
          {d.sourceNote && <p className="rounded-sm border border-brass bg-warn-bg p-2 text-xs">Source claims requiring confirmation: {d.sourceNote}</p>}
          <label className="block text-sm">Source claims requiring confirmation<textarea disabled={ro} className={`${field} mt-1 h-24 py-2`} value={d.sourceNote ?? ""} onChange={(e) => f("sourceNote", e.target.value)} /></label>
          <p className="text-xs text-muted-foreground">Keep unresolved claims here. Before reserving a unit, confirm its physical identity, availability and source claims with the client. {DEMO_ENABLED ? "Demo publication affects this browser only." : "Publishing updates the shared public catalogue."}</p>
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
