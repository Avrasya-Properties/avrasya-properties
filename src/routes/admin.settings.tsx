import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
} from "lucide-react";
import { PageHead, btnGhost, btnPrimary, field } from "@/admin/Shell";
import {
  DEFAULT_SITE_SETTINGS,
  exportBackup,
  importBackup,
  resetData,
  updateSiteSettings,
  useDB,
  useSession,
  can,
  type SiteSettings,
} from "@/admin/store";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

const TABS = ["Company Profile", "Homepage & CMS", "Currency & Rates", "Backup & Restore"] as const;

export function AdminSettingsPage() {
  const db = useDB();
  const user = useSession();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Company Profile");
  const [form, setForm] = useState<SiteSettings>({ ...db.siteSettings });
  const [importJson, setImportJson] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);

  const isAdmin = can(user, "admin");

  const setField = <K extends keyof SiteSettings>(key: K, val: SiteSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    try {
      updateSiteSettings(form);
      toast.success("Website content & settings updated live across all public pages");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleDownloadBackup = () => {
    try {
      const dataStr = exportBackup();
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `avrasya-properties-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Complete JSON database backup exported");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleImportSubmit = () => {
    try {
      if (!importJson.trim()) return toast.error("Please paste JSON backup data");
      importBackup(importJson);
      toast.success("Database restored successfully from backup");
      setIsImportOpen(false);
      setImportJson("");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleResetFactory = () => {
    if (
      confirm(
        "Reset all properties, leads, contacts and settings to default seed data? Any session changes will be reverted.",
      )
    ) {
      resetData();
      setForm({ ...DEFAULT_SITE_SETTINGS });
      toast.success("Database restored to default verified state");
    }
  };

  return (
    <div className="space-y-6">
      <PageHead
        title="Website Content & CMS"
        crumbs="Platform / Settings"
        action={
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className={btnPrimary}>
              <Save className="h-3.5 w-3.5" />
              <span>Save CMS Changes</span>
            </button>
          </div>
        }
      />

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

      {/* TAB 1: Company Profile */}
      {tab === "Company Profile" && (
        <div className="max-w-4xl space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-brass" />
              <span>Corporate & Headquarters Identity</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Brand Name
                </label>
                <input
                  className={field}
                  value={form.companyName}
                  onChange={(e) => setField("companyName", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Brand Tagline
                </label>
                <input
                  className={field}
                  value={form.tagline}
                  onChange={(e) => setField("tagline", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Registered Legal Entity
                </label>
                <input
                  className={field}
                  value={form.registeredEntity}
                  onChange={(e) => setField("registeredEntity", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Chamber / Trade License
                </label>
                <input
                  className={field}
                  value={form.licenseNo}
                  onChange={(e) => setField("licenseNo", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Registered Headquarters Address
                </label>
                <textarea
                  className={`${field} h-20 py-2`}
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Advisory Working Hours
                </label>
                <input
                  className={field}
                  value={form.advisoryHours}
                  onChange={(e) => setField("advisoryHours", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Tax Office & Registration
                </label>
                <input
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
              <span>Direct Client Communication Channels</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Direct Phone Line
                </label>
                <input
                  className={field}
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  WhatsApp Direct URL
                </label>
                <input
                  className={field}
                  value={form.whatsapp}
                  onChange={(e) => setField("whatsapp", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Official Advisory Email
                </label>
                <input
                  className={field}
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Homepage & CMS */}
      {tab === "Homepage & CMS" && (
        <div className="max-w-4xl space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">
              Homepage Hero & Main Editorial Text
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Eyebrow Text (Header Category)
                </label>
                <input
                  className={field}
                  value={form.eyebrowText}
                  onChange={(e) => setField("eyebrowText", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Hero Headline
                </label>
                <input
                  className={field}
                  value={form.heroHeadline}
                  onChange={(e) => setField("heroHeadline", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Hero Subtitle
                </label>
                <textarea
                  className={`${field} h-24 py-2`}
                  value={form.heroSubtitle}
                  onChange={(e) => setField("heroSubtitle", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">
              Statutory Citizenship (CBI) Threshold
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 items-center">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Turkish CBI Minimum Threshold (USD)
                </label>
                <input
                  type="number"
                  className={field}
                  value={form.cbiThresholdUsd}
                  onChange={(e) => setField("cbiThresholdUsd", Number(e.target.value) || 400000)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Statutory minimum property valuation required for Turkish Citizenship by
                  Investment ($400,000 statutory law).
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-xs font-semibold text-foreground">Current Rule Active:</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Properties with valuation equal to or exceeding{" "}
                  <b>${form.cbiThresholdUsd.toLocaleString()}</b> receive automatic "CBI Eligible"
                  status across website filters.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">
              Top Notification / Announcement Banner
            </h2>
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
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Announcement Banner Text
                  </label>
                  <input
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

      {/* TAB 3: Currency & Rates */}
      {tab === "Currency & Rates" && (
        <div className="max-w-4xl space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">
              Multi-Currency Conversion Engine
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Real-Time European Central Bank (Frankfurter API)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Automatically pulls hourly ECB spot exchange rates for USD, EUR, TRY, and GBP.
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
                  Fallback / Statutory Exchange Rates (Base: 1 USD)
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

      {/* TAB 4: Backup & Restore */}
      {tab === "Backup & Restore" && (
        <div className="max-w-4xl space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">
              Database Export & Snapshot
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Export all 18+ property records, active leads, CRM contacts, deals, scheduled calendar
              viewings, and website CMS configurations into a single standalone JSON file.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleDownloadBackup} className={btnPrimary}>
                <Download className="h-4 w-4" />
                <span>Export JSON Backup</span>
              </button>
              <button onClick={() => setIsImportOpen(!isImportOpen)} className={btnGhost}>
                <Upload className="h-4 w-4" />
                <span>Restore from JSON</span>
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
                <button onClick={handleImportSubmit} className={btnPrimary}>
                  Confirm Database Restore
                </button>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
            <h2 className="text-base font-semibold text-destructive flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Reset Database to Initial Verified State</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Re-initialize all database tables with the original 18 verified properties, leadership
              profiles, seed CRM deals, and standard settings.
            </p>
            <button
              onClick={handleResetFactory}
              className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-destructive/40 bg-destructive/10 px-3 text-sm font-medium text-destructive hover:bg-destructive/20"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset to Seed State</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
