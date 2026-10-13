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
      "About Avrasya Properties · Trusted Istanbul Real Estate Advisory",
      "Headquartered on Istanbul's historic Asian shoreline, Avrasya Properties provides trusted, transparent property guidance for international home buyers and investors.",
      "/about"
    ),
  component: () => <ManagedPage slug="about"><AboutPage /></ManagedPage>,
});

export function AboutPage() {
  const contact = useLiveContact();
  const leadership = [
    {
      name: "Selin Arda",
      role: "Founder & Head of Property Advisory",
      desc: "14 years of experience guiding international buyers to prime residential and lifestyle homes across Istanbul's top European and Asian neighborhoods.",
    },
    {
      name: "Murat Kaya",
      role: "Head of International Client Advisory",
      desc: "Dedicated to making the buying experience smooth and straightforward, assisting clients worldwide with currency transfers, viewings, and property selection.",
    },
    {
      name: "Elif Demir",
      role: "Head of Legal & Title Due Diligence",
      desc: "Coordinates with independent certified attorneys, government-licensed appraisers, and migration authorities to keep your purchase 100% secure and stress-free.",
    },
  ];

  const standards = [
    {
      title: "Always on Your Side",
      desc: "We work exclusively for you, the buyer. We never push high-commission projects or risky developments; every property we suggest has verified market value and clean legal standing.",
      icon: Scale,
    },
    {
      title: "Independent Legal & Title Checks",
      desc: "Every home is thoroughly checked by independent, licensed attorneys so you can be 100% confident your property has a clean title deed with zero hidden debts or claims.",
      icon: ShieldCheck,
    },
    {
      title: "Safe Bank Transfers & Fair Rates",
      desc: "We guide you step-by-step through official Central Bank currency exchange (DAB) and bank transfers, ensuring your money is protected and converted at fair government rates.",
      icon: Globe2,
    },
    {
      title: "Care Even After You Move In",
      desc: "Our support continues long after you receive your keys: we assist with interior setup, utility connections, tenant management, and future resale.",
      icon: HeartHandshake,
    },
  ];

  return (
    <>
      <PageIntro
        eyebrow="About Avrasya Properties · Honest & Dedicated Advisory"
        title={
          <>
            Istanbul's trusted property consultancy: <em>built on integrity and care.</em>
          </>
        }
      >
        <p>
          Founded on Istanbul's Asian shoreline in Üsküdar overlooking the Bosphorus, Avrasya
          Properties makes buying property in Türkiye safe, transparent, and straightforward for
          international buyers. We pair deep neighborhood knowledge with honest, client-first advice.
        </p>
      </PageIntro>

      {/* Metrics Bar */}
      <section className="border-b bg-card py-8">
        <div className="container-site grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
          <div className="card-elevate rounded-xs p-3 transition-all hover:bg-secondary/40">
            <p className="font-display text-3xl font-bold text-brass md:text-4xl">$120M+</p>
            <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">
              Properties Guided
            </p>
          </div>
          <div className="card-elevate rounded-xs p-3 transition-all hover:bg-secondary/40">
            <p className="font-display text-3xl font-bold text-brass md:text-4xl">38+</p>
            <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">
              Countries Represented
            </p>
          </div>
          <div className="card-elevate rounded-xs p-3 transition-all hover:bg-secondary/40">
            <p className="font-display text-3xl font-bold text-brass md:text-4xl">100%</p>
            <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">
              Citizenship Success Rate
            </p>
          </div>
          <div className="card-elevate rounded-xs p-3 transition-all hover:bg-secondary/40">
            <p className="font-display text-3xl font-bold text-brass md:text-4xl">14 Yrs</p>
            <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">
              Local Market Experience
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
              Making Property Buying in Türkiye Clear & Reassuring
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For decades, international buyers navigating Istanbul's dynamic property landscape
              encountered fragmented information, undisclosed markups, and aggressive developer
              sales tactics.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Avrasya Properties was established to introduce an uncompromising standard of
              advisory. We believe purchasing a home abroad should feel calm, clear, and fully
              protected every step of the way.
            </p>
            <div className="pt-2">
              <p className="text-sm font-semibold text-foreground">Registered Office & Presence:</p>
              <p className="text-sm text-muted-foreground">{contact.company}</p>
              <p className="text-sm text-muted-foreground">{contact.address}</p>
            </div>
          </div>

          <div className="card-elevate img-zoom-container lg:col-span-5 overflow-hidden rounded-xs border bg-muted aspect-[4/3] group">
            <img
              src="/images/properties/bosphorus-terrace.jpg"
              alt="Bosphorus Istanbul"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* Advisory Principles */}
      <section className="border-t bg-ink text-on-dark py-20">
        <div className="container-site">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow text-brass">Our Core Commitments</p>
            <h2 className="font-display text-3xl font-semibold md:text-4xl text-on-dark">
              Four Commitments to Protect Every Buyer
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {standards.map((s) => (
              <div
                key={s.title}
                className="card-elevate rounded-xs border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-brass/50 hover:bg-white/8"
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
          <p className="eyebrow">Our Advisory Team</p>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Experienced Leadership Dedicated to Your Peace of Mind
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {leadership.map((l) => (
            <div key={l.name} className="card-elevate rounded-xs border border-border/80 bg-card p-6 shadow-xs hover:-translate-y-1 transition-all">
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

      {/* Legal & Verification Framework */}
      <section className="container-site py-20 border-b">
        <div className="max-w-2xl mb-12">
          <p className="eyebrow">Property Safety Checks</p>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            How We Protect Your Purchase
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Every home recommended by Avrasya Properties undergoes strict verification
            before you commit a single dollar.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="card-elevate rounded-xs border border-border/80 bg-card p-6 shadow-xs hover:-translate-y-1 transition-all">
            <div className="h-10 w-10 rounded-xs bg-brass/10 text-brass flex items-center justify-center mb-4">
              <Scale className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Clean Title Deed Verification
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              We verify every title deed directly at the Land Registry office, confirming you get
              full freehold ownership with zero mortgages, debts, or legal disputes.
            </p>
          </div>

          <div className="card-elevate rounded-xs border border-border/80 bg-card p-6 shadow-xs hover:-translate-y-1 transition-all">
            <div className="h-10 w-10 rounded-xs bg-brass/10 text-brass flex items-center justify-center mb-4">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Official Government Valuation
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Independent, government-licensed experts inspect and appraise the property, ensuring
              you pay a fair price and comfortably meet Turkish Citizenship guidelines.
            </p>
          </div>

          <div className="card-elevate rounded-xs border border-border/80 bg-card p-6 shadow-xs hover:-translate-y-1 transition-all">
            <div className="h-10 w-10 rounded-xs bg-brass/10 text-brass flex items-center justify-center mb-4">
              <Globe2 className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Official Central Bank Certificate (DAB)
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              We coordinate your currency conversion smoothly through the Central Bank of Türkiye,
              securing the official exchange certificate required for safe registration.
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
              overlooking the Bosphorus. We host private buyers and families for relaxed
              consultations, title examinations, and property tours.
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
                  Private meetings & chauffeured property viewings arranged upon request
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
            Common Questions From Home Buyers
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
              We work exclusively for you as a buyer's advisor, not as sales agents for developers.
              We never push high-commission projects or hidden markups. Every home we present has
              been vetted for clean legal title deeds, quality construction, and fair valuation.
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
              Yes. All pricing is checked directly with reputable developers and verified against
              official registries. When developers offer cash discounts or flexible payment plans,
              we negotiate directly on your behalf to secure the best possible terms.
            </p>
          </details>

          <details className="group rounded-xl border bg-card p-5 transition-colors [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-display text-base font-semibold text-foreground">
              <span>How is your money protected during the purchase?</span>
              <span className="ml-4 shrink-0 text-brass transition-transform group-open:rotate-180">
                ▾
              </span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Your funds remain secure in your own Turkish bank account and are converted safely
              through official Central Bank certificates (DAB). Payments are released only when your
              attorney confirms the title deed is completely clean, debt-free, and ready to be
              transferred to your name.
            </p>
          </details>

          <details className="group rounded-xl border bg-card p-5 transition-colors [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-display text-base font-semibold text-foreground">
              <span>What help do you provide after the purchase is complete?</span>
              <span className="ml-4 shrink-0 text-brass transition-transform group-open:rotate-180">
                ▾
              </span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              We stay with you for the long run. We help you obtain your tax number, open local bank
              accounts, connect utilities, furnish your home, manage rental income, and guide your
              Turkish Citizenship application from start to finish.
            </p>
          </details>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
