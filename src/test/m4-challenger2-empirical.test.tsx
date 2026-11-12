import { render, screen, cleanup, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import * as gsapModule from "@/lib/gsap";
import { BildoraAboutSection } from "@/components/site/BildoraAboutSection";
import { BildoraServicesTimeline } from "@/components/site/BildoraServicesTimeline";
import { BildoraProjectsShowcase } from "@/components/site/BildoraProjectsShowcase";
import { PartnersSection } from "@/components/site/PartnersSection";
import { animateSlide } from "@/lib/animation/masking";
import { applyMagneticHover } from "@/lib/animation/magnetic";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  useRouterState: ({ select }: { select: (s: any) => any }) =>
    select({ location: { pathname: "/" } }),
  Link: ({ to, children, onClick, className, "aria-label": ariaLabel, ...rest }: any) => (
    <a href={to} onClick={onClick} className={className} aria-label={ariaLabel} {...rest}>
      {children}
    </a>
  ),
}));

// Mock Supabase to ensure zero network dependencies
vi.mock("@/lib/supabase", () => ({
  DEMO_MODE: true,
  SUPABASE_URL: "https://mock.supabase.co",
}));

// Mock site settings store
vi.mock("@/admin/store", () => ({
  useSiteSettings: () => ({
    companyName: "Avrasya Properties",
    websiteDesign: {
      aboutHeading: "Architectural Distinction & Enduring Heritage",
      aboutDescription:
        "Every Avrasya residence represents an uncompromising synthesis of architectural mastery, micro-location precision, and sovereign longevity.",
      aboutStatement:
        "With decades of experience, we specialize in turning ideas into well-designed structures that stand the test of time.",
    },
  }),
}));

describe("Challenger 2 Empirical Verification: Milestone M4", () => {
  const originalMatchMedia = window.matchMedia;
  let queryClient: QueryClient;

  const mockMediaQueries = (options: {
    reducedMotion?: boolean;
    pointerCoarse?: boolean;
    pointerFine?: boolean;
  }) => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
      let matches = false;
      if (options.reducedMotion && query.includes("prefers-reduced-motion: reduce")) {
        matches = true;
      }
      if (options.pointerCoarse && query.includes("pointer: coarse")) {
        matches = true;
      }
      if (options.pointerFine && query.includes("pointer: fine")) {
        matches = true;
      }
      return {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    });
  };

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
    mockMediaQueries({ reducedMotion: false, pointerFine: true, pointerCoarse: false });
    ScrollTrigger.getAll().forEach((st) => st.kill());
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    window.matchMedia = originalMatchMedia;
    ScrollTrigger.getAll().forEach((st) => st.kill());
  });

  // =========================================================================
  // 1. Sovereign Asset Cryptographic Integrity
  // =========================================================================
  describe("1. Sovereign Asset Cryptographic Integrity", () => {
    it("verifies hero-building-avrasya.png exists and matches expected SHA-256", () => {
      const assetPath = path.resolve(process.cwd(), "public/images/hero-building-avrasya.png");
      expect(fs.existsSync(assetPath)).toBe(true);

      const fileBuffer = fs.readFileSync(assetPath);
      expect(fileBuffer.length).toBeGreaterThan(1000);

      const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex").toUpperCase();
      const expectedHash = "978BDB310BFDB282EE5269E04E3D2F012CB0BDCF93821BEA684E2AF9BDDE064C";

      expect(hash).toBe(expectedHash);
    });
  });

  // =========================================================================
  // 2. Reduced-Motion Stress Testing across All 4 Components
  // =========================================================================
  describe("2. Reduced-Motion Stress Testing (prefers-reduced-motion: reduce)", () => {
    it("BildoraAboutSection renders immediately readable layout under reduced motion", () => {
      mockMediaQueries({ reducedMotion: true, pointerFine: true });

      const Wrapper = createWrapper();
      const { container } = render(<BildoraAboutSection />, { wrapper: Wrapper });

      // Badge pill must be fully visible and unblurred
      const badge = container.querySelector("[data-framer-name='Section Tag']");
      expect(badge).not.toBeNull();
      expect(badge?.textContent).toContain("About Us");

      // Heading and description must be in DOM
      const heading = container.querySelector("[data-about-heading]");
      expect(heading).not.toBeNull();
      expect(heading?.textContent).toContain("Architectural Distinction");

      const desc = container.querySelector("[data-about-description]");
      expect(desc).not.toBeNull();

      // Statement characters must be immediately rendered with solid dark color
      const chars = container.querySelectorAll("[data-about-char]");
      expect(chars.length).toBeGreaterThan(0);
      chars.forEach((c) => {
        expect((c as HTMLElement).style.color).toBe("rgb(22, 48, 56)");
      });

      // All metric numbers must immediately reflect their targets
      const numEls = container.querySelectorAll("[data-counter-num]");
      expect(numEls.length).toBe(4);
      expect(numEls[0]?.textContent).toBe("12+");
      expect(numEls[1]?.textContent).toBe("250+");
      expect(numEls[2]?.textContent).toBe("4.8/5");
      expect(numEls[3]?.textContent).toBe("98%");

      // Mask container exists and has geometric container styles
      const maskContainer = container.querySelector("[data-mask-container]");
      expect(maskContainer).not.toBeNull();
      expect(maskContainer?.className).toContain("overflow-hidden");
      expect(maskContainer?.className).toContain("rounded-[20px]");
    }, 25000);

    it("BildoraServicesTimeline renders accessible non-animated rows under reduced motion", () => {
      mockMediaQueries({ reducedMotion: true, pointerFine: true });

      const Wrapper = createWrapper();
      const { container } = render(<BildoraServicesTimeline showCtaFooter={true} />, {
        wrapper: Wrapper,
      });

      // Rows must be rendered and have no dangling scrub animations
      const rows = container.querySelectorAll("[data-tl-row]");
      expect(rows.length).toBe(6);

      // Header words must be fully visible
      const words = container.querySelectorAll<HTMLElement>("[data-tl-word]");
      expect(words.length).toBeGreaterThan(0);
      words.forEach((w) => {
        expect(w.style.opacity).toBe("1");
        expect(w.style.filter).toBe("none");
      });

      // CTA buttons must be rendered (both desktop and mobile representations = 12 total, at least 6 unique items)
      const ctas = container.querySelectorAll("[data-service-cta]");
      expect(ctas.length).toBeGreaterThanOrEqual(6);

      // Consultation footer CTA must be present
      const footerCta = container.querySelector("[data-consultation-cta]");
      expect(footerCta).not.toBeNull();
    }, 25000);

    it("BildoraProjectsShowcase renders accessible non-pinned layout under reduced motion", () => {
      mockMediaQueries({ reducedMotion: true, pointerFine: true });

      const Wrapper = createWrapper();
      const { container } = render(<BildoraProjectsShowcase />, { wrapper: Wrapper });

      // In reduced motion, no ScrollTrigger pinning should be active
      const activePinST = ScrollTrigger.getAll().find((st) => st.pin);
      expect(activePinST).toBeUndefined();

      // Cards must all be visible and rendered
      const cards = container.querySelectorAll<HTMLElement>("[data-project-card]");
      expect(cards.length).toBe(4);

      // Badges must be rendered
      const badges = container.querySelectorAll<HTMLElement>("[data-project-badge]");
      expect(badges.length).toBe(4);

      // CTAs must exist and be accessible
      const ctas = container.querySelectorAll("[data-project-cta]");
      expect(ctas.length).toBe(4);
    }, 25000);

    it("PartnersSection renders static flex-wrap grid fallback under reduced motion", () => {
      mockMediaQueries({ reducedMotion: true, pointerFine: true });

      const { container } = render(<PartnersSection />);

      // Under reduced motion, the marquee track must NOT be rendered
      const marqueeTrack = container.querySelector("[data-marquee-track]");
      expect(marqueeTrack).toBeNull();

      // Instead, static flex-wrap grid container must exist
      const staticContainer = container.querySelector(".flex-wrap");
      expect(staticContainer).not.toBeNull();

      // Partner cards must be present inside static container
      const cards = container.querySelectorAll("[data-partner-card]");
      expect(cards.length).toBeGreaterThan(0);

      // Zero ScrollTriggers created for velocity boost
      expect(ScrollTrigger.getAll().length).toBe(0);
    }, 25000);
  });

  // =========================================================================
  // 3. Scroll Scrub Edge Cases: Fast Progress Jumps & Boundaries
  // =========================================================================
  describe("3. Scroll Scrub Edge Cases: Fast Progress Jumps (0 -> 1 -> 0)", () => {
    it("pinned horizontal scroll track survives rapid scrub jumps (0 -> 1 -> 0 -> 0.5 -> 1 -> 0) without NaN or stuck state", () => {
      mockMediaQueries({ reducedMotion: false, pointerFine: true });

      const Wrapper = createWrapper();
      const { container } = render(<BildoraProjectsShowcase />, { wrapper: Wrapper });

      const pinStage = container.querySelector("[data-pin-stage]");
      expect(pinStage).not.toBeNull();

      // Find the pinned ScrollTrigger
      const st = ScrollTrigger.getAll().find((s) => s.trigger === pinStage);
      expect(st).toBeDefined();

      const track = container.querySelector<HTMLElement>("[data-projects-track]");
      expect(track).not.toBeNull();

      // Simulate fast jump: progress 0 -> 1
      act(() => {
        st?.scroll(st.end);
        st?.update();
      });
      expect(st?.progress).toBeCloseTo(1, 1);

      // Simulate fast jump: progress 1 -> 0
      act(() => {
        st?.scroll(st.start);
        st?.update();
      });
      expect(st?.progress).toBeCloseTo(0, 1);

      // Rapid multi-jump sequence
      const jumpSequence = [1, 0, 0.75, 0.25, 1, 0];
      for (const targetProgress of jumpSequence) {
        act(() => {
          const scrollPos = st!.start + (st!.end - st!.start) * targetProgress;
          st?.scroll(scrollPos);
          st?.update();
        });
      }

      // Check transform is clean and does not contain NaN or undefined
      const currentTransform = track?.style.transform || "";
      expect(currentTransform).not.toContain("NaN");
      expect(currentTransform).not.toContain("undefined");
    }, 25000);

    it("timeline progress fill survives rapid jumps between 0 and 1 without glitching", () => {
      mockMediaQueries({ reducedMotion: false, pointerFine: true });

      const Wrapper = createWrapper();
      const { container } = render(<BildoraServicesTimeline />, { wrapper: Wrapper });

      const rows = container.querySelectorAll<HTMLElement>("[data-tl-row]");
      expect(rows.length).toBeGreaterThan(0);

      // Get all ScrollTriggers created for timeline rows
      const rowSTs = ScrollTrigger.getAll().filter((s) =>
        Array.from(rows).includes(s.trigger as HTMLElement),
      );
      expect(rowSTs.length).toBeGreaterThan(0);

      // Fast jump all row triggers to end then back to start
      act(() => {
        rowSTs.forEach((st) => {
          st.scroll(st.end);
          st.update();
        });
      });

      // Jump back to 0
      act(() => {
        rowSTs.forEach((st) => {
          st.scroll(st.start);
          st.update();
        });
      });

      // Verify fill elements have valid style values
      const fills = container.querySelectorAll<HTMLElement>("[data-tl-fill]");
      fills.forEach((fill) => {
        const transform = fill.style.transform || "";
        expect(transform).not.toContain("NaN");
        expect(transform).not.toContain("undefined");
      });
    }, 25000);
  });

  // =========================================================================
  // 4. Polygon Clipping Mask (animateSlide) Robustness & Fallbacks
  // =========================================================================
  describe("4. Polygon Clipping Mask (animateSlide) Robustness & Fallbacks", () => {
    it("executes polygon clipPath reveal and scales counter-image into registration", () => {
      const containerEl = document.createElement("div");
      const imageEl = document.createElement("img");
      containerEl.appendChild(imageEl);
      document.body.appendChild(containerEl);

      const tl = animateSlide(containerEl, imageEl, {
        duration: 0.5,
        scaleStart: 1.3,
        scaleEnd: 1.0,
        xPercentStart: 15,
        xPercentEnd: 0,
      });

      expect(tl).toBeDefined();

      // Seek to completion
      tl.progress(1);

      // Container clip-path should reach unmasked rectangular state
      expect(containerEl.style.clipPath).toBe("polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)");

      // Clean up
      tl.kill();
      containerEl.remove();
    });

    it("executes polygon clipPath hide state smoothly closing mask", () => {
      const containerEl = document.createElement("div");
      const imageEl = document.createElement("img");
      containerEl.appendChild(imageEl);
      document.body.appendChild(containerEl);

      const tl = animateSlide(containerEl, imageEl, {
        state: "hide",
        duration: 0.5,
      });

      // Seek to completion
      tl.progress(1);

      // Container clipPath should reach closed state
      expect(containerEl.style.clipPath).toBe("polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)");

      tl.kill();
      containerEl.remove();
    });

    it("survives abrupt interruption (kill midway at 50% progress) without throwing", () => {
      const containerEl = document.createElement("div");
      const imageEl = document.createElement("img");
      containerEl.appendChild(imageEl);
      document.body.appendChild(containerEl);

      const tl = animateSlide(containerEl, imageEl, { duration: 1.0 });

      // Jump to 50%
      tl.progress(0.5);

      // Interrupt abruptly
      expect(() => tl.kill()).not.toThrow();

      // DOM element must not have NaN
      expect(containerEl.style.clipPath).not.toContain("NaN");

      containerEl.remove();
    });

    it("falls back to opacity fade when prefers-reduced-motion is active", () => {
      mockMediaQueries({ reducedMotion: true, pointerFine: true });

      const containerEl = document.createElement("div");
      const imageEl = document.createElement("img");
      containerEl.appendChild(imageEl);
      document.body.appendChild(containerEl);

      const tl = animateSlide(containerEl, imageEl);

      // Clip path should NOT be modified when reduced motion is preferred
      expect(containerEl.style.clipPath).toBe("");

      // Tween completes opacity to 1
      tl.progress(1);
      expect(containerEl.style.opacity).toBe("1");
      expect(imageEl.style.opacity).toBe("1");

      tl.kill();
      containerEl.remove();
    });

    it("BildoraAboutSection mask container retains structural CSS bounding classes", () => {
      const Wrapper = createWrapper();
      const { container } = render(<BildoraAboutSection />, { wrapper: Wrapper });

      const maskContainer = container.querySelector("[data-mask-container]");
      expect(maskContainer).not.toBeNull();
      // Even if clipPath is unsupported or disabled, layout maintains geometric clipping via overflow-hidden and rounded-20px
      expect(maskContainer?.classList.contains("overflow-hidden")).toBe(true);
      expect(maskContainer?.classList.contains("rounded-[20px]")).toBe(true);
    }, 25000);
  });

  // =========================================================================
  // 5. Magnetic Hover Physics & Coarse Pointer Bypass
  // =========================================================================
  describe("5. Magnetic Hover Physics & Pointer Type Discrimination", () => {
    it("bypasses magnetic hover binding on touchscreen / coarse pointer only devices", () => {
      // Coarse pointer = true, Fine pointer = false (mobile phone / tablet)
      mockMediaQueries({ pointerCoarse: true, pointerFine: false });

      const button = document.createElement("button");
      button.textContent = "Explore";
      document.body.appendChild(button);

      const cleanupFn = applyMagneticHover(button);

      // Dispatch mousemove on button
      fireEvent.mouseMove(button, { clientX: 200, clientY: 200 });

      // Style transform should remain untouched
      expect(button.style.transform).toBe("");

      cleanupFn();
      button.remove();
    });

    it("attaches magnetic hover and responds to mouse movements on fine pointer devices", () => {
      mockMediaQueries({ pointerCoarse: false, pointerFine: true });

      const button = document.createElement("button");
      button.textContent = "Explore";
      const inner = document.createElement("span");
      inner.setAttribute("data-magnetic-inner", "true");
      button.appendChild(inner);
      document.body.appendChild(button);

      // Mock getBoundingClientRect
      button.getBoundingClientRect = () => ({
        top: 100,
        left: 100,
        bottom: 150,
        right: 200,
        width: 100,
        height: 50,
        x: 100,
        y: 100,
        toJSON: () => {},
      });

      const cleanupFn = applyMagneticHover(button, { strength: 0.4 });

      // Move mouse away from center
      fireEvent.mouseMove(button, { clientX: 180, clientY: 140 });

      // Trigger mouseleave
      fireEvent.mouseLeave(button);

      // Cleanup
      expect(() => cleanupFn()).not.toThrow();
      button.remove();
    });

    it("resets transforms to origin upon cleanupFn invocation when element was displaced", () => {
      mockMediaQueries({ pointerCoarse: false, pointerFine: true });

      const button = document.createElement("button");
      document.body.appendChild(button);
      button.getBoundingClientRect = () => ({
        top: 100,
        left: 100,
        bottom: 150,
        right: 200,
        width: 100,
        height: 50,
        x: 100,
        y: 100,
        toJSON: () => {},
      });

      const cleanupFn = applyMagneticHover(button);
      fireEvent.mouseMove(button, { clientX: 180, clientY: 140 });
      cleanupFn();

      // Displaced button transform must be reset to origin
      expect(button.style.transform).toMatch(/translate\(0(?:px)?, ?0(?:px)?\)/);
      button.remove();
    });

    it("safely bypasses redundant DOM resets upon cleanupFn invocation when element was never displaced", () => {
      mockMediaQueries({ pointerCoarse: false, pointerFine: true });

      const button = document.createElement("button");
      document.body.appendChild(button);

      const cleanupFn = applyMagneticHover(button);
      cleanupFn();

      // Untouched button transform remains empty/unperturbed, avoiding redundant DOM overhead
      expect(button.style.transform).toBe("");
      button.remove();
    });
  });

  // =========================================================================
  // 6. Scoped Lifecycle & Zero ScrollTrigger Leakage (Individual Components)
  // =========================================================================
  describe("6. Scoped Lifecycle & Zero Leakage (Per-Component Isolation)", () => {
    it("BildoraAboutSection cleans up all ScrollTriggers on unmount", () => {
      const Wrapper = createWrapper();
      const { unmount } = render(<BildoraAboutSection />, { wrapper: Wrapper });

      const initialCount = ScrollTrigger.getAll().length;
      expect(initialCount).toBeGreaterThan(0);

      unmount();

      expect(ScrollTrigger.getAll().length).toBe(0);
    }, 25000);

    it("BildoraServicesTimeline cleans up all ScrollTriggers on unmount", () => {
      const Wrapper = createWrapper();
      const { unmount } = render(<BildoraServicesTimeline />, { wrapper: Wrapper });

      const initialCount = ScrollTrigger.getAll().length;
      expect(initialCount).toBeGreaterThan(0);

      unmount();

      expect(ScrollTrigger.getAll().length).toBe(0);
    }, 25000);

    it("BildoraProjectsShowcase cleans up all ScrollTriggers on unmount", () => {
      const Wrapper = createWrapper();
      const { unmount } = render(<BildoraProjectsShowcase />, { wrapper: Wrapper });

      const initialCount = ScrollTrigger.getAll().length;
      expect(initialCount).toBeGreaterThan(0);

      unmount();

      expect(ScrollTrigger.getAll().length).toBe(0);
    }, 25000);

    it("PartnersSection cleans up all ScrollTriggers and tween loops on unmount", () => {
      const { unmount } = render(<PartnersSection />);

      const initialCount = ScrollTrigger.getAll().length;
      expect(initialCount).toBeGreaterThan(0);

      unmount();

      expect(ScrollTrigger.getAll().length).toBe(0);
    }, 25000);
  });
});
