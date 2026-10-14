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
  X
} from "lucide-react";
import { PageHead, btnGhost, btnPrimary, field } from "@/admin/Shell";
import { DESIGN_FIELDS } from "@/admin/website-design";
import { uploadImage } from "@/admin/store";
import { 
  DEMO_ENABLED,
  DEFAULT_SITE_SETTINGS, 
  exportBackup, 
  importBackup, 
  resetData, 
  updateSiteSettings,
  settingsRevision, 
  useDB, 
  useSession, 
  can, 
  type SiteSettings 
} from "@/admin/store";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

const TABS = ["Company details", "Homepage", "Website appearance", "Search filters", "Exchange rates", "Export data"] as const;

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

  const isAdmin = can(user, "admin");
  const editable = can(user, "publish");
  const revision=useRef("");
  const [dirty, setDirty] = useState(false);
  useEffect(() => { if (!dirty) {setForm({ ...db.siteSettings });revision.current=settingsRevision();} }, [db.siteSettings, dirty]);

  const setField = <K extends keyof SiteSettings>(key: K, val: SiteSettings[K]) => {
    setDirty(true);
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    try {
      await updateSiteSettings(form,revision.current);
      setDirty(false);
      toast.success(DEMO_ENABLED ? "Demo settings saved in this browser." : "Website settings published.");
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
      if (!importJson.trim()) { toast.error("Please paste JSON backup data"); return; }
      if (!confirm("Replace this browser’s workspace with the validated backup? Export the current workspace first.")) return;
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
    if (!confirm("Reset this browser’s properties, leads, contacts and settings to demo data? Export a backup first.")) return;
    try {
      await resetData();
      setForm({ ...DEFAULT_SITE_SETTINGS }); setDirty(false);
      toast.success("Demo workspace reset");
    } catch (error) { toast.error((error as Error).message); }
  };

  return (
    <div className="space-y-6">
      <PageHead
        title="Website settings"
        crumbs="Platform / Settings"
        action={
          <div className="flex items-center gap-2">
            <button
              disabled={!editable || !dirty}
              onClick={handleSave}
              className={btnPrimary}
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save website settings</span>
            </button>
          </div>
        }
      />

      <p role="status" className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
        {DEMO_ENABLED ? "Browser demo. Use fictional data only." : "Saved changes appear on the website."}
        {!editable && " Your role has read-only access."}
      </p>
      <div className="flex flex-wrap gap-2">
        {([["content_pages","Website pages"],["content_sections","Page sections"],["services","Services"],["faqs","Questions and answers"],["catalog_documents","Brochures"]] as const).map(([section,label])=><a key={section} href={"/admin/manage?section="+section} className={btnGhost}>{label}</a>)}
      </div>
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t
                ? "border-b-2 border-brass text-brass"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <fieldset id="cms-fields" disabled={!editable} className="min-w-0">
      {tab==="Website appearance"&&<div className="max-w-4xl space-y-5 rounded border bg-card p-5"><h2 className="font-semibold">Website images and footer</h2><p className="text-sm text-muted-foreground">Use image links or upload JPEG, PNG or WebP files under 5 MB. Leave an image link empty to use the original branding. Save website settings to apply your changes.</p>{DESIGN_FIELDS.map(design=><label key={design.key} className="block text-sm">{design.label}<input className={field} value={form.websiteDesign?.[design.key]||""} onChange={e=>setField("websiteDesign",{...form.websiteDesign,[design.key]:e.target.value})}/>{"image" in design&&design.image&&<><input aria-label={"Upload "+design.label.toLowerCase()} className="mt-2 block max-w-full text-xs" type="file" accept="image/jpeg,image/png,image/webp" disabled={DEMO_ENABLED} onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{const url=await uploadImage(file);setField("websiteDesign",{...form.websiteDesign,[design.key]:url});toast.success("Image uploaded. Save settings to apply it.");}catch(error){toast.error((error as Error).message);}}}/>{form.websiteDesign?.[design.key]&&<img src={form.websiteDesign[design.key]} alt={design.label} className="mt-3 max-h-36 max-w-full rounded border bg-muted object-contain"/>}</>}</label>)}</div>}
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
                <label htmlFor="cms-companyName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Brand Name
                </label>
                <input id="cms-companyName"
                  className={field}
                  value={form.companyName}
                  onChange={(e) => setField("companyName", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="cms-tagline" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Brand Tagline
                </label>
                <input id="cms-tagline"
                  className={field}
                  value={form.tagline}
                  onChange={(e) => setField("tagline", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="cms-registeredEntity" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Registered Legal Entity
                </label>
                <input id="cms-registeredEntity"
                  className={field}
                  value={form.registeredEntity}
                  onChange={(e) => setField("registeredEntity", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="cms-licenseNo" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Chamber / Trade License
                </label>
                <input id="cms-licenseNo"
                  className={field}
                  value={form.licenseNo}
                  onChange={(e) => setField("licenseNo", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="cms-address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Registered Headquarters Address
                </label>
                <textarea id="cms-address"
                  className={`${field} h-20 py-2`}
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="cms-advisoryHours" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Advisory Working Hours
                </label>
                <input id="cms-advisoryHours"
                  className={field}
                  value={form.advisoryHours}
                  onChange={(e) => setField("advisoryHours", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="cms-taxOffice" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Tax Office & Registration
                </label>
                <input id="cms-taxOffice"
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
                <label htmlFor="cms-phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Direct Phone Line
                </label>
                <input id="cms-phone"
                  className={field}
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="cms-whatsapp" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  WhatsApp Direct URL
                </label>
                <input id="cms-whatsapp"
                  className={field}
                  value={form.whatsapp}
                  onChange={(e) => setField("whatsapp", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="cms-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Official Advisory Email
                </label>
                <input id="cms-email"
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
                <label htmlFor="cms-eyebrowText" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Eyebrow Text (Header Category)
                </label>
                <input id="cms-eyebrowText"
                  className={field}
                  value={form.eyebrowText}
                  onChange={(e) => setField("eyebrowText", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="cms-heroHeadline" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Hero Headline
                </label>
                <input id="cms-heroHeadline"
                  className={field}
                  value={form.heroHeadline}
                  onChange={(e) => setField("heroHeadline", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="cms-heroSubtitle" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Hero Subtitle
                </label>
                <textarea id="cms-heroSubtitle"
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
                <label htmlFor="cms-cbiThresholdUsd" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Turkish CBI Minimum Threshold (USD)
                </label>
                <input id="cms-cbiThresholdUsd"
                  type="number"
                  className={field}
                  value={form.cbiThresholdUsd}
                  onChange={(e) => setField("cbiThresholdUsd", Number(e.target.value) || 400000)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Reference value only. Confirm current programme requirements with the client’s legal advisor before publication.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-xs font-semibold text-foreground">Current Rule Active:</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  The configured reference is <b>${form.cbiThresholdUsd.toLocaleString()}</b>. A listing price alone does not verify citizenship eligibility; record a separate legal review.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">
              Website announcement
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.announcementActive}
                  onChange={(e) => setField("announcementActive", e.target.checked)}
                  className="rounded border"
                />
                <span className="text-sm font-medium text-foreground">Enable site-wide top announcement bar</span>
              </label>
              {form.announcementActive && (
                <div>
                  <label htmlFor="cms-announcementText" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Announcement Banner Text
                  </label>
                <input id="cms-announcementText"
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

      {/* TAB 3: Search filters (Regions, Apartment Layouts, Budgets) */}
      {tab === "Search filters" && (
        <div className="max-w-4xl space-y-6">
          {/* Card 1: Istanbul Districts / Regions */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brass" />
                  <span>Istanbul Districts & Regions ({form.districts?.length || 0})</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Active regions available in Homepage search, Property Catalog district filter, and Consultation brief.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setField("districts", [...DEFAULT_SITE_SETTINGS.districts]);
                  toast.success("Restored standard Istanbul districts");
                }}
                className={btnGhost + " !text-xs gap-1.5"}
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset to Standard</span>
              </button>
            </div>

            {/* List of active district tags */}
            <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/20 min-h-[56px] mb-4">
              {(form.districts || []).map((dist, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-full bg-background border px-3 py-1 text-xs font-medium text-foreground shadow-xs group"
                >
                  <span>{dist}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = form.districts.filter((_, i) => i !== idx);
                      setField("districts", next);
                    }}
                    className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                    title={`Remove ${dist}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {(!form.districts || form.districts.length === 0) && (
                <span className="text-xs text-muted-foreground italic py-1">
                  No districts configured. Add one below.
                </span>
              )}
            </div>

            {/* Add new district */}
            <div className="flex gap-2">
              <input
                type="text"
                className={field + " flex-1"}
                placeholder="Enter new Istanbul district (e.g. Karaköy, Moda, Tarabya)"
                value={newDistrict}
                onChange={(e) => setNewDistrict(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newDistrict.trim()) {
                      const d = newDistrict.trim();
                      if (!form.districts?.includes(d)) {
                        setField("districts", [...(form.districts || []), d]);
                        setNewDistrict("");
                        toast.success(`Added ${d}`);
                      } else {
                        toast.error(`${d} already exists`);
                      }
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newDistrict.trim()) {
                    const d = newDistrict.trim();
                    if (!form.districts?.includes(d)) {
                      setField("districts", [...(form.districts || []), d]);
                      setNewDistrict("");
                      toast.success(`Added ${d}`);
                    } else {
                      toast.error(`${d} already exists`);
                    }
                  }
                }}
                className={btnPrimary + " gap-1.5 whitespace-nowrap"}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Region</span>
              </button>
            </div>
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
                  Layout options available in Catalog filters, Lead acquisition requirements, and property entry.
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
                  Preset price brackets configured across Homepage quick search and Portfolio Catalog filters.
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
                    onChange={(e) => setNewBudget({ ...newBudget, min: Number(e.target.value) || 0 })}
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
                    onChange={(e) => setNewBudget({ ...newBudget, max: Number(e.target.value) || 0 })}
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
                    const next = [...(form.budgetRanges || []), { id, label: newBudget.label.trim(), min: newBudget.min, max: maxVal }];
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
            <h2 className="text-base font-semibold text-foreground mb-4">
              Exchange rates
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                <div>
                  <p className="text-sm font-medium text-foreground">Indicative exchange rate provider</p>
                  <p className="text-xs text-muted-foreground">
                    Uses the existing browser rate provider. Provider dates and refresh behavior require separate verification; these rates are indicative.
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
                      onChange={(e) => setField("exchangeRateEur", parseFloat(e.target.value) || 0.892)}
                    />
                  </div>
                  <div className="rounded-lg border p-3 bg-card">
                    <p className="text-xs font-medium text-muted-foreground">TRY / USD</p>
                    <input
                      type="number"
                      step="0.01"
                      className={`${field} mt-1`}
                      value={form.exchangeRateTry}
                      onChange={(e) => setField("exchangeRateTry", parseFloat(e.target.value) || 49.17)}
                    />
                  </div>
                  <div className="rounded-lg border p-3 bg-card">
                    <p className="text-xs font-medium text-muted-foreground">GBP / USD</p>
                    <input
                      type="number"
                      step="0.001"
                      className={`${field} mt-1`}
                      value={form.exchangeRateGbp}
                      onChange={(e) => setField("exchangeRateGbp", parseFloat(e.target.value) || 0.756)}
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
            <h2 className="text-base font-semibold text-foreground mb-4">
              Download your records
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Download property listings, contacts, buyer enquiries, deals, viewings and website settings as a JSON file. Linked images and documents are not included.
            </p>
            <div className="flex flex-wrap gap-3">
              <button disabled={!isAdmin} onClick={handleDownloadBackup} className={btnPrimary}>
                <Download className="h-4 w-4" />
                <span>Download records</span>
              </button>
              <button disabled={!isAdmin || !DEMO_ENABLED} onClick={() => setIsImportOpen(!isImportOpen)} className={btnGhost}>
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
                <button disabled={!isAdmin || !DEMO_ENABLED} onClick={handleImportSubmit} className={btnPrimary}>
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
              Replace this browser’s data with source-derived listing examples, fictional CRM records, and default settings. This does not restore a production database.
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
    </div>
  );
}

