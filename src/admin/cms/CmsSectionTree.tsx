import { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  GripVertical,
  Layers,
  Sparkles,
  Check,
  X,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { CmsSection } from "./types";
import { moveSectionUp, moveSectionDown } from "./types";

interface CmsSectionTreeProps {
  sections: CmsSection[];
  activeSectionId: string | null;
  onSelectSection: (id: string) => void;
  onReorder: (sections: CmsSection[]) => void;
  onToggleVisibility: (id: string) => void;
  onAddSection: (key: string, title: string) => void;
  onDeleteSection: (id: string) => void;
  disabled?: boolean;
}

export function CmsSectionTree({
  sections,
  activeSectionId,
  onSelectSection,
  onReorder,
  onToggleVisibility,
  onAddSection,
  onDeleteSection,
  disabled = false,
}: CmsSectionTreeProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const sortedSections = [...sections].sort((a, b) => a.sort_order - b.sort_order);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newTitle.trim()) {
      alert("Section key and title are required.");
      return;
    }
    const cleanKey = newKey
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-");
    onAddSection(cleanKey, newTitle.trim());
    setNewKey("");
    setNewTitle("");
    setAddModalOpen(false);
  };

  const handleMoveUp = (index: number) => {
    const updated = moveSectionUp(sortedSections, index);
    onReorder(updated);
  };

  const handleMoveDown = (index: number) => {
    const updated = moveSectionDown(sortedSections, index);
    onReorder(updated);
  };

  return (
    <div className="flex h-full flex-col border-r bg-muted/10">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 bg-card">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brass flex items-center gap-1.5">
            <Layers className="size-3.5" />
            <span>Page Sections ({sortedSections.length})</span>
          </h3>
          <p className="text-[11px] text-muted-foreground">Arrange and toggle layout sections.</p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-1 rounded bg-[#163038] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#163038]/90"
        >
          <Plus className="size-3 text-[#C5A059]" />
          <span>Add</span>
        </button>
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sortedSections.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
            No sections on this page. Click &ldquo;Add&rdquo; above to create a section.
          </div>
        ) : (
          sortedSections.map((sec, index) => {
            const isActive = activeSectionId === sec.id;
            const cardCount = sec.content_json.repeatable_items?.length || 0;

            return (
              <div
                key={sec.id}
                onClick={() => onSelectSection(sec.id)}
                className={`group relative flex cursor-pointer items-center justify-between rounded-lg border p-2.5 transition-all ${
                  isActive
                    ? "border-brass bg-brass/10 shadow-xs"
                    : "border-border bg-card hover:border-brass/40"
                } ${!sec.is_visible ? "opacity-60 bg-muted/30" : ""}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Order Number Badge */}
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-mono font-bold text-muted-foreground">
                    #{sec.sort_order}
                  </span>

                  {/* Section Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-foreground truncate max-w-[130px]">
                        {sec.title || "Untitled Section"}
                      </span>
                      {!sec.is_visible && (
                        <span className="rounded bg-muted px-1.5 py-0.2 text-[9px] font-mono text-muted-foreground">
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="font-mono">{sec.section_key}</span>
                      {cardCount > 0 && <span>· {cardCount} cards</span>}
                    </div>
                  </div>
                </div>

                {/* Section Controls */}
                <div
                  className="flex items-center gap-0.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Visibility Toggle */}
                  <button
                    type="button"
                    onClick={() => onToggleVisibility(sec.id)}
                    className={`rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground ${
                      !sec.is_visible ? "text-amber-500" : ""
                    }`}
                    title={sec.is_visible ? "Hide section" : "Show section"}
                  >
                    {sec.is_visible ? (
                      <Eye className="size-3.5" />
                    ) : (
                      <EyeOff className="size-3.5" />
                    )}
                  </button>

                  {/* Move Up */}
                  <button
                    type="button"
                    disabled={index === 0 || disabled}
                    onClick={() => handleMoveUp(index)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-25"
                    title="Move up"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    disabled={index === sortedSections.length - 1 || disabled}
                    onClick={() => handleMoveDown(index)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-25"
                    title="Move down"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onDeleteSection(sec.id)}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Delete section"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Section Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Add New Page Section</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Section Key / Identifier (e.g. hero, highlights, testimonials) *
                </label>
                <input
                  type="text"
                  required
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. highlights"
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Section Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Architectural Excellence & Investment Highlights"
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                />
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="rounded border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-[#163038] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#163038]/90"
              >
                Create Section
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
