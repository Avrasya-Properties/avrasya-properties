import { createFileRoute } from "@tanstack/react-router";
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
import { waLink } from "@/data/properties";
import { useLiveContact } from "@/hooks/useLiveContact";

export const Route = createFileRoute("/investment-catalog")({
  head: () =>
    meta(
      "Avrasya Investment Catalog — Comprehensive Portfolio & Citizenship Guide",
      "Official 17-page Avrasya Properties Group Investment Catalog. Detailed six-phase acquisition pathway, verified 10-year financial projections, and Turkish Citizenship by Investment framework.",
    ),
  component: Catalog,
});

const PDF_DOWNLOAD_URL = "/downloads/Avrasya_Properties_Investment_Catalog.pdf";

const PHASES = [
  {
    phase: "Phase 1",
    title: "Pre-Investment Advisory",
    desc: "Discovery sessions, capital deployment modeling, cross-district market intelligence across Istanbul, Antalya, and Ankara.",
  },
  {
    phase: "Phase 2",
    title: "Legal & Administrative Foundation",
    desc: "Turkish Tax Number, foreign currency & TRY bank accounts, notarized Power of Attorney, and title deed encumbrance checks.",
  },
  {
    phase: "Phase 3",
    title: "Property Acquisition",
    desc: "Purchase agreements drafted by Bar-registered attorneys, Tapu registry transfer, licensed appraisal reports, and DASK insurance.",
  },
  {
    phase: "Phase 4",
    title: "Residence & Citizenship Processing",
    desc: "Short-term investor residency, dossier compilation for Population Directorate, background clearance, and biometric coordination.",
  },
  {
    phase: "Phase 5",
    title: "Post-Acquisition & Wealth Management",
    desc: "Tenant sourcing, long-term and short-term hospitality optimization, rent repatriation in USD/EUR, and routine maintenance.",
  },
  {
    phase: "Phase 6",
    title: "Long-Term Family Security",
    desc: "Concierge support, school enrollment, healthcare orientation, 3-year hold exit strategy, and second-generation estate planning.",
  },
];

const METRICS = [
  {
    label: "Minimum CBI Real Estate Threshold",
    val: "$400,000 USD",
    sub: "Qualifying government-appraised title deeds",
  },
  {
    label: "Average Capital Appreciation",
    val: "12% – 18%",
    sub: "5-year rolling average in prime Istanbul corridors",
  },
  {
    label: "Gross Long-Term Rental Yield",
    val: "5% – 8%",
    sub: "Annual USD/EUR equivalent returns",
  },
  {
    label: "Peak Tourism Rental Yield",
    val: "10% – 15%",
    sub: "Short-term managed suites in central tourist hubs",
  },
  {
    label: "Citizenship Processing Timeline",
    val: "3 – 6 Months",
    sub: "Expedited fast-track investor track",
  },
  {
    label: "Mandatory Resale Hold Period",
    val: "3 Years",
    sub: "Free-market liquidation unlocked upon milestone",
  },
];

function Catalog() {
  const contact = useLiveContact();
  return (
    <>
      <PageIntro
        eyebrow="Official Publication"
        title={
          <>
            Avrasya Properties Group <em>Investment Catalog.</em>
          </>
        }
      >
        <p className="max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
          Our comprehensive 17-page investor brief detailing the Turkish Citizenship by Investment
          framework, verified return projections, legal due diligence standards, and our complete
          six-phase client pathway.
        </p>
      </PageIntro>

      {/* Main Download Card Banner */}
      <section className="container-site mb-12">
        <div className="relative overflow-hidden rounded-xs border border-brass/40 bg-gradient-to-br from-[#0B2228] to-[#07161b] p-8 md:p-12 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brass/20 px-3 py-1 text-xs font-semibold text-brass">
                <FileText className="h-3.5 w-3.5" /> 17 Pages · Full Publication (PDF)
              </span>
              <h2 className="mt-4 font-display text-2xl md:text-3xl font-normal text-white">
                Download the Complete Investor Guide
              </h2>
              <p className="mt-2 text-sm md:text-base text-white/80 leading-relaxed">
                Includes full financial modeling for $400,000+ acquisitions, 10-year wealth
                projections, legal FAQs for emerging market investors, and district portfolio
                overviews.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={PDF_DOWNLOAD_URL}
                download="Avrasya_Properties_Investment_Catalog.pdf"
                className="btn bg-brass text-primary font-semibold hover:bg-[#c99e5c] gap-2 shadow-md"
              >
                <Download className="h-4 w-4" /> Download PDF (340 KB)
              </a>
              <a
                href={waLink(
                  "Hello, I would like to request the Avrasya Investment Catalog and book a private consultation.",
                )}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline !border-white/30 !bg-white/10 !text-white hover:!bg-white/20 gap-2"
              >
                Discuss with Advisor
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Performance Highlights */}
      <Margin label="Key Performance Metrics">
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
      <Margin label="The Six-Phase Pathway">
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
      <Margin label="Direct Inquiries">
        <div className="rounded-xs border border-border/80 bg-card p-6 md:p-8">
          <h3 className="font-display text-xl font-medium text-foreground">
            Connect Directly with our Senior Istanbul Advisory Team
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Whether you are evaluating a $400,000 citizenship qualifying purchase or building an
            Istanbul commercial portfolio, our consultants provide transparent guidance without
            sales pressure.
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
