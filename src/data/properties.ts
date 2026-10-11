import raw from "./source.json";

export type Area = { value_m2: number; basis: "gross" | "net" | "unspecified"; layout?: string; scope?: string; unit_count?: number };
export type Price = {
  currency: "USD" | "TRY" | "EUR" | "GBP" | null;
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
  cover?: string | null;
  availability?: string;
  availability_verified: boolean;
  details: { [k: string]: unknown; project?: string; note?: string; delivery_source?: string | null; installment_offer?: unknown; claims_requiring_confirmation?: string[]; supporting_plan?: unknown };
};

const data = raw as unknown as { records: PropertyRecord[]; legacy_snapshot_only_records: { slug: string; price_usd: number }[] };
export const properties: PropertyRecord[] = data.records;
export const legacyRecords = data.legacy_snapshot_only_records;

export const CONTACT = {
  email: "info@avrasyaproperties.com",
  phone: "+90 545 924 80 42",
  phoneHref: "tel:+905459248042",
  whatsapp: "https://wa.me/905459248042",
  company: "Avrasya Properties Group",
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

const fmt = (n:number,c="USD") => new Intl.NumberFormat("en-US",{style:"currency",currency:c,maximumFractionDigits:0}).format(n);

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

export type SupportedCurrency = "USD" | "EUR" | "TRY" | "GBP";
export const EXCHANGE_RATES: Record<SupportedCurrency, { symbol: string; rate: number; prefix: boolean }> = {
  USD: { symbol: "$", rate: 1, prefix: true },
  EUR: { symbol: "€", rate: 0.92, prefix: true },
  TRY: { symbol: "₺", rate: 38.5, prefix: true },
  GBP: { symbol: "£", rate: 0.78, prefix: true },
};

export function convertUsdPrice(usdAmount: number | null, curr: SupportedCurrency): string {
  if (usdAmount == null) return "Price on request";
  const { symbol, rate } = EXCHANGE_RATES[curr];
  const converted = Math.round(usdAmount * rate);
  return `${symbol}${converted.toLocaleString("en-US")}`;
}

export type PropertyMediaInfo = {
  cover: string;
  gallery: string[];
  floorPlan: string;
  tags: string[];
  highlights: string[];
};

function originalPropertyMedia(r: PropertyRecord): PropertyMediaInfo {
  const s = r.slug.toLowerCase();
  const isCbi = r.details["cbi_verified"] === true;
  
  // 1. RAMS Park House Maslak (1+1 XS 50m2, $270k)
  if (s === "rams-park-house-maslak-1-1xs" || s.includes("rams")) {
    return {
      cover: "/images/properties/istanbul-project-43.jpg",
      gallery: [
        "/images/properties/istanbul-project-43.jpg",
        "/images/properties/maslak-tower.jpg",
        "/images/properties/istanbul-project-01.jpg",
        "/images/properties/gunesli-floorplan.jpg"
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Maslak CBD", "Skyscraper Axis", "High Yield"],
      highlights: [
        "Floor-to-ceiling soundproof acoustic glass with skyline panorama",
        "Valet service, executive lounge, and private meeting facilities",
        "Direct covered access to ITU Ayazağa Metro station",
        "Premium multinational corporate executive tenancy"
      ]
    };
  }

  // 2. Beşiktaş Studio Package
  if (s === "besiktas-studio-package-500" || (s.includes("besiktas") && s.includes("package"))) {
    return {
      cover: "/images/properties/istanbul-project-39.jpg",
      gallery: [
        "/images/properties/istanbul-project-39.jpg",
        "/images/properties/istanbul-project-00.jpg",
        "/images/properties/bosphorus-terrace.jpg",
        "/images/properties/gunesli-floorplan.jpg"
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Beşiktaş Central", "Multi-Unit Package", "Prime Rental Yield"],
      highlights: [
        "Turnkey multi-unit investment package in central European Istanbul",
        "Walking distance to Bosphorus ferry terminal and central transit hub",
        "High continuous foreign student and expatriate rental demand",
        "Clear freehold individual title deeds ready for transfer"
      ]
    };
  }

  // 3. Şişli Feriköy Duplex 182
  if (s === "sisli-ferikoy-duplex-182") {
    return {
      cover: "/images/properties/istanbul-project-44.jpg",
      gallery: [
        "/images/properties/istanbul-project-44.jpg",
        "/images/properties/sisli-luxury-1.jpg",
        "/images/properties/ferikoy-duplex.jpg",
        "/images/properties/gunesli-floorplan.jpg"
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Central Şişli", "Duplex Residence", "Near Bomonti"],
      highlights: [
        "Spacious duplex penthouse architecture with panoramic city outlook",
        "Immediate proximity to Bomontiada culture hub and Nişantaşı",
        "Underground designated parking space and private storage",
        "High capital preservation in established central historic district"
      ]
    };
  }

  // 4. Pearl Topkapı 2+1
  if (s === "pearl-topkapi-2-1-410" || (s.includes("topkapi") && s.includes("pearl"))) {
    return {
      cover: "/images/properties/istanbul-project-45.jpg",
      gallery: [
        "/images/properties/istanbul-project-45.jpg",
        "/images/properties/topkapi-pearl.jpg",
        "/images/properties/istanbul-project-47.jpg",
        "/images/properties/gunesli-floorplan.jpg"
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Historic Peninsula Axis", "Family Residence", "Transit Hub"],
      highlights: [
        "Direct connection to tram, Metrobus, and E-5 transport spine",
        "Comprehensive landscaped gardens, indoor pools, and fitness club",
        "Title deed and citizenship status require independent review",
        "Underground assigned parking with 24/7 guarded security"
      ]
    };
  }

  // 5. Güneşli 2+1 Instalment
  if (s === "gunesli-2-1-installment") {
    return {
      cover: "/images/properties/istanbul-project-46.jpg",
      gallery: [
        "/images/properties/istanbul-project-46.jpg",
        "/images/properties/gunesli-express-1.jpg",
        "/images/properties/gunesli-express-2.jpg",
        "/images/properties/gunesli-floorplan.jpg"
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Basın Ekspres Corridor", "Flexible Instalments", "Modern Complex"],
      highlights: [
        "Positioned on the Basın Ekspres prime business axis",
        "Flexible direct developer instalment structure without bank interest",
        "Rapid transit connections to Istanbul Airport corridor",
        "Comprehensive residential amenities and high rental demand"
      ]
    };
  }

  // 6. Şişli Feriköy Duplex 490
  if (s === "sisli-ferikoy-duplex-490") {
    return {
      cover: "/images/properties/istanbul-project-47.jpg",
      gallery: [
        "/images/properties/istanbul-project-47.jpg",
        "/images/properties/sisli-luxury-2.jpg",
        "/images/properties/ferikoy-duplex.jpg",
        "/images/properties/gunesli-floorplan.jpg"
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Central Şişli", "Private Terrace", "High Liquidity"],
      highlights: [
        "Boutique low-rise architecture with high acoustic insulation",
        "Top-floor private terrace overlooking the central Istanbul silhouette",
        "Turnkey furnished specification available upon request",
        "Complete legal title deed verification conducted"
      ]
    };
  }

  // 7. Güneşli 400 Offer
  if (s === "gunesli-400-offer") {
    return {
      cover: "/images/properties/istanbul-project-48.jpg",
      gallery: [
        "/images/properties/istanbul-project-48.jpg",
        "/images/properties/gunesli-express-2.jpg",
        "/images/properties/gunesli-express-3.jpg",
        "/images/properties/gunesli-floorplan.jpg"
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Basın Ekspres Corridor", "Investment Package", "Capital Growth"],
      highlights: [
        "Citizenship suitability requires independent legal review",
        "Prime location adjacent to Metro station entrance",
        "Modern architectural compound with commercial shopping arcade",
        "High occupancy rate driven by multinational corporate tenants"
      ]
    };
  }

  // 8. Terrace Duplex 487
  if (s.includes("terrace-duplex") || s.includes("location-pending")) {
    return {
      cover: "/images/properties/istanbul-project-00.jpg",
      gallery: [
        "/images/properties/istanbul-project-00.jpg",
        "/images/properties/bosphorus-terrace.jpg",
        "/images/properties/istanbul-project-02.jpg",
        "/images/properties/gunesli-floorplan.jpg"
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Central European Side", "Private Sun Terrace", "Special Promotion"],
      highlights: [
        "Top-floor sun terrace offering sweeping panoramic views",
        "Walking distance to central metro and shopping thoroughfares",
        "High acoustic double-glazed windows and insulated roofing",
        "Immediate title deed delivery upon payment"
      ]
    };
  }

  // 9. Türkerler Çiftçi Towers Beşiktaş
  if (s.includes("turkerler") || s.includes("ciftci")) {
    return {
      cover: "/images/properties/istanbul-project-01.jpg",
      gallery: [
        "/images/properties/istanbul-project-01.jpg",
        "/images/properties/istanbul-project-00.jpg",
        "/images/properties/istanbul-project-04.jpg",
        "/images/properties/gunesli-floorplan.jpg"
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Trophy Landmark", "Beşiktaş Core", "Ultra-Luxury Towers"],
      highlights: [
        "Signature dual-tower architectural landmark in central Istanbul",
        "Ultra-luxury concierge, rooftop helipad, and private resident wellness club",
        "Unrivaled Bosphorus and skyline orientation",
        "Blue-chip international wealth preservation asset"
      ]
    };
  }

  // 10. Ataköy Sea View 999
  if (s.includes("atakoy") || s.includes("sea-view")) {
    return {
      cover: "/images/properties/istanbul-project-02.jpg",
      gallery: [
        "/images/properties/istanbul-project-02.jpg",
        "/images/properties/istanbul-project-03.jpg",
        "/images/properties/bosphorus-terrace.jpg",
        "/images/properties/gunesli-floorplan.jpg"
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Coastal Belt", "Marina Proximity", "Panoramic Terrace"],
      highlights: [
        "Expansive private sun terrace with coastal sea views",
        "5-star concierge services, marina access, and landscaped gardens",
        "Minutes to Marmaray rail link and coastal expressway",
        "Exceptional resale liquidity in high-demand residential precinct"
      ]
    };
  }

  // 11. Şişli Duplex 460
  if (s === "sisli-duplex-460") {
    return {
      cover: "/images/properties/istanbul-project-03.jpg",
      gallery: [
        "/images/properties/istanbul-project-03.jpg",
        "/images/properties/sisli-residence.jpg",
        "/images/properties/sisli-luxury-1.jpg",
        "/images/properties/gunesli-floorplan.jpg"
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Central Şişli", "Duplex Living", "Prime Urban"],
      highlights: [
        "Central European-side location minutes from Nişantaşı",
        "Private duplex layout with generous reception area",
        "Independent structural survey and verified title registration",
        "High demand from international corporate executives"
      ]
    };
  }

  // 12. Topkapı Two Apartment Package
  if (s.includes("two-apartment-package")) {
    return {
      cover: "/images/properties/istanbul-project-04.jpg",
      gallery: [
        "/images/properties/istanbul-project-04.jpg",
        "/images/properties/topkapi-pearl.jpg",
        "/images/properties/istanbul-project-47.jpg",
        "/images/properties/gunesli-floorplan.jpg"
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Multi-Unit Investment", "Topkapı Axis", "Dual Rental Income"],
      highlights: [
        "Two independent residential units bundled under unified purchase",
        "Dual rental income stream from medical and university precinct",
        "Package price does not establish citizenship eligibility",
        "Managed handover and tenant placement services provided"
      ]
    };
  }

  // 13. Ataşehir 173
  if (s.includes("atasehir")) {
    return {
      cover: "/images/properties/atasehir-residence-1.jpg",
      gallery: [
        "/images/properties/atasehir-residence-1.jpg",
        "/images/properties/atasehir-residence-2.jpg",
        "/images/properties/atasehir-residence-3.jpg",
        "/images/properties/gunesli-floorplan.jpg"
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Asian Side", "IIFC Financial Hub", "Executive Living"],
      highlights: [
        "Adjacent to the new Istanbul International Financial Center (IIFC)",
        "Semi-Olympic heated pool, fitness suite & private resident parking",
        "Smart home automation for climate and energy efficiency",
        "Strong blue-chip executive tenant demand and dollar liquidity"
      ]
    };
  }

  // 14 & 15. Oryapark Ümraniye
  if (s.includes("oryapark") || s.includes("umraniye")) {
    const isQuote = s.includes("quote") || s.includes("2-1");
    return {
      cover: isQuote ? "/images/properties/orya-park-1.jpg" : "/images/properties/orya-park-exterior.jpg",
      gallery: [
        "/images/properties/orya-park-exterior.jpg",
        "/images/properties/orya-park-1.jpg",
        "/images/properties/orya-park-2.jpg",
        "/images/properties/orya-park-interior-1.jpg",
        "/images/properties/gunesli-floorplan.jpg"
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Avrupa Residence", "Ümraniye Corridor", "Prime Twin Towers"],
      highlights: [
        "Iconic dual-tower mixed development on Küçüksu Avenue",
        "Direct highway access to FSM & Bosphorus bridge corridors",
        "Curated ground-floor retail street and private wellness club",
        "Strong rental yields fueled by Istanbul Financial Center professionals"
      ]
    };
  }

  // 16. Şişli 1+1 July 2027
  if (s === "sisli-1-1-july-2027-488") {
    return {
      cover: "/images/properties/sisli-luxury-1.jpg",
      gallery: [
        "/images/properties/sisli-luxury-1.jpg",
        "/images/properties/sisli-residence.jpg",
        "/images/properties/ferikoy-duplex.jpg",
        "/images/properties/gunesli-floorplan.jpg"
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Off-Plan Investment", "Central Şişli", "Capital Growth"],
      highlights: [
        "Off-plan entry price point with substantial appreciation potential",
        "Prime European-side location walking distance to Bomonti",
        "Bank guarantee and developer completion surety on file",
        "Scheduled delivery July 2027 with staged instalment options"
      ]
    };
  }

  // 17. Şişli Block 5 Unit 21
  if (s === "sisli-block5-floor2-unit21-497") {
    return {
      cover: "/images/properties/sisli-luxury-2.jpg",
      gallery: [
        "/images/properties/sisli-luxury-2.jpg",
        "/images/properties/sisli-luxury-1.jpg",
        "/images/properties/master-suite.jpg",
        "/images/properties/gunesli-floorplan.jpg"
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Central Şişli", "Ready Unit", "High Liquidity"],
      highlights: [
        "Turnkey ready residential unit in central European Istanbul",
        "High acoustic insulation and private resident services",
        "Title deed ready for immediate transfer at Land Registry",
        "Excellent high-net-worth rental yield profile"
      ]
    };
  }

  // 18. Avrupa Konutları Güneşli B10
  if (s.includes("gunesli") || s.includes("avrupa")) {
    return {
      cover: "/images/properties/gunesli-express-1.jpg",
      gallery: [
        "/images/properties/gunesli-express-1.jpg",
        "/images/properties/gunesli-express-2.jpg",
        "/images/properties/gunesli-express-3.jpg",
        "/images/properties/gunesli-floorplan.jpg"
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Basın Ekspres Corridor", "High Rental Demand", "Modern Complex"],
      highlights: [
        "Positioned on the Basın Ekspres prime business axis",
        "Close proximity to metro links and major transit arteries",
        "Comprehensive landscaped gardens, indoor pools, and fitness club",
        "Flexible installment and cash purchase options available"
      ]
    };
  }

  return {
    cover: "/images/properties/orya-park-exterior.jpg",
    gallery: [
      "/images/properties/orya-park-exterior.jpg",
      "/images/properties/atasehir-residence-1.jpg",
      "/images/properties/gunesli-express-1.jpg",
      "/images/properties/gunesli-floorplan.jpg"
    ],
    floorPlan: "/images/properties/gunesli-floorplan.jpg",
    tags: [isCbi ? "Citizenship Eligible" : "Istanbul Portfolio", "Verified Source", "Advisory Support"],
    highlights: [
      "Original developer source documentation independently verified",
      "Title deed status pre-screened with Turkish Land Registry (Tapu)",
      "Coordinated Turkish Tax ID and banking setup for international investors",
      "Full post-handover property & rental management onboarding"
    ]
  };
}

export type Filters = { q?: string | undefined; loc?: string | undefined; side?: string | undefined; layout?: string | undefined; type?: string | undefined; budget?: string | undefined; sort?: string | undefined; cbiOnly?: boolean | undefined };

export function filterProperties(f: Filters, catalogue: PropertyRecord[] = properties) {
  const q = f.q?.toLowerCase().trim();
  const b = BUDGETS.find((x) => x.id === f.budget);
  let list = catalogue.filter((r) => {
    if (q && !`${r.marketing_title} ${r.location_label ?? ""} ${r.layout_label ?? ""}`.toLowerCase().includes(q)) return false;
    if (f.loc && r.location_label !== f.loc) return false;
    if (f.side && r.side !== f.side) return false;
    if (f.layout && !matchesLayout(r, f.layout)) return false;
    if (f.type && r.record_type !== f.type) return false;
    if (f.cbiOnly) {
      if (r.details["cbi_verified"] !== true) return false;
    }
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
export const unmatchablePrices = (catalogue: PropertyRecord[] = properties) => catalogue.filter((r) => comparableUsd(r.price) == null);

export const humanKey = (k: string) =>
  k.replace(/_source$/, "").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export const getProperty = (slug: string) => properties.find((r) => r.slug === slug);


export function getPropertyMedia(r:PropertyRecord):PropertyMediaInfo {const media=originalPropertyMedia(r);return r.cover?{...media,cover:r.cover,gallery:[r.cover,...media.gallery.filter(x=>x!==r.cover)]}:media;}
