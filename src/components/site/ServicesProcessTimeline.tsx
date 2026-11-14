import React, { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Compass,
  FileCheck,
  FileText,
  Key,
  Landmark,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { TRANSLATIONS, type TimelinePart, type TimelineStep } from "@/i18n";
import { useScopedGSAP } from "@/lib/animation/context";
import { prefersReducedMotion, gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { LazyPassportCanvas } from "@/components/3d";

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "01": Compass,
  "02": FileCheck,
  "03": Landmark,
  "04": Key,
  "05": FileText,
  "06": CalendarCheck,
  "07": ShieldCheck,
  "08": Building2,
  "09": TrendingUp,
};

export interface ServicesProcessTimelineProps {
  className?: string;
  parts?: TimelinePart[];
  onStepSelect?: (stepNumber: string) => void;
  sectionTitle?: string;
  sectionSubtitle?: string;
  showActionButtons?: boolean;
}

export function ServicesProcessTimeline({
  className,
  parts: customParts,
  onStepSelect,
  sectionTitle,
  sectionSubtitle,
  showActionButtons = false,
}: ServicesProcessTimelineProps) {
  const { t, isRtl, locale } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<string>("01");

  const parts = customParts || t?.services?.parts || TRANSLATIONS.en.services.parts;

  // Kinetic scroll entrance animation scoped cleanly to this component container
  useScopedGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // Coordinated vertical timeline progress line
      const progressLine = containerRef.current?.querySelector<HTMLElement>(
        "[data-timeline-progress]",
      );
      if (progressLine) {
        gsap.fromTo(
          progressLine,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 75%",
              end: "bottom 85%",
              scrub: 0.5,
            },
          },
        );
      }

      // Coordinated step marker and card reveals
      const steps = containerRef.current?.querySelectorAll<HTMLElement>("[data-step]");
      if (steps && steps.length > 0) {
        steps.forEach((stepEl) => {
          const card = stepEl.querySelector<HTMLElement>("[data-step-card]");
          const marker = stepEl.querySelector<HTMLElement>("button[aria-label^='Step ']");

          if (marker) {
            gsap.fromTo(
              marker,
              { scale: 0.75, opacity: 0.4 },
              {
                scale: 1,
                opacity: 1,
                duration: 0.5,
                ease: "back.out(1.7)",
                scrollTrigger: {
                  trigger: stepEl,
                  start: "top 88%",
                  toggleActions: "play none none none",
                },
              },
            );
          }

          if (card) {
            gsap.fromTo(
              card,
              { opacity: 0, y: 22 },
              {
                opacity: 1,
                y: 0,
                duration: 0.55,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: stepEl,
                  start: "top 88%",
                  toggleActions: "play none none none",
                },
              },
            );
          }
        });
      }
    },
    containerRef,
    [locale],
  );

  const handleStepClick = (stepNum: string) => {
    setActiveStep(stepNum);
    onStepSelect?.(stepNum);
  };

  return (
    <section
      ref={containerRef}
      className={cn(
        "relative bg-[#F9F8F5] dark:bg-[#0c1619] py-16 sm:py-24 transition-colors",
        className,
      )}
      dir={isRtl ? "rtl" : "ltr"}
      aria-label="Acquisition and Citizenship Timeline"
    >
      <div className="container-site max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {sectionTitle && (
          <div className="mb-12 sm:mb-16 flex flex-col items-center text-center gap-4">
            <div className="inline-flex items-center justify-center rounded-full border border-[#DEE0DD] bg-[#F7F6F2] px-3.5 py-1.5 shadow-xs">
              <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#C5A059]">
                Highlighted Advisory Service
              </span>
            </div>
            <h2 className="font-display max-w-3xl text-3xl sm:text-4xl lg:text-[44px] font-normal leading-[1.12] tracking-[-0.02em] text-[#163038] dark:text-stone-100">
              {sectionTitle}
            </h2>
            {sectionSubtitle && (
              <p className="max-w-2xl text-sm sm:text-base text-[#5C6F73] dark:text-stone-300 leading-relaxed">
                {sectionSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Single-Column Vertical Timeline Container */}
        <div className="relative">
          {/* Vertical continuous trace line */}
          <div
            className="absolute top-6 bottom-16 start-5 sm:start-7 w-0.5 overflow-hidden rounded-full bg-[#C5A059]/20"
            aria-hidden="true"
          >
            <div
              data-timeline-progress
              className="h-full w-full origin-top bg-gradient-to-b from-[#C5A059] via-[#C5A059] to-[#8B6B23]"
            />
          </div>

          <div className="space-y-12 sm:space-y-16">
            {parts.map((part: TimelinePart, partIdx: number) => {
              return (
                <div key={part.partNumber || partIdx} className="relative">
                  {/* Part Header Banner */}
                  <div className="relative mb-6 sm:mb-8 flex items-center gap-3 ps-12 sm:ps-16">
                    <div className="inline-flex items-center gap-2 rounded-xs border border-[#C5A059]/40 bg-[#C5A059]/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-[#8B6B23] dark:text-[#E2C37A]">
                      <span>{part.partNumber}</span>
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#163038] dark:text-stone-100">
                      {part.title}
                    </h3>
                  </div>

                  {/* Steps within this Part */}
                  <div className="space-y-6 sm:space-y-8">
                    {part.steps.map((step: TimelineStep) => {
                      const isActive = activeStep === step.stepNumber;
                      const StepIcon = STEP_ICONS[step.stepNumber] || FileText;

                      return (
                        <div
                          key={step.stepNumber}
                          data-step={step.stepNumber}
                          className="relative flex items-start"
                        >
                          {/* Step Marker Node on Timeline */}
                          <button
                            type="button"
                            onClick={() => handleStepClick(step.stepNumber)}
                            aria-label={`Step ${step.stepNumber}: ${step.title}`}
                            className={cn(
                              "relative z-10 flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs sm:text-sm font-bold shadow-xs transition-all duration-300 focus:outline-hidden focus:ring-2 focus:ring-[#C5A059]",
                              isActive
                                ? "border-[#C5A059] bg-[#163038] text-[#C5A059] scale-105 ring-2 ring-[#C5A059]/40"
                                : "border-[#C5A059]/60 bg-[#F9F8F5] dark:bg-[#132227] text-[#163038] dark:text-[#C5A059] hover:border-[#C5A059] hover:scale-102",
                            )}
                          >
                            <span>{step.stepNumber}</span>
                          </button>

                          {/* Step Card */}
                          <div className="ms-4 sm:ms-6 flex-1">
                            <div
                              data-step-card
                              onClick={() => handleStepClick(step.stepNumber)}
                              className={cn(
                                "group relative cursor-pointer rounded-xs border p-5 sm:p-7 transition-all duration-300",
                                isActive
                                  ? "border-[#C5A059] bg-white dark:bg-[#14262d] shadow-md ring-1 ring-[#C5A059]/40"
                                  : "border-stone-200/90 dark:border-white/10 bg-white/80 dark:bg-[#101c20] hover:border-[#C5A059]/60 hover:shadow-xs",
                              )}
                            >
                              {/* Step Top Bar */}
                              <div className="flex flex-wrap items-center justify-between gap-2.5">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={cn(
                                      "flex h-8 w-8 items-center justify-center rounded-xs transition-colors",
                                      isActive
                                        ? "bg-[#C5A059]/20 text-[#8B6B23] dark:text-[#E2C37A]"
                                        : "bg-stone-100 dark:bg-white/5 text-muted-foreground group-hover:text-[#C5A059]",
                                    )}
                                  >
                                    <StepIcon className="h-4 w-4" />
                                  </div>
                                  <h4 className="font-display text-lg sm:text-xl font-bold text-[#163038] dark:text-stone-100">
                                    {step.title}
                                  </h4>
                                </div>

                                {/* Badges & Statutory Tags */}
                                <div className="flex flex-wrap items-center gap-2">
                                  {step.termNote && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C5A059]/40 bg-[#C5A059]/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#8B6B23] dark:text-[#E2C37A]">
                                      <ShieldCheck className="h-3.5 w-3.5 text-[#C5A059] shrink-0" />
                                      <span dir="ltr" className="inline-block unicode-isolate">
                                        {step.termNote}
                                      </span>
                                    </span>
                                  )}
                                  {step.legalTag && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-300">
                                      <Scale className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                      <span>{step.legalTag}</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Description */}
                              <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground dark:text-stone-300">
                                {step.description}
                              </p>

                              {/* Floating Turkish Passport 3D Model (Step 07) */}
                              {step.stepNumber === "07" && (
                                <div
                                  data-3d-passport-slot
                                  id="services-3d-passport"
                                  className="mt-6 relative w-full"
                                >
                                  <LazyPassportCanvas className="w-full" interactive={true} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Closing Line at the conclusion of the timeline */}
        <div className="mt-16 sm:mt-20 text-center border-t border-stone-200/80 dark:border-white/10 pt-12 sm:pt-16">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C5A059]">
            The Avrasya Difference
          </span>
          <h3 className="font-display mt-3 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#163038] dark:text-stone-100">
            &ldquo;{t.services.closingLine}&rdquo;
          </h3>
        </div>

        {/* Lawyer Review & Legal Disclaimer Callout */}
        <div className="mt-8 sm:mt-10 rounded-xs border border-[#C5A059]/30 bg-white/80 dark:bg-[#132227]/90 p-6 sm:p-8 shadow-xs backdrop-blur-xs">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C5A059]/15 text-[#C5A059]">
              <Scale className="h-5 w-5" />
            </div>
            <div className="flex-1 text-start">
              <h4 className="font-display text-base font-bold text-[#163038] dark:text-stone-100">
                Istanbul Bar Association Legal Representation & Statutory Disclaimers
              </h4>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground dark:text-stone-300">
                {t.services.legalDisclaimer}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons at the End of the Section (Homepage Highlighted Service) */}
        {showActionButtons && (
          <div
            data-highlighted-service-actions
            className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/services"
              className="group inline-flex h-[48px] items-center justify-center gap-2.5 rounded-full bg-[#163038] px-7 text-[13.5px] font-medium text-white no-underline shadow-sm transition-all duration-300 hover:bg-[#10785F] hover:shadow-md"
            >
              <span>All Services</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/citizenship"
              className="group inline-flex h-[48px] items-center justify-center gap-2.5 rounded-full border border-[#163038]/25 bg-white px-7 text-[13.5px] font-medium text-[#163038] no-underline shadow-xs transition-all duration-300 hover:border-[#C5A059] hover:bg-[#F7F6F2]"
            >
              <span>More Details</span>
              <ArrowRight className="h-4 w-4 text-[#C5A059] transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
