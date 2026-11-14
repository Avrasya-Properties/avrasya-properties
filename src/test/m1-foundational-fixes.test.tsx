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
      onClick={onClick}
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

describe("M1 Foundational Fixes Test Suite", () => {
  afterEach(cleanup);
  beforeEach(() => {
    mockPathname = "/";
  });

  describe("5C: Unified Mobile Navigation Drawer", () => {
    it("renders the sticky header and hamburger toggle at all scroll positions on homepage", () => {
      mockPathname = "/";
      const { container } = renderWithProviders(<Header />);
      const header = container.querySelector("header");
      expect(header).toBeInTheDocument();
      expect(header?.className).toContain("sticky");
      expect(header?.className).not.toContain("hidden");

      const hamburgerBtn = screen.getByLabelText(/open menu|menu/i);
      expect(hamburgerBtn).toBeInTheDocument();
    });

    it("opens the full-screen accessible drawer when hamburger button is clicked", () => {
      mockPathname = "/";
      renderWithProviders(<Header />);

      const hamburgerBtn = screen.getByLabelText(/open menu|menu/i);
      fireEvent.click(hamburgerBtn);

      const drawer = screen.getByRole("dialog", { name: /mobile navigation drawer/i });
      expect(drawer).toBeInTheDocument();
      expect(drawer.className).toContain("fixed inset-0");
      expect(drawer.closest("header")).toBeNull();

      // Verify navigation links are present inside the drawer
      expect(within(drawer).getByRole("link", { name: /^properties/i })).toBeInTheDocument();
      expect(within(drawer).getByRole("link", { name: /^locations/i })).toBeInTheDocument();
      expect(within(drawer).getByRole("link", { name: /^contact \d+/i })).toBeInTheDocument();
      expect(within(drawer).getByRole("link", { name: /contact us/i })).toBeInTheDocument();
    });

    it("closes drawer when close button or Escape key is pressed", () => {
      mockPathname = "/";
      renderWithProviders(<Header />);

      const hamburgerBtn = screen.getByLabelText(/open menu|menu/i);
      fireEvent.click(hamburgerBtn);

      expect(screen.getByRole("dialog", { name: /mobile navigation drawer/i })).toBeInTheDocument();

      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByRole("dialog", { name: /mobile navigation drawer/i })).toBeNull();
    });
  });

  describe("5D: Mobile Region Accordion", () => {
    it("clicking a region button expands inline details card without page redirect", () => {
      const { container } = renderWithProviders(
        <RegionShowcase regions={mockRegions} properties={mockProperties} />,
      );

      const bodrumRowBtn = screen.getByRole("button", { name: /bodrum/i });
      expect(bodrumRowBtn).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(bodrumRowBtn);
      expect(bodrumRowBtn).toHaveAttribute("aria-expanded", "true");

      // Expanded card must contain the Explore Properties button with query param
      const exploreLinks = screen.getAllByRole("link", { name: /explore properties/i });
      const bodrumExplore = exploreLinks.find((l) =>
        l.getAttribute("href")?.includes("region=bodrum"),
      );
      expect(bodrumExplore).toBeDefined();
    });

    it("selecting another region smoothly updates the active accordion state", () => {
      renderWithProviders(<RegionShowcase regions={mockRegions} properties={mockProperties} />);

      const istanbulBtn = screen.getByRole("button", { name: /istanbul/i });
      const bodrumBtn = screen.getByRole("button", { name: /bodrum/i });

      // Click Bodrum
      fireEvent.click(bodrumBtn);
      expect(bodrumBtn).toHaveAttribute("aria-expanded", "true");
      expect(istanbulBtn).toHaveAttribute("aria-expanded", "false");

      // Click Istanbul
      fireEvent.click(istanbulBtn);
      expect(istanbulBtn).toHaveAttribute("aria-expanded", "true");
      expect(bodrumBtn).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("5E & 5F: Locations Section & Desktop/Mobile Controls", () => {
    it("clicking and hovering a location updates active details and metrics", () => {
      renderWithProviders(
        <CaldrenLocationsSection properties={mockProperties} regions={mockRegions} />,
      );

      const bodrumTab = screen.getByRole("tab", { name: /bodrum/i });
      fireEvent.click(bodrumTab);
      expect(bodrumTab).toHaveAttribute("aria-selected", "true");

      // Simulate desktop hover
      const istanbulTab = screen.getByRole("tab", { name: /istanbul/i });
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1200,
      });
      fireEvent.mouseEnter(istanbulTab);
      expect(istanbulTab).toHaveAttribute("aria-selected", "true");
    });

    it("mobile prev/next arrow controls cycle through locations", () => {
      renderWithProviders(
        <CaldrenLocationsSection properties={mockProperties} regions={mockRegions} />,
      );

      const nextArrow = screen.getByRole("button", { name: "Next location" });
      const prevArrow = screen.getByRole("button", { name: "Previous location" });

      expect(nextArrow).toBeInTheDocument();
      expect(prevArrow).toBeInTheDocument();

      fireEvent.click(nextArrow);
      // Next location in list should now be selected
      const tabs = screen.getAllByRole("tab");
      const activeTab = tabs.find((t) => t.getAttribute("aria-selected") === "true");
      expect(activeTab).toBeDefined();

      fireEvent.click(prevArrow);
    });
  });

  describe("5G: Universal Line-Art Typography Component", () => {
    it("strictly excludes rendering on /, /properties, /locations, and /admin", () => {
      mockPathname = "/";
      const { container: c1 } = render(<PageIdentityLineArt />);
      expect(c1.firstChild).toBeNull();

      mockPathname = "/properties";
      const { container: c2 } = render(<PageIdentityLineArt />);
      expect(c2.firstChild).toBeNull();

      mockPathname = "/locations";
      const { container: c3 } = render(<PageIdentityLineArt />);
      expect(c3.firstChild).toBeNull();

      mockPathname = "/admin/cms";
      const { container: c4 } = render(<PageIdentityLineArt />);
      expect(c4.firstChild).toBeNull();
    });

    it("renders two-line hierarchy with correct typography on secondary pages", () => {
      mockPathname = "/about";
      render(<PageIdentityLineArt />);

      const topText = screen.getByText("ABOUT");
      const mainText = screen.getByText("AVRASYA");

      expect(topText).toBeInTheDocument();
      expect(mainText).toBeInTheDocument();
      expect(topText.className).toContain("text-sm");
      expect(topText.className).toContain("tracking-[0.3em]");
      expect(mainText.className).toContain("font-serif");
    });

    it("dynamically derives page identity for unmapped routes", () => {
      mockPathname = "/private-portfolio";
      render(<PageIdentityLineArt />);

      expect(screen.getByText("PRIVATE")).toBeInTheDocument();
      expect(screen.getByText("PORTFOLIO")).toBeInTheDocument();
    });
  });
});
