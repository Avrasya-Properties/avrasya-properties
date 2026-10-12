import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Reveals [data-reveal] elements as they enter the viewport; re-scans on navigation. */
export function MotionRoot() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    document.documentElement.classList.add("js-motion");
    const revealAll = () =>
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((e) => e.classList.add("is-in"));
    if (reduced() || !("IntersectionObserver" in window)) {
      revealAll();
      return () => document.documentElement.classList.remove("js-motion");
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    const observe = () =>
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)").forEach((e) => io.observe(e));
    observe();
    const mutation = new MutationObserver(observe);
    mutation.observe(document.getElementById("main") || document.body, { childList: true, subtree: true });
    // Parallax layers
    const layers = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    let raf = 0;
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      layers.forEach((l) => {
        const r = l.parentElement!.getBoundingClientRect();
        const speed = window.matchMedia("(pointer: coarse)").matches?0:Number(l.dataset["parallax"]) || 0.15;
        const off = (r.top + r.height / 2 - vh / 2) * -speed;
        l.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
      });
      const p = document.getElementById("scroll-progress");
      if (p) {
        const h = document.documentElement;
        p.style.transform = `scaleX(${h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)})`;
      }
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      io.disconnect();
      mutation.disconnect();
      document.documentElement.classList.remove("js-motion");
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
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
    if (!el || reduced() || !window.matchMedia("(pointer: fine)").matches) return;
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
    if (!el || reduced() || !window.matchMedia("(pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1)}px)`;
    };
    const leave = () => {
      el.style.transform = "";
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);
  return (
    <span ref={ref} className="inline-block transition-transform duration-300 ease-out">
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
