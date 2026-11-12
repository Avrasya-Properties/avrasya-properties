import { listingPreview } from "@/admin/listing-preview";
import { GalleryManager } from "@/admin/GalleryManager";
import { addGalleryItem, setCoverUrl } from "@/admin/gallery-items";
import { PropertyDetails } from "@/components/site/PropertyDetails";
import { managedRows, linkUnit } from "@/admin/management";
import { rawRecord } from "@/admin/remote";
import { decode, type Row } from "@/admin/mappers";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Check, FolderKanban, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHead, Status, btnGhost, btnPrimary, field } from "@/admin/Shell";
import {
  AVAIL,
  DEMO_ENABLED,
  uploadImage,
  USERS,
  can,
  fmtMoney,
  publishIssues,
  upsert,
  useDB,
  useSession,
  type Property,
} from "@/admin/store";
import { regionForCity, allNeighborhoods } from "@/data/regions";
import {
  IMAGE_CATEGORIES,
  PROPERTY_CATEGORIES,
  DEFAULT_AMENITY_CATALOG,
  type GalleryItem,
  type FloorPlanItem,
  type PropertyDocumentItem,
  type PropertySpecs,
  type PropertyPaymentPlan,
  type PropertyTranslation,
} from "@/data/properties";
import { MediaPickerModal } from "@/admin/media";

export const Route = createFileRoute("/admin/properties/$id")({ component: Editor });
const TABS = [
  "Property details",
  "Specifications",
  "Pricing",
  "Media",
  "Documents & Tours",
  "Translations",
  "SEO & Social",
  "Checks and notes",
  "Website Preview",
] as const;

const COMMON_AMENITIES = [...DEFAULT_AMENITY_CATALOG];

function Editor() {
  const { id } = Route.useParams();
  const db = useDB();
  const user = useSession();
  const saved = db.properties.find((p) => p.id === id);
  const [units, setUnits] = useState<Row[]>([]);
  const [projects, setProjects] = useState<Row[]>([]);
  const [unitId, setUnitId] = useState("");
  useEffect(() => {
    if (DEMO_ENABLED) return;
    void Promise.all([managedRows("physical_units"), managedRows("projects")])
      .then(([units, projects]) => {
        setUnits(units);
        setProjects(projects);
      })
      .catch((error) => toast.error(error.message));
  }, []);
  const [d, setD] = useState<Property | undefined>(saved);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Property details");
  const [pickerTarget, setPickerTarget] = useState<
    "cover" | "gallery" | "floorPlan" | "ogImage" | null
  >(null);
  const previousSaved = useRef(saved);
  useEffect(() => {
    const before = previousSaved.current;
    setD((previous) =>
      !previous || previous.id !== id || JSON.stringify(previous) === JSON.stringify(before)
        ? saved
        : previous,
    );
    previousSaved.current = saved;
  }, [id, saved]);
  const [customCityOverride, setCustomCityOverride] = useState<boolean | null>(null);
  if (!saved || !d)
    return (
      <p>
        Property not found.{" "}
        <Link to="/admin/properties" className="text-brass-text">
          Back to listings
        </Link>
      </p>
    );
  const ro = !can(user, "edit-inventory");
  const f = <K extends keyof Property>(k: K, v: Property[K]) => setD({ ...d, [k]: v });
  const setCover = (url: string | null) =>
    setD((old) => (old ? { ...old, ...setCoverUrl(old, url) } : old));
  const num = (v: string) => (v === "" ? null : Number(v));
  const save = async (patch: Partial<Property> = {}) => {
    try {
      const n = await upsert<Property>("properties", { ...d, ...patch });
      setD(n);
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  const issues = publishIssues(d, db.properties);
  const regions = db.siteSettings.regions || [];
  const region = regionForCity(d.city, regions);
  const customCityMode = customCityOverride ?? !region;
  const setCustomCityMode = (v: boolean) => setCustomCityOverride(v);
  const pickRegion = (slug: string) => {
    if (slug === "__custom") {
      setCustomCityMode(true);
      return;
    }
    const next = regions.find((r) => r.slug === slug);
    if (!next) return;
    setCustomCityMode(false);
    setD({ ...d, city: next.name, ...(next.hasSides ? {} : { side: "unknown" as const }) });
  };
  const inp = (label: string, k: keyof Property, type = "text") => (
    <label className="text-sm">
      {label}
      <input
        disabled={ro}
        type={type}
        step={type === "number" ? "any" : undefined}
        className={field}
        value={(d[k] as string | number | null) ?? ""}
        onChange={(e) => f(k, (type === "number" ? num(e.target.value) : e.target.value) as never)}
        placeholder={type === "number" ? "Unknown" : ""}
      />
    </label>
  );
  return (
    <>
      <PageHead
        title={d.title || "Untitled property"}
        crumbs={`Inventory / Properties / ${d.ref}`}
        action={
          !ro && (
            <div className="flex gap-2">
              <button className={btnGhost} onClick={() => save()}>
                Save changes
              </button>
              {can(user, "publish") && d.publication !== "Published" && (
                <button
                  className={btnPrimary}
                  onClick={() =>
                    issues.length
                      ? (setTab("Checks and notes"),
                        toast.error("Publishing blocked â€” see fix list"))
                      : save({ publication: "Published" })
                  }
                >
                  Publish
                </button>
              )}
              {can(user, "publish") && d.publication === "Published" && (
                <button className={btnGhost} onClick={() => save({ publication: "Draft" })}>
                  Unpublish
                </button>
              )}
            </div>
          )
        }
      />
      <div className="mb-4 flex gap-1 overflow-x-auto border-b">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 whitespace-nowrap px-3 py-2 text-sm ${tab === t ? "border-b-2 border-brass font-medium" : "text-muted-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {!DEMO_ENABLED && (
        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              ["physical_units", "Registered apartments"],
              ["offer_amenities", "Listing features"],
              ["pricing_options", "Payment plans"],
              ["package_memberships", "Package contents"],
            ] as const
          ).map(([section, label]) => (
            <Link
              key={section}
              to="/admin/manage"
              search={{ section, property: id }}
              className={btnGhost}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
      <div
        className={
          tab === "Website Preview"
            ? "w-full overflow-hidden rounded-md border bg-background"
            : "max-w-3xl rounded-md border bg-card p-4"
        }
      >
        {tab === "Property details" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {inp("Title", "title")}
            {inp("Web address ending", "slug")}
            {inp("Reference", "ref")}
            <div className="space-y-1">
              <label className="text-sm">
                Region / City
                <select
                  disabled={ro}
                  className={field}
                  value={customCityMode || !region ? "__custom" : region.slug}
                  onChange={(e) => pickRegion(e.target.value)}
                >
                  {regions.map((r) => (
                    <option key={r.slug} value={r.slug}>
                      {r.name}
                      {r.published ? "" : " (hidden)"}
                    </option>
                  ))}
                  <option value="__custom">
                    {d.city && !region ? `${d.city} (Custom city)` : "+ Other / Custom City..."}
                  </option>
                </select>
              </label>
              {(customCityMode || !region) && (
                <label className="block text-xs text-muted-foreground mt-1">
                  City name
                  <input
                    disabled={ro}
                    className={field + " mt-0.5"}
                    placeholder="e.g. Antalya, Bodrum, Ankara, Izmir"
                    value={d.city || ""}
                    onChange={(e) => f("city", e.target.value)}
                  />
                </label>
              )}
              <Link
                to="/admin/regions"
                className="text-[11px] text-brass-text hover:underline block pt-0.5"
              >
                Manage cities & regions &rarr;
              </Link>
            </div>
            <label className="text-sm">
              District
              <input
                disabled={ro}
                list="region-districts"
                className={field}
                value={d.district ?? ""}
                onChange={(e) => f("district", e.target.value)}
              />
              <datalist id="region-districts">
                {(region?.districts ?? []).map((x) => (
                  <option key={x} value={x} />
                ))}
              </datalist>
            </label>
            <label className="text-sm">
              Neighborhood
              <input
                disabled={ro}
                list="region-neighborhoods"
                className={field}
                value={d.neighborhood ?? ""}
                onChange={(e) => f("neighborhood", e.target.value)}
                placeholder="e.g. Bebek, NiÅŸantaÅŸÄ±, Maslak, Bomonti"
              />
              <datalist id="region-neighborhoods">
                {allNeighborhoods(regions, d.district).map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </label>
            <label className="text-sm">
              Property Category
              <select
                disabled={ro}
                className={field}
                value={d.propertyCategory ?? ""}
                onChange={(e) => f("propertyCategory", e.target.value || undefined)}
              >
                <option value="">Select category</option>
                {(db.siteSettings.propertyCategories?.length
                  ? db.siteSettings.propertyCategories
                  : [...PROPERTY_CATEGORIES]
                ).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
            {inp("Developer / Construction Group", "developer")}
            {inp("Street Address / Corridor", "address")}
            <label className="text-sm">
              Map Latitude
              <input
                disabled={ro}
                type="number"
                step="any"
                className={field}
                value={d.coordinates?.lat ?? ""}
                onChange={(e) =>
                  f(
                    "coordinates",
                    e.target.value === ""
                      ? null
                      : {
                          lat: Number(e.target.value),
                          lng: d.coordinates?.lng ?? 28.9784,
                        },
                  )
                }
                placeholder="e.g. 41.0522"
              />
            </label>
            <label className="text-sm">
              Map Longitude
              <input
                disabled={ro}
                type="number"
                step="any"
                className={field}
                value={d.coordinates?.lng ?? ""}
                onChange={(e) =>
                  f(
                    "coordinates",
                    e.target.value === ""
                      ? null
                      : {
                          lat: d.coordinates?.lat ?? 41.0082,
                          lng: Number(e.target.value),
                        },
                  )
                }
                placeholder="e.g. 28.9935"
              />
            </label>
            {inp("Layout (e.g. 2+1)", "layout")}
            {inp("Bedrooms", "bedrooms", "number")}
            {inp("Bathrooms", "bathrooms", "number")}
            {inp("Living rooms", "livingRooms", "number")}
            <label className="text-sm">
              Development name
              <select
                disabled={ro}
                className={field}
                value={d.project}
                onChange={(e) => f("project", e.target.value)}
              >
                <option value="">Not assigned</option>
                {projects.map((project) => (
                  <option key={String(project["id"])} value={String(project["name"])}>
                    {String(project["name"])}
                  </option>
                ))}
              </select>
            </label>
            {!DEMO_ENABLED && (
              <div className="sm:col-span-2 rounded border p-3">
                <label className="block text-sm">
                  Registered apartment
                  <select
                    disabled={ro}
                    className={field}
                    value={
                      unitId || String(rawRecord("properties", id)?.["physical_unit_id"] || "")
                    }
                    onChange={(e) => setUnitId(e.target.value)}
                  >
                    <option value="">No identified unit</option>
                    {units.map((unit) => (
                      <option key={String(unit["id"])} value={String(unit["id"])}>
                        {String(unit["unit_number"])} Â· {String(unit["layout_label"] || "")}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  disabled={ro || !unitId}
                  className={btnGhost + " mt-2"}
                  onClick={async () => {
                    try {
                      if (JSON.stringify(d) !== JSON.stringify(saved))
                        throw new Error("Save your listing changes before linking an apartment.");
                      await linkUnit(id, unitId, Number(rawRecord("properties", id)?.["version"]));
                      const row = rawRecord("properties", id);
                      if (row) setD(decode("properties", { ...row, project_name: d.project }));
                      toast.success("Apartment linked");
                    } catch (error) {
                      toast.error((error as Error).message);
                    }
                  }}
                >
                  Link apartment
                </button>
                <p className="mt-2 text-xs text-muted-foreground">
                  Add the apartment number under Registered apartments before reserving this
                  listing. Packages and unit types cannot be reserved as individual units.
                </p>
              </div>
            )}
            {(region?.hasSides || (d.side && d.side !== "unknown")) && (
              <label className="text-sm">
                {region?.name ?? "Istanbul"} side
                <select
                  disabled={ro}
                  className={field}
                  value={d.side || "unknown"}
                  onChange={(e) => f("side", e.target.value as Property["side"])}
                >
                  <option value="unknown">To confirm</option>
                  <option value="Europe">European side</option>
                  <option value="Asia">Asian side</option>
                </select>
              </label>
            )}
            {inp("Title deed status", "tapuStatus")}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-sm">
                Property highlights (custom features)
                <textarea
                  disabled={ro}
                  className={field + " h-24 mt-1"}
                  value={(d.highlights || []).join("\n")}
                  onChange={(e) => f("highlights", e.target.value.split("\n"))}
                />
                <span className="text-xs text-muted-foreground">
                  One confirmed feature per line. Empty lines are ignored when saved.
                </span>
              </label>
              <div className="rounded-lg border bg-muted/20 p-3 space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Amenities Checklist:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_AMENITIES.map((amenity) => {
                    const active = (d.highlights || []).some(
                      (h) => h.toLowerCase() === amenity.toLowerCase(),
                    );
                    return (
                      <button
                        key={amenity}
                        type="button"
                        disabled={ro}
                        onClick={() => {
                          const list = d.highlights || [];
                          if (active) {
                            f(
                              "highlights",
                              list.filter((h) => h.toLowerCase() !== amenity.toLowerCase()),
                            );
                          } else {
                            f("highlights", [...list, amenity]);
                          }
                        }}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                          active
                            ? "bg-brass/20 border-brass text-brass font-semibold"
                            : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {active && <Check className="h-3 w-3 text-brass" />}
                        <span>{amenity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            {inp("Gross area mÂ²", "grossM2", "number")}
            {inp("Net area mÂ²", "netM2", "number")}
            {inp("Area mÂ² (basis unspecified)", "areaM2", "number")}
            <label className="text-sm">
              Listing type
              <select
                disabled={ro}
                className={field}
                value={d.type}
                onChange={(e) => f("type", e.target.value)}
              >
                <option value="unit offer">Individual unit offer</option>
                <option value="package">Packaged offer</option>
                <option value="unit type">Unit type / not an identified unit</option>
                <option value="ambiguous offer">Offer to confirm</option>
                <option value="project">Development / project</option>
              </select>
            </label>
            <label className="text-sm">
              Availability
              <select
                disabled={ro}
                className={field}
                value={d.availability}
                onChange={(e) => f("availability", e.target.value as Property["availability"])}
              >
                {AVAIL.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Agent
              <select
                disabled={ro}
                className={field}
                value={d.agentId}
                onChange={(e) => f("agentId", e.target.value)}
              >
                {USERS.filter((u) => u.role !== "viewer").map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="sm:col-span-2 flex flex-wrap gap-6 rounded border bg-muted/20 p-3">
              <label className="inline-flex items-center gap-2 text-sm font-medium">
                <input
                  disabled={ro}
                  type="checkbox"
                  checked={Boolean(d.featured)}
                  onChange={(e) => f("featured", e.target.checked)}
                />
                <span>Featured Property (Highlight on Homepage & Portfolio)</span>
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-medium">
                <input
                  disabled={ro}
                  type="checkbox"
                  checked={Boolean(d.cbiEligible)}
                  onChange={(e) => f("cbiEligible", e.target.checked)}
                />
                <span>Turkish Citizenship ($400k+) Eligible & Verified</span>
              </label>
            </div>
            <label className="text-sm sm:col-span-2">
              Short summary (shown on cards & header)
              <input
                disabled={ro}
                className={field}
                value={d.shortDescription ?? ""}
                onChange={(e) => f("shortDescription", e.target.value)}
                placeholder="Concise executive summary..."
              />
            </label>
            <label className="text-sm sm:col-span-2">
              Description
              <textarea
                disabled={ro}
                className={`${field} h-28 py-2`}
                value={d.description}
                onChange={(e) => f("description", e.target.value)}
              />
            </label>
          </div>
        )}
        {tab === "Specifications" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["floorNumber", "Floor Number"],
                ["totalFloors", "Total Building Floors"],
                ["furnishingStatus", "Furnishing Status (Unfurnished / Turnkey / Designer)"],
                ["completionStatus", "Completion Status (Ready / Under Construction / Off-Plan)"],
                ["constructionYear", "Construction / Delivery Year"],
                ["propertyCondition", "Property Condition (New / Resale / Renovated)"],
                ["heatingSystem", "Heating & Cooling System (Underfloor / VRV / Central)"],
                ["buildingAge", "Building Age"],
                ["viewType", "View Type (Bosphorus / Sea / Skyline / Forest)"],
                ["orientation", "Orientation (South-East, etc.)"],
                ["balconyOrTerrace", "Balcony / Terrace Details"],
                ["gardenOrOutdoor", "Garden / Outdoor Space"],
                ["parking", "Parking Availability (Underground / Valet)"],
                ["energyClass", "Energy Efficiency Class (A+, A, B)"],
              ] as const
            ).map(([specKey, label]) => (
              <label key={specKey} className="text-sm">
                {label}
                <input
                  disabled={ro}
                  className={field}
                  value={String((d.specs as Record<string, unknown> | undefined)?.[specKey] ?? "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    const nextSpecs: PropertySpecs = {
                      ...(d.specs || {}),
                      [specKey]:
                        ["totalFloors", "constructionYear"].includes(specKey) && val !== ""
                          ? Number(val)
                          : val || null,
                    };
                    f("specs", nextSpecs);
                  }}
                />
              </label>
            ))}
          </div>
        )}
        {tab === "Pricing" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Price type
              <select
                disabled={ro}
                className={field}
                value={d.priceType}
                onChange={(e) => f("priceType", e.target.value as Property["priceType"])}
              >
                <option value="fixed">Fixed</option>
                <option value="from">From</option>
                <option value="on-request">On request</option>
              </select>
            </label>
            <label className="text-sm">
              Sale / rent
              <select
                disabled={ro}
                className={field}
                value={d.mode}
                onChange={(e) => f("mode", e.target.value as Property["mode"])}
              >
                <option value="sale">Sale</option>
                <option value="rent">Rent (monthly)</option>
              </select>
            </label>
            {inp("Amount", "amount", "number")}
            {inp("Original Price (before discount)", "originalPrice", "number")}
            {inp("Discounted Price", "discountedPrice", "number")}
            {inp("Rental Price (monthly)", "rentalPrice", "number")}
            {inp("Price per mÂ²", "pricePerM2", "number")}
            <label className="text-sm">
              Price Visibility
              <select
                disabled={ro}
                className={field}
                value={d.priceVisibility || "show"}
                onChange={(e) =>
                  f("priceVisibility", e.target.value as Property["priceVisibility"])
                }
              >
                <option value="show">Show Publicly</option>
                <option value="on-request">Price on Request</option>
                <option value="hide">Hide Price</option>
              </select>
            </label>
            <div className="sm:col-span-2 mt-2 rounded border bg-muted/20 p-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Payment Plan & Instalments
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="text-xs">
                  Down Payment (%)
                  <input
                    disabled={ro}
                    type="number"
                    className={field}
                    value={d.paymentPlan?.downPaymentPercent ?? ""}
                    onChange={(e) =>
                      f("paymentPlan", {
                        ...(d.paymentPlan || {}),
                        downPaymentPercent: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  />
                </label>
                <label className="text-xs">
                  Instalment Months
                  <input
                    disabled={ro}
                    type="number"
                    className={field}
                    value={d.paymentPlan?.installmentMonths ?? ""}
                    onChange={(e) =>
                      f("paymentPlan", {
                        ...(d.paymentPlan || {}),
                        installmentMonths: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  />
                </label>
                <label className="text-xs">
                  Monthly Instalment Amount
                  <input
                    disabled={ro}
                    type="number"
                    className={field}
                    value={d.paymentPlan?.installmentAmount ?? ""}
                    onChange={(e) =>
                      f("paymentPlan", {
                        ...(d.paymentPlan || {}),
                        installmentAmount: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  />
                </label>
              </div>
              <label className="mt-3 block text-xs">
                Additional fees (title deed, VAT, agency, maintenance)
                <textarea
                  disabled={ro}
                  rows={2}
                  className={field}
                  placeholder="e.g. Title deed 4%, VAT 1%, annual maintenance"
                  value={d.paymentPlan?.additionalFeesNote ?? ""}
                  onChange={(e) =>
                    f("paymentPlan", {
                      ...(d.paymentPlan || {}),
                      additionalFeesNote: e.target.value || null,
                    })
                  }
                />
              </label>
              <label className="mt-3 block text-xs">
                Investment: rental yield notes
                <textarea
                  disabled={ro}
                  rows={2}
                  className={field}
                  placeholder="Expected rental yield and basis"
                  value={d.paymentPlan?.rentalYieldNote ?? ""}
                  onChange={(e) =>
                    f("paymentPlan", {
                      ...(d.paymentPlan || {}),
                      rentalYieldNote: e.target.value || null,
                    })
                  }
                />
              </label>
              <label className="mt-3 block text-xs">
                Investment: capital growth highlights
                <textarea
                  disabled={ro}
                  rows={2}
                  className={field}
                  placeholder="Area growth, infrastructure, demand"
                  value={d.paymentPlan?.capitalGrowthNote ?? ""}
                  onChange={(e) =>
                    f("paymentPlan", {
                      ...(d.paymentPlan || {}),
                      capitalGrowthNote: e.target.value || null,
                    })
                  }
                />
              </label>
              <label className="mt-3 block text-xs">
                Citizenship verification notes
                <textarea
                  disabled={ro}
                  rows={2}
                  className={field}
                  placeholder="Only where verified"
                  value={d.paymentPlan?.citizenshipNote ?? ""}
                  onChange={(e) =>
                    f("paymentPlan", {
                      ...(d.paymentPlan || {}),
                      citizenshipNote: e.target.value || null,
                    })
                  }
                />
              </label>
            </div>
            <label className="text-sm">
              Price basis
              <select
                disabled={ro}
                className={field}
                value={d.priceBasis || "advertised"}
                onChange={(e) => f("priceBasis", e.target.value)}
              >
                {[
                  "cash",
                  "installment_schedule",
                  "package",
                  "fixed",
                  "from",
                  "on_request",
                  "conflicting_starting_prices",
                  "scope_unconfirmed",
                  "special_offer",
                  "advertised",
                ].map((basis) => (
                  <option key={basis} value={basis}>
                    {basis.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Currency
              <select
                disabled={ro}
                className={field}
                value={d.currency ?? ""}
                onChange={(e) => f("currency", (e.target.value || null) as Property["currency"])}
              >
                <option value="">â€”</option>
                <option>USD</option>
                <option>TRY</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </label>
            <p className="text-xs text-muted-foreground sm:col-span-2">
              No automatic currency conversion is performed.
            </p>
          </div>
        )}
        {tab === "Media" && (
          <div>
            <p className="mb-2 text-xs text-muted-foreground">
              Upload a property cover photo (JPEG, PNG or WebP, up to{" "}
              {DEMO_ENABLED ? "1 MB" : "5 MB"}).{" "}
              {DEMO_ENABLED
                ? "Demo uploads remain in this browser."
                : "Uploads are stored in Supabase Storage."}
            </p>
            {!ro && (
              <div className="space-y-4">
                {DEMO_ENABLED && (
                  <div>
                    <p className="mb-2 text-xs font-semibold text-foreground uppercase tracking-wider">
                      Example images
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {[
                        { label: "Bosphorus Hero", url: "/images/properties/hero-main.jpg" },
                        { label: "Maslak Tower", url: "/images/properties/maslak-tower.jpg" },
                        {
                          label: "FerikÃ¶y Penthouse",
                          url: "/images/properties/ferikoy-duplex.jpg",
                        },
                        { label: "AtaÅŸehir Sky", url: "/images/properties/atasehir-sky.jpg" },
                        { label: "TopkapÄ± Pearl", url: "/images/properties/topkapi-pearl.jpg" },
                        {
                          label: "ÅžiÅŸli Residence",
                          url: "/images/properties/sisli-residence.jpg",
                        },
                        {
                          label: "Bosphorus Terrace",
                          url: "/images/properties/bosphorus-terrace.jpg",
                        },
                        { label: "Master Suite", url: "/images/properties/master-suite.jpg" },
                      ].map((preset) => (
                        <button
                          type="button"
                          key={preset.url}
                          onClick={() => setCover(preset.url)}
                          className={`group relative overflow-hidden rounded-md border text-left transition-all ${
                            d.cover === preset.url
                              ? "ring-2 ring-brass border-brass"
                              : "hover:border-foreground/40"
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="aspect-[4/3] w-full object-cover"
                          />
                          <span className="block truncate bg-card/90 p-1 text-[10px] font-medium text-foreground">
                            {preset.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <label className="block text-sm">
                  Image URL
                  <input
                    className={field}
                    value={d.cover || ""}
                    onChange={(e) => setCover(e.target.value || null)}
                    placeholder="Paste an uploaded image link"
                  />
                  <span className="text-xs text-muted-foreground">
                    Use a property photo or upload one below.
                  </span>
                </label>
                <div className="pt-2 border-t">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    Custom Upload or Media Library
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className={btnGhost}
                      onClick={() => setPickerTarget("cover")}
                    >
                      <FolderKanban className="h-3.5 w-3.5 text-brass" />
                      <span>Choose from Media Library</span>
                    </button>
                    <label className={`${btnGhost} cursor-pointer`}>
                      <span>Upload New File</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setCover(await uploadImage(file));
                            toast.success("Image uploaded. Save the listing to apply it.");
                          } catch (error) {
                            toast.error((error as Error).message);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
            {!ro && (
              <div className="mt-5 space-y-3 border-t pt-4">
                <h3 className="font-medium">Photo gallery</h3>
                <p className="text-xs text-muted-foreground">
                  Upload the listing's photos. Save changes when finished.
                </p>
                <GalleryManager
                  value={{
                    galleryItems: d.galleryItems,
                    galleryImages: d.galleryImages,
                    cover: d.cover,
                  }}
                  readOnly={ro}
                  upload={uploadImage}
                  onChange={(n) => setD((old) => (old ? { ...old, ...n } : old))}
                  onOpenLibrary={() => setPickerTarget("gallery")}
                />
                <label className="block text-sm">
                  Floor plan image link
                  <input
                    className={field}
                    value={d.floorPlan || ""}
                    onChange={(e) => f("floorPlan", e.target.value || null)}
                  />
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => setPickerTarget("floorPlan")}
                  >
                    <FolderKanban className="h-3.5 w-3.5 text-brass" />
                    <span>Select Floor Plan from Library</span>
                  </button>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        f("floorPlan", await uploadImage(file));
                      } catch (error) {
                        toast.error((error as Error).message);
                      }
                    }}
                  />
                </div>

                {/* Multi-Floor-Plans Manager */}
                <div className="mt-4 rounded-lg border bg-muted/20 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Multiple Architectural Floor Plans ({(d.floorPlans || []).length})
                    </span>
                    <button
                      type="button"
                      className={btnGhost}
                      onClick={() => {
                        const nextFp: FloorPlanItem = {
                          id: "fp-" + Date.now(),
                          title: `Floor Plan ${(d.floorPlans?.length || 0) + 1}`,
                          unitType: d.layout || "2+1",
                          imageUrl: d.floorPlan || "/images/properties/gunesli-floorplan.jpg",
                          areaM2: d.grossM2,
                        };
                        f("floorPlans", [...(d.floorPlans || []), nextFp]);
                      }}
                    >
                      + Add Floor Plan
                    </button>
                  </div>
                  {(d.floorPlans || []).map((fp, idx) => (
                    <div
                      key={fp.id}
                      className="grid gap-2 rounded border bg-card p-3 sm:grid-cols-3"
                    >
                      <input
                        className={field}
                        placeholder="Plan title"
                        value={fp.title}
                        onChange={(e) => {
                          const next = [...(d.floorPlans || [])];
                          next[idx] = { ...fp, title: e.target.value };
                          f("floorPlans", next);
                        }}
                      />
                      <input
                        className={field}
                        placeholder="Unit type (e.g. 2+1 Duplex)"
                        value={fp.unitType || ""}
                        onChange={(e) => {
                          const next = [...(d.floorPlans || [])];
                          next[idx] = { ...fp, unitType: e.target.value };
                          f("floorPlans", next);
                        }}
                      />
                      <div className="flex gap-2">
                        <input
                          className={field}
                          placeholder="Image URL"
                          value={fp.imageUrl}
                          onChange={(e) => {
                            const next = [...(d.floorPlans || [])];
                            next[idx] = { ...fp, imageUrl: e.target.value };
                            f("floorPlans", next);
                          }}
                        />
                        <button
                          type="button"
                          className="rounded p-1.5 text-destructive hover:bg-destructive/10"
                          onClick={() =>
                            f(
                              "floorPlans",
                              (d.floorPlans || []).filter((_, i) => i !== idx),
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {d.cover && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Active Cover Image:
                </p>
                <img
                  src={d.cover}
                  alt="Cover"
                  className="h-48 w-auto rounded-md object-cover border"
                />
                {!ro && (
                  <button
                    className="mt-2 text-xs font-medium text-destructive hover:underline"
                    onClick={() => confirm("Remove cover image?") && f("cover", null)}
                  >
                    Remove cover image
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {tab === "Documents & Tours" && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {inp("360Â° Virtual Tour URL", "virtualTourUrl")}
              {inp("Video Walkthrough URL", "videoUrl")}
              {inp("3D Architectural Model URL (GLB/GLTF)", "model3dUrl")}
            </div>
            <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Property Documents & Brochures</h3>
                  <p className="text-xs text-muted-foreground">
                    Only documents marked Public are shown on the website. Private documents remain
                    strictly internal.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={ro}
                  className={btnGhost}
                  onClick={() => {
                    const nextDoc: PropertyDocumentItem = {
                      id: "doc-" + Date.now(),
                      title: "Property Brochure.pdf",
                      category: "Brochure",
                      url: "/documents/avrasya-investment-catalog-2026.pdf",
                      fileType: "PDF",
                      isPublic: true,
                    };
                    f("documents", [...(d.documents || []), nextDoc]);
                  }}
                >
                  + Add Document
                </button>
              </div>
              {(d.documents || []).map((doc, idx) => (
                <div
                  key={doc.id}
                  className="grid gap-2 rounded border bg-card p-3 sm:grid-cols-[1fr_140px_1fr_auto]"
                >
                  <input
                    disabled={ro}
                    className={field}
                    placeholder="Document Title"
                    value={doc.title}
                    onChange={(e) => {
                      const next = [...(d.documents || [])];
                      next[idx] = { ...doc, title: e.target.value };
                      f("documents", next);
                    }}
                  />
                  <input
                    disabled={ro}
                    className={field}
                    placeholder="Category"
                    value={doc.category}
                    onChange={(e) => {
                      const next = [...(d.documents || [])];
                      next[idx] = { ...doc, category: e.target.value };
                      f("documents", next);
                    }}
                  />
                  <input
                    disabled={ro}
                    className={field}
                    placeholder="URL"
                    value={doc.url}
                    onChange={(e) => {
                      const next = [...(d.documents || [])];
                      next[idx] = { ...doc, url: e.target.value };
                      f("documents", next);
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1 text-xs">
                      <input
                        disabled={ro}
                        type="checkbox"
                        checked={doc.isPublic}
                        onChange={(e) => {
                          const next = [...(d.documents || [])];
                          next[idx] = { ...doc, isPublic: e.target.checked };
                          f("documents", next);
                        }}
                      />
                      <span>Public</span>
                    </label>
                    <button
                      type="button"
                      disabled={ro}
                      className="rounded p-1 text-destructive hover:bg-destructive/10"
                      onClick={() =>
                        f(
                          "documents",
                          (d.documents || []).filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "Translations" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Manage localized property titles and descriptions across all 7 supported Avrasya
              languages. Empty fields automatically fall back to the default listing copy.
            </p>
            {(
              [
                ["tr", "TÃ¼rkÃ§e (TR)"],
                ["en", "English (EN)"],
                ["ar", "Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© (AR)"],
                ["ru", "Ð ÑƒÑÑÐºÐ¸Ð¹ (RU)"],
                ["zh", "ä¸­æ–‡ (ZH)"],
                ["bn", "à¦¬à¦¾à¦‚à¦²à¦¾ (BN)"],
                ["fa", "ÙØ§Ø±Ø³ÛŒ (FA)"],
              ] as const
            ).map(([langCode, langLabel]) => {
              const trObj: PropertyTranslation = d.translations?.[langCode] ?? {};
              const updateTr = (patch: Partial<PropertyTranslation>) => {
                f("translations", {
                  ...(d.translations || {}),
                  [langCode]: { ...trObj, ...patch },
                });
              };
              return (
                <div key={langCode} className="rounded-lg border bg-muted/15 p-3 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-brass">
                    {langLabel}
                  </h4>
                  <input
                    disabled={ro}
                    className={field}
                    placeholder={`Localized title (${langCode.toUpperCase()})`}
                    value={trObj.title ?? ""}
                    onChange={(e) => updateTr({ title: e.target.value })}
                  />
                  <input
                    disabled={ro}
                    className={field}
                    placeholder={`Localized short summary (${langCode.toUpperCase()})`}
                    value={trObj.shortDescription ?? ""}
                    onChange={(e) => updateTr({ shortDescription: e.target.value })}
                  />
                  <textarea
                    disabled={ro}
                    className={`${field} h-20 py-1.5`}
                    placeholder={`Localized full description (${langCode.toUpperCase()})`}
                    value={trObj.description ?? ""}
                    onChange={(e) => updateTr({ description: e.target.value })}
                  />
                </div>
              );
            })}
          </div>
        )}
        {tab === "SEO & Social" && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/20 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Entity-Level Search Engine Optimization
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Configure explicit search engine title, meta description, and social sharing card
                (Open Graph) preview image for this property. Leaving these blank will use standard
                automated fallbacks based on property title and primary cover image.
              </p>
            </div>
            <div className="space-y-4">
              <label className="block text-sm">
                SEO Meta Title (`seo_title`)
                <input
                  disabled={ro}
                  maxLength={255}
                  className={`${field} mt-1`}
                  value={d.seo_title || ""}
                  onChange={(e) => f("seo_title", e.target.value)}
                  placeholder={`${d.title || "Property"} â€” Avrasya Properties Istanbul`}
                />
                <span className="text-[11px] text-muted-foreground block mt-1">
                  {(d.seo_title || "").length} / 255 characters (recommended 50-60 characters)
                </span>
              </label>

              <label className="block text-sm">
                SEO Meta Description (`seo_description`)
                <textarea
                  disabled={ro}
                  maxLength={500}
                  className={`${field} mt-1 h-24 py-2`}
                  value={d.seo_description || ""}
                  onChange={(e) => f("seo_description", e.target.value)}
                  placeholder={`Exclusive luxury property in ${d.district || "Istanbul"}. Verified specifications and direct advisor consultation.`}
                />
                <span className="text-[11px] text-muted-foreground block mt-1">
                  {(d.seo_description || "").length} / 500 characters (recommended 140-160
                  characters)
                </span>
              </label>

              <div className="pt-3 border-t space-y-2">
                <label className="block text-sm">
                  Open Graph Social Card Image URL (`og_image_url`)
                  <input
                    disabled={ro}
                    className={`${field} mt-1`}
                    value={d.og_image_url || ""}
                    onChange={(e) => f("og_image_url", e.target.value)}
                    placeholder="https://... or choose from media library"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={ro}
                    className={btnGhost}
                    onClick={() => setPickerTarget("ogImage")}
                  >
                    <FolderKanban className="h-3.5 w-3.5 text-brass" />
                    <span>Choose OG Image from Media Library</span>
                  </button>
                  {d.og_image_url && !ro && (
                    <button
                      type="button"
                      className={`${btnGhost} text-destructive hover:bg-destructive/10`}
                      onClick={() => f("og_image_url", "")}
                    >
                      Clear OG Image
                    </button>
                  )}
                </div>
                {d.og_image_url && (
                  <div className="mt-3 rounded-lg border p-3 bg-muted/20 inline-block">
                    <p className="text-[10px] text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider">
                      Social Card Preview Thumbnail:
                    </p>
                    <img
                      src={d.og_image_url}
                      alt="Open Graph Preview"
                      className="h-36 w-auto max-w-full rounded-md object-cover border shadow-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {tab === "Checks and notes" && (
          <div className="space-y-3 text-sm">
            <p>
              Publication: <Status v={d.publication} /> Â· Availability:{" "}
              <Status v={d.availability} />{" "}
              <span className="text-xs text-muted-foreground">(independent)</span>
            </p>
            {d.sourceNote && (
              <p className="rounded-sm border border-brass bg-warn-bg p-2 text-xs">
                Source claims requiring confirmation: {d.sourceNote}
              </p>
            )}
            <label className="block text-sm">
              Source claims requiring confirmation
              <textarea
                disabled={ro}
                className={`${field} mt-1 h-24 py-2`}
                value={d.sourceNote ?? ""}
                onChange={(e) => f("sourceNote", e.target.value)}
              />
            </label>
            <p className="text-xs text-muted-foreground">
              Keep unresolved claims here. Before reserving a unit, confirm its physical identity,
              availability and source claims with the client.{" "}
              {DEMO_ENABLED
                ? "Demo publication affects this browser only."
                : "Publishing updates the shared public catalogue."}
            </p>
            <h3 className="font-medium">Publish checklist</h3>
            {issues.length === 0 ? (
              <p className="text-primary">Ready to publish.</p>
            ) : (
              <ul className="list-disc pl-5 text-destructive">
                {issues.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            )}
            {!ro && d.publication === "Draft" && (
              <button className={btnGhost} onClick={() => save({ publication: "In Review" })}>
                Send to review
              </button>
            )}
          </div>
        )}
        {tab === "Website Preview" && (
          <>
            <div role="status" className="border-b bg-muted/40 p-4 text-sm">
              <strong>Website preview</strong>
              <p>
                This uses the same property layout as the public website, including your unsaved
                edits. Contact submission is disabled here.
              </p>
              <p className="mt-1">
                {d.publication === "Published"
                  ? "Save changes to update the public listing."
                  : "This listing is not public. Use Publish after checking the details."}
              </p>
              {saved.publication === "Published" && (
                <a
                  className="mt-2 inline-block underline"
                  href={"/properties/" + saved.slug}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open published listing
                </a>
              )}
            </div>
            <PropertyDetails r={listingPreview(d, rawRecord("properties", id))} preview />
          </>
        )}
      </div>
      <MediaPickerModal
        open={pickerTarget !== null}
        onOpenChange={(open) => !open && setPickerTarget(null)}
        onSelect={(url) => {
          if (pickerTarget === "cover") setCover(url);
          else if (pickerTarget === "gallery")
            setD((old) => (old ? { ...old, ...addGalleryItem(old, url) } : old));
          else if (pickerTarget === "floorPlan") f("floorPlan", url);
          else if (pickerTarget === "ogImage") f("og_image_url", url);
        }}
        title={
          pickerTarget === "floorPlan"
            ? "Select Floor Plan Asset"
            : pickerTarget === "ogImage"
              ? "Select Open Graph Preview Asset"
              : "Select Property Media Asset"
        }
        initialCategory="properties"
        allowedMimes={["image/jpeg", "image/png", "image/webp", "image/svg+xml"]}
      />
    </>
  );
}
