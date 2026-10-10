import { createFileRoute, Link } from "@tanstack/react-router";
import { currencyTotals } from "@/admin/domain.js";
import { useState } from "react";
import { Building2, CalendarCheck, CheckCircle2, ChevronRight, Clock, DollarSign, Eye, Flame, Layers, Plus, TrendingUp, Users } from "lucide-react";
import { PageHead, Status, btnPrimary } from "@/admin/Shell";
import { Thumb } from "@/routes/admin.properties.index";
import { can, fmtDate, fmtMoney, useSession, useDB, userName, upsert, type Task, type Viewing } from "@/admin/store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

export function Dashboard() {
  const db = useDB(); const user = useSession();
  const [range, setRange] = useState(7);
  const now = Date.now();
  const ms = range * 864e5;

  const upcoming = db.viewings.filter((v) => {
    const t = new Date(v.start).getTime();
    return t >= now - 36e5 && t < now + ms && ["Scheduled", "Confirmed"].includes(v.status);
  });

  const openDeals = db.deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost");
  const pipelineTotals = currencyTotals(openDeals);

  const overdue = db.tasks.filter((t) => !t.done && new Date(t.due).getTime() < now);
  const dateKey = (value: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(value);
  const today = db.viewings.filter((v) => ["Scheduled", "Confirmed"].includes(v.status) && dateKey(new Date(v.start)) === dateKey(new Date()));
  const awaitingReview = db.properties.filter((p) => p.publication === "In Review");
  const activeListings = db.properties.filter((p) => p.publication === "Published" && !["Sold", "Rented", "Off Market"].includes(p.availability));

  // Lead stages distribution
  const leadStages = ["New", "Contacted", "Qualified", "Viewing", "Negotiation", "Converted"] as const;
  const leadCounts = leadStages.map((stage) => ({
    stage,
    count: db.leads.filter((l) => l.stage === stage).length,
  }));
  const maxLeadCount = Math.max(...leadCounts.map((s) => s.count), 1);

  const toggleTask = (t: Task) => {
    try {
      upsert<Task>("tasks", { id: t.id, done: !t.done });
      toast.success(t.done ? "Task reopened" : "Task completed");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const confirmViewing = (v: Viewing) => {
    try {
      upsert<Viewing>("viewings", { id: v.id, status: "Confirmed" });
      toast.success("Viewing marked confirmed; no message was sent");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHead
        title="Command Center"
        crumbs="Operations & Pipeline"
        action={
          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded-md border bg-card px-2.5 text-xs font-medium text-foreground outline-none focus:border-brass"
              value={range}
              onChange={(e) => setRange(+e.target.value)}
            >
              <option value={1}>Window: Next 24 hours</option>
              <option value={7}>Window: Next 7 days</option>
              <option value={30}>Window: Next 30 days</option>
            </select>
            <Link to="/admin/properties" className={btnPrimary}>
              <Plus className="h-3.5 w-3.5" />
              <span>Add Listing</span>
            </Link>
          </div>
        }
      />

      {/* Top Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Link
          to="/admin/deals"
          className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all hover:border-brass hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Pipeline</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass/10 text-brass">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {Object.entries(pipelineTotals).map(([currency, amount]) => <span key={currency} className="block">{fmtMoney(amount, currency)}</span>)}
            {Object.keys(pipelineTotals).length === 0 && "No agreed amounts"}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{openDeals.length} active negotiations</span>
            <span className="flex items-center text-emerald-600 font-medium">
              <TrendingUp className="mr-0.5 h-3 w-3" /> Demo
            </span>
          </div>
        </Link>

        <Link
          to="/admin/properties"
          className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all hover:border-brass hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Listings</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass/10 text-brass">
              <Building2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {activeListings.length}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{db.properties.length} total inventory items</span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">{db.properties.filter(p => p.publication === "In Review").length} review</span>
          </div>
        </Link>

        <Link
          to="/admin/leads"
          className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all hover:border-brass hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Leads</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass/10 text-brass">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {db.leads.filter((lead) => !["Lost", "Converted"].includes(lead.stage)).length}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{db.leads.filter(l => l.stage === "New").length} new enquiries</span>
            <span className="text-brass font-medium flex items-center">
              <Flame className="mr-0.5 h-3 w-3" /> Qualified
            </span>
          </div>
        </Link>

        <Link
          to="/admin/inquiries"
          className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all hover:border-brass hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Recorded Inquiries</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass/10 text-brass">
              <Flame className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {db.inquiries?.length || 0}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="text-brass font-medium">{db.inquiries?.filter(i => i.status === "New").length || 0} new pending</span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Inbox →</span>
          </div>
        </Link>

        <Link
          to="/admin/calendar"
          className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all hover:border-brass hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Scheduled Viewings</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass/10 text-brass">
              <CalendarCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {upcoming.length}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{today.length} scheduled today</span>
            <span className="text-muted-foreground text-[11px]">{range} day window</span>
          </div>
        </Link>
      </div>

      {/* Visual Pipeline Funnel & Fast Highlights */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* CRM Pipeline Funnel */}
        <section className="rounded-xl border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Buyer Acquisition Pipeline</h2>
              <p className="text-xs text-muted-foreground">Stage conversion across international purchaser leads</p>
            </div>
            <Link to="/admin/leads" className="text-xs font-medium text-brass hover:underline flex items-center">
              View Kanban <ChevronRight className="ml-0.5 h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {leadCounts.map(({ stage, count }) => (
              <div key={stage} className="rounded-lg border bg-muted/30 p-3 text-center">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{stage}</p>
                <p className="mt-1.5 text-xl font-bold tabular-nums text-foreground">{count}</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brass transition-all duration-500"
                    style={{ width: `${(count / maxLeadCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Listing Inventory Preview */}
          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prime Inventory Spotlight</h3>
              <Link to="/admin/properties" className="text-xs text-brass hover:underline">
                All {db.properties.length} listings →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {db.properties.slice(0, 3).map((p) => (
                <Link
                  key={p.id}
                  to="/admin/properties/$id"
                  params={{ id: p.id }}
                  className="group flex flex-col rounded-lg border bg-background p-2.5 transition-colors hover:border-brass"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden rounded bg-muted">
                    {p.cover ? (
                      <img src={p.cover} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-[10px] font-mono text-brass">{p.ref}</p>
                    <p className="truncate text-xs font-semibold text-foreground">{p.title}</p>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="font-semibold tabular-nums">{fmtMoney(p.amount, p.currency)}</span>
                      <Status v={p.availability} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Priority Schedule & Pending Actions */}
        <section className="space-y-4">
          {/* Today's Schedule Card */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-brass" />
                <span>Today's Schedule</span>
              </h2>
              <span className="rounded-full bg-brass/10 px-2 py-0.5 text-[10px] font-medium text-brass">
                {today.length} appointments
              </span>
            </div>
            <div className="mt-3 divide-y">
              {today.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">No property viewings booked for today.</p>
              ) : (
                today.map((v) => {
                  const prop = db.properties.find((p) => p.id === v.propertyId);
                  const contact = db.contacts.find((c) => c.id === v.contactId);
                  return (
                    <div key={v.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{contact?.name || "Client"}</p>
                        <p className="text-[11px] text-muted-foreground">{prop?.title} ({fmtDate(v.start, true)})</p>
                      </div>
                      {v.status !== "Confirmed" ? (
                        <button
                          disabled={!can(user, "edit-crm", v.agentId)}
                          onClick={() => confirmViewing(v)}
                          className="shrink-0 rounded bg-brass/10 px-2 py-1 text-[11px] font-medium text-brass hover:bg-brass hover:text-primary-foreground transition-colors"
                        >
                          Confirm
                        </button>
                      ) : (
                        <span className="shrink-0 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                          Confirmed
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Overdue Tasks */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-semibold text-foreground">Action Tasks</h2>
              <span className="text-xs text-destructive font-medium">{overdue.length} overdue</span>
            </div>
            <div className="mt-3 divide-y">
              {overdue.length === 0 && db.tasks.length === 0 ? (
                <p className="py-3 text-xs text-muted-foreground text-center">All client follow-ups are up to date.</p>
              ) : (
                (overdue.length > 0 ? overdue : db.tasks.slice(0, 3)).map((t) => (
                  <div key={t.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        disabled={!can(user, "edit-crm", t.assigneeId)}
                        aria-label={t.done ? "Reopen task" : "Complete task"}
                        onClick={() => toggleTask(t)}
                        className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                          t.done ? "bg-brass text-primary-foreground border-brass" : "hover:border-brass"
                        }`}
                      >
                        {t.done && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                      <span className={`text-xs truncate ${t.done ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>
                        {t.title}
                      </span>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      Due {fmtDate(t.due)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Listings Awaiting Review & Activity Log */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-sm font-semibold text-foreground">Listings Awaiting Editorial Review</h2>
            <Link to="/admin/properties" className="text-xs text-brass hover:underline">
              Inventory →
            </Link>
          </div>
          <div className="mt-3 divide-y">
            {awaitingReview.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">All inventory listings are published or drafted cleanly.</p>
            ) : (
              awaitingReview.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Thumb p={p} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{p.title}</p>
                      <p className="text-[11px] text-muted-foreground">{p.ref} · {p.district}</p>
                    </div>
                  </div>
                  <Link
                    to="/admin/properties/$id"
                    params={{ id: p.id }}
                    className="shrink-0 rounded-md border bg-card px-2.5 py-1 text-xs font-medium hover:border-brass hover:text-brass transition-colors"
                  >
                    Review
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-sm font-semibold text-foreground">Audit Log & Agent Activity</h2>
            <span className="text-[11px] text-muted-foreground">Browser demo history</span>
          </div>
          <div className="mt-3 divide-y">
            {db.activity.slice(0, 6).map((a) => (
              <div key={a.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <span className="text-foreground truncate">{a.text}</span>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {userName(a.userId)} · {fmtDate(a.at, true)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
