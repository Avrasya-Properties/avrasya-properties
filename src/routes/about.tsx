import { ManagedPage } from "@/components/site/ManagedPage";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  Building2,
  Compass,
  Globe2,
  HeartHandshake,
  MapPin,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";
import { CtaBand, Margin, PageIntro } from "@/components/site/Chrome";
import { meta } from "@/components/site/TextPage";
import { useLiveContact } from "@/hooks/useLiveContact";

export const Route = createFileRoute("/about")({
  head: () =>
    meta(
      "About Avrasya Properties · Istanbul Property Investment Consultancy",
      "Headquartered on Istanbul's historic Asian shore, Avrasya Properties provides institutional advisory and cross-border acquisition services for international private clients.",
    ),
  component: () => <ManagedPage slug="about"><AboutPage /></ManagedPage>,
});

export function AboutPage() {
  const contact = useLiveContact();
  const leadership = [
    {
      name: "Selin Arda",
      role: "Managing Principal & Head of Acquisitions",
      desc: "Former institutional real estate director with 14 years evaluating prime residential and commercial developments across Istanbul's European and Asian corridors.",
    },
    {
      name: "Murat Kaya",
      role: "Director of International Client Advisory",
      desc: "Specializing in cross-border wealth management, foreign exchange transaction coordination, and private client portfolio assembly for European and GCC investors.",
    },
    {
      name: "Elif Demir",
      role: "Head of Legal & Regulatory Compliance",
      desc: "Liaises with bar-registered legal partners, SPK-accredited appraisal firms, and the Directorate of Migration Management for seamless citizenship processing.",
    },
  ];

  const standards = [
    {
      title: "Zero Conflicts of Interest",
      desc: "We operate as buy-side client fiduciaries. We do not steer clients toward high-commission speculative projects; every recommendation is backed by documented valuations.",
      icon: Scale,
    },
    {
      title: "Mandatory Independent Legal Representation",
      desc: "Every purchase is reviewed by independent, bar-registered attorneys retained directly by the buyer to verify clean title deed records and encumbrance freedom.",
      icon: ShieldCheck,
    },
    {
      title: "Multi-Currency Financial Precision",
      desc: "We orchestrate all transactions with statutory Central Bank FX conversions (DAB), eliminating exchange rate volatility and banking fee slippage.",
      icon: Globe2,
    },
    {
      title: "Generational Post-Closing Stewardship",
      desc: "Our relationship begins at closing: we handle turnkey interior design, corporate leasing, tax filings, and 5-year exit liquidation.",
      icon: HeartHandshake,
    },
  ];

  return (
    <>
      <PageIntro
        eyebrow="Company Profile · Fiduciary Standards"
        title={
          <>
            Istanbul's premier cross-border property consultancy: <em>built on integrity.</em>
          </>
        }
      >
        <p>
          Founded on Istanbul's Asian shoreline in Üsküdar overlooking the Bosphorus, Avrasya
          Properties bridges international capital with high-conviction Turkish real estate assets.
          We combine deep local market intelligence with institutional transparency.
        </p>
      </PageIntro>

      {/* Metrics Bar */}
      <section className="border-b bg-card py-8">
        <div className="container-site grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
          <div>
            <p className="font-display text-3xl font-bold text-brass md:text-4xl">$120M+</p>
            <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">
              Transaction Volume Advised
            </p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-brass md:text-4xl">38+</p>
            <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">
              Nationalities Represented
            </p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-brass md:text-4xl">100%</p>
            <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">
              CBI Compliance Success
            </p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-brass md:text-4xl">14 Yrs</p>
            <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">
              Istanbul Market Tenure
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy & Headquarters */}
      <section className="container-site py-16">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          <div className="space-y-4 lg:col-span-7">
            <p className="eyebrow">Our Philosophy</p>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              Transforming Foreign Property Acquisition in Türkiye
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For decades, international buyers navigating Istanbul's dynamic property landscape
              encountered fragmented information, undisclosed markups, and aggressive developer
              sales tactics.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Avrasya Properties was established to introduce an uncompromising standard of
              advisory. We believe property acquisition abroad should be as structured, documented,
              and secure as an institutional capital allocation.
            </p>
            <div className="pt-2">
              <p className="text-sm font-semibold text-foreground">Registered Office & Presence:</p>
              <p className="text-sm text-muted-foreground">{contact.company}</p>
              <p className="text-sm text-muted-foreground">{contact.address}</p>
            </div>
          </div>

          <div className="lg:col-span-5 overflow-hidden rounded-2xl border bg-muted aspect-[4/3]">
            <img
              src="/images/properties/bosphorus-terrace.jpg"
              alt="Bosphorus Istanbul"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Advisory Principles */}
      <section className="border-t bg-ink text-on-dark py-20">
        <div className="container-site">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow text-brass">Our Charter</p>
            <h2 className="font-display text-3xl font-semibold md:text-4xl text-on-dark">
              Four Core Fiduciary Commitments
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {standards.map((s) => (
              <div
                key={s.title}
                className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <s.icon className="h-6 w-6 text-brass mb-3" />
                <h3 className="font-display text-lg font-semibold text-on-dark">{s.title}</h3>
                <p className="mt-2 text-sm text-on-dark-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="container-site py-20 border-b">
        <div className="max-w-2xl mb-12">
          <p className="eyebrow">Client Directors</p>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Executive Leadership & Advisory Board
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {leadership.map((l) => (
            <div key={l.name} className="rounded-xl border bg-card p-6">
              <div className="h-12 w-12 rounded-full bg-brass/10 text-brass flex items-center justify-center font-bold text-lg font-display mb-4">
                {l.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">{l.name}</h3>
              <p className="text-xs font-semibold uppercase tracking-wider text-brass mt-1">
                {l.role}
              </p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{l.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Legal & Fiduciary Verification Framework */}
      <section className="container-site py-20 border-b">
        <div className="max-w-2xl mb-12">
          <p className="eyebrow">Due Diligence Protocol</p>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Institutional Verification Framework
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Every property recommended by Avrasya Properties undergoes strict multi-tier vetting
            before any client capital commitment.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-6">
            <div className="h-10 w-10 rounded-lg bg-brass/10 text-brass flex items-center justify-center mb-4">
              <Scale className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Independent Title Audit
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Direct verification at the Land Registry (Tapu Sicil) ensuring clean freehold title
              deed, absence of mortgages or judicial liens (haciz), and confirmed Kat Mülkiyeti
              status.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="h-10 w-10 rounded-lg bg-brass/10 text-brass flex items-center justify-center mb-4">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              SPK-Accredited Valuation
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Mandatory appraisal reports by Capital Markets Board (SPK) certified assessors
              confirming real market value and Turkish Citizenship qualifying threshold eligibility.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="h-10 w-10 rounded-lg bg-brass/10 text-brass flex items-center justify-center mb-4">
              <Globe2 className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Central Bank DAB Execution
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Coordinated Foreign Exchange Purchase Certificate (Döviz Alım Belgesi) processing
              directly through the Central Bank of Türkiye (TCMB) to secure statutory exchange
              rates.
            </p>
          </div>
        </div>
      </section>

      {/* Headquarters & Consultation Facilities */}
      <section className="container-site py-20 border-b">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div>
              <p className="eyebrow">Istanbul Headquarters</p>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Üsküdar Waterfront Advisory Suites
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Our headquarters is situated on Istanbul's historic Asian shoreline in Üsküdar
              overlooking the Bosphorus. We host private investors and family offices for
              confidential portfolio reviews, legal title examinations, and direct developer
              consultations.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div className="rounded-lg border bg-card/60 p-4">
                <p className="text-xs uppercase tracking-wider text-brass font-semibold">
                  Registered Entity
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{contact.company}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Istanbul Chamber of Commerce (İTO)
                </p>
              </div>
              <div className="rounded-lg border bg-card/60 p-4">
                <p className="text-xs uppercase tracking-wider text-brass font-semibold">
                  Advisory Hours
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{contact.advisoryHours}</p>
              </div>
            </div>

            <div className="space-y-2 border-t pt-4 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-brass shrink-0 mt-0.5" />
                <span>{contact.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brass shrink-0" />
                <span>
                  Private boardroom meetings & chauffeured property viewings arranged upon request
                </span>
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 overflow-hidden rounded-2xl border bg-muted aspect-[4/3] relative">
            <img
              src="/images/properties/maslak-tower.jpg"
              alt="Istanbul Corporate Skyline"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
              <p className="text-white text-sm font-medium">
                Avrasya Advisory · Prime Corridors Across Istanbul
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advisory FAQs */}
      <section className="container-site py-20">
        <div className="max-w-2xl mb-12">
          <p className="eyebrow">Frequently Asked Questions</p>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Key Questions for International Investors
          </h2>
        </div>

        <div className="max-w-3xl space-y-4">
          <details className="group rounded-xl border bg-card p-5 transition-colors [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-display text-base font-semibold text-foreground">
              <span>How does Avrasya Properties differ from conventional real estate agents?</span>
              <span className="ml-4 shrink-0 text-brass transition-transform group-open:rotate-180">
                ▾
              </span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              We operate exclusively as buy-side client fiduciaries rather than sales
              intermediaries. We do not accept undisclosed commissions or promote speculative
              inventory. Every property in our portfolio has undergone pre-clearance checks on title
              deeds, developer balance sheets, and SPK appraisal compliance.
            </p>
          </details>

          <details className="group rounded-xl border bg-card p-5 transition-colors [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-display text-base font-semibold text-foreground">
              <span>Are the prices shown on your website verified directly with developers?</span>
              <span className="ml-4 shrink-0 text-brass transition-transform group-open:rotate-180">
                ▾
              </span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Yes. All pricing is cross-referenced with developer price lists and recent transaction
              records. For projects offering installment schedules or cash payment discounts, our
              advisors negotiate directly on your behalf to obtain institutional-grade pricing.
            </p>
          </details>

          <details className="group rounded-xl border bg-card p-5 transition-colors [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-display text-base font-semibold text-foreground">
              <span>How is client capital protected before the Land Registry transfer?</span>
              <span className="ml-4 shrink-0 text-brass transition-transform group-open:rotate-180">
                ▾
              </span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Funds are held in secure escrow accounts and converted through official Central Bank
              DAB foreign exchange certificates. Payments are released only upon verification that
              the title deed (Tapu) is clean, unencumbered, and ready for notarized registration
              into the buyer's name.
            </p>
          </details>

          <details className="group rounded-xl border bg-card p-5 transition-colors [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-display text-base font-semibold text-foreground">
              <span>What ongoing management services are provided after the sale completes?</span>
              <span className="ml-4 shrink-0 text-brass transition-transform group-open:rotate-180">
                ▾
              </span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              We provide full turnkey post-acquisition support, including Turkish tax number
              issuance, bank account setup, utility connections, interior design management,
              corporate tenant leasing, and citizenship dossier coordination through accredited
              legal counsel.
            </p>
          </details>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
