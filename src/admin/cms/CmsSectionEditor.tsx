import { useState } from "react";
import {
  Type,
  AlignLeft,
  MousePointerClick,
  Image as ImageIcon,
  Layers,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  X,
} from "lucide-react";
import { MediaPickerModal } from "@/admin/media/MediaPickerModal";
import { RepeatableCardsEditor } from "./RepeatableCardsEditor";
import type { CmsSection, RepeatableCardItem } from "./types";

interface CmsSectionEditorProps {
  section: CmsSection;
  onChange: (updated: CmsSection) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

export function CmsSectionEditor({
  section,
  onChange,
  onDelete,
  disabled = false,
}: CmsSectionEditorProps) {
  const [activeTab, setActiveTab] = useState<"content" | "cards" | "style">("content");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const c = section.content_json;

  const updateContent = (patch: Partial<typeof c>) => {
    onChange({
      ...section,
      content_json: {
        ...c,
        ...patch,
      },
    });
  };

  const handleTitleChange = (val: string) => {
    onChange({
      ...section,
      title: val,
      content_json: {
        ...c,
        title: val,
      },
    });
  };

  const handleVisibilityToggle = () => {
    const next = !section.is_visible;
    onChange({
      ...section,
      is_visible: next,
      content_json: {
        ...c,
        is_visible: next,
      },
    });
  };

  // Paragraph management
  const paragraphs = Array.isArray(c.paragraphs) ? c.paragraphs : [];

  const handleParagraphChange = (index: number, val: string) => {
    const next = [...paragraphs];
    next[index] = val;
    updateContent({ paragraphs: next });
  };

  const addParagraph = () => {
    updateContent({ paragraphs: [...paragraphs, ""] });
  };

  const removeParagraph = (index: number) => {
    const next = paragraphs.filter((_, i) => i !== index);
    updateContent({ paragraphs: next });
  };

  const handleCardsChange = (repeatable_items: RepeatableCardItem[]) => {
    updateContent({ repeatable_items });
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b px-6 py-4 bg-card">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brass/15 text-brass font-bold text-xs">
            #{section.sort_order}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                {section.title || "Untitled Section"}
              </h3>
              <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                {section.section_key}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure structured headings, body paragraphs, call-to-actions, and background
              styling.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Visibility Toggle */}
          <button
            type="button"
            onClick={handleVisibilityToggle}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium border transition-colors ${
              section.is_visible
                ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                : "border-border bg-muted/50 text-muted-foreground"
            }`}
          >
            {section.is_visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            <span>{section.is_visible ? "Visible" : "Hidden"}</span>
          </button>

          {/* Delete section */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onDelete(section.id)}
            className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Delete section"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Navigation Tabs */}
      <div className="flex border-b bg-muted/20 px-6 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === "content"
              ? "border-brass text-brass font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Type className="size-3.5" />
          <span>Headings &amp; Text</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("cards")}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === "cards"
              ? "border-brass text-brass font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="size-3.5" />
          <span>Repeatable Cards ({c.repeatable_items?.length || 0})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("style")}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === "style"
              ? "border-brass text-brass font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ImageIcon className="size-3.5" />
          <span>Media &amp; Actions</span>
        </button>
      </div>

      {/* Editor Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* TAB 1: Headings & Content */}
        {activeTab === "content" && (
          <div className="space-y-5 max-w-3xl">
            {/* Kicker / Badge */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Kicker / Eyebrow Badge
              </label>
              <input
                type="text"
                value={c.kicker || ""}
                onChange={(e) => updateContent({ kicker: e.target.value })}
                placeholder="e.g. Istanbul Portfolio Collection, Statutory Advisory"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-brass focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Small gold uppercase label rendered above the section headline.
              </p>
            </div>

            {/* Title / Headline */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Section Headline (Title) *
              </label>
              <input
                type="text"
                value={section.title || ""}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Curated Offers & Developments in Istanbul"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground focus:border-brass focus:outline-none"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Secondary Subtitle / Statement
              </label>
              <textarea
                rows={2}
                value={c.subtitle || ""}
                onChange={(e) => updateContent({ subtitle: e.target.value })}
                placeholder="e.g. Source-backed investment opportunities across central and Asian-side Istanbul."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-brass focus:outline-none"
              />
            </div>

            {/* Structured Paragraphs Manager */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Content Paragraphs
                  </label>
                  <p className="text-[11px] text-muted-foreground">
                    Each paragraph is rendered as an independent readable block on the public site.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addParagraph}
                  className="inline-flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted"
                >
                  <Plus className="size-3" />
                  <span>Add Paragraph</span>
                </button>
              </div>

              {paragraphs.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                  No paragraphs added yet. Click &ldquo;Add Paragraph&rdquo; to introduce body copy.
                </div>
              ) : (
                <div className="space-y-3">
                  {paragraphs.map((p, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-[11px] font-mono font-medium text-muted-foreground mt-2">
                        {index + 1}
                      </span>
                      <textarea
                        rows={3}
                        value={p}
                        onChange={(e) => handleParagraphChange(index, e.target.value)}
                        placeholder="Write paragraph text here..."
                        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-brass focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeParagraph(index)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive mt-1.5"
                        title="Remove paragraph"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Repeatable Cards */}
        {activeTab === "cards" && (
          <div className="max-w-3xl">
            <RepeatableCardsEditor
              items={c.repeatable_items || []}
              onChange={handleCardsChange}
              disabled={disabled}
            />
          </div>
        )}

        {/* TAB 3: Media & Actions */}
        {activeTab === "style" && (
          <div className="space-y-6 max-w-3xl">
            {/* Action Button Controls */}
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brass flex items-center gap-1.5">
                <MousePointerClick className="size-3.5" />
                <span>Call-to-Action (CTA) Button</span>
              </h4>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={c.cta_label || ""}
                    onChange={(e) => updateContent({ cta_label: e.target.value })}
                    placeholder="e.g. Explore Portfolio, Book Consultation"
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Destination URL / Route
                  </label>
                  <input
                    type="text"
                    value={c.cta_link || ""}
                    onChange={(e) => updateContent({ cta_link: e.target.value })}
                    placeholder="e.g. /properties or /contact?topic=citizenship"
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Visual Button Style
                  </label>
                  <select
                    value={c.cta_style || "primary"}
                    onChange={(e) =>
                      updateContent({ cta_style: e.target.value as "primary" | "secondary" })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                  >
                    <option value="primary">Primary (Solid Gold / Brass)</option>
                    <option value="secondary">Secondary (Outline / Light)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Visual Media & Background */}
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brass flex items-center gap-1.5">
                <ImageIcon className="size-3.5" />
                <span>Section Background Styling</span>
              </h4>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Background Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={c.background_image || ""}
                    onChange={(e) => updateContent({ background_image: e.target.value })}
                    placeholder="https://... or /images/..."
                    className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="inline-flex items-center gap-1 rounded bg-[#163038] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#163038]/90"
                  >
                    <ImageIcon className="size-3.5 text-[#C5A059]" />
                    <span>Choose from Media</span>
                  </button>
                  {c.background_image && (
                    <button
                      type="button"
                      onClick={() => updateContent({ background_image: "" })}
                      className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                      title="Clear image"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Background Thumbnail Preview */}
              {c.background_image && (
                <div className="relative h-32 w-full max-w-md overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={c.background_image}
                    alt="Background preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#163038]/40 flex items-center justify-center text-white text-xs font-medium">
                    Preview Active
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Background Dimmer Overlay
                </label>
                <select
                  value={c.background_overlay || "dark"}
                  onChange={(e) =>
                    updateContent({
                      background_overlay: e.target.value as "none" | "dark" | "light",
                    })
                  }
                  className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                >
                  <option value="dark">Dark Petrol Dimmer (Default #163038)</option>
                  <option value="light">Light Tint Overlay</option>
                  <option value="none">No Overlay (Raw Image)</option>
                </select>
              </div>
            </div>

            {/* Embedded Inquiry Toggle */}
            <div className="rounded-xl border bg-card p-5 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-foreground">
                  Include Public Consultation Form
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Embeds the inquiry capture form directly inside this section on the public
                  website.
                </p>
              </div>
              <input
                type="checkbox"
                checked={c.enquiry === true}
                onChange={(e) => updateContent({ enquiry: e.target.checked })}
                className="size-4 rounded border-input text-brass focus:ring-brass"
              />
            </div>
          </div>
        )}
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        title="Choose Background Media Asset"
        onSelect={(url) => {
          updateContent({ background_image: url });
        }}
      />
    </div>
  );
}
