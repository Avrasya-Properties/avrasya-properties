import React, { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { applyMagneticHover } from "@/lib/animation/magnetic";
import type { PartnerItem } from "@/admin/demo";
import { DEFAULT_PARTNERS } from "@/admin/demo";

export type PartnerInput = Omit<PartnerItem, "sortOrder"> & { sortOrder?: number };

export interface PartnersSectionProps {
  title?: string;
  eyebrow?: string;
  partners?: PartnerInput[] | undefined;
}

export const PartnersSection: React.FC<PartnersSectionProps> = ({
  title = "References and Partners",
  eyebrow = "Partners & References",
  partners = DEFAULT_PARTNERS,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Filter only visible partners
  const activePartners = (partners && partners.length > 0 ? partners : DEFAULT_PARTNERS)
    .filter((p) => p.is_visible !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Duplicate items 3 times to ensure seamless infinite looping ribbon across ultra-wide monitors
  const marqueeItems = [...activePartners, ...activePartners, ...activePartners];

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isReduced = prefersReducedMotion();
    const magneticCleanups: Array<() => void> = [];

    const track = trackRef.current;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // 1. Smooth Entrance Animation on Golden Section Heading
      if (headingRef.current && !isReduced) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      // 2. Staggered Entrance Animation for Partner Cards (keep base opacity visible so marquee logos never disappear on fast scroll)
      const partnerCards = section.querySelectorAll<HTMLElement>("[data-partner-card]");
      if (partnerCards.length && !isReduced) {
        gsap.fromTo(
          partnerCards,
          { opacity: 0.92, scale: 0.94, y: 10 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.03,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 92%",
            },
          },
        );

        // 3. Subtle Magnetic Hover Attraction on Partner Cards (desktop cursor)
        partnerCards.forEach((card) => {
          magneticCleanups.push(
            applyMagneticHover(card, {
              strength: 0.08,
              innerStrength: 0.12,
              returnDuration: 0.45,
              returnEase: "power3.out",
            }),
          );
        });
      }

      // 4. Seamless infinite loop marquee to the left (with ScrollTrigger velocity booster)
      if (track && !isReduced) {
        const loop = gsap.to(track, {
          xPercent: -33.333333,
          ease: "none",
          duration: 28,
          repeat: -1,
        });
        tweenRef.current = loop;

        ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const vel = self.getVelocity() / 300;
            const targetTimeScale = 1 + Math.min(Math.max(vel, 0), 4);
            gsap.to(loop, {
              timeScale: targetTimeScale,
              duration: 0.35,
              ease: "power1.out",
              overwrite: "auto",
              onComplete: () => {
                gsap.to(loop, {
                  timeScale: 1,
                  duration: 0.8,
                  ease: "power2.out",
                });
              },
            });
          },
        });
      }
    }, sectionRef);

    return () => {
      magneticCleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [activePartners.length]);

  const handleMouseEnter = () => {
    if (tweenRef.current) {
      gsap.to(tweenRef.current, { timeScale: 0.25, duration: 0.5, ease: "power2.out" });
    }
  };

  const handleMouseLeave = () => {
    if (tweenRef.current) {
      gsap.to(tweenRef.current, { timeScale: 1, duration: 0.6, ease: "power2.out" });
    }
  };

  if (activePartners.length === 0) return null;

  const isReduced = typeof window !== "undefined" && prefersReducedMotion();

  const renderCardContent = (partner: PartnerInput) => (
    <div
      data-partner-card
      className="group relative flex h-[76px] sm:h-[90px] md:h-[104px] min-w-[180px] sm:min-w-[220px] md:min-w-[260px] items-center justify-center px-6 sm:px-8 py-3"
    >
      <img
        src={partner.logo}
        alt={`${partner.name} logo`}
        className="max-h-[44px] sm:max-h-[52px] md:max-h-[60px] max-w-[170px] sm:max-w-[210px] w-auto object-contain brightness-0 invert opacity-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-[1.04]"
        loading="eager"
        decoding="async"
      />
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id="partners-section"
      data-partners-section
      aria-label="Partners and References"
      className="relative w-full overflow-hidden border-t border-[#1F4550] py-14 sm:py-20 lg:py-24 select-none"
      style={{
        background: "linear-gradient(180deg, #163038 0%, #112830 50%, #0D2026 100%)",
        fontFamily: '"Geist", "Inter", sans-serif',
      }}
    >
      {/* Ambient background depth glow + Animated Primary Green Star Pattern */}
      <div className="star-bg-layer opacity-65" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(16, 120, 95, 0.25) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1312px] px-5 sm:px-8">
        {/* Section Heading — Bigger Golden Typography (Serif References and Partners removed) */}
        <div className="text-center md:text-left mb-8 sm:mb-12">
          <h2
            ref={headingRef}
            data-partners-heading
            aria-label={eyebrow}
            className="text-[20px] sm:text-[26px] lg:text-[32px] font-semibold uppercase tracking-[0.22em] text-[#C5A059]"
          >
            {eyebrow}
          </h2>
        </div>
      </div>

      {/* Reduced-Motion Static Fallback: Accessible Flex-Wrap Grid */}
      {isReduced ? (
        <div className="relative z-10 mx-auto flex max-w-[1312px] flex-wrap items-center justify-center gap-6 px-5 sm:px-8">
          {activePartners.map((partner) => {
            const content = renderCardContent(partner);
            return partner.website ? (
              <a
                key={partner.id}
                href={partner.website}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Visit ${partner.name}`}
                className="block no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] rounded-2xl"
              >
                {content}
              </a>
            ) : (
              <div key={partner.id} className="block">
                {content}
              </div>
            );
          })}
        </div>
      ) : (
        /* Cycling Infinite Logo Marquee Strip with Side Gradient Masks */
        <div
          className="relative z-10 w-full overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleMouseEnter}
          onTouchEnd={handleMouseLeave}
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 88%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 88%, transparent 100%)",
          }}
        >
          <div
            ref={trackRef}
            data-marquee-track
            className="flex w-max items-center gap-10 sm:gap-14 lg:gap-20 py-3 will-change-transform"
          >
            {marqueeItems.map((partner, index) => {
              const content = renderCardContent(partner);

              return partner.website ? (
                <a
                  key={`${partner.id}-${index}`}
                  href={partner.website}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Visit ${partner.name}`}
                  className="block no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] rounded-2xl"
                >
                  {content}
                </a>
              ) : (
                <div key={`${partner.id}-${index}`} className="block">
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default PartnersSection;
