import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Filter, 
  Inbox, 
  Mail, 
  MessageSquare, 
  Phone, 
  Plus, 
  Search, 
  Trash2, 
  UserPlus 
} from "lucide-react";
import { PageHead, Status, btnGhost, btnPrimary, field } from "@/admin/Shell";
import { 
  can,
  convertInquiryToLead, 
  createInquiry, 
  fmtDate, 
  remove, 
  upsert, 
  useDB, 
  useSession, 
  type Inquiry 
} from "@/admin/store";

export const Route = createFileRoute("/admin/inquiries")({
  component: AdminInquiriesPage,
});

export function AdminInquiriesPage() {
  const db = useDB();
  const user = useSession();
  const nav = useNavigate();
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedInquiry = db.inquiries.find((q) => q.id === selectedId) ?? null;
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "Citizenship by Investment ($400k+)",
    budget: "",
    message: "",
    source: "Website Consultation" as Inquiry["source"],
  });

  const inquiries = db.inquiries || [];

  const filtered = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchStatus = filter === "All" || inq.status === filter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        inq.name.toLowerCase().includes(q) ||
        inq.email.toLowerCase().includes(q) ||
        inq.phone.includes(q) ||
        inq.topic.toLowerCase().includes(q) ||
        inq.message.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [inquiries, filter, search]);

  const newCount = inquiries.filter((i) => i.status === "New").length;
  const contactedCount = inquiries.filter((i) => i.status === "Contacted").length;
  const qualifiedCount = inquiries.filter((i) => Boolean(i.leadId)).length;

  const handleStatusChange = async (id: string, newStatus: Inquiry["status"]) => {
    try {
      await upsert<Inquiry>("inquiries", { id, status: newStatus });
      toast.success(`Inquiry marked as ${newStatus}`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleConvertToLead = async (id: string) => {
    try {
      const lead = await convertInquiryToLead(id);
      toast.success("Converted inquiry to active CRM Lead!");
      nav({ to: "/admin/leads/$id", params: { id: lead.id } });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Archive this inquiry? It will remain available in the Archived filter.")) {
      try {
        await remove("inquiries", id);
        toast.success("Inquiry archived");
        if (selectedInquiry?.id === id) setSelectedId(null);
      } catch (e) {
        toast.error((e as Error).message);
      }
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim()) { toast.error("Client name is required"); return; }
    try {
      await createInquiry(newForm);
      toast.success("Inquiry registered in inbox");
      setIsAddOpen(false);
      setNewForm({
        name: "",
        email: "",
        phone: "",
        topic: "Citizenship by Investment ($400k+)",
        budget: "",
        message: "",
        source: "Website Consultation",
      });
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHead
        title="Consultations & Inquiries"
        crumbs="Operations / Inbox"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className={btnPrimary}
              disabled={!can(user, "edit-crm")}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Client Inquiry</span>
            </button>
          </div>
        }
      />

      {/* Metrics Header */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Total Inquiries</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{inquiries.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Recorded across channels</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-brass font-semibold">New Pending</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-brass">{newCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">Awaiting advisor response</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold">Contacted</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{contactedCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">In active conversation</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">Converted Leads</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">{qualifiedCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">Linked to CRM leads</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              className={`${field} pl-8`}
              placeholder="Search by client, email, phone, topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex rounded-md border bg-card p-0.5">
            {["All", "New", "Contacted", "Qualified", "Archived"].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                  filter === st ? "bg-brass text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Inbox Grid / List */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Inquiries Table */}
        <div className="lg:col-span-8 overflow-hidden rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">Client</th>
                  <th className="p-3">Topic & Budget</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No matching inquiries found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((inq) => (
                    <tr
                      key={inq.id}
                      onClick={() => setSelectedId(inq.id)}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedInquiry?.id === inq.id ? "bg-muted/70" : ""
                      }`}
                    >
                      <td className="p-3">
                        <p className="font-semibold text-foreground">{inq.name}</p>
                        <p className="text-xs text-muted-foreground">{inq.email || inq.phone}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-foreground">{inq.topic}</p>
                        {inq.budget && (
                          <p className="text-xs text-brass font-medium">{inq.budget}</p>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {inq.source}
                        </span>
                      </td>
                      <td className="p-3">
                        <Status v={inq.status} />
                      </td>
                      <td className="p-3 text-xs text-muted-foreground tabular-nums">
                        {fmtDate(inq.createdAt, true)}
                      </td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {inq.phone && (
                            <a
                              href={`https://wa.me/${inq.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${inq.name}, thank you for contacting Avrasya Properties regarding ${inq.topic}.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded p-1 text-emerald-600 hover:bg-emerald-50"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </a>
                          )}
                          {!inq.leadId && inq.status !== "Archived" && (
                            <button
                              disabled={!can(user, "edit-crm", inq.agentId) || (user?.role === "agent" && inq.agentId !== user.id)}
                              onClick={() => handleConvertToLead(inq.id)}
                              className="rounded p-1 text-brass hover:bg-brass/10"
                              title="Convert to CRM Lead"
                            >
                              <UserPlus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-4">
          {selectedInquiry ? (
            <div className="rounded-xl border bg-card p-5 space-y-4 sticky top-20">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{selectedInquiry.name}</h3>
                  <p className="text-xs text-muted-foreground">Received {fmtDate(selectedInquiry.createdAt, true)}</p>
                </div>
                <Status v={selectedInquiry.status} />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-foreground">
                  <Mail className="h-3.5 w-3.5 text-brass" />
                  <a href={`mailto:${selectedInquiry.email}`} className="hover:underline">{selectedInquiry.email || "No email"}</a>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Phone className="h-3.5 w-3.5 text-brass" />
                  <a href={`tel:${selectedInquiry.phone}`} className="hover:underline">{selectedInquiry.phone || "No phone"}</a>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Building2 className="h-3.5 w-3.5 text-brass" />
                  <span>Topic: {selectedInquiry.topic}</span>
                </div>
                {selectedInquiry.budget && (
                  <div className="flex items-center gap-2 text-brass font-medium">
                    <span>Budget: {selectedInquiry.budget}</span>
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-foreground">
                <p className="font-semibold text-muted-foreground mb-1 uppercase tracking-wider text-[10px]">Client Message:</p>
                <p>{selectedInquiry.message || "No message body provided."}</p>
              </div>

              {selectedInquiry.propertySlug && (
                <div className="rounded-lg border p-3 bg-card text-xs">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Attached Listing:</p>
                  <Link
                    to="/properties/$slug"
                    params={{ slug: selectedInquiry.propertySlug }}
                    target="_blank"
                    className="flex items-center gap-1.5 text-brass hover:underline font-medium"
                  >
                    <span>View Property on Public Site</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}

              {/* Status Selector */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Change Status
                </label>
                <select
                  className={field}
                  disabled={!can(user, "edit-crm", selectedInquiry.agentId) || (user?.role === "agent" && selectedInquiry.agentId !== user.id)}
                  value={selectedInquiry.status}
                  onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value as Inquiry["status"])}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t">
                {!selectedInquiry.leadId && selectedInquiry.status !== "Archived" && (
                  <button
                    disabled={!can(user, "edit-crm", selectedInquiry.agentId) || (user?.role === "agent" && selectedInquiry.agentId !== user.id)}
                    onClick={() => handleConvertToLead(selectedInquiry.id)}
                    className={`${btnPrimary} w-full justify-center`}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Convert to CRM Lead</span>
                  </button>
                )}
                <div className="flex gap-2">
                  {selectedInquiry.phone && (
                    <a
                      href={`https://wa.me/${selectedInquiry.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${selectedInquiry.name}, this is Avrasya Properties regarding your inquiry on ${selectedInquiry.topic}.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className={`${btnGhost} flex-1 justify-center text-emerald-600 hover:text-emerald-700`}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(selectedInquiry.id)}
                    className={`${btnGhost} text-destructive hover:bg-destructive/10`}
                    title="Delete record"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground">
              Select an inquiry from the list to view complete details, message history, and direct conversion actions.
            </div>
          )}
        </div>
      </div>

      {/* Manual Inquiry Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">
              Log Direct Client Inquiry
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label htmlFor="inquiry-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Full Name *
                </label>
                <input id="inquiry-name"
                  required
                  className={field}
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder="e.g. Robert Van Der Berg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="inquiry-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Email
                  </label>
                <input id="inquiry-email"
                    type="email"
                    className={field}
                    value={newForm.email}
                    onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                    placeholder="client@domain.com"
                  />
                </div>
                <div>
                  <label htmlFor="inquiry-phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Phone / WhatsApp
                  </label>
                <input id="inquiry-phone"
                    className={field}
                    value={newForm.phone}
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                    placeholder="+90 555 123 4567"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Topic
                  </label>
                  <select
                    className={field}
                    value={newForm.topic}
                    onChange={(e) => setNewForm({ ...newForm, topic: e.target.value })}
                  >
                    <option>Citizenship by Investment ($400k+)</option>
                    <option>Residential Acquisition / Lifestyle</option>
                    <option>Commercial / High-Yield Portfolio</option>
                    <option>Property Management & Resale</option>
                    <option>Investment Catalog Request</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="inquiry-budget" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Stated Budget
                  </label>
                <input id="inquiry-budget"
                    className={field}
                    value={newForm.budget}
                    onChange={(e) => setNewForm({ ...newForm, budget: e.target.value })}
                    placeholder="e.g. $450,000"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="inquiry-message" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Inquiry Details / Message
                </label>
                <textarea id="inquiry-message"
                  className={`${field} h-24 py-2`}
                  value={newForm.message}
                  onChange={(e) => setNewForm({ ...newForm, message: e.target.value })}
                  placeholder="Notes from telephone consultation or walk-in client..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsAddOpen(false)} className={btnGhost}>
                  Cancel
                </button>
                <button type="submit" className={btnPrimary}>
                  Save to Inbox
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
