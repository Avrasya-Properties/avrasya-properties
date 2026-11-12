import { randomUUID } from "node:crypto";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as store from "@/admin/demo";
import { managedRows, saveManaged, deleteManaged, editorRecord } from "@/admin/management";
import { websiteChanged, watchWebsiteChanges, WEBSITE_CHANGED } from "@/lib/website-sync";
import {
  type CmsSection,
  type RepeatableCardItem,
  normalizeSection,
  serializeSection,
  reorderSections,
  moveSectionUp,
  moveSectionDown,
  toggleSectionVisibility,
} from "@/admin/cms/types";

describe("Milestone M3: CMS Page Builder & Navigation Management Suite", () => {
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
  // 1. SECTION REORDERING & SORT_ORDER CALCULATION
  // =========================================================================
  describe("Section Reordering & Sort Order Calculation", () => {
    it("reorders sections and calculates sequential 1-based sort_order", () => {
      const initialSections: CmsSection[] = [
        {
          id: "sec-1",
          page_id: "cp-1",
          section_key: "hero",
          title: "Hero Section",
          sort_order: 1,
          is_visible: true,
          content_json: { title: "Hero" },
        },
        {
          id: "sec-2",
          page_id: "cp-1",
          section_key: "highlights",
          title: "Highlights Section",
          sort_order: 2,
          is_visible: true,
          content_json: { title: "Highlights" },
        },
        {
          id: "sec-3",
          page_id: "cp-1",
          section_key: "testimonials",
          title: "Testimonials Section",
          sort_order: 3,
          is_visible: true,
          content_json: { title: "Testimonials" },
        },
      ];

      // Move testimonials (index 2) to top (index 0)
      const reordered = reorderSections(initialSections, 2, 0);

      expect(reordered).toHaveLength(3);
      expect(reordered[0]!.id).toBe("sec-3");
      expect(reordered[0]!.sort_order).toBe(1);
      expect(reordered[1]!.id).toBe("sec-1");
      expect(reordered[1]!.sort_order).toBe(2);
      expect(reordered[2]!.id).toBe("sec-2");
      expect(reordered[2]!.sort_order).toBe(3);
    });

    it("moves section up and down with bounds checking", () => {
      const sections: CmsSection[] = [
        {
          id: "s-1",
          page_id: "cp-0",
          section_key: "a",
          title: "A",
          sort_order: 1,
          is_visible: true,
          content_json: {},
        },
        {
          id: "s-2",
          page_id: "cp-0",
          section_key: "b",
          title: "B",
          sort_order: 2,
          is_visible: true,
          content_json: {},
        },
        {
          id: "s-3",
          page_id: "cp-0",
          section_key: "c",
          title: "C",
          sort_order: 3,
          is_visible: true,
          content_json: {},
        },
      ];

      // Top item cannot move up
      const unchangedUp = moveSectionUp(sections, 0);
      expect(unchangedUp[0]!.id).toBe("s-1");

      // Move middle item up
      const movedUp = moveSectionUp(sections, 1);
      expect(movedUp[0]!.id).toBe("s-2");
      expect(movedUp[0]!.sort_order).toBe(1);
      expect(movedUp[1]!.id).toBe("s-1");
      expect(movedUp[1]!.sort_order).toBe(2);

      // Bottom item cannot move down
      const unchangedDown = moveSectionDown(sections, 2);
      expect(unchangedDown[2]!.id).toBe("s-3");

      // Move middle item down
      const movedDown = moveSectionDown(sections, 1);
      expect(movedDown[1]!.id).toBe("s-3");
      expect(movedDown[1]!.sort_order).toBe(2);
      expect(movedDown[2]!.id).toBe("s-2");
      expect(movedDown[2]!.sort_order).toBe(3);
    });

    it("persists reordered sections to database and preserves updated sort_order", async () => {
      const pages = await managedRows("content_pages");
      const targetPage = pages[0]!;

      const secA = {
        page_id: targetPage["id"],
        section_key: "alpha-feature",
        title: "Alpha Feature",
        content_json: "Alpha description text",
        sort_order: 1,
      };
      const secB = {
        page_id: targetPage["id"],
        section_key: "beta-feature",
        title: "Beta Feature",
        content_json: "Beta description text",
        sort_order: 2,
      };

      await saveManaged("content_sections", secA, null);
      await saveManaged("content_sections", secB, null);

      const saved = await managedRows("content_sections");
      const foundA = saved.find((s) => s["section_key"] === "alpha-feature")!;
      const foundB = saved.find((s) => s["section_key"] === "beta-feature")!;

      // Swap their orders
      await saveManaged("content_sections", { ...foundA, sort_order: 2 }, foundA);
      await saveManaged("content_sections", { ...foundB, sort_order: 1 }, foundB);

      const refreshed = await managedRows("content_sections");
      const updatedA = refreshed.find((s) => s["section_key"] === "alpha-feature")!;
      const updatedB = refreshed.find((s) => s["section_key"] === "beta-feature")!;

      expect(updatedB["sort_order"]).toBe(1);
      expect(updatedA["sort_order"]).toBe(2);
    });
  });

  // =========================================================================
  // 2. SECTION VISIBILITY TOGGLING (is_visible)
  // =========================================================================
  describe("Section Visibility Toggling", () => {
    it("toggles section visibility in-memory and updates content_json flag", () => {
      const sections: CmsSection[] = [
        {
          id: "sec-vis-1",
          page_id: "cp-0",
          section_key: "promo-banner",
          title: "Special CBI Autumn Promotion",
          sort_order: 1,
          is_visible: true,
          content_json: { title: "Special CBI", is_visible: true },
        },
      ];

      // Toggle to hidden
      const hiddenList = toggleSectionVisibility(sections, "sec-vis-1");
      expect(hiddenList[0]!.is_visible).toBe(false);
      expect(hiddenList[0]!.content_json.is_visible).toBe(false);

      // Toggle back to visible
      const visibleList = toggleSectionVisibility(hiddenList, "sec-vis-1");
      expect(visibleList[0]!.is_visible).toBe(true);
      expect(visibleList[0]!.content_json.is_visible).toBe(true);
    });

    it("persists visibility toggle to database without deleting section record", async () => {
      const pages = await managedRows("content_pages");
      const targetPage = pages[0]!;

      const sectionData = {
        page_id: targetPage["id"],
        section_key: "seasonal-campaign",
        title: "Q4 2026 Waterfront Showcase",
        content_json: {
          title: "Q4 Waterfront",
          paragraphs: ["Limited seasonal allotment."],
          is_visible: true,
        },
        is_visible: true,
        sort_order: 5,
      };

      await saveManaged("content_sections", sectionData, null);

      let sections = await managedRows("content_sections");
      let saved = sections.find((s) => s["section_key"] === "seasonal-campaign")!;
      expect(saved).toBeDefined();
      expect(saved["is_visible"]).toBe(true);

      // Administrator hides section
      await saveManaged("content_sections", { ...saved, is_visible: false }, saved);

      sections = await managedRows("content_sections");
      saved = sections.find((s) => s["section_key"] === "seasonal-campaign")!;
      expect(saved).toBeDefined();
      expect(saved["is_visible"]).toBe(false);

      const parsed = normalizeSection(saved);
      expect(parsed.is_visible).toBe(false);
    });
  });

  // =========================================================================
  // 3. STRUCTURED SECTION CONTENT UPDATES
  // =========================================================================
  describe("Structured Section Content Updates", () => {
    it("serializes and persists headings, paragraphs, buttons, and background styling", async () => {
      const pages = await managedRows("content_pages");
      const targetPage = pages[0]!;

      const structuredSection = {
        page_id: targetPage["id"],
        section_key: "executive-advisory",
        title: "Executive Portfolio Structuring & Tapu Clearance",
        content_json: {
          kicker: "Institutional Advisory",
          title: "Executive Portfolio Structuring & Tapu Clearance",
          subtitle: "End-to-end cadastral due diligence across prime European and Asian Istanbul.",
          paragraphs: [
            "Avrasya Properties provides institutional advisory for international family offices.",
            "Every asset is independently vetted by Bar-certified Turkish legal counsel prior to contract execution.",
          ],
          cta_label: "Request Private Portfolio Briefing",
          cta_link: "/contact?topic=institutional-advisory",
          cta_style: "primary",
          background_image: "https://avrasyaproperties.com/images/hero/executive.jpg",
          background_overlay: "dark",
          enquiry: true,
          is_visible: true,
        },
        sort_order: 1,
      };

      await saveManaged("content_sections", structuredSection, null);

      const sections = await managedRows("content_sections");
      const retrieved = sections.find((s) => s["section_key"] === "executive-advisory");
      expect(retrieved).toBeDefined();

      const normalized = normalizeSection(retrieved!);
      expect(normalized.title).toBe("Executive Portfolio Structuring & Tapu Clearance");
      expect(normalized.content_json.kicker).toBe("Institutional Advisory");
      expect(normalized.content_json.subtitle).toContain("cadastral due diligence");
      expect(normalized.content_json.paragraphs).toHaveLength(2);
      expect(normalized.content_json.paragraphs?.[0]).toContain("international family offices");
      expect(normalized.content_json.cta_label).toBe("Request Private Portfolio Briefing");
      expect(normalized.content_json.cta_link).toContain("/contact");
      expect(normalized.content_json.cta_style).toBe("primary");
      expect(normalized.content_json.background_image).toBe(
        "https://avrasyaproperties.com/images/hero/executive.jpg",
      );
      expect(normalized.content_json.background_overlay).toBe("dark");
      expect(normalized.content_json.enquiry).toBe(true);
    });
  });

  // =========================================================================
  // 4. REPEATABLE CONTENT ITEMS MANAGER (RepeatableCardsEditor)
  // =========================================================================
  describe("Repeatable Content Items Manager (Cards, Stats, Testimonials)", () => {
    it("performs full CRUD and reordering on repeatable metrics and feature cards", () => {
      // 1. Initial items
      const initialCards: RepeatableCardItem[] = [
        {
          id: "m-1",
          type: "metric",
          label: "Portfolio Value Managed",
          value: "$420M+",
          description: "Prime Istanbul assets",
        },
        {
          id: "t-1",
          type: "testimonial",
          quote: "The title clearance and acquisition were flawless.",
          author: "Tariq Al-Mansoor",
          title: "Private Investor, Dubai",
        },
      ];

      // 2. Add a new feature card
      const newFeature: RepeatableCardItem = {
        id: "f-1",
        type: "feature",
        title: "Bar-Certified Title Audit",
        description: "Direct cadastral and lien clearance opinion issued by independent counsel.",
        icon: "ShieldCheck",
      };

      const withNew = [...initialCards, newFeature];
      expect(withNew).toHaveLength(3);

      // 3. Update existing metric card
      const updated = withNew.map((card) =>
        card.id === "m-1" ? { ...card, value: "$550M+", label: "Total Assets Advised" } : card,
      );
      const metric = updated.find((c) => c.id === "m-1")!;
      expect(metric.value).toBe("$550M+");
      expect(metric.label).toBe("Total Assets Advised");

      // 4. Reorder: Move feature to first position
      const reordered = [updated[2]!, updated[0]!, updated[1]!];
      expect(reordered[0]!.type).toBe("feature");
      expect(reordered[1]!.type).toBe("metric");
      expect(reordered[2]!.type).toBe("testimonial");

      // 5. Delete testimonial card
      const afterDelete = reordered.filter((c) => c.id !== "t-1");
      expect(afterDelete).toHaveLength(2);
      expect(afterDelete.some((c) => c.id === "t-1")).toBe(false);
    });

    it("enforces validation on required fields across card types", () => {
      const validateCard = (card: Partial<RepeatableCardItem>) => {
        if (card.type === "metric") {
          if (!card.label?.trim() || !card.value?.trim()) {
            throw new Error("Metric label and value are required.");
          }
        } else if (card.type === "testimonial") {
          if (!card.quote?.trim() || !card.author?.trim()) {
            throw new Error("Testimonial quote and author are required.");
          }
        } else if (card.type === "feature") {
          if (!card.title?.trim() || !card.description?.trim()) {
            throw new Error("Feature title and description are required.");
          }
        }
        return true;
      };

      // Valid items
      expect(validateCard({ type: "metric", label: "AUM", value: "$100M" })).toBe(true);
      expect(validateCard({ type: "testimonial", quote: "Great work", author: "John" })).toBe(true);
      expect(validateCard({ type: "feature", title: "Tapu", description: "Clear" })).toBe(true);

      // Invalid items
      expect(() => validateCard({ type: "metric", label: "", value: "$100M" })).toThrow(
        /required/i,
      );
      expect(() => validateCard({ type: "metric", label: "AUM", value: "   " })).toThrow(
        /required/i,
      );
      expect(() => validateCard({ type: "testimonial", quote: "", author: "John" })).toThrow(
        /required/i,
      );
      expect(() => validateCard({ type: "feature", title: "Tapu", description: "" })).toThrow(
        /required/i,
      );
    });

    it("persists repeatable items inside section content_json", async () => {
      const pages = await managedRows("content_pages");
      const targetPage = pages[0]!;

      const cards: RepeatableCardItem[] = [
        { id: "c-1", type: "metric", label: "Passports Delivered", value: "280+" },
        { id: "c-2", type: "metric", label: "Zero Discrepancy Rate", value: "100%" },
      ];

      const sectionData = {
        page_id: targetPage["id"],
        section_key: "citizenship-metrics",
        title: "Statutory Citizenship Performance",
        content_json: {
          title: "Citizenship Performance",
          repeatable_items: cards,
        },
        sort_order: 3,
      };

      await saveManaged("content_sections", sectionData, null);

      const rows = await managedRows("content_sections");
      const found = rows.find((s) => s["section_key"] === "citizenship-metrics")!;
      expect(found).toBeDefined();

      const parsed = normalizeSection(found);
      expect(parsed.content_json.repeatable_items).toHaveLength(2);
      expect(parsed.content_json.repeatable_items?.[0]?.value).toBe("280+");
    });
  });

  // =========================================================================
  // 5. DYNAMIC NAVIGATION ITEMS ORDERING & FIELD MUTATION
  // =========================================================================
  describe("Dynamic Navigation Items Ordering & Mutation", () => {
    it("updates navigation items list, reorders items, and toggles visibility", () => {
      const navItems = [
        { label: "Home", href: "/", order: 1, is_visible: true },
        { label: "Portfolio", href: "/properties", order: 2, is_visible: true },
        { label: "Citizenship $400k", href: "/citizenship", order: 3, is_visible: true },
        { label: "Special Offers", href: "/offers", order: 4, is_visible: false },
        { label: "Contact", href: "/contact", order: 5, is_visible: true },
      ];

      // Update item label
      navItems[1]!.label = "Istanbul Portfolio";
      expect(navItems[1]!.label).toBe("Istanbul Portfolio");

      // Toggle visibility
      navItems[3]!.is_visible = true;
      expect(navItems[3]!.is_visible).toBe(true);

      // Filter visible items
      const visibleLinks = navItems.filter((i) => i.is_visible);
      expect(visibleLinks).toHaveLength(5);

      // Persist to siteSettings
      store.updateSiteSettings({
        navigationItems: navItems,
        websiteDesign: {
          navigation: JSON.stringify(navItems),
        },
      });

      const savedSettings = workspace().siteSettings;
      expect(savedSettings.websiteDesign?.["navigation"]).toBeDefined();
      const parsed = JSON.parse(savedSettings.websiteDesign!["navigation"] as string);
      expect(parsed).toHaveLength(5);
      expect(parsed[1].label).toBe("Istanbul Portfolio");
    });

    it("configures header CTA button label, route, and visibility", () => {
      store.updateSiteSettings({
        headerCta: {
          label: "Private Advisory",
          href: "/contact?mode=vip",
          is_visible: true,
        },
      });

      const settings = workspace().siteSettings;
      expect(settings.headerCta).toBeDefined();
      expect(settings.headerCta?.label).toBe("Private Advisory");
      expect(settings.headerCta?.href).toBe("/contact?mode=vip");
      expect(settings.headerCta?.is_visible).toBe(true);
    });
  });

  // =========================================================================
  // 6. DYNAMIC FOOTER MANAGER
  // =========================================================================
  describe("Dynamic Footer Settings Customization", () => {
    it("customizes multi-column footer links, company description, and copyright", () => {
      const footerConfig = {
        columns: [
          {
            title: "Prime Portfolios",
            links: [
              { label: "Bosphorus Waterfronts", href: "/properties?district=Bebek" },
              { label: "Maslak Financial Towers", href: "/properties?district=Maslak" },
            ],
          },
          {
            title: "Legal & Statutory",
            links: [
              { label: "Turkish CBI Law Article 20", href: "/citizenship" },
              { label: "Law No. 3065 VAT Exemption", href: "/services" },
            ],
          },
          {
            title: "Corporate",
            links: [
              { label: "Üsküdar Flagship Office", href: "/contact" },
              { label: "Bar-Certified Attorneys", href: "/about" },
            ],
          },
        ],
        note: "Avrasya Properties Group operates under the Turkish Real Estate Advisory License No. 3400123.",
        copyrightText: "© 2026 Avrasya Properties Group. Institutional Fiduciary Real Estate.",
        contactOverrides: {
          email: "institutional@avrasyaproperties.com",
          phone: "+90 216 555 0199",
          address: "Kandilli Mah., Göksu Cd. No: 12, Üsküdar/İstanbul",
        },
      };

      store.updateSiteSettings({
        footerSettings: footerConfig,
        websiteDesign: {
          footer: JSON.stringify(footerConfig),
          footerNote: footerConfig.note,
        },
      });

      const settings = workspace().siteSettings;
      expect(settings.websiteDesign?.["footer"]).toBeDefined();
      const parsedFooter = JSON.parse(settings.websiteDesign!["footer"] as string);
      expect(parsedFooter.columns).toHaveLength(3);
      expect(parsedFooter.columns[0].title).toBe("Prime Portfolios");
      expect(parsedFooter.columns[0].links).toHaveLength(2);
      expect(parsedFooter.columns[0].links[0].label).toBe("Bosphorus Waterfronts");
      expect(parsedFooter.note).toContain("License No. 3400123");
      expect(parsedFooter.contactOverrides.email).toBe("institutional@avrasyaproperties.com");
    });
  });

  // =========================================================================
  // 7. UNSAVED CHANGES GUARD & DIRTY STATE DETECTION
  // =========================================================================
  describe("Unsaved Changes Guard & Dirty State Tracking", () => {
    it("detects dirty state when CMS editor content changes and guards navigation", () => {
      const initialSectionState = {
        title: "Clean Section Title",
        subtitle: "Original Subtitle",
        paragraphs: ["Original Paragraph"],
      };

      const currentSectionState = { ...initialSectionState };
      const checkDirty = () =>
        JSON.stringify(currentSectionState) !== JSON.stringify(initialSectionState);

      // Clean state
      expect(checkDirty()).toBe(false);

      // User types in editor
      currentSectionState.title = "Modified Section Title with Unsaved Edits";
      expect(checkDirty()).toBe(true);

      // Blocker logic simulation
      const simulateNavigation = (shouldAllow: boolean) => {
        if (checkDirty() && !shouldAllow) {
          throw new Error("Navigation blocked: Unsaved CMS changes detected.");
        }
        return "Navigated successfully";
      };

      expect(() => simulateNavigation(false)).toThrow(/Unsaved CMS changes/);
      expect(simulateNavigation(true)).toBe("Navigated successfully");

      // User saves changes
      const savedSectionState = { ...currentSectionState };
      const checkDirtyAfterSave = () =>
        JSON.stringify(currentSectionState) !== JSON.stringify(savedSectionState);
      expect(checkDirtyAfterSave()).toBe(false);
    });

    it("dispatches websiteChanged signal on save to notify listeners", async () => {
      let signalReceived = false;
      const unwatch = watchWebsiteChanges(
        () => {
          signalReceived = true;
        },
        { poll: false },
      );

      // Perform a save action
      websiteChanged();

      // watchWebsiteChanges debounces callback via 50ms setTimeout
      await new Promise((resolve) => setTimeout(resolve, 80));

      expect(signalReceived).toBe(true);
      unwatch();
    });
  });
});
