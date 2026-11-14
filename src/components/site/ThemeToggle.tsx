import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useTheme } from "@/hooks/useTheme";
import { applyMagneticHover } from "@/lib/animation/magnetic";

export interface ThemeToggleProps {
  variant?: "navbar" | "compact" | "mobile";
  className?: string;
}

/**
 * Interactive, visually refined Dark / Light Mode Toggle with GSAP celestial
 * sun-to-crescent-moon transition, rotating brass rays, and magnetic physics.
 */
export function ThemeToggle({ variant = "navbar", className = "" }: ThemeToggleProps) {
  const { resolvedTheme, isDark, toggleTheme, setTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sunGroupRef = useRef<SVGGElement>(null);
  const moonGroupRef = useRef<SVGGElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);

  // Subtle magnetic hover on desktop navbar button
  useEffect(() => {
    if (typeof window === "undefined" || variant === "mobile") return;
    const btn = buttonRef.current;
    if (!btn) return;
    const cleanup = applyMagneticHover(btn, {
      strength: 0.14,
      innerStrength: 0.2,
      returnDuration: 0.45,
      returnEase: "power3.out",
    });
    return cleanup;
  }, [variant]);

  // GSAP choreographed celestial icon animation when resolvedTheme changes
  useEffect(() => {
    if (typeof window === "undefined" || navigator.userAgent.includes("jsdom")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sunEl = sunGroupRef.current;
    const moonEl = moonGroupRef.current;
    const glowEl = glowRef.current;
    if (!sunEl || !moonEl) return;

    const ctx = gsap.context(() => {
      if (isDark) {
        gsap.to(sunEl, {
          scale: 0,
          rotation: -90,
          opacity: 0,
          duration: 0.42,
          ease: "power3.inOut",
          transformOrigin: "50% 50%",
        });
        gsap.fromTo(
          moonEl,
          { scale: 0.3, rotation: 90, opacity: 0 },
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 0.52,
            ease: "back.out(1.8)",
            transformOrigin: "50% 50%",
          },
        );
      } else {
        gsap.to(moonEl, {
          scale: 0,
          rotation: 90,
          opacity: 0,
          duration: 0.42,
          ease: "power3.inOut",
          transformOrigin: "50% 50%",
        });
        gsap.fromTo(
          sunEl,
          { scale: 0.3, rotation: -90, opacity: 0 },
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 0.52,
            ease: "back.out(1.8)",
            transformOrigin: "50% 50%",
          },
        );
      }

      if (glowEl) {
        gsap.fromTo(
          glowEl,
          { scale: 0.65, opacity: 0.65 },
          {
            scale: 1.5,
            opacity: 0,
            duration: 0.55,
            ease: "power2.out",
          },
        );
      }
    });

    return () => ctx.revert();
  }, [isDark]);

  if (variant === "mobile") {
    return (
      <div
        className={`inline-flex items-center rounded-full border border-white/20 bg-white/10 p-1 ${className}`}
        role="group"
        aria-label="Theme mode selector"
      >
        <button
          type="button"
          data-testid="theme-toggle-light-mobile"
          aria-pressed={!isDark}
          onClick={() => setTheme("light")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            !isDark ? "bg-[#C5A059] text-[#0E2228] shadow-xs" : "text-white/75 hover:text-white"
          }`}
        >
          <span>☀</span>
          <span>Light</span>
        </button>
        <button
          type="button"
          data-testid="theme-toggle-dark-mobile"
          aria-pressed={isDark}
          onClick={() => setTheme("dark")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            isDark ? "bg-[#C5A059] text-[#0E2228] shadow-xs" : "text-white/75 hover:text-white"
          }`}
        >
          <span>☾</span>
          <span>Dark</span>
        </button>
      </div>
    );
  }

  const isCompact = variant === "compact";

  return (
    <button
      ref={buttonRef}
      type="button"
      data-testid="theme-toggle-button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`group relative inline-flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] ${
        isCompact ? "h-10 w-10" : "h-9 px-3 gap-2"
      } ${
        isDark
          ? "border-[#C5A059]/45 bg-[#12252B] text-[#E5C378] shadow-[0_0_20px_rgba(197,160,89,0.16)] hover:border-[#C5A059] hover:bg-[#173038]"
          : "border-[#163038]/15 bg-white/85 text-[#163038] shadow-2xs hover:border-[#C5A059] hover:bg-white"
      } ${className}`}
    >
      {/* Subtle radial pulse ring on click */}
      <span
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-[#C5A059]/25 opacity-0"
      />

      <span data-magnetic-inner className="relative flex items-center justify-center gap-1.5">
        <span className="relative flex h-4 w-4 items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4 overflow-visible"
            aria-hidden="true"
          >
            {/* Sun Icon Group */}
            <g
              ref={sunGroupRef}
              style={{
                opacity: isDark ? 0 : 1,
                transform: isDark ? "scale(0) rotate(-90deg)" : "scale(1) rotate(0deg)",
                transformOrigin: "12px 12px",
                transition: "transform 350ms cubic-bezier(0.22, 1, 0.36, 1), opacity 250ms ease",
              }}
            >
              <circle
                cx="12"
                cy="12"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="rgba(197, 160, 89, 0.25)"
              />
              <path
                d="M12 2.2V4.4M12 19.6V21.8M4.22 4.22L5.78 5.78M18.22 18.22L19.78 19.78M2.2 12H4.4M19.6 12H21.8M4.22 19.78L5.78 18.22M18.22 5.78L19.78 4.22"
                stroke="#C5A059"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </g>

            {/* Crescent Moon & Star Icon Group */}
            <g
              ref={moonGroupRef}
              style={{
                opacity: isDark ? 1 : 0,
                transform: isDark ? "scale(1) rotate(0deg)" : "scale(0) rotate(90deg)",
                transformOrigin: "12px 12px",
                transition: "transform 350ms cubic-bezier(0.22, 1, 0.36, 1), opacity 250ms ease",
              }}
            >
              <path
                d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646Z"
                stroke="#E5C378"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="rgba(229, 195, 120, 0.2)"
              />
              <circle cx="17.5" cy="6.5" r="1" fill="#2DD4BF" />
            </g>
          </svg>
        </span>

        {!isCompact && (
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em]">
            {resolvedTheme === "dark" ? "Dark" : "Light"}
          </span>
        )}
      </span>
    </button>
  );
}

export default ThemeToggle;
