import type { Property, SiteSettings } from "@/admin/demo";
import { SUPABASE_URL } from "@/lib/supabase";
import type {
  MediaCategory,
  MediaReference,
  MediaUsageCheckResult,
  StorageFileRecord,
} from "./types";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);

export const ALLOWED_DOCUMENT_MIMES = new Set(["application/pdf"]);

export const ALL_ALLOWED_MIMES = new Set([...ALLOWED_IMAGE_MIMES, ...ALLOWED_DOCUMENT_MIMES]);

/**
 * Sanitizes filenames containing spaces, uppercase, and special characters.
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Validates a file before upload: non-empty, within size limit, and supported MIME type.
 */
export function validateUploadFile(file: { name: string; size: number; type: string }): true {
  if (file.size <= 0) {
    throw new Error("File is empty.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("File exceeds maximum allowed size of 10 MB.");
  }
  if (!ALL_ALLOWED_MIMES.has(file.type)) {
    throw new Error(`Unsupported MIME type: ${file.type}`);
  }
  return true;
}

/**
 * Generates the instant public URL for an asset in the public-marketing bucket.
 */
export function getPublicStorageUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const cleanBase = SUPABASE_URL.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${cleanBase}/storage/v1/object/public/public-marketing/${cleanPath}`;
}

/**
 * Formats bytes into a human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Scans active references across property listings (covers, galleries, floor plans)
 * and CMS website design settings to ensure no in-use asset is deleted.
 */
export function checkMediaUsage(
  assetPathOrUrl: string,
  properties: Property[] = [],
  siteSettings: SiteSettings = {} as SiteSettings,
): MediaUsageCheckResult {
  const references: MediaReference[] = [];
  if (!assetPathOrUrl) return { inUse: false, references };

  const target = assetPathOrUrl.trim();
  const filename = target.split("/").pop() || target;

  const matches = (source?: string | null): boolean => {
    if (!source) return false;
    if (source === target) return true;
    if (source.includes(target)) return true;
    if (target.includes(source)) return true;
    // Check match by basename if path is a URL
    if (filename.length > 3 && source.endsWith(filename)) return true;
    return false;
  };

  for (const p of properties) {
    // 1. Cover image check
    if (matches(p.cover)) {
      references.push({
        type: "property_cover",
        id: p.id,
        name: p.title || p.ref,
        details: `Property Cover (${p.ref})`,
      });
    }

    // 2. Gallery images check
    if (Array.isArray(p.galleryImages) && p.galleryImages.some(matches)) {
      references.push({
        type: "property_gallery",
        id: p.id,
        name: p.title || p.ref,
        details: `Property Gallery (${p.ref})`,
      });
    }

    // 3. Floor plan check
    if (matches(p.floorPlan)) {
      references.push({
        type: "property_floor_plan",
        id: p.id,
        name: p.title || p.ref,
        details: `Floor Plan (${p.ref})`,
      });
    }
  }

  // 4. CMS Website Design settings check
  if (siteSettings?.websiteDesign) {
    for (const [key, value] of Object.entries(siteSettings.websiteDesign)) {
      if (typeof value === "string" && matches(value)) {
        references.push({
          type: "cms_design",
          id: key,
          name: `Website Design (${key})`,
          details: `CMS Setting: ${key}`,
        });
      }
    }
  }

  return {
    inUse: references.length > 0,
    references,
  };
}

/**
 * Maps a file path or folder name to one of the canonical categories.
 */
export function normalizeCategory(folderOrPath: string): MediaCategory {
  const lower = folderOrPath.toLowerCase();
  if (lower.startsWith("prop") || lower.includes("offers")) return "properties";
  if (lower.startsWith("dev") || lower.includes("projects")) return "developments";
  if (lower.startsWith("mark") || lower.includes("hero")) return "marketing";
  if (lower.startsWith("broch") || lower.includes("catalog") || lower.includes("doc"))
    return "brochures";
  if (lower.startsWith("brand") || lower.includes("logo")) return "brand";
  return "properties";
}
