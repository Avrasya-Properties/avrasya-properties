// Mock repository: all reads/writes go through this module so a future API can replace it.
import { useSyncExternalStore } from "react";
import { properties as sourceRecords } from "@/data/properties";

export type Role = "admin" | "manager" | "agent" | "viewer";
export type User = { id: string; name: string; email: string; role: Role };
export const USERS: User[] = [
  { id: "u1", name: "Selin Arda", email: "admin@avrasya.test", role: "admin" },
  { id: "u2", name: "Murat Kaya", email: "manager@avrasya.test", role: "manager" },
  { id: "u3", name: "Elif Demir", email: "agent@avrasya.test", role: "agent" },
  { id: "u4", name: "Can Yılmaz", email: "viewer@avrasya.test", role: "viewer" },
];
export const DEMO_PASSWORD = "AvrasyaDemo!26";

export const AVAIL = ["Unknown", "Available", "Under Offer", "Reserved", "Sold", "Rented", "Off Market"] as const;
export const PUBL = ["Draft", "In Review", "Published", "Archived"] as const;
export const LEAD_STAGES = ["New", "Contacted", "Qualified", "Viewing", "Negotiation", "Converted", "Lost", "On Hold"] as const;
export const DEAL_STAGES = ["Opportunity", "Offer Prepared", "Offer Accepted", "Reserved", "Due Diligence", "Contract", "Won", "Lost"] as const;
export const SOURCES = ["Website", "WhatsApp", "Phone", "Referral", "Walk-in", "Campaign"] as const;
export type Currency = "USD" | "TRY" | "EUR";

export type Property = {
  id: string; ref: string; slug: string; title: string; district: string; city: string; type: string;
  layout: string | null; bathrooms: number | null; grossM2: number | null; netM2: number | null; areaM2: number | null;
  amount: number | null; currency: Currency | null; mode: "sale" | "rent"; priceType: "fixed" | "from" | "on-request";
  availability: (typeof AVAIL)[number]; publication: (typeof PUBL)[number]; agentId: string;
  cover: string | null; description: string; updatedAt: string; sourceNote?: string;
};
export type Contact = { id: string; name: string; kind: "person" | "company"; email: string; phone: string; roles: string[]; language: string; agentId: string; notes: string };
export type Lead = { id: string; contactId: string; source: string; agentId: string; districts: string; layout: string; budgetMin: number | null; budgetMax: number | null; currency: Currency; stage: (typeof LEAD_STAGES)[number]; lossReason?: string; nextFollowUp: string | null; shortlist: string[]; dealId?: string };
export type Task = { id: string; title: string; assigneeId: string; due: string; priority: "Low" | "Normal" | "High"; done: boolean; link?: { kind: string; id: string } };
export type Viewing = { id: string; contactId: string; propertyId: string; agentId: string; start: string; end: string; status: "Scheduled" | "Confirmed" | "Completed" | "Cancelled" | "No-show"; notes: string };
export type Deal = { id: string; title: string; contactId: string; leadId?: string; propertyIds: string[]; agentId: string; stage: (typeof DEAL_STAGES)[number]; amount: number | null; currency: Currency; expectedClose: string | null };
export type Activity = { id: string; at: string; userId: string; kind: string; text: string; ref?: { kind: string; id: string } };

export type DB = { properties: Property[]; contacts: Contact[]; leads: Lead[]; tasks: Task[]; viewings: Viewing[]; deals: Deal[]; activity: Activity[]; readNotes: string[] };

const KEY = "avrasya-admin-db-v1";
const SKEY = "avrasya-admin-session";
const uid = () => Math.random().toString(36).slice(2, 9);
const day = (offset: number, h = 10) => { const d = new Date(); d.setDate(d.getDate() + offset); d.setHours(h, 0, 0, 0); return d.toISOString(); };

function seed(): DB {
  const agents = ["u2", "u3"];
  const props: Property[] = sourceRecords.map((r, i) => {
    const a = (b: string) => r.areas.find((x) => x.basis === b)?.value_m2 ?? null;
    return {
      id: `p${i + 1}`, ref: `AVR-${String(1001 + i)}`, slug: r.slug, title: r.marketing_title,
      district: r.location_label ?? "", city: r.city, type: r.record_type.replace("_", " "),
      layout: r.layout_label, bathrooms: null, grossM2: a("gross"), netM2: a("net"), areaM2: a("unspecified"),
      amount: r.price.amount, currency: (r.price.currency as Currency) ?? null, mode: "sale",
      priceType: r.price.amount == null ? "on-request" : r.record_type === "project" ? "from" : "fixed",
      availability: r.availability_verified ? "Available" : "Unknown",
      publication: i % 5 === 3 ? "In Review" : i % 7 === 6 ? "Draft" : "Published",
      agentId: agents[i % 2], cover: null, description: String(r.details?.note ?? ""), updatedAt: day(-i % 9),
      sourceNote: (r.details?.claims_requiring_confirmation ?? []).join("; "),
    };
  });
  const contacts: Contact[] = [
    ["Amira Haddad", "amira.h@example.test", "+90 555 010 0001", "Arabic"],
    ["Jonas Weber", "jonas.weber@example.test", "+49 151 000 0002", "German"],
    ["Leyla Rahimi", "leyla@example.test", "+90 555 010 0003", "English"],
    ["Northgate Holdings", "office@northgate.test", "+44 20 0000 0004", "English"],
    ["A. Haddad", "AMIRA.H@example.test", "+905550100001", "Arabic"],
  ].map(([name, email, phone, language], i) => ({ id: `c${i + 1}`, name, email, phone, language, kind: i === 3 ? "company" : "person", roles: ["buyer"], agentId: agents[i % 2], notes: "" }));
  const leads: Lead[] = [
    { id: "l1", contactId: "c1", source: "Website", agentId: "u3", districts: "Beylikdüzü", layout: "2+1", budgetMin: 150000, budgetMax: 250000, currency: "USD", stage: "New", nextFollowUp: day(-1), shortlist: [] },
    { id: "l2", contactId: "c2", source: "WhatsApp", agentId: "u2", districts: "Esenyurt", layout: "1+1", budgetMin: 80000, budgetMax: 140000, currency: "USD", stage: "Qualified", nextFollowUp: day(1), shortlist: ["p1"] },
    { id: "l3", contactId: "c3", source: "Referral", agentId: "u3", districts: "Kadıköy", layout: "3+1", budgetMin: 8000000, budgetMax: 15000000, currency: "TRY", stage: "Viewing", nextFollowUp: day(2), shortlist: [] },
    { id: "l4", contactId: "c4", source: "Campaign", agentId: "u2", districts: "", layout: "", budgetMin: null, budgetMax: null, currency: "USD", stage: "Negotiation", nextFollowUp: null, shortlist: [] },
  ];
  return {
    properties: props, contacts, leads,
    tasks: [
      { id: "t1", title: "Call Amira about Beylikdüzü options", assigneeId: "u3", due: day(-1), priority: "High", done: false, link: { kind: "lead", id: "l1" } },
      { id: "t2", title: "Send floor plans to Jonas", assigneeId: "u2", due: day(0, 15), priority: "Normal", done: false, link: { kind: "lead", id: "l2" } },
      { id: "t3", title: "Verify delivery date with developer", assigneeId: "u2", due: day(3), priority: "Low", done: false },
    ],
    viewings: [
      { id: "v1", contactId: "c3", propertyId: "p2", agentId: "u3", start: day(0, 14), end: day(0, 15), status: "Confirmed", notes: "" },
      { id: "v2", contactId: "c2", propertyId: "p1", agentId: "u2", start: day(2, 11), end: day(2, 12), status: "Scheduled", notes: "" },
    ],
    deals: [{ id: "d1", title: "Northgate — package offer", contactId: "c4", leadId: "l4", propertyIds: ["p3"], agentId: "u2", stage: "Offer Prepared", amount: 420000, currency: "USD", expectedClose: day(30) }],
    activity: [{ id: "a1", at: day(-1, 9), userId: "u3", kind: "lead", text: "New website enquiry from Amira Haddad", ref: { kind: "lead", id: "l1" } }],
    readNotes: [],
  };
}

let db: DB | null = null;
const listeners = new Set<() => void>();
function load(): DB {
  if (db) return db;
  if (typeof window === "undefined") return (db = seed());
  try { db = JSON.parse(localStorage.getItem(KEY) || "null") ?? seed(); } catch { db = seed(); }
  return db!;
}
function save() { localStorage.setItem(KEY, JSON.stringify(db)); listeners.forEach((l) => l()); }
export function useDB(): DB {
  return useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), load, load);
}

// ---------- session & permissions (DEMO ONLY, not security) ----------
let session: User | null | undefined;
export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  if (session === undefined) { const id = localStorage.getItem(SKEY); session = USERS.find((u) => u.id === id) ?? null; }
  return session;
}
export function useSession() { return useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), getSession, () => null); }
export function login(email: string, pw: string): User | null {
  const u = USERS.find((x) => x.email === email.trim().toLowerCase());
  if (!u || pw !== DEMO_PASSWORD) return null;
  localStorage.setItem(SKEY, u.id); session = u; listeners.forEach((l) => l()); return u;
}
export function logout() { localStorage.removeItem(SKEY); session = null; listeners.forEach((l) => l()); }

export type Action = "edit-inventory" | "publish" | "edit-crm" | "admin";
export function can(u: User | null, action: Action, ownerId?: string): boolean {
  if (!u) return false;
  if (u.role === "admin") return true;
  if (u.role === "viewer") return false;
  if (u.role === "manager") return action !== "admin";
  return action === "edit-crm" && (ownerId == null || ownerId === u.id);
}
function guard(action: Action, ownerId?: string) {
  if (!can(getSession(), action, ownerId)) throw new Error("Your demo role does not permit this action.");
}

// ---------- mutations ----------
function log(kind: string, text: string, ref?: Activity["ref"]) {
  load().activity.unshift({ id: uid(), at: new Date().toISOString(), userId: getSession()?.id ?? "", kind, text, ref });
}
type Coll = "properties" | "contacts" | "leads" | "tasks" | "viewings" | "deals";
const perm: Record<Coll, Action> = { properties: "edit-inventory", contacts: "edit-crm", leads: "edit-crm", tasks: "edit-crm", viewings: "edit-crm", deals: "edit-crm" };
export function upsert<T extends { id: string }>(coll: Coll, item: Partial<T> & { id?: string }, ownerId?: string): T {
  guard(perm[coll], ownerId);
  const list = load()[coll] as unknown as T[];
  if (item.id) {
    const i = list.findIndex((x) => x.id === item.id);
    list[i] = { ...list[i], ...item };
    if (coll === "properties") (list[i] as unknown as Property).updatedAt = new Date().toISOString();
    save(); return list[i];
  }
  const created = { ...item, id: coll[0] + uid() } as T;
  list.unshift(created); log(coll, `Created ${coll.slice(0, -1)}`, { kind: coll, id: created.id }); save(); return created;
}
export function remove(coll: Coll, id: string) { guard(perm[coll]); (load()[coll] as { id: string }[]).splice((load()[coll] as { id: string }[]).findIndex((x) => x.id === id), 1); save(); }
export function addActivity(kind: string, text: string, ref?: Activity["ref"]) { log(kind, text, ref); save(); }
export function markRead(ids: string[], read: boolean) { const d = load(); d.readNotes = read ? [...new Set([...d.readNotes, ...ids])] : d.readNotes.filter((x) => !ids.includes(x)); save(); }
export function resetData() { guard("admin"); db = seed(); save(); }

export function publishIssues(p: Property, all: Property[]): string[] {
  const out: string[] = [];
  if (!p.title.trim()) out.push("Add a title");
  if (!/^[a-z0-9-]+$/.test(p.slug)) out.push("Slug must be lowercase letters, numbers and hyphens");
  if (all.some((x) => x.id !== p.id && x.slug === p.slug)) out.push("Slug is already used by another listing");
  if (!p.district.trim()) out.push("Add a location / district");
  if (!p.cover) out.push("Upload and select a cover image");
  if (p.priceType !== "on-request" && (p.amount == null || !p.currency)) out.push("Enter price and currency, or mark price on request");
  return out;
}
export function setStage(leadId: string, stage: Lead["stage"], lossReason?: string) {
  const l = load().leads.find((x) => x.id === leadId)!;
  if (stage === "Lost" && !lossReason) throw new Error("A loss reason is required");
  upsert<Lead>("leads", { id: leadId, stage, lossReason }, l.agentId);
  addActivity("lead", `Stage changed ${l.stage === stage ? "" : ""}to ${stage}${lossReason ? ` (${lossReason})` : ""}`, { kind: "lead", id: leadId });
}
export function convertLead(leadId: string): Deal {
  const d = load(); const l = d.leads.find((x) => x.id === leadId)!;
  if (l.dealId) throw new Error("This lead already has a deal");
  const c = d.contacts.find((x) => x.id === l.contactId);
  const deal = upsert<Deal>("deals", { title: `${c?.name ?? "Buyer"} — deal`, contactId: l.contactId, leadId, propertyIds: l.shortlist, agentId: l.agentId, stage: "Opportunity", amount: null, currency: l.currency, expectedClose: null }, l.agentId);
  upsert<Lead>("leads", { id: leadId, stage: "Converted", dealId: deal.id }, l.agentId);
  return deal;
}
export function winDeal(dealId: string) {
  const d = load(); const deal = d.deals.find((x) => x.id === dealId)!;
  guard("edit-crm", deal.agentId);
  deal.stage = "Won";
  deal.propertyIds.forEach((pid) => { const p = d.properties.find((x) => x.id === pid); if (p) p.availability = "Sold"; });
  log("deal", `Deal won; ${deal.propertyIds.length} unit(s) marked Sold`, { kind: "deals", id: dealId }); save();
}

export const userName = (id: string) => USERS.find((u) => u.id === id)?.name ?? "—";
export const fmtMoney = (n: number | null, c: string | null) => (n == null || !c ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n));
export const fmtDate = (s: string | null, time = false) => (!s ? "—" : new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", day: "2-digit", month: "short", ...(time ? { hour: "2-digit", minute: "2-digit" } : {}) }).format(new Date(s)));
export const normPhone = (s: string) => s.replace(/\D/g, "");
