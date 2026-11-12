import { useEffect, useMemo, useState } from "react";
import { Search, Image as ImageIcon, FileText, Check, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatFileSize } from "./safety";
import { loadMediaAssets } from "./storage-service";
import { MediaUploadZone } from "./MediaUploadZone";
import type { MediaCategory, StorageFileRecord } from "./types";

export interface MediaPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string, asset: StorageFileRecord) => void;
  title?: string;
  allowedMimes?: string[];
  initialCategory?: MediaCategory;
}

const CATEGORIES: Array<{ key: MediaCategory; label: string }> = [
  { key: "all", label: "All" },
  { key: "properties", label: "Properties" },
  { key: "developments", label: "Developments" },
  { key: "marketing", label: "Marketing" },
  { key: "brochures", label: "Brochures" },
  { key: "brand", label: "Brand" },
];

export function MediaPickerModal({
  open,
  onOpenChange,
  onSelect,
  title = "Select Media Asset",
  allowedMimes,
  initialCategory = "all",
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"browse" | "upload">("browse");
  const [category, setCategory] = useState<MediaCategory>(initialCategory);
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<StorageFileRecord | null>(null);
  const [assets, setAssets] = useState<StorageFileRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const records = await loadMediaAssets();
      setAssets(records);
    } catch (err) {
      console.error("Failed to load assets for picker:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAssets();
    }
  }, [open]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Category match
      if (category !== "all" && asset.folder !== category) return false;

      // MIME match
      if (allowedMimes && allowedMimes.length > 0 && !allowedMimes.includes(asset.mime_type)) {
        return false;
      }

      // Search match
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = asset.original_filename.toLowerCase().includes(q);
        const matchesPath = asset.path.toLowerCase().includes(q);
        if (!matchesName && !matchesPath) return false;
      }

      return true;
    });
  }, [assets, category, allowedMimes, search]);

  const handleConfirmSelect = () => {
    if (!selectedAsset) return;
    const url = selectedAsset.public_url || selectedAsset.path;
    onSelect(url, selectedAsset);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden sm:max-h-[85vh] flex flex-col">
        <DialogHeader className="px-6 py-4 border-b bg-card">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold text-foreground">{title}</DialogTitle>
            <div className="flex rounded-md bg-muted p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("browse")}
                className={`rounded px-3 py-1 font-medium transition-colors ${
                  activeTab === "browse"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Browse Library ({assets.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`flex items-center gap-1 rounded px-3 py-1 font-medium transition-colors ${
                  activeTab === "upload"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Upload className="h-3 w-3" />
                Upload New
              </button>
            </div>
          </div>
        </DialogHeader>

        {activeTab === "upload" ? (
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <MediaUploadZone
              currentCategory={category}
              onUploadComplete={() => {
                fetchAssets();
                setActiveTab("browse");
              }}
            />
          </div>
        ) : (
          <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
            {/* Filter controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b bg-muted/20">
              {/* Category buttons */}
              <div className="flex flex-wrap items-center gap-1">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCategory(c.key)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      category === c.key
                        ? "bg-brass text-primary-foreground font-semibold"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search assets…"
                  className="h-8 w-full rounded-sm border bg-background pl-8 pr-2 text-xs outline-none focus:border-brass"
                />
              </div>
            </div>

            {/* Asset Grid */}
            <div className="flex-1 overflow-y-auto p-6 min-h-[280px] max-h-[50vh]">
              {loading ? (
                <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
                  Loading media library…
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-medium text-foreground">No media assets found</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Try another search keyword or switch to the upload tab.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {filteredAssets.map((asset) => {
                    const isSelected = selectedAsset?.id === asset.id;
                    const isPdf = asset.mime_type === "application/pdf";
                    const previewSrc = asset.public_url || asset.path;

                    return (
                      <div
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className={`group relative flex flex-col overflow-hidden rounded-md border bg-card text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-brass ring-2 ring-brass/40 shadow-sm"
                            : "hover:border-brass/50 hover:bg-muted/30"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="aspect-[4/3] w-full bg-muted/60 relative overflow-hidden flex items-center justify-center">
                          {isPdf ? (
                            <div className="flex flex-col items-center text-muted-foreground">
                              <FileText className="h-8 w-8 text-brass" />
                              <span className="text-[10px] font-mono mt-1 uppercase">PDF</span>
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

                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brass text-primary-foreground shadow-sm">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        {/* Card Info */}
                        <div className="p-2">
                          <p
                            className="truncate text-xs font-medium text-foreground"
                            title={asset.original_filename}
                          >
                            {asset.original_filename}
                          </p>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>{formatFileSize(asset.file_size)}</span>
                            <span className="capitalize">{asset.folder}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer with Selection Actions */}
            <div className="flex items-center justify-between border-t bg-card px-6 py-3">
              <div className="text-xs text-muted-foreground truncate max-w-md">
                {selectedAsset ? (
                  <span>
                    Selected: <b className="text-foreground">{selectedAsset.original_filename}</b> (
                    {formatFileSize(selectedAsset.file_size)})
                  </span>
                ) : (
                  <span>Click an asset to select it</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex h-8 items-center justify-center rounded-sm border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSelect}
                  disabled={!selectedAsset}
                  className="inline-flex h-8 items-center justify-center rounded-sm bg-brass px-4 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-40"
                >
                  Select Asset
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
