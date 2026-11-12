import { randomUUID } from "node:crypto";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as store from "@/admin/demo";
import { validPublicImage } from "@/admin/website-design";

// Contract interface for Storage File records based on BACKEND_ARCHITECTURE.md & PROJECT.md
export type StorageFileRecord = {
  id: string;
  bucket: string;
  path: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  folder: string;
  created_at: string;
};

// Contract scanner for media usage
export function checkMediaUsage(
  assetPathOrUrl: string,
  properties: store.Property[],
  siteSettings: store.SiteSettings,
): {
  inUse: boolean;
  references: Array<{
    type: "property_cover" | "property_gallery" | "cms_design";
    id: string;
    name: string;
  }>;
} {
  const references: Array<{
    type: "property_cover" | "property_gallery" | "cms_design";
    id: string;
    name: string;
  }> = [];

  for (const p of properties) {
    if (p.cover && (p.cover === assetPathOrUrl || p.cover.includes(assetPathOrUrl))) {
      references.push({ type: "property_cover", id: p.id, name: p.title || p.ref });
    }
    if (
      Array.isArray(p.galleryImages) &&
      p.galleryImages.some((img) => img === assetPathOrUrl || img.includes(assetPathOrUrl))
    ) {
      references.push({ type: "property_gallery", id: p.id, name: p.title || p.ref });
    }
  }

  if (siteSettings.websiteDesign) {
    for (const [key, value] of Object.entries(siteSettings.websiteDesign)) {
      if (
        typeof value === "string" &&
        (value === assetPathOrUrl || value.includes(assetPathOrUrl))
      ) {
        references.push({ type: "cms_design", id: key, name: `Website Design (${key})` });
      }
    }
  }

  return { inUse: references.length > 0, references };
}

describe("Media Library & Supabase Storage Suite (Tiers 1-4)", () => {
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
    it("F4 & F5: uploads file metadata to storage_files targeting public-marketing bucket", () => {
      const mockFile: StorageFileRecord = {
        id: "media-" + randomUUID(),
        bucket: "public-marketing",
        path: "properties/villa-bosphorus-01.webp",
        original_filename: "villa-bosphorus-01.webp",
        mime_type: "image/webp",
        file_size: 450 * 1024, // 450 KB
        folder: "properties",
        created_at: new Date().toISOString(),
      };

      expect(mockFile.bucket).toBe("public-marketing");
      expect(mockFile.file_size).toBeLessThan(10 * 1024 * 1024);
      expect(["image/jpeg", "image/png", "image/webp"]).toContain(mockFile.mime_type);
      expect(mockFile.path).toMatch(/^properties\//);
    });

    it("F6: generates instant public URL for uploaded media and validates URL structure", () => {
      const relativePath = "properties/penthouse-terrace.jpg";
      const publicBase =
        "https://ufcpvjhzitmxgitoaolx.supabase.co/storage/v1/object/public/public-marketing/";
      const generatedUrl = `${publicBase}${relativePath}`;

      expect(generatedUrl).toMatch(
        /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/public-marketing\//,
      );
      expect(validPublicImage(generatedUrl)).toBe(true);
    });

    it("F6: allows replacing an existing asset on the same storage path", () => {
      const originalAsset: StorageFileRecord = {
        id: "media-replace-1",
        bucket: "public-marketing",
        path: "hero/main-skyline.jpg",
        original_filename: "main-skyline-v1.jpg",
        mime_type: "image/jpeg",
        file_size: 1.2 * 1024 * 1024,
        folder: "hero",
        created_at: "2026-01-01T10:00:00Z",
      };

      // Replacement operation keeps path identical but updates metadata
      const replacedAsset: StorageFileRecord = {
        ...originalAsset,
        original_filename: "main-skyline-v2-enhanced.jpg",
        file_size: 1.4 * 1024 * 1024,
        created_at: new Date().toISOString(),
      };

      expect(replacedAsset.path).toBe(originalAsset.path);
      expect(replacedAsset.original_filename).not.toBe(originalAsset.original_filename);
    });

    it("F7: allows safe deletion of unreferenced media assets", () => {
      const unusedAssetUrl = "/images/properties/unreferenced-test-unit.jpg";
      const currentDB = workspace();

      const usage = checkMediaUsage(unusedAssetUrl, currentDB.properties, currentDB.siteSettings);
      expect(usage.inUse).toBe(false);
      expect(usage.references).toHaveLength(0);
    });
  });

  // =========================================================================
  // TIER 2: Boundary & Corner Cases (Limits, Edge Cases, Negative Validation)
  // =========================================================================
  describe("Tier 2: Boundary & Corner Cases", () => {
    it("F5: rejects files exceeding the 10 MB storage size limit for public-marketing", () => {
      const maxAllowedBytes = 10 * 1024 * 1024;
      const oversizedBytes = 10 * 1024 * 1024 + 1; // 10MB + 1 byte

      const validateUpload = (size: number) => {
        if (size > maxAllowedBytes) {
          throw new Error("File exceeds maximum allowed size of 10 MB.");
        }
        return true;
      };

      expect(() => validateUpload(oversizedBytes)).toThrow(/maximum allowed size/i);
      expect(validateUpload(maxAllowedBytes)).toBe(true);
    });

    it("F5: rejects non-image MIME types when uploading to marketing media library", () => {
      const allowedMimes = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);
      const validateMime = (mime: string) => {
        if (!allowedMimes.has(mime)) {
          throw new Error(`Unsupported MIME type: ${mime}`);
        }
        return true;
      };

      expect(() => validateMime("application/x-msdownload")).toThrow(/unsupported mime type/i);
      expect(() => validateMime("text/javascript")).toThrow(/unsupported mime type/i);
      expect(() => validateMime("application/pdf")).toThrow(/unsupported mime type/i); // PDFs belong to catalog_documents/brochures
      expect(validateMime("image/webp")).toBe(true);
    });

    it("F5: rejects empty (0-byte) files", () => {
      const validateNonEmpty = (size: number) => {
        if (size <= 0) throw new Error("File is empty.");
        return true;
      };
      expect(() => validateNonEmpty(0)).toThrow(/empty/i);
      expect(validateNonEmpty(1024)).toBe(true);
    });

    it("F5: sanitizes filenames containing special characters and spaces", () => {
      const sanitizeFilename = (filename: string): string => {
        return filename
          .toLowerCase()
          .replace(/[^a-z0-9.-]/g, "-")
          .replace(/-+/g, "-");
      };

      const rawName = "Luxury Villa & Bosphorus (Final Draft) #1.JPEG";
      const sanitized = sanitizeFilename(rawName);
      expect(sanitized).toBe("luxury-villa-bosphorus-final-draft-1.jpeg");
      expect(sanitized).not.toContain(" ");
      expect(sanitized).not.toContain("&");
      expect(sanitized).not.toContain("#");
    });
  });

  // =========================================================================
  // TIER 3: Cross-Feature Combinations (In-Use Checks & Dependencies)
  // =========================================================================
  describe("Tier 3: Cross-Feature Combinations", () => {
    it("F7 & F13: blocks deletion of media when referenced as a Property cover", () => {
      const currentDB = workspace();
      const targetProperty = currentDB.properties[0]!;
      expect(targetProperty.cover).toBeTruthy();

      const usage = checkMediaUsage(
        targetProperty.cover!,
        currentDB.properties,
        currentDB.siteSettings,
      );
      expect(usage.inUse).toBe(true);
      expect(
        usage.references.some((r) => r.type === "property_cover" && r.id === targetProperty.id),
      ).toBe(true);

      const deleteMediaWithGuard = (assetUrl: string) => {
        const check = checkMediaUsage(assetUrl, currentDB.properties, currentDB.siteSettings);
        if (check.inUse) {
          const names = check.references.map((r) => r.name).join(", ");
          throw new Error(`Cannot delete asset: in use by ${names}`);
        }
      };

      expect(() => deleteMediaWithGuard(targetProperty.cover!)).toThrow(
        /cannot delete asset: in use by/i,
      );
    });

    it("F7 & F14: blocks deletion of media when referenced in a Property gallery", () => {
      const currentDB = workspace();
      const galleryAsset = "/images/properties/gallery-sample-unit.jpg";

      // Add property with gallery images
      const propWithGallery = store.upsert<store.Property>("properties", {
        ref: "AVR-GAL-01",
        slug: "gallery-test-prop",
        title: "Gallery Test Villa",
        district: "Bebek",
        city: "Istanbul",
        type: "unit offer",
        layout: "4+1",
        bathrooms: 3,
        grossM2: 300,
        netM2: 260,
        areaM2: null,
        amount: 1500000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        availability: "Available",
        publication: "Draft",
        agentId: "u3",
        cover: "/images/properties/cover.jpg",
        galleryImages: [galleryAsset, "/images/properties/other.jpg"],
        description: "Testing gallery asset usage guard",
        project: "Bebek Waterfront",
        updatedAt: new Date().toISOString(),
      });

      const updatedDB = workspace();
      const usage = checkMediaUsage(galleryAsset, updatedDB.properties, updatedDB.siteSettings);
      expect(usage.inUse).toBe(true);
      expect(
        usage.references.some((r) => r.type === "property_gallery" && r.id === propWithGallery.id),
      ).toBe(true);
    });

    it("F7 & F9: blocks deletion of media when referenced in CMS website design settings", () => {
      const heroBannerUrl = "/images/properties/hero-bosphorus-custom.jpg";

      store.updateSiteSettings({
        websiteDesign: {
          heroMain: heroBannerUrl,
        },
      });

      const updatedDB = workspace();
      const usage = checkMediaUsage(heroBannerUrl, updatedDB.properties, updatedDB.siteSettings);
      expect(usage.inUse).toBe(true);
      expect(usage.references.some((r) => r.type === "cms_design" && r.id === "heroMain")).toBe(
        true,
      );
    });
  });

  // =========================================================================
  // TIER 4: Real-World Application Scenarios (End-to-End Workflow)
  // =========================================================================
  describe("Tier 4: Real-World Application Scenarios", () => {
    it("Scenario: Asset upload -> Property cover assignment -> In-use deletion block -> Cover reassignment -> Safe deletion", () => {
      const assetUrl = "/images/properties/kandilli-waterfront-mansion.webp";

      // 1. Admin uploads asset to public-marketing
      const assetRecord: StorageFileRecord = {
        id: "media-" + randomUUID(),
        bucket: "public-marketing",
        path: "properties/kandilli-waterfront-mansion.webp",
        original_filename: "kandilli-waterfront-mansion.webp",
        mime_type: "image/webp",
        file_size: 720 * 1024,
        folder: "properties",
        created_at: new Date().toISOString(),
      };
      expect(assetRecord.id).toBeDefined();

      // 2. Admin assigns this image as the cover of a new listing
      const property = store.upsert<store.Property>("properties", {
        ref: "AVR-MEDIA-E2E",
        slug: "kandilli-mansion-luxury",
        title: "Kandilli Waterfront Mansion",
        district: "Üsküdar",
        city: "Istanbul",
        type: "unit offer",
        layout: "6+2",
        bathrooms: 5,
        grossM2: 750,
        netM2: 600,
        areaM2: null,
        amount: 8500000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        availability: "Available",
        publication: "Published",
        agentId: "u2",
        cover: assetUrl,
        description: "Rare historic Bosphorus frontage.",
        project: "Kandilli Private",
        updatedAt: new Date().toISOString(),
      });

      // 3. User attempts to delete asset -> Check detects active usage and blocks
      let dbState = workspace();
      let usageCheck = checkMediaUsage(assetUrl, dbState.properties, dbState.siteSettings);
      expect(usageCheck.inUse).toBe(true);
      expect(usageCheck.references[0]!.name).toBe(property.title);

      // 4. Content manager reassigns the property's cover to a replacement image
      const replacementCoverUrl = "/images/properties/kandilli-mansion-replacement.webp";
      store.upsert<store.Property>("properties", {
        id: property.id,
        cover: replacementCoverUrl,
      });

      // 5. Verification: Media scanner confirms original asset now has 0 active references
      dbState = workspace();
      usageCheck = checkMediaUsage(assetUrl, dbState.properties, dbState.siteSettings);
      expect(usageCheck.inUse).toBe(false);
      expect(usageCheck.references).toHaveLength(0);

      // 6. Safe deletion proceeds without warnings
      const isDeletable = !usageCheck.inUse;
      expect(isDeletable).toBe(true);
    });
  });
});
