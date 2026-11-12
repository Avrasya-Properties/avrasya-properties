import React, { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface StarParticle {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  speed: number;
  phase: number;
  sparkle: boolean;
}

export interface CaldrenSkyCtaSectionProps {
  titleLine1?: string;
  titleItalicLine2?: string;
  subtitle?: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
}

/**
 * Exact recreation of Caldren's Night-Sky Starfield CTA Section
 * (`.framer-ddjg80` on `/properties` and `.framer-13pc0aa` on `/locations`)
 * with procedural `SkyStars` canvas (`density: 260`) and GSAP scroll reveal.
 */
export const CaldrenSkyCtaSection: React.FC<CaldrenSkyCtaSectionProps> = ({
  titleLine1 = "Let’s find your",
  titleItalicLine2 = "next address.",
  subtitle = "Tell us how you want to live. We will return with a short, considered selection.",
  primaryLabel = "Start a Conversation",
  primaryTo = "/contact",
  secondaryLabel = "Explore Properties",
  secondaryTo = "/properties",
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Twinkling SkyStars Canvas (matching Caldren's `SkyStars.DgeS2q9k.mjs` density=260, speed=0.8)
  useEffect(() => {
    if (typeof window === "undefined" || navigator.userAgent.includes("jsdom")) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      return;
    }
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let height = 0;
    let stars: StarParticle[] = [];

    const buildStars = () => {
      const parent = canvas.parentElement;
      width = parent?.clientWidth || window.innerWidth;
      height = parent?.clientHeight || 680;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = 220;
      let seed = 4219;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };

      stars = Array.from({ length: count }, () => {
        const isSparkle = rand() > 0.92;
        return {
          x: rand() * width,
          y: rand() * height,
          r: isSparkle ? 1.4 + rand() * 1.1 : 0.45 + rand() * 1.0,
          baseAlpha: isSparkle ? 0.65 + rand() * 0.3 : 0.2 + rand() * 0.5,
          speed: 0.5 + rand() * 1.4,
          phase: rand() * Math.PI * 2,
          sparkle: isSparkle,
        };
      });
    };

    buildStars();

    const startTime = performance.now();
    const render = (now: number) => {
      const elapsed = (now - startTime) * 0.001 * 0.8;
      ctx!.clearRect(0, 0, width, height);

      for (const s of stars) {
        const wave = 0.5 + 0.5 * Math.sin(elapsed * s.speed + s.phase);
        const alpha = Math.max(0.06, Math.min(1, s.baseAlpha * (0.45 + 0.65 * wave)));

        ctx!.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();

        if (s.sparkle && wave > 0.55) {
          const arm = s.r * (2.6 + wave * 2.2);
          ctx!.strokeStyle = `rgba(255, 255, 255, ${(alpha * 0.55).toFixed(3)})`;
          ctx!.lineWidth = 0.75;
          ctx!.beginPath();
          ctx!.moveTo(s.x - arm, s.y);
          ctx!.lineTo(s.x + arm, s.y);
          ctx!.moveTo(s.x, s.y - arm);
          ctx!.lineTo(s.x, s.y + arm);
          ctx!.stroke();
        }
      }

      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);
    window.addEventListener("resize", buildStars);

    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener("resize", buildStars);
    };
  }, []);

  // GSAP ScrollTrigger Entrance
  useEffect(() => {
    if (typeof window === "undefined" || navigator.userAgent.includes("jsdom")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      if (contentRef.current) {
        const items = contentRef.current.querySelectorAll("[data-sky-cta-item]");
        gsap.fromTo(
          items,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 82%",
            },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-framer-name="Final CTA"
      className="relative flex min-h-[600px] w-full flex-col items-center justify-center overflow-hidden px-6 py-[120px] text-center sm:min-h-[680px] sm:px-16 sm:py-[160px]"
      style={{
        background: "linear-gradient(180deg, #0E2228 0%, #163038 60%, #17384A 100%)",
        fontFamily: '"Geist", "Inter", sans-serif',
      }}
    >
      {/* Procedural SkyStars Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      {/* Ambient Bosphorus Cyan Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[320px] opacity-25"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 100%, #2DD4BF 0%, transparent 70%)",
        }}
      />

      {/* Inner Content (.framer-17r9r0l: max-width 880px, gap 36px) */}
      <div
        ref={contentRef}
        className="relative z-[2] mx-auto flex w-full max-w-[880px] flex-col items-center justify-center gap-[32px] sm:gap-[36px]"
      >
        <h2
          data-sky-cta-item
          className="m-0 text-center text-[46px] font-normal leading-[1.0] tracking-[-0.04em] text-white sm:text-[72px] lg:text-[104px]"
        >
          <span>{titleLine1}</span>
          <br />
          <span
            className="italic font-normal tracking-[-0.02em] text-[#C5A059]"
            style={{
              fontFamily: '"Instrument Serif", "Cormorant Garamond", Georgia, serif',
            }}
          >
            {titleItalicLine2}
          </span>
        </h2>

        <p
          data-sky-cta-item
          className="m-0 max-w-[520px] text-center text-[16px] font-normal leading-[1.55] tracking-[-0.01em] text-white/80 sm:text-[18px]"
        >
          {subtitle}
        </p>

        {/* CTA Buttons (.framer-17e3c5o: gap 14px) */}
        <div data-sky-cta-item className="flex flex-wrap items-center justify-center gap-[14px]">
          <Link
            to={primaryTo}
            className="inline-flex h-[47px] items-center justify-center rounded-full bg-white px-[28px] text-[14px] font-medium tracking-[-0.01em] text-[#163038] no-underline shadow-md transition-all duration-300 hover:bg-[#F9F8F5] hover:scale-[1.03]"
          >
            {primaryLabel}
          </Link>
          <Link
            to={secondaryTo}
            className="inline-flex h-[47px] items-center justify-center rounded-full border border-white/40 bg-transparent px-[28px] text-[14px] font-medium tracking-[-0.01em] text-white no-underline transition-all duration-300 hover:border-white hover:bg-white/10"
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CaldrenSkyCtaSection;
