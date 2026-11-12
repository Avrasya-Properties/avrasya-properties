import { DEMO_MODE, supabase } from "@/lib/supabase";
import * as demo from "@/admin/demo";
import {
  checkMediaUsage,
  getPublicStorageUrl,
  normalizeCategory,
  sanitizeFilename,
  validateUploadFile,
} from "./safety";
import type { StorageFileRecord } from "./types";

const DEMO_KEY = "avrasya-admin-db-v4";

function getDemoDB(): demo.DB {
  return demo.load();
}

function saveDemoDB(db: demo.DB): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(DEMO_KEY, JSON.stringify(db));
    window.dispatchEvent(new Event("storage-files-updated"));
  }
}

/**
 * Loads all media records, supporting both live Supabase storage and local demo mode.
 */
export async function loadMediaAssets(): Promise<StorageFileRecord[]> {
  if (DEMO_MODE) {
    const db = getDemoDB();
    if (!db.storageFiles) {
      db.storageFiles = [];
    }

    // Enrich with public URLs and guarantee folder classification
    return db.storageFiles.map((file) => ({
      ...file,
      folder: file.folder || normalizeCategory(file.path),
      public_url: file.public_url || getPublicStorageUrl(file.path),
    }));
  }

  // Live remote Supabase mode
  const { data, error } = await supabase
    .from("storage_files")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Failed to load storage_files, falling back to local list:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    bucket: row.bucket || "public-marketing",
    path: row.path,
    original_filename: row.original_filename,
    mime_type: row.mime_type,
    file_size: Number(row.file_size || 0),
    folder: normalizeCategory(row.path),
    created_at: row.created_at,
    public_url: getPublicStorageUrl(row.path),
  }));
}

/**
 * Uploads a file to the public-marketing storage bucket and records metadata in storage_files.
 */
export async function uploadMediaAsset(
  file: File,
  targetFolder: string = "properties",
): Promise<StorageFileRecord> {
  // 1. Validation (size <= 10MB, non-empty, allowed MIME)
  validateUploadFile(file);

  const cleanName = sanitizeFilename(file.name);
  const folder = targetFolder.toLowerCase() === "all" ? "properties" : targetFolder.toLowerCase();
  const uniquePrefix =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Date.now().toString(36);
  const storagePath = `${folder}/${uniquePrefix}-${cleanName}`;

  if (DEMO_MODE) {
    const db = getDemoDB();
    if (!db.storageFiles) db.storageFiles = [];

    const publicUrl = getPublicStorageUrl(storagePath);
    const newRecord: StorageFileRecord = {
      id: "media-" + (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()),
      bucket: "public-marketing",
      path: storagePath,
      original_filename: file.name,
      mime_type: file.type || "application/octet-stream",
      file_size: file.size,
      folder: folder,
      created_at: new Date().toISOString(),
      public_url: publicUrl,
    };

    db.storageFiles.unshift(newRecord);
    saveDemoDB(db);
    return newRecord;
  }

  // Live Remote Supabase Mode
  const { error: uploadError } = await supabase.storage
    .from("public-marketing")
    .upload(storagePath, file, {
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const publicUrl = getPublicStorageUrl(storagePath);
  const newRow = {
    bucket: "public-marketing",
    path: storagePath,
    original_filename: file.name,
    mime_type: file.type,
    file_size: file.size,
    is_public: true,
  };

  const { data: inserted, error: metaError } = await supabase
    .from("storage_files")
    .insert(newRow)
    .select()
    .single();

  if (metaError) {
    console.warn(
      "Storage upload succeeded but storage_files row could not be inserted:",
      metaError,
    );
  }

  const record: StorageFileRecord = {
    id: inserted?.id || `file-${Date.now()}`,
    bucket: "public-marketing",
    path: storagePath,
    original_filename: file.name,
    mime_type: file.type,
    file_size: file.size,
    folder: folder,
    created_at: inserted?.created_at || new Date().toISOString(),
    public_url: publicUrl,
  };

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage-files-updated"));
  }

  return record;
}

/**
 * Replaces an existing media asset at the SAME storage path with a new file.
 */
export async function replaceMediaAsset(
  existingAsset: StorageFileRecord,
  newFile: File,
): Promise<StorageFileRecord> {
  // Validate replacement file
  validateUploadFile(newFile);

  if (DEMO_MODE) {
    const db = getDemoDB();
    if (!db.storageFiles) db.storageFiles = [];

    const index = db.storageFiles.findIndex(
      (f) => f.id === existingAsset.id || f.path === existingAsset.path,
    );
    const updatedRecord: StorageFileRecord = {
      ...existingAsset,
      original_filename: newFile.name,
      file_size: newFile.size,
      mime_type: newFile.type,
      created_at: new Date().toISOString(),
    };

    if (index >= 0) {
      db.storageFiles[index] = updatedRecord;
    } else {
      db.storageFiles.unshift(updatedRecord);
    }

    saveDemoDB(db);
    return updatedRecord;
  }

  // Live remote upload with upsert=true at exact same path
  const { error: uploadError } = await supabase.storage
    .from("public-marketing")
    .upload(existingAsset.path, newFile, {
      upsert: true,
      contentType: newFile.type,
    });

  if (uploadError) {
    throw new Error(`Asset replacement failed: ${uploadError.message}`);
  }

  const { data: updated, error: metaError } = await supabase
    .from("storage_files")
    .update({
      original_filename: newFile.name,
      file_size: newFile.size,
      mime_type: newFile.type,
      created_at: new Date().toISOString(),
    })
    .eq("id", existingAsset.id)
    .select()
    .single();

  if (metaError) {
    console.warn("Storage replaced but metadata update failed:", metaError);
  }

  const result: StorageFileRecord = {
    ...existingAsset,
    original_filename: newFile.name,
    file_size: newFile.size,
    mime_type: newFile.type,
    created_at: updated?.created_at || new Date().toISOString(),
    public_url: getPublicStorageUrl(existingAsset.path),
  };

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage-files-updated"));
  }

  return result;
}

/**
 * Deletes a media asset safely. Blocks deletion if active references exist.
 */
export async function deleteMediaAsset(
  asset: StorageFileRecord,
  properties: demo.Property[],
  siteSettings: demo.SiteSettings,
  force: boolean = false,
): Promise<void> {
  // 1. Safety check across active property covers, galleries, floor plans, and website design
  const publicUrl = asset.public_url || getPublicStorageUrl(asset.path);
  const check = checkMediaUsage(asset.path, properties, siteSettings);
  const checkUrl = checkMediaUsage(publicUrl, properties, siteSettings);

  const combinedReferences = [...check.references];
  for (const r of checkUrl.references) {
    if (!combinedReferences.some((existing) => existing.id === r.id && existing.type === r.type)) {
      combinedReferences.push(r);
    }
  }

  if (combinedReferences.length > 0 && !force) {
    const names = combinedReferences.map((r) => r.name).join(", ");
    throw new Error(`Cannot delete asset: in use by ${names}`);
  }

  if (DEMO_MODE) {
    const db = getDemoDB();
    if (db.storageFiles) {
      db.storageFiles = db.storageFiles.filter((f) => f.id !== asset.id && f.path !== asset.path);
      saveDemoDB(db);
    }
    return;
  }

  // Live remote deletion
  const { error: storageError } = await supabase.storage
    .from("public-marketing")
    .remove([asset.path]);

  if (storageError) {
    console.warn("Could not delete from storage bucket:", storageError);
  }

  const { error: dbError } = await supabase.from("storage_files").delete().eq("id", asset.id);

  if (dbError) {
    throw new Error(`Could not delete storage file metadata: ${dbError.message}`);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage-files-updated"));
  }
}

/**
 * Copies the public URL of an asset to the clipboard.
 */
export async function copyAssetUrl(asset: StorageFileRecord | string): Promise<string> {
  const url =
    typeof asset === "string"
      ? getPublicStorageUrl(asset)
      : asset.public_url || getPublicStorageUrl(asset.path);
  if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(url);
  }
  return url;
}
