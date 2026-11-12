import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  Check,
  Download,
  Globe2,
  RefreshCw,
  Save,
  Settings2,
  ShieldCheck,
  Upload,
  AlertTriangle,
  MapPin,
  Layers,
  DollarSign,
  Plus,
  Trash2,
  RotateCcw,
  X,
  Search,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ExternalLink,
  ListOrdered,
  Handshake,
} from "lucide-react";
import { PageHead, btnGhost, btnPrimary, field } from "@/admin/Shell";
import { SecuritySettings } from "@/admin/SecuritySettings";
import { DESIGN_FIELDS } from "@/admin/website-design";
import { uploadImage } from "@/admin/store";
import { RegionsEditor } from "@/admin/RegionsEditor";
import { allDistricts, normalizeRegions } from "@/data/regions";
import { websiteChanged } from "@/lib/website-sync";
import { UnsavedChangesDialog } from "@/admin/cms/UnsavedChangesGuard";
import {
  DEMO_ENABLED,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_NAVIGATION_ITEMS,
  DEFAULT_FOOTER_SETTINGS,
  DEFAULT_PARTNERS,
  exportBackup,
  importBackup,
  resetData,
  updateSiteSettings,
  settingsRevision,
  useDB,
  useSession,
  can,
  type SiteSettings,
  type NavigationItem,
  type FooterColumn,
  type FooterSettings,
  type HeaderCtaSettings,
  type PartnerItem,
} from "@/admin/store";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

const TABS = [
  "Company details",
  "Homepage",
  "Partners & References",
  "Navigation & Footer",
  "SEO & Search",
  "Website appearance",
  "Regions",
  "Search filters",
  "Exchange rates",
  "Sign-in and recovery",
  "Export data",
] as const;

export function AdminSettingsPage() {
  const db = useDB();
  const user = useSession();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Company details");
  const [form, setForm] = useState<SiteSettings>({ ...db.siteSettings });
  const [newDistrict, setNewDistrict] = useState("");
  const [newLayout, setNewLayout] = useState("");
  const [newBudget, setNewBudget] = useState({ label: "", min: 0, max: 0 });
  const [importJson, setImportJson] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [newNavLabel, setNewNavLabel] = useState("");
  const [newNavHref, setNewNavHref] = useState("");
  const [newPartnerName, setNewPartnerName] = useState("");
  const [newPartnerLogo, setNewPartnerLogo] = useState("");
  const [newPartnerWebsite, setNewPartnerWebsite] = useState("");

  const isAdmin = can(user, "admin");
  const editable = can(user, "publish");
  const revision = useRef("");
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!dirty) {
      setForm({ ...db.siteSettings });
      revision.current = settingsRevision();
    }
  }, [db.siteSettings, dirty]);

  const setField = <K extends keyof SiteSettings>(key: K, val: SiteSettings[K]) => {
    setDirty(true);
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  // Navigation Items Handlers
  const navItems = form.navigationItems || DEFAULT_NAVIGATION_ITEMS;
  const setNavItems = (items: NavigationItem[]) => {
    setDirty(true);
    setForm((prev) => ({
      ...prev,
      navigationItems: items,
      websiteDesign: {
        ...prev.websiteDesign,
        navigation: JSON.stringify(items),
      },
    }));
  };

  const handleAddNavItem = () => {
    if (!newNavLabel.trim() || !newNavHref.trim()) {
      toast.error("Enter both label and destination URL.");
      return;
    }
    const nextOrder = navItems.length + 1;
    const next = [
      ...navItems,
      { label: newNavLabel.trim(), href: newNavHref.trim(), order: nextOrder, is_visible: true },
    ];
    setNavItems(next);
    setNewNavLabel("");
    setNewNavHref("");
    toast.success("Navigation item added.");
  };

  const handleUpdateNavItem = (index: number, patch: Partial<NavigationItem>) => {
    const next = navItems.map((item, i) => (i === index ? { ...item, ...patch } : item));
    setNavItems(next);
  };

  const handleRemoveNavItem = (index: number) => {
    const next = navItems.filter((_, i) => i !== index).map((it, i) => ({ ...it, order: i + 1 }));
    setNavItems(next);
  };

  const handleMoveNavItem = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= navItems.length) return;
    const cloned = [...navItems];
    const [moved] = cloned.splice(index, 1);
    if (!moved) return;
    cloned.splice(target, 0, moved);
    setNavItems(cloned.map((it, i) => ({ ...it, order: i + 1 })));
  };

  // Header CTA Handlers
  const headerCta = form.headerCta || {
    label: "Book Consultation",
    href: "/contact",
    is_visible: true,
  };
  const setHeaderCta = (patch: Partial<HeaderCtaSettings>) => {
    setDirty(true);
    setForm((prev) => ({
      ...prev,
      headerCta: { ...headerCta, ...patch },
    }));
  };

  // Footer Settings Handlers
  const footerSettings = form.footerSettings || DEFAULT_FOOTER_SETTINGS;
  const setFooterSettings = (patch: Partial<FooterSettings>) => {
    const next = { ...footerSettings, ...patch };
    setDirty(true);
    setForm((prev) => ({
      ...prev,
      footerSettings: next,
      websiteDesign: {
        ...prev.websiteDesign,
        footer: JSON.stringify(next),
        footerNote: next.note || prev.websiteDesign?.["footerNote"] || "",
      },
    }));
  };

  const handleAddFooterColumn = () => {
    const currentCols = footerSettings.columns || [];
    const newCol: FooterColumn = {
      title: `Column ${currentCols.length + 1}`,
      links: [{ label: "Link 1", href: "/" }],
    };
    setFooterSettings({ columns: [...currentCols, newCol] });
  };

  const handleUpdateFooterColumnTitle = (colIndex: number, title: string) => {
    const currentCols = [...(footerSettings.columns || [])];
    if (currentCols[colIndex]) {
      currentCols[colIndex] = { ...currentCols[colIndex]!, title };
      setFooterSettings({ columns: currentCols });
    }
  };

  const handleRemoveFooterColumn = (colIndex: number) => {
    const currentCols = (footerSettings.columns || []).filter((_, i) => i !== colIndex);
    setFooterSettings({ columns: currentCols });
  };

  const handleAddFooterLink = (colIndex: number, label = "New Link", href = "/") => {
    const currentCols = [...(footerSettings.columns || [])];
    if (currentCols[colIndex]) {
      const col = currentCols[colIndex]!;
      currentCols[colIndex] = {
        ...col,
        links: [...col.links, { label, href }],
      };
      setFooterSettings({ columns: currentCols });
    }
  };

  const handleUpdateFooterLink = (
    colIndex: number,
    linkIndex: number,
    patch: { label?: string; href?: string },
  ) => {
    const currentCols = [...(footerSettings.columns || [])];
    if (currentCols[colIndex]) {
      const col = currentCols[colIndex]!;
      const links = col.links.map((link, i) => (i === linkIndex ? { ...link, ...patch } : link));
      currentCols[colIndex] = { ...col, links };
      setFooterSettings({ columns: currentCols });
    }
  };

  const handleRemoveFooterLink = (colIndex: number, linkIndex: number) => {
    const currentCols = [...(footerSettings.columns || [])];
    if (currentCols[colIndex]) {
      const col = currentCols[colIndex]!;
      const links = col.links.filter((_, i) => i !== linkIndex);
      currentCols[colIndex] = { ...col, links };
      setFooterSettings({ columns: currentCols });
    }
  };

  // Partners & References Handlers
  const partners = form.partners || DEFAULT_PARTNERS;
  const setPartners = (items: PartnerItem[]) => {
    setDirty(true);
    setForm((prev) => ({
      ...prev,
      partners: items,
      websiteDesign: {
        ...prev.websiteDesign,
        partners: JSON.stringify(items),
      },
    }));
  };

  const handleAddPartner = () => {
    if (!newPartnerName.trim() || !newPartnerLogo.trim()) {
      toast.error("Enter partner name and logo path or URL.");
      return;
    }
    const newPartner: PartnerItem = {
      id: `partner-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: newPartnerName.trim(),
      logo: newPartnerLogo.trim(),
      website: newPartnerWebsite.trim() || undefined,
      sortOrder: partners.length + 1,
      is_visible: true,
    };
    setPartners([...partners, newPartner]);
    setNewPartnerName("");
    setNewPartnerLogo("");
    setNewPartnerWebsite("");
    toast.success("Partner added to list.");
  };

  const handleUpdatePartner = (id: string, patch: Partial<PartnerItem>) => {
    setPartners(partners.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const handleRemovePartner = (id: string) => {
    setPartners(partners.filter((p) => p.id !== id));
    toast.success("Partner removed.");
  };

  const handleMovePartner = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= partners.length) return;
    const next = [...partners];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved!);
    setPartners(next.map((p, i) => ({ ...p, sortOrder: i + 1 })));
  };

  const handleSave = async () => {
    try {
      const payload: SiteSettings = {
        ...form,
        websiteDesign: {
          ...form.websiteDesign,
          navigation: JSON.stringify(form.navigationItems || navItems),
          footer: JSON.stringify(form.footerSettings || footerSettings),
          footerNote:
            (form.footerSettings || footerSettings)?.note ||
            form.websiteDesign?.["footerNote"] ||
            "",
          partners: JSON.stringify(form.partners || partners),
        },
      };
      await updateSiteSettings(payload, revision.current);
      websiteChanged();
      setDirty(false);
      toast.success(
        DEMO_ENABLED ? "Demo settings saved in this browser." : "Website settings published.",
      );
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const dataStr = await exportBackup();
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `avrasya-properties-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Workspace records exported; linked files are not included");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleImportSubmit = async () => {
    try {
      if (!importJson.trim()) {
        toast.error("Please paste JSON backup data");
        return;
      }
      if (
        !confirm(
          "Replace this browser’s workspace with the validated backup? Export the current workspace first.",
        )
      )
        return;
      await importBackup(importJson);
      setDirty(false);
      toast.success("Database restored successfully from backup");
      setIsImportOpen(false);
      setImportJson("");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleResetFactory = async () => {
    if (
      !confirm(
        "Reset this browser’s properties, leads, contacts and settings to demo data? Export a backup first.",
      )
    )
      return;
    try {
      await resetData();
      setForm({ ...DEFAULT_SITE_SETTINGS });
      setDirty(false);
      toast.success("Demo workspace reset");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHead
        title="Website settings"
        crumbs="Platform / Settings"
        action={
          <div className="flex items-center gap-2">
            <button disabled={!editable || !dirty} onClick={handleSave} className={btnPrimary}>
              <Save className="h-3.5 w-3.5" />
              <span>Save website settings</span>
            </button>
          </div>
        }
      />

      <p role="status" className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
        {DEMO_ENABLED
          ? "Browser demo. Use fictional data only."
          : "Saved changes appear on the website."}
        {!editable && " Your role has read-only access."}
      </p>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["content_pages", "Website pages"],
            ["content_sections", "Page sections"],
            ["services", "Services"],
            ["faqs", "Questions and answers"],
            ["catalog_documents", "Brochures"],
          ] as const
        ).map(([section, label]) => (
          <a key={section} href={"/admin/manage?section=" + section} className={btnGhost}>
            {label}
          </a>
        ))}
      </div>
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t
                ? "border-b-2 border-brass text-brass"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Sign-in and recovery" &&
        (isAdmin && !DEMO_ENABLED ? (
          <SecuritySettings />
        ) : (
          <p>Sign-in settings are available to the live account owner.</p>
        ))}
      <fieldset id="cms-fields" disabled={!editable} className="min-w-0">
        {tab === "Website appearance" && (
          <div className="max-w-4xl space-y-5 rounded border bg-card p-5">
            <h2 className="font-semibold">Website images and footer</h2>
            <p className="text-sm text-muted-foreground">
              Use image links or upload JPEG, PNG or WebP files under 5 MB. Leave an image link
              empty to use the original branding. Save website settings to apply your changes.
            </p>
            {DESIGN_FIELDS.map((design) => (
              <label key={design.key} className="block text-sm">
                {design.label}
                <input
                  className={field}
                  value={form.websiteDesign?.[design.key] || ""}
                  onChange={(e) =>
                    setField("websiteDesign", {
                      ...form.websiteDesign,
                      [design.key]: e.target.value,
                    })
                  }
                />
                {"image" in design && design.image && (
                  <>
                    <input
                      aria-label={"Upload " + design.label.toLowerCase()}
                      className="mt-2 block max-w-full text-xs"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await uploadImage(file);
                          setField("websiteDesign", { ...form.websiteDesign, [design.key]: url });
                          toast.success("Image uploaded. Save settings to apply it.");
                        } catch (error) {
                          toast.error((error as Error).message);
                        }
                      }}
                    />
                    {form.websiteDesign?.[design.key] && (
                      <img
                        src={form.websiteDesign[design.key]}
                        alt={design.label}
                        className="mt-3 max-h-36 max-w-full rounded border bg-muted object-contain"
                      />
                    )}
                  </>
                )}
              </label>
            ))}
          </div>
        )}
        {/* TAB 1: Company details */}
        {tab === "Company details" && (
          <div className="max-w-4xl space-y-6">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
                <Building2 className="h-4 w-4 text-brass" />
                <span>Company details</span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="cms-companyName"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                  >
                    Brand Name
                  </label>
                  <input
                    id="cms-companyName"
                    className={field}
                    value={form.companyName}
                    onChange={(e) => setField("companyName", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="cms-tagline"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                  >
                    Brand Tagline
                  </label>
                  <input
                    id="cms-tagline"
                    className={field}
                    value={form.tagline}
                    onChange={(e) => setField("tagline", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="cms-registeredEntity"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                  >
                    Registered Legal Entity
                  </label>
                  <input
                    id="cms-registeredEntity"
                    className={field}
                    value={form.registeredEntity}
                    onChange={(e) => setField("registeredEntity", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="cms-licenseNo"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                  >
                    Chamber / Trade License
                  </label>
                  <input
                    id="cms-licenseNo"
                    className={field}
                    value={form.licenseNo}
                    onChange={(e) => setField("licenseNo", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="cms-address"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                  >
                    Registered Headquarters Address
                  </label>
                  <textarea
                    id="cms-address"
                    className={`${field} h-20 py-2`}
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="cms-advisoryHours"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                  >
                    Advisory Working Hours
                  </label>
                  <input
                    id="cms-advisoryHours"
                    className={field}
                    value={form.advisoryHours}
                    onChange={(e) => setField("advisoryHours", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="cms-taxOffice"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                  >
                    Tax Office & Registration
                  </label>
                  <input
                    id="cms-taxOffice"
                    className={field}
                    value={form.taxOffice}
                    onChange={(e) => setField("taxOffice", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
                <Globe2 className="h-4 w-4 text-brass" />
                <span>Contact details</span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="cms-phone"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                  >
                    Direct Phone Line
                  </label>
                  <input
                    id="cms-phone"
                    className={field}
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="cms-whatsapp"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                  >
                    WhatsApp Direct URL
                  </label>
                  <input
                    id="cms-whatsapp"
                    className={field}
                    value={form.whatsapp}
                    onChange={(e) => setField("whatsapp", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="cms-email"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                  >
                    Official Advisory Email
                  </label>
                  <input
                    id="cms-email"
                    className={field}
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Homepage */}
        {tab === "Homepage" && (
          <div className="max-w-4xl space-y-6">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-4">
                Homepage heading and text
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="cms-eyebrowText"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                  >
                    Eyebrow Text (Header Category)
                  </label>
                  <input
                    id="cms-eyebrowText"
                    className={field}
                    value={form.eyebrowText}
                    onChange={(e) => setField("eyebrowText", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="cms-heroHeadline"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                  >
                    Hero Headline
                  </label>
                  <input
                    id="cms-heroHeadline"
                    className={field}
                    value={form.heroHeadline}
                    onChange={(e) => setField("heroHeadline", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="cms-heroSubtitle"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                  >
                    Hero Subtitle
                  </label>
                  <textarea
                    id="cms-heroSubtitle"
                    className={`${field} h-24 py-2`}
                    value={form.heroSubtitle}
                    onChange={(e) => setField("heroSubtitle", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-4">
                Citizenship investment amount
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 items-center">
                <div>
                  <label
                    htmlFor="cms-cbiThresholdUsd"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                  >
                    Turkish CBI Minimum Threshold (USD)
                  </label>
                  <input
                    id="cms-cbiThresholdUsd"
                    type="number"
                    className={field}
                    value={form.cbiThresholdUsd}
                    onChange={(e) => setField("cbiThresholdUsd", Number(e.target.value) || 400000)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Reference value only. Confirm current programme requirements with the client’s
                    legal advisor before publication.
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-4">
                  <p className="text-xs font-semibold text-foreground">Current Rule Active:</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    The configured reference is <b>${form.cbiThresholdUsd.toLocaleString()}</b>. A
                    listing price alone does not verify citizenship eligibility; record a separate
                    legal review.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-4">Website announcement</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.announcementActive}
                    onChange={(e) => setField("announcementActive", e.target.checked)}
                    className="rounded border"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Enable site-wide top announcement bar
                  </span>
                </label>
                {form.announcementActive && (
                  <div>
                    <label
                      htmlFor="cms-announcementText"
                      className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                    >
                      Announcement Banner Text
                    </label>
                    <input
                      id="cms-announcementText"
                      className={field}
                      placeholder="e.g. Q4 2026 Istanbul Central Bank Currency Briefing Now Available"
                      value={form.announcementText}
                      onChange={(e) => setField("announcementText", e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Partners & References */}
        {tab === "Partners & References" && (
          <div className="max-w-4xl space-y-6">
            {/* Active Partners List Card */}
            <div className="rounded-xl border bg-card p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Handshake className="h-4 w-4 text-brass" />
                    <span>Partner &amp; Reference Logos ({partners.length})</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage the logos displayed in the continuous cycling marquee section before the
                    pre-footer CTA.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPartners(DEFAULT_PARTNERS)}
                  className="text-xs text-brass hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset to default partners</span>
                </button>
              </div>

              {/* List of current partners */}
              <div className="space-y-3 mb-6">
                {partners.map((partner, index) => (
                  <div
                    key={partner.id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border p-3 transition-colors ${
                      partner.is_visible !== false
                        ? "bg-card border-border"
                        : "bg-muted/40 border-border opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex size-7 items-center justify-center rounded bg-muted text-[11px] font-mono font-bold text-muted-foreground">
                        #{index + 1}
                      </span>

                      {/* Live Logo Preview Box on Avrasya Green */}
                      <div
                        className="flex h-11 w-20 shrink-0 items-center justify-center rounded-md border border-white/10 px-2 py-1 shadow-inner"
                        style={{ background: "#163038" }}
                        title="Live preview on Avrasya Green"
                      >
                        {partner.logo ? (
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            className="max-h-full max-w-full object-contain brightness-0 invert"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-[9px] text-white/50">No logo</span>
                        )}
                      </div>
                    </div>

                    {/* Partner Details Inputs */}
                    <div className="grid flex-1 grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-muted-foreground block mb-0.5">
                          Partner Name
                        </label>
                        <input
                          type="text"
                          value={partner.name}
                          onChange={(e) =>
                            handleUpdatePartner(partner.id, { name: e.target.value })
                          }
                          placeholder="Company Name"
                          className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:border-brass focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-muted-foreground block mb-0.5">
                          Logo Path / URL
                        </label>
                        <input
                          type="text"
                          value={partner.logo}
                          onChange={(e) =>
                            handleUpdatePartner(partner.id, { logo: e.target.value })
                          }
                          placeholder="/images/partners/..."
                          className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:border-brass focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-muted-foreground block mb-0.5">
                          Website (Optional)
                        </label>
                        <input
                          type="url"
                          value={partner.website || ""}
                          onChange={(e) =>
                            handleUpdatePartner(partner.id, { website: e.target.value })
                          }
                          placeholder="https://..."
                          className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:border-brass focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Actions & Reordering */}
                    <div className="flex items-center gap-1 justify-end shrink-0 pt-1 sm:pt-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMovePartner(index, "up")}
                        className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded hover:bg-muted"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === partners.length - 1}
                        onClick={() => handleMovePartner(index, "down")}
                        className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded hover:bg-muted"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdatePartner(partner.id, {
                            is_visible: partner.is_visible === false ? true : false,
                          })
                        }
                        className={`p-1.5 rounded hover:bg-muted ${
                          partner.is_visible !== false ? "text-brass" : "text-muted-foreground"
                        }`}
                        title={
                          partner.is_visible !== false
                            ? "Visible (Click to hide)"
                            : "Hidden (Click to show)"
                        }
                      >
                        {partner.is_visible !== false ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePartner(partner.id)}
                        className="p-1.5 text-destructive hover:text-destructive/80 rounded hover:bg-destructive/10"
                        title="Remove Partner"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Partner Form */}
              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 text-brass" />
                  <span>Add New Partner Logo</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                      Partner Name
                    </label>
                    <input
                      type="text"
                      value={newPartnerName}
                      onChange={(e) => setNewPartnerName(e.target.value)}
                      placeholder="e.g. The Initiate Consultancy"
                      className="w-full rounded border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                      Logo Path or URL
                    </label>
                    <input
                      type="text"
                      value={newPartnerLogo}
                      onChange={(e) => setNewPartnerLogo(e.target.value)}
                      placeholder="e.g. /images/partners/the-initiate.png"
                      className="w-full rounded border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={newPartnerWebsite}
                      onChange={(e) => setNewPartnerWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full rounded border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quick Preset Buttons for Official Partner Logos */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="text-[11px] text-muted-foreground">Quick Presets:</span>
                  {[
                    {
                      name: "The Initiate",
                      logo: "/images/partners/the-initiate.png",
                      url: "https://theinitiate.com",
                    },
                    {
                      name: "Tez Gayrimenkul",
                      logo: "/images/partners/tez-gayrimenkul.png",
                      url: "https://tezgayrimenkul.com",
                    },
                    {
                      name: "Tezz Tercüme",
                      logo: "/images/partners/tez-tercume.png",
                      url: "https://teztercume.com",
                    },
                    {
                      name: "Merkad Turizm",
                      logo: "/images/partners/merkad-turizm.png",
                      url: "https://merkadturizm.com",
                    },
                    {
                      name: "Ryans",
                      logo: "/images/partners/ryans.png",
                      url: "https://ryans.com.tr",
                    },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setNewPartnerName(preset.name);
                        setNewPartnerLogo(preset.logo);
                        setNewPartnerWebsite(preset.url);
                      }}
                      className="rounded-full bg-background border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground hover:border-brass hover:text-foreground transition-colors"
                    >
                      + {preset.name}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddPartner}
                  className={`${btnPrimary} text-xs py-1.5 px-4 flex items-center gap-1.5`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Partner to List</span>
                </button>
              </div>
            </div>

            {/* Real-time Theme Preview Card */}
            <div className="rounded-xl border border-[#163038] bg-[#163038] p-6 text-white shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C5A059]">
                    Live Visual Preview
                  </p>
                  <h3 className="text-base font-light text-white mt-1">
                    Homepage Presentation on Primary Avrasya Green
                  </h3>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/80">
                  {partners.filter((p) => p.is_visible !== false).length} Active Logos
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 rounded-lg bg-black/20 p-4 border border-white/10">
                {partners
                  .filter((p) => p.is_visible !== false)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex h-14 w-28 items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 transition-transform hover:scale-105"
                      title={p.name}
                    >
                      <img
                        src={p.logo}
                        alt={p.name}
                        className="max-h-full max-w-full object-contain brightness-0 invert opacity-90"
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Navigation & Footer */}
        {tab === "Navigation & Footer" && (
          <div className="max-w-4xl space-y-6">
            {/* Header Navigation Links */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <ListOrdered className="h-4 w-4 text-brass" />
                    <span>Primary Navigation Links ({navItems.length})</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure links shown in the top navbar and responsive slide-out menus.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNavItems(DEFAULT_NAVIGATION_ITEMS)}
                  className="text-xs text-brass hover:underline"
                >
                  Reset to default links
                </button>
              </div>

              {/* List of current nav items */}
              <div className="space-y-2 mb-6">
                {navItems.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 rounded-lg border p-2.5 transition-colors ${
                      item.is_visible
                        ? "bg-card border-border"
                        : "bg-muted/40 border-border opacity-60"
                    }`}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-[11px] font-mono font-bold text-muted-foreground">
                      #{item.order}
                    </span>

                    <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => handleUpdateNavItem(index, { label: e.target.value })}
                          placeholder="Link Label (e.g. Properties)"
                          className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:border-brass focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={item.href}
                          onChange={(e) => handleUpdateNavItem(index, { href: e.target.value })}
                          placeholder="Destination URL (e.g. /properties)"
                          className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs text-foreground font-mono focus:border-brass focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateNavItem(index, { is_visible: !item.is_visible })}
                        className={`rounded p-1 text-xs hover:bg-muted ${
                          item.is_visible
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-500"
                        }`}
                        title={item.is_visible ? "Visible in menu" : "Hidden from menu"}
                      >
                        {item.is_visible ? (
                          <Eye className="size-3.5" />
                        ) : (
                          <EyeOff className="size-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveNavItem(index, "up")}
                        className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-20"
                        title="Move up"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === navItems.length - 1}
                        onClick={() => handleMoveNavItem(index, "down")}
                        className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-20"
                        title="Move down"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveNavItem(index)}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Remove item"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add new navigation item */}
              <div className="rounded-lg border border-dashed border-border p-4 bg-muted/20">
                <span className="block text-xs font-semibold text-foreground mb-2">
                  Add Navigation Link
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newNavLabel}
                    onChange={(e) => setNewNavLabel(e.target.value)}
                    placeholder="Label (e.g. Developments)"
                    className="flex-1 rounded border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-brass focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newNavHref}
                    onChange={(e) => setNewNavHref(e.target.value)}
                    placeholder="URL (e.g. /projects)"
                    className="flex-1 rounded border border-input bg-background px-3 py-1.5 text-xs text-foreground font-mono focus:border-brass focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddNavItem}
                    className="inline-flex items-center justify-center gap-1 rounded bg-[#163038] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#163038]/90"
                  >
                    <Plus className="size-3.5 text-[#C5A059]" />
                    <span>Add Link</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Header CTA Manager */}
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-2">
                <ExternalLink className="h-4 w-4 text-brass" />
                <span>Header Call-to-Action (CTA) Button</span>
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Configure the prominent consultation button displayed on the right of the header
                bar.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    CTA Button Label
                  </label>
                  <input
                    className={field}
                    value={headerCta.label || ""}
                    onChange={(e) => setHeaderCta({ label: e.target.value })}
                    placeholder="Book Consultation"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Destination URL / Route
                  </label>
                  <input
                    className={field}
                    value={headerCta.href || ""}
                    onChange={(e) => setHeaderCta({ href: e.target.value })}
                    placeholder="/contact"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={headerCta.is_visible !== false}
                      onChange={(e) => setHeaderCta({ is_visible: e.target.checked })}
                      className="rounded border"
                    />
                    <span className="text-xs font-medium text-foreground">
                      Display CTA button in header
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer Multi-Column Links */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4 text-brass" />
                    <span>Footer Navigation Columns ({footerSettings.columns?.length || 0})</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Organize multi-column link lists displayed in the main website footer.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFooterSettings(DEFAULT_FOOTER_SETTINGS)}
                    className="text-xs text-brass hover:underline"
                  >
                    Reset to default footer
                  </button>
                  <button
                    type="button"
                    onClick={handleAddFooterColumn}
                    className="inline-flex items-center gap-1 rounded bg-[#163038] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#163038]/90"
                  >
                    <Plus className="size-3 text-[#C5A059]" />
                    <span>Add Column</span>
                  </button>
                </div>
              </div>

              {/* Columns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {(footerSettings.columns || []).map((col, colIdx) => (
                  <div key={colIdx} className="rounded-lg border bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b pb-2">
                      <input
                        type="text"
                        value={col.title}
                        onChange={(e) => handleUpdateFooterColumnTitle(colIdx, e.target.value)}
                        placeholder="Column Title (e.g. Quick Links)"
                        className="flex-1 rounded border border-input bg-background px-2.5 py-1 text-xs font-semibold text-foreground focus:border-brass focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFooterColumn(colIdx)}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Delete column"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    {/* Links in this column */}
                    <div className="space-y-1.5">
                      {col.links.map((link, linkIdx) => (
                        <div key={linkIdx} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) =>
                              handleUpdateFooterLink(colIdx, linkIdx, { label: e.target.value })
                            }
                            placeholder="Label"
                            className="flex-1 rounded border border-input bg-background px-2 py-0.5 text-xs text-foreground focus:border-brass focus:outline-none"
                          />
                          <input
                            type="text"
                            value={link.href}
                            onChange={(e) =>
                              handleUpdateFooterLink(colIdx, linkIdx, { href: e.target.value })
                            }
                            placeholder="Href"
                            className="flex-1 rounded border border-input bg-background px-2 py-0.5 text-xs font-mono text-foreground focus:border-brass focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFooterLink(colIdx, linkIdx)}
                            className="rounded p-1 text-muted-foreground hover:text-destructive"
                            title="Delete link"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddFooterLink(colIdx)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-brass hover:underline pt-1"
                    >
                      <Plus className="size-3" />
                      <span>Add Link to Column</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer Description Note & Copyright */}
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Footer Company Note / Description
                  </label>
                  <textarea
                    rows={2}
                    className={field}
                    value={footerSettings.note || ""}
                    onChange={(e) => setFooterSettings({ note: e.target.value })}
                    placeholder="Built to last. Delivered with precision."
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Copyright Notice
                  </label>
                  <input
                    className={field}
                    value={footerSettings.copyrightText || ""}
                    onChange={(e) => setFooterSettings({ copyrightText: e.target.value })}
                    placeholder="© 2026 Avrasya Properties Group — Luxury Real Estate & Advisory."
                  />
                </div>

                {/* Contact Overrides */}
                <div className="rounded-lg border bg-card p-4 space-y-3">
                  <span className="block text-xs font-semibold text-foreground">
                    Footer Contact Information Overrides (Optional)
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Leave empty to inherit standard contact details from Company details tab.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">
                        Email Override
                      </label>
                      <input
                        type="text"
                        value={footerSettings.contactOverrides?.email || ""}
                        onChange={(e) =>
                          setFooterSettings({
                            contactOverrides: {
                              ...footerSettings.contactOverrides,
                              email: e.target.value,
                            },
                          })
                        }
                        placeholder={form.email}
                        className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:border-brass focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">
                        Phone Override
                      </label>
                      <input
                        type="text"
                        value={footerSettings.contactOverrides?.phone || ""}
                        onChange={(e) =>
                          setFooterSettings({
                            contactOverrides: {
                              ...footerSettings.contactOverrides,
                              phone: e.target.value,
                            },
                          })
                        }
                        placeholder={form.phone}
                        className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:border-brass focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">
                        Address Override
                      </label>
                      <input
                        type="text"
                        value={footerSettings.contactOverrides?.address || ""}
                        onChange={(e) =>
                          setFooterSettings({
                            contactOverrides: {
                              ...footerSettings.contactOverrides,
                              address: e.target.value,
                            },
                          })
                        }
                        placeholder={form.address}
                        className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:border-brass focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SEO & Search */}
        {tab === "SEO & Search" && (
          <div className="max-w-4xl space-y-6">
            {/* Card: Google Search Preview */}
            <div className="rounded-xl border bg-card p-6 shadow-xs">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Search className="h-4 w-4 text-brass" />
                    <span>Google Search Result Snippet Preview</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Live simulation of how Avrasya Properties appears to international buyers in
                    Google search engine results.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Simulated Google Snippet</span>
                </div>
              </div>

              {/* Google Result Card Box */}
              <div className="rounded-lg border bg-white p-4 font-sans text-left shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0B2228] text-brass text-[10px] font-bold">
                    A
                  </div>
                  <div className="leading-tight">
                    <div className="text-[12px] font-normal text-[#202124]">Avrasya Properties</div>
                    <div className="text-[11px] font-normal text-[#4d5156] truncate max-w-md">
                      {form.siteUrl || "https://avrasyaproperties.com"}
                    </div>
                  </div>
                </div>
                <h3 className="text-[18px] leading-snug font-normal text-[#1a0dab] hover:underline cursor-pointer font-sans">
                  {form.siteTitle || DEFAULT_SITE_SETTINGS.siteTitle}
                </h3>
                <p className="text-[13px] leading-relaxed text-[#4d5156] mt-1 font-sans">
                  {form.metaDescription || DEFAULT_SITE_SETTINGS.metaDescription}
                </p>
              </div>

              {/* Status & Limits metrics */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border">
                  <span className="text-muted-foreground">Title Length:</span>
                  <span
                    className={`font-semibold tabular-nums ${(form.siteTitle || "").length >= 45 && (form.siteTitle || "").length <= 65 ? "text-emerald-600" : (form.siteTitle || "").length > 65 ? "text-amber-600" : "text-foreground"}`}
                  >
                    {(form.siteTitle || "").length} / 60 chars{" "}
                    {(form.siteTitle || "").length > 65 ? "(May truncate)" : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border">
                  <span className="text-muted-foreground">Description Length:</span>
                  <span
                    className={`font-semibold tabular-nums ${(form.metaDescription || "").length >= 130 && (form.metaDescription || "").length <= 165 ? "text-emerald-600" : (form.metaDescription || "").length > 165 ? "text-amber-600" : "text-foreground"}`}
                  >
                    {(form.metaDescription || "").length} / 160 chars{" "}
                    {(form.metaDescription || "").length > 165 ? "(May truncate)" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Card: Search Titles & Metadata */}
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-brass" />
                <span>Core Search & Social Metadata</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="cms-siteTitle"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                  >
                    Primary Website Search Title (Title Tag)
                  </label>
                  <input
                    id="cms-siteTitle"
                    className={field}
                    placeholder="e.g. Avrasya Properties | Istanbul Luxury Real Estate & Advisory"
                    value={form.siteTitle}
                    onChange={(e) => setField("siteTitle", e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground mt-1 block">
                    Displayed as the main clickable headline in search engines and browser tabs.
                    Recommended length: 50–60 characters. Avoid repeating brand names twice.
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="cms-metaDescription"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                  >
                    Primary Search Meta Description
                  </label>
                  <textarea
                    id="cms-metaDescription"
                    className={`${field} h-24 py-2`}
                    placeholder="Compelling 150-160 character description of your Istanbul real estate services..."
                    value={form.metaDescription}
                    onChange={(e) => setField("metaDescription", e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground mt-1 block">
                    Summarizes the website in search result snippets below the title. Recommended
                    length: 140–160 characters.
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="cms-siteUrl"
                      className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                    >
                      Canonical Website URL
                    </label>
                    <input
                      id="cms-siteUrl"
                      className={field}
                      placeholder="https://avrasyaproperties.com"
                      value={form.siteUrl}
                      onChange={(e) => setField("siteUrl", e.target.value)}
                    />
                    <span className="text-xs text-muted-foreground mt-1 block">
                      Defines the authoritative base URL for search engines and prevents duplicate
                      content fragmentation.
                    </span>
                  </div>

                  <div>
                    <label
                      htmlFor="cms-ogImage"
                      className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                    >
                      Social Sharing Image (OG / Twitter Card Image)
                    </label>
                    <input
                      id="cms-ogImage"
                      className={field}
                      placeholder="https://avrasyaproperties.com/images/properties/hero-main.jpg"
                      value={form.ogImage}
                      onChange={(e) => setField("ogImage", e.target.value)}
                    />
                    <span className="text-xs text-muted-foreground mt-1 block">
                      Image preview shown when sharing your link on WhatsApp, LinkedIn, Twitter, and
                      Facebook.
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="cms-keywords"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                  >
                    Target SEO Keywords
                  </label>
                  <input
                    id="cms-keywords"
                    className={field}
                    placeholder="Istanbul real estate, Turkish citizenship by investment, luxury apartments Istanbul, Bosphorus property"
                    value={form.keywords}
                    onChange={(e) => setField("keywords", e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground mt-1 block">
                    Comma-separated keywords defining your firm's primary advisory specialties.
                  </span>
                </div>
              </div>
            </div>

            {/* Card: Indexing & Crawling Controls */}
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brass" />
                <span>Indexing & Verification Controls</span>
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.indexingEnabled}
                    onChange={(e) => setField("indexingEnabled", e.target.checked)}
                    className="rounded border h-4 w-4 text-brass focus:ring-brass"
                  />
                  <div>
                    <span className="text-sm font-medium text-foreground block">
                      Allow Search Engine Crawlers to Index Website
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      When enabled, renders "index, follow" in robots directives. When unchecked,
                      outputs "noindex, nofollow" to hide the site from search engines.
                    </span>
                  </div>
                </label>

                <div>
                  <label
                    htmlFor="cms-googleVerification"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1"
                  >
                    Google Search Console Verification Token
                  </label>
                  <input
                    id="cms-googleVerification"
                    className={field}
                    placeholder="e.g. google-site-verification token or HTML meta content"
                    value={form.googleVerification}
                    onChange={(e) => setField("googleVerification", e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground mt-1 block">
                    Optional token for claiming ownership in Google Search Console without uploading
                    files.
                  </span>
                </div>
              </div>
            </div>

            {/* Card: Technical SEO Health & Status */}
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Layers className="h-4 w-4 text-brass" />
                <span>Sitemap & Crawler Architecture Status</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <div className="p-3 rounded-lg border bg-muted/20">
                  <div className="font-semibold text-foreground mb-1">XML Sitemap</div>
                  <div className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Active & Validated</span>
                  </div>
                  <div className="text-muted-foreground mt-1 font-mono text-[11px]">
                    /sitemap.xml (32 URLs)
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-muted/20">
                  <div className="font-semibold text-foreground mb-1">Crawler Directives</div>
                  <div className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Admin Protected</span>
                  </div>
                  <div className="text-muted-foreground mt-1 font-mono text-[11px]">
                    /robots.txt (Disallow /admin)
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-muted/20">
                  <div className="font-semibold text-foreground mb-1">Structured Schema</div>
                  <div className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>JSON-LD Live</span>
                  </div>
                  <div className="text-muted-foreground mt-1 text-[11px]">
                    WebSite & RealEstateAgent
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regions: cities/areas with their own districts, pages and filters */}
        {tab === "Regions" && (
          <RegionsEditor
            regions={
              form.regions && form.regions.length
                ? form.regions
                : normalizeRegions([], form.districts)
            }
            disabled={!editable}
            onChange={(next) => {
              setDirty(true);
              setForm((prev) => ({ ...prev, regions: next, districts: allDistricts(next) }));
            }}
          />
        )}

        {/* TAB 3: Search filters (Regions, Apartment Layouts, Budgets) */}
        {tab === "Search filters" && (
          <div className="max-w-4xl space-y-6">
            {/* Districts are managed per region now */}
            <div className="rounded-xl border bg-card p-6">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <MapPin className="h-4 w-4 text-brass" />
                <span>Regions and districts</span>
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Districts now belong to a region ({form.regions?.length || 0} configured,{" "}
                {form.districts?.length || 0} districts in total). Add or edit them in the Regions
                tab.
              </p>
              <button
                type="button"
                onClick={() => setTab("Regions")}
                className={btnGhost + " mt-3"}
              >
                Open Regions
              </button>
            </div>
            {/* Card 2: Apartment Layouts */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4 text-brass" />
                    <span>Apartment Layouts & Types ({form.layouts?.length || 0})</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Layout options available in Catalog filters, Lead acquisition requirements, and
                    property entry.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setField("layouts", [...DEFAULT_SITE_SETTINGS.layouts]);
                    toast.success("Restored standard layouts");
                  }}
                  className={btnGhost + " !text-xs gap-1.5"}
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset to Standard</span>
                </button>
              </div>

              {/* List of active layout tags */}
              <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/20 min-h-[56px] mb-4">
                {(form.layouts || []).map((layout, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-full bg-background border px-3 py-1 text-xs font-medium text-foreground shadow-xs group"
                  >
                    <span>{layout}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = form.layouts.filter((_, i) => i !== idx);
                        setField("layouts", next);
                      }}
                      className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                      title={`Remove ${layout}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {(!form.layouts || form.layouts.length === 0) && (
                  <span className="text-xs text-muted-foreground italic py-1">
                    No layouts configured. Add one below.
                  </span>
                )}
              </div>

              {/* Add new layout */}
              <div className="flex gap-2">
                <input
                  type="text"
                  className={field + " flex-1"}
                  placeholder="Enter new layout (e.g. 5+2 Triplex, Garden Duplex, Private Villa)"
                  value={newLayout}
                  onChange={(e) => setNewLayout(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newLayout.trim()) {
                        const l = newLayout.trim();
                        if (!form.layouts?.includes(l)) {
                          setField("layouts", [...(form.layouts || []), l]);
                          setNewLayout("");
                          toast.success(`Added ${l}`);
                        } else {
                          toast.error(`${l} already exists`);
                        }
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newLayout.trim()) {
                      const l = newLayout.trim();
                      if (!form.layouts?.includes(l)) {
                        setField("layouts", [...(form.layouts || []), l]);
                        setNewLayout("");
                        toast.success(`Added ${l}`);
                      } else {
                        toast.error(`${l} already exists`);
                      }
                    }
                  }}
                  className={btnPrimary + " gap-1.5 whitespace-nowrap"}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Layout</span>
                </button>
              </div>
            </div>

            {/* Card 3: Investment Budget Ranges */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-brass" />
                    <span>Budget Tiers & Price Presets ({form.budgetRanges?.length || 0})</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Preset price brackets configured across Homepage quick search and Portfolio
                    Catalog filters.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setField("budgetRanges", [...DEFAULT_SITE_SETTINGS.budgetRanges]);
                    toast.success("Restored standard budget brackets");
                  }}
                  className={btnGhost + " !text-xs gap-1.5"}
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset to Standard</span>
                </button>
              </div>

              {/* Table of active budget brackets */}
              <div className="overflow-x-auto rounded-lg border mb-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3">Display Label</th>
                      <th className="p-3">Min Amount (USD)</th>
                      <th className="p-3">Max Amount (USD)</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {(form.budgetRanges || []).map((b, idx) => (
                      <tr key={b.id || idx} className="hover:bg-muted/20">
                        <td className="p-3 font-medium text-foreground">{b.label}</td>
                        <td className="p-3 font-mono">${b.min?.toLocaleString()}</td>
                        <td className="p-3 font-mono">
                          {b.max >= 99999999 ? "No limit" : `$${b.max?.toLocaleString()}`}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const next = form.budgetRanges.filter((_, i) => i !== idx);
                              setField("budgetRanges", next);
                            }}
                            className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                            title="Delete tier"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!form.budgetRanges || form.budgetRanges.length === 0) && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-foreground italic">
                          No budget tiers configured.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add new budget tier form */}
              <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Add New Budget Bracket
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-[0.65rem] uppercase tracking-wider text-muted-foreground block mb-1">
                      Display Label
                    </label>
                    <input
                      type="text"
                      className={field}
                      placeholder="e.g. $750,000 – $1,200,000"
                      value={newBudget.label}
                      onChange={(e) => setNewBudget({ ...newBudget, label: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[0.65rem] uppercase tracking-wider text-muted-foreground block mb-1">
                      Min USD Amount
                    </label>
                    <input
                      type="number"
                      className={field}
                      placeholder="e.g. 750000"
                      value={newBudget.min || ""}
                      onChange={(e) =>
                        setNewBudget({ ...newBudget, min: Number(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[0.65rem] uppercase tracking-wider text-muted-foreground block mb-1">
                      Max USD Amount (0 for unlimited)
                    </label>
                    <input
                      type="number"
                      className={field}
                      placeholder="e.g. 1200000"
                      value={newBudget.max || ""}
                      onChange={(e) =>
                        setNewBudget({ ...newBudget, max: Number(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!newBudget.label.trim()) {
                        toast.error("Please provide a display label");
                        return;
                      }
                      const maxVal = newBudget.max > 0 ? newBudget.max : 99999999;
                      const id = `b-${Date.now().toString(36)}`;
                      const next = [
                        ...(form.budgetRanges || []),
                        { id, label: newBudget.label.trim(), min: newBudget.min, max: maxVal },
                      ];
                      setField("budgetRanges", next);
                      setNewBudget({ label: "", min: 0, max: 0 });
                      toast.success("Added budget tier");
                    }}
                    className={btnPrimary + " !text-xs gap-1.5"}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Budget Tier</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Exchange rates */}
        {tab === "Exchange rates" && (
          <div className="max-w-4xl space-y-6">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-4">Exchange rates</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Indicative exchange rate provider
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Uses the existing browser rate provider. Provider dates and refresh behavior
                      require separate verification; these rates are indicative.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.enableFrankfurterSync}
                      onChange={(e) => setField("enableFrankfurterSync", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brass"></div>
                  </label>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Manual rates (for 1 USD)
                  </p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border p-3 bg-card">
                      <p className="text-xs font-medium text-muted-foreground">EUR / USD</p>
                      <input
                        type="number"
                        step="0.001"
                        className={`${field} mt-1`}
                        value={form.exchangeRateEur}
                        onChange={(e) =>
                          setField("exchangeRateEur", parseFloat(e.target.value) || 0.892)
                        }
                      />
                    </div>
                    <div className="rounded-lg border p-3 bg-card">
                      <p className="text-xs font-medium text-muted-foreground">TRY / USD</p>
                      <input
                        type="number"
                        step="0.01"
                        className={`${field} mt-1`}
                        value={form.exchangeRateTry}
                        onChange={(e) =>
                          setField("exchangeRateTry", parseFloat(e.target.value) || 49.17)
                        }
                      />
                    </div>
                    <div className="rounded-lg border p-3 bg-card">
                      <p className="text-xs font-medium text-muted-foreground">GBP / USD</p>
                      <input
                        type="number"
                        step="0.001"
                        className={`${field} mt-1`}
                        value={form.exchangeRateGbp}
                        onChange={(e) =>
                          setField("exchangeRateGbp", parseFloat(e.target.value) || 0.756)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </fieldset>
      {/* TAB 4: Export data */}
      {tab === "Export data" && (
        <div className="max-w-4xl space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Download your records</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Download property listings, contacts, buyer enquiries, deals, viewings and website
              settings as a JSON file. Linked images and documents are not included.
            </p>
            <div className="flex flex-wrap gap-3">
              <button disabled={!isAdmin} onClick={handleDownloadBackup} className={btnPrimary}>
                <Download className="h-4 w-4" />
                <span>Download records</span>
              </button>
              <button
                disabled={!isAdmin || !DEMO_ENABLED}
                onClick={() => setIsImportOpen(!isImportOpen)}
                className={btnGhost}
              >
                <Upload className="h-4 w-4" />
                <span>Restore demo records</span>
              </button>
            </div>

            {isImportOpen && (
              <div className="mt-4 pt-4 border-t space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Paste JSON Backup Content
                </label>
                <textarea
                  className={`${field} h-36 font-mono text-xs`}
                  placeholder="Paste JSON database payload here..."
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                />
                <button
                  disabled={!isAdmin || !DEMO_ENABLED}
                  onClick={handleImportSubmit}
                  className={btnPrimary}
                >
                  Confirm Database Restore
                </button>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
            <h2 className="text-base font-semibold text-destructive flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Reset Browser Demo Workspace</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Replace this browser’s data with source-derived listing examples, fictional CRM
              records, and default settings. This does not restore a production database.
            </p>
            <button
              disabled={!isAdmin || !DEMO_ENABLED}
              onClick={handleResetFactory}
              className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-destructive/40 bg-destructive/10 px-3 text-sm font-medium text-destructive hover:bg-destructive/20"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset demo data</span>
            </button>
          </div>
        </div>
      )}

      <UnsavedChangesDialog
        isDirty={dirty}
        title="Unsaved Website Settings"
        description="You have modified settings that have not been saved yet. Leaving this page will discard all unsaved edits."
      />
    </div>
  );
}
