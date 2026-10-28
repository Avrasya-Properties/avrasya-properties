// Regions are managed by staff in Settings and stored as JSON on site_settings.
// A listing belongs to a region through its existing `city` column, so regions need
// no listing schema change and stay in sync through the normal settings pipeline.
export type Region = {
  slug: string;
  name: string;
  country: string;
  summary: string;
  heroImage: string;
  districts: string[];
  /** Istanbul-style European/Asian side filter. Only meaningful where the listing `side` column is used. */
  hasSides: boolean;
  published: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
};

export const REGION_SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const TR: Record<string, string> = { "ç": "c", "ğ": "g", "ı": "i", "İ": "i", "ö": "o", "ş": "s", "ü": "u", "Ç": "c", "Ğ": "g", "Ö": "o", "Ş": "s", "Ü": "u" };

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

export const ISTANBUL_DISTRICTS = ["Maslak", "Şişli", "Beşiktaş", "Kadıköy", "Sarıyer", "Üsküdar", "Beyoğlu", "Bakırköy", "Ataşehir", "Göktürk", "Bomonti", "Zekeriyaköy"];

export const REGION_PRESETS: Omit<Region, "sortOrder">[] = [
  {
    slug: "antalya",
    name: "Antalya",
    country: "Türkiye",
    summary: "The pearl of the Turkish Riviera: turquoise Mediterranean waters, year-round sunshine and prime resort living.",
    heroImage: "",
    districts: ["Konyaaltı", "Lara", "Muratpaşa", "Alanya", "Kemer", "Kaş", "Kalkan", "Belek", "Manavgat"],
    hasSides: false,
    published: true,
    seoTitle: "Property for Sale in Antalya | Mediterranean Luxury",
    seoDescription: "Discover luxury villas and sea-view residences along Antalya and the Mediterranean coastline.",
  },
  {
    slug: "bodrum",
    name: "Bodrum",
    country: "Türkiye",
    summary: "The Saint-Tropez of Türkiye: world-class marinas, private coves, luxury lifestyle, and Aegean beachfront villas.",
    heroImage: "",
    districts: ["Yalıkavak", "Türkbükü", "Gümüşlük", "Bodrum Center", "Bitez", "Turgutreis", "Gündoğan", "Torba"],
    hasSides: false,
    published: true,
    seoTitle: "Bodrum Luxury Real Estate & Waterfront Villas",
    seoDescription: "Exclusive beachfront villas, marina estates, and branded residences in Bodrum and the Aegean coast.",
  },
  {
    slug: "izmir",
    name: "Izmir",
    country: "Türkiye",
    summary: "Aegean modern metropolis: vibrant cosmopolitan lifestyle, coastal boulevards, and proximity to Çeşme and Alaçatı.",
    heroImage: "",
    districts: ["Alsancak", "Karşıyaka", "Bornova", "Çeşme", "Alaçatı", "Urla", "Konak", "Bayraklı"],
    hasSides: false,
    published: true,
    seoTitle: "Properties in Izmir & Çeşme | Aegean Living",
    seoDescription: "Modern city residences, seaside apartments, and vacation villas in Izmir and Çeşme.",
  },
  {
    slug: "ankara",
    name: "Ankara",
    country: "Türkiye",
    summary: "The political and diplomatic capital: embassy districts, prestigious universities, and institutional real estate stability.",
    heroImage: "",
    districts: ["Çankaya", "İncek", "Gölbaşı", "Çayyolu", "Bilkent", "Yenimahalle"],
    hasSides: false,
    published: true,
    seoTitle: "Real Estate in Ankara | Capital City Investments",
    seoDescription: "Prime residential and diplomatic real estate in Çankaya, İncek and Ankara's premier districts.",
  },
  {
    slug: "fethiye",
    name: "Fethiye",
    country: "Türkiye",
    summary: "Breathtaking turquoise bays, Ölüdeniz blue lagoon, Göcek yacht marinas, and peaceful pine-valley villa retreats.",
    heroImage: "",
    districts: ["Göcek", "Ölüdeniz", "Ovacık", "Hisarönü", "Çalış", "Faralya", "Fethiye Center"],
    hasSides: false,
    published: true,
    seoTitle: "Villas & Property for Sale in Fethiye & Göcek",
    seoDescription: "Luxury villas and marina residences in Göcek, Ölüdeniz and Fethiye.",
  },
];

export function defaultRegions(districts: readonly string[] = ISTANBUL_DISTRICTS): Region[] {
  return [{
    slug: "istanbul", name: "Istanbul", country: "Türkiye",
    summary: "Where two continents meet: Bosphorus-front towers, financial-district residences and green family districts.",
    heroImage: "", districts: [...districts], hasSides: true, published: true, sortOrder: 0, seoTitle: "", seoDescription: "",
  }];
}

/** Hero images must be an https link or an image already on this site; anything else is dropped. */
const safeImage = (v: string) => (/^(https:\/\/|\/images\/)[^\s]+$/.test(v) ? v : "");
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Clean any stored value into a valid, ordered Region[]. Idempotent: a normalised list is returned unchanged.
 * An empty/invalid list falls back to the legacy flat district list as a single Istanbul region, so a site
 * that has not configured regions yet behaves exactly as before.
 */
export function normalizeRegions(value: unknown, legacyDistricts?: readonly string[]): Region[] {
  let raw: unknown = value;
  if (typeof raw === "string") { try { raw = JSON.parse(raw); } catch { raw = []; } }
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
      const districts = Array.isArray(r["districts"]) ? [...new Set((r["districts"] as unknown[]).map((d) => text(d, 80)).filter(Boolean))].slice(0, 200) : [];
      out.push({
        slug, name, country: text(r["country"], 60) || "Türkiye", summary: text(r["summary"], 1000), heroImage: safeImage(text(r["heroImage"], 2048)),
        districts, hasSides: r["hasSides"] === true, published: r["published"] !== false,
        sortOrder: Number.isFinite(Number(r["sortOrder"])) ? Number(r["sortOrder"]) : out.length,
        seoTitle: text(r["seoTitle"], 120), seoDescription: text(r["seoDescription"], 320),
      });
    }
  }
  if (!out.length) return defaultRegions(legacyDistricts?.length ? legacyDistricts : ISTANBUL_DISTRICTS);
  return out.sort((a, b) => a.sortOrder - b.sortOrder);
}

/** The European/Asian side label is only meaningful for Istanbul-style regions, or when a side was actually recorded. */
export const showsSide = (city: string | null | undefined, side: string | null | undefined): boolean =>
  (side === "Europe" || side === "Asia") || slugifyRegion(city || "") === "istanbul";

export const sameCity = (a: string | null | undefined, b: string | null | undefined): boolean =>
  slugifyRegion(a || "") === slugifyRegion(b || "");

/** Visitor-facing regions: published only, in the admin's order. */
export const publicRegions = (regions: readonly Region[] | undefined): Region[] =>
  (regions ?? []).filter((r) => r.published).sort((a, b) => a.sortOrder - b.sortOrder);

/** Resolve a listing/project `city` value to a region (by name or slug, accent-insensitive). */
export function regionForCity(city: string | null | undefined, regions: readonly Region[] | undefined): Region | undefined {
  if (!city || !regions?.length) return undefined;
  const key = slugifyRegion(city);
  return (
    regions.find((r) => r.slug === key || slugifyRegion(r.name) === key) ??
    // "Istanbul, Türkiye" or "Antalya - Lara" still belong to the region named first.
    regions.find((r) => key.startsWith(r.slug + "-") || key.startsWith(slugifyRegion(r.name) + "-"))
  );
}

export const allDistricts = (regions: readonly Region[] | undefined): string[] =>
  [...new Set((regions ?? []).flatMap((r) => r.districts))];