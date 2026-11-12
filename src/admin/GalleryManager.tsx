import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, FolderKanban, ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { IMAGE_CATEGORIES } from "@/data/properties";
import {
  addGalleryItem,
  ensureGalleryItems,
  moveGalleryItem,
  removeGalleryItem,
  setPrimaryGalleryItem,
  updateGalleryItem,
  type GalleryResult,
  type GalleryState,
} from "./gallery-items";

const MAX_PHOTOS = 60;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const input =
  "w-full rounded border bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-brass";

type Props = {
  value: GalleryState;
  readOnly?: boolean;
  customCategories?: string[];
  upload: (file: File) => Promise<string>;
  onChange: (next: GalleryResult) => void;
  onOpenLibrary: () => void;
};

export function GalleryManager({
  value,
  readOnly,
  customCategories = [],
  upload,
  onChange,
  onOpenLibrary,
}: Props) {
  const items = ensureGalleryItems(value);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const categories = [...new Set([...IMAGE_CATEGORIES, ...customCategories])];

  // Always build on the latest state across several awaited uploads.
  const latest = useRef(value);
  latest.current = value;

  const uploadFiles = async (files: File[]) => {
    const valid = files.filter((f) => ACCEPT.includes(f.type));
    if (valid.length !== files.length) toast.error("Only JPG, PNG or WebP images are accepted.");
    if (items.length + valid.length > MAX_PHOTOS) {
      toast.error(`Use up to ${MAX_PHOTOS} gallery photos.`);
      return;
    }
    setBusy(true);
    try {
      let state: GalleryState = latest.current;
      for (const file of valid) {
        const url = await upload(file);
        state = addGalleryItem(state, url);
        latest.current = state;
        onChange(state as GalleryResult);
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const replaceFile = async (id: string, file: File | undefined) => {
    if (!file) return;
    try {
      const url = await upload(file);
      onChange(updateGalleryItem(value, id, { url }));
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="space-y-3" data-testid="gallery-manager">
      {!readOnly && (
        <div
          data-testid="gallery-dropzone"
          onDragOver={(e) => {
            if (dragIndex.current !== null) return;
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            if (dragIndex.current !== null) return;
            e.preventDefault();
            setDragOver(false);
            void uploadFiles(Array.from(e.dataTransfer?.files || []));
          }}
          className={`flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-5 text-center text-sm transition-colors ${
            dragOver ? "border-brass bg-brass/10" : "border-muted-foreground/30"
          }`}
        >
          <ImagePlus className="h-6 w-6 text-brass" />
          <p className="font-medium">
            {busy ? "Uploading…" : "Drag & drop photos here, or choose files"}
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG or WebP · up to {MAX_PHOTOS} photos · {items.length} added
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <input
              aria-label="Upload gallery photos"
              type="file"
              multiple
              accept={ACCEPT.join(",")}
              onChange={(e) => {
                void uploadFiles(Array.from(e.target.files || []));
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={onOpenLibrary}
              className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-muted"
            >
              <FolderKanban className="h-3.5 w-3.5 text-brass" /> Add from Media Library
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            data-testid="gallery-card"
            draggable={!readOnly}
            onDragStart={() => {
              dragIndex.current = index;
            }}
            onDragOver={(e) => {
              if (dragIndex.current !== null) e.preventDefault();
            }}
            onDrop={(e) => {
              if (dragIndex.current === null) return;
              e.preventDefault();
              e.stopPropagation();
              const from = dragIndex.current;
              dragIndex.current = null;
              onChange(moveGalleryItem(value, from, index));
            }}
            onDragEnd={() => {
              dragIndex.current = null;
            }}
            className={`space-y-2 rounded-lg border bg-card p-2 ${
              item.isPrimary ? "border-brass ring-2 ring-brass" : ""
            }`}
          >
            <div className="relative">
              <img
                src={item.url}
                alt={item.alt || `Property photo ${index + 1}`}
                className="aspect-[4/3] w-full rounded object-cover"
              />
              {item.isPrimary && (
                <span className="absolute left-1.5 top-1.5 rounded bg-brass px-2 py-0.5 text-[10px] font-bold text-primary">
                  Primary Cover
                </span>
              )}
            </div>
            <select
              aria-label={`Category for photo ${index + 1}`}
              className={input}
              disabled={readOnly}
              value={item.category}
              onChange={(e) =>
                onChange(updateGalleryItem(value, item.id, { category: e.target.value }))
              }
            >
              {!categories.includes(item.category) && <option>{item.category}</option>}
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              aria-label={`Caption for photo ${index + 1}`}
              className={input}
              placeholder="Caption"
              disabled={readOnly}
              value={item.caption || ""}
              onChange={(e) =>
                onChange(updateGalleryItem(value, item.id, { caption: e.target.value }))
              }
            />
            <input
              aria-label={`Alt text for photo ${index + 1}`}
              className={input}
              placeholder="Alt text (accessibility)"
              disabled={readOnly}
              value={item.alt || ""}
              onChange={(e) => onChange(updateGalleryItem(value, item.id, { alt: e.target.value }))}
            />
            <div className="flex items-center justify-between border-t pt-1 text-xs">
              <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                #{index + 1}
              </span>
              {!readOnly && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Move up"
                    disabled={index === 0}
                    onClick={() => onChange(moveGalleryItem(value, index, index - 1))}
                    className="rounded p-1 hover:bg-muted disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={index === items.length - 1}
                    onClick={() => onChange(moveGalleryItem(value, index, index + 1))}
                    className="rounded p-1 hover:bg-muted disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <label
                    title="Replace image"
                    className="cursor-pointer rounded p-1 hover:bg-muted"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <input
                      type="file"
                      hidden
                      accept={ACCEPT.join(",")}
                      aria-label={`Replace photo ${index + 1}`}
                      onChange={(e) => {
                        void replaceFile(item.id, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    title="Remove photo"
                    onClick={() => onChange(removeGalleryItem(value, item.id))}
                    className="rounded p-1 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            {!readOnly && (
              <button
                type="button"
                disabled={item.isPrimary}
                onClick={() => {
                  onChange(setPrimaryGalleryItem(value, item.id));
                  toast.success("Set as primary cover photo");
                }}
                className={`w-full rounded px-2 py-1 text-[11px] font-medium ${
                  item.isPrimary
                    ? "cursor-default bg-brass/20 text-brass"
                    : "border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.isPrimary ? "✓ Current Cover" : "Set as Primary Cover"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
