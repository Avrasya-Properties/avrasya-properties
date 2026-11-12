import React, { useEffect, useMemo, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { applyMagneticHover } from "@/lib/animation/magnetic";
import * as Icons from "lucide-react";
import { useServices, type ManagedService } from "@/data/live";
import {
  PLACEHOLDER_IMAGES,
  resolvePlaceholderSrc,
  type PlaceholderSlot,
} from "@/data/placeholders";

export interface TimelineServiceItem {
  number: string;
  tag: string;
  title: string;
  description: string;
  deliverables?: string[] | undefined;
  icon?: string | null | undefined;
  cta_label?: string | null | undefined;
  cta_link?: string | null | undefined;
  slot: PlaceholderSlot;
}

export const AVRASYA_SERVICES_TIMELINE: TimelineServiceItem[] = [
  {
    number: "01",
    tag: "01 — Quality First",
    title: "Guest Arrival",
    description:
      "Arrive, enjoy a refreshing drink, and settle in comfortably with friends and loved ones as the celebration begins.",
    deliverables: [
      "Personal requirement & yield profiling",
      "Neighborhood & micro-location benchmarking",
      "Shortlist of verified on- and off-market residences",
    ],
    cta_label: "Explore Advisory",
    cta_link: "/services",
    slot: PLACEHOLDER_IMAGES.servicesTimeline[0]!,
  },
  {
    number: "02",
    tag: "02 — Reliability",
    title: "Reliable Partnership",
    description:
      "From conversation to delivery, we ensure clear communication, reliable service, and promises kept.",
    deliverables: [
      "Chauffeured private site & residence tours",
      "Developer track-record & build-quality audit",
      "Live remote video walkthroughs for international buyers",
    ],
    cta_label: "Explore Advisory",
    cta_link: "/services",
    slot: PLACEHOLDER_IMAGES.servicesTimeline[1]!,
  },
  {
    number: "03",
    tag: "03 — Precision",
    title: "Every Detail Matters",
    description:
      "Thoughtful planning and precise execution ensure quality at every stage of construction.",
    deliverables: [
      "Land Registry (Tapu) encumbrance & lien clearance by in-house attorney",
      "SPK-licensed market valuation report",
      "Purchase contract drafting & escrow structuring",
    ],
    cta_label: "Explore Advisory",
    cta_link: "/services",
    slot: PLACEHOLDER_IMAGES.servicesTimeline[2]!,
  },
  {
    number: "04",
    tag: "04 — Integrity",
    title: "Built on Integrity",
    description:
      "Strong projects begin with honest relationships, clear communication, and doing things right.",
    deliverables: [
      "Tax ID, bank account & DAB currency certificate setup",
      "Sworn translator & Power of Attorney coordination",
      "Official Title Deed (Tapu) registration in your name",
    ],
    cta_label: "Explore Advisory",
    cta_link: "/services",
    slot: PLACEHOLDER_IMAGES.servicesTimeline[3]!,
  },
  {
    number: "05",
    tag: "05 — Modern Standards",
    title: "Citizenship & Legal Filing",
    description:
      "We combine proven regulatory procedures, skilled legal counsel, and end-to-end family dossier management for Turkish Citizenship.",
    deliverables: [
      "Certificate of Conformity ($400,000+ USD threshold)",
      "Permanent residency & biometric appointment handling",
      "Full citizenship filing for principal, spouse & children",
    ],
    cta_label: "Explore Advisory",
    cta_link: "/services",
    slot: PLACEHOLDER_IMAGES.servicesTimeline[4]!,
  },
  {
    number: "06",
    tag: "06 — Client Focus",
    title: "Turnkey Asset Stewardship",
    description:
      "Your long-term return comes first. We coordinate bespoke interiors, utility connections, tenant placement, and ongoing management.",
    deliverables: [
      "Snagging inspection, key handover & utility setup",
      "Architect-led furnishing & interior design packages",
      "Corporate tenant placement & yield reporting",
    ],
    cta_label: "Explore Advisory",
    cta_link: "/services",
    slot: PLACEHOLDER_IMAGES.servicesTimeline[5]!,
  },
];

export interface BildoraServicesTimelineProps {
  badgeText?: string;
  heading?: string;
  subtitle?: string;
  showDeliverables?: boolean;
  showCtaFooter?: boolean;
  services?: ManagedService[];
}

export const BildoraServicesTimeline: React.FC<BildoraServicesTimelineProps> = ({
  badgeText = "Our Values",
  heading = "Built on Values. Driven by Quality.",
  subtitle = "We combine honest communication, thoughtful planning, and dependable craftsmanship to deliver real estate acquisitions that stand strong and create lasting value.",
  showDeliverables = false,
  showCtaFooter = false,
  services: propServices,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const { data: remoteServices } = useServices();
  const rawServices = propServices || remoteServices;

  const timelineItems: TimelineServiceItem[] = useMemo(() => {
    if (!rawServices || rawServices.length === 0) {
      return AVRASYA_SERVICES_TIMELINE;
    }
    return rawServices.map((s, idx) => {
      const slot =
        PLACEHOLDER_IMAGES.servicesTimeline[idx % PLACEHOLDER_IMAGES.servicesTimeline.length]!;
      const deliverables = Array.isArray(s.process_steps)
        ? (s.process_steps.filter((p) => typeof p === "string") as string[])
        : typeof s.process_steps === "string"
          ? (s.process_steps as string).split("\n").filter(Boolean)
          : undefined;

      return {
        number: String(idx + 1).padStart(2, "0"),
        tag: `${String(idx + 1).padStart(2, "0")} — ${s.category || "Advisory"}`,
        title: s.title,
        description: s.description,
        deliverables,
        icon: s.icon,
        cta_label: s.cta_label,
        cta_link: s.cta_link,
        slot,
      };
    });
  }, [rawServices]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isReduced = prefersReducedMotion();
    const magneticCleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      if (!isReduced) {
        // 1. Header Word-by-Word Blur Reveal
        if (headerRef.current) {
          const words = headerRef.current.querySelectorAll("[data-tl-word]");
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
                start: "top 86%",
              },
            },
          );
        }

        // 2. Timeline Rows: 3D Staggered Card Reveal + Circle Pop + Scrubbed Progress Bar
        const rows = sectionRef.current?.querySelectorAll<HTMLElement>("[data-tl-row]");
        rows?.forEach((row) => {
          const card = row.querySelector<HTMLElement>("[data-tl-card]");
          const circle = row.querySelector<HTMLElement>("[data-tl-circle]");
          const fill = row.querySelector<HTMLElement>("[data-tl-fill]");

          if (card) {
            gsap.fromTo(
              card,
              {
                opacity: 0,
                y: 80,
                rotateX: 6,
                transformPerspective: 1200,
              },
              {
                opacity: 1,
                y: 0,
                rotateX: 0,
                duration: 0.95,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: row,
                  start: "top 82%",
                  toggleActions: "play none none reverse",
                },
              },
            );
          }

          if (circle) {
            gsap.fromTo(
              circle,
              { opacity: 0.25, scale: 0.5 },
              {
                opacity: 1,
                scale: 1,
                duration: 0.45,
                ease: "back.out(2)",
                scrollTrigger: {
                  trigger: row,
                  start: "top 65%",
                  toggleActions: "play none none reverse",
                },
              },
            );
          }

          if (fill) {
            gsap.fromTo(
              fill,
              { yPercent: -100 },
              {
                yPercent: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: row,
                  start: "top 65%",
                  end: "bottom 45%",
                  scrub: 0.35,
                },
              },
            );
          }
        });

        // 3. Magnetic Hover Attraction on CTA Buttons
        const ctaButtons = sectionRef.current?.querySelectorAll<HTMLElement>(
          "[data-service-cta], [data-consultation-cta]",
        );
        ctaButtons?.forEach((btn) => {
          magneticCleanups.push(applyMagneticHover(btn, { strength: 0.25 }));
        });
      } else {
        // Fallback for reduced motion: ensure immediate full visibility
        if (headerRef.current) {
          const words = headerRef.current.querySelectorAll<HTMLElement>("[data-tl-word]");
          words.forEach((w) => {
            w.style.opacity = "1";
            w.style.filter = "none";
          });
        }
        const rows = sectionRef.current?.querySelectorAll<HTMLElement>("[data-tl-row]");
        rows?.forEach((row) => {
          const card = row.querySelector<HTMLElement>("[data-tl-card]");
          const circle = row.querySelector<HTMLElement>("[data-tl-circle]");
          const fill = row.querySelector<HTMLElement>("[data-tl-fill]");
          if (card) gsap.set(card, { opacity: 1, y: 0, rotateX: 0 });
          if (circle) gsap.set(circle, { opacity: 1, scale: 1 });
          if (fill) gsap.set(fill, { yPercent: 0 });
        });
      }
    }, sectionRef);

    return () => {
      magneticCleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [timelineItems.length]);

  const renderBlurWords = (text: string) =>
    text.split(" ").map((word, idx, arr) => (
      <React.Fragment key={idx}>
        <span data-tl-word className="inline-block will-change-[transform,opacity,filter]">
          {word}
        </span>
        {idx < arr.length - 1 ? " " : ""}
      </React.Fragment>
    ));

  return (
    <section
      ref={sectionRef}
      data-framer-name="Values"
      className="relative z-[2] w-full overflow-hidden bg-[#F9F8F5] pt-[36px] pb-[48px] sm:pt-[48px] sm:pb-[64px] lg:pt-[56px] lg:pb-[88px]"
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      <div
        data-framer-name="Container"
        className="mx-auto flex w-full max-w-[1390px] flex-col items-center justify-center gap-[56px] px-4 sm:px-8 lg:gap-[80px]"
      >
        {/* Top Content (.framer-1k1x54w) */}
        <div
          ref={headerRef}
          data-framer-name="Top Content"
          className="flex w-full flex-col items-center justify-center gap-[20px] text-center"
        >
          {/* Section Tag Pill */}
          <div
            data-tl-word
            data-framer-name="Section Tag"
            className="inline-flex items-center justify-center rounded-[99px] border border-[#DEE0DD] bg-[#F7F6F2] px-[14px] py-[6px] shadow-xs"
          >
            <span className="text-[13px] font-medium leading-[1.35] text-[#C5A059]">
              {badgeText}
            </span>
          </div>

          {/* Text Content */}
          <div
            data-framer-name="Text Content"
            className="flex w-full flex-col items-center justify-center gap-[16px]"
          >
            <h2 className="max-w-[780px] text-[28px] font-normal leading-[1.1] tracking-[0em] text-[#163038] sm:text-[36px] lg:text-[44px]">
              {renderBlurWords(heading)}
            </h2>
            <p className="max-w-[564px] text-[14px] font-normal leading-[1.35] text-[#5C6F73] sm:text-[15px]">
              {renderBlurWords(subtitle)}
            </p>
          </div>
        </div>

        {/* Vertical Alternating Timeline */}
        <div
          data-framer-name="Details Wrapper"
          className="mx-auto flex w-full max-w-[850px] flex-col items-center justify-center gap-[10px]"
        >
          {timelineItems.map((item, idx) => {
            const isLeft = idx % 2 === 0;
            const imgSrc = resolvePlaceholderSrc(item.slot);
            const IconComponent =
              item.icon && (Icons as any)[item.icon] ? (Icons as any)[item.icon] : null;

            const contentCard = (
              <div
                data-tl-card
                data-framer-name="Content"
                className={`flex w-full flex-col justify-center gap-[24px] px-0 sm:px-[16px] ${
                  isLeft ? "md:items-end" : "md:items-start"
                }`}
              >
                {/* Top Content */}
                <div
                  data-framer-name="Top Content"
                  className={`flex w-full max-w-[300px] flex-col gap-[8px] ${
                    isLeft ? "md:items-end md:text-right" : "md:items-start md:text-left"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {IconComponent && (
                      <IconComponent
                        className="h-4 w-4 shrink-0 text-[#C5A059]"
                        aria-hidden="true"
                        data-service-icon={item.icon}
                      />
                    )}
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#C5A059]">
                      {item.tag}
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-[12px]">
                    <h3 className="text-[22px] font-normal leading-[1.2] tracking-[0em] text-[#163038] sm:text-[24px]">
                      {item.title}
                    </h3>
                    <p className="text-[13px] font-normal leading-[1.5] text-[#5C6F73]">
                      {item.description}
                    </p>
                  </div>

                  {item.cta_label && (
                    <div className="mt-2">
                      <Link
                        to={item.cta_link || "/services"}
                        data-service-cta
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#163038]/20 bg-[#163038]/5 px-3.5 py-1 text-[11px] font-medium text-[#163038] hover:border-[#163038] hover:bg-[#163038] hover:text-white transition-all no-underline"
                      >
                        <span data-magnetic-inner>{item.cta_label}</span>
                        <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                  )}

                  {showDeliverables && item.deliverables && (
                    <ul
                      className={`mt-2 flex flex-col gap-1.5 text-[11.5px] text-[#5C6F73] ${
                        isLeft ? "md:items-end" : "md:items-start"
                      }`}
                    >
                      {item.deliverables.map((del) => (
                        <li key={del} className="flex items-center gap-1.5">
                          <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#10785F]" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Image Card with subtle elevation transition */}
                <div className="relative h-[220px] w-full overflow-hidden rounded-[8px] border border-[#DEE0DD] bg-[#F7F6F2] shadow-xs hover:shadow-md transition-shadow duration-500 sm:h-[280px]">
                  <img
                    src={imgSrc}
                    alt={item.slot.alt}
                    loading="lazy"
                    className="block h-full w-full object-cover object-top transition-transform duration-700 hover:scale-[1.03]"
                  />
                </div>
              </div>
            );

            return (
              <div
                key={item.number}
                data-tl-row
                data-framer-name={`Row ${item.number}`}
                className="w-full"
              >
                {/* Desktop 3-Column Alternating Layout */}
                <div className="hidden w-full flex-row items-start justify-center md:flex">
                  {/* Left Column */}
                  <div className="flex flex-1 flex-col">
                    {isLeft ? contentCard : <div className="h-[222px] w-full" aria-hidden="true" />}
                  </div>

                  {/* Center Progressbar Wrapper */}
                  <div
                    data-framer-name="Progressbar wrapper"
                    className="flex shrink-0 flex-col items-center justify-center gap-[10px]"
                  >
                    {/* Brass Dot */}
                    <div
                      data-tl-circle
                      data-framer-name="Cercle"
                      className="h-[15px] w-[16px] rounded-[99px] bg-[#C5A059] shadow-xs will-change-transform"
                    />
                    {/* Vertical Spine Track */}
                    <div
                      data-framer-name="Progress bar"
                      className="relative h-[412px] w-[3px] overflow-hidden bg-[#C5A059]/20"
                    >
                      <div
                        data-tl-fill
                        data-framer-name="Fill"
                        className="h-full w-full bg-[#C5A059] will-change-transform"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="flex flex-1 flex-col">
                    {!isLeft ? (
                      contentCard
                    ) : (
                      <div className="h-[222px] w-full" aria-hidden="true" />
                    )}
                  </div>
                </div>

                {/* Mobile / Small Tablet Single-Spine Layout */}
                <div className="flex w-full flex-row items-stretch gap-4 md:hidden">
                  <div className="flex shrink-0 flex-col items-center gap-2">
                    <div
                      data-tl-circle
                      className="h-[15px] w-[16px] shrink-0 rounded-[99px] bg-[#C5A059]"
                    />
                    <div className="relative min-h-[340px] w-[3px] flex-1 overflow-hidden bg-[#C5A059]/20">
                      <div data-tl-fill className="h-full w-full bg-[#C5A059]" />
                    </div>
                  </div>
                  <div className="flex-1 pb-6">{contentCard}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional Consultation Footer (used on standalone /services page) */}
        {showCtaFooter && (
          <div className="mt-4 flex flex-col items-center justify-between gap-6 rounded-[16px] border border-[#DEE0DD] bg-white p-8 text-center shadow-xs sm:flex-row sm:text-left lg:w-full lg:max-w-[850px]">
            <div className="space-y-1.5">
              <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#C5A059]">
                Private Advisory Desk · Istanbul
              </p>
              <h3 className="text-[22px] font-normal text-[#163038]">
                Need Bespoke Acquisition &amp; Citizenship Structuring?
              </h3>
            </div>
            <Link
              to="/contact"
              data-consultation-cta
              className="inline-flex shrink-0 items-center gap-2.5 rounded-full bg-[#163038] px-6 py-3 text-[13.5px] font-medium text-white no-underline transition-colors hover:bg-[#10785F]"
            >
              <span data-magnetic-inner>Schedule Consultation</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default BildoraServicesTimeline;
