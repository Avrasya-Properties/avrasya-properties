// Regions are managed by staff in Settings and stored as JSON on site_settings.
// Supports the full hierarchy: Country -> Region -> City -> District -> Neighborhood -> Development / Project.

export type DistrictDetail = {
  name: string;
  description?: string;
  image?: string;
  gallery?: string[];
  neighborhoods: string[];
  coordinates?: { lat: number; lng: number };
  nearbyFacilities?: string[];
  transportInfo?: string;
  lifestyleInfo?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type RegionTranslation = {
  name?: string;
  summary?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type Region = {
  slug: string;
  name: string;
  country: string;
  regionGroup?: string;
  summary: string;
  heroImage: string;
  gallery?: string[];
  featured?: boolean;
  districts: string[];
  districtDetails?: DistrictDetail[];
  /** Istanbul-style European/Asian side filter. Only meaningful where the listing `side` column is used. */
  hasSides: boolean;
  published: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  coordinates?: { lat: number; lng: number };
  ogImage?: string;
  translations?: Partial<Record<"tr" | "en" | "ar" | "ru" | "zh" | "bn" | "fa", RegionTranslation>>;
};

export const REGION_SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const TR: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  Ç: "c",
  Ğ: "g",
  Ö: "o",
  Ş: "s",
  Ü: "u",
};

/** URL-safe slug that keeps Turkish names readable (Muğla -> mugla, İstanbul -> istanbul). */
export function slugifyRegion(value: string): string {
  return value
    .replace(/[çğıİöşüÇĞÖŞÜ]/g, (c) => TR[c] ?? c)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const ISTANBUL_DISTRICTS = [
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
];

export const DEFAULT_ISTANBUL_DISTRICT_DETAILS: DistrictDetail[] = [
  {
    name: "Beşiktaş",
    description:
      "Historic Bosphorus shoreline corridor home to Bebek, Etiler, and Levent luxury towers.",
    neighborhoods: ["Bebek", "Etiler", "Levent", "Ortaköy", "Arnavutköy", "Ulus"],
    coordinates: { lat: 41.0422, lng: 29.0067 },
    nearbyFacilities: ["Zorlu Center", "Bebek Marina", "Akmerkez", "Bosphorus Promenade"],
    transportInfo: "M2 & M6 Metro lines, Bosphorus ferry terminals, 15 July Martyrs Bridge",
    lifestyleInfo: "Waterfront fine dining, yacht marinas, private international schools",
  },
  {
    name: "Şişli",
    description:
      "Central European business, fashion, and diplomatic hub anchored by Nişantaşı and Bomonti.",
    neighborhoods: ["Nişantaşı", "Teşvikiye", "Bomonti", "Feriköy", "Mecidiyeköy", "Esentepe"],
    coordinates: { lat: 41.0602, lng: 28.9877 },
    nearbyFacilities: ["City's Nişantaşı", "Bomontiada", "American Hospital", "Cevahir"],
    transportInfo: "M2 Metro, Metrobus spine, Dolmabahçe Tunnel",
    lifestyleInfo: "Haute couture avenues, contemporary art galleries, luxury penthouses",
  },
  {
    name: "Sarıyer",
    description:
      "Northern Bosphorus mansions, Belgrade Forest villas, and the Maslak skyscraper financial axis.",
    neighborhoods: ["Maslak", "Tarabya", "Zekeriyaköy", "İstinye", "Emirgan", "Yeniköy"],
    coordinates: { lat: 41.1127, lng: 29.0211 },
    nearbyFacilities: ["İstinye Park", "İTÜ Ayazağa Campus", "Emirgan Grove", "Tarabya Marina"],
    transportInfo: "M2 Metro (İTÜ Ayazağa & Hacıosman), TEM Highway, FSM Bridge",
    lifestyleInfo: "Corporate headquarters, forest family villas, Bosphorus yalı estates",
  },
  {
    name: "Ataşehir",
    description:
      "Asian-side modern financial district surrounding the Istanbul International Financial Center (IIFC).",
    neighborhoods: ["Barbaros", "Atatürk", "Küçükbakkalköy", "Batı Ataşehir"],
    coordinates: { lat: 40.9923, lng: 29.1244 },
    nearbyFacilities: ["Istanbul Financial Center (IIFC)", "Watergarden", "Metropol Istanbul"],
    transportInfo: "M4 & M12 Metro lines, TEM & E-5 Highway interchange",
    lifestyleInfo: "High-rise executive residences, international schools, modern parks",
  },
  {
    name: "Ümraniye",
    description:
      "Rapidly appreciating Asian-side commercial and residential corridor bordering Ataşehir and Beykoz.",
    neighborhoods: ["Çakmak", "Yamanevler", "Küçüksu", "Altınşehir", "Finanskent"],
    coordinates: { lat: 41.0256, lng: 29.1164 },
    nearbyFacilities: ["Oryapark", "Akyaka Park", "Buyaka Mall", "Çamlıca Hill"],
    transportInfo: "M5 Driverless Metro, Şile Highway, FSM Bridge connection",
    lifestyleInfo: "Gated family compounds, twin-tower residences, strong corporate rental yield",
  },
  {
    name: "Bakırköy",
    description:
      "Prestigious coastal belt along the Sea of Marmara featuring Ataköy marinas and seafront towers.",
    neighborhoods: ["Ataköy", "Florya", "Yeşilköy", "Zuhuratbaba"],
    coordinates: { lat: 40.9792, lng: 28.8772 },
    nearbyFacilities: ["Ataköy Marina", "A Plus Mall", "Capacity", "Florya Coastal Park"],
    transportInfo: "Marmaray rail link, Eurasia Tunnel axis, E-5 Metrobus",
    lifestyleInfo: "Sea-view terraces, yacht club lifestyle, established high-net-worth enclave",
  },
];

export const REGION_PRESETS: Omit<Region, "sortOrder">[] = [
  {
    slug: "antalya",
    name: "Antalya",
    country: "Türkiye",
    regionGroup: "Mediterranean Region",
    summary:
      "The pearl of the Turkish Riviera: turquoise Mediterranean waters, year-round sunshine and prime resort living.",
    heroImage: "",
    featured: true,
    districts: [
      "Konyaaltı",
      "Lara",
      "Muratpaşa",
      "Alanya",
      "Kemer",
      "Kaş",
      "Kalkan",
      "Belek",
      "Manavgat",
    ],
    districtDetails: [
      {
        name: "Konyaaltı",
        description: "Blue-flag beach promenade framed by the Taurus Mountains.",
        neighborhoods: ["Gürsu", "Liman", "Hurma", "Sarısu"],
        coordinates: { lat: 36.8685, lng: 30.6376 },
      },
      {
        name: "Lara",
        description:
          "Cliffside sea-view residences and luxury resort corridor near Antalya Airport.",
        neighborhoods: ["Şirinyalı", "Fener", "Çağlayan", "Kundu"],
        coordinates: { lat: 36.8529, lng: 30.7822 },
      },
    ],
    hasSides: false,
    published: true,
    seoTitle: "Property for Sale in Antalya | Mediterranean Luxury",
    seoDescription:
      "Discover luxury villas and sea-view residences along Antalya and the Mediterranean coastline.",
  },
  {
    slug: "bodrum",
    name: "Bodrum",
    country: "Türkiye",
    regionGroup: "Aegean Region",
    summary:
      "The Saint-Tropez of Türkiye: world-class marinas, private coves, luxury lifestyle, and Aegean beachfront villas.",
    heroImage: "",
    featured: true,
    districts: [
      "Yalıkavak",
      "Türkbükü",
      "Gümüşlük",
      "Bodrum Center",
      "Bitez",
      "Turgutreis",
      "Gündoğan",
      "Torba",
    ],
    districtDetails: [
      {
        name: "Yalıkavak",
        description: "Superyacht marina capital of the Aegean with hillside sunset villas.",
        neighborhoods: ["Yalıkavak Marina", "Tilkicik Bay", "Kizilburun", "Geriş"],
        coordinates: { lat: 37.1082, lng: 27.2922 },
      },
      {
        name: "Türkbükü",
        description: "Sheltered bay famous for private beach clubs and waterfront estates.",
        neighborhoods: ["Göltürkbükü", "Hebil Bay"],
        coordinates: { lat: 37.1256, lng: 27.3765 },
      },
    ],
    hasSides: false,
    published: true,
    seoTitle: "Bodrum Luxury Real Estate & Waterfront Villas",
    seoDescription:
      "Exclusive beachfront villas, marina estates, and branded residences in Bodrum and the Aegean coast.",
  },
  {
    slug: "izmir",
    name: "Izmir",
    country: "Türkiye",
    regionGroup: "Aegean Region",
    summary:
      "Aegean modern metropolis: vibrant cosmopolitan lifestyle, coastal boulevards, and proximity to Çeşme and Alaçatı.",
    heroImage: "",
    districts: [
      "Alsancak",
      "Karşıyaka",
      "Bornova",
      "Çeşme",
      "Alaçatı",
      "Urla",
      "Konak",
      "Bayraklı",
    ],
    hasSides: false,
    published: true,
    seoTitle: "Properties in Izmir & Çeşme | Aegean Living",
    seoDescription:
      "Modern city residences, seaside apartments, and vacation villas in Izmir and Çeşme.",
  },
  {
    slug: "ankara",
    name: "Ankara",
    country: "Türkiye",
    regionGroup: "Central Anatolia",
    summary:
      "The political and diplomatic capital: embassy districts, prestigious universities, and institutional real estate stability.",
    heroImage: "",
    districts: ["Çankaya", "İncek", "Gölbaşı", "Çayyolu", "Bilkent", "Yenimahalle"],
    hasSides: false,
    published: true,
    seoTitle: "Real Estate in Ankara | Capital City Investments",
    seoDescription:
      "Prime residential and diplomatic real estate in Çankaya, İncek and Ankara's premier districts.",
  },
  {
    slug: "fethiye",
    name: "Fethiye",
    country: "Türkiye",
    regionGroup: "Mediterranean Region",
    summary:
      "Breathtaking turquoise bays, Ölüdeniz blue lagoon, Göcek yacht marinas, and peaceful pine-valley villa retreats.",
    heroImage: "",
    districts: ["Göcek", "Ölüdeniz", "Ovacık", "Hisarönü", "Çalış", "Faralya", "Fethiye Center"],
    hasSides: false,
    published: true,
    seoTitle: "Villas & Property for Sale in Fethiye & Göcek",
    seoDescription: "Luxury villas and marina residences in Göcek, Ölüdeniz and Fethiye.",
  },
];

export function defaultRegions(districts: readonly string[] = ISTANBUL_DISTRICTS): Region[] {
  return [
    {
      slug: "istanbul",
      name: "Istanbul",
      country: "Türkiye",
      regionGroup: "Marmara Region",
      summary:
        "Where two continents meet: Bosphorus-front towers, financial-district residences and green family districts.",
      heroImage: "",
      featured: true,
      districts: [...districts],
      districtDetails: DEFAULT_ISTANBUL_DISTRICT_DETAILS,
      hasSides: true,
      published: true,
      sortOrder: 0,
      seoTitle: "",
      seoDescription: "",
      coordinates: { lat: 41.0082, lng: 28.9784 },
    },
  ];
}

/** Hero images must be an https link or an image already on this site; anything else is dropped. */
const safeImage = (v: string) => (/^(https:\/\/|\/images\/)[^\s]+$/.test(v) ? v : "");
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function normalizeDistrictDetails(raw: unknown): DistrictDetail[] {
  if (!Array.isArray(raw)) return [];
  const out: DistrictDetail[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const d = item as Record<string, unknown>;
    const name = text(d["name"], 80);
    if (!name) continue;
    const neighborhoods = Array.isArray(d["neighborhoods"])
      ? [...new Set((d["neighborhoods"] as unknown[]).map((n) => text(n, 80)).filter(Boolean))]
      : [];
    const nearbyFacilities = Array.isArray(d["nearbyFacilities"])
      ? [...new Set((d["nearbyFacilities"] as unknown[]).map((n) => text(n, 120)).filter(Boolean))]
      : undefined;
    const gallery = Array.isArray(d["gallery"])
      ? (d["gallery"] as unknown[]).map((img) => safeImage(text(img, 2048))).filter(Boolean)
      : undefined;
    let coordinates: { lat: number; lng: number } | undefined;
    if (d["coordinates"] && typeof d["coordinates"] === "object") {
      const c = d["coordinates"] as Record<string, unknown>;
      const lat = Number(c["lat"]);
      const lng = Number(c["lng"]);
      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        coordinates = { lat, lng };
      }
    }
    const description = text(d["description"], 600);
    const image = safeImage(text(d["image"], 2048));
    const transportInfo = text(d["transportInfo"], 400);
    const lifestyleInfo = text(d["lifestyleInfo"], 400);
    const seoTitle = text(d["seoTitle"], 120);
    const seoDescription = text(d["seoDescription"], 320);

    out.push({
      name,
      neighborhoods,
      ...(description ? { description } : {}),
      ...(image ? { image } : {}),
      ...(gallery?.length ? { gallery } : {}),
      ...(coordinates ? { coordinates } : {}),
      ...(nearbyFacilities?.length ? { nearbyFacilities } : {}),
      ...(transportInfo ? { transportInfo } : {}),
      ...(lifestyleInfo ? { lifestyleInfo } : {}),
      ...(seoTitle ? { seoTitle } : {}),
      ...(seoDescription ? { seoDescription } : {}),
    });
  }
  return out;
}

/**
 * Clean any stored value into a valid, ordered Region[]. Idempotent: a normalised list is returned unchanged.
 * An empty/invalid list falls back to the legacy flat district list as a single Istanbul region, so a site
 * that has not configured regions yet behaves exactly as before.
 */
export function normalizeRegions(value: unknown, legacyDistricts?: readonly string[]): Region[] {
  let raw: unknown = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = [];
    }
  }
  const out: Region[] = [];
  const seen = new Set<string>();
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const r = item as Record<string, unknown>;
      const name = text(r["name"], 80);
      if (!name) continue;
      const slug = text(r["slug"], 60) || slugifyRegion(name);
      if (!REGION_SLUG_RE.test(slug) || seen.has(slug)) continue;
      seen.add(slug);
      const districtDetails = normalizeDistrictDetails(r["districtDetails"]);
      const rawDistricts = Array.isArray(r["districts"])
        ? (r["districts"] as unknown[]).map((d) => text(d, 80)).filter(Boolean)
        : [];
      const districts = [
        ...new Set([...rawDistricts, ...districtDetails.map((d) => d.name)]),
      ].slice(0, 200);

      let coordinates: { lat: number; lng: number } | undefined = undefined;
      if (r["coordinates"] && typeof r["coordinates"] === "object") {
        const c = r["coordinates"] as Record<string, unknown>;
        const lat = Number(c["lat"]);
        const lng = Number(c["lng"]);
        if (
          Number.isFinite(lat) &&
          Number.isFinite(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180
        ) {
          coordinates = { lat, lng };
        }
      } else if (r["latitude"] !== undefined && r["longitude"] !== undefined) {
        const lat = Number(r["latitude"]);
        const lng = Number(r["longitude"]);
        if (
          Number.isFinite(lat) &&
          Number.isFinite(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180
        ) {
          coordinates = { lat, lng };
        }
      }
      const ogImage = safeImage(text(r["ogImage"] || r["og_image_url"], 2048));
      const gallery = Array.isArray(r["gallery"])
        ? (r["gallery"] as unknown[]).map((img) => safeImage(text(img, 2048))).filter(Boolean)
        : undefined;
      const regionGroup = text(r["regionGroup"], 80);
      const featured = typeof r["featured"] === "boolean" ? r["featured"] : undefined;

      out.push({
        slug,
        name,
        country: text(r["country"], 60) || "Türkiye",
        ...(regionGroup ? { regionGroup } : {}),
        summary: text(r["summary"], 1000),
        heroImage: safeImage(text(r["heroImage"], 2048)),
        ...(gallery?.length ? { gallery } : {}),
        ...(featured !== undefined ? { featured } : {}),
        districts,
        ...(districtDetails.length
          ? { districtDetails }
          : slug === "istanbul"
            ? { districtDetails: DEFAULT_ISTANBUL_DISTRICT_DETAILS }
            : {}),
        hasSides: r["hasSides"] === true,
        published: r["published"] !== false,
        sortOrder: Number.isFinite(Number(r["sortOrder"])) ? Number(r["sortOrder"]) : out.length,
        seoTitle: text(r["seoTitle"], 120),
        seoDescription: text(r["seoDescription"], 320),
        ...(coordinates ? { coordinates } : {}),
        ...(ogImage ? { ogImage } : {}),
      });
    }
  }
  if (!out.length)
    return defaultRegions(legacyDistricts?.length ? legacyDistricts : ISTANBUL_DISTRICTS);
  return out.sort((a, b) => a.sortOrder - b.sortOrder);
}

/** The European/Asian side label is only meaningful for Istanbul-style regions, or when a side was actually recorded. */
export const showsSide = (
  city: string | null | undefined,
  side: string | null | undefined,
): boolean => side === "Europe" || side === "Asia" || slugifyRegion(city || "") === "istanbul";

export const sameCity = (a: string | null | undefined, b: string | null | undefined): boolean =>
  slugifyRegion(a || "") === slugifyRegion(b || "");

/** Visitor-facing regions: published only, in the admin's order. */
export const publicRegions = (regions: readonly Region[] | undefined): Region[] =>
  (regions ?? []).filter((r) => r.published).sort((a, b) => a.sortOrder - b.sortOrder);

/** Resolve a listing/project `city` value to a region (by name or slug, accent-insensitive). */
export function regionForCity(
  city: string | null | undefined,
  regions: readonly Region[] | undefined,
): Region | undefined {
  if (!city || !regions?.length) return undefined;
  const key = slugifyRegion(city);
  return (
    regions.find((r) => r.slug === key || slugifyRegion(r.name) === key) ??
    // "Istanbul, Türkiye" or "Antalya - Lara" still belong to the region named first.
    regions.find((r) => key.startsWith(r.slug + "-") || key.startsWith(slugifyRegion(r.name) + "-"))
  );
}

export const allDistricts = (regions: readonly Region[] | undefined): string[] => [
  ...new Set((regions ?? []).flatMap((r) => r.districts)),
];

export const allNeighborhoods = (
  regions: readonly Region[] | undefined,
  district?: string,
): string[] => {
  const details = (regions ?? []).flatMap((r) => r.districtDetails ?? []);
  const filtered = district
    ? details.filter((d) => slugifyRegion(d.name) === slugifyRegion(district))
    : details;
  return [...new Set(filtered.flatMap((d) => d.neighborhoods))];
};
