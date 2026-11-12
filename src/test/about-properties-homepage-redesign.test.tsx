import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PageIdentityLineArt } from "@/components/site/PageIdentityLineArt";
import { PropertyCard } from "@/components/site/PropertyCard";
import { BildoraProjectsShowcase } from "@/components/site/BildoraProjectsShowcase";
import { AboutPage } from "@/routes/about";
import { LanguageProvider } from "@/hooks/useLanguage";
import { DEFAULT_SITE_SETTINGS } from "@/admin/demo";
import { properties } from "@/data/properties";
import { ScrollTrigger } from "@/lib/gsap";

let mockPathname = "/about";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
  useRouterState: ({ select }: { select?: (s: any) => any } = {}) => {
    const state = {
      location: {
        pathname: mockPathname,
        search: {},
      },
    };
    return select ? select(state) : state;
  },
  Link: ({ to, params, children, onClick, className, "aria-label": ariaLabel, ...rest }: any) => {
    const resolvedHref =
      typeof to === "string" && params?.slug ? to.replace("$slug", params.slug) : to;
    return (
      <a
        href={resolvedHref}
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
    );
  },
}));

vi.mock("@/lib/supabase", () => ({
  DEMO_MODE: true,
  SUPABASE_URL: "https://mock.supabase.co",
}));

vi.mock("@/admin/store", () => ({
  useSiteSettings: () => ({
    ...DEFAULT_SITE_SETTINGS,
  }),
  useAdminAuth: () => ({ isAuthenticated: false, user: null }),
}));

vi.mock("@/data/live", () => ({
  useCatalogue: () => ({
    data: properties,
    properties,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useManagedPage: () => ({ data: null, isError: false }),
}));

describe("About Page, Enlarged Line-Art, Properties Mix-and-Match & Homepage Showcase Restoration", () => {
  let queryClient: QueryClient;

  function renderWithProviders(ui: React.ReactElement) {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>{ui}</LanguageProvider>
      </QueryClientProvider>,
    );
  }

  beforeEach(() => {
    mockPathname = "/about";
    document.body.innerHTML = "";
    ScrollTrigger.getAll().forEach((st) => st.kill());
  });

  afterEach(() => {
    cleanup();
    ScrollTrigger.getAll().forEach((st) => st.kill());
  });

  // 1. Enlarged PageIdentityLineArt
  describe("1. Enlarged PageIdentityLineArt Typography", () => {
    it("renders noticeably larger top label and main outlined wordmark on secondary pages", () => {
      mockPathname = "/about";
      render(<PageIdentityLineArt />);

      const topEl = screen.getByText("ABOUT");
      const mainEl = screen.getByText("AVRASYA");

      expect(topEl).toBeInTheDocument();
      expect(mainEl).toBeInTheDocument();

      // Top text should be scaled up (text-sm sm:text-base md:text-xl lg:text-2xl)
      expect(topEl.className).toContain("text-sm");
      expect(topEl.className).toContain("md:text-xl");
      expect(topEl.className).toContain("font-mono");
      expect(topEl.className).toContain("tracking-[0.3em]");

      // Main wordmark should be scaled up (text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem])
      expect(mainEl.className).toContain("text-5xl");
      expect(mainEl.className).toContain("md:text-8xl");
      expect(mainEl.className).toContain("font-serif");
    });
  });

  // 2. About Page Alignment with Other Pages
  describe("2. About Page Cohesive Editorial Layout", () => {
    it("renders canonical PageIntro header (.site-page-intro) like other pages with enlarged PageIdentityLineArt", () => {
      mockPathname = "/about";
      const { container } = renderWithProviders(<AboutPage />);

      const pageIntro = container.querySelector(".site-page-intro");
      expect(pageIntro).not.toBeNull();

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        /Building More Than Structures/i,
      );
      expect(screen.getByText("ABOUT")).toBeInTheDocument();
      expect(screen.getByText("AVRASYA")).toBeInTheDocument();

      // Preserves all core About sections and data attributes
      expect(container.querySelector("[data-abt-story-img]")).not.toBeNull();
      expect(container.querySelector("[data-abt-story-copy]")).not.toBeNull();
      expect(container.querySelectorAll("[data-abt-metric-card]").length).toBe(4);
      expect(container.querySelectorAll("[data-abt-approach-step]").length).toBe(4);
      expect(container.querySelectorAll("[data-abt-expertise-card]").length).toBe(3);
      expect(container.querySelectorAll("[data-abt-team-card]").length).toBe(4);
    });
  });

  // 3. PropertyCard Mix-and-Match Redesign
  describe("3. PropertyCard Architectural Portrait Card Style", () => {
    it("renders rounded-[24px] portrait card with dark gradient overlay, index numeral, View Residence CTA, price, shortlist, and WhatsApp", () => {
      const sampleProp = properties[0]!;
      const { container } = renderWithProviders(<PropertyCard r={sampleProp} index={0} />);

      const article = container.querySelector("article[data-framer-name='Property']");
      expect(article).not.toBeNull();
      expect(article?.className).toContain("rounded-[24px]");

      // Displays formatted index numeral 01
      expect(screen.getByText("01")).toBeInTheDocument();

      // Displays View Residence pill CTA
      const viewResidenceLink = screen.getByRole("link", { name: /View Residence/i });
      expect(viewResidenceLink).toBeInTheDocument();
      expect(viewResidenceLink).toHaveAttribute("href", `/properties/${sampleProp.slug}`);

      // Preserves shortlist button and WhatsApp inquiry link
      const saveBtn = screen.getByRole("button", { name: /save|saved/i });
      expect(saveBtn).toBeInTheDocument();

      const waLink = screen.getByRole("link", { name: /whatsapp/i });
      expect(waLink).toBeInTheDocument();
    });
  });

  // 4. Restored Homepage BildoraProjectsShowcase
  describe("4. Homepage BildoraProjectsShowcase Full-Stage Restoration", () => {
    it("always renders all 4 curated showcase projects in the full-stage layout with interactive project selector tabs", () => {
      const { container } = renderWithProviders(
        <BildoraProjectsShowcase properties={properties} />,
      );

      // Even when properties has only 2 package/unit_type records, all 4 showcase projects must render
      const cards = container.querySelectorAll("[data-project-card]");
      expect(cards.length).toBe(4);

      const badges = container.querySelectorAll("[data-project-badge]");
      expect(badges.length).toBe(4);

      const ctas = container.querySelectorAll("[data-project-cta]");
      expect(ctas.length).toBe(4);

      // Interactive project selector tabs (role="tab") allow switching active project
      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBe(4);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");

      fireEvent.click(tabs[2]!);
      expect(tabs[2]).toHaveAttribute("aria-selected", "true");
    });
  });
});
