import { describe, expect, it } from "vitest";
import { allDistricts, defaultRegions, normalizeRegions, publicRegions, regionForCity, sameCity, showsSide, slugifyRegion, type Region } from "@/data/regions";
import { filterProperties, type PropertyRecord } from "@/data/properties";
import { DEFAULT_SITE_SETTINGS } from "@/admin/demo";
import { decodeSettings, encodeSettings } from "@/admin/mappers";
import { validateSettings } from "@/admin/domain.js";

const antalya: Region = { slug: "antalya", name: "Antalya", country: "Türkiye", summary: "Coast", heroImage: "", districts: ["Konyaaltı", "Lara"], hasSides: false, published: true, sortOrder: 1, seoTitle: "", seoDescription: "" };
const record = (slug: string, city: string, loc: string, side: PropertyRecord["side"] = "unknown"): PropertyRecord => ({
  slug, marketing_title: slug, city, location_label: loc, side, record_type: "unit_offer", layout_label: "2+1",
  price: { currency: "USD", amount: 300000, basis: "fixed", status: "x" }, areas: [], source_ids: [], availability_verified: true, details: {},
});

describe("regions", () => {
  it("slugifies Turkish names for URLs", () => {
    expect(slugifyRegion("İstanbul")).toBe("istanbul");
    expect(slugifyRegion("Muğla / Bodrum")).toBe("mugla-bodrum");
    expect(slugifyRegion("  Şişli  ")).toBe("sisli");
  });

  it("falls back to a single Istanbul region built from the legacy district list", () => {
    const list = normalizeRegions([], ["Kadıköy", "Sarıyer"]);
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ slug: "istanbul", hasSides: true, districts: ["Kadıköy", "Sarıyer"] });
    expect(normalizeRegions("not json")).toHaveLength(1);
  });

  it("is idempotent and drops unusable entries", () => {
    const once = normalizeRegions([antalya, { name: "" }, { name: "Dup", slug: "antalya" }, null, "x", { name: "Bodrum", districts: ["Yalıkavak", "Yalıkavak", " "] }]);
    expect(once.map((r) => r.slug)).toEqual(["antalya", "bodrum"]);
    expect(once[1]!.districts).toEqual(["Yalıkavak"]);
    expect(normalizeRegions(once)).toEqual(once);
  });

  it("matches a listing city to its region by name or slug, ignoring accents and case", () => {
    const list = [...defaultRegions(), antalya];
    expect(regionForCity("İstanbul", list)?.slug).toBe("istanbul");
    expect(regionForCity("antalya", list)?.slug).toBe("antalya");
    expect(regionForCity("Izmir", list)).toBeUndefined();
    expect(sameCity("Istanbul", "İSTANBUL")).toBe(true);
  });

  it("matches city text that carries a country or sub-area suffix", () => {
    const list = [...defaultRegions(), antalya];
    expect(regionForCity("Istanbul, Türkiye", list)?.slug).toBe("istanbul");
    expect(regionForCity("Antalya - Lara", list)?.slug).toBe("antalya");
    expect(regionForCity("", list)).toBeUndefined();
    expect(regionForCity("Istanbulensis", list)).toBeUndefined();
  });

  it("drops unsafe region hero image links but keeps site and https images", () => {
    const [a, b, c] = normalizeRegions([
      { name: "A", heroImage: "javascript:alert(1)" },
      { name: "B", heroImage: "http://tracker.example/x.png" },
      { name: "C", heroImage: "/images/properties/hero-main.jpg" },
    ]);
    expect(a!.heroImage).toBe("");
    expect(b!.heroImage).toBe("");
    expect(c!.heroImage).toBe("/images/properties/hero-main.jpg");
    expect(normalizeRegions([{ name: "D", heroImage: "https://cdn.example/x.jpg" }])[0]!.heroImage).toBe("https://cdn.example/x.jpg");
  });

  it("shows the Europe/Asia side only where it applies", () => {
    expect(showsSide("Istanbul", "unknown")).toBe(true);
    expect(showsSide("Antalya", "unknown")).toBe(false);
    expect(showsSide("Antalya", "Europe")).toBe(true);
  });

  it("only exposes published regions, in admin order", () => {
    const hidden = { ...antalya, slug: "hidden", name: "Hidden", published: false, sortOrder: 0 };
    expect(publicRegions([antalya, hidden, ...defaultRegions()]).map((r) => r.slug)).toEqual(["istanbul", "antalya"]);
    expect(allDistricts([antalya])).toEqual(["Konyaaltı", "Lara"]);
  });

  it("filters the catalogue by region without disturbing district filtering", () => {
    const regions = [...defaultRegions(), antalya];
    const cat = [record("a", "Istanbul", "Şişli", "Europe"), record("b", "Antalya", "Lara"), record("c", "Antalya", "Konyaaltı")];
    expect(filterProperties({ region: "antalya" }, cat, undefined, regions).map((r) => r.slug)).toEqual(["b", "c"]);
    expect(filterProperties({ region: "antalya", loc: "Lara" }, cat, undefined, regions).map((r) => r.slug)).toEqual(["b"]);
    expect(filterProperties({ region: "istanbul", side: "Europe" }, cat, undefined, regions).map((r) => r.slug)).toEqual(["a"]);
    expect(filterProperties({}, cat, undefined, regions)).toHaveLength(3);
    // A region slug that is not configured still works by comparing the listing city.
    expect(filterProperties({ region: "antalya" }, cat).map((r) => r.slug)).toEqual(["b", "c"]);
  });

  it("round-trips regions through the settings mapper", () => {
    const custom = { ...DEFAULT_SITE_SETTINGS, regions: [...defaultRegions(), antalya] };
    expect(decodeSettings(encodeSettings(custom)).regions).toEqual(custom.regions);
  });

  it("validates region settings before they are saved", () => {
    const good = { ...DEFAULT_SITE_SETTINGS, regions: [...defaultRegions(), antalya] };
    expect(() => validateSettings(good)).not.toThrow();
    expect(() => validateSettings({ ...good, regions: [antalya, { ...antalya, name: "Copy" }] })).toThrow(/Two regions/);
    expect(() => validateSettings({ ...good, regions: [{ ...antalya, slug: "Bad Slug" }] })).toThrow(/web address/);
    expect(() => validateSettings({ ...good, regions: [{ ...antalya, heroImage: "javascript:alert(1)" }] })).toThrow(/image/);
    expect(() => validateSettings({ ...good, regions: [{ ...antalya, name: "  " }] })).toThrow(/name/);
  });
});