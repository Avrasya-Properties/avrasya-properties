import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React from "react";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from "@/components/site/Chrome";
import { CaldrenLocationsSection, REGIONS_DATA } from "@/components/site/CaldrenLocationsSection";
import { RegionShowcase } from "@/components/site/RegionShowcase";
import { PageIdentityLineArt } from "@/components/site/PageIdentityLineArt";
import { LanguageProvider } from "@/hooks/useLanguage";
import type { Region } from "@/data/regions";
import type { PropertyRecord } from "@/data/properties";

let mockPathname = "/";
vi.mock("@tanstack/react-router", () => ({
  useRouterState: ({ select }: { select: (s: any) => any }) =>
    select({ location: { pathname: mockPathname } }),
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

vi.mock("@/lib/supabase", () => ({ DEMO_MODE: true, SUPABASE_URL: "https://mock.supabase.co" }));
vi.mock("@/admin/store", () => ({
  useSiteSettings: () => ({
    companyName: "Avrasya Properties",
    email: "info@avrasyaproperties.com",
    phone: "+90 545 924 80 42",
    whatsapp: "https://wa.me/905459248042",
    address: "Istanbul, Turkey",
    tagline: "Luxury Real Estate",
    advisoryHours: "09:00 - 18:00",
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
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>{ui}</LanguageProvider>
    </QueryClientProvider>,
  );
}

const mockRegions: Region[] = [
  {
    slug: "istanbul",
    name: "Istanbul",
    country: "Türkiye",
    summary: "Bosphorus heritage and prime financial towers.",
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

describe("Milestone M1 Challenger Adversarial Verification Suite", () => {
  beforeEach(() => {
    mockPathname = "/";
    document.body.style.overflow = "";
  });

  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. SOVEREIGN ASSET CRYPTOGRAPHIC INTEGRITY
  // =========================================================================
  describe("Task 5: Sovereign Asset Cryptographic Integrity", () => {
    it("cryptographically verifies SHA-256 hash of public/images/hero-building-avrasya.png", () => {
      const assetPath = path.resolve(__dirname, "../../public/images/hero-building-avrasya.png");
      expect(fs.existsSync(assetPath)).toBe(true);

      const fileBuffer = fs.readFileSync(assetPath);
      expect(fileBuffer.length).toBeGreaterThan(0);

      const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex").toUpperCase();
      const expectedHash = "978BDB310BFDB282EE5269E04E3D2F012CB0BDCF93821BEA684E2AF9BDDE064C";

      expect(hash).toBe(expectedHash);
    });
  });

  // =========================================================================
  // 2. MOBILE NAVIGATION DRAWER & SCROLL LOCK ADVERSARIAL STRESS
  // =========================================================================
  describe("Task 1: Mobile Navigation Drawer & Edge Case Resilience", () => {
    it("renders sticky header permanently across all scroll states without hidden class", () => {
      mockPathname = "/";
      const { container } = renderWithProviders(<Header />);
      const header = container.querySelector("header");
      expect(header).toBeInTheDocument();
      expect(header?.className).toContain("sticky");
      expect(header?.className).not.toContain("hidden");

      // Verify hamburger button exists and is labeled
      const hamburger = screen.getByLabelText(/open menu|menu/i);
      expect(hamburger).toBeInTheDocument();
      expect(hamburger).toHaveAttribute("aria-expanded", "false");
    });

    it("locks body scroll on drawer open and unlocks body scroll on close", () => {
      mockPathname = "/";
      renderWithProviders(<Header />);

      expect(document.body.style.overflow).toBe("");

      const hamburger = screen.getByLabelText(/open menu|menu/i);
      fireEvent.click(hamburger);

      // Scroll lock MUST be active
      expect(document.body.style.overflow).toBe("hidden");
      expect(screen.getByRole("dialog", { name: /mobile navigation drawer/i })).toBeInTheDocument();

      // Find close button inside drawer
      const closeButtons = screen.getAllByRole("button", { name: /close navigation|close menu/i });
      fireEvent.click(closeButtons[0]!);

      // Scroll lock MUST be restored
      expect(document.body.style.overflow).toBe("");
      expect(screen.queryByRole("dialog", { name: /mobile navigation drawer/i })).toBeNull();
    });

    it("dismisses drawer on Escape key and cleans up listeners without errors", () => {
      mockPathname = "/";
      renderWithProviders(<Header />);

      const hamburger = screen.getByLabelText(/open menu|menu/i);
      fireEvent.click(hamburger);
      expect(screen.getByRole("dialog", { name: /mobile navigation drawer/i })).toBeInTheDocument();
      expect(document.body.style.overflow).toBe("hidden");

      // Trigger Escape key
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByRole("dialog", { name: /mobile navigation drawer/i })).toBeNull();
      expect(document.body.style.overflow).toBe("");

      // Pressing Escape while already closed does not throw or mutate overflow
      expect(() => {
        fireEvent.keyDown(window, { key: "Escape" });
      }).not.toThrow();
      expect(document.body.style.overflow).toBe("");
    });

    it("resets document.body.style.overflow if component unmounts while drawer is open", () => {
      mockPathname = "/";
      const { unmount } = renderWithProviders(<Header />);

      const hamburger = screen.getByLabelText(/open menu|menu/i);
      fireEvent.click(hamburger);
      expect(document.body.style.overflow).toBe("hidden");

      // Unmount while open (simulating route switch or abrupt navigation)
      unmount();
      expect(document.body.style.overflow).toBe("");
    });

    it("closes drawer when any mobile navigation route link is clicked", () => {
      mockPathname = "/";
      renderWithProviders(<Header />);

      const hamburger = screen.getByLabelText(/open menu|menu/i);
      fireEvent.click(hamburger);

      const drawer = screen.getByRole("dialog", { name: /mobile navigation drawer/i });
      expect(drawer).toBeInTheDocument();

      // Click on Properties link
      const propertiesLink = within(drawer).getByRole("link", { name: /^properties/i });
      fireEvent.click(propertiesLink);

      // Drawer should now be closed
      expect(screen.queryByRole("dialog", { name: /mobile navigation drawer/i })).toBeNull();
      expect(document.body.style.overflow).toBe("");
    });

    it("renders formatted two-digit indices (01, 02...) for all drawer navigation items", () => {
      mockPathname = "/";
      renderWithProviders(<Header />);

      const hamburger = screen.getByLabelText(/open menu|menu/i);
      fireEvent.click(hamburger);

      const drawer = screen.getByRole("dialog", { name: /mobile navigation drawer/i });
      expect(within(drawer).getByText("01")).toBeInTheDocument();
      expect(within(drawer).getByText("02")).toBeInTheDocument();
      expect(within(drawer).getByText("03")).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 3. REGION SHOWCASE MOBILE ACCORDION ADVERSARIAL STRESS
  // =========================================================================
  describe("Task 2: Mobile Region Accordion Resilience & Zero-Redirect", () => {
    it("region buttons use type='button' and never trigger page navigation", () => {
      renderWithProviders(<RegionShowcase regions={mockRegions} properties={mockProperties} />);

      const regionButtons = screen.getAllByRole("button", {
        name: /istanbul|bodrum|antalya|sakarya/i,
      });
      expect(regionButtons.length).toBeGreaterThanOrEqual(4);

      for (const btn of regionButtons) {
        expect(btn).toHaveAttribute("type", "button");
        expect(btn.tagName.toLowerCase()).toBe("button");
      }
    });

    it("clicking a region expands its inline card with photo, districts, and valid Explore link", () => {
      renderWithProviders(<RegionShowcase regions={mockRegions} properties={mockProperties} />);

      const bodrumBtn = screen.getByRole("button", { name: /bodrum/i });
      fireEvent.click(bodrumBtn);
      expect(bodrumBtn).toHaveAttribute("aria-expanded", "true");

      const bodrumCard = document.getElementById("region-content-bodrum");
      expect(bodrumCard).toBeInTheDocument();
      expect(bodrumCard?.className).toContain("grid-rows-[1fr]");

      // Verify photo, summary, and districts
      const img = bodrumCard?.querySelector("img");
      expect(img).toBeInTheDocument();
      expect(bodrumCard?.textContent).toContain("Yalıkavak");

      // Verify Explore Properties link has correct search params
      const exploreLinks = within(bodrumCard!).getAllByRole("link", {
        name: /explore properties/i,
      });
      expect(exploreLinks.length).toBe(1);
      expect(exploreLinks[0]!.getAttribute("href")).toBe("/properties?region=bodrum");
    });

    it("clicking the active region collapses it cleanly", () => {
      renderWithProviders(<RegionShowcase regions={mockRegions} properties={mockProperties} />);

      const istanbulBtn = screen.getByRole("button", { name: /istanbul/i });
      // Default active is istanbul
      expect(istanbulBtn).toHaveAttribute("aria-expanded", "true");

      // Clicking istanbul should toggle it off
      fireEvent.click(istanbulBtn);
      expect(istanbulBtn).toHaveAttribute("aria-expanded", "false");
    });

    it("switching between regions smoothly toggles aria-expanded states", () => {
      renderWithProviders(<RegionShowcase regions={mockRegions} properties={mockProperties} />);

      const istanbulBtn = screen.getByRole("button", { name: /istanbul/i });
      const antalyaBtn = screen.getByRole("button", { name: /antalya/i });

      fireEvent.click(antalyaBtn);
      expect(antalyaBtn).toHaveAttribute("aria-expanded", "true");
      expect(istanbulBtn).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(istanbulBtn);
      expect(istanbulBtn).toHaveAttribute("aria-expanded", "true");
      expect(antalyaBtn).toHaveAttribute("aria-expanded", "false");
    });

    it("desktop hover switches active region only when window.innerWidth >= 1024", () => {
      renderWithProviders(<RegionShowcase regions={mockRegions} properties={mockProperties} />);

      const bodrumBtn = screen.getByRole("button", { name: /bodrum/i });
      const sakaryaBtn = screen.getByRole("button", { name: /sakarya/i });

      // On mobile viewport (width < 1024), hover should NOT trigger switch
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });
      fireEvent.click(bodrumBtn);
      expect(bodrumBtn).toHaveAttribute("aria-expanded", "true");

      fireEvent.mouseEnter(sakaryaBtn);
      // Still bodrum on mobile
      expect(bodrumBtn).toHaveAttribute("aria-expanded", "true");
      expect(sakaryaBtn).toHaveAttribute("aria-expanded", "false");

      // On desktop viewport (width >= 1024), hover MUST switch active region
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1280,
      });
      fireEvent.mouseEnter(sakaryaBtn);
      expect(sakaryaBtn).toHaveAttribute("aria-expanded", "true");
      expect(bodrumBtn).toHaveAttribute("aria-expanded", "false");
    });

    it("handles empty regions array gracefully without crashing", () => {
      expect(() => {
        renderWithProviders(<RegionShowcase regions={[]} properties={[]} />);
      }).not.toThrow();

      // Falls back to REGION_PRESETS (e.g. Antalya, Bodrum)
      expect(screen.getByRole("button", { name: /antalya/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /bodrum/i })).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 4. LOCATIONS SECTION CONTROLS & BOUNDARY TESTS
  // =========================================================================
  describe("Task 3: CaldrenLocationsSection Desktop/Mobile Controls & Index Boundaries", () => {
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

    it("wraps around boundary indexes when using mobile prev/next arrow buttons", () => {
      renderWithProviders(
        <CaldrenLocationsSection properties={mockProperties} regions={mockRegions} />,
      );

      const prevBtn = screen.getByRole("button", { name: "Previous location" });
      const nextBtn = screen.getByRole("button", { name: "Next location" });

      // Initially active is Istanbul (index 0)
      const istanbulTab = screen.getByRole("tab", { name: /istanbul/i });
      expect(istanbulTab).toHaveAttribute("aria-selected", "true");

      // Clicking PREV from index 0 should wrap around to index 3 (Sakarya)
      fireEvent.click(prevBtn);
      const sakaryaTab = screen.getByRole("tab", { name: /sakarya/i });
      expect(sakaryaTab).toHaveAttribute("aria-selected", "true");

      // Clicking NEXT from index 3 should wrap back around to index 0 (Istanbul)
      fireEvent.click(nextBtn);
      expect(istanbulTab).toHaveAttribute("aria-selected", "true");

      // Clicking NEXT 4 times completes full cycle
      for (let i = 0; i < 4; i++) {
        fireEvent.click(nextBtn);
      }
      expect(istanbulTab).toHaveAttribute("aria-selected", "true");
    });

    it("on-image touch arrows also navigate prev and next locations", () => {
      renderWithProviders(
        <CaldrenLocationsSection properties={mockProperties} regions={mockRegions} />,
      );

      const onImagePrev = screen.getByRole("button", { name: "Previous location photo" });
      const onImageNext = screen.getByRole("button", { name: "Next location photo" });

      expect(onImagePrev).toBeInTheDocument();
      expect(onImageNext).toBeInTheDocument();

      // Click on-image Next
      fireEvent.click(onImageNext);
      const bodrumTab = screen.getByRole("tab", { name: /bodrum/i });
      expect(bodrumTab).toHaveAttribute("aria-selected", "true");

      // Click on-image Prev
      fireEvent.click(onImagePrev);
      const istanbulTab = screen.getByRole("tab", { name: /istanbul/i });
      expect(istanbulTab).toHaveAttribute("aria-selected", "true");
    });

    it("desktop hover switches active region only when width >= 1024", () => {
      renderWithProviders(
        <CaldrenLocationsSection properties={mockProperties} regions={mockRegions} />,
      );

      const istanbulTab = screen.getByRole("tab", { name: /istanbul/i });
      const antalyaTab = screen.getByRole("tab", { name: /antalya/i });

      // Mobile: hover ignored
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 480,
      });
      fireEvent.mouseEnter(antalyaTab);
      expect(istanbulTab).toHaveAttribute("aria-selected", "true");
      expect(antalyaTab).toHaveAttribute("aria-selected", "false");

      // Desktop: hover activates
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1200,
      });
      fireEvent.mouseEnter(antalyaTab);
      expect(antalyaTab).toHaveAttribute("aria-selected", "true");
      expect(istanbulTab).toHaveAttribute("aria-selected", "false");
    });

    it("resiliently renders with zero properties and fallback data", () => {
      expect(() => {
        renderWithProviders(<CaldrenLocationsSection properties={[]} regions={[]} />);
      }).not.toThrow();

      expect(screen.getByText("Four regions,")).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 5. UNIVERSAL LINE-ART TYPOGRAPHY ADVERSARIAL STRESS
  // =========================================================================
  describe("Task 4: Universal Line-Art Typography Exclusions & Edge Paths", () => {
    it("strictly returns null on all forbidden paths", () => {
      const forbiddenPaths = [
        "/",
        "",
        "/properties",
        "/properties/",
        "/properties/aurelia-bosphorus",
        "/properties/any-slug/nested",
        "/locations",
        "/locations/",
        "/locations/istanbul",
        "/admin",
        "/admin/",
        "/admin/cms",
        "/admin/settings",
        "/admin/properties/123",
        "/admin/media",
      ];

      for (const forbidden of forbiddenPaths) {
        mockPathname = forbidden;
        const { container } = render(<PageIdentityLineArt />);
        expect(container.firstChild, `Expected null for path: ${forbidden}`).toBeNull();
        cleanup();
      }
    });

    it("renders mapped route pairs with two-line typographic hierarchy", () => {
      const mappings: Record<string, [string, string]> = {
        "/about": ["ABOUT", "AVRASYA"],
        "/services": ["OUR", "SERVICES"],
        "/citizenship": ["GLOBAL", "CITIZENSHIP"],
        "/why-turkiye": ["WHY", "TÜRKİYE"],
        "/calculator": ["INVESTMENT", "CALCULATOR"],
        "/contact": ["PRIVATE", "OFFICE"],
        "/privacy-policy": ["LEGAL", "PRIVACY"],
        "/terms": ["TERMS OF", "SERVICE"],
      };

      for (const [route, [expectedTop, expectedMain]] of Object.entries(mappings)) {
        mockPathname = route;
        render(<PageIdentityLineArt />);

        const topEl = screen.getByText(expectedTop);
        const mainEl = screen.getByText(expectedMain);

        expect(topEl).toBeInTheDocument();
        expect(mainEl).toBeInTheDocument();

        // Check CSS styling classes
        expect(topEl.className).toContain("text-sm");
        expect(topEl.className).toContain("font-mono");
        expect(topEl.className).toContain("tracking-[0.3em]");
        expect(mainEl.className).toContain("font-serif");
        expect(mainEl.className).toContain("text-5xl");

        cleanup();
      }
    });

    it("derives route identity dynamically for hyphenated and nested unmapped paths", () => {
      const edgeCases: [string, string, string][] = [
        ["/luxury-villas", "LUXURY", "VILLAS"],
        ["/coastal-living-turkey", "COASTAL", "LIVING TURKEY"],
        ["/singleword", "AVRASYA", "SINGLEWORD"],
        ["/luxury-villas/nested/ignored", "LUXURY", "VILLAS"],
      ];

      for (const [route, expectedTop, expectedMain] of edgeCases) {
        mockPathname = route;
        render(<PageIdentityLineArt />);

        expect(screen.getByText(expectedTop)).toBeInTheDocument();
        expect(screen.getByText(expectedMain)).toBeInTheDocument();

        cleanup();
      }
    });

    it("allows customTop and customMain or title and subtitle props to override", () => {
      mockPathname = "/about";
      render(
        <PageIdentityLineArt
          title="Custom Title"
          subtitle="Custom Sub"
          className="test-custom-class"
        />,
      );

      expect(screen.getByText("CUSTOM SUB")).toBeInTheDocument();
      expect(screen.getByText("CUSTOM TITLE")).toBeInTheDocument();
      cleanup();

      render(<PageIdentityLineArt customTop="Manual Top" customMain="Manual Main" />);

      expect(screen.getByText("MANUAL TOP")).toBeInTheDocument();
      expect(screen.getByText("MANUAL MAIN")).toBeInTheDocument();
    });
  });
});
