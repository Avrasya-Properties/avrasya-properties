import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Bell, Building2, CalendarDays, CheckSquare, Contact2, Handshake, LayoutDashboard, LogOut, Menu, Search, Users, ExternalLink, Layers, Clock, ShieldCheck, Inbox, BarChart3, Settings2, MapPin } from "lucide-react";
import { DEMO_ENABLED, fmtDate, logout, markRead, useDB, useSession, useBackendStatus,refreshBackend } from "./store";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const NAV = [
  {
    group: "Operations",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/inquiries", label: "Enquiries", icon: Inbox, badge: "inquiries" },
      { to: "/admin/analytics", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    group: "Property listings",
    items: [
      { to: "/admin/properties", label: "Properties", icon: Building2 },
      { to: "/admin/projects", label: "Developments", icon: Layers },
      { to: "/admin/regions", label: "Cities & Regions", icon: MapPin },
    ],
  },
  {
    group: "Clients",
    items: [
      { to: "/admin/leads", label: "Buyer enquiries", icon: Users },
      { to: "/admin/contacts", label: "Contacts", icon: Contact2 },
      { to: "/admin/deals", label: "Deals", icon: Handshake },
      { to: "/admin/calendar", label: "Viewings", icon: CalendarDays },
      { to: "/admin/tasks", label: "Tasks", icon: CheckSquare },
    ],
  },
  {
    group: "Website and team",
    items: [
      { to: "/admin/manage", label: "Website and team", icon: Layers },
      { to: "/admin/settings", label: "Website settings", icon: Settings2 },
    ],
  },
] as const;

function Nav({ onNav }: { onNav?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const db = useDB();
  const user = useSession();
  const newInquiriesCount = db.inquiries?.filter((i) => i.status === "New").length ?? 0;

  return (
    <nav className="flex flex-col gap-5 px-3 py-4">
      {NAV.filter(g=>g.group!=="Website and team"||user?.role==="admin"||user?.role==="manager"||user?.role==="viewer").map((g) => (
        <div key={g.group}>
          <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-on-dark-muted/70">{g.group}</p>
          {g.items.map((it) => {
            const active = it.to === "/admin" ? path === "/admin" : path.startsWith(it.to);
            const showBadge = "badge" in it && it.badge === "inquiries" && newInquiriesCount > 0;
            return (
              <Link key={it.to} to={it.to} onClick={onNav} className={`flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors ${active ? "bg-brass/20 text-brass font-medium shadow-[inset_3px_0_0_var(--brass)]" : "text-on-dark-muted hover:bg-white/5 hover:text-on-dark"}`}>
                <div className="flex items-center gap-2.5">
                  <it.icon className={`h-4 w-4 ${active ? "text-brass" : "text-on-dark-muted"}`} />
                  <span>{it.label}</span>
                </div>
                {showBadge && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brass px-1 text-[10px] font-bold text-primary">
                    {newInquiriesCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const user = useSession();
  const backend = useBackendStatus();
  const db = useDB();
  const nav = useNavigate();
  const idleSeconds=backend.idleSeconds;
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [time, setTime] = useState("");
  const [oldBrowserData,setOldBrowserData]=useState(false);
  useEffect(()=>{if(!DEMO_ENABLED){try{setOldBrowserData(localStorage.getItem("avrasya-admin-db-v4")!==null);}catch{}}},[]);

  useEffect(() => {
    const update = () => {
      try {
        setTime(new Intl.DateTimeFormat("en-GB", {
          timeZone: "Europe/Istanbul",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        }).format(new Date()));
      } catch {
        setTime("");
      }
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  type Hit = { k: string; label: string; go: () => void };
  const results = useMemo<Hit[]>(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    const has = (...v: (string | null | undefined)[]) => v.some((x) => x?.toLowerCase().includes(s));
    const cName = (id: string) => db.contacts.find((c) => c.id === id)?.name ?? "";
    return [
      ...db.properties.filter((p) => has(p.title, p.ref, p.district)).map((p) => ({ k: "Property", label: `${p.ref} · ${p.title}`, go: () => nav({ to: "/admin/properties/$id", params: { id: p.id } }) })),
      ...db.contacts.filter((c) => has(c.name, c.email, c.phone)).map((c) => ({ k: "Contact", label: c.name, go: () => nav({ to: "/admin/contacts" }) })),
      ...db.leads.filter((l) => has(cName(l.contactId), l.districts)).map((l) => ({ k: "Lead", label: `${cName(l.contactId)} · ${l.stage}`, go: () => nav({ to: "/admin/leads/$id", params: { id: l.id } }) })),
      ...db.deals.filter((d) => has(d.title)).map((d) => ({ k: "Deal", label: d.title, go: () => nav({ to: "/admin/deals" }) })),
    ].slice(0, 8);
  }, [q, db, nav]);

  const notes = useMemo(() => {
    const now = new Date().toISOString();
    return [
      ...db.tasks.filter((t) => !t.done && t.due < now).map((t) => ({ id: `task-${t.id}`, text: `Overdue task: ${t.title} (${fmtDate(t.due)})`, to: "/admin/tasks" as const })),
      ...db.leads.filter((l) => l.stage === "New").map((l) => ({ id: `lead-${l.id}`, text: `New enquiry: ${db.contacts.find((c) => c.id === l.contactId)?.name ?? "Unknown"}`, to: "/admin/leads" as const })),
      ...db.properties.filter((p) => p.publication === "In Review").map((p) => ({ id: `rev-${p.id}`, text: `Listing awaiting review: ${p.ref}`, to: "/admin/properties" as const })),
    ].slice(0, 12);
  }, [db]);
  const unread = notes.filter((n) => !db.readNotes.includes(n.id));

  const sidebar = (
    <div className="flex h-full flex-col bg-ink text-on-dark border-r border-white/10">
      <div className="flex h-[68px] items-center gap-2.5 px-4 border-b border-white/10">
        <img src="/images/avrasya-logo-white.svg" alt="Avrasya Properties" className="h-7 w-auto object-contain" />
        <span className="rounded bg-brass/20 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-widest text-brass">ADMIN</span>
      </div>
      <Nav onNav={() => setOpen(false)} />
      <div className="mt-auto p-4 border-t border-white/10 text-[11px] text-on-dark-muted/80">
        <div className="flex items-center gap-1.5 text-xs text-on-dark">
          <ShieldCheck className="h-3.5 w-3.5 text-brass" />
          <span>Avrasya Internal Workspace</span>
        </div>
        <p className="mt-1">{DEMO_ENABLED ? "Demo sandbox · Saved in this browser" : "Live data · Saved to the shared database"}</p>
      </div>
    </div>
  );

  return (
    <div data-admin-mode={DEMO_ENABLED?"demo":"live"} className="admin-workspace flex min-h-screen bg-background font-sans text-foreground">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 md:block">{sidebar}</aside>
      <Sheet open={open} onOpenChange={setOpen}><SheetContent side="left" className="w-64 p-0">{sidebar}</SheetContent></Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-[60px] items-center gap-1.5 border-b bg-card px-2 sm:gap-3 sm:px-4">
          <button className="flex h-11 w-11 shrink-0 items-center justify-center md:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
          <div className="relative min-w-0 max-w-md flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search properties, contacts, leads, deals" className="h-9 w-full rounded-sm border bg-background pl-8 pr-2 text-sm outline-none focus:border-brass" />
            {results.length > 0 && (
              <div className="absolute mt-1 w-full rounded-sm border bg-popover shadow-sm">
                {results.map((r, i) => <button key={i} onClick={() => { r.go(); setQ(""); }} className="flex w-full gap-2 px-3 py-2 text-left text-sm hover:bg-muted"><span className="w-16 text-xs text-muted-foreground">{r.k}</span>{r.label}</button>)}
              </div>
            )}
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
            {time && (
              <div className="hidden items-center gap-1.5 rounded-full border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground lg:flex">
                <Clock className="h-3 w-3 text-brass" />
                <span>Istanbul {time} TRT</span>
              </div>
            )}
            <a href="/" target="_blank" rel="noreferrer" aria-label="Open website" className="flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-sm border px-2.5 py-1 text-xs text-muted-foreground hover:border-brass hover:text-foreground">
              <ExternalLink className="h-3.5 w-3.5 text-brass" />
              <span className="hidden sm:inline">Website</span>
            </a>
            <Popover>
              <PopoverTrigger className="relative flex h-11 w-11 items-center justify-center" aria-label="Notifications"><Bell className="h-5 w-5" />{unread.length > 0 && <span className="absolute right-0 top-0 rounded-full bg-brass px-1 text-[10px] text-primary-foreground">{unread.length}</span>}</PopoverTrigger>
              <PopoverContent align="end" className="max-w-[calc(100vw-2rem)] w-80 p-0">
                <div className="flex justify-between border-b px-3 py-2 text-sm"><b>Notifications</b><button className="text-brass-text" onClick={async () => { try { await markRead(notes.map((n) => n.id), true); } catch(error) { toast.error((error as Error).message); } }}>Mark all read</button></div>
                {notes.length === 0 && <p className="p-3 text-sm text-muted-foreground">Nothing needs attention.</p>}
                {notes.map((n) => { const r = db.readNotes.includes(n.id); return (
                  <div key={n.id} className="flex items-center gap-2 border-b px-3 py-2 text-sm last:border-0">
                    <Link to={n.to} className={`flex-1 ${r ? "text-muted-foreground" : "font-medium"}`}>{n.text}</Link>
                    <button className="text-xs text-muted-foreground" onClick={async () => { try { await markRead([n.id], !r); } catch(error) { toast.error((error as Error).message); } }}>{r ? "Unread" : "Read"}</button>
                  </div>); })}
              </PopoverContent>
            </Popover>
            <div className="hidden text-right text-xs leading-tight sm:block"><div className="font-medium">{user?.name}</div><div className="capitalize text-muted-foreground">{user?.role}{DEMO_ENABLED ? " (demo)" : ""}</div></div>
            <button className="flex h-11 w-11 items-center justify-center" onClick={async () => { try { await logout(); } catch(error) { toast.error((error as Error).message); } nav({ to: "/admin/login", search: { redirect: undefined } }); }} aria-label="Log out"><LogOut className="h-4 w-4" /></button>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-6">{backend.error&&<div role="alert" className="mb-3 rounded border border-destructive/30 bg-card p-3 text-sm">The workspace could not refresh: {backend.error}. Your open edits are kept. <button className="underline" onClick={()=>void refreshBackend()}>Try again</button></div>}{idleSeconds>0&&<div role="alert" className="mb-3 rounded border border-brass bg-card p-3 text-sm">You have been inactive. Sign out in {idleSeconds} seconds. <button className="underline" onClick={()=>window.dispatchEvent(new Event("input"))}>Keep working</button></div>}{oldBrowserData&&<p role="status" className="mb-3 rounded border bg-muted p-3 text-sm">Earlier browser-only data was found. It has not been published or imported. Add or edit properties in this live panel to save them to the shared website database.</p>}{backend.saving > 0 && <p role="status" className="mb-3 text-sm">Saving changes…</p>}<fieldset disabled={backend.saving > 0} className="min-w-0">{children}</fieldset></main>
      </div>
    </div>
  );
}

export function PageHead({ title, crumbs, action }: { title: string; crumbs?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0"><p className="break-words text-xs text-muted-foreground">Admin{crumbs ? ` / ${crumbs}` : ""}</p><h1 className="break-words text-xl font-semibold">{title}</h1></div>
      {action&&<div data-page-actions className="max-w-full">{action}</div>}
    </div>
  );
}
export function Status({ v }: { v: string }) {
  const tone = /Published|Available|Won|Completed|Converted/.test(v) ? "border-primary/40 text-primary" : /Lost|Sold|Cancelled|Archived|No-show/.test(v) ? "border-border text-muted-foreground" : /Review|Offer|Reserved|Overdue/.test(v) ? "border-brass text-brass-text" : "border-border text-foreground";
  return <span className={`inline-block whitespace-nowrap rounded-sm border px-1.5 py-0.5 text-[11px] ${tone}`}>{v}</span>;
}
export const btn = "inline-flex min-h-11 items-center gap-1.5 rounded-sm px-3 py-2 text-sm font-medium disabled:opacity-40";
export const btnPrimary = `${btn} bg-brass text-primary-foreground hover:opacity-90`;
export const btnGhost = `${btn} border bg-card hover:bg-muted`;
export const field = "h-9 w-full rounded-sm border bg-card px-2 text-sm outline-none focus:border-brass";
