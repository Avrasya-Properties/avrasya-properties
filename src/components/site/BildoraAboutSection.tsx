import React, { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { animateTextH, animateTextP } from "@/lib/animation/typography";
import { animateSlide } from "@/lib/animation/masking";
import { PLACEHOLDER_IMAGES, resolvePlaceholderSrc } from "@/data/placeholders";
import type { SiteSettings } from "@/admin/demo";
import { useSiteSettings } from "@/admin/store";

export interface BildoraAboutSectionProps {
  propertyCount?: number;
  districtCount?: number;
  settings?: SiteSettings;
  statement?: string;
  heading?: string;
  description?: string;
  metrics?: Array<{ label: string; value: string }>;
}

const DEFAULT_HEADING = "Architectural Distinction & Enduring Heritage";
const DEFAULT_DESCRIPTION =
  "Every Avrasya residence represents an uncompromising synthesis of architectural mastery, micro-location precision, and sovereign longevity across the Istanbul skyline.";
const STATEMENT_TEXT =
  "With decades of experience, we specialize in turning ideas into well-designed structures that stand the test of time.";

/**
 * Exact 7-column angles from Bildora's `.framer-wt1bfw`:
 * Column 1: rotateY(90deg)
 * Column 2: rotateY(120deg)
 * Column 3: rotateY(150deg)
 * Column 4: rotateY(180deg)
 * Column 5: rotateY(0deg)
 * Column 6: rotateY(30deg)
 * Column 7: rotateY(60deg)
 */
const CYLINDER_COLUMNS = [
  { angle: 90, slotIndex: 0 },
  { angle: 120, slotIndex: 1 },
  { angle: 150, slotIndex: 2 },
  { angle: 180, slotIndex: 3 },
  { angle: 0, slotIndex: 4 },
  { angle: 30, slotIndex: 5 },
  { angle: 60, slotIndex: 6 },
] as const;

const METRICS = [
  {
    target: 12,
    decimals: 0,
    suffix: "+",
    displayFallback: "12+",
    label: "Years of Experience",
  },
  {
    target: 250,
    decimals: 0,
    suffix: "+",
    displayFallback: "250+",
    label: "Projects Completed",
  },
  {
    target: 4.8,
    decimals: 1,
    suffix: "/5",
    displayFallback: "4.8/5",
    label: "Client Satisfaction",
  },
  {
    target: 98,
    decimals: 0,
    suffix: "%",
    displayFallback: "98%",
    label: "On-Time Delivery",
  },
] as const;

export const BildoraAboutSection: React.FC<BildoraAboutSectionProps> = ({
  settings: propSettings,
  statement: propStatement,
  heading: propHeading,
  description: propDescription,
  metrics: propMetrics,
}) => {
  const hookSettings = useSiteSettings();
  const settings = propSettings || hookSettings;

  const headingText =
    propHeading ||
    (typeof settings?.websiteDesign?.["aboutHeading"] === "string"
      ? (settings.websiteDesign["aboutHeading"] as string)
      : DEFAULT_HEADING);

  const descriptionText =
    propDescription ||
    (typeof settings?.websiteDesign?.["aboutDescription"] === "string"
      ? (settings.websiteDesign["aboutDescription"] as string)
      : DEFAULT_DESCRIPTION);

  const statementText: string =
    propStatement ||
    (typeof settings?.websiteDesign?.["aboutStatement"] === "string"
      ? (settings.websiteDesign["aboutStatement"] as string)
      : STATEMENT_TEXT);

  let resolvedMetrics: Array<{
    label: string;
    value: string;
    target?: number;
    suffix?: string;
    decimals?: number;
  }> = METRICS.map((m) => ({
    label: m.label,
    value: m.displayFallback,
    target: m.target,
    suffix: m.suffix,
    decimals: m.decimals,
  }));

  const rawMetrics = propMetrics || settings?.websiteDesign?.["aboutMetrics"];
  if (rawMetrics) {
    try {
      const parsed = typeof rawMetrics === "string" ? JSON.parse(rawMetrics) : rawMetrics;
      if (Array.isArray(parsed) && parsed.length > 0) {
        resolvedMetrics = parsed.map((item: any, idx: number) => {
          const valStr = String(
            item.value ??
              item.displayFallback ??
              (item.target !== undefined
                ? `${item.target}${item.suffix || ""}`
                : METRICS[idx]?.displayFallback || "0"),
          );
          const match = valStr.match(/^([^\d.]*)([\d.]+)(.*)$/);
          const numStr = match?.[2];
          const target =
            item.target !== undefined ? item.target : numStr ? parseFloat(numStr) : undefined;
          const suffix = item.suffix !== undefined ? item.suffix : (match?.[3] ?? "");
          const decimals =
            item.decimals !== undefined
              ? item.decimals
              : numStr && numStr.includes(".")
                ? (numStr.split(".")[1]?.length ?? 0)
                : 0;
          return {
            label: item.label || METRICS[idx]?.label || "Metric",
            value: valStr,
            target,
            suffix,
            decimals,
          };
        });
      }
    } catch (e) {
      console.warn("Failed to parse aboutMetrics:", e);
    }
  }

  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const maskContainerRef = useRef<HTMLDivElement>(null);
  const maskImageRef = useRef<HTMLImageElement>(null);
  const carouselStageRef = useRef<HTMLDivElement>(null);
  const cylinderRef = useRef<HTMLDivElement>(null);
  const counterSectionRef = useRef<HTMLDivElement>(null);

  // Interactive 3D drag + continuous 40s 360deg loop state
  const rotationState = useRef({
    currentY: 0,
    targetY: 0,
    currentX: 0,
    targetX: 0,
    isDragging: false,
    startX: 0,
    startRotationY: 0,
    scrollBoost: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isReduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      // 1. Section Tag ("About Us") Blur-Up Reveal
      if (badgeRef.current) {
        if (!isReduced) {
          gsap.fromTo(
            badgeRef.current,
            { opacity: 0, y: 14, filter: "blur(8px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: {
                trigger: badgeRef.current,
                start: "top 88%",
                toggleActions: "play none none reverse",
              },
            },
          );
        } else {
          gsap.set(badgeRef.current, { opacity: 1, y: 0, filter: "none" });
        }
      }

      // 2. Kinetic Typography Reveal on Section Heading (animateTextH)
      if (headingRef.current) {
        animateTextH(headingRef.current, {
          duration: 1.2,
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 86%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // 3. Masked Vertical Line Rise on Description (animateTextP)
      if (descRef.current) {
        animateTextP(descRef.current, {
          duration: 1.1,
          scrollTrigger: {
            trigger: descRef.current,
            start: "top 86%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // 4. Framer Letter-by-Letter Scroll Color Reveal on Statement
      if (statementRef.current) {
        const chars = statementRef.current.querySelectorAll<HTMLSpanElement>("[data-about-char]");
        if (chars.length) {
          if (!isReduced) {
            gsap.fromTo(
              chars,
              { color: "rgb(222, 224, 221)" },
              {
                color: "rgb(22, 48, 56)",
                stagger: 0.02,
                ease: "none",
                scrollTrigger: {
                  trigger: statementRef.current,
                  start: "top 82%",
                  end: "top 22%",
                  scrub: 0.25,
                },
              },
            );
          } else {
            chars.forEach((c) => {
              c.style.color = "rgb(22, 48, 56)";
            });
          }
        }
      }

      // 5. Cinematic Polygon Clipping Mask Reveal (animateSlide)
      if (maskContainerRef.current && maskImageRef.current) {
        animateSlide(maskContainerRef.current, maskImageRef.current, {
          duration: 1.4,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: maskContainerRef.current,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // 6. 3D Cylinder Entrance + Scroll Velocity Boost
      if (carouselStageRef.current) {
        if (!isReduced) {
          gsap.fromTo(
            carouselStageRef.current,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: carouselStageRef.current,
                start: "top 86%",
              },
            },
          );

          ScrollTrigger.create({
            trigger: carouselStageRef.current,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
              const vel = self.getVelocity();
              rotationState.current.scrollBoost = gsap.utils.clamp(-1.8, 1.8, vel / 1800);
            },
          });
        } else {
          gsap.set(carouselStageRef.current, { opacity: 1, y: 0 });
        }
      }

      // 7. Counter Section Entrance + Smooth ScrollTrigger Count-Up
      if (counterSectionRef.current) {
        const cards = counterSectionRef.current.querySelectorAll("[data-counter-card]");
        const numEls =
          counterSectionRef.current.querySelectorAll<HTMLElement>("[data-counter-num]");

        if (!isReduced) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 24, filter: "blur(10px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.75,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: counterSectionRef.current,
                start: "top 88%",
              },
            },
          );

          numEls.forEach((el, idx) => {
            const m = resolvedMetrics[idx];
            if (!m) return;
            if (typeof m.target === "number" && !isNaN(m.target)) {
              const proxy = { val: 0 };
              gsap.to(proxy, {
                val: m.target,
                duration: 2.0,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: counterSectionRef.current,
                  start: "top 88%",
                  once: true,
                },
                onUpdate: () => {
                  el.textContent = `${proxy.val.toFixed(m.decimals || 0)}${m.suffix || ""}`;
                },
                onComplete: () => {
                  el.textContent = m.value;
                },
              });
            } else {
              el.textContent = m.value;
            }
          });
        } else {
          gsap.set(cards, { opacity: 1, y: 0, filter: "none" });
          numEls.forEach((el, idx) => {
            const m = resolvedMetrics[idx];
            if (m) el.textContent = m.value;
          });
        }
      }
    }, sectionRef);

    // Continuous 3D Cylinder Rotation Loop (360deg / 40s = 9deg/sec + drag + scroll boost)
    let tickerFn: ((time: number, deltaTime: number) => void) | null = null;
    if (!isReduced) {
      const st = rotationState.current;
      tickerFn = (_time: number, deltaTime: number) => {
        const dt = Math.min(deltaTime, 50) / 1000;
        if (!st.isDragging) {
          st.targetY += 9 * dt + st.scrollBoost;
          st.targetX *= 0.92;
          st.scrollBoost *= 0.92;
        }
        st.currentY += (st.targetY - st.currentY) * 0.12;
        st.currentX += (st.targetX - st.currentX) * 0.12;

        if (cylinderRef.current) {
          const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
          const cylScale = vw < 480 ? 0.56 : vw < 768 ? 0.72 : vw < 1024 ? 0.86 : 1;
          cylinderRef.current.style.transform = `scale(${cylScale}) rotateX(${st.currentX.toFixed(2)}deg) rotateY(${st.currentY.toFixed(2)}deg)`;
        }
      };

      gsap.ticker.add(tickerFn);
    }

    return () => {
      if (tickerFn) {
        gsap.ticker.remove(tickerFn);
      }
      ctx.revert();
    };
  }, [headingText, descriptionText, statementText, JSON.stringify(resolvedMetrics)]);

  // Pointer drag handlers for 3D Look (Desktop Mouse + Mobile Touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    rotationState.current.isDragging = true;
    rotationState.current.startX = e.clientX;
    rotationState.current.startRotationY = rotationState.current.targetY;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!rotationState.current.isDragging) return;
    const deltaX = e.clientX - rotationState.current.startX;
    const sensitivity = typeof window !== "undefined" && window.innerWidth < 640 ? 2.6 : 4.5;
    rotationState.current.targetY = rotationState.current.startRotationY - deltaX / sensitivity;
  };

  const handlePointerUp = () => {
    rotationState.current.isDragging = false;
  };

  const chars = Array.from(statementText);
  const featuredImageSrc = resolvePlaceholderSrc(PLACEHOLDER_IMAGES.aboutArcGallery[0]!);

  return (
    <section
      id="after-hero-about"
      ref={sectionRef}
      data-framer-name="About"
      className="relative z-[2] w-full overflow-hidden bg-[#F9F8F5] pt-[48px] pb-[36px] sm:pt-[64px] sm:pb-[48px] lg:pt-[88px] lg:pb-[60px]"
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      <div
        data-framer-name="Container"
        className="mx-auto flex w-full flex-col items-center justify-center gap-[48px] lg:gap-[72px]"
      >
        {/* Top Content: Elevated Pill Badge + Display Heading + Description */}
        <div
          data-framer-name="Top Content"
          className="mx-auto flex w-full max-w-[1390px] flex-col items-center justify-center gap-[24px] px-4 sm:px-8 text-center"
        >
          {/* Section Tag Pill (.framer-15sbucd-container) */}
          <div
            ref={badgeRef}
            data-framer-name="Section Tag"
            className="inline-flex items-center justify-center rounded-[99px] border border-[#DEE0DD] bg-[#F7F6F2] px-[14px] py-[6px] shadow-xs"
          >
            <span className="text-[13px] font-medium leading-[1.35] text-[#C5A059]">About Us</span>
          </div>

          {/* Kinetic Typography Display Heading (animateTextH) */}
          <h2
            ref={headingRef}
            data-about-heading
            className="max-w-[960px] text-[30px] font-normal font-serif leading-[1.12] tracking-[-0.02em] text-[#163038] sm:text-[40px] lg:text-[50px]"
          >
            {headingText}
          </h2>

          {/* Masked Editorial Paragraph (animateTextP) */}
          <p
            ref={descRef}
            data-about-description
            className="max-w-[720px] text-[15px] font-normal leading-[1.6] text-[#5C6F73] sm:text-[17px]"
          >
            {descriptionText}
          </p>

          {/* 44px Scroll-Scrubbed Statement (.framer-k1cqkg-container) */}
          <div className="mx-auto mt-4 flex w-full max-w-[1094px] justify-center">
            <div
              ref={statementRef}
              aria-label={statementText}
              className="w-full text-center text-[24px] font-normal leading-[1.2] tracking-[0em] sm:text-[30px] lg:text-[40px]"
              style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
            >
              {chars.map((ch, idx) => (
                <span
                  key={idx}
                  data-about-char
                  style={{
                    color:
                      idx < Math.floor(chars.length * 0.58)
                        ? "rgb(22, 48, 56)"
                        : "rgb(222, 224, 221)",
                    willChange: "color",
                  }}
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Architectural Imagery Spotlight with Polygon Clipping Mask (animateSlide) */}
        <div className="w-full max-w-[1200px] px-4 sm:px-8">
          <div
            ref={maskContainerRef}
            data-mask-container
            className="relative mx-auto h-[280px] w-full overflow-hidden rounded-[20px] border border-black/5 bg-[#e3e3de] shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:h-[380px] lg:h-[460px]"
          >
            <img
              ref={maskImageRef}
              data-mask-image
              src={featuredImageSrc}
              alt="Avrasya Architectural Heritage"
              loading="lazy"
              className="h-full w-full object-cover object-center select-none"
            />
            {/* Scrim Overlay & Distinction Badge */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent flex items-end p-6 sm:p-10 pointer-events-none">
              <div className="space-y-1.5 text-left text-white">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C5A059]">
                  Architectural Portfolio
                </span>
                <h3 className="text-[20px] font-light font-serif sm:text-[26px] lg:text-[32px]">
                  Uncompromising Structural Craftsmanship
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Exact Framer 3D Cylinder / Curved Perspective Carousel */}
        <div
          ref={carouselStageRef}
          data-framer-name="3D Look"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative flex h-[280px] w-full cursor-grab items-center justify-center overflow-hidden select-none active:cursor-grabbing sm:h-[380px] md:h-[440px] lg:h-[500px]"
          style={{
            touchAction: "pan-y",
          }}
        >
          {/* Dedicated 3D Perspective Stage (kept free of overflow:hidden so mobile WebKit/Blink preserves 3D depth) */}
          <div
            className="relative flex h-full w-full items-center justify-center"
            style={{
              perspective: "1000px",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Rotating 3D Cylinder (.framer-ook8e1: width 1200px, preserve-3d) */}
            <div
              ref={cylinderRef}
              data-framer-name="Custom Carousel"
              className="relative h-[370px] w-[1200px] shrink-0 will-change-transform flex items-center justify-center"
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              {CYLINDER_COLUMNS.map((col, idx) => {
                const slotA =
                  PLACEHOLDER_IMAGES.aboutArcGallery[
                    (col.slotIndex * 2) % PLACEHOLDER_IMAGES.aboutArcGallery.length
                  ]!;
                const slotB =
                  PLACEHOLDER_IMAGES.aboutArcGallery[
                    (col.slotIndex * 2 + 1) % PLACEHOLDER_IMAGES.aboutArcGallery.length
                  ]!;
                const imgSrcA = resolvePlaceholderSrc(slotA);
                const imgSrcB = resolvePlaceholderSrc(slotB);

                return (
                  <div
                    key={col.angle}
                    data-framer-name={`Column ${idx + 1}`}
                    className="absolute top-[calc(50%-150px)] left-[calc(50%-700px)] flex h-[300px] w-[1400px] items-center justify-between"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: `rotateY(${col.angle}deg)`,
                    }}
                  >
                    {/* Opposing Card A */}
                    <div
                      data-framer-name="Image"
                      className="relative h-[370px] w-[260px] shrink-0 overflow-hidden rounded-[20px] bg-[#e3e3de] shadow-[0_14px_34px_rgba(15,23,42,0.12)] border border-black/5"
                      style={{
                        transform: "rotateY(90deg)",
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                      }}
                    >
                      <img
                        src={imgSrcA}
                        alt={slotA.alt}
                        draggable={false}
                        loading="lazy"
                        decoding="async"
                        className="pointer-events-none block h-full w-full object-cover object-center select-none"
                      />
                    </div>

                    {/* Opposing Card B */}
                    <div
                      data-framer-name="Image"
                      className="relative h-[370px] w-[260px] shrink-0 overflow-hidden rounded-[20px] bg-[#e3e3de] shadow-[0_14px_34px_rgba(15,23,42,0.12)] border border-black/5"
                      style={{
                        transform: "rotateY(-90deg)",
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                      }}
                    >
                      <img
                        src={imgSrcB}
                        alt={slotB.alt}
                        draggable={false}
                        loading="lazy"
                        decoding="async"
                        className="pointer-events-none block h-full w-full object-cover object-center select-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom 4-Column Counter Row (.framer-1t914v: max-w 1390px, px-32px) */}
        <div
          ref={counterSectionRef}
          data-counter-section
          data-framer-name="Counter Section"
          className="mx-auto grid w-full max-w-[1390px] grid-cols-2 gap-4 sm:gap-8 px-4 sm:px-8 lg:flex lg:flex-row lg:items-center lg:justify-between"
        >
          {resolvedMetrics.map((metric) => (
            <div
              key={metric.label}
              data-counter-card
              data-framer-name="Counter Wrap"
              className="flex flex-col items-center justify-center gap-[8px] sm:gap-[16px] rounded-[16px] border border-[#DEE0DD]/60 bg-[#F7F6F2]/70 dark:border-[#1e3842] dark:bg-[#112228]/90 p-4 text-center lg:border-0 lg:bg-transparent lg:dark:bg-transparent lg:p-0"
            >
              <h2
                data-counter-num
                className="text-[28px] font-normal leading-[1.1] tracking-[0em] text-[#163038] sm:text-[38px] lg:text-[44px]"
              >
                {metric.value}
              </h2>
              <p className="text-[13px] font-normal leading-[1.3] text-[#5C6F73] sm:text-[15px]">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BildoraAboutSection;
