import { useServices,useFaqs } from "@/data/live";
import { DEMO_MODE } from "@/lib/supabase";
import { ManagedPage } from "@/components/site/ManagedPage";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Compass,
  FileCheck,
  HelpCircle,
  Key,
  Landmark,
  Layers,
  LineChart,
  PhoneCall,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";
import { CtaBand, Margin, PageIntro } from "@/components/site/Chrome";
import { meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/services")({
  head: () =>
    meta(
      "Comprehensive Real Estate Advisory Services · Avrasya Properties",
      "Ten end-to-end luxury property advisory services covering investment structuring, citizenship, legal coordination, turnkey management, and resale.",
    ),
  component: () => <ManagedPage slug="services"><ServicesPage /></ManagedPage>,
});

type ServiceItem = {
  num: string;
  title: string;
  category: string;
  desc: string;
  deliverables: string[];
  icon: typeof Building2;
};

const SERVICES: ServiceItem[] = [
  {
    num: "01",
    title: "Strategic Investment Advisory",
    category: "Pre-Acquisition",
    desc: "Bespoke consultation matching financial goals, risk profile, and family timelines with high-conviction Istanbul sub-markets.",
    deliverables: [
      "Macro yield analysis",
      "District pricing forecasts",
      "Tax optimization strategy",
    ],
    icon: LineChart,
  },
  {
    num: "02",
    title: "Curated Property Selection & VIP Tours",
    category: "Acquisition",
    desc: "Unbiased selection across primary developer master-plans and private off-market resales, with private chauffeur viewings or 4K virtual tours.",
    deliverables: [
      "Off-market shortlists",
      "Unfiltered site inspections",
      "Virtual video walk-throughs",
    ],
    icon: Compass,
  },
  {
    num: "03",
    title: "Citizenship by Investment Coordination",
    category: "Legal & Residency",
    desc: "Full guidance under Turkish Citizenship Law No. 5901, ensuring property meets $400,000 threshold and SPK appraisal compliance.",
    deliverables: [
      "SPK appraisal monitoring",
      "Ministry conformity filings",
      "Family passport applications",
    ],
    icon: Landmark,
  },
  {
    num: "04",
    title: "Legal & Administrative Representation",
    category: "Legal & Residency",
    desc: "Connecting you with vetted, independent Turkish bar-registered attorneys for limited Power of Attorney (POA), title searches, and contract reviews.",
    deliverables: ["Tax ID registration", "Depository bank opening", "Encumbrance & lien checks"],
    icon: Scale,
  },
  {
    num: "05",
    title: "Cross-Border FX & Central Bank DAB",
    category: "Transaction",
    desc: "Management of foreign currency transfers and statutory Central Bank (TCMB) FX certificate conversions to eliminate exchange rate slippage.",
    deliverables: [
      "Central Bank DAB certificate",
      "Escrow payment handling",
      "Multi-currency wire verification",
    ],
    icon: FileCheck,
  },
  {
    num: "06",
    title: "Investor Residence Permit (İkamet)",
    category: "Legal & Residency",
    desc: "Fast-track residence permit execution under Article 31/1(j) for investors and their dependents with zero physical stay conditions.",
    deliverables: [
      "Health insurance enrollment",
      "Biometric appointment booking",
      "Permit renewal tracking",
    ],
    icon: Users,
  },
  {
    num: "07",
    title: "Turnkey Handover & Interior Fit-Out",
    category: "Post-Acquisition",
    desc: "Comprehensive snagging inspection upon developer completion, key holding, designer interior furnishing, and utility activations.",
    deliverables: [
      "Snagging defect audit",
      "Interior design packages",
      "Water/gas/electric contracts",
    ],
    icon: Key,
  },
  {
    num: "08",
    title: "Strategic Rental & Asset Management",
    category: "Post-Acquisition",
    desc: "Tenant vetting, drafting notarized Turkish eviction agreements (tahliye taahhütnamesi), rent collection, and routine maintenance.",
    deliverables: [
      "Corporate tenant vetting",
      "Rent escrow reporting",
      "Routine facility inspections",
    ],
    icon: Building2,
  },
  {
    num: "09",
    title: "Secondary Resale & Exit Execution",
    category: "Wealth Management",
    desc: "Capitalizing on the 5-year capital gains tax exemption window, re-appraising your asset, and marketing to our international network.",
    deliverables: [
      "Market valuation review",
      "Global investor marketing",
      "Title transfer closing",
    ],
    icon: Layers,
  },
  {
    num: "10",
    title: "Cross-Border Family Wealth Advisory",
    category: "Wealth Management",
    desc: "Structuring cross-border estate succession, Turkish inheritance compliance, and family relocation concierge.",
    deliverables: [
      "Inheritance planning",
      "International school admission",
      "Private banking introductions",
    ],
    icon: ShieldCheck,
  },
];

const PHASES = [
  {
    stage: "Phase 1",
    title: "Pre-Investment Structuring",
    desc: "Define objectives, establish budget parameters, and review market macro trends before visiting properties.",
  },
  {
    stage: "Phase 2",
    title: "Selection & Verification",
    desc: "Shortlisting prime developments, verifying developer track records, and ordering SPK valuations.",
  },
  {
    stage: "Phase 3",
    title: "Contract & Financial Settlement",
    desc: "Executing the preliminary sales contract, converting funds via TCMB DAB certificate, and executing Tapu transfer.",
  },
  {
    stage: "Phase 4",
    title: "Residency & Nationality Filing",
    desc: "Filing conformity certificates, securing investor residency, and monitoring presidential citizenship decrees.",
  },
  {
    stage: "Phase 5",
    title: "Handover & Furnishing",
    desc: "Conducting handover snagging surveys, utility activations, and bespoke interior furnishing fit-outs.",
  },
  {
    stage: "Phase 6",
    title: "Operational Yield & Future Exit",
    desc: "Managing tenant relationships, collecting net rental yields, and orchestrating future tax-exempt liquidation.",
  },
];

export function ServicesPage() {
  const serviceQuery=useServices();
  const faqQuery=useFaqs();
  const services:ServiceItem[]=DEMO_MODE?SERVICES:(serviceQuery.data||[]).map((s,i)=>({num:String(i+1).padStart(2,"0"),title:s.title,category:s.category||"Advisory",desc:s.description,deliverables:s.process_steps.filter((x):x is string=>typeof x==="string"),icon:Building2}));
  const [activeCategory, setActiveCategory] = useState<string>("All");

<<<<<<< HEAD
  const categories = [
    "All",
    "Pre-Acquisition",
    "Acquisition",
    "Legal & Residency",
    "Transaction",
    "Post-Acquisition",
    "Wealth Management",
  ];

  const filtered =
    activeCategory === "All" ? SERVICES : SERVICES.filter((s) => s.category === activeCategory);
=======
  const categories = ["All",...new Set(services.map(s=>s.category))];

  const filtered = activeCategory === "All" ? services : services.filter(s => s.category === activeCategory);
>>>>>>> 79a7162f934d90675238098147e8ead1264bc06f

  return (
    <>
      <PageIntro
        eyebrow="End-to-End Client Care · Fiduciary Standards"
        title={
          <>
            Comprehensive advisory across every <em>stage of ownership.</em>
          </>
        }
      >
        <p>
          Avrasya Properties provides institutional advisory and transactional execution. We
          eliminate conflicts of interest by coordinating with independent, bar-registered attorneys
          and licensed valuation experts.
        </p>
      </PageIntro>

      {/* Ten Services Section */}
      <section className="container-site py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="eyebrow">Service Directory</p>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              The Ten Core Advisory Pillars
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Filter by your stage of real estate acquisition or management.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 rounded-lg border bg-card p-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-brass text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div
              key={s.num}
              className="group rounded-xl border bg-card p-6 transition-all hover:border-brass hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-brass">{s.num}</span>
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {s.category}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brass/10 text-brass">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">{s.title}</h3>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>

              <div className="mt-6 border-t pt-4 space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Core Deliverables
                </p>
                {s.deliverables.map((del, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brass shrink-0" />
                    <span>{del}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Six Phase Journey */}
      <section className="border-t bg-ink text-on-dark py-20">
        <div className="container-site">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow text-brass">Strategic Sequence</p>
            <h2 className="font-display text-3xl font-semibold md:text-4xl text-on-dark">
              The Six-Phase Client Journey
            </h2>
            <p className="mt-3 text-on-dark-muted">
              Structured to guarantee total legal safety, financial efficiency, and absolute clarity
              at every step.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PHASES.map((p, i) => (
              <div
                key={p.stage}
                className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <span className="font-mono text-xs font-bold text-brass uppercase tracking-widest">
                  {p.stage}
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-on-dark">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-dark-muted">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-site py-12 flex justify-center">
        <Link to="/contact" className="btn btn-primary text-base px-8 py-3">
          Schedule Private Service Consultation
        </Link>
      </div>

      {!DEMO_MODE && <section className="container-site py-10">{serviceQuery.isError && <p role="alert">Services are temporarily unavailable.</p>}{(faqQuery.data||[]).map(faq=><details key={faq.id} className="border-b py-4"><summary className="cursor-pointer font-medium">{faq.question}</summary><p className="mt-3 text-muted-foreground">{faq.answer}</p></details>)}</section>}<CtaBand />
    </>
  );
}
