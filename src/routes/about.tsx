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
  Users 
} from "lucide-react";
import { CtaBand, Margin, PageIntro } from "@/components/site/Chrome";
import { meta } from "@/components/site/TextPage";
import { CONTACT } from "@/data/properties";

export const Route = createFileRoute("/about")({
  head: () =>
    meta(
      "About Avrasya Properties · Istanbul Property Investment Consultancy",
      "Headquartered on Istanbul's historic Asian shore, Avrasya Properties provides institutional advisory and cross-border acquisition services for international private clients."
    ),
  component: AboutPage,
});

export function AboutPage() {
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
          Founded on Istanbul's Asian shoreline in Üsküdar overlooking the Bosphorus, Avrasya Properties bridges international capital with high-conviction Turkish real estate assets. We combine deep local market intelligence with institutional transparency.
        </p>
      </PageIntro>

      {/* Metrics Bar */}
      <section className="border-b bg-card py-8">
        <div className="container-site grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
          <div>
            <p className="font-display text-3xl font-bold text-brass md:text-4xl">$120M+</p>
            <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">Transaction Volume Advised</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-brass md:text-4xl">38+</p>
            <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">Nationalities Represented</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-brass md:text-4xl">100%</p>
            <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">CBI Compliance Success</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-brass md:text-4xl">14 Yrs</p>
            <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">Istanbul Market Tenure</p>
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
              For decades, international buyers navigating Istanbul's dynamic property landscape encountered fragmented information, undisclosed markups, and aggressive developer sales tactics.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Avrasya Properties was established to introduce an uncompromising standard of advisory. We believe property acquisition abroad should be as structured, documented, and secure as an institutional capital allocation.
            </p>
            <div className="pt-2">
              <p className="text-sm font-semibold text-foreground">Registered Office & Presence:</p>
              <p className="text-sm text-muted-foreground">{CONTACT.company}</p>
              <p className="text-sm text-muted-foreground">{CONTACT.address}</p>
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
              <div key={s.title} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <s.icon className="h-6 w-6 text-brass mb-3" />
                <h3 className="font-display text-lg font-semibold text-on-dark">{s.title}</h3>
                <p className="mt-2 text-sm text-on-dark-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="container-site py-20">
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
                {l.name.split(" ").map(n => n[0]).join("")}
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">{l.name}</h3>
              <p className="text-xs font-semibold uppercase tracking-wider text-brass mt-1">{l.role}</p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{l.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
