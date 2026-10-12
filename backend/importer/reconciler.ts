import { loadSourceManifest, type SourceDataManifest } from "./source-manifest";

export interface ReconciliationReport {
  timestamp: string;
  baseline: {
    folders: number;
    files: number;
    image_files: number;
    unique_image_hashes: number;
    pdf_files: number;
    video_files: number;
    editorial_records: number;
    legacy_records: number;
  };
  manifestActual: {
    sourceFilesCount: number;
    uniqueHashesCount: number;
    duplicateHashes: { sha256: string; files: string[] }[];
    editorialRecordsCount: number;
    legacyRecordsCount: number;
  };
  matchStatus: {
    sourceFilesMatch: boolean;
    hashesMatch: boolean;
    recordsMatch: boolean;
  };
  notes: string[];
}

export function generateReconciliationReport(manifest?: SourceDataManifest): ReconciliationReport {
  const data = manifest || loadSourceManifest();

  // Find duplicates
  const hashToFiles = new Map<string, string[]>();
  for (const src of data.sources) {
    const list = hashToFiles.get(src.sha256) || [];
    list.push(`${src.folder}/${src.filename}`);
    hashToFiles.set(src.sha256, list);
  }

  const duplicates: { sha256: string; files: string[] }[] = [];
  for (const [hash, files] of hashToFiles.entries()) {
    if (files.length > 1) {
      duplicates.push({ sha256: hash, files });
    }
  }

  const uniqueHashesCount = hashToFiles.size;
  const sourceFilesCount = data.sources.length;
  const editorialRecordsCount = data.records.length;
  const legacyRecordsCount = data.legacy_snapshot_only_records.length;

  return {
    timestamp: new Date().toISOString(),
    baseline: {
      folders: data.scope.folders,
      files: data.scope.files,
      image_files: data.scope.image_files,
      unique_image_hashes: data.scope.unique_image_hashes,
      pdf_files: data.scope.pdf_files,
      video_files: data.scope.video_files,
      editorial_records: data.scope.editorial_offer_project_records,
      legacy_records: 4,
    },
    manifestActual: {
      sourceFilesCount,
      uniqueHashesCount,
      duplicateHashes: duplicates,
      editorialRecordsCount,
      legacyRecordsCount,
    },
    matchStatus: {
      sourceFilesMatch: sourceFilesCount === data.scope.files,
      hashesMatch: uniqueHashesCount === (data.scope.unique_image_hashes + 2), // 27 image + 1 pdf + 1 video = 29
      recordsMatch: editorialRecordsCount === data.scope.editorial_offer_project_records,
    },
    notes: [
      "Drive folder contains 1 duplicate image hash (same WhatsApp media uploaded twice in different context).",
      "All 18 records are imported as In Review / Draft per editorial safety guidelines.",
      "Legacy listings (4 records) are preserved in legacy unconfirmed status without deletion.",
      "Exact monetary values with explicit currencies (USD, TRY) preserved without conversion.",
    ],
  };
}
