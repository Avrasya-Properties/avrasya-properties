import { useWhatsAppLink } from "@/hooks/useLiveContact";
import { usePublishedDocuments } from "@/data/live";
import { DEMO_MODE,publicSupabase } from "@/lib/supabase";
import { ManagedPage } from "@/components/site/ManagedPage";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "@/hooks/useLanguage";
import {
  Download,
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Mail,
  Phone,
} from "lucide-react";
import { CtaBand, Margin, PageIntro } from "@/components/site/Chrome";
import { meta } from "@/components/site/TextPage";
import { useLiveContact } from "@/hooks/useLiveContact";
import { publicDocumentUrl } from "@/lib/public-document";

export const Route = createFileRoute("/investment-catalog")({
  head: () =>
    meta(
      "Avrasya Investment Catalog — Comprehensive Portfolio & Citizenship Guide",
      "Official 17-page Avrasya Properties Group Investment Catalog. Detailed six-phase acquisition pathway, verified 10-year financial projections, and Turkish Citizenship by Investment framework.",
      "/investment-catalog"
    ),
  component: () => <ManagedPage slug="investment-catalog"><Catalog /></ManagedPage>,
});

function Catalog() {
  const { t } = useTranslation();
  const waLink = useWhatsAppLink();
  const docs = usePublishedDocuments();
  const doc = docs.data?.[0];
  const PDF_DOWNLOAD_URL = DEMO_MODE
    ? "/downloads/Avrasya_Properties_Investment_Catalog.pdf"
    : doc?.storage_path?.startsWith("/")
    ? doc.storage_path
    : doc
    ? publicSupabase.storage.from("public-marketing").getPublicUrl(doc.storage_path).data.publicUrl
    : undefined;
  const contact = useLiveContact();

  const PHASES = t.catalog.phases;
  const METRICS = t.catalog.metrics;

  return (
    <>
      <PageIntro
        eyebrow={t.catalog.eyebrow}
        title={
          <>
            {t.catalog.title} <em>{t.catalog.titleEm}</em>
          </>
        }
      >
        <p className="max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
          {t.catalog.description}
        </p>
      </PageIntro>

      {/* Main Download Card Banner */}
      <section className="container-site mb-12">
        <div className="relative overflow-hidden rounded-xs border border-brass/40 bg-gradient-to-br from-[#0B2228] to-[#07161b] p-8 md:p-12 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brass/20 px-3 py-1 text-xs font-semibold text-brass">
                <FileText className="h-3.5 w-3.5" /> {t.catalog.downloadEyebrow}
              </span>
              <h2 className="mt-4 font-display text-2xl md:text-3xl font-normal text-white">
                {t.catalog.downloadTitle}
              </h2>
              <p className="mt-2 text-sm md:text-base text-white/80 leading-relaxed">
                {t.catalog.downloadDesc}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={PDF_DOWNLOAD_URL}
                download="Avrasya_Properties_Investment_Catalog.pdf"
                className="btn bg-brass text-primary font-semibold hover:bg-[#c99e5c] gap-2 shadow-md"
              >
                <Download className="h-4 w-4" /> {t.catalog.downloadPdfBtn}
              </a>
              <a
                href={waLink(
                  "Hello, I would like to request the Avrasya Investment Catalog and book a private consultation.",
                )}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline !border-white/30 !bg-white/10 !text-white hover:!bg-white/20 gap-2"
              >
                {t.cta.requestConsultation}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Performance Highlights */}
      <Margin label={t.catalog.metricsEyebrow}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map((m) => (
            <div key={m.label} className="rounded-xs border border-border/80 bg-card p-5">
              <p className="eyebrow !text-muted-foreground !text-[0.68rem]">{m.label}</p>
              <p className="mt-2 font-display text-2xl md:text-3xl font-semibold text-primary">
                {m.val}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{m.sub}</p>
            </div>
          ))}
        </div>
      </Margin>

      {/* The Six Phases */}
      <Margin label={t.catalog.phasesEyebrow}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PHASES.map((p) => (
            <div
              key={p.phase}
              className="rounded-xs border border-border/80 bg-card p-6 flex flex-col justify-between"
            >
              <div>
                <span className="eyebrow !text-brass-text">{p.phase}</span>
                <h3 className="mt-2 font-display text-lg font-medium text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-1.5 text-xs text-brass font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Full Advisory Governance
              </div>
            </div>
          ))}
        </div>
      </Margin>

      {/* Direct Contact & Inquiries */}
      <Margin label={t.common.directInquiries}>
        <div className="rounded-xs border border-border/80 bg-card p-6 md:p-8">
          <h3 className="font-display text-xl font-medium text-foreground">
            {t.footer.headquarters}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            {t.cta.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium">
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-2 text-primary hover:text-brass"
            >
              <Mail className="h-4 w-4 text-brass" /> {contact.email}
            </a>
            <a
              href={contact.phoneHref}
              className="flex items-center gap-2 text-primary hover:text-brass"
            >
              <Phone className="h-4 w-4 text-brass" /> {contact.phone}
            </a>
          </div>
        </div>
      </Margin>

      <CtaBand />
    </>
  );
}

