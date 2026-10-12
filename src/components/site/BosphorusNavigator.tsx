import { useWhatsAppLink } from "@/hooks/useLiveContact";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Compass,
  MapPin,
  MessageSquare,
  Navigation,
  Plane,
  ShieldCheck,
  Train,
  TrendingUp,
  Waves,
} from "lucide-react";

type CorridorData = {
  id: string;
  name: string;
  subName: string;
  side: "European" | "Asian";
  tagline: string;
  priceM2: string;
  yieldRate: string;
  appreciation: string;
  airportTime: string;
  transit: string;
  tenantProfile: string;
  titleDeedStatus: string;
  coordinates: string;
  image: string;
  locParam: string;
  keyStrengths: string[];
};

const CORRIDORS: CorridorData[] = [
  // European Axis
  {
    id: "maslak",
    name: "Maslak & Sariyer",
    subName: "Modern Business & Lifestyle Hub",
    side: "European",
    tagline:
      "The bustling corporate heart of Istanbul. Home to multinational headquarters, prestigious residential towers, and tranquil forest surroundings.",
    priceM2: "$4,800 – $8,500",
    yieldRate: "7.0% – 8.2%",
    appreciation: "14% – 18% p.a.",
    airportTime: "28 mins to IST Airport",
    transit: "Direct M2 Metro Line (İTÜ / Maslak Station)",
    tenantProfile: "Multinational Directors, Tech Executives, Medical Specialists",
    titleDeedStatus: "100% Freehold Title Deed (Clean & debt-free)",
    coordinates: "41°06'32\"N 29°01'15\"E",
    image: "/images/properties/istanbul-project-01.jpg",
    locParam: "Maslak",
    keyStrengths: [
      "Consistent high demand from international executives",
      "Fresh air from Belgrad Forest with rapid highway connectivity",
      "Walking distance to premier shopping at Vadistanbul & İstinyePark",
    ],
  },
  {
    id: "sisli",
    name: "Şişli & Bomonti",
    subName: "Boutique Luxury & Culture",
    side: "European",
    tagline:
      "Minutes from high-end Nişantaşı boutiques. A premier destination for stylish 5-star hotel residences and vibrant cultural life.",
    priceM2: "$4,200 – $7,800",
    yieldRate: "6.8% – 7.8%",
    appreciation: "12% – 16% p.a.",
    airportTime: "32 mins to IST Airport",
    transit: "M2 Osmanbey & Şişli-Mecidiyeköy interchange",
    tenantProfile: "Diplomats, Creative Directors, Medical Specialists",
    titleDeedStatus: "Ready Title Deeds · Verified Government Appraisal",
    coordinates: "41°03'28\"N 28°59'12\"E",
    image: "/images/properties/sisli-luxury-1.jpg",
    locParam: "Şişli",
    keyStrengths: [
      "Strong demand for short-term stays and executive rentals",
      "Right next to the Bomontiada arts center and fine dining",
      "Consistent popularity among international home buyers",
    ],
  },
  {
    id: "besiktas",
    name: "Beşiktaş & Waterfront",
    subName: "Prime Waterfront & Historic Beauty",
    side: "European",
    tagline:
      "Iconic waterfront shoreline offering historic palaces, leafy parks, and world-renowned five-star luxury hotels.",
    priceM2: "$7,500 – $14,000",
    yieldRate: "5.5% – 6.5%",
    appreciation: "Timeless Value & Global Distinction",
    airportTime: "35 mins to IST Airport",
    transit: "Bosphorus Sea Taxi (Deniz Taksi) Pier & M7 Kabataş Line",
    tenantProfile: "Ambassadors, C-Suite Leaders, International Families",
    titleDeedStatus: "Official Protected Freehold Title Deed",
    coordinates: "41°02'38\"N 29°00'22\"E",
    image: "/images/properties/hero-main.jpg",
    locParam: "Beşiktaş",
    keyStrengths: [
      "Unmatched front-row panoramas across the Bosphorus Strait",
      "Protected architectural zoning ensuring lifelong exclusivity",
      "Quick 8-minute ferry boat ride across to the Asian shore",
    ],
  },
  {
    id: "topkapi",
    name: "Topkapı & Zeytinburnu",
    subName: "Family Living & Central Parks",
    side: "European",
    tagline:
      "Modern gated residential communities with lush gardens, minutes from historic city walls and direct citywide transit.",
    priceM2: "$2,900 – $4,600",
    yieldRate: "7.2% – 8.5%",
    appreciation: "15% – 20% p.a.",
    airportTime: "34 mins to IST Airport",
    transit: "Cevizlibağ Tram, Metrobus & M1 Marmaray Connectors",
    tenantProfile: "International Families, University Professors, Healthcare Professionals",
    titleDeedStatus: "100% Ready Deed · Eligible for Turkish Citizenship",
    coordinates: "41°01'09\"N 28°55'40\"E",
    image: "/images/properties/project-interior-01.jpg",
    locParam: "Topkapı",
    keyStrengths: [
      "Rich family amenities: landscaped gardens, indoor pools, and playgrounds",
      "Attractive entry price per m² ideal for Turkish Citizenship",
      "Direct transit links to both the historic old city and business districts",
    ],
  },

  // Asian Axis
  {
    id: "atasehir",
    name: "Ataşehir & IFC",
    subName: "New Financial Center",
    side: "Asian",
    tagline:
      "Türkiye's landmark financial district, bringing together the Central Bank, leading national banks, and global financial firms.",
    priceM2: "$3,400 – $6,500",
    yieldRate: "7.5% – 8.8%",
    appreciation: "18% – 24% p.a. (Post-IFC opening)",
    airportTime: "24 mins to Sabiha Gökçen (SAW) Airport",
    transit: "M4 Kadıköy-Sabiha & M12 Financial Center Metro Lines",
    tenantProfile: "Banking Professionals, Corporate Executives, Financial Analysts",
    titleDeedStatus: "100% Freehold Title Deed · Pre-cleared for Foreign Buyers",
    coordinates: "40°59'48\"N 29°07'25\"E",
    image: "/images/properties/atasehir-residence-1.jpg",
    locParam: "Ataşehir",
    keyStrengths: [
      "Thriving hub with over 50,000 corporate professionals",
      "Modern master-planned residences with high seismic safety standards",
      "Exceptional year-round rental occupancy and tenant reliability",
    ],
  },
  {
    id: "umraniye",
    name: "Ümraniye & Oryapark",
    subName: "Modern Residential & Easy Commute",
    side: "Asian",
    tagline:
      "Striking residential twin towers situated right at the junction connecting Istanbul's two major Bosphorus bridges.",
    priceM2: "$2,800 – $5,200",
    yieldRate: "7.2% – 8.4%",
    appreciation: "15% – 18% p.a.",
    airportTime: "26 mins to SAW Airport · 35 mins to IST",
    transit: "M5 Üsküdar-Çekmeköy Metro Line & TEM Highway",
    tenantProfile: "Operations Managers, Engineers, Corporate Teams",
    titleDeedStatus: "Ready Freehold Title Deed · Immediate Registration",
    coordinates: "41°01'33\"N 29°06'10\"E",
    image: "/images/properties/orya-park-exterior.jpg",
    locParam: "Ümraniye",
    keyStrengths: [
      "Direct access to the 2nd Bosphorus Bridge (FSM) highway",
      "On-site shopping avenues, cafes, and hotels within walking distance",
      "Excellent value-for-money with move-in-ready, modern finishes",
    ],
  },
  {
    id: "kadikoy",
    name: "Kadıköy & Bağdat Avenue",
    subName: "Seaside Living & Coastal Avenue",
    side: "Asian",
    tagline:
      "The premier seaside lifestyle district of the Asian shore. Tree-lined promenades, gourmet cafes, yacht marinas, and peaceful parks.",
    priceM2: "$4,500 – $9,200",
    yieldRate: "6.0% – 7.0%",
    appreciation: "High Domestic Demand & Strong Liquidity",
    airportTime: "28 mins to SAW Airport",
    transit: "Marmaray Train Line & Kalamış Marina Ferry",
    tenantProfile: "Established Families, Medical Consultants, Marine Executives",
    titleDeedStatus: "Individual Freehold Title Deed (Kat Mülkiyeti)",
    coordinates: "40°58'12\"N 29°03'45\"E",
    image: "/images/properties/hero-main.jpg",
    locParam: "Kadıköy",
    keyStrengths: [
      "8 kilometers of continuous coastal seaside parks along the Marmara Sea",
      "High popularity with local Turkish buyers ensuring effortless future resale",
      "Prestigious yacht marina, private academies, and boutique shopping",
    ],
  },
  {
    id: "uskudar",
    name: "Üsküdar & Çamlıca",
    subName: "Historic Charm & Bosphorus Views",
    side: "Asian",
    tagline:
      "The historic, tranquil soul of the Asian Bosphorus. Low-rise residences overlooking Maiden's Tower and the historic peninsula.",
    priceM2: "$4,000 – $7,800",
    yieldRate: "6.2% – 7.2%",
    appreciation: "Long-Term Prestige & Historic Scarcity",
    airportTime: "30 mins to SAW Airport",
    transit: "Marmaray Undersea Tunnel (Üsküdar to Europe in 4 mins)",
    tenantProfile: "Consular Diplomats, Private Collectors, International Families",
    titleDeedStatus: "Protected Historic Freehold Title Deed",
    coordinates: "41°01'22\"N 29°01'44\"E",
    image: "/images/properties/sisli-luxury-1.jpg",
    locParam: "Üsküdar",
    keyStrengths: [
      "Fastest journey between continents: 4 minutes undersea by train",
      "Sweeping sunset views over the historic minarets of Istanbul",
      "Low-density private neighborhoods surrounded by protected greenery",
    ],
  },
];

export function BosphorusNavigator({ embedded = false }: { embedded?: boolean } = {}) {
  const waLink=useWhatsAppLink();
  const [side, setSide] = useState<"European" | "Asian">("European");
  const filteredCorridors = CORRIDORS.filter((c) => c.side === side);
  const [selectedId, setSelectedId] = useState<string>(filteredCorridors[0]!.id);
  const navigate = useNavigate();

  const active = CORRIDORS.find((c) => c.id === selectedId) || filteredCorridors[0]!;

  const content = (
    <div className="relative z-10">
      {/* Section Header */}
      {!embedded ? (
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between border-b border-border/70 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="pulse-live h-2 w-2 rounded-full bg-emerald-500 mr-1" />
              <p className="eyebrow !text-brass-text">Explore Istanbul Neighborhoods</p>
            </div>
            <h2 className="headline text-3xl md:text-5xl text-foreground">
              Istanbul District{" "}
              <em className="italic text-brass font-normal">Guide & Highlights</em>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Side Switcher (Europe vs Asia) */}
            <div className="inline-flex rounded-xs border border-border/80 bg-card p-1 shadow-xs">
              <button
                onClick={() => {
                  setSide("European");
                  setSelectedId("maslak");
                }}
                className={`flex items-center gap-2 rounded-xs px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  side === "European"
                    ? "bg-primary text-on-dark shadow-sm btn-shimmer"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Building2 className="h-3.5 w-3.5 text-brass" />
                <span>European Side</span>
              </button>

              <button
                onClick={() => {
                  setSide("Asian");
                  setSelectedId("atasehir");
                }}
                className={`flex items-center gap-2 rounded-xs px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  side === "Asian"
                    ? "bg-primary text-on-dark shadow-sm btn-shimmer"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Compass className="h-3.5 w-3.5 text-brass" />
                <span>Asian Side</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
          <div className="flex items-center gap-2">
            <span className="pulse-live h-2 w-2 rounded-full bg-emerald-500 mr-1" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Explore Istanbul Neighborhoods
            </span>
          </div>

          {/* Side Switcher (Europe vs Asia) */}
          <div className="inline-flex rounded-xs border border-border/80 bg-card p-1 shadow-xs">
            <button
              onClick={() => {
                setSide("European");
                setSelectedId("maslak");
              }}
              className={`flex items-center gap-2 rounded-xs px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                side === "European"
                  ? "bg-primary text-on-dark shadow-sm btn-shimmer"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Building2 className="h-3.5 w-3.5 text-brass" />
              <span>European Side</span>
            </button>

            <button
              onClick={() => {
                setSide("Asian");
                setSelectedId("atasehir");
              }}
              className={`flex items-center gap-2 rounded-xs px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                side === "Asian"
                  ? "bg-primary text-on-dark shadow-sm btn-shimmer"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Compass className="h-3.5 w-3.5 text-brass" />
              <span>Asian Side</span>
            </button>
          </div>
        </div>
      )}

        {/* Interactive Main Body: District Selectors & Deep Intelligence Card */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.6fr] items-start">
          {/* Corridor Selection List */}
          <div className="space-y-3" role="tablist" aria-label="District Corridors">
            <p className="text-[0.68rem] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              Choose a Neighborhood ({filteredCorridors.length} Areas)
            </p>

            {filteredCorridors.map((c, i) => {
              const isSelected = c.id === active.id;
              return (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedId(c.id)}
                  className={`card-elevate group relative flex w-full flex-col overflow-hidden rounded-xs border p-4 text-left transition-all duration-300 ${
                    isSelected
                      ? "border-brass bg-card shadow-md border-l-4 border-l-brass -translate-y-0.5"
                      : "border-border/70 bg-card/60 hover:border-brass/60 hover:bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold tracking-wider text-brass uppercase">
                      Area 0{i + 1} · {c.side} Side
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {c.locParam}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-semibold text-foreground mt-1 group-hover:text-brass transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{c.subName}</p>

                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-xs">
                    <span className="font-sans font-medium text-foreground">
                      {c.priceM2} <span className="text-[10px] text-muted-foreground">/ m²</span>
                    </span>
                    <span className="text-[11px] font-semibold text-brass">
                      Return: {c.yieldRate}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Deep Architectural Intelligence Dossier for Active District */}
          <div className="ambient-glow">
            <div className="card-elevate rounded-xs border border-border/80 bg-card/95 backdrop-blur-md shadow-lg p-6 sm:p-8 flex flex-col justify-between">
              {/* Top Registration Info */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
                      District Overview
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      Ref: {active.id.toUpperCase()}-IST
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-brass font-medium">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {active.side} Istanbul · {active.locParam}
                    </span>
                  </div>
                </div>

                {/* District Hero Title & Photo Banner */}
                <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_1fr]">
                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
                      {active.name}
                    </h3>
                    <p className="text-xs font-medium text-brass mt-0.5 uppercase tracking-wider">
                      {active.subName} · {active.side} Side
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {active.tagline}
                    </p>
                  </div>

                  <div className="img-zoom-container relative aspect-[16/10] overflow-hidden rounded-xs border border-border/70 bg-muted group">
                    <img
                      src={active.image}
                      alt={active.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <span className="glass-pill-dark absolute bottom-2 left-2 rounded px-2.5 py-1 text-[10px] font-mono text-brass shadow-sm">
                      {active.yieldRate} Expected Return
                    </span>
                  </div>
                </div>

                {/* Financial & Statutory Key Metrics Grid */}
                <div className="mt-8 grid grid-cols-2 gap-4 border-y border-border/70 py-5 sm:grid-cols-4 bg-secondary/30 -mx-6 sm:-mx-8 px-6 sm:px-8">
                  <div className="rounded-xs border border-border/60 bg-card/80 p-3 transition-transform duration-300 hover:-translate-y-0.5 shadow-xs">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Price Range
                    </p>
                    <p className="font-display text-lg font-semibold text-foreground mt-0.5">
                      {active.priceM2}
                    </p>
                    <p className="text-[10px] text-muted-foreground">per m² USD</p>
                  </div>
                  <div className="rounded-xs border border-border/60 bg-card/80 p-3 transition-transform duration-300 hover:-translate-y-0.5 shadow-xs">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Expected Rental Return
                    </p>
                    <p className="font-display text-lg font-semibold text-brass mt-0.5">
                      {active.yieldRate}
                    </p>
                    <p className="text-[10px] text-muted-foreground">USD indexed contracts</p>
                  </div>
                  <div className="rounded-xs border border-border/60 bg-card/80 p-3 transition-transform duration-300 hover:-translate-y-0.5 shadow-xs">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Airport Travel
                    </p>
                    <p className="font-sans text-xs font-semibold text-foreground mt-1 flex items-center gap-1">
                      <Plane className="h-3 w-3 text-brass" /> {active.airportTime}
                    </p>
                  </div>
                  <div className="rounded-xs border border-border/60 bg-card/80 p-3 transition-transform duration-300 hover:-translate-y-0.5 shadow-xs">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Value Growth
                    </p>
                    <p className="font-sans text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> {active.appreciation}
                    </p>
                  </div>
                </div>

                {/* Due Diligence Checklist Highlights */}
                <div className="mt-6 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-brass" />
                    <span>Why You'll Love This Neighborhood</span>
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {active.keyStrengths.map((str, idx) => (
                      <div
                        key={idx}
                        className="rounded-xs border border-border/70 bg-card p-3 text-xs text-muted-foreground leading-relaxed flex flex-col justify-between hover:border-brass/50 transition-colors"
                      >
                        <span className="font-mono text-[9px] text-brass mb-1">0{idx + 1}</span>
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Title Deed & Tenancy Footnote */}
                <div className="mt-4 rounded-xs border border-border/80 bg-secondary/40 p-3.5 text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-semibold text-primary uppercase">
                      Title Deed:
                    </span>
                    <span className="text-foreground font-medium">{active.titleDeedStatus}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-semibold text-primary uppercase">
                      Tenant Profile:
                    </span>
                    <span>{active.tenantProfile}</span>
                  </div>
                </div>
              </div>

              {/* Direct Action CTAs */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-5">
                <button
                  onClick={() => navigate({ to: "/properties", search: { q: active.locParam } })}
                  className="btn btn-primary shadow-xs gap-2 btn-shimmer"
                >
                  <span>View Available Homes in {active.name}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <a
                  href={waLink(
                    `Hello Avrasya Properties, I am exploring homes in ${active.name} on your website. I would love to see available properties in this area.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline gap-2 hover:border-brass hover:text-brass transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-brass" />
                  <span>Request {active.locParam} Private Dossier</span>
                </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <section className="relative border-y border-border/80 bg-background py-16 md:py-24 overflow-hidden">
      <div className="container-site relative z-10">
        {content}
      </div>
    </section>
  );
}
