import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead, Status } from "@/admin/Shell";
import { fmtDate, fmtMoney, useDB, userName } from "@/admin/store";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const db = useDB();
  const [range, setRange] = useState(7);
  const now = Date.now(); const ms = range * 864e5;
  const upcoming = db.viewings.filter((v) => { const t = new Date(v.start).getTime(); return t >= now - 36e5 && t < now + ms && v.status !== "Cancelled"; });
  const openDeals = db.deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost");
  const byCur: Record<string, number> = {};
  openDeals.forEach((d) => d.amount != null && (byCur[d.currency] = (byCur[d.currency] ?? 0) + d.amount));
  const overdue = db.tasks.filter((t) => !t.done && new Date(t.due).getTime() < now);
  const today = db.viewings.filter((v) => new Date(v.start).toDateString() === new Date().toDateString());
  const metric = (label: string, value: string, to: string, note: string) => (
    <Link to={to} className="rounded-md border bg-card p-4 hover:border-brass"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p><p className="text-[11px] text-muted-foreground">{note}</p></Link>
  );
  return (
    <>
      <PageHead title="Dashboard" action={<select className="h-9 rounded-sm border bg-card px-2 text-sm" value={range} onChange={(e) => setRange(+e.target.value)}><option value={1}>Next 24 hours</option><option value={7}>Next 7 days</option><option value={30}>Next 30 days</option></select>} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metric("Active listings", String(db.properties.filter((p) => p.publication === "Published" && p.availability !== "Sold").length), "/admin/properties", "Current snapshot")}
        {metric("New enquiries", String(db.leads.filter((l) => l.stage === "New").length), "/admin/leads", "Current snapshot")}
        {metric("Upcoming viewings", String(upcoming.length), "/admin/calendar", `In selected range`)}
        <Link to="/admin/deals" className="rounded-md border bg-card p-4 hover:border-brass"><p className="text-xs text-muted-foreground">Open deals by currency</p>
          {Object.keys(byCur).length === 0 ? <p className="mt-1 text-2xl">—</p> : Object.entries(byCur).map(([c, v]) => <p key={c} className="mt-1 text-lg font-semibold tabular-nums">{fmtMoney(v, c)}</p>)}
          <p className="text-[11px] text-muted-foreground">{openDeals.length} open · not converted</p></Link>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-md border bg-card p-4"><h2 className="mb-2 text-sm font-semibold">Today's schedule</h2>
          {today.length === 0 && <p className="text-sm text-muted-foreground">No viewings today.</p>}
          {today.map((v) => <Link key={v.id} to="/admin/calendar" className="flex justify-between border-t py-2 text-sm"><span>{fmtDate(v.start, true)} · {db.properties.find((p) => p.id === v.propertyId)?.ref}</span><Status v={v.status} /></Link>)}
        </section>
        <section className="rounded-md border bg-card p-4"><h2 className="mb-2 text-sm font-semibold">Overdue follow-ups</h2>
          {overdue.length === 0 && <p className="text-sm text-muted-foreground">All caught up.</p>}
          {overdue.map((t) => <Link key={t.id} to="/admin/tasks" className="flex justify-between border-t py-2 text-sm"><span>{t.title}</span><span className="text-xs text-destructive">Due {fmtDate(t.due)}</span></Link>)}
        </section>
        <section className="rounded-md border bg-card p-4"><h2 className="mb-2 text-sm font-semibold">Listings awaiting review</h2>
          {db.properties.filter((p) => p.publication === "In Review").map((p) => <Link key={p.id} to="/admin/properties/$id" params={{ id: p.id }} className="flex justify-between border-t py-2 text-sm"><span className="truncate">{p.ref} · {p.title}</span><Status v="In Review" /></Link>)}
        </section>
        <section className="rounded-md border bg-card p-4"><h2 className="mb-2 text-sm font-semibold">Recent activity</h2>
          {db.activity.slice(0, 8).map((a) => <div key={a.id} className="flex justify-between gap-3 border-t py-2 text-sm"><span>{a.text}</span><span className="whitespace-nowrap text-xs text-muted-foreground">{userName(a.userId)} · {fmtDate(a.at, true)}</span></div>)}
        </section>
      </div>
    </>
  );
}
