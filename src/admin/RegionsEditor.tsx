import { useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Eye, EyeOff, MapPin, Plus, Trash2, Upload, X } from "lucide-react";
import { btnGhost, btnPrimary, field } from "@/admin/Shell";
import { uploadImage } from "@/admin/store";
import { REGION_PRESETS, REGION_SLUG_RE, slugifyRegion, type Region } from "@/data/regions";

type Props = { regions: Region[]; onChange: (next: Region[]) => void; disabled?: boolean };

const blank = (order: number): Region => ({
  slug: "", name: "", country: "Türkiye", summary: "", heroImage: "", districts: [], hasSides: false,
  published: true, sortOrder: order, seoTitle: "", seoDescription: "",
});

/** Staff-facing regions manager. New regions start unpublished so a half-written region never goes live. */
export function RegionsEditor({ regions, onChange, disabled }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const [draftDistrict, setDraftDistrict] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const emit = (list: Region[]) => onChange(list.map((r, i) => ({ ...r, sortOrder: i })));
  const patch = (index: number, change: Partial<Region>) => emit(regions.map((r, i) => (i === index ? { ...r, ...change } : r)));

  const add = () => {
    const next = blank(regions.length);
    emit([...regions, next]);
    setOpen(regions.length);
  };

  const addPreset = (preset: (typeof REGION_PRESETS)[number]) => {
    if (regions.some((r) => r.slug === preset.slug || slugifyRegion(r.name) === preset.slug)) {
      toast.error(`${preset.name} is already in the regions list`);
      return;
    }
    const next: Region = { ...preset, sortOrder: regions.length };
    emit([...regions, next]);
    setOpen(regions.length);
    toast.success(`Added ${preset.name}. Save website settings to apply.`);
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= regions.length) return;
    const list = [...regions];
    const [item] = list.splice(index, 1);
    if (item) list.splice(target, 0, item);
    emit(list);
    setDraftDistrict({});
    if (open === index) setOpen(target);
    else if (open === target) setOpen(index);
  };

  const remove = (index: number) => {
    const r = regions[index];
    if (!r) return;
    if (!confirm(`Remove ${r.name || "this region"}? Listings keep their city text, but this region will no longer group them on the website.`)) return;
    emit(regions.filter((_, i) => i !== index));
    setDraftDistrict({});
    setOpen(null);
  };

  const addDistrict = (index: number) => {
    const key = String(index);
    const value = (draftDistrict[key] || "").trim();
    const r = regions[index];
    if (!value || !r) return;
    if (r.districts.some((d) => d.toLowerCase() === value.toLowerCase())) { toast.error(`${value} already exists`); return; }
    patch(index, { districts: [...r.districts, value] });
    setDraftDistrict((d) => ({ ...d, [key]: "" }));
  };

  const upload = async (index: number, file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try { patch(index, { heroImage: await uploadImage(file) }); toast.success("Image uploaded. Save website settings to publish it."); }
    catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <div className="max-w-4xl space-y-4">
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-brass" />
              <span>Regions ({regions.length})</span>
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Add the cities or coastal areas you sell in. Each region gets its own districts, a page on the website and a filter on the property search.
              To place a listing in a region, choose the region on the listing. Unpublished regions stay hidden from visitors.
            </p>
          </div>
          <button type="button" disabled={disabled} onClick={add} className={btnPrimary + " gap-1.5 whitespace-nowrap"}>
            <Plus className="h-3.5 w-3.5" />
            <span>Add custom region</span>
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick-add major cities:</span>
          {REGION_PRESETS.map((preset) => {
            const exists = regions.some((r) => r.slug === preset.slug || slugifyRegion(r.name) === preset.slug);
            return (
              <button
                key={preset.slug}
                type="button"
                disabled={disabled || exists}
                onClick={() => addPreset(preset)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                  exists
                    ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground"
                    : "bg-background hover:bg-muted text-foreground hover:border-brass"
                }`}
              >
                + {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {regions.map((r, index) => {
        const isOpen = open === index;
        const slugOk = REGION_SLUG_RE.test(r.slug);
        return (
          <div key={index} className="rounded-xl border bg-card">
            <div className="flex items-center gap-2 p-4">
              <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : index)}>
                {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                <span className="truncate font-medium">{r.name || "New region"}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{r.districts.length} districts</span>
                <span className={"shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium " + (r.published ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-muted-foreground")}>
                  {r.published ? "Live" : "Hidden"}
                </span>
              </button>
              <button type="button" disabled={disabled || index === 0} onClick={() => move(index, -1)} className={btnGhost + " !px-2"} aria-label={`Move ${r.name || "region"} up`}><ArrowUp className="h-3.5 w-3.5" /></button>
              <button type="button" disabled={disabled || index === regions.length - 1} onClick={() => move(index, 1)} className={btnGhost + " !px-2"} aria-label={`Move ${r.name || "region"} down`}><ArrowDown className="h-3.5 w-3.5" /></button>
              <button type="button" disabled={disabled} onClick={() => patch(index, { published: !r.published })} className={btnGhost + " !px-2"} aria-label={r.published ? "Hide region" : "Publish region"}>
                {r.published ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
              <button type="button" disabled={disabled} onClick={() => remove(index)} className={btnGhost + " !px-2 text-destructive"} aria-label={`Remove ${r.name || "region"}`}><Trash2 className="h-3.5 w-3.5" /></button>
            </div>

            {isOpen && (
              <div className="grid gap-4 border-t p-4 md:grid-cols-2">
                <label className="block text-sm">Region name
                  <input className={field} value={r.name} disabled={disabled} placeholder="Antalya"
                    onChange={(e) => patch(index, { name: e.target.value, ...(r.slug === "" || r.slug === slugifyRegion(r.name) ? { slug: slugifyRegion(e.target.value) } : {}) })} />
                </label>
                <label className="block text-sm">Web address ending
                  <input className={field} value={r.slug} disabled={disabled} placeholder="antalya" aria-invalid={!slugOk}
                    onChange={(e) => patch(index, { slug: e.target.value.toLowerCase() })} />
                  <span className={"mt-1 block text-xs " + (slugOk ? "text-muted-foreground" : "text-destructive")}>
                    {slugOk ? `Page: /regions/${r.slug}` : "Use lowercase letters, numbers and single hyphens."}
                  </span>
                </label>
                <label className="block text-sm">Country
                  <input className={field} value={r.country} disabled={disabled} onChange={(e) => patch(index, { country: e.target.value })} />
                </label>
                <div className="flex flex-col justify-center gap-2 pt-2 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input type="checkbox" checked={r.published} disabled={disabled} onChange={(e) => patch(index, { published: e.target.checked })} className="rounded border" />
                    <span className={r.published ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}>
                      {r.published ? "Published & Visible on website (Live)" : "Hidden from visitors (Draft)"}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" checked={r.hasSides} disabled={disabled} onChange={(e) => patch(index, { hasSides: e.target.checked })} />
                    Has European / Asian sides (Istanbul only)
                  </label>
                </div>
                <label className="block text-sm md:col-span-2">Short description
                  <textarea className={field + " h-24"} value={r.summary} disabled={disabled} maxLength={1000}
                    placeholder="Two or three sentences about living and investing here."
                    onChange={(e) => patch(index, { summary: e.target.value })} />
                </label>

                <div className="md:col-span-2">
                  <span className="text-sm">Districts</span>
                  <div className="mt-1 flex min-h-[48px] flex-wrap gap-2 rounded-lg border bg-muted/20 p-3">
                    {r.districts.map((d, di) => (
                      <span key={d} className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium">
                        {d}
                        <button type="button" disabled={disabled} title={`Remove ${d}`} aria-label={`Remove ${d}`} className="text-muted-foreground hover:text-destructive"
                          onClick={() => patch(index, { districts: r.districts.filter((_, i) => i !== di) })}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {!r.districts.length && <span className="py-1 text-xs italic text-muted-foreground">No districts yet. Add the first one below.</span>}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input className={field + " flex-1"} placeholder="Add a district, e.g. Konyaaltı" disabled={disabled}
                      value={draftDistrict[String(index)] || ""}
                      onChange={(e) => setDraftDistrict((d) => ({ ...d, [String(index)]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDistrict(index); } }} />
                    <button type="button" disabled={disabled} onClick={() => addDistrict(index)} className={btnPrimary + " whitespace-nowrap"}>Add district</button>
                  </div>
                </div>

                <label className="block text-sm md:col-span-2">Header image (optional)
                  <div className="mt-1 flex flex-wrap gap-2">
                    <input className={field + " min-w-0 flex-1"} value={r.heroImage} disabled={disabled} placeholder="https://… or /images/…"
                      onChange={(e) => patch(index, { heroImage: e.target.value })} />
                    <span className={btnGhost + " cursor-pointer gap-1.5"}>
                      <Upload className="h-3.5 w-3.5" />
                      {busy ? "Uploading…" : "Upload"}
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={disabled || busy} onChange={(e) => void upload(index, e.target.files?.[0])} />
                    </span>
                  </div>
                </label>
                <label className="block text-sm">Search result title (optional)
                  <input className={field} value={r.seoTitle} disabled={disabled} maxLength={120} onChange={(e) => patch(index, { seoTitle: e.target.value })} />
                </label>
                <label className="block text-sm">Search result summary (optional)
                  <input className={field} value={r.seoDescription} disabled={disabled} maxLength={320} onChange={(e) => patch(index, { seoDescription: e.target.value })} />
                </label>
              </div>
            )}
          </div>
        );
      })}
      {!regions.length && <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">No regions yet. Add your first region to enable region filters.</p>}
    </div>
  );
}