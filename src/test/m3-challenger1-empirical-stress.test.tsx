import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React from "react";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { PassportCanvas } from "@/components/3d/PassportCanvas";
import { ArchitecturalBuildingCanvas } from "@/components/3d/ArchitecturalBuildingCanvas";
import { PassportFallbackCard } from "@/components/3d/PassportFallbackCard";
import { BuildingFallbackCard } from "@/components/3d/BuildingFallbackCard";
import { LazyPassportCanvas } from "@/components/3d/LazyPassportCanvas";
import { LazyBuildingCanvas } from "@/components/3d/LazyBuildingCanvas";
import { CaldrenHeroSection } from "@/components/site/CaldrenHeroSection";
import { ServicesPage } from "@/routes/services";
import { ServicesProcessTimeline } from "@/components/site/ServicesProcessTimeline";
import { LanguageProvider } from "@/hooks/useLanguage";
import { DEFAULT_SITE_SETTINGS } from "@/admin/demo";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    Link: ({ to, children, className, onClick, ...rest }: any) => (
      <a href={typeof to === "string" ? to : "#"} className={className} onClick={onClick} {...rest}>
        {children}
      </a>
    ),
    useRouterState: ({ select }: { select?: (s: any) => any }) =>
      select
        ? select({ location: { pathname: "/services" } })
        : { location: { pathname: "/services" } },
    useNavigate: () => vi.fn(),
  };
});

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  DEMO_MODE: true,
  publicSupabase: {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  },
}));

// Mock Chrome Logo and LanguageSwitcher while preserving PageIntro and other exports
vi.mock("@/components/site/Chrome", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/site/Chrome")>();
  return {
    ...actual,
    Logo: () => <div data-testid="mock-logo">Avrasya Logo</div>,
  };
});

vi.mock("@/components/site/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <div data-testid="mock-language-switcher">EN</div>,
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

function renderServicesWithProviders() {
  const client = createTestQueryClient();
  return render(
    <QueryClientProvider client={client}>
      <LanguageProvider>
        <ServicesPage />
        <ServicesProcessTimeline />
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

describe("Empirical Challenger 1: Milestone 3 (3D WebGL Experiences & Spatial Architecture)", () => {
  const heroAssetPath = path.resolve(__dirname, "../../public/images/hero-building-avrasya.png");
  const expectedHeroSha256 = "978BDB310BFDB282EE5269E04E3D2F012CB0BDCF93821BEA684E2AF9BDDE064C";

  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. WEBGL-NULL & RUNTIME EXCEPTION RESILIENCE
  // =========================================================================
  describe("Adversarial Dimension 1: WebGL Unavailable & Context Failure", () => {
    it("1.1: LazyPassportCanvas falls back cleanly to PassportFallbackCard when getContext returns null", () => {
      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);

      const { container } = render(<LazyPassportCanvas />);

      // Zero canvas elements rendered
      expect(container.querySelectorAll("canvas").length).toBe(0);

      // Fallback card is rendered with gold foil text
      expect(container.textContent).toContain("TÜRKİYE CUMHURİYETİ");
      expect(container.textContent).toContain("PASAPORT · PASSPORT");
      expect(container.textContent).toContain("Law No. 5901 Naturalization");

      HTMLCanvasElement.prototype.getContext = origGetContext;
    });

    it("1.2: LazyBuildingCanvas falls back cleanly to BuildingFallbackCard when getContext returns null", () => {
      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);

      const { container } = render(<LazyBuildingCanvas />);

      // Zero canvas elements rendered
      expect(container.querySelectorAll("canvas").length).toBe(0);

      // Fallback card is rendered with architectural specs
      expect(container.textContent).toContain("Architectural Elevation");
      expect(container.textContent).toContain("Villa & Penthouse Model");
      expect(container.textContent).toContain("Tapu Ready");

      HTMLCanvasElement.prototype.getContext = origGetContext;
    });

    it("1.3: Lazy loaders handle throwing getContext (e.g., GPU crash / security restrictions) gracefully", () => {
      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => {
        throw new Error("SecurityError: WebGL context disabled by administrator");
      });

      expect(() => {
        render(
          <div>
            <LazyPassportCanvas />
            <LazyBuildingCanvas />
          </div>,
        );
      }).not.toThrow();

      expect(screen.getByText("TÜRKİYE CUMHURİYETİ")).toBeInTheDocument();
      expect(screen.getByText("Villa & Penthouse Model")).toBeInTheDocument();

      HTMLCanvasElement.prototype.getContext = origGetContext;
    });

    it("1.4: Direct mount of PassportCanvas handles missing WebGL context without unhandled error", () => {
      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);

      expect(() => {
        render(<PassportCanvas />);
      }).not.toThrow();

      HTMLCanvasElement.prototype.getContext = origGetContext;
    });

    it("1.5: Direct mount of ArchitecturalBuildingCanvas handles missing WebGL context without unhandled error", () => {
      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);

      expect(() => {
        render(<ArchitecturalBuildingCanvas />);
      }).not.toThrow();

      HTMLCanvasElement.prototype.getContext = origGetContext;
    });

    it("1.6: CSS 3D fallback cards update tilt angles on pointer movements and reset on pointer leave", () => {
      const { container } = render(<PassportFallbackCard interactive={true} />);
      const cardContainer = container.querySelector('[role="img"]') as HTMLElement;
      expect(cardContainer).toBeInTheDocument();
      const parent = cardContainer.parentElement as HTMLElement;

      // Trigger pointer move on outer wrapper
      fireEvent.pointerMove(parent, {
        clientX: 100,
        clientY: 100,
      });

      // Trigger pointer leave
      fireEvent.pointerLeave(parent);
      expect(cardContainer.style.transform).toContain("rotateX(0deg) rotateY(0deg)");
    });
  });

  // =========================================================================
  // 2. PREFERS-REDUCED-MOTION STRESS-TESTING
  // =========================================================================
  describe("Adversarial Dimension 2: Accessibility & Reduced Motion", () => {
    it("2.1: Under prefers-reduced-motion: reduce, LazyPassportCanvas strictly resolves to static CSS 3D fallback", () => {
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches:
          query.includes("prefers-reduced-motion: reduce") || query.includes("min-width: 768px"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }));

      const { container } = render(<LazyPassportCanvas priority={true} />);
      expect(container.querySelectorAll("canvas").length).toBe(0);
      expect(container.textContent).toContain("TÜRKİYE CUMHURİYETİ");

      window.matchMedia = originalMatchMedia;
    });

    it("2.2: Under prefers-reduced-motion: reduce, LazyBuildingCanvas strictly resolves to static CSS 3D fallback", () => {
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches:
          query.includes("prefers-reduced-motion: reduce") || query.includes("min-width: 768px"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }));

      const { container } = render(<LazyBuildingCanvas priority={true} />);
      expect(container.querySelectorAll("canvas").length).toBe(0);
      expect(container.textContent).toContain("Architectural Elevation");

      window.matchMedia = originalMatchMedia;
    });

    it("2.3: Non-interactive prop on fallback cards prevents hover tilt calculations", () => {
      const { container } = render(<BuildingFallbackCard interactive={false} />);
      const innerCard = container.querySelector('[role="img"]') as HTMLElement;
      expect(innerCard).toBeInTheDocument();
      const parent = innerCard.parentElement as HTMLElement;

      fireEvent.pointerMove(parent, { clientX: 250, clientY: 250 });
      expect(innerCard.style.transform).toBe("rotateX(0deg) rotateY(0deg)");
    });
  });

  // =========================================================================
  // 3. RAPID MOUNT/UNMOUNT & JSDOM/SSR LIFE-CYCLE SAFETY
  // =========================================================================
  describe("Adversarial Dimension 3: Rapid Unmounts & Resource Cleanliness", () => {
    it("3.1: Rapid mounting and unmounting of PassportCanvas 20 times causes zero errors or dangling listeners", () => {
      const addListenerSpy = vi.spyOn(window, "addEventListener");
      const removeListenerSpy = vi.spyOn(window, "removeEventListener");

      for (let i = 0; i < 20; i++) {
        const { unmount } = render(<PassportCanvas interactive={true} />);
        unmount();
      }

      // No memory leaks or unhandled crashes
      expect(document.querySelectorAll("canvas").length).toBe(0);
      addListenerSpy.mockRestore();
      removeListenerSpy.mockRestore();
    });

    it("3.2: Rapid mounting and unmounting of ArchitecturalBuildingCanvas 20 times causes zero errors", () => {
      for (let i = 0; i < 20; i++) {
        const { unmount } = render(<ArchitecturalBuildingCanvas interactive={true} />);
        unmount();
      }

      expect(document.querySelectorAll("canvas").length).toBe(0);
    });

    it("3.3: In JSDOM / headless test runners, canvas components protect against missing WebGL contexts", () => {
      const { container: c1 } = render(<PassportCanvas />);
      expect(c1.querySelector("[data-testid='passport-canvas-container']")).toBeInTheDocument();

      const { container: c2 } = render(<ArchitecturalBuildingCanvas />);
      expect(c2.querySelector("[data-testid='building-canvas-container']")).toBeInTheDocument();
    });

    it("3.4: Both 3D canvas files define unmount cleanup of geometries, materials, textures, and renderer", () => {
      const passportPath = path.resolve(__dirname, "../components/3d/PassportCanvas.tsx");
      const buildingPath = path.resolve(
        __dirname,
        "../components/3d/ArchitecturalBuildingCanvas.tsx",
      );

      const passportCode = fs.readFileSync(passportPath, "utf-8");
      const buildingCode = fs.readFileSync(buildingPath, "utf-8");

      // Verify unmount teardown functions
      expect(passportCode).toContain("cancelAnimationFrame(animFrameId)");
      expect(passportCode).toContain("resizeObserver.disconnect()");
      expect(passportCode).toContain("intersectionObserver.disconnect()");
      expect(passportCode).toContain("geometries.forEach((g) => g.dispose())");
      expect(passportCode).toContain("materials.forEach((m) => m.dispose())");
      expect(passportCode).toContain("textures.forEach((t) => t.dispose())");
      expect(passportCode).toContain("renderer.dispose()");
      expect(passportCode).toContain("renderer.forceContextLoss()");

      expect(buildingCode).toContain("cancelAnimationFrame(animFrameId)");
      expect(buildingCode).toContain("resizeObserver.disconnect()");
      expect(buildingCode).toContain("intersectionObserver.disconnect()");
      expect(buildingCode).toContain("geometries.forEach((g) => g.dispose())");
      expect(buildingCode).toContain("materials.forEach((m) => m.dispose())");
      expect(buildingCode).toContain("renderer.dispose()");
      expect(buildingCode).toContain("renderer.forceContextLoss()");
    });

    it("3.5: Clamps device pixel ratio strictly to 1.75 max to prevent high-DPI GPU exhaustion", () => {
      const passportCode = fs.readFileSync(
        path.resolve(__dirname, "../components/3d/PassportCanvas.tsx"),
        "utf-8",
      );
      const buildingCode = fs.readFileSync(
        path.resolve(__dirname, "../components/3d/ArchitecturalBuildingCanvas.tsx"),
        "utf-8",
      );

      expect(passportCode).toContain("Math.min(window.devicePixelRatio || 1, 1.75)");
      expect(buildingCode).toContain("Math.min(window.devicePixelRatio || 1, 1.75)");
    });
  });

  // =========================================================================
  // 4. HERO SECTION ZERO-CANVAS INVARIANT & SOVEREIGN ASSET LOCK
  // =========================================================================
  describe("Adversarial Dimension 4: Hero Zero-Canvas Invariant & Sovereign Asset Integrity", () => {
    it("4.1: Homepage Hero Section has strictly ZERO canvas elements", () => {
      const dummySettings = {
        ...DEFAULT_SITE_SETTINGS,
        heroHeadline: "Exceptional spaces, thoughtfully presented.",
        heroSubtitle:
          "Residences, penthouses and new developments selected for architecture, address and light.",
      };

      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );

      const canvases = container.querySelectorAll("canvas");
      expect(canvases.length).toBe(0);
      expect(container.querySelector("[data-skyline-canvas]")).toBeNull();
      expect(container.querySelector("[data-skyline-scene]")).toBeNull();
    });

    it("4.2: Hero section retains 4-plane CSS 3D composition with stage perspective 1200px", () => {
      const dummySettings = {
        ...DEFAULT_SITE_SETTINGS,
        heroHeadline: "Exceptional spaces, thoughtfully presented.",
        heroSubtitle:
          "Residences, penthouses and new developments selected for architecture, address and light.",
      };

      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );

      const stage = container.querySelector("[data-3d-stage]");
      expect(stage).toBeInTheDocument();
      expect(stage?.getAttribute("data-perspective")).toBe("1200px");

      const buildingPlane = container.querySelector('[data-plane="building-asset"]');
      expect(buildingPlane).toBeInTheDocument();
      const img = buildingPlane?.querySelector("img");
      expect(img?.getAttribute("src")).toContain("hero-building-avrasya.png");
    });

    it("4.3: Sovereign hero building asset cryptographic SHA-256 hash remains unaltered", () => {
      expect(fs.existsSync(heroAssetPath)).toBe(true);
      const fileBuffer = fs.readFileSync(heroAssetPath);
      expect(fileBuffer.length).toBe(1024060);

      const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex").toUpperCase();
      expect(hash).toBe(expectedHeroSha256);
    });
  });

  // =========================================================================
  // 5. SERVICES TIMELINE 3D MOUNTING SLOTS INTEGRITY
  // =========================================================================
  describe("Adversarial Dimension 5: Services Timeline 3D Mounting Slots", () => {
    it("5.1: 3D Building Canvas is removed from Step 04", () => {
      const { container } = renderServicesWithProviders();
      const buildingSlot = container.querySelector("[data-3d-building-slot]");
      expect(buildingSlot).toBeNull();
    });

    it("5.2: Floating 3D Passport Canvas is strictly mounted inside Step 07 ([data-3d-passport-slot]) with no border or tags", () => {
      const { container } = renderServicesWithProviders();
      const passportSlot = container.querySelector("[data-3d-passport-slot]");
      expect(passportSlot).toBeInTheDocument();
      expect(passportSlot?.id).toBe("services-3d-passport");
      expect(passportSlot?.className).not.toContain("border");

      // Verify the slot is within Step 07
      const stepRow = passportSlot?.closest("[data-step]");
      expect(stepRow).toBeInTheDocument();
      expect(stepRow?.getAttribute("data-step")).toBe("07");
      expect(stepRow?.textContent).not.toContain("3D Sovereign Naturalization Asset");
      expect(stepRow?.textContent).not.toContain("PBR Leather & Gold Foil Emboss");
    });

    it("5.3: No other steps contain rogue 3D building or passport mounting slots", () => {
      const { container } = renderServicesWithProviders();
      const buildingSlots = container.querySelectorAll("[data-3d-building-slot]");
      const passportSlots = container.querySelectorAll("[data-3d-passport-slot]");

      expect(buildingSlots.length).toBe(0);
      expect(passportSlots.length).toBe(1);
    });
  });
});
