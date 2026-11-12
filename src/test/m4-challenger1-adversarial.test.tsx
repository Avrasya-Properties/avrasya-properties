import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import * as gsapModule from "@/lib/gsap";
import { applyMagneticHover } from "@/lib/animation/magnetic";
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
        "Every Avrasya residence represents an uncompromising synthesis of architectural mastery, micro-location precision, and sovereign longevity across the Istanbul skyline.",
      aboutStatement:
        "With decades of experience, we specialize in turning ideas into well-designed structures that stand the test of time.",
    },
  }),
}));

describe("Challenger 1 Adversarial Suite: Milestone M4 (Visual Storytelling, Sections & Galleries)", () => {
  const originalMatchMedia = window.matchMedia;
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;
  let queryClient: QueryClient;

  const mockPointerCapabilities = ({
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
    mockPointerCapabilities({ coarse: false, fine: true, reducedMotion: false });
    ScrollTrigger.getAll().forEach((st) => st.kill());
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    window.matchMedia = originalMatchMedia;
    window.innerWidth = originalInnerWidth;
    window.innerHeight = originalInnerHeight;
    ScrollTrigger.getAll().forEach((st) => st.kill());
  });

  // =========================================================================
  // 1. Sovereign Asset Cryptographic Integrity
  // =========================================================================
  describe("1. Sovereign Asset Cryptographic Integrity", () => {
    it("strictly verifies hero-building-avrasya.png exists and matches expected SHA-256 hash", () => {
      const assetPath = path.resolve(process.cwd(), "public/images/hero-building-avrasya.png");

      expect(fs.existsSync(assetPath)).toBe(true);

      const buffer = fs.readFileSync(assetPath);
      expect(buffer.length).toBeGreaterThan(100_000); // Must be a substantial high-res image

      const hash = crypto.createHash("sha256").update(buffer).digest("hex").toUpperCase();
      const EXPECTED_HASH = "978BDB310BFDB282EE5269E04E3D2F012CB0BDCF93821BEA684E2AF9BDDE064C";

      expect(hash).toBe(EXPECTED_HASH);
    });
  });

  // =========================================================================
  // 2. Rapid Mount / Unmount Stress & Lifecycle Cleanup
  // =========================================================================
  describe("2. Rapid Mount / Unmount Stress & Lifecycle Cleanup", () => {
    it("handles immediate unmount right after mount with zero dangling ScrollTriggers or ticker listeners", () => {
      const Wrapper = createWrapper();
      const tickerRemoveSpy = vi.spyOn(gsap.ticker, "remove");

      // Rapid mount then unmount
      const { unmount } = render(
        <div>
          <BildoraAboutSection />
          <BildoraServicesTimeline showCtaFooter={true} />
          <BildoraProjectsShowcase />
          <PartnersSection />
        </div>,
        { wrapper: Wrapper },
      );

      expect(ScrollTrigger.getAll().length).toBeGreaterThan(0);

      unmount();

      expect(ScrollTrigger.getAll().length).toBe(0);
      expect(tickerRemoveSpy).toHaveBeenCalled();
    });

    it("survives consecutive rapid mount-interaction-unmount cycles without memory leakage", () => {
      const Wrapper = createWrapper();

      for (let i = 0; i < 6; i++) {
        const { container, unmount } = render(
          <div>
            <BildoraAboutSection />
            <BildoraServicesTimeline showCtaFooter={true} />
            <BildoraProjectsShowcase />
            <PartnersSection />
          </div>,
          { wrapper: Wrapper },
        );

        // Dispatch aggressive interaction events on freshly mounted DOM
        const stage = container.querySelector("[data-framer-name='3D Look']");
        if (stage) {
          fireEvent.pointerDown(stage, { clientX: 100, pointerId: 1 });
          fireEvent.pointerMove(stage, { clientX: 250, pointerId: 1 });
        }

        const buttons = container.querySelectorAll("[data-service-cta], [data-project-cta]");
        buttons.forEach((btn) => {
          fireEvent.mouseMove(btn, { clientX: 50, clientY: 20 });
        });

        const marqueeTrack = container.querySelector("[data-marquee-track]");
        if (marqueeTrack?.parentElement) {
          fireEvent.mouseEnter(marqueeTrack.parentElement);
        }

        // Abrupt unmount during active interactions
        unmount();

        expect(ScrollTrigger.getAll().length).toBe(0);
      }

      expect(ScrollTrigger.getAll().length).toBe(0);
    }, 240000);

    it("unmounts safely while 3D cylinder pointer drag is in-flight with pointer capture", () => {
      const Wrapper = createWrapper();
      const { container, unmount } = render(<BildoraAboutSection />, { wrapper: Wrapper });

      const stage = container.querySelector<HTMLElement>("[data-framer-name='3D Look']");
      expect(stage).not.toBeNull();

      if (stage) {
        // Mock setPointerCapture
        stage.setPointerCapture = vi.fn();
        stage.releasePointerCapture = vi.fn();

        fireEvent.pointerDown(stage, { clientX: 200, pointerId: 1 });
        expect(stage.setPointerCapture).toHaveBeenCalled();

        fireEvent.pointerMove(stage, { clientX: 450, pointerId: 1 });

        // Unmount while dragging
        expect(() => unmount()).not.toThrow();
        expect(ScrollTrigger.getAll().length).toBe(0);
      }
    });
  });

  // =========================================================================
  // 3. Degenerate Window Dimensions & Fast Resizing on Horizontal Scroll Track
  // =========================================================================
  describe("3. Zero / Degenerate Window Dimensions & Rapid Resizing", () => {
    it("handles zero and degenerate window dimensions on pinned horizontal track without NaN or exceptions", () => {
      // Simulate 0x0 viewport
      window.innerWidth = 0;
      window.innerHeight = 0;

      const Wrapper = createWrapper();
      const { container } = render(<BildoraProjectsShowcase />, { wrapper: Wrapper });

      const track = container.querySelector<HTMLElement>("[data-projects-track]");
      expect(track).not.toBeNull();

      // Trigger ScrollTrigger refresh
      expect(() => {
        act(() => {
          ScrollTrigger.refresh();
        });
      }).not.toThrow();
    });

    it("survives rapid window resize sequence across extreme breakpoints", () => {
      const Wrapper = createWrapper();
      const { container } = render(<BildoraProjectsShowcase />, { wrapper: Wrapper });

      const breakpoints = [
        { w: 0, h: 0 },
        { w: 320, h: 480 },
        { w: 375, h: 667 },
        { w: 768, h: 1024 },
        { w: 1024, h: 768 },
        { w: 1440, h: 900 },
        { w: 1920, h: 1080 },
        { w: 3840, h: 2160 },
        { w: 0, h: 0 },
      ];

      breakpoints.forEach(({ w, h }) => {
        window.innerWidth = w;
        window.innerHeight = h;
        expect(() => {
          act(() => {
            window.dispatchEvent(new Event("resize"));
            ScrollTrigger.refresh();
          });
        }).not.toThrow();
      });

      const cards = container.querySelectorAll("[data-project-card]");
      expect(cards.length).toBe(4);
    });

    it("handles extreme ScrollTrigger progress values (-1, 0, 0.5, 1, 2) in horizontal showcase onUpdate", () => {
      const Wrapper = createWrapper();
      const { container } = render(<BildoraProjectsShowcase />, { wrapper: Wrapper });

      // Find the pinned scroll trigger attached to pin stage
      const allST = ScrollTrigger.getAll();
      const pinST = allST.find((st) => (st as any).vars?.pin);
      expect(pinST).toBeDefined();

      if (pinST && (pinST as any).vars?.onUpdate) {
        const onUpdate = (pinST as any).vars.onUpdate;

        // Test boundary values wrapped in act
        [-2.0, -0.5, 0, 0.25, 0.5, 0.75, 1.0, 1.5, 999.0].forEach((progress) => {
          expect(() => {
            act(() => {
              onUpdate({ progress } as any);
            });
          }).not.toThrow();
        });
      }
    });
  });

  // =========================================================================
  // 4. Coarse Touch Device Pointer Handling in magnetic.ts
  // =========================================================================
  describe("4. Coarse Touch Device Pointer Handling in magnetic.ts", () => {
    it("completely bypasses listener attachment on touch-only coarse devices", () => {
      // Touch-only phone/tablet
      mockPointerCapabilities({ coarse: true, fine: false, reducedMotion: false });

      const button = document.createElement("button");
      button.textContent = "Luxury Action";
      document.body.appendChild(button);

      const addEventSpy = vi.spyOn(button, "addEventListener");

      const cleanupFn = applyMagneticHover(button);

      // Must NOT add mousemove or mouseleave event listeners on touch-only device
      expect(addEventSpy).not.toHaveBeenCalled();

      // Cleanup function must be safe to call
      expect(() => cleanupFn()).not.toThrow();

      button.remove();
    });

    it("correctly enables magnetic hover on hybrid touch devices with fine pointer (laptop touchscreen / iPad + mouse)", () => {
      // Laptop with touchscreen: coarse=true AND fine=true
      mockPointerCapabilities({ coarse: true, fine: true, reducedMotion: false });

      const button = document.createElement("button");
      button.textContent = "Hybrid Action";
      document.body.appendChild(button);

      const addEventSpy = vi.spyOn(button, "addEventListener");

      const cleanupFn = applyMagneticHover(button);

      // MUST attach listeners because user has a fine cursor available
      expect(addEventSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
      expect(addEventSpy).toHaveBeenCalledWith("mouseleave", expect.any(Function));

      cleanupFn();
      button.remove();
    });

    it("handles mousemove with extreme coordinates (-99999, 99999) without throwing", () => {
      mockPointerCapabilities({ coarse: false, fine: true, reducedMotion: false });

      const button = document.createElement("button");
      document.body.appendChild(button);

      button.getBoundingClientRect = () => ({
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

      const cleanupFn = applyMagneticHover(button, { strength: 0.3 });

      expect(() => {
        fireEvent.mouseMove(button, { clientX: -999999, clientY: 999999 });
        fireEvent.mouseLeave(button);
      }).not.toThrow();

      cleanupFn();
      button.remove();
    });

    it("handles zero-dimension bounding rect gracefully without division by zero", () => {
      mockPointerCapabilities({ coarse: false, fine: true, reducedMotion: false });

      const button = document.createElement("button");
      document.body.appendChild(button);

      // Collapsed element 0x0
      button.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        right: 0,
        bottom: 0,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      const cleanupFn = applyMagneticHover(button);

      expect(() => {
        fireEvent.mouseMove(button, { clientX: 100, clientY: 100 });
        fireEvent.mouseLeave(button);
      }).not.toThrow();

      cleanupFn();
      button.remove();
    });

    it("cleanup function is idempotent and safe to call multiple times", () => {
      mockPointerCapabilities({ coarse: false, fine: true, reducedMotion: false });

      const button = document.createElement("button");
      document.body.appendChild(button);

      const cleanupFn = applyMagneticHover(button);

      expect(() => {
        cleanupFn();
        cleanupFn();
        cleanupFn();
      }).not.toThrow();

      button.remove();
    });
  });

  // =========================================================================
  // 5. Resilience Under Malformed Data & Edge Case Props
  // =========================================================================
  describe("5. Resilience Under Malformed Data & Edge Case Props", () => {
    it("BildoraAboutSection recovers gracefully from malformed aboutMetrics JSON string", () => {
      const Wrapper = createWrapper();
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { container } = render(<BildoraAboutSection metrics={"INVALID_JSON{[[}}}" as any} />, {
        wrapper: Wrapper,
      });

      // Should log warning and fall back to default 4 metrics
      expect(consoleWarnSpy).toHaveBeenCalled();
      const numEls = container.querySelectorAll("[data-counter-num]");
      expect(numEls.length).toBe(4);

      consoleWarnSpy.mockRestore();
    });

    it("BildoraServicesTimeline falls back to default services when empty array is passed", () => {
      const Wrapper = createWrapper();
      const { container } = render(<BildoraServicesTimeline services={[]} />, { wrapper: Wrapper });

      const rows = container.querySelectorAll("[data-tl-row]");
      expect(rows.length).toBe(6);
    });

    it("BildoraServicesTimeline renders deliverables whether formatted as array, string, or undefined", () => {
      const Wrapper = createWrapper();
      const customServices = [
        {
          id: "serv-1",
          title: "String Deliverables",
          description: "Desc 1",
          process_steps: "Step A\nStep B\nStep C" as any,
          cta_label: "Inquire",
          cta_link: "/services",
        },
        {
          id: "serv-2",
          title: "Array Deliverables",
          description: "Desc 2",
          process_steps: ["Step 1", "Step 2"] as any,
          cta_label: "Inquire",
          cta_link: "/services",
        },
      ];

      const { container } = render(
        <BildoraServicesTimeline services={customServices as any} showDeliverables={true} />,
        { wrapper: Wrapper },
      );

      expect(screen.getAllByText("Step A").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Step 1").length).toBeGreaterThan(0);
    });

    it("PartnersSection falls back gracefully to default partners when empty array is passed", () => {
      const { container, unmount } = render(<PartnersSection partners={[]} />);
      expect(container.querySelector("[data-partners-section]")).not.toBeNull();
      expect(container.querySelectorAll("[data-partner-card]").length).toBeGreaterThan(0);
      unmount();
      expect(ScrollTrigger.getAll().length).toBe(0);
    });

    it("PartnersSection renders cleanly without cards when all provided partners are hidden", () => {
      const allHidden = [
        { id: "p1", name: "P1", logo: "/l1.png", is_visible: false },
        { id: "p2", name: "P2", logo: "/l2.png", is_visible: false },
      ];
      const { container, unmount } = render(<PartnersSection partners={allHidden} />);
      expect(container.querySelectorAll("[data-partner-card]").length).toBe(0);
      unmount();
      expect(ScrollTrigger.getAll().length).toBe(0);
    });

    it("PartnersSection velocity boost handles high velocity surges gracefully", () => {
      const { container, unmount } = render(<PartnersSection />);
      const allST = ScrollTrigger.getAll();
      const velocityST = allST.find((st) => (st as any).vars?.onUpdate);
      expect(velocityST).toBeDefined();

      if (velocityST && (velocityST as any).vars?.onUpdate) {
        const onUpdate = (velocityST as any).vars.onUpdate;

        // Simulate high positive velocity (fast scroll down)
        expect(() => {
          onUpdate({ getVelocity: () => 15000 } as any);
        }).not.toThrow();

        // Simulate high negative velocity (fast scroll up)
        expect(() => {
          onUpdate({ getVelocity: () => -15000 } as any);
        }).not.toThrow();

        // Simulate zero velocity
        expect(() => {
          onUpdate({ getVelocity: () => 0 } as any);
        }).not.toThrow();
      }

      unmount();
      expect(ScrollTrigger.getAll().length).toBe(0);
    });
  });

  // =========================================================================
  // 6. Reduced-Motion Conformance Across All M4 Components
  // =========================================================================
  describe("6. Reduced-Motion Conformance Across All M4 Components", () => {
    it("ensures zero continuous animations or pinned triggers when prefers-reduced-motion is enabled", () => {
      mockPointerCapabilities({ coarse: false, fine: true, reducedMotion: true });
      const reducedSpy = vi.spyOn(gsapModule, "prefersReducedMotion").mockReturnValue(true);
      const addTickerSpy = vi.spyOn(gsap.ticker, "add");

      const Wrapper = createWrapper();

      const { container, unmount } = render(
        <div>
          <BildoraAboutSection />
          <BildoraServicesTimeline showCtaFooter={true} />
          <BildoraProjectsShowcase />
          <PartnersSection />
        </div>,
        { wrapper: Wrapper },
      );

      // Verify NO 3D cylinder ticker loop added
      expect(addTickerSpy).not.toHaveBeenCalled();

      // Verify zero pinned horizontal ScrollTriggers registered across all 4 sections
      const pinnedTriggers = ScrollTrigger.getAll().filter((st) => (st as any).vars?.pin);
      expect(pinnedTriggers.length).toBe(0);

      // Verify content is still fully rendered and accessible
      expect(screen.getByText("About Us")).toBeDefined();
      expect(screen.getByText("Our Values")).toBeDefined();
      expect(screen.getByText("Our Projects")).toBeDefined();
      expect(screen.getByText("Partners & References")).toBeDefined();

      // Verify complete teardown after unmount
      unmount();
      expect(ScrollTrigger.getAll().length).toBe(0);

      reducedSpy.mockRestore();
    });
  });
});
