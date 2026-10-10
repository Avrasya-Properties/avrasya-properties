import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Globe, Sparkles, MessageSquare, Phone, ShieldCheck } from "lucide-react";
import { CONTACT, type SupportedCurrency } from "@/data/properties";
import { useCurrency, useShortlist } from "@/hooks/usePreferences";
import { Magnetic } from "./Motion";

export function Logo({ className = "h-10", variant = "auto" }: { className?: string; variant?: "auto" | "light" | "dark" }) {
  const isDark = variant === "light";
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <svg className="h-full w-auto aspect-square shrink-0 drop-shadow-sm" viewBox="0 0 76 68" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 4 60 Q 38 52 72 60" stroke="#B78C4D" strokeWidth="3" strokeLinecap="round" />
        <path d="M 14 57 L 14 38 L 22 34 L 22 56" fill={isDark ? "#FFFFFF" : "#17384A"} stroke="#B78C4D" strokeWidth="1.2" />
        <path d="M 26 55 L 26 26 L 35 20 L 35 54" fill={isDark ? "#FFFFFF" : "#17384A"} stroke="#B78C4D" strokeWidth="1.2" />
        <path d="M 35 54 L 35 14 L 43 6 L 51 14 L 51 54" fill="#B78C4D" stroke={isDark ? "#FFFFFF" : "#17384A"} strokeWidth="1.2" />
        <path d="M 43 14 L 43 50" stroke={isDark ? "#17384A" : "#F7F6F2"} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 51 54 L 51 20 L 60 26 L 60 55" fill={isDark ? "#FFFFFF" : "#17384A"} stroke="#B78C4D" strokeWidth="1.2" />
        <path d="M 64 56 L 64 34 L 72 38 L 72 57" fill={isDark ? "#FFFFFF" : "#17384A"} stroke="#B78C4D" strokeWidth="1.2" />
      </svg>
      <div className="flex flex-col justify-center leading-none">
        <span className={`font-display text-lg md:text-xl tracking-[0.14em] font-semibold ${isDark ? "text-on-dark" : "text-foreground"}`}>
          AVRASYA
        </span>
        <span className="font-sans text-[0.58rem] tracking-[0.24em] font-bold text-brass uppercase mt-0.5">
          Properties Group
        </span>
      </div>
    </div>
  );
}

const NAV = [
  { to: "/properties", label: "Properties" },
  { to: "/why-turkiye", label: "Why Türkiye" },
  { to: "/investment-in-turkiye", label: "Investing" },
  { to: "/citizenship", label: "Citizenship" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currency, setCurrency] = useCurrency();
  const { count: shortlistCount } = useShortlist();
  const [time, setTime] = useState("");

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });

    // Istanbul local time
    const updateTime = () => {
      try {
        const ist = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Europe/Istanbul",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date());
        setTime(`${ist} TRT`);
      } catch {
        setTime("Istanbul");
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);

    return () => {
      window.removeEventListener("scroll", on);
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      {/* Top Banner with live stats */}
      <div className="hidden border-b bg-primary text-on-dark md:block">
        <div className="container-site flex h-9 items-center justify-between text-[0.72rem] tracking-wide text-on-dark-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-brass">
              <span className="h-1.5 w-1.5 rounded-full bg-brass animate-pulse" />
              Istanbul Office · {time || "Europe/Istanbul"}
            </span>
            <span className="text-on-dark-muted/60">|</span>
            <span className="flex items-center gap-1 text-on-dark-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-brass" /> Independent Title & Legal Due Diligence
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Currency switcher in top bar with live Frankfurter ECB status */}
            <div className="flex items-center gap-2">
              <span className="text-on-dark-muted/70 text-[0.68rem] uppercase font-semibold">Currency:</span>
              <div className="flex rounded border border-on-dark/20 bg-primary/40 p-0.5">
                {(["USD", "EUR", "TRY", "GBP"] as SupportedCurrency[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`rounded px-1.5 py-0.5 text-[0.65rem] font-semibold transition-all ${
                      currency === c
                        ? "bg-brass text-primary font-bold shadow-xs"
                        : "text-on-dark-muted hover:text-on-dark"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <span
                className="hidden items-center gap-1 rounded bg-brass/15 px-1.5 py-0.5 text-[0.62rem] font-mono text-brass xl:flex"
                title="Live ECB conversion rates powered by Frankfurter"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live ECB (Frankfurter)
              </span>
            </div>

            <a href={`mailto:${CONTACT.email}`} className="text-on-dark-muted hover:text-on-dark transition-colors">
              {CONTACT.email}
            </a>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navbar */}
      <header
        className={`sticky top-0 z-40 h-[74px] border-b transition-all duration-300 ${
          scrolled
            ? "border-border/80 bg-background/90 backdrop-blur-md shadow-xs"
            : "border-border/40 bg-background/80 backdrop-blur-xs"
        }`}
      >
        <div className="container-site flex h-full items-center justify-between gap-4">
          <Link to="/" aria-label="Avrasya Properties home" className="transition-transform hover:scale-[1.01]">
            <Logo className="h-10 md:h-11" />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="nav-link py-1 text-sm font-medium text-foreground">
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {/* Shortlist Badge Button */}
            <Link
              to="/properties"
              search={{}}
              className="relative flex h-10 items-center gap-1.5 rounded-sm border px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:border-brass hover:text-foreground transition-colors"
              title="View your saved property shortlist"
            >
              <Heart className={`h-3.5 w-3.5 ${shortlistCount > 0 ? "fill-destructive text-destructive" : ""}`} />
              <span>Saved</span>
              {shortlistCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brass px-1 text-[10px] font-bold text-primary">
                  {shortlistCount}
                </span>
              )}
            </Link>

            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline gap-1.5"
            >
              <MessageSquare className="h-3.5 w-3.5 text-brass" /> WhatsApp
            </a>

            <Magnetic>
              <Link to="/contact" className="btn btn-primary shadow-xs">
                Book Consultation
              </Link>
            </Magnetic>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {/* Mobile Currency toggle */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
              className="h-8 rounded border bg-card px-2 text-xs font-semibold"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="TRY">TRY (₺)</option>
              <option value="GBP">GBP (£)</option>
            </select>

            <button
              className="btn btn-outline !min-h-9 !px-3"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div
          id="mobile-nav"
          className={`grid overflow-hidden border-b bg-card transition-[grid-template-rows] duration-200 lg:hidden ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr] border-transparent"
          }`}
        >
          <nav className="min-h-0" aria-label="Mobile">
            <div className="container-site flex flex-col py-3 space-y-1">
              {[...NAV, { to: "/contact", label: "Contact" } as const].map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] items-center border-b border-border/40 text-base font-medium last:border-0"
                >
                  {n.label}
                </Link>
              ))}
              <div className="pt-3 flex gap-2">
                <a
                  href={CONTACT.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline flex-1 justify-center"
                >
                  WhatsApp
                </a>
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="btn btn-primary flex-1 justify-center"
                >
                  Consultation
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}

export function Footer() {
  const cols = [
    {
      h: "Explore Portfolio",
      l: [
        ["/properties", "All Offers & Projects"],
        ["/citizenship", "Citizenship Program ($400k)"],
        ["/services", "Advisory Framework (10 Services)"],
        ["/investment-catalog", "Investment Catalog (17 Pages)"],
      ],
    },
    {
      h: "Advisory & Market",
      l: [
        ["/about", "About Avrasya Properties"],
        ["/why-turkiye", "Why Türkiye (Location & Lifestyle)"],
        ["/investment-in-turkiye", "Investor's Step-by-Step Journey"],
        ["/contact", "Direct Istanbul Consultation"],
      ],
    },
  ] as const;

  return (
    <footer className="border-t border-border/40 bg-primary text-on-dark">
      <div className="container-site grid gap-10 py-16 md:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
        <div className="space-y-4 text-sm text-on-dark-muted">
          <Logo className="h-10" variant="light" />
          <p className="text-on-dark font-medium">{CONTACT.tagline}</p>
          <p className="text-xs leading-relaxed text-on-dark-muted/80">
            Istanbul-headquartered private advisory firm catering exclusively to international property investors, citizenship applicants, and institutional buyers in Türkiye.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brass/40 bg-brass/10 px-3 py-1 text-[0.7rem] font-semibold text-brass">
              <Sparkles className="h-3 w-3" /> Licensed Istanbul Firm
            </span>
          </div>
        </div>

        {cols.map((c) => (
          <div key={c.h}>
            <p className="eyebrow !text-brass">{c.h}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {c.l.map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-on-dark-muted hover:text-on-dark transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="text-sm text-on-dark-muted">
          <p className="eyebrow !text-brass">Istanbul Headquarters</p>
          <ul className="mt-4 space-y-2.5 text-xs leading-relaxed">
            <li>
              <strong className="text-on-dark block">Direct Advisory Email:</strong>
              <a href={`mailto:${CONTACT.email}`} className="hover:text-on-dark transition-colors">
                {CONTACT.email}
              </a>
            </li>
            <li>
              <strong className="text-on-dark block">Direct & WhatsApp Line:</strong>
              <a href={CONTACT.phoneHref} className="hover:text-on-dark transition-colors">
                {CONTACT.phone}
              </a>
            </li>
            <li>
              <strong className="text-on-dark block">Office Address:</strong>
              <span>{CONTACT.address}</span>
            </li>
            <li className="pt-1">
              <span className="text-on-dark-muted/70">Operating entity: {CONTACT.company}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-on-dark/15">
        <div className="container-site py-6 text-xs leading-relaxed text-on-dark-muted/80">
          Property valuations, price availability, unit specifications, and legal citizenship eligibility thresholds are subject to ongoing regulatory updates by Turkish authorities. Content on this website is for introductory advisory review and must be confirmed prior to binding contracts.
        </div>
        <div className="container-site flex flex-col gap-3 pb-8 text-xs text-on-dark-muted md:flex-row md:justify-between">
          <span>© 2026 {CONTACT.company}. All rights reserved.</span>
          <span className="flex flex-wrap gap-5">
            <Link to="/privacy-policy" className="hover:text-on-dark transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-on-dark transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/cookie-policy" className="hover:text-on-dark transition-colors">
              Cookie Policy
            </Link>
            <Link to="/investment-disclaimer" className="hover:text-on-dark transition-colors">
              Investment Disclaimer
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

export function PageIntro({
  eyebrow,
  title,
  children,
  aside,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-card/60 to-background">
      <div
        aria-hidden
        data-parallax="0.25"
        className="pointer-events-none absolute -right-6 top-6 hidden select-none md:flex md:flex-col items-start opacity-40 z-0"
      >
        <span className="outline-word text-[9.5rem] lg:text-[13rem] leading-[0.82]">
          AVRASYA
        </span>
        <span className="outline-word text-[3rem] lg:text-[4.2rem] tracking-[0.14em] -mt-3 lg:-mt-5 pl-2 leading-[0.85]">
          Properties
        </span>
      </div>
      <div className="container-site relative flex flex-col gap-6 py-12 md:flex-row md:items-end md:justify-between md:py-16">
        <div className="max-w-3xl">
          <p className="eyebrow eyebrow-mark">{eyebrow}</p>
          <h1 className="display-hero mt-3">
            <span className="split-line">
              <span style={{ ["--d" as string]: "80ms" }}>{title}</span>
            </span>
          </h1>
          {children && (
            <div data-reveal className="mt-5 max-w-2xl text-base text-muted-foreground leading-relaxed">
              {children}
            </div>
          )}
        </div>
        {aside}
      </div>
    </section>
  );
}

export function Margin({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="container-site grid gap-6 py-14 md:grid-cols-[14rem_1fr] md:gap-12">
      <div data-reveal>
        <p className="eyebrow eyebrow-mark border-t border-ink pt-3 md:sticky md:top-24">{label}</p>
      </div>
      <div data-reveal style={{ ["--d" as string]: "120ms" }}>
        {children}
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="border-t bg-card relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brass/5 via-transparent to-transparent pointer-events-none" />
      <div data-reveal className="container-site relative py-18 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brass/40 bg-brass/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brass-text">
          <Sparkles className="h-3 w-3 text-brass" /> Direct Istanbul Advisory
        </span>
        <h2 className="headline mx-auto mt-4 max-w-2xl text-3xl md:text-4xl">
          Schedule your private portfolio consultation.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-sm md:text-base leading-relaxed">
          Speak directly with our Istanbul team about district valuations, Turkish citizenship thresholds, title verification, or private viewing shortlists.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Magnetic>
            <Link to="/contact" className="btn btn-primary shadow-sm">
              Request a Consultation
            </Link>
          </Magnetic>
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline gap-1.5"
          >
            <MessageSquare className="h-3.5 w-3.5 text-brass" /> Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

