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
import { LanguageProvider } from "@/hooks/useLanguage";
import { DEFAULT_SITE_SETTINGS, DEFAULT_PARTNERS, type SiteSettings } from "@/admin/demo";
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
    children,
    onClick,
    search,
    className,
    "aria-label": ariaLabel,
    role,
    ...rest
  }: any) => {
    const href = search ? `${to}?${new URLSearchParams(search).toString()}` : to;
    return (
      <a
        href={href}
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
    );
  },
}));

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  DEMO_MODE: true,
  SUPABASE_URL: "https://mock.supabase.co",
}));

// Mock Site Settings Store
vi.mock("@/admin/store", () => ({
  useSiteSettings: () => ({
    ...DEFAULT_SITE_SETTINGS,
    companyName: "Avrasya Properties",
    email: "info@avrasyaproperties.com",
    phone: "+90 545 924 80 42",
    whatsapp: "https://wa.me/905459248042",
    address: "Istanbul, Turkey",
    navigationItems: [
      { label: "Home", href: "/", order: 1, is_visible: true },
      { label: "Properties", href: "/properties", order: 2, is_visible: true },
      { label: "Locations", href: "/locations", order: 3, is_visible: true },
      { label: "Services", href: "/services", order: 4, is_visible: true },
      { label: "About", href: "/about", order: 5, is_visible: true },
      { label: "Contact", href: "/contact", order: 6, is_visible: true },
    ],
    announcementActive: false,
    headerCta: { label: "Schedule Consultation", href: "/contact", is_visible: true },
  }),
  useAdminAuth: () => ({ isAuthenticated: false, user: null }),
  recordPublicEnquiry: vi.fn().mockResolvedValue({ id: "mock-enquiry-1" }),
}));

const mockRegions: Region[] = [
  {
    slug: "istanbul",
    name: "Istanbul",
    country: "Türkiye",
    summary: "Bosphorus heritage and prime financial towers.",
    heroImage: "/images/properties/hero-main.jpg",
    districts: ["Beşiktaş", "Sarıyer", "Kadıköy"],
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
    summary: "Mediterranean coastline and resort living.",
    heroImage: "/images/properties/bosphorus-terrace.jpg",
    districts: ["Lara", "Konyaaltı"],
    hasSides: false,
    published: true,
    sortOrder: 3,
    seoTitle: "Antalya Real Estate",
    seoDescription: "Antalya luxury villas",
  },
  {
    slug: "sakarya",
    name: "Sakarya",
    country: "Türkiye",
    summary: "Sapanca lakefront estates and mountain sanctuaries.",
    heroImage: "/images/properties/orya-park-exterior.jpg",
    districts: ["Sapanca", "Serdivan"],
    hasSides: false,
    published: true,
    sortOrder: 4,
    seoTitle: "Sakarya Real Estate",
    seoDescription: "Sakarya retreat estates",
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
  {
    id: "prop-2",
    slug: "yalikavak-horizon",
    title: "Yalıkavak Horizon",
    marketing_title: "Yalıkavak Horizon Cliffside Villa",
    price: 1250000,
    currency: "USD",
    city: "Bodrum",
    location_label: "Yalıkavak",
    district: "Yalıkavak",
    bedrooms: 4,
    bathrooms: 3,
    area_sqm: 260,
    cover: "/images/properties/sisli-residence.jpg",
    featured: true,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as any,
];

describe("Milestone M5 Empirical Challenger 1: Adversarial Verification Suite", () => {
  let queryClient: QueryClient;

  function renderWithProviders(ui: React.ReactElement) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>{ui}</LanguageProvider>
      </QueryClientProvider>,
    );
  }

  beforeEach(() => {
    currentMockPathname = "/";
    document.body.innerHTML = "";
    document.body.style.overflow = "";
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1280,
    });
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    document.body.style.overflow = "";
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. SOVEREIGN ASSET CRYPTOGRAPHIC INTEGRITY
  // =========================================================================
  describe("1. Sovereign Asset Cryptographic SHA-256 Invariant", () => {
    it("cryptographically verifies SHA-256 hash and byte length of hero-building-avrasya.png", () => {
      const assetPath = path.resolve(__dirname, "../../public/images/hero-building-avrasya.png");
      expect(fs.existsSync(assetPath)).toBe(true);

      const buffer = fs.readFileSync(assetPath);
      expect(buffer.length).toBe(1024060);

      const hash = crypto.createHash("sha256").update(buffer).digest("hex").toUpperCase();
      expect(hash).toBe("978BDB310BFDB282EE5269E04E3D2F012CB0BDCF93821BEA684E2AF9BDDE064C");
    });
  });

  // =========================================================================
  // 2. MULTI-VIEWPORT LAYOUT TRANSITIONS & 3D HERO (5A & 5B)
  // =========================================================================
  describe("2. Multi-Viewport Layout Transitions & 3D Hero Composition", () => {
    it("verifies mobile solitary CTA is hidden on desktop (lg:hidden) and points to /properties", () => {
      const { container } = renderWithProviders(
        <CaldrenHeroSection settings={DEFAULT_SITE_SETTINGS} locale="en" t={{}} />,
      );

      const mobileCta = container.querySelector("[data-mobile-solitary-cta]");
      expect(mobileCta).toBeInTheDocument();
      expect(mobileCta?.className).toContain("lg:hidden");

      const link = mobileCta?.querySelector("a");
      expect(link).toBeInTheDocument();
      expect(link?.getAttribute("href")).toBe("/properties");
      expect(link?.textContent).toContain("Explore Properties");
    });

    it("verifies desktop flanking controls and badges are hidden on mobile viewports", () => {
      const { container } = renderWithProviders(
        <CaldrenHeroSection settings={DEFAULT_SITE_SETTINGS} locale="en" t={{}} />,
      );

      const desktopControls = [
        '[data-framer-name="Showreel"]',
        '[data-framer-name="Intro"]',
        '[data-framer-name="Birds"]',
        '[data-framer-name="Keep Scrolling"]',
        '[data-framer-name="Pin Wrap"]',
        '[data-framer-name="Discover"]',
      ];

      for (const selector of desktopControls) {
        const el = container.querySelector(selector);
        expect(el, `Expected ${selector} to exist in DOM`).toBeInTheDocument();
        expect(el?.closest(".hidden.lg\\:block")).toBeInTheDocument();
      }
    });

    it("verifies hero source code stages solitary CTA reveal at 1.75s after 3D property entrance", () => {
      const heroCodePath = path.resolve(__dirname, "../components/site/CaldrenHeroSection.tsx");
      const heroCode = fs.readFileSync(heroCodePath, "utf-8");

      expect(heroCode).toContain("duration: 1.6");
      expect(heroCode).toContain("1.75,");
      expect(heroCode).toContain("gsap.set(mobileCtaRef.current, { y: 20, opacity: 0 });");
    });

    it("verifies calculateHero3DTilt handles extreme negative, positive, and center coordinates", () => {
      const rect = { left: 100, top: 100, width: 800, height: 600 };

      // Exact center: rotateX=0, rotateY=0, sheenX=50, sheenY=50
      const center = calculateHero3DTilt(500, 400, rect);
      expect(center.rotateX).toBe(0);
      expect(center.rotateY).toBe(0);
      expect(center.sheenX).toBe(50);
      expect(center.sheenY).toBe(50);

      // Extreme left: rotateY clamped to -6, sheenX clamped to -10
      const extremeLeft = calculateHero3DTilt(-5000, 400, rect);
      expect(extremeLeft.rotateY).toBe(-6);
      expect(extremeLeft.sheenX).toBe(-10);

      // Extreme right: rotateY clamped to 6, sheenX clamped to 110
      const extremeRight = calculateHero3DTilt(5000, 400, rect);
      expect(extremeRight.rotateY).toBe(6);
      expect(extremeRight.sheenX).toBe(110);
    });

    it("verifies zero canvas elements exist within CaldrenHeroSection", () => {
      const { container } = renderWithProviders(
        <CaldrenHeroSection settings={DEFAULT_SITE_SETTINGS} locale="en" t={{}} />,
      );
      expect(container.querySelectorAll("canvas").length).toBe(0);
    });
  });

  // =========================================================================
  // 3. MOBILE NAVIGATION DRAWER LIFECYCLE & SCROLL-LOCK (5C)
  // =========================================================================
  describe("3. Mobile Navigation Drawer Lifecycle & Scroll-Lock Invariants", () => {
    it("renders sticky header permanently across all scroll states without hidden class", () => {
      const { container } = renderWithProviders(<Header />);
      const header = container.querySelector("header");
      expect(header).toBeInTheDocument();
      expect(header?.className).toContain("sticky");
      expect(header?.className).not.toContain("hidden");

      const hamburger = screen.getByLabelText(/open menu|menu/i);
      expect(hamburger).toBeInTheDocument();
      expect(hamburger).toHaveAttribute("aria-expanded", "false");
    });

    it("locks body scroll to hidden when open and releases to empty string when closed", () => {
      renderWithProviders(<Header />);
      expect(document.body.style.overflow).toBe("");

      const hamburger = screen.getByLabelText(/open menu|menu/i);
      fireEvent.click(hamburger);

      expect(document.body.style.overflow).toBe("hidden");
      const drawer = screen.getByRole("dialog", { name: /mobile navigation drawer/i });
      expect(drawer).toBeInTheDocument();
      expect(drawer).toHaveAttribute("aria-modal", "true");

      const closeBtn = within(drawer).getByRole("button", { name: /close menu|close navigation/i });
      fireEvent.click(closeBtn);

      expect(document.body.style.overflow).toBe("");
      expect(screen.queryByRole("dialog", { name: /mobile navigation drawer/i })).toBeNull();
    });

    it("releases body scroll lock when Escape key is pressed", () => {
      renderWithProviders(<Header />);

      const hamburger = screen.getByLabelText(/open menu|menu/i);
      fireEvent.click(hamburger);
      expect(document.body.style.overflow).toBe("hidden");

      fireEvent.keyDown(window, { key: "Escape" });
      expect(document.body.style.overflow).toBe("");
      expect(screen.queryByRole("dialog", { name: /mobile navigation drawer/i })).toBeNull();
    });

    it("releases body scroll lock if Header unmounts while drawer is open", () => {
      const { unmount } = renderWithProviders(<Header />);

      const hamburger = screen.getByLabelText(/open menu|menu/i);
      fireEvent.click(hamburger);
      expect(document.body.style.overflow).toBe("hidden");

      unmount();
      expect(document.body.style.overflow).toBe("");
    });

    it("closes drawer when clicking on any navigation link inside drawer", () => {
      renderWithProviders(<Header />);

      const hamburger = screen.getByLabelText(/open menu|menu/i);
      fireEvent.click(hamburger);

      const drawer = screen.getByRole("dialog", { name: /mobile navigation drawer/i });
      const propertiesLink = within(drawer).getByRole("link", { name: /^properties/i });
      fireEvent.click(propertiesLink);

      expect(screen.queryByRole("dialog", { name: /mobile navigation drawer/i })).toBeNull();
      expect(document.body.style.overflow).toBe("");
    });

    it("stress-tests 30 rapid open/close toggles without desyncing body scroll state", () => {
      renderWithProviders(<Header />);
      const hamburger = screen.getByLabelText(/open menu|menu/i);

      for (let i = 0; i < 30; i++) {
        fireEvent.click(hamburger);
      }

      // After 30 toggles (even number), drawer must be closed and overflow reset
      expect(screen.queryByRole("dialog", { name: /mobile navigation drawer/i })).toBeNull();
      expect(document.body.style.overflow).toBe("");
    });
  });

  // =========================================================================
  // 4. MOBILE REGION ACCORDION DYNAMIC SWITCHING & NON-REDIRECTION (5D)
  // =========================================================================
  describe("4. Mobile Region Accordion Dynamic Switching & Non-Redirection", () => {
    it("ensures all region triggers are buttons with type='button' and never redirect", () => {
      renderWithProviders(<RegionShowcase regions={mockRegions} properties={mockProperties} />);

      const buttons = screen.getAllByRole("button", { name: /istanbul|bodrum|antalya|sakarya/i });
      expect(buttons.length).toBe(4);

      for (const btn of buttons) {
        expect(btn).toHaveAttribute("type", "button");
        expect(btn.tagName.toLowerCase()).toBe("button");
      }
    });

    it("dynamically switches active content between regions without page reload", () => {
      renderWithProviders(<RegionShowcase regions={mockRegions} properties={mockProperties} />);

      const istanbulBtn = screen.getByRole("button", { name: /istanbul/i });
      const bodrumBtn = screen.getByRole("button", { name: /bodrum/i });
      const antalyaBtn = screen.getByRole("button", { name: /antalya/i });

      // Istanbul initially open
      expect(istanbulBtn).toHaveAttribute("aria-expanded", "true");

      // Switch to Bodrum
      fireEvent.click(bodrumBtn);
      expect(bodrumBtn).toHaveAttribute("aria-expanded", "true");
      expect(istanbulBtn).toHaveAttribute("aria-expanded", "false");

      const bodrumCard = document.getElementById("region-content-bodrum");
      expect(bodrumCard?.className).toContain("grid-rows-[1fr]");
      expect(bodrumCard?.textContent).toContain("Yalıkavak");

      const exploreLink = within(bodrumCard!).getByRole("link", { name: /explore properties/i });
      expect(exploreLink.getAttribute("href")).toBe("/properties?region=bodrum");

      // Switch to Antalya
      fireEvent.click(antalyaBtn);
      expect(antalyaBtn).toHaveAttribute("aria-expanded", "true");
      expect(bodrumBtn).toHaveAttribute("aria-expanded", "false");
    });

    it("clicking the active region collapses it cleanly", () => {
      renderWithProviders(<RegionShowcase regions={mockRegions} properties={mockProperties} />);

      const istanbulBtn = screen.getByRole("button", { name: /istanbul/i });
      expect(istanbulBtn).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(istanbulBtn);
      expect(istanbulBtn).toHaveAttribute("aria-expanded", "false");
    });

    it("ignores hover on mobile (< 1024px) and responds to hover on desktop (>= 1024px)", () => {
      renderWithProviders(<RegionShowcase regions={mockRegions} properties={mockProperties} />);

      const bodrumBtn = screen.getByRole("button", { name: /bodrum/i });
      const sakaryaBtn = screen.getByRole("button", { name: /sakarya/i });

      // Mobile: hover ignored
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 480,
      });
      fireEvent.click(bodrumBtn);
      expect(bodrumBtn).toHaveAttribute("aria-expanded", "true");

      fireEvent.mouseEnter(sakaryaBtn);
      expect(bodrumBtn).toHaveAttribute("aria-expanded", "true");
      expect(sakaryaBtn).toHaveAttribute("aria-expanded", "false");

      // Desktop: hover switches
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1280,
      });
      fireEvent.mouseEnter(sakaryaBtn);
      expect(sakaryaBtn).toHaveAttribute("aria-expanded", "true");
      expect(bodrumBtn).toHaveAttribute("aria-expanded", "false");
    });
  });

  // =========================================================================
  // 5. LOCATIONS SECTION SYNCHRONIZATION & MODULAR BOUNDARY WRAPPING (5E & 5F)
  // =========================================================================
  describe("5. Locations Section Synchronization & Modular Boundary Wrapping", () => {
    it("renders tabs for all regions with index numbers", () => {
      renderWithProviders(
        <CaldrenLocationsSection properties={mockProperties} regions={mockRegions} />,
      );

      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBe(4);
      expect(tabs[0]?.textContent).toContain("01");
      expect(tabs[0]?.textContent).toContain("Istanbul");
      expect(tabs[1]?.textContent).toContain("02");
      expect(tabs[1]?.textContent).toContain("Bodrum");
    });

    it("wraps cyclically across boundaries using mobile prev and next buttons", () => {
      renderWithProviders(
        <CaldrenLocationsSection properties={mockProperties} regions={mockRegions} />,
      );

      const prevBtn = screen.getByRole("button", { name: "Previous location" });
      const nextBtn = screen.getByRole("button", { name: "Next location" });

      const istanbulTab = screen.getByRole("tab", { name: /istanbul/i });
      expect(istanbulTab).toHaveAttribute("aria-selected", "true");

      // Previous from 0 wraps to 3 (Sakarya)
      fireEvent.click(prevBtn);
      const sakaryaTab = screen.getByRole("tab", { name: /sakarya/i });
      expect(sakaryaTab).toHaveAttribute("aria-selected", "true");

      // Next from 3 wraps back to 0 (Istanbul)
      fireEvent.click(nextBtn);
      expect(istanbulTab).toHaveAttribute("aria-selected", "true");
    });

    it("on-image touch arrows also navigate cyclically", () => {
      renderWithProviders(
        <CaldrenLocationsSection properties={mockProperties} regions={mockRegions} />,
      );

      const nextPhotoBtn = screen.getByRole("button", { name: "Next location photo" });
      const prevPhotoBtn = screen.getByRole("button", { name: "Previous location photo" });

      fireEvent.click(nextPhotoBtn);
      const bodrumTab = screen.getByRole("tab", { name: /bodrum/i });
      expect(bodrumTab).toHaveAttribute("aria-selected", "true");

      fireEvent.click(prevPhotoBtn);
      const istanbulTab = screen.getByRole("tab", { name: /istanbul/i });
      expect(istanbulTab).toHaveAttribute("aria-selected", "true");
    });

    it("desktop hover switches active location tab only when width >= 1024", () => {
      renderWithProviders(
        <CaldrenLocationsSection properties={mockProperties} regions={mockRegions} />,
      );

      const istanbulTab = screen.getByRole("tab", { name: /istanbul/i });
      const antalyaTab = screen.getByRole("tab", { name: /antalya/i });

      // Mobile: hover ignored
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });
      fireEvent.mouseEnter(antalyaTab);
      expect(istanbulTab).toHaveAttribute("aria-selected", "true");
      expect(antalyaTab).toHaveAttribute("aria-selected", "false");

      // Desktop: hover switches
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1440,
      });
      fireEvent.mouseEnter(antalyaTab);
      expect(antalyaTab).toHaveAttribute("aria-selected", "true");
      expect(istanbulTab).toHaveAttribute("aria-selected", "false");
    });

    it("stress-tests 60 rapid alternating clicks on Next/Prev controls without throwing", () => {
      renderWithProviders(
        <CaldrenLocationsSection properties={mockProperties} regions={mockRegions} />,
      );

      const nextBtn = screen.getByRole("button", { name: "Next location" });
      const prevBtn = screen.getByRole("button", { name: "Previous location" });

      expect(() => {
        for (let i = 0; i < 60; i++) {
          if (i % 2 === 0) fireEvent.click(nextBtn);
          else fireEvent.click(prevBtn);
        }
      }).not.toThrow();

      const istanbulTab = screen.getByRole("tab", { name: /istanbul/i });
      expect(istanbulTab).toHaveAttribute("aria-selected", "true");
    });
  });

  // =========================================================================
  // 6. PAGE-SPECIFIC LINE-ART TYPOGRAPHY EXCLUSION & INCLUSION (5G)
  // =========================================================================
  describe("6. Page-Specific Line-Art Typography Exclusion & Inclusion", () => {
    it("strictly returns null on all forbidden paths: /, /properties, /locations, /admin", () => {
      const forbidden = [
        "/",
        "",
        "/properties",
        "/properties/",
        "/properties/aurelia-bosphorus",
        "/locations",
        "/locations/",
        "/locations/istanbul",
        "/admin",
        "/admin/cms",
        "/admin/settings",
      ];

      for (const route of forbidden) {
        currentMockPathname = route;
        const { container } = render(<PageIdentityLineArt />);
        expect(container.firstChild, `Forbidden on ${route}`).toBeNull();
        cleanup();
      }
    });

    it("renders two-line typography with smaller upper and larger lower word on secondary routes", () => {
      const validSecondaryRoutes = [
        { path: "/about", top: "ABOUT", main: "AVRASYA" },
        { path: "/services", top: "OUR", main: "SERVICES" },
        { path: "/why-turkiye", top: "WHY", main: "TÜRKİYE" },
        { path: "/citizenship", top: "GLOBAL", main: "CITIZENSHIP" },
      ];

      for (const { path: route, top, main } of validSecondaryRoutes) {
        currentMockPathname = route;
        render(<PageIdentityLineArt />);

        const topEl = screen.getByText(top);
        const mainEl = screen.getByText(main);

        expect(topEl).toBeInTheDocument();
        expect(mainEl).toBeInTheDocument();

        // Enforce font classes: smaller upper and larger lower word
        expect(topEl.className).toContain("text-sm");
        expect(topEl.className).toContain("tracking-[0.3em]");
        expect(mainEl.className).toContain("text-5xl");
        expect(mainEl.className).toContain("font-serif");

        cleanup();
      }
    });
  });

  // =========================================================================
  // 7. PARTNERS ACCESSIBLE NAME HARDENING
  // =========================================================================
  describe("7. Partners Accessible Name Hardening", () => {
    it("renders accessible heading role with aria-label preserved across kinetic SplitText", () => {
      renderWithProviders(<PartnersSection partners={DEFAULT_PARTNERS} />);

      const heading = screen.getByRole("heading", { name: /partners & references/i });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAttribute("aria-label", "Partners & References");
    });
  });
});
