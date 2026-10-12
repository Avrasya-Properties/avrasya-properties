import { ManagedPage } from "@/components/site/ManagedPage";
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
  Users,
} from "lucide-react";
import { CtaBand, Margin, PageIntro } from "@/components/site/Chrome";
import { meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/citizenship")({
  head: () =>
    meta(
      "Turkish Citizenship by Investment ($400,000) · Avrasya Properties",
      "Clear, comprehensive guide and interactive cost calculator for obtaining Turkish citizenship through qualifying Istanbul real estate. Step-by-step roadmap and cost breakdowns.",
    ),
  component: () => <ManagedPage slug="citizenship"><CitizenshipPage /></ManagedPage>,
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
  const estimatedTotal =
    propertyPrice +
    tapuTransferFee +
    spkAppraisalFee +
    dabAndNotary +
    legalRepresentation +
    totalGovtFiling;

  const steps = [
    {
      num: "01",
      title: "Choose Your Home & Value Check",
      duration: "Weeks 1–2",
      desc: "Choose a home you love. A government-licensed appraiser then inspects the property to verify that its official market value meets or exceeds $400,000 USD.",
      icon: Building2,
    },
    {
      num: "02",
      title: "Secure Bank Transfer & Currency Certificate",
      duration: "Week 3",
      desc: "Send your funds securely to a Turkish bank. The bank converts the funds through the Central Bank of Türkiye and issues the official currency certificate (DAB).",
      icon: Landmark,
    },
    {
      num: "03",
      title: "Receive Your Title Deed (Tapu)",
      duration: "Week 4",
      desc: "You receive your official title deed at the Land Registry office with a simple 3-year holding pledge. You are free to live in or rent out your property immediately.",
      icon: FileCheck2,
    },
    {
      num: "04",
      title: "Citizenship Eligibility Approval",
      duration: "Weeks 5–6",
      desc: "The government reviews your title deed and valuation report, issuing your official Certificate of Eligibility for citizenship.",
      icon: ShieldCheck,
    },
    {
      num: "05",
      title: "Investor Residence Permit",
      duration: "Weeks 7–8",
      desc: "We arrange fast-track investor residence cards for you and your family. There is no minimum stay required in Türkiye.",
      icon: Users,
    },
    {
      num: "06",
      title: "Receive Your Turkish Passports",
      duration: "Months 3–6",
      desc: "Your citizenship is approved. Collect your new Turkish identity cards and biometric passports in Istanbul or at any Turkish embassy worldwide.",
      icon: Award,
    },
  ];

  const benefits = [
    {
      title: "Fast Track Processing",
      desc: "Typically completed within 3 to 6 months from title deed transfer to receiving your passports.",
    },
    {
      title: "Entire Family Included",
      desc: "You, your spouse, and all children under 18 receive Turkish passports together under a single investment.",
    },
    {
      title: "Zero Physical Stay Requirement",
      desc: "You are not required to live in or visit Türkiye for any set number of days to keep your citizenship.",
    },
    {
      title: "Full Dual Nationality",
      desc: "Türkiye allows dual citizenship, meaning you keep your existing nationality and passport.",
    },
    {
      title: "Keep Your Passport Forever",
      desc: "After just 3 years, you can sell your property and recover your investment while keeping your Turkish passport for life.",
    },
    {
      title: "US E-2 Treaty Investor Eligibility",
      desc: "Turkish citizens can apply for the US E-2 Investor Visa, opening simplified business and residency opportunities in America.",
    },
  ];

  const faqs = [
    [
      "Can I purchase multiple properties to reach the $400,000 threshold?",
      "Yes. Under Turkish law, you can combine multiple properties (such as two 1+1 apartments or an apartment and a retail unit) provided their total official valuation and bank payments equal or exceed $400,000 USD.",
    ],
    [
      "What is the DAB (Döviz Alım Belgesi) and why is it needed?",
      "When buying property as an international buyer, your foreign currency is converted to Turkish Liras through your bank and the Central Bank of Türkiye. The bank provides the DAB certificate as official proof for your citizenship application.",
    ],
    [
      "Do I have to live in Türkiye to maintain citizenship?",
      "No. Türkiye does not require physical residency, language tests, or military service for foreign investors obtaining citizenship through property.",
    ],
    [
      "Can I rent out the property during the 3-year holding period?",
      "Yes. You are completely free to rent out your property and earn steady rental income in foreign currency or Turkish Lira throughout the 3-year period. You simply agree not to sell the title deed.",
    ],
    [
      "How does the VAT (KDV) tax exemption work?",
      "International buyers purchasing directly from quality developers can qualify for 0% VAT (saving 1% to 20%), provided the funds are transferred from outside Türkiye and the property is kept for at least one year.",
    ],
  ];

  return (
    <>
      <PageIntro
        eyebrow="Turkish Citizenship by Investment · Simple & Clear Guide"
        title={
          <>
            Turkish citizenship through property: <em>a smooth, secure pathway for your family.</em>
          </>
        }
      >
        <p>
          Obtain Turkish passports for your entire family by investing $400,000 or more in qualifying
          Istanbul real estate. We guide you through every milestone alongside trusted, independent
          attorneys and licensed valuation experts—keeping the process simple, transparent, and
          completely worry-free.
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
            <p className="font-display text-2xl font-bold text-foreground">Whole Family</p>
            <p className="text-xs text-muted-foreground">Spouse & kids under 18</p>
          </div>
          <div className="border-l-2 border-brass pl-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Holding Period</p>
            <p className="font-display text-2xl font-bold text-foreground">3 Years</p>
            <p className="text-xs text-muted-foreground">Retain passport after sale</p>
          </div>
        </div>
      </section>

      {/* Interactive Financial Calculator */}
      <section className="container-site py-16">
        <div className="mb-8">
          <p className="eyebrow">Cost Transparency</p>
          <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
            Citizenship Cost Calculator
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Estimate all property costs, government fees, and legal support for your family in seconds.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Controls Panel */}
          <div className="card-elevate space-y-6 rounded-xs border border-border/80 bg-card p-6 lg:col-span-6 md:p-8 shadow-xs">
            <h3 className="text-lg font-semibold text-foreground">Your Investment & Family</h3>

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
                className="range-luxury my-3"
              />
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                <span>$400,000 (Min Threshold)</span>
                <span>$1,000,000</span>
                <span>$2,000,000+</span>
              </div>
            </div>

            {/* Family composition */}
            <div className="space-y-4 pt-4 border-t">
              <label className="text-sm font-medium text-foreground block">
                Family Members Included
              </label>

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
                  <span className="w-5 text-center font-mono text-sm font-medium">
                    {childrenCount}
                  </span>
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
                  <span className="text-sm block">
                    Eligible for 0% VAT (Tax Saving)
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Foreign buyers can save between 1% to 20% on value-added tax
                  </span>
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
          <div className="card-elevate rounded-xs border border-border/80 bg-card p-6 lg:col-span-6 md:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Estimated Total Cost Breakdown
                </h3>
                <span className="rounded bg-brass/10 px-3 py-1 text-xs font-semibold text-brass">
                  {totalApplicants} {totalApplicants === 1 ? "Passport" : "Passports"} Included
                </span>
              </div>

              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between py-1">
                  <dt className="text-muted-foreground">Property Purchase Price</dt>
                  <dd className="font-mono font-medium text-foreground">
                    ${new Intl.NumberFormat("en-US").format(propertyPrice)}
                  </dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-muted-foreground">
                    Title Deed Transfer Tax (Tapu Harcı · 4%)
                  </dt>
                  <dd className="font-mono font-medium text-foreground">
                    ${new Intl.NumberFormat("en-US").format(tapuTransferFee)}
                  </dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-muted-foreground">
                    Independent Government Property Valuation
                  </dt>
                  <dd className="font-mono font-medium text-foreground">
                    ${new Intl.NumberFormat("en-US").format(spkAppraisalFee)}
                  </dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-muted-foreground">
                    Central Bank Currency Certificate (DAB) & Notary
                  </dt>
                  <dd className="font-mono font-medium text-foreground">
                    ${new Intl.NumberFormat("en-US").format(dabAndNotary)}
                  </dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-muted-foreground">
                    Independent Legal Support for the Whole Family
                  </dt>
                  <dd className="font-mono font-medium text-foreground">
                    ${new Intl.NumberFormat("en-US").format(legalRepresentation)}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b pb-3">
                  <dt className="text-muted-foreground">
                    Government Filing & Passport Fees ({totalApplicants} people)
                  </dt>
                  <dd className="font-mono font-medium text-foreground">
                    ${new Intl.NumberFormat("en-US").format(totalGovtFiling)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Estimated Total Cost
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Includes property cost, taxes, valuation, and legal support
                  </p>
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
                  className="btn btn-primary flex-1 justify-center btn-shimmer"
                >
                  Explore Qualifying Homes ($400,000+)
                </Link>
                <Link to="/contact" className="btn btn-outline flex-1 justify-center hover:border-brass/70 hover:text-brass transition-colors">
                  Speak with a Citizenship Advisor
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
              6 Simple Steps to Turkish Citizenship
            </h2>
            <p className="mt-3 text-on-dark-muted">
              Every step is handled with independent legal oversight to make your application smooth,
              safe, and completely predictable.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.num}
                className="card-elevate group relative rounded-xs border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-brass/50 hover:bg-white/[0.08]"
              >
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
            Advantages of Turkish Citizenship
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="card-elevate rounded-xs border border-border/80 bg-card p-6 shadow-xs transition-all hover:border-brass/70 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-brass/10 text-brass mb-4">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Questions & Legal Clarification */}
      <Margin label="Helpful FAQs">
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
          <p className="font-semibold text-foreground mb-1">
            Regulatory & Compliance Notice
          </p>
          <p>
            Avrasya Properties provides dedicated property advisory and transaction support. Final
            citizenship approval is granted by the Republic of Türkiye Ministry of Interior Directorate
            of Migration Management. Every property in our collection is independently appraised by
            licensed experts, and all legal filings are handled by certified members of the Istanbul
            Bar Association.
          </p>
        </div>
      </Margin>

      <CtaBand />
    </>
  );
}
