import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Full-bleed hero photograph with real depth: a slow settle-in on load and a scroll-scrubbed parallax.
 * Decorative only (the h1 carries the meaning).
 */
export function HeroBackdrop({ image }: { image: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        gsap.fromTo(".hero-photo", { scale: 1.16 }, { scale: 1.04, duration: 2.4, ease: "power3.out" });
        gsap.to(".hero-photo", {
          yPercent: 14,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
      });
      mm.add("(max-width: 767px)", () => {
        gsap.fromTo(".hero-photo", { scale: 1.1 }, { scale: 1, duration: 1.8, ease: "power2.out" });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-night">
      <img
        src={image}
        alt=""
        // The hero photograph is the page's LCP element.
        fetchPriority="high"
        decoding="async"
        className="hero-photo absolute inset-0 h-full w-full object-cover object-[62%_center] will-change-transform"
      />
      {/* Scrims: left for copy legibility, bottom to seat the facts row. */}
      <div className="absolute inset-0 bg-night/50 md:hidden" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,25,30,0.94)_0%,rgba(7,25,30,0.78)_38%,rgba(7,25,30,0.2)_72%,rgba(7,25,30,0.35)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,25,30,0.55)_0%,transparent_30%,transparent_55%,rgba(7,25,30,0.92)_100%)]" />
    </div>
  );
}