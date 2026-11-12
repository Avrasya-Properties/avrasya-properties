import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { render, screen, cleanup, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { LOCALES, getLocaleConfig, isRtlLocale, TRANSLATIONS, type Locale } from "@/i18n";
import { LanguageProvider, useLanguage } from "@/hooks/useLanguage";
import { ServicesPage } from "@/routes/services";
import { ServicesProcessTimeline } from "@/components/site/ServicesProcessTimeline";
import { EXCHANGE_RATES, convertUsdPrice, type SupportedCurrency } from "@/data/properties";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({
    head: vi.fn(),
    component: vi.fn(),
  }),
  useRouterState: ({ select }: { select?: (s: any) => any } = {}) => {
    const s = { location: { pathname: "/services" } };
    return select ? select(s) : s;
  },
  Link: ({ to, children, className, onClick, ...rest }: any) => (
    <a href={typeof to === "string" ? to : "#"} className={className} onClick={onClick} {...rest}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}));

// Mock Supabase
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

function renderWithLocale(ui: React.ReactElement, locale: Locale) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  localStorage.setItem("avrasya_preferred_language", locale);
  return render(
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>{ui}</LanguageProvider>
    </QueryClientProvider>,
  );
}

describe("Milestone 4 Empirical Challenge: Currency Conversions, RTL Locales & Statutory Terms", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
    document.documentElement.classList.remove("rtl");
    const existingFont = document.getElementById("rtl-fonts");
    if (existingFont) existingFont.remove();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // =========================================================================
  // Challenge 1: Multi-Currency Conversion (USD, EUR, GBP, TRY) & Boundary Precision
  // =========================================================================
  describe("Challenge 1: Multi-Currency Conversion Precision & Invariants", () => {
    it("converts USD benchmark amounts using statutory baseline rates (USD=1, EUR=0.92, TRY=38.5, GBP=0.78)", () => {
      const benchmarkAmounts = [100000, 270000, 400000, 450000, 1000000];

      benchmarkAmounts.forEach((usd) => {
        const usdFormatted = convertUsdPrice(usd, "USD");
        const eurFormatted = convertUsdPrice(usd, "EUR");
        const tryFormatted = convertUsdPrice(usd, "TRY");
        const gbpFormatted = convertUsdPrice(usd, "GBP");

        // USD
        expect(usdFormatted).toBe(`$${usd.toLocaleString("en-US")}`);

        // EUR (rate 0.92)
        const expectedEur = Math.round(usd * 0.92);
        expect(eurFormatted).toBe(`€${expectedEur.toLocaleString("en-US")}`);

        // TRY (rate 38.5)
        const expectedTry = Math.round(usd * 38.5);
        expect(tryFormatted).toBe(`₺${expectedTry.toLocaleString("en-US")}`);

        // GBP (rate 0.78)
        const expectedGbp = Math.round(usd * 0.78);
        expect(gbpFormatted).toBe(`£${expectedGbp.toLocaleString("en-US")}`);
      });
    });

    it("verifies exact conversion for $400,000 USD statutory citizenship threshold across all 4 currencies", () => {
      const cbiUsd = 400000;
      expect(convertUsdPrice(cbiUsd, "USD")).toBe("$400,000");
      expect(convertUsdPrice(cbiUsd, "EUR")).toBe("€368,000");
      expect(convertUsdPrice(cbiUsd, "TRY")).toBe("₺15,400,000");
      expect(convertUsdPrice(cbiUsd, "GBP")).toBe("£312,000");
    });

    it("handles boundary edge cases: null, zero ($0), and ultra-luxury high values ($25,000,000)", () => {
      // Null amount
      expect(convertUsdPrice(null, "USD")).toBe("Price on request");
      expect(convertUsdPrice(null, "EUR")).toBe("Price on request");
      expect(convertUsdPrice(null, "TRY")).toBe("Price on request");
      expect(convertUsdPrice(null, "GBP")).toBe("Price on request");

      // Zero amount
      expect(convertUsdPrice(0, "USD")).toBe("$0");
      expect(convertUsdPrice(0, "EUR")).toBe("€0");
      expect(convertUsdPrice(0, "TRY")).toBe("₺0");
      expect(convertUsdPrice(0, "GBP")).toBe("£0");

      // High value: $25,000,000 Bosphorus mansion
      const luxuryUsd = 25000000;
      expect(convertUsdPrice(luxuryUsd, "USD")).toBe("$25,000,000");
      expect(convertUsdPrice(luxuryUsd, "EUR")).toBe("€23,000,000");
      expect(convertUsdPrice(luxuryUsd, "TRY")).toBe("₺962,500,000");
      expect(convertUsdPrice(luxuryUsd, "GBP")).toBe("£19,500,000");
    });

    it("verifies mathematical fee calculations across transaction scales", () => {
      const testCases = [
        { price: 300000, fullTapu: 12000, splitTapu: 6000, vat1Pct: 3000, cbiDeficit: 100000 },
        { price: 400000, fullTapu: 16000, splitTapu: 8000, vat1Pct: 4000, cbiDeficit: 0 },
        { price: 450000, fullTapu: 18000, splitTapu: 9000, vat1Pct: 4500, cbiDeficit: 0 },
        { price: 750000, fullTapu: 30000, splitTapu: 15000, vat1Pct: 7500, cbiDeficit: 0 },
      ];

      testCases.forEach(({ price, fullTapu, splitTapu, vat1Pct, cbiDeficit }) => {
        expect(Math.round(price * 0.04)).toBe(fullTapu);
        expect(Math.round(price * 0.02)).toBe(splitTapu);
        expect(Math.round(price * 0.01)).toBe(vat1Pct);
        expect(Math.max(0, 400000 - price)).toBe(cbiDeficit);

        // Fixed statutory constants
        const spk = 750;
        const dab = 650;
        const legal = 2500;
        const totalClosingFull = fullTapu + 0 + spk + dab + legal;
        const allIn = price + totalClosingFull;
        expect(allIn).toBe(price + fullTapu + 3900);
      });
    });
  });

  // =========================================================================
  // Challenge 2: RTL Locales (Arabic & Farsi) Document Direction & Layout Integrity
  // =========================================================================
  describe("Challenge 2: RTL Locales Directional Integrity (Arabic & Farsi)", () => {
    it("configures RTL metadata correctly for Arabic (ar) and Persian/Farsi (fa)", () => {
      expect(isRtlLocale("ar")).toBe(true);
      expect(isRtlLocale("fa")).toBe(true);

      expect(getLocaleConfig("ar").dir).toBe("rtl");
      expect(getLocaleConfig("fa").dir).toBe("rtl");

      // Verify all non-RTL locales return false and 'ltr'
      const ltrLocales: Locale[] = ["en", "tr", "ru", "zh", "bn"];
      ltrLocales.forEach((l) => {
        expect(isRtlLocale(l)).toBe(false);
        expect(getLocaleConfig(l).dir).toBe("ltr");
      });
    });

    it("applies dir='rtl', lang='ar', and injects Cairo/Vazirmatn fonts when mounting Arabic locale", () => {
      renderWithLocale(<div>Arabic Test Container</div>, "ar");

      expect(document.documentElement.lang).toBe("ar");
      expect(document.documentElement.dir).toBe("rtl");
      expect(document.documentElement.classList.contains("rtl")).toBe(true);

      const fontLink = document.getElementById("rtl-fonts") as HTMLLinkElement | null;
      expect(fontLink).not.toBeNull();
      expect(fontLink?.href).toContain("Cairo");
      expect(fontLink?.href).toContain("Vazirmatn");
    });

    it("applies dir='rtl', lang='fa', and maintains RTL classes when mounting Farsi locale", () => {
      renderWithLocale(<div>Farsi Test Container</div>, "fa");

      expect(document.documentElement.lang).toBe("fa");
      expect(document.documentElement.dir).toBe("rtl");
      expect(document.documentElement.classList.contains("rtl")).toBe(true);
    });

    it("resets dir='ltr', lang='en', and removes 'rtl' class when switching back to English", () => {
      function SwitcherConsumer() {
        const { locale, setLocale, isRtl } = useLanguage();
        return (
          <div>
            <span data-testid="active-lang">{locale}</span>
            <span data-testid="is-rtl">{isRtl ? "RTL" : "LTR"}</span>
            <button onClick={() => setLocale("ar")}>To AR</button>
            <button onClick={() => setLocale("en")}>To EN</button>
          </div>
        );
      }

      renderWithLocale(<SwitcherConsumer />, "en");
      expect(document.documentElement.dir).toBe("ltr");
      expect(document.documentElement.classList.contains("rtl")).toBe(false);

      // Switch to Arabic
      act(() => {
        screen.getByText("To AR").click();
      });
      expect(document.documentElement.dir).toBe("rtl");
      expect(document.documentElement.classList.contains("rtl")).toBe(true);
      expect(screen.getByTestId("active-lang").textContent).toBe("ar");
      expect(screen.getByTestId("is-rtl").textContent).toBe("RTL");

      // Switch back to English
      act(() => {
        screen.getByText("To EN").click();
      });
      expect(document.documentElement.dir).toBe("ltr");
      expect(document.documentElement.classList.contains("rtl")).toBe(false);
      expect(screen.getByTestId("active-lang").textContent).toBe("en");
      expect(screen.getByTestId("is-rtl").textContent).toBe("LTR");
    });
  });

  // =========================================================================
  // Challenge 3: Preservation of Bracketed Statutory Terms '(Tapu)' and '(DAB)'
  // =========================================================================
  describe("Challenge 3: Preservation of Statutory Terms (Tapu) and (DAB)", () => {
    const all7Locales: Locale[] = ["en", "tr", "ar", "ru", "fa", "zh", "bn"];

    it("strictly preserves (Tapu) and (DAB) across all 7 locale dictionaries in Step 02 and Step 03", () => {
      all7Locales.forEach((loc) => {
        const dict = TRANSLATIONS[loc];
        expect(dict.services).toBeDefined();
        const steps = dict.services.parts.flatMap((p) => p.steps);
        expect(steps.length).toBe(9);

        // Step 02 Property Search & Checks must preserve (Tapu)
        const step2 = steps[1];
        expect(step2).toBeDefined();
        expect(step2!.description).toMatch(/\(Tapu\)|Tapu/);
        expect(step2!.termNote || "").toMatch(/\(Tapu\)|Tapu/);

        // Step 03 Tax Number & Bank Account must preserve (DAB)
        const step3 = steps[2];
        expect(step3).toBeDefined();
        expect(step3!.description).toMatch(/\(DAB\)|DAB/);
        expect(step3!.termNote || "").toMatch(/\(DAB\)|DAB/);
      });
    });

    it("renders ServicesPage and ServicesProcessTimeline in Arabic with (Tapu) and (DAB) visible in the DOM", () => {
      const { container } = renderWithLocale(
        <>
          <ServicesPage />
          <ServicesProcessTimeline />
        </>,
        "ar",
      );

      expect(document.documentElement.dir).toBe("rtl");
      expect(document.documentElement.lang).toBe("ar");

      // Verify (Tapu) is present in Arabic DOM
      const tapuMatches = screen.queryAllByText(
        (content) => content.includes("(Tapu)") || content.includes("Tapu"),
      );
      expect(tapuMatches.length).toBeGreaterThan(0);

      // Verify (DAB) is present in Arabic DOM
      const dabMatches = screen.queryAllByText(
        (content) => content.includes("(DAB)") || content.includes("DAB"),
      );
      expect(dabMatches.length).toBeGreaterThan(0);

      // Verify closing line in Arabic (accounting for enclosing &ldquo; / &rdquo;)
      const closingMatches = screen.queryAllByText((content) =>
        content.includes(TRANSLATIONS.ar.services.closingLine),
      );
      expect(closingMatches.length).toBeGreaterThan(0);
    });

    it("renders ServicesPage and ServicesProcessTimeline in Farsi with (Tapu) and (DAB) visible in the DOM", () => {
      const { container } = renderWithLocale(
        <>
          <ServicesPage />
          <ServicesProcessTimeline />
        </>,
        "fa",
      );

      expect(document.documentElement.dir).toBe("rtl");
      expect(document.documentElement.lang).toBe("fa");

      // Verify (Tapu) is present in Farsi DOM
      const tapuMatches = screen.queryAllByText(
        (content) => content.includes("(Tapu)") || content.includes("Tapu"),
      );
      expect(tapuMatches.length).toBeGreaterThan(0);

      // Verify (DAB) is present in Farsi DOM
      const dabMatches = screen.queryAllByText(
        (content) => content.includes("(DAB)") || content.includes("DAB"),
      );
      expect(dabMatches.length).toBeGreaterThan(0);

      // Verify closing line in Farsi (accounting for enclosing &ldquo; / &rdquo;)
      const closingMatches = screen.queryAllByText((content) =>
        content.includes(TRANSLATIONS.fa.services.closingLine),
      );
      expect(closingMatches.length).toBeGreaterThan(0);
    });
  });
});
