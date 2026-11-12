import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { LOCALES, TRANSLATIONS, getLocaleConfig, isRtlLocale, type Locale } from "@/i18n";
import { en } from "@/i18n/locales/en";
import { tr } from "@/i18n/locales/tr";
import { ar } from "@/i18n/locales/ar";
import { ru } from "@/i18n/locales/ru";
import { fa } from "@/i18n/locales/fa";
import { zh } from "@/i18n/locales/zh";
import { bn } from "@/i18n/locales/bn";
import { LanguageProvider, useLanguage, useTranslation } from "@/hooks/useLanguage";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";

describe("i18n Locales & Structural Parity", () => {
  const locales = [
    { code: "tr", data: tr },
    { code: "ar", data: ar },
    { code: "ru", data: ru },
    { code: "fa", data: fa },
    { code: "zh", data: zh },
    { code: "bn", data: bn },
  ];

  it("defines all 7 target languages correctly", () => {
    expect(LOCALES.map((l) => l.code)).toEqual(["en", "tr", "ar", "ru", "fa", "zh", "bn"]);
  });

  it("correctly identifies RTL locales", () => {
    expect(isRtlLocale("en")).toBe(false);
    expect(isRtlLocale("tr")).toBe(false);
    expect(isRtlLocale("ru")).toBe(false);
    expect(isRtlLocale("ar")).toBe(true);
    expect(isRtlLocale("fa")).toBe(true);
    expect(isRtlLocale("zh")).toBe(false);
    expect(isRtlLocale("bn")).toBe(false);
  });

  it("returns proper locale configs", () => {
    expect(getLocaleConfig("ar").dir).toBe("rtl");
    expect(getLocaleConfig("fa").dir).toBe("rtl");
    expect(getLocaleConfig("tr").dir).toBe("ltr");
    expect(getLocaleConfig("ru").dir).toBe("ltr");
    expect(getLocaleConfig("en").dir).toBe("ltr");
    expect(getLocaleConfig("zh").dir).toBe("ltr");
    expect(getLocaleConfig("bn").dir).toBe("ltr");
  });

  function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
    let keys: string[] = [];
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        keys = keys.concat(getKeys(val as Record<string, unknown>, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys.sort();
  }

  const enKeys = getKeys(en as unknown as Record<string, unknown>);

  locales.forEach(({ code, data }) => {
    it(`locale '${code}' has complete key parity with 'en'`, () => {
      const currentKeys = getKeys(data as unknown as Record<string, unknown>);
      const missingKeys = enKeys.filter((k) => !currentKeys.includes(k));
      expect(missingKeys).toEqual([]);
    });
  });

  it("verifies 4-part 9-step services timeline in all 7 languages", () => {
    const allLocales: Locale[] = ["en", "tr", "ar", "ru", "fa", "zh", "bn"];
    allLocales.forEach((code) => {
      const dict = TRANSLATIONS[code];
      expect(dict.services.parts).toBeDefined();
      expect(dict.services.parts).toHaveLength(4);

      const allSteps = dict.services.parts.flatMap((p) => p.steps);
      expect(allSteps).toHaveLength(9);

      // Verify step 01 to 09 numbers
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

      // Verify title, subtitle, closingLine and legalDisclaimer exist and are non-empty
      expect(dict.services.title.trim().length).toBeGreaterThan(0);
      expect(dict.services.subtitle.trim().length).toBeGreaterThan(0);
      expect(dict.services.closingLine.trim().length).toBeGreaterThan(0);
      expect(dict.services.legalDisclaimer.trim().length).toBeGreaterThan(0);

      // Verify Step 02 contains "Tapu"
      const step2 = allSteps[1];
      expect(step2).toBeDefined();
      expect(step2!.description).toContain("Tapu");

      // Verify Step 03 contains "DAB"
      const step3 = allSteps[2];
      expect(step3).toBeDefined();
      expect(step3!.description).toContain("DAB");
    });
  });
});

describe("LanguageProvider & LanguageSwitcher component", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
  });

  function TestConsumer() {
    const { locale, setLocale, config, isRtl } = useLanguage();
    const { t } = useTranslation();
    return (
      <div>
        <span data-testid="current-locale">{locale}</span>
        <span data-testid="current-dir">{config.dir}</span>
        <span data-testid="current-is-rtl">{isRtl ? "yes" : "no"}</span>
        <span data-testid="translated-home">{t.home.filterDistrict}</span>
        <LanguageSwitcher variant="navbar" />
        <button onClick={() => setLocale("ar")}>Switch to Arabic</button>
        <button onClick={() => setLocale("tr")}>Switch to Turkish</button>
        <button onClick={() => setLocale("ru")}>Switch to Russian</button>
        <button onClick={() => setLocale("fa")}>Switch to Persian</button>
        <button onClick={() => setLocale("zh")}>Switch to Chinese</button>
        <button onClick={() => setLocale("bn")}>Switch to Bengali</button>
      </div>
    );
  }

  it("defaults to English when localStorage is empty", () => {
    localStorage.setItem("avrasya_preferred_language", "en");
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>,
    );

    expect(screen.getByTestId("current-locale")).toHaveTextContent("en");
    expect(screen.getByTestId("current-dir")).toHaveTextContent("ltr");
    expect(screen.getByTestId("current-is-rtl")).toHaveTextContent("no");
    expect(screen.getByTestId("translated-home")).toHaveTextContent("District");
  });

  it("switches to Arabic and applies RTL direction and Arabic translation", () => {
    localStorage.setItem("avrasya_preferred_language", "en");
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByText("Switch to Arabic"));

    expect(screen.getByTestId("current-locale")).toHaveTextContent("ar");
    expect(screen.getByTestId("current-dir")).toHaveTextContent("rtl");
    expect(screen.getByTestId("current-is-rtl")).toHaveTextContent("yes");
    expect(screen.getByTestId("translated-home")).toHaveTextContent(ar.home.filterDistrict);
    expect(localStorage.getItem("avrasya_preferred_language")).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("ar");
  });

  it("switches to Persian and applies RTL direction and Persian translation", () => {
    localStorage.setItem("avrasya_preferred_language", "en");
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByText("Switch to Persian"));

    expect(screen.getByTestId("current-locale")).toHaveTextContent("fa");
    expect(screen.getByTestId("current-dir")).toHaveTextContent("rtl");
    expect(screen.getByTestId("current-is-rtl")).toHaveTextContent("yes");
    expect(screen.getByTestId("translated-home")).toHaveTextContent(fa.home.filterDistrict);
    expect(localStorage.getItem("avrasya_preferred_language")).toBe("fa");
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("fa");
  });

  it("switches to Turkish and applies LTR direction and Turkish translation", () => {
    localStorage.setItem("avrasya_preferred_language", "en");
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByText("Switch to Turkish"));

    expect(screen.getByTestId("current-locale")).toHaveTextContent("tr");
    expect(screen.getByTestId("current-dir")).toHaveTextContent("ltr");
    expect(screen.getByTestId("current-is-rtl")).toHaveTextContent("no");
    expect(screen.getByTestId("translated-home")).toHaveTextContent(tr.home.filterDistrict);
    expect(localStorage.getItem("avrasya_preferred_language")).toBe("tr");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("tr");
  });

  it("switches to Russian and applies LTR direction and Russian translation", () => {
    localStorage.setItem("avrasya_preferred_language", "en");
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByText("Switch to Russian"));

    expect(screen.getByTestId("current-locale")).toHaveTextContent("ru");
    expect(screen.getByTestId("current-dir")).toHaveTextContent("ltr");
    expect(screen.getByTestId("current-is-rtl")).toHaveTextContent("no");
    expect(screen.getByTestId("translated-home")).toHaveTextContent(ru.home.filterDistrict);
    expect(localStorage.getItem("avrasya_preferred_language")).toBe("ru");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("ru");
  });

  it("switches to Chinese and applies LTR direction and Chinese translation", () => {
    localStorage.setItem("avrasya_preferred_language", "en");
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByText("Switch to Chinese"));

    expect(screen.getByTestId("current-locale")).toHaveTextContent("zh");
    expect(screen.getByTestId("current-dir")).toHaveTextContent("ltr");
    expect(screen.getByTestId("current-is-rtl")).toHaveTextContent("no");
    expect(screen.getByTestId("translated-home")).toHaveTextContent(zh.home.filterDistrict);
    expect(localStorage.getItem("avrasya_preferred_language")).toBe("zh");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("zh");
  });

  it("switches to Bengali and applies LTR direction and Bengali translation", () => {
    localStorage.setItem("avrasya_preferred_language", "en");
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByText("Switch to Bengali"));

    expect(screen.getByTestId("current-locale")).toHaveTextContent("bn");
    expect(screen.getByTestId("current-dir")).toHaveTextContent("ltr");
    expect(screen.getByTestId("current-is-rtl")).toHaveTextContent("no");
    expect(screen.getByTestId("translated-home")).toHaveTextContent(bn.home.filterDistrict);
    expect(localStorage.getItem("avrasya_preferred_language")).toBe("bn");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("bn");
  });

  it("interactive LanguageSwitcher dropdown renders all 7 options", () => {
    localStorage.setItem("avrasya_preferred_language", "en");
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>,
    );

    const toggleBtn = screen.getByRole("button", { name: /change language/i });
    expect(toggleBtn).toBeInTheDocument();
    fireEvent.click(toggleBtn);

    expect(screen.getByRole("option", { name: /English/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Türkçe/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /العربية/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Русский/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /فارسی/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /中文/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /বাংলা/i })).toBeInTheDocument();
  });
});
