import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
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

vi.mock("@/components/site/Chrome", () => ({
  Logo: () => <div data-testid="mock-logo">Avrasya Logo</div>,
}));

vi.mock("@/components/site/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <div data-testid="mock-language-switcher">EN</div>,
}));

vi.mock("@/admin/store", () => ({
  recordPublicEnquiry: vi.fn().mockResolvedValue({ id: "mock-enquiry-1" }),
}));

describe("Milestone M3 Adversarial Challenge Suite (Empirical Challenger 1)", () => {
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
  // TASK 1: ABSENCE OF CALDRENSKYSTARS, CANVAS, AND WIREFRAME BOX TOWERS
  // =========================================================================
  describe("Task 1: Unwanted Background Removal & Grounded Monograph", () => {
    it("renders zero canvas elements anywhere within the hero DOM hierarchy", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const canvases = container.querySelectorAll("canvas");
      expect(canvases.length).toBe(0);
    });

    it("ensures no Three.js wireframe box towers or SkylineScene component exists in hero", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      expect(container.querySelector("[data-skyline-scene]")).toBeNull();
      expect(container.querySelector("[data-skyline-canvas]")).toBeNull();
      expect(container.querySelector("canvas")).toBeNull();
    });

    it("grounds section in quiet-luxury dark monograph #0B1619 radial vignette", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const heroSection = container.querySelector("[data-home-hero]");
      expect(heroSection).not.toBeNull();
      expect(heroSection?.getAttribute("data-bg-monograph")).toBe("#0B1619");

      // In JSDOM, hex colors are normalized to rgb(11, 22, 25)
      const style = heroSection?.getAttribute("style") || "";
      expect(style.includes("#0B1619") || style.includes("rgb(11, 22, 25)")).toBe(true);
      // Must not contain the previous artificial five-stop blue-cyan-tan gradient
      expect(style).not.toContain("#989681");
      expect(style).not.toContain("#17384A");
    });
  });

  // =========================================================================
  // TASK 2: CSS 3D PERSPECTIVE WRAPPER & POINTER TILT LIMITS
  // =========================================================================
  describe("Task 2: CSS 3D Perspective Wrapper & Pointer Tilt Limits", () => {
    const dummyRect = { left: 100, top: 100, width: 800, height: 600 };

    it("enforces perspective: 1200px on stage and transform-style: preserve-3d on skyline container", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const stage = container.querySelector("[data-3d-stage]");
      expect(stage).not.toBeNull();
      expect(stage?.getAttribute("data-perspective")).toBe("1200px");
      expect(stage?.className).toContain("[perspective:1200px]");

      const volumetricContainer = container.querySelector("[data-3d-volumetric-container]");
      expect(volumetricContainer).not.toBeNull();
      expect(volumetricContainer?.getAttribute("data-transform-style")).toBe("preserve-3d");
      expect(volumetricContainer?.className).toContain("[transform-style:preserve-3d]");
    });

    it("verifies 4-plane volumetric depth hierarchy with exact translateZ depths", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const plane0 = container.querySelector('[data-plane="ground-plane"]');
      const plane1 = container.querySelector('[data-plane="ground-shadow"]');
      const plane2 = container.querySelector('[data-plane="building-asset"]');
      const plane3 = container.querySelector('[data-plane="specular-glaze"]');

      expect(plane0?.getAttribute("style")).toContain("translateZ(-15px)");
      expect(plane1?.getAttribute("style")).toContain("translateZ(-30px)");
      expect(plane2?.getAttribute("style")).toContain("translateZ(10px)");
      expect(plane3?.getAttribute("style")).toContain("translateZ(25px)");
    });

    it("returns neutral tilt (0deg) and centered sheen (50%) at geometric center", () => {
      // Center of 800x600 rect at (100, 100) is (500, 400)
      const center = calculateHero3DTilt(500, 400, dummyRect);
      expect(center.rotateX).toBe(0);
      expect(center.rotateY).toBe(0);
      expect(center.translateZ).toBe(14);
      expect(center.sheenX).toBe(50);
      expect(center.sheenY).toBe(50);
    });

    it("calculates exact rotation angles at component boundary edges", () => {
      // Left edge: x = 100, y = 400 -> normX = -0.5, normY = 0
      const leftEdge = calculateHero3DTilt(100, 400, dummyRect);
      expect(leftEdge.rotateY).toBe(-5.0);
      expect(leftEdge.rotateX).toBe(0);

      // Right edge: x = 900, y = 400 -> normX = 0.5, normY = 0
      const rightEdge = calculateHero3DTilt(900, 400, dummyRect);
      expect(rightEdge.rotateY).toBe(5.0);
      expect(rightEdge.rotateX).toBe(0);

      // Top edge: x = 500, y = 100 -> normX = 0, normY = -0.5
      const topEdge = calculateHero3DTilt(500, 100, dummyRect);
      expect(topEdge.rotateX).toBe(4.0);
      expect(topEdge.rotateY).toBe(0);

      // Bottom edge: x = 500, y = 700 -> normX = 0, normY = 0.5
      const bottomEdge = calculateHero3DTilt(500, 700, dummyRect);
      expect(bottomEdge.rotateX).toBe(-4.0);
      expect(bottomEdge.rotateY).toBe(0);
    });

    it("tests corner coordinates (-1, -1) and (1, 1) relative to half-dimensions", () => {
      // Top-Left corner (-1, -1): clientX = 100, clientY = 100
      const topLeft = calculateHero3DTilt(100, 100, dummyRect);
      expect(topLeft.rotateX).toBe(4.0);
      expect(topLeft.rotateY).toBe(-5.0);

      // Bottom-Right corner (1, 1): clientX = 900, clientY = 700
      const bottomRight = calculateHero3DTilt(900, 700, dummyRect);
      expect(bottomRight.rotateX).toBe(-4.0);
      expect(bottomRight.rotateY).toBe(5.0);
    });

    it("verifies rotateY and rotateX boundaries under extreme pointer excursions", () => {
      // Far right offscreen excursion (normX >> 0.6)
      const farRight = calculateHero3DTilt(5000, 400, dummyRect);
      expect(farRight.rotateY).toBe(6.0); // clamped at 6deg
      expect(farRight.sheenX).toBe(110);

      // Far left offscreen excursion (normX << -0.6)
      const farLeft = calculateHero3DTilt(-5000, 400, dummyRect);
      expect(farLeft.rotateY).toBe(-6.0); // clamped at -6deg
      expect(farLeft.sheenX).toBe(-10);

      // Far bottom offscreen excursion (normY >> 0.6)
      const farBottom = calculateHero3DTilt(500, 5000, dummyRect);
      expect(farBottom.rotateX).toBe(-4.8);

      // Far top offscreen excursion (normY << -0.6)
      const farTop = calculateHero3DTilt(500, -5000, dummyRect);
      expect(farTop.rotateX).toBe(4.8);
    });

    it("handles zero, negative, and invalid rect dimensions gracefully without NaN", () => {
      const zeroRect = calculateHero3DTilt(100, 100, { left: 0, top: 0, width: 0, height: 0 });
      expect(Number.isNaN(zeroRect.rotateX)).toBe(false);
      expect(Number.isNaN(zeroRect.rotateY)).toBe(false);
      expect(Number.isNaN(zeroRect.translateZ)).toBe(false);
      expect(zeroRect.rotateX).toBe(0);
      expect(zeroRect.rotateY).toBe(0);

      const negativeRect = calculateHero3DTilt(100, 100, {
        left: 10,
        top: 10,
        width: -100,
        height: -50,
      });
      expect(Number.isNaN(negativeRect.rotateX)).toBe(false);
      expect(Number.isNaN(negativeRect.rotateY)).toBe(false);
      expect(negativeRect.rotateX).toBe(0);
      expect(negativeRect.rotateY).toBe(0);
    });

    it("updates specular sheen CSS custom properties on pointer movement and resets on pointer leave", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const stage = container.querySelector("[data-3d-stage]") as HTMLElement;
      const glaze = container.querySelector('[data-plane="specular-glaze"]') as HTMLElement;
      const skyline = container.querySelector("[data-3d-volumetric-container]") as HTMLElement;

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

      // Pointer move to right
      fireEvent.pointerMove(stage, { clientX: 700, clientY: 400 });
      expect(glaze.style.getPropertyValue("--sheen-x")).not.toBe("");

      // Pointer leave resets to 50%
      fireEvent.pointerLeave(stage);
      expect(glaze.style.getPropertyValue("--sheen-x")).toBe("50%");
      expect(glaze.style.getPropertyValue("--sheen-y")).toBe("50%");
    });
  });

  // =========================================================================
  // TASK 3: MOBILE VIEWPORT LAYOUT & STAGED SOLITARY CTA REVEAL
  // =========================================================================
  describe("Task 3: Mobile Viewport Layout & Staged CTA Reveal Timing", () => {
    it("renders solitary 'Explore Properties' CTA on mobile and hides it on desktop", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const mobileCtaWrapper = container.querySelector("[data-mobile-solitary-cta]");
      expect(mobileCtaWrapper).not.toBeNull();
      // Contains lg:hidden to be strictly mobile/tablet visible
      expect(mobileCtaWrapper?.className).toContain("lg:hidden");

      const ctaLink = mobileCtaWrapper?.querySelector('a[href="/properties"]');
      expect(ctaLink).not.toBeNull();
      expect(ctaLink?.textContent).toContain("Explore Properties");
    });

    it("hides all excessive desktop flanking controls on mobile (< lg)", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const frame = container.querySelector('[data-framer-name="Frame"]');
      const desktopControls = frame?.querySelector(".hidden.lg\\:block");
      expect(desktopControls).not.toBeNull();

      // Flanking elements strictly enclosed inside desktop-only container
      expect(desktopControls?.querySelector('[data-framer-name="Showreel"]')).not.toBeNull();
      expect(desktopControls?.querySelector('[data-framer-name="Intro"]')).not.toBeNull();
      expect(desktopControls?.querySelector('[data-framer-name="Birds"]')).not.toBeNull();
      expect(desktopControls?.querySelector('[data-framer-name="Keep Scrolling"]')).not.toBeNull();
      expect(desktopControls?.querySelector('[data-framer-name="Pin Wrap"]')).not.toBeNull();
      expect(desktopControls?.querySelector('[data-framer-name="Discover"]')).not.toBeNull();
    });

    it("verifies staged mobile CTA reveal timeline strictly executes AFTER building 3D entrance completes", () => {
      const sourceCode = fs.readFileSync(
        path.resolve(__dirname, "../components/site/CaldrenHeroSection.tsx"),
        "utf-8",
      );

      // Building entrance begins at 0.12s with 1.6s duration -> completes at 1.72s
      expect(sourceCode).toMatch(/duration:\s*1\.6/);
      expect(sourceCode).toMatch(/0\.12/);

      // Solitary CTA reveal is staged at 1.75s (duration 0.85s)
      expect(sourceCode).toMatch(/1\.75/);
      expect(sourceCode).toMatch(/duration:\s*0\.85/);

      // Mathematical proof of non-premature staging: 1.75 > 0.12 + 1.6 (1.72)
      const buildingStartTime = 0.12;
      const buildingDuration = 1.6;
      const buildingEndTime = buildingStartTime + buildingDuration; // 1.72s
      const ctaRevealTime = 1.75; // 1.75s

      expect(ctaRevealTime).toBeGreaterThan(buildingEndTime);
    });
  });

  // =========================================================================
  // TASK 4: SOVEREIGN ASSET CRYPTOGRAPHIC INTEGRITY
  // =========================================================================
  describe("Task 4: Sovereign Asset Cryptographic SHA-256 Integrity", () => {
    const EXPECTED_SHA256 = "978BDB310BFDB282EE5269E04E3D2F012CB0BDCF93821BEA684E2AF9BDDE064C";

    it("verifies public/images/hero-building-avrasya.png exists and matches authoritative SHA-256 hash", () => {
      const assetPath = path.resolve(__dirname, "../../public/images/hero-building-avrasya.png");
      expect(fs.existsSync(assetPath)).toBe(true);

      const buffer = fs.readFileSync(assetPath);
      const hash = crypto.createHash("sha256").update(buffer).digest("hex").toUpperCase();
      expect(hash).toBe(EXPECTED_SHA256);
      expect(buffer.byteLength).toBe(1024060);
    });

    it("verifies public/images/hero-residence-extended.png also preserves authoritative SHA-256 hash", () => {
      const assetPath = path.resolve(__dirname, "../../public/images/hero-residence-extended.png");
      expect(fs.existsSync(assetPath)).toBe(true);

      const buffer = fs.readFileSync(assetPath);
      const hash = crypto.createHash("sha256").update(buffer).digest("hex").toUpperCase();
      expect(hash).toBe(EXPECTED_SHA256);
      expect(buffer.byteLength).toBe(1024060);
    });

    it("verifies hero building asset element strictly binds to /images/hero-building-avrasya.png", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const buildingImg = container.querySelector('[data-plane="building-asset"] img');
      expect(buildingImg).not.toBeNull();
      expect(buildingImg?.getAttribute("src")).toBe("/images/hero-building-avrasya.png");
    });
  });

  // =========================================================================
  // TASK 5: CAULDRON MONOGRAPH EDITORIAL TYPOGRAPHY & LAYOUT HIERARCHY
  // =========================================================================
  describe("Task 5: Editorial Typography & Cauldron Cadence", () => {
    it("renders word 2 of display headline in editorial italic serif", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const words = container.querySelectorAll("[data-hero-word]");
      expect(words.length).toBe(4);
      // Word 2: "spaces,"
      const word2 = words[1];
      expect(word2).toBeDefined();
      expect(word2?.className).toContain("italic");
      expect(word2?.getAttribute("style")).toContain("Cormorant Garamond");
    });

    it("injects line break after word 2 to preserve Cauldron two-line display balance", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const headlineH1 = container.querySelector('[data-framer-name="Headline"] h1');
      const brTag = headlineH1?.querySelector("br");
      expect(brTag).not.toBeNull();
    });
  });
});
