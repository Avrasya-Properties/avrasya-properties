import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  LayoutTemplate,
  Save,
  Eye,
  RotateCcw,
  Columns,
  Smartphone,
  Laptop,
  Tablet,
  Check,
  AlertCircle,
  Sparkles,
  Globe,
  Settings,
} from "lucide-react";
import { PageHead, btnPrimary, btnGhost } from "@/admin/Shell";
import { useSession, can } from "@/admin/store";
import { managedRows, saveManaged, deleteManaged } from "@/admin/management";
import { websiteChanged } from "@/lib/website-sync";
import {
  PUBLIC_PAGES,
  type CmsPage,
  type CmsSection,
  type PageSlug,
  normalizeSection,
  serializeSection,
  toggleSectionVisibility,
} from "@/admin/cms/types";
import { CmsSectionTree } from "@/admin/cms/CmsSectionTree";
import { CmsSectionEditor } from "@/admin/cms/CmsSectionEditor";
import { CmsLivePreview } from "@/admin/cms/CmsLivePreview";
import { UnsavedChangesDialog } from "@/admin/cms/UnsavedChangesGuard";

export const Route = createFileRoute("/admin/cms")({
  component: AdminCmsPage,
});

export function AdminCmsPage() {
  const user = useSession();
  const editable = can(user, "publish");

  // State
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [allSections, setAllSections] = useState<CmsSection[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<PageSlug>("home");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split");
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  // Load pages and sections
  const loadData = async () => {
    setLoading(true);
    try {
      const [rawPages, rawSections] = await Promise.all([
        managedRows("content_pages"),
        managedRows("content_sections"),
      ]);

      const parsedPages: CmsPage[] = rawPages.map((p) => ({
        id: String(p["id"]),
        slug: String(p["slug"]),
        title: String(p["title"] || p["slug"]),
        ...(typeof p["meta_description"] === "string"
          ? { meta_description: p["meta_description"] }
          : {}),
        published_status: (p["published_status"] as CmsPage["published_status"]) || "Published",
      }));

      // Make sure all 6 public pages exist
      PUBLIC_PAGES.forEach((pub) => {
        if (!parsedPages.some((p) => p.slug === pub.slug)) {
          parsedPages.push({
            id: `cp-${pub.slug}`,
            slug: pub.slug,
            title: pub.title,
            published_status: "Published",
          });
        }
      });

      const parsedSections: CmsSection[] = rawSections.map(normalizeSection);

      setPages(parsedPages);
      setAllSections(parsedSections);
      setIsDirty(false);
    } catch (err) {
      console.error("Failed to load CMS data:", err);
      toast.error("Could not load CMS pages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Active page record
  const activePage = useMemo(() => {
    return (
      pages.find((p) => p.slug === selectedSlug) || {
        id: `cp-${selectedSlug}`,
        slug: selectedSlug,
        title: PUBLIC_PAGES.find((p) => p.slug === selectedSlug)?.title || selectedSlug,
        published_status: "Published" as const,
      }
    );
  }, [pages, selectedSlug]);

  // Active page's sections
  const currentSections = useMemo(() => {
    return allSections
      .filter((s) => s.page_id === activePage.id || s.page_id === `cp-${selectedSlug}`)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [allSections, activePage.id, selectedSlug]);

  // Set initial active section when page changes
  useEffect(() => {
    if (currentSections.length > 0) {
      if (!activeSectionId || !currentSections.some((s) => s.id === activeSectionId)) {
        setActiveSectionId(currentSections[0]!.id);
      }
    } else {
      setActiveSectionId(null);
    }
  }, [selectedSlug, currentSections]);

  const activeSection = useMemo(() => {
    return currentSections.find((s) => s.id === activeSectionId) || null;
  }, [currentSections, activeSectionId]);

  // Handlers for section changes
  const handleSectionUpdate = (updated: CmsSection) => {
    setIsDirty(true);
    setAllSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleSectionsReorder = (reordered: CmsSection[]) => {
    setIsDirty(true);
    const reorderedIds = new Set(reordered.map((r) => r.id));
    setAllSections((prev) => [...prev.filter((s) => !reorderedIds.has(s.id)), ...reordered]);
  };

  const handleToggleVisibility = (sectionId: string) => {
    setIsDirty(true);
    setAllSections((prev) => toggleSectionVisibility(prev, sectionId));
  };

  const handleAddSection = (key: string, title: string) => {
    setIsDirty(true);
    const nextOrder = currentSections.length + 1;
    const newSection: CmsSection = {
      id: `cs-${Date.now()}`,
      page_id: activePage.id,
      section_key: key,
      title,
      sort_order: nextOrder,
      is_visible: true,
      content_json: {
        title,
        kicker: activePage.title,
        subtitle: "",
        paragraphs: [],
        cta_label: "",
        cta_link: "",
        cta_style: "primary",
        background_image: "",
        background_overlay: "dark",
        is_visible: true,
        enquiry: false,
        repeatable_items: [],
      },
    };
    setAllSections((prev) => [...prev, newSection]);
    setActiveSectionId(newSection.id);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    setIsDirty(true);
    setAllSections((prev) => prev.filter((s) => s.id !== sectionId));
    if (activeSectionId === sectionId) {
      const remaining = currentSections.filter((s) => s.id !== sectionId);
      setActiveSectionId(remaining[0]?.id || null);
    }
  };

  // Save changes handler
  const handleSaveAll = async () => {
    try {
      // 1. Ensure page exists in content_pages
      const existingPage = (await managedRows("content_pages")).find(
        (p) => p["slug"] === activePage.slug,
      );
      if (!existingPage) {
        await saveManaged(
          "content_pages",
          {
            id: activePage.id,
            slug: activePage.slug,
            title: activePage.title,
            published_status: activePage.published_status,
          },
          null,
        );
      }

      // 2. Save each section for this page
      const currentDbSections = await managedRows("content_sections");
      const currentDbForPage = currentDbSections.filter(
        (s) => s["page_id"] === activePage.id || s["page_id"] === `cp-${activePage.slug}`,
      );

      // Save updated / new sections
      for (const sec of currentSections) {
        const original = currentDbForPage.find((dbSec) => dbSec["id"] === sec.id) || null;
        const serialized = serializeSection(sec);
        await saveManaged("content_sections", serialized, original);
      }

      // Delete sections that were removed in UI
      const currentIds = new Set(currentSections.map((s) => s.id));
      for (const dbSec of currentDbForPage) {
        if (!currentIds.has(String(dbSec["id"]))) {
          await deleteManaged("content_sections", dbSec);
        }
      }

      websiteChanged();
      setIsDirty(false);
      toast.success(`Saved and published ${activePage.title} sections.`);
    } catch (err) {
      console.error("Save error:", err);
      toast.error((err as Error).message || "Failed to save sections.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-68px)] flex-col bg-background">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between border-b px-6 py-3 bg-card shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="size-5 text-brass" />
            <h1 className="text-base font-bold text-foreground">Visual Page Builder</h1>
          </div>

          {/* Page Selector Tabs */}
          <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
            {PUBLIC_PAGES.map((page) => (
              <button
                key={page.slug}
                type="button"
                onClick={() => {
                  if (isDirty && !confirm("You have unsaved changes. Switch page anyway?")) return;
                  setSelectedSlug(page.slug);
                  setIsDirty(false);
                }}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  selectedSlug === page.slug
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {page.title}
              </button>
            ))}
          </div>

          {isDirty && (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Unsaved Edits</span>
            </span>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* View Mode Switcher */}
          <div className="hidden sm:flex items-center rounded-lg border bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "split"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("editor")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "editor"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Editor Only
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "preview"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Preview Only
            </button>
          </div>

          <button
            type="button"
            disabled={!editable || !isDirty}
            onClick={handleSaveAll}
            className={btnPrimary}
          >
            <Save className="size-3.5" />
            <span>Save &amp; Publish</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: 3 Columns (Tree, Editor, Preview) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Column 1: Section Tree (Always visible in split and editor modes) */}
        {viewMode !== "preview" && (
          <div className="w-72 shrink-0 h-full overflow-hidden">
            <CmsSectionTree
              sections={currentSections}
              activeSectionId={activeSectionId}
              onSelectSection={setActiveSectionId}
              onReorder={handleSectionsReorder}
              onToggleVisibility={handleToggleVisibility}
              onAddSection={handleAddSection}
              onDeleteSection={handleDeleteSection}
              disabled={!editable}
            />
          </div>
        )}

        {/* Column 2: Section Editor */}
        {viewMode !== "preview" && (
          <div
            className={`flex-1 h-full overflow-hidden border-r ${viewMode === "split" ? "max-w-[45%]" : "max-w-full"}`}
          >
            {activeSection ? (
              <CmsSectionEditor
                section={activeSection}
                onChange={handleSectionUpdate}
                onDelete={handleDeleteSection}
                disabled={!editable}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <LayoutTemplate className="size-12 opacity-30 mb-3" />
                <h3 className="text-sm font-semibold text-foreground">No Section Selected</h3>
                <p className="mt-1 text-xs max-w-sm">
                  Select a section from the hierarchy tree on the left or click &ldquo;Add&rdquo; to
                  build your page.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Column 3: Live Layout Preview */}
        {(viewMode === "split" || viewMode === "preview") && (
          <div className="flex-1 h-full overflow-hidden">
            <CmsLivePreview
              page={activePage}
              sections={currentSections}
              activeSectionId={activeSectionId}
              onSelectSection={setActiveSectionId}
            />
          </div>
        )}
      </div>

      {/* Unsaved Changes Guard Dialog */}
      <UnsavedChangesDialog
        isDirty={isDirty}
        title="Unsaved CMS Changes"
        description="You have unsaved section modifications. Navigating to another route will discard all unpublished edits."
      />
    </div>
  );
}
