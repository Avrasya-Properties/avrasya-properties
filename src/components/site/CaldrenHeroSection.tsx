import React, { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PLACEHOLDER_IMAGES, resolvePlaceholderSrc } from "@/data/placeholders";
import { CaldrenViewingModal } from "@/components/framer/CaldrenViewingModal";
import type { SiteSettings } from "@/admin/demo";
import { recordPublicEnquiry } from "@/admin/store";
import type { PropertyRecord } from "@/data/properties";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface CaldrenHeroSectionProps {
  settings: SiteSettings;
  locale?: string;
  t?: any;
  featuredProperty?: PropertyRecord | undefined;
}

export interface Tilt3DState {
  rotateX: number;
  rotateY: number;
  translateZ: number;
  sheenX: number;
  sheenY: number;
}

/**
 * Pure calculation helper for pointer-driven 3D tilt tracking.
 * Calculates normalized coordinates and outputs clamped 3D rotation angles,
 * depth push (translateZ), and interactive specular sheen position.
 */
export function calculateHero3DTilt(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
): Tilt3DState {
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return { rotateX: 0, rotateY: 0, translateZ: 0, sheenX: 50, sheenY: 50 };
  }
  const normX = (clientX - rect.left) / rect.width - 0.5;
  const normY = (clientY - rect.top) / rect.height - 0.5;

  const clampedX = Math.max(-0.6, Math.min(0.6, normX));
  const clampedY = Math.max(-0.6, Math.min(0.6, normY));

  // Pointer tracking math:
  // Moving mouse right tilts clockwise around Y axis (+rotateY)
  // Moving mouse down tilts forward around X axis (-rotateX)
  const rotateY = Number((clampedX * 10).toFixed(2));
  const rotateX = Number((-clampedY * 8).toFixed(2));
  const translateZ = Number(
    (Math.max(0, 1 - Math.abs(clampedX) - Math.abs(clampedY)) * 14).toFixed(2),
  );

  const sheenX = Math.round((clampedX + 0.5) * 100);
  const sheenY = Math.round((clampedY + 0.5) * 100);

  return { rotateX, rotateY, translateZ, sheenX, sheenY };
}

export const CaldrenHeroSection: React.FC<CaldrenHeroSectionProps> = ({
  settings,
  featuredProperty,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"showreel" | "viewing">("showreel");

  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const mobileCtaRef = useRef<HTMLDivElement>(null);
  const showreelRef = useRef<HTMLButtonElement>(null);
  const pulseRingRef = useRef<HTMLSpanElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const birdsRef = useRef<HTMLDivElement>(null);
  const keepScrollingRef = useRef<HTMLButtonElement>(null);
  const mouseWheelRef = useRef<SVGPathElement>(null);
  const discoverRef = useRef<HTMLDivElement>(null);
  const towerWrapRef = useRef<HTMLDivElement>(null);
  const skylineRef = useRef<HTMLDivElement>(null);
  const glazeRef = useRef<HTMLDivElement>(null);
  const pinWrapRef = useRef<HTMLDivElement>(null);

  // GSAP quickTo setters for 3D tilt tracking
  const qRotateXRef = useRef<((val: number) => void) | null>(null);
  const qRotateYRef = useRef<((val: number) => void) | null>(null);
  const qTranslateZRef = useRef<((val: number) => void) | null>(null);

  const rawTitle = featuredProperty?.marketing_title?.trim();
  const pinTitle = rawTitle
    ? rawTitle.length > 22
      ? "AVRASYA RESIDENCES"
      : rawTitle.toUpperCase()
    : "AURELIA RESIDENCES";

  const pinSubtitle = featuredProperty
    ? `${featuredProperty.location_label || featuredProperty.city} · ${
        featuredProperty.price?.amount
          ? `From $${featuredProperty.price.amount.toLocaleString()}`
          : "From $420,000"
      }`
    : "Beşiktaş, Istanbul · From $420,000";

  const rawHeadline =
    (typeof settings.websiteDesign?.["heroHeadline"] === "string"
      ? (settings.websiteDesign["heroHeadline"] as string)
      : "") || settings.heroHeadline;
  const headlineWords =
    rawHeadline && rawHeadline.trim()
      ? rawHeadline.trim().split(/\s+/)
      : ["Exceptional", "spaces,", "thoughtfully", "presented."];

  const heroSubtitle =
    (typeof settings.websiteDesign?.["heroSubtitle"] === "string"
      ? (settings.websiteDesign["heroSubtitle"] as string)
      : "") ||
    settings.heroSubtitle ||
    "Residences, penthouses and new developments selected for architecture, address and light.";

  const heroMainImage =
    (typeof settings.websiteDesign?.["heroMain"] === "string" &&
    settings.websiteDesign["heroMain"].trim().length > 0
      ? (settings.websiteDesign["heroMain"] as string)
      : "") ||
    resolvePlaceholderSrc(PLACEHOLDER_IMAGES.hero.towerSkyline) ||
    "/images/hero-building-avrasya.png";

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    if (!skylineRef.current) return;
    const rect = skylineRef.current.getBoundingClientRect();
    const tilt = calculateHero3DTilt(e.clientX, e.clientY, rect);

    if (glazeRef.current) {
      glazeRef.current.style.setProperty("--sheen-x", `${tilt.sheenX}%`);
      glazeRef.current.style.setProperty("--sheen-y", `${tilt.sheenY}%`);
    }
  };

  const handlePointerLeave = () => {
    if (glazeRef.current) {
      glazeRef.current.style.setProperty("--sheen-x", "50%");
      glazeRef.current.style.setProperty("--sheen-y", "50%");
    }
  };

  const handleViewingSubmit = async (payload: {
    name: string;
    email: string;
    phone: string;
    date: string;
    viewingType: string;
    notes: string;
  }) => {
    try {
      const idKey =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `hero-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      await recordPublicEnquiry({
        name: payload.name || "Hero Section Visitor",
        email: payload.email,
        phone: payload.phone,
        topic: "Private Viewing",
        source: "Hero Section",
        propertySlug: featuredProperty?.slug,
        message: `Private Viewing Request for ${featuredProperty?.marketing_title || "Featured Residence"}. Viewing Type: ${payload.viewingType || "In-Person"}.${payload.date ? ` Preferred Date: ${payload.date}.` : ""}${payload.notes ? ` Notes: ${payload.notes}` : ""}`,
        consent: true,
        idempotencyKey: idKey,
      });
    } catch (err) {
      console.error("Hero viewing inquiry submission error:", err);
    }
  };

  const scrollToNextSection = () => {
    const el = document.getElementById("after-hero-about");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || navigator.userAgent.includes("jsdom")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // 0. Setup GSAP quickTo functions for smooth 3D tilt tracking
      if (skylineRef.current) {
        qRotateXRef.current = gsap.quickTo(skylineRef.current, "rotationX", {
          duration: 0.75,
          ease: "power2.out",
        });
        qRotateYRef.current = gsap.quickTo(skylineRef.current, "rotationY", {
          duration: 0.75,
          ease: "power2.out",
        });
        qTranslateZRef.current = gsap.quickTo(skylineRef.current, "z", {
          duration: 0.75,
          ease: "power2.out",
        });
      }

      // 1. Entrance Timeline
      const tl = gsap.timeline({ defaults: { overwrite: "auto" } });

      // Architectural residence ascends with 3D scale and crisp lift
      if (skylineRef.current) {
        gsap.set(skylineRef.current, {
          y: 40,
          scale: 1,
          opacity: 0,
          transformOrigin: "50% 100%",
        });
        tl.to(
          skylineRef.current,
          {
            y: 0,
            scale: 1,
            duration: 1.6,
            ease: "power3.out",
          },
          0.12,
        );
        tl.to(
          skylineRef.current,
          {
            opacity: 1,
            duration: 1.0,
            ease: "power2.out",
          },
          0.12,
        );
      }

      // Headline words entrance
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll("[data-hero-word]");
        if (words.length) {
          gsap.set(words, { y: 24, opacity: 0, filter: "blur(6px)" });
          tl.to(
            words,
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: 1.1,
              stagger: 0.08,
              ease: "power3.out",
            },
            0.28,
          );
        }
      }

      // Solitary Mobile CTA button: ONLY reveal after property 3D entrance tween completes!
      // Building entrance begins at 0.12s with 1.6s duration (completes at 1.72s).
      // Solitary CTA smoothly animates up into view at 1.75s (not prematurely at 0.5s).
      if (mobileCtaRef.current) {
        gsap.set(mobileCtaRef.current, { y: 20, opacity: 0 });
        tl.to(
          mobileCtaRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power2.out",
          },
          1.75,
        );
      }

      // Desktop side controls (Showreel, Intro, Keep Scrolling, Discover) staggered entrance
      const fadeTargets = [
        showreelRef.current,
        introRef.current,
        keepScrollingRef.current,
        discoverRef.current,
      ].filter(Boolean);
      gsap.set(fadeTargets, { y: 16, opacity: 0 });
      tl.to(
        fadeTargets,
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          stagger: 0.08,
          ease: "power3.out",
        },
        0.42,
      );

      // Birds flock entrance in upper sky
      if (birdsRef.current) {
        gsap.set(birdsRef.current, { y: 14, opacity: 0 });
        tl.to(
          birdsRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 1.8,
            ease: "power2.out",
          },
          0.8,
        );
      }

      // Featured Pin tag slides out smoothly from building
      if (pinWrapRef.current) {
        gsap.set(pinWrapRef.current, { x: -16, opacity: 0 });
        tl.to(
          pinWrapRef.current,
          {
            x: 0,
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
          },
          1.3,
        );
      }

      // 2. Continuous loops (Showreel halo pulse + Mouse wheel indicator bob)
      if (pulseRingRef.current) {
        gsap.to(pulseRingRef.current, {
          scale: 1.2,
          opacity: 0.35,
          duration: 1.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      if (mouseWheelRef.current) {
        gsap.to(mouseWheelRef.current, {
          y: 3.5,
          duration: 0.85,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      // 3. GSAP ScrollTrigger Scrubbed Parallax & Architectural Building Ascend
      if (sectionRef.current) {
        const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

        // Caldren hero interaction:
        // Building stays anchored at the bottom edge of the frame while scaling gently from its base,
        // and the headline drifts behind the building so zero empty gap is ever exposed!
        if (towerWrapRef.current) {
          gsap.to(towerWrapRef.current, {
            y: 0,
            scale: 1.03,
            transformOrigin: "50% 100%",
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          });
        }

        // Birds horizontal flight across sky on scroll
        if (birdsRef.current) {
          gsap.to(birdsRef.current, {
            x: -200,
            y: -30,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.5,
            },
          });
        }

        // Headline sits behind the building (z-[2]) and drifts down gently behind the ascending roofline
        if (headlineRef.current) {
          gsap.to(headlineRef.current, {
            y: isMobile ? 35 : 85,
            opacity: 0.4,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          });
        }

        // Side controls fade out smoothly as scrolling commences
        const sideNodes = [
          mobileCtaRef.current,
          showreelRef.current,
          introRef.current,
          keepScrollingRef.current,
          discoverRef.current,
          pinWrapRef.current,
        ].filter(Boolean);

        if (sideNodes.length) {
          gsap.to(sideNodes, {
            opacity: 0,
            y: -24,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top+=40 top",
              end: "center top",
              scrub: 0.5,
            },
          });
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-home-hero
      data-framer-name="Hero"
      data-bg-monograph="#0B1619"
      className="relative w-full overflow-clip select-none"
      style={{
        backgroundColor: "#0B1619",
        background:
          "radial-gradient(ellipse 85% 50% at 50% 0%, rgba(22, 48, 56, 0.55) 0%, #0B1619 75%)",
        fontFamily: '"Geist", "Inter", sans-serif',
      }}
    >
      {/* Minimal Architectural Grid Layer in the Outer Frame */}
      <div className="star-bg-layer z-[0]" aria-hidden="true" />

      {/* Top Bar in the Deep Forest Petrol Sky Margin */}
      <div
        data-framer-name="Top Bar"
        className="relative z-[2] flex h-[44px] sm:h-[48px] w-full items-center justify-center px-4 text-center"
      >
        <p className="text-[10px] sm:text-[10.5px] font-medium uppercase tracking-[0.22em] text-white/85">
          AVRASYA — LUXURY REAL ESTATE &amp; PROPERTY ADVISORY
        </p>
      </div>

      {/* Right-Edge Decorative Vertical Indicator Pill (Desktop) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-[310px] z-30 hidden h-[96px] w-[24px] flex-col items-center justify-between rounded-full bg-[#163038]/85 py-2.5 text-white/90 backdrop-blur-md shadow-lg xl:flex"
      >
        <span className="h-9 w-[1.5px] rounded-full bg-white/40" />
        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#C5A059]/60 text-[9px] text-[#C5A059]">
          ✦
        </span>
      </div>

      {/* Inner White Frame (Pristine clean card matching Caldren) */}
      <div className="relative z-[1] mx-auto w-[calc(100%-16px)] sm:w-[calc(100%-32px)] lg:w-[calc(100%-48px)] max-w-[1440px]">
        <div
          data-framer-name="Frame"
          className="relative w-full overflow-clip rounded-t-[24px] sm:rounded-t-[36px] px-0 pt-[20px] pb-0 sm:pt-[28px] lg:pt-[36px]"
          style={{
            background: "#FFFFFF",
          }}
        >
          {/* Giant Display Headline */}
          <div
            ref={headlineRef}
            data-framer-name="Headline"
            className="relative z-[2] mx-auto mt-2 max-w-[1120px] px-4 text-center sm:mt-4 sm:px-8 lg:mt-[16px] lg:px-[40px]"
          >
            <h1 className="text-[36px] font-normal leading-[1.02] tracking-[-0.035em] text-[#163038] sm:text-[62px] sm:leading-[0.98] lg:text-[96px]">
              {headlineWords.map((word, idx) => (
                <React.Fragment key={idx}>
                  <span
                    data-hero-word
                    className={`inline-block ${
                      idx === 1 ? "italic font-normal tracking-[-0.02em] text-[#163038]" : ""
                    }`}
                    style={
                      idx === 1
                        ? { fontFamily: '"Cormorant Garamond", "Instrument Serif", Georgia, serif' }
                        : undefined
                    }
                  >
                    {word}
                  </span>
                  {idx < headlineWords.length - 1 ? " " : null}
                  {idx === 1 ? <br /> : null}
                </React.Fragment>
              ))}
            </h1>
          </div>

          {/* Solitary Mobile CTA: Explore Properties */}
          <div
            ref={mobileCtaRef}
            data-mobile-solitary-cta
            className="relative z-20 mt-4 sm:mt-5 flex justify-center lg:hidden"
          >
            <Link
              to="/properties"
              className="group inline-flex h-[44px] items-center gap-[12px] rounded-full bg-[#163038] py-[5px] pr-[5px] pl-[18px] text-[13px] font-medium text-white no-underline shadow-md transition-all duration-300 hover:bg-[#10785F] active:scale-[0.98]"
            >
              <span>Explore Properties</span>
              <span className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white text-[#163038] transition-transform duration-300 group-hover:translate-x-0.5">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Desktop Spatial Elements Flanking the Centered Building (Hidden on mobile to eliminate clutter) */}
          <div className="relative z-[3] hidden lg:block">
            {/* 1. Watch Showreel Trigger (Left Column) */}
            <button
              ref={showreelRef}
              type="button"
              onClick={() => {
                setModalMode("showreel");
                setModalOpen(true);
              }}
              aria-haspopup="dialog"
              data-framer-name="Showreel"
              className="group inline-flex cursor-pointer items-center gap-[16px] border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.18em] text-[#163038] lg:absolute lg:top-[225px] lg:left-[48px] xl:left-[80px] 2xl:left-[110px] lg:z-[3]"
            >
              <span>Watch</span>
              <span className="relative block h-[54px] w-[54px] shrink-0">
                <span
                  ref={pulseRingRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-[6px] rounded-full bg-[#C5A059]/25"
                />
                <span className="relative block h-full w-full overflow-hidden rounded-full shadow-[0_10px_26px_rgba(22,48,56,0.18)] transition-transform duration-500 ease-out group-hover:scale-[1.06]">
                  <img
                    src={resolvePlaceholderSrc(PLACEHOLDER_IMAGES.hero.showreelThumb)}
                    alt={PLACEHOLDER_IMAGES.hero.showreelThumb.alt}
                    className="block h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.12]"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-[#163038]/25 text-white">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="8 5 19 12 8 19 8 5" fill="none" />
                    </svg>
                  </span>
                </span>
              </span>
              <span>Showreel</span>
            </button>

            {/* 2. Left Column Intro Copy & Desktop Explore Properties Pill */}
            <div
              ref={introRef}
              data-framer-name="Intro"
              className="flex max-w-[260px] flex-col items-start gap-[18px] text-left lg:absolute lg:top-[335px] lg:left-[48px] xl:left-[80px] 2xl:left-[110px] lg:z-[3]"
            >
              <p className="text-[13px] font-normal leading-[1.55] text-[#5C6F73]">
                {heroSubtitle}
              </p>

              <Link
                to="/properties"
                className="group inline-flex h-[46px] items-center gap-[14px] rounded-full bg-[#163038] py-[6px] pr-[6px] pl-[20px] text-[13px] font-medium text-white no-underline shadow-md transition-all duration-300 hover:bg-[#10785F] hover:shadow-lg"
              >
                <span>Explore Properties</span>
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white text-[#163038] transition-transform duration-300 group-hover:translate-x-0.5">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* 3. Flock of Birds in Sky (Right Column) */}
            <div
              ref={birdsRef}
              data-framer-name="Birds"
              aria-hidden="true"
              className="pointer-events-none lg:absolute lg:top-[160px] lg:right-[150px] xl:right-[200px] lg:z-[1] lg:block lg:h-[80px] lg:w-[190px]"
            >
              <svg
                width="190"
                height="80"
                viewBox="0 0 209 87"
                fill="none"
                className="h-full w-full"
              >
                <path
                  d="M12 44C15 41 18 41 20.5 44C23 41 26 41 29 44M38 35C40.5 32.5 43 32.5 45 35C47 32.5 49.5 32.5 52 35M64 47C66.5 44.5 69 44.5 71 47C73 44.5 75.5 44.5 78 47M88 31C90.5 28.5 93 28.5 95 31C97 28.5 99.5 28.5 102 31M108 42C110.5 39.5 113 39.5 115 42C117 39.5 119.5 39.5 122 42M134 27C136.5 24.5 139 24.5 141 27C143 24.5 145.5 24.5 148 27M156 39C158.5 36.5 161 36.5 163 39C165 36.5 167.5 36.5 170 39M178 46C180 44 182 44 183.5 46C185 44 187 44 189 46"
                  stroke="#163038"
                  strokeOpacity="0.65"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* 4. Keep Scrolling Mouse Indicator (Right Column) */}
            <button
              ref={keepScrollingRef}
              type="button"
              onClick={scrollToNextSection}
              aria-label="Keep scrolling"
              data-framer-name="Keep Scrolling"
              className="inline-flex cursor-pointer items-center gap-[10px] border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.18em] text-[#163038] transition-opacity hover:opacity-75 lg:absolute lg:top-[180px] lg:right-[48px] xl:right-[80px] 2xl:right-[110px] lg:z-[3]"
            >
              <span>Keep scrolling</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M10 18.3333C13.4417 18.3333 16.25 15.525 16.25 12.0833V7.91667C16.25 4.475 13.4417 1.66667 10 1.66667C6.55833 1.66667 3.75 4.475 3.75 7.91667V12.0833C3.75 15.525 6.55833 18.3333 10 18.3333Z"
                  stroke="#163038"
                  strokeOpacity="0.8"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 5V1.66667"
                  stroke="#163038"
                  strokeOpacity="0.8"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  ref={mouseWheelRef}
                  d="M10 9.16667C9.30833 9.16667 8.75 8.60833 8.75 7.91667V6.25C8.75 5.55833 9.30833 5 10 5C10.6833 5 11.25 5.55833 11.25 6.25V7.91667C11.25 8.60833 10.6833 9.16667 10 9.16667Z"
                  stroke="#163038"
                  strokeOpacity="0.8"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* 5. Featured Interactive Pin Callout (Positioned neatly between Keep Scrolling & Discover Block) */}
            <div
              ref={pinWrapRef}
              data-framer-name="Pin Wrap"
              className="pointer-events-auto flex items-center lg:absolute lg:top-[245px] lg:right-[48px] xl:right-[80px] 2xl:right-[110px] lg:z-[3]"
            >
              <div data-framer-name="Featured Pin" className="flex items-center group">
                <span className="relative flex h-[14px] w-[14px] items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2DD4BF] opacity-75" />
                  <span className="relative inline-flex h-[8px] w-[8px] rounded-full bg-[#2DD4BF] shadow-[0_0_12px_#2DD4BF]" />
                </span>
                <span
                  data-framer-name="Line"
                  className="block h-[1px] w-[36px] xl:w-[48px] shrink-0"
                  style={{
                    background:
                      "linear-gradient(90deg, #2DD4BF 0%, rgba(197, 160, 89, 0.6) 60%, rgba(22, 48, 56, 0.2) 100%)",
                  }}
                />
                <Link
                  to="/properties"
                  data-framer-name="Tag"
                  className="flex flex-col gap-[1px] rounded-[9px] border border-[#DEE0DD] bg-white/95 px-3 py-1.5 shadow-[0_6px_16px_rgba(22,48,56,0.10)] backdrop-blur-md transition-all duration-300 hover:border-[#C5A059] hover:shadow-md no-underline max-w-[215px]"
                >
                  <span className="text-[10px] font-semibold uppercase leading-[1.3] tracking-[0.14em] text-[#163038] truncate">
                    {pinTitle}
                  </span>
                  <span className="text-[11px] font-normal leading-[1.3] text-[#5C6F73] truncate">
                    {pinSubtitle}
                  </span>
                  <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#10785F]">
                    Tapu Ready &middot; CBI Eligible
                  </span>
                </Link>
              </div>
            </div>

            {/* 6. Right Column Discover Block (Neatly positioned with plenty of spacing) */}
            <div
              ref={discoverRef}
              data-framer-name="Discover"
              className="flex max-w-[240px] flex-col items-start gap-[12px] text-left lg:absolute lg:top-[375px] lg:right-[48px] xl:right-[80px] 2xl:right-[110px] lg:z-[3]"
            >
              <p className="text-[11px] font-normal uppercase leading-[1.55] tracking-[0.06em] text-[#163038]">
                Curating exceptional residences across Istanbul, Bodrum, Antalya and Sakarya.
              </p>
              <Link
                to="/about"
                className="group inline-flex items-center gap-[8px] text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#163038] no-underline transition-colors hover:text-[#C5A059]"
              >
                <span className="text-[13px] leading-none transition-transform duration-300 group-hover:rotate-90">
                  +
                </span>
                <span>DISCOVER AVRASYA</span>
              </Link>
            </div>
          </div>

          {/* Central Grounded Luxury Building Asset — Caldren Scroll Interaction */}
          <div
            ref={towerWrapRef}
            data-framer-name="Building Presentation"
            data-3d-stage
            data-perspective="1200px"
            className="relative z-[10] m-0 -mt-8 sm:-mt-14 lg:-mt-20 w-full max-w-none overflow-hidden flex items-end justify-center pointer-events-auto select-none [perspective:1200px]"
            style={{
              perspective: "1200px",
              perspectiveOrigin: "50% 100%",
            }}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            {/* 3D Volumetric Tilting Container with Multi-Plane Depth */}
            <div
              ref={skylineRef}
              data-framer-name="Skyline"
              data-3d-volumetric-container
              data-transform-style="preserve-3d"
              className="relative z-[2] w-full flex justify-center will-change-transform [transform-style:preserve-3d]"
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "50% 100%",
              }}
            >
              {/* Plane 0: Foundation / Ground Plane */}
              <div
                data-plane="ground-plane"
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[40px] opacity-0"
                style={{
                  transform: "translateZ(-15px)",
                  opacity: 0,
                }}
              />

              {/* Plane 1: Ground Drop Shadow Plane (translateZ: -30px) */}
              <div
                data-plane="ground-shadow"
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[40px] opacity-0"
                style={{
                  transform: "translateZ(-30px)",
                  opacity: 0,
                }}
              />

              {/* Plane 2: Authentic Building PNG Asset Plane (translateZ: 10px) */}
              <div
                data-plane="building-asset"
                className="relative z-[2] w-full flex justify-center"
                style={{
                  transform: "translateZ(10px)",
                  transformStyle: "preserve-3d",
                }}
              >
                <img
                  src={heroMainImage}
                  alt={PLACEHOLDER_IMAGES.hero.towerSkyline.alt}
                  className="block h-auto w-full min-w-full object-cover object-bottom select-none pointer-events-none"
                  loading="eager"
                />
              </div>

              {/* Plane 3: Specular Sheen Glaze Plane (translateZ: 25px) — disabled visually to prevent cursor highlight */}
              <div
                ref={glazeRef}
                data-plane="specular-glaze"
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[4] opacity-0"
                style={{
                  transform: "translateZ(25px)",
                  opacity: 0,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Showreel & Private Viewing Modal */}
      <CaldrenViewingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        propertyTitle={featuredProperty?.marketing_title || "Aurelia Bosphorus Residences"}
        propertyLocation={
          featuredProperty
            ? `${featuredProperty.location_label || featuredProperty.city} · Türkiye`
            : "Beşiktaş · Istanbul, Türkiye"
        }
        agentEmail={settings.email}
        agentPhone={settings.phone}
        onSubmitInquiry={handleViewingSubmit}
      />
    </section>
  );
};

export default CaldrenHeroSection;
