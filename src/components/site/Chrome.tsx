import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/avrasya-logo.png.asset.json";
import { CONTACT } from "@/data/properties";
import { Magnetic } from "./Motion";

export function Logo({ className = "h-11" }: { className?: string }) {
  return <img src={logo.url} alt="Avrasya Properties Group" width={1536} height={512} className={`${className} w-auto`} />;
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
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <>
      <div className="hidden border-b bg-background md:block">
        <div className="container-site flex h-8 items-center justify-between text-[0.7rem] tracking-wide text-muted-foreground">
          <span className="eyebrow eyebrow-mark !text-muted-foreground">Istanbul · Türkiye</span>
          <span className="flex gap-6">
            <span>International property-investment consultancy</span>
            <a href={`mailto:${CONTACT.email}`} className="hover:text-foreground">{CONTACT.email}</a>
          </span>
        </div>
      </div>
      <header className={`sticky top-0 z-40 h-[72px] border-b transition-colors duration-200 ${scrolled ? "bg-card/95 backdrop-blur" : "border-transparent bg-background"}`}>
        <div className="container-site flex h-full items-center justify-between gap-4">
          <Link to="/" aria-label="Avrasya Properties home"><Logo className="h-10 md:h-12" /></Link>
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="nav-link py-1 text-sm text-foreground">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className="btn btn-outline">WhatsApp</a>
            <Magnetic><Link to="/contact" className="btn btn-primary">Book a consultation</Link></Magnetic>
          </div>
          <button className="btn btn-outline lg:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((o) => !o)}>
            {open ? "Close" : "Menu"}
          </button>
        </div>
        <div id="mobile-nav" className={`grid overflow-hidden border-b bg-card transition-[grid-template-rows] duration-200 lg:hidden ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr] border-transparent"}`}>
          <nav className="min-h-0" aria-label="Mobile">
            <div className="container-site flex flex-col py-2">
              {[...NAV, { to: "/contact", label: "Contact" } as const].map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="flex min-h-[44px] items-center border-b text-base last:border-0">
                  {n.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}

export function Footer() {
  const cols = [
    { h: "Explore", l: [["/properties", "Offers & projects"], ["/citizenship", "Citizenship guidance"], ["/services", "All 10 services"], ["/investment-catalog", "Investment catalog"]] },
    { h: "Avrasya", l: [["/about", "About us"], ["/why-turkiye", "Why Türkiye"], ["/investment-in-turkiye", "Investing in Türkiye"], ["/contact", "Contact & consultation"]] },
  ] as const;
  return (
    <footer className="bg-primary text-on-dark">
      <div className="container-site grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="space-y-4 text-sm text-on-dark-muted">
          <span className="inline-block rounded-sm bg-on-dark px-3 py-2"><Logo className="h-10" /></span>
          <p className="text-on-dark">{CONTACT.tagline}</p>
          <p>International property-investment consultancy based in Istanbul. Operating company: {CONTACT.company}.</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <p className="eyebrow !text-brass">{c.h}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {c.l.map(([to, label]) => (
                <li key={to}><Link to={to} className="text-on-dark-muted hover:text-on-dark">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
        <div className="text-sm text-on-dark-muted">
          <p className="eyebrow !text-brass">Visit or write</p>
          <ul className="mt-4 space-y-2">
            <li><a href={`mailto:${CONTACT.email}`} className="hover:text-on-dark">{CONTACT.email}</a></li>
            <li><a href={CONTACT.phoneHref} className="hover:text-on-dark">{CONTACT.phone}</a></li>
            <li>{CONTACT.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-on-dark/15">
        <div className="container-site py-6 text-xs leading-relaxed text-on-dark-muted">
          Property prices, availability, specifications and investment/citizenship eligibility are subject to change and must be independently confirmed before purchase. Information is introductory and does not constitute legal or financial advice.
        </div>
        <div className="container-site flex flex-col gap-3 pb-8 text-xs text-on-dark-muted md:flex-row md:justify-between">
          <span>© 2026 {CONTACT.company}. All rights reserved.</span>
          <span className="flex flex-wrap gap-5">
            <Link to="/privacy-policy" className="hover:text-on-dark">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-on-dark">Terms & Conditions</Link>
            <Link to="/cookie-policy" className="hover:text-on-dark">Cookie Policy</Link>
            <Link to="/investment-disclaimer" className="hover:text-on-dark">Investment Disclaimer</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

export function PageIntro({ eyebrow, title, children, aside }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="blueprint-wrap relative overflow-hidden border-b">
      <div aria-hidden data-parallax="0.25" className="outline-word pointer-events-none absolute -right-6 top-6 hidden select-none text-[13rem] md:block">AVRASYA</div>
      <div className="container-site relative flex flex-col gap-6 py-12 md:flex-row md:items-end md:justify-between md:py-16">
        <div className="max-w-3xl">
          <p className="eyebrow eyebrow-mark">{eyebrow}</p>
          <h1 className="display-hero mt-3"><span className="split-line"><span style={{ ["--d" as string]: "80ms" }}>{title}</span></span></h1>
          {children && <div data-reveal className="mt-5 max-w-2xl text-muted-foreground">{children}</div>}
        </div>
        {aside}
      </div>
    </section>
  );
}

export function Margin({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="container-site grid gap-6 py-14 md:grid-cols-[14rem_1fr] md:gap-12">
      <div data-reveal><p className="eyebrow eyebrow-mark border-t border-ink pt-3 md:sticky md:top-24">{label}</p></div>
      <div data-reveal style={{ ["--d" as string]: "120ms" }}>{children}</div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="border-t bg-card">
      <div data-reveal className="container-site py-16 text-center">
        <p className="eyebrow">Personal advisory</p>
        <h2 className="headline mx-auto mt-3 max-w-2xl">Let's make space for your specific property questions.</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Speak directly with our Istanbul team about shortlists, purchase steps, or documentation guidance.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Magnetic><Link to="/contact" className="btn btn-primary">Request a consultation</Link></Magnetic>
          <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className="btn btn-outline">Chat on WhatsApp</a>
        </div>
      </div>
    </section>
  );
}
