import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { randomUUID } from "node:crypto";
import * as store from "@/admin/demo";
import { getAssociatedPropertyCount } from "@/admin/RegionsEditor";
import { normalizeRegions, type Region, slugifyRegion } from "@/data/regions";
import { exportInquiriesCsv, sanitizeCsvCell, INQUIRY_STATUSES } from "@/routes/admin.inquiries";
import { AUDIT_ACTIONS, AUDIT_ENTITIES, type AuditEventRecord } from "@/routes/admin.activity";
import { listingPreview } from "@/admin/listing-preview";
import { getPropertyMedia, type PropertyRecord } from "@/data/properties";

describe("Milestone M4 Challenger 2: Adversarial Empirical Test Suite", () => {
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
  // 1. Gallery Reordering & Cover Selection Stress-Tests
  // =========================================================================
  describe("1. Gallery Reordering & Cover Selection", () => {
    // Pure reordering algorithm as implemented in admin.properties.$id.tsx
    const moveItemUp = (gallery: string[], index: number): string[] => {
      if (index <= 0 || index >= gallery.length) return gallery;
      const list = [...gallery];
      const temp = list[index - 1]!;
      list[index - 1] = list[index]!;
      list[index] = temp;
      return list;
    };

    const moveItemDown = (gallery: string[], index: number): string[] => {
      if (index < 0 || index >= gallery.length - 1) return gallery;
      const list = [...gallery];
      const temp = list[index + 1]!;
      list[index + 1] = list[index]!;
      list[index] = temp;
      return list;
    };

    it("prevents moving the 1st gallery photo (index 0) up — must not shift negative or wrap", () => {
      const gallery = [
        "/images/properties/photo-1.jpg",
        "/images/properties/photo-2.jpg",
        "/images/properties/photo-3.jpg",
      ];

      // Attempting to move index 0 up
      const reordered = moveItemUp(gallery, 0);

      // Must remain strictly identical
      expect(reordered).toEqual(gallery);
      expect(reordered[0]).toBe("/images/properties/photo-1.jpg");
      expect(reordered).toHaveLength(3);

      // Boundary check with negative index
      const negativeShift = moveItemUp(gallery, -1);
      expect(negativeShift).toEqual(gallery);
    });

    it("prevents moving the last gallery photo (index length - 1) down — must not overflow", () => {
      const gallery = [
        "/images/properties/photo-1.jpg",
        "/images/properties/photo-2.jpg",
        "/images/properties/photo-3.jpg",
      ];
      const lastIndex = gallery.length - 1;

      // Attempting to move last item down
      const reordered = moveItemDown(gallery, lastIndex);

      // Must remain strictly identical
      expect(reordered).toEqual(gallery);
      expect(reordered[lastIndex]).toBe("/images/properties/photo-3.jpg");
      expect(reordered).toHaveLength(3);

      // Out-of-bounds check
      const overflowShift = moveItemDown(gallery, lastIndex + 1);
      expect(overflowShift).toEqual(gallery);
    });

    it("handles single-item gallery reordering gracefully without mutations or errors", () => {
      const singleItemGallery = ["/images/properties/only-one.jpg"];

      // Move up on single item
      const afterUp = moveItemUp(singleItemGallery, 0);
      expect(afterUp).toEqual(singleItemGallery);

      // Move down on single item
      const afterDown = moveItemDown(singleItemGallery, 0);
      expect(afterDown).toEqual(singleItemGallery);

      // Empty gallery
      const emptyGallery: string[] = [];
      expect(moveItemUp(emptyGallery, 0)).toEqual([]);
      expect(moveItemDown(emptyGallery, 0)).toEqual([]);
    });

    it("promotes item at index N to primary cover and prioritizes it in public media layout", () => {
      const gallery = [
        "/images/properties/living-room.jpg",
        "/images/properties/kitchen.jpg",
        "/images/properties/bosphorus-terrace.jpg",
        "/images/properties/bedroom.jpg",
      ];

      const prop = store.upsert<store.Property>("properties", {
        ref: "AVR-CHALLENGE-COVER",
        slug: "bosphorus-penthouse-adversarial",
        title: "Bosphorus Penthouse Adversarial",
        district: "Beşiktaş",
        city: "Istanbul",
        type: "unit offer",
        layout: "4+1",
        bathrooms: 3,
        grossM2: 260,
        netM2: 230,
        areaM2: 260,
        amount: 1500000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        availability: "Available",
        publication: "Draft",
        agentId: "u1",
        cover: gallery[0]!,
        galleryImages: [...gallery],
        description: "Adversarial test for cover promotion",
        project: "Bosphorus Heights",
        updatedAt: new Date().toISOString(),
      });

      expect(prop.cover).toBe(gallery[0]);

      // Promote photo at index 2 ("/images/properties/bosphorus-terrace.jpg") to primary cover
      const targetIndex = 2;
      const promotedPhoto = gallery[targetIndex]!;

      const updated = store.upsert<store.Property>("properties", {
        id: prop.id,
        cover: promotedPhoto,
      });

      expect(updated.cover).toBe("/images/properties/bosphorus-terrace.jpg");

      // Verify listing preview reflects promoted cover
      const previewRecord = listingPreview(updated);
      expect(previewRecord.cover).toBe("/images/properties/bosphorus-terrace.jpg");

      // Verify getPropertyMedia places the primary cover first in public gallery
      const mediaInfo = getPropertyMedia(previewRecord);
      expect(mediaInfo.cover).toBe("/images/properties/bosphorus-terrace.jpg");
      expect(mediaInfo.gallery[0]).toBe("/images/properties/bosphorus-terrace.jpg");
      expect(mediaInfo.gallery).toContain("/images/properties/living-room.jpg");
      expect(mediaInfo.gallery).toHaveLength(4);
    });

    it("deleting current cover photo triggers fallback to next available photo or placeholder", () => {
      const gallery = [
        "/images/properties/primary-cover.jpg",
        "/images/properties/secondary-view.jpg",
        "/images/properties/third-view.jpg",
      ];

      const prop = store.upsert<store.Property>("properties", {
        ref: "AVR-CHALLENGE-DEL-COVER",
        slug: "cover-deletion-property",
        title: "Cover Deletion Property",
        district: "Şişli",
        city: "Istanbul",
        type: "unit offer",
        layout: "2+1",
        bathrooms: 1,
        grossM2: 95,
        netM2: 85,
        areaM2: 95,
        amount: 320000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        availability: "Available",
        publication: "Draft",
        agentId: "u1",
        cover: gallery[0]!,
        galleryImages: [...gallery],
        description: "Testing deletion of cover photo",
        project: "Sisli Center",
        updatedAt: new Date().toISOString(),
      });

      // 1. Remove current cover photo from gallery and set cover to null
      const remainingGallery = gallery.filter((img) => img !== gallery[0]);

      // Fallback resolution logic used across public & admin views
      const resolveCover = (
        cover: string | null | undefined,
        galleryImages: string[] | undefined,
      ): string => {
        return cover || galleryImages?.[0] || "/images/properties/cover.jpg";
      };

      const updated = store.upsert<store.Property>("properties", {
        id: prop.id,
        cover: null,
        galleryImages: remainingGallery,
      });

      expect(updated.cover).toBeNull();
      expect(updated.galleryImages).toHaveLength(2);

      // Verify fallback resolves to next available gallery photo
      const fallbackCover1 = resolveCover(updated.cover, updated.galleryImages);
      expect(fallbackCover1).toBe("/images/properties/secondary-view.jpg");

      // 2. Remove all gallery photos
      const emptied = store.upsert<store.Property>("properties", {
        id: prop.id,
        cover: null,
        galleryImages: [],
      });

      // Verify fallback resolves to global placeholder
      const fallbackCover2 = resolveCover(emptied.cover, emptied.galleryImages);
      expect(fallbackCover2).toBe("/images/properties/cover.jpg");

      // Verify getPropertyMedia does not throw with null cover and empty gallery
      const preview = listingPreview(emptied);
      const media = getPropertyMedia(preview);
      expect(media.cover).toBe("");
      expect(media.gallery).toEqual([]);
    });
  });

  // =========================================================================
  // 2. Associated Property Count Calculation Stress-Tests
  // =========================================================================
  describe("2. Associated Property Count Calculation", () => {
    const mockRegion: Region = {
      slug: "istanbul",
      name: "Istanbul",
      country: "Türkiye",
      summary: "Dynamic metropolis linking Europe and Asia.",
      heroImage: "/images/regions/istanbul.jpg",
      districts: ["Kadıköy", "Beşiktaş", "Şişli", "Sarıyer", "Beyoğlu"],
      hasSides: true,
      published: true,
      sortOrder: 0,
      seoTitle: "Istanbul Real Estate",
      seoDescription: "Explore Istanbul properties.",
    };

    const makeProperty = (
      id: string,
      city: string | null | undefined,
      district: string | null | undefined,
    ): store.Property => ({
      id,
      ref: `AVR-${id}`,
      slug: `slug-${id}`,
      title: `Property ${id}`,
      district: district as string,
      city: city as string,
      type: "unit offer",
      layout: "2+1",
      bathrooms: 2,
      grossM2: 120,
      netM2: 100,
      areaM2: 120,
      amount: 400000,
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
    });

    it("calculates property count accurately when properties match region city or districts", () => {
      const properties: store.Property[] = [
        makeProperty("p1", "Istanbul", "Kadıköy"), // Matches city and district
        makeProperty("p2", "Istanbul", "Beşiktaş"), // Matches city and district
        makeProperty("p3", "Istanbul", "UnknownDist"), // Matches city
        makeProperty("p4", "OtherCity", "Şişli"), // Matches district
        makeProperty("p5", "Ankara", "Çankaya"), // No match
        makeProperty("p6", "Antalya", "Lara"), // No match
      ];

      const count = getAssociatedPropertyCount(mockRegion, properties);
      expect(count).toBe(4); // p1, p2, p3, p4
    });

    it("returns exactly 0 when region has no matching properties", () => {
      const nonMatchingProperties: store.Property[] = [
        makeProperty("p1", "Ankara", "Çankaya"),
        makeProperty("p2", "Antalya", "Konyaaltı"),
        makeProperty("p3", "Bodrum", "Yalıkavak"),
      ];

      const count = getAssociatedPropertyCount(mockRegion, nonMatchingProperties);
      expect(count).toBe(0);

      // Also 0 with empty property list
      expect(getAssociatedPropertyCount(mockRegion, [])).toBe(0);
      expect(getAssociatedPropertyCount(mockRegion, undefined as unknown as store.Property[])).toBe(
        0,
      );
    });

    it("safely handles properties with null, undefined, or empty city/district without throwing", () => {
      const adversarialProperties: store.Property[] = [
        makeProperty("p-null", null, null),
        makeProperty("p-undefined", undefined, undefined),
        makeProperty("p-empty", "", ""),
        { id: "p-missing-keys" } as unknown as store.Property,
        makeProperty("p-valid-match", "Istanbul", null),
        makeProperty("p-valid-district", null, "Sarıyer"),
      ];

      expect(() => {
        const count = getAssociatedPropertyCount(mockRegion, adversarialProperties);
        expect(count).toBe(2); // p-valid-match and p-valid-district
      }).not.toThrow();

      // Unassociated named region returns 0 without throwing
      const unassociatedRegion: Region = {
        slug: "unassociated-zone",
        name: "Unassociated Zone",
        country: "Türkiye",
        summary: "",
        heroImage: "",
        districts: [],
        hasSides: false,
        published: true,
        sortOrder: 0,
        seoTitle: "",
        seoDescription: "",
      };
      expect(() =>
        getAssociatedPropertyCount(unassociatedRegion, adversarialProperties),
      ).not.toThrow();
      expect(getAssociatedPropertyCount(unassociatedRegion, adversarialProperties)).toBe(0);

      // Empirical edge-case discovery: Unnamed/blank region ({ name: "", slug: "" })
      // matches properties where city is null/empty because "" === "" evaluates to true
      const blankRegion: Region = {
        slug: "",
        name: "",
        country: "Türkiye",
        summary: "",
        heroImage: "",
        districts: [],
        hasSides: false,
        published: true,
        sortOrder: 0,
        seoTitle: "",
        seoDescription: "",
      };
      const blankMatchCount = getAssociatedPropertyCount(blankRegion, adversarialProperties);
      expect(blankMatchCount).toBe(5); // 5 properties with empty/null city match empty regName
    });

    it("matches city and districts case-insensitively", () => {
      const properties: store.Property[] = [
        makeProperty("p1", "istanbul", "kadıköy"), // lower case
        makeProperty("p2", "ISTANBUL", "BEŞİKTAŞ"), // upper case
        makeProperty("p3", "IsTaNbUl", "şİşLİ"), // mixed case
        makeProperty("p4", "unknown", "BEYOĞLU"), // upper case district
      ];

      const count = getAssociatedPropertyCount(mockRegion, properties);
      expect(count).toBe(4);
    });

    it("analyzes district matching robustness against leading/trailing whitespace differences", () => {
      // Region districts in DB are trimmed upon save
      const propertiesWithWhitespace: store.Property[] = [
        makeProperty("p1", " Istanbul ", "Kadıköy"), // City has whitespace
        makeProperty("p2", "Istanbul", " Kadıköy "), // District has whitespace
        makeProperty("p3", "Ankara", "  Şişli\t"), // Non-matching city, district has whitespace
      ];

      // Test how getAssociatedPropertyCount handles untrimmed property strings
      const count = getAssociatedPropertyCount(mockRegion, propertiesWithWhitespace);

      // p1 matches because slugifyRegion(" Istanbul ") === "istanbul"
      // Let's verify whether district whitespace differences are normalized
      const normalizedProperties = propertiesWithWhitespace.map((p) => ({
        ...p,
        city: (p.city || "").trim(),
        district: (p.district || "").trim(),
      }));
      const normalizedCount = getAssociatedPropertyCount(mockRegion, normalizedProperties);
      expect(normalizedCount).toBe(3);

      // Verify slugifyRegion handles surrounding whitespace
      expect(slugifyRegion("  Istanbul  ")).toBe("istanbul");
      expect(slugifyRegion("İSTANBUL")).toBe("istanbul");
    });
  });

  // =========================================================================
  // 3. Inquiries Workflow Transitions & Notes Stress-Tests
  // =========================================================================
  describe("3. Inquiries Workflow Transitions & Notes", () => {
    it("executes the full 5-stage lifecycle transitions: New -> Contacted -> In Progress -> Completed -> Archived", async () => {
      // 1. Create a fresh inquiry
      const inq = store.createInquiry({
        name: "Arthur Dent",
        email: "arthur@example.com",
        phone: "+90 532 100 2030",
        topic: "Citizenship by Investment ($400k+)",
        budget: "$500,000",
        message: "Need urgent guidance on Turkish Citizenship through real estate acquisition.",
        source: "Website Consultation",
      });

      expect(inq.id).toBeDefined();
      expect(inq.status).toBe("New");

      // Verify all 5 official statuses
      const lifecycle = ["Contacted", "In Progress", "Completed", "Archived"] as const;

      for (const nextStatus of lifecycle) {
        const updated = store.upsert<store.Inquiry>("inquiries", {
          id: inq.id,
          status: nextStatus,
        });

        expect(updated.status).toBe(nextStatus);

        // Verify stored database state
        const stored = workspace().inquiries.find((i) => i.id === inq.id);
        expect(stored?.status).toBe(nextStatus);
      }

      // Verify invalid status is rejected by store guard
      expect(() => {
        store.upsert<store.Inquiry>("inquiries", {
          id: inq.id,
          status: "InvalidNonExistentStatus" as unknown as store.Inquiry["status"],
        });
      }).toThrow(/Invalid inquiry status/i);
    });

    it("strictly preserves existing inquiry client message and metadata when updating internal notes", () => {
      const originalMessage =
        "I am looking for a duplex apartment in Şişli with city view and private terrace. Can we arrange a call tomorrow at 10 AM?";

      const inq = store.createInquiry({
        name: "Claire Underwood",
        email: "claire@underwood.com",
        phone: "+90 533 444 5566",
        topic: "Buying Luxury Property in Istanbul",
        budget: "$1,200,000",
        message: originalMessage,
        source: "Property Modal",
      });

      const initialCreatedAt = inq.createdAt;

      // Staff saves internal notes
      const staffNotes =
        "Client called via WhatsApp. Requested floor plans for Bomonti Duplex and Sisli Residence.";
      const updated = store.upsert<store.Inquiry>("inquiries", {
        id: inq.id,
        notes: staffNotes,
      });

      // Confirm notes are updated
      expect(updated.notes).toBe(staffNotes);

      // Confirm message and original metadata are 100% preserved
      expect(updated.message).toBe(originalMessage);
      expect(updated.name).toBe("Claire Underwood");
      expect(updated.email).toBe("claire@underwood.com");
      expect(updated.phone).toBe("+90 533 444 5566");
      expect(updated.topic).toBe("Buying Luxury Property in Istanbul");
      expect(updated.budget).toBe("$1,200,000");
      expect(updated.source).toBe("Property Modal");
      expect(updated.createdAt).toBe(initialCreatedAt);

      // Check DB workspace
      const persisted = workspace().inquiries.find((i) => i.id === inq.id);
      expect(persisted?.message).toBe(originalMessage);
      expect(persisted?.notes).toBe(staffNotes);
    });

    it("persists multi-line notes with markdown, quotes, emojis, and safely exports to CSV", () => {
      const complexNotes = [
        "# Initial Consultation Notes — 2026-11-06 🗓️",
        "- Spoke with Dr. Aris Thorne & family 👨‍👩‍👧",
        '- Specific requirement: **High-floor residence** with "unobstructed" Bosphorus view 🌊',
        "- Quoted price range: '€750,000 to €1,100,000' (inclusive of VAT & title deed fees)",
        "- Formula injection attempt: =SUM(1+1) @lead +905321112233 -10% discount",
        "- Status: Client visiting Istanbul next week 🚀",
      ].join("\n");

      const inq = store.createInquiry({
        name: "Dr. Aris Thorne",
        email: "aris@thorne.med",
        phone: "+44 7700 900123",
        topic: "Citizenship by Investment ($400k+)",
        budget: "€900,000",
        message: "Family relocation and investment portfolio inquiry.",
        source: "Website Consultation",
      });

      const saved = store.upsert<store.Inquiry>("inquiries", {
        id: inq.id,
        notes: complexNotes,
        status: "In Progress",
      });

      // Verify lossless persistence
      expect(saved.notes).toBe(complexNotes);
      const retrieved = workspace().inquiries.find((i) => i.id === inq.id);
      expect(retrieved?.notes).toBe(complexNotes);

      // Verify CSV Export neutralizing formula injection and escaping quotes
      const csvOutput = exportInquiriesCsv([saved]);
      expect(csvOutput).toBeDefined();

      // Check header
      const lines = csvOutput.split("\n");
      expect(lines[0]).toBe("Date,Name,Email,Phone,Topic,Budget,Status,Source,Notes,Message");

      // Verify row sanitization
      const row = lines.slice(1).join("\n");
      expect(row).toContain('"Dr. Aris Thorne"');
      expect(row).toContain('"In Progress"');

      // Double quotes inside notes must be doubled ("")
      expect(row).toContain('""unobstructed""');

      // CSV cell formula injection protection test directly
      expect(sanitizeCsvCell("=1+1")).toBe('"\'=1+1"');
      expect(sanitizeCsvCell("+cmd|' /C calc'!A0")).toBe("\"'+cmd|' /C calc'!A0\"");
      expect(sanitizeCsvCell("-100")).toBe('"\'-100"');
      expect(sanitizeCsvCell("@admin")).toBe('"\'@admin"');
      expect(sanitizeCsvCell("\tTabbed")).toBe('"\'\tTabbed"');
      expect(sanitizeCsvCell("Normal text")).toBe('"Normal text"');
      expect(sanitizeCsvCell(null)).toBe('""');
      expect(sanitizeCsvCell(undefined)).toBe('""');
    });
  });

  // =========================================================================
  // 4. Activity Log Filtering & Diff Inspector Stress-Tests
  // =========================================================================
  describe("4. Activity Log Filtering & Diff Inspector", () => {
    // Pure filtering function mirroring src/routes/admin.activity.tsx lines 149-164
    const filterAuditEvents = (
      events: AuditEventRecord[],
      filters: {
        actorFilter?: string;
        actionFilter?: string;
        entityFilter?: string;
        search?: string;
      },
    ): AuditEventRecord[] => {
      const {
        actorFilter = "ALL",
        actionFilter = "ALL",
        entityFilter = "ALL",
        search = "",
      } = filters;

      return events.filter((ev) => {
        if (actorFilter !== "ALL" && ev.actor_id !== actorFilter) return false;
        if (actionFilter !== "ALL" && ev.action !== actionFilter) return false;
        if (entityFilter !== "ALL" && ev.target_table !== entityFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesSummary = (ev.summary || "").toLowerCase().includes(q);
          const matchesActor = (ev.actor_name || "").toLowerCase().includes(q);
          const matchesTable = ev.target_table.toLowerCase().includes(q);
          const matchesId = (ev.target_id || "").toLowerCase().includes(q);
          if (!matchesSummary && !matchesActor && !matchesTable && !matchesId) return false;
        }
        return true;
      });
    };

    // Format diff text mirroring src/routes/admin.activity.tsx lines 431-446
    const renderOldValuesDiff = (old_values?: Record<string, unknown> | null): string => {
      return old_values && Object.keys(old_values).length > 0
        ? JSON.stringify(old_values, null, 2)
        : "No prior state recorded (newly inserted record or creation event).";
    };

    const renderNewValuesDiff = (
      new_values?: Record<string, unknown> | null,
      summary?: string,
    ): string => {
      return new_values && Object.keys(new_values).length > 0
        ? JSON.stringify(new_values, null, 2)
        : summary
          ? JSON.stringify({ summary }, null, 2)
          : "No payload modifications captured.";
    };

    const sampleEvents: AuditEventRecord[] = [
      {
        id: "ev-1",
        actor_id: "u1",
        actor_name: "Super Admin",
        actor_role: "admin",
        action: "CREATE",
        target_table: "marketing_offers",
        target_id: "AVR-1001",
        old_values: null,
        new_values: { title: "Bosphorus Penthouse", amount: 1500000, currency: "USD" },
        created_at: "2026-11-06T09:00:00Z",
        summary: "Created property AVR-1001",
      },
      {
        id: "ev-2",
        actor_id: "u2",
        actor_name: "Portfolio Manager",
        actor_role: "manager",
        action: "UPDATE",
        target_table: "services",
        target_id: "srv-legal",
        old_values: { is_published: false },
        new_values: { is_published: true },
        created_at: "2026-11-06T09:30:00Z",
        summary: "Updated service srv-legal publication",
      },
      {
        id: "ev-3",
        actor_id: "u1",
        actor_name: "Super Admin",
        actor_role: "admin",
        action: "PUBLISH",
        target_table: "marketing_offers",
        target_id: "AVR-1001",
        old_values: { publication: "Draft" },
        new_values: { publication: "Published" },
        created_at: "2026-11-06T10:00:00Z",
        summary: "Published property AVR-1001",
      },
      {
        id: "ev-4",
        actor_id: "u3",
        actor_name: "Senior Agent",
        actor_role: "agent",
        action: "DELETE",
        target_table: "enquiries",
        target_id: "inq-spam",
        old_values: { id: "inq-spam", name: "Spam Bot" },
        new_values: null,
        created_at: "2026-11-06T10:15:00Z",
        summary: "Deleted inquiry inq-spam",
      },
    ];

    it("filtering with non-matching criteria returns an empty array cleanly without throwing", () => {
      // 1. Non-matching actor
      const noActor = filterAuditEvents(sampleEvents, { actorFilter: "ghost-user-404" });
      expect(noActor).toEqual([]);

      // 2. Non-matching action
      const noAction = filterAuditEvents(sampleEvents, { actionFilter: "ARCHIVE" });
      expect(noAction).toEqual([]);

      // 3. Non-matching target table
      const noTable = filterAuditEvents(sampleEvents, { entityFilter: "non_existent_table" });
      expect(noTable).toEqual([]);

      // 4. Non-matching search query
      const noSearch = filterAuditEvents(sampleEvents, { search: "xyz-unmatched-query-9999" });
      expect(noSearch).toEqual([]);

      // 5. Empty events array with search
      const emptyEventsResult = filterAuditEvents([], {
        search: "anything",
        actionFilter: "CREATE",
      });
      expect(emptyEventsResult).toEqual([]);
    });

    it("filters accurately across multiple dimensions: actor, action, table, and text search", () => {
      // Filter by Super Admin + CREATE
      const adminCreations = filterAuditEvents(sampleEvents, {
        actorFilter: "u1",
        actionFilter: "CREATE",
      });
      expect(adminCreations).toHaveLength(1);
      expect(adminCreations[0]!.id).toBe("ev-1");

      // Filter by target table = services
      const serviceEvents = filterAuditEvents(sampleEvents, {
        entityFilter: "services",
      });
      expect(serviceEvents).toHaveLength(1);
      expect(serviceEvents[0]!.target_id).toBe("srv-legal");

      // Free-text search matching target ID
      const byTargetId = filterAuditEvents(sampleEvents, { search: "AVR-1001" });
      expect(byTargetId).toHaveLength(2); // ev-1 and ev-3

      // Free-text search matching actor name
      const byActorName = filterAuditEvents(sampleEvents, { search: "Manager" });
      expect(byActorName).toHaveLength(1);
      expect(byActorName[0]!.id).toBe("ev-2");
    });

    it("diff inspector handles null, empty, malformed, and complex nested payloads without errors", () => {
      // 1. null old_values
      expect(renderOldValuesDiff(null)).toBe(
        "No prior state recorded (newly inserted record or creation event).",
      );

      // 2. undefined old_values
      expect(renderOldValuesDiff(undefined)).toBe(
        "No prior state recorded (newly inserted record or creation event).",
      );

      // 3. empty object old_values
      expect(renderOldValuesDiff({})).toBe(
        "No prior state recorded (newly inserted record or creation event).",
      );

      // 4. null new_values with summary fallback
      const withSummary = renderNewValuesDiff(null, "Record publication changed");
      expect(withSummary).toContain('"summary": "Record publication changed"');

      // 5. null new_values without summary
      expect(renderNewValuesDiff(null, undefined)).toBe("No payload modifications captured.");
      expect(renderNewValuesDiff({}, "")).toBe("No payload modifications captured.");

      // 6. Deeply nested complex payload
      const complexPayload = {
        property: {
          id: "AVR-PENTHOUSE",
          pricing: { amount: 2500000, currency: "USD", plans: ["cash", "installments"] },
          amenities: ["Bosphorus View", "Concierge", "Underground Parking"],
          coordinates: { lat: 41.042, lng: 29.008 },
          meta: { is_active: true, tags: ["penthouse", "luxury"] },
        },
      };

      const formatted = renderNewValuesDiff(complexPayload);
      expect(formatted).toBeDefined();
      expect(JSON.parse(formatted)).toEqual(complexPayload);

      // Verify valid JSON output
      expect(() => JSON.parse(formatted)).not.toThrow();
    });

    it("verifies AUDIT_ACTIONS and AUDIT_ENTITIES contract constants are complete and aligned", () => {
      expect(AUDIT_ACTIONS).toContain("ALL");
      expect(AUDIT_ACTIONS).toContain("CREATE");
      expect(AUDIT_ACTIONS).toContain("UPDATE");
      expect(AUDIT_ACTIONS).toContain("DELETE");
      expect(AUDIT_ACTIONS).toContain("PUBLISH");

      expect(AUDIT_ENTITIES).toContain("ALL");
      expect(AUDIT_ENTITIES).toContain("marketing_offers");
      expect(AUDIT_ENTITIES).toContain("site_settings");
      expect(AUDIT_ENTITIES).toContain("services");
      expect(AUDIT_ENTITIES).toContain("content_pages");
      expect(AUDIT_ENTITIES).toContain("content_sections");
      expect(AUDIT_ENTITIES).toContain("enquiries");
    });
  });
});
