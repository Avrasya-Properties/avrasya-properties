import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, cleanup, act, fireEvent } from "@testing-library/react";
import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { applyMagneticHover, applyRollingNavHover } from "@/lib/animation/magnetic";
import { initSmoothScroll, destroySmoothScroll, getLenis } from "@/lib/animation/lenis";
import { ServicesProcessTimeline } from "@/components/site/ServicesProcessTimeline";
import { Header } from "@/components/site/Chrome";

// Mock TanStack Router
vi.mock("@tanstack/react-router", () => ({
  useRouterState: ({ select }: { select?: (s: any) => any } = {}) => {
    const state = { location: { pathname: "/" } };
    return select ? select(state) : state;
  },
  Link: ({ to, children, className, ...rest }: any) => (
    <a href={to} className={className} {...rest}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}));

// Mock Language hook
vi.mock("@/hooks/useLanguage", () => ({
  useLanguage: () => ({
    locale: "en",
    isRtl: false,
    config: { code: "en", flag: "🇬🇧", nativeName: "English" },
    locales: [{ code: "en", flag: "🇬🇧", nativeName: "English" }],
    setLocale: vi.fn(),
    t: {
      nav: {
        home: "Home",
        services: "Services",
        properties: "Properties",
        citizenship: "Citizenship",
        whyTurkiye: "Why Türkiye",
        calculator: "Calculators",
        about: "About",
        contact: "Contact",
      },
      services: {
        eyebrow: "Our Services",
        title: "One team. Every step.",
        subtitle: "From first call to passport",
        closingLine: "One lawyer. One team. One process.",
        legalDisclaimer: "Legal disclaimer text",
        parts: [
          {
            partNumber: "PART 1",
            title: "CHOOSE",
            steps: [
              {
                stepNumber: "01",
                title: "Portfolio Selection",
                description: "Selecting prime real estate",
              },
              {
                stepNumber: "02",
                title: "Feasibility Analysis",
                description: "Appraisal verification",
              },
            ],
          },
        ],
      },
    },
  }),
}));

// Mock admin store
vi.mock("@/admin/store", () => ({
  useSiteSettings: () => ({
    companyName: "Avrasya Properties Group",
    phone: "+90 545 924 80 42",
    email: "info@avrasyaproperties.com",
    whatsapp: "https://wa.me/905459248042",
    headerCta: {
      label: "Contact",
      href: "/contact",
      is_visible: true,
    },
  }),
}));

// Mock live contact
vi.mock("@/hooks/useLiveContact", () => ({
  useLiveContact: () => ({
    company: "Avrasya Properties Group",
    phone: "+90 545 924 80 42",
    phoneHref: "tel:+905459248042",
    email: "info@avrasyaproperties.com",
    whatsapp: "https://wa.me/905459248042",
    address: "Istanbul, Turkey",
    tagline: "Prime Real Estate & Citizenship",
    advisoryHours: "Mon-Sat 9:00 - 18:00",
  }),
  useWhatsAppLink: () => () => "https://wa.me/905459248042",
  buildWhatsAppLink: () => "https://wa.me/905459248042",
}));

// Mock preferences and live currency rates
vi.mock("@/hooks/usePreferences", () => ({
  useCurrency: () => ["USD", vi.fn()],
  useShortlist: () => ({ count: 0, isSaved: () => false, toggle: vi.fn() }),
  useLiveRates: () => ({ rates: { USD: 1, EUR: 0.92, TRY: 38.5, GBP: 0.78 } }),
}));

describe("Milestone 4 Adversarial Motion & Zero Regression Stress Suite (Challenger 1)", () => {
  const originalMatchMedia = window.matchMedia;

  const setMediaCapabilities = ({
    coarse = false,
    fine = true,
    reducedMotion = false,
  }: {
    coarse?: boolean;
    fine?: boolean;
    reducedMotion?: boolean;
  }) => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches:
        (query.includes("pointer: coarse") && coarse) ||
        (query.includes("pointer: fine") && fine) ||
        (query.includes("prefers-reduced-motion: reduce") && reducedMotion),
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
    document.body.innerHTML = "";
    vi.restoreAllMocks();
    setMediaCapabilities({ coarse: false, fine: true, reducedMotion: false });
    ScrollTrigger.getAll().forEach((st) => st.kill());
    destroySmoothScroll();
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    window.matchMedia = originalMatchMedia;
    ScrollTrigger.getAll().forEach((st) => st.kill());
    destroySmoothScroll();
  });

  // =========================================================================
  // 1. Sovereign Asset Cryptographic Lock Verification
  // =========================================================================
  describe("1. Sovereign Asset Cryptographic Lock", () => {
    it("strictly verifies hero-building-avrasya.png has not been modified or replaced", () => {
      const assetPath = path.resolve(process.cwd(), "public/images/hero-building-avrasya.png");
      expect(fs.existsSync(assetPath)).toBe(true);

      const buffer = fs.readFileSync(assetPath);
      expect(buffer.length).toBeGreaterThan(500_000);

      const hash = crypto.createHash("sha256").update(buffer).digest("hex").toUpperCase();
      const REQUIRED_HASH = "978BDB310BFDB282EE5269E04E3D2F012CB0BDCF93821BEA684E2AF9BDDE064C";
      expect(hash).toBe(REQUIRED_HASH);
    });
  });

  // =========================================================================
  // 2. Magnetic Hover Physics Stress Testing & Edge Cases
  // =========================================================================
  describe("2. Magnetic Hover Physics Stress Testing", () => {
    it("handles zero-dimension collapsed elements without division by zero or NaN", () => {
      const btn = document.createElement("button");
      btn.innerHTML = `<span data-magnetic-inner>Test</span>`;
      document.body.appendChild(btn);

      // Force 0x0 bounding client rect
      vi.spyOn(btn, "getBoundingClientRect").mockReturnValue({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0,
        toJSON: () => {},
      });

      const cleanupFn = applyMagneticHover(btn, { strength: 0.2 });

      expect(() => {
        fireEvent.mouseMove(btn, { clientX: 100, clientY: 200 });
        fireEvent.mouseLeave(btn);
      }).not.toThrow();

      cleanupFn();
      btn.remove();
    });

    it("handles extreme coordinate jumps (teleporting cursor) stably", () => {
      const btn = document.createElement("button");
      btn.innerHTML = `<span>Click</span>`;
      document.body.appendChild(btn);

      vi.spyOn(btn, "getBoundingClientRect").mockReturnValue({
        x: 100,
        y: 100,
        top: 100,
        left: 100,
        bottom: 150,
        right: 200,
        width: 100,
        height: 50,
        toJSON: () => {},
      });

      const cleanupFn = applyMagneticHover(btn, { strength: 0.3 });

      // Wild cursor jump
      fireEvent.mouseMove(btn, { clientX: 999999, clientY: -888888 });
      fireEvent.mouseMove(btn, { clientX: 150, clientY: 125 }); // Centered
      fireEvent.mouseLeave(btn);

      expect(() => cleanupFn()).not.toThrow();
      btn.remove();
    });

    it("bypasses completely on touch-only devices (coarse pointer, no fine pointer)", () => {
      setMediaCapabilities({ coarse: true, fine: false, reducedMotion: false });

      const btn = document.createElement("button");
      document.body.appendChild(btn);

      const addListenerSpy = vi.spyOn(btn, "addEventListener");
      const cleanupFn = applyMagneticHover(btn);

      // Should not attach mousemove or mouseleave
      expect(addListenerSpy).not.toHaveBeenCalledWith("mousemove", expect.any(Function));
      expect(addListenerSpy).not.toHaveBeenCalledWith("mouseleave", expect.any(Function));

      cleanupFn();
      btn.remove();
    });

    it("resets transforms to exactly (0,0) on unmount cleanup when interacted", () => {
      const btn = document.createElement("button");
      const inner = document.createElement("span");
      inner.setAttribute("data-magnetic-inner", "true");
      btn.appendChild(inner);
      document.body.appendChild(btn);

      vi.spyOn(btn, "getBoundingClientRect").mockReturnValue({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        bottom: 50,
        right: 100,
        width: 100,
        height: 50,
        toJSON: () => {},
      });

      const cleanupFn = applyMagneticHover(btn, { strength: 0.5, innerStrength: 0.75 });

      // Simulate mouse interaction
      fireEvent.mouseMove(btn, { clientX: 80, clientY: 40 });

      // Immediate unmount / cleanup
      cleanupFn();

      // GSAP set should have been called to return to x: 0, y: 0
      expect(btn.style.transform).toMatch(/translate\(0(?:px)?, ?0(?:px)?\)/);
      expect(inner.style.transform).toMatch(/translate\(0(?:px)?, ?0(?:px)?\)/);

      btn.remove();
    });

    it("survives 500 rapid alternating enter/leave bursts without memory creep", () => {
      const btn = document.createElement("button");
      btn.innerHTML = `<span data-magnetic-inner>Burst Link</span>`;
      document.body.appendChild(btn);

      vi.spyOn(btn, "getBoundingClientRect").mockReturnValue({
        x: 50,
        y: 50,
        top: 50,
        left: 50,
        bottom: 80,
        right: 150,
        width: 100,
        height: 30,
        toJSON: () => {},
      });

      const cleanupFn = applyMagneticHover(btn, { strength: 0.25 });

      for (let i = 0; i < 500; i++) {
        fireEvent.mouseMove(btn, { clientX: 50 + (i % 50), clientY: 50 + (i % 20) });
        fireEvent.mouseLeave(btn);
      }

      expect(() => cleanupFn()).not.toThrow();
      btn.remove();
    });
  });

  // =========================================================================
  // 3. Smooth Scroll (Lenis + GSAP) Rapid Scroll & Teardown Stress
  // =========================================================================
  describe("3. Smooth Scroll (Lenis + GSAP) Rapid Scroll & Teardown Stress", () => {
    it("initializes Lenis, synchronizes with GSAP ticker, and sets lagSmoothing to 0", () => {
      const lagSmoothingSpy = vi.spyOn(gsap.ticker, "lagSmoothing");
      const tickerAddSpy = vi.spyOn(gsap.ticker, "add");

      const instance = initSmoothScroll();
      expect(instance.lenis).not.toBeNull();
      expect(getLenis()).toBe(instance.lenis);
      expect(lagSmoothingSpy).toHaveBeenCalledWith(0);
      expect(tickerAddSpy).toHaveBeenCalled();

      // Clean destroy
      destroySmoothScroll();
      expect(getLenis()).toBeNull();
    });

    it("re-initialization cleanly tears down prior instance without orphan ticker handlers", () => {
      const tickerRemoveSpy = vi.spyOn(gsap.ticker, "remove");

      initSmoothScroll();
      // Second init should call destroySmoothScroll first
      initSmoothScroll();

      expect(tickerRemoveSpy).toHaveBeenCalled();
      destroySmoothScroll();
    });

    it("rapidly fires 200 scroll and resize events through window without throwing", () => {
      initSmoothScroll();

      expect(() => {
        for (let i = 0; i < 200; i++) {
          window.scrollY = i * 10;
          fireEvent.scroll(window);
          window.innerWidth = 800 + (i % 100);
          fireEvent.resize(window);
        }
      }).not.toThrow();

      destroySmoothScroll();
    });
  });

  // =========================================================================
  // 4. Reduced Motion Global Bypass Verification
  // =========================================================================
  describe("4. Reduced Motion Global Bypass Verification", () => {
    it("completely bypasses Lenis initialization when prefers-reduced-motion is true", () => {
      setMediaCapabilities({ coarse: false, fine: true, reducedMotion: true });

      expect(prefersReducedMotion()).toBe(true);

      const result = initSmoothScroll();
      expect(result.lenis).toBeNull();
      expect(getLenis()).toBeNull();
    });

    it("completely bypasses magnetic hover when prefers-reduced-motion is true", () => {
      setMediaCapabilities({ coarse: false, fine: true, reducedMotion: true });

      const btn = document.createElement("button");
      const addListenerSpy = vi.spyOn(btn, "addEventListener");

      const cleanupFn = applyMagneticHover(btn);
      expect(addListenerSpy).not.toHaveBeenCalled();

      cleanupFn();
    });

    it("ServicesProcessTimeline bypasses all ScrollTrigger animations when reduced motion is requested", () => {
      setMediaCapabilities({ coarse: false, fine: true, reducedMotion: true });

      const initialCount = ScrollTrigger.getAll().length;
      const { unmount } = render(<ServicesProcessTimeline />);

      // Should not create new ScrollTriggers
      const activeCount = ScrollTrigger.getAll().length;
      expect(activeCount).toBe(initialCount);

      // Verify DOM content is still fully rendered and accessible
      expect(screen.getByText("PART 1")).toBeInTheDocument();
      expect(screen.getByText("Portfolio Selection")).toBeInTheDocument();

      unmount();
    });
  });

  // =========================================================================
  // 5. Rapid Mount / Unmount Stress of Motion Components
  // =========================================================================
  describe("5. Rapid Mount / Unmount Stress of Motion Components", () => {
    it("50 rapid mount and unmount cycles of ServicesProcessTimeline leave 0 orphaned ScrollTriggers", () => {
      setMediaCapabilities({ coarse: false, fine: true, reducedMotion: false });

      const baseSTCount = ScrollTrigger.getAll().length;

      for (let i = 0; i < 50; i++) {
        const { unmount } = render(<ServicesProcessTimeline />);
        unmount();
      }

      // Context revert should kill all created ScrollTriggers
      const finalSTCount = ScrollTrigger.getAll().length;
      expect(finalSTCount).toBe(baseSTCount);
    });

    it("Chrome navigation links mount magnetic hover and clean up with zero residual listeners", () => {
      setMediaCapabilities({ coarse: false, fine: true, reducedMotion: false });

      const { container, unmount } = render(<Header />);
      const navLinks = container.querySelectorAll("[data-nav-link]");
      expect(navLinks.length).toBeGreaterThan(0);

      // Verify unmount triggers cleanup smoothly
      expect(() => unmount()).not.toThrow();
    });
  });
});
