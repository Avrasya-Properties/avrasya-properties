import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import React from "react";
import {
  LOCALES,
  TRANSLATIONS,
  DEFAULT_LOCALE,
  getLocaleConfig,
  isRtlLocale,
  getTranslation,
  type Locale,
  type AppTranslations,
} from "@/i18n";
import { en } from "@/i18n/locales/en";
import { tr } from "@/i18n/locales/tr";
import { ar } from "@/i18n/locales/ar";
import { ru } from "@/i18n/locales/ru";
import { fa } from "@/i18n/locales/fa";
import { zh } from "@/i18n/locales/zh";
import { bn } from "@/i18n/locales/bn";
import { LanguageProvider, useLanguage, useTranslation, LANGUAGE_KEY } from "@/hooks/useLanguage";

describe("Milestone 1 Adversarial & Deep Empirical Challenge", () => {
  const ALL_LOCALES: Locale[] = ["en", "tr", "ar", "ru", "fa", "zh", "bn"];
  const NON_EN_LOCALES: { code: Locale; data: AppTranslations }[] = [
    { code: "tr", data: tr },
    { code: "ar", data: ar },
    { code: "ru", data: ru },
    { code: "fa", data: fa },
    { code: "zh", data: zh },
    { code: "bn", data: bn },
  ];

  afterEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("dir");
    document.documentElement.removeAttribute("lang");
    const fontEl = document.getElementById("rtl-fonts");
    if (fontEl) fontEl.remove();
  });

  describe("1. Deep Key Parity & Non-Empty String Verification", () => {
    // Deep recursive key extractor including array elements and objects inside arrays
    function extractDeepPaths(val: unknown, currentPath = ""): string[] {
      if (val === null || val === undefined) return [currentPath];
      if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
        return [currentPath];
      }
      if (Array.isArray(val)) {
        let paths: string[] = [`${currentPath}[]`];
        val.forEach((item, idx) => {
          paths = paths.concat(extractDeepPaths(item, `${currentPath}[${idx}]`));
        });
        return paths;
      }
      if (typeof val === "object") {
        let paths: string[] = [];
        for (const [k, v] of Object.entries(val)) {
          const next = currentPath ? `${currentPath}.${k}` : k;
          paths = paths.concat(extractDeepPaths(v, next));
        }
        return paths;
      }
      return [currentPath];
    }

    // Normalized path (ignores concrete array index: e.g. services.faqs[0].q -> services.faqs[*].q)
    function normalizeArrayPaths(paths: string[]): string[] {
      const normalized = new Set<string>();
      for (const p of paths) {
        normalized.add(p.replace(/\[\d+\]/g, "[*]"));
      }
      return Array.from(normalized).sort();
    }

    const enPaths = extractDeepPaths(en);
    const normalizedEnPaths = normalizeArrayPaths(enPaths);

    NON_EN_LOCALES.forEach(({ code, data }) => {
      it(`[Parity] Locale '${code}' has exact normalized structural path parity with 'en'`, () => {
        const localePaths = extractDeepPaths(data);
        const normalizedLocalePaths = normalizeArrayPaths(localePaths);

        const missing = normalizedEnPaths.filter((p) => !normalizedLocalePaths.includes(p));
        const extra = normalizedLocalePaths.filter((p) => !normalizedEnPaths.includes(p));

        expect(missing, `Locale ${code} is missing structural paths`).toEqual([]);
        expect(extra, `Locale ${code} has extraneous unexpected structural paths`).toEqual([]);
      });

      it(`[No Empty Values] Locale '${code}' contains non-empty strings wherever 'en' is non-empty`, () => {
        function checkMatchingValues(localeVal: unknown, enVal: unknown, path: string) {
          if (typeof enVal === "string") {
            expect(typeof localeVal, `Type mismatch at ${path}`).toBe("string");
            if (enVal.trim().length > 0) {
              expect(
                (localeVal as string).trim().length,
                `Locale '${code}' has empty string at path '${path}', but 'en' has content`,
              ).toBeGreaterThan(0);
            }
          } else if (Array.isArray(enVal)) {
            expect(Array.isArray(localeVal), `Expected array at ${path}`).toBe(true);
            const locArr = localeVal as unknown[];
            expect(locArr.length, `Array length mismatch at ${path}`).toBe(enVal.length);
            enVal.forEach((item, idx) => checkMatchingValues(locArr[idx], item, `${path}[${idx}]`));
          } else if (enVal && typeof enVal === "object") {
            expect(localeVal && typeof localeVal === "object", `Expected object at ${path}`).toBe(
              true,
            );
            const locObj = localeVal as Record<string, unknown>;
            for (const [k, v] of Object.entries(enVal as Record<string, unknown>)) {
              checkMatchingValues(locObj[k], v, `${path}.${k}`);
            }
          }
        }
        checkMatchingValues(data, en, code);
      });
    });
  });

  describe("2. Backwards Compatibility for Existing Routes", () => {
    ALL_LOCALES.forEach((locale) => {
      const dict = TRANSLATIONS[locale];

      it(`[Citizenship Route Contract] '${locale}' satisfies all t.citizenship and t.services.faqs requirements`, () => {
        // CitizenshipPage reads t.services.faqs.map(f => [f.q, f.a])
        expect(Array.isArray(dict.services.faqs)).toBe(true);
        expect(dict.services.faqs.length).toBeGreaterThanOrEqual(5);
        dict.services.faqs.forEach((faq, i) => {
          expect(typeof faq.q).toBe("string");
          expect(typeof faq.a).toBe("string");
          expect(faq.q.trim().length, `Faq ${i} question empty in ${locale}`).toBeGreaterThan(0);
          expect(faq.a.trim().length, `Faq ${i} answer empty in ${locale}`).toBeGreaterThan(0);
        });

        // CitizenshipPage reads t.citizenship requirements and steps
        expect(dict.citizenship.req1Title).toBeTruthy();
        expect(dict.citizenship.req1Desc).toBeTruthy();
        expect(dict.citizenship.req2Title).toBeTruthy();
        expect(dict.citizenship.req2Desc).toBeTruthy();
        expect(dict.citizenship.req3Title).toBeTruthy();
        expect(dict.citizenship.req3Desc).toBeTruthy();
        expect(dict.citizenship.req4Title).toBeTruthy();
        expect(dict.citizenship.req4Desc).toBeTruthy();

        expect(dict.citizenship.step1Title).toBeTruthy();
        expect(dict.citizenship.step1Duration).toBeTruthy();
        expect(dict.citizenship.step2Title).toBeTruthy();
        expect(dict.citizenship.step2Duration).toBeTruthy();
        expect(dict.citizenship.step3Title).toBeTruthy();
        expect(dict.citizenship.step3Duration).toBeTruthy();
        expect(dict.citizenship.step4Title).toBeTruthy();
        expect(dict.citizenship.step4Duration).toBeTruthy();
        expect(dict.citizenship.step5Title).toBeTruthy();
        expect(dict.citizenship.step5Duration).toBeTruthy();
      });

      it(`[Investment Catalog Route Contract] '${locale}' satisfies t.catalog.phases and t.catalog.metrics requirements`, () => {
        // InvestmentCatalog maps t.catalog.phases: phase, title, desc
        expect(Array.isArray(dict.catalog.phases)).toBe(true);
        expect(dict.catalog.phases).toHaveLength(6);
        dict.catalog.phases.forEach((p) => {
          expect(typeof p.phase).toBe("string");
          expect(typeof p.title).toBe("string");
          expect(typeof p.desc).toBe("string");
          expect(p.phase.trim().length).toBeGreaterThan(0);
          expect(p.title.trim().length).toBeGreaterThan(0);
          expect(p.desc.trim().length).toBeGreaterThan(0);
        });

        // InvestmentCatalog maps t.catalog.metrics: label, val, sub
        expect(Array.isArray(dict.catalog.metrics)).toBe(true);
        expect(dict.catalog.metrics).toHaveLength(6);
        dict.catalog.metrics.forEach((m) => {
          expect(typeof m.label).toBe("string");
          expect(typeof m.val).toBe("string");
          expect(typeof m.sub).toBe("string");
          expect(m.label.trim().length).toBeGreaterThan(0);
          expect(m.val.trim().length).toBeGreaterThan(0);
          expect(m.sub.trim().length).toBeGreaterThan(0);
        });

        // Key labels
        expect(dict.catalog.eyebrow).toBeTruthy();
        expect(dict.catalog.downloadEyebrow).toBeTruthy();
        expect(dict.catalog.downloadTitle).toBeTruthy();
        expect(dict.catalog.downloadDesc).toBeTruthy();
        expect(dict.catalog.downloadPdfBtn).toBeTruthy();
      });

      it(`[Calculator Route Contract] '${locale}' satisfies all t.calculator tabs and formulas keys`, () => {
        expect(dict.calculator.tabClosing).toBeTruthy();
        expect(dict.calculator.tabYield).toBeTruthy();
        expect(dict.calculator.tabCbi).toBeTruthy();
        expect(dict.calculator.tabHolding).toBeTruthy();
        expect(dict.calculator.propertyPriceLabel).toBeTruthy();
        expect(dict.calculator.tapuShareFull).toBeTruthy();
        expect(dict.calculator.tapuShareSplit).toBeTruthy();
        expect(dict.calculator.closingCostsTotal).toBeTruthy();
        expect(dict.calculator.tapuDeedTax).toBeTruthy();
        expect(dict.calculator.cbiExceeds).toBeTruthy();
        expect(dict.calculator.cbiShortfall).toBeTruthy();
        expect(dict.calculator.grossYieldPct).toBeTruthy();
        expect(dict.calculator.netYieldReturn).toBeTruthy();
        expect(dict.calculator.holding5YearZeroTax).toBeTruthy();
      });

      it(`[Services Route Pre-M2 Contract] '${locale}' preserves legacy t.services.services array (10 cards)`, () => {
        // ServicesPage (pre-M2) maps t.services.services: num, title, category, desc, deliverables
        expect(Array.isArray(dict.services.services)).toBe(true);
        expect(dict.services.services).toHaveLength(10);
        dict.services.services.forEach((s) => {
          expect(typeof s.title).toBe("string");
          expect(typeof s.category).toBe("string");
          expect(typeof s.desc).toBe("string");
          expect(Array.isArray(s.deliverables)).toBe(true);
          expect(s.deliverables.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("3. Authoritative 4-Part 9-Step Timeline & Term Preservation Invariants", () => {
    ALL_LOCALES.forEach((locale) => {
      const dict = TRANSLATIONS[locale];
      const parts = dict.services.parts;

      it(`[Timeline Structure] '${locale}' enforces 4 parts with 2, 2, 3, 2 step distribution`, () => {
        expect(parts).toHaveLength(4);
        expect(parts[0]!.steps).toHaveLength(2); // Part 1: Choose (01, 02)
        expect(parts[1]!.steps).toHaveLength(2); // Part 2: Buy (03, 04)
        expect(parts[2]!.steps).toHaveLength(3); // Part 3: Citizenship (05, 06, 07)
        expect(parts[3]!.steps).toHaveLength(2); // Part 4: After Citizenship (08, 09)

        const allSteps = parts.flatMap((p) => p.steps);
        expect(allSteps).toHaveLength(9);
        expect(allSteps.map((s) => s.stepNumber)).toEqual([
          "01",
          "02",
          "03",
          "04",
          "05",
          "06",
          "07",
          "08",
          "09",
        ]);
      });

      it(`[Core Terms] '${locale}' strictly preserves Tapu in Step 02 and DAB in Step 03`, () => {
        const step2 = parts[0]!.steps[1]!;
        const step3 = parts[1]!.steps[0]!;

        // Check description includes Tapu and DAB
        expect(step2.description).toMatch(/Tapu/);
        expect(step3.description).toMatch(/DAB/);

        // If termNote exists, verify it also preserves the canonical term
        if (step2.termNote) {
          expect(step2.termNote).toContain("Tapu");
        }
        if (step3.termNote) {
          expect(step3.termNote).toContain("DAB");
        }
      });
    });

    it("verifies localized bracket formats for Chinese and Bengali", () => {
      // Chinese: 产权证（Tapu） and 货币兑换证明（DAB）
      const zhStep2 = zh.services.parts[0]!.steps[1]!;
      const zhStep3 = zh.services.parts[1]!.steps[0]!;
      expect(zhStep2.description).toContain("Tapu");
      expect(zhStep3.description).toContain("DAB");
      expect(zhStep2.description).toMatch(/产权证[（(]Tapu[）)]/);
      expect(zhStep3.description).toMatch(/货币兑换证明[（(]DAB[）)]/);

      // Bengali: মালিকানা দলিল (Tapu) and মুদ্রা বিনিময় সনদ (DAB)
      const bnStep2 = bn.services.parts[0]!.steps[1]!;
      const bnStep3 = bn.services.parts[1]!.steps[0]!;
      expect(bnStep2.description).toContain("Tapu");
      expect(bnStep3.description).toContain("DAB");
      expect(bnStep2.description).toContain("মালিকানা দলিল (Tapu)");
      expect(bnStep3.description).toContain("মুদ্রা বিনিময় সনদ (DAB)");
    });
  });

  describe("4. Bidirectional RTL Layout, DOM Attributes & Fonts", () => {
    it("reports exact RTL / LTR status for all 7 locales", () => {
      const rtlMap: Record<Locale, boolean> = {
        en: false,
        tr: false,
        ar: true,
        ru: false,
        fa: true,
        zh: false,
        bn: false,
      };

      ALL_LOCALES.forEach((loc) => {
        expect(isRtlLocale(loc)).toBe(rtlMap[loc]);
        expect(getLocaleConfig(loc).dir).toBe(rtlMap[loc] ? "rtl" : "ltr");
      });
    });

    function TestRtlConsumer() {
      const { locale, isRtl, setLocale } = useLanguage();
      return (
        <div>
          <span data-testid="current-locale">{locale}</span>
          <span data-testid="is-rtl">{isRtl ? "RTL_TRUE" : "RTL_FALSE"}</span>
          <button data-testid="switch-ar" onClick={() => setLocale("ar")}>
            To Arabic
          </button>
          <button data-testid="switch-fa" onClick={() => setLocale("fa")}>
            To Farsi
          </button>
          <button data-testid="switch-zh" onClick={() => setLocale("zh")}>
            To Chinese
          </button>
          <button data-testid="switch-bn" onClick={() => setLocale("bn")}>
            To Bengali
          </button>
          <button data-testid="switch-en" onClick={() => setLocale("en")}>
            To English
          </button>
        </div>
      );
    }

    it("dynamically manages document attributes, rtl class, and rtl-fonts link on locale switch", () => {
      render(
        <LanguageProvider>
          <TestRtlConsumer />
        </LanguageProvider>,
      );

      // Initial English state
      expect(document.documentElement.lang).toBe("en");
      expect(document.documentElement.dir).toBe("ltr");
      expect(document.documentElement.classList.contains("rtl")).toBe(false);
      expect(document.getElementById("rtl-fonts")).toBeNull();

      // Switch to Arabic (RTL)
      act(() => {
        screen.getByTestId("switch-ar").click();
      });
      expect(document.documentElement.lang).toBe("ar");
      expect(document.documentElement.dir).toBe("rtl");
      expect(document.documentElement.classList.contains("rtl")).toBe(true);
      expect(screen.getByTestId("is-rtl").textContent).toBe("RTL_TRUE");
      const fontLink = document.getElementById("rtl-fonts") as HTMLLinkElement | null;
      expect(fontLink).not.toBeNull();
      expect(fontLink?.href).toContain("Cairo");
      expect(fontLink?.href).toContain("Vazirmatn");

      // Switch to Farsi (RTL)
      act(() => {
        screen.getByTestId("switch-fa").click();
      });
      expect(document.documentElement.lang).toBe("fa");
      expect(document.documentElement.dir).toBe("rtl");
      expect(document.documentElement.classList.contains("rtl")).toBe(true);

      // Switch to Chinese (LTR)
      act(() => {
        screen.getByTestId("switch-zh").click();
      });
      expect(document.documentElement.lang).toBe("zh");
      expect(document.documentElement.dir).toBe("ltr");
      expect(document.documentElement.classList.contains("rtl")).toBe(false);
      expect(screen.getByTestId("is-rtl").textContent).toBe("RTL_FALSE");

      // Switch to Bengali (LTR)
      act(() => {
        screen.getByTestId("switch-bn").click();
      });
      expect(document.documentElement.lang).toBe("bn");
      expect(document.documentElement.dir).toBe("ltr");
      expect(document.documentElement.classList.contains("rtl")).toBe(false);
      expect(screen.getByTestId("is-rtl").textContent).toBe("RTL_FALSE");
    });
  });

  describe("5. Edge Case Resilience & Storage Fault Tolerance", () => {
    function UseTranslationTester() {
      const { locale } = useTranslation();
      return <span data-testid="loc">{locale}</span>;
    }

    it("gracefully falls back to DEFAULT_LOCALE when localStorage is corrupted or invalid", () => {
      const corruptInputs = [
        "es",
        "de",
        "fr",
        "",
        "null",
        "undefined",
        "<script>alert(1)</script>",
        "__proto__",
        "12345",
      ];

      corruptInputs.forEach((corruptVal) => {
        cleanup();
        localStorage.setItem(LANGUAGE_KEY, corruptVal);

        render(
          <LanguageProvider>
            <UseTranslationTester />
          </LanguageProvider>,
        );

        expect(screen.getByTestId("loc").textContent).toBe(DEFAULT_LOCALE);
      });
    });

    it("getTranslation safely resolves nested keys and falls back gracefully", () => {
      // Normal resolution
      expect(getTranslation("en", "nav.properties")).toBe("Properties");
      expect(getTranslation("zh", "nav.properties")).toBe("房源列表");
      expect(getTranslation("bn", "nav.properties")).toBe("সম্পত্তিসমূহ");

      // Non-existent key with fallback
      expect(getTranslation("en", "non.existent.path", "CustomFallback")).toBe("CustomFallback");

      // Non-existent key without fallback returns key string
      expect(getTranslation("en", "non.existent.path")).toBe("non.existent.path");

      // Invalid locale falls back to en
      expect(getTranslation("invalid" as unknown as Locale, "nav.properties")).toBe("Properties");
    });
  });
});
