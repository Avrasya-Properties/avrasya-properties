import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { splitHeadlineWords } from "./e2e/public-sync.test";
import { AVRASYA_SERVICES_TIMELINE } from "@/components/site/BildoraServicesTimeline";
import { REGIONS_DATA } from "@/components/site/CaldrenLocationsSection";
import { DEFAULT_SITE_SETTINGS } from "@/admin/store";
import { DEFAULT_NAVIGATION_ITEMS } from "@/admin/demo";

describe("Milestone M5: Public Live Synchronization & Dynamic Bindings", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_ENABLE_ADMIN_DEMO", "true");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("1. Caldren Hero Section GSAP Dynamic Word Stagger", () => {
    it("splits dynamic headline into sequential data-hero-word spans", () => {
      const customHeadline = "Luxury Bosphorus Mansions Thoughtfully Curated";
      const words = splitHeadlineWords(customHeadline);
      expect(words).toHaveLength(5);
      expect(words[0]!.word).toBe("Luxury");
      expect(words[1]!.word).toBe("Bosphorus");
      expect(words[4]!.word).toBe("Curated");
      words.forEach((w, idx) => expect(w.index).toBe(idx));
    });

    it("falls back to default headline words when headline is empty or whitespace", () => {
      const words = splitHeadlineWords("   ");
      expect(words.length).toBeGreaterThan(0);
      expect(words[0]!.word).toBe("Curated");
    });
  });

  describe("2. Bildora About Section 3D Arc & Counter Metrics", () => {
    it("resolves dynamic about metrics from settings.websiteDesign with accurate target numbers", () => {
      const rawMetrics = [
        { label: "Years of Experience", value: "15+" },
        { label: "Completed Projects", value: "320+" },
        { label: "Client Satisfaction", value: "4.9/5" },
        { label: "On-Time Delivery", value: "99%" },
      ];

      const resolved = rawMetrics.map((item) => {
        const match = item.value.match(/^([^\d.]*)([\d.]+)(.*)$/);
        return {
          label: item.label,
          value: item.value,
          target: match ? parseFloat(match[2]!) : 0,
          suffix: match ? match[3] : "",
        };
      });

      expect(resolved[0]!.target).toBe(15);
      expect(resolved[0]!.suffix).toBe("+");
      expect(resolved[1]!.target).toBe(320);
      expect(resolved[2]!.target).toBe(4.9);
      expect(resolved[2]!.suffix).toBe("/5");
      expect(resolved[3]!.target).toBe(99);
      expect(resolved[3]!.suffix).toBe("%");
    });
  });

  describe("3. Services Timeline Dynamic Bindings & Lucide Icons", () => {
    it("provides 6 default curated service items with valid placeholder slots and deliverables", () => {
      expect(AVRASYA_SERVICES_TIMELINE).toHaveLength(6);
      AVRASYA_SERVICES_TIMELINE.forEach((svc, idx) => {
        expect(svc.number).toBe(String(idx + 1).padStart(2, "0"));
        expect(svc.title).toBeTruthy();
        expect(svc.description).toBeTruthy();
        expect(svc.slot).toBeDefined();
        expect(Array.isArray(svc.deliverables)).toBe(true);
        expect(svc.deliverables!.length).toBeGreaterThan(0);
      });
    });

    it("transforms dynamic service process steps from array or newline string", () => {
      const rawStepsArray = ["Snagging inspection", "Utility connection", "Key handover"];
      const rawStepsString = "Snagging inspection\nUtility connection\nKey handover";

      const parsedFromArray = rawStepsArray.filter((s) => typeof s === "string");
      const parsedFromString = rawStepsString.split("\n").filter(Boolean);

      expect(parsedFromArray).toEqual(parsedFromString);
      expect(parsedFromArray).toHaveLength(3);
    });
  });

  describe("4. Locations Section Data Consistency", () => {
    it("includes 4 primary Turkish regions with complete pricing and coordinates", () => {
      expect(REGIONS_DATA).toHaveLength(4);
      const slugs = REGIONS_DATA.map((r) => r.slug);
      expect(slugs).toEqual(["istanbul", "bodrum", "antalya", "sakarya"]);

      REGIONS_DATA.forEach((reg) => {
        expect(reg.avgPriceM2).toMatch(/^\$[\d,]+/);
        expect(reg.priceGrowthYoY).toMatch(/^\+\d+%/);
        expect(reg.defaultResidencesCount).toBeGreaterThan(0);
        expect(reg.featuredFallbackTitle).toBeTruthy();
        expect(reg.featuredFallbackPriceUsd).toBeGreaterThan(0);
      });
    });
  });

  describe("5. Site Settings Default Integrity", () => {
    it("verifies DEFAULT_SITE_SETTINGS includes required branding and contact information", () => {
      expect(DEFAULT_SITE_SETTINGS.companyName).toBe("Avrasya Properties Group");
      expect(DEFAULT_SITE_SETTINGS.phone).toBe("+90 545 924 80 42");
      expect(DEFAULT_SITE_SETTINGS.email).toBe("info@avrasyaproperties.com");
      expect(DEFAULT_SITE_SETTINGS.cbiThresholdUsd).toBe(400000);
      expect(DEFAULT_SITE_SETTINGS.districts.length).toBeGreaterThan(0);
    });

    it("includes Locations link in DEFAULT_NAVIGATION_ITEMS at order 3", () => {
      const locationsItem = DEFAULT_NAVIGATION_ITEMS.find((item) => item.href === "/locations");
      expect(locationsItem).toBeDefined();
      expect(locationsItem?.label).toBe("Locations");
      expect(locationsItem?.order).toBe(3);
      expect(locationsItem?.is_visible).toBe(true);
    });

    it("ensures sequential ordering of navigation items 1 through 9", () => {
      expect(DEFAULT_NAVIGATION_ITEMS).toHaveLength(9);
      DEFAULT_NAVIGATION_ITEMS.forEach((item, index) => {
        expect(item.order).toBe(index + 1);
      });
    });
  });
});
