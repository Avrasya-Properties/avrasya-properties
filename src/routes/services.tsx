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
  Users 
} from "lucide-react";
import { CtaBand, Margin, PageIntro } from "@/components/site/Chrome";
import { meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/services")({
  head: () =>
    meta(
      "Property Advisory & Buying Services · Avrasya Properties",
      "Ten end-to-end property advisory services covering personalized search, Turkish citizenship, independent legal checks, interior setup, and ongoing management.",
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
    title: "Personalized Property Advisory",
    category: "Planning",
    desc: "We sit down with you to understand your lifestyle, budget, and family goals, recommending the best Istanbul neighborhoods that match what you're looking for.",
    deliverables: ["Neighborhood price guides", "Expected rental returns", "Clear cost breakdowns"],
    icon: LineChart,
  },
  {
    num: "02",
    title: "Handpicked Homes & Guided Tours",
    category: "Viewing",
    desc: "Explore handpicked homes that match your criteria. We accompany you on private, comfortable viewings across Istanbul or host live, high-definition video walkthroughs.",
    deliverables: ["Shortlist of vetted homes", "Chauffeured private tours", "Live interactive video tours"],
    icon: Compass,
  },
  {
    num: "03",
    title: "Turkish Citizenship Guidance",
    category: "Citizenship & Residency",
    desc: "Full, stress-free support for you and your family to secure Turkish citizenship by investing $400,000 or more in qualifying property.",
    deliverables: ["Government valuation checks", "Official conformity approval", "Passports for the whole family"],
    icon: Landmark,
  },
  {
    num: "04",
    title: "Independent Legal & Title Checks",
    category: "Legal Protection",
    desc: "We connect you with independent, English-speaking Turkish bar attorneys who review contracts, perform full title deed checks, and protect your rights.",
    deliverables: ["Tax number registration", "Turkish bank account opening", "Clean, debt-free title deed verification"],
    icon: Scale,
  },
  {
    num: "05",
    title: "Safe Bank Transfers & Currency Exchange",
    category: "Payment & Closing",
    desc: "We guide your international bank transfers and handle the official Central Bank currency certificate (DAB), ensuring secure payments at fair government rates.",
    deliverables: ["Official Central Bank DAB certificate", "Secure payment coordination", "Multi-currency wire assistance"],
    icon: FileCheck,
  },
  {
    num: "06",
    title: "Investor Residence Permits (İkamet)",
    category: "Citizenship & Residency",
    desc: "Fast-track residency for you and your family with no minimum stay requirements, allowing you to live, visit, or travel in Türkiye with complete freedom.",
    deliverables: ["Health insurance guidance", "Biometrics appointment booking", "Permit delivery to your door"],
    icon: Users,
  },
  {
    num: "07",
    title: "Handover Inspection & Home Furnishing",
    category: "Move-In & Setup",
    desc: "Before you accept keys, we inspect every corner of the property to ensure flawless finishes. We also help set up utilities, internet, and beautiful interior furnishing.",
    deliverables: ["Detailed room-by-room inspection", "Furnishing & interior design packages", "Water, electricity & internet setup"],
    icon: Key,
  },
  {
    num: "08",
    title: "Rental & Tenant Management",
    category: "Rental Management",
    desc: "Earn reliable rental income without the day-to-day hassle. We vet quality tenants, prepare official agreements, collect rent, and oversee maintenance.",
    deliverables: ["Tenant screening & agreements", "Monthly rent collection", "Regular property check-ups"],
    icon: Building2,
  },
  {
    num: "09",
    title: "Future Resale & Marketing",
    category: "Resale & Growth",
    desc: "When you are ready to sell—especially after 5 years when profits are 100% tax-free—we appraise your home and present it to our global network of buyers.",
    deliverables: ["Updated market appraisal", "Global buyer marketing", "Smooth title deed transfer"],
    icon: Layers,
  },
  {
    num: "10",
    title: "Family Relocation & Settling-In Support",
    category: "Family Support",
    desc: "We help your family settle smoothly in Istanbul, assisting with international school enrollments, private banking introductions, and local life tips.",
    deliverables: ["School introductions", "Private banking guidance", "Friendly local concierge"],
    icon: ShieldCheck,
  },
];

const PHASES = [
  {
    stage: "Phase 1",
    title: "Getting Started & Planning",
    desc: "We discuss your goals, budget, and favorite areas, giving you an honest overview of the Istanbul market before you look at properties.",
  },
  {
    stage: "Phase 2",
    title: "Curated Selection & Safety Check",
    desc: "We handpick homes that suit you, inspect them in person, and verify the developer's track record and official valuation.",
  },
  {
    stage: "Phase 3",
    title: "Clear Contracts & Title Transfer",
    desc: "Your attorney reviews the sales contract, we guide your bank transfer safely, and you receive your official freehold title deed (Tapu).",
  },
  {
    stage: "Phase 4",
    title: "Citizenship & Residency Filing",
    desc: "If you are applying for Turkish citizenship or residency, our legal team submits your paperwork for quick and smooth approval.",
  },
  {
    stage: "Phase 5",
    title: "Handover Inspection & Move-In",
    desc: "We conduct a thorough final inspection, hand over the keys, activate utilities, and help furnish your home to perfection.",
  },
  {
    stage: "Phase 6",
    title: "Rental Income & Ongoing Peace of Mind",
    desc: "We help you welcome reputable tenants for steady rental income and provide ongoing support whenever you need it.",
  },
];

export function ServicesPage() {
  const serviceQuery=useServices();
  const faqQuery=useFaqs();
  const services:ServiceItem[]=DEMO_MODE?SERVICES:(serviceQuery.data||[]).map((s,i)=>({num:String(i+1).padStart(2,"0"),title:s.title,category:s.category||"Advisory",desc:s.description,deliverables:s.process_steps.filter((x):x is string=>typeof x==="string"),icon:Building2}));
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All",...new Set(services.map(s=>s.category))];

  const filtered = activeCategory === "All" ? services : services.filter(s => s.category === activeCategory);

  return (
    <>
      <PageIntro
        eyebrow="Complete Buyer Support · Every Step of the Way"
        title={
          <>
            Comprehensive guidance across every <em>stage of your purchase.</em>
          </>
        }
      >
        <p>
          We make buying and owning property in Istanbul straightforward and stress-free. From selecting the right home to receiving your keys and Turkish passport, our team coordinates with independent lawyers and government-licensed experts to keep your purchase completely safe.
        </p>
      </PageIntro>

      {/* Ten Services Section */}
      <section className="container-site py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="eyebrow">Our Services</p>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">The Ten Ways We Support You</h2>
            <p className="mt-2 text-sm text-muted-foreground">Filter by what you need—from initial planning to settling into your new home.</p>
          </div>

          <div className="flex flex-wrap gap-1.5 rounded-xs border border-border/80 bg-card p-1 text-xs shadow-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xs px-3 py-1.5 font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-primary text-on-dark shadow-xs font-semibold"
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
            <div key={s.num} className="card-elevate group rounded-xs border border-border/80 bg-card p-6 shadow-xs transition-all hover:border-brass/70 hover:shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-brass">{s.num}</span>
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {s.category}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xs bg-brass/10 text-brass">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">{s.title}</h3>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>

              <div className="mt-6 border-t pt-4 space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Core Deliverables</p>
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
            <p className="eyebrow text-brass">Simple Buying Journey</p>
            <h2 className="font-display text-3xl font-semibold md:text-4xl text-on-dark">
              Your Six-Step Buying Experience
            </h2>
            <p className="mt-3 text-on-dark-muted">
              Designed to give you complete peace of mind, financial safety, and absolute clarity at every step.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PHASES.map((p, i) => (
              <div key={p.stage} className="card-elevate rounded-xs border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-brass/50 hover:bg-white/8">
                <span className="font-mono text-xs font-bold text-brass uppercase tracking-widest">{p.stage}</span>
                <h3 className="mt-2 font-display text-xl font-bold text-on-dark">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-dark-muted">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-site py-12 flex justify-center">
        <Link to="/contact" className="btn btn-primary text-base px-8 py-3 shadow-md btn-shimmer">
          Book a Free Consultation
        </Link>
      </div>

      {!DEMO_MODE && <section className="container-site py-10">{serviceQuery.isError && <p role="alert">Services are temporarily unavailable.</p>}{(faqQuery.data||[]).map(faq=><details key={faq.id} className="border-b py-4"><summary className="cursor-pointer font-medium">{faq.question}</summary><p className="mt-3 text-muted-foreground">{faq.answer}</p></details>)}</section>}<CtaBand />
    </>
  );
}
