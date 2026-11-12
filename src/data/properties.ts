import raw from "./source.json";
import { useSyncExternalStore } from "react";
import { regionForCity, slugifyRegion, type Region } from "./regions";

export type Area = {
  value_m2: number;
  basis: "gross" | "net" | "unspecified";
  layout?: string;
  scope?: string;
  unit_count?: number;
};
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
  id?: string;
  ref?: string;
  mode?: "sale" | "rent";
  bathrooms?: number | null;
  tapu_status?: string | null;
  source_note?: string | null;
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
  details: {
    [k: string]: unknown;
    project?: string;
    note?: string;
    delivery_source?: string | null;
    installment_offer?: unknown;
    claims_requiring_confirmation?: string[];
    supporting_plan?: unknown;
  };
};

const data = raw as unknown as {
  records: PropertyRecord[];
  legacy_snapshot_only_records: { slug: string; price_usd: number }[];
};
export const properties: PropertyRecord[] = data.records;
export const legacyRecords = data.legacy_snapshot_only_records;

export const CONTACT = {
  email: "info@avrasyaproperties.com",
  phone: "+90 545 924 80 42",
  phoneHref: "tel:+905459248042",
  whatsapp: "https://wa.me/905459248042",
  company: "Avrasya Properties Group",
  address:
    "Mimar Sinan Mahallesi, Selam-i Ali Efendi Caddesi, Ara Kafe Yanı No:17, 34672 Üsküdar / İstanbul, Türkiye",
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

const fmt = (n: number, c = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: c,
    maximumFractionDigits: 0,
  }).format(n);

/** Human price headline + qualifier appropriate to the record's price basis. */
export function priceDisplay(p: Price): { main: string; note: string } {
  if (p.basis === "on_request")
    return { main: "Price on request", note: "Enquire for current options" };
  if (p.basis === "conflicting_starting_prices")
    return { main: "Request current options", note: "Two source starting prices on file" };
  if (p.basis === "scope_unconfirmed")
    return { main: "Confirm offer details", note: "Flyer amount scope unclear" };
  if (p.basis === "installment_schedule" && p.down_payment_amount)
    return {
      main: `${fmt(p.down_payment_amount, "TRY")} down`,
      note: `TRY schedule · ${p.installment_count} instalments · full price to confirm`,
    };
  if (p.amount == null) return { main: "Price on request", note: "" };
  const c = p.currency ?? "USD";
  const notes: Record<string, string> = {
    package: "Package total · not a per-unit price",
    cash: "Cash · source-advertised",
    advertised: "Source-advertised",
    special_offer: "Special offer · source-advertised",
  };
  const extra = p.expenses_amount ? ` + ${fmt(p.expenses_amount)} stated expenses` : "";
  return {
    main: (p.basis === "from" ? "From " : "") + fmt(p.amount, c),
    note: (notes[p.basis] ?? "Source-advertised") + extra,
  };
}

/** USD amount usable for sorting / budget matching; null when not comparable. */
export function comparableUsd(p: Price): number | null {
  if (p.currency !== "USD" || p.amount == null) return null;
  if (["scope_unconfirmed", "conflicting_starting_prices", "on_request"].includes(p.basis))
    return null;
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

export const sideText = (r: PropertyRecord) =>
  r.side === "Europe" ? "European side" : r.side === "Asia" ? "Asian side" : "Side to confirm";

export const LAYOUTS = ["1+1", "2+1", "Duplex"] as const;
export function matchesLayout(r: PropertyRecord, l: string) {
  const s = r.layout_label ?? "";
  return l === "Duplex" ? /duplex/i.test(s) : s.includes(l);
}

export const LOCATIONS = Array.from(
  new Set(properties.map((r) => r.location_label).filter(Boolean)),
) as string[];

export const BUDGETS = [
  { id: "u300", label: "Up to $300,000", min: 0, max: 300000 },
  { id: "300-450", label: "$300,000 – $450,000", min: 300000, max: 450000 },
  { id: "450-600", label: "$450,000 – $600,000", min: 450000, max: 600000 },
  { id: "600", label: "$600,000+", min: 600000, max: Infinity },
];

export type SupportedCurrency = "USD" | "EUR" | "TRY" | "GBP";
export const EXCHANGE_RATES: Record<
  SupportedCurrency,
  { symbol: string; rate: number; prefix: boolean }
> = {
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

export const PROPERTY_CATEGORIES = [
  "Apartment",
  "Villa",
  "Penthouse",
  "Duplex",
  "Studio",
  "Commercial property",
  "Office",
  "Retail unit",
  "Land",
  "Residential development",
] as const;

export type PropertyCategory = (typeof PROPERTY_CATEGORIES)[number] | string;

export const IMAGE_CATEGORIES = [
  "Exterior",
  "Interior",
  "Living room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Balcony",
  "Terrace",
  "Garden",
  "Swimming pool",
  "Building facilities",
  "Views",
  "Neighborhood",
  "Construction progress",
] as const;

export type ImageCategory = (typeof IMAGE_CATEGORIES)[number] | string;

export const DEFAULT_AMENITY_CATALOG = [
  "Swimming pool",
  "Indoor pool",
  "Gym / fitness center",
  "Sauna / spa",
  "Turkish bath (Hammam)",
  "24/7 security",
  "Smart home features",
  "Concierge",
  "Underground parking",
  "Children's playground",
  "Walking paths",
  "Landscaped garden",
  "Sea view",
  "Bosphorus view",
  "City view",
  "Private terrace",
  "EV charging station",
  "Close to metro / public transport",
] as const;

export type GalleryItem = {
  id: string;
  url: string;
  category: ImageCategory;
  caption?: string | undefined;
  alt?: string | undefined;
  isPrimary?: boolean | undefined;
  sortOrder?: number | undefined;
  desktopUrl?: string | undefined;
  mobileUrl?: string | undefined;
};

export type FloorPlanItem = {
  id: string;
  title: string;
  unitType?: string | undefined;
  imageUrl: string;
  pdfUrl?: string | undefined;
  areaM2?: number | null | undefined;
  bedrooms?: number | null | undefined;
  bathrooms?: number | null | undefined;
};

export type PropertyDocumentItem = {
  id: string;
  title: string;
  category: string;
  url: string;
  fileType?: string | undefined;
  isPublic: boolean;
};

export type PropertySpecs = {
  floorNumber?: number | string | null | undefined;
  totalFloors?: number | null | undefined;
  balconyOrTerrace?: string | null | undefined;
  gardenOrOutdoor?: string | null | undefined;
  parking?: string | null | undefined;
  furnishingStatus?: string | null | undefined;
  constructionYear?: number | null | undefined;
  completionStatus?: string | null | undefined;
  propertyCondition?: string | null | undefined;
  heatingSystem?: string | null | undefined;
  buildingAge?: number | string | null | undefined;
  viewType?: string | null | undefined;
  orientation?: string | null | undefined;
  energyClass?: string | null | undefined;
};

export type PropertyPaymentPlan = {
  downPaymentPercent?: number | null | undefined;
  downPaymentAmount?: number | null | undefined;
  installmentMonths?: number | null | undefined;
  installmentAmount?: number | null | undefined;
  deliveryPaymentPercent?: number | null | undefined;
  additionalFeesNote?: string | null | undefined;
  rentalYieldNote?: string | null | undefined;
  capitalGrowthNote?: string | null | undefined;
  citizenshipNote?: string | null | undefined;
  summary?: string | null | undefined;
};

export type PropertyTranslation = {
  title?: string | undefined;
  shortDescription?: string | undefined;
  description?: string | undefined;
  highlights?: string[] | undefined;
  seoTitle?: string | undefined;
  seoDescription?: string | undefined;
};

export type PropertyMediaInfo = {
  cover: string;
  gallery: string[];
  galleryItems: GalleryItem[];
  floorPlan?: string | undefined;
  floorPlans: FloorPlanItem[];
  documents: PropertyDocumentItem[];
  tags: string[];
  highlights: string[];
};

function originalPropertyMedia(
  r: PropertyRecord,
): Omit<PropertyMediaInfo, "galleryItems" | "floorPlans" | "documents"> {
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
        "/images/properties/gunesli-floorplan.jpg",
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Maslak CBD", "Skyscraper Axis", "High Yield"],
      highlights: [
        "Floor-to-ceiling soundproof acoustic glass with skyline panorama",
        "Valet service, executive lounge, and private meeting facilities",
        "Direct covered access to ITU Ayazağa Metro station",
        "Premium multinational corporate executive tenancy",
      ],
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
        "/images/properties/gunesli-floorplan.jpg",
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [
        isCbi ? "Citizenship Eligible" : "Beşiktaş Central",
        "Multi-Unit Package",
        "Prime Rental Yield",
      ],
      highlights: [
        "Turnkey multi-unit investment package in central European Istanbul",
        "Walking distance to Bosphorus ferry terminal and central transit hub",
        "High continuous foreign student and expatriate rental demand",
        "Clear freehold individual title deeds ready for transfer",
      ],
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
        "/images/properties/gunesli-floorplan.jpg",
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Central Şişli", "Duplex Residence", "Near Bomonti"],
      highlights: [
        "Spacious duplex penthouse architecture with panoramic city outlook",
        "Immediate proximity to Bomontiada culture hub and Nişantaşı",
        "Underground designated parking space and private storage",
        "High capital preservation in established central historic district",
      ],
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
        "/images/properties/gunesli-floorplan.jpg",
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [
        isCbi ? "Citizenship Eligible" : "Historic Peninsula Axis",
        "Family Residence",
        "Transit Hub",
      ],
      highlights: [
        "Direct connection to tram, Metrobus, and E-5 transport spine",
        "Comprehensive landscaped gardens, indoor pools, and fitness club",
        "Title deed and citizenship status require independent review",
        "Underground assigned parking with 24/7 guarded security",
      ],
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
        "/images/properties/gunesli-floorplan.jpg",
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [
        isCbi ? "Citizenship Eligible" : "Basın Ekspres Corridor",
        "Flexible Instalments",
        "Modern Complex",
      ],
      highlights: [
        "Positioned on the Basın Ekspres prime business axis",
        "Flexible direct developer instalment structure without bank interest",
        "Rapid transit connections to Istanbul Airport corridor",
        "Comprehensive residential amenities and high rental demand",
      ],
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
        "/images/properties/gunesli-floorplan.jpg",
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Central Şişli", "Private Terrace", "High Liquidity"],
      highlights: [
        "Boutique low-rise architecture with high acoustic insulation",
        "Top-floor private terrace overlooking the central Istanbul silhouette",
        "Turnkey furnished specification available upon request",
        "Complete legal title deed verification conducted",
      ],
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
        "/images/properties/gunesli-floorplan.jpg",
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [
        isCbi ? "Citizenship Eligible" : "Basın Ekspres Corridor",
        "Investment Package",
        "Capital Growth",
      ],
      highlights: [
        "Citizenship suitability requires independent legal review",
        "Prime location adjacent to Metro station entrance",
        "Modern architectural compound with commercial shopping arcade",
        "High occupancy rate driven by multinational corporate tenants",
      ],
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
        "/images/properties/gunesli-floorplan.jpg",
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [
        isCbi ? "Citizenship Eligible" : "Central European Side",
        "Private Sun Terrace",
        "Special Promotion",
      ],
      highlights: [
        "Top-floor sun terrace offering sweeping panoramic views",
        "Walking distance to central metro and shopping thoroughfares",
        "High acoustic double-glazed windows and insulated roofing",
        "Immediate title deed delivery upon payment",
      ],
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
        "/images/properties/gunesli-floorplan.jpg",
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [
        isCbi ? "Citizenship Eligible" : "Trophy Landmark",
        "Beşiktaş Core",
        "Ultra-Luxury Towers",
      ],
      highlights: [
        "Signature dual-tower architectural landmark in central Istanbul",
        "Ultra-luxury concierge, rooftop helipad, and private resident wellness club",
        "Unrivaled Bosphorus and skyline orientation",
        "Blue-chip international wealth preservation asset",
      ],
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
        "/images/properties/gunesli-floorplan.jpg",
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [
        isCbi ? "Citizenship Eligible" : "Coastal Belt",
        "Marina Proximity",
        "Panoramic Terrace",
      ],
      highlights: [
        "Expansive private sun terrace with coastal sea views",
        "5-star concierge services, marina access, and landscaped gardens",
        "Minutes to Marmaray rail link and coastal expressway",
        "Exceptional resale liquidity in high-demand residential precinct",
      ],
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
        "/images/properties/gunesli-floorplan.jpg",
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Central Şişli", "Duplex Living", "Prime Urban"],
      highlights: [
        "Central European-side location minutes from Nişantaşı",
        "Private duplex layout with generous reception area",
        "Independent structural survey and verified title registration",
        "High demand from international corporate executives",
      ],
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
        "/images/properties/gunesli-floorplan.jpg",
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [
        isCbi ? "Citizenship Eligible" : "Multi-Unit Investment",
        "Topkapı Axis",
        "Dual Rental Income",
      ],
      highlights: [
        "Two independent residential units bundled under unified purchase",
        "Dual rental income stream from medical and university precinct",
        "Package price does not establish citizenship eligibility",
        "Managed handover and tenant placement services provided",
      ],
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
        "/images/properties/gunesli-floorplan.jpg",
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [
        isCbi ? "Citizenship Eligible" : "Asian Side",
        "IIFC Financial Hub",
        "Executive Living",
      ],
      highlights: [
        "Adjacent to the new Istanbul International Financial Center (IIFC)",
        "Semi-Olympic heated pool, fitness suite & private resident parking",
        "Smart home automation for climate and energy efficiency",
        "Strong blue-chip executive tenant demand and dollar liquidity",
      ],
    };
  }

  // 14 & 15. Oryapark Ümraniye
  if (s.includes("oryapark") || s.includes("umraniye")) {
    const isQuote = s.includes("quote") || s.includes("2-1");
    return {
      cover: isQuote
        ? "/images/properties/orya-park-1.jpg"
        : "/images/properties/orya-park-exterior.jpg",
      gallery: [
        "/images/properties/orya-park-exterior.jpg",
        "/images/properties/orya-park-1.jpg",
        "/images/properties/orya-park-2.jpg",
        "/images/properties/orya-park-interior-1.jpg",
        "/images/properties/gunesli-floorplan.jpg",
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [
        isCbi ? "Citizenship Eligible" : "Avrupa Residence",
        "Ümraniye Corridor",
        "Prime Twin Towers",
      ],
      highlights: [
        "Iconic dual-tower mixed development on Küçüksu Avenue",
        "Direct highway access to FSM & Bosphorus bridge corridors",
        "Curated ground-floor retail street and private wellness club",
        "Strong rental yields fueled by Istanbul Financial Center professionals",
      ],
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
        "/images/properties/gunesli-floorplan.jpg",
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [
        isCbi ? "Citizenship Eligible" : "Off-Plan Investment",
        "Central Şişli",
        "Capital Growth",
      ],
      highlights: [
        "Off-plan entry price point with substantial appreciation potential",
        "Prime European-side location walking distance to Bomonti",
        "Bank guarantee and developer completion surety on file",
        "Scheduled delivery July 2027 with staged instalment options",
      ],
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
        "/images/properties/gunesli-floorplan.jpg",
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [isCbi ? "Citizenship Eligible" : "Central Şişli", "Ready Unit", "High Liquidity"],
      highlights: [
        "Turnkey ready residential unit in central European Istanbul",
        "High acoustic insulation and private resident services",
        "Title deed ready for immediate transfer at Land Registry",
        "Excellent high-net-worth rental yield profile",
      ],
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
        "/images/properties/gunesli-floorplan.jpg",
      ],
      floorPlan: "/images/properties/gunesli-floorplan.jpg",
      tags: [
        isCbi ? "Citizenship Eligible" : "Basın Ekspres Corridor",
        "High Rental Demand",
        "Modern Complex",
      ],
      highlights: [
        "Positioned on the Basın Ekspres prime business axis",
        "Close proximity to metro links and major transit arteries",
        "Comprehensive landscaped gardens, indoor pools, and fitness club",
        "Flexible installment and cash purchase options available",
      ],
    };
  }

  return {
    cover: "/images/properties/orya-park-exterior.jpg",
    gallery: [
      "/images/properties/orya-park-exterior.jpg",
      "/images/properties/atasehir-residence-1.jpg",
      "/images/properties/gunesli-express-1.jpg",
      "/images/properties/gunesli-floorplan.jpg",
    ],
    floorPlan: "/images/properties/gunesli-floorplan.jpg",
    tags: [
      isCbi ? "Citizenship Eligible" : "Istanbul Portfolio",
      "Verified Source",
      "Advisory Support",
    ],
    highlights: [
      "Original developer source documentation independently verified",
      "Title deed status pre-screened with Turkish Land Registry (Tapu)",
      "Coordinated Turkish Tax ID and banking setup for international investors",
      "Full post-handover property & rental management onboarding",
    ],
  };
}

export type Filters = {
  q?: string | undefined;
  region?: string | undefined;
  loc?: string | undefined;
  neighborhood?: string | undefined;
  side?: string | undefined;
  layout?: string | undefined;
  type?: string | undefined;
  category?: string | undefined;
  project?: string | undefined;
  budget?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  bedrooms?: number | undefined;
  bathrooms?: number | undefined;
  minArea?: number | undefined;
  maxArea?: number | undefined;
  availability?: string | undefined;
  amenities?: string[] | undefined;
  completionStatus?: string | undefined;
  featuredOnly?: boolean | undefined;
  sort?: string | undefined;
  cbiOnly?: boolean | undefined;
};

export function getLiveProperties(): PropertyRecord[] {
  return properties;
}

export function useLiveProperties(): PropertyRecord[] {
  return properties;
}

export function primaryAreaM2(r: PropertyRecord): number | null {
  if (!r.areas || r.areas.length === 0) return null;
  const gross = r.areas.find((a) => a.basis === "gross");
  if (gross && Number.isFinite(gross.value_m2)) return gross.value_m2;
  const first = r.areas[0];
  return first && Number.isFinite(first.value_m2) ? first.value_m2 : null;
}

export function inferBedrooms(r: PropertyRecord): number | null {
  const explicit = r.details["bedrooms"];
  if (typeof explicit === "number" && Number.isFinite(explicit)) return explicit;
  const layout = r.layout_label ?? "";
  if (/studio/i.test(layout)) return 0;
  const match = layout.match(/(\d+)\s*\+/);
  return match ? Number(match[1]) : null;
}

export function filterProperties(
  f: Filters,
  catalogue: PropertyRecord[] = properties,
  budgets: readonly { id: string; min: number; max: number }[] = BUDGETS,
  regions: readonly Region[] = [],
) {
  const wanted = f.region ? regions.find((x) => x.slug === f.region) : undefined;
  const q = f.q?.toLowerCase().trim();
  const b = budgets.find((x) => x.id === f.budget);
  let list = catalogue.filter((r) => {
    const neighborhood = String(r.details["neighborhood"] ?? "");
    const project = String(r.details["project"] ?? "");
    const developer = String(r.details["developer"] ?? "");
    const category = String(r.details["property_category"] ?? "");
    const shortDesc = String(r.details["short_description"] ?? "");
    if (
      q &&
      !`${r.ref ?? ""} ${r.marketing_title} ${r.location_label ?? ""} ${neighborhood} ${r.city ?? ""} ${r.layout_label ?? ""} ${project} ${developer} ${category} ${shortDesc}`
        .toLowerCase()
        .includes(q)
    )
      return false;
    if (
      f.region &&
      !(wanted ? regionForCity(r.city, [wanted]) : slugifyRegion(r.city) === f.region)
    )
      return false;
    if (f.loc && r.location_label !== f.loc) return false;
    if (f.neighborhood && neighborhood.toLowerCase() !== f.neighborhood.toLowerCase()) return false;
    if (f.project && project.toLowerCase() !== f.project.toLowerCase()) return false;
    if (f.category && category.toLowerCase() !== f.category.toLowerCase()) return false;
    if (f.side && r.side !== f.side) return false;
    if (f.layout && !matchesLayout(r, f.layout)) return false;
    if (f.type && r.record_type !== f.type) return false;
    if (f.availability && (r.availability || "Available") !== f.availability) return false;
    if (f.featuredOnly && r.details["featured"] !== true) return false;
    if (f.cbiOnly) {
      if (r.details["cbi_verified"] !== true) return false;
    }
    if (f.bedrooms != null) {
      const beds = inferBedrooms(r);
      if (beds == null || beds !== f.bedrooms) return false;
    }
    if (f.bathrooms != null) {
      const baths =
        r.bathrooms ??
        (typeof r.details["bathrooms"] === "number" ? (r.details["bathrooms"] as number) : null);
      if (baths == null || baths < f.bathrooms) return false;
    }
    if (f.minArea != null || f.maxArea != null) {
      const area = primaryAreaM2(r);
      if (area == null) return false;
      if (f.minArea != null && area < f.minArea) return false;
      if (f.maxArea != null && area > f.maxArea) return false;
    }
    if (f.completionStatus) {
      const specs = (r.details["specs"] as PropertySpecs | undefined) ?? {};
      const comp = String(r.details["completion_status"] ?? specs.completionStatus ?? "");
      if (comp.toLowerCase() !== f.completionStatus.toLowerCase()) return false;
    }
    if (f.amenities && f.amenities.length > 0) {
      const media = getPropertyMedia(r);
      const propAmenities = [
        ...media.highlights,
        ...(Array.isArray(r.details["amenities"]) ? (r.details["amenities"] as string[]) : []),
      ].map((a) => String(a).toLowerCase());
      const hasAll = f.amenities.every((wantedAmenity) =>
        propAmenities.some((pa) => pa.includes(wantedAmenity.toLowerCase())),
      );
      if (!hasAll) return false;
    }
    if (b) {
      const v = comparableUsd(r.price);
      if (v == null || v < b.min || v >= b.max) return false;
    }
    if (f.minPrice != null || f.maxPrice != null) {
      const v = comparableUsd(r.price) ?? r.price.amount;
      if (v == null) return false;
      if (f.minPrice != null && v < f.minPrice) return false;
      if (f.maxPrice != null && v > f.maxPrice) return false;
    }
    return true;
  });

  if (f.sort === "price-asc" || f.sort === "price-desc") {
    const dir = f.sort === "price-asc" ? 1 : -1;
    list = list
      .map((r, i) => ({ r, i, v: comparableUsd(r.price) }))
      .sort((a, b) =>
        a.v == null && b.v == null
          ? a.i - b.i
          : a.v == null
            ? 1
            : b.v == null
              ? -1
              : (a.v - b.v) * dir || a.i - b.i,
      )
      .map((x) => x.r);
  } else if (f.sort === "area-asc" || f.sort === "area-desc") {
    const dir = f.sort === "area-asc" ? 1 : -1;
    list = list
      .map((r, i) => ({ r, i, v: primaryAreaM2(r) }))
      .sort((a, b) =>
        a.v == null && b.v == null
          ? a.i - b.i
          : a.v == null
            ? 1
            : b.v == null
              ? -1
              : (a.v - b.v) * dir || a.i - b.i,
      )
      .map((x) => x.r);
  } else if (f.sort === "featured") {
    list = list
      .map((r, i) => ({ r, i, feat: r.details["featured"] === true ? 1 : 0 }))
      .sort((a, b) => b.feat - a.feat || a.i - b.i)
      .map((x) => x.r);
  } else if (f.sort === "newest" || f.sort === "oldest") {
    const dir = f.sort === "newest" ? -1 : 1;
    list = list
      .map((r, i) => {
        const ts = Date.parse(String(r.details["created_at"] ?? r.details["updated_at"] ?? ""));
        return { r, i, ts: Number.isFinite(ts) ? ts : 0 };
      })
      .sort((a, b) => (a.ts - b.ts) * dir || a.i - b.i)
      .map((x) => x.r);
  }
  return list;
}

/** Records excluded from a budget filter because their price is not comparable in USD. */
export const unmatchablePrices = (catalogue: PropertyRecord[] = properties) =>
  catalogue.filter((r) => comparableUsd(r.price) == null);

export const humanKey = (k: string) =>
  k
    .replace(/_source$/, "")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

export const getProperty = (slug: string): PropertyRecord | undefined => {
  return properties.find((r) => r.slug === slug);
};

export function getPropertyMedia(r: PropertyRecord): PropertyMediaInfo {
  const fallback = originalPropertyMedia(r);
  const rawGalleryItems = Array.isArray(r.details["gallery_items"])
    ? (r.details["gallery_items"] as GalleryItem[]).filter(
        (g) => g && typeof g === "object" && typeof g.url === "string" && g.url.trim().length > 0,
      )
    : [];
  const rawFloorPlans = Array.isArray(r.details["floor_plans"])
    ? (r.details["floor_plans"] as FloorPlanItem[]).filter(
        (fp) =>
          fp &&
          typeof fp === "object" &&
          typeof fp.imageUrl === "string" &&
          fp.imageUrl.trim().length > 0,
      )
    : [];
  const rawDocuments = Array.isArray(r.details["documents"])
    ? (r.details["documents"] as PropertyDocumentItem[]).filter(
        (d) =>
          d &&
          typeof d === "object" &&
          typeof d.url === "string" &&
          d.url.trim().length > 0 &&
          d.isPublic !== false,
      )
    : [];

  if (!r.id && !("gallery_images" in r.details) && rawGalleryItems.length === 0) {
    const items: GalleryItem[] = fallback.gallery.map((url, idx) => ({
      id: `${r.slug}-img-${idx + 1}`,
      url,
      category: idx === 0 ? "Exterior" : idx === 1 ? "Living room" : "Interior",
      caption: `${r.marketing_title} — View ${idx + 1}`,
      alt: `${r.marketing_title} image ${idx + 1}`,
      isPrimary: idx === 0,
      sortOrder: idx,
    }));
    const floorPlans: FloorPlanItem[] = fallback.floorPlan
      ? [
          {
            id: `${r.slug}-fp-1`,
            title: `${r.layout_label || "Standard"} Architectural Layout`,
            unitType: r.layout_label || "Standard Residence",
            imageUrl: fallback.floorPlan,
            areaM2: primaryAreaM2(r),
          },
        ]
      : [];
    return {
      ...fallback,
      galleryItems: items,
      floorPlans,
      documents: rawDocuments,
    };
  }

  const rawStrings = r.details["gallery_images"];
  const photos = Array.isArray(rawStrings)
    ? rawStrings.filter((x): x is string => typeof x === "string" && !!x)
    : [];

  const sortedItems =
    rawGalleryItems.length > 0
      ? [...rawGalleryItems].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      : [...new Set([r.cover || "", ...photos].filter(Boolean))].map((url, idx) => ({
          id: `${r.slug || "prop"}-img-${idx + 1}`,
          url,
          category: idx === 0 ? "Exterior" : "Interior",
          caption: `${r.marketing_title} — Image ${idx + 1}`,
          alt: `${r.marketing_title} photo ${idx + 1}`,
          isPrimary: idx === 0,
          sortOrder: idx,
        }));

  const primaryItem = sortedItems.find((g) => g.isPrimary) ?? sortedItems[0];
  const cover = primaryItem?.url || r.cover || "";
  const gallery = [
    ...new Set([cover, ...sortedItems.map((g) => g.url), ...photos].filter(Boolean)),
  ];

  const highlights = Array.isArray(r.details["highlights"])
    ? r.details["highlights"].filter((x): x is string => typeof x === "string")
    : [];

  const legacyFloorPlan =
    typeof r.details["floor_plan"] === "string" && r.details["floor_plan"]
      ? r.details["floor_plan"]
      : undefined;

  const floorPlans: FloorPlanItem[] =
    rawFloorPlans.length > 0
      ? rawFloorPlans
      : legacyFloorPlan
        ? [
            {
              id: `${r.slug || "prop"}-fp-1`,
              title: `${r.layout_label || "Architectural"} Floor Plan`,
              unitType: r.layout_label || "Unit Layout",
              imageUrl: legacyFloorPlan,
              areaM2: primaryAreaM2(r),
            },
          ]
        : [];

  const floorPlan = floorPlans[0]?.imageUrl ?? legacyFloorPlan;

  return {
    cover,
    gallery,
    galleryItems: sortedItems,
    floorPlans,
    documents: rawDocuments,
    highlights,
    tags: [
      ...(typeof r.details["property_category"] === "string" && r.details["property_category"]
        ? [r.details["property_category"]]
        : [TYPE_LABEL[r.record_type]]),
      ...(r.details["cbi_verified"] === true ? ["Citizenship eligibility verified"] : []),
    ],
    ...(floorPlan ? { floorPlan } : {}),
  };
}
