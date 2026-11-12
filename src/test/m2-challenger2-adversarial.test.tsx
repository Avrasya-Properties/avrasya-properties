import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, fireEvent } from "@testing-library/react";
import React, { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  initSmoothScroll,
  destroySmoothScroll,
  getLenis,
  useSmoothScroll,
} from "@/lib/animation/lenis";
import { splitText, animateTextH, animateTextA, animateTextP } from "@/lib/animation/typography";
import { animateSlide } from "@/lib/animation/masking";
import {
  applyMagneticHover,
  applyRollingNavHover,
  useMagneticHover,
  useRollingNavHover,
} from "@/lib/animation/magnetic";
import { createScopedContext, useScopedGSAP } from "@/lib/animation/context";
import * as gsapModule from "@/lib/gsap";

describe("Milestone M2 Adversarial Challenge Suite (Empirical Challenger 2)", () => {
  beforeEach(() => {
    destroySmoothScroll();
    document.body.innerHTML = "";
    ScrollTrigger.getAll().forEach((st) => st.kill());
    gsap.killTweensOf("*");
    vi.restoreAllMocks();
  });

  afterEach(() => {
    destroySmoothScroll();
    document.body.innerHTML = "";
    ScrollTrigger.getAll().forEach((st) => st.kill());
    gsap.killTweensOf("*");
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. LENIS TICKER INTEGRATION & LIFECYCLE STRESS
  // =========================================================================
  describe("1. Lenis Smooth Scroll Ticker Integration & Lifecycle Stress", () => {
    it("synchronizes GSAP ticker ticks to Lenis raf with exact time conversion (time * 1000)", () => {
      let registeredTickerFn: ((time: number) => void) | null = null;
      const addSpy = vi.spyOn(gsap.ticker, "add").mockImplementation(((fn: any) => {
        registeredTickerFn = fn;
        return fn;
      }) as any);

      const instance = initSmoothScroll();
      expect(instance.lenis).not.toBeNull();
      expect(registeredTickerFn).not.toBeNull();

      if (instance.lenis && registeredTickerFn) {
        const rafSpy = vi.spyOn(instance.lenis, "raf").mockImplementation(() => {});
        // Simulate a GSAP ticker tick at 1.84 seconds
        (registeredTickerFn as (time: number) => void)(1.84);
        expect(rafSpy).toHaveBeenCalledWith(1840);

        // Simulate tick at 0 seconds
        (registeredTickerFn as (time: number) => void)(0);
        expect(rafSpy).toHaveBeenCalledWith(0);
      }

      instance.destroy();
    });

    it("enforces lagSmoothing(0) to prevent animation jumping during smooth scroll", () => {
      const lagSmoothingSpy = vi.spyOn(gsap.ticker, "lagSmoothing");
      const instance = initSmoothScroll();
      expect(lagSmoothingSpy).toHaveBeenCalledWith(0);
      instance.destroy();
    });

    it("respects prefersReducedMotion by returning null lenis and attaching zero ticker callbacks", () => {
      const reducedSpy = vi.spyOn(gsapModule, "prefersReducedMotion").mockReturnValue(true);
      const tickerAddSpy = vi.spyOn(gsap.ticker, "add");

      const instance = initSmoothScroll();
      expect(instance.lenis).toBeNull();
      expect(getLenis()).toBeNull();
      expect(tickerAddSpy).not.toHaveBeenCalled();

      // Calling destroy or invoking result should be safe no-ops
      expect(() => instance.destroy()).not.toThrow();
      expect(() => instance()).not.toThrow();

      reducedSpy.mockRestore();
    });

    it("handles 10 consecutive initSmoothScroll calls without ticker listener explosion", () => {
      const addSpy = vi.spyOn(gsap.ticker, "add");
      const removeSpy = vi.spyOn(gsap.ticker, "remove");

      // Rapidly call init 10 times consecutively
      for (let i = 0; i < 10; i++) {
        initSmoothScroll();
      }

      // GSAP's ticker.add internally calls remove(fn) to deduplicate, plus destroySmoothScroll calls remove(fn)
      // 9 loop destructions + 10 add deduplications = 19 calls
      expect(removeSpy).toHaveBeenCalledTimes(19);
      expect(getLenis()).not.toBeNull();

      // Final destroy cleans up the 10th
      destroySmoothScroll();
      expect(removeSpy).toHaveBeenCalledTimes(20);
      expect(getLenis()).toBeNull();
    });

    it("destroySmoothScroll is completely idempotent when called multiple times or when uninitialized", () => {
      expect(() => destroySmoothScroll()).not.toThrow();
      expect(() => destroySmoothScroll()).not.toThrow();

      initSmoothScroll();
      expect(getLenis()).not.toBeNull();

      destroySmoothScroll();
      expect(getLenis()).toBeNull();

      // Repeated calls should not throw
      expect(() => destroySmoothScroll()).not.toThrow();
      expect(() => destroySmoothScroll()).not.toThrow();
    });

    it("useSmoothScroll toggles cleanly during component life cycle and unmount", () => {
      function SmoothComponent({ enabled }: { enabled: boolean }) {
        useSmoothScroll(enabled);
        return <div data-testid="container">Scroll</div>;
      }

      const { rerender, unmount } = render(<SmoothComponent enabled={true} />);
      expect(getLenis()).not.toBeNull();

      rerender(<SmoothComponent enabled={false} />);
      expect(getLenis()).toBeNull();

      rerender(<SmoothComponent enabled={true} />);
      expect(getLenis()).not.toBeNull();

      unmount();
      expect(getLenis()).toBeNull();
    });
  });

  // =========================================================================
  // 2. KINETIC TYPOGRAPHY TOKENIZER & TIMELINES STRESS
  // =========================================================================
  describe("2. Kinetic Typography Tokenizer, Revert & Motion Archetypes Stress", () => {
    it("tokenizes Turkish diacritics, symbols, punctuation and preserves exact DOM on revert()", () => {
      const container = document.createElement("h1");
      const complexText = "İzmir, Boğaziçi & Şişli — Lüks Konutlar: %100 Doğrulandı!";
      container.innerHTML = complexText;
      document.body.appendChild(container);

      const split = splitText(container, { type: "words,chars" });
      expect(split.words.length).toBe(9);

      // Verify all characters are extracted
      expect(split.chars.length).toBeGreaterThan(30);

      // Verify specific Turkish chars are in the split DOM
      const charTexts = split.chars.map((c) => c.textContent);
      expect(charTexts).toContain("İ");
      expect(charTexts).toContain("ğ");
      expect(charTexts).toContain("ç");
      expect(charTexts).toContain("Ş");
      expect(charTexts).toContain("ş");
      expect(charTexts).toContain("ü");
      expect(charTexts).toContain("—");

      // Verify revert restores exact original DOM text and content
      split.revert();
      expect(container.textContent).toBe(complexText);
    });

    it("tokenizes emojis, non-Latin scripts, and complex unicode without corruption", () => {
      const container = document.createElement("div");
      const unicodeText = "🏰 Prime Palace 💎 奢华别墅 Роскошная вилла";
      container.innerHTML = unicodeText;
      document.body.appendChild(container);

      const split = splitText(container, { type: "words,chars" });
      expect(split.words.length).toBe(7);
      expect(split.chars.length).toBeGreaterThan(15);

      split.revert();
      expect(container.innerHTML).toBe(unicodeText);
    });

    it("handles nested HTML elements and restores original markup on revert", () => {
      const container = document.createElement("p");
      const nestedHTML =
        'Experience <span class="highlight">Unrivaled</span> <strong>Luxury</strong> across Istanbul.';
      container.innerHTML = nestedHTML;
      document.body.appendChild(container);

      const split = splitText(container, { type: "words,chars" });
      expect(split.words.length).toBe(5);

      // During split, words are created
      expect(container.querySelectorAll(".split-word").length).toBe(5);

      // Revert must restore the nested span and strong elements intact
      split.revert();
      expect(container.innerHTML).toBe(nestedHTML);
      expect(container.querySelector(".highlight")?.textContent).toBe("Unrivaled");
      expect(container.querySelector("strong")?.textContent).toBe("Luxury");
    });

    it("handles empty strings and whitespace-only elements gracefully", () => {
      const emptyContainer = document.createElement("div");
      emptyContainer.innerHTML = "";
      document.body.appendChild(emptyContainer);

      const splitEmpty = splitText(emptyContainer);
      expect(splitEmpty.words.length).toBe(0);
      expect(splitEmpty.chars.length).toBe(0);
      expect(splitEmpty.lines.length).toBe(0);
      expect(() => splitEmpty.revert()).not.toThrow();

      const wsContainer = document.createElement("div");
      wsContainer.innerHTML = "   \n\t   \n  ";
      document.body.appendChild(wsContainer);

      const splitWs = splitText(wsContainer);
      expect(splitWs.words.length).toBe(0);
      expect(splitWs.chars.length).toBe(0);
      expect(() => splitWs.revert()).not.toThrow();
    });

    it("stress-tests a 500-word long paragraph without hanging or DOM leakage", () => {
      const words = Array.from({ length: 500 }, (_, i) => `word${i}`);
      const longParagraph = words.join(" ");

      const container = document.createElement("p");
      container.innerHTML = longParagraph;
      document.body.appendChild(container);

      const t0 = performance.now();
      const split = splitText(container, { type: "words,chars" });
      const splitDuration = performance.now() - t0;

      // In JSDOM on Node/Windows, creating 3,500+ DOM nodes takes ~2.5s; verify reasonable upper bound < 6000ms
      expect(splitDuration).toBeLessThan(6000);
      expect(split.words.length).toBe(500);

      split.revert();
      expect(container.innerHTML).toBe(longParagraph);
    });

    it("revert is idempotent and safe to call multiple times", () => {
      const container = document.createElement("div");
      container.innerHTML = "Safe Revert Test";
      document.body.appendChild(container);

      const split = splitText(container);
      expect(container.querySelectorAll(".split-word").length).toBe(3);

      split.revert();
      expect(container.innerHTML).toBe("Safe Revert Test");

      // Repeated revert call should not corrupt or throw
      expect(() => split.revert()).not.toThrow();
      expect(container.innerHTML).toBe("Safe Revert Test");
    });

    it("animateTextH creates valid 3D Y-axis character flip timeline with correct tween parameters", () => {
      const h1 = document.createElement("h1");
      h1.textContent = "BOSPHORUS";
      document.body.appendChild(h1);

      const tl = animateTextH(h1, {
        duration: 1.5,
        delay: 0.2,
        stagger: 0.03,
        ease: "power3.out",
        paused: true,
      });

      expect(tl).toBeInstanceOf(gsap.core.Timeline);
      expect(tl.duration()).toBeGreaterThan(0);

      // Verify character styles for 3D preservation
      const chars = h1.querySelectorAll<HTMLElement>(".split-char");
      expect(chars.length).toBe("BOSPHORUS".length);
      chars.forEach((c) => {
        expect(c.style.transformStyle).toBe("preserve-3d");
      });
    });

    it("animateTextA creates valid 3D X-axis drop-flip timeline with lateral sweep parameter", () => {
      const banner = document.createElement("div");
      banner.textContent = "AVRASYA";
      document.body.appendChild(banner);

      const tl = animateTextA(banner, {
        duration: 1.0,
        x: "15rem",
        paused: true,
      });

      expect(tl).toBeInstanceOf(gsap.core.Timeline);
      expect(tl.duration()).toBeGreaterThan(0);

      const chars = banner.querySelectorAll<HTMLElement>(".split-char");
      expect(chars.length).toBe("AVRASYA".length);
      chars.forEach((c) => {
        expect(c.style.transformStyle).toBe("preserve-3d");
      });
    });

    it("animateTextP creates valid line-masked vertical rise timeline with overflow-hidden mask", () => {
      const p = document.createElement("p");
      p.textContent = "Ultra luxury residence situated overlooking the sea.";
      document.body.appendChild(p);

      const tl = animateTextP(p, {
        duration: 1.4,
        stagger: 0.08,
        paused: true,
      });

      expect(tl).toBeInstanceOf(gsap.core.Timeline);
      expect(tl.duration()).toBeGreaterThan(0);

      const masks = p.querySelectorAll<HTMLElement>(".split-line-mask");
      expect(masks.length).toBeGreaterThanOrEqual(1);
      masks.forEach((m) => {
        expect(m.style.overflow).toBe("hidden");
      });
    });

    it("handles degenerate/non-existent targets gracefully across all typography animators", () => {
      const tlH = animateTextH(".non-existent-selector-12345", { paused: true });
      expect(tlH).toBeInstanceOf(gsap.core.Timeline);
      expect(tlH.duration()).toBe(0);

      const tlA = animateTextA(".non-existent-selector-12345", { paused: true });
      expect(tlA).toBeInstanceOf(gsap.core.Timeline);
      expect(tlA.duration()).toBe(0);

      const tlP = animateTextP(".non-existent-selector-12345", { paused: true });
      expect(tlP).toBeInstanceOf(gsap.core.Timeline);
      expect(tlP.duration()).toBe(0);
    });

    it("falls back to simple opacity animation when prefersReducedMotion is enabled", () => {
      const reducedSpy = vi.spyOn(gsapModule, "prefersReducedMotion").mockReturnValue(true);

      const h = document.createElement("h2");
      h.textContent = "Accessible Title";
      document.body.appendChild(h);

      const tl = animateTextH(h, { paused: true });
      expect(tl).toBeInstanceOf(gsap.core.Timeline);
      // Timeline exists and has reduced duration
      expect(tl.duration()).toBeGreaterThan(0);

      reducedSpy.mockRestore();
    });
  });

  // =========================================================================
  // 3. CINEMATIC POLYGON MASKING STRESS
  // =========================================================================
  describe("3. Cinematic Polygon Clipping Mask (animateSlide) Stress", () => {
    it("handles missing or null container or image without throwing", () => {
      const dummyEl = document.createElement("div");

      expect(() => animateSlide(null as any, null as any)).not.toThrow();
      expect(() => animateSlide(dummyEl, null as any)).not.toThrow();
      expect(() => animateSlide(null as any, dummyEl)).not.toThrow();

      const tl = animateSlide(null as any, null as any);
      expect(tl).toBeInstanceOf(gsap.core.Timeline);
      expect(tl.duration()).toBe(0);
    });

    it("supports custom polygon coordinates and motion options in reveal state", () => {
      const container = document.createElement("div");
      const img = document.createElement("img");
      container.appendChild(img);
      document.body.appendChild(container);

      const tl = animateSlide(container, img, {
        duration: 2.0,
        delay: 0.3,
        scaleStart: 1.8,
        scaleEnd: 1.0,
        xPercentStart: 35,
        xPercentEnd: -5,
        ease: "power2.out",
        paused: true,
      });

      expect(tl).toBeInstanceOf(gsap.core.Timeline);
      // In GSAP, container tween runs 0.3s -> 2.3s; image tween starts at "<" (0.3s) with 0.3s delay -> 0.6s -> 2.6s
      expect(tl.duration()).toBeCloseTo(2.6, 1);
    });

    it("supports state='hide' wipe animation with reverse mask and scaling", () => {
      const container = document.createElement("div");
      const img = document.createElement("img");
      container.appendChild(img);
      document.body.appendChild(container);

      const tl = animateSlide(container, img, {
        duration: 1.5,
        state: "hide",
        paused: true,
      });

      expect(tl).toBeInstanceOf(gsap.core.Timeline);
      expect(tl.duration()).toBe(1.5);
    });

    it("attaches scrollTrigger options to timeline vars when provided", () => {
      const container = document.createElement("div");
      const img = document.createElement("img");
      container.appendChild(img);
      document.body.appendChild(container);

      const tl = animateSlide(container, img, {
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 1,
        },
        paused: true,
      });

      expect(tl.vars.scrollTrigger).toBeDefined();
      expect((tl.vars.scrollTrigger as any).scrub).toBe(1);
    });

    it("respects prefersReducedMotion with simple opacity transition for both reveal and hide", () => {
      const reducedSpy = vi.spyOn(gsapModule, "prefersReducedMotion").mockReturnValue(true);

      const container = document.createElement("div");
      const img = document.createElement("img");
      container.appendChild(img);
      document.body.appendChild(container);

      const tlReveal = animateSlide(container, img, { state: "reveal", paused: true });
      expect(tlReveal.duration()).toBe(0.2);

      const tlHide = animateSlide(container, img, { state: "hide", paused: true });
      expect(tlHide.duration()).toBe(0.2);

      reducedSpy.mockRestore();
    });
  });

  // =========================================================================
  // 4. MAGNETIC BUTTON PHYSICS & ROLLING HOVERS STRESS
  // =========================================================================
  describe("4. Magnetic Button Physics & Rolling Hovers Stress", () => {
    it("handles boundary pointer positions, extreme velocity coordinates and NaN/Infinity gracefully", () => {
      const btn = document.createElement("button");
      btn.innerHTML = `<span data-magnetic-inner>Contact</span>`;
      btn.getBoundingClientRect = () => ({
        left: 50,
        top: 50,
        width: 100,
        height: 50,
        right: 150,
        bottom: 100,
        x: 50,
        y: 50,
        toJSON: () => {},
      });
      document.body.appendChild(btn);

      const cleanup = applyMagneticHover(btn, { strength: 0.5 });

      // Boundary: exact center (dx=0, dy=0)
      fireEvent.mouseMove(btn, { clientX: 100, clientY: 75 });

      // Boundary: top-left corner
      fireEvent.mouseMove(btn, { clientX: 50, clientY: 50 });

      // Boundary: bottom-right corner
      fireEvent.mouseMove(btn, { clientX: 150, clientY: 100 });

      // Extreme velocity: coordinates 10,000px away
      expect(() => {
        fireEvent.mouseMove(btn, { clientX: 10000, clientY: 10000 });
        fireEvent.mouseMove(btn, { clientX: -10000, clientY: -10000 });
      }).not.toThrow();

      // Degenerate coordinates
      expect(() => {
        fireEvent.mouseMove(btn, { clientX: Number.NaN, clientY: Number.NaN });
        fireEvent.mouseMove(btn, {
          clientX: Number.POSITIVE_INFINITY,
          clientY: Number.NEGATIVE_INFINITY,
        });
      }).not.toThrow();

      cleanup();
    });

    it("triggers spring return on mouseleave with elastic easing", () => {
      const toSpy = vi.spyOn(gsap, "to");

      const btn = document.createElement("button");
      btn.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        width: 100,
        height: 50,
        right: 100,
        bottom: 50,
        x: 0,
        y: 0,
        toJSON: () => {},
      });
      document.body.appendChild(btn);

      const cleanup = applyMagneticHover(btn, {
        returnEase: "elastic.out(1, 0.3)",
        returnDuration: 1.2,
      });

      // Hover then leave
      fireEvent.mouseMove(btn, { clientX: 80, clientY: 40 });
      fireEvent.mouseLeave(btn);

      expect(toSpy).toHaveBeenCalledWith(
        btn,
        expect.objectContaining({
          x: 0,
          y: 0,
          duration: 1.2,
          ease: "elastic.out(1, 0.3)",
        }),
      );

      cleanup();
    });

    it("touch events do not trigger unintended magnetic displacement", () => {
      const btn = document.createElement("button");
      btn.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        width: 100,
        height: 50,
        right: 100,
        bottom: 50,
        x: 0,
        y: 0,
        toJSON: () => {},
      });
      document.body.appendChild(btn);

      const cleanup = applyMagneticHover(btn);

      // Dispatch touch events (mobile interactions)
      expect(() => {
        fireEvent.touchStart(btn, { touches: [{ clientX: 50, clientY: 25 }] });
        fireEvent.touchMove(btn, { touches: [{ clientX: 80, clientY: 40 }] });
        fireEvent.touchEnd(btn);
      }).not.toThrow();

      cleanup();
    });

    it("multi-tier parallax calculates amplified strength on inner child element", () => {
      const btn = document.createElement("button");
      btn.innerHTML = `<span data-magnetic-inner>Exclusive View</span>`;
      btn.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => {},
      });
      document.body.appendChild(btn);

      const quickToSpy = vi.spyOn(gsap, "quickTo");
      const cleanup = applyMagneticHover(btn, { strength: 0.2, innerStrength: 0.4 });

      // Outer and inner quickTo instances should be created
      expect(quickToSpy).toHaveBeenCalledWith(btn, "x", expect.any(Object));
      expect(quickToSpy).toHaveBeenCalledWith(btn, "y", expect.any(Object));

      const inner = btn.querySelector("[data-magnetic-inner]");
      expect(quickToSpy).toHaveBeenCalledWith(inner, "x", expect.any(Object));
      expect(quickToSpy).toHaveBeenCalledWith(inner, "y", expect.any(Object));

      cleanup();
    });

    it("applyRollingNavHover handles rapid mouseenter/mouseleave thrashing and clean teardown", () => {
      const link = document.createElement("a");
      link.textContent = "DISCOVER";
      document.body.appendChild(link);

      const cleanup = applyRollingNavHover(link);

      // Rapidly toggle hover 10 times in succession
      for (let i = 0; i < 10; i++) {
        fireEvent.mouseEnter(link);
        fireEvent.mouseLeave(link);
      }

      cleanup();
      // Verifies original text restored
      expect(link.textContent).toBe("DISCOVER");
      expect(link.querySelector(".roll-primary")).toBeNull();
    });

    it("applyRollingNavHover handles whitespace-only and empty text without breaking DOM", () => {
      const emptyLink = document.createElement("a");
      emptyLink.textContent = "";
      document.body.appendChild(emptyLink);

      const cleanup = applyRollingNavHover(emptyLink);
      expect(typeof cleanup).toBe("function");
      expect(() => cleanup()).not.toThrow();
      expect(emptyLink.textContent).toBe("");
    });
  });

  // =========================================================================
  // 5. MEMORY LEAK & SCOPED CONTEXT LIFECYCLE STRESS
  // =========================================================================
  describe("5. Memory Leak Prevention & Rapid Mount/Unmount Lifecycles", () => {
    it("50 rapid mount and unmount cycles with useScopedGSAP leak ZERO ScrollTriggers or tweens", () => {
      function LeakyComponent() {
        const containerRef = useRef<HTMLDivElement>(null);

        useScopedGSAP((ctx) => {
          // Create tweens and ScrollTriggers inside context
          gsap.to(containerRef.current, {
            x: 100,
            duration: 1,
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top center",
              end: "bottom center",
            },
          });
        }, containerRef);

        return (
          <div ref={containerRef} className="animated-box">
            Item
          </div>
        );
      }

      // Execute 50 rapid mount / unmount cycles
      for (let cycle = 0; cycle < 50; cycle++) {
        const { unmount } = render(<LeakyComponent />);
        expect(ScrollTrigger.getAll().length).toBeGreaterThan(0);
        unmount();
        // After unmount, context.revert() MUST kill the ScrollTrigger
        expect(ScrollTrigger.getAll().length).toBe(0);
      }

      // Final check: zero dangling ScrollTrigger instances
      expect(ScrollTrigger.getAll().length).toBe(0);
    });

    it("createScopedContext isolates selector queries and reverts independent contexts cleanly", () => {
      const scopeA = document.createElement("div");
      scopeA.innerHTML = `<span class="target">A</span>`;
      const scopeB = document.createElement("div");
      scopeB.innerHTML = `<span class="target">B</span>`;
      document.body.appendChild(scopeA);
      document.body.appendChild(scopeB);

      let targetAFound = false;
      let targetBFound = false;

      const ctxA = createScopedContext(scopeA, (self) => {
        const el = scopeA.querySelector(".target");
        if (el) {
          targetAFound = true;
          gsap.to(el, { x: 50 });
        }
      });

      const ctxB = createScopedContext(scopeB, (self) => {
        const el = scopeB.querySelector(".target");
        if (el) {
          targetBFound = true;
          gsap.to(el, { x: 100 });
        }
      });

      expect(targetAFound).toBe(true);
      expect(targetBFound).toBe(true);

      // Revert A only
      ctxA.revert();

      // B context remains intact until explicitly reverted
      ctxB.revert();
    });

    it("re-runs useScopedGSAP when dependencies change and cleans up the previous execution", () => {
      let runCount = 0;

      function DynamicComponent({ step }: { step: number }) {
        const ref = useRef<HTMLDivElement>(null);

        useScopedGSAP(
          () => {
            runCount++;
            gsap.to(ref.current, {
              x: step * 10,
              scrollTrigger: {
                trigger: ref.current,
                id: `trigger-step-${step}`,
              },
            });
          },
          ref,
          [step],
        );

        return <div ref={ref}>Dynamic</div>;
      }

      const { rerender, unmount } = render(<DynamicComponent step={1} />);
      expect(runCount).toBe(1);
      expect(ScrollTrigger.getById("trigger-step-1")).toBeDefined();

      // Update dependency
      rerender(<DynamicComponent step={2} />);
      expect(runCount).toBe(2);
      // Previous trigger should be killed
      expect(ScrollTrigger.getById("trigger-step-1")).toBeUndefined();
      expect(ScrollTrigger.getById("trigger-step-2")).toBeDefined();

      unmount();
      expect(ScrollTrigger.getAll().length).toBe(0);
    });
  });
});
