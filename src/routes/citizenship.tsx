import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { 
  Award, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  Coins, 
  DollarSign, 
  FileCheck2, 
  Globe2, 
  HelpCircle, 
  Landmark, 
  ShieldCheck, 
  Users 
} from "lucide-react";
import { CtaBand, Margin, PageIntro } from "@/components/site/Chrome";
import { meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/citizenship")({
  head: () =>
    meta(
      "Turkish Citizenship by Investment ($400,000) · Avrasya Properties",
      "Authoritative guide and interactive financial calculator for acquiring Turkish citizenship through qualifying Istanbul real estate. Legal roadmap, cost breakdowns, and SPK appraisal compliance."
    ),
  component: CitizenshipPage,
});

export function CitizenshipPage() {
  // Calculator state
  const [propertyPrice, setPropertyPrice] = useState(450000);
  const [hasSpouse, setHasSpouse] = useState(true);
  const [childrenCount, setChildrenCount] = useState(2);
  const [vatExempt, setVatExempt] = useState(true);

  // Fee calculations
  const totalApplicants = 1 + (hasSpouse ? 1 : 0) + childrenCount;
  const tapuTransferFee = propertyPrice * 0.04; // 4% standard title deed fee (often 2% buyer / 2% developer)
  const spkAppraisalFee = 1200; // SPK certified valuation report
  const dabAndNotary = 1500; // Foreign exchange certificate (DAB) & sworn legal translations
  const legalRepresentation = 6500; // Complete bar-certified CBI attorney representation for family
  const govtFilingPerPerson = 850;
  const totalGovtFiling = totalApplicants * govtFilingPerPerson;
  const estimatedTotal = propertyPrice + tapuTransferFee + spkAppraisalFee + dabAndNotary + legalRepresentation + totalGovtFiling;

  const steps = [
    {
      num: "01",
      title: "Property Selection & SPK Appraisal",
      duration: "Weeks 1–2",
      desc: "Select qualifying property and commission an official Capital Markets Board (SPK) licensed appraisal confirming market valuation meets or exceeds $400,000 USD.",
      icon: Building2,
    },
    {
      num: "02",
      title: "Central Bank DAB Currency Conversion",
      duration: "Week 3",
      desc: "Transfer purchase funds in foreign currency to a Turkish bank, converting via the Central Bank of Türkiye (TCMB) to obtain the Döviz Alım Belgesi (DAB).",
      icon: Landmark,
    },
    {
      num: "03",
      title: "Title Deed Transfer & 3-Year Annotation",
      duration: "Week 4",
      desc: "Execute title deed transfer at the Land Registry (Tapu) with an official statutory annotation restricting resale for a period of 3 years.",
      icon: FileCheck2,
    },
    {
      num: "04",
      title: "Certificate of Conformity (Uygunluk Belgesi)",
      duration: "Weeks 5–6",
      desc: "The Ministry of Environment, Urbanisation and Climate Change issues the official Certificate of Conformity verifying eligibility.",
      icon: ShieldCheck,
    },
    {
      num: "05",
      title: "Investor Residence Permit",
      duration: "Weeks 7–8",
      desc: "Filing for a specialized investor residence permit under Article 31/1(j) of the Foreigners and International Protection Law. No residency requirement is imposed.",
      icon: Users,
    },
    {
      num: "06",
      title: "Citizenship Approval & Passport Issuance",
      duration: "Months 3–6",
      desc: "Final presidential decree approval. Biometric appointment scheduled in Istanbul or at any Turkish embassy worldwide to receive biometric passports.",
      icon: Award,
    },
  ];

  const benefits = [
    {
      title: "Fast Track Processing",
      desc: "Total procedure typically concluded within 3 to 6 months from title deed registration to passport collection.",
    },
    {
      title: "Entire Family Included",
      desc: "The principal investor, legal spouse, and all biological or adopted dependent children under 18 receive citizenship simultaneously.",
    },
    {
      title: "Zero Physical Stay Requirement",
      desc: "No minimum physical residency is required before, during, or after the citizenship application is granted.",
    },
    {
      title: "Full Dual Nationality",
      desc: "Turkish law explicitly permits multiple citizenships without requiring surrender of your country of origin passport.",
    },
    {
      title: "Complete Capital Preservation",
      desc: "After the 3-year statutory holding period, you are legally entitled to sell your property while retaining lifelong citizenship.",
    },
    {
      title: "US E-2 Treaty Investor Eligibility",
      desc: "Turkish citizens are eligible to apply for the United States E-2 Investor Visa for business entry into the USA.",
    },
  ];

  const faqs = [
    [
      "Can I purchase multiple properties to reach the $400,000 threshold?",
      "Yes. Under Turkish law, you can combine multiple properties (such as two 1+1 apartments or a penthouse and a commercial unit) provided their total SPK appraisal and payment receipts equal or exceed $400,000 USD, and all title deeds are submitted synchronously.",
    ],
    [
      "What is the DAB (Döviz Alım Belgesi) and why is it critical?",
      "Since January 2022, foreign property buyers must convert foreign currency into Turkish Liras through a Turkish depository bank to the Central Bank of Türkiye (TCMB) prior to title transfer. The issued DAB certificate is mandatory for citizenship validation.",
    ],
    [
      "Do I have to live in Türkiye to maintain citizenship?",
      "No. Türkiye does not require physical residency, language examinations, or military conscription for foreign investors obtaining nationality through the investment programme.",
    ],
    [
      "Can I rent out the property during the 3-year holding period?",
      "Yes. You are fully permitted to generate rental income in foreign currency or Turkish Lira throughout the 3-year holding window. You only agree not to sell the title deed.",
    ],
    [
      "How does the VAT (KDV) exemption work for foreigners?",
      "Non-resident foreign nationals buying directly from primary developers can qualify for 0% VAT exemption (saving 1% to 20%), provided the purchase is funded with foreign currency wired from outside Türkiye and held for at least one year.",
    ],
  ];

  return (
    <>
      <PageIntro
        eyebrow="Official Turkish Citizenship by Investment · Law No. 5901"
        title={
          <>
            Turkish citizenship through property: <em>authoritative, transparent counsel.</em>
          </>
        }
      >
        <p>
          Acquire Turkish nationality for your entire family by investing a minimum of $400,000 USD in qualifying Istanbul real estate. Avrasya Properties coordinates every milestone alongside independent bar-registered lawyers and licensed valuation experts.
        </p>
      </PageIntro>

      {/* Highlights Strip */}
      <section className="border-b bg-card py-6">
        <div className="container-site grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="border-l-2 border-brass pl-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Threshold</p>
            <p className="font-display text-2xl font-bold text-foreground">$400,000 USD</p>
            <p className="text-xs text-muted-foreground">Minimum property value</p>
          </div>
          <div className="border-l-2 border-brass pl-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Timeline</p>
            <p className="font-display text-2xl font-bold text-foreground">3 – 6 Months</p>
            <p className="text-xs text-muted-foreground">From purchase to passport</p>
          </div>
          <div className="border-l-2 border-brass pl-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Family Scope</p>
            <p className="font-display text-2xl font-bold text-foreground">Investor & Family</p>
            <p className="text-xs text-muted-foreground">Spouse + kids under 18</p>
          </div>
          <div className="border-l-2 border-brass pl-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Holding Period</p>
            <p className="font-display text-2xl font-bold text-foreground">36 Months</p>
            <p className="text-xs text-muted-foreground">Retain passport after sale</p>
          </div>
        </div>
      </section>

      {/* Interactive Financial Calculator */}
      <section className="container-site py-16">
        <div className="mb-8">
          <p className="eyebrow">Financial Transparency</p>
          <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
            Citizenship Acquisition Cost Calculator
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Estimate all government fees, title deed taxes, legal retainers, and appraisal charges for your family.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Controls Panel */}
          <div className="space-y-6 rounded-2xl border bg-card p-6 lg:col-span-6 md:p-8">
            <h3 className="text-lg font-semibold text-foreground">Configure Your Case</h3>

            {/* Slider */}
            <div>
              <div className="flex justify-between items-center text-sm">
                <label className="font-medium text-foreground">Property Investment Amount</label>
                <span className="font-mono text-lg font-bold text-brass">
                  ${new Intl.NumberFormat("en-US").format(propertyPrice)} USD
                </span>
              </div>
              <input
                type="range"
                min="400000"
                max="2000000"
                step="25000"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Number(e.target.value))}
                className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-brass"
              />
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                <span>$400,000 (Min Threshold)</span>
                <span>$1,000,000</span>
                <span>$2,000,000+</span>
              </div>
            </div>

            {/* Family composition */}
            <div className="space-y-4 pt-4 border-t">
              <label className="text-sm font-medium text-foreground block">Family Members Included</label>
              
              <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                <span className="text-sm">Include Legal Spouse</span>
                <input
                  type="checkbox"
                  checked={hasSpouse}
                  onChange={(e) => setHasSpouse(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brass focus:ring-brass"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                <span className="text-sm">Children Under 18 ({childrenCount})</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                    className="h-7 w-7 rounded border bg-card text-sm font-bold hover:bg-muted"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-mono text-sm font-medium">{childrenCount}</span>
                  <button
                    type="button"
                    onClick={() => setChildrenCount(Math.min(6, childrenCount + 1))}
                    className="h-7 w-7 rounded border bg-card text-sm font-bold hover:bg-muted"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                <div>
                  <span className="text-sm block">Primary Developer Stock (VAT Exemption Eligible)</span>
                  <span className="text-[11px] text-muted-foreground">Non-residents can apply for 0% KDV status</span>
                </div>
                <input
                  type="checkbox"
                  checked={vatExempt}
                  onChange={(e) => setVatExempt(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brass focus:ring-brass"
                />
              </div>
            </div>
          </div>

          {/* Breakdown Summary Panel */}
          <div className="rounded-2xl border bg-card p-6 lg:col-span-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-lg font-semibold text-foreground">Estimated Financial Outlay</h3>
                <span className="rounded-full bg-brass/10 px-3 py-1 text-xs font-semibold text-brass">
                  {totalApplicants} {totalApplicants === 1 ? "Passport" : "Passports"} Included
                </span>
              </div>

              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between py-1">
                  <dt className="text-muted-foreground">Property Investment Capital</dt>
                  <dd className="font-mono font-medium text-foreground">${new Intl.NumberFormat("en-US").format(propertyPrice)}</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-muted-foreground">Title Deed Transfer Tax (Tapu Harcı · 4%)</dt>
                  <dd className="font-mono font-medium text-foreground">${new Intl.NumberFormat("en-US").format(tapuTransferFee)}</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-muted-foreground">Official SPK Valuation & Appraisal Report</dt>
                  <dd className="font-mono font-medium text-foreground">${new Intl.NumberFormat("en-US").format(spkAppraisalFee)}</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-muted-foreground">Central Bank DAB Currency Certificate & Sworn Notarizations</dt>
                  <dd className="font-mono font-medium text-foreground">${new Intl.NumberFormat("en-US").format(dabAndNotary)}</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-muted-foreground">Bar-Certified Immigration Counsel Retainer (Full Family)</dt>
                  <dd className="font-mono font-medium text-foreground">${new Intl.NumberFormat("en-US").format(legalRepresentation)}</dd>
                </div>
                <div className="flex justify-between py-1 border-b pb-3">
                  <dt className="text-muted-foreground">Government Passport Filing & Residence Duties ({totalApplicants} pax)</dt>
                  <dd className="font-mono font-medium text-foreground">${new Intl.NumberFormat("en-US").format(totalGovtFiling)}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Estimated Total Investment</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Includes property acquisition & complete legal execution</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl font-bold text-brass tabular-nums">
                    ${new Intl.NumberFormat("en-US").format(estimatedTotal)}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">USD Net Estimate</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/properties"
                  search={{ cbiOnly: true }}
                  className="btn btn-primary flex-1 justify-center"
                >
                  View $400k+ Qualifying Inventory
                </Link>
                <Link
                  to="/contact"
                  className="btn btn-outline flex-1 justify-center"
                >
                  Book Private Legal Briefing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Six-Stage Legal Process Roadmap */}
      <section className="border-t bg-ink text-on-dark py-20">
        <div className="container-site">
          <div className="max-w-2xl">
            <p className="eyebrow text-brass">Process Transparency</p>
            <h2 className="font-display text-3xl font-semibold md:text-4xl text-on-dark">
              6-Stage Path to Turkish Citizenship
            </h2>
            <p className="mt-3 text-on-dark-muted">
              Every step is pre-structured with independent legal oversight to guarantee compliance with the Ministry of Environment and Directorate of Migration Management.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="group relative rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-brass/50 hover:bg-white/[0.08]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-brass">{s.num}</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-on-dark-muted">
                    {s.duration}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <s.icon className="h-5 w-5 text-brass" />
                  <h3 className="font-display text-lg font-semibold text-on-dark">{s.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-on-dark-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="container-site py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="eyebrow">Global Freedom & Security</p>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Strategic Advantages of Turkish Nationality
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-xl border bg-card p-6 transition-all hover:border-brass">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brass/10 text-brass mb-4">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Questions & Legal Clarification */}
      <Margin label="Official FAQ">
        <div className="space-y-6">
          {faqs.map(([q, a]) => (
            <div key={q} className="rounded-lg border bg-card p-6">
              <h3 className="font-display text-lg font-semibold text-foreground">{q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </Margin>

      {/* Strict Compliance Disclaimer */}
      <Margin label="Important Notice">
        <div className="rounded-xl border-l-4 border-brass bg-card p-6 text-sm leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">Regulatory & Statutory Compliance Notice</p>
          <p>
            Avrasya Properties provides investment brokerage and transactional coordination. Final citizenship approval is the exclusive statutory prerogative of the Republic of Türkiye Ministry of Interior Directorate of Migration Management. Property listings displayed on this platform are evaluated based on developer documentation and independent SPK valuations. All legal representations are executed through licensed members of the Istanbul Bar Association.
          </p>
        </div>
      </Margin>

      <CtaBand />
    </>
  );
}
