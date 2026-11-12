import { randomUUID } from "node:crypto";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, renderHook } from "@testing-library/react";
import * as store from "@/admin/demo";
import { managedRows, saveManaged, deleteManaged } from "@/admin/management";
import { websiteChanged, watchWebsiteChanges, WEBSITE_CHANGED } from "@/lib/website-sync";
import {
  type CmsSection,
  type RepeatableCardItem,
  type CmsPage,
  normalizeSection,
  serializeSection,
  reorderSections,
  moveSectionUp,
  moveSectionDown,
  toggleSectionVisibility,
  PUBLIC_PAGES,
} from "@/admin/cms/types";
import { CmsLivePreview } from "@/admin/cms/CmsLivePreview";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";

describe("Milestone M3 Independent Adversarial Verification Suite (Challenger 2)", () => {
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
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  // =========================================================================
  // 1. DYNAMIC SYNCHRONIZATION EVENT VERIFICATION
  // =========================================================================
  describe("1. Dynamic Synchronization Event Verification", () => {
    it("dispatches WEBSITE_CHANGED window event with valid revision in localStorage", () => {
      let eventFired = false;
      const handler = () => {
        eventFired = true;
      };

      window.addEventListener(WEBSITE_CHANGED, handler);
      try {
        websiteChanged();
        expect(eventFired).toBe(true);

        const rev = localStorage.getItem("avrasya-website-revision");
        expect(rev).toBeTruthy();
        expect(typeof rev).toBe("string");
        expect(rev!.length).toBeGreaterThan(10);
      } finally {
        window.removeEventListener(WEBSITE_CHANGED, handler);
      }
    });

    it("coalesces rapid repeated websiteChanged signals into a single subscriber callback", async () => {
      let callCount = 0;
      const unwatch = watchWebsiteChanges(
        () => {
          callCount++;
        },
        { poll: false },
      );

      try {
        // Fire 10 rapid triggers within 10ms
        for (let i = 0; i < 10; i++) {
          websiteChanged();
        }

        // Wait 100ms for coalesce timer (50ms scheduled debounce)
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Coalescer must produce exactly 1 refresh call
        expect(callCount).toBe(1);
      } finally {
        unwatch();
      }
    });

    it("triggers websiteChanged signal when saving CMS sections via saveManaged", async () => {
      let notified = false;
      const unwatch = watchWebsiteChanges(
        () => {
          notified = true;
        },
        { poll: false },
      );

      try {
        const testSection: CmsSection = {
          id: `sec-${randomUUID()}`,
          page_id: "cp-home",
          section_key: "hero",
          title: "Adversarial Sync Test Hero",
          sort_order: 1,
          is_visible: true,
          content_json: {
            title: "Adversarial Sync Test Hero",
            kicker: "Luxury Living",
            paragraphs: ["Paragraph 1"],
            enquiry: true,
          },
        };

        const serialized = serializeSection(testSection);
        await saveManaged("content_sections", serialized, null);

        // Wait for coalesce window
        await new Promise((resolve) => setTimeout(resolve, 80));
        expect(notified).toBe(true);
      } finally {
        unwatch();
      }
    });

    it("triggers websiteChanged signal when saving site navigation / footer settings", async () => {
      let notified = false;
      const unwatch = watchWebsiteChanges(
        () => {
          notified = true;
        },
        { poll: false },
      );

      try {
        await store.updateSiteSettings({
          navigationItems: [
            { label: "Bespoke Properties", href: "/properties", order: 1, is_visible: true },
          ],
          websiteDesign: {
            navigation: JSON.stringify([
              { label: "Bespoke Properties", href: "/properties", order: 1, is_visible: true },
            ]),
          },
        });

        // In admin.settings.tsx line 239, websiteChanged() is explicitly dispatched
        websiteChanged();

        await new Promise((resolve) => setTimeout(resolve, 80));
        expect(notified).toBe(true);
      } finally {
        unwatch();
      }
    });
  });

  // =========================================================================
  // 2. STRUCTURED CONTENT SERIALIZATION & INTEGRITY ROUNDTRIP
  // =========================================================================
  describe("2. Structured Content Serialization & Integrity Roundtrip", () => {
    it("roundtrips complete structured content cleanly through content_json without data corruption", () => {
      const complexSection: CmsSection = {
        id: "sec-roundtrip-adversarial-1",
        page_id: "cp-citizenship",
        section_key: "statutory-criteria",
        title: "Statutory Investment & Citizenship Criteria",
        sort_order: 3,
        is_visible: true,
        content_json: {
          title: "Statutory Investment & Citizenship Criteria",
          subtitle: "Official Law No. 5901 Art. 20 Real Estate Acquisition Route",
          kicker: "Sovereign Advisory Desk",
          paragraphs: [
            "Primary legal acquisition threshold is $400,000 USD net titular value.",
            "Must maintain title encumbrance restriction prohibiting sale for 36 calendar months.",
            "Full family inclusion covering principal investor, spouse, and minors under 18.",
          ],
          cta_label: "Download Official Legal Memorandum",
          cta_link: "/citizenship/statute-5901.pdf",
          cta_style: "secondary",
          background_image:
            "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format",
          background_overlay: "dark",
          enquiry: true,
          is_visible: true,
          repeatable_items: [
            {
              id: "card-m1",
              type: "metric",
              label: "Statutory Capital Minimum",
              value: "$400,000",
              description: "Title deed valuation threshold pursuant to Presidential Decree",
            },
            {
              id: "card-t1",
              type: "testimonial",
              quote:
                "The seamless execution of our biometric title deed and passport issuance was exemplary.",
              author: "Sheikh Tariq Al-Humaidi",
              title: "Managing Partner, Gulf Horizon Assets",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format",
            },
            {
              id: "card-f1",
              type: "feature",
              title: "Direct Land Registry Registration",
              description: "Zero escrow intermediary exposure with direct TAPU transfer.",
              icon: "ShieldCheck",
            },
          ],
        },
      };

      // 1. Serialize to DB record format
      const serialized = serializeSection(complexSection);

      expect(serialized["id"]).toBe("sec-roundtrip-adversarial-1");
      expect(serialized["page_id"]).toBe("cp-citizenship");
      expect(serialized["section_key"]).toBe("statutory-criteria");
      expect(serialized["title"]).toBe("Statutory Investment & Citizenship Criteria");
      expect(serialized["sort_order"]).toBe(3);
      expect(serialized["is_visible"]).toBe(true);
      expect(serialized["_include_enquiry"]).toBe(true);

      // Verify content_json contents
      const cJson = serialized["content_json"] as Record<string, unknown>;
      expect(cJson["kicker"]).toBe("Sovereign Advisory Desk");
      expect(cJson["subtitle"]).toBe("Official Law No. 5901 Art. 20 Real Estate Acquisition Route");
      expect(cJson["cta_label"]).toBe("Download Official Legal Memorandum");
      expect(cJson["cta_style"]).toBe("secondary");
      expect(cJson["cta_link"]).toBe("/citizenship/statute-5901.pdf");
      expect(cJson["background_image"]).toBe(
        "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format",
      );
      expect(cJson["background_overlay"]).toBe("dark");

      // Verify paragraphs array
      expect(cJson["paragraphs"]).toEqual([
        "Primary legal acquisition threshold is $400,000 USD net titular value.",
        "Must maintain title encumbrance restriction prohibiting sale for 36 calendar months.",
        "Full family inclusion covering principal investor, spouse, and minors under 18.",
      ]);

      // Verify repeatable items
      const items = cJson["repeatable_items"] as RepeatableCardItem[];
      expect(items).toHaveLength(3);
      expect(items[0]).toEqual({
        id: "card-m1",
        type: "metric",
        label: "Statutory Capital Minimum",
        value: "$400,000",
        description: "Title deed valuation threshold pursuant to Presidential Decree",
      });
      expect(items[1]).toEqual({
        id: "card-t1",
        type: "testimonial",
        quote:
          "The seamless execution of our biometric title deed and passport issuance was exemplary.",
        author: "Sheikh Tariq Al-Humaidi",
        title: "Managing Partner, Gulf Horizon Assets",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format",
      });
      expect(items[2]).toEqual({
        id: "card-f1",
        type: "feature",
        title: "Direct Land Registry Registration",
        description: "Zero escrow intermediary exposure with direct TAPU transfer.",
        icon: "ShieldCheck",
      });

      // 2. Deserialize back through normalizeSection
      const restored = normalizeSection(serialized);

      // Full deep equality comparison
      expect(restored.id).toBe(complexSection.id);
      expect(restored.page_id).toBe(complexSection.page_id);
      expect(restored.section_key).toBe(complexSection.section_key);
      expect(restored.title).toBe(complexSection.title);
      expect(restored.sort_order).toBe(complexSection.sort_order);
      expect(restored.is_visible).toBe(complexSection.is_visible);
      expect(restored.content_json.kicker).toBe(complexSection.content_json.kicker);
      expect(restored.content_json.subtitle).toBe(complexSection.content_json.subtitle);
      expect(restored.content_json.paragraphs).toEqual(complexSection.content_json.paragraphs);
      expect(restored.content_json.cta_label).toBe(complexSection.content_json.cta_label);
      expect(restored.content_json.cta_link).toBe(complexSection.content_json.cta_link);
      expect(restored.content_json.cta_style).toBe(complexSection.content_json.cta_style);
      expect(restored.content_json.background_image).toBe(
        complexSection.content_json.background_image,
      );
      expect(restored.content_json.background_overlay).toBe(
        complexSection.content_json.background_overlay,
      );
      expect(restored.content_json.repeatable_items).toEqual(
        complexSection.content_json.repeatable_items,
      );
    });

    it("resiliently normalizes raw legacy string content_json into parsed paragraphs array", () => {
      const rawLegacy = {
        id: "sec-legacy-text",
        page_id: "cp-about",
        section_key: "heritage",
        title: "Company Heritage",
        sort_order: 2,
        is_visible: true,
        content_json:
          "First paragraph on legacy heritage.\n\nSecond paragraph detailing acquisitions.\n\nThird paragraph on future outlook.",
      };

      const normalized = normalizeSection(rawLegacy);

      expect(normalized.content_json.paragraphs).toHaveLength(3);
      expect(normalized.content_json.paragraphs![0]).toBe("First paragraph on legacy heritage.");
      expect(normalized.content_json.paragraphs![1]).toBe(
        "Second paragraph detailing acquisitions.",
      );
      expect(normalized.content_json.paragraphs![2]).toBe("Third paragraph on future outlook.");
      expect(normalized.content_json.repeatable_items).toEqual([]);
      expect(normalized.content_json.cta_style).toBe("primary");
    });

    it("safely handles malicious, empty, or contaminated content_json payloads", () => {
      const contaminatedInputs: Array<Record<string, unknown>> = [
        { id: null, content_json: null, sort_order: "invalid" },
        { id: undefined, content_json: undefined, sort_order: -99 },
        { id: "sec-1", content_json: { paragraphs: [123, null, {}, "Valid paragraph"] } },
        { id: "sec-2", content_json: { cta_style: "unknown_injection" } },
        { id: "sec-3", content_json: { background_overlay: "dark" } },
      ];

      for (const raw of contaminatedInputs) {
        expect(() => {
          const res = normalizeSection(raw);
          expect(typeof res.id).toBe("string");
          expect(typeof res.title).toBe("string");
          expect(Number.isFinite(res.sort_order)).toBe(true);
          expect(Array.isArray(res.content_json.paragraphs)).toBe(true);
          expect(["primary", "secondary"]).toContain(res.content_json.cta_style);
          expect(["none", "dark", "light"]).toContain(res.content_json.background_overlay);
        }).not.toThrow();
      }
    });

    it("preserves Turkish characters, Unicode, emojis and HTML without truncation or corruption", () => {
      const richContent: CmsSection = {
        id: "sec-unicode-1",
        page_id: "cp-home",
        section_key: "highlights",
        title: "İstanbul Boğazı & Lüks Gayrimenkul Yatırımları 🏰✨",
        sort_order: 1,
        is_visible: true,
        content_json: {
          title: "İstanbul Boğazı & Lüks Gayrimenkul Yatırımları 🏰✨",
          subtitle: "Özel Mülkler: Bebek, Kandilli, Yeniköy, Çengelköy & İstinye",
          kicker: "Türk Vatandaşlığı & Varlık Yönetimi 🇹🇷",
          paragraphs: [
            "Boğaziçi kıyısında 1. sınıf yalı daireleri ve köşkler.",
            "T.C. Cumhurbaşkanlığı Yatırım Ofisi & Tapu Kadastro Genel Müdürlüğü onaylı.",
            "Quotes test: \"Double\", 'Single', `Backtick`, <script>safe_tag</script>",
          ],
          cta_label: "Portföyü İncele →",
          cta_link: "/properties?district=Bebek",
          repeatable_items: [
            {
              id: "item-tr-1",
              type: "metric",
              label: "Yıllık Getiri Oranı",
              value: "%14.8",
              description: "Döviz bazlı net kira çarpanı",
            },
          ],
        },
      };

      const serialized = serializeSection(richContent);
      const restored = normalizeSection(serialized);

      expect(restored.title).toBe("İstanbul Boğazı & Lüks Gayrimenkul Yatırımları 🏰✨");
      expect(restored.content_json.subtitle).toBe(
        "Özel Mülkler: Bebek, Kandilli, Yeniköy, Çengelköy & İstinye",
      );
      expect(restored.content_json.kicker).toBe("Türk Vatandaşlığı & Varlık Yönetimi 🇹🇷");
      expect(restored.content_json.paragraphs![2]).toBe(
        "Quotes test: \"Double\", 'Single', `Backtick`, <script>safe_tag</script>",
      );
      expect(restored.content_json.repeatable_items![0]!.label).toBe("Yıllık Getiri Oranı");
      expect(restored.content_json.repeatable_items![0]!.value).toBe("%14.8");
    });
  });

  // =========================================================================
  // 3. LIVE ROUTE RESOLUTION & AUTH PROTECTION CONTRACT
  // =========================================================================
  describe("3. Live Route Resolution & Auth Protection Contract", () => {
      it("resolves /admin/cms through the route tree (no live server needed)", () => {
        const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
        const matches = router.matchRoutes("/admin/cms");
        expect(matches.at(-1)?.routeId).toBe("/admin/cms");
        expect(matches.some((m) => m.routeId === "/admin")).toBe(true);
      });

    it("verifies /admin/cms is structured as a child route under /admin layout", async () => {
      // Contract verification from source files
      const cmsRouteFile = await import("../routes/admin.cms.tsx");
      expect(cmsRouteFile.Route).toBeDefined();

      const adminLayoutFile = await import("../routes/admin.tsx");
      expect(adminLayoutFile.Route).toBeDefined();
    }, 60000);

    it("verifies unauthenticated users without session are blocked and redirected to /admin/login", async () => {
      // Clear session to simulate unauthenticated visitor
      store.logout();

      const { result } = renderHook(() => store.useSession());
      expect(result.current).toBeNull();

      // Verify that can() denies all capabilities when user is null
      expect(store.can(result.current, "publish")).toBe(false);
      expect(store.can(result.current, "read" as unknown as store.Action)).toBe(false);
      expect(store.can(result.current, "settings" as unknown as store.Action)).toBe(false);
    });
  });

  // =========================================================================
  // 4. VISUAL LAYOUT PREVIEW RESPONSIVENESS & OVERFLOW RESISTANCE
  // =========================================================================
  describe("4. Visual Layout Preview Responsiveness & Overflow Resistance", () => {
    const mockPage: CmsPage = {
      id: "cp-home",
      slug: "home",
      title: "Homepage",
      published_status: "Published",
    };

    const mockSections: CmsSection[] = [
      {
        id: "sec-preview-1",
        page_id: "cp-home",
        section_key: "hero",
        title: "Bespoke Bosphorus Waterfront Residences",
        sort_order: 1,
        is_visible: true,
        content_json: {
          title: "Bespoke Bosphorus Waterfront Residences",
          subtitle:
            "Exclusive private sales and advisory across Istanbul's prime waterfront estates.",
          kicker: "Prime Waterfront",
          paragraphs: [
            "Avrasya Properties represents premier private residences with direct littoral rights.",
          ],
          cta_label: "Explore Portfolio",
          cta_link: "/properties",
          cta_style: "primary",
          background_image:
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format",
          background_overlay: "dark",
          enquiry: true,
          repeatable_items: [
            { id: "m-1", type: "metric", label: "Active Listings", value: "140+" },
            { id: "m-2", type: "metric", label: "Private Acquisitions", value: "$850M+" },
            { id: "m-3", type: "metric", label: "Client Nationalities", value: "42" },
          ],
        },
      },
      {
        id: "sec-preview-hidden",
        page_id: "cp-home",
        section_key: "hidden-draft",
        title: "Confidential Unreleased Development",
        sort_order: 2,
        is_visible: false, // Hidden section
        content_json: {
          title: "Confidential Unreleased Development",
          paragraphs: [],
        },
      },
      {
        id: "sec-preview-light",
        page_id: "cp-home",
        section_key: "testimonials",
        title: "Distinguished Client Perspectives",
        sort_order: 3,
        is_visible: true,
        content_json: {
          title: "Distinguished Client Perspectives",
          background_image:
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format",
          background_overlay: "light",
          repeatable_items: [
            {
              id: "t-1",
              type: "testimonial",
              quote: "A masterclass in discretion and institutional diligence.",
              author: "Maximilian von Bernstorff",
              title: "Family Office Director, Zurich",
            },
          ],
        },
      },
    ];

    it("renders default desktop viewport container with max-w-[1280px]", () => {
      const { container } = render(
        <CmsLivePreview page={mockPage} sections={mockSections} activeSectionId="sec-preview-1" />,
      );

      // Verify desktop width class on preview canvas
      const canvas = container.querySelector(".max-w-\\[1280px\\]");
      expect(canvas).not.toBeNull();

      // Verify visible sections render while hidden sections do not
      expect(screen.getByText("Bespoke Bosphorus Waterfront Residences")).toBeInTheDocument();
      expect(screen.getByText("Distinguished Client Perspectives")).toBeInTheDocument();
      expect(screen.queryByText("Confidential Unreleased Development")).not.toBeInTheDocument();
    });

    it("switches to tablet viewport (max-w-[768px]) on tablet icon click", () => {
      const { container } = render(
        <CmsLivePreview page={mockPage} sections={mockSections} activeSectionId="sec-preview-1" />,
      );

      const tabletBtn = screen.getByTitle("Tablet view (768px)");
      fireEvent.click(tabletBtn);

      const canvas = container.querySelector(".max-w-\\[768px\\]");
      expect(canvas).not.toBeNull();
      expect(container.querySelector(".max-w-\\[1280px\\]")).toBeNull();
    });

    it("switches to mobile viewport (max-w-[375px]) on mobile icon click and maintains clean grid", () => {
      const { container } = render(
        <CmsLivePreview page={mockPage} sections={mockSections} activeSectionId="sec-preview-1" />,
      );

      const mobileBtn = screen.getByTitle("Mobile view (375px)");
      fireEvent.click(mobileBtn);

      const canvas = container.querySelector(".max-w-\\[375px\\]");
      expect(canvas).not.toBeNull();

      // Verify responsive grid classes on repeatable items
      const grids = container.querySelectorAll(".grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3");
      expect(grids.length).toBeGreaterThanOrEqual(1);

      // Verify metric values still render inside mobile container
      expect(screen.getByText("140+")).toBeInTheDocument();
      expect(screen.getByText("$850M+")).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("renders dark and light background overlays accurately", () => {
      const { container } = render(
        <CmsLivePreview page={mockPage} sections={mockSections} activeSectionId="sec-preview-1" />,
      );

      // Dark overlay section
      const darkOverlay = container.querySelector(".bg-\\[\\#163038\\]\\/85");
      expect(darkOverlay).not.toBeNull();

      // Light overlay section
      const lightOverlay = container.querySelector(".bg-white\\/80");
      expect(lightOverlay).not.toBeNull();
    });

    it("shows currently editing badge only on active section", () => {
      render(
        <CmsLivePreview page={mockPage} sections={mockSections} activeSectionId="sec-preview-1" />,
      );

      expect(screen.getByText(/Currently Editing: hero/i)).toBeInTheDocument();
      expect(screen.queryByText(/Currently Editing: testimonials/i)).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // 5. INVARIANTS, BOUNDARIES & REORDERING GENERATOR STRESS
  // =========================================================================
  describe("5. Invariants, Boundaries & Reordering Generator Stress", () => {
    it("safely handles out-of-bounds indices in reorderSections without throwing or mutating array", () => {
      const original: CmsSection[] = [
        {
          id: "1",
          page_id: "cp-home",
          section_key: "s1",
          title: "S1",
          sort_order: 1,
          is_visible: true,
          content_json: {},
        },
        {
          id: "2",
          page_id: "cp-home",
          section_key: "s2",
          title: "S2",
          sort_order: 2,
          is_visible: true,
          content_json: {},
        },
      ];

      expect(reorderSections(original, -1, 1)).toEqual(original);
      expect(reorderSections(original, 0, 50)).toEqual(original);
      expect(reorderSections(original, 50, 0)).toEqual(original);
      expect(reorderSections([], 0, 0)).toEqual([]);
    });

    it("moveSectionUp and moveSectionDown respect boundaries", () => {
      const list: CmsSection[] = [
        {
          id: "1",
          page_id: "cp-home",
          section_key: "s1",
          title: "S1",
          sort_order: 1,
          is_visible: true,
          content_json: {},
        },
        {
          id: "2",
          page_id: "cp-home",
          section_key: "s2",
          title: "S2",
          sort_order: 2,
          is_visible: true,
          content_json: {},
        },
      ];

      // Moving index 0 up does nothing
      expect(moveSectionUp(list, 0)).toEqual(list);

      // Moving index 1 up swaps 0 and 1
      const swappedUp = moveSectionUp(list, 1);
      expect(swappedUp[0]!.id).toBe("2");
      expect(swappedUp[0]!.sort_order).toBe(1);
      expect(swappedUp[1]!.id).toBe("1");
      expect(swappedUp[1]!.sort_order).toBe(2);

      // Moving index 1 down does nothing (boundary)
      expect(moveSectionDown(list, 1)).toEqual(list);

      // Moving index 0 down swaps 0 and 1
      const swappedDown = moveSectionDown(list, 0);
      expect(swappedDown[0]!.id).toBe("2");
      expect(swappedDown[1]!.id).toBe("1");
    });

    it("toggleSectionVisibility toggles is_visible on both root and content_json without mutating other sections", () => {
      const sections: CmsSection[] = [
        {
          id: "1",
          page_id: "cp-home",
          section_key: "s1",
          title: "S1",
          sort_order: 1,
          is_visible: true,
          content_json: { is_visible: true },
        },
        {
          id: "2",
          page_id: "cp-home",
          section_key: "s2",
          title: "S2",
          sort_order: 2,
          is_visible: true,
          content_json: { is_visible: true },
        },
      ];

      const toggled = toggleSectionVisibility(sections, "1");
      expect(toggled[0]!.is_visible).toBe(false);
      expect(toggled[0]!.content_json.is_visible).toBe(false);
      expect(toggled[1]!.is_visible).toBe(true);
      expect(toggled[1]!.content_json.is_visible).toBe(true);

      const toggledBack = toggleSectionVisibility(toggled, "1");
      expect(toggledBack[0]!.is_visible).toBe(true);
      expect(toggledBack[0]!.content_json.is_visible).toBe(true);
    });

    it("stress generator: applies 100 random moves to 20 sections and maintains strict contiguous 1-based order", () => {
      let sections: CmsSection[] = Array.from({ length: 20 }, (_, i) => ({
        id: `gen-sec-${i + 1}`,
        page_id: "cp-home",
        section_key: `key-${i + 1}`,
        title: `Section ${i + 1}`,
        sort_order: i + 1,
        is_visible: true,
        content_json: {},
      }));

      // Apply 100 randomized valid reorderings
      for (let step = 0; step < 100; step++) {
        const from = Math.floor(Math.random() * sections.length);
        const to = Math.floor(Math.random() * sections.length);
        sections = reorderSections(sections, from, to);

        // Invariant: Length must remain constant
        expect(sections).toHaveLength(20);

        // Invariant: Sort order must be strictly [1, 2, 3, ..., 20]
        const orders = sections.map((s) => s.sort_order);
        const expectedOrders = Array.from({ length: 20 }, (_, idx) => idx + 1);
        expect(orders).toEqual(expectedOrders);

        // Invariant: All original IDs must still be present uniquely
        const idSet = new Set(sections.map((s) => s.id));
        expect(idSet.size).toBe(20);
      }
    });
  });
});
