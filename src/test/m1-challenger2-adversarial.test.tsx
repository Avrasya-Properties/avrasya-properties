import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React from "react";
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
    headerCta: { label: "Contact Us", href: "/contact", is_visible: true },
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
    summary: "Mediterranean coastlines and resort residences.",
    heroImage: "/images/properties/bosphorus-terrace.jpg",
    districts: ["Konyaaltı", "Lara"],
    hasSides: false,
    published: true,
    sortOrder: 3,
    seoTitle: "Antalya Real Estate",
    seoDescription: "Antalya properties",
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

describe("Milestone M1 Challenger 2 Empirical Stress Test Suite", () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
  });

  beforeEach(() => {
    mockPathname = "/";
    document.body.style.overflow = "";
  });

  describe("1. Mobile Navigation Drawer & Scroll Lock Resilience", () => {
    it("locks body scroll to hidden when open and releases to empty string when closed via button", () => {
      renderWithProviders(<Header />);

      const hamburger = screen.getByLabelText(/open menu|menu/i);
      expect(document.body.style.overflow).toBe("");

      // Open drawer
      fireEvent.click(hamburger);
      expect(document.body.style.overflow).toBe("hidden");

      // Close drawer via close button inside drawer
      const drawer = screen.getByRole("dialog", { name: /mobile navigation drawer/i });
      const closeBtn = within(drawer).getByLabelText(/close menu|close navigation/i);
      fireEvent.click(closeBtn);
      expect(document.body.style.overflow).toBe("");
    });

    it("releases body scroll lock when Escape key is pressed", () => {
      renderWithProviders(<Header />);

      const hamburger = screen.getByLabelText(/open menu|menu/i);
      fireEvent.click(hamburger);
      expect(document.body.style.overflow).toBe("hidden");

      // Press Escape
      fireEvent.keyDown(window, { key: "Escape" });
      expect(document.body.style.overflow).toBe("");
      expect(screen.queryByRole("dialog", { name: /mobile navigation drawer/i })).toBeNull();
    });

    it("cleans up body scroll lock if unmounted while drawer is open", () => {
      const { unmount } = renderWithProviders(<Header />);

      const hamburger = screen.getByLabelText(/open menu|menu/i);
      fireEvent.click(hamburger);
      expect(document.body.style.overflow).toBe("hidden");

      // Component unmounts (e.g. fast route transition)
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

    it("closes drawer when clicking brand logo inside drawer", () => {
      renderWithProviders(<Header />);

      const hamburger = screen.getByLabelText(/open menu|menu/i);
      fireEvent.click(hamburger);

      const drawer = screen.getByRole("dialog", { name: /mobile navigation drawer/i });
      const logoLink = within(drawer).getByLabelText(/avrasya properties — home/i);

      fireEvent.click(logoLink);
      expect(screen.queryByRole("dialog", { name: /mobile navigation drawer/i })).toBeNull();
    });

    it("closes drawer when clicking CTA consultation link inside drawer", () => {
      renderWithProviders(<Header />);

      const hamburger = screen.getByLabelText(/open menu|menu/i);
      fireEvent.click(hamburger);

      const drawer = screen.getByRole("dialog", { name: /mobile navigation drawer/i });
      const ctaLink = within(drawer).getByRole("link", { name: /contact us\s*→/i });

      fireEvent.click(ctaLink);
      expect(screen.queryByRole("dialog", { name: /mobile navigation drawer/i })).toBeNull();
    });

    it("verifies hamburger aria-expanded reflects open/closed state correctly", () => {
      renderWithProviders(<Header />);

      const hamburger = screen.getByLabelText(/open menu|menu/i);
      expect(hamburger).toHaveAttribute("aria-expanded", "false");
      expect(hamburger).toHaveAttribute("aria-controls", "mobile-nav");

      fireEvent.click(hamburger);
      expect(hamburger).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(hamburger);
      expect(hamburger).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("2. Mobile Region Accordion Resilience", () => {
    it("toggling the currently active region collapses it without page navigation", () => {
      renderWithProviders(<RegionShowcase regions={mockRegions} properties={mockProperties} />);

      // Initially istanbul is active
      const istanbulBtn = screen.getByRole("button", { name: /istanbul/i });
      expect(istanbulBtn).toHaveAttribute("aria-expanded", "true");

      // Click istanbul -> should collapse (accordion allows zero expanded)
      fireEvent.click(istanbulBtn);
      expect(istanbulBtn).toHaveAttribute("aria-expanded", "false");

      // Click again -> should expand
      fireEvent.click(istanbulBtn);
      expect(istanbulBtn).toHaveAttribute("aria-expanded", "true");
    });

    it("switching between multiple regions maintains mutually exclusive open states", () => {
      renderWithProviders(<RegionShowcase regions={mockRegions} properties={mockProperties} />);

      const istanbulBtn = screen.getByRole("button", { name: /istanbul/i });
      const bodrumBtn = screen.getByRole("button", { name: /bodrum/i });
      const antalyaBtn = screen.getByRole("button", { name: /antalya/i });

      // Click Bodrum
      fireEvent.click(bodrumBtn);
      expect(bodrumBtn).toHaveAttribute("aria-expanded", "true");
      expect(istanbulBtn).toHaveAttribute("aria-expanded", "false");
      expect(antalyaBtn).toHaveAttribute("aria-expanded", "false");

      // Click Antalya
      fireEvent.click(antalyaBtn);
      expect(antalyaBtn).toHaveAttribute("aria-expanded", "true");
      expect(bodrumBtn).toHaveAttribute("aria-expanded", "false");
      expect(istanbulBtn).toHaveAttribute("aria-expanded", "false");
    });

    it("explore properties button in expanded card points strictly to /properties?region=<slug>", () => {
      renderWithProviders(<RegionShowcase regions={mockRegions} properties={mockProperties} />);

      const antalyaBtn = screen.getByRole("button", { name: /antalya/i });
      fireEvent.click(antalyaBtn);

      const antalyaContent = document.getElementById("region-content-antalya");
      expect(antalyaContent).not.toBeNull();

      const exploreLink = within(antalyaContent!).getByRole("link", {
        name: /explore properties/i,
      });
      expect(exploreLink).toHaveAttribute("href", "/properties?region=antalya");
    });

    it("handles regions with 0 published properties gracefully with fallback notice", () => {
      renderWithProviders(<RegionShowcase regions={mockRegions} properties={[]} />);

      const bodrumContent = document.getElementById("region-content-bodrum");
      expect(bodrumContent).toBeInTheDocument();
      expect(
        within(bodrumContent!).getByText(/private investment portfolio available on request/i),
      ).toBeInTheDocument();
    });

    it("ignores mouseEnter on mobile viewports (< 1024px) to prevent scroll accidental flips", () => {
      renderWithProviders(<RegionShowcase regions={mockRegions} properties={mockProperties} />);

      const bodrumBtn = screen.getByRole("button", { name: /bodrum/i });
      expect(bodrumBtn).toHaveAttribute("aria-expanded", "false");

      // Emulate mobile width
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 768,
      });
      fireEvent.mouseEnter(bodrumBtn);

      // Should still be false on mobile
      expect(bodrumBtn).toHaveAttribute("aria-expanded", "false");

      // Emulate desktop width
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1280,
      });
      fireEvent.mouseEnter(bodrumBtn);

      // Now should switch to true on desktop
      expect(bodrumBtn).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("3. Locations Section Controls & Index Boundary Wrapping", () => {
    it("wraps around from index 0 to last location when clicking prev arrow", () => {
      renderWithProviders(
        <CaldrenLocationsSection properties={mockProperties} regions={mockRegions} />,
      );

      const tabs = screen.getAllByRole("tab");
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");

      const prevArrow = screen.getByRole("button", { name: "Previous location" });
      fireEvent.click(prevArrow);

      // Last tab should now be selected
      const updatedTabs = screen.getAllByRole("tab");
      expect(updatedTabs[updatedTabs.length - 1]).toHaveAttribute("aria-selected", "true");
      expect(updatedTabs[0]).toHaveAttribute("aria-selected", "false");
    });

    it("wraps around from last location to index 0 when clicking next arrow", () => {
      renderWithProviders(
        <CaldrenLocationsSection properties={mockProperties} regions={mockRegions} />,
      );

      const nextArrow = screen.getByRole("button", { name: "Next location" });

      // Click next until we reach last tab, then once more to wrap
      for (let i = 0; i < mockRegions.length; i++) {
        fireEvent.click(nextArrow);
      }

      const tabs = screen.getAllByRole("tab");
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });

    it("handles empty properties and empty regions safely using fallback data", () => {
      const { container } = renderWithProviders(
        <CaldrenLocationsSection properties={[]} regions={[]} />,
      );

      expect(container.querySelector("section")).toBeInTheDocument();
      // REGIONS_DATA has 4 default regions
      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBe(REGIONS_DATA.length);
    });
  });

  describe("4. Universal Line-Art Typography Exclusions & Edge Paths", () => {
    it("strictly returns null for /", () => {
      mockPathname = "/";
      const { container } = render(<PageIdentityLineArt />);
      expect(container.firstChild).toBeNull();
    });

    it("strictly returns null for /properties and nested property slugs", () => {
      mockPathname = "/properties";
      const { container: c1 } = render(<PageIdentityLineArt />);
      expect(c1.firstChild).toBeNull();

      mockPathname = "/properties/aurelia-bosphorus-penthouse";
      const { container: c2 } = render(<PageIdentityLineArt />);
      expect(c2.firstChild).toBeNull();
    });

    it("strictly returns null for /locations and nested location slugs", () => {
      mockPathname = "/locations";
      const { container: c1 } = render(<PageIdentityLineArt />);
      expect(c1.firstChild).toBeNull();

      mockPathname = "/locations/istanbul";
      const { container: c2 } = render(<PageIdentityLineArt />);
      expect(c2.firstChild).toBeNull();
    });

    it("strictly returns null for /admin and child admin routes", () => {
      mockPathname = "/admin";
      const { container: c1 } = render(<PageIdentityLineArt />);
      expect(c1.firstChild).toBeNull();

      mockPathname = "/admin/cms/hero";
      const { container: c2 } = render(<PageIdentityLineArt />);
      expect(c2.firstChild).toBeNull();
    });

    it("strictly returns null for empty pathname", () => {
      mockPathname = "";
      const { container } = render(<PageIdentityLineArt />);
      expect(container.firstChild).toBeNull();
    });

    it("derives correct identity for multi-dash unmapped paths", () => {
      mockPathname = "/private-client-services";
      render(<PageIdentityLineArt />);

      expect(screen.getByText("PRIVATE")).toBeInTheDocument();
      expect(screen.getByText("CLIENT SERVICES")).toBeInTheDocument();
    });

    it("derives fallback top AVRASYA for single word paths", () => {
      mockPathname = "/concierge";
      render(<PageIdentityLineArt />);

      expect(screen.getByText("AVRASYA")).toBeInTheDocument();
      expect(screen.getByText("CONCIERGE")).toBeInTheDocument();
    });

    it("allows customTop and customMain prop overrides", () => {
      mockPathname = "/custom-page";
      render(<PageIdentityLineArt customTop="EXCLUSIVE" customMain="PENTHOUSE" />);

      expect(screen.getByText("EXCLUSIVE")).toBeInTheDocument();
      expect(screen.getByText("PENTHOUSE")).toBeInTheDocument();
    });
  });
});
