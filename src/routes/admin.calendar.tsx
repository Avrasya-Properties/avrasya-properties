import { istanbulDateTime } from "@/admin/domain.js";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHead,btnGhost, btnPrimary, field } from "@/admin/Shell";
import { USERS, can, fmtDate, upsert, useDB, useSession, userName, type Viewing } from "@/admin/store";

export const Route = createFileRoute("/admin/calendar")({ component: Calendar });
const ST: Viewing["status"][] = ["Scheduled", "Confirmed", "Completed", "Cancelled", "No-show"];

function Calendar() {
  const db = useDB(); const user = useSession();
  const [v, setV] = useState({ contactId: db.contacts[0]?.id ?? "", propertyId: db.properties[0]?.id ?? "", agentId: user!.id, start: "", hours: 1 });
  const [editing,setEditing]=useState<Viewing|null>(null);
  const list = [...db.viewings].sort((a, b) => a.start.localeCompare(b.start));
  const add = async () => {
    try {
    const start = new Date(istanbulDateTime(v.start)); const end = new Date(start.getTime() + v.hours * 36e5);
    const clash = db.viewings.find((x) => x.agentId === v.agentId && x.status !== "Cancelled" && new Date(x.start) < end && new Date(x.end) > start);
    if (clash && !confirm(`${userName(v.agentId)} already has a viewing at ${fmtDate(clash.start, true)}. Book anyway?`)) return;
    await upsert<Viewing>("viewings", { contactId: v.contactId, propertyId: v.propertyId, agentId: v.agentId, start: start.toISOString(), end: end.toISOString(), status: "Scheduled", notes: "" }, v.agentId); setV({ ...v, start: "" }); } catch (e) { toast.error((e as Error).message); }
  };
  return (
    <>
      <PageHead title="Viewings" crumbs="Clients · Agenda (Europe/Istanbul)" />
      {can(user, "edit-crm") && <div className="mb-4 grid gap-2 rounded-md border bg-card p-3 sm:grid-cols-6">
        <select className={field} value={v.contactId} onChange={(e) => setV({ ...v, contactId: e.target.value })}>{db.contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select className={`${field} sm:col-span-2`} value={v.propertyId} onChange={(e) => setV({ ...v, propertyId: e.target.value })}>{db.properties.map((p) => <option key={p.id} value={p.id}>{p.ref} · {p.title.slice(0, 40)}</option>)}</select>
        <select disabled={user?.role === "agent"} className={field} value={v.agentId} onChange={(e) => setV({ ...v, agentId: e.target.value })}>{USERS.filter((u) => u.role !== "viewer").map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
        <input type="datetime-local" aria-label="Viewing time in Istanbul (UTC+03:00)" className={field} value={v.start} onChange={(e) => setV({ ...v, start: e.target.value })} />
        <button className={btnPrimary} disabled={!v.start || !v.contactId || !v.propertyId} onClick={add}>Schedule viewing</button></div>}
      <div className="rounded-md border bg-card">{list.map((x) => (
        <div key={x.id} className="flex flex-wrap items-center gap-3 border-b p-2 text-sm last:border-0">
          <span className="w-32 tabular-nums">{fmtDate(x.start, true)}</span>
          <span className="flex-1">{db.contacts.find((c) => c.id === x.contactId)?.name} · {db.properties.find((p) => p.id === x.propertyId)?.ref}</span>
          <span className="text-xs">{userName(x.agentId)}</span>
          <select disabled={!can(user, "edit-crm", x.agentId)} className="rounded-sm border bg-card px-1 text-xs" value={x.status} onChange={async (e) => { try { await upsert<Viewing>("viewings", { id: x.id, status: e.target.value as Viewing["status"] }, x.agentId); } catch (er) { toast.error((er as Error).message); } }}>{ST.map((s) => <option key={s}>{s}</option>)}</select>{can(user,"edit-crm",x.agentId)&&<button className={btnGhost} onClick={()=>setEditing({...x})}>Edit viewing</button>}</div>))}</div>
      {editing&&<div className="fixed inset-0 z-50 overflow-auto bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="viewing-editor"><form className="mx-auto my-8 max-w-xl space-y-4 rounded border bg-card p-5" onSubmit={async e=>{e.preventDefault();try{if(new Date(editing.end)<=new Date(editing.start))throw new Error("The viewing must end after it starts.");await upsert<Viewing>("viewings",editing,editing.agentId);setEditing(null);toast.success("Viewing updated");}catch(error){toast.error((error as Error).message);}}}><h2 id="viewing-editor" className="font-semibold">Edit viewing</h2><label className="block text-sm">Buyer<select required className={field} value={editing.contactId} onChange={e=>setEditing({...editing,contactId:e.target.value})}>{db.contacts.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label className="block text-sm">Property<select required className={field} value={editing.propertyId} onChange={e=>setEditing({...editing,propertyId:e.target.value})}>{db.properties.map(p=><option key={p.id} value={p.id}>{p.ref} · {p.title}</option>)}</select></label>{(["start","end"] as const).map(key=><label key={key} className="block text-sm">{key==="start"?"Starts in Istanbul":"Ends in Istanbul"}<input required type="datetime-local" className={field} value={new Date(editing[key]).toLocaleString("sv-SE",{timeZone:"Europe/Istanbul"}).replace(" ","T").slice(0,16)} onChange={e=>e.target.value&&setEditing({...editing,[key]:istanbulDateTime(e.target.value)})}/></label>)}<label className="block text-sm">Notes<textarea className={field} value={editing.notes} onChange={e=>setEditing({...editing,notes:e.target.value})}/></label><div className="flex flex-wrap gap-2"><button className={btnPrimary}>Save viewing</button><button type="button" className={btnGhost} onClick={()=>setEditing(null)}>Cancel</button></div></form></div>}
    </>
  );
}
