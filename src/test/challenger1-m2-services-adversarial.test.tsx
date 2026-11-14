import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { LOCALES, isRtlLocale, TRANSLATIONS, type Locale } from "@/i18n";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ServicesPage } from "@/routes/services";
import { ServicesProcessTimeline } from "@/components/site/ServicesProcessTimeline";

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

// Mock Supabase / live data
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

function renderWithProviders(ui: React.ReactElement, initialLocale: Locale = "en") {
  const client = createTestQueryClient();
  localStorage.setItem("avrasya_preferred_language", initialLocale);
  return render(
    <QueryClientProvider client={client}>
      <LanguageProvider>{ui}</LanguageProvider>
    </QueryClientProvider>,
  );
}

describe("Milestone 2 Adversarial Challenge Suite: Services Page & Process Timeline", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // CHALLENGE 1: STRICT SEQUENTIAL DOM ORDERING ORACLE ACROSS ALL 7 LOCALES
  // =========================================================================
  describe("Challenge 1: DOM Sequence & Node Ordering Oracle across all 7 locales", () => {
    const allLocales: Locale[] = ["en", "tr", "ar", "ru", "fa", "zh", "bn"];

    allLocales.forEach((loc) => {
      it(`Strict sequential DOM ordering for locale: [${loc}]`, () => {
        const { container } = renderWithProviders(
          <ServicesProcessTimeline
            sectionTitle="Our Highlighted Service: Turkish Citizenship in Just 4 steps"
            showActionButtons={true}
          />,
          loc,
        );
        const expectedNums = ["01", "02", "03", "04", "05", "06", "07", "08", "09"];

        // 1. Locate all step marker buttons
        const stepElements: HTMLElement[] = [];
        for (const num of expectedNums) {
          const stepContainer = container.querySelector(`[data-step="${num}"]`);
          expect(
            stepContainer,
            `Step container [data-step="${num}"] must exist in locale [${loc}]`,
          ).not.toBeNull();
          stepElements.push(stepContainer as HTMLElement);
        }

        // 2. Oracle check: compareDocumentPosition ensures strictly monotonic DOM tree order
        for (let i = 0; i < stepElements.length - 1; i++) {
          const current = stepElements[i]!;
          const next = stepElements[i + 1]!;
          const relation = current.compareDocumentPosition(next);
          // DOCUMENT_POSITION_FOLLOWING === 4
          const isFollowing = (relation & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
          expect(
            isFollowing,
            `Step ${expectedNums[i]} must strictly precede Step ${expectedNums[i + 1]} in DOM document order for [${loc}]`,
          ).toBe(true);
        }

        // 3. Oracle check: Character position in textContent is strictly increasing
        const fullText = container.textContent || "";
        let prevCharIdx = -1;
        for (const num of expectedNums) {
          const charIdx = fullText.indexOf(num);
          expect(charIdx, `Step number ${num} must be found in textContent`).toBeGreaterThan(-1);
          expect(
            charIdx,
            `Character index of Step ${num} (${charIdx}) must be greater than previous step (${prevCharIdx})`,
          ).toBeGreaterThan(prevCharIdx);
          prevCharIdx = charIdx;
        }

        // 4. Exactly 9 step marker buttons exist
        const allStepButtons = container.querySelectorAll("button[aria-label^='Step ']");
        expect(allStepButtons.length).toBe(9);
      });
    });
  });

  // =========================================================================
  // CHALLENGE 2: VERIFY EXTINCTION OF ALL LEGACY TABS AND OBSOLETE SECTIONS
  // =========================================================================
  describe("Challenge 2: Complete Purge of Legacy Tabs, Categories, and Roadmaps", () => {
    it("Verifies obsolete category tab buttons do not exist in DOM", () => {
      renderWithProviders(<ServicesPage />);

      const forbiddenCategoryButtons = [
        "Investment",
        "Design",
        "Banking",
        "Management",
        "Valuation",
        "Legal",
        "Resale",
        "Citizenship",
        "Tax",
        "Consulting",
      ];

      for (const cat of forbiddenCategoryButtons) {
        const btn = screen.queryByRole("button", { name: new RegExp(`^${cat}$`, "i") });
        expect(btn).toBeNull();
      }
    });

    it("Verifies obsolete 6-phase journey headings do not exist in DOM", () => {
      renderWithProviders(<ServicesPage />);

      const forbiddenPhases = ["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5", "Phase 6"];
      for (const phase of forbiddenPhases) {
        const phaseHeading = screen.queryByText(new RegExp(`^${phase}$`, "i"));
        expect(phaseHeading).toBeNull();
      }
    });

    it("Verifies legacy activeCategory state or tab panels are not in DOM", () => {
      const { container } = renderWithProviders(<ServicesPage />);
      expect(container.querySelector("[data-tab-panel]")).toBeNull();
      expect(container.querySelector(".category-tab-active")).toBeNull();
    });
  });

  // =========================================================================
  // CHALLENGE 3: DYNAMIC STEP FOCUS, EXPANSION, AND INTERACTION HARNESS
  // =========================================================================
  describe("Challenge 3: Dynamic Step Focus, State Transitions & Rapid Click Stress", () => {
    it("Initial state: Step 01 is active by default with luxury highlight classes", () => {
      const { container } = renderWithProviders(<ServicesProcessTimeline />);
      const step01Container = container.querySelector("[data-step='01']");
      const step01Button = step01Container?.querySelector("button");

      expect(step01Button?.className).toContain("bg-[#163038]");
      expect(step01Button?.className).toContain("text-[#C5A059]");
    });

    it("Clicking step marker button updates active state and triggers onStepSelect", async () => {
      const handleSelect = vi.fn();
      const { container } = renderWithProviders(
        <ServicesProcessTimeline onStepSelect={handleSelect} />,
      );

      const step03Button = container.querySelector("[data-step='03'] button");
      expect(step03Button).not.toBeNull();

      await act(async () => {
        fireEvent.click(step03Button!);
      });

      expect(handleSelect).toHaveBeenCalledWith("03");
      expect(step03Button?.className).toContain("bg-[#163038]");
      expect(step03Button?.className).toContain("text-[#C5A059]");

      // Step 01 should no longer have the active bg-[#163038]
      const step01Button = container.querySelector("[data-step='01'] button");
      expect(step01Button?.className).not.toContain("bg-[#163038]");
    });

    it("Clicking step card container activates the step", async () => {
      const handleSelect = vi.fn();
      const { container } = renderWithProviders(
        <ServicesProcessTimeline onStepSelect={handleSelect} />,
      );

      const step06Card = container.querySelector("[data-step='06'] [data-step-card]");
      expect(step06Card).not.toBeNull();

      await act(async () => {
        fireEvent.click(step06Card!);
      });

      expect(handleSelect).toHaveBeenCalledWith("06");
      const step06Button = container.querySelector("[data-step='06'] button");
      expect(step06Button?.className).toContain("bg-[#163038]");
    });

    it("Stress test: Rapid non-linear click transitions maintain single active state invariant", async () => {
      const handleSelect = vi.fn();
      const { container } = renderWithProviders(
        <ServicesProcessTimeline onStepSelect={handleSelect} />,
      );

      const clickSequence = ["08", "02", "09", "04", "07", "05", "03", "01", "06"];

      for (const targetStep of clickSequence) {
        const btn = container.querySelector(`[data-step='${targetStep}'] button`);
        await act(async () => {
          fireEvent.click(btn!);
        });

        expect(handleSelect).toHaveBeenLastCalledWith(targetStep);

        // Assert exactly ONE active step button exists across the entire timeline
        const allButtons = Array.from(container.querySelectorAll("button[aria-label^='Step ']"));
        const activeButtons = allButtons.filter((b) => b.className.includes("bg-[#163038]"));
        expect(activeButtons.length).toBe(1);
        expect(activeButtons[0]).toBe(btn);
      }
    });
  });

  // =========================================================================
  // CHALLENGE 4: 3D MOUNTING SLOTS ARCHITECTURAL INVARIANTS
  // =========================================================================
  describe("Challenge 4: 3D Mounting Slots Invariants", () => {
    it("Building 3D model is removed from Step 04 and all other steps", () => {
      const { container } = renderWithProviders(<ServicesProcessTimeline />);

      const allBuildingSlots = container.querySelectorAll("[data-3d-building-slot]");
      expect(allBuildingSlots.length).toBe(0);
    });

    it("Exactly one passport 3D slot exists, mounted exclusively in Step 07", () => {
      const { container } = renderWithProviders(<ServicesProcessTimeline />);

      const allPassportSlots = container.querySelectorAll("[data-3d-passport-slot]");
      expect(allPassportSlots.length).toBe(1);

      const step07 = container.querySelector("[data-step='07']");
      const passportSlot = step07?.querySelector("[data-3d-passport-slot]");
      expect(passportSlot).not.toBeNull();
      expect(passportSlot?.id).toBe("services-3d-passport");

      // Verify no other step contains the passport slot
      const otherSteps = ["01", "02", "03", "04", "05", "06", "08", "09"];
      for (const num of otherSteps) {
        const step = container.querySelector(`[data-step='${num}']`);
        expect(step?.querySelector("[data-3d-passport-slot]")).toBeNull();
      }
    });
  });

  // =========================================================================
  // CHALLENGE 5: BIDIRECTIONAL RTL & LATIN STATUTORY ISOLATION (AR & FA)
  // =========================================================================
  describe("Challenge 5: RTL Layout and Latin Statutory Term Isolation", () => {
    it("Arabic (ar): Renders dir='rtl' on section and isolates Tapu & DAB with dir='ltr'", () => {
      const { container } = renderWithProviders(<ServicesProcessTimeline />, "ar");

      const section = container.querySelector("section");
      expect(section?.getAttribute("dir")).toBe("rtl");

      // Tapu isolation in Step 02
      const step02 = container.querySelector("[data-step='02']");
      const tapuSpan = step02?.querySelector("span[dir='ltr']");
      expect(tapuSpan).not.toBeNull();
      expect(tapuSpan?.textContent).toContain("Tapu");
      expect(tapuSpan?.className).toContain("unicode-isolate");

      // DAB isolation in Step 03
      const step03 = container.querySelector("[data-step='03']");
      const dabSpan = step03?.querySelector("span[dir='ltr']");
      expect(dabSpan).not.toBeNull();
      expect(dabSpan?.textContent).toContain("DAB");
      expect(dabSpan?.className).toContain("unicode-isolate");
    });

    it("Farsi (fa): Renders dir='rtl' on section and isolates Tapu & DAB with dir='ltr'", () => {
      const { container } = renderWithProviders(<ServicesProcessTimeline />, "fa");

      const section = container.querySelector("section");
      expect(section?.getAttribute("dir")).toBe("rtl");

      // Tapu isolation in Step 02
      const step02 = container.querySelector("[data-step='02']");
      const tapuSpan = step02?.querySelector("span[dir='ltr']");
      expect(tapuSpan).not.toBeNull();
      expect(tapuSpan?.textContent).toContain("Tapu");

      // DAB isolation in Step 03
      const step03 = container.querySelector("[data-step='03']");
      const dabSpan = step03?.querySelector("span[dir='ltr']");
      expect(dabSpan).not.toBeNull();
      expect(dabSpan?.textContent).toContain("DAB");
    });

    it("English (en): Renders dir='ltr' on section", () => {
      const { container } = renderWithProviders(<ServicesProcessTimeline />, "en");
      const section = container.querySelector("section");
      expect(section?.getAttribute("dir")).toBe("ltr");
    });
  });

  // =========================================================================
  // CHALLENGE 6: STATUTORY LEGAL DISCLAIMERS & BAR ASSOCIATION NOTICES
  // =========================================================================
  describe("Challenge 6: Statutory Compliance & Legal Disclaimers", () => {
    it("Renders Turkish Citizenship Law No. 5901 reference and Bar Association legal counsel", () => {
      const { container } = renderWithProviders(<ServicesProcessTimeline />);

      const text = container.textContent || "";
      expect(text).toContain("5901");
      expect(text).toContain("Istanbul Bar Association");
      expect(text).toContain("Ministry of Interior Directorate General of Migration Management");
    });

    it("Step 05 renders Law No. 5901 family scope badge", () => {
      const { container } = renderWithProviders(<ServicesProcessTimeline />);
      const step05 = container.querySelector("[data-step='05']");
      expect(step05?.textContent).toContain("5901");
    });

    it("Step 07 renders Sovereign naturalization authority badge", () => {
      const { container } = renderWithProviders(<ServicesProcessTimeline />);
      const step07 = container.querySelector("[data-step='07']");
      expect(step07?.textContent).toContain("Ministry of Interior");
    });
  });

  // =========================================================================
  // CHALLENGE 7: ADVERSARIAL FAULT TOLERANCE & EDGE CASE DEFENSE
  // =========================================================================
  describe("Challenge 7: Adversarial Edge Cases & Fault Tolerance", () => {
    it("Gracefully survives empty parts prop array without throwing", () => {
      expect(() => {
        renderWithProviders(<ServicesProcessTimeline parts={[]} />);
      }).not.toThrow();

      // Still renders closing line
      expect(screen.getByText(/The Avrasya Difference/i)).toBeDefined();
    });

    it("Survives custom parts with missing optional fields (no termNote, no legalTag)", () => {
      const minimalistParts = [
        {
          partNumber: "PART X",
          title: "CUSTOM PHASE",
          steps: [
            {
              stepNumber: "99",
              title: "Custom Step",
              description: "Custom Description",
            },
          ],
        },
      ];

      const { container } = renderWithProviders(
        <ServicesProcessTimeline parts={minimalistParts} />,
      );

      expect(screen.getByText("CUSTOM PHASE")).toBeDefined();
      expect(screen.getByText("Custom Step")).toBeDefined();
      expect(screen.getByText("Custom Description")).toBeDefined();
      expect(container.querySelector("[data-step='99']")).not.toBeNull();
    });

    it("Survives unprovided onStepSelect callback during click", async () => {
      const { container } = renderWithProviders(<ServicesProcessTimeline />);
      const btn = container.querySelector("[data-step='02'] button");

      await act(async () => {
        expect(() => fireEvent.click(btn!)).not.toThrow();
      });
    });
  });
});
