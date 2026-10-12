import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Heart, Globe, Menu, X, MessageSquare, Phone, ShieldCheck } from "lucide-react";
import { CONTACT, type SupportedCurrency } from "@/data/properties";
import { useCurrency, useShortlist } from "@/hooks/usePreferences";
import { useLiveContact } from "@/hooks/useLiveContact";
import { Magnetic } from "./Motion";

export function Logo({
  className = "h-10",
  variant = "auto",
}: {
  className?: string;
  variant?: "auto" | "light" | "dark";
}) {
  const isLight = variant === "light";
  return (
    <img
      src={isLight ? "/images/avrasya-logo-pure-white.svg" : "/images/avrasya-logo.svg"}
      alt="Avrasya Properties Group"
      className={`w-auto shrink-0 select-none object-contain ${className}`}
    />
  );
}

const NAV = [
  { to: "/properties", label: "Properties" },
  { to: "/calculator", label: "Calculator" },
  { to: "/why-turkiye", label: "Why Türkiye" },
  { to: "/investment-in-turkiye", label: "Investing" },
  { to: "/citizenship", label: "Citizenship" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
] as const;

export function Header() {
  const path = useRouterState({select:s=>s.location.pathname});
  const menuButton=useRef<HTMLButtonElement>(null);
  const menu=useRef<HTMLElement>(null);
  const headerElement=useRef<HTMLElement>(null);
  const [menuHeight,setMenuHeight]=useState<number|null>(null);
  const sizeMenu=()=>setMenuHeight(Math.max(0,(window.visualViewport?.height||window.innerHeight)-(headerElement.current?.getBoundingClientRect().bottom||64)));
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currency, setCurrency] = useCurrency();
  const { count: shortlistCount } = useShortlist();
  const contact = useLiveContact();
  const [time, setTime] = useState("");

  useEffect(()=>setOpen(false),[path]);
  useEffect(()=>{
    if(!open)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow="hidden";
    menu.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const close=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){setOpen(false);menuButton.current?.focus();}
      if(event.key==="Tab"){
        const controls=[menuButton.current,...Array.from(menu.current?.querySelectorAll<HTMLElement>("a,button,select")||[])].filter((element):element is HTMLElement=>!!element);
        const first=controls[0],last=controls[controls.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      }
    };
    const resized=()=>{if(window.innerWidth>=1280)setOpen(false);else sizeMenu();};
    window.addEventListener("keydown",close);window.addEventListener("resize",resized);
    return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",close);window.removeEventListener("resize",resized);};
  },[open]);

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
      {/* Site Announcement Banner if enabled */}
      {contact.announcementActive && contact.announcementText && (
        <div className="bg-brass text-primary px-4 py-2 text-center text-xs font-semibold tracking-wide border-b border-brass-light/40 flex items-center justify-center gap-2">
          <span>{contact.announcementText}</span>
        </div>
      )}

      {/* Top Banner with live stats */}
      <div className="hidden border-b bg-primary text-on-dark md:block">
        <div className="container-site flex h-9 items-center justify-between text-[0.72rem] tracking-wide text-on-dark-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center font-medium text-brass text-[0.74rem]">
              <span className="pulse-live h-1.5 w-1.5 rounded-full bg-emerald-400 mr-2" />
              Bosphorus Advisory Desk · {time || "Istanbul"}
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Currency switcher in top bar */}
            <div className="flex items-center gap-2">
              <span className="text-on-dark-muted/70 text-[0.68rem] uppercase font-semibold">
                Currency:
              </span>
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
            </div>

            <a
              href={`mailto:${contact.email}`}
              className="text-on-dark-muted hover:text-on-dark transition-colors"
            >
              {contact.email}
            </a>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navbar */}
      <header
        ref={headerElement}
        className={`site-header sticky top-0 z-40 h-16 border-b transition-all duration-300 md:h-[74px] ${
          scrolled
            ? "border-border/80 bg-background/85 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            : "border-border/40 bg-background/70 backdrop-blur-md"
        }`}
      >
        <div className="container-site flex h-full items-center justify-between gap-4">
          <Link
            to="/"
            aria-label="Avrasya Properties home"
            className="transition-transform duration-300 hover:scale-[1.01]"
          >
            <Logo className="h-8 max-w-[148px] sm:h-10 sm:max-w-none md:h-11" />
          </Link>

          <nav className="hidden items-center gap-6 xl:flex" aria-label="Main">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="nav-link py-1 text-sm font-medium text-foreground transition-colors duration-200 hover:text-primary"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 xl:flex">
            {/* Shortlist Badge Button */}
            <Link
              to="/properties"
              search={{ savedOnly: true }}
              className="relative flex h-10 items-center gap-1.5 rounded-sm border border-border/80 bg-card/60 backdrop-blur-xs px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:border-brass hover:text-foreground hover:bg-card transition-all duration-300"
              title="View your saved property shortlist"
            >
              <Heart
                className={`h-3.5 w-3.5 transition-transform duration-300 hover:scale-110 ${shortlistCount > 0 ? "fill-destructive text-destructive" : ""}`}
              />
              <span>Saved</span>
              {shortlistCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brass px-1 text-[10px] font-bold text-primary animate-pulse">
                  {shortlistCount}
                </span>
              )}
            </Link>

            <a
              href={contact.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline hover:border-brass gap-1.5 transition-all duration-300"
            >
              <MessageSquare className="h-3.5 w-3.5 text-brass" /> WhatsApp
            </a>

            <Magnetic>
              <Link to="/contact" className="btn btn-primary btn-shimmer shadow-xs">
                Book Consultation
              </Link>
            </Magnetic>
          </div>

          <div className="flex shrink-0 items-center gap-1 xl:hidden">
            <Link to="/properties" search={{savedOnly:true}} aria-label={`Saved properties (${shortlistCount})`} className="relative flex h-11 w-11 items-center justify-center rounded border border-border"><Heart className="h-4 w-4"/>{shortlistCount>0&&<span className="absolute right-0 top-0 rounded bg-brass px-1 text-[10px]">{shortlistCount}</span>}</Link>
            <button
              ref={menuButton}
              className="flex h-11 w-11 items-center justify-center rounded border border-border bg-card"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open?"Close menu":"Open menu"}
              onClick={() => {if(!open)sizeMenu();setOpen((o) => !o);}}
            >
              {open ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {open&&<div
          id="mobile-nav"
          style={{maxHeight:menuHeight??"calc(100dvh - 4rem)"}}
          className="absolute inset-x-0 top-full overflow-y-auto border-b bg-card shadow-lg xl:hidden"
        >
          <nav ref={menu} className="min-h-0" aria-label="Mobile">
            <div className="container-site flex flex-col py-3 space-y-1">
              {[{to:"/",label:"Home"} as const,...NAV, { to: "/contact", label: "Contact" } as const].map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] items-center border-b border-border/40 text-base font-medium last:border-0"
                >
                  {n.label}
                </Link>
              ))}
              <label className="block pt-4 pb-2 text-sm">Display currency<select aria-label="Display currency" value={currency} onChange={e=>setCurrency(e.target.value as SupportedCurrency)} className="field mt-2"><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="TRY">TRY (₺)</option><option value="GBP">GBP (£)</option></select></label>
              <div className="pt-3 flex gap-2">
                <a
                  href={contact.whatsapp}
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
        </div>}
      </header>
    </>
  );
}

export function Footer() {
  const contact = useLiveContact();
  const cols = [
    {
      h: "Explore Portfolio",
      l: [
        ["/properties", "All Offers & Projects"],
        ["/calculator", "Acquisition & Yield Calculator"],
        ["/citizenship", "Citizenship advice"],
        ["/services", "Advisory services"],
        ["/investment-catalog", "Investment catalogue"],
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
          <p className="text-on-dark font-medium">{contact.tagline}</p>
          <p className="text-xs leading-relaxed text-on-dark-muted/80">
            Your trusted Istanbul partner for handpicked homes, Turkish citizenship guidance, and
            independent legal peace of mind.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-brass/40 bg-brass/10 px-3 py-1 text-[0.7rem] font-semibold text-brass">
              Istanbul Real Estate Advisory
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
              <a href={`mailto:${contact.email}`} className="hover:text-on-dark transition-colors">
                {contact.email}
              </a>
            </li>
            <li>
              <strong className="text-on-dark block">Direct & WhatsApp Line:</strong>
              <a href={contact.phoneHref} className="hover:text-on-dark transition-colors">
                {contact.phone}
              </a>
            </li>
            <li>
              <strong className="text-on-dark block">Office Address:</strong>
              <span>{contact.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-on-dark/15">
        <div className="container-site py-6 text-xs leading-relaxed text-on-dark-muted/80">
          Property prices, availability, and official citizenship regulations may be updated
          periodically by Turkish authorities. Our team will verify all latest details and legal
          requirements with you before signing any contract.
        </div>
        <div className="container-site flex flex-col gap-3 pb-8 text-xs text-on-dark-muted md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>© 2026 {contact.company}. All rights reserved.</span>
            <span className="text-on-dark-muted/40" aria-hidden="true">
              ·
            </span>
            <span className="text-on-dark-muted/90 font-medium">Built by Zarif</span>
          </div>
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
    <section className="site-page-intro relative overflow-hidden border-b bg-primary text-on-dark">
      <div
        aria-hidden
        className="pointer-events-none absolute right-4 lg:right-10 top-8 hidden select-none md:flex md:flex-col items-end text-right opacity-30 z-0"
      >
        <span className="outline-word outline-light text-[7.5rem] lg:text-[10rem] leading-[0.9] tracking-tight">
          AVRASYA
        </span>
        <span className="outline-word outline-light text-[2.4rem] lg:text-[3.2rem] tracking-[0.32em] mt-1 uppercase leading-none pr-1">
          PROPERTIES
        </span>
      </div>
      <div className="container-site relative flex flex-col gap-5 py-9 md:flex-row md:items-end md:justify-between md:py-16">
        <div className="max-w-3xl">
          <p className="eyebrow eyebrow-mark">{eyebrow}</p>
          <h1 className="display-hero mt-3">
            <span className="split-line">
              <span style={{ ["--d" as string]: "80ms" }}>{title}</span>
            </span>
          </h1>
          {children && (
            <div className="mt-5 max-w-2xl text-base text-muted-foreground leading-relaxed">
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
      <div>
        <p className="eyebrow eyebrow-mark border-t border-ink pt-3 md:sticky md:top-24">{label}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}

export function CtaBand() {
  const contact=useLiveContact();
  return (
    <section className="border-t bg-ink text-on-dark relative overflow-hidden py-16 md:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brass/10 via-transparent to-transparent pointer-events-none" />
      <div className="container-site relative text-center">
        <span className="inline-flex items-center rounded-full border border-brass/40 bg-brass/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brass">
          Direct Istanbul Guidance
        </span>
        <h2 className="headline mx-auto mt-4 max-w-2xl text-3xl md:text-4xl text-on-dark">
          Ready to find your dream property in Istanbul?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-on-dark-muted text-sm md:text-base leading-relaxed">
          Speak directly with our team in Istanbul. Whether you are exploring neighborhoods,
          seeking Turkish citizenship, or arranging a viewing, we are here to help.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Magnetic>
            <Link to="/contact" className="btn btn-primary shadow-sm">
              Request a Consultation
            </Link>
          </Magnetic>
          <a
            href={contact.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline !border-white/20 !bg-white/5 !text-white hover:!bg-white/10 gap-1.5"
          >
            <MessageSquare className="h-3.5 w-3.5 text-brass" /> Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
