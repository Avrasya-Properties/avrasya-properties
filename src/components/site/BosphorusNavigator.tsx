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
  Waves 
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
    subName: "Skyscraper Executive Axis",
    side: "European",
    tagline: "The Manhattan of Istanbul. Headquarters of multinational banks, tech giants, and prestige corporate residential towers.",
    priceM2: "$4,800 – $8,500",
    yieldRate: "7.0% – 8.2%",
    appreciation: "14% – 18% p.a.",
    airportTime: "28 mins to IST Airport",
    transit: "Direct M2 Metro Line (İTÜ / Maslak Station)",
    tenantProfile: "Multinational Directors, Tech Executives, Private Hospital Consultants",
    titleDeedStatus: "Kat Mülkiyeti (Full Freehold Title Deed) with zero municipal liens",
    coordinates: "41°06'32\"N 29°01'15\"E",
    image: "/images/properties/istanbul-project-01.jpg",
    locParam: "Maslak",
    keyStrengths: [
      "Highest corporate USD rental payment track record",
      "Belgrad Forest micro-climate and immediate northern highway link",
      "Walking distance to Vadistanbul & İstinyePark luxury shopping"
    ]
  },
  {
    id: "sisli",
    name: "Şişli & Bomonti",
    subName: "Cosmopolitan Luxury & Arts Hub",
    side: "European",
    tagline: "Minutes from Nişantaşı couture boutiques. Prime destination for 5-star hotel branded residences and high-liquidity luxury suites.",
    priceM2: "$4,200 – $7,800",
    yieldRate: "6.8% – 7.8%",
    appreciation: "12% – 16% p.a.",
    airportTime: "32 mins to IST Airport",
    transit: "M2 Osmanbey & Şişli-Mecidiyeköy interchange",
    tenantProfile: "Foreign Diplomats, Media & Art Executives, Nişantaşı Medical Specialists",
    titleDeedStatus: "Ready Title Deeds · SPK Certified Appraisals on File",
    coordinates: "41°03'28\"N 28°59'12\"E",
    image: "/images/properties/sisli-luxury-1.jpg",
    locParam: "Şişli",
    keyStrengths: [
      "High short-stay & executive corporate lease demand",
      "Immediate proximity to Bomontiada cultural center and five-star hotels",
      "Rapid resale liquidity driven by international investor concentration"
    ]
  },
  {
    id: "besiktas",
    name: "Beşiktaş & Waterfront",
    subName: "Bosphorus Frontline & Trophy Heritage",
    side: "European",
    tagline: "Ultra-prime waterfront territory offering scarcity value, historic embassies, and world-renowned five-star palace hotels.",
    priceM2: "$7,500 – $14,000",
    yieldRate: "5.5% – 6.5%",
    appreciation: "Preservation of Capital & Global Trophy Status",
    airportTime: "35 mins to IST Airport",
    transit: "Bosphorus Sea Taxi (Deniz Taksi) Pier & M7 Kabataş Line",
    tenantProfile: "Ambassadorial Staff, C-Suite Leaders, Ultra-HNW Families",
    titleDeedStatus: "Strict Bosphorus Conservation Board Certified Freehold Deeds",
    coordinates: "41°02'38\"N 29°00'22\"E",
    image: "/images/properties/hero-main.jpg",
    locParam: "Beşiktaş",
    keyStrengths: [
      "Irreplaceable Bosphorus Strait frontline panoramas",
      "Strict zoning preventing new supply; permanent asset exclusivity",
      "Direct water ferry transit to Asian shore in under 8 minutes"
    ]
  },
  {
    id: "topkapi",
    name: "Topkapı & Zeytinburnu",
    subName: "Family Living & Central Arterial Axis",
    side: "European",
    tagline: "Modern gated residential compounds with lush gardens, minutes from historic city walls and direct E-5 transit arteries.",
    priceM2: "$2,900 – $4,600",
    yieldRate: "7.2% – 8.5%",
    appreciation: "15% – 20% p.a.",
    airportTime: "34 mins to IST Airport",
    transit: "Cevizlibağ Tram, Metrobus & M1 Marmaray Connectors",
    tenantProfile: "International Families, University Academics, Healthcare Investors",
    titleDeedStatus: "100% Ready Deed · Turkish Citizenship ($400k) Ideal Package",
    coordinates: "41°01'09\"N 28°55'40\"E",
    image: "/images/properties/project-interior-01.jpg",
    locParam: "Topkapı",
    keyStrengths: [
      "Extensive on-site family amenities, private schools & indoor pools",
      "Lower entry m² threshold maximizing Turkish Citizenship allocation",
      "Direct highway arterial access to both old city and business districts"
    ]
  },

  // Asian Axis
  {
    id: "atasehir",
    name: "Ataşehir & IFC",
    subName: "Istanbul Financial Center (IFC) Axis",
    side: "Asian",
    tagline: "Türkiye's $3B sovereign banking metropolis. Central Bank, Ziraat, Halkbank, and multinational financial institutions consolidated in one smart district.",
    priceM2: "$3,400 – $6,500",
    yieldRate: "7.5% – 8.8%",
    appreciation: "18% – 24% p.a. (Post-IFC opening momentum)",
    airportTime: "24 mins to Sabiha Gökçen (SAW) Airport",
    transit: "M4 Kadıköy-Sabiha & M12 Financial Center Metro Lines",
    tenantProfile: "Central Bank Staff, Private Equity Partners, Corporate Financiers",
    titleDeedStatus: "Direct Kat Mülkiyeti Title Deeds · Pre-Audited for Foreign Buyers",
    coordinates: "40°59'48\"N 29°07'25\"E",
    image: "/images/properties/atasehir-residence-1.jpg",
    locParam: "Ataşehir",
    keyStrengths: [
      "Over 50,000 corporate finance professionals entering the district",
      "Brand-new residential high-rises with international safety codes",
      "Highest rental occupancy consistency across all Istanbul sub-markets"
    ]
  },
  {
    id: "umraniye",
    name: "Ümraniye & Oryapark",
    subName: "High-Growth Commercial Axis",
    side: "Asian",
    tagline: "Contemporary twin-tower commercial & residential developments situated directly at the junction of Istanbul's two Bosphorus bridge highways.",
    priceM2: "$2,800 – $5,200",
    yieldRate: "7.2% – 8.4%",
    appreciation: "15% – 18% p.a.",
    airportTime: "26 mins to SAW Airport · 35 mins to IST",
    transit: "M5 Üsküdar-Çekmeköy Automated Metro Line & TEM Highway",
    tenantProfile: "Corporate Operations Managers, Engineering Directors, Logistics Hub Leaders",
    titleDeedStatus: "Ready Freehold Deed · Title Deed Pre-Registration Complete",
    coordinates: "41°01'33\"N 29°06'10\"E",
    image: "/images/properties/orya-park-exterior.jpg",
    locParam: "Ümraniye",
    keyStrengths: [
      "Direct on-ramp to Fatih Sultan Mehmet (2nd Bosphorus) Bridge",
      "Integrated Crown Plaza & shopping boulevards within compound perimeter",
      "Attractive yield-to-price ratio with zero renovation requirement"
    ]
  },
  {
    id: "kadikoy",
    name: "Kadıköy & Bağdat Avenue",
    subName: "Coastal High-Street & High-Net-Worth Living",
    side: "Asian",
    tagline: "The premier pedestrian luxury avenue of the Asian shore. Tree-lined boulevards, gourmet dining, private marinas, and high domestic wealth concentration.",
    priceM2: "$4,500 – $9,200",
    yieldRate: "6.0% – 7.0%",
    appreciation: "Strongest Domestic Lira & USD Resale Liquidity",
    airportTime: "28 mins to SAW Airport",
    transit: "Marmaray Cross-Continental Train & Kalamış Marina Ferry",
    tenantProfile: "Established Istanbul Families, Private Medical Specialists, Marine Executives",
    titleDeedStatus: "Individual Freehold Apartment Deeds · Kat Mülkiyeti Certified",
    coordinates: "40°58'12\"N 29°03'45\"E",
    image: "/images/properties/hero-main.jpg",
    locParam: "Kadıköy",
    keyStrengths: [
      "Walkable coastal parks stretching 8km along the Sea of Marmara",
      "Highest local Turkish buyer demand guaranteeing instant resale liquidity",
      "Kalamış Yacht Marina and prestigious private international academies"
    ]
  },
  {
    id: "uskudar",
    name: "Üsküdar & Çamlıca",
    subName: "Historic Panoramic Vistas & Low-Density Enclaves",
    side: "Asian",
    tagline: "Spiritual, aristocratic heart of the Asian Bosphorus. Low-rise luxury compounds overlooking Maiden's Tower and the European historical peninsula.",
    priceM2: "$4,000 – $7,800",
    yieldRate: "6.2% – 7.2%",
    appreciation: "High Scarcity Long-Term Capital Preservation",
    airportTime: "30 mins to SAW Airport",
    transit: "Marmaray Undersea Tunnel (Üsküdar Station to Sirkeci in 4 mins)",
    tenantProfile: "Gulf Royal Family Representatives, Consular Officials, Private Collectors",
    titleDeedStatus: "Strict Historical Conservation Zone Approved Freehold Title",
    coordinates: "41°01'22\"N 29°01'44\"E",
    image: "/images/properties/sisli-luxury-1.jpg",
    locParam: "Üsküdar",
    keyStrengths: [
      "Fastest intercontinental crossing: 4 minutes undersea to Europe shore",
      "Unobstructed panoramic sunset views over Topkapı & Hagia Sophia",
      "Gated low-density private residences surrounded by protected pine groves"
    ]
  }
];

export function BosphorusNavigator() {
  const waLink=useWhatsAppLink();
  const [side, setSide] = useState<"European" | "Asian">("European");
  const filteredCorridors = CORRIDORS.filter((c) => c.side === side);
  const [selectedId, setSelectedId] = useState<string>(filteredCorridors[0]!.id);
  const navigate = useNavigate();

  const active = CORRIDORS.find((c) => c.id === selectedId) || filteredCorridors[0]!;

  return (
    <section className="relative border-y border-border/80 bg-background py-16 md:py-24 overflow-hidden">
      <div className="container-site relative z-10">
        {/* Section Header with Refined Editorial Hierarchy */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between border-b border-border/70 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="pulse-live h-2 w-2 rounded-full bg-emerald-500 mr-1" />
              <p className="eyebrow !text-brass-text">
                Cross-Continental Sub-Market Intelligence
              </p>
            </div>
            <h2 className="headline text-3xl md:text-5xl text-foreground">
              Bosphorus Cross-Strait <em className="italic text-brass font-normal">Corridor Navigator</em>
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
                className={`flex items-center gap-2 rounded-xs px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                  side === "European"
                    ? "bg-primary text-on-dark shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Building2 className="h-3.5 w-3.5 text-brass" />
                <span>European Axis (West)</span>
              </button>

              <button
                onClick={() => {
                  setSide("Asian");
                  setSelectedId("atasehir");
                }}
                className={`flex items-center gap-2 rounded-xs px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                  side === "Asian"
                    ? "bg-primary text-on-dark shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Compass className="h-3.5 w-3.5 text-brass" />
                <span>Asian Axis (East)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Main Body: District Selectors & Deep Intelligence Card */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.6fr] items-start">
          {/* Corridor Selection List */}
          <div className="space-y-3" role="tablist" aria-label="District Corridors">
            <p className="text-[0.68rem] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              Select Investment Territory ({filteredCorridors.length} Corridors)
            </p>

            {filteredCorridors.map((c, i) => {
              const isSelected = c.id === active.id;
              return (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedId(c.id)}
                  className={`group relative flex w-full flex-col overflow-hidden rounded-xs border p-4 text-left transition-all duration-300 ${
                    isSelected
                      ? "border-brass bg-card shadow-md border-l-4 border-l-brass"
                      : "border-border/70 bg-card/60 hover:border-brass/60 hover:bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold tracking-wider text-brass uppercase">
                      Corridor 0{i + 1} · {c.side}
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
                      Yield: {c.yieldRate}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Deep Architectural Intelligence Dossier for Active District */}
          <div className="rounded-xs border border-border/80 bg-card shadow-md p-6 sm:p-8 flex flex-col justify-between">
            {/* Top Registration Info */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
                    Territory Dossier
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Ref: {active.id.toUpperCase()}-IST
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-brass font-medium">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{active.side} Istanbul · {active.locParam}</span>
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

                <div className="relative aspect-[16/10] overflow-hidden rounded-xs border border-border/70 bg-muted">
                  <img
                    src={active.image}
                    alt={active.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 rounded bg-black/70 backdrop-blur-xs px-2 py-0.5 text-[10px] font-mono text-brass">
                    {active.yieldRate} Net Yield
                  </span>
                </div>
              </div>

              {/* Financial & Statutory Key Metrics Grid */}
              <div className="mt-8 grid grid-cols-2 gap-4 border-y border-border/70 py-5 sm:grid-cols-4 bg-secondary/20 -mx-6 sm:-mx-8 px-6 sm:px-8">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Valuation Range</p>
                  <p className="font-display text-lg font-semibold text-foreground mt-0.5">{active.priceM2}</p>
                  <p className="text-[10px] text-muted-foreground">per m² USD</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Projected Net Yield</p>
                  <p className="font-display text-lg font-semibold text-brass mt-0.5">{active.yieldRate}</p>
                  <p className="text-[10px] text-muted-foreground">USD indexed contracts</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Airport Transit</p>
                  <p className="font-sans text-xs font-semibold text-foreground mt-1 flex items-center gap-1">
                    <Plane className="h-3 w-3 text-brass" /> {active.airportTime}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Capital Growth</p>
                  <p className="font-sans text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {active.appreciation}
                  </p>
                </div>
              </div>

              {/* Due Diligence Checklist Highlights */}
              <div className="mt-6 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-brass" />
                  <span>Strategic Investment Hallmarks</span>
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {active.keyStrengths.map((str, idx) => (
                    <div key={idx} className="rounded-xs border border-border/70 bg-card p-3 text-xs text-muted-foreground leading-relaxed flex flex-col justify-between">
                      <span className="font-mono text-[9px] text-brass mb-1">0{idx + 1}</span>
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Title Deed & Tenancy Footnote */}
              <div className="mt-4 rounded-xs border border-border/80 bg-secondary/40 p-3.5 text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-semibold text-primary uppercase">Deed Stage:</span>
                  <span className="text-foreground font-medium">{active.titleDeedStatus}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-semibold text-primary uppercase">Tenancy Pool:</span>
                  <span>{active.tenantProfile}</span>
                </div>
              </div>
            </div>

            {/* Direct Action CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-5">
              <button
                onClick={() => navigate({ to: "/properties", search: { q: active.locParam } })}
                className="btn btn-primary shadow-xs gap-2"
              >
                <span>View All Properties in {active.name}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <a
                href={waLink(`Hello Avrasya Properties, I am reviewing the ${active.name} investment corridor on your Bosphorus Navigator. I would like a curated availability dossier.`)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline gap-2"
              >
                <MessageSquare className="h-3.5 w-3.5 text-brass" />
                <span>Request {active.locParam} Private Dossier</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
