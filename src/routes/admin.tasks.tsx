import { istanbulDateTime } from "@/admin/domain.js";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHead, btnGhost, btnPrimary, field } from "@/admin/Shell";
import { USERS, addActivity, can, fmtDate, upsert, useDB, useSession, userName, type Task } from "@/admin/store";

export const Route = createFileRoute("/admin/tasks")({ component: Tasks });

function Tasks() {
  const db = useDB(); const user = useSession();
  const [view, setView] = useState<"mine" | "overdue" | "all">("all");
  const [t, setT] = useState({ title: "", due: "", assigneeId: user!.id, priority: "Normal" as Task["priority"] });
  const [editing,setEditing]=useState<Task|null>(null);
  const now = new Date();
  const list = db.tasks.filter((x) => view === "all" || (view === "mine" ? x.assigneeId === user!.id : !x.done && new Date(x.due) < now));
  const run = async (f: () => void | Promise<unknown>) => { try { await f(); } catch (e) { toast.error((e as Error).message); } };
  const toggle = (x: Task) => run(async () => { await upsert<Task>("tasks", { id: x.id, done: !x.done }, x.assigneeId); if (x.link) await addActivity("task", `Task ${x.done ? "reopened" : "completed"}: ${x.title}`, x.link); });
  return (
    <>
      <PageHead title="Tasks" crumbs="Clients" />
      <div className="mb-3 flex gap-2">{(["mine", "overdue", "all"] as const).map((v) => <button key={v} className={view === v ? btnPrimary : btnGhost} onClick={() => setView(v)}>{v === "mine" ? "My tasks" : v === "overdue" ? "Overdue" : "All"}</button>)}</div>
      {can(user, "edit-crm") && <div className="mb-3 grid gap-2 rounded-md border bg-card p-3 sm:grid-cols-5">
        <input className={`${field} sm:col-span-2`} placeholder="Task title" aria-label="Task title" value={t.title} onChange={(e) => setT({ ...t, title: e.target.value })} />
        <input type="datetime-local" aria-label="Due time in Istanbul (UTC+03:00)" className={field} value={t.due} onChange={(e) => setT({ ...t, due: e.target.value })} />
        <select disabled={user?.role === "agent"} className={field} value={t.assigneeId} onChange={(e) => setT({ ...t, assigneeId: e.target.value })}>{USERS.filter((u) => u.role !== "viewer").map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
        <button className={btnPrimary} disabled={!t.title || !t.due} onClick={() => run(async () => { await upsert<Task>("tasks", { ...t, due: istanbulDateTime(t.due), done: false }, t.assigneeId); setT({ ...t, title: "", due: "" }); })}>Add task</button></div>}
      <div className="rounded-md border bg-card">{list.map((x) => (
        <div key={x.id} className="flex flex-wrap items-center gap-3 border-b p-2 text-sm last:border-0">
          <input type="checkbox" checked={x.done} disabled={!can(user, "edit-crm", x.assigneeId)} onChange={() => toggle(x)} aria-label="Complete" />
          <span className={`flex-1 ${x.done ? "text-muted-foreground line-through" : ""}`}>{x.title}</span>
          <span className="text-xs">{x.priority}</span><span className="w-28 text-xs">{userName(x.assigneeId)}</span>
          <span className={`w-28 text-xs ${!x.done && new Date(x.due) < now ? "text-destructive" : ""}`}>{fmtDate(x.due, true)}</span>{can(user,"edit-crm",x.assigneeId)&&<button className={btnGhost} onClick={()=>setEditing({...x})}>Edit task</button>}</div>))}
        {list.length === 0 && <p className="p-3 text-sm text-muted-foreground">No tasks in this view.</p>}</div>
      {editing&&<div className="fixed inset-0 z-50 overflow-auto bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="task-editor"><form className="mx-auto my-8 max-w-xl space-y-4 rounded border bg-card p-5" onSubmit={e=>{e.preventDefault();void run(async()=>{await upsert<Task>("tasks",editing,editing.assigneeId);setEditing(null);toast.success("Task updated");});}}><h2 id="task-editor" className="font-semibold">Edit task</h2><label className="block text-sm">Task title<input required className={field} value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})}/></label><label className="block text-sm">Due time in Istanbul<input required type="datetime-local" className={field} value={new Date(editing.due).toLocaleString("sv-SE",{timeZone:"Europe/Istanbul"}).replace(" ","T").slice(0,16)} onChange={e=>e.target.value&&setEditing({...editing,due:istanbulDateTime(e.target.value)})}/></label><label className="block text-sm">Priority<select className={field} value={editing.priority} onChange={e=>setEditing({...editing,priority:e.target.value as Task["priority"]})}>{["Low","Normal","High"].map(p=><option key={p}>{p}</option>)}</select></label><label className="block text-sm">Assigned to<select className={field} disabled={user?.role==="agent"} value={editing.assigneeId} onChange={e=>setEditing({...editing,assigneeId:e.target.value})}>{USERS.filter(u=>u.role!=="viewer").map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></label><div className="flex flex-wrap gap-2"><button className={btnPrimary}>Save task</button><button type="button" className={btnGhost} onClick={()=>setEditing(null)}>Cancel</button></div></form></div>}
    </>
  );
}
