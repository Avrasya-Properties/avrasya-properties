import { useWhatsAppLink } from "@/hooks/useLiveContact";
import { useState } from "react";
import { 
  Building, 
  Calculator, 
  CheckCircle2, 
  Copy, 
  FileCheck2, 
  HelpCircle, 
  Info, 
  MessageSquare, 
  Percent, 
  Scale, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp 
} from "lucide-react";
import { useCurrency } from "@/hooks/usePreferences";

export function AcquisitionCalculator() {
  const waLink=useWhatsAppLink();
  const [priceUsd, setPriceUsd] = useState<number>(450000);
  const [tapuSplit, setTapuSplit] = useState<"full" | "split">("full");
  const [vatExempt, setVatExempt] = useState<boolean>(true); // Law 3065 foreigner exemption
  const [copied, setCopied] = useState<boolean>(false);
  const [currency] = useCurrency();

  // Exchange approximate rates for reference
  const rates: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    TRY: 34.2,
    GBP: 0.79,
  };

  const currentRate = rates[currency] || 1;
  const currencySymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "TRY" ? "₺" : "£";

  const formatCurr = (valUsd: number) => {
    const converted = Math.round(valUsd * currentRate);
    return `${currencySymbol}${converted.toLocaleString("en-US")}`;
  };

  // Statutory Cost Calculations
  const tapuRate = tapuSplit === "full" ? 0.04 : 0.02; // 4% total or 2% buyer share
  const tapuFeeUsd = Math.round(priceUsd * tapuRate);
  const vatRate = vatExempt ? 0 : 0.01; // 0% under Law 3065 or 1% standard residential
  const vatUsd = Math.round(priceUsd * vatRate);
  const spkValuationUsd = 750; // SPK statutory appraisal report
  const notaryDabUsd = 650; // Central Bank DAB conversion, sworn translation, notary registry
  const legalFeeUsd = 2500; // Independent bar-registered attorney title due diligence

  const totalClosingCostsUsd = tapuFeeUsd + vatUsd + spkValuationUsd + notaryDabUsd + legalFeeUsd;
  const allInAcquisitionUsd = priceUsd + totalClosingCostsUsd;
  const closingPercentage = ((totalClosingCostsUsd / priceUsd) * 100).toFixed(1);

  // CBI Status
  const cbiThreshold = 400000;
  const isCbiQualified = priceUsd >= cbiThreshold;
  const cbiDeficitUsd = Math.max(0, cbiThreshold - priceUsd);
  const cbiProgressPercent = Math.min(100, Math.round((priceUsd / cbiThreshold) * 100));

  // Yield Estimates (Conservative average 7.2% net yield)
  const annualRentalUsd = Math.round(priceUsd * 0.072);
  const monthlyRentalUsd = Math.round(annualRentalUsd / 12);
  const threeYearRentalUsd = annualRentalUsd * 3;

  function copySummary() {
    const text = `AVRASYA PROPERTIES — ACQUISITION COST LEDGER
Property Purchase Price: $${priceUsd.toLocaleString()} USD
Title Deed Tax (Tapu Harcı ${tapuRate * 100}%): $${tapuFeeUsd.toLocaleString()} USD
VAT Exemption (Law No. 3065): ${vatExempt ? "0% (Exempt)" : "1% ($" + vatUsd.toLocaleString() + " USD)"}
SPK Valuation & Appraisal: $${spkValuationUsd.toLocaleString()} USD
Notary & DAB Certificate: $${notaryDabUsd.toLocaleString()} USD
Independent Legal Due Diligence: $${legalFeeUsd.toLocaleString()} USD
TOTAL ALL-IN CAPITAL: $${allInAcquisitionUsd.toLocaleString()} USD
Turkish Citizenship ($400k CBI): ${isCbiQualified ? "QUALIFIED (100%)" : "Deficit: $" + cbiDeficitUsd.toLocaleString() + " USD"}
Projected Annual Net Rental: $${annualRentalUsd.toLocaleString()} USD/yr ($${monthlyRentalUsd.toLocaleString()}/mo)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const waMessage = `Hello Avrasya Properties, I calculated an acquisition budget of $${priceUsd.toLocaleString()} USD on your Tapu Cost Ledger (All-In Total: $${allInAcquisitionUsd.toLocaleString()} USD). I would like to consult on verified title deeds matching this budget.`;

  return (
    <div id="calculator" className="relative rounded-xs border border-border/80 bg-card p-6 md:p-10 shadow-lg overflow-hidden">
      <div className="relative z-10">
        {/* Header Strip */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border/70 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded bg-brass/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-brass-text">
                Statutory Financial Transparency
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                Turkish Land Registry Law No. 4721
              </span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
              Title Deed (Tapu) & <em className="italic text-brass font-normal">Acquisition Cost Ledger</em>
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Calculate total all-in closing costs with zero hidden broker surprises. Complete breakdown of Turkish government registry fees, legal due diligence, and Foreigner VAT exemption rules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copySummary}
              className="btn btn-outline !min-h-9 !py-1 text-xs gap-1.5"
              title="Copy complete breakdown to clipboard"
            >
              <Copy className="h-3.5 w-3.5 text-brass" />
              <span>{copied ? "Ledger Copied!" : "Copy Summary"}</span>
            </button>
          </div>
        </div>

        {/* Two-Column Interactive Layout */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] items-start">
          {/* Left Column: Interactive Inputs */}
          <div className="space-y-6">
            {/* Purchase Price Slider & Quick Presets */}
            <div className="rounded-xs border border-border/80 bg-background/70 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="price-slider" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Target Purchase Valuation (USD)
                </label>
                <div className="flex items-center gap-1 font-mono text-xl md:text-2xl font-bold text-foreground">
                  <span>${priceUsd.toLocaleString("en-US")}</span>
                  {currency !== "USD" && (
                    <span className="text-xs font-normal text-muted-foreground">
                      ({formatCurr(priceUsd)})
                    </span>
                  )}
                </div>
              </div>

              {/* Slider */}
              <input
                id="price-slider"
                type="range"
                min={200000}
                max={2000000}
                step={25000}
                value={priceUsd}
                onChange={(e) => setPriceUsd(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-brass"
              />

              {/* Presets Quick Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground self-center mr-1">
                  Presets:
                </span>
                {[325000, 400000, 495000, 750000, 1200000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setPriceUsd(preset)}
                    className={`rounded px-2.5 py-1 font-mono text-[11px] font-semibold transition-all ${
                      priceUsd === preset
                        ? "bg-primary text-on-dark shadow-xs"
                        : "bg-card border border-border/70 text-foreground hover:border-brass/70"
                    }`}
                  >
                    ${preset >= 1000000 ? `${(preset / 1000000).toFixed(1)}M` : `${preset / 1000}K`}
                    {preset === 400000 && <span className="ml-1 text-[9px] text-brass">CBI</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Statutory Tax Toggles */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Tapu Harcı Split Option */}
              <div className="rounded-xs border border-border/80 bg-background/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Title Deed Tax (Tapu)
                  </p>
                  <span className="font-mono text-xs font-bold text-brass">
                    {tapuRate * 100}%
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Statutory 4% land registry fee. Primary developers often share 2% + 2%.
                </p>
                <div className="flex rounded border border-border/70 bg-card p-0.5 text-xs">
                  <button
                    onClick={() => setTapuSplit("full")}
                    className={`flex-1 rounded py-1 text-center font-medium transition-all ${
                      tapuSplit === "full" ? "bg-primary text-on-dark font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    100% Buyer (4%)
                  </button>
                  <button
                    onClick={() => setTapuSplit("split")}
                    className={`flex-1 rounded py-1 text-center font-medium transition-all ${
                      tapuSplit === "split" ? "bg-primary text-on-dark font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    Split 50/50 (2%)
                  </button>
                </div>
              </div>

              {/* VAT Exemption Toggle */}
              <div className="rounded-xs border border-border/80 bg-background/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Foreigner VAT (KDV)
                  </p>
                  <span className={`font-mono text-xs font-bold ${vatExempt ? "text-emerald-700" : "text-foreground"}`}>
                    {vatExempt ? "0% (Exempt)" : "1% Standard"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Non-residents bringing foreign capital qualify for 0% VAT under Turkish Law No. 3065.
                </p>
                <button
                  onClick={() => setVatExempt(!vatExempt)}
                  className={`w-full rounded py-1.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    vatExempt
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-card text-muted-foreground border-border/70"
                  }`}
                >
                  <CheckCircle2 className={`h-3.5 w-3.5 ${vatExempt ? "text-emerald-700" : "text-muted-foreground"}`} />
                  <span>{vatExempt ? "Law 3065 Exemption Active (Save $" + (priceUsd * 0.01).toLocaleString() + ")" : "Apply Standard 1% VAT"}</span>
                </button>
              </div>
            </div>

            {/* Sovereign Turkish Citizenship ($400k) Barometer */}
            <div className={`rounded-xs border p-5 transition-all ${
              isCbiQualified 
                ? "border-emerald-300/80 bg-emerald-50/40" 
                : "border-brass/50 bg-brass/5"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`h-5 w-5 ${isCbiQualified ? "text-emerald-700" : "text-brass"}`} />
                  <span className="font-display text-base font-semibold text-foreground">
                    Turkish Citizenship (CBI $400k) Status
                  </span>
                </div>
                <span className={`font-mono text-xs font-bold ${isCbiQualified ? "text-emerald-700" : "text-brass-text"}`}>
                  {cbiProgressPercent}% of Threshold
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full transition-all duration-500 ease-out ${
                    isCbiQualified 
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600" 
                      : "bg-gradient-to-r from-brass/60 to-brass"
                  }`}
                  style={{ width: `${cbiProgressPercent}%` }}
                />
              </div>

              <div className="mt-3 text-xs leading-relaxed">
                {isCbiQualified ? (
                  <p className="text-emerald-900 font-medium">
                    ✓ <strong>Fully Qualified for Sovereign CBI:</strong> Covers primary investor, spouse, and all children under 18 with no residency or military service obligations. Freehold title deed held for 3 years.
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Requires additional <strong>${cbiDeficitUsd.toLocaleString("en-US")} USD</strong> to qualify. <em>Note: Multiple properties across Istanbul can be combined in a single application to meet the $400,000 threshold.</em>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Statutory Cost Ledger */}
          <div className="rounded-xs border border-border/90 bg-card p-6 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-border/70 pb-3 font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                <span>Fee Classification</span>
                <span>Statutory Amount (USD)</span>
              </div>

              <div className="mt-4 divide-y divide-border/60 text-sm">
                {/* 1. Base Price */}
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-medium text-foreground">Base Property Purchase Price</span>
                  <span className="font-mono font-semibold text-foreground">${priceUsd.toLocaleString("en-US")}</span>
                </div>

                {/* 2. Title Deed Tax */}
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-foreground">Title Deed Transfer Tax (Tapu Harcı)</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{tapuRate * 100}% of official registry valuation</p>
                  </div>
                  <span className="font-mono font-semibold text-foreground">${tapuFeeUsd.toLocaleString("en-US")}</span>
                </div>

                {/* 3. VAT */}
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-foreground">VAT (KDV)</p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {vatExempt ? "Foreigner Law 3065 Exempt" : "Standard 1% rate"}
                    </p>
                  </div>
                  <span className={`font-mono font-semibold ${vatExempt ? "text-emerald-700" : "text-foreground"}`}>
                    {vatExempt ? "$0 (Exempt)" : `$${vatUsd.toLocaleString("en-US")}`}
                  </span>
                </div>

                {/* 4. SPK Valuation */}
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-foreground">Official SPK Valuation Report</p>
                    <p className="text-[10px] text-muted-foreground font-mono">Statutory certified appraiser audit</p>
                  </div>
                  <span className="font-mono font-semibold text-foreground">${spkValuationUsd.toLocaleString("en-US")}</span>
                </div>

                {/* 5. Notary & DAB */}
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-foreground">Notary, DAB & Sworn Translation</p>
                    <p className="text-[10px] text-muted-foreground font-mono">Central Bank DAB currency document</p>
                  </div>
                  <span className="font-mono font-semibold text-foreground">${notaryDabUsd.toLocaleString("en-US")}</span>
                </div>

                {/* 6. Legal Due Diligence */}
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-foreground">Independent Attorney Due Diligence</p>
                    <p className="text-[10px] text-muted-foreground font-mono">Fiduciary encumbrance & contract audit</p>
                  </div>
                  <span className="font-mono font-semibold text-foreground">${legalFeeUsd.toLocaleString("en-US")}</span>
                </div>
              </div>

              {/* Total Summary Box */}
              <div className="mt-6 rounded-xs border border-brass/50 bg-secondary/40 p-4.5 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total Statutory Closing Friction</span>
                  <span className="font-mono font-bold text-brass">{closingPercentage}% (+${totalClosingCostsUsd.toLocaleString("en-US")})</span>
                </div>

                <div className="flex items-baseline justify-between border-t border-border/80 pt-2">
                  <span className="font-display text-lg font-semibold text-foreground">Total All-In Acquisition Capital</span>
                  <span className="font-display text-2xl font-bold text-foreground tracking-tight">
                    ${allInAcquisitionUsd.toLocaleString("en-US")}
                  </span>
                </div>

                {currency !== "USD" && (
                  <p className="text-right text-xs font-mono text-muted-foreground">
                    Approx. {formatCurr(allInAcquisitionUsd)}
                  </p>
                )}
              </div>

              {/* Estimated Yield Projections Strip */}
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-4 text-xs">
                <div className="rounded border border-border/60 bg-card p-3">
                  <p className="text-[10px] font-mono uppercase text-muted-foreground">Est. Monthly Rental</p>
                  <p className="font-mono text-base font-semibold text-foreground mt-0.5">${monthlyRentalUsd.toLocaleString("en-US")}</p>
                  <p className="text-[10px] text-muted-foreground">At 7.2% Net USD Yield</p>
                </div>
                <div className="rounded border border-border/60 bg-card p-3">
                  <p className="text-[10px] font-mono uppercase text-muted-foreground">3-Yr Cumulative Rental</p>
                  <p className="font-mono text-base font-semibold text-brass mt-0.5">${threeYearRentalUsd.toLocaleString("en-US")}</p>
                  <p className="text-[10px] text-muted-foreground">USD Cashflow Projection</p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Call to Action */}
            <div className="mt-6 pt-4 border-t border-border/70">
              <a
                href={waLink(waMessage)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary w-full justify-center gap-2 shadow-sm !min-h-11"
              >
                <MessageSquare className="h-4 w-4 text-brass" />
                <span>Consult Legal Advisor on This Calculation</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
