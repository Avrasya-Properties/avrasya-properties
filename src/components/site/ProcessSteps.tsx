import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

export type ProcessStep = { label: string; title: string; items: readonly (readonly [string, string])[] };

/**
 * Scroll-led buying journey. From laptop width the left column stays pinned while a brass rail fills with
 * scroll and each step lights up as it reaches the reading line; on smaller screens the steps simply rise
 * in one after another. Without JavaScript every step is fully visible.
 */
export function ProcessSteps({ eyebrow, title, steps, linkLabel }: { eyebrow: string; title: string; steps: readonly ProcessStep[]; linkLabel: string }) {
  const root = useRef<HTMLElement>(null);
  const numeral = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const list = root.current?.querySelector<HTMLElement>(".process-list");
        list?.classList.add("is-live");
        gsap.fromTo(
          ".process-fill",
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".process-list", start: "top 60%", end: "bottom 60%", scrub: true } },
        );
        gsap.utils.toArray<HTMLElement>(".process-step").forEach((el, i) => {
          ScrollTrigger.create({
            trigger: el,
            start: "top 58%",
            end: "bottom 58%",
            onToggle: (self) => {
              el.classList.toggle("is-active", self.isActive);
              // Edit the existing text node: replacing children would trip the page-wide mutation observer.
              const node = numeral.current?.firstChild;
              if (self.isActive && node) node.nodeValue = String(i + 1).padStart(2, "0");
            },
          });
        });
        return () => {
          list?.classList.remove("is-live");
          root.current?.querySelectorAll(".process-step.is-active").forEach((n) => n.classList.remove("is-active"));
        };
      });
      mm.add("(max-width: 1023px)", () => {
        gsap.from(".process-step", {
          opacity: 0,
          y: 28,
          duration: 0.7,
          stagger: 0.14,
          ease: "power2.out",
          scrollTrigger: { trigger: ".process-list", start: "top 88%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-process className="relative overflow-hidden border-y border-white/10 bg-night py-20 text-on-dark md:py-32">
      <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24">
        <div className="self-start lg:sticky lg:top-28">
          <p className="kicker text-brass-light">{eyebrow}</p>
          <h2 className="headline mt-4 max-w-md text-on-dark">{title}</h2>
          <div className="mt-8 hidden items-end gap-6 lg:flex" aria-hidden="true">
            <span className="numeral text-[8rem] text-brass-light/90">
              <span ref={numeral}>01</span>
            </span>
            <span className="kicker mb-6 text-on-dark-muted">/ {String(steps.length).padStart(2, "0")}</span>
          </div>
          <Link to="/services" className="group mt-6 inline-flex min-h-11 items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-dark hover:text-brass-light">
            <span>{linkLabel}</span>
            <ArrowRight className="h-3.5 w-3.5 rtl-flip transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <ol className="process-list relative space-y-4 lg:space-y-0 lg:ps-10">
          <span aria-hidden="true" className="absolute inset-y-0 start-0 hidden w-px bg-white/15 lg:block">
            <span className="process-fill block h-full w-full origin-top bg-brass-light" />
          </span>
          {steps.map((step) => (
            <li key={step.label} className="process-step border-t border-white/15 py-8 lg:flex lg:min-h-[58vh] lg:flex-col lg:justify-center">
              <p className="kicker text-brass-light">{step.label}</p>
              <p className="font-display mt-3 max-w-xl text-3xl leading-tight md:text-4xl">{step.title}</p>
              <ul className="mt-7 grid gap-5 sm:grid-cols-3">
                {step.items.map(([head, body]) => (
                  <li key={head} className="space-y-1.5">
                    <p className="text-sm font-semibold">{head}</p>
                    <p className="text-xs leading-relaxed text-on-dark-muted">{body}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}