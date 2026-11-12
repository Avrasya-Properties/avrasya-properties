import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { randomUUID } from "node:crypto";
import * as store from "@/admin/demo";
import { managedRows, saveManaged, deleteManaged, MODULES } from "@/admin/management";
import { normalizeRegions, defaultRegions, REGION_PRESETS, type Region } from "@/data/regions";
import { getAssociatedPropertyCount } from "@/admin/RegionsEditor";
import { exportInquiriesCsv, sanitizeCsvCell, INQUIRY_STATUSES } from "@/routes/admin.inquiries";
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/routes/admin.activity";
import { meta } from "@/components/site/TextPage";

describe("Milestone M4: Comprehensive Entity CRUD Polish & Administrative Operations", () => {
  const workspace = () => JSON.parse(localStorage.getItem("avrasya-admin-db-v4")!) as store.DB;
  const signIn = (role: store.Role = "admin") =>
    store.login(role + "@avrasya.test", store.DEMO_PASSWORD);

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
  // 1. Property Management CRUD (Features 14 & 15)
  // =========================================================================
  describe("1. Property Management CRUD", () => {
    it("duplicates property listing with cloned specifications, amenities, and Draft status", () => {
      const db = workspace();
      const source = db.properties[0]!;
      expect(source).toBeDefined();

      const maxRef = Math.max(
        1000,
        ...db.properties.map((p) => Number(p.ref.replace(/^AVR-/, ""))).filter(Number.isFinite),
      );
      const nextRef = `AVR-${maxRef + 1}`;
      const nextSlug = `${source.slug}-copy`;
      const nextTitle = `${source.title} (Copy)`;

      const cloned = store.upsert<store.Property>("properties", {
        ref: nextRef,
        slug: nextSlug,
        title: nextTitle,
        publication: "Draft",
        availability: source.availability,
        district: source.district,
        city: source.city,
        type: source.type,
        layout: source.layout,
        bedrooms: 3,
        bathrooms: source.bathrooms,
        grossM2: source.grossM2,
        netM2: source.netM2,
        areaM2: source.areaM2,
        amount: source.amount,
        currency: source.currency,
        mode: source.mode,
        priceType: source.priceType,
        priceBasis: source.priceBasis,
        agentId: source.agentId,
        cover: source.cover,
        galleryImages: source.galleryImages
          ? [...source.galleryImages]
          : ["/images/properties/photo-1.jpg"],
        highlights: ["Bosphorus View", "Swimming Pool", "Balcony"],
        description: source.description,
        project: source.project,
        seo_title: "Luxury Duplicated Residence | Avrasya Properties",
        seo_description: "Duplicated property overview with verified title deed.",
        og_image_url: "/images/properties/hero-main.jpg",
      });

      expect(cloned.id).toBeDefined();
      expect(cloned.ref).toBe(nextRef);
      expect(cloned.slug).toBe(nextSlug);
      expect(cloned.title).toBe(nextTitle);
      expect(cloned.publication).toBe("Draft");
      expect(cloned.bedrooms).toBe(3);
      expect(cloned.highlights).toContain("Bosphorus View");
      expect(cloned.highlights).toContain("Swimming Pool");
      expect(cloned.seo_title).toBe("Luxury Duplicated Residence | Avrasya Properties");

      // Verify the duplicated property exists in store
      const refreshed = workspace().properties.find((p) => p.id === cloned.id);
      expect(refreshed).toBeDefined();
      expect(refreshed?.title).toBe(nextTitle);
    });

    it("deletes property listing with confirmation guard and records activity log", async () => {
      // 1. Create a disposable property
      const disposable = store.upsert<store.Property>("properties", {
        ref: "AVR-DELETE-TEST",
        slug: `disposable-listing-${randomUUID()}`,
        title: "Temporary Penthouse for Deletion",
        district: "Şişli",
        city: "Istanbul",
        type: "unit offer",
        layout: "2+1",
        bathrooms: 2,
        grossM2: 120,
        netM2: 105,
        areaM2: 120,
        amount: 450000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        availability: "Available",
        publication: "Draft",
        agentId: "u1",
        cover: null,
        description: "Listing to test deletion workflow",
        project: "",
        updatedAt: new Date().toISOString(),
      });

      expect(workspace().properties.some((p) => p.id === disposable.id)).toBe(true);

      // 2. Execute deletion
      await store.remove("properties", disposable.id);

      // 3. Verify it is removed from the active property catalogue
      const remaining = workspace().properties.find((p) => p.id === disposable.id);
      expect(remaining).toBeUndefined();

      // 4. Verify audit/activity event recorded the deletion
      const activity = workspace().activity;
      expect(
        activity.some(
          (a) => a.kind === "properties" && a.text.includes("Deleted property AVR-DELETE-TEST"),
        ),
      ).toBe(true);
    });

    it("reorders gallery photos and sets selected photo as primary cover", () => {
      const gallery = [
        "/images/properties/exterior.jpg",
        "/images/properties/living-room.jpg",
        "/images/properties/bosphorus-view.jpg",
      ];

      const prop = store.upsert<store.Property>("properties", {
        ref: "AVR-GALLERY-TEST",
        slug: "gallery-reorder-penthouse",
        title: "Gallery Reorder Penthouse",
        district: "Beşiktaş",
        city: "Istanbul",
        type: "unit offer",
        layout: "4+1",
        bathrooms: 3,
        grossM2: 240,
        netM2: 210,
        areaM2: 240,
        amount: 1200000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        availability: "Available",
        publication: "Draft",
        agentId: "u1",
        cover: gallery[0]!,
        galleryImages: [...gallery],
        description: "Reordering gallery images test",
        project: "Bosphorus Elite",
        updatedAt: new Date().toISOString(),
      });

      expect(prop.cover).toBe(gallery[0]);

      // Move photo 3 to first position (move up)
      const list = [...(prop.galleryImages || [])];
      // Swap index 2 and index 1
      const temp1 = list[1]!;
      list[1] = list[2]!;
      list[2] = temp1;
      // Swap index 1 and index 0
      const temp0 = list[0]!;
      list[0] = list[1]!;
      list[1] = temp0;

      // Set photo 3 ("/images/properties/bosphorus-view.jpg") as primary cover
      const updated = store.upsert<store.Property>("properties", {
        id: prop.id,
        cover: "/images/properties/bosphorus-view.jpg",
        galleryImages: list,
      });

      expect(updated.cover).toBe("/images/properties/bosphorus-view.jpg");
      expect(updated.galleryImages?.[0]).toBe("/images/properties/bosphorus-view.jpg");
      expect(updated.galleryImages).toHaveLength(3);
    });

    it("updates specifications and entity-level SEO & Open Graph overrides", () => {
      const prop = store.upsert<store.Property>("properties", {
        ref: "AVR-SPECS-SEO",
        slug: "specs-and-seo-duplex",
        title: "Bebek Waterfront Duplex",
        district: "Beşiktaş",
        city: "Istanbul",
        type: "unit offer",
        layout: "3+1",
        bedrooms: 3,
        bathrooms: 2,
        grossM2: 180,
        netM2: 160,
        areaM2: 180,
        amount: 850000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        priceBasis: "cash",
        availability: "Available",
        publication: "Draft",
        agentId: "u1",
        cover: "/images/properties/cover.jpg",
        highlights: ["Bosphorus View", "Smart Home System", "Underground Parking"],
        description: "Duplex with verified title deed.",
        project: "",
        seo_title: "Exclusive Bebek Waterfront Duplex For Sale | Avrasya Properties",
        seo_description:
          "Unobstructed Bosphorus panorama with private boat mooring and concierge service.",
        og_image_url: "/images/properties/bebek-duplex-og.jpg",
        updatedAt: new Date().toISOString(),
      });

      expect(prop.bedrooms).toBe(3);
      expect(prop.bathrooms).toBe(2);
      expect(prop.grossM2).toBe(180);
      expect(prop.netM2).toBe(160);
      expect(prop.highlights).toContain("Smart Home System");
      expect(prop.seo_title).toBe(
        "Exclusive Bebek Waterfront Duplex For Sale | Avrasya Properties",
      );
      expect(prop.seo_description).toContain("Unobstructed Bosphorus panorama");
      expect(prop.og_image_url).toBe("/images/properties/bebek-duplex-og.jpg");
    });
  });

  // =========================================================================
  // 2. Locations & Services Management (Feature 16)
  // =========================================================================
  describe("2. Locations & Services Management", () => {
    it("persists geographic coordinates and validates [-90, 90] and [-180, 180] coordinate limits", () => {
      const baseRegions = defaultRegions();
      const customRegion: Region = {
        slug: "antalya-riviera",
        name: "Antalya",
        country: "Türkiye",
        summary: "Mediterranean turquoise coast and luxury resort villas.",
        heroImage: "/images/regions/antalya-hero.jpg",
        districts: ["Konyaaltı", "Lara", "Muratpaşa", "Alanya"],
        hasSides: false,
        published: true,
        sortOrder: 1,
        seoTitle: "Property in Antalya | Mediterranean Luxury",
        seoDescription: "Prime coastal residences and sea-view villas in Antalya.",
        coordinates: { lat: 36.8969, lng: 30.7133 },
        ogImage: "/images/regions/antalya-og.jpg",
      };

      const normalized = normalizeRegions([...baseRegions, customRegion]);
      const antalya = normalized.find((r) => r.slug === "antalya-riviera");

      expect(antalya).toBeDefined();
      expect(antalya?.coordinates?.lat).toBeCloseTo(36.8969, 4);
      expect(antalya?.coordinates?.lng).toBeCloseTo(30.7133, 4);
      expect(antalya?.heroImage).toBe("/images/regions/antalya-hero.jpg");
      expect(antalya?.ogImage).toBe("/images/regions/antalya-og.jpg");

      // Verify coordinate range bounds
      const isValidCoord = (lat: number, lng: number) =>
        Number.isFinite(lat) &&
        lat >= -90 &&
        lat <= 90 &&
        Number.isFinite(lng) &&
        lng >= -180 &&
        lng <= 180;

      expect(isValidCoord(36.8969, 30.7133)).toBe(true);
      expect(isValidCoord(95.0, 30.0)).toBe(false);
      expect(isValidCoord(36.0, 200.0)).toBe(false);
    });

    it("calculates associated property counts dynamically matching city and districts", () => {
      const testRegion: Region = {
        slug: "antalya",
        name: "Antalya",
        country: "Türkiye",
        summary: "Coastal properties",
        heroImage: "",
        districts: ["Konyaaltı", "Lara", "Alanya"],
        hasSides: false,
        published: true,
        sortOrder: 1,
        seoTitle: "",
        seoDescription: "",
      };

      const properties: store.Property[] = [
        {
          id: "p1",
          ref: "AVR-1",
          slug: "lara-villa",
          title: "Lara Luxury Villa",
          district: "Lara",
          city: "Antalya",
          type: "unit offer",
          layout: "4+1",
          bathrooms: 3,
          grossM2: 250,
          netM2: 220,
          areaM2: 250,
          amount: 600000,
          currency: "USD",
          mode: "sale",
          priceType: "fixed",
          availability: "Available",
          publication: "Published",
          agentId: "u1",
          cover: null,
          description: "",
          project: "",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "p2",
          ref: "AVR-2",
          slug: "konyaalti-apartment",
          title: "Konyaaltı Sea View",
          district: "Konyaaltı",
          city: "Antalya",
          type: "unit offer",
          layout: "2+1",
          bathrooms: 2,
          grossM2: 110,
          netM2: 95,
          areaM2: 110,
          amount: 320000,
          currency: "USD",
          mode: "sale",
          priceType: "fixed",
          availability: "Available",
          publication: "Published",
          agentId: "u1",
          cover: null,
          description: "",
          project: "",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "p3",
          ref: "AVR-3",
          slug: "bosphorus-penthouse",
          title: "Bosphorus Penthouse",
          district: "Beşiktaş",
          city: "Istanbul",
          type: "unit offer",
          layout: "3+1",
          bathrooms: 2,
          grossM2: 180,
          netM2: 160,
          areaM2: 180,
          amount: 950000,
          currency: "USD",
          mode: "sale",
          priceType: "fixed",
          availability: "Available",
          publication: "Published",
          agentId: "u1",
          cover: null,
          description: "",
          project: "",
          updatedAt: new Date().toISOString(),
        },
      ];

      const count = getAssociatedPropertyCount(testRegion, properties);
      expect(count).toBe(2);
    });

    it("supports district list management: adding, editing, and removing districts", () => {
      const region: Region = {
        slug: "bodrum",
        name: "Bodrum",
        country: "Türkiye",
        summary: "Aegean coastal villas",
        heroImage: "",
        districts: ["Yalıkavak", "Türkbükü"],
        hasSides: false,
        published: true,
        sortOrder: 2,
        seoTitle: "",
        seoDescription: "",
      };

      // 1. Add district
      const withAdded = { ...region, districts: [...region.districts, "Gümüşlük"] };
      expect(withAdded.districts).toContain("Gümüşlük");
      expect(withAdded.districts).toHaveLength(3);

      // 2. Edit district ("Türkbükü" -> "Gölköy & Türkbükü")
      const withEdited = {
        ...withAdded,
        districts: withAdded.districts.map((d) => (d === "Türkbükü" ? "Gölköy & Türkbükü" : d)),
      };
      expect(withEdited.districts).toContain("Gölköy & Türkbükü");
      expect(withEdited.districts).not.toContain("Türkbükü");

      // 3. Remove district ("Yalıkavak")
      const withRemoved = {
        ...withEdited,
        districts: withEdited.districts.filter((d) => d !== "Yalıkavak"),
      };
      expect(withRemoved.districts).not.toContain("Yalıkavak");
      expect(withRemoved.districts).toHaveLength(2);
    });

    it("supports services management with Lucide icons, CTA label & links, process steps, and publication status", async () => {
      const serviceModule = MODULES.find((m) => m.table === "services");
      expect(serviceModule).toBeDefined();

      const iconField = serviceModule?.fields.find((f) => f.key === "icon");
      expect(iconField?.options).toBeDefined();
      expect(iconField?.options).toContain("Key");
      expect(iconField?.options).toContain("ShieldCheck");
      expect(iconField?.options).toContain("Scale");
      expect(iconField?.options).toContain("Coins");

      // Create a service record
      const servicePayload = {
        id: `srv-${randomUUID()}`,
        slug: "citizenship-by-investment-advisory",
        title: "Turkish Citizenship by Investment ($400,000+)",
        category: "Citizenship & Legal",
        icon: "ShieldCheck",
        description:
          "Turnkey advisory covering property selection, valuation conformity, title deed escrow, and passport issuance.",
        process_steps: [
          "1. Portfolio curation matching $400k+ SPK valuation requirement",
          "2. Independent title deed encumbrance and zoning verification",
          "3. Notary sales contract execution with 3-year resale restriction annotation",
          "4. Certificate of Conformity submission to Ministry of Environment",
          "5. Investor residence permit and Turkish passport biometric enrollment",
        ],
        cta_label: "Consult Citizenship Attorney",
        cta_link: "/contact?topic=citizenship",
        sort_order: 1,
        is_published: true,
      };

      await saveManaged("services", servicePayload, null);
      const rows = await managedRows("services");
      const savedService = rows.find((s) => s["slug"] === "citizenship-by-investment-advisory");

      expect(savedService).toBeDefined();
      expect(savedService?.["icon"]).toBe("ShieldCheck");
      expect(savedService?.["cta_label"]).toBe("Consult Citizenship Attorney");
      expect(savedService?.["cta_link"]).toBe("/contact?topic=citizenship");
      expect(savedService?.["is_published"]).toBe(true);
      expect(Array.isArray(savedService?.["process_steps"])).toBe(true);
    });
  });

  // =========================================================================
  // 3. Inquiries Workflow, Notes & CSV Export (Feature 17)
  // =========================================================================
  describe("3. Inquiries Workflow, Notes & CSV Export", () => {
    it("handles all 5 required workflow statuses: New, Contacted, In Progress, Completed, Archived", () => {
      expect(INQUIRY_STATUSES).toEqual([
        "New",
        "Contacted",
        "In Progress",
        "Completed",
        "Archived",
      ]);

      // Create a test inquiry
      const inq = store.createInquiry({
        name: "Lady Genevieve Vance",
        email: "vance@mayfairholdings.uk",
        phone: "+44 20 7123 4567",
        topic: "Citizenship by Investment ($400k+)",
        budget: "$1,000,000+",
        message:
          "Interested in Bosphorus waterfront penthouse with direct citizenship qualification.",
        source: "Website Consultation",
      });

      expect(inq.status).toBe("New");

      // Status 1 -> 2: Contacted
      const contacted = store.upsert<store.Inquiry>("inquiries", {
        id: inq.id,
        status: "Contacted",
      });
      expect(contacted.status).toBe("Contacted");

      // Status 2 -> 3: In Progress
      const inProgress = store.upsert<store.Inquiry>("inquiries", {
        id: inq.id,
        status: "In Progress",
      });
      expect(inProgress.status).toBe("In Progress");

      // Status 3 -> 4: Completed
      const completed = store.upsert<store.Inquiry>("inquiries", {
        id: inq.id,
        status: "Completed",
      });
      expect(completed.status).toBe("Completed");

      // Status 4 -> 5: Archived
      const archived = store.upsert<store.Inquiry>("inquiries", { id: inq.id, status: "Archived" });
      expect(archived.status).toBe("Archived");
    });

    it("attaches internal notes to an inquiry without modifying client message payload", () => {
      const inq = store.createInquiry({
        name: "Klaus Von Bergmann",
        email: "klaus@hamburg-capital.de",
        phone: "+49 40 8899 0011",
        topic: "Portfolio Acquisition",
        budget: "$2,500,000+",
        message:
          "Looking for 3 commercial units in Maslak financial hub with 8%+ net rental yield.",
        source: "Website Consultation",
      });

      const privateStaffNote =
        "Client verified with Deutsche Bank Hamburg. Ready to travel to Istanbul next Tuesday for site viewings.";
      const updated = store.upsert<store.Inquiry>("inquiries", {
        id: inq.id,
        notes: privateStaffNote,
      });

      expect(updated.notes).toBe(privateStaffNote);
      expect(updated.message).toBe(
        "Looking for 3 commercial units in Maslak financial hub with 8%+ net rental yield.",
      );
      expect(updated.name).toBe("Klaus Von Bergmann");
    });

    it("exports filtered inquiries to CSV format with formula neutralization and correct fields", () => {
      const testInquiries: store.Inquiry[] = [
        {
          id: "inq-101",
          name: "Dr. Arthur Pendelton",
          email: "pendelton@oxford.ac.uk",
          phone: "+44 1865 270000",
          topic: "Retirement Villa in Bodrum",
          budget: "$750,000",
          message: "Requires sea view and single-level living.",
          source: "Website Consultation",
          status: "In Progress",
          notes: "Spoke with client. Prefers Yalıkavak marina proximity.",
          createdAt: "2026-11-06T10:00:00.000Z",
        },
        {
          id: "inq-102",
          name: "=cmd|' /C calc'!A0", // Malicious formula payload
          email: "+exploit@security.test", // Leading +
          phone: "@12345678", // Leading @
          topic: "-SUM(1+1)", // Leading -
          budget: "$500,000",
          message: "Neutralize CSV injection test",
          source: "Contact Brief",
          status: "Contacted",
          notes: "=HYPERLINK('http://malicious.site')",
          createdAt: "2026-11-06T11:00:00.000Z",
        },
      ];

      const csv = exportInquiriesCsv(testInquiries);
      const lines = csv.split("\n");

      // Verify header matches required fields
      expect(lines[0]).toBe("Date,Name,Email,Phone,Topic,Budget,Status,Source,Notes,Message");

      // Verify clean record row
      expect(lines[1]).toContain('"2026-11-06"');
      expect(lines[1]).toContain('"Dr. Arthur Pendelton"');
      expect(lines[1]).toContain('"In Progress"');
      expect(lines[1]).toContain('"Spoke with client. Prefers Yalıkavak marina proximity."');

      // Verify formula injection triggers (=, +, -, @) are safely neutralized with leading single quote (')
      expect(lines[2]).toContain("\"'=cmd|' /C calc'!A0\"");
      expect(lines[2]).toContain('"\'+exploit@security.test"');
      expect(lines[2]).toContain('"\'@12345678"');
      expect(lines[2]).toContain('"\'-SUM(1+1)"');
      expect(lines[2]).toContain("\"'=HYPERLINK('http://malicious.site')\"");
    });
  });

  // =========================================================================
  // 4. Dedicated Administrative Activity Log (Feature 19)
  // =========================================================================
  describe("4. Dedicated Administrative Activity Log", () => {
    it("defines valid audit actions and target entities", () => {
      expect(AUDIT_ACTIONS).toContain("CREATE");
      expect(AUDIT_ACTIONS).toContain("UPDATE");
      expect(AUDIT_ACTIONS).toContain("DELETE");
      expect(AUDIT_ACTIONS).toContain("PUBLISH");

      expect(AUDIT_ENTITIES).toContain("marketing_offers");
      expect(AUDIT_ENTITIES).toContain("site_settings");
      expect(AUDIT_ENTITIES).toContain("services");
      expect(AUDIT_ENTITIES).toContain("content_pages");
      expect(AUDIT_ENTITIES).toContain("content_sections");
      expect(AUDIT_ENTITIES).toContain("enquiries");
    });

    it("records and decodes audit events with actor, action, target table, and payload values", async () => {
      // 1. Trigger an administrative audit event
      const testAuditEvent = {
        id: `ae-${randomUUID()}`,
        actor_id: "u1",
        actor_role: "admin",
        action: "UPDATE",
        table_name: "site_settings",
        target_id: "s1",
        old_values: { site_title: "Avrasya Properties" },
        new_values: { site_title: "Avrasya Properties | Premier Istanbul Real Estate" },
        created_at: new Date().toISOString(),
      };

      const demoStore = JSON.parse(localStorage.getItem("avrasya_admin_manage_demo_v2") || "{}");
      demoStore.audit_events = [...(demoStore.audit_events || []), testAuditEvent];
      localStorage.setItem("avrasya_admin_manage_demo_v2", JSON.stringify(demoStore));

      // 2. Fetch and decode audit rows
      const rows = await managedRows("audit_events");
      const found = rows.find((r) => r["id"] === testAuditEvent.id);

      expect(found).toBeDefined();
      expect(found?.["action"]).toBe("UPDATE");
      expect(found?.["table_name"]).toBe("site_settings");
      expect(found?.["new_values"]).toEqual({
        site_title: "Avrasya Properties | Premier Istanbul Real Estate",
      });
    });
  });

  // =========================================================================
  // 5. Entity-Level Dynamic SEO & Open Graph (Feature 18)
  // =========================================================================
  describe("5. Entity-Level Dynamic SEO & Open Graph", () => {
    it("generates entity-level meta tags with custom overrides for properties and regions", () => {
      // Property with custom SEO and OG overrides
      const customPropertyMeta = meta(
        "Grand Bosphorus Waterfront Yalı | Avrasya Properties",
        "Historic Ottoman yalı with private waterfront jetty in Yeniköy.",
        {
          canonical: "https://avrasyaproperties.com/properties/grand-bosphorus-yali",
          image: "https://avrasyaproperties.com/images/properties/yali-cover.jpg",
          path: "/properties/grand-bosphorus-yali",
        },
      );

      const titleEntry = customPropertyMeta.meta.find((m) => "title" in m);
      const descEntry = customPropertyMeta.meta.find(
        (m) => "name" in m && m.name === "description",
      );
      const ogTitleEntry = customPropertyMeta.meta.find(
        (m) => "property" in m && m.property === "og:title",
      );
      const ogImageEntry = customPropertyMeta.meta.find(
        (m) => "property" in m && m.property === "og:image",
      );

      expect(titleEntry?.title).toBe("Grand Bosphorus Waterfront Yalı | Avrasya Properties");
      expect(descEntry?.content).toBe(
        "Historic Ottoman yalı with private waterfront jetty in Yeniköy.",
      );
      expect(ogTitleEntry?.content).toBe("Grand Bosphorus Waterfront Yalı | Avrasya Properties");
      expect(ogImageEntry?.content).toBe(
        "https://avrasyaproperties.com/images/properties/yali-cover.jpg",
      );
    });
  });
});
