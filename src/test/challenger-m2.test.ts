import { randomUUID } from "node:crypto";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as store from "@/admin/demo";
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

describe("Milestone M2: Adversarial Stress Test Suite (Challenger 1)", () => {
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
  // 1. IN-USE ASSET SAFETY STRESS TESTS
  // =========================================================================
  describe("1. In-Use Asset Safety Stress Tests", () => {
    it("reports ALL occurrences when an asset is referenced in multiple properties across covers, galleries, and floor plans", () => {
      const assetUrl = "/images/properties/shared-luxury-view.webp";

      // Setup Property 1: Cover & Gallery
      const p1 = store.upsert<store.Property>("properties", {
        ref: "AVR-CHAL-01",
        slug: "chal-prop-1",
        title: "Penthouse Bosphorus",
        district: "Beşiktaş",
        city: "Istanbul",
        type: "unit offer",
        layout: "4+1",
        bathrooms: 3,
        grossM2: 300,
        netM2: 260,
        areaM2: null,
        amount: 2500000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        availability: "Available",
        publication: "Published",
        agentId: "u1",
        cover: assetUrl,
        galleryImages: [assetUrl, "/images/properties/other1.jpg"],
        description: "Shared asset test prop 1",
        project: "Skyline",
        updatedAt: new Date().toISOString(),
      });

      // Setup Property 2: Gallery only
      const p2 = store.upsert<store.Property>("properties", {
        ref: "AVR-CHAL-02",
        slug: "chal-prop-2",
        title: "Waterfront Mansion",
        district: "Sarıyer",
        city: "Istanbul",
        type: "unit offer",
        layout: "6+2",
        bathrooms: 5,
        grossM2: 600,
        netM2: 520,
        areaM2: null,
        amount: 7000000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        availability: "Available",
        publication: "Published",
        agentId: "u2",
        cover: "/images/properties/prop2-cover.jpg",
        galleryImages: ["/images/properties/p2-1.jpg", assetUrl],
        description: "Shared asset test prop 2",
        project: "Bosphorus Elite",
        updatedAt: new Date().toISOString(),
      });

      // Setup Property 3: Floor plan
      const p3 = store.upsert<store.Property>("properties", {
        ref: "AVR-CHAL-03",
        slug: "chal-prop-3",
        title: "Garden Villa",
        district: "Beykoz",
        city: "Istanbul",
        type: "unit offer",
        layout: "5+1",
        bathrooms: 4,
        grossM2: 400,
        netM2: 350,
        areaM2: null,
        amount: 3500000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        availability: "Available",
        publication: "Published",
        agentId: "u1",
        cover: "/images/properties/prop3-cover.jpg",
        floorPlan: assetUrl,
        description: "Shared asset test prop 3",
        project: "Acarkent",
        updatedAt: new Date().toISOString(),
      });

      // Setup CMS site settings: heroMain and logoLight referencing the asset
      store.updateSiteSettings({
        websiteDesign: {
          heroMain: assetUrl,
          logoLight: assetUrl,
        },
      });

      const db = workspace();
      const result = checkMediaUsage(assetUrl, db.properties, db.siteSettings);

      expect(result.inUse).toBe(true);

      // Verify all references are captured
      // p1 cover + p1 gallery + p2 gallery + p3 floorPlan + heroMain + logoLight = 6 references
      expect(result.references.length).toBe(6);

      const p1CoverRef = result.references.find(
        (r) => r.type === "property_cover" && r.id === p1.id,
      );
      expect(p1CoverRef).toBeDefined();
      expect(p1CoverRef?.details).toContain(p1.ref);

      const p1GalleryRef = result.references.find(
        (r) => r.type === "property_gallery" && r.id === p1.id,
      );
      expect(p1GalleryRef).toBeDefined();

      const p2GalleryRef = result.references.find(
        (r) => r.type === "property_gallery" && r.id === p2.id,
      );
      expect(p2GalleryRef).toBeDefined();
      expect(p2GalleryRef?.name).toBe(p2.title);

      const p3FloorPlanRef = result.references.find(
        (r) => r.type === "property_floor_plan" && r.id === p3.id,
      );
      expect(p3FloorPlanRef).toBeDefined();

      const heroRef = result.references.find((r) => r.type === "cms_design" && r.id === "heroMain");
      expect(heroRef).toBeDefined();

      const logoRef = result.references.find(
        (r) => r.type === "cms_design" && r.id === "logoLight",
      );
      expect(logoRef).toBeDefined();
    });

    it("verifies behavior when an asset is duplicated multiple times within the same gallery array", () => {
      const assetUrl = "/images/properties/duplicate-gallery.jpg";
      const prop = store.upsert<store.Property>("properties", {
        ref: "AVR-DUP-01",
        slug: "dup-gallery-prop",
        title: "Duplicate Gallery Villa",
        district: "Bebek",
        city: "Istanbul",
        type: "unit offer",
        layout: "3+1",
        bathrooms: 2,
        grossM2: 200,
        netM2: 170,
        areaM2: null,
        amount: 1800000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        availability: "Available",
        publication: "Published",
        agentId: "u1",
        cover: "/images/properties/cover.jpg",
        galleryImages: [assetUrl, assetUrl, assetUrl], // repeated in array
        description: "Testing array duplication",
        project: "Bebek Waterfront",
        updatedAt: new Date().toISOString(),
      });

      const db = workspace();
      const usage = checkMediaUsage(assetUrl, db.properties, db.siteSettings);
      expect(usage.inUse).toBe(true);
      // Property gallery is reported once for that property
      const galRefs = usage.references.filter(
        (r) => r.type === "property_gallery" && r.id === prop.id,
      );
      expect(galRefs.length).toBe(1);
    });

    it("prevents bypassing deletion of active cover image across relative paths, public storage URLs, and sub-paths", async () => {
      const db = workspace();
      const targetProp = db.properties[0]!;
      expect(targetProp.cover).toBeTruthy();

      const coverPath = targetProp.cover!;
      const fullPublicUrl = getPublicStorageUrl(coverPath);

      // Attempt 1: Deletion with relative path
      const assetByPath: StorageFileRecord = {
        id: "cover-by-path",
        bucket: "public-marketing",
        path: coverPath,
        original_filename: "cover.jpg",
        mime_type: "image/jpeg",
        file_size: 1024,
        folder: "properties",
        created_at: new Date().toISOString(),
      };
      await expect(deleteMediaAsset(assetByPath, db.properties, db.siteSettings)).rejects.toThrow(
        /cannot delete asset: in use by/i,
      );

      // Attempt 2: Deletion with full public storage URL
      const assetByUrl: StorageFileRecord = {
        id: "cover-by-url",
        bucket: "public-marketing",
        path: coverPath,
        public_url: fullPublicUrl,
        original_filename: "cover.jpg",
        mime_type: "image/jpeg",
        file_size: 1024,
        folder: "properties",
        created_at: new Date().toISOString(),
      };
      await expect(deleteMediaAsset(assetByUrl, db.properties, db.siteSettings)).rejects.toThrow(
        /cannot delete asset: in use by/i,
      );

      // Attempt 3: When asset path is filename only but property has full path
      const filenameOnly = coverPath.split("/").pop()!;
      const usageFilenameOnly = checkMediaUsage(filenameOnly, db.properties, db.siteSettings);
      expect(usageFilenameOnly.inUse).toBe(true);
    });

    it("evaluates edge case: case-sensitivity of asset references in checkMediaUsage", () => {
      const assetUrl = "/images/properties/UPPERCASE-VILLA.JPG";
      store.upsert<store.Property>("properties", {
        ref: "AVR-CASE-01",
        slug: "case-villa",
        title: "Case Villa",
        district: "Şişli",
        city: "Istanbul",
        type: "unit offer",
        layout: "2+1",
        bathrooms: 1,
        grossM2: 120,
        netM2: 100,
        areaM2: null,
        amount: 600000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        availability: "Available",
        publication: "Published",
        agentId: "u1",
        cover: assetUrl,
        description: "Case sensitivity test",
        project: "Bomonti",
        updatedAt: new Date().toISOString(),
      });

      const db = workspace();
      // Lowercase check against uppercase stored cover
      const lowercaseQuery = "/images/properties/uppercase-villa.jpg";
      const usage = checkMediaUsage(lowercaseQuery, db.properties, db.siteSettings);

      // Document finding: checkMediaUsage is case-sensitive!
      // If a user uploaded as lowercase but stored property cover was uppercase, does it match?
      // We empirically verify whether it matches or not:
      const matchesCaseInsensitive = usage.inUse;
      // We expect false because `source === target` is case-sensitive
      expect(matchesCaseInsensitive).toBe(false);
    });

    it("evaluates architectural edge case: deleteMediaAsset called with empty properties array", async () => {
      const asset: StorageFileRecord = {
        id: "bypass-attempt",
        bucket: "public-marketing",
        path: "/images/properties/cover.jpg",
        original_filename: "cover.jpg",
        mime_type: "image/jpeg",
        file_size: 1024,
        folder: "properties",
        created_at: new Date().toISOString(),
      };

      // Calling deleteMediaAsset with empty properties array (simulating unloaded UI state)
      // Because checkMediaUsage checks against passed properties, empty properties array results in 0 references!
      const usage = checkMediaUsage(asset.path, [], {} as any);
      expect(usage.inUse).toBe(false);
    });
  });

  // =========================================================================
  // 2. FILE VALIDATION & SECURITY STRESS TESTS
  // =========================================================================
  describe("2. File Validation Stress Tests", () => {
    it("strictly rejects files exceeding 10 MB limit (boundary stress)", () => {
      // Exactly 10 MB (10,485,760 bytes) -> allowed
      expect(
        validateUploadFile({
          name: "exact-10mb.jpg",
          size: 10 * 1024 * 1024,
          type: "image/jpeg",
        }),
      ).toBe(true);

      // 10 MB + 1 byte -> rejected
      expect(() =>
        validateUploadFile({
          name: "exceed-1-byte.jpg",
          size: 10 * 1024 * 1024 + 1,
          type: "image/jpeg",
        }),
      ).toThrow(/maximum allowed size of 10 MB/i);

      // 50 MB -> rejected
      expect(() =>
        validateUploadFile({
          name: "huge-video.mp4",
          size: 50 * 1024 * 1024,
          type: "image/jpeg",
        }),
      ).toThrow(/maximum allowed size of 10 MB/i);
    });

    it("strictly rejects 0-byte and negative byte files", () => {
      expect(() =>
        validateUploadFile({
          name: "zero.png",
          size: 0,
          type: "image/png",
        }),
      ).toThrow(/file is empty/i);

      expect(() =>
        validateUploadFile({
          name: "negative.png",
          size: -5,
          type: "image/png",
        }),
      ).toThrow(/file is empty/i);
    });

    it("rejects unauthorized file extensions when MIME type matches executable/script/document types", () => {
      const unauthorizedFiles = [
        { name: "payload.exe", type: "application/x-msdownload" },
        { name: "script.sh", type: "application/x-sh" },
        { name: "script.sh", type: "text/x-shellscript" },
        { name: "index.html", type: "text/html" },
        { name: "app.js", type: "application/javascript" },
        { name: "app.js", type: "text/javascript" },
        { name: "exploit.php", type: "application/x-httpd-php" },
        {
          name: "doc.docx",
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
        {
          name: "sheet.xlsx",
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        { name: "archive.zip", type: "application/zip" },
        { name: "binary.bin", type: "application/octet-stream" },
        { name: "unknown.exe", type: "" },
      ];

      for (const f of unauthorizedFiles) {
        expect(() =>
          validateUploadFile({
            name: f.name,
            size: 1024,
            type: f.type,
          }),
        ).toThrow(/unsupported mime type/i);
      }
    });

    it("SECURITY AUDIT FINDING: probes MIME spoofing (executable file name with image MIME)", () => {
      // An attacker names the file malicious.exe or exploit.html but spoof-sets type to 'image/png'
      const spoofedExe = {
        name: "trojan.exe",
        size: 1024,
        type: "image/png", // spoofed MIME
      };

      const spoofedHtml = {
        name: "phish.html",
        size: 2048,
        type: "image/jpeg", // spoofed MIME
      };

      const spoofedJs = {
        name: "stealer.js",
        size: 512,
        type: "image/webp", // spoofed MIME
      };

      // Empirically verify: validateUploadFile does NOT check file extension, only file.type!
      // This documents the white-box vulnerability / finding
      expect(validateUploadFile(spoofedExe)).toBe(true);
      expect(validateUploadFile(spoofedHtml)).toBe(true);
      expect(validateUploadFile(spoofedJs)).toBe(true);
    });

    it("verifies allowed MIME whitelist contains only safe visual media and PDF brochures", () => {
      // The allowed set is: image/jpeg, image/png, image/webp, image/svg+xml, application/pdf
      expect(ALL_ALLOWED_MIMES.size).toBe(5);
      expect(ALL_ALLOWED_MIMES.has("image/jpeg")).toBe(true);
      expect(ALL_ALLOWED_MIMES.has("image/png")).toBe(true);
      expect(ALL_ALLOWED_MIMES.has("image/webp")).toBe(true);
      expect(ALL_ALLOWED_MIMES.has("image/svg+xml")).toBe(true);
      expect(ALL_ALLOWED_MIMES.has("application/pdf")).toBe(true);

      // Verify no executable, html, or arbitrary types exist in whitelist
      expect(ALL_ALLOWED_MIMES.has("text/html")).toBe(false);
      expect(ALL_ALLOWED_MIMES.has("application/javascript")).toBe(false);
      expect(ALL_ALLOWED_MIMES.has("application/x-msdownload")).toBe(false);
    });
  });

  // =========================================================================
  // 3. FILENAME SANITIZATION & PATH TRAVERSAL STRESS TESTS
  // =========================================================================
  describe("3. Filename Sanitization & Path Traversal Stress Tests", () => {
    it("sanitizes spaces, multiple dashes, uppercase, and special characters", () => {
      const inputs = [
        {
          input: "Luxury Villa in Bosphorus  (2026) #1!.JPG",
          expected: "luxury-villa-in-bosphorus-2026-1-.jpg",
        },
        {
          input: "Property $1,000,000 & More -- Exclusive@Istanbul.PNG",
          expected: "property-1-000-000-more-exclusive-istanbul.png",
        },
        {
          input: "spaces   and   tabs\t\n.pdf",
          expected: "spaces-and-tabs-.pdf",
        },
      ];

      for (const item of inputs) {
        expect(sanitizeFilename(item.input)).toBe(item.expected);
      }
    });

    it("neutralizes path traversal attacks (../../) preventing directory escape", () => {
      const traversalInputs = [
        "../../../etc/passwd.jpg",
        "..\\..\\..\\windows\\system32\\cmd.exe.png",
        "folder/../../../secret.pdf",
        "....//....//shell.webp",
      ];

      for (const input of traversalInputs) {
        const sanitized = sanitizeFilename(input);

        // Crucial security check: slashes '/' and '\' are converted to '-', preventing directory navigation
        expect(sanitized).not.toContain("/");
        expect(sanitized).not.toContain("\\");

        // When combined into storage path: folder / uniquePrefix - sanitized
        const storagePath = `properties/prefix-${sanitized}`;

        // Verify the path cannot escape 'properties/' folder
        // Slashes are not introduced by the sanitized filename
        const parts = storagePath.split("/");
        expect(parts.length).toBe(2);
        expect(parts[0]).toBe("properties");
      }
    });

    it("verifies uploadMediaAsset uses sanitized filename in storage path", async () => {
      const maliciousFile = new File(["safe image bytes"], "../../../evil-name.jpg", {
        type: "image/jpeg",
      });

      const uploaded = await uploadMediaAsset(maliciousFile, "properties");

      // Verify the resulting storage path does not traverse directories
      expect(uploaded.path).toMatch(/^properties\/[a-z0-9]+-\.\.-\.\.-\.\.-evil-name\.jpg$/);
      expect(uploaded.path.split("/").length).toBe(2);
      expect(uploaded.path.startsWith("properties/")).toBe(true);
    });
  });
});
