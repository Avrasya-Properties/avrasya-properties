import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity as ActivityIcon,
  ArrowRight,
  Clock,
  Database,
  Eye,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { PageHead, btnGhost, btnPrimary, field } from "@/admin/Shell";
import { DEMO_ENABLED, fmtDate, useDB, useSession, USERS, userName } from "@/admin/store";
import { managedRows } from "@/admin/management";
import type { Row } from "@/admin/mappers";

export type AuditEventRecord = {
  id: string;
  actor_id?: string | undefined;
  actor_name?: string | undefined;
  actor_role?: string | undefined;
  action: "CREATE" | "UPDATE" | "DELETE" | "PUBLISH" | string;
  target_table: string;
  target_id?: string | undefined;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  created_at: string;
  summary?: string | undefined;
};

export const Route = createFileRoute("/admin/activity")({
  component: AdminActivityPage,
});

export const AUDIT_ACTIONS = ["ALL", "CREATE", "UPDATE", "DELETE", "PUBLISH"] as const;
export const AUDIT_ENTITIES = [
  "ALL",
  "marketing_offers",
  "site_settings",
  "services",
  "content_pages",
  "content_sections",
  "enquiries",
] as const;

export function AdminActivityPage() {
  const db = useDB();
  const session = useSession();
  const [remoteEvents, setRemoteEvents] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [actorFilter, setActorFilter] = useState<string>("ALL");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [entityFilter, setEntityFilter] = useState<string>("ALL");
  const [inspectEvent, setInspectEvent] = useState<AuditEventRecord | null>(null);

  const fetchAuditEvents = async () => {
    setLoading(true);
    try {
      const rows = await managedRows("audit_events");
      setRemoteEvents(rows || []);
    } catch {
      // Handled cleanly via demo fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAuditEvents();
  }, []);

  // Combine and normalize audit events from managedRows and db.activity
  const allEvents = useMemo<AuditEventRecord[]>(() => {
    const list: AuditEventRecord[] = [];

    // 1. Process records from audit_events table
    for (const row of remoteEvents) {
      const actorId = String(row["actor_id"] || "");
      const actionRaw = String(row["action"] || "UPDATE").toUpperCase();
      let normalizedAction: AuditEventRecord["action"] = "UPDATE";
      if (actionRaw.includes("CREATE") || actionRaw.includes("INSERT")) normalizedAction = "CREATE";
      else if (actionRaw.includes("DELETE") || actionRaw.includes("REMOVE"))
        normalizedAction = "DELETE";
      else if (actionRaw.includes("PUBLISH")) normalizedAction = "PUBLISH";
      else if (actionRaw.includes("UPDATE")) normalizedAction = "UPDATE";
      else normalizedAction = actionRaw;

      const targetTable = String(row["target_table"] || row["table_name"] || "marketing_offers");
      const oldVals =
        row["old_values"] && typeof row["old_values"] === "object"
          ? (row["old_values"] as Record<string, unknown>)
          : null;
      const newVals =
        row["new_values"] && typeof row["new_values"] === "object"
          ? (row["new_values"] as Record<string, unknown>)
          : null;

      list.push({
        id: String(row["id"] || `ae-${Math.random()}`),
        actor_id: actorId,
        actor_name: userName(actorId),
        actor_role: String(row["actor_role"] || "admin"),
        action: normalizedAction,
        target_table: targetTable,
        target_id: String(row["target_id"] || ""),
        old_values: oldVals,
        new_values: newVals,
        created_at: String(row["created_at"] || new Date().toISOString()),
        summary: String(row["action"]),
      });
    }

    // 2. Synthesize events from db.activity for comprehensive demo/local audit trail
    if (db.activity && Array.isArray(db.activity)) {
      for (const act of db.activity) {
        let action: AuditEventRecord["action"] = "UPDATE";
        let targetTable = "marketing_offers";
        const textLower = act.text.toLowerCase();

        if (textLower.includes("created")) action = "CREATE";
        else if (textLower.includes("deleted")) action = "DELETE";
        else if (textLower.includes("published") || textLower.includes("publication"))
          action = "PUBLISH";

        if (act.kind === "properties") targetTable = "marketing_offers";
        else if (act.kind === "inquiry" || act.kind === "inquiries") targetTable = "enquiries";
        else if (act.kind === "site-settings" || act.kind === "settings")
          targetTable = "site_settings";
        else if (act.kind === "services") targetTable = "services";
        else if (act.kind === "pages") targetTable = "content_pages";

        list.push({
          id: `act-${act.id}`,
          actor_id: act.userId,
          actor_name: userName(act.userId),
          actor_role: USERS.find((u) => u.id === act.userId)?.role || "agent",
          action,
          target_table: targetTable,
          target_id: act.ref?.id || undefined,
          old_values: null,
          new_values: { summary: act.text, kind: act.kind },
          created_at: act.at,
          summary: act.text,
        });
      }
    }

    // Sort newest first
    return list.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [remoteEvents, db.activity]);

  // Apply filters
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      if (actorFilter !== "ALL" && ev.actor_id !== actorFilter) return false;
      if (actionFilter !== "ALL" && ev.action !== actionFilter) return false;
      if (entityFilter !== "ALL" && ev.target_table !== entityFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesSummary = (ev.summary || "").toLowerCase().includes(q);
        const matchesActor = (ev.actor_name || "").toLowerCase().includes(q);
        const matchesTable = ev.target_table.toLowerCase().includes(q);
        const matchesId = (ev.target_id || "").toLowerCase().includes(q);
        if (!matchesSummary && !matchesActor && !matchesTable && !matchesId) return false;
      }
      return true;
    });
  }, [allEvents, actorFilter, actionFilter, entityFilter, search]);

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
      case "UPDATE":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30";
      case "DELETE":
        return "bg-destructive/15 text-destructive border-destructive/30";
      case "PUBLISH":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      <PageHead
        title="Administrative Activity Log"
        crumbs="Operations / Audit Trail"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAuditEvents()}
              disabled={loading}
              className={btnGhost}
              title="Refresh audit events"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-brass" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      {/* Metrics Banner */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Events
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{allEvents.length}</p>
          <p className="text-[11px] text-muted-foreground">Recorded audit entries</p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
            Creations
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-600">
            {allEvents.filter((e) => e.action === "CREATE").length}
          </p>
          <p className="text-[11px] text-muted-foreground">New records added</p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
            Updates
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {allEvents.filter((e) => e.action === "UPDATE").length}
          </p>
          <p className="text-[11px] text-muted-foreground">Modifications applied</p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">
            Publish Actions
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-amber-600">
            {allEvents.filter((e) => e.action === "PUBLISH").length}
          </p>
          <p className="text-[11px] text-muted-foreground">Catalogue & CMS releases</p>
        </div>
      </div>

      {/* Filtering Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-56">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              className={`${field} pl-8`}
              placeholder="Search actions, records, actors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Actor filter */}
          <select
            className={`${field} w-44`}
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
          >
            <option value="ALL">All Staff Members</option>
            {USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>

          {/* Action filter */}
          <select
            className={`${field} w-36`}
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            {AUDIT_ACTIONS.map((act) => (
              <option key={act} value={act}>
                {act === "ALL" ? "All Actions" : act}
              </option>
            ))}
          </select>

          {/* Target entity filter */}
          <select
            className={`${field} w-44`}
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          >
            {AUDIT_ENTITIES.map((ent) => (
              <option key={ent} value={ent}>
                {ent === "ALL" ? "All Entities" : ent.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {(search || actorFilter !== "ALL" || actionFilter !== "ALL" || entityFilter !== "ALL") && (
          <button
            onClick={() => {
              setSearch("");
              setActorFilter("ALL");
              setActionFilter("ALL");
              setEntityFilter("ALL");
            }}
            className={`${btnGhost} text-xs text-muted-foreground hover:text-foreground`}
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Main Audit Records Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Staff Member</th>
                <th className="p-3">Action</th>
                <th className="p-3">Target Entity</th>
                <th className="p-3">Summary / Details</th>
                <th className="p-3 text-right">Payload Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No activity logs match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => (
                  <tr key={ev.id} className="transition-colors hover:bg-muted/40">
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                      {fmtDate(ev.created_at, true)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium text-foreground">{ev.actor_name}</span>
                        {ev.actor_role && (
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {ev.actor_role}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getActionBadgeColor(ev.action)}`}
                      >
                        {ev.action}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-xs text-brass font-medium">
                        {ev.target_table}
                      </span>
                    </td>
                    <td className="p-3 max-w-md truncate text-xs text-foreground">
                      {ev.summary || `${ev.action} on ${ev.target_table}`}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setInspectEvent(ev)}
                        className={`${btnGhost} !px-2 !py-1 text-xs gap-1`}
                        title="Inspect state diff and payload values"
                      >
                        <Eye className="h-3.5 w-3.5 text-brass" />
                        <span>Inspect Diff</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diff / Payload Inspector Modal */}
      {inspectEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="diff-dialog-title"
        >
          <div className="w-full max-w-3xl rounded-xl border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3
                  id="diff-dialog-title"
                  className="text-base font-semibold text-foreground flex items-center gap-2"
                >
                  <Database className="h-4 w-4 text-brass" />
                  <span>Audit Event Payload Inspector</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ID: <span className="font-mono">{inspectEvent.id}</span> ·{" "}
                  {fmtDate(inspectEvent.created_at, true)}
                </p>
              </div>
              <button
                onClick={() => setInspectEvent(null)}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Event Metadata Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="rounded border bg-muted/20 p-2.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Action
                </span>
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold mt-1 ${getActionBadgeColor(inspectEvent.action)}`}
                >
                  {inspectEvent.action}
                </span>
              </div>
              <div className="rounded border bg-muted/20 p-2.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Target Table
                </span>
                <span className="font-mono text-xs font-semibold text-brass mt-1 block">
                  {inspectEvent.target_table}
                </span>
              </div>
              <div className="rounded border bg-muted/20 p-2.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Actor
                </span>
                <span className="font-medium text-foreground mt-1 block">
                  {inspectEvent.actor_name} ({inspectEvent.actor_role})
                </span>
              </div>
              <div className="rounded border bg-muted/20 p-2.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Target ID
                </span>
                <span className="font-mono text-xs text-muted-foreground truncate block mt-1">
                  {inspectEvent.target_id || "—"}
                </span>
              </div>
            </div>

            {/* Before and After State Diff */}
            <div className="grid gap-4 md:grid-cols-2 pt-2">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Before Change (old_values):
                </span>
                <pre className="rounded-lg border bg-muted/40 p-3 text-xs font-mono max-h-80 overflow-auto whitespace-pre-wrap break-words">
                  {inspectEvent.old_values && Object.keys(inspectEvent.old_values).length > 0
                    ? JSON.stringify(inspectEvent.old_values, null, 2)
                    : "No prior state recorded (newly inserted record or creation event)."}
                </pre>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-brass uppercase tracking-wider block">
                  After Change (new_values):
                </span>
                <pre className="rounded-lg border bg-brass/5 border-brass/30 p-3 text-xs font-mono max-h-80 overflow-auto whitespace-pre-wrap break-words">
                  {inspectEvent.new_values && Object.keys(inspectEvent.new_values).length > 0
                    ? JSON.stringify(inspectEvent.new_values, null, 2)
                    : inspectEvent.summary
                      ? JSON.stringify({ summary: inspectEvent.summary }, null, 2)
                      : "No payload modifications captured."}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button type="button" onClick={() => setInspectEvent(null)} className={btnPrimary}>
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
