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
  ALL_ALLOWED_MIMES,
} from "@/admin/media/safety";
import {
  loadMediaAssets,
  uploadMediaAsset,
  replaceMediaAsset,
  deleteMediaAsset,
  copyAssetUrl,
} from "@/admin/media/storage-service";
import type { StorageFileRecord } from "@/admin/media/types";

describe("Milestone M2 Adversarial Challenge Suite (Empirical Challenger 2)", () => {
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
  // SECTION 1: ASSET REPLACEMENT INTEGRITY
  // =========================================================================
  describe("1. Asset Replacement Integrity", () => {
    it("preserves the exact existing URL, bucket, and storage path upon replacement", async () => {
      // 1. Initial file upload
      const initialFile = new File(["initial buffer data"], "waterfront-suite.jpg", {
        type: "image/jpeg",
      });
      const initialAsset = await uploadMediaAsset(initialFile, "properties");
      const initialPath = initialAsset.path;
      const initialUrl = initialAsset.public_url;
      const initialId = initialAsset.id;

      expect(initialPath).toBeDefined();
      expect(initialUrl).toBeDefined();

      // 2. Replacement with a new higher quality file
      const replacementFile = new File(
        ["new higher resolution buffer"],
        "waterfront-suite-hdr.jpg",
        {
          type: "image/jpeg",
        },
      );
      const replaced = await replaceMediaAsset(initialAsset, replacementFile);

      // Verify exact path and URL preservation
      expect(replaced.id).toBe(initialId);
      expect(replaced.path).toBe(initialPath);
      expect(replaced.bucket).toBe("public-marketing");
      expect(replaced.public_url).toBe(initialUrl);

      // Verify updated content attributes
      expect(replaced.original_filename).toBe("waterfront-suite-hdr.jpg");
      expect(replaced.file_size).toBe(replacementFile.size);

      // Verify store state
      const catalog = await loadMediaAssets();
      const persisted = catalog.find((a) => a.id === initialId);
      expect(persisted).toBeDefined();
      expect(persisted?.path).toBe(initialPath);
      expect(persisted?.original_filename).toBe("waterfront-suite-hdr.jpg");
    });

    it("rejects replacement files exceeding 10 MB BEFORE overwriting", async () => {
      const initialFile = new File(["normal size image"], "normal.png", { type: "image/png" });
      const initialAsset = await uploadMediaAsset(initialFile, "properties");

      const oversizedFile = new File(
        [new Uint8Array(MAX_FILE_SIZE_BYTES + 1024)],
        "huge-payload.png",
        { type: "image/png" },
      );

      // Replacement must reject synchronously or reject promise
      await expect(replaceMediaAsset(initialAsset, oversizedFile)).rejects.toThrow(
        /exceeds maximum allowed size of 10 MB/i,
      );

      // Confirm existing asset in DB is NOT mutated or corrupted
      const catalog = await loadMediaAssets();
      const existing = catalog.find((a) => a.id === initialAsset.id);
      expect(existing?.original_filename).toBe("normal.png");
      expect(existing?.file_size).toBe(initialFile.size);
    });

    it("rejects replacement files with 0 bytes (empty file) BEFORE overwriting", async () => {
      const initialFile = new File(["valid image"], "photo.webp", { type: "image/webp" });
      const initialAsset = await uploadMediaAsset(initialFile, "properties");

      const emptyFile = new File([], "empty.webp", { type: "image/webp" });

      await expect(replaceMediaAsset(initialAsset, emptyFile)).rejects.toThrow(/file is empty/i);

      // Ensure untouched
      const catalog = await loadMediaAssets();
      const existing = catalog.find((a) => a.id === initialAsset.id);
      expect(existing?.original_filename).toBe("photo.webp");
    });

    it("rejects replacement files with unsupported MIME types BEFORE overwriting", async () => {
      const initialFile = new File(["valid image"], "cover.jpg", { type: "image/jpeg" });
      const initialAsset = await uploadMediaAsset(initialFile, "properties");

      const dangerousFiles = [
        new File(["binary data"], "payload.exe", { type: "application/x-msdownload" }),
        new File(["console.log(1)"], "script.js", { type: "application/javascript" }),
        new File(["SELECT * FROM users"], "dump.sql", { type: "application/sql" }),
        new File(["<html><body>Hack</body></html>"], "page.html", { type: "text/html" }),
        new File(["video raw"], "video.mp4", { type: "video/mp4" }),
      ];

      for (const dangerous of dangerousFiles) {
        await expect(replaceMediaAsset(initialAsset, dangerous)).rejects.toThrow(
          /unsupported mime type/i,
        );
      }

      // Ensure original asset remains intact
      const catalog = await loadMediaAssets();
      const existing = catalog.find((a) => a.id === initialAsset.id);
      expect(existing?.original_filename).toBe("cover.jpg");
    });

    it("allows replacing image/jpeg with image/webp (valid modern upgrade) while keeping path", async () => {
      const initialFile = new File(["jpeg data"], "legacy.jpg", { type: "image/jpeg" });
      const initialAsset = await uploadMediaAsset(initialFile, "properties");

      const modernFile = new File(["webp compressed data"], "modern.webp", { type: "image/webp" });
      const replaced = await replaceMediaAsset(initialAsset, modernFile);

      expect(replaced.path).toBe(initialAsset.path);
      expect(replaced.mime_type).toBe("image/webp");
      expect(replaced.original_filename).toBe("modern.webp");
    });
  });

  // =========================================================================
  // SECTION 2: NAVIGATION & ROUTING
  // =========================================================================
  describe("2. Navigation & Routing", () => {
    it("resolves /admin/media cleanly in the router without 404 or missing route", () => {
      const queryClient = new QueryClient();
      const router = createRouter({
        routeTree,
        context: { queryClient },
      });

      const match = router.matchRoutes("/admin/media");
      expect(match).toBeDefined();
      expect(match.length).toBeGreaterThanOrEqual(1);

      const targetRoute = match.at(-1);
      expect(targetRoute?.routeId).toBe("/admin/media");
      expect(targetRoute?.pathname).toBe("/admin/media");
    });

    it("verifies /admin/media is nested under /admin layout which enforces auth check", () => {
      const queryClient = new QueryClient();
      const router = createRouter({
        routeTree,
        context: { queryClient },
      });

      const matches = router.matchRoutes("/admin/media");
      const routeIds = matches.map((m) => m.routeId);

      // Must traverse root -> /admin -> /admin/media
      expect(routeIds).toContain("/admin");
      expect(routeIds).toContain("/admin/media");
    });

    it("confirms unauthenticated user session returns null from getSession()", () => {
      store.logout();
      const currentUser = store.getSession();
      expect(currentUser).toBeNull();
    });
  });

  // =========================================================================
  // SECTION 3: MEDIAPICKERMODAL EMISSION & IMMUTABILITY CONTRACT
  // =========================================================================
  describe("3. MediaPickerModal Emission & Immutability Contract", () => {
    it("emits valid public URLs that conform to validPublicImage()", async () => {
      const assets = await loadMediaAssets();
      expect(assets.length).toBeGreaterThan(0);

      for (const asset of assets) {
        const publicUrl = asset.public_url || getPublicStorageUrl(asset.path);
        expect(publicUrl).toBeDefined();
        expect(typeof publicUrl).toBe("string");
        // Images should satisfy validPublicImage
        if (asset.mime_type.startsWith("image/")) {
          expect(validPublicImage(publicUrl)).toBe(true);
        }
      }
    });

    it("selecting media for property cover does NOT mutate saved DB record until saved", async () => {
      const db = workspace();
      const targetProperty = db.properties[0]!;
      const originalCover = targetProperty.cover;
      const originalUpdatedAt = targetProperty.updatedAt;

      // Simulate MediaPickerModal picking a new URL
      const pickedUrl =
        "https://ufcpvjhzitmxgitoaolx.supabase.co/storage/v1/object/public/public-marketing/properties/new-picked-photo.webp";

      // Calling form holds draft state in React state:
      const draftState: store.Property = { ...targetProperty, cover: pickedUrl };

      // Assert draft state has the new URL:
      expect(draftState.cover).toBe(pickedUrl);

      // Verify that the database / localStorage still has the original cover:
      let freshDb = workspace();
      let propertyInDb = freshDb.properties.find((p) => p.id === targetProperty.id)!;
      expect(propertyInDb.cover).toBe(originalCover);
      expect(propertyInDb.updatedAt).toBe(originalUpdatedAt);

      // Now simulate user clicking "Save changes"
      const savedProperty = await store.upsert<store.Property>("properties", draftState);
      expect(savedProperty.cover).toBe(pickedUrl);

      // Now verify DB was updated after explicit save
      freshDb = workspace();
      propertyInDb = freshDb.properties.find((p) => p.id === targetProperty.id)!;
      expect(propertyInDb.cover).toBe(pickedUrl);
    });

    it("selecting media for gallery does NOT mutate saved DB record until saved", async () => {
      const db = workspace();
      const targetProperty = db.properties[0]!;
      const originalGallery = [...(targetProperty.galleryImages || [])];

      const pickedGalleryUrl =
        "https://ufcpvjhzitmxgitoaolx.supabase.co/storage/v1/object/public/public-marketing/properties/extra-gallery-view.webp";

      // Form local state update
      const draftState: store.Property = {
        ...targetProperty,
        galleryImages: [...originalGallery, pickedGalleryUrl],
      };

      // Ensure DB still has original gallery before save
      let freshDb = workspace();
      let propertyInDb = freshDb.properties.find((p) => p.id === targetProperty.id)!;
      expect(propertyInDb.galleryImages ?? []).toEqual(originalGallery);
      expect(propertyInDb.galleryImages ?? []).not.toContain(pickedGalleryUrl);

      // Save form
      await store.upsert<store.Property>("properties", draftState);

      freshDb = workspace();
      propertyInDb = freshDb.properties.find((p) => p.id === targetProperty.id)!;
      expect(propertyInDb.galleryImages).toContain(pickedGalleryUrl);
    });
  });

  // =========================================================================
  // SECTION 4: IN-USE USAGE SAFETY STRESS TESTING
  // =========================================================================
  describe("4. In-Use Safety Scanner Edge Cases", () => {
    it("detects asset usage when matching by public URL as well as relative path", () => {
      const db = workspace();
      const property = db.properties[0]!;
      const relativePath = property.cover!;
      const fullUrl = getPublicStorageUrl(relativePath);

      const usageFromRel = checkMediaUsage(relativePath, db.properties, db.siteSettings);
      expect(usageFromRel.inUse).toBe(true);

      const usageFromFull = checkMediaUsage(fullUrl, db.properties, db.siteSettings);
      expect(usageFromFull.inUse).toBe(true);
    });

    it("handles null, empty, and undefined gracefully without throwing", () => {
      const db = workspace();
      expect(checkMediaUsage("", db.properties, db.siteSettings).inUse).toBe(false);
      expect(checkMediaUsage(null as any, db.properties, db.siteSettings).inUse).toBe(false);
      expect(checkMediaUsage(undefined as any, db.properties, db.siteSettings).inUse).toBe(false);
      expect(
        checkMediaUsage("non-existent-asset-999.png", db.properties, db.siteSettings).inUse,
      ).toBe(false);
    });
  });
});
