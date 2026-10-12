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
      "Investing in Türkiye · Master Real Estate Acquisition Playbook",
      "Comprehensive investment methodology, legal due diligence, tax structures, and rental yield benchmarks for international purchasers in Istanbul.",
    ),
  component: InvestmentPlaybook,
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
    title: "Prime Residential Buy-to-Let",
    targetYield: "6.5% – 8.0%",
    horizon: "5+ Years (0% CGT after 5 yrs)",
    profile:
      "Long-term corporate, expatriate, or affluent domestic tenants in Maslak, Ataşehir, and Bomonti.",
    points: [
      "Consistent recurring income pegged to annual CPI rental index caps",
      "Low turnover costs with 12-month advance or quarterly lease terms",
      "Strong secondary market liquidity when exiting to domestic or foreign buyers",
    ],
  },
  {
    id: "serviced",
    title: "Branded Hospitality & Short-Stay",
    targetYield: "8.0% – 10.5%",
    horizon: "3 – 5 Years",
    profile:
      "Turnkey hotel-serviced apartments in tourism and conference zones (Şişli, Taksim, Bomonti, Kadıköy).",
    points: [
      "Managed by professional hotel or boutique short-stay operators",
      "Revenues generated in hard currency (EUR/USD) from international travelers",
      "Owner usage rights (typically 14–30 days per annum for personal vacations)",
    ],
  },
  {
    id: "commercial",
    title: "Institutional Grade Commercial & Retail",
    targetYield: "7.5% – 9.0%",
    horizon: "7 – 10 Years",
    profile: "Ground-floor high-street bank branches, corporate headquarters, and retail units.",
    points: [
      "Long-term institutional leases (5, 10, or 15-year contracts)",
      "Triple Net (NNN) structures where tenant pays all maintenance and building charges",
      "Periodic contract reviews tied to foreign exchange or inflation indexes",
    ],
  },
];

const PHASES = [
  {
    stage: "01",
    title: "Brief Definition & Legal Counsel",
    timeframe: "Week 1",
    desc: "Establish clear investment objectives (capital growth vs income yield vs CBI). Appoint an independent Turkish bar-certified real estate attorney with limited power of attorney (POA).",
  },
  {
    stage: "02",
    title: "Tax Registration & Bank Account",
    timeframe: "Week 1–2",
    desc: "Obtain a Turkish Foreigner Tax Identification Number (Vergi Kimlik Numarası) and establish a dedicated account at a Tier-1 Turkish depository bank (Garanti BBVA, İşbank, Yapı Kredi).",
  },
  {
    stage: "03",
    title: "SPK Valuation & Due Diligence",
    timeframe: "Week 2–3",
    desc: "Independent appraisal by a Capital Markets Board (SPK) licensed valuer. Full title deed search at the Land Registry to confirm clear title with zero encumbrances, liens (ipotek), or judicial seizures (haciz).",
  },
  {
    stage: "04",
    title: "Central Bank DAB FX Certificate",
    timeframe: "Week 3",
    desc: "Inbound wire transfer of foreign currency funds converted to TRY via the Central Bank of Türkiye (TCMB) to produce the statutory Döviz Alım Belgesi (DAB).",
  },
  {
    stage: "05",
    title: "Title Deed Transfer at Tapu Office",
    timeframe: "Week 4",
    desc: "Execution of the official title deed transfer at the Directorate of Land Registry. Settlement of title deed fees and receipt of the red-bordered freehold Tapu senedi.",
  },
  {
    stage: "06",
    title: "Handover, Iskan & Management",
    timeframe: "Post-closing",
    desc: "Physical unit inspection, verification of the building habitation certificate (İskan), DASK earthquake insurance enrollment, and utility meter activation.",
  },
];

export function InvestmentPlaybook() {
  const [activeStrategy, setActiveStrategy] = useState("residential");

  const currentStrat = STRATEGIES.find((s) => s.id === activeStrategy)!;

  return (
    <>
      <PageIntro
        eyebrow="Due Diligence · Legal Framework · Fiscal Strategy"
        title={
          <>
            Investing in Turkish real estate: <em>the master methodology.</em>
          </>
        }
      >
        <p>
          A methodical, institutional framework for foreign individuals, family offices, and
          cross-border buyers. Clear risk isolation, documented costs, and transparent legal due
          diligence.
        </p>
      </PageIntro>

      {/* Strategy Selector Tabs */}
      <section className="container-site py-16">
        <div className="mb-8">
          <p className="eyebrow">Investment Objectives</p>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Select Your Target Asset Strategy
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Compare expected yields, holding horizons, and tenant profiles across primary asset
            classes.
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
                  <span className="text-xs text-muted-foreground block">Net Yield Benchmark</span>
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
                  Key Operational Characteristics
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
            <p className="eyebrow text-brass">Transaction Security</p>
            <h2 className="font-display text-3xl font-semibold md:text-4xl text-on-dark">
              End-to-End Acquisition Protocol
            </h2>
            <p className="mt-3 text-on-dark-muted">
              Every stage is coordinated with client approval, verified documentation, and
              independent professional sign-off.
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
          <p className="eyebrow">Fiscal Architecture</p>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Key Tax Rules for International Buyers
          </h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Turkish property taxation is straightforward and competitive compared to Western
            European destinations.
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
              Assessed on declared sales value at the Land Registry. Customarily split 2% buyer and
              2% seller, though contract terms dictate allocation.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="h-10 w-10 rounded-lg bg-brass/10 text-brass flex items-center justify-center mb-4">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Annual Municipal Tax (Emlak Vergisi)
            </h3>
            <p className="mt-1 font-mono text-xl font-bold text-brass">0.2% p.a.</p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Paid biannually in May and November to the local municipality (Belediye). Istanbul
              residential rate is 0.2% of the municipal tax valuation.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="h-10 w-10 rounded-lg bg-brass/10 text-brass flex items-center justify-center mb-4">
              <Banknote className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Capital Gains Tax Exemption
            </h3>
            <p className="mt-1 font-mono text-xl font-bold text-emerald-600">0% (After 5 Years)</p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Under Turkish Income Tax Law Article 80, capital gains realized by individual natural
              persons after holding real estate for 5 complete calendar years are 100% tax-exempt.
            </p>
          </div>
        </div>
      </section>

      {/* Critical Red Flags & Pitfalls */}
      <Margin label="Risk Mitigation">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 space-y-4">
          <div className="flex items-center gap-2 text-destructive font-semibold">
            <ShieldAlert className="h-5 w-5" />
            <span>Essential Foreign Purchaser Due Diligence Rules</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-sm text-foreground">
            <div className="rounded-lg border bg-card p-4">
              <p className="font-semibold text-foreground">1. Kat İrtifakı vs Kat Mülkiyeti</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Always confirm whether the building has acquired its final Habitation Certificate
                (İskan). Kat Mülkiyeti title represents completed, legally cleared residential
                units.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <p className="font-semibold text-foreground">2. Declared Value Integrity</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Ensure the value recorded on the Title Deed matches the actual money transferred
                through the Central Bank DAB document. Under-declaration jeopardizes citizenship and
                future resale calculations.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <p className="font-semibold text-foreground">3. Military & Restricted Zone Checks</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Foreign nationals cannot acquire property within sensitive security zones. We verify
                parcel registry numbers prior to taking any financial deposits.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <p className="font-semibold text-foreground">4. Developer Guaranteed Yields</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Promotional developer "guaranteed returns" must be reviewed by independent legal
                counsel to verify whether guarantees are backed by bank collateral or merely
                marketing subsidies.
              </p>
            </div>
          </div>
        </div>
      </Margin>

      <CtaBand />
    </>
  );
}
