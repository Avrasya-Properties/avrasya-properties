import { DEFAULT_SITE_SETTINGS, type DB, type SiteSettings } from "./demo";
import { allDistricts, normalizeRegions } from "@/data/regions";
export type Row = Record<string, unknown>;
export const TABLES = {
  properties: "marketing_offers",
  contacts: "contacts",
  leads: "leads",
  tasks: "tasks",
  viewings: "viewings",
  deals: "deals",
  inquiries: "enquiries",
} as const;
export type Collection = keyof typeof TABLES;
export const FIELDS: Record<Collection, Record<string, string>> = {
  properties: {
    highlights: "highlights",
    galleryImages: "gallery_images",
    galleryItems: "gallery_items",
    floorPlan: "floor_plan",
    floorPlans: "floor_plans",
    documents: "documents",
    id: "id",
    ref: "ref",
    slug: "slug",
    title: "marketing_title",
    shortDescription: "short_description",
    district: "district",
    neighborhood: "neighborhood",
    city: "city",
    type: "record_type",
    propertyCategory: "property_category",
    layout: "layout_label",
    bedrooms: "bedrooms",
    bathrooms: "bathrooms",
    livingRooms: "living_rooms",
    grossM2: "gross_m2",
    netM2: "net_m2",
    areaM2: "area_m2",
    amount: "amount",
    originalPrice: "original_price",
    discountedPrice: "discounted_price",
    rentalPrice: "rental_price",
    pricePerM2: "price_per_m2",
    priceVisibility: "price_visibility",
    lastPriceUpdate: "last_price_update",
    paymentPlan: "payment_plan",
    currency: "currency",
    mode: "mode",
    priceType: "price_type",
    priceBasis: "price_basis",
    availability: "availability",
    publication: "publication",
    featured: "featured",
    agentId: "assigned_agent_id",
    cover: "cover_image_path",
    description: "description",
    developer: "developer",
    address: "address",
    coordinates: "coordinates",
    specs: "specs",
    virtualTourUrl: "virtual_tour_url",
    videoUrl: "video_url",
    model3dUrl: "model_3d_url",
    translations: "translations",
    sourceNote: "source_note",
    side: "side",
    tapuStatus: "tapu_status",
    seo_title: "seo_title",
    seo_description: "seo_description",
    og_image_url: "og_image_url",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  contacts: {
    id: "id",
    name: "name",
    kind: "kind",
    email: "email",
    phone: "phone",
    roles: "roles",
    language: "language",
    agentId: "assigned_agent_id",
    notes: "notes",
  },
  leads: {
    id: "id",
    contactId: "contact_id",
    source: "source",
    agentId: "assigned_agent_id",
    districts: "districts",
    layout: "layout",
    budgetMin: "budget_min",
    budgetMax: "budget_max",
    currency: "currency",
    stage: "stage",
    lossReason: "loss_reason",
    nextFollowUp: "next_follow_up",
    shortlist: "shortlist",
    dealId: "deal_id",
  },
  tasks: {
    id: "id",
    title: "title",
    assigneeId: "assignee_id",
    due: "due_date",
    priority: "priority",
    done: "is_done",
  },
  viewings: {
    id: "id",
    contactId: "contact_id",
    propertyId: "offer_id",
    agentId: "agent_id",
    start: "start_time",
    end: "end_time",
    status: "status",
    notes: "notes",
  },
  deals: {
    id: "id",
    title: "title",
    contactId: "contact_id",
    leadId: "lead_id",
    agentId: "assigned_agent_id",
    stage: "stage",
    amount: "total_amount",
    currency: "currency",
    expectedClose: "expected_close_date",
  },
  inquiries: {
    id: "id",
    name: "name",
    email: "email",
    phone: "phone",
    topic: "topic",
    budget: "budget",
    message: "message",
    source: "source",
    propertySlug: "property_slug",
    status: "status",
    createdAt: "created_at",
    notes: "notes",
    leadId: "lead_id",
    agentId: "assigned_agent_id",
  },
};
export const SETTINGS: Record<keyof SiteSettings, string> = {
  websiteDesign: "website_design",
  navigationItems: "navigation_items",
  footerSettings: "footer_settings",
  headerCta: "header_cta",
  partners: "partners",
  companyName: "company_name",
  registeredEntity: "registered_entity",
  taxOffice: "tax_office",
  licenseNo: "license_no",
  tagline: "tagline",
  email: "email",
  phone: "phone",
  whatsapp: "whatsapp",
  address: "address",
  advisoryHours: "advisory_hours",
  heroHeadline: "hero_headline",
  heroSubtitle: "hero_subtitle",
  eyebrowText: "eyebrow_text",
  cbiThresholdUsd: "cbi_threshold_usd",
  preloaderOpacity: "preloader_opacity",
  exchangeRateEur: "exchange_rate_eur",
  exchangeRateTry: "exchange_rate_try",
  exchangeRateGbp: "exchange_rate_gbp",
  enableFrankfurterSync: "enable_frankfurter_sync",
  announcementText: "announcement_text",
  announcementActive: "announcement_active",
  districts: "districts",
  regions: "regions",
  layouts: "layouts",
  propertyCategories: "property_categories",
  amenityCatalog: "amenity_catalog",
  budgetRanges: "budget_ranges",
  siteTitle: "site_title",
  metaDescription: "meta_description",
  siteUrl: "site_url",
  ogImage: "og_image",
  keywords: "keywords",
  googleVerification: "google_verification",
  indexingEnabled: "indexing_enabled",
};
export function decode<C extends Collection>(collection: C, row: Row): DB[C][number] {
  const value: Row = { revision: row["updated_at"] };
  for (const [key, column] of Object.entries(FIELDS[collection])) {
    const v = row[column];
    if (v !== null && v !== undefined) value[key] = v;
    else if (
      [
        "email",
        "phone",
        "notes",
        "description",
        "sourceNote",
        "agentId",
        "language",
        "districts",
        "layout",
        "tapuStatus",
      ].includes(key)
    )
      value[key] = "";
    else if (["leadId", "dealId", "propertySlug"].includes(key)) continue;
    else value[key] = null;
  }
  if (collection === "properties") {
    const details = ((row["source_record"] as Row | undefined)?.["details"] || {}) as Row;
    value["highlights"] = Array.isArray(row["highlights"])
      ? row["highlights"]
      : Array.isArray(details["highlights"])
        ? details["highlights"]
        : [];
    value["galleryImages"] = Array.isArray(row["gallery_images"])
      ? row["gallery_images"]
      : Array.isArray(details["gallery_images"])
        ? details["gallery_images"]
        : [];
    value["galleryItems"] = Array.isArray(row["gallery_items"])
      ? row["gallery_items"]
      : Array.isArray(details["gallery_items"])
        ? details["gallery_items"]
        : [];
    value["floorPlan"] =
      typeof row["floor_plan"] === "string"
        ? row["floor_plan"]
        : typeof details["floor_plan"] === "string"
          ? details["floor_plan"]
          : null;
    value["floorPlans"] = Array.isArray(row["floor_plans"])
      ? row["floor_plans"]
      : Array.isArray(details["floor_plans"])
        ? details["floor_plans"]
        : [];
    value["documents"] = Array.isArray(row["documents"])
      ? row["documents"]
      : Array.isArray(details["documents"])
        ? details["documents"]
        : [];
    value["specs"] =
      row["specs"] && typeof row["specs"] === "object"
        ? row["specs"]
        : details["specs"] && typeof details["specs"] === "object"
          ? details["specs"]
          : {};
    value["paymentPlan"] =
      row["payment_plan"] && typeof row["payment_plan"] === "object"
        ? row["payment_plan"]
        : details["payment_plan"] && typeof details["payment_plan"] === "object"
          ? details["payment_plan"]
          : {};
    value["translations"] =
      row["translations"] && typeof row["translations"] === "object"
        ? row["translations"]
        : details["translations"] && typeof details["translations"] === "object"
          ? details["translations"]
          : {};
    value["type"] = String(row["record_type"]).replaceAll("_", " ");
    value["project"] = row["project_name"] || "";
    value["cbiEligible"] = row["cbi_verified"] === true && row["cbi_eligible"] === true;
  }
  if (collection === "deals") value["propertyIds"] = row["property_ids"] || [];
  if (collection === "tasks" && row["link_id"])
    value["link"] = { kind: row["link_kind"], id: row["link_id"] };
  return value as DB[C][number];
}
export function encode(collection: Collection, item: Row): Row {
  const row: Row = {};
  for (const [key, column] of Object.entries(FIELDS[collection]))
    if (key in item && !["updatedAt", "createdAt"].includes(key)) {
      const v = item[key];
      row[column] =
        key === "type"
          ? String(v).replaceAll(" ", "_")
          : ["agentId", "propertyId"].includes(key) && v === ""
            ? null
            : v;
    }
  if (collection === "tasks" && item["link"]) {
    const link = item["link"] as { kind: string; id: string };
    row["link_kind"] = link.kind;
    row["link_id"] = link.id;
  }
  return row;
}
export function decodeSettings(row: Row): SiteSettings {
  const s = Object.fromEntries(
    Object.entries(SETTINGS).map(([key, column]) => [
      key,
      row[column] ?? DEFAULT_SITE_SETTINGS[key as keyof SiteSettings],
    ]),
  ) as unknown as SiteSettings;
  const array = <T>(value: unknown, fallback: T[]): T[] => {
    if (Array.isArray(value)) return value as T[];
    if (typeof value === "string") {
      try {
        const parsed: unknown = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed as T[];
      } catch {
        /* intentionally ignored */
      }
    }
    return fallback;
  };
  s.districts = array(s.districts, DEFAULT_SITE_SETTINGS.districts);
  const rawRegions =
    row["regions"] ??
    (Array.isArray(row["districts"]) &&
    row["districts"].some((x: unknown) => typeof x === "object" && x !== null && "name" in x)
      ? row["districts"]
      : undefined);
  if (Array.isArray(s.districts) && s.districts.some((x: unknown) => typeof x === "object")) {
    s.districts = allDistricts(normalizeRegions(rawRegions));
  }
  s.regions = normalizeRegions(rawRegions, s.districts);
  s.layouts = array(s.layouts, DEFAULT_SITE_SETTINGS.layouts);
  s.propertyCategories = array(
    s.propertyCategories,
    DEFAULT_SITE_SETTINGS.propertyCategories ?? [],
  );
  s.amenityCatalog = array(s.amenityCatalog, DEFAULT_SITE_SETTINGS.amenityCatalog ?? []);
  s.budgetRanges = array(s.budgetRanges, DEFAULT_SITE_SETTINGS.budgetRanges);
  s.websiteDesign =
    s.websiteDesign && typeof s.websiteDesign === "object" && !Array.isArray(s.websiteDesign)
      ? s.websiteDesign
      : {};
  if (
    (!s.navigationItems || s.navigationItems.length === 0) &&
    typeof s.websiteDesign?.["navigation"] === "string"
  ) {
    try {
      const nav: unknown = JSON.parse(s.websiteDesign["navigation"]!);
      if (Array.isArray(nav)) s.navigationItems = nav;
    } catch {
      /* intentionally ignored */
    }
  }
  if (!s.navigationItems || s.navigationItems.length === 0) {
    s.navigationItems = DEFAULT_SITE_SETTINGS.navigationItems;
  }
  if (
    (!s.footerSettings || !s.footerSettings.columns) &&
    typeof s.websiteDesign?.["footer"] === "string"
  ) {
    try {
      const ftr: unknown = JSON.parse(s.websiteDesign["footer"]!);
      if (ftr && typeof ftr === "object") s.footerSettings = ftr as typeof s.footerSettings;
    } catch {
      /* intentionally ignored */
    }
  }
  if (!s.footerSettings) {
    s.footerSettings = DEFAULT_SITE_SETTINGS.footerSettings;
  }
  if (
    (!s.partners || s.partners.length === 0) &&
    typeof s.websiteDesign?.["partners"] === "string"
  ) {
    try {
      const p: unknown = JSON.parse(s.websiteDesign["partners"]!);
      if (Array.isArray(p)) s.partners = p;
    } catch {
      /* intentionally ignored */
    }
  }
  if (!s.partners || s.partners.length === 0) {
    s.partners = DEFAULT_SITE_SETTINGS.partners;
  }
  if ((!s.headerCta || !s.headerCta.href) && typeof s.websiteDesign?.["header_cta"] === "string") {
    try {
      const cta: unknown = JSON.parse(s.websiteDesign["header_cta"]!);
      if (cta && typeof cta === "object") s.headerCta = cta as typeof s.headerCta;
    } catch {
      /* intentionally ignored */
    }
  }
  if (!s.headerCta) {
    s.headerCta = DEFAULT_SITE_SETTINGS.headerCta;
  }
  return s;
}
export function encodeSettings(settings: Partial<SiteSettings>): Row {
  const row: Row = Object.fromEntries(
    Object.entries(settings)
      .filter(([key]) => key in SETTINGS)
      .map(([key, value]) => [SETTINGS[key as keyof SiteSettings], value]),
  );

  const existingDesign =
    typeof row["website_design"] === "object" &&
    row["website_design"] !== null &&
    !Array.isArray(row["website_design"])
      ? (row["website_design"] as Record<string, unknown>)
      : typeof settings.websiteDesign === "object" &&
          settings.websiteDesign !== null &&
          !Array.isArray(settings.websiteDesign)
        ? (settings.websiteDesign as Record<string, unknown>)
        : {};

  let designModified = false;
  const design = { ...existingDesign };

  if (settings.navigationItems !== undefined) {
    design["navigation"] = JSON.stringify(settings.navigationItems);
    designModified = true;
  }
  if (settings.footerSettings !== undefined) {
    design["footer"] = JSON.stringify(settings.footerSettings);
    designModified = true;
  }
  if (settings.headerCta !== undefined) {
    design["header_cta"] = JSON.stringify(settings.headerCta);
    designModified = true;
  }
  if (settings.partners !== undefined) {
    design["partners"] = JSON.stringify(settings.partners);
    designModified = true;
  }

  // Preserve test expectation: encodeSettings({ companyName: "New" }) only emits { company_name: "New" }
  if (designModified || "websiteDesign" in settings) {
    row["website_design"] = design;
  }

  return row;
}
