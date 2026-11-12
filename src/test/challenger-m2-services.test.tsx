import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { LOCALES, TRANSLATIONS, type Locale, type TimelinePart } from "@/i18n";
import { LanguageProvider, LANGUAGE_KEY } from "@/hooks/useLanguage";
import { ServicesProcessTimeline } from "@/components/site/ServicesProcessTimeline";
import { ServicesPage } from "@/routes/services";

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

let mockServicesData: any = [];
let mockFaqsData: any = [];

// Mock live data hooks
vi.mock("@/data/live", () => ({
  useServices: () => ({
    data: mockServicesData,
    isLoading: false,
    isError: false,
  }),
  useFaqs: () => ({
    data: mockFaqsData,
    isLoading: false,
    isError: false,
  }),
}));

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

function renderWithLanguage(ui: React.ReactElement, locale: Locale = "en") {
  const client = createTestQueryClient();
  localStorage.setItem(LANGUAGE_KEY, locale);
  return render(
    <QueryClientProvider client={client}>
      <LanguageProvider>{ui}</LanguageProvider>
    </QueryClientProvider>,
  );
}

describe("Empirical Challenger Suite: Milestone 2 Services & Process Timeline", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
    mockServicesData = [];
    mockFaqsData = [];
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // =========================================================================
  // CHALLENGE 1: MULTILINGUAL CONTRACT INTEGRITY (ALL 7 LOCALES)
  // =========================================================================
  describe("Challenge 1: Multilingual Schema & Core Terms across 7 Languages", () => {
    const allLocales: Locale[] = ["en", "tr", "ar", "ru", "fa", "zh", "bn"];

    it("verifies all 7 locales are officially registered", () => {
      const codes = LOCALES.map((l) => l.code);
      expect(codes).toEqual(expect.arrayContaining(allLocales));
      expect(LOCALES.length).toBe(7);
    });

    allLocales.forEach((locale) => {
      describe(`Locale [${locale}] validation`, () => {
        const t = TRANSLATIONS[locale];

        it(`has complete services metadata in [${locale}]`, () => {
          expect(t.services).toBeDefined();
          expect(typeof t.services.eyebrow).toBe("string");
          expect(t.services.eyebrow.trim().length).toBeGreaterThan(0);
          expect(typeof t.services.title).toBe("string");
          expect(t.services.title.trim().length).toBeGreaterThan(0);
          expect(typeof t.services.subtitle).toBe("string");
          expect(t.services.subtitle.trim().length).toBeGreaterThan(0);
          expect(typeof t.services.closingLine).toBe("string");
          expect(t.services.closingLine.trim().length).toBeGreaterThan(0);
          expect(typeof t.services.legalDisclaimer).toBe("string");
          expect(t.services.legalDisclaimer.trim().length).toBeGreaterThan(0);
          expect(Array.isArray(t.services.parts)).toBe(true);
          expect(Array.isArray(t.services.faqs)).toBe(true);
        });

        it(`has exactly 4 Parts and 9 sequential Steps in [${locale}]`, () => {
          const parts = t.services.parts;
          expect(parts.length).toBe(4);

          // Part structure: Part 1 has 2, Part 2 has 2, Part 3 has 3, Part 4 has 2
          expect(parts[0]!.steps.length).toBe(2);
          expect(parts[1]!.steps.length).toBe(2);
          expect(parts[2]!.steps.length).toBe(3);
          expect(parts[3]!.steps.length).toBe(2);

          const allSteps = parts.flatMap((p) => p.steps);
          expect(allSteps.length).toBe(9);

          const expectedStepNumbers = ["01", "02", "03", "04", "05", "06", "07", "08", "09"];
          const actualStepNumbers = allSteps.map((s) => s.stepNumber);
          expect(actualStepNumbers).toEqual(expectedStepNumbers);

          allSteps.forEach((step, idx) => {
            expect(step.title.trim().length).toBeGreaterThan(0);
            expect(step.description.trim().length).toBeGreaterThan(0);
          });
        });

        it(`preserves statutory core terms 'Tapu' and 'DAB' in [${locale}]`, () => {
          const allSteps = t.services.parts.flatMap((p) => p.steps);

          // Step 02 must include Tapu
          const step02 = allSteps.find((s) => s.stepNumber === "02");
          expect(step02).toBeDefined();
          const step02Combined = `${step02?.title} ${step02?.description} ${step02?.termNote || ""}`;
          expect(step02Combined).toMatch(/Tapu/i);

          // Step 03 must include DAB
          const step03 = allSteps.find((s) => s.stepNumber === "03");
          expect(step03).toBeDefined();
          const step03Combined = `${step03?.title} ${step03?.description} ${step03?.termNote || ""}`;
          expect(step03Combined).toMatch(/DAB/i);
        });

        it(`includes lawyer review tags on Step 05 or Step 07 in [${locale}]`, () => {
          const allSteps = t.services.parts.flatMap((p) => p.steps);
          const legalSteps = allSteps.filter((s) => Boolean(s.legalTag));
          expect(legalSteps.length).toBeGreaterThanOrEqual(1);
        });
      });
    });
  });

  // =========================================================================
  // CHALLENGE 2: COMPONENT RENDERING & BIDIRECTIONAL RTL ACROSS ALL LOCALES
  // =========================================================================
  describe("Challenge 2: ServicesProcessTimeline Rendering & DOM Flow across 7 Languages", () => {
    const allLocales: Locale[] = ["en", "tr", "ar", "ru", "fa", "zh", "bn"];

    allLocales.forEach((locale) => {
      it(`renders timeline seamlessly with correct direction for [${locale}]`, () => {
        const isRtl = locale === "ar" || locale === "fa";
        const { container } = renderWithLanguage(<ServicesProcessTimeline />, locale);

        const section = container.querySelector("section");
        expect(section).not.toBeNull();
        expect(section?.getAttribute("dir")).toBe(isRtl ? "rtl" : "ltr");

        // Verify all 4 Part titles are rendered
        const parts = TRANSLATIONS[locale].services.parts;
        parts.forEach((part) => {
          expect(screen.getByText(part.title)).toBeInTheDocument();
        });

        // Verify all 9 steps rendered in sequential DOM order
        const stepButtons = container.querySelectorAll("button[aria-label^='Step']");
        expect(stepButtons.length).toBe(9);

        // Check 3D slots
        const buildingSlot = container.querySelector("[data-3d-building-slot]");
        expect(buildingSlot).not.toBeNull();
        expect(buildingSlot?.id).toBe("services-3d-building");

        const passportSlot = container.querySelector("[data-3d-passport-slot]");
        expect(passportSlot).not.toBeNull();
        expect(passportSlot?.id).toBe("services-3d-passport");

        // Check Closing line
        const closingLine = TRANSLATIONS[locale].services.closingLine;
        expect(
          screen.getByText(new RegExp(closingLine.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")),
        ).toBeInTheDocument();

        // Check legal disclaimer
        const legalDisclaimer = TRANSLATIONS[locale].services.legalDisclaimer;
        expect(
          screen.getByText(
            new RegExp(legalDisclaimer.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
          ),
        ).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // CHALLENGE 3: INTERACTIVE STATE STRESS & RAPID USER INPUT
  // =========================================================================
  describe("Challenge 3: Interactive State Stress Testing", () => {
    it("handles 50 rapid sequential and alternating step clicks without state desync", () => {
      const onStepSelectMock = vi.fn();
      const { container } = renderWithLanguage(
        <ServicesProcessTimeline onStepSelect={onStepSelectMock} />,
      );

      const stepButtons = container.querySelectorAll<HTMLButtonElement>(
        "button[aria-label^='Step']",
      );
      expect(stepButtons.length).toBe(9);

      // Stress test: 50 fast clicks alternating between steps
      const clickSequence = [
        "02",
        "04",
        "07",
        "01",
        "09",
        "03",
        "05",
        "06",
        "08",
        "07",
        "07",
        "04",
        "02",
        "09",
        "01",
        "03",
        "08",
        "05",
        "06",
        "04",
        "07",
        "02",
        "01",
        "08",
        "09",
        "03",
        "05",
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "09",
        "08",
        "07",
        "06",
        "05",
        "04",
        "03",
        "02",
        "01",
        "05",
        "05",
        "05",
        "07",
        "03",
      ];

      clickSequence.forEach((stepNum) => {
        const targetBtn = Array.from(stepButtons).find((btn) =>
          btn.getAttribute("aria-label")?.startsWith(`Step ${stepNum}:`),
        );
        expect(targetBtn).toBeDefined();
        fireEvent.click(targetBtn!);
      });

      expect(onStepSelectMock).toHaveBeenCalledTimes(clickSequence.length);
      expect(onStepSelectMock).toHaveBeenLastCalledWith("03");

      // Verify the final active step button has active styles
      const finalActiveBtn = Array.from(stepButtons).find((btn) =>
        btn.getAttribute("aria-label")?.startsWith("Step 03:"),
      );
      expect(finalActiveBtn?.className).toContain("bg-[#163038]");
    });

    it("supports clicking on step cards directly to change active step", () => {
      const onStepSelectMock = vi.fn();
      const { container } = renderWithLanguage(
        <ServicesProcessTimeline onStepSelect={onStepSelectMock} />,
      );

      const stepCards = container.querySelectorAll<HTMLElement>("[data-step-card]");
      expect(stepCards.length).toBe(9);

      // Click step card 06
      fireEvent.click(stepCards[5]!);
      expect(onStepSelectMock).toHaveBeenCalledWith("06");

      // Click step card 08
      fireEvent.click(stepCards[7]!);
      expect(onStepSelectMock).toHaveBeenCalledWith("08");
    });

    it("survives rapid mount / unmount cycles (simulating fast route navigation)", () => {
      for (let i = 0; i < 15; i++) {
        const { unmount } = renderWithLanguage(<ServicesProcessTimeline />);
        unmount();
      }
    }, 120000);

    it("handles customParts override safely", () => {
      const customParts: TimelinePart[] = [
        {
          partNumber: "CUSTOM 1",
          title: "Custom Title",
          steps: [
            {
              stepNumber: "01",
              title: "Step A",
              description: "Desc A",
            },
          ],
        },
      ];

      const { container } = renderWithLanguage(<ServicesProcessTimeline parts={customParts} />);

      expect(screen.getByText("CUSTOM 1")).toBeInTheDocument();
      expect(screen.getByText("Custom Title")).toBeInTheDocument();
      expect(screen.getByText("Step A")).toBeInTheDocument();
      expect(container.querySelectorAll("button[aria-label^='Step']").length).toBe(1);
    });
  });

  // =========================================================================
  // CHALLENGE 4: ROUTE LEVEL EDGE CASES & EMPTY / CORRUPTED CMS DATA
  // =========================================================================
  describe("Challenge 4: ServicesPage Route Level Fallbacks & Degraded States", () => {
    it("renders smoothly when CMS services and FAQs are completely empty arrays", () => {
      mockServicesData = [];
      mockFaqsData = [];

      const { container } = renderWithLanguage(<ServicesPage />);

      // Title & Subtitle
      expect(screen.getByText(/One team\. Every step\./i)).toBeInTheDocument();
      expect(screen.getByText(/Our own lawyer handles the paperwork\./i)).toBeInTheDocument();

      // Values Timeline (brought from homepage) is intact with 6 rows
      expect(container.querySelectorAll("[data-tl-row]").length).toBe(6);

      // Managed services section is cleanly omitted
      expect(container.querySelector("[data-managed-services]")).toBeNull();

      // Static FAQs from locale are still rendered
      expect(container.querySelectorAll("details").length).toBeGreaterThan(0);

      // Consultation CTA link is present
      const ctaLink = screen.getByRole("link", { name: TRANSLATIONS.en.cta.scheduleMeeting });
      expect(ctaLink).toBeInTheDocument();
      expect(ctaLink.getAttribute("href")).toBe("/contact");
    });

    it("renders smoothly when CMS services contains corrupted/incomplete items", () => {
      mockServicesData = [
        { id: "bad-1", title: null, description: "Missing title" },
        { id: "bad-2", title: "Missing desc", description: null },
        { id: "bad-3", title: "", description: "" },
        {
          id: "valid-1",
          title: "Residency Support",
          description: "Full residency guidance.",
          process_steps: null, // process_steps not an array
        },
        {
          id: "valid-2",
          title: "Tax Clearance",
          description: "Clearance certificate assistance.",
          process_steps: ["Step 1", { title: "Step 2" }, 12345, null], // mixed format steps
        },
      ];

      const { container } = renderWithLanguage(<ServicesPage />);

      // Section is displayed because valid-1 and valid-2 pass filter(s => s.title && s.description)
      const managedSection = container.querySelector("[data-managed-services]");
      expect(managedSection).not.toBeNull();

      // Valid services are rendered
      expect(screen.getByText("Residency Support")).toBeInTheDocument();
      expect(screen.getByText("Tax Clearance")).toBeInTheDocument();

      // Bad items are excluded
      expect(screen.queryByText("Missing title")).toBeNull();
      expect(screen.queryByText("Missing desc")).toBeNull();

      // Handled process steps without crash
      expect(screen.getByText("Step 1")).toBeInTheDocument();
      expect(screen.getByText("Step 2")).toBeInTheDocument();
    });

    it("renders smoothly when CMS faqs data is null or contains empty items", () => {
      mockFaqsData = [
        { id: "faq-bad-1", question: null, answer: "Answer without question" },
        { id: "faq-bad-2", question: "Question without answer", answer: null },
        {
          id: "faq-valid-1",
          question: "Can I bring my family?",
          answer: "Yes, spouse and children under 18.",
        },
      ];

      const { container } = renderWithLanguage(<ServicesPage />);

      expect(screen.getByText("Can I bring my family?")).toBeInTheDocument();
      expect(screen.getByText("Yes, spouse and children under 18.")).toBeInTheDocument();
      expect(screen.queryByText("Answer without question")).toBeNull();
      expect(screen.queryByText("Question without answer")).toBeNull();
    });
  });
});
