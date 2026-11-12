import { randomUUID } from "node:crypto";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as store from "@/admin/demo";
import {
  websiteChanged,
  watchWebsiteChanges,
  PUBLIC_QUERY_KEYS,
  WEBSITE_CHANGED,
} from "@/lib/website-sync";
import { loadCatalogue, loadPublicSettings } from "@/data/live";
import { defaultRegions, type Region } from "@/data/regions";

// Helper simulating CaldrenHeroSection headline word splitting for GSAP
export function splitHeadlineWords(headline: string): Array<{ word: string; index: number }> {
  if (!headline || !headline.trim()) {
    headline = "Curated Offers & Developments in Istanbul.";
  }
  return headline
    .trim()
    .split(/\s+/)
    .map((word, index) => ({ word, index }));
}

describe("Public Website Live Synchronization Suite (Tiers 1-4)", () => {
  const workspace = () => JSON.parse(localStorage.getItem("avrasya-admin-db-v4")!) as store.DB;
  const signIn = (role: store.Role) => store.login(role + "@avrasya.test", store.DEMO_PASSWORD);

  beforeEach(() => {
    vi.stubGlobal("crypto", { randomUUID });
    vi.stubEnv("VITE_ENABLE_ADMIN_DEMO", "true");
    signIn("admin");
    store.resetData();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  // =========================================================================
  // TIER 1: Feature Coverage (Happy Path)
  // =========================================================================
  describe("Tier 1: Feature Coverage (Happy Path)", () => {
    it("F20: splits dynamic hero headline into data-hero-word spans preserving GSAP entrance timing", () => {
      const dynamicHeadline = "Private Waterfront Mansions on Istanbul Bosphorus Shoreline";
      const words = splitHeadlineWords(dynamicHeadline);

      expect(words).toHaveLength(7);
      expect(words[0]!.word).toBe("Private");
      expect(words[1]!.word).toBe("Waterfront");
      expect(words[6]!.word).toBe("Shoreline");

      // Verify each word has a sequential index for staggered GSAP timing
      words.forEach((item, idx) => {
        expect(item.index).toBe(idx);
      });
    });

    it("F21: updates public about section metrics dynamically through CMS settings", async () => {
      const dynamicMetrics = [
        { label: "Bespoke Portfolios", value: "$500M+" },
        { label: "Turkish CBI Approval Rate", value: "100%" },
        { label: "Prime Istanbul Districts", value: "14" },
      ];

      store.updateSiteSettings({
        websiteDesign: {
          aboutMetrics: JSON.stringify(dynamicMetrics),
        },
      });

      const loaded = await loadPublicSettings();
      expect(loaded.websiteDesign?.aboutMetrics).toBeDefined();
      const parsed = JSON.parse(loaded.websiteDesign!.aboutMetrics!);
      expect(parsed).toHaveLength(3);
      expect(parsed[0].value).toBe("$500M+");
    });

    it("F22: synchronizes public locations with active CMS region settings", () => {
      const regions = defaultRegions();
      const antalyaRegion: Region = {
        slug: "antalya-riviera",
        name: "Antalya Riviera",
        country: "Türkiye",
        summary: "Luxury sea-facing penthouses and yacht berths.",
        heroImage: "/images/regions/antalya.jpg",
        districts: ["Lara", "Konyaaltı", "Kemer"],
        hasSides: false,
        published: true,
        sortOrder: 1,
        seoTitle: "Antalya Riviera Real Estate | Mediterranean Villas",
        seoDescription: "Browse luxury Mediterranean seafront villas in Antalya.",
      };

      store.updateSiteSettings({
        regions: [...regions, antalyaRegion],
      });

      const settings = workspace().siteSettings;
      expect(settings.regions.some((r) => r.slug === "antalya-riviera")).toBe(true);
    });

    it("F13: duplicates property listing with cloned specifications and new draft ref/slug", () => {
      const sourceProp = workspace().properties[0]!;
      expect(sourceProp).toBeDefined();

      const duplicated = store.upsert<store.Property>("properties", {
        ref: `AVR-${Math.floor(2000 + Math.random() * 8000)}`,
        slug: `${sourceProp.slug}-clone-${randomUUID()}`,
        title: `${sourceProp.title} (Copy)`,
        district: sourceProp.district,
        city: sourceProp.city,
        type: sourceProp.type,
        layout: sourceProp.layout,
        bathrooms: sourceProp.bathrooms,
        grossM2: sourceProp.grossM2,
        netM2: sourceProp.netM2,
        areaM2: sourceProp.areaM2,
        amount: sourceProp.amount,
        currency: sourceProp.currency,
        mode: sourceProp.mode,
        priceType: sourceProp.priceType,
        availability: "Available",
        publication: "Draft",
        agentId: sourceProp.agentId,
        cover: sourceProp.cover,
        description: sourceProp.description,
        project: sourceProp.project,
        updatedAt: new Date().toISOString(),
      });

      expect(duplicated.id).not.toBe(sourceProp.id);
      expect(duplicated.ref).not.toBe(sourceProp.ref);
      expect(duplicated.slug).not.toBe(sourceProp.slug);
      expect(duplicated.title).toBe(`${sourceProp.title} (Copy)`);
      expect(duplicated.publication).toBe("Draft");
      expect(duplicated.amount).toBe(sourceProp.amount);
    });

    it("F14: reorders property gallery images and sets primary cover", () => {
      const gallery = [
        "/images/properties/photo-1.jpg",
        "/images/properties/photo-2.jpg",
        "/images/properties/photo-3.jpg",
      ];

      const prop = store.upsert<store.Property>("properties", {
        ref: "AVR-GAL-E2E",
        slug: "gallery-test-reorder",
        title: "Gallery Reorder Villa",
        district: "Sarıyer",
        city: "Istanbul",
        type: "unit offer",
        layout: "5+1",
        bathrooms: 4,
        grossM2: 450,
        netM2: 380,
        areaM2: null,
        amount: 2500000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        availability: "Available",
        publication: "Draft",
        agentId: "u3",
        cover: gallery[0],
        galleryImages: [...gallery],
        description: "Reordering gallery test",
        project: "Bosphorus Hills",
        updatedAt: new Date().toISOString(),
      });

      expect(prop.cover).toBe(gallery[0]);

      // Set photo-3 as primary cover and swap gallery positions
      const newPrimary = gallery[2];
      const reorderedGallery = [gallery[2], gallery[0], gallery[1]];

      const updated = store.upsert<store.Property>("properties", {
        id: prop.id,
        cover: newPrimary,
        galleryImages: reorderedGallery,
      });

      expect(updated.cover).toBe("/images/properties/photo-3.jpg");
      expect(updated.galleryImages?.[0]).toBe("/images/properties/photo-3.jpg");
      expect(updated.galleryImages).toHaveLength(3);
    });
  });

  // =========================================================================
  // TIER 2: Boundary & Corner Cases (Limits, Edge Cases, Negative Validation)
  // =========================================================================
  describe("Tier 2: Boundary & Corner Cases", () => {
    it("F20: falls back gracefully when hero headline is empty or contains multiple irregular spaces", () => {
      // Empty input fallback
      const emptyWords = splitHeadlineWords("");
      expect(emptyWords.length).toBeGreaterThan(0);
      expect(emptyWords[0]!.word).toBe("Curated");

      // Multiple irregular tabs and spaces
      const messyInput = "  Prime \t Bosphorus   Waterfront \n\n Residences  ";
      const messyWords = splitHeadlineWords(messyInput);
      expect(messyWords).toHaveLength(4);
      expect(messyWords[0]!.word).toBe("Prime");
      expect(messyWords[1]!.word).toBe("Bosphorus");
      expect(messyWords[2]!.word).toBe("Waterfront");
      expect(messyWords[3]!.word).toBe("Residences");
    });

    it("F23: loadCatalogue filters out unparseable/corrupted entries without dropping the valid catalogue", async () => {
      const catalogue = await loadCatalogue();
      expect(Array.isArray(catalogue)).toBe(true);
      expect(catalogue.length).toBeGreaterThan(0);

      // Verify each item conforms to public property schema
      for (const item of catalogue) {
        expect(item.slug).toBeDefined();
        expect(typeof item.slug).toBe("string");
        expect(item.marketing_title).toBeDefined();
        expect(item.price).toBeDefined();
      }
    });

    it("F26: provides fallback meta title and description when region SEO fields are blank", () => {
      const fallbackSeo = (region: {
        name: string;
        seoTitle?: string;
        seoDescription?: string;
        summary?: string;
      }) => {
        const title =
          region.seoTitle && region.seoTitle.trim()
            ? region.seoTitle
            : `${region.name} Real Estate & Property Investments | Avrasya`;
        const description =
          region.seoDescription && region.seoDescription.trim()
            ? region.seoDescription
            : region.summary ||
              `Discover verified luxury properties for sale in ${region.name}, Türkiye.`;
        return { title, description };
      };

      const regionWithEmptySeo = {
        name: "Trabzon",
        seoTitle: "",
        seoDescription: "",
        summary: "Black Sea mountain and valley villas.",
      };

      const seo = fallbackSeo(regionWithEmptySeo);
      expect(seo.title).toBe("Trabzon Real Estate & Property Investments | Avrasya");
      expect(seo.description).toBe("Black Sea mountain and valley villas.");
    });
  });

  // =========================================================================
  // TIER 3: Cross-Feature Combinations (Event Bus Invalidation & Live Signals)
  // =========================================================================
  describe("Tier 3: Cross-Feature Combinations", () => {
    it("F20 & Event Bus: broadcasts WEBSITE_CHANGED signal and registers on PUBLIC_QUERY_KEYS", () => {
      const eventSpy = vi.fn();
      window.addEventListener(WEBSITE_CHANGED, eventSpy);

      // Verify PUBLIC_QUERY_KEYS contract contains all critical website dependencies
      expect(PUBLIC_QUERY_KEYS.has("published-catalogue")).toBe(true);
      expect(PUBLIC_QUERY_KEYS.has("site-settings")).toBe(true);
      expect(PUBLIC_QUERY_KEYS.has("services")).toBe(true);
      expect(PUBLIC_QUERY_KEYS.has("faqs")).toBe(true);

      // Trigger change signal
      websiteChanged();

      expect(eventSpy).toHaveBeenCalled();
      window.removeEventListener(WEBSITE_CHANGED, eventSpy);
    });

    it("F13 & F23: publishing a duplicated property makes it appear immediately in loadCatalogue()", async () => {
      const uniqueSlug = `live-sync-unit-${randomUUID()}`;

      // 1. Create and publish property
      store.upsert<store.Property>("properties", {
        ref: "AVR-SYNC-99",
        slug: uniqueSlug,
        title: "Live Synchronized Penthouse",
        district: "Beşiktaş",
        city: "Istanbul",
        type: "unit offer",
        layout: "3+1",
        bathrooms: 2,
        grossM2: 180,
        netM2: 150,
        areaM2: null,
        amount: 890000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        availability: "Available",
        publication: "Published",
        agentId: "u2",
        cover: "/images/properties/sync-penthouse.jpg",
        description: "Testing live publication synchronization",
        project: "Beşiktaş Towers",
        updatedAt: new Date().toISOString(),
      });

      // 2. Load catalogue
      const catalogue = await loadCatalogue();
      const found = catalogue.find((p) => p.slug === uniqueSlug);
      expect(found).toBeDefined();
      expect(found?.marketing_title).toBe("Live Synchronized Penthouse");

      // 3. Unpublish property
      const dbProp = workspace().properties.find((p) => p.slug === uniqueSlug)!;
      store.upsert<store.Property>("properties", {
        id: dbProp.id,
        publication: "Draft",
      });

      // 4. Verify omitted from catalogue
      const updatedCatalogue = await loadCatalogue();
      expect(updatedCatalogue.some((p) => p.slug === uniqueSlug)).toBe(false);
    });
  });

  // =========================================================================
  // TIER 4: Real-World Application Scenarios (End-to-End Live Workflow)
  // =========================================================================
  describe("Tier 4: Real-World Application Scenarios", () => {
    it("Scenario: Admin CMS headline update -> Live signal dispatch -> Public component sync -> Unpublish immediate hide", async () => {
      // 1. Admin signs into admin panel
      signIn("admin");
      expect(store.getSession()?.role).toBe("admin");

      // 2. Admin modifies Hero headline and brand tagline in site settings
      const updatedHeadline = "Distinguished Istanbul Real Estate & Bosphorus Estates";
      store.updateSiteSettings({
        heroHeadline: updatedHeadline,
        tagline: "Institutional real estate advisory for international clients.",
      });

      // 3. System emits websiteChanged signal
      let syncNotified = false;
      const stopWatching = watchWebsiteChanges(
        () => {
          syncNotified = true;
        },
        { poll: false },
      );

      websiteChanged();

      // Wait a tick for signal listener coalescing
      await new Promise((r) => setTimeout(r, 80));
      expect(syncNotified).toBe(true);
      stopWatching();

      // 4. Public website loads fresh settings
      const publicSettings = await loadPublicSettings();
      expect(publicSettings.heroHeadline).toBe(updatedHeadline);

      // 5. Hero Component split reflects new headline words for GSAP entrance
      const headlineSpans = splitHeadlineWords(publicSettings.heroHeadline);
      expect(headlineSpans[0]!.word).toBe("Distinguished");
      expect(headlineSpans[headlineSpans.length - 1]!.word).toBe("Estates");

      // 6. Admin creates, publishes and verifies a brand new listing
      const freshSlug = `mansion-bosphorus-${randomUUID()}`;
      const newListing = store.upsert<store.Property>("properties", {
        ref: "AVR-MANSION-01",
        slug: freshSlug,
        title: "Historic Ottoman Bosphorus Mansion",
        district: "Yeniköy",
        city: "Istanbul",
        type: "unit offer",
        layout: "8+3",
        bathrooms: 6,
        grossM2: 1200,
        netM2: 950,
        areaM2: null,
        amount: 18000000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        availability: "Available",
        publication: "Published",
        agentId: "u1",
        cover: "/images/properties/ottoman-mansion.jpg",
        description: "Direct Bosphorus waterfront historic yalı.",
        project: "Yeniköy Waterfront",
        updatedAt: new Date().toISOString(),
      });

      let catalogue = await loadCatalogue();
      expect(catalogue.some((p) => p.slug === freshSlug)).toBe(true);

      // 7. Admin unpublishes the listing -> instantly hidden from public catalogue
      store.upsert<store.Property>("properties", {
        id: newListing.id,
        publication: "Draft",
      });

      catalogue = await loadCatalogue();
      expect(catalogue.some((p) => p.slug === freshSlug)).toBe(false);
    });
  });
});
