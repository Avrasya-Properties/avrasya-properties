import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle2,
  Coins,
  Copy,
  DollarSign,
  FileCheck2,
  HelpCircle,
  Info,
  Landmark,
  MessageSquare,
  Percent,
  Scale,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { AcquisitionCalculator } from "@/components/site/AcquisitionCalculator";
import { PageIntro } from "@/components/site/Chrome";
import { meta } from "@/components/site/TextPage";
import { useWhatsAppLink } from "@/hooks/useLiveContact";
import { useCurrency, useLiveRates, type SupportedCurrency } from "@/hooks/usePreferences";
import { useSiteSettings } from "@/admin/store";

export const Route = createFileRoute("/calculator")({
  head: () =>
    meta(
      "Istanbul Property Acquisition & Investment Calculator · Avrasya Properties",
      "Model all-in title deed (Tapu) transfer taxes, foreigner VAT exemption (Law No. 3065), rental yields, and Turkish Citizenship ($400,000 CBI) outlay with complete statutory accuracy."
    ),
  component: CalculatorPage,
});

export function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<"closing" | "yield" | "cbi" | "holding">("closing");
  const waLink = useWhatsAppLink();
  const settings = useSiteSettings();
  const [currency] = useCurrency();
  const { rates } = useLiveRates();
  const currentRate = rates[currency] || 1;
  const currencySymbol =
    currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "TRY" ? "₺" : "£";

  const formatCurr = (valUsd: number) => {
    const converted = Math.round(valUsd * currentRate);
    return `${currencySymbol}${converted.toLocaleString("en-US")}`;
  };

  // State for Rental Yield Calculator
  const [yieldPriceUsd, setYieldPriceUsd] = useState<number>(550000);
  const [grossYieldPct, setGrossYieldPct] = useState<number>(7.2);
  const [mgmtFeePct, setMgmtFeePct] = useState<number>(10);
  const [annualDaskUsd, setAnnualDaskUsd] = useState<number>(180);
  const [monthlyAidatUsd, setMonthlyAidatUsd] = useState<number>(200);

  const annualGrossRentUsd = Math.round(yieldPriceUsd * (grossYieldPct / 100));
  const monthlyGrossRentUsd = Math.round(annualGrossRentUsd / 12);
  const annualMgmtCostUsd = Math.round(annualGrossRentUsd * (mgmtFeePct / 100));
  const annualAidatCostUsd = monthlyAidatUsd * 12;
  const totalAnnualExpensesUsd = annualMgmtCostUsd + annualAidatCostUsd + annualDaskUsd;
  const annualNetRentUsd = Math.max(0, annualGrossRentUsd - totalAnnualExpensesUsd);
  const monthlyNetCashFlowUsd = Math.round(annualNetRentUsd / 12);
  const netYieldPct = ((annualNetRentUsd / yieldPriceUsd) * 100).toFixed(2);
  const threeYearCumulativeCashFlowUsd = annualNetRentUsd * 3;
  const fiveYearCumulativeCashFlowUsd = annualNetRentUsd * 5;

  // State for CBI Outlay Calculator
  const [cbiPropertyPriceUsd, setCbiPropertyPriceUsd] = useState<number>(450000);
  const [includeSpouse, setIncludeSpouse] = useState<boolean>(true);
  const [childCount, setChildCount] = useState<number>(2);

  const cbiThreshold = settings.cbiThresholdUsd;
  const isCbiEligible = cbiPropertyPriceUsd >= cbiThreshold;
  const cbiDeficit = Math.max(0, cbiThreshold - cbiPropertyPriceUsd);
  const totalApplicants = 1 + (includeSpouse ? 1 : 0) + childCount;

  // Statutory CBI Costs
  const spkAppraisalCbiUsd = 1200;
  const dabNotaryCbiUsd = 1500;
  const legalCounselCbiUsd = 6500;
  const govtFilingPerPersonUsd = 850;
  const biometricCardPerPersonUsd = 350;
  const passportIssuancePerPersonUsd = 320;

  const totalGovtPerPerson = govtFilingPerPersonUsd + biometricCardPerPersonUsd + passportIssuancePerPersonUsd;
  const totalFamilyGovtFeesUsd = totalApplicants * totalGovtPerPerson;
  const tapuTransferFeeCbiUsd = Math.round(cbiPropertyPriceUsd * 0.04);
  const totalCbiProcessingUsd =
    spkAppraisalCbiUsd + dabNotaryCbiUsd + legalCounselCbiUsd + totalFamilyGovtFeesUsd + tapuTransferFeeCbiUsd;
  const grandTotalCbiOutlayUsd = cbiPropertyPriceUsd + totalCbiProcessingUsd;

  // State for Ongoing Holding Costs
  const [holdingPriceUsd, setHoldingPriceUsd] = useState<number>(500000);
  const [holdingAidatMonthlyUsd, setHoldingAidatMonthlyUsd] = useState<number>(220);
  const annualEmlakVergisiUsd = Math.round(holdingPriceUsd * 0.002); // 0.2% metropolitan Istanbul
  const annualDaskHoldingUsd = 180;
  const annualAidatHoldingUsd = holdingAidatMonthlyUsd * 12;
  const totalAnnualHoldingCostUsd = annualEmlakVergisiUsd + annualDaskHoldingUsd + annualAidatHoldingUsd;
  const monthlyHoldingReserveUsd = Math.round(totalAnnualHoldingCostUsd / 12);

  const [copiedLedger, setCopiedLedger] = useState(false);
  const copyYieldSummary = () => {
    const text = `AVRASYA PROPERTIES — RENTAL YIELD & CASH FLOW PROJECTION
Property Valuation: $${yieldPriceUsd.toLocaleString()} USD
Gross Annual Yield: ${grossYieldPct}% ($${annualGrossRentUsd.toLocaleString()} USD/yr)
Monthly Gross Rent: $${monthlyGrossRentUsd.toLocaleString()} USD/mo
Management Fee (${mgmtFeePct}%): $${annualMgmtCostUsd.toLocaleString()} USD/yr
Building Aidat & DASK: $${(annualAidatCostUsd + annualDaskUsd).toLocaleString()} USD/yr
NET ANNUAL CASH FLOW: $${annualNetRentUsd.toLocaleString()} USD/yr ($${monthlyNetCashFlowUsd.toLocaleString()} USD/mo)
NET ANNUAL YIELD: ${netYieldPct}%
3-Year Cumulative Net Yield: $${threeYearCumulativeCashFlowUsd.toLocaleString()} USD`;
    navigator.clipboard.writeText(text);
    setCopiedLedger(true);
    setTimeout(() => setCopiedLedger(false), 2500);
  };

  return (
    <div className="bg-background min-h-screen pb-24">
      <PageIntro
        eyebrow="Financial Transparency · Statutory Closing Ledger"
        title="Istanbul Property Acquisition & Investment Calculator"
        description="Calculate statutory title deed (Tapu) closing taxes, Foreigner VAT exemptions under Law No. 3065, rental yields, and complete Turkish Citizenship ($400,000 CBI) outlay with zero broker surprises."
      />

      <div className="container-site pt-10">
        {/* Navigation Selector Bar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border/80 pb-6 mb-10">
          {[
            {
              id: "closing",
              label: "Tapu & Acquisition Closing Costs",
              icon: Scale,
              badge: "Law No. 4721",
            },
            {
              id: "yield",
              label: "Rental Yield & Cash Flow Forecast",
              icon: TrendingUp,
              badge: "Net ROI",
            },
            {
              id: "cbi",
              label: "Citizenship by Investment (CBI) Outlay",
              icon: ShieldCheck,
              badge: "$400,000 Threshold",
            },
            {
              id: "holding",
              label: "Annual Ownership & Holding Costs",
              icon: Landmark,
              badge: "Emlak Vergisi",
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`group flex items-center gap-2.5 rounded-xs border px-4 py-3 text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? "border-brass bg-primary text-on-dark shadow-md"
                    : "border-border/80 bg-card text-foreground hover:border-brass/40 hover:bg-secondary/40"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-brass" : "text-muted-foreground group-hover:text-brass"}`} />
                <span>{tab.label}</span>
                <span
                  className={`hidden sm:inline-block rounded px-1.5 py-0.5 text-[10px] font-mono ${
                    isActive ? "bg-brass/20 text-brass" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Acquisition & Closing Cost Ledger */}
        {activeTab === "closing" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <AcquisitionCalculator />

            {/* Statutory Regulation Guidance Notes */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="card-elevate rounded-xs border border-border/80 bg-card p-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-brass mb-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Land Registry Law No. 4721</span>
                </div>
                <h4 className="font-display font-semibold text-foreground text-sm">4% Statutory Tapu Harcı</h4>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  Turkish law stipulates a 4% title deed transfer fee based on declared value. While primary developers
                  often split this 2% buyer / 2% seller, secondary resales typically require the buyer to bear 100%.
                </p>
              </div>

              <div className="card-elevate rounded-xs border border-border/80 bg-card p-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-brass mb-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Law No. 3065 (VAT Exemption)</span>
                </div>
                <h4 className="font-display font-semibold text-foreground text-sm">0% VAT for Foreign Capital</h4>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  Foreign buyers bringing foreign currency directly into Turkey are eligible for 0% VAT exemption on first-hand
                  developer purchases, saving 1% to 20% in purchase taxes when held for at least 3 years.
                </p>
              </div>

              <div className="card-elevate rounded-xs border border-border/80 bg-card p-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-brass mb-2">
                  <Landmark className="h-4 w-4" />
                  <span>TCMB Currency Certificate</span>
                </div>
                <h4 className="font-display font-semibold text-foreground text-sm">DAB Foreign Exchange (DÖVİZ)</h4>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  Foreign currency must be transferred to the Central Bank of the Republic of Türkiye (TCMB) via an authorized
                  Turkish bank to generate the mandatory Döviz Alım Belgesi (DAB) prior to title conveyance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Rental Yield & Cash Flow Forecast */}
        {activeTab === "yield" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="card-elevate rounded-xs border border-border/80 bg-card p-6 md:p-10 shadow-xl">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border/70 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-brass/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-brass-text">
                      Investment Return Analysis
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">USD / EUR Leases</span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                    Rental Yield & Cash Flow Forecaster
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Model net yields after property management, tenant placement, building dues (Aidat), and compulsory DASK insurance.
                  </p>
                </div>
                <button
                  onClick={copyYieldSummary}
                  className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground hover:border-brass transition-colors self-start md:self-auto"
                >
                  <Copy className="h-3.5 w-3.5 text-brass" />
                  <span>{copiedLedger ? "Ledger Copied!" : "Copy Projection"}</span>
                </button>
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
                {/* Inputs Column */}
                <div className="space-y-6">
                  {/* Property Valuation */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground uppercase tracking-wider">Property Valuation</span>
                      <span className="font-mono text-base font-bold text-foreground">
                        ${yieldPriceUsd.toLocaleString()} USD ({formatCurr(yieldPriceUsd)})
                      </span>
                    </div>
                    <input
                      type="range"
                      min={200000}
                      max={3000000}
                      step={25000}
                      value={yieldPriceUsd}
                      onChange={(e) => setYieldPriceUsd(Number(e.target.value))}
                      className="range-luxury mt-3 w-full"
                    />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {[350000, 450000, 650000, 1000000, 1750000].map((val) => (
                        <button
                          key={val}
                          onClick={() => setYieldPriceUsd(val)}
                          className={`rounded px-2.5 py-1 text-[11px] font-mono transition-colors ${
                            yieldPriceUsd === val
                              ? "bg-brass text-primary font-bold"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          ${val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}K`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gross Yield Percentage */}
                  <div className="border-t border-border/60 pt-5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground uppercase tracking-wider">Projected Gross Yield</span>
                      <span className="font-mono text-base font-bold text-brass">{grossYieldPct}% / year</span>
                    </div>
                    <input
                      type="range"
                      min={4.0}
                      max={11.0}
                      step={0.1}
                      value={grossYieldPct}
                      onChange={(e) => setGrossYieldPct(Number(e.target.value))}
                      className="range-luxury mt-3 w-full"
                    />
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      Prime Istanbul Bosphorus & Central Corridors typically yield 6.5% – 8.5% on corporate tenancies.
                    </p>
                  </div>

                  {/* Deductions & Operating Expenses */}
                  <div className="border-t border-border/60 pt-5 space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Operating Deductions & Maintenance
                    </h4>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-foreground">Turnkey Property Management Fee</span>
                        <span className="font-mono text-xs">{mgmtFeePct}% (${annualMgmtCostUsd.toLocaleString()}/yr)</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={15}
                        step={1}
                        value={mgmtFeePct}
                        onChange={(e) => setMgmtFeePct(Number(e.target.value))}
                        className="range-luxury mt-2 w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-foreground block font-medium">Monthly Site Aidat (Dues)</label>
                        <div className="mt-1.5 flex items-center rounded border border-border bg-background px-3 py-1.5">
                          <span className="text-xs text-muted-foreground mr-1">$</span>
                          <input
                            type="number"
                            min={50}
                            max={1000}
                            value={monthlyAidatUsd}
                            onChange={(e) => setMonthlyAidatUsd(Number(e.target.value))}
                            className="w-full bg-transparent text-xs font-mono font-semibold focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-foreground block font-medium">Annual DASK Insurance</label>
                        <div className="mt-1.5 flex items-center rounded border border-border bg-background px-3 py-1.5">
                          <span className="text-xs text-muted-foreground mr-1">$</span>
                          <input
                            type="number"
                            min={50}
                            max={600}
                            value={annualDaskUsd}
                            onChange={(e) => setAnnualDaskUsd(Number(e.target.value))}
                            className="w-full bg-transparent text-xs font-mono font-semibold focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Column */}
                <div className="rounded-xs border border-border/80 bg-background/60 p-6 flex flex-col justify-between">
                  <div className="space-y-5">
                    <p className="eyebrow !text-brass">Net Return Summary</p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xs bg-card border border-border/70 p-4">
                        <p className="text-[11px] text-muted-foreground uppercase font-medium">Monthly Gross Rent</p>
                        <p className="font-display text-2xl font-semibold text-foreground mt-1">
                          ${monthlyGrossRentUsd.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatCurr(monthlyGrossRentUsd)}/mo</p>
                      </div>

                      <div className="rounded-xs bg-card border border-border/70 p-4">
                        <p className="text-[11px] text-muted-foreground uppercase font-medium">Annual Gross Rent</p>
                        <p className="font-display text-2xl font-semibold text-foreground mt-1">
                          ${annualGrossRentUsd.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatCurr(annualGrossRentUsd)}/yr</p>
                      </div>
                    </div>

                    <div className="rounded-xs border border-brass/40 bg-brass/5 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-brass">Net Annual Rental Return</p>
                          <p className="font-display text-3xl font-bold text-foreground mt-1">
                            ${annualNetRentUsd.toLocaleString()} <span className="text-sm font-sans font-normal text-muted-foreground">USD/yr</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Net Monthly Cash Flow: <strong className="text-foreground">${monthlyNetCashFlowUsd.toLocaleString()} USD</strong> ({formatCurr(monthlyNetCashFlowUsd)})
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-muted-foreground uppercase font-medium">Net Cap Rate</p>
                          <p className="font-display text-3xl font-bold text-brass mt-1">{netYieldPct}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border/70 pt-4 space-y-2 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Total Annual Operating Overhead</span>
                        <span className="font-mono text-foreground font-semibold">-${totalAnnualExpensesUsd.toLocaleString()} USD</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>3-Year Holding Total Cash Flow</span>
                        <span className="font-mono text-brass font-semibold">${threeYearCumulativeCashFlowUsd.toLocaleString()} USD</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>5-Year Cumulative Net Yield</span>
                        <span className="font-mono text-foreground font-semibold">${fiveYearCumulativeCashFlowUsd.toLocaleString()} USD</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-border/70">
                    <a
                      href={waLink(`Hello Avrasya Properties, I modelled a $${yieldPriceUsd.toLocaleString()} USD property with a ${grossYieldPct}% target rental yield ($${monthlyGrossRentUsd.toLocaleString()}/mo). Please share high-yield verified listings.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary w-full justify-center gap-2 btn-shimmer"
                    >
                      <MessageSquare className="h-4 w-4 text-brass" />
                      <span>Request High-Yield Portfolio Listings</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Turkish Citizenship by Investment (CBI) Outlay */}
        {activeTab === "cbi" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="card-elevate rounded-xs border border-border/80 bg-card p-6 md:p-10 shadow-xl">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border/70 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-brass/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-brass-text">
                      Turkish Citizenship Program
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">Law No. 5901</span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                    CBI Family Outlay & Processing Ledger
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Calculate full government filing, ministry biometrics, certified SPK appraisal, and family legal fees for the $400,000 threshold.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`rounded-xs px-3 py-1.5 text-xs font-semibold ${
                    isCbiEligible ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30" : "bg-destructive/10 text-destructive border border-destructive/30"
                  }`}>
                    {isCbiEligible ? "✓ Meets $400,000 Requirement" : `Deficit: $${cbiDeficit.toLocaleString()} USD`}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
                {/* Inputs Column */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground uppercase tracking-wider">Qualifying Property Value</span>
                      <span className="font-mono text-base font-bold text-foreground">
                        ${cbiPropertyPriceUsd.toLocaleString()} USD
                      </span>
                    </div>
                    <input
                      type="range"
                      min={350000}
                      max={2000000}
                      step={25000}
                      value={cbiPropertyPriceUsd}
                      onChange={(e) => setCbiPropertyPriceUsd(Number(e.target.value))}
                      className="range-luxury mt-3 w-full"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => setCbiPropertyPriceUsd(400000)}
                        className={`rounded px-2.5 py-1 text-[11px] font-mono transition-colors ${
                          cbiPropertyPriceUsd === 400000 ? "bg-brass text-primary font-bold" : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        $400,000 (Min CBI)
                      </button>
                      <button
                        onClick={() => setCbiPropertyPriceUsd(450000)}
                        className={`rounded px-2.5 py-1 text-[11px] font-mono transition-colors ${
                          cbiPropertyPriceUsd === 450000 ? "bg-brass text-primary font-bold" : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        $450,000 (Buffer)
                      </button>
                      <button
                        onClick={() => setCbiPropertyPriceUsd(650000)}
                        className={`rounded px-2.5 py-1 text-[11px] font-mono transition-colors ${
                          cbiPropertyPriceUsd === 650000 ? "bg-brass text-primary font-bold" : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        $650,000
                      </button>
                    </div>
                  </div>

                  {/* Family Composition Selector */}
                  <div className="border-t border-border/60 pt-5 space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Family Composition ({totalApplicants} Applicants)
                    </h4>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-xs border border-border/70 bg-card p-3.5">
                        <div>
                          <p className="text-xs font-semibold text-foreground">Primary Investor</p>
                          <p className="text-[11px] text-muted-foreground">Principal applicant & title deed owner</p>
                        </div>
                        <span className="font-mono text-xs font-bold text-brass">1 (Mandatory)</span>
                      </div>

                      <div className="flex items-center justify-between rounded-xs border border-border/70 bg-card p-3.5">
                        <div>
                          <p className="text-xs font-semibold text-foreground">Spouse</p>
                          <p className="text-[11px] text-muted-foreground">Legally registered spouse included in joint decree</p>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeSpouse}
                            onChange={(e) => setIncludeSpouse(e.target.checked)}
                            className="h-4 w-4 rounded border-border text-brass focus:ring-brass"
                          />
                          <span className="text-xs font-semibold">{includeSpouse ? "Included" : "Excluded"}</span>
                        </label>
                      </div>

                      <div className="flex items-center justify-between rounded-xs border border-border/70 bg-card p-3.5">
                        <div>
                          <p className="text-xs font-semibold text-foreground">Minor Children (&lt;18 Years Old)</p>
                          <p className="text-[11px] text-muted-foreground">Underage children acquire citizenship automatically</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {[0, 1, 2, 3, 4].map((cnt) => (
                            <button
                              key={cnt}
                              onClick={() => setChildCount(cnt)}
                              className={`h-7 w-7 rounded font-mono text-xs font-semibold transition-colors ${
                                childCount === cnt ? "bg-brass text-primary font-bold" : "bg-secondary text-muted-foreground"
                              }`}
                            >
                              {cnt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown Table */}
                <div className="rounded-xs border border-border/80 bg-background/60 p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <p className="eyebrow !text-brass">Itemized Statutory Outlay</p>

                    <div className="divide-y divide-border/60 text-xs">
                      <div className="py-2.5 flex justify-between">
                        <span className="text-foreground">Base Qualifying Property</span>
                        <span className="font-mono font-semibold">${cbiPropertyPriceUsd.toLocaleString()} USD</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="text-muted-foreground">Title Deed Transfer Tax (4% Tapu)</span>
                        <span className="font-mono">${tapuTransferFeeCbiUsd.toLocaleString()} USD</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="text-muted-foreground">SPK Certified Appraisal Audit</span>
                        <span className="font-mono">${spkAppraisalCbiUsd.toLocaleString()} USD</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="text-muted-foreground">TCMB DAB Exchange Certificate & Notary</span>
                        <span className="font-mono">${dabNotaryCbiUsd.toLocaleString()} USD</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="text-muted-foreground">
                          Govt Ministry Filings & Passports ({totalApplicants} pax)
                        </span>
                        <span className="font-mono">${totalFamilyGovtFeesUsd.toLocaleString()} USD</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="text-muted-foreground">Bar-Certified Attorney Family Retainer</span>
                        <span className="font-mono">${legalCounselCbiUsd.toLocaleString()} USD</span>
                      </div>
                    </div>

                    <div className="rounded-xs border border-brass/40 bg-brass/10 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-brass uppercase">Total All-In Family Outlay</p>
                          <p className="font-display text-3xl font-bold text-foreground mt-1">
                            ${grandTotalCbiOutlayUsd.toLocaleString()} <span className="text-sm font-sans font-normal text-muted-foreground">USD</span>
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            All government fees, legal diligence, taxes & passports included for {totalApplicants} people.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-border/70 flex flex-col gap-2.5">
                    <a
                      href={waLink(`Hello Avrasya Properties, I modelled Turkish Citizenship by Investment for ${totalApplicants} family members with a budget of $${cbiPropertyPriceUsd.toLocaleString()} USD. I would like to review qualifying verified properties.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary w-full justify-center gap-2 btn-shimmer"
                    >
                      <MessageSquare className="h-4 w-4 text-brass" />
                      <span>Consult Citizenship Legal Team</span>
                    </a>
                    <Link
                      to="/citizenship"
                      className="btn btn-outline w-full justify-center text-xs"
                    >
                      Read Complete CBI Legal Roadmap & Requirements →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Ongoing Annual Holding Costs */}
        {activeTab === "holding" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="card-elevate rounded-xs border border-border/80 bg-card p-6 md:p-10 shadow-xl">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border/70 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-brass/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-brass-text">
                      Post-Acquisition Carrying Costs
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">Istanbul Metropolitan Municipality</span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                    Annual Property Tax & Holding Cost Ledger
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Estimate annual municipal taxes (Emlak Vergisi), residential site maintenance (Aidat), and disaster insurance.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
                {/* Inputs Column */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground uppercase tracking-wider">Property Value</span>
                      <span className="font-mono text-base font-bold text-foreground">
                        ${holdingPriceUsd.toLocaleString()} USD
                      </span>
                    </div>
                    <input
                      type="range"
                      min={200000}
                      max={2500000}
                      step={25000}
                      value={holdingPriceUsd}
                      onChange={(e) => setHoldingPriceUsd(Number(e.target.value))}
                      className="range-luxury mt-3 w-full"
                    />
                  </div>

                  <div className="border-t border-border/60 pt-5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground uppercase tracking-wider">Monthly Building Complex Dues (Aidat)</span>
                      <span className="font-mono text-base font-bold text-brass">${holdingAidatMonthlyUsd} USD/mo</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={800}
                      step={10}
                      value={holdingAidatMonthlyUsd}
                      onChange={(e) => setHoldingAidatMonthlyUsd(Number(e.target.value))}
                      className="range-luxury mt-3 w-full"
                    />
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      Luxury branded residences in Istanbul (with concierge, indoor pools, gym, and 24/7 security) average $1.50 - $2.50 / m² per month.
                    </p>
                  </div>
                </div>

                {/* Summary Column */}
                <div className="rounded-xs border border-border/80 bg-background/60 p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <p className="eyebrow !text-brass">Annual Carrying Cost Breakdown</p>

                    <div className="divide-y divide-border/60 text-xs">
                      <div className="py-3 flex justify-between">
                        <div>
                          <p className="font-semibold text-foreground">Municipal Property Tax (Emlak Vergisi)</p>
                          <p className="text-[11px] text-muted-foreground">0.2% for Istanbul Metropolitan area</p>
                        </div>
                        <span className="font-mono font-semibold">${annualEmlakVergisiUsd.toLocaleString()} USD/yr</span>
                      </div>

                      <div className="py-3 flex justify-between">
                        <div>
                          <p className="font-semibold text-foreground">Annual Building Aidat (Dues)</p>
                          <p className="text-[11px] text-muted-foreground">${holdingAidatMonthlyUsd} USD × 12 months</p>
                        </div>
                        <span className="font-mono font-semibold">${annualAidatHoldingUsd.toLocaleString()} USD/yr</span>
                      </div>

                      <div className="py-3 flex justify-between">
                        <div>
                          <p className="font-semibold text-foreground">Compulsory Earthquake Insurance (DASK)</p>
                          <p className="text-[11px] text-muted-foreground">Government statutory natural disaster pool</p>
                        </div>
                        <span className="font-mono font-semibold">${annualDaskHoldingUsd} USD/yr</span>
                      </div>
                    </div>

                    <div className="rounded-xs border border-brass/40 bg-brass/10 p-4">
                      <p className="text-xs font-bold text-brass uppercase">Total Annual Holding Cost</p>
                      <p className="font-display text-3xl font-bold text-foreground mt-1">
                        ${totalAnnualHoldingCostUsd.toLocaleString()} <span className="text-sm font-sans font-normal text-muted-foreground">USD/yr</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Monthly Operating Reserve: <strong className="text-foreground">${monthlyHoldingReserveUsd} USD/mo</strong> ({formatCurr(monthlyHoldingReserveUsd)})
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-border/70">
                    <Link
                      to="/services"
                      className="btn btn-primary w-full justify-center gap-2 btn-shimmer"
                    >
                      <span>Explore Turnkey Property Management Services</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Bottom Advisory Callout */}
        <div className="mt-16 rounded-xs border border-border/80 bg-primary p-8 md:p-12 text-on-dark shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brass/40 bg-brass/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brass">
              <ShieldCheck className="h-3.5 w-3.5 text-brass" /> Direct Legal & Advisory Desk
            </span>
            <h3 className="headline mt-4 text-2xl md:text-3xl text-on-dark">
              Need tailored financial modeling for a specific Istanbul property?
            </h3>
            <p className="mt-3 text-sm text-on-dark-muted leading-relaxed">
              Our investment advisors and bar-registered legal counsel can prepare an individualized closing cost audit,
              SPK appraisal review, and tax structure for your private shortlist.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/contact" className="btn btn-primary btn-shimmer shadow-xs">
                Request Private Consultation
              </Link>
              <a
                href={waLink("Hello Avrasya Properties, I used your calculator and would like to review verified properties with detailed statutory costs.")}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline !border-white/20 !bg-white/5 !text-white hover:!bg-white/10 gap-1.5"
              >
                <MessageSquare className="h-3.5 w-3.5 text-brass" /> Chat on WhatsApp
              </a>
            </div>
          </div>
          <div
            aria-hidden
            className="outline-word pointer-events-none absolute -bottom-10 right-0 select-none text-[10rem] outline-light opacity-15 hidden md:block"
          >
            AVRASYA
          </div>
        </div>
      </div>
    </div>
  );
}
