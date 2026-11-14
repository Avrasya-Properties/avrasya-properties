import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { applyMagneticHover } from "@/lib/animation/magnetic";
import { PLACEHOLDER_IMAGES, resolvePlaceholderSrc } from "@/data/placeholders";
import type { PropertyRecord } from "@/data/properties";
import { useCatalogue } from "@/data/live";

export interface BildoraProjectsShowcaseProps {
  properties?: PropertyRecord[];
  collectionHeading?: string | undefined;
}

export interface ShowcaseProject {
  number: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  badge: string;
  location: string;
  href: string;
}

const DEFAULT_SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    number: "01",
    title: "The Oakline Residence",
    description:
      "A thoughtfully designed modern residence combining refined architecture, durable materials, and comfortable living spaces for everyday life.",
    imageSrc: resolvePlaceholderSrc(PLACEHOLDER_IMAGES.projectsShowcase[0]!),
    imageAlt: PLACEHOLDER_IMAGES.projectsShowcase[0]!.alt,
    badge: "Exclusive Portfolio",
    location: "Beşiktaş · Bosphorus Coastline",
    href: "/properties",
  },
  {
    number: "02",
    title: "Northgate Business Center",
    description:
      "A contemporary commercial development built with efficient planning, functional spaces, and a strong focus on quality and long-term performance.",
    imageSrc: resolvePlaceholderSrc(PLACEHOLDER_IMAGES.projectsShowcase[1]!),
    imageAlt: PLACEHOLDER_IMAGES.projectsShowcase[1]!.alt,
    badge: "Commercial Flagship",
    location: "Levent · Financial District",
    href: "/properties",
  },
  {
    number: "03",
    title: "Riverside Heights",
    description:
      "A modern multi-story development designed to bring together practical living, elegant architecture, and carefully crafted shared spaces.",
    imageSrc: resolvePlaceholderSrc(PLACEHOLDER_IMAGES.projectsShowcase[2]!),
    imageAlt: PLACEHOLDER_IMAGES.projectsShowcase[2]!.alt,
    badge: "Sovereign Penthouse",
    location: "Nişantaşı · Luxury Corridor",
    href: "/properties",
  },
  {
    number: "04",
    title: "Grandstone Pavilion",
    description:
      "A distinctive public space built around modern design, structural excellence, and a welcoming environment created for lasting community use.",
    imageSrc: resolvePlaceholderSrc(PLACEHOLDER_IMAGES.projectsShowcase[3]!),
    imageAlt: PLACEHOLDER_IMAGES.projectsShowcase[3]!.alt,
    badge: "Architectural Landmark",
    location: "Historical Peninsula · Istanbul",
    href: "/properties",
  },
];

export const BildoraProjectsShowcase: React.FC<BildoraProjectsShowcaseProps> = ({
  properties: propProperties,
  collectionHeading,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIdxRef = useRef(0);
  const swipeStartXRef = useRef<number | null>(null);

  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    swipeStartXRef.current = e.clientX;
  };

  const handleStagePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (swipeStartXRef.current === null) return;
    const dx = e.clientX - swipeStartXRef.current;
    swipeStartXRef.current = null;
    if (Math.abs(dx) > 42) {
      const next =
        dx < 0
          ? Math.min(showcaseItems.length - 1, activeIdxRef.current + 1)
          : Math.max(0, activeIdxRef.current - 1);
      if (next !== activeIdxRef.current) {
        activeIdxRef.current = next;
        setActiveIndex(next);
      }
    }
  };

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const pinStageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const numberWheelRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLHeadingElement>(null);
  const descContainerRef = useRef<HTMLParagraphElement>(null);

  const catalogueResult = useCatalogue();
  const rawProperties = useMemo(() => {
    if (Array.isArray(propProperties) && propProperties.length > 0) return propProperties;
    if (Array.isArray(catalogueResult?.properties)) return catalogueResult.properties;
    if (Array.isArray(catalogueResult?.data)) return catalogueResult.data;
    return [];
  }, [propProperties, catalogueResult]);

  // Always preserve all 4 curated showcase slides while linking to live properties when available
  const showcaseItems: ShowcaseProject[] = useMemo(() => {
    return DEFAULT_SHOWCASE_PROJECTS.map((item, idx) => {
      const matchedProp = rawProperties[idx];
      if (!matchedProp) return item;
      const locLabel = matchedProp.location_label || matchedProp.city;
      return {
        ...item,
        location: locLabel ? `${locLabel} · ${matchedProp.city}` : item.location,
        href: matchedProp.slug ? `/properties/${matchedProp.slug}` : item.href,
      };
    });
  }, [rawProperties]);

  // Word-by-word blur reveal whenever activeIndex changes
  useEffect(() => {
    if (typeof window === "undefined" || navigator.userAgent.includes("jsdom")) return;
    if (prefersReducedMotion()) return;

    const titleWords = titleContainerRef.current?.querySelectorAll("[data-proj-word]");
    const descWords = descContainerRef.current?.querySelectorAll("[data-proj-word]");

    if (titleWords?.length) {
      gsap.fromTo(
        titleWords,
        { opacity: 0, y: 12, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.45,
          stagger: 0.04,
          ease: "power3.out",
          overwrite: "auto",
        },
      );
    }

    if (descWords?.length) {
      gsap.fromTo(
        descWords,
        { opacity: 0, y: 10, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.42,
          stagger: 0.018,
          ease: "power3.out",
          overwrite: "auto",
        },
      );
    }
  }, [activeIndex]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isReduced = prefersReducedMotion();
    const magneticCleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      if (!isReduced) {
        // 1. Top Header Word Blur Reveal
        if (headerRef.current) {
          const words = headerRef.current.querySelectorAll("[data-proj-header-word]");
          gsap.fromTo(
            words,
            { opacity: 0, y: 12, filter: "blur(10px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.65,
              stagger: 0.03,
              ease: "power3.out",
              scrollTrigger: {
                trigger: headerRef.current,
                start: "top 85%",
              },
            },
          );
        }

        // 2. Pinned Full-Viewport Scroll Showcase stepping through Projects 01 -> 02 -> 03 -> 04
        if (pinStageRef.current && trackRef.current) {
          const track = trackRef.current;
          const cards = track.querySelectorAll<HTMLElement>("[data-project-card]");

          const horizontalTween = gsap.to(track, {
            x: 0,
            ease: "none",
            scrollTrigger: {
              trigger: pinStageRef.current,
              start: "top top",
              end: "+=220%",
              pin: true,
              scrub: 0.5,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const rawProgress = Number.isFinite(self.progress) ? self.progress : 0;
                const nextIdx = Math.min(
                  showcaseItems.length - 1,
                  Math.max(0, Math.floor(rawProgress * showcaseItems.length)),
                );
                if (nextIdx !== activeIdxRef.current) {
                  activeIdxRef.current = nextIdx;
                  setActiveIndex(nextIdx);
                }
              },
            },
          });

          cards.forEach((card) => {
            gsap.fromTo(
              card,
              { scale: 0.98, opacity: 0.9 },
              {
                scale: 1,
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: card,
                  containerAnimation: horizontalTween,
                  start: "left 85%",
                  end: "right 15%",
                  toggleActions: "play reverse play reverse",
                },
              },
            );

            const badge = card.querySelector<HTMLElement>("[data-project-badge]");
            if (badge) {
              gsap.fromTo(
                badge,
                { opacity: 0, y: 8 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.4,
                  ease: "power2.out",
                  scrollTrigger: {
                    trigger: card,
                    containerAnimation: horizontalTween,
                    start: "left 75%",
                    toggleActions: "play none none reverse",
                  },
                },
              );
            }
          });
        }

        // 3. Magnetic Hover Attraction on CTA Buttons
        const ctaButtons = sectionRef.current?.querySelectorAll<HTMLElement>("[data-project-cta]");
        ctaButtons?.forEach((btn) => {
          magneticCleanups.push(applyMagneticHover(btn, { strength: 0.2 }));
        });
      } else {
        if (headerRef.current) {
          const words = headerRef.current.querySelectorAll<HTMLElement>("[data-proj-header-word]");
          words.forEach((w) => {
            w.style.opacity = "1";
            w.style.filter = "none";
          });
        }
        const cards = sectionRef.current?.querySelectorAll<HTMLElement>("[data-project-card]");
        cards?.forEach((c) => {
          gsap.set(c, { scale: 1, opacity: 1 });
        });
        const badges = sectionRef.current?.querySelectorAll<HTMLElement>("[data-project-badge]");
        badges?.forEach((b) => {
          gsap.set(b, { opacity: 1, y: 0 });
        });
      }
    }, sectionRef);

    return () => {
      magneticCleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [showcaseItems.length]);

  const currentProject = showcaseItems[activeIndex] ?? showcaseItems[0]!;

  const renderHeaderWords = (text: string) =>
    text.split(" ").map((word, idx, arr) => (
      <React.Fragment key={idx}>
        <span data-proj-header-word className="inline-block will-change-[transform,opacity,filter]">
          {word}
        </span>
        {idx < arr.length - 1 ? " " : ""}
      </React.Fragment>
    ));

  const renderActiveWords = (text: string) =>
    text.split(" ").map((word, idx, arr) => (
      <React.Fragment key={`${activeIndex}-${idx}`}>
        <span data-proj-word className="inline-block will-change-[transform,opacity,filter]">
          {word}
        </span>
        {idx < arr.length - 1 ? " " : ""}
      </React.Fragment>
    ));

  return (
    <section
      ref={sectionRef}
      data-framer-name="Project"
      className="relative z-[2] w-full overflow-hidden bg-[#0E2228] pt-[60px] pb-[40px] sm:pt-[80px] lg:pt-[110px] lg:pb-[60px]"
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      {/* Top Section Header */}
      <div
        ref={headerRef}
        data-framer-name="Container"
        className="mx-auto mb-[48px] flex w-full max-w-[1390px] flex-col items-center justify-center gap-[20px] px-4 text-center sm:px-8 lg:mb-[64px]"
      >
        {/* Solid Gold Section Tag Pill */}
        <div
          data-proj-header-word
          data-framer-name="Section Tag"
          className="inline-flex items-center justify-center rounded-[99px] bg-[#C5A059] px-[16px] py-[6px] shadow-sm"
        >
          <span className="text-[13px] font-medium leading-[1.35] text-white">Our Projects</span>
        </div>

        {/* Heading & Subtitle */}
        <div
          data-framer-name="Text Content"
          className="flex w-full flex-col items-center justify-center gap-[16px]"
        >
          <h2 className="max-w-[780px] text-[28px] font-normal leading-[1.1] tracking-[0em] text-white sm:text-[36px] lg:text-[44px]">
            {renderHeaderWords(collectionHeading || "Built with Purpose. Made to Last.")}
          </h2>
          <p className="max-w-[564px] text-[14px] font-normal leading-[1.45] text-white/85 sm:text-[15px]">
            {renderHeaderWords(
              "Explore a selection of projects where thoughtful planning, skilled craftsmanship, and dependable execution come together to create spaces built for the future.",
            )}
          </p>
        </div>
      </div>

      {/* Full-Viewport Pinned Showcase Stage (Restored Previous Layout + Mobile Swipe Interactivity) */}
      <div
        ref={pinStageRef}
        data-pin-stage
        data-framer-name="Project Wrapper"
        onPointerDown={handleStagePointerDown}
        onPointerUp={handleStagePointerUp}
        style={{ touchAction: "pan-y" }}
        className="relative mx-auto flex min-h-[500px] w-full flex-col justify-between overflow-hidden bg-[#142A30] sm:min-h-[620px] lg:h-[85vh] lg:min-h-[680px] lg:max-h-[880px]"
      >
        {/* Full-Bleed Background Slides Track */}
        <div
          ref={trackRef}
          data-projects-track
          data-framer-name="Image Wrapper"
          className="absolute inset-0 h-full w-full overflow-hidden will-change-transform"
        >
          {showcaseItems.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={item.number}
                data-project-card
                className={`absolute inset-0 h-full w-full transition-opacity duration-700 ease-out ${
                  isActive
                    ? "pointer-events-auto z-[2] opacity-100"
                    : "pointer-events-none z-[1] opacity-0"
                }`}
              >
                <img
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  className={`block h-full w-full object-cover object-center transition-all duration-700 ease-out ${
                    isActive ? "scale-100 blur-0" : "scale-105 blur-[4px]"
                  }`}
                />

                {/* Hidden semantic badge & CTA hooks per card so all 4 card queries succeed */}
                <span data-project-badge className="sr-only">
                  {item.badge}
                </span>
                <Link to={item.href} data-project-cta tabIndex={-1} className="sr-only">
                  <span data-magnetic-inner>View Residence Dossier</span>
                </Link>
              </div>
            );
          })}

          {/* Bottom Dark Linear Gradient Overlay */}
          <div
            aria-hidden="true"
            data-framer-name="Linear Color"
            className="pointer-events-none absolute inset-0 z-[3]"
            style={{
              background:
                "linear-gradient(180deg, rgba(14, 34, 40, 0.14) 0%, rgba(14, 34, 40, 0.78) 100%)",
            }}
          />
        </div>

        {/* Foreground Content Overlay */}
        <div className="relative z-10 mx-auto flex h-full min-h-[540px] w-full max-w-[1390px] flex-1 flex-col justify-between px-6 py-10 sm:min-h-[640px] sm:px-10 sm:py-12 lg:min-h-[680px] lg:px-14 lg:py-14">
          {/* Top Row: Oversized Active Step Number Wheel + Step Switcher Tabs */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="h-[56px] overflow-hidden">
              <div
                ref={numberWheelRef}
                className="flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  transform: `translateY(-${activeIndex * 56}px)`,
                }}
              >
                {showcaseItems.map((item) => (
                  <div key={item.number} className="flex h-[56px] items-center">
                    <span className="text-[36px] font-normal leading-[1.1] tracking-[0em] text-white sm:text-[44px]">
                      {item.number}
                    </span>
                    <span className="ml-2.5 text-[14px] text-white/50">
                      / 0{showcaseItems.length}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              role="tablist"
              aria-label="Featured project selector"
              className="flex items-center gap-2 rounded-full border border-white/15 bg-[#0E2228]/65 p-1.5 backdrop-blur-md"
            >
              {showcaseItems.map((item, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={item.number}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      activeIdxRef.current = idx;
                      setActiveIndex(idx);
                    }}
                    className={`cursor-pointer rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all ${
                      isActive
                        ? "bg-[#C5A059] text-[#0E2228] shadow-sm"
                        : "text-white/75 hover:text-white"
                    }`}
                  >
                    {item.number}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Middle-Left Project Badge, Location & Title */}
          <div className="my-auto py-8 lg:pl-[2%]">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-black/35 px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#C5A059] backdrop-blur-md">
                {currentProject.badge}
              </span>
              <span className="text-[11.5px] font-medium uppercase tracking-[0.18em] text-white/80">
                {currentProject.location}
              </span>
            </div>
            <h3
              ref={titleContainerRef}
              className="max-w-[680px] font-serif text-[32px] font-normal leading-[1.15] text-white sm:text-[42px] lg:text-[50px]"
            >
              {renderActiveWords(currentProject.title)}
            </h3>
          </div>

          {/* Bottom Row: View Residence CTA Left + Description Block Right */}
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <Link
              to={currentProject.href}
              className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-[12px] font-medium uppercase tracking-[0.14em] text-white no-underline backdrop-blur-md transition-all duration-300 hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-[#0E2228]"
            >
              <span>View Residence Dossier</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>

            <div className="w-full max-w-[480px] lg:w-[42%]">
              <p
                ref={descContainerRef}
                className="text-[16px] font-medium leading-[1.45] text-white/95 sm:text-[18px]"
              >
                {renderActiveWords(currentProject.description)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BildoraProjectsShowcase;
