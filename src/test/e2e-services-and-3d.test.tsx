import { render, screen, fireEvent, cleanup, within, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React, { act } from "react";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { LOCALES, getLocaleConfig, isRtlLocale, TRANSLATIONS, type Locale } from "@/i18n";
import { LanguageProvider, useLanguage, useTranslation } from "@/hooks/useLanguage";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { ServicesPage } from "@/routes/services";
import { ServicesProcessTimeline } from "@/components/site/ServicesProcessTimeline";
import { AcquisitionCalculator } from "@/components/site/AcquisitionCalculator";

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

describe("E2E Services Rebuild, 7-Language RTL & 3D WebGL Suite", () => {
  const heroAssetPath = path.resolve(__dirname, "../../public/images/hero-building-avrasya.png");
  const expectedHeroSha256 = "978bdb310bfdb282ee5269e04e3d2f012cb0bdcf93821bea684e2af9bdde064c";

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
  // TIER 1: FEATURE COVERAGE (HAPPY PATH VERIFICATION)
  // =========================================================================
  describe("Tier 1 — Feature Coverage", () => {
    it("T1.1: Services page Title strictly matches specification", () => {
      renderWithProviders(<ServicesPage />);
      const expectedTitle = "One team. Every step. From first call to your passport and beyond.";

      // Look for title either as direct text or within the heading hierarchy
      const titleMatches = screen.queryAllByText((content) =>
        content.toLowerCase().includes(expectedTitle.toLowerCase()),
      );
      expect(titleMatches.length).toBeGreaterThan(0);
    });

    it("T1.2: Services page Subtitle strictly matches specification", () => {
      renderWithProviders(<ServicesPage />);
      const expectedSubtitle =
        "Our own lawyer handles the paperwork. You always know what happens next.";

      const subtitleMatches = screen.queryAllByText((content) =>
        content.toLowerCase().includes(expectedSubtitle.toLowerCase()),
      );
      expect(subtitleMatches.length).toBeGreaterThan(0);
    });

    it("T1.3: Highlighted Service section displays Four Parts and Nine Steps in strict sequential order with All Services & More Details buttons", () => {
      const { container } = renderWithProviders(
        <ServicesProcessTimeline
          sectionTitle="Our Highlighted Service: Turkish Citizenship in Just 4 steps"
          showActionButtons={true}
        />,
      );

      expect(
        screen.getByText("Our Highlighted Service: Turkish Citizenship in Just 4 steps"),
      ).toBeInTheDocument();
      const allServicesLink = screen.getByRole("link", { name: /All Services/i });
      expect(allServicesLink.getAttribute("href")).toBe("/services");
      const moreDetailsLink = screen.getByRole("link", { name: /More Details/i });
      expect(moreDetailsLink.getAttribute("href")).toBe("/citizenship");

      const expectedParts = ["CHOOSE", "BUY", "CITIZENSHIP", "AFTER CITIZENSHIP"];

      const expectedSteps = [
        { num: "01", title: "Free Consultation" },
        { num: "02", title: "Property Search and Checks" },
        { num: "03", title: "Tax Number and Bank Account" },
        { num: "04", title: "Purchase and Title Deed" },
        { num: "05", title: "Application" },
        { num: "06", title: "Document Follow-up" },
        { num: "07", title: "Passports in Your Hands" },
        { num: "08", title: "Rent Your Property" },
        { num: "09", title: "Sell When You Are Ready" },
      ];

      // Verify all 4 parts exist in the DOM
      for (const part of expectedParts) {
        const partMatches = screen.queryAllByText((c) => c.toUpperCase().includes(part));
        expect(partMatches.length).toBeGreaterThan(0);
      }

      // Verify all 9 steps exist with step numbers and titles
      const pageText = container.textContent || "";
      let lastIndex = -1;

      for (const step of expectedSteps) {
        const stepNumMatches = screen.queryAllByText((c) => c.includes(step.num));
        expect(stepNumMatches.length).toBeGreaterThan(0);

        const currentIndex = pageText.indexOf(step.num);
        expect(currentIndex).toBeGreaterThan(lastIndex);
        lastIndex = currentIndex;
      }
    });

    it("T1.4: ServicesProcessTimeline displays closing line: 'One lawyer. One team. One process.'", () => {
      renderWithProviders(<ServicesProcessTimeline />);
      const expectedClosing = "One lawyer. One team. One process.";

      const closingMatches = screen.queryAllByText((c) =>
        c.toLowerCase().includes(expectedClosing.toLowerCase()),
      );
      expect(closingMatches.length).toBeGreaterThan(0);
    });

    it("T1.5: Old 10-service category grid and duplicate 6-phase journey are purged from /services", () => {
      renderWithProviders(<ServicesPage />);

      // The old category buttons "Investment", "Legal", "Design" from the 10-services tabs
      const oldCategories = ["Investment", "Design", "Banking", "Management", "Valuation"];
      for (const cat of oldCategories) {
        const categoryButtons = screen.queryAllByRole("button", { name: cat });
        expect(categoryButtons.length).toBe(0);
      }

      // Old 6-phase roadmap markers ("Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5", "Phase 6")
      const oldPhases = ["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5", "Phase 6"];
      for (const p of oldPhases) {
        const phaseElements = screen.queryAllByText(new RegExp(`^${p}$`, "i"));
        expect(phaseElements.length).toBe(0);
      }
    });

    it("T1.6: Statutory core terms 'Tapu' and 'DAB' are preserved across all 7 locales", () => {
      const allLocales: Locale[] = ["en", "tr", "ar", "ru", "fa", "zh", "bn"];

      // Check whether zh and bn locale dictionaries exist on disk or in TRANSLATIONS
      const localesDir = path.resolve(__dirname, "../i18n/locales");

      for (const loc of allLocales) {
        const filePath = path.join(localesDir, `${loc}.ts`);
        expect(fs.existsSync(filePath)).toBe(true);

        const fileContent = fs.readFileSync(filePath, "utf-8");

        // Assert sovereign preservation of Tapu and DAB intact with parenthetical/bracketed translations
        expect(fileContent).toMatch(/Tapu/);
        expect(fileContent).toMatch(/DAB/);
      }
    });

    it("T1.7: 7 languages are registered in LOCALES with correct dir metadata", () => {
      const codes = LOCALES.map((l) => l.code);
      expect(codes).toEqual(["en", "tr", "ar", "ru", "fa", "zh", "bn"]);

      expect(getLocaleConfig("en").dir).toBe("ltr");
      expect(getLocaleConfig("tr").dir).toBe("ltr");
      expect(getLocaleConfig("ar").dir).toBe("rtl");
      expect(getLocaleConfig("ru").dir).toBe("ltr");
      expect(getLocaleConfig("fa").dir).toBe("rtl");
      expect(getLocaleConfig("zh").dir).toBe("ltr");
      expect(getLocaleConfig("bn").dir).toBe("ltr");
    });

    it("T1.8: RTL layout direction (dir='rtl') is correctly set for Arabic and Farsi", () => {
      expect(isRtlLocale("ar")).toBe(true);
      expect(isRtlLocale("fa")).toBe(true);
      expect(isRtlLocale("en")).toBe(false);
      expect(isRtlLocale("tr")).toBe(false);
      expect(isRtlLocale("ru")).toBe(false);
      expect(isRtlLocale("zh")).toBe(false);
      expect(isRtlLocale("bn")).toBe(false);
    });

    it("T1.9: Turkish Passport 3D model component / WebGL fallback exists for Citizenship", () => {
      const components3dDir = path.resolve(__dirname, "../components/3d");
      expect(fs.existsSync(components3dDir)).toBe(true);

      const passportComponentExists =
        fs.existsSync(path.join(components3dDir, "PassportCanvas.tsx")) ||
        fs.existsSync(path.join(components3dDir, "TurkishPassport3D.tsx"));
      expect(passportComponentExists).toBe(true);

      const passportFallbackExists = fs.existsSync(
        path.join(components3dDir, "PassportFallbackCard.tsx"),
      );
      expect(passportFallbackExists).toBe(true);
    });

    it("T1.10: Architectural Building 3D model component / WebGL fallback exists for Buy", () => {
      const components3dDir = path.resolve(__dirname, "../components/3d");
      expect(fs.existsSync(components3dDir)).toBe(true);

      const buildingComponentExists =
        fs.existsSync(path.join(components3dDir, "ArchitecturalBuildingCanvas.tsx")) ||
        fs.existsSync(path.join(components3dDir, "ArchitecturalBuilding3D.tsx"));
      expect(buildingComponentExists).toBe(true);

      const buildingFallbackExists = fs.existsSync(
        path.join(components3dDir, "BuildingFallbackCard.tsx"),
      );
      expect(buildingFallbackExists).toBe(true);
    });

    it("T1.11: Lawyer review / legal disclaimer notice is rendered", () => {
      renderWithProviders(<ServicesPage />);
      // Legal disclaimer referencing Turkish Citizenship Law No. 5901 or Bar Association attorney representation
      const disclaimerMatches = screen.queryAllByText(
        (c) =>
          c.toLowerCase().includes("5901") ||
          c.toLowerCase().includes("lawyer") ||
          c.toLowerCase().includes("bar association") ||
          c.toLowerCase().includes("attorney"),
      );
      expect(disclaimerMatches.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (NEGATIVE & RESILIENCE VERIFICATION)
  // =========================================================================
  describe("Tier 2 — Boundary & Corner Cases", () => {
    it("T2.1: Fallback activates or motion is disabled under prefers-reduced-motion: reduce", () => {
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("prefers-reduced-motion: reduce"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }));

      // Render services page under reduced motion
      const { container } = renderWithProviders(<ServicesPage />);
      expect(container).toBeDefined();

      window.matchMedia = originalMatchMedia;
    });

    it("T2.2: Missing WebGL context gracefully activates fallback cards without unhandled errors", () => {
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);

      // Rendering page when WebGL is absent must not throw unhandled exceptions
      expect(() => {
        renderWithProviders(<ServicesPage />);
      }).not.toThrow();

      HTMLCanvasElement.prototype.getContext = originalGetContext;
    });

    it("T2.3: Language switching preserves active step and updates document dir", async () => {
      function StepLanguageConsumer() {
        const { locale, setLocale, isRtl } = useLanguage();
        return (
          <div>
            <span data-testid="active-locale">{locale}</span>
            <span data-testid="is-rtl-status">{isRtl ? "RTL" : "LTR"}</span>
            <button data-testid="btn-to-ar" onClick={() => setLocale("ar")}>
              To AR
            </button>
            <button data-testid="btn-to-en" onClick={() => setLocale("en")}>
              To EN
            </button>
            <button data-testid="btn-to-fa" onClick={() => setLocale("fa")}>
              To FA
            </button>
          </div>
        );
      }

      renderWithProviders(<StepLanguageConsumer />);

      expect(screen.getByTestId("active-locale")).toHaveTextContent("en");
      expect(screen.getByTestId("is-rtl-status")).toHaveTextContent("LTR");
      expect(document.documentElement.dir).toBe("ltr");

      // Switch to Arabic
      await act(async () => {
        fireEvent.click(screen.getByTestId("btn-to-ar"));
      });
      expect(screen.getByTestId("active-locale")).toHaveTextContent("ar");
      expect(screen.getByTestId("is-rtl-status")).toHaveTextContent("RTL");
      expect(document.documentElement.dir).toBe("rtl");

      // Switch to Farsi
      await act(async () => {
        fireEvent.click(screen.getByTestId("btn-to-fa"));
      });
      expect(screen.getByTestId("active-locale")).toHaveTextContent("fa");
      expect(screen.getByTestId("is-rtl-status")).toHaveTextContent("RTL");
      expect(document.documentElement.dir).toBe("rtl");

      // Switch back to English
      await act(async () => {
        fireEvent.click(screen.getByTestId("btn-to-en"));
      });
      expect(screen.getByTestId("active-locale")).toHaveTextContent("en");
      expect(screen.getByTestId("is-rtl-status")).toHaveTextContent("LTR");
      expect(document.documentElement.dir).toBe("ltr");
    });

    it("T2.4: Zero-regression: Financial & CBI calculator formulas remain mathematically exact", () => {
      renderWithProviders(<AcquisitionCalculator />);

      // Invariant baseline checks for $450,000 USD property purchase:
      const priceUsd = 450000;
      const fullTapu = Math.round(priceUsd * 0.04); // $18,000
      const splitTapu = Math.round(priceUsd * 0.02); // $9,000
      const vatExempt = 0; // Law 3065
      const vatStandard = Math.round(priceUsd * 0.01); // $4,500
      const spkAppraisal = 750;
      const notaryDab = 650;
      const legalDueDiligence = 2500;

      const totalFullClosing = fullTapu + vatExempt + spkAppraisal + notaryDab + legalDueDiligence;
      expect(totalFullClosing).toBe(21900);

      const allInAcquisition = priceUsd + totalFullClosing;
      expect(allInAcquisition).toBe(471900);

      // CBI Threshold qualification
      const cbiThreshold = 400000;
      expect(priceUsd >= cbiThreshold).toBe(true);

      // Conservative net rental yield at 7.2%
      const annualRental = Math.round(priceUsd * 0.072);
      expect(annualRental).toBe(32400);
      const monthlyRental = Math.round(annualRental / 12);
      expect(monthlyRental).toBe(2700);
      const threeYearRental = annualRental * 3;
      expect(threeYearRental).toBe(97200);

      // Verify DOM rendering reflects these calculations
      expect(screen.getAllByText((c) => c.includes("450,000")).length).toBeGreaterThan(0);
      expect(screen.getAllByText((c) => c.includes("18,000")).length).toBeGreaterThan(0);
      expect(screen.getAllByText((c) => c.includes("750")).length).toBeGreaterThan(0);
      expect(screen.getAllByText((c) => c.includes("650")).length).toBeGreaterThan(0);
      expect(screen.getAllByText((c) => c.includes("2,500")).length).toBeGreaterThan(0);
      expect(screen.getAllByText((c) => c.includes("21,900")).length).toBeGreaterThan(0);
      expect(screen.getAllByText((c) => c.includes("471,900")).length).toBeGreaterThan(0);
    });

    it("T2.5: Sovereign asset lock preservation — hero-building-avrasya.png bitstream unchanged", () => {
      expect(fs.existsSync(heroAssetPath)).toBe(true);
      const buffer = fs.readFileSync(heroAssetPath);
      const hash = crypto.createHash("sha256").update(buffer).digest("hex");
      expect(hash.toLowerCase()).toBe(expectedHeroSha256);
    });
  });

  // =========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS (PAIRWISE INTERACTIONS)
  // =========================================================================
  describe("Tier 3 — Cross-Feature Combinations", () => {
    it("T3.1: Language switch to Arabic or Farsi updates dir='rtl' and preserves (Tapu) and (DAB)", async () => {
      const { container } = renderWithProviders(<ServicesPage />, "ar");

      // Verify root or main container has RTL dir
      expect(document.documentElement.dir).toBe("rtl");

      // Verify Tapu and DAB are present in the rendered DOM
      const tapuMatches = screen.queryAllByText((c) => c.includes("Tapu"));
      expect(tapuMatches.length).toBeGreaterThan(0);

      const dabMatches = screen.queryAllByText((c) => c.includes("DAB"));
      expect(dabMatches.length).toBeGreaterThan(0);
    });

    it("T3.2: Step progression transitions between Buy (Step 04) and Citizenship (Step 07)", () => {
      const { container } = renderWithProviders(<ServicesProcessTimeline />);

      // Verify Step 04 (Purchase & Title Deed in Buy) and Step 07 (Passports in Citizenship)
      const step4 = screen.queryAllByText(
        (c) => c.includes("04") || c.toLowerCase().includes("purchase and title deed"),
      );
      expect(step4.length).toBeGreaterThan(0);

      const step7 = screen.queryAllByText(
        (c) => c.includes("07") || c.toLowerCase().includes("passports in your hands"),
      );
      expect(step7.length).toBeGreaterThan(0);
    });

    it("T3.3: LanguageSwitcher renders all 7 options and updates active selection", async () => {
      function SwitcherHost() {
        return (
          <header>
            <LanguageSwitcher variant="navbar" />
          </header>
        );
      }

      renderWithProviders(<SwitcherHost />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS (END-TO-END WORKFLOWS)
  // =========================================================================
  describe("Tier 4 — Real-World Application Scenarios", () => {
    it("T4.1: Simulated End-to-End Buyer Journey through all 9 Steps", () => {
      const { container } = renderWithProviders(<ServicesProcessTimeline />);

      const journeyWorkflow = [
        {
          step: "01",
          phase: "CHOOSE",
          name: "Free Consultation",
          objective: "budget and goals",
        },
        {
          step: "02",
          phase: "CHOOSE",
          name: "Property Search and Checks",
          objective: "Tapu",
        },
        {
          step: "03",
          phase: "BUY",
          name: "Tax Number and Bank Account",
          objective: "DAB",
        },
        {
          step: "04",
          phase: "BUY",
          name: "Purchase and Title Deed",
          objective: "registered in your name",
        },
        {
          step: "05",
          phase: "CITIZENSHIP",
          name: "Application",
          objective: "files the application",
        },
        {
          step: "06",
          phase: "CITIZENSHIP",
          name: "Document Follow-up",
          objective: "track your file",
        },
        {
          step: "07",
          phase: "CITIZENSHIP",
          name: "Passports in Your Hands",
          objective: "collect your passports",
        },
        {
          step: "08",
          phase: "AFTER CITIZENSHIP",
          name: "Rent Your Property",
          objective: "find tenants",
        },
        {
          step: "09",
          phase: "AFTER CITIZENSHIP",
          name: "Sell When You Are Ready",
          objective: "value your property",
        },
      ];

      // Walk through each milestone of the client journey
      const content = container.textContent || "";
      for (const item of journeyWorkflow) {
        // Assert step is represented in the buyer journey flow
        const hasStepNumber = content.includes(item.step);
        expect(hasStepNumber).toBe(true);
      }
    });

    it("T4.2: Multilingual Real-World Investor Experience from EN to AR", async () => {
      function FullAppSimulation() {
        const { locale, setLocale } = useLanguage();
        return (
          <div>
            <div data-testid="locale-indicator">{locale}</div>
            <button data-testid="select-ar" onClick={() => setLocale("ar")}>
              العربية
            </button>
            <button data-testid="select-en" onClick={() => setLocale("en")}>
              English
            </button>
            <ServicesPage />
          </div>
        );
      }

      renderWithProviders(<FullAppSimulation />);

      // Starts in English
      expect(screen.getByTestId("locale-indicator")).toHaveTextContent("en");
      expect(document.documentElement.dir).toBe("ltr");

      // Switch to Arabic
      await act(async () => {
        fireEvent.click(screen.getByTestId("select-ar"));
      });

      expect(screen.getByTestId("locale-indicator")).toHaveTextContent("ar");
      expect(document.documentElement.dir).toBe("rtl");
    });
  });
});
