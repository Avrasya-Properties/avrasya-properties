import { render, screen, cleanup } from "@testing-library/react";
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

describe("Challenger 2 Empirical Verification: Milestone M3", () => {
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

  // -------------------------------------------------------------------------
  // 1. Total absence of CaldrenSkyStars, canvas elements, wireframe box towers
  // -------------------------------------------------------------------------
  describe("Task 1: Background & 3D Elements Cleanliness", () => {
    it("verifies total absence of canvas elements in hero DOM", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const canvases = container.querySelectorAll("canvas");
      expect(canvases.length).toBe(0);
    });

    it("verifies absence of Three.js wireframe box tower canvas or skyline scene", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      expect(container.querySelector("[data-skyline-canvas]")).toBeNull();
      expect(container.querySelector("canvas")).toBeNull();
    });

    it("verifies section background is grounded in #0B1619 monograph", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const hero = container.querySelector("[data-home-hero]");
      expect(hero).not.toBeNull();
      expect(hero?.getAttribute("data-bg-monograph")).toBe("#0B1619");
      const style = hero?.getAttribute("style") || "";
      expect(style.includes("#0B1619") || style.includes("rgb(11, 22, 25)")).toBe(true);
      expect(style).not.toContain("#989681");
    });
  });

  // -------------------------------------------------------------------------
  // 2. CSS 3D perspective wrapper and tilt limits
  // -------------------------------------------------------------------------
  describe("Task 2: CSS 3D Perspective Wrapper & Pointer Tilt Tracking", () => {
    const dummyRect = { left: 100, top: 100, width: 200, height: 200 };

    it("verifies container has perspective 1200px and volumetric container has preserve-3d", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const stage = container.querySelector("[data-3d-stage]");
      expect(stage).not.toBeNull();
      expect(stage?.getAttribute("data-perspective")).toBe("1200px");

      const volumetricContainer = container.querySelector("[data-3d-volumetric-container]");
      expect(volumetricContainer).not.toBeNull();
      expect(volumetricContainer?.getAttribute("data-transform-style")).toBe("preserve-3d");
    });

    it("verifies 4-plane 3D multi-plane structure with correct translateZ assignments", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const plane0 = container.querySelector('[data-plane="ground-plane"]');
      const plane1 = container.querySelector('[data-plane="ground-shadow"]');
      const plane2 = container.querySelector('[data-plane="building-asset"]');
      const plane3 = container.querySelector('[data-plane="specular-glaze"]');

      expect(plane0).not.toBeNull();
      expect(plane0?.getAttribute("style")).toContain("translateZ(-15px)");

      expect(plane1).not.toBeNull();
      expect(plane1?.getAttribute("style")).toContain("translateZ(-30px)");

      expect(plane2).not.toBeNull();
      expect(plane2?.getAttribute("style")).toContain("translateZ(10px)");

      expect(plane3).not.toBeNull();
      expect(plane3?.getAttribute("style")).toContain("translateZ(25px)");
    });

    it("empirically tests pointer movement with normalized edge coordinates (-1, -1) to (1, 1)", () => {
      // Center (normX = 0, normY = 0)
      const center = calculateHero3DTilt(200, 200, dummyRect);
      expect(center.rotateX).toBe(0);
      expect(center.rotateY).toBe(0);

      // Element right boundary: clientX = 300, clientY = 200 -> normX = 0.5, normY = 0
      const rightEdge = calculateHero3DTilt(300, 200, dummyRect);
      expect(rightEdge.rotateY).toBe(5);
      expect(rightEdge.rotateX).toBe(0);

      // Element left boundary: clientX = 100, clientY = 200 -> normX = -0.5, normY = 0
      const leftEdge = calculateHero3DTilt(100, 200, dummyRect);
      expect(leftEdge.rotateY).toBe(-5);
      expect(leftEdge.rotateX).toBe(0);

      // Element bottom boundary: clientX = 200, clientY = 300 -> normX = 0, normY = 0.5
      const bottomEdge = calculateHero3DTilt(200, 300, dummyRect);
      expect(bottomEdge.rotateX).toBe(-4);
      expect(bottomEdge.rotateY).toBe(0);

      // Element top boundary: clientX = 200, clientY = 100 -> normX = 0, normY = -0.5
      const topEdge = calculateHero3DTilt(200, 100, dummyRect);
      expect(topEdge.rotateX).toBe(4);
      expect(topEdge.rotateY).toBe(0);

      // Normalized edge coordinates (-1, -1) relative to half-dimensions:
      // clientX = 0 (normX = -1), clientY = 0 (normY = -1)
      const topLeftNormalized = calculateHero3DTilt(0, 0, dummyRect);
      // Normalized edge coordinates (1, 1):
      // clientX = 400 (normX = 1), clientY = 400 (normY = 1)
      const bottomRightNormalized = calculateHero3DTilt(400, 400, dummyRect);

      // Check rotateY limit [-6, 6]
      expect(topLeftNormalized.rotateY).toBe(-6);
      expect(bottomRightNormalized.rotateY).toBe(6);

      // Note: for rotateX, clampedY is clamped to [-0.6, 0.6], giving:
      // -0.6 * 8 = -4.8 at bottom and +4.8 at top
      expect(topLeftNormalized.rotateX).toBe(4.8);
      expect(bottomRightNormalized.rotateX).toBe(-4.8);
    });

    it("verifies zero rect handling does not produce NaN", () => {
      const res = calculateHero3DTilt(0, 0, { left: 0, top: 0, width: 0, height: 0 });
      expect(res.rotateX).toBe(0);
      expect(res.rotateY).toBe(0);
      expect(res.translateZ).toBe(0);
      expect(res.sheenX).toBe(50);
      expect(res.sheenY).toBe(50);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Mobile viewport layout (< 768px)
  // -------------------------------------------------------------------------
  describe("Task 3: Mobile Viewport Layout & Staged CTA Reveal", () => {
    it("verifies solitary 'Explore Properties' CTA is present and responsive", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const solitaryCtaWrapper = container.querySelector("[data-mobile-solitary-cta]");
      expect(solitaryCtaWrapper).not.toBeNull();
      // Must be visible on mobile and hidden on desktop (lg:hidden)
      expect(solitaryCtaWrapper?.className).toContain("lg:hidden");

      const link = solitaryCtaWrapper?.querySelector('a[href="/properties"]');
      expect(link).not.toBeNull();
      expect(link?.textContent).toContain("Explore Properties");
    });

    it("verifies desktop flanking elements are hidden on mobile (< lg)", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      // The flanking desktop container has hidden lg:block
      const desktopFlanking = container.querySelector(
        '[data-framer-name="Frame"] > .hidden.lg\\:block',
      );
      expect(desktopFlanking).not.toBeNull();

      // Showreel, intro copy, birds, keep scrolling, discover are inside desktop container
      expect(desktopFlanking?.querySelector('[data-framer-name="Showreel"]')).not.toBeNull();
      expect(desktopFlanking?.querySelector('[data-framer-name="Intro"]')).not.toBeNull();
      expect(desktopFlanking?.querySelector('[data-framer-name="Birds"]')).not.toBeNull();
      expect(desktopFlanking?.querySelector('[data-framer-name="Keep Scrolling"]')).not.toBeNull();
      expect(desktopFlanking?.querySelector('[data-framer-name="Discover"]')).not.toBeNull();
    });

    it("verifies CTA button reveal timing in CaldrenHeroSection source code", () => {
      const heroCode = fs.readFileSync(
        path.resolve(__dirname, "../components/site/CaldrenHeroSection.tsx"),
        "utf-8",
      );
      // Building entrance completes at 0.12 + 1.6 = 1.72s
      expect(heroCode).toMatch(/duration:\s*1\.6/);
      expect(heroCode).toMatch(/0\.12/);
      // Mobile CTA reveals at 1.75s (after building completes at 1.72s)
      expect(heroCode).toMatch(/1\.75/);
    });
  });

  // -------------------------------------------------------------------------
  // 4. Sovereign asset SHA-256 integrity
  // -------------------------------------------------------------------------
  describe("Task 4: Sovereign Asset Cryptographic Integrity", () => {
    it("verifies hero-building-avrasya.png exists and matches exact SHA-256 hash", () => {
      const assetPath = path.resolve(__dirname, "../../public/images/hero-building-avrasya.png");
      expect(fs.existsSync(assetPath)).toBe(true);

      const buffer = fs.readFileSync(assetPath);
      const hash = crypto.createHash("sha256").update(buffer).digest("hex").toUpperCase();
      const expectedHash = "978BDB310BFDB282EE5269E04E3D2F012CB0BDCF93821BEA684E2AF9BDDE064C";

      expect(hash).toBe(expectedHash);
      expect(buffer.byteLength).toBe(1024060);
    });

    it("verifies hero building image element references hero-building-avrasya.png", () => {
      const { container } = render(
        <CaldrenHeroSection settings={dummySettings} locale="en" t={{}} />,
      );
      const img = container.querySelector('[data-plane="building-asset"] img');
      expect(img).not.toBeNull();
      expect(img?.getAttribute("src")).toContain("hero-building-avrasya.png");
    });
  });
});
