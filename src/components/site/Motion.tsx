import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const isReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let refreshTimer: ReturnType<typeof setTimeout> | null = null;
/** Schedule a debounced ScrollTrigger refresh after async DOM layout settles. */
export function scheduleScrollRefresh(delay = 180) {
  if (typeof window === "undefined") return;
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    ScrollTrigger.refresh();
  }, delay);
}

/** Scoped GSAP Motion orchestrator: reveals [data-reveal], desktop parallax, and scroll progress. */
export function MotionRoot() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;

    document.documentElement.classList.add("js-motion");

    const revealAllImmediate = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((e) => {
        e.classList.add("is-in");
        gsap.set(e, { opacity: 1, y: 0, clearProps: "transform,opacity" });
      });
    };

    if (isReduced()) {
      revealAllImmediate();
      return () => {
        document.documentElement.classList.remove("js-motion");
      };
    }

    // Create an owned GSAP context / matchMedia
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // 1. Reveal [data-reveal] elements with smooth 18px translation and 0.55s duration
      const initReveals = () => {
        const unrevealed = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)");
        unrevealed.forEach((el) => {
          const delayMs = parseFloat(el.style.getPropertyValue("--d") || "0");
          const delay = delayMs > 0 ? delayMs / 1000 : 0;
          const isMask = el.dataset["reveal"] === "mask";

          if (isMask) {
            gsap.fromTo(
              el,
              { clipPath: "inset(0 0 100% 0)" },
              {
                clipPath: "inset(0 0 0% 0)",
                duration: 0.75,
                delay,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: el,
                  start: "top 92%",
                  once: true,
                  onEnter: () => el.classList.add("is-in"),
                },
              }
            );
          } else {
            gsap.fromTo(
              el,
              { opacity: 0, y: 18 },
              {
                opacity: 1,
                y: 0,
                duration: 0.55,
                delay,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: el,
                  start: "top 90%",
                  once: true,
                  onEnter: () => el.classList.add("is-in"),
                },
              }
            );
          }
        });
      };

      initReveals();

      // 2. Parallax layers for fine pointer desktop devices only
      const isFinePointer = window.matchMedia("(pointer: fine)").matches;
      if (isFinePointer) {
        const layers = document.querySelectorAll<HTMLElement>("[data-parallax]");
        layers.forEach((l) => {
          const speed = Number(l.dataset["parallax"]) || 0.15;
          gsap.to(l, {
            y: () => -(speed * 40),
            ease: "none",
            scrollTrigger: {
              trigger: l.parentElement || l,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
            },
          });
        });
      }

      // 3. Precision top scroll progress bar
      const progressBar = document.getElementById("scroll-progress");
      if (progressBar) {
        gsap.fromTo(
          progressBar,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              start: "top top",
              end: "max",
              scrub: 0.15,
            },
          }
        );
      }

      // 4. Staggered reveals on property collections / card grids
      const grids = document.querySelectorAll<HTMLElement>("[data-stagger-grid]");
      grids.forEach((grid) => {
        const cards = grid.querySelectorAll(".card-elevate, article, [data-property-card]");
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: grid,
                start: "top 88%",
                once: true,
                onEnter: () => cards.forEach((c) => c.classList.add("is-in")),
              },
            }
          );
        }
      });
    });

    // Observe dynamically mounted elements (e.g. async CMS collections)
    const observer = new MutationObserver(() => {
      const pending = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)");
      if (pending.length > 0) {
        scheduleScrollRefresh();
      }
    });

    const targetNode = document.getElementById("main") || document.body;
    observer.observe(targetNode, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mm.revert();
      document.documentElement.classList.remove("js-motion");
    };
  }, [path]);

  return (
    <div
      id="scroll-progress"
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left scale-x-0 bg-brass"
    />
  );
}

/** Pointer-driven 3D tilt with a moving light sheen (fine pointers only). */
export function Tilt({
  children,
  className = "",
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || isReduced() || !window.matchMedia("(pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width,
        y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--rx", `${((0.5 - y) * max).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((x - 0.5) * max).toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    };
    const leave = () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [max]);
  return (
    <div ref={ref} className={`tilt ${className}`}>
      {children}
    </div>
  );
}

/** Magnetic pull for primary CTAs. */
export function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || isReduced() || !window.matchMedia("(pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * 0.18;
      const dy = (e.clientY - r.top - r.height / 2) * 0.25;
      gsap.to(el, { x: dx, y: dy, duration: 0.2, ease: "power1.out" });
    };
    const leave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.35, ease: "power2.out" });
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);
  return (
    <span ref={ref} className="inline-block">
      {children}
    </span>
  );
}

export function Marquee({ items }: { items: string[] }) {
  const row = items.map((t) => (
    <span key={t} className="flex items-center gap-10 pr-10">
      <span>{t}</span>
      <span className="text-brass">◆</span>
    </span>
  ));
  return (
    <div className="marquee overflow-hidden border-y bg-primary py-5 text-on-dark" aria-hidden>
      <div className="marquee-track flex w-max font-display text-3xl italic md:text-5xl">
        {row}
        {row}
      </div>
    </div>
  );
}
