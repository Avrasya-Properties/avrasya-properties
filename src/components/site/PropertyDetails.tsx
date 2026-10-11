import { useWhatsAppLink } from "@/hooks/useLiveContact";
import { Link } from "@tanstack/react-router";
import { useState,useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Building,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCheck2,
  Heart,
  Layers,
  MapPin,
  Maximize2,
  MessageSquare,
  Phone,
  Scale,
  Share2,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  CONTACT,
  TYPE_LABEL,
  areaText,
  comparableUsd,
  convertUsdPrice,
  getPropertyMedia,
  humanKey,
  legacyRecords,
  locationText,
  priceDisplay,
  sideText,
    type PropertyRecord,
} from "@/data/properties";
import { useCatalogue } from "@/data/live";

import { PropertyCard } from "@/components/site/PropertyCard";
import { Enquiry } from "@/components/site/Enquiry";
import { useCurrency, useShortlist } from "@/hooks/usePreferences";
import { useSiteSettings } from "@/admin/store";
import { useLiveContact } from "@/hooks/useLiveContact";

function Fact({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-4 border-b border-border/70 py-3 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium text-foreground">{v}</span>
    </div>
  );
}

const usd = (n: number) => "$" + n.toLocaleString("en-US");
const tryf = (n: number) => "TRY " + n.toLocaleString("en-US");

function PriceBlock({ r }: { r: PropertyRecord }) {
  const p = r.price;
  const rows: [string, string][] = [];
  if (p.previous_advertised_amount) rows.push(["Formerly Advertised", usd(p.previous_advertised_amount)]);
  if (p.list_price) rows.push(["Source List Price", usd(p.list_price)]);
  if (p.expenses_amount) rows.push(["Stated Transfer Expenses", usd(p.expenses_amount)]);
  const inst = r.details.installment_offer as { total: number; down_payment_percent: number; months: number } | undefined;
  if (inst) rows.push(["Developer Instalment Plan", `${usd(inst.total)} · ${inst.down_payment_percent}% down · ${inst.months} months`]);
  if (p.basis === "installment_schedule") {
    rows.push([`Down Payment (${p.down_payment_percent}%)`, tryf(p.down_payment_amount!)]);
    rows.push([`At Delivery (${p.delivery_payment_percent}%)`, tryf(p.delivery_payment_amount!)]);
    rows.push(["Instalments", `${p.installment_count} × ${tryf(p.installment_amount!)}`]);
  }
  p.source_offers?.forEach((o, i) =>
    rows.push([`Starting Offer ${i + 1}`, `${usd(o.amount)}${o.area_m2 ? ` · ${o.area_m2} m² gross` : ""}`])
  );
  if (!rows.length) return null;
  return (
    <div className="mt-6 rounded-xs border border-border/80 bg-secondary/40 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        Detailed Breakdown
      </h3>
      {rows.map(([k, v]) => (
        <Fact key={k} k={k} v={v} />
      ))}
      <p className="pt-3 text-[0.72rem] text-muted-foreground leading-relaxed">
        Figures sourced from developer offering documents. Official binding contracts and currency conversion rates (DAB) are confirmed with legal advisers prior to deposit.
      </p>
    </div>
  );
}

export function PropertyDetails({r,preview=false}:{r:PropertyRecord;preview?:boolean}) {
  const waLink=useWhatsAppLink();
  const media = getPropertyMedia(r);
  const p = priceDisplay(r.price);
  const contact = useLiveContact();
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [currency] = useCurrency();
  const { isSaved, toggle } = useShortlist();
  const saved = isSaved(r.slug);
  const usdVal = comparableUsd(r.price);
  const displayPrice = currency === "USD"||usdVal===null ? p.main : convertUsdPrice(usdVal, currency);
  const settings=useSiteSettings();
  const isCbi = r.details["cbi_verified"]===true;

  const d = r.details;
  const facts = Object.entries(d).filter(
    ([k, v]) => typeof v === "string" && !["note","project","unit_area_unconfirmed","floor_plan"].includes(k)
  );
  const claims = (d.claims_requiring_confirmation as string[] | undefined) ?? [];
  const plan = d.supporting_plan as Record<string, unknown> | undefined;
  const { properties }=useCatalogue();
  const related = properties.filter((x) => x.slug !== r.slug && x.side === r.side).slice(0, 3);

  const images = media.floorPlan?[...new Set([...media.gallery,media.floorPlan])]:media.gallery;
  useEffect(()=>{setActiveImg(0);setLightbox(false);},[r.slug,media.cover,images.join("|")]);

  const handleShare = () => {
    if (!preview&&typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Listing link copied to clipboard!");
    }
  };

  return (
    <div data-property-detail onClickCapture={preview?e=>{if((e.target as Element).closest("a")){e.preventDefault();e.stopPropagation();}}:undefined}>
      {/* Breadcrumb Nav */}
      <div className="border-b border-border/60 bg-card/60">
        <nav className="container-site flex items-center justify-between py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/properties" className="hover:text-foreground">Properties</Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-xs">{r.marketing_title}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={preview}
              onClick={handleShare}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              title="Share listing link"
            >
              <Share2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Share</span>
            </button>
            <button
              disabled={preview}
              onClick={() => toggle(r.slug)}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              title="Save to shortlist"
            >
              <Heart className={`h-3.5 w-3.5 ${saved ? "fill-destructive text-destructive" : ""}`} />
              <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Header Info Banner */}
      <section className="container-site pt-8 pb-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-xs bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                {TYPE_LABEL[r.record_type]}
              </span>
              <span className="rounded-xs border border-border bg-card px-2 py-0.5 text-xs font-medium">
                {locationText(r)} · {sideText(r)}
              </span>
              {isCbi ? (
                <span className="flex items-center gap-1 rounded-xs bg-brass px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                  Citizenship eligibility verified
                </span>
              ) : (
                <span className="rounded-xs border border-brass/50 bg-brass/10 px-2 py-0.5 text-xs font-medium text-brass-text">
                  Citizenship eligibility to confirm
                </span>
              )}
            </div>

            <h1 className="display-hero !text-3xl md:!text-5xl font-semibold text-foreground">
              {r.marketing_title}
            </h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brass" />
              <span>{locationText(r)}</span>
              <span>·</span>
              <span>{r.layout_label ?? "Layout to confirm"}</span>
              <span>·</span>
              <span>{areaText(r)}</span>
            </p>
          </div>

          <div className="lg:text-right flex flex-col items-start lg:items-end">
            <p className="eyebrow !text-muted-foreground">{r.mode==="rent"?"Monthly rent":"Asking price"}</p>
            <p className="font-display text-3xl md:text-5xl font-semibold text-foreground tracking-tight">
              {displayPrice}
            </p>
            {currency !== "USD" && usdVal && (
              <p className="text-xs text-muted-foreground mt-0.5">USD {p.main}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {p.note} · Subject to contract confirmation
            </p>
          </div>
        </div>

        {/* Gallery Showcase */}
        <div className="mt-8 space-y-3">
          {/* Main Display Image */}
          <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-xs border border-border/80 bg-muted group">
            {images[activeImg]||media.cover?<img
              src={images[activeImg] || media.cover}
              alt={r.marketing_title}
              className="h-full w-full object-cover transition-transform duration-500"
            />
            :<div className="flex h-full items-center justify-center text-sm text-muted-foreground">Property photos have not been added.</div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

            {/* Lightbox / Expand Button */}
            <button
              disabled={!images.length}
              onClick={() => setLightbox(true)}
              className="absolute right-4 bottom-4 flex items-center gap-1.5 rounded-xs bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/80 transition-colors"
            >
              <Maximize2 className="h-3.5 w-3.5" /> Fullscreen View
            </button>

            {/* Gallery Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImg((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setActiveImg((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails Strip */}
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`relative h-20 w-32 shrink-0 overflow-hidden rounded-xs border transition-all ${
                  activeImg === i ? "border-brass ring-2 ring-brass/40 scale-102" : "border-border/70 opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
                {img.includes("floorplan") && (
                  <span className="absolute bottom-1 left-1 rounded-xs bg-primary/90 px-1 text-[8px] font-bold text-white uppercase">
                    CAD Plan
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Body Grid */}
      <section className="container-site grid gap-10 py-10 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-10">
          {/* Section 01: Specifications Fact Sheet */}
          <div className="rounded-xs border border-border/80 bg-card p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="eyebrow !text-brass">Portfolio Specification</span>
            </div>
            <h2 className="headline text-2xl font-semibold">Development & unit specifications</h2>

            <div className="mt-6 grid gap-x-12 sm:grid-cols-2">
              <Fact k="District / Zone" v={locationText(r)} />
              <Fact k="Continent" v={sideText(r)} />
              <Fact k="Listing" v={r.mode==="rent"?"For rent":"For sale"} />
              {r.bathrooms!=null&&<Fact k="Bathrooms" v={r.bathrooms}/>}<Fact k="Availability" v={r.availability||"To confirm"} />
              {r.tapu_status&&<Fact k="Title deed status" v={r.tapu_status}/>}
              <Fact k="Layout Configuration" v={r.layout_label ?? "To confirm"} />
              <Fact k="Total Surface Area" v={areaText(r)} />
              {typeof d.project === "string" && <Fact k="Project Development" v={d.project} />}
              {["block", "floor", "unit"].map(
                (k) => d[k] != null && <Fact key={k} k={humanKey(k)} v={String(d[k])} />
              )}
              {facts
                .filter(([k]) => !["block", "floor", "unit"].includes(k))
                .map(([k, v]) => (
                  <Fact key={k} k={humanKey(k)} v={v as string} />
                ))}
            </div>

            <PriceBlock r={r} />

            {typeof d.note === "string" && (
              <div className="mt-6 rounded-xs border border-border/70 bg-secondary/30 p-4 text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground block mb-1">Property description:</strong>
                {d.note}
              </div>
            )}
          </div>

          {/* Section 02: Approved highlights */}
          {media.highlights.length>0&&<div className="rounded-xs border border-border/80 bg-card p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="eyebrow !text-brass">Key Property Highlights</span>
            </div>
            <h2 className="headline text-2xl font-semibold">Property highlights</h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {media.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xs border border-border/70 bg-background p-4">
                  <CheckCircle2 className="h-4 w-4 text-brass shrink-0 mt-0.5" />
                  <p className="text-xs md:text-sm text-foreground leading-relaxed font-medium">{h}</p>
                </div>
              ))}
            </div>
          </div>

          }
          {/* Section 03: Supplied floor plan */}
          {media.floorPlan&&<div className="rounded-xs border border-border/80 bg-card p-6 md:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="eyebrow !text-brass">Architectural Layout</p>
                <h2 className="headline text-2xl font-semibold mt-1">Floor plan & space distribution</h2>
              </div>
              <button
                onClick={() => {
                  setActiveImg(Math.max(0,images.indexOf(media.floorPlan!)));
                  setLightbox(true);
                }}
                className="btn btn-outline !min-h-9 !px-3 text-xs gap-1.5"
              >
                <Maximize2 className="h-3.5 w-3.5" /> View floor plan
              </button>
            </div>

            <div className="relative aspect-[16/11] overflow-hidden rounded-xs border border-border/80 bg-white">
              <img
                src={media.floorPlan}
                alt="Architectural Floor Plan"
                className="h-full w-full object-contain p-4"
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              The supplied plan is for reference. Confirm measurements and the exact apartment before purchase.
            </p>
          </div>

          }
          {/* Section 04: Recorded eligibility */}
          <div className="rounded-xs border border-brass/40 bg-primary p-6 md:p-8 text-on-dark shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-brass" />
              <p className="eyebrow !text-brass">Sovereign Rights Review</p>
            </div>
            <h2 className="headline text-2xl font-semibold text-on-dark">
              Turkish citizenship eligibility assessment
            </h2>

            <p className="mt-4 text-sm text-on-dark-muted">{isCbi?"Eligibility has been recorded as verified by the team. Confirm current terms with the advisor before proceeding.":"Eligibility has not been verified for this listing. Price alone does not establish eligibility."}</p>
            <p className="mt-3 text-xs text-on-dark-muted">The website's advisory investment amount is {usd(settings.cbiThresholdUsd)}. Ask our team to confirm requirements for your circumstances.</p>
            <div className="mt-6 pt-4 border-t border-on-dark/15 flex flex-wrap gap-3">
              <Link to="/citizenship" className="btn btn-light !min-h-9 !text-xs">
                View Full CBI Regulations Guide
              </Link>
              <a
                href={waLink(`Hello Avrasya, I'd like to check citizenship eligibility for ${r.marketing_title} (${r.slug})`)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline !border-on-dark/30 !text-on-dark !min-h-9 !text-xs hover:!bg-on-dark/10"
              >
                Inquire With Citizenship Team
              </a>
            </div>
          </div>

          {(r.source_note||claims.length>0)&&<section className="rounded-xs border border-brass/40 bg-card p-6"><h2 className="headline text-xl">Details to confirm</h2>{r.source_note&&<p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{r.source_note}</p>}{claims.length>0&&<ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">{claims.map((claim,i)=><li key={i}>{claim}</li>)}</ul>}</section>}
        </div>

        {/* Sticky Consultation & Enquiry Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
          <div className="rounded-xs border border-border/80 bg-card p-6 shadow-md">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <span className="text-xs font-semibold text-muted-foreground">REF: {r.ref||r.slug}</span>
              <span className="rounded-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[0.65rem] font-bold uppercase">
                {r.availability||"To confirm"}
              </span>
            </div>

            <h3 className="font-display text-xl font-semibold text-foreground">
              {r.record_type === "project" ? "Enquire about project units" : "Schedule a private viewing"}
            </h3>
            <p className="mt-1 mb-5 text-xs text-muted-foreground leading-relaxed">
              We confirm real-time inventory, floor options, and private developer discount allocations before your visit.
            </p>

            <Enquiry defaultTopic={r.marketing_title} propertySlug={r.slug} preview={preview} compact />
          </div>

          {/* Quick Direct Contacts */}
          <div className="rounded-xs border border-border/80 bg-card p-5 text-xs space-y-3">
            <p className="eyebrow !text-brass">Direct Istanbul Team</p>
            <div className="space-y-2">
              <a
                href={`${contact.whatsapp}?text=${encodeURIComponent(`Inquiry regarding ${r.marketing_title} (${r.slug})`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-foreground hover:text-brass transition-colors font-medium"
              >
                <MessageSquare className="h-4 w-4 text-brass" /> Direct WhatsApp Consultation
              </a>
              <a
                href={contact.phoneHref}
                className="flex items-center gap-2 text-foreground hover:text-brass transition-colors font-medium"
              >
                <Phone className="h-4 w-4 text-brass" /> {contact.phone}
              </a>
            </div>
            <p className="pt-2 text-[0.7rem] text-muted-foreground border-t border-border/60">
              Languages spoken: English, Turkish, Arabic.
            </p>
          </div>
        </aside>
      </section>

      {/* Related Properties */}
      {!preview&&related.length > 0 && (
        <section className="container-site border-t border-border/80 pb-24 pt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="eyebrow eyebrow-mark">Comparable Portfolios</p>
              <h2 className="headline text-2xl md:text-3xl font-semibold mt-1">
                More developments on the {r.side === "unknown" ? "market" : `${r.side}an side`}
              </h2>
            </div>
            <Link to="/properties" className="text-xs font-semibold text-foreground hover:text-brass underline">
              View all listings →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((x) => (
              <PropertyCard key={x.slug} r={x} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Bar */}
      {!preview&&<div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border/80 bg-card/95 backdrop-blur-md p-3 lg:hidden shadow-lg">
        <a
          href={`${contact.whatsapp}?text=${encodeURIComponent(`Hello, I'm interested in ${r.marketing_title} (${r.slug}).`)}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary flex-1 justify-center gap-1.5"
        >
          <MessageSquare className="h-4 w-4" /> WhatsApp
        </a>
        <a
          href={contact.phoneHref}
          className="btn btn-outline flex-1 justify-center gap-1.5"
        >
          <Phone className="h-4 w-4" /> Call Office
        </a>
      </div>

      }
      {/* Fullscreen Lightbox Modal */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 p-4"
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative max-h-[85vh] max-w-[90vw] overflow-hidden flex items-center justify-center">
            <img
              src={images[activeImg] || media.cover}
              alt=""
              className="max-h-[82vh] max-w-[88vw] object-contain rounded-xs"
            />
          </div>

          {images.length > 1 && (
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => setActiveImg((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <span className="text-sm font-medium text-white/80">
                {activeImg + 1} / {images.length}
              </span>
              <button
                onClick={() => setActiveImg((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

