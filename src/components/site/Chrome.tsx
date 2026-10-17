import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Heart, Globe, Menu, X, MessageSquare, Phone, ShieldCheck } from "lucide-react";
import { CONTACT, type SupportedCurrency } from "@/data/properties";
import { useCurrency, useShortlist } from "@/hooks/usePreferences";
import { useLiveContact } from "@/hooks/useLiveContact";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Magnetic } from "./Motion";
import { IstanbulSkyline } from "./IstanbulSkyline";
import { useSiteSettings } from "@/admin/store";

export function Logo({
  className = "h-10",
  variant = "auto",
}: {
  className?: string;
  variant?: "auto" | "light" | "dark";
}) {
  const isLight = variant === "light";
  const settings=useSiteSettings();
  return (
    <img
      src={(isLight?settings.websiteDesign?.["logoLight"]:settings.websiteDesign?.["logoDark"])||(isLight ? "/images/avrasya-logo-pure-white.svg" : "/images/avrasya-logo.svg")}
      alt="Avrasya Properties Group"
      className={`w-auto shrink-0 select-none object-contain ${className}`}
    />
  );
}

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
  const { t, isRtl } = useLanguage();

  const navItems = [
    { to: "/properties", label: t.nav.properties },
    { to: "/calculator", label: t.nav.calculator },
    { to: "/why-turkiye", label: t.nav.whyTurkiye },
    { to: "/investment-in-turkiye", label: t.nav.investing },
    { to: "/citizenship", label: t.nav.citizenship },
    { to: "/services", label: t.nav.services },
    { to: "/about", label: t.nav.about },
  ] as const;

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
    return () => window.removeEventListener("scroll", on);
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
            <span className="font-medium text-brass-light text-[0.74rem]">{contact.advisoryHours}</span>
          </div>

          <div className="flex items-center gap-5">
            {/* Language Switcher in top bar */}
            <div className="flex items-center gap-1.5">
              <span className="text-on-dark-muted/70 text-[0.68rem] uppercase font-semibold">
                {t.nav.language}
              </span>
              <LanguageSwitcher variant="topbar" />
            </div>

            {/* Currency switcher in top bar */}
            <div className="flex items-center gap-2">
              <span className="text-on-dark-muted/70 text-[0.68rem] uppercase font-semibold">
                {t.nav.currency}
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
        className={`site-header sticky top-0 z-40 h-16 border-b bg-background transition-shadow duration-300 md:h-[74px] ${
          scrolled ? "border-border shadow-[0_8px_30px_rgb(0,0,0,0.05)]" : "border-border/60"
        }`}
      >
        <div className="container-site flex h-full items-center justify-between gap-4">
          <Link
            to="/"
            aria-label="Avrasya Properties home"
            className="inline-flex min-h-11 items-center"
          >
            <Logo className="h-8 max-w-[148px] sm:h-10 sm:max-w-none md:h-11" />
          </Link>

          <nav className="hidden items-center gap-5 xl:flex" aria-label="Main">
            {navItems.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="nav-link py-1 text-sm font-medium text-foreground transition-colors duration-200 hover:text-primary"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 xl:flex">
            {/* Interactive Language Selector */}
            <LanguageSwitcher variant="navbar" />

            {/* Shortlist Badge Button */}
            <Link
              to="/properties"
              search={{ savedOnly: true }}
              className="relative flex h-10 items-center gap-1.5 rounded-sm border border-border/80 bg-card px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:border-brass hover:text-foreground transition-colors duration-300"
              title={t.nav.viewShortlist}
            >
              <Heart
                className={`h-3.5 w-3.5 transition-transform duration-300 hover:scale-110 ${shortlistCount > 0 ? "fill-destructive text-destructive" : ""}`}
              />
              <span>{t.nav.saved}</span>
              {shortlistCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brass px-1 text-[10px] font-bold text-primary">
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
              <MessageSquare className="h-3.5 w-3.5 text-brass" /> {t.nav.whatsApp}
            </a>

            <Magnetic>
              <Link to="/contact" className="btn btn-primary whitespace-nowrap">
                {t.nav.bookConsultation}
              </Link>
            </Magnetic>
          </div>

          <div className="flex shrink-0 items-center gap-1 xl:hidden">
            <LanguageSwitcher variant="compact" className="me-1" />
            <Link to="/properties" search={{savedOnly:true}} aria-label={`Saved properties (${shortlistCount})`} className="relative flex h-11 w-11 items-center justify-center rounded border border-border"><Heart className="h-4 w-4"/>{shortlistCount>0&&<span className="absolute right-0 top-0 rounded bg-brass px-1 text-[10px]">{shortlistCount}</span>}</Link>
            <button
              ref={menuButton}
              className="flex h-11 w-11 items-center justify-center rounded border border-border bg-card"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open?t.nav.closeMenu:t.nav.openMenu}
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
              {[{to:"/",label:t.nav.home} as const,...navItems, { to: "/contact", label: t.nav.contact } as const].map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] items-center border-b border-border/40 text-base font-medium last:border-0"
                >
                  {n.label}
                </Link>
              ))}

              {/* Mobile Language Switcher */}
              <LanguageSwitcher variant="mobile" />

              <label className="block pt-3 pb-2 text-sm">{t.nav.displayCurrency}<select aria-label="Display currency" value={currency} onChange={e=>setCurrency(e.target.value as SupportedCurrency)} className="field mt-2"><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="TRY">TRY (₺)</option><option value="GBP">GBP (£)</option></select></label>
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
                  {t.nav.bookConsultation}
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
  const { t } = useLanguage();
  const settings=useSiteSettings();
  const cols = [
    {
      h: t.footer.explorePortfolio,
      l: [
        ["/properties", t.footer.allOffers],
        ["/calculator", t.footer.acquisitionCalculator],
        ["/citizenship", t.footer.citizenshipAdvice],
        ["/services", t.footer.advisoryServices],
        ["/investment-catalog", t.footer.investmentCatalog],
      ],
    },
    {
      h: t.footer.advisoryMarket,
      l: [
        ["/about", t.footer.aboutAvrasya],
        ["/why-turkiye", t.footer.whyTurkiyeNav],
        ["/investment-in-turkiye", t.footer.investorJourney],
        ["/contact", t.footer.directConsultation],
      ],
    },
  ] as const;

  return (
    <footer className="border-t border-border/40 bg-primary text-on-dark relative z-10 overflow-hidden">
      {/* Authentic Istanbul Skyline Architectural Panorama Silhouette */}
      <div className="w-full overflow-hidden border-b border-white/10 pt-6 pb-2 px-4 select-none pointer-events-none">
        <div className="container-site flex justify-center">
          <IstanbulSkyline
            opacity={0.75}
            className="w-full max-w-5xl transition-opacity duration-500 hover:opacity-90 drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
          />
        </div>
      </div>

      <div className="container-site grid gap-10 py-12 md:py-16 md:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
        <div className="space-y-4 text-sm text-on-dark-muted">
          <Logo className="h-12 max-w-full" variant="light" />
          {settings.websiteDesign?.["footerImage"]&&<img src={settings.websiteDesign["footerImage"]} alt={contact.company} className="block max-h-36 max-w-full object-contain"/>}
          <p className="text-on-dark font-medium">{contact.tagline}</p>
          <p className="text-xs leading-relaxed text-on-dark-muted/80">
            {settings.websiteDesign?.["footerNote"]??"Your trusted Istanbul partner for handpicked homes, Turkish citizenship guidance, and independent legal peace of mind."}
          </p>
          <div className="pt-2 flex items-center gap-3">
            <span className="inline-flex items-center border border-brass/40 px-3 py-1 text-[0.7rem] font-semibold text-brass-light">
              {t.footer.realEstateAdvisoryBadge}
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
          <p className="eyebrow !text-brass">{t.footer.headquarters}</p>
          <ul className="mt-4 space-y-2.5 text-xs leading-relaxed">
            <li>
              <strong className="text-on-dark block">{t.footer.directAdvisoryEmail}</strong>
              <a href={`mailto:${contact.email}`} className="hover:text-on-dark transition-colors">
                {contact.email}
              </a>
            </li>
            <li>
              <strong className="text-on-dark block">{t.footer.directWhatsAppLine}</strong>
              <a href={contact.phoneHref} className="hover:text-on-dark transition-colors">
                {contact.phone}
              </a>
            </li>
            <li>
              <strong className="text-on-dark block">{t.footer.officeAddress}</strong>
              <span>{contact.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-on-dark/15">
        <div className="container-site py-6 text-xs leading-relaxed text-on-dark-muted/80">
          {t.footer.disclaimerNote}
        </div>
        <div
          className="container-site flex flex-col gap-3 pb-24 lg:pb-8 text-xs text-on-dark-muted md:flex-row md:items-center md:justify-between"
          style={{ paddingBottom: "max(5.5rem, calc(4rem + env(safe-area-inset-bottom, 0px)))" }}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>© {new Date().getFullYear()} {contact.company}. {t.footer.rightsReserved}</span>
            <span className="text-on-dark-muted/40" aria-hidden="true">
              ·
            </span>
            <span className="text-on-dark-muted/90 font-medium">{t.footer.builtBy}</span>
          </div>
          <span className="flex flex-wrap items-center gap-5 relative z-20">
            <Link to="/privacy-policy" className="hover:text-on-dark transition-colors">
              {t.footer.privacyPolicy}
            </Link>
            <Link to="/terms" className="hover:text-on-dark transition-colors">
              {t.footer.termsConditions}
            </Link>
            <Link to="/cookie-policy" className="hover:text-on-dark transition-colors">
              {t.footer.cookiePolicy}
            </Link>
            <Link to="/investment-disclaimer" className="hover:text-on-dark transition-colors">
              {t.footer.investmentDisclaimer}
            </Link>
            <LanguageSwitcher variant="footer" />
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
  description,
  aside,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  description?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const content = children ?? (description ? <p>{description}</p> : null);
  return (
    <section className="site-page-intro relative overflow-hidden bg-night text-on-dark">
      <div className="container-site relative flex flex-col gap-6 border-b border-white/10 py-12 md:flex-row md:items-end md:justify-between md:py-20">
        <div className="max-w-3xl">
          <p className="kicker text-brass-light">{eyebrow}</p>
          <h1 className="display-hero mt-4 !text-[2.6rem] md:!text-[4.25rem]">
            <span className="split-line">
              <span style={{ ["--d" as string]: "80ms" }}>{title}</span>
            </span>
          </h1>
          {content && <div className="mt-6 max-w-2xl text-base leading-relaxed text-on-dark-muted">{content}</div>}
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
  const contact = useLiveContact();
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden bg-night py-16 text-on-dark md:py-24">
      <div className="container-site relative z-10 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <p className="kicker text-brass-light">{t.cta.eyebrow}</p>
          <h2 className="headline mt-4 max-w-2xl text-on-dark">{t.cta.title}</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-on-dark-muted md:text-base">{t.cta.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Magnetic>
            <Link to="/contact" className="btn btn-light">
              {t.cta.requestConsultation}
            </Link>
          </Magnetic>
          <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="btn gap-1.5 !border !border-white/30 !bg-transparent !text-white">
            <MessageSquare className="h-3.5 w-3.5" /> {t.cta.chatWhatsApp}
          </a>
        </div>
      </div>
    </section>
  );
}