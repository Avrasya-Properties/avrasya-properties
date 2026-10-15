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
} from "lucide-react";
import { PageHead, btnGhost, btnPrimary, field } from "@/admin/Shell";
import { SecuritySettings } from "@/admin/SecuritySettings";
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
  type SiteSettings,
} from "@/admin/store";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

const TABS = [
  "Company details",
  "Homepage",
  "Website appearance",
  "Search filters",
  "Exchange rates",
  "SEO & Search",
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

  const handleSave = async () => {
    try {
      await updateSiteSettings(form, revision.current);
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
      if (!importJson.trim()) {
        toast.error("Please paste JSON backup data");
        return;
      }
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
        {DEMO_ENABLED ? "Browser demo. Use fictional data only." : "Saved changes appear on the website."}
        {!editable && " Your role has read-only access."}
      </p>

      <div className="flex flex-wrap gap-2">
        {([
          ["content_pages", "Website pages"],
          ["content_sections", "Page sections"],
          ["services", "Services"],
          ["faqs", "Questions and answers"],
          ["catalog_documents", "Brochures"],
        ] as const).map(([sectionKey, label]) => (
          <button key={sectionKey} type="button" className={btnGhost + " !text-xs gap-1.5"}>
            <Settings2 className="h-3 w-3" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-1 overflow-x-auto border-b">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t ? "border-b-2 border-brass text-brass" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Sign-in and recovery" && (isAdmin && !DEMO_ENABLED ? <SecuritySettings /> : <p>Sign-in settings are available to the live account owner.</p>)}

      <fieldset id="cms-fields" disabled={!editable} className="min-w-0">
        {tab === "Website appearance" && (
          <div className="max-w-4xl space-y-5 rounded border bg-card p-5">
            <h2 className="font-semibold">Website images and footer</h2>
            <p className="text-sm text-muted-foreground">Appearance settings are available here.</p>
          </div>
        )}

        {tab === "Company details" && (
          <div className="max-w-4xl space-y-6">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                <Building2 className="h-4 w-4 text-brass" />
                <span>Company details</span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cms-companyName" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Brand Name
                  </label>
                  <input id="cms-companyName" className={field} value={form.companyName} onChange={(e) => setField("companyName", e.target.value)} />
                </div>
                <div>
                  <label htmlFor="cms-tagline" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Brand Tagline
                  </label>
                  <input id="cms-tagline" className={field} value={form.tagline} onChange={(e) => setField("tagline", e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "Homepage" && (
          <div className="max-w-4xl space-y-6">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 text-base font-semibold text-foreground">Homepage heading and text</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="cms-eyebrowText" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Eyebrow Text (Header Category)
                  </label>
                  <input id="cms-eyebrowText" className={field} value={form.eyebrowText} onChange={(e) => setField("eyebrowText", e.target.value)} />
                </div>
                <div>
                  <label htmlFor="cms-heroHeadline" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Hero Headline
                  </label>
                  <input id="cms-heroHeadline" className={field} value={form.heroHeadline} onChange={(e) => setField("heroHeadline", e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "SEO & Search" && (
          <div className="max-w-4xl space-y-6">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                <Search className="h-4 w-4 text-brass" />
                <span>Google Search Result Snippet Preview</span>
              </h2>
              <div className="rounded-lg border bg-white p-4 font-sans text-left shadow-xs">
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0B2228] text-[10px] font-bold text-brass">A</div>
                  <div className="leading-tight">
                    <div className="text-[12px] font-normal text-[#202124]">Avrasya Properties</div>
                    <div className="max-w-md truncate text-[11px] font-normal text-[#4d5156]">
                      {form.siteUrl || "https://avrasyaproperties.com"}
                    </div>
                  </div>
                </div>
                <h3 className="text-[18px] font-normal leading-snug text-[#1a0dab]">{form.siteTitle || DEFAULT_SITE_SETTINGS.siteTitle}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-[#4d5156]">{form.metaDescription || DEFAULT_SITE_SETTINGS.metaDescription}</p>
              </div>
            </div>
          </div>
        )}

        {tab === "Search filters" && (
          <div className="max-w-4xl space-y-6">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                <MapPin className="h-4 w-4 text-brass" />
                <span>Istanbul Districts & Regions ({form.districts?.length || 0})</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {(form.districts || []).map((dist, idx) => (
                  <span key={`${dist}-${idx}`} className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-foreground">
                    <span>{dist}</span>
                    <button type="button" onClick={() => setField("districts", (form.districts || []).filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "Exchange rates" && (
          <div className="max-w-4xl space-y-6">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 text-base font-semibold text-foreground">Exchange rates</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-3 bg-card">
                  <p className="text-xs font-medium text-muted-foreground">EUR / USD</p>
                  <input type="number" step="0.001" className={`${field} mt-1`} value={form.exchangeRateEur} onChange={(e) => setField("exchangeRateEur", parseFloat(e.target.value) || 0.892)} />
                </div>
                <div className="rounded-lg border p-3 bg-card">
                  <p className="text-xs font-medium text-muted-foreground">TRY / USD</p>
                  <input type="number" step="0.01" className={`${field} mt-1`} value={form.exchangeRateTry} onChange={(e) => setField("exchangeRateTry", parseFloat(e.target.value) || 49.17)} />
                </div>
                <div className="rounded-lg border p-3 bg-card">
                  <p className="text-xs font-medium text-muted-foreground">GBP / USD</p>
                  <input type="number" step="0.001" className={`${field} mt-1`} value={form.exchangeRateGbp} onChange={(e) => setField("exchangeRateGbp", parseFloat(e.target.value) || 0.756)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "Export data" && (
          <div className="max-w-4xl space-y-6">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 text-base font-semibold text-foreground">Download your records</h2>
              <button onClick={handleDownloadBackup} className={btnPrimary}>
                <Download className="h-4 w-4" />
                <span>Download records</span>
              </button>
            </div>
          </div>
        )}
      </fieldset>
    </div>
  );
}
