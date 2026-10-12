// Mock repository: all reads/writes go through this module so a future API can replace it.
import { useSyncExternalStore } from "react";
import {
  properties as sourceRecords,
  getPropertyMedia,
  type PropertyRecord,
  type RecordType,
  type Area,
} from "@/data/properties";

export type Role = "admin" | "manager" | "agent" | "viewer";
export type User = { id: string; name: string; email: string; role: Role };
export const USERS: User[] = [
  { id: "u1", name: "Selin Arda", email: "admin@avrasya.test", role: "admin" },
  { id: "u2", name: "Murat Kaya", email: "manager@avrasya.test", role: "manager" },
  { id: "u3", name: "Elif Demir", email: "agent@avrasya.test", role: "agent" },
  { id: "u4", name: "Can Yılmaz", email: "viewer@avrasya.test", role: "viewer" },
];
export const DEMO_PASSWORD = "AvrasyaDemo!26";

export const AVAIL = [
  "Unknown",
  "Available",
  "Under Offer",
  "Reserved",
  "Sold",
  "Rented",
  "Off Market",
] as const;
export const PUBL = ["Draft", "In Review", "Published", "Archived"] as const;
export const LEAD_STAGES = [
  "New",
  "Contacted",
  "Qualified",
  "Viewing",
  "Negotiation",
  "Converted",
  "Lost",
  "On Hold",
] as const;
export const DEAL_STAGES = [
  "Opportunity",
  "Offer Prepared",
  "Offer Accepted",
  "Reserved",
  "Due Diligence",
  "Contract",
  "Won",
  "Lost",
] as const;
export const SOURCES = ["Website", "WhatsApp", "Phone", "Referral", "Walk-in", "Campaign"] as const;
export type Currency = "USD" | "TRY" | "EUR" | "GBP";

export type Property = {
  id: string;
  ref: string;
  slug: string;
  title: string;
  district: string;
  city: string;
  type: string;
  layout: string | null;
  bathrooms: number | null;
  grossM2: number | null;
  netM2: number | null;
  areaM2: number | null;
  amount: number | null;
  currency: Currency | null;
  mode: "sale" | "rent";
  priceType: "fixed" | "from" | "on-request";
  availability: (typeof AVAIL)[number];
  publication: (typeof PUBL)[number];
  agentId: string;
  cover: string | null;
  description: string;
  project: string;
  updatedAt: string;
  sourceNote?: string;
  cbiEligible?: boolean;
  side?: "Europe" | "Asia";
  tapuStatus?: string;
};
export type Contact = {
  id: string;
  name: string;
  kind: "person" | "company";
  email: string;
  phone: string;
  roles: string[];
  language: string;
  agentId: string;
  notes: string;
};
export type Lead = {
  id: string;
  contactId: string;
  source: string;
  agentId: string;
  districts: string;
  layout: string;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: Currency;
  stage: (typeof LEAD_STAGES)[number];
  lossReason?: string;
  nextFollowUp: string | null;
  shortlist: string[];
  dealId?: string;
};
export type Task = {
  id: string;
  title: string;
  assigneeId: string;
  due: string;
  priority: "Low" | "Normal" | "High";
  done: boolean;
  link?: { kind: string; id: string };
};
export type Viewing = {
  id: string;
  contactId: string;
  propertyId: string;
  agentId: string;
  start: string;
  end: string;
  status: "Scheduled" | "Confirmed" | "Completed" | "Cancelled" | "No-show";
  notes: string;
};
export type Deal = {
  id: string;
  title: string;
  contactId: string;
  leadId?: string;
  propertyIds: string[];
  agentId: string;
  stage: (typeof DEAL_STAGES)[number];
  amount: number | null;
  currency: Currency;
  expectedClose: string | null;
};
export type Activity = {
  id: string;
  at: string;
  userId: string;
  kind: string;
  text: string;
  ref?: { kind: string; id: string };
};

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  topic: string;
  budget: string;
  message: string;
  source: "Website Consultation" | "WhatsApp Click" | "Contact Brief" | "Property Modal";
  propertySlug?: string;
  status: "New" | "Contacted" | "Qualified" | "Archived";
  createdAt: string;
  notes?: string;
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
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  companyName: "Avrasya Properties Group",
  registeredEntity: "Avrasya Properties Group",
  taxOffice: "Üsküdar / İstanbul",
  licenseNo: "İTO-34-78921",
  tagline: "Your Future Starts with the Right Investment.",
  email: "info@avrasyaproperties.com",
  phone: "+90 545 924 80 42",
  whatsapp: "https://wa.me/905459248042",
  address:
    "Mimar Sinan Mahallesi, Selam-i Ali Efendi Caddesi, Ara Kafe Yanı No:17, 34672 Üsküdar / İstanbul, Türkiye",
  advisoryHours: "Mon – Fri: 09:30 – 18:30 TRT | Sat: By Private Appointment",
  heroHeadline: "Curated Offers & Developments in Istanbul.",
  heroSubtitle:
    "Source-backed investment opportunities across central and Asian-side Istanbul. Every property is subject to preliminary title deed, zoning, and legal clearance before acquisition.",
  eyebrowText: "Istanbul Portfolio Collection",
  cbiThresholdUsd: 400000,
  preloaderOpacity: 0.5,
  exchangeRateEur: 0.892,
  exchangeRateTry: 49.17,
  exchangeRateGbp: 0.756,
  enableFrankfurterSync: true,
  announcementText: "",
  announcementActive: false,
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
const uid = () => Math.random().toString(36).slice(2, 9);
const day = (offset: number, h = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

function seed(): DB {
  const agents = ["u2", "u3"];
  const props: Property[] = sourceRecords.map((r, i) => {
    const a = (b: string) => r.areas.find((x) => x.basis === b)?.value_m2 ?? null;
    const media = getPropertyMedia(r);
    const baths = r.layout_label?.startsWith("1")
      ? 1
      : r.layout_label?.startsWith("2")
        ? 2
        : r.layout_label?.startsWith("3")
          ? 2
          : 3;
    const isCbi = (r.price.amount ?? 0) >= 400000;
    return {
      id: `p${i + 1}`,
      ref: `AVR-${String(1001 + i)}`,
      slug: r.slug,
      title: r.marketing_title,
      district: r.location_label ?? "",
      city: r.city,
      type: r.record_type.replace("_", " "),
      layout: r.layout_label,
      bathrooms: baths,
      grossM2: a("gross"),
      netM2: a("net"),
      areaM2: a("unspecified"),
      amount: r.price.amount,
      currency: (r.price.currency as Currency) ?? null,
      mode: "sale",
      priceType:
        r.price.amount == null ? "on-request" : r.record_type === "project" ? "from" : "fixed",
      availability: r.availability_verified ? "Available" : "Unknown",
      publication: "Published",
      agentId: agents[i % 2],
      cover: media.cover,
      project: String(r.details?.project ?? r.marketing_title.split(" — ")[0]),
      description: String(r.details?.note ?? ""),
      updatedAt: day(-i % 9),
      sourceNote: (r.details?.claims_requiring_confirmation ?? []).join("; "),
      cbiEligible: isCbi,
      side: r.side === "Asia" ? "Asia" : "Europe",
      tapuStatus: "Kat Mülkiyeti",
    } as Property;
  });
  const contacts: Contact[] = [
    ["Amira Haddad", "amira.h@example.test", "+90 555 010 0001", "Arabic"],
    ["Jonas Weber", "jonas.weber@example.test", "+49 151 000 0002", "German"],
    ["Leyla Rahimi", "leyla@example.test", "+90 555 010 0003", "English"],
    ["Northgate Holdings", "office@northgate.test", "+44 20 0000 0004", "English"],
    ["A. Haddad", "AMIRA.H@example.test", "+905550100001", "Arabic"],
  ].map(
    ([name, email, phone, language], i) =>
      ({
        id: `c${i + 1}`,
        name,
        email,
        phone,
        language,
        kind: i === 3 ? "company" : "person",
        roles: ["buyer"],
        agentId: agents[i % 2],
        notes: "",
      }) as Contact,
  );
  const leads: Lead[] = [
    {
      id: "l1",
      contactId: "c1",
      source: "Website",
      agentId: "u3",
      districts: "Beylikdüzü",
      layout: "2+1",
      budgetMin: 150000,
      budgetMax: 250000,
      currency: "USD",
      stage: "New",
      nextFollowUp: day(-1),
      shortlist: [],
    },
    {
      id: "l2",
      contactId: "c2",
      source: "WhatsApp",
      agentId: "u2",
      districts: "Esenyurt",
      layout: "1+1",
      budgetMin: 80000,
      budgetMax: 140000,
      currency: "USD",
      stage: "Qualified",
      nextFollowUp: day(1),
      shortlist: ["p1"],
    },
    {
      id: "l3",
      contactId: "c3",
      source: "Referral",
      agentId: "u3",
      districts: "Kadıköy",
      layout: "3+1",
      budgetMin: 8000000,
      budgetMax: 15000000,
      currency: "TRY",
      stage: "Viewing",
      nextFollowUp: day(2),
      shortlist: [],
    },
    {
      id: "l4",
      contactId: "c4",
      source: "Campaign",
      agentId: "u2",
      districts: "",
      layout: "",
      budgetMin: null,
      budgetMax: null,
      currency: "USD",
      stage: "Negotiation",
      nextFollowUp: null,
      shortlist: [],
    },
  ];
  const inquiries: Inquiry[] = [
    {
      id: "inq-1",
      name: "Tariq Mansour",
      email: "t.mansour@investgcc.com",
      phone: "+971 50 123 4567",
      topic: "Citizenship by Investment ($400k+)",
      budget: "$550,000",
      message:
        "Looking for 2 residential units qualifying for CBI with guaranteed title deed delivery before Q4.",
      source: "Website Consultation",
      status: "New",
      createdAt: day(0, 9),
      propertySlug: "rams-park-house-maslak-1-1xs",
    },
    {
      id: "inq-2",
      name: "Charlotte Dupont",
      email: "c.dupont@finance-eu.fr",
      phone: "+33 6 12 34 56 78",
      topic: "Property Selection",
      budget: "$750,000",
      message:
        "Interested in Bosphorus view apartments in Beşiktaş or Nişantaşı corridors for long-term rental.",
      source: "Contact Brief",
      status: "Contacted",
      createdAt: day(-1, 14),
      propertySlug: "besiktas-studio-package-500",
    },
    {
      id: "inq-3",
      name: "Alexander Becker",
      email: "a.becker@berlin-capital.de",
      phone: "+49 170 987 6543",
      topic: "Commercial / High-Yield Portfolio",
      budget: "$1,200,000",
      message:
        "Inquiring about Istanbul commercial floorplate or packaged residential units with SPK appraisal reports.",
      source: "WhatsApp Click",
      status: "Qualified",
      createdAt: day(-2, 11),
    },
    {
      id: "inq-4",
      name: "David Sterling",
      email: "david@sterlingholdings.co.uk",
      phone: "+44 7700 900123",
      topic: "Turkish Citizenship (CBI)",
      budget: "$420,000",
      message:
        "Family relocation planning. Requesting full due diligence catalog and private viewing schedule for next week.",
      source: "Website Consultation",
      status: "New",
      createdAt: day(0, 16),
      propertySlug: "pearl-residence-topkapi-2-1",
    },
  ];
  return {
    properties: props,
    contacts,
    leads,
    inquiries,
    siteSettings: { ...DEFAULT_SITE_SETTINGS },
    tasks: [
      {
        id: "t1",
        title: "Call Amira about Beylikdüzü options",
        assigneeId: "u3",
        due: day(-1),
        priority: "High",
        done: false,
        link: { kind: "lead", id: "l1" },
      },
      {
        id: "t2",
        title: "Send floor plans to Jonas",
        assigneeId: "u2",
        due: day(0, 15),
        priority: "Normal",
        done: false,
        link: { kind: "lead", id: "l2" },
      },
      {
        id: "t3",
        title: "Verify delivery date with developer",
        assigneeId: "u2",
        due: day(3),
        priority: "Low",
        done: false,
      },
    ],
    viewings: [
      {
        id: "v1",
        contactId: "c3",
        propertyId: "p2",
        agentId: "u3",
        start: day(0, 14),
        end: day(0, 15),
        status: "Confirmed",
        notes: "",
      },
      {
        id: "v2",
        contactId: "c2",
        propertyId: "p1",
        agentId: "u2",
        start: day(2, 11),
        end: day(2, 12),
        status: "Scheduled",
        notes: "",
      },
    ],
    deals: [
      {
        id: "d1",
        title: "Northgate — package offer",
        contactId: "c4",
        leadId: "l4",
        propertyIds: ["p3"],
        agentId: "u2",
        stage: "Offer Prepared",
        amount: 420000,
        currency: "USD",
        expectedClose: day(30),
      },
    ],
    activity: [
      {
        id: "a1",
        at: day(-1, 9),
        userId: "u3",
        kind: "lead",
        text: "New website enquiry from Amira Haddad",
        ref: { kind: "lead", id: "l1" },
      },
    ],
    readNotes: [],
  };
}

let db: DB | null = null;
const listeners = new Set<() => void>();
function load(): DB {
  if (db) return db;
  if (typeof window === "undefined") return (db = seed());
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) {
        if (!parsed.siteSettings) {
          parsed.siteSettings = { ...DEFAULT_SITE_SETTINGS };
        } else if (parsed.siteSettings.email === "info.avrasyaproperties@gmail.com") {
          parsed.siteSettings.email = "info@avrasyaproperties.com";
        }
        if (parsed.siteSettings?.registeredEntity?.includes("Albaraka")) {
          parsed.siteSettings.registeredEntity = "Avrasya Properties Group";
        }
        if (parsed.siteSettings?.companyName?.includes("Albaraka")) {
          parsed.siteSettings.companyName = "Avrasya Properties Group";
        }
        if (!parsed.inquiries) parsed.inquiries = seed().inquiries;
        if (parsed.properties) {
          parsed.properties.forEach((p: Property, i: number) => {
            if (i < sourceRecords.length && p.slug === sourceRecords[i]?.slug) {
              if (p.publication === "In Review" || (p.publication === "Draft" && i % 7 === 6)) {
                p.publication = "Published";
              }
            }
          });
        }
        db = parsed;
        return db!;
      }
    }
    db = seed();
  } catch {
    db = seed();
  }
  return db!;
}
function save() {
  localStorage.setItem(KEY, JSON.stringify(db));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("site-settings-updated", { detail: db?.siteSettings }));
    window.dispatchEvent(new CustomEvent("inventory-updated", { detail: db?.properties }));
  }
  listeners.forEach((l) => l());
}
export function useDB(): DB {
  return useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), load, load);
}

// ---------- session & permissions (DEMO ONLY, not security) ----------
let session: User | null | undefined;
export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  if (session === undefined) {
    const id = localStorage.getItem(SKEY);
    session = USERS.find((u) => u.id === id) ?? null;
  }
  return session;
}
export function useSession() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    getSession,
    () => null,
  );
}
export function login(email: string, pw: string): User | null {
  const u = USERS.find((x) => x.email === email.trim().toLowerCase());
  if (!u || pw !== DEMO_PASSWORD) return null;
  localStorage.setItem(SKEY, u.id);
  session = u;
  listeners.forEach((l) => l());
  return u;
}
export function logout() {
  localStorage.removeItem(SKEY);
  session = null;
  listeners.forEach((l) => l());
}

export type Action = "edit-inventory" | "publish" | "edit-crm" | "admin";
export function can(u: User | null, action: Action, ownerId?: string): boolean {
  if (!u) return false;
  if (u.role === "admin") return true;
  if (u.role === "viewer") return false;
  if (u.role === "manager") return action !== "admin";
  return action === "edit-crm" && (ownerId == null || ownerId === u.id);
}
function guard(action: Action, ownerId?: string) {
  if (!can(getSession(), action, ownerId))
    throw new Error("Your demo role does not permit this action.");
}

// ---------- mutations ----------
function log(kind: string, text: string, ref?: Activity["ref"]) {
  load().activity.unshift({
    id: uid(),
    at: new Date().toISOString(),
    userId: getSession()?.id ?? "",
    kind,
    text,
    ref,
  } as Activity);
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
export function upsert<T extends { id: string }>(
  coll: Coll,
  item: Record<string, unknown> & { id?: string },
  ownerId?: string,
): T {
  guard(perm[coll], ownerId);
  const list = load()[coll] as unknown as T[];
  if (item.id) {
    const i = list.findIndex((x) => x.id === item.id);
    list[i] = { ...list[i], ...item } as T;
    if (coll === "properties")
      (list[i] as unknown as Property).updatedAt = new Date().toISOString();
    save();
    return list[i]!;
  }
  const created = { ...item, id: coll[0] + uid() } as T;
  list.unshift(created);
  log(coll, `Created ${coll.slice(0, -1)}`, { kind: coll, id: created.id });
  save();
  return created;
}
export function remove(coll: Coll, id: string) {
  guard(perm[coll]);
  (load()[coll] as { id: string }[]).splice(
    (load()[coll] as { id: string }[]).findIndex((x) => x.id === id),
    1,
  );
  save();
}
export function addActivity(kind: string, text: string, ref?: Activity["ref"]) {
  log(kind, text, ref);
  save();
}
export function markRead(ids: string[], read: boolean) {
  const d = load();
  d.readNotes = read
    ? [...new Set([...d.readNotes, ...ids])]
    : d.readNotes.filter((x) => !ids.includes(x));
  save();
}
export function resetData() {
  guard("admin");
  db = seed();
  save();
}

export function useSiteSettings(): SiteSettings {
  const db = useDB();
  return db.siteSettings || DEFAULT_SITE_SETTINGS;
}

export function updateSiteSettings(patch: Partial<SiteSettings>) {
  const d = load();
  d.siteSettings = { ...d.siteSettings, ...patch };
  save();
  log("settings", `Updated website CMS settings: ${Object.keys(patch).join(", ")}`);
}

export function createInquiry(
  item: Omit<Inquiry, "id" | "createdAt" | "status"> & { id?: string; status?: Inquiry["status"] },
): Inquiry {
  const d = load();
  const created: Inquiry = {
    id: item.id || `inq-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    status: item.status || "New",
    ...item,
  };
  d.inquiries.unshift(created);
  log("inquiry", `New consultation inquiry from ${created.name} (${created.topic})`, {
    kind: "inquiries",
    id: created.id,
  });
  save();
  return created;
}

export function convertInquiryToLead(inquiryId: string): Lead {
  const d = load();
  const inq = d.inquiries.find((x) => x.id === inquiryId);
  if (!inq) throw new Error("Inquiry not found");

  let contact = d.contacts.find(
    (c) =>
      c.email.toLowerCase() === inq.email.toLowerCase() || (inq.phone && c.phone === inq.phone),
  );
  if (!contact) {
    contact = {
      id: `c${uid()}`,
      name: inq.name,
      email: inq.email || "client@inquiry.test",
      phone: inq.phone || "+90 555 000 0000",
      kind: "person",
      roles: ["buyer"],
      language: "English",
      agentId: "u2",
      notes: `Inquiry source: ${inq.source}. Topic: ${inq.topic}. Budget: ${inq.budget || "Unspecified"}`,
    };
    d.contacts.unshift(contact);
  }

  const budgetNum = inq.budget ? parseInt(inq.budget.replace(/\D/g, "")) || null : null;

  const lead: Lead = {
    id: `l${uid()}`,
    contactId: contact.id,
    source: inq.source,
    agentId: contact.agentId,
    districts: "",
    layout: "",
    budgetMin: budgetNum ? Math.round(budgetNum * 0.8) : null,
    budgetMax: budgetNum,
    currency: "USD",
    stage: "Qualified",
    nextFollowUp: day(1),
    shortlist: inq.propertySlug ? [inq.propertySlug] : [],
  };
  d.leads.unshift(lead);

  inq.status = "Qualified";
  log("inquiry", `Inquiry from ${inq.name} converted to CRM Lead`, { kind: "leads", id: lead.id });
  save();
  return lead;
}

export function exportBackup(): string {
  const d = load();
  return JSON.stringify(d, null, 2);
}

export function importBackup(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.properties || !Array.isArray(parsed.properties))
      throw new Error("Invalid backup: missing properties array");
    db = parsed;
    save();
    return true;
  } catch (e) {
    throw new Error(`Import failed: ${(e as Error).message}`);
  }
}

export function publishIssues(p: Property, all: Property[]): string[] {
  const out: string[] = [];
  if (!p.title.trim()) out.push("Add a title");
  if (!/^[a-z0-9-]+$/.test(p.slug)) out.push("Slug must be lowercase letters, numbers and hyphens");
  if (all.some((x) => x.id !== p.id && x.slug === p.slug))
    out.push("Slug is already used by another listing");
  if (!p.district.trim()) out.push("Add a location / district");
  if (!p.cover) out.push("Upload and select a cover image");
  if (p.priceType !== "on-request" && (p.amount == null || !p.currency))
    out.push("Enter price and currency, or mark price on request");
  return out;
}
export function setStage(leadId: string, stage: Lead["stage"], lossReason?: string) {
  const l = load().leads.find((x) => x.id === leadId)!;
  if (stage === "Lost" && !lossReason) throw new Error("A loss reason is required");
  upsert<Lead>("leads", { id: leadId, stage, ...(lossReason ? { lossReason } : {}) }, l.agentId);
  addActivity(
    "lead",
    `Stage changed ${l.stage === stage ? "" : ""}to ${stage}${lossReason ? ` (${lossReason})` : ""}`,
    { kind: "lead", id: leadId },
  );
}
export function convertLead(leadId: string): Deal {
  const d = load();
  const l = d.leads.find((x) => x.id === leadId)!;
  if (l.dealId) throw new Error("This lead already has a deal");
  const c = d.contacts.find((x) => x.id === l.contactId);
  const deal = upsert<Deal>(
    "deals",
    {
      title: `${c?.name ?? "Buyer"} — deal`,
      contactId: l.contactId,
      leadId,
      propertyIds: l.shortlist,
      agentId: l.agentId,
      stage: "Opportunity",
      amount: null,
      currency: l.currency,
      expectedClose: null,
    },
    l.agentId,
  );
  upsert<Lead>("leads", { id: leadId, stage: "Converted", dealId: deal.id }, l.agentId);
  return deal;
}
export function winDeal(dealId: string) {
  const d = load();
  const deal = d.deals.find((x) => x.id === dealId)!;
  guard("edit-crm", deal.agentId);
  deal.stage = "Won";
  deal.propertyIds.forEach((pid) => {
    const p = d.properties.find((x) => x.id === pid);
    if (p) p.availability = "Sold";
  });
  log("deal", `Deal won; ${deal.propertyIds.length} unit(s) marked Sold`, {
    kind: "deals",
    id: dealId,
  });
  save();
}

export const userName = (id: string) => USERS.find((u) => u.id === id)?.name ?? "—";
export const fmtMoney = (n: number | null, c: string | null) =>
  n == null || !c
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: c,
        maximumFractionDigits: 0,
      }).format(n);
export const fmtDate = (s: string | null, time = false) =>
  !s
    ? "—"
    : new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Istanbul",
        day: "2-digit",
        month: "short",
        ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
      }).format(new Date(s));
export const normPhone = (s: string) => s.replace(/\D/g, "");

export function toPropertyRecord(p: Property): PropertyRecord {
  const orig = sourceRecords.find((r) => r.slug === p.slug || r.marketing_title === p.title);
  const areas: Area[] = [];
  if (p.grossM2 != null)
    areas.push({ value_m2: p.grossM2, basis: "gross", layout: p.layout ?? undefined });
  if (p.netM2 != null)
    areas.push({ value_m2: p.netM2, basis: "net", layout: p.layout ?? undefined });
  if (p.areaM2 != null && !areas.length)
    areas.push({ value_m2: p.areaM2, basis: "unspecified", layout: p.layout ?? undefined });
  if (!areas.length && orig?.areas?.length) {
    areas.push(...orig.areas);
  }

  const recordType: RecordType =
    p.type === "package"
      ? "package"
      : p.type === "project"
        ? "project"
        : p.type === "unit type"
          ? "unit_type"
          : p.type === "ambiguous offer"
            ? "ambiguous_offer"
            : (orig?.record_type ?? "unit_offer");

  return {
    slug: p.slug,
    marketing_title: p.title || orig?.marketing_title || "Untitled Property",
    city: p.city || orig?.city || "Istanbul",
    location_label: p.district || orig?.location_label || null,
    side: (p.side === "Asia" ? "Asia" : "Europe") as "Europe" | "Asia",
    record_type: recordType,
    layout_label: p.layout ?? orig?.layout_label ?? null,
    price: {
      currency: (p.currency === "TRY" ? "TRY" : "USD") as "USD" | "TRY" | null,
      amount: p.amount,
      basis:
        p.priceType === "on-request"
          ? "on_request"
          : (orig?.price?.basis ?? (p.priceType === "from" ? "from" : "advertised")),
      status: "advertised",
    },
    areas,
    source_ids: orig?.source_ids ?? [],
    availability_verified: p.availability === "Available",
    details: {
      ...(orig?.details ?? {}),
      project: p.project || orig?.details?.project || p.title.split(" — ")[0],
      note: p.description || orig?.details?.note || "",
      cover: p.cover ?? undefined,
      claims_requiring_confirmation: p.sourceNote
        ? p.sourceNote.split("; ").filter(Boolean)
        : (orig?.details?.claims_requiring_confirmation ?? []),
    },
  };
}

export function getLivePropertyRecords(): PropertyRecord[] {
  const d = load();
  return d.properties.filter((p) => p.publication === "Published").map(toPropertyRecord);
}

export function getLivePropertyRecordBySlug(slug: string): PropertyRecord | undefined {
  const d = load();
  const p = d.properties.find((x) => x.slug === slug);
  if (p && p.publication === "Published") return toPropertyRecord(p);
  return sourceRecords.find((r) => r.slug === slug);
}
