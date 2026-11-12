import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, MessageSquare, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type SupportedCurrency } from "@/data/properties";
import { useCurrency, useShortlist } from "@/hooks/usePreferences";
import { useLiveContact } from "@/hooks/useLiveContact";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Magnetic } from "./Motion";
import { applyMagneticHover } from "@/lib/animation/magnetic";
import { useSiteSettings } from "@/admin/store";
import { PLACEHOLDER_IMAGES, resolvePlaceholderSrc } from "@/data/placeholders";
import { PageIdentityLineArt } from "./PageIdentityLineArt";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Logo({
  className = "h-10",
  variant = "auto",
}: {
  className?: string;
  variant?: "auto" | "light" | "dark";
}) {
  const isLight = variant === "light";
  const settings = useSiteSettings();
  return (
    <img
      src={
        (isLight ? settings.websiteDesign?.["logoLight"] : settings.websiteDesign?.["logoDark"]) ||
        (isLight ? "/images/avrasya-logo-pure-white.svg" : "/images/avrasya-logo.svg")
      }
      alt="Avrasya Properties Group"
      className={`w-auto shrink-0 select-none object-contain ${className}`}
    />
  );
}

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currency, setCurrency] = useCurrency();
  const { count: shortlistCount } = useShortlist();
  const contact = useLiveContact();
  const { t } = useLanguage();
  const settings = useSiteSettings();
  const isHome = pathname === "/";

  const dynamicNavItems = useMemo(() => {
    let rawItems = settings.navigationItems;
    if (!rawItems && typeof settings.websiteDesign?.navigation === "string") {
      try {
        const parsed = JSON.parse(settings.websiteDesign.navigation);
        if (Array.isArray(parsed)) rawItems = parsed;
      } catch {
        /* intentionally ignored */
      }
    }
    if (Array.isArray(rawItems) && rawItems.length > 0) {
      return [...rawItems]
        .filter((item) => item.is_visible !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((item) => ({ to: item.href, label: item.label }));
    }
    return [
      { to: "/", label: t.nav.home || "Home" },
      { to: "/properties", label: t.nav.properties },
      { to: "/locations", label: "Locations" },
      { to: "/services", label: t.nav.services },
      { to: "/citizenship", label: t.nav.citizenship },
      { to: "/why-turkiye", label: t.nav.whyTurkiye },
      { to: "/calculator", label: t.nav.calculator },
      { to: "/about", label: t.nav.about },
    ];
  }, [settings.navigationItems, settings.websiteDesign?.navigation, t]);

  const ctaConfig = useMemo(() => {
    return (
      settings.headerCta || {
        label: t.nav.contact || "Contact",
        href: "/contact",
        is_visible: true,
      }
    );
  }, [settings.headerCta, t]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 96);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Coordinated magnetic physics on desktop navigation links
  useEffect(() => {
    if (typeof window === "undefined") return;
    const navEl = navRef.current;
    if (!navEl) return;

    const links = navEl.querySelectorAll<HTMLElement>("[data-nav-link]");
    if (!links || links.length === 0) return;

    const cleanups: Array<() => void> = [];
    links.forEach((link) => {
      cleanups.push(
        applyMagneticHover(link, {
          strength: 0.1,
          innerStrength: 0.16,
          returnDuration: 0.45,
          returnEase: "power3.out",
        }),
      );
    });

    return () => {
      cleanups.forEach((c) => c());
    };
  }, [dynamicNavItems]);

  // Prevent background scroll and trap keyboard when mobile navigation drawer is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      window.addEventListener("keydown", onKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      {settings.announcementActive && settings.announcementText && (
        <div className="bg-[#163038] px-4 py-2 text-center text-xs font-medium tracking-wide text-white">
          <div className="container-site flex items-center justify-center gap-2">
            <span className="inline-block size-1.5 shrink-0 rounded-full bg-[#C5A059]" />
            <span>{settings.announcementText}</span>
          </div>
        </div>
      )}
      <header
        className="sticky top-0 z-50 border-b border-[#DEE0DD] bg-[#F7F6F2]/95 backdrop-blur-md transition-all duration-300"
        style={{ fontFamily: '"Geist", "Inter", sans-serif' }}
      >
        <div className="mx-auto flex h-[72px] max-w-[1312px] items-center justify-between gap-4 px-5 sm:px-8">
          {/* Original Avrasya Logo Left */}
          <Link
            to="/"
            aria-label="Avrasya Properties — Home"
            className="inline-flex min-h-11 items-center no-underline"
          >
            <Logo className="h-8 max-w-[148px] sm:h-10 sm:max-w-none md:h-11" variant="dark" />
          </Link>

          {/* Center Caldren Pill Navigation with Magnetic Physics */}
          <nav ref={navRef} aria-label="Primary" className="hidden items-center gap-1 xl:flex">
            {dynamicNavItems.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  data-nav-link
                  className={`group relative overflow-hidden rounded-full px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap no-underline transition-colors duration-250 ease-out ${
                    active
                      ? "bg-[#163038] text-white shadow-xs"
                      : "text-[#163038] hover:bg-[#163038]/8"
                  }`}
                >
                  <span data-magnetic-inner className="inline-block">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Utilities & Contact Pill */}
          <div className="hidden items-center gap-2.5 xl:flex">
            <LanguageSwitcher variant="navbar" />

            <div className="relative flex items-center">
              <select
                aria-label="Display currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                className="cursor-pointer appearance-none rounded-full border border-[#163038]/15 bg-transparent py-1.5 pr-6 pl-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#163038] transition-colors hover:border-[#163038] focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="TRY">TRY (₺)</option>
              </select>
              <span className="pointer-events-none absolute right-2.5 text-[8px] text-[#5C6F73]">
                ▼
              </span>
            </div>

            <Link
              to="/properties"
              search={{ savedOnly: true }}
              title={t.nav.viewShortlist}
              className="relative flex items-center gap-1.5 rounded-full border border-[#163038]/15 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#163038] no-underline transition-colors hover:border-[#163038]"
            >
              <Heart
                className={`h-3.5 w-3.5 ${
                  shortlistCount > 0 ? "fill-[#C5A059] text-[#C5A059]" : ""
                }`}
              />
              <span>{t.nav.saved}</span>
              {shortlistCount > 0 && (
                <span className="font-bold text-[#C5A059]">{shortlistCount}</span>
              )}
            </Link>

            {ctaConfig.is_visible !== false && (
              <Link
                to={ctaConfig.href || "/contact"}
                className="inline-flex items-center gap-2 rounded-full border border-[#163038] bg-[#163038] px-4 py-2 text-[12.5px] font-medium whitespace-nowrap text-white no-underline shadow-xs transition-colors hover:bg-[#10785F]"
              >
                <span>{ctaConfig.label || t.nav.contact}</span>
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Trigger */}
          <div className="flex shrink-0 items-center gap-1.5 xl:hidden">
            <LanguageSwitcher variant="compact" />
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#163038]/15 bg-white text-[#163038]"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Full-Screen Accessible Mobile Navigation Drawer Overlay (< xl) */}
        {open && (
          <div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Drawer"
            className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#163038]/98 px-6 py-6 text-white backdrop-blur-2xl transition-all duration-300 xl:hidden animate-in fade-in slide-in-from-top-2"
          >
            {/* Drawer Top Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                aria-label="Avrasya Properties — Home"
                className="inline-flex items-center no-underline"
              >
                <Logo className="h-8 max-w-[140px]" variant="light" />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.nav.closeMenu || "Close navigation"}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white hover:text-[#163038] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Nav Links List */}
            <nav
              aria-label="Mobile Navigation Links"
              className="flex flex-col gap-1.5 py-4 overflow-y-auto"
            >
              {dynamicNavItems.map((item, idx) => {
                const active =
                  item.to === "/"
                    ? pathname === "/"
                    : pathname === item.to || pathname.startsWith(`${item.to}/`);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-lg font-light tracking-wide no-underline transition-colors ${
                      active
                        ? "bg-white/15 text-white font-normal"
                        : "text-white/95 hover:bg-white/10 active:bg-white/15"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs text-white/40 font-mono">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Footer with Language, Currency & Direct Contacts */}
            <div className="border-t border-white/10 pt-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-[#C5A059]">Language</span>
                <LanguageSwitcher variant="navbar" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-[#C5A059]">Currency</span>
                <select
                  aria-label="Display currency mobile"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                  className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-white cursor-pointer"
                >
                  <option value="USD" className="text-neutral-900">
                    USD ($)
                  </option>
                  <option value="EUR" className="text-neutral-900">
                    EUR (€)
                  </option>
                  <option value="GBP" className="text-neutral-900">
                    GBP (£)
                  </option>
                  <option value="TRY" className="text-neutral-900">
                    TRY (₺)
                  </option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <a
                  href={contact.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#10785F] py-2.5 text-xs font-semibold text-white no-underline transition-colors hover:bg-[#0c5d49]"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>

                {ctaConfig.is_visible !== false && (
                  <Link
                    to={ctaConfig.href || "/contact"}
                    onClick={() => setOpen(false)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/10 py-2.5 text-xs font-medium text-white no-underline transition-colors hover:bg-white hover:text-[#163038]"
                  >
                    <span>{ctaConfig.label || t.nav.bookConsultation || "Contact"}</span>
                    <span>→</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

/**
 * Section 5 – Footer (Recreated from Reference Image 5 — Bildora Pre-Footer CTA + Dark Footer)
 */
export function Footer() {
  const { t } = useLanguage();
  const contact = useLiveContact();
  const settings = useSiteSettings();

  const footerSettings = useMemo(() => {
    let raw = settings.footerSettings;
    if (!raw && typeof settings.websiteDesign?.footer === "string") {
      try {
        const parsed = JSON.parse(settings.websiteDesign.footer);
        if (parsed && typeof parsed === "object") raw = parsed;
      } catch {
        /* intentionally ignored */
      }
    }
    return raw;
  }, [settings.footerSettings, settings.websiteDesign?.footer]);

  const footerNote =
    footerSettings?.note ||
    settings.websiteDesign?.["footerNote"] ||
    "Built to last. Delivered\nwith precision.";
  const copyrightText =
    footerSettings?.copyrightText ||
    `© ${new Date().getFullYear()} ${contact.company} — Luxury Real Estate & Advisory.`;
  const footerEmail = footerSettings?.contactOverrides?.email || contact.email;
  const footerPhone = footerSettings?.contactOverrides?.phone || contact.phone;
  const footerAddress = footerSettings?.contactOverrides?.address || contact.address;

  const footerColumns = useMemo(() => {
    if (Array.isArray(footerSettings?.columns) && footerSettings.columns.length > 0) {
      return footerSettings.columns;
    }
    return [
      {
        title: "Quick Link",
        links: [
          { label: "Home", href: "/" },
          { label: t.nav.about, href: "/about" },
          { label: t.nav.services, href: "/services" },
          { label: t.nav.properties, href: "/properties" },
        ],
      },
      {
        title: "Quick Link",
        links: [
          { label: "Locations", href: "/locations" },
          { label: t.nav.citizenship, href: "/citizenship" },
          { label: t.nav.whyTurkiye || "Why Türkiye", href: "/why-turkiye" },
          { label: t.nav.contact, href: "/contact" },
          { label: t.nav.calculator, href: "/calculator" },
        ],
      },
    ];
  }, [footerSettings?.columns, t]);

  const footerRef = useRef<HTMLElement>(null);
  const ctaBandRef = useRef<HTMLDivElement>(null);
  const topColumnsRef = useRef<HTMLDivElement>(null);
  const bottomWordmarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || navigator.userAgent.includes("jsdom")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // 0. Upper Pre-Footer CTA Band Reveal
      if (ctaBandRef.current) {
        const items = ctaBandRef.current.querySelectorAll("[data-cta-item]");
        gsap.fromTo(
          items,
          { opacity: 0, y: 26, filter: "blur(6px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ctaBandRef.current,
              start: "top 82%",
            },
          },
        );
      }

      // 1. Main Footer 4-Column Staggered Scale & Fade Reveal (matching s5-footer.txt scale(0.98) -> 1)
      if (topColumnsRef.current) {
        const cols = topColumnsRef.current.querySelectorAll("[data-ftr-col]");
        gsap.fromTo(
          cols,
          { opacity: 0, scale: 0.96, y: 24 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: topColumnsRef.current,
              start: "top 88%",
            },
          },
        );
      }

      // 2. Bottom Wordmark & Copyright Bar Reveal
      if (bottomWordmarkRef.current) {
        gsap.fromTo(
          bottomWordmarkRef.current,
          { opacity: 0, y: 32, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: bottomWordmarkRef.current,
              start: "top 92%",
            },
          },
        );
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      data-framer-name="Footer"
      className="relative z-[2] w-full overflow-hidden bg-[#163038] text-white"
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      {/* Upper Architectural Pre-Footer CTA Band (Image 1 + Sunset Terrace Background Image 2) */}
      <div
        ref={ctaBandRef}
        data-framer-name="Footer CTA Band"
        className="relative w-full overflow-hidden border-b border-white/10 py-20 sm:py-28 lg:py-36 text-white"
      >
        {/* Background Sunset Penthouse Terrace Image with Multi-layered Luxury Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/footer-terrace-sunset.jpg"
            alt="Avrasya luxury penthouse sunset terrace overlooking the sea"
            className="h-full w-full object-cover object-center filter brightness-[0.78] contrast-[1.05]"
            loading="lazy"
          />
          {/* Subtle petrol tint and dark vignette overlay for flawless text legibility */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(22, 48, 56, 0.72) 0%, rgba(22, 48, 56, 0.58) 45%, rgba(22, 48, 56, 0.88) 88%, #163038 100%)",
            }}
          />
        </div>

        {/* Content Container (Matching Image 1: Gold Pill + Big Display Title + Subtitle + Appropriate Buttons) */}
        <div className="container-site relative z-10 mx-auto flex max-w-[840px] flex-col items-center px-4 text-center sm:px-6">
          {/* Gold Pill Badge */}
          <div
            data-cta-item
            className="inline-flex items-center justify-center rounded-[99px] bg-[#C5A059] px-4 py-1.5 shadow-md"
          >
            <span className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-white">
              Our Projects
            </span>
          </div>

          {/* Heading */}
          <h2
            data-cta-item
            className="mt-6 text-[32px] sm:text-[48px] lg:text-[56px] font-normal leading-[1.08] tracking-[-0.02em] text-white"
            style={{ fontFamily: '"Cormorant Garamond", "Instrument Serif", Georgia, serif' }}
          >
            Built with Purpose. <span className="italic">Made to Last.</span>
          </h2>

          {/* Subtitle */}
          <p
            data-cta-item
            className="mt-5 max-w-2xl text-[14px] sm:text-[16px] leading-[1.65] text-white/85"
          >
            Explore a selection of projects where thoughtful planning, skilled craftsmanship, and
            dependable execution come together to create spaces built for the future.
          </p>

          {/* Call to Action Buttons */}
          <div
            data-cta-item
            className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4"
          >
            <Link
              to="/properties"
              className="group inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-[13.5px] font-medium tracking-[0.03em] text-[#163038] shadow-lg transition-all duration-300 ease-out hover:bg-[#C5A059] hover:text-white hover:-translate-y-0.5 hover:shadow-xl no-underline"
            >
              <span>Explore Developments</span>
              <span className="transition-transform duration-300 ease-out group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-black/25 backdrop-blur-md px-6 py-3.5 text-[13.5px] font-medium tracking-[0.03em] text-white transition-all duration-300 ease-out hover:border-white hover:bg-white/15 hover:-translate-y-0.5 no-underline"
            >
              <span>Schedule Private Consultation</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Dark Footer Content on #163038 (.framer-1g1y0a9: max-w 1160px, gap 60px) */}
      <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-[50px] px-5 pt-12 pb-8 sm:px-8 lg:gap-[60px] lg:pt-16">
        {/* Top 4-Column Row (.framer-1f27c7d) */}
        <div
          ref={topColumnsRef}
          data-framer-name="Top Content"
          className="flex flex-col justify-between gap-12 lg:flex-row lg:items-start lg:gap-10"
        >
          {/* Left Column (.framer-15ub24g: width 247px, rounded 12px image card + tagline + Avrasya Logo) */}
          <div data-ftr-col className="flex w-full max-w-[247px] flex-col items-start gap-[24px]">
            <div className="relative h-[206px] w-full overflow-hidden rounded-[12px] bg-[#10242A] border border-white/10 p-6 flex items-center justify-center">
              <img
                src={resolvePlaceholderSrc(PLACEHOLDER_IMAGES.footer.featureCard)}
                alt={PLACEHOLDER_IMAGES.footer.featureCard.alt}
                loading="lazy"
                className="block h-full w-full object-contain object-center"
              />
            </div>
            <p className="text-[15px] font-normal leading-[1.45] text-white whitespace-pre-line">
              {footerNote}
            </p>
            <Logo className="h-8 opacity-90" variant="light" />
          </div>

          {/* Right Columns: Dynamic Navigation Columns + Contact Info Column (.framer-vchq4r) */}
          <div className="grid flex-1 grid-cols-1 gap-10 sm:grid-cols-3 lg:max-w-[760px] lg:gap-12">
            {footerColumns.map(
              (
                col: { title: string; links: Array<{ label: string; href: string }> },
                cIdx: number,
              ) => (
                <div key={cIdx} data-ftr-col className="flex flex-col items-start gap-[28px]">
                  <p className="text-[18px] font-medium leading-[1.4] text-white">{col.title}</p>
                  <ul className="flex flex-col gap-[16px] text-[15px] text-white">
                    {col.links.map((link: { label: string; href: string }, lIdx: number) => (
                      <li key={lIdx}>
                        <Link
                          to={link.href}
                          className="text-white/85 no-underline transition-colors hover:text-[#C5A059]"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}

            {/* Contact Info Column (.framer-6niz2k) */}
            <div data-ftr-col className="flex flex-col items-start gap-[28px]">
              <p className="text-[18px] font-medium leading-[1.4] text-white">Contact Info</p>

              <div className="flex flex-col gap-[16px]">
                {/* Email */}
                <a
                  href={`mailto:${footerEmail}`}
                  className="flex items-center gap-[12px] text-[15px] text-white no-underline transition-opacity hover:opacity-80"
                >
                  <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[10px] bg-[#30312e] text-white">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <span className="truncate">{footerEmail}</span>
                </a>

                {/* Phone */}
                <a
                  href={`tel:${footerPhone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-[12px] text-[15px] text-white no-underline transition-opacity hover:opacity-80"
                >
                  <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[10px] bg-[#30312e] text-white">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <span>{footerPhone}</span>
                </a>

                {/* Address */}
                <div className="flex items-center gap-[12px] text-[15px] text-white">
                  <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[10px] bg-[#30312e] text-white">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <span className="line-clamp-2">{footerAddress}</span>
                </div>
              </div>

              {/* 4 Social Buttons Row (.framer-1n5e99r) */}
              <div className="flex items-center gap-[16px]">
                <a
                  href={contact.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-white/10 text-white transition-colors hover:bg-[#C5A059]"
                >
                  <MessageSquare className="h-4 w-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-white/10 text-white transition-colors hover:bg-[#C5A059]"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/company/avrasya-properties"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-white/10 text-white transition-colors hover:bg-[#C5A059]"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com/avrasyaproperties"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-white/10 text-white transition-colors hover:bg-[#C5A059]"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Giant Full-Width Brand Wordmark + Copyright Bar (.framer-1v522g2) */}
        <div
          ref={bottomWordmarkRef}
          data-framer-name="Bottom Content"
          className="flex w-full flex-col gap-[24px]"
        >
          {/* Edge-to-Edge Gold Wordmark SVG matching Bildora's 3.986 aspect ratio */}
          <div className="w-full overflow-hidden select-none opacity-90">
            <svg
              viewBox="0 0 1160 250"
              className="block h-auto w-full"
              role="img"
              aria-label="Avrasya"
            >
              <text
                x="50%"
                y="212"
                textAnchor="middle"
                fill="#C5A059"
                fontFamily="Inter, Geist, sans-serif"
                fontWeight="700"
                fontSize="240"
                letterSpacing="-8"
              >
                Avrasya
              </text>
            </svg>
          </div>

          {/* Copyright & Legal Links Row (.framer-10b9k1l) */}
          <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-[24px] text-[13px] text-white sm:flex-row sm:items-center">
            <p>{copyrightText}</p>
            <div className="flex flex-wrap items-center gap-5 text-[13px] text-white/80">
              <Link to="/privacy-policy" className="text-white/80 no-underline hover:text-white">
                {t.footer.privacyPolicy}
              </Link>
              <Link to="/terms" className="text-white/80 no-underline hover:text-white">
                {t.footer.termsConditions}
              </Link>
              <Link to="/cookie-policy" className="text-white/80 no-underline hover:text-white">
                {t.footer.cookiePolicy}
              </Link>
              <Link
                to="/investment-disclaimer"
                className="text-white/80 no-underline hover:text-white"
              >
                {t.footer.investmentDisclaimer}
              </Link>
              <LanguageSwitcher variant="footer" />
            </div>
          </div>
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
      <div className="container-site relative z-10 flex flex-col gap-6 border-b border-white/10 py-12 md:flex-row md:items-end md:justify-between md:py-20">
        <div className="max-w-3xl">
          <p className="kicker text-brass-light">{eyebrow}</p>
          <h1 className="display-hero mt-4 !text-[2.6rem] md:!text-[4.25rem]">
            <span className="split-line">
              <span style={{ ["--d" as string]: "80ms" }}>{title}</span>
            </span>
          </h1>
          {content && (
            <div className="mt-6 max-w-2xl text-base leading-relaxed text-on-dark-muted">
              {content}
            </div>
          )}
        </div>
        {aside}
      </div>
      <PageIdentityLineArt />
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
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-on-dark-muted md:text-base">
            {t.cta.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Magnetic>
            <Link to="/contact" className="btn btn-light">
              {t.cta.requestConsultation}
            </Link>
          </Magnetic>
          <a
            href={contact.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="btn gap-1.5 !border !border-white/30 !bg-transparent !text-white"
          >
            <MessageSquare className="h-3.5 w-3.5" /> {t.cta.chatWhatsApp}
          </a>
        </div>
      </div>
    </section>
  );
}
