import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import {
  LOCALES,
  TRANSLATIONS,
  DEFAULT_LOCALE,
  getLocaleConfig,
  isRtlLocale,
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
import { LANGUAGE_KEY, LanguageProvider, useLanguage, useTranslation } from "@/hooks/useLanguage";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";

describe("Milestone 1 Adversarial Challenge & Stress Suite", () => {
  const targetLocales: Locale[] = ["en", "tr", "ar", "ru", "fa", "zh", "bn"];
  const nonEnglishLocales: { code: Locale; data: AppTranslations }[] = [
    { code: "tr", data: tr },
    { code: "ar", data: ar },
    { code: "ru", data: ru },
    { code: "fa", data: fa },
    { code: "zh", data: zh },
    { code: "bn", data: bn },
  ];

  // Helper to recursively collect all property paths and leaf values
  function collectLeaves(obj: unknown, currentPath = ""): Array<{ path: string; value: unknown }> {
    const results: Array<{ path: string; value: unknown }> = [];
    if (obj === null || obj === undefined) {
      results.push({ path: currentPath, value: obj });
      return results;
    }
    if (typeof obj === "object") {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          results.push(...collectLeaves(item, `${currentPath}[${index}]`));
        });
      } else {
        for (const [key, val] of Object.entries(obj)) {
          const nextPath = currentPath ? `${currentPath}.${key}` : key;
          results.push(...collectLeaves(val, nextPath));
        }
      }
    } else {
      results.push({ path: currentPath, value: obj });
    }
    return results;
  }

  // =========================================================================
  // 1. LOCALE REGISTRATION, METADATA & RTL LOGIC
  // =========================================================================
  describe("1. Locales Registration, Metadata & RTL Logic", () => {
    it("strictly registers exactly the 7 required locales with no extras or omissions", () => {
      const registeredCodes = LOCALES.map((l) => l.code);
      expect(registeredCodes).toEqual(["en", "tr", "ar", "ru", "fa", "zh", "bn"]);
      expect(registeredCodes).toHaveLength(7);
      expect(new Set(registeredCodes).size).toBe(7);
    });

    it("verifies all 7 locales have non-empty name, nativeName, flag, and valid dir", () => {
      LOCALES.forEach((loc) => {
        expect(loc.name).toBeTruthy();
        expect(loc.name.trim().length).toBeGreaterThan(0);
        expect(loc.nativeName).toBeTruthy();
        expect(loc.nativeName.trim().length).toBeGreaterThan(0);
        expect(loc.flag).toBeTruthy();
        expect(loc.flag.trim().length).toBeGreaterThan(0);
        expect(["ltr", "rtl"]).toContain(loc.dir);
      });
    });

    it("strictly configures RTL for Arabic and Farsi, and LTR for all others", () => {
      const rtlExpected: Record<Locale, "rtl" | "ltr"> = {
        en: "ltr",
        tr: "ltr",
        ar: "rtl",
        ru: "ltr",
        fa: "rtl",
        zh: "ltr",
        bn: "ltr",
      };

      for (const [code, expectedDir] of Object.entries(rtlExpected)) {
        const loc = code as Locale;
        expect(getLocaleConfig(loc).dir).toBe(expectedDir);
        expect(isRtlLocale(loc)).toBe(expectedDir === "rtl");
      }
    });

    it("isRtlLocale handles adversarial / invalid inputs safely without throwing", () => {
      // Hostile inputs
      expect(isRtlLocale("" as any)).toBe(false);
      expect(isRtlLocale("he" as any)).toBe(false);
      expect(isRtlLocale("ur" as any)).toBe(false);
      expect(isRtlLocale("AR" as any)).toBe(false);
      expect(isRtlLocale("FA" as any)).toBe(false);
      expect(isRtlLocale(null as any)).toBe(false);
      expect(isRtlLocale(undefined as any)).toBe(false);
      expect(isRtlLocale(123 as any)).toBe(false);
      expect(isRtlLocale({} as any)).toBe(false);
    });

    it("getLocaleConfig gracefully falls back to DEFAULT_LOCALE for invalid inputs", () => {
      const fallbackConfig = getLocaleConfig("invalid_locale" as any);
      expect(fallbackConfig).toBeDefined();
      expect(fallbackConfig.code).toBe(DEFAULT_LOCALE);
      expect(fallbackConfig.dir).toBe("ltr");

      const nullConfig = getLocaleConfig(null as any);
      expect(nullConfig.code).toBe(DEFAULT_LOCALE);

      const emptyConfig = getLocaleConfig("" as any);
      expect(emptyConfig.code).toBe(DEFAULT_LOCALE);
    });
  });

  // =========================================================================
  // 2. EXHAUSTIVE KEY PARITY & INTEGRITY ACROSS ALL 18 NAMESPACES
  // =========================================================================
  describe("2. Exhaustive Key Parity Across All 18 Namespaces", () => {
    const requiredNamespaces = [
      "common",
      "nav",
      "footer",
      "cta",
      "home",
      "properties",
      "propertyCard",
      "propertyDetail",
      "about",
      "citizenship",
      "whyTurkiye",
      "investment",
      "calculator",
      "services",
      "contact",
      "catalog",
      "enquiry",
      "legalDraft",
    ];

    it("verifies all 18 namespaces exist on every locale object", () => {
      targetLocales.forEach((code) => {
        const dict = TRANSLATIONS[code];
        expect(dict).toBeDefined();
        requiredNamespaces.forEach((ns) => {
          expect((dict as any)[ns], `Locale '${code}' missing namespace '${ns}'`).toBeDefined();
        });
      });
    });

    // Helper to get structural property tree paths (without array indices)
    function getStructuralPaths(obj: Record<string, unknown>, prefix = ""): string[] {
      let paths: string[] = [];
      for (const [key, val] of Object.entries(obj)) {
        const current = prefix ? `${prefix}.${key}` : key;
        if (typeof val === "object" && val !== null && !Array.isArray(val)) {
          paths = paths.concat(getStructuralPaths(val as Record<string, unknown>, current));
        } else {
          paths.push(current);
        }
      }
      return paths.sort();
    }

    const enPaths = getStructuralPaths(en as unknown as Record<string, unknown>);

    nonEnglishLocales.forEach(({ code, data }) => {
      it(`locale '${code}' has zero missing keys when compared to English`, () => {
        const currentPaths = getStructuralPaths(data as unknown as Record<string, unknown>);
        const missing = enPaths.filter((p) => !currentPaths.includes(p));
        expect(missing, `Locale '${code}' is missing keys: ${missing.join(", ")}`).toEqual([]);
      });

      it(`locale '${code}' has zero extraneous/orphan keys not present in English`, () => {
        const currentPaths = getStructuralPaths(data as unknown as Record<string, unknown>);
        const extraneous = currentPaths.filter((p) => !enPaths.includes(p));
        expect(
          extraneous,
          `Locale '${code}' has extra unknown keys: ${extraneous.join(", ")}`,
        ).toEqual([]);
      });
    });

    it("verifies NO leaf value in ANY locale is null, undefined, empty, or whitespace-only (excluding intentional empty titleEm)", () => {
      targetLocales.forEach((code) => {
        const leaves = collectLeaves(TRANSLATIONS[code]);
        const corrupted: Array<{ path: string; value: unknown; reason: string }> = [];

        leaves.forEach(({ path: p, value: val }) => {
          // services.titleEm is intentionally empty across all locales because the new canonical
          // title is a single un-split string ("One team. Every step. From first call to your passport and beyond.")
          if (p === "services.titleEm") return;

          if (val === undefined) {
            corrupted.push({ path: p, value: val, reason: "is undefined" });
          } else if (val === null) {
            corrupted.push({ path: p, value: val, reason: "is null" });
          } else if (typeof val === "string") {
            if (val.trim() === "") {
              corrupted.push({ path: p, value: val, reason: "is empty or whitespace-only" });
            } else if (
              /\[TODO\]|\[TRANSLATE\]|lorem ipsum|\bTBD\b/i.test(val) &&
              !p.includes("terms") // safety check
            ) {
              corrupted.push({ path: p, value: val, reason: `contains placeholder tag: "${val}"` });
            }
          }
        });

        expect(
          corrupted,
          `Locale '${code}' contains ${corrupted.length} corrupted leaf entries: ${JSON.stringify(corrupted.slice(0, 5))}`,
        ).toEqual([]);
      });
    });

    it("verifies array structures (faqs, services, catalog phases/metrics) have matching lengths across all locales", () => {
      targetLocales.forEach((code) => {
        const dict = TRANSLATIONS[code];
        // services.services array length
        expect(dict.services.services.length).toBe(en.services.services.length);
        // services.faqs array length
        expect(dict.services.faqs.length).toBe(en.services.faqs.length);
        // catalog.phases array length
        expect(dict.catalog.phases.length).toBe(en.catalog.phases.length);
        // catalog.metrics array length
        expect(dict.catalog.metrics.length).toBe(en.catalog.metrics.length);
      });
    });
  });

  // =========================================================================
  // 3. SERVICES TIMELINE 4-PART 9-STEP CANONICAL STRUCTURE & TAPU / DAB
  // =========================================================================
  describe("3. Services Timeline 4-Part 9-Step Specification & Tapu / DAB Preservation", () => {
    it("strictly verifies the 4-part 9-step timeline structure in all 7 locales", () => {
      targetLocales.forEach((code) => {
        const dict = TRANSLATIONS[code];
        const parts = dict.services.parts;

        expect(parts, `Locale '${code}' missing services.parts`).toBeDefined();
        expect(parts).toHaveLength(4);

        // Part 1: CHOOSE (2 steps: 01, 02)
        expect(parts[0]!.steps).toHaveLength(2);
        // Part 2: BUY (2 steps: 03, 04)
        expect(parts[1]!.steps).toHaveLength(2);
        // Part 3: CITIZENSHIP (3 steps: 05, 06, 07)
        expect(parts[2]!.steps).toHaveLength(3);
        // Part 4: AFTER CITIZENSHIP (2 steps: 08, 09)
        expect(parts[3]!.steps).toHaveLength(2);

        const allSteps = parts.flatMap((p) => p.steps);
        expect(allSteps).toHaveLength(9);

        const expectedNumbers = ["01", "02", "03", "04", "05", "06", "07", "08", "09"];
        expect(allSteps.map((s) => s.stepNumber)).toEqual(expectedNumbers);

        // Verify each step has non-empty title and description
        allSteps.forEach((s) => {
          expect(
            s.title.trim().length,
            `Locale '${code}' step ${s.stepNumber} has empty title`,
          ).toBeGreaterThan(0);
          expect(
            s.description.trim().length,
            `Locale '${code}' step ${s.stepNumber} has empty description`,
          ).toBeGreaterThan(0);
        });
      });
    });

    it("verifies verbatim Latin 'Tapu' is preserved in Step 02 in ALL 7 locales", () => {
      targetLocales.forEach((code) => {
        const dict = TRANSLATIONS[code];
        const step2 = dict.services.parts[0]?.steps[1];
        expect(step2).toBeDefined();
        expect(step2!.stepNumber).toBe("02");

        const combinedText = `${step2!.title} ${step2!.description} ${step2!.termNote || ""}`;
        // Must contain exact case-sensitive "Tapu"
        expect(
          combinedText,
          `Locale '${code}' Step 02 must preserve verbatim Latin 'Tapu'`,
        ).toContain("Tapu");
      });
    });

    it("verifies verbatim Latin 'DAB' is preserved in Step 03 in ALL 7 locales", () => {
      targetLocales.forEach((code) => {
        const dict = TRANSLATIONS[code];
        const step3 = dict.services.parts[1]?.steps[0];
        expect(step3).toBeDefined();
        expect(step3!.stepNumber).toBe("03");

        const combinedText = `${step3!.title} ${step3!.description} ${step3!.termNote || ""}`;
        // Must contain exact case-sensitive "DAB"
        expect(
          combinedText,
          `Locale '${code}' Step 03 must preserve verbatim Latin 'DAB'`,
        ).toContain("DAB");
      });
    });

    it("verifies Chinese has bracketed terms '产权证（Tapu）' and '货币兑换证明（DAB）'", () => {
      const zhStep2 = zh.services.parts[0]?.steps[1];
      const zhStep3 = zh.services.parts[1]?.steps[0];
      expect(zhStep2).toBeDefined();
      expect(zhStep3).toBeDefined();
      const zhStep2Text = `${zhStep2!.description} ${zhStep2!.termNote || ""}`;
      const zhStep3Text = `${zhStep3!.description} ${zhStep3!.termNote || ""}`;

      expect(zhStep2Text).toMatch(/产权证.*Tapu|Tapu.*产权证/);
      expect(zhStep3Text).toMatch(/货币兑换证明.*DAB|DAB.*货币兑换证明/);
    });

    it("verifies Bengali has bracketed terms 'মালিকানা দলিল (Tapu)' and 'মুদ্রা বিনিময় সনদ (DAB)'", () => {
      const bnStep2 = bn.services.parts[0]?.steps[1];
      const bnStep3 = bn.services.parts[1]?.steps[0];
      expect(bnStep2).toBeDefined();
      expect(bnStep3).toBeDefined();
      const bnStep2Text = `${bnStep2!.description} ${bnStep2!.termNote || ""}`;
      const bnStep3Text = `${bnStep3!.description} ${bnStep3!.termNote || ""}`;

      expect(bnStep2Text).toMatch(/মালিকানা দলিল.*Tapu|Tapu.*মালিকানা দলিল/);
      expect(bnStep3Text).toMatch(/মুদ্রা বিনিময় সনদ.*DAB|DAB.*মুদ্রা বিনিময় সনদ/);
    });

    it("verifies Services Page Title, Subtitle, Closing Line, and Legal Disclaimer in all 7 locales", () => {
      targetLocales.forEach((code) => {
        const s = TRANSLATIONS[code].services;
        expect(s.title.trim().length, `Locale '${code}' has empty services.title`).toBeGreaterThan(
          0,
        );
        expect(
          s.subtitle.trim().length,
          `Locale '${code}' has empty services.subtitle`,
        ).toBeGreaterThan(0);
        expect(
          s.closingLine.trim().length,
          `Locale '${code}' has empty services.closingLine`,
        ).toBeGreaterThan(0);
        expect(
          s.legalDisclaimer.trim().length,
          `Locale '${code}' has empty services.legalDisclaimer`,
        ).toBeGreaterThan(0);
      });

      // Assert English matches canonical user requirements
      expect(en.services.title).toBe(
        "One team. Every step. From first call to your passport and beyond.",
      );
      expect(en.services.subtitle).toBe(
        "Our own lawyer handles the paperwork. You always know what happens next.",
      );
      expect(en.services.closingLine).toBe("One lawyer. One team. One process.");
    });
  });

  // =========================================================================
  // 4. EDGE CASE HARDENING & ADVERSARIAL FALLBACKS
  // =========================================================================
  describe("4. Edge Case Hardening & Fallbacks", () => {
    it("handles TRANSLATIONS lookup for unknown or null keys safely", () => {
      const unknownLocale = "xx" as unknown as Locale;
      const dict = TRANSLATIONS[unknownLocale] || TRANSLATIONS.en;
      expect(dict).toBeDefined();
      expect(dict.common).toBeDefined();
      expect(dict.services.parts).toHaveLength(4);
    });

    it("verifies DEFAULT_LOCALE is 'en' and is included in targetLocales", () => {
      expect(DEFAULT_LOCALE).toBe("en");
      expect(targetLocales).toContain(DEFAULT_LOCALE);
    });
  });

  // =========================================================================
  // 5. SOVEREIGN ASSET INTEGRITY
  // =========================================================================
  describe("5. Sovereign Asset Lock Integrity", () => {
    it("verifies SHA256 of hero-building-avrasya.png is strictly unchanged", () => {
      const assetPath = path.resolve(__dirname, "../../public/images/hero-building-avrasya.png");
      expect(fs.existsSync(assetPath)).toBe(true);

      const buffer = fs.readFileSync(assetPath);
      const hash = crypto.createHash("sha256").update(buffer).digest("hex").toUpperCase();
      const expectedHash = "978BDB310BFDB282EE5269E04E3D2F012CB0BDCF93821BEA684E2AF9BDDE064C";

      expect(hash).toBe(expectedHash);
    });
  });

  // =========================================================================
  // 6. REACT PROVIDER & COMPONENT ADVERSARIAL STRESS
  // =========================================================================
  describe("6. LanguageProvider & LanguageSwitcher Adversarial Scenarios", () => {
    beforeEach(() => {
      cleanup();
      localStorage.clear();
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
      document.documentElement.classList.remove("rtl");
      const fontLink = document.getElementById("rtl-fonts");
      if (fontLink) fontLink.remove();
    });

    afterEach(() => {
      cleanup();
    });

    function FullHarness() {
      const { locale, setLocale, isRtl, config } = useLanguage();
      const { t } = useTranslation();
      return (
        <div>
          <span data-testid="active-locale">{locale}</span>
          <span data-testid="is-rtl">{isRtl ? "RTL" : "LTR"}</span>
          <span data-testid="dir">{config.dir}</span>
          <span data-testid="home-nav">{t.nav.home}</span>
          <LanguageSwitcher variant="navbar" />
          <LanguageSwitcher variant="mobile" />
          <LanguageSwitcher variant="topbar" />
          <LanguageSwitcher variant="footer" />
          <LanguageSwitcher variant="compact" />
          <button onClick={() => setLocale("ar")}>Go Arabic</button>
          <button onClick={() => setLocale("fa")}>Go Persian</button>
          <button onClick={() => setLocale("zh")}>Go Chinese</button>
          <button onClick={() => setLocale("bn")}>Go Bengali</button>
          <button onClick={() => setLocale("en")}>Go English</button>
        </div>
      );
    }

    it("handles corrupt localStorage values safely on initial mount", () => {
      const corruptValues = ["invalid_lang", "de", "fr", "null", "undefined", "<script>", "EN", ""];
      corruptValues.forEach((badVal) => {
        cleanup();
        localStorage.setItem(LANGUAGE_KEY, badVal);
        render(
          <LanguageProvider>
            <FullHarness />
          </LanguageProvider>,
        );
        // Must fallback safely to English
        expect(screen.getByTestId("active-locale")).toHaveTextContent("en");
        expect(screen.getByTestId("dir")).toHaveTextContent("ltr");
        expect(screen.getByTestId("is-rtl")).toHaveTextContent("LTR");
      });
    });

    it("dynamically injects Cairo and Vazirmatn font link when switching to RTL and removes rtl class when switching to LTR", () => {
      render(
        <LanguageProvider>
          <FullHarness />
        </LanguageProvider>,
      );

      expect(document.getElementById("rtl-fonts")).toBeNull();
      expect(document.documentElement.classList.contains("rtl")).toBe(false);

      // Switch to Arabic (RTL)
      fireEvent.click(screen.getByText("Go Arabic"));
      expect(document.getElementById("rtl-fonts")).not.toBeNull();
      expect(document.documentElement.classList.contains("rtl")).toBe(true);
      expect(document.documentElement.dir).toBe("rtl");
      expect(document.documentElement.lang).toBe("ar");

      // Switch to Persian (RTL) - font link must not be duplicated
      fireEvent.click(screen.getByText("Go Persian"));
      const links = document.querySelectorAll("#rtl-fonts");
      expect(links.length).toBe(1);
      expect(document.documentElement.classList.contains("rtl")).toBe(true);
      expect(document.documentElement.dir).toBe("rtl");

      // Switch to Chinese (LTR) - rtl class removed, dir="ltr"
      fireEvent.click(screen.getByText("Go Chinese"));
      expect(document.documentElement.classList.contains("rtl")).toBe(false);
      expect(document.documentElement.dir).toBe("ltr");
      expect(document.documentElement.lang).toBe("zh");
      expect(screen.getByTestId("home-nav")).toHaveTextContent(zh.nav.home);

      // Switch to Bengali (LTR)
      fireEvent.click(screen.getByText("Go Bengali"));
      expect(document.documentElement.classList.contains("rtl")).toBe(false);
      expect(document.documentElement.dir).toBe("ltr");
      expect(document.documentElement.lang).toBe("bn");
      expect(screen.getByTestId("home-nav")).toHaveTextContent(bn.nav.home);
    });

    it("verifies mobile variant renders native label for Chinese and Bengali", () => {
      // Test Chinese mobile drawer label
      localStorage.setItem(LANGUAGE_KEY, "zh");
      const { unmount } = render(
        <LanguageProvider>
          <LanguageSwitcher variant="mobile" />
        </LanguageProvider>,
      );
      expect(screen.getByText("选择语言")).toBeInTheDocument();
      unmount();

      // Test Bengali mobile drawer label
      cleanup();
      localStorage.setItem(LANGUAGE_KEY, "bn");
      render(
        <LanguageProvider>
          <LanguageSwitcher variant="mobile" />
        </LanguageProvider>,
      );
      expect(screen.getByText("ভাষা নির্বাচন করুন")).toBeInTheDocument();
    });

    it("verifies outside click and Escape key close the dropdown", () => {
      render(
        <LanguageProvider>
          <div>
            <span data-testid="outside">Outside Element</span>
            <LanguageSwitcher variant="navbar" />
          </div>
        </LanguageProvider>,
      );

      const toggleBtn = screen.getByRole("button", { name: /change language/i });
      fireEvent.click(toggleBtn);
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      // Press Escape
      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByRole("listbox")).toBeNull();

      // Re-open and click outside
      fireEvent.click(toggleBtn);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      fireEvent.mouseDown(screen.getByTestId("outside"));
      expect(screen.queryByRole("listbox")).toBeNull();
    });
  });
});
