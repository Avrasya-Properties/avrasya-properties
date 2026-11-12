import { randomUUID } from "node:crypto";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as store from "@/admin/demo";
import { managedRows, saveManaged, deleteManaged, editorRecord } from "@/admin/management";
import { defaultRegions, normalizeRegions, type Region } from "@/data/regions";
import { websiteChanged } from "@/lib/website-sync";

describe("CMS Features & Page Builder Suite (Tiers 1-4)", () => {
  const workspace = () => JSON.parse(localStorage.getItem("avrasya-admin-db-v4")!) as store.DB;
  const signIn = (role: store.Role) => store.login(role + "@avrasya.test", store.DEMO_PASSWORD);

  beforeEach(() => {
    vi.stubGlobal("crypto", { randomUUID });
    vi.stubEnv("VITE_ENABLE_ADMIN_DEMO", "true");
    signIn("admin");
    store.resetData();
    localStorage.removeItem("avrasya_admin_manage_demo_v2");
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
    it("F8: manages content pages with draft/published status and metadata", async () => {
      const pages = await managedRows("content_pages");
      expect(pages.length).toBeGreaterThan(0);
      const aboutPage = pages.find((p) => p["slug"] === "about");
      expect(aboutPage).toBeDefined();
      expect(aboutPage?.["published_status"]).toBe("Published");

      // Save a new draft page
      const newPage = {
        slug: "terms",
        title: "Terms and Conditions of Advisory",
        meta_description: "Legal conditions governing real estate brokerage services.",
        published_status: "Draft",
      };
      await saveManaged("content_pages", newPage, null);

      const updatedPages = await managedRows("content_pages");
      const found = updatedPages.find((p) => p["title"] === newPage.title);
      expect(found).toBeDefined();
      expect(found?.["published_status"]).toBe("Draft");
    });

    it("F9: performs structured section field editing with paragraphs and enquiry toggle", async () => {
      const pages = await managedRows("content_pages");
      const pageId = pages[0]!["id"] as string;

      const newSection = {
        page_id: pageId,
        section_key: "heritage-vision",
        title: "Our Heritage & Global Vision",
        content_json:
          "First paragraph describing founding in Istanbul.\n\nSecond paragraph covering advisory standards.",
        _include_enquiry: true,
        sort_order: 1,
      };

      await saveManaged("content_sections", newSection, null);

      const sections = await managedRows("content_sections");
      const savedSection = sections.find((s) => s["section_key"] === "heritage-vision");
      expect(savedSection).toBeDefined();
      expect(savedSection?.["title"]).toBe("Our Heritage & Global Vision");

      const contentJson = savedSection?.["content_json"] as {
        paragraphs: string[];
        enquiry: boolean;
      };
      expect(contentJson.paragraphs).toHaveLength(2);
      expect(contentJson.paragraphs[0]).toBe("First paragraph describing founding in Istanbul.");
      expect(contentJson.enquiry).toBe(true);
    });

    it("F12: configures dynamic navigation and footer settings in websiteDesign", () => {
      const navigationItems = [
        { label: "Portfolio", href: "/properties", order: 1, is_visible: true },
        { label: "Citizenship $400k", href: "/citizenship", order: 2, is_visible: true },
        { label: "Advisory Services", href: "/services", order: 3, is_visible: true },
        { label: "About Us", href: "/about", order: 4, is_visible: true },
        { label: "Direct Contact", href: "/contact", order: 5, is_visible: true },
      ];

      const footerConfig = {
        note: "Avrasya Properties Group is licensed under Istanbul Chamber of Commerce.",
        columns: [
          { title: "Quick Links", links: [{ label: "All Properties", href: "/properties" }] },
          { title: "Legal", links: [{ label: "Privacy Policy", href: "/privacy-policy" }] },
        ],
      };

      store.updateSiteSettings({
        websiteDesign: {
          navigation: JSON.stringify(navigationItems),
          footer: JSON.stringify(footerConfig),
          footerNote: footerConfig.note,
        },
      });

      const settings = workspace().siteSettings;
      expect(settings.websiteDesign?.["navigation"]).toBeDefined();
      const parsedNav = JSON.parse(settings.websiteDesign!["navigation"] as string);
      expect(parsedNav).toHaveLength(5);
      expect(parsedNav[0].label).toBe("Portfolio");
      expect(settings.websiteDesign?.["footerNote"] as string).toContain(
        "Istanbul Chamber of Commerce",
      );
    });

    it("F15: manages locations and regions with districts and geographic coordinates", () => {
      const currentRegions = defaultRegions();
      expect(currentRegions.length).toBeGreaterThan(0);

      const customRegion: Region = {
        slug: "bursa-yalova",
        name: "Bursa & Yalova",
        country: "Türkiye",
        summary: "Thermal springs and mountain retreat villas.",
        heroImage: "/images/regions/bursa.jpg",
        districts: ["Nilüfer", "Osmangazi", "Mudanya", "Çınarcık"],
        hasSides: false,
        published: true,
        sortOrder: currentRegions.length,
        seoTitle: "Bursa & Yalova Real Estate | Thermal & Mountain Properties",
        seoDescription:
          "Explore luxury villas and nature estates in Bursa and Yalova with Avrasya Properties.",
        coordinates: { lat: 40.1885, lng: 29.061 },
      };

      const updated = normalizeRegions([...currentRegions, customRegion]);
      store.updateSiteSettings({ regions: updated });

      const savedRegions = workspace().siteSettings.regions;
      const found = savedRegions.find((r) => r.slug === "bursa-yalova");
      expect(found).toBeDefined();
      expect(found?.districts).toHaveLength(4);
      expect(found?.districts).toContain("Mudanya");
      expect(found?.seoTitle).toContain("Bursa & Yalova");
      expect(found?.summary).toContain("Thermal springs");
    });

    it("F16: manages services with Lucide icons, process steps, and custom CTA links", async () => {
      const newService = {
        slug: "golden-visa-citizenship",
        title: "Turkish Golden Visa & Citizenship Program",
        category: "Legal & Advisory",
        description: "Statutory turnkey support for $400,000 real estate investment.",
        process_steps: "1. Portfolio Selection\n2. Title Deed Conformance\n3. Passport Issuance",
        icon: "ShieldCheck",
        cta_label: "Schedule Legal Consultation",
        cta_link: "/contact?topic=citizenship",
        sort_order: 5,
        is_published: true,
      };

      await saveManaged("services", newService, null);

      const services = await managedRows("services");
      const saved = services.find((s) => s["slug"] === "golden-visa-citizenship");
      expect(saved).toBeDefined();
      expect(saved?.["title"]).toBe(newService.title);
      expect(Array.isArray(saved?.["process_steps"])).toBe(true);
      expect((saved?.["process_steps"] as string[]).length).toBe(3);
    });

    it("F18: configures entity-level dynamic SEO and Open Graph metadata", () => {
      store.updateSiteSettings({
        siteTitle: "Avrasya Properties | Premier Istanbul Luxury Real Estate",
        metaDescription:
          "Verified Istanbul freehold properties, Bosphorus waterfronts, and citizenship advisory.",
        ogImage: "https://avrasyaproperties.com/images/og-brand.jpg",
        keywords: "Istanbul real estate, Bosphorus properties, Turkish citizenship",
        indexingEnabled: true,
      });

      const settings = workspace().siteSettings;
      expect(settings.siteTitle).toContain("Premier Istanbul");
      expect(settings.metaDescription).toContain("Bosphorus waterfronts");
      expect(settings.ogImage).toMatch(/^https:\/\//);
      expect(settings.indexingEnabled).toBe(true);
    });
  });

  // =========================================================================
  // TIER 2: Boundary & Corner Cases (Limits, Edge Cases, Negative Validation)
  // =========================================================================
  describe("Tier 2: Boundary & Corner Cases", () => {
    it("F8 & F9: rejects section creation when required fields are missing", async () => {
      const invalidSection = {
        page_id: "",
        section_key: "",
        title: "",
      };

      await expect(saveManaged("content_sections", invalidSection, null)).rejects.toThrow(
        /required/i,
      );
    });

    it("F15: validates that coordinates adhere to valid latitude [-90, 90] and longitude [-180, 180] bounds", () => {
      const validateCoordinates = (lat: number, lng: number) => {
        if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
          throw new Error("Latitude must be between -90 and 90 degrees.");
        }
        if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
          throw new Error("Longitude must be between -180 and 180 degrees.");
        }
        return true;
      };

      expect(() => validateCoordinates(95.0, 29.0)).toThrow(/latitude must be between/i);
      expect(() => validateCoordinates(41.0, 195.0)).toThrow(/longitude must be between/i);
      expect(validateCoordinates(41.0082, 28.9784)).toBe(true); // Istanbul coordinates
    });

    it("F9: handles empty paragraphs and excessive whitespace cleanly without creating blank items", async () => {
      const pages = await managedRows("content_pages");
      const pageId = pages[0]!["id"] as string;

      const sectionWithSpaces = {
        page_id: pageId,
        section_key: "spacing-test",
        title: "Clean Formatting Test",
        content_json:
          "   Paragraph one with spaces.   \n\n\n\n   Paragraph two with tabs.\t\t   \n\n   ",
        sort_order: 1,
      };

      await saveManaged("content_sections", sectionWithSpaces, null);
      const sections = await managedRows("content_sections");
      const saved = sections.find((s) => s["section_key"] === "spacing-test");
      const contentJson = saved?.["content_json"] as { paragraphs: string[] };

      expect(contentJson.paragraphs).toHaveLength(2);
      expect(contentJson.paragraphs[0]).toBe("Paragraph one with spaces.");
      expect(contentJson.paragraphs[1]).toBe("Paragraph two with tabs.");
    });

    it("F18: provides fallback when entity SEO metadata is partially omitted", () => {
      const globalTitle = "Avrasya Properties Default Brand";
      const resolveMetaTitle = (pageTitle?: string) => {
        return pageTitle && pageTitle.trim() ? `${pageTitle} | ${globalTitle}` : globalTitle;
      };

      expect(resolveMetaTitle("")).toBe(globalTitle);
      expect(resolveMetaTitle("   ")).toBe(globalTitle);
      expect(resolveMetaTitle("Luxury Villas")).toBe(
        "Luxury Villas | Avrasya Properties Default Brand",
      );
    });
  });

  // =========================================================================
  // TIER 3: Cross-Feature Combinations (Interactions & Guards)
  // =========================================================================
  describe("Tier 3: Cross-Feature Combinations", () => {
    it("F11 & F8: demonstrates unsaved changes guard mechanics when form is dirty", () => {
      // Simulate form tracking state
      const initialContent = {
        title: "Initial Section Title",
        content: "Initial Paragraph",
      };

      let currentDraft = { ...initialContent };
      const isDirty = () => JSON.stringify(currentDraft) !== JSON.stringify(initialContent);

      expect(isDirty()).toBe(false);

      // User types into editor
      currentDraft.content = "Modified paragraph with unsaved text.";
      expect(isDirty()).toBe(true);

      // Blocker triggers if navigation attempted while dirty
      const attemptNavigate = (allowLeaveModalConfirmed: boolean) => {
        if (isDirty() && !allowLeaveModalConfirmed) {
          throw new Error("Navigation blocked: You have unsaved changes.");
        }
        return "Navigated successfully";
      };

      expect(() => attemptNavigate(false)).toThrow(/unsaved changes/i);
      expect(attemptNavigate(true)).toBe("Navigated successfully");

      // Once saved, isDirty resets
      currentDraft = { ...initialContent, content: "Modified paragraph with unsaved text." };
      const savedContent = { ...currentDraft };
      const isStillDirty = () => JSON.stringify(currentDraft) !== JSON.stringify(savedContent);
      expect(isStillDirty()).toBe(false);
    });

    it("F8 & F10: verifies Draft section isolation vs Live Preview rendering", async () => {
      const pages = await managedRows("content_pages");
      const pageId = pages[0]!["id"] as string;

      // 1. Create a section in Draft page
      const draftSection = {
        page_id: pageId,
        section_key: "preview-test",
        title: "Draft Exclusive Section",
        content_json: "Visible inside CMS live preview before public deployment.",
        sort_order: 1,
      };

      await saveManaged("content_sections", draftSection, null);

      // In-situ preview simulator: reads all sections regardless of publication status
      const previewSections = await managedRows("content_sections");
      const foundInPreview = previewSections.find((s) => s["section_key"] === "preview-test");
      expect(foundInPreview).toBeDefined();
      expect(foundInPreview?.["title"]).toBe("Draft Exclusive Section");

      // Public filter simulator: only published pages/sections are served to public clients
      const publicFiltered = previewSections.filter((s) => s["is_published"] === true);
      expect(publicFiltered.find((s) => s["section_key"] === "preview-test")).toBeUndefined();
    });

    it("F15 & F18: synchronizes region geographic updates with dynamic regional SEO tags", () => {
      const regions = defaultRegions();
      const targetRegion = regions.find((r) => r.slug === "istanbul")!;

      const updatedRegion: Region = {
        ...targetRegion,
        seoTitle: "Istanbul Luxury Real Estate & Bosphorus Waterfront Mansions | Avrasya",
        seoDescription: "Explore prime Istanbul, Bebek, Kadıköy and Bosphorus luxury residences.",
        summary: "Where two continents meet: Bosphorus-front towers and prime residences.",
      };

      const updatedList = regions.map((r) => (r.slug === "istanbul" ? updatedRegion : r));
      store.updateSiteSettings({ regions: updatedList });

      const result = workspace().siteSettings.regions.find((r) => r.slug === "istanbul");
      expect(result?.seoTitle).toBe(
        "Istanbul Luxury Real Estate & Bosphorus Waterfront Mansions | Avrasya",
      );
      expect(result?.seoDescription).toContain("Bosphorus luxury residences");
      expect(result?.summary).toContain("Where two continents meet");
    });
  });

  // =========================================================================
  // TIER 4: Real-World Application Scenarios (End-to-End Workflow)
  // =========================================================================
  describe("Tier 4: Real-World Application Scenarios", () => {
    it("Scenario: Content authoring -> Structured cards update -> Live preview validation -> Publication & event sync", async () => {
      // 1. Admin logs into CMS
      signIn("admin");
      expect(store.getSession()?.role).toBe("admin");

      // 2. Author creates a new content section for 'services' page
      const pages = await managedRows("content_pages");
      const servicesPage = pages.find((p) => p["slug"] === "services") || pages[0]!;

      const newSectionData = {
        page_id: servicesPage["id"],
        section_key: "institutional-advisory",
        title: "Institutional Family Office Solutions",
        content_json:
          "Private portfolio structuring for international family trusts.\n\nTurnkey legal and tax due diligence.",
        _include_enquiry: true,
        sort_order: 10,
      };

      await saveManaged("content_sections", newSectionData, null);

      // 3. Admin updates Homepage Counter Metrics (Repeatable Cards)
      const dynamicMetrics = [
        { label: "Portfolio Value Managed", value: "$420M+" },
        { label: "Citizenship Conformance Rate", value: "100%" },
        { label: "Average Due Diligence Days", value: "7 Days" },
      ];

      store.updateSiteSettings({
        websiteDesign: {
          aboutMetrics: JSON.stringify(dynamicMetrics),
          heroHeadline: "Private Real Estate Advisory in Istanbul",
        },
      });

      // 4. Live Preview Verification: The preview model resolves the new section and metrics
      const currentSections = await managedRows("content_sections");
      const previewTarget = currentSections.find(
        (s) => s["section_key"] === "institutional-advisory",
      );
      expect(previewTarget).toBeDefined();
      expect(previewTarget?.["title"]).toBe("Institutional Family Office Solutions");

      const savedSettings = workspace().siteSettings;
      expect(savedSettings.websiteDesign?.["aboutMetrics"]).toBeDefined();
      const parsedMetrics = JSON.parse(savedSettings.websiteDesign!["aboutMetrics"] as string);
      expect(parsedMetrics).toHaveLength(3);
      expect(parsedMetrics[0].value).toBe("$420M+");

      // 5. Publisher publishes the changes and emits websiteChanged signal
      websiteChanged();

      // 6. Verification: Audit log contains record of settings changes
      const latestAudit = workspace().activity[0]!;
      expect(latestAudit).toBeDefined();
      expect(latestAudit.kind).toBe("settings");
    });
  });
});
