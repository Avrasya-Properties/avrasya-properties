import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatFileSize } from "./safety";
import { uploadMediaAsset } from "./storage-service";
import type { MediaCategory } from "./types";

interface MediaUploadZoneProps {
  currentCategory?: MediaCategory;
  onUploadComplete?: () => void;
  className?: string;
}

type FileQueueItem = {
  id: string;
  file: File;
  status: "queued" | "uploading" | "done" | "error";
  errorMessage?: string | undefined;
  previewUrl?: string | undefined;
};

const CATEGORIES: Array<{ key: MediaCategory; label: string }> = [
  { key: "properties", label: "Properties" },
  { key: "developments", label: "Developments" },
  { key: "marketing", label: "Marketing" },
  { key: "brochures", label: "Brochures" },
  { key: "brand", label: "Brand" },
];

export function MediaUploadZone({
  currentCategory = "properties",
  onUploadComplete,
  className = "",
}: MediaUploadZoneProps) {
  const [folder, setFolder] = useState<MediaCategory>(
    currentCategory === "all" ? "properties" : currentCategory,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<FileQueueItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFilesToQueue = (files: File[]) => {
    const newItems: FileQueueItem[] = files.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      status: "queued",
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));
    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const removeItem = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((x) => x.id === id);
      if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((x) => x.id !== id);
    });
  };

  const clearQueue = () => {
    queue.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setQueue([]);
  };

  const startUpload = async () => {
    if (queue.length === 0 || uploading) return;
    setUploading(true);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i]!;
      if (item.status === "done") continue;

      setQueue((prev) => prev.map((it, idx) => (idx === i ? { ...it, status: "uploading" } : it)));

      try {
        await uploadMediaAsset(item.file, folder);
        successCount++;
        setQueue((prev) => prev.map((it, idx) => (idx === i ? { ...it, status: "done" } : it)));
      } catch (err: any) {
        failCount++;
        const message = err?.message || "Upload failed";
        setQueue((prev) =>
          prev.map((it, idx) =>
            idx === i ? { ...it, status: "error", errorMessage: message } : it,
          ),
        );
        toast.error(`Error uploading "${item.file.name}": ${message}`);
      }
    }

    setUploading(false);

    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} file(s) to "${folder}".`);
      onUploadComplete?.();
    }
  };

  return (
    <div className={`rounded-xl border bg-card p-4 sm:p-6 space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-base text-foreground">Upload Media Assets</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drag and drop images or brochures (JPEG, PNG, WebP, SVG, PDF up to 10 MB).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">Target Folder:</label>
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value as MediaCategory)}
            disabled={uploading}
            className="h-8 rounded-sm border bg-background px-2.5 text-xs font-medium outline-none focus:border-brass"
          >
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Drag & Drop Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-all ${
          isDragging
            ? "border-brass bg-brass/10 scale-[1.01]"
            : "border-muted-foreground/25 hover:border-brass/70 hover:bg-muted/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/svg+xml,application/pdf"
          onChange={handleFileInputChange}
          className="sr-only"
        />

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brass/10 text-brass mb-3">
          <Upload className="h-5 w-5" />
        </div>

        <p className="text-sm font-medium text-foreground">
          Drop multiple files here, or <span className="text-brass hover:underline">browse</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Single or bulk upload · Automatic filename sanitization · Safe to 10 MB
        </p>
      </div>

      {/* Upload Queue */}
      {queue.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">{queue.length} file(s) selected</span>
            <div className="flex items-center gap-2">
              {!uploading && (
                <button
                  type="button"
                  onClick={clearQueue}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={startUpload}
                disabled={uploading || queue.every((it) => it.status === "done")}
                className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-brass px-3 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Uploading…</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload to {folder}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid gap-2 max-h-56 overflow-y-auto pr-1 sm:grid-cols-2">
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2.5 rounded-md border bg-background p-2 text-xs"
              >
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-9 w-9 rounded object-cover shrink-0 border"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded bg-muted text-muted-foreground shrink-0">
                    {item.file.type === "application/pdf" ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{item.file.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatFileSize(item.file.size)}
                  </p>
                  {item.errorMessage && (
                    <p className="text-[10px] text-destructive truncate">{item.errorMessage}</p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  {item.status === "uploading" && (
                    <Loader2 className="h-4 w-4 animate-spin text-brass" />
                  )}
                  {item.status === "done" && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                  {item.status === "error" && <AlertCircle className="h-4 w-4 text-destructive" />}
                  {item.status === "queued" && !uploading && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
