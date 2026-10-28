import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MapPin, Plus, Save, ExternalLink, Sparkles, Building2, Globe } from "lucide-react";
import { PageHead, btnGhost, btnPrimary } from "@/admin/Shell";
import { RegionsEditor } from "@/admin/RegionsEditor";
import { allDistricts, normalizeRegions, type Region } from "@/data/regions";
import { 
  can, 
  DEMO_ENABLED, 
  settingsRevision, 
  updateSiteSettings, 
  useDB, 
  useSession 
} from "@/admin/store";

export const Route = createFileRoute("/admin/regions")({
  component: AdminRegionsPage,
});

export function AdminRegionsPage() {
  const db = useDB();
  const user = useSession();
  const editable = can(user, "publish");

  const [regions, setRegions] = useState<Region[]>(() =>
    normalizeRegions(db.siteSettings.regions, db.siteSettings.districts),
  );
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const revision = useRef("");

  useEffect(() => {
    if (!dirty) {
      setRegions(normalizeRegions(db.siteSettings.regions, db.siteSettings.districts));
      revision.current = settingsRevision();
    }
  }, [db.siteSettings, dirty]);

  const handleSave = async (listToSave?: Region[]) => {
    if (!editable) return;
    const target = listToSave || regions;
    setSaving(true);
    try {
      await updateSiteSettings(
        {
          regions: target,
          districts: allDistricts(target),
        },
        revision.current,
      );
      setDirty(false);
      toast.success(
        DEMO_ENABLED
          ? "Cities & regions updated in this browser."
          : "Cities & regions published to live website.",
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const publishedCount = regions.filter((r) => r.published).length;
  const totalDistricts = regions.reduce((sum, r) => sum + (r.districts?.length || 0), 0);

  return (
    <div className="space-y-6">
      <PageHead
        title="Cities & Regions"
        crumbs="Property Listings / Regional Portfolios"
        action={
          <div className="flex items-center gap-2">
            <Link
              to="/properties"
              target="_blank"
              className={btnGhost}
              title="View how regions look on the public website"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Public catalog</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </Link>
            <button
              onClick={() => handleSave()}
              disabled={!editable || !dirty || saving}
              className={btnPrimary}
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? "Saving..." : dirty ? "Save region changes *" : "Saved"}</span>
            </button>
          </div>
        }
      />

      {/* Overview Metric Banner */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brass/10 text-brass">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Configured Cities</p>
              <h3 className="font-display text-xl font-bold text-foreground">
                {regions.length} <span className="text-xs font-normal text-muted-foreground">({publishedCount} live)</span>
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Districts</p>
              <h3 className="font-display text-xl font-bold text-foreground">
                {totalDistricts} <span className="text-xs font-normal text-muted-foreground">across Türkiye</span>
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Regional Sync</p>
              <h3 className="text-sm font-semibold text-foreground">
                {dirty ? "Unsaved edits pending" : "In sync with website"}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Helpful Instructions Banner */}
      <div className="rounded-xl border border-brass/30 bg-brass/5 p-4 text-xs text-foreground leading-relaxed flex items-start gap-3">
        <MapPin className="h-4 w-4 text-brass shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-brass-text block mb-0.5">
            Managing Turkish Investment Cities & Regional Markets
          </strong>
          <p className="text-muted-foreground">
            Add any city in Türkiye (e.g. Istanbul, Antalya, Bodrum, Izmir, Ankara, Fethiye).
            Each region automatically powers website search filters, property assignment dropdowns, and regional portfolio pages.
            Use the preset buttons below for instant 1-click additions with pre-configured districts.
          </p>
        </div>
      </div>

      {/* Main Regions Editor */}
      <div className="rounded-xl border bg-card p-5">
        <RegionsEditor
          regions={regions}
          disabled={!editable}
          onChange={(next) => {
            setDirty(true);
            setRegions(next);
          }}
        />
      </div>

      {/* Bottom Sticky Action Bar when dirty */}
      {dirty && (
        <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-xl border border-brass/50 bg-secondary/95 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-brass animate-pulse" />
            <span className="text-xs font-medium text-foreground">
              You have unsaved changes to your cities and regions.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRegions(normalizeRegions(db.siteSettings.regions, db.siteSettings.districts));
                setDirty(false);
              }}
              className={btnGhost}
            >
              Discard
            </button>
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className={btnPrimary}
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? "Publishing..." : "Publish to website"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
