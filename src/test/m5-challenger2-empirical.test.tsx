import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Header } from "@/components/site/Chrome";
import { RegionShowcase } from "@/components/site/RegionShowcase";
import { CaldrenLocationsSection } from "@/components/site/CaldrenLocationsSection";
import { CaldrenHeroSection, calculateHero3DTilt } from "@/components/site/CaldrenHeroSection";
import { PartnersSection } from "@/components/site/PartnersSection";
import { PageIdentityLineArt } from "@/components/site/PageIdentityLineArt";
import { splitText } from "@/lib/animation/typography";
import { LanguageProvider } from "@/hooks/useLanguage";
import { DEFAULT_SITE_SETTINGS, DEFAULT_PARTNERS } from "@/admin/demo";
import type { Region } from "@/data/regions";
import type { PropertyRecord } from "@/data/properties";

// Mock router state
let currentMockPathname = "/";
vi.mock("@tanstack/react-router", () => ({
  useRouterState: ({ select }: { select?: (s: any) => any } = {}) => {
    const state = {
      location: {
        pathname: currentMockPathname,
        search: {},
      },
    };
    return select ? select(state) : state;
  },
  Link: ({
    to,
    search,
    children,
    onClick,
    className,
    "aria-label": ariaLabel,
    role,
    ...rest
  }: any) => (
    <a
      href={
        search
          ? `${to}?${new URLSearchParams(search).toString()}`
          : typeof to === "string"
            ? to
            : JSON.stringify(to)
      }
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
      }}
      className={className}
      aria-label={ariaLabel}
      role={role}
      {...rest}
    >
      {children}
    </a>
  ),
}));

// Mock Supabase to ensure zero external network calls
vi.mock("@/lib/supabase", () => ({
  DEMO_MODE: true,
  SUPABASE_URL: "https://mock.supabase.co",
}));

// Mock site settings store
vi.mock("@/admin/store", () => ({
  useSiteSettings: () => ({
    ...DEFAULT_SITE_SETTINGS,
    navigationItems: [
      { label: "Home", href: "/", order: 1, is_visible: true },
      { label: "Properties", href: "/properties", order: 2, is_visible: true },
      { label: "Locations", href: "/locations", order: 3, is_visible: true },
      { label: "Services", href: "/services", order: 4, is_visible: true },
      { label: "About", href: "/about", order: 5, is_visible: true },
      { label: "Contact", href: "/contact", order: 6, is_visible: true },
    ],
  }),
  useAdminAuth: () => ({ isAuthenticated: false, user: null }),
}));

const mockRegions: Region[] = [
  {
    slug: "istanbul",
    name: "Istanbul",
    country: "Türkiye",
    summary: "Bosphorus heritage and financial powerhouse.",
    heroImage: "/images/properties/hero-main.jpg",
    districts: ["Beşiktaş", "Sarıyer", "Kadiköy"],
    hasSides: true,
    published: true,
    sortOrder: 1,
    seoTitle: "Istanbul Real Estate",
    seoDescription: "Istanbul luxury properties",
  },
  {
    slug: "bodrum",
    name: "Bodrum",
    country: "Türkiye",
    summary: "Aegean luxury riviera and yachting marinas.",
    heroImage: "/images/properties/sisli-residence.jpg",
    districts: ["Yalıkavak", "Türkbükü"],
    hasSides: false,
    published: true,
    sortOrder: 2,
    seoTitle: "Bodrum Real Estate",
    seoDescription: "Bodrum coastal villas",
  },
  {
    slug: "antalya",
    name: "Antalya",
    country: "Türkiye",
    summary: "Mediterranean turquoise coast and golf resorts.",
    heroImage: "/images/properties/hero-main.jpg",
    districts: ["Konyaaltı", "Lara", "Kemer"],
    hasSides: false,
    published: true,
    sortOrder: 3,
    seoTitle: "Antalya Real Estate",
    seoDescription: "Antalya resort living",
  },
];

const mockProperties: PropertyRecord[] = [
  {
    id: "prop-1",
    slug: "aurelia-bosphorus",
    title: "Aurelia Bosphorus",
    marketing_title: "Aurelia Bosphorus Residence",
    price: 1850000,
    currency: "USD",
    city: "Istanbul",
    location_label: "Beşiktaş",
    district: "Beşiktaş",
    bedrooms: 3,
    bathrooms: 2,
    area_sqm: 180,
    cover: "/images/properties/hero-main.jpg",
    featured: true,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as any,
];

describe("Milestone M5 Empirical Challenger 2: Cross-Viewport, Stress & Interaction Integrity", () => {
  const originalMatchMedia = window.matchMedia;
  const originalInnerWidth = window.innerWidth;
  let queryClient: QueryClient;

  const setViewportWidth = (width: number) => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: width,
    });
    window.dispatchEvent(new Event("resize"));
  };

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>{children}</LanguageProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    document.body.innerHTML = "";
    document.body.style.overflow = "";
    currentMockPathname = "/";
    setViewportWidth(1280);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    document.body.style.overflow = "";
    window.matchMedia = originalMatchMedia;
    setViewportWidth(originalInnerWidth);
  });

  // =========================================================================
  // 1. Sovereign Asset Cryptographic Integrity & Size Invariant
  // =========================================================================
  describe("1. Sovereign Asset Cryptographic Integrity & Size Invariant", () => {
    it("empirically checks hero-building-avrasya.png hash and exact byte size", () => {
      const assetPath = path.resolve(process.cwd(), "public/images/hero-building-avrasya.png");
      expect(fs.existsSync(assetPath)).toBe(true);

      const fileBuffer = fs.readFileSync(assetPath);
      expect(fileBuffer.length).toBe(1024060);

      const computedHash = crypto
        .createHash("sha256")
        .update(fileBuffer)
        .digest("hex")
        .toUpperCase();

      const expectedHash = "978BDB310BFDB282EE5269E04E3D2F012CB0BDCF93821BEA684E2AF9BDDE064C";

      expect(computedHash).toBe(expectedHash);
    });
  });

  // =========================================================================
  // 2. Responsive Breakpoint Boundaries (<1024px vs >=1024px, <1280px)
  // =========================================================================
  describe("2. Responsive Breakpoint Boundaries", () => {
    describe("Header Mobile Drawer (<1280px / xl)", () => {
      it("renders mobile hamburger trigger and opens accessible drawer on mobile viewports (<1280px)", () => {
        setViewportWidth(1024);
        render(<Header />, { wrapper: createWrapper() });

        // Hamburger button must exist and have accessible label
        const hamburgerBtn = screen.getByRole("button", { name: /open menu/i });
        expect(hamburgerBtn).toBeInTheDocument();
        expect(hamburgerBtn).toHaveAttribute("aria-expanded", "false");

        // Drawer should not be in DOM initially
        expect(screen.queryByRole("dialog", { name: /mobile navigation drawer/i })).toBeNull();

        // Click to open
        fireEvent.click(hamburgerBtn);
        expect(hamburgerBtn).toHaveAttribute("aria-expanded", "true");

        // Drawer must now be present with accessible dialog semantics
        const drawer = screen.getByRole("dialog", { name: /mobile navigation drawer/i });
        expect(drawer).toBeInTheDocument();
        expect(drawer).toHaveAttribute("aria-modal", "true");
        expect(document.body.style.overflow).toBe("hidden");

        // Pressing Escape closes drawer and restores scroll
        fireEvent.keyDown(window, { key: "Escape" });
        expect(screen.queryByRole("dialog", { name: /mobile navigation drawer/i })).toBeNull();
        expect(document.body.style.overflow).toBe("");
      });

      it("closes drawer when a navigation link inside drawer is clicked", () => {
        setViewportWidth(768);
        render(<Header />, { wrapper: createWrapper() });

        const hamburgerBtn = screen.getByRole("button", { name: /open menu/i });
        fireEvent.click(hamburgerBtn);

        const drawer = screen.getByRole("dialog", { name: /mobile navigation drawer/i });
        expect(drawer).toBeInTheDocument();

        // Find a link inside the drawer
        const propertiesLink = within(drawer).getByRole("link", { name: /^properties/i });
        fireEvent.click(propertiesLink);

        expect(screen.queryByRole("dialog", { name: /mobile navigation drawer/i })).toBeNull();
        expect(document.body.style.overflow).toBe("");
      });
    });

    describe("RegionShowcase.tsx Breakpoint Behavior (<1024px vs >=1024px)", () => {
      it("expands inline accordion on mobile (<1024px) without redirection", () => {
        setViewportWidth(768);
        render(<RegionShowcase regions={mockRegions} properties={mockProperties} />, {
          wrapper: createWrapper(),
        });

        // On mobile, find Bodrum region row button
        const bodrumBtn = screen.getByRole("button", { name: /bodrum/i });
        expect(bodrumBtn).toHaveAttribute("aria-expanded", "false");

        fireEvent.click(bodrumBtn);
        expect(bodrumBtn).toHaveAttribute("aria-expanded", "true");

        // Should expand and show Explore Properties link for bodrum
        const exploreLinks = screen.getAllByRole("link", { name: /explore properties/i });
        expect(exploreLinks.length).toBeGreaterThan(0);
        const bodrumExplore = exploreLinks.find((l) =>
          l.getAttribute("href")?.includes("region=bodrum"),
        );
        expect(bodrumExplore).toBeDefined();
      });

      it("ignores onMouseEnter when width < 1024px (mobile), responds when width >= 1024px (desktop)", () => {
        // Mobile: < 1024px
        setViewportWidth(768);
        const { unmount } = render(
          <RegionShowcase regions={mockRegions} properties={mockProperties} />,
          { wrapper: createWrapper() },
        );

        const bodrumBtnMobile = screen.getByRole("button", { name: /bodrum/i });
        fireEvent.mouseEnter(bodrumBtnMobile);
        // Shouldn't expand purely on hover on mobile
        expect(bodrumBtnMobile).toHaveAttribute("aria-expanded", "false");
        unmount();

        // Desktop: >= 1024px
        setViewportWidth(1280);
        render(<RegionShowcase regions={mockRegions} properties={mockProperties} />, {
          wrapper: createWrapper(),
        });

        const bodrumBtnDesktop = screen.getByRole("button", { name: /bodrum/i });
        fireEvent.mouseEnter(bodrumBtnDesktop);
        // Should expand on hover on desktop
        expect(bodrumBtnDesktop).toHaveAttribute("aria-expanded", "true");
      });
    });

    describe("CaldrenLocationsSection.tsx Breakpoint Behavior (<1024px vs >=1024px)", () => {
      it("renders prev/next buttons on mobile (<1024px) and navigates cyclically", () => {
        setViewportWidth(768);
        render(<CaldrenLocationsSection regions={mockRegions} />, {
          wrapper: createWrapper(),
        });

        const prevBtn = screen.getByLabelText("Previous location");
        const nextBtn = screen.getByLabelText("Next location");
        expect(prevBtn).toBeInTheDocument();
        expect(nextBtn).toBeInTheDocument();

        // Initial location heading
        const heading = screen.getByRole("heading", { level: 3 });
        const initialText = heading.textContent;
        expect(initialText).toBe("Istanbul");

        // Click next -> changes heading to Bodrum
        fireEvent.click(nextBtn);
        expect(heading.textContent).toBe("Bodrum");

        // Click prev -> returns to Istanbul
        fireEvent.click(prevBtn);
        expect(heading.textContent).toBe("Istanbul");
      });

      it("ignores onMouseEnter for location tabs on mobile (<1024px), activates on desktop (>=1024px)", () => {
        // Mobile
        setViewportWidth(768);
        const { unmount } = render(<CaldrenLocationsSection regions={mockRegions} />, {
          wrapper: createWrapper(),
        });

        const tabsMobile = screen.getAllByRole("tab");
        expect(tabsMobile.length).toBeGreaterThan(1);
        const initialHeadingMobile = screen.getByRole("heading", { level: 3 }).textContent;

        const secondTabMobile = tabsMobile[1]!;
        fireEvent.mouseEnter(secondTabMobile);
        // Heading should not change on hover on mobile
        expect(screen.getByRole("heading", { level: 3 }).textContent).toBe(initialHeadingMobile);
        unmount();

        // Desktop
        setViewportWidth(1280);
        render(<CaldrenLocationsSection regions={mockRegions} />, {
          wrapper: createWrapper(),
        });

        const tabsDesktop = screen.getAllByRole("tab");
        const initialHeadingDesktop = screen.getByRole("heading", { level: 3 }).textContent;

        const secondTabDesktop = tabsDesktop[1]!;
        fireEvent.mouseEnter(secondTabDesktop);
        // Heading SHOULD change on hover on desktop
        expect(screen.getByRole("heading", { level: 3 }).textContent).not.toBe(
          initialHeadingDesktop,
        );
      });
    });
  });

  // =========================================================================
  // 3. Extreme Rapid State Changes & Concurrency Stress
  // =========================================================================
  describe("3. Extreme Rapid State Changes & Concurrency Stress", () => {
    it("stress-tests rapid consecutive region toggles without state de-sync", () => {
      setViewportWidth(768);
      render(<RegionShowcase regions={mockRegions} properties={mockProperties} />, {
        wrapper: createWrapper(),
      });

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(1);

      // Fire 30 rapid clicks across buttons
      for (let i = 0; i < 30; i++) {
        const btn = buttons[i % buttons.length]!;
        fireEvent.click(btn);
      }

      // Check DOM is healthy and no uncaught exceptions thrown
      const exploreLinks = screen.getAllByRole("link", { name: /explore properties/i });
      expect(exploreLinks.length).toBeGreaterThan(0);
    });

    it("stress-tests 50 rapid sequential clicks on Locations Prev/Next controls", () => {
      setViewportWidth(768);
      render(<CaldrenLocationsSection regions={mockRegions} />, {
        wrapper: createWrapper(),
      });

      const nextBtn = screen.getByLabelText("Next location");
      const prevBtn = screen.getByLabelText("Previous location");

      for (let i = 0; i < 50; i++) {
        if (i % 2 === 0) {
          fireEvent.click(nextBtn);
        } else {
          fireEvent.click(prevBtn);
        }
      }

      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading.textContent).toBeTruthy();
    });

    it("stress-tests rapid open/close cycles on Mobile Navigation Drawer", () => {
      setViewportWidth(768);
      render(<Header />, { wrapper: createWrapper() });

      const hamburgerBtn = screen.getByRole("button", { name: /open menu/i });

      // 20 rapid toggles
      for (let i = 0; i < 20; i++) {
        fireEvent.click(hamburgerBtn);
      }

      // After an even number of toggles (20), drawer must be closed and body overflow reset
      expect(screen.queryByRole("dialog", { name: /mobile navigation drawer/i })).toBeNull();
      expect(document.body.style.overflow).toBe("");
    });
  });

  // =========================================================================
  // 4. Kinetic SplitText Typography Accessibility & DOM Integrity
  // =========================================================================
  describe("4. Kinetic SplitText Typography Accessibility & DOM Integrity", () => {
    it("verifies PartnersSection preserves accessible heading role and aria-label", () => {
      render(<PartnersSection partners={DEFAULT_PARTNERS} />);

      const heading = screen.getByRole("heading", { name: /references and partners/i });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAttribute("aria-label", "References and Partners");
    });

    it("verifies pure splitText utility correctly splits Turkish unicode characters and reverts cleanly", () => {
      const testContainer = document.createElement("div");
      const originalText = "TÜRKİYE'NİN EN SEÇKİN LÜKS YAŞAM ALANLARI";
      testContainer.textContent = originalText;
      document.body.appendChild(testContainer);

      const split = splitText(testContainer, { type: "words,chars" });
      expect(split.words.length).toBe(6);
      expect(split.chars.length).toBeGreaterThan(30);

      // Verify character elements contain unicode characters
      const hasUmlaut = split.chars.some((c) => c.textContent === "Ü" || c.textContent === "İ");
      expect(hasUmlaut).toBe(true);

      // Clean revert
      split.revert();
      expect(testContainer.textContent).toBe(originalText);
      testContainer.remove();
    });

    it("handles edge cases in splitText: empty string, single word, long string", () => {
      const container = document.createElement("div");
      container.textContent = "";
      const splitEmpty = splitText(container, { type: "words,chars" });
      expect(splitEmpty.words.length).toBe(0);
      expect(splitEmpty.chars.length).toBe(0);
      splitEmpty.revert();

      container.textContent = "Luxury";
      const splitSingle = splitText(container, { type: "words,chars" });
      expect(splitSingle.words.length).toBe(1);
      expect(splitSingle.chars.length).toBe(6);
      splitSingle.revert();
      expect(container.textContent).toBe("Luxury");
    });
  });

  // =========================================================================
  // 5. 3D Tilt Physics & Hero Composition Invariants
  // =========================================================================
  describe("5. 3D Tilt Physics & Hero Composition Invariants", () => {
    it("calculates clamped and normalized tilt values in calculateHero3DTilt", () => {
      const rect = { left: 100, top: 100, width: 800, height: 600 };

      // Center pointer: 0 rotation, sheen at 50%
      const center = calculateHero3DTilt(500, 400, rect);
      expect(center.rotateX).toBe(0);
      expect(center.rotateY).toBe(0);
      expect(center.sheenX).toBe(50);
      expect(center.sheenY).toBe(50);

      // Extreme top-left pointer: bounded rotation
      const extremeTopLeft = calculateHero3DTilt(-1000, -1000, rect);
      expect(extremeTopLeft.rotateY).toBe(-6); // clampedX = -0.6 * 10
      expect(extremeTopLeft.rotateX).toBe(4.8); // clampedY = -0.6 * -8
      expect(extremeTopLeft.sheenX).toBe(-10); // (-0.6 + 0.5) * 100 = -10

      // Extreme bottom-right pointer: bounded rotation
      const extremeBottomRight = calculateHero3DTilt(2000, 2000, rect);
      expect(extremeBottomRight.rotateY).toBe(6);
      expect(extremeBottomRight.rotateX).toBe(-4.8);
      expect(extremeBottomRight.sheenX).toBe(110); // (0.6 + 0.5) * 100 = 110

      // Invalid rect fallback
      const invalidRect = calculateHero3DTilt(100, 100, { left: 0, top: 0, width: 0, height: 0 });
      expect(invalidRect.rotateX).toBe(0);
      expect(invalidRect.rotateY).toBe(0);
    });

    it("verifies CaldrenHeroSection does not render canvas starfield", () => {
      render(<CaldrenHeroSection settings={DEFAULT_SITE_SETTINGS} featuredProperty={undefined} />, {
        wrapper: createWrapper(),
      });

      // Should not contain any canvas elements
      const canvases = document.querySelectorAll("canvas");
      expect(canvases.length).toBe(0);
    });
  });

  // =========================================================================
  // 6. PageIdentityLineArt Component Invariants
  // =========================================================================
  describe("6. PageIdentityLineArt Component Invariants", () => {
    it("strictly returns null on '/', '/properties', '/locations', and '/admin'", () => {
      const routesToExclude = [
        "/",
        "/properties",
        "/properties/bosphorus-penthouse",
        "/locations",
        "/locations/istanbul",
        "/admin",
        "/admin/cms",
      ];

      routesToExclude.forEach((route) => {
        currentMockPathname = route;
        const { container, unmount } = render(<PageIdentityLineArt />);
        expect(container.firstChild).toBeNull();
        unmount();
      });
    });

    it("renders line art typography with aria-hidden='true' on secondary routes", () => {
      currentMockPathname = "/about";
      const { container } = render(<PageIdentityLineArt />);

      const wrapper = container.querySelector("[aria-hidden='true']");
      expect(wrapper).toBeInTheDocument();
      expect(wrapper?.textContent).toContain("ABOUT");
      expect(wrapper?.textContent).toContain("AVRASYA");
    });
  });
});
