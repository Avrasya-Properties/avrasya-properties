import {listingPreview} from "@/admin/listing-preview";
import {PropertyDetails} from "@/components/site/PropertyDetails";
import { managedRows,linkUnit } from "@/admin/management";
import { rawRecord } from "@/admin/remote";
import {decode,type Row} from "@/admin/mappers";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect,useRef, useState } from "react";
import { toast } from "sonner";
import { PageHead, Status, btnGhost, btnPrimary, field } from "@/admin/Shell";
import { AVAIL, DEMO_ENABLED, uploadImage, USERS, can, fmtMoney, publishIssues, upsert, useDB, useSession, type Property } from "@/admin/store";

export const Route = createFileRoute("/admin/properties/$id")({ component: Editor });
const TABS = ["Property details", "Pricing", "Media", "Checks and notes", "Website Preview"] as const;

function Editor() {
  const { id } = Route.useParams(); const db = useDB(); const user = useSession();
  const saved = db.properties.find((p) => p.id === id);
  const [units,setUnits]=useState<Row[]>([]);const [projects,setProjects]=useState<Row[]>([]);const [unitId,setUnitId]=useState("");
  useEffect(()=>{if(DEMO_ENABLED)return;void Promise.all([managedRows("physical_units"),managedRows("projects")]).then(([units,projects])=>{setUnits(units);setProjects(projects);}).catch(error=>toast.error(error.message));},[]);
  const [d, setD] = useState<Property | undefined>(saved); const [tab, setTab] = useState<(typeof TABS)[number]>("Property details");
  const previousSaved=useRef(saved);
  useEffect(() => {const before=previousSaved.current;setD(previous=>!previous||previous.id!==id||JSON.stringify(previous)===JSON.stringify(before)?saved:previous);previousSaved.current=saved;}, [id,saved]);
  if (!saved || !d) return <p>Property not found. <Link to="/admin/properties" className="text-brass-text">Back to listings</Link></p>;
  const ro = !can(user, "edit-inventory");
  const f = <K extends keyof Property>(k: K, v: Property[K]) => setD({ ...d, [k]: v });
  const num = (v: string) => (v === "" ? null : Number(v));
  const save = async (patch: Partial<Property> = {}) => { try { const n = await upsert<Property>("properties", { ...d, ...patch }); setD(n); toast.success("Saved"); } catch (e) { toast.error((e as Error).message); } };
  const issues = publishIssues(d, db.properties);
  const inp = (label: string, k: keyof Property, type = "text") => (
    <label className="text-sm">{label}<input disabled={ro} type={type} step={type==="number"?"any":undefined} className={field} value={(d[k] as string | number | null) ?? ""} onChange={(e) => f(k, (type === "number" ? num(e.target.value) : e.target.value) as never)} placeholder={type === "number" ? "Unknown" : ""} /></label>
  );
  return (
    <>
      <PageHead title={d.title || "Untitled property"} crumbs={`Inventory / Properties / ${d.ref}`} action={!ro && <div className="flex gap-2">
        <button className={btnGhost} onClick={() => save()}>Save changes</button>
        {can(user, "publish") && d.publication !== "Published" && <button className={btnPrimary} onClick={() => issues.length ? (setTab("Checks and notes"), toast.error("Publishing blocked — see fix list")) : save({ publication: "Published" })}>Publish</button>}
        {can(user, "publish") && d.publication === "Published" && <button className={btnGhost} onClick={() => save({ publication: "Draft" })}>Unpublish</button>}
      </div>} />
      <div className="mb-4 flex gap-1 overflow-x-auto border-b">{TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap px-3 py-2 text-sm ${tab === t ? "border-b-2 border-brass font-medium" : "text-muted-foreground"}`}>{t}</button>)}</div>
      {!DEMO_ENABLED&&<div className="mb-4 flex flex-wrap gap-2">{([["physical_units","Registered apartments"],["offer_amenities","Listing features"],["pricing_options","Payment plans"],["package_memberships","Package contents"]] as const).map(([section,label])=><Link key={section} to="/admin/manage" search={{section,property:id}} className={btnGhost}>{label}</Link>)}</div>}
      <div className={tab==="Website Preview"?"w-full overflow-hidden rounded-md border bg-background":"max-w-3xl rounded-md border bg-card p-4"}>
        {tab === "Property details" && <div className="grid gap-3 sm:grid-cols-2">
          {inp("Title", "title")}{inp("Web address ending", "slug")}{inp("Reference", "ref")}{inp("District", "district")}{inp("City", "city")}{inp("Layout (e.g. 2+1)", "layout")}{inp("Bathrooms", "bathrooms", "number")}
          <label className="text-sm">Development name<select disabled={ro} className={field} value={d.project} onChange={e=>f("project",e.target.value)}><option value="">Not assigned</option>{projects.map(project=><option key={String(project["id"])} value={String(project["name"])}>{String(project["name"])}</option>)}</select></label>
          {!DEMO_ENABLED&&<div className="sm:col-span-2 rounded border p-3"><label className="block text-sm">Registered apartment<select disabled={ro} className={field} value={unitId||String(rawRecord("properties",id)?.["physical_unit_id"]||"")} onChange={e=>setUnitId(e.target.value)}><option value="">No identified unit</option>{units.map(unit=><option key={String(unit["id"])} value={String(unit["id"])}>{String(unit["unit_number"])} · {String(unit["layout_label"]||"")}</option>)}</select></label><button disabled={ro||!unitId} className={btnGhost+" mt-2"} onClick={async()=>{try{if(JSON.stringify(d)!==JSON.stringify(saved))throw new Error("Save your listing changes before linking an apartment.");await linkUnit(id,unitId,Number(rawRecord("properties",id)?.["version"]));const row=rawRecord("properties",id);if(row)setD(decode("properties",{...row,project_name:d.project}));toast.success("Apartment linked");}catch(error){toast.error((error as Error).message);}}}>Link apartment</button><p className="mt-2 text-xs text-muted-foreground">Add the apartment number under Registered apartments before reserving this listing. Packages and unit types cannot be reserved as individual units.</p></div>}
          <label className="text-sm">Istanbul side<select disabled={ro} className={field} value={d.side||"unknown"} onChange={e=>f("side",e.target.value as Property["side"])}><option value="unknown">To confirm</option><option value="Europe">European side</option><option value="Asia">Asian side</option></select></label>{inp("Title deed status","tapuStatus")}
          <label className="text-sm sm:col-span-2">Property highlights<textarea disabled={ro} className={field+" h-24"} value={(d.highlights||[]).join("\n")} onChange={e=>f("highlights",e.target.value.split("\n"))}/><span className="text-xs text-muted-foreground">One confirmed feature per line. Empty lines are ignored when saved.</span></label>
          {inp("Gross area m²", "grossM2", "number")}{inp("Net area m²", "netM2", "number")}{inp("Area m² (basis unspecified)", "areaM2", "number")}
          <label className="text-sm">Listing type<select disabled={ro} className={field} value={d.type} onChange={(e) => f("type", e.target.value)}><option value="unit offer">Individual unit offer</option><option value="package">Packaged offer</option><option value="unit type">Unit type / not an identified unit</option><option value="ambiguous offer">Offer to confirm</option><option value="project">Development / project</option></select></label>
          <label className="text-sm">Availability<select disabled={ro} className={field} value={d.availability} onChange={(e) => f("availability", e.target.value as Property["availability"])}>{AVAIL.map((a) => <option key={a}>{a}</option>)}</select></label>
          <label className="text-sm">Agent<select disabled={ro} className={field} value={d.agentId} onChange={(e) => f("agentId", e.target.value)}>{USERS.filter((u) => u.role !== "viewer").map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
          <label className="text-sm sm:col-span-2">Description<textarea disabled={ro} className={`${field} h-28 py-2`} value={d.description} onChange={(e) => f("description", e.target.value)} /></label>
        </div>}
        {tab === "Pricing" && <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Price type<select disabled={ro} className={field} value={d.priceType} onChange={(e) => f("priceType", e.target.value as Property["priceType"])}><option value="fixed">Fixed</option><option value="from">From</option><option value="on-request">On request</option></select></label>
          <label className="text-sm">Sale / rent<select disabled={ro} className={field} value={d.mode} onChange={(e) => f("mode", e.target.value as Property["mode"])}><option value="sale">Sale</option><option value="rent">Rent (monthly)</option></select></label>
          {inp("Amount", "amount", "number")}
          <label className="text-sm">Price basis<select disabled={ro} className={field} value={d.priceBasis||"advertised"} onChange={e=>f("priceBasis",e.target.value)}>{["cash","installment_schedule","package","fixed","from","on_request","conflicting_starting_prices","scope_unconfirmed","special_offer","advertised"].map(basis=><option key={basis} value={basis}>{basis.replaceAll("_"," ")}</option>)}</select></label>
          <label className="text-sm">Currency<select disabled={ro} className={field} value={d.currency ?? ""} onChange={(e) => f("currency", (e.target.value || null) as Property["currency"])}><option value="">—</option><option>USD</option><option>TRY</option><option>EUR</option><option>GBP</option></select></label>
          <p className="text-xs text-muted-foreground sm:col-span-2">No automatic currency conversion is performed.</p>
        </div>}
        {tab === "Media" && <div>
          <p className="mb-2 text-xs text-muted-foreground">Upload a property cover photo (JPEG, PNG or WebP, up to {DEMO_ENABLED ? "1 MB" : "5 MB"}). {DEMO_ENABLED ? "Demo uploads remain in this browser." : "Uploads are stored in Supabase Storage."}</p>
          {!ro && (
            <div className="space-y-4">
              {DEMO_ENABLED&&<div>
                <p className="mb-2 text-xs font-semibold text-foreground uppercase tracking-wider">Example images</p>
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
              </div>}
              <label className="block text-sm">Image URL<input className={field} value={d.cover||""} onChange={e=>f("cover",e.target.value||null)} placeholder="Paste an uploaded image link"/><span className="text-xs text-muted-foreground">Use a property photo or upload one below.</span></label>
              <div className="pt-2 border-t">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Custom Upload</p>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={async (e) => { const file=e.target.files?.[0];if(!file)return;try{if(DEMO_ENABLED){if(file.size>1e6)throw new Error("Demo cover exceeds 1 MB.");const reader=new FileReader();reader.onerror=()=>toast.error("The image could not be read");reader.onload=()=>f("cover",reader.result as string);reader.readAsDataURL(file);}else{f("cover",await uploadImage(file));toast.success("Image uploaded. Save the listing to apply it.");}}catch(error){toast.error((error as Error).message);}}} />
              </div>
            </div>
          )}
          {!ro&&<div className="mt-5 space-y-3 border-t pt-4">
            <h3 className="font-medium">Photo gallery</h3><p className="text-xs text-muted-foreground">Upload the listing's photos. Save changes when finished.</p>
            <input aria-label="Upload gallery photos" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={DEMO_ENABLED} onChange={async e=>{const files=Array.from(e.target.files||[]);if((d.galleryImages?.length||0)+files.length>20){toast.error("Use up to 20 gallery photos.");return;}for(const file of files){try{const url=await uploadImage(file);setD(old=>old?{...old,galleryImages:[...(old.galleryImages||[]),url]}:old);}catch(error){toast.error((error as Error).message);break;}}}}/>
            <div className="grid grid-cols-3 gap-2">{(d.galleryImages||[]).map((url,index)=><div key={url+index}><img src={url} alt={"Property photo "+(index+1)} className="aspect-[4/3] w-full rounded object-cover"/><button className="text-xs text-destructive" onClick={()=>f("galleryImages",d.galleryImages?.filter((_,i)=>i!==index))}>Remove photo {index+1}</button></div>)}</div>
            <label className="block text-sm">Floor plan image link<input className={field} value={d.floorPlan||""} onChange={e=>f("floorPlan",e.target.value||null)}/></label>
            <label className="block text-sm">Upload a floor plan<input type="file" accept="image/jpeg,image/png,image/webp" disabled={DEMO_ENABLED} onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{f("floorPlan",await uploadImage(file));}catch(error){toast.error((error as Error).message);}}}/></label>
          </div>}
          {d.cover && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-1">Active Cover Image:</p>
              <img src={d.cover} alt="Cover" className="h-48 w-auto rounded-md object-cover border" />
              {!ro && <button className="mt-2 text-xs font-medium text-destructive hover:underline" onClick={() => confirm("Remove cover image?") && f("cover", null)}>Remove cover image</button>}
            </div>
          )}
        </div>}
        {tab === "Checks and notes" && <div className="space-y-3 text-sm">
          <p>Publication: <Status v={d.publication} /> · Availability: <Status v={d.availability} /> <span className="text-xs text-muted-foreground">(independent)</span></p>
          {d.sourceNote && <p className="rounded-sm border border-brass bg-warn-bg p-2 text-xs">Source claims requiring confirmation: {d.sourceNote}</p>}
          <label className="block text-sm">Source claims requiring confirmation<textarea disabled={ro} className={`${field} mt-1 h-24 py-2`} value={d.sourceNote ?? ""} onChange={(e) => f("sourceNote", e.target.value)} /></label>
          <p className="text-xs text-muted-foreground">Keep unresolved claims here. Before reserving a unit, confirm its physical identity, availability and source claims with the client. {DEMO_ENABLED ? "Demo publication affects this browser only." : "Publishing updates the shared public catalogue."}</p>
          <h3 className="font-medium">Publish checklist</h3>
          {issues.length === 0 ? <p className="text-primary">Ready to publish.</p> : <ul className="list-disc pl-5 text-destructive">{issues.map((i) => <li key={i}>{i}</li>)}</ul>}
          {!ro && d.publication === "Draft" && <button className={btnGhost} onClick={() => save({ publication: "In Review" })}>Send to review</button>}
        </div>}
        {tab==="Website Preview"&&<><div role="status" className="border-b bg-muted/40 p-4 text-sm"><strong>Website preview</strong><p>This uses the same property layout as the public website, including your unsaved edits. Contact submission is disabled here.</p><p className="mt-1">{d.publication==="Published"?"Save changes to update the public listing.":"This listing is not public. Use Publish after checking the details."}</p>{saved.publication==="Published"&&<a className="mt-2 inline-block underline" href={"/properties/"+saved.slug} target="_blank" rel="noreferrer">Open published listing</a>}</div><PropertyDetails r={listingPreview(d,rawRecord("properties",id))} preview/></>}

      </div>
    </>
  );
}
