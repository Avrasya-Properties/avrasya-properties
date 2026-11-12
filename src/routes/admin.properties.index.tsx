import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Copy, MapPin, Trash2 } from "lucide-react";
import { PageHead, Status, btnGhost, btnPrimary, field } from "@/admin/Shell";
import {
  AVAIL,
  PUBL,
  bulkPublication,
  can,
  fmtDate,
  fmtMoney,
  remove,
  upsert,
  useDB,
  useSession,
  userName,
  type Property,
} from "@/admin/store";

type S = {
  q?: string | undefined;
  avail?: string | undefined;
  pub?: string | undefined;
  sort?: string | undefined;
  page?: number | undefined;
  view?: string | undefined;
};
export const Route = createFileRoute("/admin/properties/")({
  validateSearch: (s: Record<string, unknown>): S => ({
    q: s["q"] as string,
    avail: s["avail"] as string,
    pub: s["pub"] as string,
    sort: s["sort"] as string,
    page: Math.max(1, Math.floor(Number(s["page"]) || 1)),
    view: s["view"] as string,
  }),
  component: Inventory,
});
const PER = 15;

function Inventory() {
  const db = useDB();
  const user = useSession();
  const s = Route.useSearch();
  const nav = useNavigate({ from: Route.fullPath });
  const set = (p: Partial<S>) =>
    nav({ search: (o: S) => ({ ...o, page: 1, ...p }), replace: true });
  const [sel, setSel] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const rows = useMemo(() => {
    let r = db.properties.filter(
      (p) =>
        (!s.q || (p.title + p.ref + p.district).toLowerCase().includes(s.q.toLowerCase())) &&
        (!s.avail || p.availability === s.avail) &&
        (!s.pub || p.publication === s.pub),
    );
    if (s.sort === "price")
      r = [...r].sort(
        (a, b) =>
          (a.currency ?? "").localeCompare(b.currency ?? "") ||
          (a.amount ?? 1e15) - (b.amount ?? 1e15),
      );
    else r = [...r].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return r;
  }, [db.properties, s]);
  const pages = Math.max(1, Math.ceil(rows.length / PER));
  const currentPage = Math.min(s.page ?? 1, pages);
  const page = rows.slice((currentPage - 1) * PER, currentPage * PER);
  const panel = db.properties.find((p) => p.id === open);
  const bulk = async (patch: Partial<Property>) => {
    try {
      if (!patch.publication) throw new Error("Choose a publication action.");
      await bulkPublication(sel, patch.publication);
      toast.success(`Updated ${sel.length} listing(s)`);
      setSel([]);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  const editInv = can(user, "edit-inventory");

  const handleDuplicate = async (source: Property, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!editInv) return;
    try {
      const maxRefNum = Math.max(
        1000,
        ...db.properties.map((p) => Number(p.ref.replace(/^AVR-/, ""))).filter(Number.isFinite),
      );
      const nextRef = `AVR-${maxRefNum + 1}`;
      const nextSlug = `${source.slug || "listing"}-copy`;
      const nextTitle = `${source.title || "Untitled property"} (Copy)`;

      const clone: Partial<Property> = {
        ref: nextRef,
        slug: nextSlug,
        title: nextTitle,
        publication: "Draft",
        availability: source.availability || "Unknown",
        district: source.district || "",
        city: source.city || "Istanbul",
        type: source.type || "unit offer",
        layout: source.layout ?? null,
        bedrooms: source.bedrooms ?? null,
        bathrooms: source.bathrooms ?? null,
        grossM2: source.grossM2 ?? null,
        netM2: source.netM2 ?? null,
        areaM2: source.areaM2 ?? null,
        amount: source.amount ?? null,
        currency: source.currency ?? "USD",
        mode: source.mode ?? "sale",
        priceType: source.priceType ?? "on-request",
        priceBasis: source.priceBasis || "advertised",
        agentId: user?.id || source.agentId,
        cover: source.cover ?? null,
        galleryImages: source.galleryImages ? [...source.galleryImages] : [],
        highlights: source.highlights ? [...source.highlights] : [],
        description: source.description || "",
        project: source.project || "",
        sourceNote: source.sourceNote || "",
        seo_title: source.seo_title,
        seo_description: source.seo_description,
        og_image_url: source.og_image_url,
        updatedAt: new Date().toISOString(),
      };

      const created = await upsert<Property>("properties", clone);
      toast.success(`Duplicated listing as ${created.ref}`);
      setOpen(created.id);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const confirmDelete = (p: Property, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingProperty(p);
  };

  const executeDelete = async () => {
    if (!deletingProperty) return;
    setDeletingBusy(true);
    try {
      await remove("properties", deletingProperty.id);
      toast.success(`Deleted property ${deletingProperty.ref}`);
      if (open === deletingProperty.id) setOpen(null);
      setDeletingProperty(null);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setDeletingBusy(false);
    }
  };

  return (
    <>
      <PageHead
        title="Properties"
        crumbs="Inventory"
        action={
          <div className="flex items-center gap-2">
            <Link to="/admin/regions" className={btnGhost}>
              <MapPin className="h-3.5 w-3.5 text-brass" />
              <span>Cities & Regions</span>
            </Link>
            {editInv && (
              <button
                className={btnPrimary}
                onClick={async () => {
                  try {
                    const p = await upsert<Property>("properties", {
                      ref: `AVR-${Math.max(1000, ...db.properties.map((p) => Number(p.ref.replace(/^AVR-/, ""))).filter(Number.isFinite)) + 1}`,
                      slug: `new-listing-${crypto.randomUUID()}`,
                      title: "Untitled property",
                      district: "",
                      city: db.siteSettings.regions?.[0]?.name ?? "Istanbul",
                      type: "unit offer",
                      layout: null,
                      bathrooms: null,
                      grossM2: null,
                      netM2: null,
                      areaM2: null,
                      amount: null,
                      currency: "USD",
                      mode: "sale",
                      priceType: "on-request",
                      availability: "Unknown",
                      publication: "Draft",
                      agentId: user!.id,
                      cover: null,
                      project: "",
                      description: "",
                      updatedAt: new Date().toISOString(),
                    });
                    nav({ to: "/admin/properties/$id", params: { id: p.id } });
                  } catch (error) {
                    toast.error((error as Error).message);
                  }
                }}
              >
                New property
              </button>
            )}
          </div>
        }
      />
      <div className="mb-3 flex flex-wrap gap-2">
        <input
          className={`${field} max-w-xs`}
          placeholder="Search title, ref, district"
          defaultValue={s.q}
          onChange={(e) => set({ q: e.target.value || undefined })}
        />
        <select
          className={`${field} w-40`}
          value={s.avail ?? ""}
          onChange={(e) => set({ avail: e.target.value || undefined })}
        >
          <option value="">Any availability</option>
          {AVAIL.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <select
          className={`${field} w-40`}
          value={s.pub ?? ""}
          onChange={(e) => set({ pub: e.target.value || undefined })}
        >
          <option value="">Any publication</option>
          {PUBL.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <select
          className={`${field} w-40`}
          value={s.sort ?? ""}
          onChange={(e) => set({ sort: e.target.value || undefined })}
        >
          <option value="">Recently updated</option>
          <option value="price">Price (grouped by currency)</option>
        </select>
        <button
          className={btnGhost}
          onClick={() => set({ view: s.view === "cards" ? undefined : "cards" })}
        >
          {s.view === "cards" ? "Table view" : "Visual view"}
        </button>
      </div>
      {sel.length > 0 && editInv && (
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-sm border bg-card px-3 py-2 text-sm">
          {sel.length} selected
          {can(user, "publish") && (
            <button className={btnGhost} onClick={() => bulk({ publication: "Published" })}>
              Publish
            </button>
          )}
          {can(user, "publish") && (
            <button className={btnGhost} onClick={() => bulk({ publication: "Draft" })}>
              Unpublish (Draft)
            </button>
          )}
          <button className={btnGhost} onClick={() => bulk({ publication: "In Review" })}>
            Send to review
          </button>
          {can(user, "publish") && (
            <button className={btnGhost} onClick={() => bulk({ publication: "Archived" })}>
              Archive
            </button>
          )}
          <button className="ml-auto text-xs" onClick={() => setSel([])}>
            Clear
          </button>
        </div>
      )}
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          {s.view === "cards" ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {page.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setOpen(p.id)}
                  className={`group relative flex flex-col justify-between rounded-md border bg-card p-3 text-left transition-colors hover:border-muted-foreground/30 ${open === p.id ? "border-brass" : ""}`}
                >
                  <div>
                    <Thumb p={p} big />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {p.ref} · {p.district || "Location to confirm"}
                    </p>
                    <p className="truncate text-sm font-medium">{p.title || "Untitled"}</p>
                    <div className="mt-1 flex justify-between text-sm tabular-nums">
                      {fmtMoney(p.amount, p.currency)}
                      <span className="flex gap-1">
                        <Status v={p.availability} />
                        <Status v={p.publication} />
                      </span>
                    </div>
                  </div>
                  {editInv && (
                    <div
                      className="mt-3 flex items-center justify-end gap-1 border-t pt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => handleDuplicate(p, e)}
                        title="Duplicate property"
                        className={btnGhost + " !px-2 !py-1 text-xs"}
                      >
                        <Copy className="h-3 w-3" />
                        <span>Duplicate</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => confirmDelete(p, e)}
                        title="Delete property"
                        className={
                          btnGhost + " !px-2 !py-1 text-xs text-destructive hover:bg-destructive/10"
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="w-8 p-2">
                      <input
                        type="checkbox"
                        checked={page.length > 0 && page.every((p) => sel.includes(p.id))}
                        onChange={(e) => setSel(e.target.checked ? page.map((p) => p.id) : [])}
                      />
                    </th>
                    <th></th>
                    <th className="p-2">Reference</th>
                    <th>Title</th>
                    <th>District</th>
                    <th>Layout</th>
                    <th className="text-right">Price</th>
                    <th className="px-2">Availability</th>
                    <th>Publication</th>
                    <th>Agent</th>
                    <th className="pr-2">Updated</th>
                    <th className="p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {page.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setOpen(p.id)}
                      className={`cursor-pointer border-b last:border-0 hover:bg-muted/60 ${open === p.id ? "bg-muted" : ""}`}
                    >
                      <td className="p-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={sel.includes(p.id)}
                          onChange={(e) =>
                            setSel(
                              e.target.checked ? [...sel, p.id] : sel.filter((x) => x !== p.id),
                            )
                          }
                        />
                      </td>
                      <td>
                        <Thumb p={p} />
                      </td>
                      <td className="p-2">
                        <Link
                          to="/admin/properties/$id"
                          params={{ id: p.id }}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-brass-text hover:underline"
                        >
                          {p.ref}
                        </Link>
                      </td>
                      <td className="max-w-56 truncate">
                        {p.title || <i className="text-muted-foreground">Untitled</i>}
                      </td>
                      <td>{p.district || "—"}</td>
                      <td>{p.layout ?? "—"}</td>
                      <td className="text-right tabular-nums">
                        {p.priceType === "on-request"
                          ? "On request"
                          : `${p.priceType === "from" ? "from " : ""}${fmtMoney(p.amount, p.currency)}`}
                      </td>
                      <td className="px-2">
                        <Status v={p.availability} />
                      </td>
                      <td>
                        <Status v={p.publication} />
                      </td>
                      <td className="whitespace-nowrap">{userName(p.agentId)}</td>
                      <td className="pr-2 text-xs">{fmtDate(p.updatedAt)}</td>
                      <td className="p-2 text-right" onClick={(e) => e.stopPropagation()}>
                        {editInv && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleDuplicate(p, e)}
                              title="Duplicate property"
                              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => confirmDelete(p, e)}
                              title="Delete property"
                              className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            {rows.length} records
            <div className="flex gap-2">
              <button
                className={btnGhost}
                disabled={currentPage <= 1}
                onClick={() => set({ page: currentPage - 1 })}
              >
                Prev
              </button>
              <span className="self-center">
                {currentPage} / {pages}
              </span>
              <button
                className={btnGhost}
                disabled={currentPage >= pages}
                onClick={() => set({ page: currentPage + 1 })}
              >
                Next
              </button>
            </div>
          </div>
        </div>
        {panel && (
          <aside className="fixed inset-0 z-30 overflow-y-auto bg-card p-4 lg:sticky lg:top-20 lg:z-0 lg:h-fit lg:w-80 lg:rounded-md lg:border">
            <div className="flex justify-between">
              <p className="text-xs text-muted-foreground">{panel.ref}</p>
              <button onClick={() => setOpen(null)} className="text-sm">
                Close
              </button>
            </div>
            <Thumb p={panel} big />
            <h2 className="mt-2 font-semibold">{panel.title || "Untitled"}</h2>
            <dl className="mt-2 grid grid-cols-2 gap-y-1 text-sm">
              {[
                ["District", panel.district || "—"],
                ["Layout", panel.layout ?? "Unknown"],
                ["Gross", panel.grossM2 ? `${panel.grossM2} m²` : "Unknown"],
                ["Net", panel.netM2 ? `${panel.netM2} m²` : "Unknown"],
                ["Price", fmtMoney(panel.amount, panel.currency)],
                ["Agent", userName(panel.agentId)],
              ].map(([k, v]) => (
                <>
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="tabular-nums">{v}</dd>
                </>
              ))}
            </dl>
            <div className="mt-2 flex gap-1">
              <Status v={panel.availability} />
              <Status v={panel.publication} />
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                to="/admin/properties/$id"
                params={{ id: panel.id }}
                className={`${btnPrimary} w-full justify-center`}
              >
                Open full record
              </Link>
              {editInv && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDuplicate(panel)}
                    className={`${btnGhost} flex-1 justify-center gap-1.5`}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDelete(panel)}
                    className={`${btnGhost} justify-center text-destructive hover:bg-destructive/10`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Safety Confirmation Modal Dialog for Property Deletion */}
      {deletingProperty && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-property-dialog-title"
        >
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3
                  id="delete-property-dialog-title"
                  className="text-base font-semibold text-foreground"
                >
                  Confirm Property Deletion
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to delete property listing{" "}
                  <strong className="text-foreground">{deletingProperty.ref}</strong> (
                  <span className="italic">{deletingProperty.title}</span>)? This operation removes
                  the property listing permanently and cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                disabled={deletingBusy}
                onClick={() => setDeletingProperty(null)}
                className={btnGhost}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingBusy}
                onClick={executeDelete}
                className="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deletingBusy ? "Deleting..." : "Delete Property"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export function Thumb({ p, big }: { p: Property; big?: boolean }) {
  const c = big ? "aspect-[4/3] w-full" : "h-9 w-12";
  return p.cover ? (
    <img src={p.cover} alt="" className={`${c} rounded-sm object-cover`} />
  ) : (
    <div
      className={`${c} flex items-center justify-center rounded-sm bg-muted text-[10px] text-muted-foreground`}
    >
      No photo
    </div>
  );
}
