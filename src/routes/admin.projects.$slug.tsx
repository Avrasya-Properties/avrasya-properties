import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {useEffect,useState} from "react";
import { toast } from "sonner";
import { PageHead, Status, btnPrimary } from "@/admin/Shell";
import { AVAIL,DEMO_ENABLED, can, fmtMoney, upsert, useDB, useSession, userName, type Property } from "@/admin/store";
import {managedRows} from "@/admin/management";
import type {Row} from "@/admin/mappers";
import { slugify } from "./admin.projects.index";

export const Route = createFileRoute("/admin/projects/$slug")({ component: ProjectDetail });

function ProjectDetail() {
  const { slug } = Route.useParams(); const db = useDB(); const user = useSession(); const nav = useNavigate();
  const [project,setProject]=useState<Row|null>(null),[loaded,setLoaded]=useState(DEMO_ENABLED);
  useEffect(()=>{if(DEMO_ENABLED)return;let live=true;void managedRows("projects").then(rows=>{if(live){setProject(rows.find(r=>slugify(String(r["name"]))===slug)||null);setLoaded(true);}}).catch(e=>{toast.error(e.message);setLoaded(true);});return()=>{live=false;};},[slug,db.properties]);
  const units = db.properties.filter((p) => slugify(p.project || "Unassigned") === slug);
  if(!units.length&&project)return <><PageHead title={String(project["name"])} action={<Link to="/admin/manage" search={{section:"projects",record:String(project["id"])}} className={btnPrimary}>{can(user,"edit-inventory")?"Edit development":"View development"}</Link>}/><p className="mb-4 text-sm text-muted-foreground">No listings are linked to this development yet.</p>{can(user,"edit-inventory")&&<Link to="/admin/properties" className={btnPrimary}>Add a property listing</Link>}</>;
  if(!loaded&&!units.length)return <p role="status">Loading development…</p>;
  if (!units.length) return <p>Project not found. <Link to="/admin/projects" className="text-brass-text">Back</Link></p>;
  const base = units[0]!;
  const addUnit = async () => {
    try {
      const { id: _id, cbiEligible: _cbi, tapuStatus: _tapu, ...rest } = base;
      const p = await upsert<Property>("properties", { ...rest, ref: `AVR-${Math.max(1000, ...db.properties.map((p) => Number(p.ref.replace(/^AVR-/, ""))).filter(Number.isFinite)) + 1}`, slug: `${base.slug}-${crypto.randomUUID()}`, title: `${base.project} — new unit`, type: "unit offer", layout: null, bathrooms: null, grossM2: null, netM2: null, areaM2: null, amount: null, priceType: "on-request", sourceNote: "New unit identity and source details require confirmation", availability: "Unknown", publication: "Draft", cover: null, agentId: user!.id });
      nav({ to: "/admin/properties/$id", params: { id: p.id } });
    } catch (e) { toast.error((e as Error).message); }
  };
  return (
    <>
      <PageHead title={base.project || "Unassigned"} crumbs="Properties / Developments" action={can(user, "edit-inventory") && <button className={btnPrimary} onClick={addUnit}>Add unit from project</button>} />
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        {AVAIL.filter((a) => units.some((u) => u.availability === a)).map((a) => <div key={a} className="rounded-md border bg-card p-3"><p className="text-xs text-muted-foreground">{a}</p><p className="text-xl font-semibold tabular-nums">{units.filter((u) => u.availability === a).length}</p></div>)}
      </div>
      <p className="mb-2 text-sm text-muted-foreground">{base.district}, {base.city} · {units.length} linked record(s)</p>
      <div className="overflow-x-auto rounded-md border bg-card"><table className="w-full text-sm">
        <thead className="border-b text-left text-xs text-muted-foreground"><tr><th className="p-2">Ref</th><th>Title</th><th>Layout</th><th className="text-right">Price</th><th className="px-2">Availability</th><th>Publication</th><th>Agent</th></tr></thead>
        <tbody>{units.map((p) => <tr key={p.id} className="border-b last:border-0">
          <td className="p-2"><Link to="/admin/properties/$id" params={{ id: p.id }} className="font-medium text-brass-text">{p.ref}</Link></td><td className="max-w-64 truncate">{p.title}</td><td>{p.layout ?? "—"}</td>
          <td className="text-right tabular-nums">{fmtMoney(p.amount, p.currency)}</td><td className="px-2"><Status v={p.availability} /></td><td><Status v={p.publication} /></td><td>{userName(p.agentId)}</td></tr>)}</tbody></table></div>
    </>
  );
}
