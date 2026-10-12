// Browser-only demo repository. These role checks are UX rules, not backend security.
import { useSyncExternalStore } from "react";
import { contactMatch, exactBudget, requireAmount, requireDate, requireEnum, requireText, validateDealSelection, validateSettings, validateWorkspace } from "./domain.js";
import { properties as sourceRecords, getPropertyMedia } from "@/data/properties";

export type Role = "admin" | "manager" | "agent" | "viewer";
export type User = { id: string; name: string; email: string; role: Role };
export const USERS: User[] = [
  { id: "u1", name: "Selin Arda", email: "admin@avrasya.test", role: "admin" },
  { id: "u2", name: "Murat Kaya", email: "manager@avrasya.test", role: "manager" },
  { id: "u3", name: "Elif Demir", email: "agent@avrasya.test", role: "agent" },
  { id: "u4", name: "Can Yılmaz", email: "viewer@avrasya.test", role: "viewer" },
];
export const DEMO_PASSWORD = "AvrasyaDemo!26";
export const DEMO_ENABLED = import.meta.env.DEV || import.meta.env["VITE_ENABLE_ADMIN_DEMO"] === "true";

export const AVAIL = ["Unknown", "Available", "Under Offer", "Reserved", "Sold", "Rented", "Off Market"] as const;
export const PUBL = ["Draft", "In Review", "Published", "Archived"] as const;
export const LEAD_STAGES = ["New", "Contacted", "Qualified", "Viewing", "Negotiation", "Converted", "Lost", "On Hold"] as const;
export const DEAL_STAGES = ["Opportunity", "Offer Prepared", "Offer Accepted", "Reserved", "Due Diligence", "Contract", "Won", "Lost"] as const;
export const SOURCES = ["Website", "WhatsApp", "Phone", "Referral", "Walk-in", "Campaign"] as const;
export type Currency = "USD" | "TRY" | "EUR" | "GBP";

export type Property = {
  galleryImages?: string[]; floorPlan?: string | null; highlights?:string[];
  id: string; ref: string; slug: string; title: string; district: string; city: string; type: string;
  layout: string | null; bathrooms: number | null; grossM2: number | null; netM2: number | null; areaM2: number | null;
  amount: number | null; currency: Currency | null; mode: "sale" | "rent"; priceType: "fixed" | "from" | "on-request"; priceBasis?: string;
  availability: (typeof AVAIL)[number]; publication: (typeof PUBL)[number]; agentId: string;
  cover: string | null; description: string; project: string; updatedAt: string; sourceNote?: string;
  cbiEligible?: boolean; side?: "Europe" | "Asia" | "unknown"; tapuStatus?: string;
};
export type Contact = { id: string; name: string; kind: "person" | "company"; email: string; phone: string; roles: string[]; language: string; agentId: string; notes: string };
export type Lead = { id: string; contactId: string; source: string; agentId: string; districts: string; layout: string; budgetMin: number | null; budgetMax: number | null; currency: Currency; stage: (typeof LEAD_STAGES)[number]; lossReason?: string; nextFollowUp: string | null; shortlist: string[]; dealId?: string };
export type Task = { id: string; title: string; assigneeId: string; due: string; priority: "Low" | "Normal" | "High"; done: boolean; link?: { kind: string; id: string } };
export type Viewing = { id: string; contactId: string; propertyId: string; agentId: string; start: string; end: string; status: "Scheduled" | "Confirmed" | "Completed" | "Cancelled" | "No-show"; notes: string };
export type Deal = { id: string; title: string; contactId: string; leadId?: string; propertyIds: string[]; agentId: string; stage: (typeof DEAL_STAGES)[number]; amount: number | null; currency: Currency; expectedClose: string | null };
export type Activity = { id: string; at: string; userId: string; kind: string; text: string; ref?: { kind: string; id: string } };

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  topic: string;
  budget: string;
  message: string;
  source: "Website Consultation" | "WhatsApp Click" | "Contact Brief" | "Property Modal";
  propertySlug?: string | undefined;
  status: "New" | "Contacted" | "Qualified" | "Archived";
  createdAt: string;
  notes?: string;
  leadId?: string;
  agentId?: string;
};

export type BudgetRange = {
  id: string;
  label: string;
  min: number;
  max: number;
};

export type SiteSettings = {
  companyName: string;
  registeredEntity: string;
  taxOffice: string;
  licenseNo: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  advisoryHours: string;
  heroHeadline: string;
  heroSubtitle: string;
  eyebrowText: string;
  cbiThresholdUsd: number;
  preloaderOpacity: number;
  exchangeRateEur: number;
  exchangeRateTry: number;
  exchangeRateGbp: number;
  enableFrankfurterSync: boolean;
  announcementText: string;
  announcementActive: boolean;
  districts: string[];
  layouts: string[];
  budgetRanges: BudgetRange[];
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  companyName: "Avrasya Properties Group",
  registeredEntity: "Avrasya Properties Group",
  taxOffice: "Üsküdar / İstanbul",
  licenseNo: "",
  tagline: "Your Future Starts with the Right Investment.",
  email: "info@avrasyaproperties.com",
  phone: "+90 545 924 80 42",
  whatsapp: "https://wa.me/905459248042",
  address: "Mimar Sinan Mahallesi, Selam-i Ali Efendi Caddesi, Ara Kafe Yanı No:17, 34672 Üsküdar / İstanbul, Türkiye",
  advisoryHours: "Mon – Fri: 09:30 – 18:30 TRT | Sat: By Private Appointment",
  heroHeadline: "Curated Offers & Developments in Istanbul.",
  heroSubtitle: "Source-backed investment opportunities across central and Asian-side Istanbul. Every property is subject to preliminary title deed, zoning, and legal clearance before acquisition.",
  eyebrowText: "Istanbul Portfolio Collection",
  cbiThresholdUsd: 400000,
  preloaderOpacity: 0.5,
  exchangeRateEur: 0.892,
  exchangeRateTry: 49.17,
  exchangeRateGbp: 0.756,
  enableFrankfurterSync: true,
  announcementText: "",
  announcementActive: false,
  districts: [
    "Maslak",
    "Şişli",
    "Beşiktaş",
    "Kadıköy",
    "Sarıyer",
    "Üsküdar",
    "Beyoğlu",
    "Bakırköy",
    "Ataşehir",
    "Göktürk",
    "Bomonti",
    "Zekeriyaköy",
  ],
  layouts: [
    "Studio",
    "1+1",
    "2+1",
    "3+1",
    "4+1",
    "5+1",
    "Duplex",
    "Penthouse",
    "Waterfront Villa",
    "Commercial",
  ],
  budgetRanges: [
    { id: "u300", label: "Up to $300,000", min: 0, max: 300000 },
    { id: "300-450", label: "$300,000 – $450,000", min: 300000, max: 450000 },
    { id: "450-600", label: "$450,000 – $600,000", min: 450000, max: 600000 },
    { id: "600-1m", label: "$600,000 – $1,000,000", min: 600000, max: 1000000 },
    { id: "1m-plus", label: "$1,000,000+", min: 1000000, max: 99999999 },
  ],
};

export type DB = {
  properties: Property[];
  contacts: Contact[];
  leads: Lead[];
  tasks: Task[];
  viewings: Viewing[];
  deals: Deal[];
  inquiries: Inquiry[];
  siteSettings: SiteSettings;
  activity: Activity[];
  readNotes: string[];
};

const KEY = "avrasya-admin-db-v4";
const SKEY = "avrasya-admin-session";
const uid = () => crypto.randomUUID();
const day = (offset: number, h = 10) => { const d = new Date(); d.setDate(d.getDate() + offset); d.setHours(h, 0, 0, 0); return d.toISOString(); };

function seed(): DB {
  const agents = ["u2", "u3"];
  const props: Property[] = sourceRecords.map((r, i) => {
    const a = (b: string) => r.areas.find((x) => x.basis === b)?.value_m2 ?? null;
    const media = getPropertyMedia(r);
    return {
      id: `p${i + 1}`, ref: `AVR-${String(1001 + i)}`, slug: r.slug, title: r.marketing_title,
      district: r.location_label ?? "", city: r.city, type: r.record_type.replace("_", " "),
      layout: r.layout_label, bathrooms: null, grossM2: a("gross"), netM2: a("net"), areaM2: a("unspecified"),
      amount: r.price.amount, currency: (r.price.currency as Currency) ?? null, mode: "sale",
      priceType: r.price.amount == null ? "on-request" : r.record_type === "project" ? "from" : "fixed",
      availability: r.availability_verified ? "Available" : "Unknown",
      publication: i % 5 === 3 ? "In Review" : i % 7 === 6 ? "Draft" : "Published",
      agentId: agents[i % 2], cover: media.cover, project: String(r.details?.project ?? r.marketing_title.split(" — ")[0]), description: String(r.details?.note ?? ""), updatedAt: day(-i % 9),
      sourceNote: (r.details?.claims_requiring_confirmation ?? []).join("; "),
      side: r.side,
    } as Property;
  });
  const contacts: Contact[] = [
    ["Amira Haddad", "amira.h@example.test", "+90 555 010 0001", "Arabic"],
    ["Jonas Weber", "jonas.weber@example.test", "+49 151 000 0002", "German"],
    ["Leyla Rahimi", "leyla@example.test", "+90 555 010 0003", "English"],
    ["Northgate Holdings", "office@northgate.test", "+44 20 0000 0004", "English"],
    ["A. Haddad", "AMIRA.H@example.test", "+905550100001", "Arabic"],
  ].map(([name, email, phone, language], i) => ({ id: `c${i + 1}`, name, email, phone, language, kind: i === 3 ? "company" : "person", roles: ["buyer"], agentId: agents[i % 2], notes: "" }) as Contact);
  const leads: Lead[] = [
    { id: "l1", contactId: "c1", source: "Website", agentId: "u3", districts: "Beylikdüzü", layout: "2+1", budgetMin: 150000, budgetMax: 250000, currency: "USD", stage: "New", nextFollowUp: day(-1), shortlist: [] },
    { id: "l2", contactId: "c2", source: "WhatsApp", agentId: "u2", districts: "Esenyurt", layout: "1+1", budgetMin: 80000, budgetMax: 140000, currency: "USD", stage: "Qualified", nextFollowUp: day(1), shortlist: ["p1"] },
    { id: "l3", contactId: "c3", source: "Referral", agentId: "u3", districts: "Kadıköy", layout: "3+1", budgetMin: 8000000, budgetMax: 15000000, currency: "TRY", stage: "Viewing", nextFollowUp: day(2), shortlist: [] },
    { id: "l4", contactId: "c4", source: "Campaign", agentId: "u2", districts: "", layout: "", budgetMin: null, budgetMax: null, currency: "USD", stage: "Negotiation", nextFollowUp: null, shortlist: [] },
  ];
  const inquiries: Inquiry[] = [
    {
      id: "inq-1",
      name: "Tariq Mansour",
      email: "tariq@example.test",
      phone: "+971 50 123 4567",
      topic: "Citizenship by Investment ($400k+)",
      budget: "$550,000",
      message: "Looking for 2 residential units qualifying for CBI with guaranteed title deed delivery before Q4.",
      source: "Website Consultation",
      status: "New",
      createdAt: day(0, 9),
      propertySlug: "rams-park-house-maslak-1-1xs",
    },
    {
      id: "inq-2",
      name: "Charlotte Dupont",
      email: "charlotte@example.test",
      phone: "+33 6 12 34 56 78",
      topic: "Property Selection",
      budget: "$750,000",
      message: "Interested in Bosphorus view apartments in Beşiktaş or Nişantaşı corridors for long-term rental.",
      source: "Contact Brief",
      status: "Contacted",
      createdAt: day(-1, 14),
      propertySlug: "besiktas-studio-package-500",
    },
    {
      id: "inq-3",
      name: "Alexander Becker",
      email: "alexander@example.test",
      phone: "+49 170 987 6543",
      topic: "Commercial / High-Yield Portfolio",
      budget: "$1,200,000",
      message: "Inquiring about Istanbul commercial floorplate or packaged residential units with SPK appraisal reports.",
      source: "WhatsApp Click",
      status: "Qualified",
      createdAt: day(-2, 11),
    },
    {
      id: "inq-4",
      name: "David Sterling",
      email: "david@example.test",
      phone: "+44 7700 900123",
      topic: "Turkish Citizenship (CBI)",
      budget: "$420,000",
      message: "Family relocation planning. Requesting full due diligence catalog and private viewing schedule for next week.",
      source: "Website Consultation",
      status: "New",
      createdAt: day(0, 16),
      propertySlug: "pearl-residence-topkapi-2-1",
    },
  ];
  return {
    properties: props, contacts, leads, inquiries,
    siteSettings: { ...DEFAULT_SITE_SETTINGS },
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

const serverSnapshot: DB = {
  properties: [], contacts: [], leads: [], tasks: [], viewings: [], deals: [],
  inquiries: [], siteSettings: { ...DEFAULT_SITE_SETTINGS }, activity: [], readNotes: [],
};
let db: DB | null = null;
let committed: DB | null = null;
const listeners = new Set<() => void>();
const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
if (typeof window !== "undefined") window.addEventListener("storage", (event) => {
  if (event.key === KEY) { db = null; committed = null; listeners.forEach((l) => l()); }
  if (event.key === SKEY) { session = undefined; listeners.forEach((l) => l()); }
});

function load(): DB {
  if (typeof window === "undefined") return serverSnapshot;
  if (db) return db;
  const raw = localStorage.getItem(KEY);
  if (raw) {
    // Preserve existing business data; never rewrite legal identity or reset corrupt storage silently.
    const parsed = JSON.parse(raw) as DB;
    if (!parsed || !Array.isArray(parsed.properties)) throw new Error("Stored workspace is invalid. Export it before restoring a valid backup.");
    db = parsed;
  } else {
    db = seed();
    localStorage.setItem(KEY, JSON.stringify(db));
  }
  committed = copy(db);
  return db!;
}
function edit(): DB {
  if (typeof window === "undefined") throw new Error("The demo workspace cannot be mutated during server rendering.");
  db = copy(load());
  return db;
}
function save() {
  try {
    const encoded = JSON.stringify(db);
    localStorage.setItem(KEY, encoded);
    // useSyncExternalStore requires a new snapshot identity after a mutation.
    db = JSON.parse(encoded) as DB;
    committed = copy(db);
  } catch {
    db = committed ? copy(committed) : null;
    throw new Error("The browser could not save these changes. Free storage or export your workspace and try again.");
  }
  window.dispatchEvent(new CustomEvent("site-settings-updated", { detail: db?.siteSettings }));
  listeners.forEach((l) => l());
}
export function useDB(): DB {
  return useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), load, () => serverSnapshot);
}

// ---------- session & permissions (DEMO ONLY, not security) ----------
let session: User | null | undefined;
export function getSession(): User | null {
  if (typeof window === "undefined" || !DEMO_ENABLED) return null;
  if (session === undefined) { const id = localStorage.getItem(SKEY); session = USERS.find((u) => u.id === id) ?? null; }
  return session;
}
export function useSession() { return useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), getSession, () => null); }
export function login(email: string, pw: string): User | null {
  if (!DEMO_ENABLED) throw new Error("Demo login is disabled. The production authentication backend has not been connected.");
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
  load().activity.unshift({ id: uid(), at: new Date().toISOString(), userId: getSession()?.id ?? "", kind, text, ref } as Activity);
}
type Coll = "properties" | "contacts" | "leads" | "tasks" | "viewings" | "deals" | "inquiries";
const perm: Record<Coll, Action> = {
  properties: "edit-inventory",
  contacts: "edit-crm",
  leads: "edit-crm",
  tasks: "edit-crm",
  viewings: "edit-crm",
  deals: "edit-crm",
  inquiries: "edit-crm",
};
function ownerOf(coll: Coll, item: Record<string, unknown>): string | undefined {
  const owner = coll === "tasks" ? item["assigneeId"] : item["agentId"];
  return typeof owner === "string" ? owner : undefined;
}
function assertAccess(coll: Coll, item: Record<string, unknown>) {
  const owner = ownerOf(coll, item);
  const user = getSession();
  guard(perm[coll], owner);
  if (user?.role === "agent" && (!owner || owner !== user.id)) throw new Error("Only your assigned records can be changed.");
}
export function upsert<T extends { id: string }>(coll: Coll, item: Record<string, unknown> & { id?: string }, _ownerId?: string): T {
  const current = item.id ? (load()[coll] as unknown as Record<string, unknown>[]).find((x) => x["id"] === item.id) : undefined;
  if (item.id && !current) throw new Error("Record not found.");
  const candidate = { ...current, ...item };
  assertAccess(coll, current ?? candidate);
  assertAccess(coll, candidate);
  if (coll === "properties") {
    if (candidate["publication"] !== current?.["publication"]) guard("publish");
    const p = candidate as unknown as Property;
    if (p.publication === "Published") {
      const issues = publishIssues(p, load().properties);
      if (issues.length) throw new Error(issues.join(". "));
    }
    for (const k of ["amount", "bathrooms", "grossM2", "netM2", "areaM2"]) requireAmount(candidate[k], k);
    requireEnum(p.availability, AVAIL, "availability");
    requireEnum(p.publication, PUBL, "publication");
    if (load().properties.some((x) => x.id !== item.id && (x.ref === p.ref || x.slug === p.slug))) throw new Error("Property reference and slug must be unique.");
  }
  if (coll === "contacts") {
    const contact = candidate as unknown as Contact;
    requireText(contact.name, "Contact name", 200);
    requireEnum(contact.kind, ["person", "company"], "contact type");
    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) throw new Error("Enter a valid email.");
    if (!Array.isArray(contact.roles) || contact.roles.some((value) => typeof value !== "string")) throw new Error("Invalid contact roles.");
  }
  if (coll === "leads") {
    const l = candidate as unknown as Lead;
    if (!load().contacts.some((x) => x.id === l.contactId)) throw new Error("Contact not found.");
    requireEnum(l.stage, LEAD_STAGES, "lead stage");
    requireAmount(l.budgetMin, "Minimum budget"); requireAmount(l.budgetMax, "Maximum budget");
    if (l.budgetMin !== null && l.budgetMax !== null && l.budgetMin > l.budgetMax) throw new Error("Minimum budget exceeds maximum.");
    if (l.stage === "Lost") requireText(l.lossReason, "Loss reason");
    if (l.stage === "Converted" && (!l.dealId || !load().deals.some((d) => d.id === l.dealId && d.leadId === l.id))) throw new Error("Use Convert to deal to link the actual opportunity.");
    if (l.nextFollowUp !== null) requireDate(l.nextFollowUp, "Follow-up");
    if (!Array.isArray(l.shortlist) || l.shortlist.some((id) => !load().properties.some((p) => p.id === id))) throw new Error("Shortlists must contain property IDs.");
  }
  if (coll === "tasks") { requireText(candidate["title"], "Task title"); requireDate(candidate["due"], "task date"); requireEnum(candidate["priority"], ["Low", "Normal", "High"], "task priority"); if (typeof candidate["done"] !== "boolean") throw new Error("Invalid task completion."); }
  if (coll === "viewings") {
    const v = candidate as unknown as Viewing;
    requireEnum(v.status, ["Scheduled", "Confirmed", "Completed", "Cancelled", "No-show"], "viewing status");
    requireDate(v.start, "viewing start"); requireDate(v.end, "viewing end");
    if (Date.parse(v.end) <= Date.parse(v.start)) throw new Error("Viewing end must follow its start.");
    if (!load().contacts.some((c) => c.id === v.contactId) || !load().properties.some((p) => p.id === v.propertyId)) throw new Error("Select a valid contact and property.");
  }
  if (coll === "deals") {
    const x = candidate as unknown as Deal;
    if (current && x.stage !== current["stage"]) throw new Error("Use the deal transition action to change its stage.");
    if (current && ["Reserved", "Due Diligence", "Contract", "Won", "Lost"].includes(String(current["stage"]))) throw new Error("Active reservations and closed deals cannot be edited. Review the transaction first.");
    requireText(x.title, "Deal title", 200);
    requireEnum(x.stage, DEAL_STAGES, "deal stage"); requireEnum(x.currency, ["USD", "EUR", "TRY", "GBP"], "deal currency");
    requireAmount(x.amount, "Deal amount");
    if (!load().contacts.some((c) => c.id === x.contactId)) throw new Error("Contact not found.");
    if (x.expectedClose !== null) requireDate(x.expectedClose, "Expected close date");
    if (!Array.isArray(x.propertyIds) || new Set(x.propertyIds).size !== x.propertyIds.length || x.propertyIds.some((id) => !load().properties.some((p) => p.id === id))) throw new Error("Select valid, distinct property IDs.");
    if (!current && x.stage !== "Opportunity") throw new Error("New deals start as opportunities.");
  }
  if (coll === "inquiries") {
    const q = candidate as unknown as Inquiry;
    requireText(q.name, "Client name", 200); requireText(q.topic, "Topic", 200);
    requireEnum(q.status, ["New", "Contacted", "Qualified", "Archived"], "inquiry status");
  }
  const d = edit();
  const list = d[coll] as unknown as T[];
  const created = { ...candidate, id: item.id ?? coll[0] + uid() } as T;
  if (coll === "properties") (created as unknown as Property).updatedAt = new Date().toISOString();
  const index = list.findIndex((x) => x.id === created.id);
  if (index >= 0) list[index] = created; else list.unshift(created);
  log(coll, `${current ? "Updated" : "Created"} ${coll} record`, { kind: coll, id: created.id });
  save();
  return copy(created);
}
export function bulkPublication(ids: string[], publication: Property["publication"]) {
  guard("edit-inventory"); guard("publish"); requireEnum(publication, PUBL, "publication");
  const current = ids.map((id) => {
    const property = load().properties.find((p) => p.id === id);
    if (!property) throw new Error("A selected property no longer exists.");
    if (publication === "Published") {
      const issues = publishIssues(property, load().properties);
      if (issues.length) throw new Error(property.ref + ": " + issues.join(". "));
    }
    return property;
  });
  const d = edit();
  for (const property of current) {
    const record = d.properties.find((p) => p.id === property.id)!;
    record.publication = publication; record.updatedAt = new Date().toISOString();
    log("properties", "Publication changed to " + publication, { kind: "properties", id: record.id });
  }
  save();
}
export function remove(coll: Coll, id: string) {
  const current = (load()[coll] as unknown as Record<string, unknown>[]).find((x) => x["id"] === id);
  if (!current) throw new Error("Record not found.");
  assertAccess(coll, current);
  if (coll !== "inquiries") throw new Error("Archive related business records rather than deleting them.");
  upsert<Inquiry>("inquiries", { id, status: "Archived" });
}
export function addActivity(kind: string, text: string, ref?: Activity["ref"]) {
  const u = getSession(); guard("edit-crm");
  if (u?.role === "agent") {
    const parent = ref ? (load().leads.find((x) => x.id === ref.id) ?? load().tasks.find((x) => x.id === ref.id)) : undefined;
    const assigned = parent ? ("agentId" in parent ? parent.agentId : parent.assigneeId) : undefined;
    if (assigned !== u.id) throw new Error("You cannot add activity to an unassigned record.");
  }
  requireText(text, "Activity text", 4000); edit(); log(kind, text, ref); save();
}
export function markRead(ids: string[], read: boolean) {
  if (!getSession()) throw new Error("Sign in first.");
  const d = edit(); d.readNotes = read ? [...new Set([...d.readNotes, ...ids])] : d.readNotes.filter((x) => !ids.includes(x)); save();
}
export function resetData() { guard("admin"); edit(); db = seed(); save(); }

export function useSiteSettings(): SiteSettings {
  const db = useDB();
  return db.siteSettings || DEFAULT_SITE_SETTINGS;
}

export function updateSiteSettings(patch: Partial<SiteSettings>) {
  guard("publish");
  const next = validateSettings({ ...load().siteSettings, ...patch });
  const d = edit(); d.siteSettings = next;
  log("settings", `Updated settings: ${Object.keys(patch).join(", ")}`); save();
}

export function createInquiry(item: Omit<Inquiry, "id" | "createdAt" | "status"> & { id?: string; status?: Inquiry["status"] }): Inquiry {
  // Staff manual entry only. Public WhatsApp drafts must not write to a visitor's local inbox.
  guard("edit-crm");
  const user = getSession()!;
  const name = requireText(item.name, "Client name", 200);
  requireText(item.topic, "Topic", 200); requireText(item.message, "Message", 4000);
  const d = edit();
  const created: Inquiry = { ...item, id: "inq-" + uid(), name, createdAt: new Date().toISOString(), status: "New", agentId: user.id };
  d.inquiries.unshift(created);
  log("inquiry", `Recorded inquiry from ${created.name}`, { kind: "inquiries", id: created.id }); save();
  return copy(created);
}

export type PublicEnquiryInput = {
  name: string;
  email: string;
  phone: string;
  topic: string;
  budget?: string | undefined;
  message: string;
  source?: Inquiry["source"] | undefined;
  propertySlug?: string | undefined;
};

export function recordPublicEnquiry(input: PublicEnquiryInput): {
  inquiry: Inquiry;
  lead?: Lead;
  receipt: string;
} {
  const name = (input.name || "Website Client").trim().slice(0, 200);
  const email = (input.email || "").trim().slice(0, 200);
  const phone = (input.phone || "").trim().slice(0, 100);
  const topic = (input.topic || "General Consultation").trim().slice(0, 200);
  const budget = (input.budget || "").trim().slice(0, 100);
  const message = (input.message || "Consultation request").trim().slice(0, 4000);
  const source = (input.source || "Website Consultation") as Inquiry["source"];
  
  const inqId = "inq-" + uid();
  const contactId = "c" + uid();
  const leadId = "lead-" + uid();

  const d = edit();

  let contact = d.contacts.find((c) => (email && c.email.toLowerCase() === email.toLowerCase()) || (phone && c.phone === phone));
  if (!contact) {
    contact = {
      id: contactId,
      name,
      email,
      phone,
      kind: "person",
      roles: ["buyer"],
      language: "en",
      agentId: "usr-admin-1",
      notes: `Captured via ${source}. Topic: ${topic}. Original budget: ${budget || "Not stated"}`,
    };
    d.contacts.unshift(contact);
  }

  const lead: Lead = {
    id: leadId,
    contactId: contact.id,
    source,
    agentId: contact.agentId || "usr-admin-1",
    districts: "",
    layout: "",
    budgetMin: null,
    budgetMax: null,
    currency: "USD",
    stage: "New",
    shortlist: input.propertySlug ? [input.propertySlug] : [],
    nextFollowUp: new Date(Date.now() + 86400000).toISOString(),
  };
  d.leads.unshift(lead);

  const created: Inquiry = {
    id: inqId,
    name,
    email,
    phone,
    topic,
    budget,
    message,
    source,
    ...(input.propertySlug ? { propertySlug: input.propertySlug } : {}),
    status: "New",
    createdAt: new Date().toISOString(),
    leadId: lead.id,
    agentId: contact.agentId || "usr-admin-1",
    notes: `Public website brief submitted directly to Advisory Desk.`,
  };
  d.inquiries.unshift(created);

  log("inquiry", `Recorded website inquiry from ${created.name}`, { kind: "inquiries", id: created.id });
  save();

  const receipt = `AVR-${Math.floor(100000 + Math.random() * 900000)}`;
  return { inquiry: copy(created), lead: copy(lead), receipt };
}
export function convertInquiryToLead(inquiryId: string): Lead {
  const current = load().inquiries.find((x) => x.id === inquiryId);
  if (!current) throw new Error("Inquiry not found.");
  assertAccess("inquiries", current as unknown as Record<string, unknown>);
  if (current.status === "Archived") throw new Error("Restore the inquiry before conversion.");
  if (current.leadId) {
    const existing = load().leads.find((l) => l.id === current.leadId);
    if (!existing) throw new Error("Linked lead is missing; review this inquiry.");
    return copy(existing);
  }
  const matches = load().contacts.filter((c) => contactMatch(c, current));
  if (matches.length > 1) throw new Error("Multiple matching contacts need duplicate review before conversion.");
  const user = getSession()!;
  if (matches[0] && user.role === "agent" && matches[0].agentId !== user.id) throw new Error("Matching contact is assigned to another advisor.");
  const d = edit();
  const inq = d.inquiries.find((x) => x.id === inquiryId)!;
  let contact = matches[0] ? d.contacts.find((c) => c.id === matches[0]!.id) : undefined;
  if (!contact) {
    contact = { id: "c" + uid(), name: inq.name, email: inq.email, phone: inq.phone, kind: "person", roles: ["buyer"], language: "", agentId: inq.agentId ?? user.id, notes: `Source: ${inq.source}; topic: ${inq.topic}; original budget: ${inq.budget || "unspecified"}` };
    d.contacts.unshift(contact);
  }
  const budget = exactBudget(inq.budget);
  const property = inq.propertySlug ? d.properties.find((p) => p.slug === inq.propertySlug) : undefined;
  const lead: Lead = { id: "l" + uid(), contactId: contact.id, source: inq.source, agentId: contact.agentId, districts: "", layout: "", budgetMin: null, budgetMax: budget?.amount ?? null, currency: budget?.currency ?? "USD", stage: "New", nextFollowUp: day(1), shortlist: property ? [property.id] : [] };
  d.leads.unshift(lead); inq.leadId = lead.id;
  log("inquiry", `Inquiry linked to lead for ${inq.name}`, { kind: "lead", id: lead.id }); save();
  return copy(lead);
}
export function exportBackup(): string {
  guard("admin");
  return JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), data: load(), externalFilesIncluded: false, embeddedCoversIncluded: true }, null, 2);
}
export function importBackup(jsonString: string): boolean {
  guard("admin");
  if (jsonString.length > 10_000_000) throw new Error("Backup exceeds the 10 MB demo limit.");
  const validated = validateWorkspace(JSON.parse(jsonString));
  edit(); db = copy(validated); save(); return true;
}

export function publishIssues(p: Property, all: Property[]): string[] {
  const out: string[] = [];
  if (!p.title.trim()) out.push("Add a title");
  if (!/^[a-z0-9-]+$/.test(p.slug)) out.push("Slug must be lowercase letters, numbers and hyphens");
  if (all.some((x) => x.id !== p.id && x.slug === p.slug)) out.push("Slug is already used by another listing");
  if (!p.district.trim()) out.push("Add a location / district");
  if (!p.cover) out.push("Upload and select a cover image");
  if (p.priceType !== "on-request" && (p.amount == null || !Number.isFinite(p.amount) || p.amount <= 0 || !p.currency)) out.push("Enter price and currency, or mark price on request");
  return out;
}
export function setStage(leadId: string, stage: Lead["stage"], lossReason?: string) {
  const l = load().leads.find((x) => x.id === leadId);
  if (!l) throw new Error("Lead not found.");
  const before = l.stage;
  if (stage === "Converted" && !l.dealId) throw new Error("Use Convert to deal first.");
  upsert<Lead>("leads", { id: leadId, stage, ...(lossReason ? { lossReason } : {}) }, l.agentId);
  addActivity("lead", `Stage changed from ${before} to ${stage}${lossReason ? " (" + lossReason + ")" : ""}`, { kind: "lead", id: leadId });
}
export function convertLead(leadId: string): Deal {
  const current = load().leads.find((x) => x.id === leadId);
  if (!current) throw new Error("Lead not found.");
  assertAccess("leads", current as unknown as Record<string, unknown>);
  if (current.dealId) {
    const existing = load().deals.find((x) => x.id === current.dealId);
    if (!existing) throw new Error("Linked deal is missing.");
    return copy(existing);
  }
  const d = edit(); const l = d.leads.find((x) => x.id === leadId)!;
  const c = d.contacts.find((x) => x.id === l.contactId);
  if (!c) throw new Error("Contact not found.");
  // A shortlist is not an agreement to purchase every listed property.
  const deal: Deal = { id: "d" + uid(), title: c.name + " — deal", contactId: l.contactId, leadId, propertyIds: [], agentId: l.agentId, stage: "Opportunity", amount: null, currency: l.currency, expectedClose: null };
  d.deals.unshift(deal); l.stage = "Converted"; l.dealId = deal.id;
  log("deal", "Created deal from lead", { kind: "lead", id: leadId }); save();
  return copy(deal);
}
export function setDealStage(dealId: string, stage: Deal["stage"]) {
  const current = load().deals.find((x) => x.id === dealId);
  if (!current) throw new Error("Deal not found.");
  assertAccess("deals", current as unknown as Record<string, unknown>);
  requireEnum(stage, DEAL_STAGES, "deal stage");
  if (current.stage === stage) return;
  const steps = ["Opportunity", "Offer Prepared", "Offer Accepted", "Reserved", "Due Diligence", "Contract", "Won"];
  if (["Won", "Lost"].includes(current.stage)) throw new Error("Closed deals require a reviewed reversal; they cannot be reopened silently.");
  if (stage !== "Lost" && steps.indexOf(stage) !== steps.indexOf(current.stage) + 1) throw new Error("Advance to the next deal stage, or mark the opportunity lost.");
  const selected = ["Reserved", "Due Diligence", "Contract", "Won"].includes(stage)
    ? validateDealSelection(current, load().properties, load().deals) : [];
  const d = edit(); const deal = d.deals.find((x) => x.id === dealId)!;
  const before = deal.stage; deal.stage = stage;
  if (stage === "Won") selected.forEach((x) => {
    const p = d.properties.find((p) => p.id === x.id)!;
    p.availability = deal.stage === "Won" && p.mode === "rent" ? "Rented" : "Sold";
    p.updatedAt = new Date().toISOString();
  });
  else if (stage === "Reserved") selected.forEach((x) => {
    const p = d.properties.find((p) => p.id === x.id)!;
    p.availability = "Reserved"; p.updatedAt = new Date().toISOString();
  });
  else if (stage === "Lost" && ["Reserved", "Due Diligence", "Contract"].includes(before)) deal.propertyIds.forEach((id) => {
    const p = d.properties.find((p) => p.id === id);
    if (p?.availability === "Reserved") { p.availability = "Available"; p.updatedAt = new Date().toISOString(); }
  });
  log("deal", `Deal stage changed from ${before} to ${stage}`, { kind: "deals", id: dealId }); save();
}
export function winDeal(dealId: string) { setDealStage(dealId, "Won"); }

export const userName = (id: string) => USERS.find((u) => u.id === id)?.name ?? "—";
export const fmtMoney = (n: number | null, c: string | null) => (n == null || !c ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n));
export const fmtDate = (s: string | null, time = false) => (!s ? "—" : new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", day: "2-digit", month: "short", ...(time ? { hour: "2-digit", minute: "2-digit" } : {}) }).format(new Date(s)));
export const normPhone = (s: string) => s.replace(/\D/g, "");
