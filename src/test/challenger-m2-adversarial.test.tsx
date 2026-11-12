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
import {
  animateTextH as transTextH,
  animateTextA as transTextA,
  animateTextP as transTextP,
  animateSlide as transSlide,
} from "@/lib/animation/transitions";

describe("Milestone M2: Independent Adversarial Challenge Suite", () => {
  const originalMatchMedia = window.matchMedia;

  const mockReducedMotion = (enabled: boolean) => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: enabled && query.includes("prefers-reduced-motion: reduce"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  };

  beforeEach(() => {
    destroySmoothScroll();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
    mockReducedMotion(false);
  });

  afterEach(() => {
    destroySmoothScroll();
    document.body.innerHTML = "";
    window.matchMedia = originalMatchMedia;
  });

  // =========================================================================
  // 1. Lenis Smooth Scrolling Engine Adversarial Tests
  // =========================================================================
  describe("1. Lenis Ticker & Smooth Scroll Engine Integration", () => {
    it("drives Lenis raf through GSAP ticker callback with exact milliseconds (time * 1000)", () => {
      let registeredTickerCallback: ((time: number) => void) | null = null;

      const addSpy = vi.spyOn(gsap.ticker, "add").mockImplementation((fn: any) => {
        registeredTickerCallback = fn;
        return undefined as any;
      });

      const instance = initSmoothScroll();
      expect(instance.lenis).not.toBeNull();
      expect(addSpy).toHaveBeenCalled();
      expect(registeredTickerCallback).toBeTypeOf("function");

      // Spy on lenis.raf
      const rafSpy = vi.spyOn(instance.lenis!, "raf");

      // Execute ticker callback with simulated delta time = 0.01667 (16.67ms)
      registeredTickerCallback!(0.01667);
      expect(rafSpy).toHaveBeenCalledWith(16.67);

      // Execute with zero and larger delta
      registeredTickerCallback!(0.1);
      expect(rafSpy).toHaveBeenCalledWith(100);

      instance.destroy();
    });

    it("verifies gsap.ticker.lagSmoothing(0) is strictly called to prevent animation jumps", () => {
      const lagSmoothingSpy = vi.spyOn(gsap.ticker, "lagSmoothing");

      const instance = initSmoothScroll();
      expect(lagSmoothingSpy).toHaveBeenCalledWith(0);
      instance.destroy();
    });

    it("enforces prefers-reduced-motion fallback: no Lenis creation, no ticker listeners, safe no-op teardown", () => {
      mockReducedMotion(true);

      const addSpy = vi.spyOn(gsap.ticker, "add");
      const instance = initSmoothScroll();

      expect(instance.lenis).toBeNull();
      expect(getLenis()).toBeNull();
      expect(addSpy).not.toHaveBeenCalled();

      // Ensure calling teardown does not throw
      expect(() => instance.destroy()).not.toThrow();
      expect(() => instance()).not.toThrow();
    });

    it("handles multiple consecutive initSmoothScroll calls cleanly without leaking ticker listeners", () => {
      const removeSpy = vi.spyOn(gsap.ticker, "remove");

      // Rapidly initialize 5 instances in succession without manual destroy
      const instances = [];
      for (let i = 0; i < 5; i++) {
        instances.push(initSmoothScroll());
      }

      // GSAP's ticker.add internally calls remove(fn) to deduplicate, plus destroySmoothScroll calls remove(fn)
      // 4 loop destructions + 5 add deduplications = 9 remove calls
      expect(removeSpy).toHaveBeenCalledTimes(9);
      expect(getLenis()).toBe(instances[4]?.lenis);

      // Clean teardown of last instance
      destroySmoothScroll();
      expect(removeSpy).toHaveBeenCalledTimes(10);
      expect(getLenis()).toBeNull();
    });

    it("survives exceptions thrown inside globalLenis.destroy() during teardown", () => {
      const instance = initSmoothScroll();
      expect(instance.lenis).not.toBeNull();

      // Intentionally break destroy() to simulate external library crash
      vi.spyOn(instance.lenis!, "destroy").mockImplementation(() => {
        throw new Error("Simulated Lenis internal teardown error");
      });

      // Teardown should swallow error safely
      expect(() => destroySmoothScroll()).not.toThrow();
      expect(getLenis()).toBeNull();
    });

    it("stress tests rapid React route navigation toggling useSmoothScroll on and off", () => {
      function NavigationStressTest({ enabled }: { enabled: boolean }) {
        useSmoothScroll(enabled);
        return <div data-testid="page">Content</div>;
      }

      const { rerender, unmount } = render(<NavigationStressTest enabled={true} />);
      expect(getLenis()).not.toBeNull();

      // Rapidly toggle between public (enabled) and admin (disabled) routes 10 times
      for (let i = 0; i < 10; i++) {
        act(() => {
          rerender(<NavigationStressTest enabled={false} />);
        });
        expect(getLenis()).toBeNull();

        act(() => {
          rerender(<NavigationStressTest enabled={true} />);
        });
        expect(getLenis()).not.toBeNull();
      }

      unmount();
      expect(getLenis()).toBeNull();
    });
  });

  // =========================================================================
  // 2. Kinetic SplitText Typography Adversarial Tests
  // =========================================================================
  describe("2. Kinetic SplitText Typography Engine", () => {
    it("handles non-ASCII Turkish characters, umlauts, emojis, currency symbols, and HTML entities", () => {
      const div = document.createElement("div");
      // Turkish characters, German umlauts, emojis, currency, quotes
      div.textContent = "Boğaz'ın Şaheseri: Çırağan Sarayı ₺120M & €3.5M 🏰💎";
      document.body.appendChild(div);

      const split = splitText(div, { type: "words,chars" });
      expect(split.words.length).toBe(8); // "Boğaz'ın", "Şaheseri:", "Çırağan", "Sarayı", "₺120M", "&", "€3.5M", "🏰💎" -> 8 tokens
      expect(split.chars.length).toBeGreaterThan(30);

      // Verify specific characters exist in split chars
      const charTexts = split.chars.map((c) => c.textContent);
      expect(charTexts).toContain("ğ");
      expect(charTexts).toContain("Ş");
      expect(charTexts).toContain("Ç");
      expect(charTexts).toContain("₺");
      expect(charTexts).toContain("€");
      expect(charTexts).toContain("🏰");
      expect(charTexts).toContain("💎");

      // Verify revert restores exact text
      split.revert();
      expect(div.textContent).toBe("Boğaz'ın Şaheseri: Çırağan Sarayı ₺120M & €3.5M 🏰💎");
    });

    it("safely handles nested HTML elements and restores EXACT DOM hierarchy on revert()", () => {
      const container = document.createElement("div");
      const complexHtml =
        'Welcome to <span class="highlight">Avrasya <strong>Luxury</strong></span> real estate.';
      container.innerHTML = complexHtml;
      document.body.appendChild(container);

      const split = splitText(container, { type: "words,chars" });
      expect(split.words.length).toBe(6); // "Welcome", "to", "Avrasya", "Luxury", "real", "estate."

      // Revert must restore the exact innerHTML including span and strong elements and classes
      split.revert();
      expect(container.innerHTML).toBe(complexHtml);
    });

    it("safely handles empty strings, whitespace-only content, and single-character elements", () => {
      const emptyDiv = document.createElement("div");
      emptyDiv.innerHTML = "";
      document.body.appendChild(emptyDiv);

      const splitEmpty = splitText(emptyDiv);
      expect(splitEmpty.chars).toEqual([]);
      expect(splitEmpty.words).toEqual([]);
      expect(splitEmpty.lines).toEqual([]);
      expect(() => splitEmpty.revert()).not.toThrow();

      const whitespaceDiv = document.createElement("div");
      whitespaceDiv.innerHTML = "   \n\t  \r  ";
      document.body.appendChild(whitespaceDiv);

      const splitWhitespace = splitText(whitespaceDiv);
      expect(splitWhitespace.chars).toEqual([]);
      expect(splitWhitespace.words).toEqual([]);
      expect(() => splitWhitespace.revert()).not.toThrow();

      const singleChar = document.createElement("div");
      singleChar.innerHTML = "X";
      document.body.appendChild(singleChar);

      const splitSingle = splitText(singleChar);
      expect(splitSingle.words.length).toBe(1);
      expect(splitSingle.chars.length).toBe(1);
      splitSingle.revert();
      expect(singleChar.innerHTML).toBe("X");
    });

    it("handles long multi-sentence paragraphs with line-masking slots", () => {
      const paragraph = document.createElement("p");
      const text =
        "Perched above the Bosphorus strait, Avrasya residences combine timeless Ottoman architectural heritage with avant-garde contemporary engineering. Each private residence features expansive panoramic floor-to-ceiling vistas, dedicated concierge facilities, private mooring rights, and curated finishes sourced from northern Italian marble quarries.";
      paragraph.textContent = text;
      document.body.appendChild(paragraph);

      const split = splitText(paragraph, { type: "lines,words", maskLines: true });
      expect(split.words.length).toBeGreaterThan(35);
      expect(split.lines.length).toBeGreaterThanOrEqual(1);

      // Verify line masks are generated with overflow: hidden
      const masks = paragraph.querySelectorAll(".split-line-mask");
      expect(masks.length).toBe(split.lines.length);
      masks.forEach((mask) => {
        expect((mask as HTMLElement).style.overflow).toBe("hidden");
        expect((mask as HTMLElement).style.display).toBe("block");
      });

      split.revert();
      expect(paragraph.textContent).toBe(text);
    });

    it("handles selector targets that match multiple elements or zero elements", () => {
      // 0 elements
      const tlEmpty = animateTextH(".non-existent-selector-12345", { paused: true });
      expect(tlEmpty).toBeInstanceOf(gsap.core.Timeline);
      expect(tlEmpty.duration()).toBe(0);

      // Multiple elements
      const h1 = document.createElement("h1");
      h1.className = "heading-multi";
      h1.textContent = "First Heading";
      const h2 = document.createElement("h1");
      h2.className = "heading-multi";
      h2.textContent = "Second Heading";
      document.body.appendChild(h1);
      document.body.appendChild(h2);

      const tlMulti = animateTextH(".heading-multi", { paused: true });
      expect(tlMulti.duration()).toBeGreaterThan(0);
      expect(h1.querySelectorAll(".split-char").length).toBe("FirstHeading".length);
      expect(h2.querySelectorAll(".split-char").length).toBe("SecondHeading".length);
    });

    it("verifies animateTextH timeline configuration and tween parameters (3D Y-flip)", () => {
      const h1 = document.createElement("h1");
      h1.textContent = "ERA RESIDENCE";
      document.body.appendChild(h1);

      let completeCalled = false;
      const tl = animateTextH(h1, {
        duration: 1.5,
        delay: 0.2,
        stagger: 0.03,
        ease: "power2.out",
        paused: true,
        onComplete: () => {
          completeCalled = true;
        },
      });

      expect(tl.paused()).toBe(true);
      expect(tl.duration()).toBeGreaterThan(1.5);

      // Advance timeline to end to test completion callback
      tl.progress(1);
      expect(completeCalled).toBe(true);

      // Verify chars have preserve-3d
      const chars = h1.querySelectorAll<HTMLElement>(".split-char");
      expect(chars.length).toBe("ERARESIDENCE".length);
      chars.forEach((c) => {
        expect(c.style.transformStyle).toBe("preserve-3d");
      });
    });

    it("verifies animateTextA timeline configuration (3D X-drop with lateral sweep)", () => {
      const banner = document.createElement("h2");
      banner.textContent = "AVRASYA";
      document.body.appendChild(banner);

      const tl = animateTextA(banner, {
        duration: 1.0,
        x: "15rem",
        stagger: 0.05,
        paused: true,
      });

      expect(tl.paused()).toBe(true);
      expect(tl.duration()).toBeGreaterThan(1.0);

      const chars = banner.querySelectorAll<HTMLElement>(".split-char");
      expect(chars.length).toBe("AVRASYA".length);
      chars.forEach((c) => {
        expect(c.style.transformStyle).toBe("preserve-3d");
      });
    });

    it("verifies animateTextP timeline configuration (line-masked vertical rise)", () => {
      const p = document.createElement("p");
      p.textContent = "The pinnacle of architectural excellence.";
      document.body.appendChild(p);

      const tl = animateTextP(p, {
        duration: 1.4,
        stagger: 0.08,
        paused: true,
      });

      expect(tl.paused()).toBe(true);
      expect(tl.duration()).toBeGreaterThan(0);
      expect(p.querySelectorAll(".split-line-mask").length).toBeGreaterThanOrEqual(1);
    });

    it("verifies kinetic typography reduced-motion fallback produces simple opacity tweens without 3D rotations", () => {
      mockReducedMotion(true);

      const h1 = document.createElement("h1");
      h1.textContent = "REDUCED MOTION";
      document.body.appendChild(h1);

      const tl = animateTextH(h1, { paused: true });
      expect(tl.duration()).toBeGreaterThan(0);

      // Verify no preserve-3d styling was added to characters under reduced motion
      const chars = h1.querySelectorAll<HTMLElement>(".split-char");
      chars.forEach((c) => {
        expect(c.style.transformStyle).not.toBe("preserve-3d");
      });
    });
  });

  // =========================================================================
  // 3. Cinematic Polygon Masking Adversarial Tests
  // =========================================================================
  describe("3. Cinematic Polygon Clipping Mask (masking.ts)", () => {
    it("safely handles null or undefined container/image arguments without throwing", () => {
      const img = document.createElement("img");
      const container = document.createElement("div");

      // null container
      const tlNullContainer = animateSlide(null as any, img, { paused: true });
      expect(tlNullContainer).toBeInstanceOf(gsap.core.Timeline);
      expect(tlNullContainer.duration()).toBe(0);

      // null image
      const tlNullImage = animateSlide(container, null as any, { paused: true });
      expect(tlNullImage).toBeInstanceOf(gsap.core.Timeline);
      expect(tlNullImage.duration()).toBe(0);

      // null both
      const tlNullBoth = animateSlide(null as any, null as any, { paused: true });
      expect(tlNullBoth).toBeInstanceOf(gsap.core.Timeline);
      expect(tlNullBoth.duration()).toBe(0);
    });

    it("supports custom scaleStart, scaleEnd, xPercentStart, xPercentEnd and onComplete in reveal state", () => {
      const container = document.createElement("div");
      const img = document.createElement("img");
      container.appendChild(img);
      document.body.appendChild(container);

      let completeCalled = false;
      const tl = animateSlide(container, img, {
        duration: 1.8,
        delay: 0.3,
        scaleStart: 1.8,
        scaleEnd: 0.9,
        xPercentStart: 35,
        xPercentEnd: -5,
        paused: true,
        onComplete: () => {
          completeCalled = true;
        },
      });

      expect(tl.duration()).toBeCloseTo(2.4, 1);
      tl.progress(1);
      expect(completeCalled).toBe(true);
    });

    it("executes state='hide' wipe closing the polygon mask to left edge", () => {
      const container = document.createElement("div");
      const img = document.createElement("img");
      container.appendChild(img);
      document.body.appendChild(container);

      const tl = animateSlide(container, img, {
        duration: 0.9,
        state: "hide",
        scaleStart: 1.0,
        scaleEnd: 1.5,
        xPercentEnd: -30,
        paused: true,
      });

      expect(tl.duration()).toBeCloseTo(0.9, 1);
    });

    it("applies ScrollTrigger configuration directly onto the returned timeline", () => {
      const container = document.createElement("div");
      const img = document.createElement("img");
      container.appendChild(img);
      document.body.appendChild(container);

      const fakeTriggerConfig = {
        trigger: container,
        start: "top 80%",
        end: "bottom 20%",
        scrub: true,
      };

      const tl = animateSlide(container, img, {
        scrollTrigger: fakeTriggerConfig,
        paused: true,
      });

      expect(tl.vars.scrollTrigger).toBe(fakeTriggerConfig);
    });

    it("switches to simple opacity fade-in / fade-out under prefers-reduced-motion", () => {
      mockReducedMotion(true);

      const container = document.createElement("div");
      const img = document.createElement("img");
      container.appendChild(img);
      document.body.appendChild(container);

      // Reveal under reduced motion
      const tlReveal = animateSlide(container, img, { state: "reveal", paused: true });
      expect(tlReveal.duration()).toBe(0.2);

      // Hide under reduced motion
      const tlHide = animateSlide(container, img, { state: "hide", paused: true });
      expect(tlHide.duration()).toBe(0.2);
    });
  });

  // =========================================================================
  // 4. Magnetic Button Physics & Rolling Hovers Adversarial Tests
  // =========================================================================
  describe("4. Magnetic Physics & Rolling Nav Hovers (magnetic.ts)", () => {
    it("calculates correct displacement at container center, edges, and corners", () => {
      const btn = document.createElement("button");
      btn.innerHTML = `<span data-magnetic-inner>Inquire Now</span>`;
      btn.getBoundingClientRect = () => ({
        left: 200,
        top: 200,
        width: 100,
        height: 50,
        right: 300,
        bottom: 250,
        x: 200,
        y: 200,
        toJSON: () => {},
      });
      document.body.appendChild(btn);

      const cleanup = applyMagneticHover(btn, { strength: 0.5, innerStrength: 0.8 });

      // 1. Center of button: clientX = 250, clientY = 225 -> dx = 0, dy = 0
      btn.dispatchEvent(new MouseEvent("mousemove", { clientX: 250, clientY: 225, bubbles: true }));

      // 2. Top-left corner: clientX = 200, clientY = 200 -> dx = -50, dy = -25
      btn.dispatchEvent(new MouseEvent("mousemove", { clientX: 200, clientY: 200, bubbles: true }));

      // 3. Far outside: clientX = 500, clientY = 500 -> dx = 250, dy = 275
      btn.dispatchEvent(new MouseEvent("mousemove", { clientX: 500, clientY: 500, bubbles: true }));

      // 4. Mouseleave -> spring return to 0,0
      btn.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));

      cleanup();
    });

    it("survives extreme rapid bursts of 500 pointer movements without memory explosion or exception", () => {
      const btn = document.createElement("button");
      btn.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        width: 200,
        height: 60,
        right: 200,
        bottom: 60,
        x: 0,
        y: 0,
        toJSON: () => {},
      });
      document.body.appendChild(btn);

      const cleanup = applyMagneticHover(btn, 0.4);

      // Fire 500 erratic pointer moves
      for (let i = 0; i < 500; i++) {
        btn.dispatchEvent(
          new MouseEvent("mousemove", {
            clientX: Math.sin(i) * 300,
            clientY: Math.cos(i) * 300,
            bubbles: true,
          }),
        );
      }

      expect(() => {
        btn.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
        cleanup();
      }).not.toThrow();
    });

    it("safely operates when inner element is completely missing", () => {
      const bareBtn = document.createElement("button");
      bareBtn.textContent = "No Inner Span";
      bareBtn.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        width: 100,
        height: 40,
        right: 100,
        bottom: 40,
        x: 0,
        y: 0,
        toJSON: () => {},
      });
      document.body.appendChild(bareBtn);

      const cleanup = applyMagneticHover(bareBtn, 0.3);

      expect(() => {
        bareBtn.dispatchEvent(
          new MouseEvent("mousemove", { clientX: 50, clientY: 20, bubbles: true }),
        );
        bareBtn.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
        cleanup();
      }).not.toThrow();
    });

    it("no-ops immediately when prefers-reduced-motion is enabled", () => {
      mockReducedMotion(true);

      const btn = document.createElement("button");
      document.body.appendChild(btn);

      const addListenerSpy = vi.spyOn(btn, "addEventListener");
      const cleanup = applyMagneticHover(btn, 0.3);

      // No listeners should be attached
      expect(addListenerSpy).not.toHaveBeenCalled();
      expect(() => cleanup()).not.toThrow();
    });

    it("applyRollingNavHover handles rapid hover cycling and safely preserves spaces", () => {
      const link = document.createElement("a");
      link.textContent = "Exclusive Villas & Penthouses";
      document.body.appendChild(link);

      const cleanup = applyRollingNavHover(link);

      const topLayer = link.querySelector(".roll-primary");
      const bottomLayer = link.querySelector(".roll-secondary");
      expect(topLayer).not.toBeNull();
      expect(bottomLayer).not.toBeNull();

      // Cycle hover 20 times rapidly
      for (let i = 0; i < 20; i++) {
        fireEvent.mouseEnter(link);
        fireEvent.mouseLeave(link);
      }

      // Cleanup must restore original text
      cleanup();
      expect(link.textContent).toBe("Exclusive Villas & Penthouses");
    });

    it("applyRollingNavHover safely no-ops on empty text elements", () => {
      const emptyLink = document.createElement("a");
      emptyLink.textContent = "   ";
      document.body.appendChild(emptyLink);

      const cleanup = applyRollingNavHover(emptyLink);
      expect(linkHasRollLayer(emptyLink)).toBe(false);
      expect(() => cleanup()).not.toThrow();

      function linkHasRollLayer(el: HTMLElement) {
        return el.querySelector(".roll-primary") !== null;
      }
    });
  });

  // =========================================================================
  // 5. Memory Leak Prevention & GSAP Scoped Context
  // =========================================================================
  describe("5. Memory Leak Prevention & GSAP Scoped Context (context.ts)", () => {
    it("ensures createScopedContext isolates selectors strictly to the scoped element", () => {
      const containerA = document.createElement("div");
      containerA.id = "container-A";
      containerA.innerHTML = `<span class="target-badge">A</span>`;

      const containerB = document.createElement("div");
      containerB.id = "container-B";
      containerB.innerHTML = `<span class="target-badge">B</span>`;

      document.body.appendChild(containerA);
      document.body.appendChild(containerB);

      let animatedElements: Element[] = [];

      const { context, revert } = createScopedContext(containerA, () => {
        // Scoped selector inside context
        const scopedTargets = gsap.utils.toArray<HTMLElement>(".target-badge");
        animatedElements = scopedTargets;
      });

      // Target must ONLY find containerA's child, never containerB's child
      expect(animatedElements.length).toBe(1);
      expect(animatedElements[0]?.textContent).toBe("A");

      revert();
    });

    it("stress tests rapid mount/unmount cycles of useScopedGSAP and verifies all tweens/triggers are reverted", () => {
      let currentBoxElement: HTMLDivElement | null = null;

      function RapidCycleComponent({ id }: { id: number }) {
        const rootRef = useRef<HTMLDivElement>(null);

        useScopedGSAP(
          () => {
            if (rootRef.current) {
              currentBoxElement = rootRef.current;
              gsap.to(rootRef.current, { x: 100, duration: 10 });
              gsap.to(rootRef.current, { opacity: 0.5, duration: 10 });
            }
          },
          rootRef,
          [id],
        );

        return (
          <div ref={rootRef} data-testid={`box-${id}`}>
            Item {id}
          </div>
        );
      }

      // Render and unmount 25 times
      for (let i = 0; i < 25; i++) {
        const { unmount } = render(<RapidCycleComponent id={i} />);
        expect(currentBoxElement).not.toBeNull();
        expect(gsap.getTweensOf(currentBoxElement!).length).toBe(2);

        unmount();
        // Context revert must have killed all tweens
        expect(gsap.getTweensOf(currentBoxElement!).length).toBe(0);
      }
    });

    it("reverts prior context cleanly when useScopedGSAP dependencies change", () => {
      let executionCount = 0;
      let targetElement: HTMLDivElement | null = null;

      function DependencyWatcher({ filter }: { filter: string }) {
        const rootRef = useRef<HTMLDivElement>(null);

        useScopedGSAP(
          () => {
            executionCount++;
            if (rootRef.current) {
              targetElement = rootRef.current;
              gsap.to(rootRef.current, { x: 100, duration: 10 });
            }
          },
          rootRef,
          [filter],
        );

        return <div ref={rootRef}>Filter: {filter}</div>;
      }

      const { rerender, unmount } = render(<DependencyWatcher filter="istanbul" />);
      expect(executionCount).toBe(1);
      expect(targetElement).not.toBeNull();
      expect(gsap.getTweensOf(targetElement!).length).toBe(1);

      // Change dependency to 'bodrum' -> triggers effect cleanup (reverting prior tween) and runs new callback
      rerender(<DependencyWatcher filter="bodrum" />);
      expect(executionCount).toBe(2);
      // Exactly 1 active tween, not 2 accumulated!
      expect(gsap.getTweensOf(targetElement!).length).toBe(1);

      // Change dependency to 'antalya'
      rerender(<DependencyWatcher filter="antalya" />);
      expect(executionCount).toBe(3);
      expect(gsap.getTweensOf(targetElement!).length).toBe(1);

      unmount();
      // On unmount, all tweens are reverted and killed
      expect(gsap.getTweensOf(targetElement!).length).toBe(0);
    });

    it("safely handles null or undefined ref / scope without crashing", () => {
      expect(() => {
        createScopedContext(null, (ctx) => {
          gsap.to({}, { duration: 0.1 });
        });
      }).not.toThrow();

      function NullScopeComponent() {
        useScopedGSAP((ctx) => {
          gsap.to({}, { duration: 0.1 });
        }, null);
        return <div>Null Scope</div>;
      }

      const { unmount } = render(<NullScopeComponent />);
      expect(() => unmount()).not.toThrow();
    });
  });

  // =========================================================================
  // 6. Transitions Module Re-Export Verification
  // =========================================================================
  describe("6. Transitions Module Contract Verification", () => {
    it("re-exports all kinetic typography and masking functions seamlessly", () => {
      expect(typeof transTextH).toBe("function");
      expect(typeof transTextA).toBe("function");
      expect(typeof transTextP).toBe("function");
      expect(typeof transSlide).toBe("function");
    });
  });
});
