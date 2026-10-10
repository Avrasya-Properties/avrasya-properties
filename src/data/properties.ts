import raw from "./source.json";

export type Area = { value_m2: number; basis: "gross" | "net" | "unspecified"; layout?: string; scope?: string; unit_count?: number };
export type Price = {
  currency: "USD" | "TRY" | null;
  amount: number | null;
  basis: string;
  status: string;
  previous_advertised_amount?: number;
  down_payment_amount?: number;
  down_payment_percent?: number;
  delivery_payment_amount?: number;
  delivery_payment_percent?: number;
  installment_amount?: number;
  installment_count?: number;
  expenses_amount?: number;
  list_price?: number;
  source_offers?: { amount: number; basis: string; source_id: string; area_m2: number | null }[];
};
export type RecordType = "unit_offer" | "unit_type" | "package" | "project" | "ambiguous_offer";
export type PropertyRecord = {
  slug: string;
  marketing_title: string;
  city: string;
  location_label: string | null;
  side: "Europe" | "Asia" | "unknown";
  record_type: RecordType;
  layout_label: string | null;
  price: Price;
  areas: Area[];
  source_ids: string[];
  availability_verified: boolean;
  details: { [k: string]: unknown; project?: string; note?: string; delivery_source?: string | null; installment_offer?: unknown; claims_requiring_confirmation?: string[]; supporting_plan?: unknown };
};

const data = raw as unknown as { records: PropertyRecord[]; legacy_snapshot_only_records: { slug: string; price_usd: number }[] };
export const properties: PropertyRecord[] = data.records;
export const legacyRecords = data.legacy_snapshot_only_records;

export const CONTACT = {
  email: "info.avrasyaproperties@gmail.com",
  phone: "+90 545 924 80 42",
  phoneHref: "tel:+905459248042",
  whatsapp: "https://wa.me/905459248042",
  company: "Albaraka Dış Ticaret Limited Şirketi",
  address: "Mimar Sinan Mahallesi, Selam-i Ali Efendi Caddesi, Ara Kafe Yanı No:17, 34672 Üsküdar / İstanbul, Türkiye",
  tagline: "Your Future Starts with the Right Investment.",
};

export const waLink = (text: string) => `${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;

export const TYPE_LABEL: Record<RecordType, string> = {
  unit_offer: "Unit offer",
  unit_type: "Unit type",
  package: "Multi-apartment package",
  project: "Project introduction",
  ambiguous_offer: "Offer to confirm",
};

const fmt = (n: number, c = "USD") => (c === "USD" ? "$" : "TRY ") + n.toLocaleString("en-US");

/** Human price headline + qualifier appropriate to the record's price basis. */
export function priceDisplay(p: Price): { main: string; note: string } {
  if (p.basis === "on_request") return { main: "Price on request", note: "Enquire for current options" };
  if (p.basis === "conflicting_starting_prices") return { main: "Request current options", note: "Two source starting prices on file" };
  if (p.basis === "scope_unconfirmed") return { main: "Confirm offer details", note: "Flyer amount scope unclear" };
  if (p.basis === "installment_schedule" && p.down_payment_amount)
    return { main: `${fmt(p.down_payment_amount, "TRY")} down`, note: `TRY schedule · ${p.installment_count} instalments · full price to confirm` };
  if (p.amount == null) return { main: "Price on request", note: "" };
  const c = p.currency ?? "USD";
  const notes: Record<string, string> = {
    package: "Package total · not a per-unit price",
    cash: "Cash · source-advertised",
    advertised: "Source-advertised",
    special_offer: "Special offer · source-advertised",
  };
  const extra = p.expenses_amount ? ` + ${fmt(p.expenses_amount)} stated expenses` : "";
  return { main: fmt(p.amount, c), note: (notes[p.basis] ?? "Source-advertised") + extra };
}

/** USD amount usable for sorting / budget matching; null when not comparable. */
export function comparableUsd(p: Price): number | null {
  if (p.currency !== "USD" || p.amount == null) return null;
  if (["scope_unconfirmed", "conflicting_starting_prices", "on_request"].includes(p.basis)) return null;
  return p.amount;
}

export function areaText(r: PropertyRecord): string {
  if (!r.areas.length) return "Area not supplied";
  return r.areas
    .map((a) => {
      const basis = a.basis === "unspecified" ? "basis unspecified" : a.basis;
      return `${a.layout ? a.layout + ": " : ""}${a.value_m2} m² ${basis}${a.scope ? " " + a.scope : ""}`;
    })
    .join(" · ");
}

export const locationText = (r: PropertyRecord) =>
  r.location_label ? `${r.location_label}, ${r.city}` : "Location to confirm";

export const sideText = (r: PropertyRecord) => (r.side === "unknown" ? "Side to confirm" : `${r.side}an side`);

export const LAYOUTS = ["1+1", "2+1", "Duplex"] as const;
export function matchesLayout(r: PropertyRecord, l: string) {
  const s = r.layout_label ?? "";
  return l === "Duplex" ? /duplex/i.test(s) : s.includes(l);
}

export const LOCATIONS = Array.from(new Set(properties.map((r) => r.location_label).filter(Boolean))) as string[];

export const BUDGETS = [
  { id: "u300", label: "Up to $300,000", min: 0, max: 300000 },
  { id: "300-450", label: "$300,000 – $450,000", min: 300000, max: 450000 },
  { id: "450-600", label: "$450,000 – $600,000", min: 450000, max: 600000 },
  { id: "600", label: "$600,000+", min: 600000, max: Infinity },
];

export type Filters = { q?: string | undefined; loc?: string | undefined; side?: string | undefined; layout?: string | undefined; type?: string | undefined; budget?: string | undefined; sort?: string | undefined };

export function filterProperties(f: Filters) {
  const q = f.q?.toLowerCase().trim();
  const b = BUDGETS.find((x) => x.id === f.budget);
  let list = properties.filter((r) => {
    if (q && !`${r.marketing_title} ${r.location_label ?? ""} ${r.layout_label ?? ""}`.toLowerCase().includes(q)) return false;
    if (f.loc && r.location_label !== f.loc) return false;
    if (f.side && r.side !== f.side) return false;
    if (f.layout && !matchesLayout(r, f.layout)) return false;
    if (f.type && r.record_type !== f.type) return false;
    if (b) {
      const v = comparableUsd(r.price);
      if (v == null || v < b.min || v >= b.max) return false;
    }
    return true;
  });
  if (f.sort === "price-asc" || f.sort === "price-desc") {
    const dir = f.sort === "price-asc" ? 1 : -1;
    list = list
      .map((r, i) => ({ r, i, v: comparableUsd(r.price) }))
      .sort((a, b) => (a.v == null && b.v == null ? a.i - b.i : a.v == null ? 1 : b.v == null ? -1 : (a.v - b.v) * dir || a.i - b.i))
      .map((x) => x.r);
  }
  return list;
}

/** Records excluded from a budget filter because their price is not comparable in USD. */
export const unmatchablePrices = () => properties.filter((r) => comparableUsd(r.price) == null);

export const humanKey = (k: string) =>
  k.replace(/_source$/, "").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export const getProperty = (slug: string) => properties.find((r) => r.slug === slug);
