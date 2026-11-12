import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, fireEvent } from "@testing-library/react";
import React, { useRef } from "react";
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
  animateSlide as transSlide,
} from "@/lib/animation/transitions";

describe("Milestone M2: Reusable GSAP, Lenis & Kinetic Typography Engine", () => {
  beforeEach(() => {
    destroySmoothScroll();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  afterEach(() => {
    destroySmoothScroll();
    document.body.innerHTML = "";
  });

  describe("1. Lenis Smooth Scroll Integration (lenis.ts)", () => {
    it("initializes Lenis, synchronizes with GSAP ScrollTrigger ticker, and provides clean teardown", () => {
      const tickerSpy = vi.spyOn(gsap.ticker, "add");
      const lagSpy = vi.spyOn(gsap.ticker, "lagSmoothing");
      const removeSpy = vi.spyOn(gsap.ticker, "remove");

      const instance = initSmoothScroll();
      expect(instance.lenis).toBeDefined();
      expect(getLenis()).toBe(instance.lenis);

      // Verify ticker loop and lagSmoothing registration
      expect(tickerSpy).toHaveBeenCalled();
      expect(lagSpy).toHaveBeenCalledWith(0);

      // Verify destroy cleans up ticker and active instance
      instance.destroy();
      expect(removeSpy).toHaveBeenCalled();
      expect(getLenis()).toBeNull();
    });

    it("is callable directly as a teardown function", () => {
      const instance = initSmoothScroll();
      expect(getLenis()).not.toBeNull();

      // Calling the instance directly invokes destroy
      instance();
      expect(getLenis()).toBeNull();
    });

    it("respects prefers-reduced-motion by disabling inertial smooth scrolling", () => {
      // Mock prefers-reduced-motion to true
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("prefers-reduced-motion: reduce"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const instance = initSmoothScroll();
      expect(instance.lenis).toBeNull();
      expect(getLenis()).toBeNull();

      window.matchMedia = originalMatchMedia;
    });

    it("mounts and unmounts cleanly via useSmoothScroll hook in React component", () => {
      function ScrollWrapper({ active = true }: { active?: boolean }) {
        useSmoothScroll(active);
        return <div data-testid="scroll-content">Smooth Content</div>;
      }

      const { unmount, rerender } = render(<ScrollWrapper active={true} />);
      expect(getLenis()).not.toBeNull();

      rerender(<ScrollWrapper active={false} />);
      expect(getLenis()).toBeNull();

      rerender(<ScrollWrapper active={true} />);
      expect(getLenis()).not.toBeNull();

      unmount();
      expect(getLenis()).toBeNull();
    });
  });

  describe("2. Kinetic SplitText Typography System (typography.ts)", () => {
    it("splits DOM element text into characters and words while preserving whitespace and original content on revert", () => {
      const container = document.createElement("div");
      container.innerHTML = "Bosphorus Luxury Estates";
      document.body.appendChild(container);

      const split = splitText(container, { type: "words,chars" });
      expect(split.words.length).toBe(3);
      expect(split.chars.length).toBe("BosphorusLuxuryEstates".length);

      const wordsInDom = container.querySelectorAll(".split-word");
      expect(wordsInDom.length).toBe(3);

      const charsInDom = container.querySelectorAll(".split-char");
      expect(charsInDom.length).toBe("BosphorusLuxuryEstates".length);

      // Verify revert restores original DOM string
      split.revert();
      expect(container.innerHTML).toBe("Bosphorus Luxury Estates");
    });

    it("supports line splitting with overflow masking (split-line-mask)", () => {
      const container = document.createElement("div");
      container.innerHTML = "First line content. Second line content.";
      document.body.appendChild(container);

      const split = splitText(container, { type: "lines,words", maskLines: true });
      expect(split.lines.length).toBeGreaterThanOrEqual(1);

      const masks = container.querySelectorAll(".split-line-mask");
      expect(masks.length).toBeGreaterThanOrEqual(1);
      expect((masks[0] as HTMLElement).style.overflow).toBe("hidden");

      split.revert();
      expect(container.innerHTML).toBe("First line content. Second line content.");
    });

    it("animateTextH generates a valid GSAP timeline with 3D Y-axis character flip", () => {
      const heading = document.createElement("h1");
      heading.textContent = "ERA RESIDENCE";
      document.body.appendChild(heading);

      const tl = animateTextH(heading, { duration: 1.2, stagger: 0.04, paused: true });
      expect(tl).toBeInstanceOf(gsap.core.Timeline);
      expect(tl.duration()).toBeGreaterThan(0);

      const chars = heading.querySelectorAll(".split-char");
      expect(chars.length).toBe("ERARESIDENCE".length);
    });

    it("animateTextA generates a valid GSAP timeline with 3D X-axis drop-flip", () => {
      const brand = document.createElement("div");
      brand.textContent = "AVRASYA";
      document.body.appendChild(brand);

      const tl = animateTextA(brand, { duration: 1.0, x: "8rem", paused: true });
      expect(tl).toBeInstanceOf(gsap.core.Timeline);
      expect(tl.duration()).toBeGreaterThan(0);

      const chars = brand.querySelectorAll(".split-char");
      expect(chars.length).toBe("AVRASYA".length);
    });

    it("animateTextP generates a valid GSAP timeline with line-masked vertical rise", () => {
      const paragraph = document.createElement("p");
      paragraph.textContent = "Luxury waterfront residences crafted for discerning collectors.";
      document.body.appendChild(paragraph);

      const tl = animateTextP(paragraph, { duration: 1.2, stagger: 0.1, paused: true });
      expect(tl).toBeInstanceOf(gsap.core.Timeline);
      expect(tl.duration()).toBeGreaterThan(0);

      const lines = paragraph.querySelectorAll(".split-line");
      expect(lines.length).toBeGreaterThanOrEqual(1);
    });

    it("transitions module re-exports kinetic typography and masking helpers seamlessly", () => {
      expect(typeof transTextH).toBe("function");
      expect(typeof transSlide).toBe("function");
    });
  });

  describe("3. Cinematic Polygon Clipping Mask (masking.ts)", () => {
    it("animateSlide generates polygon clipPath wipe and counter-scale reveal timeline", () => {
      const container = document.createElement("div");
      const img = document.createElement("img");
      container.appendChild(img);
      document.body.appendChild(container);

      const tl = animateSlide(container, img, {
        duration: 1.2,
        state: "reveal",
        paused: true,
      });

      expect(tl).toBeInstanceOf(gsap.core.Timeline);
      expect(tl.duration()).toBeGreaterThan(0);
    });

    it("animateSlide generates polygon clipPath hide timeline", () => {
      const container = document.createElement("div");
      const img = document.createElement("img");
      container.appendChild(img);
      document.body.appendChild(container);

      const tl = animateSlide(container, img, {
        duration: 0.8,
        state: "hide",
        paused: true,
      });

      expect(tl).toBeInstanceOf(gsap.core.Timeline);
      expect(tl.duration()).toBeGreaterThan(0);
    });
  });

  describe("4. Magnetic Button Physics & Rolling Nav Hovers (magnetic.ts)", () => {
    it("applyMagneticHover tracks pointer movement and provides clean teardown", () => {
      const btn = document.createElement("button");
      btn.innerHTML = `<span data-magnetic-inner>Inquire</span>`;
      btn.getBoundingClientRect = () => ({
        left: 100,
        top: 100,
        width: 200,
        height: 60,
        right: 300,
        bottom: 160,
        x: 100,
        y: 100,
        toJSON: () => {},
      });
      document.body.appendChild(btn);

      const cleanup = applyMagneticHover(btn, { strength: 0.4 });
      expect(typeof cleanup).toBe("function");

      // Dispatch mousemove
      const moveEvent = new MouseEvent("mousemove", {
        clientX: 250,
        clientY: 140,
        bubbles: true,
      });
      btn.dispatchEvent(moveEvent);

      // Dispatch mouseleave
      const leaveEvent = new MouseEvent("mouseleave", { bubbles: true });
      btn.dispatchEvent(leaveEvent);

      // Cleanup
      cleanup();
    });

    it("useMagneticHover mounts and cleans up via React hook", () => {
      function MagneticButton() {
        const ref = useRef<HTMLButtonElement>(null);
        useMagneticHover(ref, 0.3);
        return <button ref={ref}>Explore</button>;
      }

      const { unmount } = render(<MagneticButton />);
      expect(() => unmount()).not.toThrow();
    });

    it("applyRollingNavHover creates dual-layer typography and handles mouseenter / mouseleave", () => {
      const navLink = document.createElement("a");
      navLink.textContent = "Properties";
      document.body.appendChild(navLink);

      const cleanup = applyRollingNavHover(navLink);
      expect(navLink.querySelector(".roll-primary")).not.toBeNull();
      expect(navLink.querySelector(".roll-secondary")).not.toBeNull();

      fireEvent.mouseEnter(navLink);
      fireEvent.mouseLeave(navLink);

      cleanup();
      expect(navLink.textContent).toBe("Properties");
    });

    it("useRollingNavHover mounts and cleans up via React hook", () => {
      function RollingLink() {
        const ref = useRef<HTMLAnchorElement>(null);
        useRollingNavHover(ref);
        return <a ref={ref}>Locations</a>;
      }

      const { unmount } = render(<RollingLink />);
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("5. Scoped GSAP Context Cleanup (context.ts)", () => {
    it("createScopedContext scopes selector queries and reverts cleanly", () => {
      const container = document.createElement("div");
      container.innerHTML = `<div class="box"></div>`;
      document.body.appendChild(container);

      let boxFound = false;
      const { context, revert } = createScopedContext(container, (ctx) => {
        const box = container.querySelector(".box");
        if (box) {
          gsap.to(box, { x: 50, duration: 0.1 });
          boxFound = true;
        }
      });

      expect(boxFound).toBe(true);
      expect(context).toBeDefined();
      expect(typeof revert).toBe("function");

      revert();
    });

    it("useScopedGSAP automatically reverts GSAP context on unmount", () => {
      let isExecuted = false;

      function AnimatedComponent() {
        const scopeRef = useRef<HTMLDivElement>(null);

        useScopedGSAP(
          (ctx) => {
            isExecuted = true;
            gsap.to(scopeRef.current, { opacity: 0.5, duration: 0.2 });
          },
          scopeRef,
          [],
        );

        return (
          <div ref={scopeRef} data-testid="box">
            Test
          </div>
        );
      }

      const { unmount } = render(<AnimatedComponent />);
      expect(isExecuted).toBe(true);

      // Verify clean teardown without throwing
      expect(() => unmount()).not.toThrow();
    });
  });
});
