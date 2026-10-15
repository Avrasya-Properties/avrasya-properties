import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect,useState } from "react";
import { PageHead,btnGhost,btnPrimary } from "@/admin/Shell";
import { DEMO_ENABLED,can,useDB,useSession } from "@/admin/store";
import { managedRows } from "@/admin/management";
import type {Row} from "@/admin/mappers";

export const Route = createFileRoute("/admin/projects/")({ component: Projects });

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function Projects() {
  const db = useDB();
  const user=useSession();const [registered,setRegistered]=useState<Row[]>([]);const [error,setError]=useState("");
  useEffect(()=>{if(DEMO_ENABLED)return;let live=true;void managedRows("projects").then(rows=>{if(live){setRegistered(rows);setError("");}}).catch(e=>{if(live)setError(e.message);});return()=>{live=false;};},[db.properties]);
  const groups = Object.entries(db.properties.reduce<Record<string, typeof db.properties>>((a, p) => ((a[p.project || "Unassigned"] ??= []).push(p), a), {}));
  for(const row of registered)if(!groups.some(([name])=>name===row["name"]))groups.push([String(row["name"]),[]]);
  return (
    <>
      <PageHead title="Developments" crumbs="Inventory" action={!DEMO_ENABLED&&can(user,"edit-inventory")&&<Link to="/admin/manage" search={{section:"projects"}} className={btnPrimary}>Add development</Link>}/>
      {error&&<p role="alert" className="mb-3 text-sm text-destructive">{error}</p>}
      <div className="overflow-x-auto rounded-md border bg-card"><table className="w-full text-sm">
        <thead className="border-b text-left text-xs text-muted-foreground"><tr><th className="p-2">Development</th><th>District</th><th className="text-right">Linked records</th><th className="text-right">Available</th><th className="text-right">Unknown</th><th className="px-2 text-right">Sold</th><th className="p-2">Actions</th></tr></thead>
        <tbody>{groups.map(([name, ps]) => (
          <tr key={name} className="border-b last:border-0">
            <td className="p-2"><Link to="/admin/projects/$slug" params={{ slug: slugify(name) }} className="font-medium text-brass-text hover:underline">{name}</Link></td>
            <td>{[...new Set(ps.map((p) => p.district).filter(Boolean))].join(", ") || String(registered.find(r=>r["name"]===name)?.["district"]||"—")}</td>
            <td className="text-right tabular-nums">{ps.length}</td>
            <td className="text-right tabular-nums">{ps.filter((p) => p.availability === "Available").length}</td>
            <td className="text-right tabular-nums">{ps.filter((p) => p.availability === "Unknown").length}</td>
            <td className="px-2 text-right tabular-nums">{ps.filter((p) => p.availability === "Sold").length}</td><td className="p-2">{!DEMO_ENABLED&&registered.find(r=>r["name"]===name)&&<Link to="/admin/manage" search={{section:"projects",record:String(registered.find(r=>r["name"]===name)!["id"])}} className={btnGhost}>{can(user,"edit-inventory")?"Edit development":"View development"}</Link>}</td></tr>))}</tbody></table></div>
      <p className="mt-2 text-xs text-muted-foreground">Counts are linked source records, not verified stock.</p>
    </>
  );
}
