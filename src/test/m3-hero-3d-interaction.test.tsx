import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React from "react";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { CaldrenHeroSection, calculateHero3DTilt } from "@/components/site/CaldrenHeroSection";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/admin/demo";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, onClick, search, className, "aria-label": ariaLabel, ...rest }: any) => (
    <a
      href={search ? `${to}?${new URLSearchParams(search).toString()}` : to}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
      }}
      className={className}
      aria-label={ariaLabel}
      {...rest}
    >
      {children}
    </a>
  ),
}));

// Mock Chrome Logo & LanguageSwitcher
vi.mock("@/components/site/Chrome", () => ({
  Logo: () => <div data-testid="mock-logo">Avrasya Logo</div>,
}));

vi.mock("@/components/site/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <div data-testid="mock-language-switcher">EN</div>,
}));

vi.mock("@/admin/store", () => ({
  recordPublicEnquiry: vi.fn().mockResolvedValue({ id: "mock-enquiry-1" }),
}));

describe("Milestone M3: Authentic 3D Property Experience & Cauldron Layout Composition", () => {
  const dummySettings: SiteSettings = {
    ...DEFAULT_SITE_SETTINGS,
    heroHeadline: "Exceptional spaces, thoughtfully presented.",
    heroSubtitle:
      "Residences, penthouses and new developments selected for architecture, address and light.",
  };

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. UNWANTED GENERATED BACKGROUND REMOVAL (5A)
  // =========================================================================
  describe("Task 1: Unwanted Generated Background Removal (5A)", () => {
    it("renders NO canvas starfield (<CaldrenSkyStars />)", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const canvasElements = container.querySelectorAll("canvas");
      expect(canvasElements.length).toBe(0);
    });

    it("renders NO Three.js wireframe skyline scene", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const skylineCanvas = container.querySelector("[data-skyline-canvas]");
      expect(skylineCanvas).toBeNull();
      const webglCanvas = container.querySelector("canvas");
      expect(webglCanvas).toBeNull();
    });

    it("does NOT contain artificial linear-gradient skyline background", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const section = container.querySelector("[data-home-hero]");
      expect(section).toBeInTheDocument();
      const style = section?.getAttribute("style") || "";
      expect(style).not.toContain("#989681");
      expect(style).not.toContain("#F9F8F5 100%");
      expect(style).not.toContain("linear-gradient(180deg, #163038");
    });

    it("grounds hero in authentic dark monograph background (#0B1619 with vignette)", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const section = container.querySelector("[data-home-hero]");
      expect(section?.getAttribute("data-bg-monograph")).toBe("#0B1619");

      // Verify computed or declared background contains monograph color rgb(11, 22, 25) / #0B1619
      const style = section?.getAttribute("style") || "";
      const hasMonograph =
        style.includes("rgb(11, 22, 25)") || style.includes("#0B1619") || style.includes("#0b1619");
      expect(hasMonograph).toBe(true);
    });
  });

  // =========================================================================
  // 2. SOVEREIGN ASSET CRYPTOGRAPHIC INTEGRITY & HERO PRESENCE (5A)
  // =========================================================================
  describe("Task 2: Sovereign Building Asset Cryptographic Integrity & Presence", () => {
    it("cryptographically verifies SHA-256 hash of public/images/hero-building-avrasya.png", () => {
      const assetPath = path.resolve(__dirname, "../../public/images/hero-building-avrasya.png");
      expect(fs.existsSync(assetPath)).toBe(true);

      const fileBuffer = fs.readFileSync(assetPath);
      expect(fileBuffer.length).toBe(1024060);

      const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex").toUpperCase();
      const expectedHash = "978BDB310BFDB282EE5269E04E3D2F012CB0BDCF93821BEA684E2AF9BDDE064C";
      expect(hash).toBe(expectedHash);
    });

    it("renders the authentic residence asset inside building-asset plane", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const buildingPlane = container.querySelector('[data-plane="building-asset"]');
      expect(buildingPlane).toBeInTheDocument();

      const img = buildingPlane?.querySelector("img");
      expect(img).toBeInTheDocument();
      expect(img?.getAttribute("src")).toContain("hero-building-avrasya.png");
    });
  });

  // =========================================================================
  // 3. AUTHENTIC 4-PLANE 3D VOLUMETRIC COMPOSITION (5A)
  // =========================================================================
  describe("Task 3: 4-Plane 3D Volumetric Composition (5A)", () => {
    it("wraps building in true CSS 3D space with perspective: 1200px and preserve-3d", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const stage = container.querySelector("[data-3d-stage]");
      expect(stage).toBeInTheDocument();
      expect(stage?.getAttribute("data-perspective")).toBe("1200px");
      expect(stage?.className).toContain("[perspective:1200px]");

      const volumetricContainer = container.querySelector("[data-3d-volumetric-container]");
      expect(volumetricContainer).toBeInTheDocument();
      expect(volumetricContainer?.getAttribute("data-transform-style")).toBe("preserve-3d");
      expect(volumetricContainer?.className).toContain("[transform-style:preserve-3d]");
    });

    it("renders all four dedicated volumetric planes with correct translateZ depth", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );

      // Plane 0: Foundation ground plane
      const plane0 = container.querySelector('[data-plane="ground-plane"]');
      expect(plane0).toBeInTheDocument();
      expect(plane0?.getAttribute("style")).toContain("translateZ(-15px)");

      // Plane 1: Ground drop shadow plane
      const plane1 = container.querySelector('[data-plane="ground-shadow"]');
      expect(plane1).toBeInTheDocument();
      expect(plane1?.getAttribute("style")).toContain("translateZ(-30px)");

      // Plane 2: Building asset plane
      const plane2 = container.querySelector('[data-plane="building-asset"]');
      expect(plane2).toBeInTheDocument();
      expect(plane2?.getAttribute("style")).toContain("translateZ(10px)");

      // Plane 3: Specular light glaze plane
      const plane3 = container.querySelector('[data-plane="specular-glaze"]');
      expect(plane3).toBeInTheDocument();
      expect(plane3?.getAttribute("style")).toContain("translateZ(25px)");
    });
  });

  // =========================================================================
  // 4. POINTER-DRIVEN 3D TILT PHYSICS & CALCULATION LOGIC
  // =========================================================================
  describe("Task 4: Pointer-Driven 3D Tilt Physics & Calculation Logic", () => {
    const dummyRect = { left: 100, top: 100, width: 800, height: 600 };

    it("returns neutral tilt and depth at exact geometric center", () => {
      const centerResult = calculateHero3DTilt(500, 400, dummyRect);
      expect(centerResult.rotateX).toBe(0);
      expect(centerResult.rotateY).toBe(0);
      expect(centerResult.translateZ).toBe(14);
      expect(centerResult.sheenX).toBe(50);
      expect(centerResult.sheenY).toBe(50);
    });

    it("calculates accurate 3D tilt angles when pointer moves off-center", () => {
      // Top-left pointer: x = 200, y = 200
      // normX = (200 - 100) / 800 - 0.5 = 0.125 - 0.5 = -0.375
      // normY = (200 - 100) / 600 - 0.5 = 0.1667 - 0.5 = -0.3333
      const topLeftResult = calculateHero3DTilt(200, 200, dummyRect);
      expect(topLeftResult.rotateY).toBeLessThan(0); // tilts left
      expect(topLeftResult.rotateX).toBeGreaterThan(0); // tilts up/forward
      expect(topLeftResult.sheenX).toBeLessThan(50);

      // Bottom-right pointer: x = 700, y = 500
      const bottomRightResult = calculateHero3DTilt(700, 500, dummyRect);
      expect(bottomRightResult.rotateY).toBeGreaterThan(0); // tilts right
      expect(bottomRightResult.rotateX).toBeLessThan(0); // tilts down/backward
      expect(bottomRightResult.sheenX).toBeGreaterThan(50);
    });

    it("clamps extreme pointer coordinates safely to prevent visual flipping", () => {
      // Far right pointer beyond container bounds
      const farRight = calculateHero3DTilt(2000, 400, dummyRect);
      expect(farRight.rotateY).toBe(6); // clampedX = 0.6 * 10 = 6 deg
      expect(farRight.sheenX).toBe(110);

      // Far left pointer beyond container bounds
      const farLeft = calculateHero3DTilt(-1000, 400, dummyRect);
      expect(farLeft.rotateY).toBe(-6); // clampedX = -0.6 * 10 = -6 deg
      expect(farLeft.sheenX).toBe(-10);
    });

    it("gracefully handles zero or negative rect dimensions without NaN", () => {
      const zeroRectResult = calculateHero3DTilt(150, 150, {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      });
      expect(Number.isNaN(zeroRectResult.rotateX)).toBe(false);
      expect(Number.isNaN(zeroRectResult.rotateY)).toBe(false);
      expect(Number.isNaN(zeroRectResult.translateZ)).toBe(false);
      expect(zeroRectResult.rotateX).toBe(0);
      expect(zeroRectResult.rotateY).toBe(0);
    });

    it("updates specular sheen CSS variables on pointer move and resets on pointer leave", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const stage = container.querySelector("[data-3d-stage]");
      const glaze = container.querySelector('[data-plane="specular-glaze"]') as HTMLElement;
      expect(stage).toBeInTheDocument();
      expect(glaze).toBeInTheDocument();

      // Mock getBoundingClientRect on skyline container
      const skyline = container.querySelector("[data-3d-volumetric-container]");
      if (skyline) {
        skyline.getBoundingClientRect = () => ({
          left: 100,
          top: 100,
          width: 800,
          height: 600,
          right: 900,
          bottom: 700,
          x: 100,
          y: 100,
          toJSON: () => {},
        });
      }

      fireEvent.pointerMove(stage!, { clientX: 300, clientY: 250 });
      expect(glaze.style.getPropertyValue("--sheen-x")).not.toBe("");

      fireEvent.pointerLeave(stage!);
      expect(glaze.style.getPropertyValue("--sheen-x")).toBe("50%");
      expect(glaze.style.getPropertyValue("--sheen-y")).toBe("50%");
    });
  });

  // =========================================================================
  // 5. CLEAN MOBILE EXPERIENCE & STAGED SOLITARY CTA REVEAL (5A)
  // =========================================================================
  describe("Task 5: Clean Mobile Experience & Staged Solitary CTA Reveal", () => {
    it("renders the solitary mobile CTA button pointing to /properties", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const mobileCtaWrap = container.querySelector("[data-mobile-solitary-cta]");
      expect(mobileCtaWrap).toBeInTheDocument();
      expect(mobileCtaWrap?.className).toContain("lg:hidden");

      const link = mobileCtaWrap?.querySelector("a");
      expect(link).toBeInTheDocument();
      expect(link?.getAttribute("href")).toBe("/properties");
      expect(link).toHaveTextContent("Explore Properties");
    });

    it("hides secondary desktop badges and controls on mobile viewports", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );

      // Flanking spatial container must be hidden on mobile (lg:block only)
      const showreelBtn = container.querySelector('[data-framer-name="Showreel"]');
      expect(showreelBtn?.closest(".hidden.lg\\:block")).toBeInTheDocument();

      const introCopy = container.querySelector('[data-framer-name="Intro"]');
      expect(introCopy?.closest(".hidden.lg\\:block")).toBeInTheDocument();

      const birdsFlock = container.querySelector('[data-framer-name="Birds"]');
      expect(birdsFlock?.closest(".hidden.lg\\:block")).toBeInTheDocument();

      const keepScrolling = container.querySelector('[data-framer-name="Keep Scrolling"]');
      expect(keepScrolling?.closest(".hidden.lg\\:block")).toBeInTheDocument();

      const pinWrap = container.querySelector('[data-framer-name="Pin Wrap"]');
      expect(pinWrap?.closest(".hidden.lg\\:block")).toBeInTheDocument();

      const discoverBlock = container.querySelector('[data-framer-name="Discover"]');
      expect(discoverBlock?.closest(".hidden.lg\\:block")).toBeInTheDocument();
    });

    it("verifies source code stages solitary CTA reveal timing after property 3D entrance", () => {
      const filePath = path.resolve(__dirname, "../components/site/CaldrenHeroSection.tsx");
      const code = fs.readFileSync(filePath, "utf-8");

      // Verify the building entrance duration is 1.6s
      expect(code).toContain("duration: 1.6");

      // Verify solitary CTA tween is explicitly staged at 1.75s (after the 1.6s entrance finishes at 1.72s)
      expect(code).toContain("1.75,");

      // Verify initial state is y: 20, opacity: 0
      expect(code).toContain("gsap.set(mobileCtaRef.current, { y: 20, opacity: 0 });");
    });
  });

  // =========================================================================
  // 6. DESKTOP & MOBILE LAYOUT COMPOSITION (5B)
  // =========================================================================
  describe("Task 6: Desktop & Mobile Layout Composition (5B)", () => {
    it("renders display headline with editorial italic serif styling on second word", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const headline = container.querySelector('[data-framer-name="Headline"]');
      expect(headline).toBeInTheDocument();

      const words = headline?.querySelectorAll("[data-hero-word]");
      expect(words && words.length >= 4).toBe(true);

      // The second word ("spaces,") should have italic serif styling
      const secondWord = words?.[1];
      expect(secondWord?.className).toContain("italic");
      const font = (secondWord as HTMLElement)?.style.fontFamily;
      expect(font).toContain("Instrument Serif");
    });

    it("triggers viewing modal when Watch Showreel button is clicked", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const showreelBtn = container.querySelector('[data-framer-name="Showreel"]');
      expect(showreelBtn).toBeInTheDocument();

      fireEvent.click(showreelBtn!);
      // Modal should open with dialog role
      const dialog = screen.queryByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    it("smoothly triggers scroll to #after-hero-about on keep scrolling click", () => {
      const scrollIntoViewMock = vi.fn();
      const mockSection = document.createElement("div");
      mockSection.id = "after-hero-about";
      mockSection.scrollIntoView = scrollIntoViewMock;
      document.body.appendChild(mockSection);

      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const keepBtn = container.querySelector('[data-framer-name="Keep Scrolling"]');
      expect(keepBtn).toBeInTheDocument();

      fireEvent.click(keepBtn!);
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });

      document.body.removeChild(mockSection);
    });
  });
});
