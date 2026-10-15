import { useWhatsAppLink } from "@/hooks/useLiveContact";
import { Link } from "@tanstack/react-router";
import { useState,useEffect,useRef } from "react";
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
import { useLanguage } from "@/hooks/useLanguage";

function Fact({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-4 border-b border-border/70 py-3 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="break-words text-right font-medium text-foreground rtl:text-left">{v}</span>
    </div>
  );
}

function GalleryImage({src,alt,className}:{src:string;alt:string;className:string}){
  const [failed,setFailed]=useState(false);
  return failed?<div role="img" aria-label={alt} className="flex h-full w-full items-center justify-center bg-muted p-4 text-center text-sm text-muted-foreground">This photo is temporarily unavailable.</div>:<img src={src} alt={alt} className={className} onError={()=>setFailed(true)}/>;
}

const usd = (n: number) => "$" + n.toLocaleString("en-US");
const tryf = (n: number) => "TRY " + n.toLocaleString("en-US");

function PriceBlock({ r }: { r: PropertyRecord }) {
  const { t } = useLanguage();
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
        {t.propertyDetail.priceDetails}
      </h3>
      {rows.map(([k, v]) => (
        <Fact key={k} k={k} v={v} />
      ))}
      <p className="pt-3 text-[0.72rem] text-muted-foreground leading-relaxed">
        {t.propertyDetail.priceDetailsNotice}
      </p>
    </div>
  );
}

export function PropertyDetails({r,preview=false}:{r:PropertyRecord;preview?:boolean}) {
  const waLink=useWhatsAppLink();
  const media = getPropertyMedia(r);
  const p = priceDisplay(r.price);
  const contact = useLiveContact();
  const { t, isRtl } = useLanguage();
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [ready,setReady]=useState(false);
  useEffect(()=>setReady(true),[]);
  const galleryDialog=useRef<HTMLDivElement>(null);
  const [currency] = useCurrency();
  const { isSaved, toggle } = useShortlist();
  const saved = isSaved(r.slug);
  const usdVal = comparableUsd(r.price);
  const displayPrice = currency === "USD"||usdVal===null ? (p.main === "Price on request" ? t.common.priceOnRequest : p.main) : convertUsdPrice(usdVal, currency);
  const settings=useSiteSettings();
  const isCbi = r.details["cbi_verified"]===true;

  const sideLabel =
    r.side === "Europe"
      ? t.common.sideEurope
      : r.side === "Asia"
        ? t.common.sideAsia
        : t.common.sideUnknown;

  const typeLabel =
    r.record_type === "unit_offer"
      ? t.common.unitOffer
      : r.record_type === "unit_type"
        ? t.common.unitType
        : r.record_type === "package"
          ? t.common.multiApartmentPackage
          : r.record_type === "project"
            ? t.common.projectIntroduction
            : t.common.offerToConfirm;

  const d = r.details;
  const facts = Object.entries(d).filter(
    ([k, v]) => typeof v === "string" && !["note","project","unit_area_unconfirmed","floor_plan"].includes(k)
  );
  const claims = (d.claims_requiring_confirmation as string[] | undefined) ?? [];
  const plan = d.supporting_plan as Record<string, unknown> | undefined;
  const { properties }=useCatalogue();
  const related = properties.filter((x) => x.slug !== r.slug && x.side === r.side).slice(0, 3);

  const images = media.floorPlan?[...new Set([...media.gallery,media.floorPlan])]:media.gallery;
  const mediaKey=r.slug+"|"+media.cover+"|"+images.join("|");
  const previousMedia=useRef(mediaKey);
  useEffect(()=>{if(previousMedia.current!==mediaKey){previousMedia.current=mediaKey;setActiveImg(0);setLightbox(false);}},[mediaKey]);
  useEffect(()=>{
    if(!lightbox)return;
    const trigger=document.activeElement as HTMLElement|null,previous=document.body.style.overflow;
    document.body.style.overflow="hidden";galleryDialog.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const keys=(event:KeyboardEvent)=>{
      if(event.key==="Escape")setLightbox(false);
      if(event.key==="ArrowRight"&&images.length>1)setActiveImg(i=>(i+1)%images.length);
      if(event.key==="ArrowLeft"&&images.length>1)setActiveImg(i=>(i+images.length-1)%images.length);
      if(event.key==="Tab"){
        const buttons=galleryDialog.current?.querySelectorAll<HTMLButtonElement>("button"),first=buttons?.[0],last=buttons?.[buttons.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      }
    };
    window.addEventListener("keydown",keys);
    return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",keys);if(trigger?.isConnected)trigger.focus();};
  },[lightbox,images.length]);

  const handleShare = () => {
    if (!preview&&typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t.propertyDetail.shareSuccess);
    }
  };

  return (
    <div data-property-detail data-property-ready={ready} className={preview?"property-detail-preview":"property-detail-page"} onClickCapture={preview?e=>{if((e.target as Element).closest("a")){e.preventDefault();e.stopPropagation();}}:undefined}>
      {/* Breadcrumb Nav */}
      <div className="border-b border-border/60 bg-card/60">
        <nav aria-label="Breadcrumb" className="container-site flex flex-wrap items-center justify-between gap-2 py-3 text-xs text-muted-foreground">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Link to="/" className="shrink-0 hover:text-foreground">{t.propertyDetail.home}</Link>
            <span className="shrink-0" aria-hidden="true">/</span>
            <Link to="/properties" className="shrink-0 hover:text-foreground">{t.propertyDetail.properties}</Link>
            <span className="shrink-0" aria-hidden="true">/</span>
            <span className="min-w-0 flex-1 truncate font-medium text-foreground">{r.marketing_title}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={preview}
              onClick={handleShare}
              className="flex min-h-11 min-w-11 items-center justify-center gap-1 hover:text-foreground transition-colors"
              title={t.propertyDetail.share}
            >
              <Share2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t.propertyDetail.share}</span>
            </button>
            <button
              disabled={preview}
              onClick={() => toggle(r.slug)}
              className="flex min-h-11 min-w-11 items-center justify-center gap-1 hover:text-foreground transition-colors"
              title={t.propertyDetail.save}
            >
              <Heart className={`h-3.5 w-3.5 ${saved ? "fill-destructive text-destructive" : ""}`} />
              <span className="hidden sm:inline">{saved ? t.propertyDetail.saved : t.propertyDetail.save}</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Header Info Banner */}
      <section className="container-site pt-8 pb-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-xs bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                {TYPE_LABEL[r.record_type]}
              </span>
              <span className="rounded-xs border border-border bg-card px-2 py-0.5 text-xs font-medium">
                {locationText(r)} · {sideText(r)}
              </span>
              {isCbi ? (
                <span className="flex items-center gap-1 rounded-xs bg-brass px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                  {t.propertyDetail.cbiVerified}
                </span>
              ) : (
                <span className="rounded-xs border border-brass/50 bg-brass/10 px-2 py-0.5 text-xs font-medium text-brass-text">
                  {t.propertyDetail.cbiToConfirm}
                </span>
              )}
            </div>

            <h1 className="display-hero break-words !text-3xl md:!text-5xl font-semibold text-foreground">
              {r.marketing_title}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground md:text-base">
              <MapPin className="h-4 w-4 text-brass" />
              <span>{locationText(r)}</span>
              <span>·</span>
              <span>{r.layout_label ?? t.propertyDetail.toConfirm}</span>
              <span>·</span>
              <span>{areaText(r)}</span>
            </p>
          </div>

          <div className="lg:text-right flex flex-col items-start lg:items-end">
            <p className="eyebrow !text-muted-foreground">{r.mode==="rent"?t.propertyDetail.monthlyRent:t.propertyDetail.askingPrice}</p>
            <p className="font-display break-words text-3xl md:text-5xl font-semibold text-foreground tracking-tight">
              {displayPrice}
            </p>
            {currency !== "USD" && usdVal && (
              <p className="text-xs text-muted-foreground mt-0.5">USD {p.main}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {p.note} · {t.propertyDetail.subjectToContract}
            </p>
          </div>
        </div>

        {/* Gallery Showcase */}
        <div className="mt-8 space-y-3">
          {/* Main Display Image */}
          <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-xs border border-border/80 bg-muted group">
            {images[activeImg]||media.cover?<GalleryImage
              key={images[activeImg]||media.cover}
              src={images[activeImg] || media.cover}
              alt={r.marketing_title}
              className="h-full w-full object-contain transition-transform duration-500"
            />
            :<div className="flex h-full items-center justify-center text-sm text-muted-foreground">{t.propertyDetail.noPhotos}</div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

            {/* Lightbox / Expand Button */}
            <button
              disabled={!images.length}
              onClick={() => setLightbox(true)}
              className="absolute right-3 bottom-3 flex min-h-11 items-center gap-1.5 rounded-xs bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/80 transition-colors"
            >
              <Maximize2 className="h-3.5 w-3.5" /> {t.propertyDetail.fullscreen}
            </button>

            {/* Gallery Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImg((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors"
                  aria-label={t.propertyDetail.previousImage}
                >
                  <ChevronLeft className="h-5 w-5 rtl-flip" />
                </button>
                <button
                  onClick={() => setActiveImg((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors"
                  aria-label={t.propertyDetail.nextImage}
                >
                  <ChevronRight className="h-5 w-5 rtl-flip" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails Strip */}
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                aria-label={img===media.floorPlan?t.propertyDetail.floorPlan:`${t.propertyDetail.fullscreen} ${i+1}`}
                aria-pressed={activeImg===i}
                onClick={() => setActiveImg(i)}
                className={`relative h-20 w-32 shrink-0 overflow-hidden rounded-xs border transition-all ${
                  activeImg === i ? "border-brass ring-2 ring-brass/40 scale-102" : "border-border/70 opacity-70 hover:opacity-100"
                }`}
              >
                <GalleryImage key={img} src={img} alt={img===media.floorPlan?t.propertyDetail.floorPlan:`${t.propertyDetail.fullscreen} ${i+1}`} className="h-full w-full object-cover" />
                {img===media.floorPlan && (
                  <span className="absolute bottom-1 left-1 rounded-xs bg-primary/90 px-1 text-[8px] font-bold text-white uppercase">
                    {t.propertyDetail.floorPlan}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Body Grid */}
      <section className="container-site grid min-w-0 gap-6 py-6 md:gap-10 md:py-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-6 md:space-y-10">
          {/* Section 01: Specifications Fact Sheet */}
          <div className="rounded-xs border border-border/80 bg-card p-4 sm:p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="eyebrow !text-brass">{t.propertyDetail.specificationsEyebrow}</span>
            </div>
            <h2 className="headline text-2xl font-semibold">{t.propertyDetail.specificationsTitle}</h2>

            <div className="mt-6 grid gap-x-12 sm:grid-cols-2">
              <Fact k={t.propertyDetail.district} v={locationText(r)} />
              <Fact k={t.propertyDetail.istanbulSide} v={sideText(r)} />
              <Fact k={t.propertyDetail.listingType} v={r.mode==="rent"?t.propertyDetail.forRent:t.propertyDetail.forSale} />
              {r.bathrooms!=null&&<Fact k={t.propertyDetail.bathrooms} v={r.bathrooms}/>}<Fact k={t.propertyDetail.availability} v={r.availability||t.propertyDetail.toConfirm} />
              {r.tapu_status&&<Fact k={t.propertyDetail.titleDeedStatus} v={r.tapu_status}/>}
              <Fact k={t.propertyDetail.apartmentLayout} v={r.layout_label ?? t.propertyDetail.toConfirm} />
              {r.areas.length?r.areas.map((area,i)=><Fact key={i} k={area.basis==="gross"?t.propertyDetail.grossArea:area.basis==="net"?t.propertyDetail.netArea:t.propertyDetail.areaToConfirm} v={`${area.value_m2.toLocaleString()} m²`}/>):<Fact k={t.propertyDetail.areaToConfirm} v={t.propertyDetail.toConfirm}/>}
              {typeof d.project === "string"&&d.project&&<Fact k={t.propertyDetail.development} v={d.project} />}
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
              <div className="mt-6 whitespace-pre-line rounded-xs border border-border/70 bg-secondary/30 p-4 text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground block mb-1">{t.propertyDetail.propertyDescription}</strong>
                {d.note}
              </div>
            )}
          </div>

          {/* Section 02: Approved highlights */}
          {media.highlights.length>0&&<div className="rounded-xs border border-border/80 bg-card p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="eyebrow !text-brass">{t.propertyDetail.highlightsEyebrow}</span>
            </div>
            <h2 className="headline text-2xl font-semibold">{t.propertyDetail.highlightsTitle}</h2>

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
                <p className="eyebrow !text-brass">{t.propertyDetail.floorPlan}</p>
                <h2 className="headline text-2xl font-semibold mt-1">{t.propertyDetail.floorPlan}</h2>
              </div>
              <button
                onClick={() => {
                  setActiveImg(Math.max(0,images.indexOf(media.floorPlan!)));
                  setLightbox(true);
                }}
                className="btn btn-outline !min-h-9 !px-3 text-xs gap-1.5"
              >
                <Maximize2 className="h-3.5 w-3.5" /> {t.propertyDetail.fullscreen}
              </button>
            </div>

            <div className="relative aspect-[16/11] overflow-hidden rounded-xs border border-border/80 bg-white">
              <GalleryImage
                key={media.floorPlan}
                src={media.floorPlan}
                alt={t.propertyDetail.floorPlan}
                className="h-full w-full object-contain p-4"
              />
            </div>
          </div>

          }
          {/* Section 04: Recorded eligibility */}
          <div className="rounded-xs border border-brass/40 bg-primary p-6 md:p-8 text-on-dark shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-brass" />
              <p className="eyebrow !text-brass">{t.propertyDetail.legalVerificationEyebrow}</p>
            </div>
            <h2 className="headline text-2xl font-semibold text-on-dark">
              {t.propertyDetail.legalVerificationTitle}
            </h2>

            <p className="mt-4 text-sm text-on-dark-muted">{t.propertyDetail.legalVerificationDesc}</p>
            <div className="mt-6 pt-4 border-t border-on-dark/15 flex flex-wrap gap-3">
              <Link to="/citizenship" className="btn btn-light !min-h-9 !text-xs">
                {t.home.cbiExploreRoadmap}
              </Link>
              <a
                href={waLink(`Hello Avrasya, I'd like to check citizenship eligibility for ${r.marketing_title} (${r.slug})`)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline !border-on-dark/30 !text-on-dark !min-h-9 !text-xs hover:!bg-on-dark/10"
              >
                {t.propertyDetail.whatsappDirect}
              </a>
            </div>
          </div>

          {(r.source_note||claims.length>0)&&<section className="rounded-xs border border-brass/40 bg-card p-6"><h2 className="headline text-xl">{t.propertyDetail.specificationsTitle}</h2>{r.source_note&&<p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{r.source_note}</p>}{claims.length>0&&<ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">{claims.map((claim,i)=><li key={i}>{claim}</li>)}</ul>}</section>}
        </div>

        {/* Sticky Consultation & Enquiry Sidebar */}
        <aside id="property-enquiry" className="min-w-0 scroll-mt-24 space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xs border border-border/80 bg-card p-4 sm:p-6 shadow-md">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <span className="text-xs font-semibold text-muted-foreground">REF: {r.ref||r.slug}</span>
              <span className="rounded-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[0.65rem] font-bold uppercase">
                {r.availability||t.propertyDetail.toConfirm}
              </span>
            </div>

            <h3 className="font-display text-xl font-semibold text-foreground">
              {t.propertyDetail.bookViewing}
            </h3>
            <p className="mt-1 mb-5 text-xs text-muted-foreground leading-relaxed">
              {t.propertyDetail.bookViewingDesc}
            </p>

            <Enquiry defaultTopic={r.marketing_title} propertySlug={r.slug} preview={preview} compact />
          </div>

          {/* Quick Direct Contacts */}
          <div className="rounded-xs border border-border/80 bg-card p-5 text-xs space-y-3">
            <p className="eyebrow !text-brass">{t.common.directInquiries}</p>
            <div className="space-y-2">
              <a
                href={`${contact.whatsapp}?text=${encodeURIComponent(`Inquiry regarding ${r.marketing_title} (${r.slug})`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-foreground hover:text-brass transition-colors font-medium"
              >
                <MessageSquare className="h-4 w-4 text-brass" /> {t.propertyDetail.whatsappDirect}
              </a>
              <a
                href={contact.phoneHref}
                className="flex items-center gap-2 text-foreground hover:text-brass transition-colors font-medium"
              >
                <Phone className="h-4 w-4 text-brass" /> {contact.phone}
              </a>
            </div>
          </div>
        </aside>
      </section>

      {/* Related Properties */}
      {!preview&&related.length > 0 && (
        <section className="container-site border-t border-border/80 pb-24 pt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="eyebrow eyebrow-mark">{t.propertyDetail.similarProperties}</p>
              <h2 className="headline text-2xl md:text-3xl font-semibold mt-1">
                {t.propertyDetail.similarSubtitle}
              </h2>
            </div>
            <Link to="/properties" className="text-xs font-semibold text-foreground hover:text-brass underline">
              {t.propertyDetail.browseCurrent} →
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
      {!preview&&<div className="property-contact-bar fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border/80 bg-card/95 backdrop-blur-md p-3 lg:hidden shadow-lg">
        <a href="#property-enquiry" className="btn btn-primary flex-1 !px-3">{t.propertyDetail.bookViewing}</a>
        <a
          href={`${contact.whatsapp}?text=${encodeURIComponent(`Hello, I'm interested in ${r.marketing_title} (${r.slug}).`)}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline flex-1 justify-center !px-3 gap-1.5"
        >
          <MessageSquare className="h-4 w-4" /> WhatsApp
        </a>
        <a
          href={contact.phoneHref}
          className="btn btn-outline !px-3"
          aria-label={t.common.directInquiries}
        >
          <Phone className="h-4 w-4" />
        </a>
      </div>

      }
      {/* Fullscreen Lightbox Modal */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Property photo gallery"
          ref={galleryDialog}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 p-4"
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative max-h-[85vh] max-w-[90vw] overflow-hidden flex items-center justify-center">
            <GalleryImage
              key={images[activeImg]||media.cover}
              src={images[activeImg] || media.cover}
              alt=""
              className="max-h-[82vh] max-w-[88vw] object-contain rounded-xs"
            />
          </div>

          {images.length > 1 && (
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => setActiveImg((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <span className="text-sm font-medium text-white/80">
                {activeImg + 1} / {images.length}
              </span>
              <button
                onClick={() => setActiveImg((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
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

