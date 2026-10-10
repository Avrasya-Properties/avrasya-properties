import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHead, Status } from "@/admin/Shell";
import { DEAL_STAGES, can, fmtDate, fmtMoney, upsert, useDB, useSession, userName, winDeal, type Deal } from "@/admin/store";

export const Route = createFileRoute("/admin/deals")({ component: Deals });

function Deals() {
  const db = useDB(); const user = useSession();
  const move = (d: Deal, stage: Deal["stage"]) => {
    try {
      if (stage === "Won") {
        const refs = d.propertyIds.map((id) => db.properties.find((p) => p.id === id)?.ref).join(", ") || "none";
        if (!confirm(`Mark deal won? Linked units (${refs}) will be set to Sold.`)) return;
        winDeal(d.id);
      } else upsert<Deal>("deals", { id: d.id, stage }, d.agentId);
    } catch (e) { toast.error((e as Error).message); }
  };
  return (
    <>
      <PageHead title="Deals" crumbs="Sales & CRM" />
      <div className="overflow-x-auto rounded-md border bg-card"><table className="w-full text-sm">
        <thead className="border-b text-left text-xs text-muted-foreground"><tr><th className="p-2">Deal</th><th>Buyer</th><th>Units</th><th className="text-right">Amount</th><th className="px-2">Expected close</th><th>Agent</th><th>Stage</th></tr></thead>
        <tbody>{db.deals.map((d) => <tr key={d.id} className="border-b last:border-0">
          <td className="p-2 font-medium">{d.title}</td><td>{db.contacts.find((c) => c.id === d.contactId)?.name}</td>
          <td>{d.propertyIds.map((id) => db.properties.find((p) => p.id === id)?.ref).join(", ") || "—"}</td>
          <td className="text-right tabular-nums">{fmtMoney(d.amount, d.currency)}</td><td className="px-2">{fmtDate(d.expectedClose)}</td><td>{userName(d.agentId)}</td>
          <td>{d.stage === "Won" ? <Status v="Won" /> : <select disabled={!can(user, "edit-crm", d.agentId)} className="rounded-sm border bg-card px-1 text-xs" value={d.stage} onChange={(e) => move(d, e.target.value as Deal["stage"])}>{DEAL_STAGES.map((s) => <option key={s}>{s}</option>)}</select>}</td></tr>)}</tbody></table></div>
      <p className="mt-2 text-xs text-muted-foreground">Amounts are never combined across currencies. Payments and commissions shown here are estimates, not accounting.</p>
    </>
  );
}
