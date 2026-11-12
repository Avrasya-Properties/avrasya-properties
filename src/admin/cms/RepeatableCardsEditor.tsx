import { useState } from "react";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit3,
  BarChart3,
  Quote,
  Star,
  Check,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { MediaPickerModal } from "@/admin/media/MediaPickerModal";
import type { RepeatableCardItem, RepeatableCardType } from "./types";

interface RepeatableCardsEditorProps {
  items: RepeatableCardItem[];
  onChange: (items: RepeatableCardItem[]) => void;
  disabled?: boolean;
}

const FEATURE_ICONS = [
  "ShieldCheck",
  "Scale",
  "Building2",
  "KeyRound",
  "Landmark",
  "FileCheck",
  "Gem",
  "MapPin",
  "TrendingUp",
  "CheckCircle2",
  "Award",
  "Compass",
];

export function RepeatableCardsEditor({
  items = [],
  onChange,
  disabled = false,
}: RepeatableCardsEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftItem, setDraftItem] = useState<Partial<RepeatableCardItem> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addingType, setAddingType] = useState<RepeatableCardType>("metric");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const startAdd = (type: RepeatableCardType) => {
    setAddingType(type);
    setIsAdding(true);
    setEditingId(null);
    if (type === "metric") {
      setDraftItem({ type: "metric", label: "", value: "", description: "" });
    } else if (type === "testimonial") {
      setDraftItem({ type: "testimonial", quote: "", author: "", title: "", avatar: "" });
    } else {
      setDraftItem({ type: "feature", title: "", description: "", icon: "ShieldCheck" });
    }
  };

  const startEdit = (item: RepeatableCardItem) => {
    setIsAdding(false);
    setEditingId(item.id);
    setDraftItem({ ...item });
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setDraftItem(null);
  };

  const saveDraft = () => {
    if (!draftItem) return;

    // Field validation
    if (draftItem.type === "metric") {
      if (!draftItem.label?.trim() || !draftItem.value?.trim()) {
        alert("Metric label and value are required.");
        return;
      }
    } else if (draftItem.type === "testimonial") {
      if (!draftItem.quote?.trim() || !draftItem.author?.trim()) {
        alert("Testimonial quote and author are required.");
        return;
      }
    } else if (draftItem.type === "feature") {
      if (!draftItem.title?.trim() || !draftItem.description?.trim()) {
        alert("Feature title and description are required.");
        return;
      }
    }

    if (isAdding) {
      const newItem: RepeatableCardItem = {
        id: `card-${crypto.randomUUID()}`,
        type: draftItem.type || addingType,
        ...(draftItem.label?.trim() ? { label: draftItem.label.trim() } : {}),
        ...(draftItem.value?.trim() ? { value: draftItem.value.trim() } : {}),
        ...(draftItem.description?.trim() ? { description: draftItem.description.trim() } : {}),
        ...(draftItem.quote?.trim() ? { quote: draftItem.quote.trim() } : {}),
        ...(draftItem.author?.trim() ? { author: draftItem.author.trim() } : {}),
        ...(draftItem.title?.trim() ? { title: draftItem.title.trim() } : {}),
        ...(draftItem.avatar?.trim() ? { avatar: draftItem.avatar.trim() } : {}),
        icon: draftItem.icon || "ShieldCheck",
      };
      onChange([...items, newItem]);
    } else if (editingId) {
      const updated = items.map((it) => {
        if (it.id === editingId) {
          const res: RepeatableCardItem = {
            ...it,
            ...draftItem,
            ...(draftItem.label?.trim() ? { label: draftItem.label.trim() } : {}),
            ...(draftItem.value?.trim() ? { value: draftItem.value.trim() } : {}),
            ...(draftItem.description?.trim() ? { description: draftItem.description.trim() } : {}),
            ...(draftItem.quote?.trim() ? { quote: draftItem.quote.trim() } : {}),
            ...(draftItem.author?.trim() ? { author: draftItem.author.trim() } : {}),
            ...(draftItem.title?.trim() ? { title: draftItem.title.trim() } : {}),
            ...(draftItem.avatar?.trim() ? { avatar: draftItem.avatar.trim() } : {}),
          };
          return res;
        }
        return it;
      });
      onChange(updated);
    }

    cancelEdit();
  };

  const deleteItem = (id: string) => {
    if (confirm("Remove this card?")) {
      onChange(items.filter((it) => it.id !== id));
      if (editingId === id) cancelEdit();
    }
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const cloned = [...items];
    const [moved] = cloned.splice(index, 1);
    if (!moved) return;
    cloned.splice(targetIndex, 0, moved);
    onChange(cloned);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Repeatable Cards & Items</h4>
          <p className="text-xs text-muted-foreground">
            Manage statistics, testimonials, or feature cards displayed within this section.
          </p>
        </div>
        {!disabled && !isAdding && !editingId && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => startAdd("metric")}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
            >
              <BarChart3 className="size-3 text-brass" />
              <span>+ Metric</span>
            </button>
            <button
              type="button"
              onClick={() => startAdd("testimonial")}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
            >
              <Quote className="size-3 text-brass" />
              <span>+ Testimonial</span>
            </button>
            <button
              type="button"
              onClick={() => startAdd("feature")}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
            >
              <Star className="size-3 text-brass" />
              <span>+ Feature</span>
            </button>
          </div>
        )}
      </div>

      {/* Editor / Add Form */}
      {(isAdding || editingId) && draftItem && (
        <div className="rounded-lg border border-brass/40 bg-card p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brass">
              {isAdding ? `Add ${draftItem.type} card` : `Edit ${draftItem.type} card`}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={saveDraft}
                className="inline-flex items-center gap-1 rounded bg-[#163038] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#163038]/90"
              >
                <Check className="size-3 text-[#C5A059]" />
                <span>Apply</span>
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Metric Fields */}
          {draftItem.type === "metric" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Metric Value (e.g. $420M+, 100%) *
                </label>
                <input
                  type="text"
                  value={draftItem.value || ""}
                  onChange={(e) => setDraftItem({ ...draftItem, value: e.target.value })}
                  placeholder="$420M+"
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Label (e.g. Portfolio Managed) *
                </label>
                <input
                  type="text"
                  value={draftItem.label || ""}
                  onChange={(e) => setDraftItem({ ...draftItem, label: e.target.value })}
                  placeholder="Portfolio Managed"
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Description / Footnote (optional)
                </label>
                <input
                  type="text"
                  value={draftItem.description || ""}
                  onChange={(e) => setDraftItem({ ...draftItem, description: e.target.value })}
                  placeholder="Across prime European and Asian Istanbul"
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Testimonial Fields */}
          {draftItem.type === "testimonial" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Quote Text *
                </label>
                <textarea
                  rows={3}
                  value={draftItem.quote || ""}
                  onChange={(e) => setDraftItem({ ...draftItem, quote: e.target.value })}
                  placeholder="Avrasya guided our family through the Bosphorus acquisition with unmatched precision..."
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    value={draftItem.author || ""}
                    onChange={(e) => setDraftItem({ ...draftItem, author: e.target.value })}
                    placeholder="Tariq Al-Mansoor"
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Author Title / Location
                  </label>
                  <input
                    type="text"
                    value={draftItem.title || ""}
                    onChange={(e) => setDraftItem({ ...draftItem, title: e.target.value })}
                    placeholder="Private Investor, Dubai"
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Avatar Photo URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={draftItem.avatar || ""}
                    onChange={(e) => setDraftItem({ ...draftItem, avatar: e.target.value })}
                    placeholder="https://... or /images/..."
                    className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="inline-flex items-center gap-1 rounded border border-border px-2.5 py-1 text-xs hover:bg-muted"
                  >
                    <ImageIcon className="size-3" />
                    <span>Media</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feature Fields */}
          {draftItem.type === "feature" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Feature Title *
                  </label>
                  <input
                    type="text"
                    value={draftItem.title || ""}
                    onChange={(e) => setDraftItem({ ...draftItem, title: e.target.value })}
                    placeholder="Direct Title Deed Verification"
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Icon Identifier
                  </label>
                  <select
                    value={draftItem.icon || "ShieldCheck"}
                    onChange={(e) => setDraftItem({ ...draftItem, icon: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                  >
                    {FEATURE_ICONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Feature Description *
                </label>
                <textarea
                  rows={2}
                  value={draftItem.description || ""}
                  onChange={(e) => setDraftItem({ ...draftItem, description: e.target.value })}
                  placeholder="Independent Bar-certified attorneys verify encumbrance and title conformance."
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* List of items */}
      {items.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
          No repeatable cards in this section. Add a metric, testimonial, or feature card above.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center justify-between rounded-lg border bg-card p-3 transition-colors ${
                editingId === item.id
                  ? "border-brass bg-brass/5"
                  : "border-border hover:border-brass/30"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-brass">
                  {item.type === "metric" ? (
                    <BarChart3 className="size-3.5" />
                  ) : item.type === "testimonial" ? (
                    <Quote className="size-3.5" />
                  ) : (
                    <Star className="size-3.5" />
                  )}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {item.type === "metric"
                        ? `${item.value} — ${item.label}`
                        : item.type === "testimonial"
                          ? `${item.author} (${item.title || "Client"})`
                          : item.title}
                    </span>
                    <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] uppercase font-mono text-muted-foreground">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate max-w-md">
                    {item.type === "testimonial"
                      ? `"${item.quote}"`
                      : item.description || item.label}
                  </p>
                </div>
              </div>

              {!disabled && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveItem(index, "up")}
                    aria-label="Move card up"
                    className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(index, "down")}
                    aria-label="Move card down"
                    className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    aria-label="Edit card"
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Edit3 className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    aria-label="Delete card"
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Media Picker Modal for avatars */}
      <MediaPickerModal
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        title="Select Card Avatar / Photo"
        onSelect={(url) => {
          if (draftItem) {
            setDraftItem({ ...draftItem, avatar: url });
          }
        }}
      />
    </div>
  );
}
