import { ManagedPage } from "@/components/site/ManagedPage";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  Banknote,
  Building2,
  Calculator,
  CheckCircle2,
  FileText,
  HelpCircle,
  KeyRound,
  Percent,
  Receipt,
  ShieldAlert,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { CtaBand, Margin, PageIntro } from "@/components/site/Chrome";
import { meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/investment-in-turkiye")({
  head: () =>
    meta(
      "Buying Property in Türkiye · Clear Guide & Practical Steps",
      "Clear, comprehensive guide to buying property in Istanbul: step-by-step process, transparent taxes, rental strategies, and essential buyer protections.",
      "/investment-in-turkiye"
    ),
  component: () => <ManagedPage slug="investment-in-turkiye"><InvestmentPlaybook /></ManagedPage>,
});

type Strategy = {
  id: string;
  title: string;
  targetYield: string;
  horizon: string;
  profile: string;
  points: string[];
};

const STRATEGIES: Strategy[] = [
  {
    id: "residential",
    title: "Residential Rental Homes",
    targetYield: "6.5% – 8.0%",
    horizon: "5+ Years (0% Tax after 5 yrs)",
    profile:
      "Long-term corporate tenants, young professionals, and families in prime areas like Maslak, Ataşehir, and Bomonti.",
    points: [
      "Reliable, recurring rental income with standard 1-year renewable leases",
      "Low turnover and high demand from quality local and expat tenants",
      "100% tax-free capital gains when you sell after 5 years of ownership",
    ],
  },
  {
    id: "serviced",
    title: "Managed Serviced & Holiday Apartments",
    targetYield: "8.0% – 10.5%",
    horizon: "3 – 5 Years",
    profile:
      "Fully furnished apartments in vibrant lifestyle and central districts (Şişli, Taksim, Bomonti, Kadıköy).",
    points: [
      "Professionally managed by experienced hospitality teams—no daily management needed from you",
      "Potential for higher yields from visiting business travelers and holidaymakers",
      "Personal vacation use: enjoy staying in your own home for several weeks each year",
    ],
  },
  {
    id: "commercial",
    title: "Commercial & Retail Properties",
    targetYield: "7.5% – 9.0%",
    horizon: "7 – 10 Years",
    profile: "Street-level retail stores, corporate offices, and bank branches in busy commercial districts.",
    points: [
      "Long-term stable leases (typically 5 to 10 years) with established corporate tenants",
      "Tenants typically cover routine maintenance and building service charges",
      "Predictable income with contractual annual rent adjustments",
    ],
  },
];

const PHASES = [
  {
    stage: "01",
    title: "Understanding Your Goals & Legal Support",
    timeframe: "Week 1",
    desc: "We sit down to understand what you are looking for—whether a family home, rental income, or Turkish citizenship. You can appoint an independent, English-speaking lawyer to represent and protect you.",
  },
  {
    stage: "02",
    title: "Tax Number & Turkish Bank Account",
    timeframe: "Weeks 1–2",
    desc: "We help you obtain your Turkish tax identification number in minutes and open a secure account at a leading Turkish bank.",
  },
  {
    stage: "03",
    title: "Official Valuation & Legal Check",
    timeframe: "Weeks 2–3",
    desc: "A government-licensed expert appraises the home's market value, while your attorney verifies that the title deed is 100% clean, with zero debts or mortgages.",
  },
  {
    stage: "04",
    title: "Bank Transfer & Currency Certificate (DAB)",
    timeframe: "Week 3",
    desc: "You send your purchase funds safely to your Turkish bank account, which converts them through the Central Bank of Türkiye and issues the official currency certificate (DAB).",
  },
  {
    stage: "05",
    title: "Receiving Your Freehold Title Deed (Tapu)",
    timeframe: "Week 4",
    desc: "You or your attorney signs the transfer at the official Land Registry office, and you receive your permanent freehold title deed (Tapu).",
  },
  {
    stage: "06",
    title: "Key Handover & Move-In Setup",
    timeframe: "Post-closing",
    desc: "We conduct a room-by-room final inspection, hand over your keys, activate water and electricity, and assist with any furnishing you desire.",
  },
];

export function InvestmentPlaybook() {
  const [activeStrategy, setActiveStrategy] = useState("residential");

  const currentStrat = STRATEGIES.find((s) => s.id === activeStrategy)!;

  return (
    <>
      <PageIntro
        eyebrow="Property Buying Guide · Clear Steps & Practical Advice"
        title={
          <>
            Buying property in Türkiye: <em>a simple, secure guide.</em>
          </>
        }
      >
        <p>
          A clear, reassuring guide for international buyers and families. We break down the steps,
          costs, and legal protections so you can make confident, well-informed decisions.
        </p>
      </PageIntro>

      {/* Strategy Selector Tabs */}
      <section className="container-site py-16">
        <div className="mb-8">
          <p className="eyebrow">Investment Goals</p>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Find the Property Strategy That Suits You
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Compare potential rental returns, holding periods, and tenant types to choose what fits
            your lifestyle or financial goals.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Navigation Pill List */}
          <div className="space-y-3 lg:col-span-4">
            {STRATEGIES.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStrategy(s.id)}
                className={`w-full rounded-xl border p-5 text-left transition-all ${
                  activeStrategy === s.id
                    ? "border-brass bg-card shadow-sm ring-1 ring-brass"
                    : "border-border bg-card/50 hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-foreground">{s.title}</h3>
                  <span className="font-mono text-xs font-semibold text-brass">
                    {s.targetYield}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{s.horizon}</p>
              </button>
            ))}
          </div>

          {/* Active Strategy Detail Card */}
          <div className="rounded-2xl border bg-card p-6 lg:col-span-8 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-brass">
                    Strategy Profile
                  </span>
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    {currentStrat.title}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">Expected Net Return</span>
                  <span className="font-mono text-2xl font-bold text-brass">
                    {currentStrat.targetYield}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-foreground">Target Profile:</p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {currentStrat.profile}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  Key Features
                </p>
                {currentStrat.points.map((pt, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg border bg-background p-3 text-sm"
                  >
                    <CheckCircle2 className="h-5 w-5 text-brass shrink-0 mt-0.5" />
                    <span className="text-foreground leading-relaxed">{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">
                Recommended minimum holding period: <b>{currentStrat.horizon}</b>
              </span>
              <Link to="/properties" className="btn btn-primary w-full sm:w-auto">
                Browse Matching Opportunities
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Six Phase Step-by-Step Acquisition Journey */}
      <section className="border-t bg-ink text-on-dark py-20">
        <div className="container-site">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow text-brass">Step-by-Step Buying</p>
            <h2 className="font-display text-3xl font-semibold md:text-4xl text-on-dark">
              The 6 Simple Steps to Owning Property in Türkiye
            </h2>
            <p className="mt-3 text-on-dark-muted">
              From selecting your property to receiving your title deed, each step is clearly guided
              with independent legal protection.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PHASES.map((p) => (
              <div
                key={p.stage}
                className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-brass">{p.stage}</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-on-dark-muted">
                    {p.timeframe}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-on-dark">{p.title}</h3>
                <p className="mt-2 text-sm text-on-dark-muted leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Taxation Matrix */}
      <section className="container-site py-20">
        <div className="max-w-2xl mb-10">
          <p className="eyebrow">Clear Tax Rules</p>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Simple, Transparent Property Taxes
          </h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Property taxes in Türkiye are straightforward and among the lowest in Europe. Here are
            the three main taxes to know:
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-6">
            <div className="h-10 w-10 rounded-lg bg-brass/10 text-brass flex items-center justify-center mb-4">
              <Receipt className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Title Transfer Tax (Tapu Harcı)
            </h3>
            <p className="mt-1 font-mono text-xl font-bold text-brass">4.0%</p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              A one-time government fee paid when the title deed is officially transferred into your
              name. In many transactions, this is shared 2% by the buyer and 2% by the seller.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="h-10 w-10 rounded-lg bg-brass/10 text-brass flex items-center justify-center mb-4">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Annual Property Tax (Emlak Vergisi)
            </h3>
            <p className="mt-1 font-mono text-xl font-bold text-brass">0.2% per year</p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              A modest annual municipal tax paid in two easy installments (May and November). For
              Istanbul homes, it is just 0.2% of the official municipal value.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="h-10 w-10 rounded-lg bg-brass/10 text-brass flex items-center justify-center mb-4">
              <Banknote className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Zero Tax on Resale Profits (After 5 Years)
            </h3>
            <p className="mt-1 font-mono text-xl font-bold text-emerald-600">0% (After 5 Years)</p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              When you hold your property for 5 years or longer as an individual, 100% of your
              capital gain (profit) is completely tax-free under Turkish tax law.
            </p>
          </div>
        </div>
      </section>

      {/* Critical Red Flags & Pitfalls */}
      <Margin label="Buyer Protections">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 space-y-4">
          <div className="flex items-center gap-2 text-destructive font-semibold">
            <ShieldAlert className="h-5 w-5" />
            <span>Important Checks for a Safe Purchase</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-sm text-foreground">
            <div className="rounded-lg border bg-card p-4">
              <p className="font-semibold text-foreground">1. Building Completion Certificate (İskan)</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Always ensure the building has received its official completion certificate (İskan).
                A Kat Mülkiyeti title guarantees the building is 100% finished and approved by municipal
                authorities.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <p className="font-semibold text-foreground">2. Full Declared Value on Title Deed</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Ensure the full purchase amount is declared on your title deed and backed by your
                Central Bank certificate (DAB). This protects you completely for citizenship eligibility
                and future resale.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <p className="font-semibold text-foreground">3. Zoning & Military Clearances</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Foreign nationals can purchase anywhere except designated military security zones. We
                verify parcel records in advance so you can proceed with total peace of mind.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <p className="font-semibold text-foreground">4. Transparent Rental Guarantees</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                If a developer promises guaranteed rental returns, we review the exact terms with
                your attorney so you know exactly who pays the return and how it is secured.
              </p>
            </div>
          </div>
        </div>
      </Margin>

      <CtaBand />
    </>
  );
}
