import { useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  ExternalLink,
  FileText,
  Filter,
  FolderKanban,
  Image as ImageIcon,
  LayoutGrid,
  List,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  Check,
  ShieldCheck,
  AlertTriangle,
  ArrowUpDown,
  Download,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { PageHead, btnGhost, btnPrimary, field } from "@/admin/Shell";
import { useDB, useSession } from "@/admin/store";
import {
  checkMediaUsage,
  formatFileSize,
  getPublicStorageUrl,
  ALLOWED_IMAGE_MIMES,
  ALLOWED_DOCUMENT_MIMES,
} from "./safety";
import {
  copyAssetUrl,
  deleteMediaAsset,
  loadMediaAssets,
  replaceMediaAsset,
} from "./storage-service";
import { AssetSafetyDialog } from "./AssetSafetyDialog";
import { MediaUploadZone } from "./MediaUploadZone";
import type { MediaCategory, MediaReference, StorageFileRecord } from "./types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CATEGORIES: Array<{ key: MediaCategory; label: string }> = [
  { key: "all", label: "All Assets" },
  { key: "properties", label: "Properties" },
  { key: "developments", label: "Developments" },
  { key: "marketing", label: "Marketing" },
  { key: "brochures", label: "Brochures" },
  { key: "brand", label: "Brand" },
];

export function MediaLibrary() {
  const db = useDB();
  const user = useSession();

  const [assets, setAssets] = useState<StorageFileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filters & sorting
  const [activeCategory, setActiveCategory] = useState<MediaCategory>("all");
  const [search, setSearch] = useState("");
  const [mimeFilter, setMimeFilter] = useState<"all" | "images" | "documents">("all");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "name_asc" | "size_desc">(
    "date_desc",
  );

  // Selected asset for inspector
  const [selectedAsset, setSelectedAsset] = useState<StorageFileRecord | null>(null);

  // Safety warning dialog state
  const [safetyDialogOpen, setSafetyDialogOpen] = useState(false);
  const [safetyBlockedAsset, setSafetyBlockedAsset] = useState<string>("");
  const [activeReferences, setActiveReferences] = useState<MediaReference[]>([]);

  // Simple deletion confirmation dialog for unreferenced assets
  const [confirmDeleteAsset, setConfirmDeleteAsset] = useState<StorageFileRecord | null>(null);

  // Asset replacement state
  const [replaceTarget, setReplaceTarget] = useState<StorageFileRecord | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Load assets
  const reloadAssets = async () => {
    setLoading(true);
    try {
      const list = await loadMediaAssets();
      setAssets(list);
      // Refresh selected asset if open
      if (selectedAsset) {
        const updated = list.find((a) => a.id === selectedAsset.id);
        if (updated) setSelectedAsset(updated);
      }
    } catch (err: any) {
      toast.error(`Failed to load media assets: ${err?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadAssets();
    const handleUpdate = () => reloadAssets();
    window.addEventListener("storage-files-updated", handleUpdate);
    return () => window.removeEventListener("storage-files-updated", handleUpdate);
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: assets.length };
    for (const c of CATEGORIES) {
      if (c.key !== "all") {
        counts[c.key] = assets.filter((a) => a.folder === c.key).length;
      }
    }
    return counts;
  }, [assets]);

  // Filtered & sorted records
  const filteredAssets = useMemo(() => {
    const result = assets.filter((a) => {
      // Category filter
      if (activeCategory !== "all" && a.folder !== activeCategory) return false;

      // MIME type filter
      if (mimeFilter === "images" && !ALLOWED_IMAGE_MIMES.has(a.mime_type)) return false;
      if (mimeFilter === "documents" && !ALLOWED_DOCUMENT_MIMES.has(a.mime_type)) return false;

      // Search query filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = a.original_filename.toLowerCase().includes(q);
        const matchesPath = a.path.toLowerCase().includes(q);
        if (!matchesName && !matchesPath) return false;
      }

      return true;
    });

    // Sorting
    return [...result].sort((a, b) => {
      if (sortBy === "date_desc") return b.created_at.localeCompare(a.created_at);
      if (sortBy === "date_asc") return a.created_at.localeCompare(b.created_at);
      if (sortBy === "name_asc") return a.original_filename.localeCompare(b.original_filename);
      if (sortBy === "size_desc") return b.file_size - a.file_size;
      return 0;
    });
  }, [assets, activeCategory, mimeFilter, search, sortBy]);

  // Overall storage stats
  const totalStorageBytes = useMemo(
    () => assets.reduce((sum, a) => sum + (a.file_size || 0), 0),
    [assets],
  );

  // Copy URL with toast
  const handleCopyUrl = async (asset: StorageFileRecord) => {
    try {
      const url = await copyAssetUrl(asset);
      toast.success("Public URL copied to clipboard");
    } catch {
      toast.error("Could not copy URL to clipboard");
    }
  };

  // Pre-deletion safety check
  const handleDeleteAttempt = (asset: StorageFileRecord) => {
    const publicUrl = asset.public_url || getPublicStorageUrl(asset.path);
    const pathCheck = checkMediaUsage(asset.path, db.properties, db.siteSettings);
    const urlCheck = checkMediaUsage(publicUrl, db.properties, db.siteSettings);

    const combined: MediaReference[] = [...pathCheck.references];
    for (const r of urlCheck.references) {
      if (!combined.some((item) => item.id === r.id && item.type === r.type)) {
        combined.push(r);
      }
    }

    if (combined.length > 0) {
      // Block deletion and show safety dialog
      setSafetyBlockedAsset(asset.original_filename);
      setActiveReferences(combined);
      setSafetyDialogOpen(true);
    } else {
      // Asset is safe to delete
      setConfirmDeleteAsset(asset);
    }
  };

  const confirmDelete = async () => {
    if (!confirmDeleteAsset) return;
    try {
      await deleteMediaAsset(confirmDeleteAsset, db.properties, db.siteSettings);
      toast.success(`Deleted "${confirmDeleteAsset.original_filename}".`);
      if (selectedAsset?.id === confirmDeleteAsset.id) {
        setSelectedAsset(null);
      }
      setConfirmDeleteAsset(null);
      reloadAssets();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete asset");
    }
  };

  // Replacement trigger
  const handleStartReplace = (asset: StorageFileRecord) => {
    setReplaceTarget(asset);
    replaceFileInputRef.current?.click();
  };

  const handleReplacementFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceTarget) return;

    try {
      await replaceMediaAsset(replaceTarget, file);
      toast.success(`Replaced asset "${replaceTarget.original_filename}" with "${file.name}".`);
      setReplaceTarget(null);
      reloadAssets();
    } catch (err: any) {
      toast.error(`Replacement failed: ${err?.message || "Unknown error"}`);
    } finally {
      e.target.value = "";
    }
  };

  const canManage = user?.role === "admin" || user?.role === "manager";

  return (
    <div className="space-y-6">
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,application/pdf"
        className="sr-only"
        onChange={handleReplacementFileSelected}
      />

      <PageHead
        title="Media Library"
        crumbs="Content & Assets"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={reloadAssets}
              disabled={loading}
              className={btnGhost}
              title="Refresh media files"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-brass ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {canManage && (
              <button onClick={() => setShowUpload(!showUpload)} className={btnPrimary}>
                <Upload className="h-3.5 w-3.5" />
                <span>{showUpload ? "Hide Upload" : "Upload Files"}</span>
              </button>
            )}
          </div>
        }
      />

      {/* Top summary cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Assets
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {assets.length}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Managed in Supabase Storage</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Storage Consumed
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatFileSize(totalStorageBytes)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Bucket: public-marketing</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Protected Storage
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-emerald-600 font-semibold text-base">
            <ShieldCheck className="h-5 w-5" />
            <span>In-Use Guard Active</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Zero accidental deletions</p>
        </div>
      </div>

      {/* Collapsible Multi-File Upload Zone */}
      {showUpload && (
        <MediaUploadZone
          currentCategory={activeCategory}
          onUploadComplete={() => {
            reloadAssets();
          }}
        />
      )}

      {/* Folder Tabs */}
      <div className="flex overflow-x-auto border-b pb-px gap-1">
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.key;
          const count = categoryCounts[cat.key] ?? 0;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                active
                  ? "border-brass text-brass font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-mono ${
                  active ? "bg-brass/20 text-brass" : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and View Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
          {/* Search */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search filename or path…"
              className={`${field} pl-8`}
            />
          </div>

          {/* MIME Filter */}
          <select
            value={mimeFilter}
            onChange={(e) => setMimeFilter(e.target.value as any)}
            className={`${field} w-36`}
          >
            <option value="all">All File Types</option>
            <option value="images">Images Only</option>
            <option value="documents">PDF Documents</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`${field} w-40`}
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="size_desc">Largest Size</option>
          </select>
        </div>

        {/* View Mode Switcher */}
        <div className="flex rounded-md border bg-card p-0.5 text-muted-foreground">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded ${viewMode === "grid" ? "bg-muted text-foreground" : "hover:text-foreground"}`}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded ${viewMode === "table" ? "bg-muted text-foreground" : "hover:text-foreground"}`}
            title="Table View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6 items-start">
        {/* Asset Grid or Table */}
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="flex h-60 items-center justify-center rounded-lg border bg-card text-sm text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin mr-2 text-brass" />
              Loading media files…
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed bg-card text-center p-6">
              <ImageIcon className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-base font-semibold text-foreground">No media assets found</p>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                {search || mimeFilter !== "all" || activeCategory !== "all"
                  ? "No files match your current filters. Clear search or select another category."
                  : "Start uploading photos, PDFs, or brand logos to populate your central library."}
              </p>
              {canManage && (
                <button onClick={() => setShowUpload(true)} className={`${btnPrimary} mt-4`}>
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Files Now</span>
                </button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            /* Visual Grid View */
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
              {filteredAssets.map((asset) => {
                const isSelected = selectedAsset?.id === asset.id;
                const isPdf = asset.mime_type === "application/pdf";
                const previewSrc = asset.public_url || asset.path;

                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`group relative flex flex-col overflow-hidden rounded-lg border bg-card text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-brass ring-2 ring-brass/40 shadow-sm"
                        : "hover:border-brass/50 hover:bg-muted/30"
                    }`}
                  >
                    {/* Media Preview Box */}
                    <div className="aspect-[4/3] w-full bg-muted/60 relative overflow-hidden flex items-center justify-center">
                      {isPdf ? (
                        <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
                          <FileText className="h-10 w-10 text-brass mb-1" />
                          <span className="rounded bg-brass/10 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase text-brass">
                            PDF
                          </span>
                        </div>
                      ) : (
                        <img
                          src={previewSrc}
                          alt={asset.original_filename}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/images/properties/cover.jpg";
                          }}
                        />
                      )}

                      {/* Quick actions overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(asset);
                          }}
                          title="Copy public URL"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-primary hover:bg-white shadow-sm"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        {canManage && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAttempt(asset);
                            }}
                            title="Delete asset"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive shadow-sm"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Category Folder Badge */}
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium backdrop-blur-xs capitalize text-foreground border">
                        {asset.folder}
                      </span>
                    </div>

                    {/* Meta Footer */}
                    <div className="p-2.5">
                      <p
                        className="truncate text-xs font-semibold text-foreground"
                        title={asset.original_filename}
                      >
                        {asset.original_filename}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
                        <span>{formatFileSize(asset.file_size)}</span>
                        <span>
                          {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Structured Table View */
            <div className="overflow-x-auto rounded-lg border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="p-3 w-12">Preview</th>
                    <th className="p-3">Filename</th>
                    <th className="p-3">Folder</th>
                    <th className="p-3">Type</th>
                    <th className="p-3 text-right">Size</th>
                    <th className="p-3">Uploaded</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset) => {
                    const isSelected = selectedAsset?.id === asset.id;
                    const isPdf = asset.mime_type === "application/pdf";
                    const previewSrc = asset.public_url || asset.path;

                    return (
                      <tr
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className={`cursor-pointer border-b last:border-0 hover:bg-muted/50 ${
                          isSelected ? "bg-muted" : ""
                        }`}
                      >
                        <td className="p-2">
                          <div className="h-9 w-12 rounded overflow-hidden bg-muted flex items-center justify-center border">
                            {isPdf ? (
                              <FileText className="h-4 w-4 text-brass" />
                            ) : (
                              <img
                                src={previewSrc}
                                alt=""
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src =
                                    "/images/properties/cover.jpg";
                                }}
                              />
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-medium text-foreground max-w-xs truncate">
                          {asset.original_filename}
                        </td>
                        <td className="p-3">
                          <span className="rounded bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                            {asset.folder}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground font-mono">
                          {asset.mime_type}
                        </td>
                        <td className="p-3 text-right tabular-nums text-xs">
                          {formatFileSize(asset.file_size)}
                        </td>
                        <td className="p-3 text-xs text-muted-foreground tabular-nums">
                          {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="p-3 text-right">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleCopyUrl(asset)}
                              title="Copy URL"
                              className="p-1 text-muted-foreground hover:text-foreground"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            {canManage && (
                              <button
                                type="button"
                                onClick={() => handleDeleteAttempt(asset)}
                                title="Delete"
                                className="p-1 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Asset Inspector Drawer */}
        {selectedAsset && (
          <aside className="w-80 shrink-0 rounded-xl border bg-card p-5 space-y-4 sticky top-20 shadow-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-sm text-foreground">Asset Inspector</h3>
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>

            {/* Large Preview */}
            <div className="aspect-[4/3] w-full rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
              {selectedAsset.mime_type === "application/pdf" ? (
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <FileText className="h-12 w-12 text-brass mb-2" />
                  <p className="text-xs font-semibold text-foreground">
                    {selectedAsset.original_filename}
                  </p>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono mt-1">
                    PDF Document
                  </span>
                </div>
              ) : (
                <img
                  src={selectedAsset.public_url || selectedAsset.path}
                  alt={selectedAsset.original_filename}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/images/properties/cover.jpg";
                  }}
                />
              )}
            </div>

            {/* Asset Metadata List */}
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Filename</span>
                <span className="font-medium text-foreground break-all">
                  {selectedAsset.original_filename}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Size</span>
                  <span className="font-medium text-foreground tabular-nums">
                    {formatFileSize(selectedAsset.file_size)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Folder</span>
                  <span className="font-medium capitalize text-foreground">
                    {selectedAsset.folder}
                  </span>
                </div>
              </div>
              <div className="pt-1">
                <span className="text-muted-foreground block text-[11px]">Storage Path</span>
                <span className="font-mono text-[10px] text-muted-foreground break-all">
                  {selectedAsset.path}
                </span>
              </div>
              <div className="pt-1">
                <span className="text-muted-foreground block text-[11px]">MIME Type</span>
                <span className="font-mono text-[10px] text-foreground">
                  {selectedAsset.mime_type}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => handleCopyUrl(selectedAsset)}
                className="w-full flex items-center justify-center gap-2 rounded-sm border bg-background px-3 py-2 text-xs font-medium text-foreground hover:border-brass hover:text-brass"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Public URL</span>
              </button>

              <a
                href={selectedAsset.public_url || getPublicStorageUrl(selectedAsset.path)}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-sm border bg-background px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open in New Tab</span>
              </a>

              {canManage && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStartReplace(selectedAsset)}
                    className="w-full flex items-center justify-center gap-2 rounded-sm border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Replace Asset (Same Path)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteAttempt(selectedAsset)}
                    className="w-full flex items-center justify-center gap-2 rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Asset</span>
                  </button>
                </>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Safety Warning Dialog */}
      <AssetSafetyDialog
        open={safetyDialogOpen}
        onOpenChange={setSafetyDialogOpen}
        assetName={safetyBlockedAsset}
        references={activeReferences}
      />

      {/* Confirmation Dialog for Safe Deletion */}
      <Dialog
        open={confirmDeleteAsset !== null}
        onOpenChange={(open) => !open && setConfirmDeleteAsset(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Delete Media Asset</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Safety check confirmed: this asset has zero active references in property listings or
              website design.
            </DialogDescription>
          </DialogHeader>

          <p className="py-2 text-sm text-foreground">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold break-all">
              "{confirmDeleteAsset?.original_filename}"
            </span>
            ? This operation cannot be undone.
          </p>

          <DialogFooter className="mt-2">
            <button
              type="button"
              onClick={() => setConfirmDeleteAsset(null)}
              className="inline-flex h-9 items-center justify-center rounded-sm border px-3 text-xs font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="inline-flex h-9 items-center justify-center rounded-sm bg-destructive px-4 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90"
            >
              Permanently Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
