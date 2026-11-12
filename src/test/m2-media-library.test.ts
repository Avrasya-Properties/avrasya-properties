import { randomUUID } from "node:crypto";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "@/routeTree.gen";
import * as store from "@/admin/demo";
import { validPublicImage } from "@/admin/website-design";
import {
  checkMediaUsage,
  formatFileSize,
  getPublicStorageUrl,
  normalizeCategory,
  sanitizeFilename,
  validateUploadFile,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_IMAGE_MIMES,
  ALLOWED_DOCUMENT_MIMES,
} from "@/admin/media/safety";
import {
  loadMediaAssets,
  uploadMediaAsset,
  replaceMediaAsset,
  deleteMediaAsset,
  copyAssetUrl,
} from "@/admin/media/storage-service";
import type { StorageFileRecord } from "@/admin/media/types";

describe("Milestone M2: Centralized Media Library & Asset Safety Test Suite", () => {
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
  // 1. Route Registration & Sidebar Navigation
  // =========================================================================
  describe("1. Route Registration & Navigation", () => {
    it("registers /admin/media in the TanStack router tree", () => {
      const router = createRouter({
        routeTree,
        context: { queryClient: new QueryClient() },
      });
      const match = router.matchRoutes("/admin/media");
      expect(match).toBeDefined();
      expect(match.at(-1)?.routeId).toBe("/admin/media");
    });
  });

  // =========================================================================
  // 2. Folder Categorization & Normalization
  // =========================================================================
  describe("2. Folder Categorization", () => {
    it("correctly normalizes file paths into designated categories", () => {
      expect(normalizeCategory("properties/villa-1.jpg")).toBe("properties");
      expect(normalizeCategory("offers/penthouse.png")).toBe("properties");
      expect(normalizeCategory("developments/bosphorus-heights.webp")).toBe("developments");
      expect(normalizeCategory("projects/rams-beyond.jpg")).toBe("developments");
      expect(normalizeCategory("marketing/hero-banner.jpg")).toBe("marketing");
      expect(normalizeCategory("hero/skyline.jpg")).toBe("marketing");
      expect(normalizeCategory("brochures/catalog-2026.pdf")).toBe("brochures");
      expect(normalizeCategory("catalog/invest-guide.pdf")).toBe("brochures");
      expect(normalizeCategory("brand/logo-white.svg")).toBe("brand");
      expect(normalizeCategory("logo/symbol.png")).toBe("brand");
    });

    it("seeds default storage files categorized into properties, marketing, brochures, brand", async () => {
      const assets = await loadMediaAssets();
      expect(assets.length).toBeGreaterThanOrEqual(5);

      const folders = new Set(assets.map((a) => a.folder));
      expect(folders.has("properties")).toBe(true);
      expect(folders.has("marketing")).toBe(true);
      expect(folders.has("brand")).toBe(true);
      expect(folders.has("brochures")).toBe(true);
    });
  });

  // =========================================================================
  // 3. File Validation & Sanitization
  // =========================================================================
  describe("3. File Validation & Filename Sanitization", () => {
    it("rejects files exceeding 10 MB", () => {
      const oversized = {
        name: "huge-image.jpg",
        size: MAX_FILE_SIZE_BYTES + 1,
        type: "image/jpeg",
      };
      expect(() => validateUploadFile(oversized)).toThrow(/maximum allowed size of 10 MB/i);
    });

    it("accepts files exactly at or under 10 MB", () => {
      const valid = {
        name: "perfect-image.jpg",
        size: MAX_FILE_SIZE_BYTES,
        type: "image/jpeg",
      };
      expect(validateUploadFile(valid)).toBe(true);
    });

    it("rejects empty 0-byte files", () => {
      const emptyFile = {
        name: "empty.png",
        size: 0,
        type: "image/png",
      };
      expect(() => validateUploadFile(emptyFile)).toThrow(/file is empty/i);
    });

    it("enforces allowed MIME types for images and brochures", () => {
      // Allowed images
      for (const mime of ALLOWED_IMAGE_MIMES) {
        expect(validateUploadFile({ name: "test", size: 1024, type: mime })).toBe(true);
      }
      // Allowed PDF brochures
      for (const mime of ALLOWED_DOCUMENT_MIMES) {
        expect(validateUploadFile({ name: "brochure.pdf", size: 1024, type: mime })).toBe(true);
      }

      // Rejected types
      expect(() =>
        validateUploadFile({ name: "script.js", size: 1024, type: "application/javascript" }),
      ).toThrow(/unsupported mime type/i);

      expect(() =>
        validateUploadFile({ name: "binary.exe", size: 1024, type: "application/x-msdownload" }),
      ).toThrow(/unsupported mime type/i);
    });

    it("sanitizes filenames: converts to lowercase, replaces spaces and special characters with hyphens", () => {
      expect(sanitizeFilename("Luxury Bosphorus Villa (Final Version) #1!.PNG")).toBe(
        "luxury-bosphorus-villa-final-version-1-.png",
      );
      expect(sanitizeFilename("Floor Plan & Layout @ 2026---Draft.PDF")).toBe(
        "floor-plan-layout-2026-draft.pdf",
      );
    });

    it("formats file sizes cleanly", () => {
      expect(formatFileSize(500)).toBe("500 B");
      expect(formatFileSize(1500)).toBe("1.5 KB");
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe("2.50 MB");
    });
  });

  // =========================================================================
  // 4. Multi-File Upload & Persistence (Demo & Live Contracts)
  // =========================================================================
  describe("4. Multi-File Upload & Metadata Persistence", () => {
    it("uploads file to target folder and stores metadata record in storageFiles", async () => {
      const file = new File(["test image binary content"], "yali-waterfront-terrace.webp", {
        type: "image/webp",
      });

      const uploaded = await uploadMediaAsset(file, "properties");

      expect(uploaded.id).toBeDefined();
      expect(uploaded.bucket).toBe("public-marketing");
      expect(uploaded.original_filename).toBe("yali-waterfront-terrace.webp");
      expect(uploaded.mime_type).toBe("image/webp");
      expect(uploaded.folder).toBe("properties");
      expect(uploaded.path).toMatch(/^properties\//);
      expect(uploaded.public_url).toMatch(
        /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/public-marketing\//,
      );

      // Verify persistence in local database
      const dbState = workspace();
      expect(dbState.storageFiles?.some((f) => f.id === uploaded.id)).toBe(true);
    });

    it("supports uploading multiple files across different categories", async () => {
      const file1 = new File(["photo 1"], "penthouse-view-01.jpg", { type: "image/jpeg" });
      const file2 = new File(["photo 2"], "penthouse-view-02.jpg", { type: "image/jpeg" });
      const brochure = new File(["pdf content"], "official-dossier.pdf", {
        type: "application/pdf",
      });

      const res1 = await uploadMediaAsset(file1, "properties");
      const res2 = await uploadMediaAsset(file2, "properties");
      const resBrochure = await uploadMediaAsset(brochure, "brochures");

      expect(res1.folder).toBe("properties");
      expect(res2.folder).toBe("properties");
      expect(resBrochure.folder).toBe("brochures");

      const list = await loadMediaAssets();
      expect(list.some((a) => a.id === res1.id)).toBe(true);
      expect(list.some((a) => a.id === res2.id)).toBe(true);
      expect(list.some((a) => a.id === resBrochure.id)).toBe(true);
    });
  });

  // =========================================================================
  // 5. Asset Replacement at Same Path
  // =========================================================================
  describe("5. Asset Replacement", () => {
    it("replaces existing asset maintaining the exact same storage path", async () => {
      const initialFile = new File(["initial data"], "brand-hero-original.jpg", {
        type: "image/jpeg",
      });
      const initialAsset = await uploadMediaAsset(initialFile, "marketing");

      const replacementFile = new File(
        ["replacement higher quality"],
        "brand-hero-4k-retouched.webp",
        {
          type: "image/webp",
        },
      );

      const replaced = await replaceMediaAsset(initialAsset, replacementFile);

      // Path must be identical
      expect(replaced.path).toBe(initialAsset.path);
      // Metadata must be updated
      expect(replaced.original_filename).toBe("brand-hero-4k-retouched.webp");
      expect(replaced.mime_type).toBe("image/webp");
      expect(replaced.file_size).toBe(replacementFile.size);

      // Verify persistence in storageFiles
      const list = await loadMediaAssets();
      const stored = list.find((a) => a.id === initialAsset.id || a.path === initialAsset.path);
      expect(stored?.original_filename).toBe("brand-hero-4k-retouched.webp");
    });
  });

  // =========================================================================
  // 6. Instant Public URL Copying
  // =========================================================================
  describe("6. Instant Public URL Copying", () => {
    it("generates and copies public asset URL to clipboard", async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal("navigator", {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const sampleAsset: StorageFileRecord = {
        id: "sample-id",
        bucket: "public-marketing",
        path: "properties/test-url-asset.webp",
        original_filename: "test-url-asset.webp",
        mime_type: "image/webp",
        file_size: 2048,
        folder: "properties",
        created_at: new Date().toISOString(),
      };

      const copiedUrl = await copyAssetUrl(sampleAsset);
      expect(copiedUrl).toContain("properties/test-url-asset.webp");
      expect(validPublicImage(copiedUrl)).toBe(true);
      expect(writeTextMock).toHaveBeenCalledWith(copiedUrl);
    });
  });

  // =========================================================================
  // 7. In-Use Safety Check (Covers, Galleries, Floor Plans, CMS Design)
  // =========================================================================
  describe("7. In-Use Safety Checks & Blocked Deletions", () => {
    it("blocks deletion when asset is referenced as property cover", async () => {
      const db = workspace();
      const testProp = db.properties[0]!;
      expect(testProp.cover).toBeTruthy();

      const assetRecord: StorageFileRecord = {
        id: "cover-asset-id",
        bucket: "public-marketing",
        path: testProp.cover!,
        original_filename: "cover.jpg",
        mime_type: "image/jpeg",
        file_size: 1024,
        folder: "properties",
        created_at: new Date().toISOString(),
      };

      const usage = checkMediaUsage(assetRecord.path, db.properties, db.siteSettings);
      expect(usage.inUse).toBe(true);
      expect(
        usage.references.some((r) => r.type === "property_cover" && r.id === testProp.id),
      ).toBe(true);

      // Attempt deletion must throw
      await expect(deleteMediaAsset(assetRecord, db.properties, db.siteSettings)).rejects.toThrow(
        /cannot delete asset: in use by/i,
      );
    });

    it("blocks deletion when asset is referenced in property gallery", async () => {
      const galleryUrl = "/images/properties/gallery-unit-2026.webp";
      const prop = store.upsert<store.Property>("properties", {
        ref: "AVR-SAFE-01",
        slug: "safe-test-prop",
        title: "Safety Test Villa",
        district: "Sarıyer",
        city: "Istanbul",
        type: "unit offer",
        layout: "5+1",
        bathrooms: 4,
        grossM2: 450,
        netM2: 380,
        areaM2: null,
        amount: 3200000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        availability: "Available",
        publication: "Draft",
        agentId: "u2",
        cover: "/images/properties/cover.jpg",
        galleryImages: [galleryUrl, "/images/properties/other-pic.webp"],
        description: "Checking gallery safety",
        project: "Bosphorus Hills",
        updatedAt: new Date().toISOString(),
      });

      const db = workspace();
      const usage = checkMediaUsage(galleryUrl, db.properties, db.siteSettings);
      expect(usage.inUse).toBe(true);
      expect(usage.references.some((r) => r.type === "property_gallery" && r.id === prop.id)).toBe(
        true,
      );

      const asset: StorageFileRecord = {
        id: "gal-asset",
        bucket: "public-marketing",
        path: galleryUrl,
        original_filename: "gallery-unit-2026.webp",
        mime_type: "image/webp",
        file_size: 512,
        folder: "properties",
        created_at: new Date().toISOString(),
      };

      await expect(deleteMediaAsset(asset, db.properties, db.siteSettings)).rejects.toThrow(
        /cannot delete asset: in use by/i,
      );
    });

    it("blocks deletion when asset is referenced in property floor plan", async () => {
      const floorPlanUrl = "/images/properties/floorplan-unit-a.png";
      const prop = store.upsert<store.Property>("properties", {
        ref: "AVR-FLOOR-01",
        slug: "floor-test-prop",
        title: "Floor Plan Test Penthouse",
        district: "Kadıköy",
        city: "Istanbul",
        type: "unit offer",
        layout: "3+1",
        bathrooms: 2,
        grossM2: 220,
        netM2: 180,
        areaM2: null,
        amount: 850000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        availability: "Available",
        publication: "Draft",
        agentId: "u3",
        cover: "/images/properties/cover.jpg",
        floorPlan: floorPlanUrl,
        description: "Testing floor plan guard",
        project: "Moda View",
        updatedAt: new Date().toISOString(),
      });

      const db = workspace();
      const usage = checkMediaUsage(floorPlanUrl, db.properties, db.siteSettings);
      expect(usage.inUse).toBe(true);
      expect(
        usage.references.some((r) => r.type === "property_floor_plan" && r.id === prop.id),
      ).toBe(true);
    });

    it("blocks deletion when asset is referenced in CMS website design settings", async () => {
      const customLogoUrl = "/images/brand/custom-corporate-emblem.svg";
      store.updateSiteSettings({
        websiteDesign: {
          logoLight: customLogoUrl,
        },
      });

      const db = workspace();
      const usage = checkMediaUsage(customLogoUrl, db.properties, db.siteSettings);
      expect(usage.inUse).toBe(true);
      expect(usage.references.some((r) => r.type === "cms_design" && r.id === "logoLight")).toBe(
        true,
      );

      const asset: StorageFileRecord = {
        id: "logo-asset",
        bucket: "public-marketing",
        path: customLogoUrl,
        original_filename: "custom-corporate-emblem.svg",
        mime_type: "image/svg+xml",
        file_size: 24000,
        folder: "brand",
        created_at: new Date().toISOString(),
      };

      await expect(deleteMediaAsset(asset, db.properties, db.siteSettings)).rejects.toThrow(
        /cannot delete asset: in use by/i,
      );
    });

    it("allows safe deletion of completely unreferenced media assets", async () => {
      const file = new File(["unused picture"], "temporary-unused-capture.jpg", {
        type: "image/jpeg",
      });
      const uploaded = await uploadMediaAsset(file, "properties");

      const db = workspace();
      const usage = checkMediaUsage(uploaded.path, db.properties, db.siteSettings);
      expect(usage.inUse).toBe(false);
      expect(usage.references).toHaveLength(0);

      // Safe deletion must succeed without error
      await expect(
        deleteMediaAsset(uploaded, db.properties, db.siteSettings),
      ).resolves.not.toThrow();

      // Asset is now removed from store
      const updatedList = await loadMediaAssets();
      expect(updatedList.some((a) => a.id === uploaded.id)).toBe(false);
    });
  });
});
