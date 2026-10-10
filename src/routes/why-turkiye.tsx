import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { 
  Building, 
  Compass, 
  GraduationCap, 
  HeartHandshake, 
  MapPin, 
  Plane, 
  Scale, 
  ShieldCheck, 
  Train, 
  TrendingUp, 
  Waves 
} from "lucide-react";
import { CtaBand, Margin, PageIntro } from "@/components/site/Chrome";
import { meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/why-turkiye")({
  head: () =>
    meta(
      "Why Türkiye & Istanbul Real Estate · Avrasya Properties",
      "Macro analysis, district investment dynamics, and freehold property rights in Istanbul for international purchasers and family offices."
    ),
  component: WhyTurkiye,
});

type DistrictProfile = {
  name: string;
  side: "European" | "Asian";
  category: string;
  pricePerM2: string;
  yieldRange: string;
  tagline: string;
  features: string[];
  image: string;
};

const DISTRICTS: DistrictProfile[] = [
  {
    name: "Maslak & Sariyer",
    side: "European",
    category: "Financial & Corporate Center",
    pricePerM2: "$4,500 – $9,000",
    yieldRange: "6.5% – 8.0%",
    tagline: "The Manhattan of Istanbul; headquarters of multinational corporations and prestige towers.",
    features: ["Direct M2 metro link", "Belgrad Forest proximity", "High executive tenant demand"],
    image: "/images/properties/istanbul-project-01.jpg",
  },
  {
    name: "Ataşehir & IFC",
    side: "Asian",
    category: "Financial District",
    pricePerM2: "$3,200 – $6,500",
    yieldRange: "7.0% – 8.5%",
    tagline: "The newly opened Istanbul Financial Center (IFC) consolidating public & private banking giants.",
    features: ["M4 & M12 metro lines", "Modern gated complexes", "Massive corporate tenancy inflow"],
    image: "/images/properties/atasehir-residence-1.jpg",
  },
  {
    name: "Şişli & Bomonti",
    side: "European",
    category: "Urban Luxury & Culture",
    pricePerM2: "$4,200 – $8,500",
    yieldRange: "6.0% – 7.5%",
    tagline: "Five-star hotel branded residences, art galleries, and immediate proximity to Nişantaşı.",
    features: ["Walking distance to luxury boutiques", "High Airbnb yield zone", "Architectural heritage"],
    image: "/images/properties/sisli-luxury-1.jpg",
  },
  {
    name: "Avrupa Residence Oryapark & Ümraniye",
    side: "Asian",
    category: "Master-Planned Twin Towers",
    pricePerM2: "$3,800 – $7,200",
    yieldRange: "6.8% – 8.2%",
    tagline: "Architectural twin towers on Küçüksu Avenue with private landscaped retail park and transit artery.",
    features: ["Direct FSM bridge corridor", "Integrated retail avenue", "Dual tower leisure facilities"],
    image: "/images/properties/orya-park-exterior.jpg",
  },
  {
    name: "Topkapı & Historic Peninsula Corridor",
    side: "European",
    category: "Central Urban Renewal",
    pricePerM2: "$2,800 – $4,800",
    yieldRange: "7.0% – 8.2%",
    tagline: "Strategic transit interchange surrounded by 6 major university campuses and teaching hospitals.",
    features: ["Tramway & Metro lines", "High student/medic rental pool", "Strong entry price point"],
    image: "/images/properties/istanbul-project-47.jpg",
  },
];

export function WhyTurkiye() {
  const [activeSide, setActiveSide] = useState<"All" | "European" | "Asian">("All");

  const filteredDistricts = DISTRICTS.filter(
    (d) => activeSide === "All" || d.side === activeSide
  );

  return (
    <>
      <PageIntro
        eyebrow="Market Intelligence · Geographic & Economic Analysis"
        title={
          <>
            Istanbul: where continents meet, <em>capital accelerates.</em>
          </>
        }
      >
        <p>
          More than an iconic skyline, Istanbul is a megacity of 16 million residents driving continuous organic domestic demand. With 100% unconditional freehold ownership and strategic transcontinental logistics, Türkiye represents one of the most compelling real estate markets worldwide.
        </p>
      </PageIntro>

      {/* 4 Core Pillars */}
      <section className="border-b bg-card py-16">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="eyebrow">Macro Fundamentals</p>
            <h2 className="font-display text-3xl font-semibold">The Four Pillars of Istanbul Real Estate</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-background p-6">
              <div className="h-10 w-10 rounded-lg bg-brass/10 text-brass flex items-center justify-center mb-4">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">Freehold Ownership</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Foreign purchasers hold identical statutory rights to Turkish nationals: 100% unconditional freehold title (Mülkiyet) in perpetuity, never 99-year leasehold.
              </p>
            </div>

            <div className="rounded-xl border bg-background p-6">
              <div className="h-10 w-10 rounded-lg bg-brass/10 text-brass flex items-center justify-center mb-4">
                <Plane className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">Aviation & Logistics Hub</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Istanbul Airport (IST) connects to 300+ international destinations within a 4-hour flight radius of Europe, Central Asia, and the Gulf.
              </p>
            </div>

            <div className="rounded-xl border bg-background p-6">
              <div className="h-10 w-10 rounded-lg bg-brass/10 text-brass flex items-center justify-center mb-4">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">Organic Rental Liquidity</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A youthful median population (33 years old) creating tens of thousands of new domestic households annually, insulating rental occupancy from purely tourism cycles.
              </p>
            </div>

            <div className="rounded-xl border bg-background p-6">
              <div className="h-10 w-10 rounded-lg bg-brass/10 text-brass flex items-center justify-center mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">Statutory Safeguards</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Compulsory central bank foreign exchange valuation (DAB), SPK-regulated appraisals, and licensed title deed escrow procedures protect foreign buyers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* District Intelligence Explorer */}
      <section className="container-site py-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end mb-10">
          <div>
            <p className="eyebrow">District Comparative Analysis</p>
            <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
              Micro-Market Pricing & Rental Yields
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Different districts serve fundamentally different investor briefs—from corporate executive rental yield to generational Bosphorus capital preservation.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="inline-flex rounded-lg border bg-card p-1 text-xs">
            {(["All", "European", "Asian"] as const).map((side) => (
              <button
                key={side}
                onClick={() => setActiveSide(side)}
                className={`rounded-md px-4 py-2 font-medium transition-colors ${
                  activeSide === side ? "bg-brass text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {side === "All" ? "All Districts" : `${side} Side`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDistricts.map((d) => (
            <div key={d.name} className="group overflow-hidden rounded-xl border bg-card transition-all hover:border-brass hover:shadow-lg">
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src={d.image}
                  alt={d.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 rounded-md bg-ink/80 px-2.5 py-1 text-[11px] font-medium text-on-dark backdrop-blur-sm">
                  {d.side} Side · {d.category}
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-foreground">{d.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.tagline}</p>

                <div className="mt-5 grid grid-cols-2 gap-3 rounded-lg border bg-background p-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Avg Price / m²</span>
                    <span className="font-mono font-bold text-foreground">{d.pricePerM2}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Gross Rental Yield</span>
                    <span className="font-mono font-bold text-brass">{d.yieldRange}</span>
                  </div>
                </div>

                <div className="mt-5 space-y-1.5 border-t pt-4">
                  {d.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-brass" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Global Lifestyle & Family Integration */}
      <section className="border-t bg-ink text-on-dark py-20">
        <div className="container-site">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow text-brass">Global Family Quality of Life</p>
            <h2 className="font-display text-3xl font-semibold md:text-4xl text-on-dark">
              World-Class Infrastructure for Expatriate Families
            </h2>
            <p className="mt-3 text-on-dark-muted">
              Istanbul provides premier healthcare, international accreditation, and seamless intercontinental transport networks.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <GraduationCap className="h-6 w-6 text-brass mb-3" />
              <h3 className="font-display text-lg font-semibold text-on-dark">40+ International Schools</h3>
              <p className="mt-2 text-sm text-on-dark-muted leading-relaxed">
                British curriculum, American high schools (Robert College), and International Baccalaureate (IB) academies teach in English, French, and German.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <HeartHandshake className="h-6 w-6 text-brass mb-3" />
              <h3 className="font-display text-lg font-semibold text-on-dark">JCI-Accredited Healthcare</h3>
              <p className="mt-2 text-sm text-on-dark-muted leading-relaxed">
                Hospital groups such as Acıbadem, Memorial, and Koç University Hospital are renowned globally for surgical excellence and multilingual patient care.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <Train className="h-6 w-6 text-brass mb-3" />
              <h3 className="font-display text-lg font-semibold text-on-dark">Unified Transit Grid</h3>
              <p className="mt-2 text-sm text-on-dark-muted leading-relaxed">
                Marmaray connects Europe and Asia under the Bosphorus in 4 minutes; the M11 metro line speeds between Kagıthane and Istanbul Airport in under 24 minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-site py-12 flex justify-center">
        <Link to="/properties" className="btn btn-primary text-base px-8 py-3">
          Explore Istanbul Investment Offers
        </Link>
      </div>

      <CtaBand />
    </>
  );
}
