import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHead, Status, btnGhost, btnPrimary, field } from "@/admin/Shell";
import { DEAL_STAGES, can, fmtDate, fmtMoney, setDealStage, upsert, useDB, useSession, userName, type Deal } from "@/admin/store";

export const Route = createFileRoute("/admin/deals")({ component: Deals });

function Deals() {
  const db = useDB(); const user = useSession();
  const [draft, setDraft] = useState<Deal | null>(null);
  const move = (deal: Deal, stage: Deal["stage"]) => {
    const refs = deal.propertyIds.map((id) => db.properties.find((p) => p.id === id)?.ref).join(", ") || "none";
    if (stage === "Won" && !confirm(`Complete this deal for ${refs}? Only these units will become Sold or Rented according to their listing mode.`)) return;
    if (stage === "Lost" && ["Reserved", "Due Diligence", "Contract"].includes(deal.stage) && !confirm("Mark lost and release the units reserved by this transaction?")) return;
    try { setDealStage(deal.id, stage); toast.success("Deal stage updated"); }
    catch (error) { toast.error((error as Error).message); }
  };
  const save = (event: React.FormEvent) => {
    event.preventDefault(); if (!draft) return;
    try {
      upsert<Deal>("deals", draft);
      setDraft(null); toast.success("Deal details saved");
    } catch (error) { toast.error((error as Error).message); }
  };
  return (
    <>
      <PageHead title="Deals" crumbs="Sales & CRM" />
      <div className="overflow-x-auto rounded-md border bg-card"><table className="w-full text-sm">
        <thead className="border-b text-left text-xs text-muted-foreground"><tr><th className="p-2">Deal</th><th>Buyer</th><th>Selected units</th><th className="text-right">Agreed amount</th><th className="px-2">Expected close</th><th>Agent</th><th>Stage</th><th>Actions</th></tr></thead>
        <tbody>{db.deals.map((deal) => {
          const closed = ["Won", "Lost"].includes(deal.stage);
          const editable = can(user, "edit-crm", deal.agentId);
          const next = DEAL_STAGES[DEAL_STAGES.indexOf(deal.stage) + 1];
          return <tr key={deal.id} className="border-b last:border-0">
            <td className="p-2 font-medium">{deal.title}</td><td>{db.contacts.find((contact) => contact.id === deal.contactId)?.name}</td>
            <td>{deal.propertyIds.map((id) => db.properties.find((property) => property.id === id)?.ref).join(", ") || "No units selected"}</td>
            <td className="text-right tabular-nums">{fmtMoney(deal.amount, deal.currency)}</td><td className="px-2">{fmtDate(deal.expectedClose)}</td><td>{userName(deal.agentId)}</td>
            <td><Status v={deal.stage} /></td>
            <td className="p-2"><div className="flex gap-2">
              {!closed && !["Reserved", "Due Diligence", "Contract"].includes(deal.stage) && <button disabled={!editable} className={btnGhost} onClick={() => setDraft({ ...deal, propertyIds: [...deal.propertyIds] })}>Edit details</button>}
              {!closed && next && next !== "Lost" && <button disabled={!editable} className={btnPrimary} onClick={() => move(deal, next)}>{next === "Won" ? "Complete" : `Move to ${next}`}</button>}
              {!closed && <button disabled={!editable} className={btnGhost} onClick={() => move(deal, "Lost")}>Mark lost</button>}
            </div></td>
          </tr>;
        })}{db.deals.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Convert a qualified lead to create an opportunity.</td></tr>}</tbody></table></div>
      <p className="mt-2 text-xs text-muted-foreground">A shortlist does not select purchased units. Confirm individual unit identity and source review, choose units and enter the agreed amount before reserving. Currencies are never combined. This demo does not record payments or commissions.</p>
      {draft && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="deal-editor-title">
        <form onSubmit={save} className="mx-auto my-12 max-w-xl space-y-4 rounded-md border bg-card p-5">
          <h2 id="deal-editor-title" className="text-lg font-semibold">Edit opportunity</h2>
          <label className="block text-sm">Title<input required className={field} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Agreed amount<input className={field} type="number" min="0" step="0.01" value={draft.amount ?? ""} onChange={(event) => setDraft({ ...draft, amount: event.target.value === "" ? null : Number(event.target.value) })} /></label>
            <label className="text-sm">Currency<select className={field} value={draft.currency} onChange={(event) => setDraft({ ...draft, currency: event.target.value as Deal["currency"] })}>{["USD", "EUR", "TRY", "GBP"].map((value) => <option key={value}>{value}</option>)}</select></label>
          </div>
          <label className="block text-sm">Expected close<input className={field} type="date" value={draft.expectedClose?.slice(0, 10) ?? ""} onChange={(event) => setDraft({ ...draft, expectedClose: event.target.value ? event.target.value + "T12:00:00+03:00" : null })} /></label>
          <fieldset className="max-h-64 overflow-auto rounded border p-3"><legend className="text-sm">Units included in the agreement</legend>
            {db.properties.map((property) => <label key={property.id} className="mb-2 flex gap-2 text-sm">
              <input type="checkbox" checked={draft.propertyIds.includes(property.id)} disabled={property.type !== "unit offer" || !["Available", "Under Offer"].includes(property.availability) || Boolean(property.sourceNote)} onChange={(event) => setDraft({ ...draft, propertyIds: event.target.checked ? [...draft.propertyIds, property.id] : draft.propertyIds.filter((id) => id !== property.id) })} />
              <span>{property.ref} · {property.title}<small className="block text-muted-foreground">{property.type} · {property.availability}{property.sourceNote ? " · Source review required" : ""}</small></span>
            </label>)}
          </fieldset>
          <div className="flex justify-end gap-2"><button type="button" className={btnGhost} onClick={() => setDraft(null)}>Cancel</button><button className={btnPrimary}>Save details</button></div>
        </form>
      </div>}
    </>
  );
}
