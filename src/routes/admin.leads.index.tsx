import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHead, Status, btnGhost, btnPrimary, field } from "@/admin/Shell";
import { LEAD_STAGES, SOURCES, can, fmtDate, setStage, upsert, useDB, useSession, userName, type Contact, type Lead } from "@/admin/store";

export const Route = createFileRoute("/admin/leads/")({ component: Leads });

export async function moveStage(l: Lead, stage: Lead["stage"]) {
  try { const r = stage === "Lost" ? prompt("Loss reason (required)") ?? "" : undefined; if (stage === "Lost" && !r) return; await setStage(l.id, stage, r); } catch (e) { toast.error((e as Error).message); }
}

function Leads() {
  const db = useDB(); const user = useSession();
  const [view, setView] = useState<"table" | "kanban">("table"); const [adding, setAdding] = useState(false);
  const [n, setN] = useState({ name: "", email: "", phone: "", source: "Website" });
  const name = (l: Lead) => db.contacts.find((c) => c.id === l.contactId)?.name ?? "—";
  const create = async () => {
    try {
      const c = await upsert<Contact>("contacts", { name: n.name, email: n.email, phone: n.phone, kind: "person", roles: ["buyer"], language: "English", agentId: user!.id, notes: "" });
      await upsert<Lead>("leads", { contactId: c.id, source: n.source, agentId: user!.id, districts: "", layout: "", budgetMin: null, budgetMax: null, currency: "USD", stage: "New", nextFollowUp: null, shortlist: [] });
      setAdding(false); setN({ name: "", email: "", phone: "", source: "Website" }); toast.success("Lead created");
    } catch (e) { toast.error((e as Error).message); }
  };
  return (
    <>
      <PageHead title="Buyer enquiries" crumbs="Clients" action={<div className="flex gap-2"><button className={btnGhost} onClick={() => setView(view === "table" ? "kanban" : "table")}>{view === "table" ? "Kanban" : "Table"}</button>{can(user, "edit-crm") && <button className={btnPrimary} onClick={() => setAdding(!adding)}>New lead</button>}</div>} />
      {adding && <div className="mb-4 grid gap-2 rounded-md border bg-card p-3 sm:grid-cols-5">
        <input className={field} placeholder="Name (fictional)" value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} />
        <input className={field} placeholder="Email" value={n.email} onChange={(e) => setN({ ...n, email: e.target.value })} />
        <input className={field} placeholder="Phone" value={n.phone} onChange={(e) => setN({ ...n, phone: e.target.value })} />
        <select className={field} value={n.source} onChange={(e) => setN({ ...n, source: e.target.value })}>{SOURCES.map((s) => <option key={s}>{s}</option>)}</select>
        <button className={btnPrimary} disabled={!n.name} onClick={create}>Create</button></div>}
      {view === "table" ? (
        <div className="overflow-x-auto rounded-md border bg-card"><table className="w-full text-sm">
          <thead className="border-b text-left text-xs text-muted-foreground"><tr><th className="p-2">Contact</th><th>Source</th><th>Wants</th><th>Agent</th><th>Next follow-up</th><th>Stage</th></tr></thead>
          <tbody>{db.leads.map((l) => <tr key={l.id} className="border-b last:border-0">
            <td className="p-2"><Link to="/admin/leads/$id" params={{ id: l.id }} className="font-medium text-brass-text hover:underline">{name(l)}</Link></td><td>{l.source}</td><td>{[l.layout, l.districts].filter(Boolean).join(" · ") || "—"}</td><td>{userName(l.agentId)}</td>
            <td className={l.nextFollowUp && new Date(l.nextFollowUp) < new Date() ? "text-destructive" : ""}>{fmtDate(l.nextFollowUp)}</td>
            <td><select disabled={!can(user, "edit-crm", l.agentId)} className="rounded-sm border bg-card px-1 text-xs" value={l.stage} onChange={(e) => moveStage(l, e.target.value as Lead["stage"])}>{LEAD_STAGES.map((s) => <option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table></div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">{LEAD_STAGES.map((s) => (
          <div key={s} className="w-56 shrink-0 rounded-md border bg-muted/50 p-2" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { const l = db.leads.find((x) => x.id === e.dataTransfer.getData("id")); if (l && l.stage !== s) moveStage(l, s); }}>
            <p className="mb-2 flex justify-between text-xs font-medium">{s}<span className="text-muted-foreground">{db.leads.filter((l) => l.stage === s).length}</span></p>
            {db.leads.filter((l) => l.stage === s).map((l) => <div key={l.id} draggable={can(user, "edit-crm", l.agentId)} onDragStart={(e) => e.dataTransfer.setData("id", l.id)} className="mb-2 rounded-sm border bg-card p-2 text-sm">
              <Link to="/admin/leads/$id" params={{ id: l.id }} className="font-medium">{name(l)}</Link><p className="text-xs text-muted-foreground">{l.source} · {userName(l.agentId)}</p></div>)}
          </div>))}</div>
      )}
      <p className="mt-2 text-xs text-muted-foreground"><Status v="Demo" /> Stage changes are logged to the lead timeline.</p>
    </>
  );
}
