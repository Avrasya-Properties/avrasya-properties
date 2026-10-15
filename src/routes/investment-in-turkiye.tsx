import { ManagedPage } from "@/components/site/ManagedPage";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "@/hooks/useLanguage";
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

export function InvestmentPlaybook() {
  const { t } = useTranslation();
  const [activeStrategy, setActiveStrategy] = useState("residential");

  const STRATEGIES: Strategy[] = [
    {
      id: "residential",
      title: t.investment.strat1Title,
      targetYield: t.investment.strat1Yield,
      horizon: t.investment.strat1Horizon,
      profile: t.investment.strat1Profile,
      points: [t.investment.strat1Point1, t.investment.strat1Point2, t.investment.strat1Point3],
    },
    {
      id: "serviced",
      title: t.investment.strat2Title,
      targetYield: t.investment.strat2Yield,
      horizon: t.investment.strat2Horizon,
      profile: t.investment.strat2Profile,
      points: [t.investment.strat2Point1, t.investment.strat2Point2, t.investment.strat2Point3],
    },
    {
      id: "commercial",
      title: t.investment.strat3Title,
      targetYield: t.investment.strat3Yield,
      horizon: t.investment.strat3Horizon,
      profile: t.investment.strat3Profile,
      points: [t.investment.strat3Point1, t.investment.strat3Point2, t.investment.strat3Point3],
    },
  ];

  const PHASES = [
    {
      stage: "01",
      title: t.investment.step1Title,
      timeframe: "Week 1",
      desc: t.investment.step1Desc,
    },
    {
      stage: "02",
      title: t.investment.step2Title,
      timeframe: "Weeks 1–2",
      desc: t.investment.step2Desc,
    },
    {
      stage: "03",
      title: t.investment.step3Title,
      timeframe: "Weeks 2–3",
      desc: t.investment.step3Desc,
    },
    {
      stage: "04",
      title: t.investment.step4Title,
      timeframe: "Week 3",
      desc: t.investment.step4Desc,
    },
    {
      stage: "05",
      title: t.investment.step5Title,
      timeframe: "Week 4",
      desc: t.investment.step5Desc,
    },
    {
      stage: "06",
      title: t.investment.step6Title,
      timeframe: "Post-closing",
      desc: t.investment.step6Desc,
    },
  ];

  const currentStrat = STRATEGIES.find((s) => s.id === activeStrategy) || STRATEGIES[0]!;

  return (
    <>
      <PageIntro
        eyebrow={t.investment.eyebrow}
        title={
          <>
            {t.investment.title} <em>{t.investment.titleEm}</em>
          </>
        }
      >
        <p>{t.investment.description}</p>
      </PageIntro>

      {/* Strategy Selector Tabs */}
      <section className="container-site py-16">
        <div className="mb-8">
          <p className="eyebrow">{t.investment.strategiesEyebrow}</p>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            {t.investment.strategiesTitle}
          </h2>
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
            <p className="eyebrow text-brass">{t.investment.stepsEyebrow}</p>
            <h2 className="font-display text-3xl font-semibold md:text-4xl text-on-dark">
              {t.investment.stepsTitle}
            </h2>
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
          <p className="eyebrow">{t.investment.taxesEyebrow}</p>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            {t.investment.taxesTitle}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-6">
            <div className="h-10 w-10 rounded-lg bg-brass/10 text-brass flex items-center justify-center mb-4">
              <Receipt className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              {t.investment.tax1Title}
            </h3>
            <p className="mt-1 font-mono text-xl font-bold text-brass">4.0%</p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {t.investment.tax1Desc}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="h-10 w-10 rounded-lg bg-brass/10 text-brass flex items-center justify-center mb-4">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              {t.investment.tax2Title}
            </h3>
            <p className="mt-1 font-mono text-xl font-bold text-brass">0.2% per year</p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {t.investment.tax2Desc}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="h-10 w-10 rounded-lg bg-brass/10 text-brass flex items-center justify-center mb-4">
              <Banknote className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              {t.investment.tax3Title}
            </h3>
            <p className="mt-1 font-mono text-xl font-bold text-emerald-600">0% (5+ Yrs)</p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {t.investment.tax3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* Critical Red Flags & Pitfalls */}
      <Margin label={t.investment.redFlagsEyebrow}>
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 space-y-4">
          <div className="flex items-center gap-2 text-destructive font-semibold">
            <ShieldAlert className="h-5 w-5" />
            <span>{t.investment.redFlagsTitle}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 text-sm text-foreground">
            <div className="rounded-lg border bg-card p-4">
              <p className="font-semibold text-foreground">{t.investment.redFlag1Title}</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {t.investment.redFlag1Desc}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <p className="font-semibold text-foreground">{t.investment.redFlag2Title}</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {t.investment.redFlag2Desc}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <p className="font-semibold text-foreground">{t.investment.redFlag3Title}</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {t.investment.redFlag3Desc}
              </p>
            </div>
          </div>
        </div>
      </Margin>

      <CtaBand />
    </>
  );
}
