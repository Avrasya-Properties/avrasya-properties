import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHead, Status, btnGhost, btnPrimary, field } from "@/admin/Shell";
import { LEAD_STAGES, addActivity, can, convertLead, fmtDate, fmtMoney, upsert, useDB, useSession, userName, type Lead } from "@/admin/store";
import { moveStage } from "./admin.leads.index";

export const Route = createFileRoute("/admin/leads/$id")({ component: LeadDetail });

function LeadDetail() {
  const { id } = Route.useParams(); const db = useDB(); const user = useSession(); const nav = useNavigate();
  const [note, setNote] = useState(""); const [msg, setMsg] = useState<string | null>(null);
  const l = db.leads.find((x) => x.id === id);
  if (!l) return <p>Lead not found.</p>;
  const c = db.contacts.find((x) => x.id === l.contactId);
  const edit = can(user, "edit-crm", l.agentId);
  const tl = db.activity.filter((a) => a.ref?.id === l.id);
  const matches = db.properties.filter((p) => p.currency === l.currency && (!l.layout || p.layout === l.layout) && (!l.districts || p.district.toLowerCase().includes(l.districts.toLowerCase())) && (p.amount == null || ((l.budgetMin ?? 0) <= p.amount && p.amount <= (l.budgetMax ?? Infinity))));
  const patch = (p: Partial<Lead>) => { try { upsert<Lead>("leads", { id, ...p }, l.agentId); } catch (e) { toast.error((e as Error).message); } };
  return (
    <>
      <PageHead title={c?.name ?? "Lead"} crumbs="Sales & CRM / Leads" action={<div className="flex gap-2">
        <button className={btnGhost} onClick={() => setMsg(`Hello ${c?.name},\n\nThank you for your enquiry with Avrasya Property...`)}>Compose message</button>
        {edit && (l.dealId ? <Link to="/admin/deals" className={btnGhost}>View deal</Link> : <button className={btnPrimary} onClick={() => { try { convertLead(id); toast.success("Deal created"); nav({ to: "/admin/deals" }); } catch (e) { toast.error((e as Error).message); } }}>Convert to deal</button>)}
      </div>} />
      {msg != null && <div className="mb-4 rounded-md border bg-card p-3"><p className="mb-1 text-xs text-muted-foreground">Local draft — nothing is sent.</p><textarea className={`${field} h-28 py-2`} value={msg} onChange={(e) => setMsg(e.target.value)} />
        <div className="mt-2 flex gap-2"><button className={btnGhost} onClick={() => { navigator.clipboard.writeText(msg); toast.success("Copied"); }}>Copy</button><button className={btnGhost} onClick={() => { addActivity("message", `Message draft saved: "${msg.slice(0, 50)}…"`, { kind: "lead", id }); setMsg(null); }}>Save draft</button><button className="text-sm" onClick={() => setMsg(null)}>Close</button></div></div>}
      <div className="grid gap-4 lg:grid-cols-[260px_1fr_300px]">
        <section className="space-y-2 rounded-md border bg-card p-4 text-sm">
          <p className="text-xs text-muted-foreground">Contact</p><p>{c?.email}</p><p>{c?.phone}</p><p>Language: {c?.language}</p><p>Source: {l.source}</p><p>Agent: {userName(l.agentId)}</p>
          <label className="block">Stage<select disabled={!edit} className={field} value={l.stage} onChange={(e) => moveStage(l, e.target.value as Lead["stage"])}>{LEAD_STAGES.map((s) => <option key={s}>{s}</option>)}</select></label>
          {l.lossReason && <p className="text-xs">Loss reason: {l.lossReason}</p>}
        </section>
        <section className="rounded-md border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold">Activity timeline</h2>
          {edit && <div className="mb-3 flex gap-2"><input className={field} placeholder="Log a call note…" value={note} onChange={(e) => setNote(e.target.value)} /><button className={btnGhost} disabled={!note} onClick={() => { addActivity("call", note, { kind: "lead", id }); setNote(""); }}>Log</button></div>}
          {tl.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
          {tl.map((a) => <div key={a.id} className="border-t py-2 text-sm"><p>{a.text}</p><p className="text-xs text-muted-foreground">{userName(a.userId)} · {fmtDate(a.at, true)}</p></div>)}
        </section>
        <section className="space-y-3 rounded-md border bg-card p-4 text-sm">
          <h2 className="font-semibold">Requirements</h2>
          <div className="grid grid-cols-2 gap-2">
            <input disabled={!edit} className={field} placeholder="Districts" defaultValue={l.districts} onBlur={(e) => patch({ districts: e.target.value })} />
            <input disabled={!edit} className={field} placeholder="Layout" defaultValue={l.layout} onBlur={(e) => patch({ layout: e.target.value })} />
            <input disabled={!edit} type="number" className={field} placeholder="Min" defaultValue={l.budgetMin ?? ""} onBlur={(e) => patch({ budgetMin: e.target.value ? +e.target.value : null })} />
            <input disabled={!edit} type="number" className={field} placeholder="Max" defaultValue={l.budgetMax ?? ""} onBlur={(e) => patch({ budgetMax: e.target.value ? +e.target.value : null })} />
          </div>
          <h2 className="font-semibold">Matches <span className="font-normal text-xs text-muted-foreground">({l.currency} only · {l.layout || "any layout"} · {l.districts || "any district"})</span></h2>
          {matches.slice(0, 8).map((p) => <div key={p.id} className="flex items-center justify-between gap-2 border-t pt-2"><span className="truncate">{p.ref} · {fmtMoney(p.amount, p.currency)}</span>
            {l.shortlist.includes(p.id) ? <Status v="Shortlisted" /> : edit && <button className="text-xs text-brass-text" onClick={() => patch({ shortlist: [...l.shortlist, p.id] })}>Shortlist</button>}</div>)}
          {matches.length === 0 && <p className="text-xs text-muted-foreground">No listings match these filters in {l.currency}.</p>}
          {l.shortlist.length > 0 && <button className={btnGhost} onClick={() => window.print()}>Print shortlist</button>}
        </section>
      </div>
    </>
  );
}
