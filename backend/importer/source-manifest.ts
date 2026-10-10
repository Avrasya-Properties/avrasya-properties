import fs from "node:fs";
import path from "node:path";

export interface SourceFileMetadata {
  id: string;
  folder: string;
  filename: string;
  asset_path: string;
  drive_url: string;
  mime_type: string;
  bytes: number;
  sha256: string;
}

export interface SourceArea {
  value_m2: number;
  basis: "gross" | "net" | "unspecified";
  layout?: string;
  scope?: string;
  unit_count?: number;
}

export interface SourcePrice {
  currency: "USD" | "TRY" | null;
  amount: number | null;
  basis: string;
  status: string;
  down_payment_amount?: number;
  down_payment_percent?: number;
  delivery_payment_amount?: number;
  delivery_payment_percent?: number;
  installment_amount?: number;
  installment_count?: number;
  expenses_amount?: number;
  source_offers?: { amount: number; basis: string; source_id: string; area_m2: number | null }[];
}

export interface SourcePropertyRecord {
  slug: string;
  marketing_title: string;
  title_provenance?: string;
  city: string;
  location_label: string | null;
  side: "Europe" | "Asia" | "unknown";
  record_type: "unit_offer" | "unit_type" | "package" | "project" | "ambiguous_offer";
  layout_label: string | null;
  price: SourcePrice;
  areas: SourceArea[];
  source_ids: string[];
  availability_verified: boolean;
  citizenship_eligibility?: string;
  price_effective_date?: string | null;
  details: {
    project?: string;
    note?: string;
    delivery_source?: string | null;
    installment_offer?: {
      currency: string;
      total?: number;
      down_payment_percent?: number;
      months?: number;
      down_payment_amount?: number;
      delivery_payment_amount?: number;
      monthly_payment?: number;
    };
    claims_requiring_confirmation?: string[];
    features_source?: string[];
    [k: string]: unknown;
  };
}

export interface LegacySnapshotRecord {
  slug: string;
  price_usd: number;
}

export interface SourceDataManifest {
  schema_version: string;
  reviewed_on: string;
  root_drive_url: string;
  scope: {
    folders: number;
    files: number;
    image_files: number;
    unique_image_hashes: number;
    pdf_files: number;
    video_files: number;
    editorial_offer_project_records: number;
    counts_not_verified_available_units: boolean;
  };
  global_rules: string[];
  sources: SourceFileMetadata[];
  records: SourcePropertyRecord[];
  legacy_snapshot_only_records: LegacySnapshotRecord[];
  catalog: {
    source_id: string;
    page_count: number;
    service_phases: string[];
    contact: {
      email: string;
      phone: string;
      primary_location: string;
      back_cover_location_text: string;
      tagline: string;
    };
    review_notes: string[];
  };
}

export function loadSourceManifest(workspaceRoot?: string): SourceDataManifest {
  const root = workspaceRoot || process.cwd();
  const filePath = path.resolve(root, "src/data/source.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as SourceDataManifest;
}

export const getSourceManifest = loadSourceManifest;

export function getSourceStats(manifest?: SourceDataManifest) {
  const m = manifest || loadSourceManifest();
  const folders = new Set(m.sources.map((s) => s.folder));
  const hashes = new Set(m.sources.map((s) => s.sha256));
  const images = m.sources.filter((s) => s.mime_type.startsWith("image/"));
  const pdfs = m.sources.filter((s) => s.mime_type === "application/pdf");
  const videos = m.sources.filter((s) => s.mime_type.startsWith("video/"));

  return {
    totalFolders: folders.size,
    totalFiles: m.sources.length,
    imageCount: images.length,
    pdfCount: pdfs.length,
    videoCount: videos.length,
    uniqueHashCount: hashes.size,
  };
}
