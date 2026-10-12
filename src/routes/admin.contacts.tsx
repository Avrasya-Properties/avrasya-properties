import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHead, btnGhost, btnPrimary, field } from "@/admin/Shell";
import { contactMatch } from "@/admin/domain.js";
import { USERS, can, upsert, useDB, useSession, userName, type Contact } from "@/admin/store";

export const Route = createFileRoute("/admin/contacts")({ component: Contacts });

function Contacts() {
<<<<<<< HEAD
  const db = useDB();
  const dupOf = (id: string) => {
    const c = db.contacts.find((x) => x.id === id)!;
    return db.contacts.filter(
      (o) =>
        o.id !== id &&
        (o.email.toLowerCase() === c.email.toLowerCase() ||
          normPhone(o.phone) === normPhone(c.phone)),
    );
  };
  return (
    <>
      <PageHead title="Contacts" crumbs="Sales & CRM" />
      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-2">Name</th>
              <th>Type</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Language</th>
              <th>Agent</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {db.contacts.map((c) => {
              const d = dupOf(c.id);
              return (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="p-2 font-medium">{c.name}</td>
                  <td className="capitalize">{c.kind}</td>
                  <td>{c.email}</td>
                  <td className="tabular-nums">{c.phone}</td>
                  <td>{c.language}</td>
                  <td>{userName(c.agentId)}</td>
                  <td>
                    {d.length > 0 ? (
                      <span className="text-xs text-brass-text">
                        Possible duplicate of {d.map((x) => x.name).join(", ")} — review, not merged
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
=======
  const db = useDB(); const user = useSession();
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<(Omit<Contact, "id"> & { id?: string }) | null>(null);
  const duplicateOf = (contact: Contact) => db.contacts.filter((other) => other.id !== contact.id && contactMatch(other, contact));
  const contacts = db.contacts.filter((contact) => [contact.name, contact.email, contact.phone].some((value) => value.toLowerCase().includes(query.trim().toLowerCase())));
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); if (!draft) return;
    try { await upsert<Contact>("contacts", draft); setDraft(null); toast.success("Contact saved"); }
    catch (error) { toast.error((error as Error).message); }
  };
  return (
    <>
      <PageHead title="Contacts" crumbs="Clients" action={<button disabled={!can(user, "edit-crm")} className={btnPrimary} onClick={() => setDraft({ name: "", kind: "person", email: "", phone: "", roles: ["buyer"], language: "", agentId: user!.id, notes: "" })}>Add contact</button>} />
      <input aria-label="Search contacts" className={`${field} mb-4 max-w-md`} placeholder="Search name, email or phone" value={query} onChange={(event) => setQuery(event.target.value)} />
      <div className="overflow-x-auto rounded-md border bg-card"><table className="w-full text-sm">
        <thead className="border-b text-left text-xs text-muted-foreground"><tr><th className="p-2">Name</th><th>Type</th><th>Email</th><th>Phone</th><th>Language</th><th>Agent</th><th>Review</th><th>Actions</th></tr></thead>
        <tbody>{contacts.map((contact) => { const duplicates = duplicateOf(contact); return (
          <tr key={contact.id} className="border-b last:border-0"><td className="p-2 font-medium">{contact.name}</td><td className="capitalize">{contact.kind}</td><td>{contact.email || "—"}</td><td className="tabular-nums">{contact.phone || "—"}</td><td>{contact.language || "Unconfirmed"}</td><td>{userName(contact.agentId)}</td>
            <td>{duplicates.length > 0 ? <span className="text-xs text-brass-text">Possible duplicate of {duplicates.map((record) => record.name).join(", ")} — review before merging</span> : "—"}</td>
            <td className="p-2"><button disabled={!can(user, "edit-crm", contact.agentId)} className={btnGhost} onClick={() => setDraft({ ...contact, roles: [...contact.roles] })}>Edit</button></td></tr>); })}
          {contacts.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">No matching contacts.</td></tr>}
        </tbody></table></div>
      {draft && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="contact-editor-title">
        <form onSubmit={save} className="mx-auto my-12 max-w-xl space-y-4 rounded-md border bg-card p-5">
          <h2 id="contact-editor-title" className="text-lg font-semibold">{draft.id ? "Edit contact" : "Add contact"}</h2>
          <label className="block text-sm">Name<input required maxLength={200} className={field} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Type<select className={field} value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: event.target.value as Contact["kind"] })}><option value="person">Person</option><option value="company">Company</option></select></label>
            <label className="text-sm">Language<input className={field} value={draft.language} onChange={(event) => setDraft({ ...draft, language: event.target.value })} placeholder="Unconfirmed" /></label>
            <label className="text-sm">Email<input className={field} type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value.trim() })} /></label>
            <label className="text-sm">Phone<input className={field} type="tel" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></label>
          </div>
          <label className="block text-sm">Roles<select className={field} value={draft.roles[0] ?? "buyer"} onChange={(event) => setDraft({ ...draft, roles: [event.target.value] })}>{["buyer", "seller", "tenant", "landlord", "developer", "partner"].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="block text-sm">Advisor<select disabled={user?.role === "agent"} className={field} value={draft.agentId} onChange={(event) => setDraft({ ...draft, agentId: event.target.value })}>{USERS.filter((record) => record.role !== "viewer").map((record) => <option key={record.id} value={record.id}>{record.name}</option>)}</select></label>
          <label className="block text-sm">Notes<textarea className={`${field} h-24 py-2`} value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} /></label>
          <div className="flex justify-end gap-2"><button type="button" className={btnGhost} onClick={() => setDraft(null)}>Cancel</button><button className={btnPrimary}>Save contact</button></div>
        </form>
      </div>}
>>>>>>> 79a7162f934d90675238098147e8ead1264bc06f
    </>
  );
}
