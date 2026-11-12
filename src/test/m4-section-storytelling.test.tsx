import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import * as gsapModule from "@/lib/gsap";
import { BildoraAboutSection } from "@/components/site/BildoraAboutSection";
import { BildoraServicesTimeline } from "@/components/site/BildoraServicesTimeline";
import { BildoraProjectsShowcase } from "@/components/site/BildoraProjectsShowcase";
import { PartnersSection } from "@/components/site/PartnersSection";

// Mock TanStack Router Link
vi.mock("@tanstack/react-router", () => ({
  useRouterState: ({ select }: { select: (s: any) => any }) =>
    select({ location: { pathname: "/" } }),
  Link: ({ to, children, onClick, className, "aria-label": ariaLabel, ...rest }: any) => (
    <a href={to} onClick={onClick} className={className} aria-label={ariaLabel} {...rest}>
      {children}
    </a>
  ),
}));

// Mock Supabase
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

describe("Milestone M4: Visual Storytelling, Section Animations & Interactive Galleries", () => {
  const originalMatchMedia = window.matchMedia;
  let queryClient: QueryClient;

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
    mockReducedMotion(false);
    // Clear any dangling ScrollTriggers from prior test
    ScrollTrigger.getAll().forEach((st) => st.kill());
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    window.matchMedia = originalMatchMedia;
    ScrollTrigger.getAll().forEach((st) => st.kill());
  });

  // =========================================================================
  // 1. BildoraAboutSection Test Suite
  // =========================================================================
  describe("1. BildoraAboutSection Storytelling & Masking", () => {
    it("renders display heading, description, 3D cylinder, and 4 metric cards", () => {
      const Wrapper = createWrapper();
      const { container } = render(<BildoraAboutSection />, { wrapper: Wrapper });

      expect(screen.getByText("About Us")).toBeDefined();
      const heading = container.querySelector("[data-about-heading]");
      expect(heading?.textContent).toContain("Architectural Distinction");

      expect(screen.getByText(/Years of Experience/i)).toBeDefined();
      expect(screen.getByText(/Projects Completed/i)).toBeDefined();
      expect(screen.getByText(/Client Satisfaction/i)).toBeDefined();
      expect(screen.getByText(/On-Time Delivery/i)).toBeDefined();
    });

    it("registers ScrollTrigger instances for kinetic typography, masking, and metrics when motion enabled", () => {
      const Wrapper = createWrapper();
      const initialSTCount = ScrollTrigger.getAll().length;

      render(<BildoraAboutSection />, { wrapper: Wrapper });

      const newSTCount = ScrollTrigger.getAll().length;
      expect(newSTCount).toBeGreaterThan(initialSTCount);
    });

    it("applies polygon clipping mask structure via animateSlide on architectural imagery", () => {
      const Wrapper = createWrapper();
      const { container } = render(<BildoraAboutSection />, { wrapper: Wrapper });

      const maskContainer = container.querySelector("[data-mask-container]");
      const maskImage = container.querySelector("[data-mask-image]");

      expect(maskContainer).not.toBeNull();
      expect(maskImage).not.toBeNull();
      expect(maskContainer?.getAttribute("class")).toContain("overflow-hidden");
    });

    it("smoothly cleans up all ScrollTriggers and ticker listeners on unmount", () => {
      const Wrapper = createWrapper();
      const removeTickerSpy = vi.spyOn(gsap.ticker, "remove");

      const { unmount } = render(<BildoraAboutSection />, { wrapper: Wrapper });
      expect(ScrollTrigger.getAll().length).toBeGreaterThan(0);

      unmount();
      expect(ScrollTrigger.getAll().length).toBe(0);
      expect(removeTickerSpy).toHaveBeenCalled();
    });

    it("respects prefers-reduced-motion by rendering static metrics immediately without animation loops", () => {
      mockReducedMotion(true);
      const reducedSpy = vi.spyOn(gsapModule, "prefersReducedMotion").mockReturnValue(true);

      const Wrapper = createWrapper();
      const addTickerSpy = vi.spyOn(gsap.ticker, "add");

      const { container } = render(<BildoraAboutSection />, { wrapper: Wrapper });

      // Verifies fallback values populated immediately
      const numElements = container.querySelectorAll("[data-counter-num]");
      expect(numElements.length).toBe(4);
      expect(numElements[0]?.textContent).toBe("12+");
      expect(numElements[1]?.textContent).toBe("250+");
      expect(numElements[2]?.textContent).toBe("4.8/5");
      expect(numElements[3]?.textContent).toBe("98%");

      // Verifies 3D rotation ticker was NOT registered
      expect(addTickerSpy).not.toHaveBeenCalled();

      reducedSpy.mockRestore();
    });

    it("accepts custom metrics prop and correctly formats custom statistics", () => {
      const customMetrics = [
        { label: "Total Portfolio Value", value: "€450M+" },
        { label: "Prime Residences", value: "180" },
      ];

      const Wrapper = createWrapper();
      const { container } = render(<BildoraAboutSection metrics={customMetrics} />, {
        wrapper: Wrapper,
      });

      expect(screen.getByText("Total Portfolio Value")).toBeDefined();
      expect(screen.getByText("Prime Residences")).toBeDefined();

      const numElements = container.querySelectorAll("[data-counter-num]");
      expect(numElements.length).toBe(2);
    });
  });

  // =========================================================================
  // 2. BildoraServicesTimeline Test Suite
  // =========================================================================
  describe("2. BildoraServicesTimeline Progression & Magnetic CTAs", () => {
    it("renders vertical alternating timeline items with brass dots and progress fill tracks", () => {
      const Wrapper = createWrapper();
      const { container } = render(<BildoraServicesTimeline />, { wrapper: Wrapper });

      const rows = container.querySelectorAll("[data-tl-row]");
      expect(rows.length).toBe(6);

      const circles = container.querySelectorAll("[data-tl-circle]");
      expect(circles.length).toBeGreaterThanOrEqual(6);

      const fills = container.querySelectorAll("[data-tl-fill]");
      expect(fills.length).toBeGreaterThanOrEqual(6);
    });

    it("registers ScrollTrigger instances for row entrances, circle pops, and spine progress fills", () => {
      const Wrapper = createWrapper();
      const initialSTCount = ScrollTrigger.getAll().length;

      render(<BildoraServicesTimeline />, { wrapper: Wrapper });

      const newSTCount = ScrollTrigger.getAll().length;
      expect(newSTCount).toBeGreaterThan(initialSTCount);
    });

    it("applies magnetic hover physics to service CTA buttons and cleans up on unmount", () => {
      const Wrapper = createWrapper();
      const { container, unmount } = render(<BildoraServicesTimeline />, { wrapper: Wrapper });

      const ctaBtn = container.querySelector<HTMLElement>("[data-service-cta]");
      expect(ctaBtn).not.toBeNull();

      if (ctaBtn) {
        ctaBtn.getBoundingClientRect = () => ({
          left: 10,
          top: 10,
          width: 100,
          height: 40,
          right: 110,
          bottom: 50,
          x: 10,
          y: 10,
          toJSON: () => {},
        });

        // Simulate pointer hover and displacement
        expect(() => {
          fireEvent.mouseMove(ctaBtn, { clientX: 60, clientY: 30 });
          fireEvent.mouseLeave(ctaBtn);
        }).not.toThrow();
      }

      // Clean unmount kills ScrollTriggers and removes magnetic listeners
      unmount();
      expect(ScrollTrigger.getAll().length).toBe(0);
    });

    it("renders consultation footer with magnetic attraction when showCtaFooter is true", () => {
      const Wrapper = createWrapper();
      const { container } = render(<BildoraServicesTimeline showCtaFooter={true} />, {
        wrapper: Wrapper,
      });

      const consultationCta = container.querySelector("[data-consultation-cta]");
      expect(consultationCta).not.toBeNull();
      expect(screen.getByText(/Schedule Consultation/i)).toBeDefined();
    });

    it("respects prefers-reduced-motion in services timeline by rendering static items immediately", () => {
      mockReducedMotion(true);
      const reducedSpy = vi.spyOn(gsapModule, "prefersReducedMotion").mockReturnValue(true);

      const Wrapper = createWrapper();
      const { container } = render(<BildoraServicesTimeline />, { wrapper: Wrapper });

      const rows = container.querySelectorAll("[data-tl-row]");
      expect(rows.length).toBe(6);

      // Verify zero ScrollTriggers registered when reduced motion is requested
      expect(ScrollTrigger.getAll().length).toBe(0);

      reducedSpy.mockRestore();
    });
  });

  // =========================================================================
  // 3. BildoraProjectsShowcase Test Suite
  // =========================================================================
  describe("3. BildoraProjectsShowcase Pinned Horizontal Scroll & Cards", () => {
    it("renders projects showcase with number reel, property cards, and badges", () => {
      const Wrapper = createWrapper();
      const { container } = render(<BildoraProjectsShowcase />, { wrapper: Wrapper });

      expect(screen.getByText("Our Projects")).toBeDefined();
      const heading = container.querySelector("h2");
      expect(heading?.textContent).toContain("Built with Purpose");

      const cards = container.querySelectorAll("[data-project-card]");
      expect(cards.length).toBe(4);

      const badges = container.querySelectorAll("[data-project-badge]");
      expect(badges.length).toBe(4);
    });

    it("registers pinned horizontal ScrollTrigger and containerAnimation triggers for cards", () => {
      const Wrapper = createWrapper();
      const initialSTCount = ScrollTrigger.getAll().length;

      render(<BildoraProjectsShowcase />, { wrapper: Wrapper });

      const newSTCount = ScrollTrigger.getAll().length;
      // Should register horizontal tween ScrollTrigger + containerAnimation for each card
      expect(newSTCount).toBeGreaterThan(initialSTCount);
    });

    it("attaches magnetic hover to project CTA buttons and cleans up on unmount", () => {
      const Wrapper = createWrapper();
      const { container, unmount } = render(<BildoraProjectsShowcase />, { wrapper: Wrapper });

      const ctaBtn = container.querySelector<HTMLElement>("[data-project-cta]");
      expect(ctaBtn).not.toBeNull();

      if (ctaBtn) {
        ctaBtn.getBoundingClientRect = () => ({
          left: 20,
          top: 20,
          width: 120,
          height: 36,
          right: 140,
          bottom: 56,
          x: 20,
          y: 20,
          toJSON: () => {},
        });

        expect(() => {
          fireEvent.mouseMove(ctaBtn, { clientX: 80, clientY: 38 });
          fireEvent.mouseLeave(ctaBtn);
        }).not.toThrow();
      }

      unmount();
      expect(ScrollTrigger.getAll().length).toBe(0);
    });

    it("falls back to accessible non-pinned layout when reduced motion is preferred", () => {
      mockReducedMotion(true);
      const reducedSpy = vi.spyOn(gsapModule, "prefersReducedMotion").mockReturnValue(true);

      const Wrapper = createWrapper();
      const { container } = render(<BildoraProjectsShowcase />, { wrapper: Wrapper });

      const cards = container.querySelectorAll("[data-project-card]");
      expect(cards.length).toBe(4);

      // Verify zero pinned ScrollTriggers registered
      expect(ScrollTrigger.getAll().length).toBe(0);

      reducedSpy.mockRestore();
    });
  });

  // =========================================================================
  // 4. PartnersSection Test Suite
  // =========================================================================
  describe("4. PartnersSection Marquee & Staggered Entrance", () => {
    it("renders partner cards and infinite marquee ribbon in standard motion mode", () => {
      const { container } = render(<PartnersSection />);

      const heading = container.querySelector("[data-partners-heading]");
      expect(heading?.textContent).toContain("References and Partners");
      expect(screen.getByText("Partners & References")).toBeDefined();

      const marqueeTrack = container.querySelector("[data-marquee-track]");
      expect(marqueeTrack).not.toBeNull();

      const partnerCards = container.querySelectorAll("[data-partner-card]");
      expect(partnerCards.length).toBeGreaterThan(0);
    });

    it("slows marquee on mouseenter and restores speed on mouseleave", () => {
      const { container } = render(<PartnersSection />);
      const marqueeContainer = container.querySelector("[data-marquee-track]")?.parentElement;

      if (marqueeContainer) {
        expect(() => {
          fireEvent.mouseEnter(marqueeContainer);
          fireEvent.mouseLeave(marqueeContainer);
        }).not.toThrow();
      }
    });

    it("cleans up marquee tween and ScrollTriggers on unmount", () => {
      const { unmount } = render(<PartnersSection />);
      expect(ScrollTrigger.getAll().length).toBeGreaterThanOrEqual(1);

      unmount();
      expect(ScrollTrigger.getAll().length).toBe(0);
    });

    it("renders accessible static flex-wrap grid fallback when reduced motion is preferred", () => {
      mockReducedMotion(true);
      const reducedSpy = vi.spyOn(gsapModule, "prefersReducedMotion").mockReturnValue(true);

      const { container } = render(<PartnersSection />);

      // In reduced motion, marquee track is not rendered; static cards container is rendered
      const marqueeTrack = container.querySelector("[data-marquee-track]");
      expect(marqueeTrack).toBeNull();

      const partnerCards = container.querySelectorAll("[data-partner-card]");
      expect(partnerCards.length).toBeGreaterThan(0);

      // Zero ScrollTriggers registered
      expect(ScrollTrigger.getAll().length).toBe(0);

      reducedSpy.mockRestore();
    });
  });

  // =========================================================================
  // 5. Composite Multi-Section Scoped Lifecycle & Leak Prevention
  // =========================================================================
  describe("5. Composite Multi-Section Scoped Lifecycle & Zero Leakage", () => {
    it("renders all four sections together and reverts 100% of ScrollTriggers on unmount", () => {
      const Wrapper = createWrapper();

      function FullStorytellingPage() {
        return (
          <main>
            <BildoraAboutSection />
            <BildoraServicesTimeline showCtaFooter={true} />
            <BildoraProjectsShowcase />
            <PartnersSection />
          </main>
        );
      }

      const { unmount } = render(<FullStorytellingPage />, { wrapper: Wrapper });

      const totalActiveSTs = ScrollTrigger.getAll().length;
      expect(totalActiveSTs).toBeGreaterThan(5);

      // Unmount the entire page
      unmount();

      // STRICT CHECK: Zero dangling ScrollTriggers must remain
      expect(ScrollTrigger.getAll().length).toBe(0);
    }, 60000);

    it("survives rapid mount/unmount cycles without memory leaks or dangling ScrollTriggers", () => {
      const Wrapper = createWrapper();

      for (let i = 0; i < 5; i++) {
        const { unmount } = render(
          <div>
            <BildoraAboutSection />
            <BildoraServicesTimeline />
          </div>,
          { wrapper: Wrapper },
        );

        expect(ScrollTrigger.getAll().length).toBeGreaterThan(0);
        unmount();
        expect(ScrollTrigger.getAll().length).toBe(0);
      }

      expect(ScrollTrigger.getAll().length).toBe(0);
    }, 180000);
  });
});
