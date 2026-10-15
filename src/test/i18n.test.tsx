import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { LOCALES, getLocaleConfig, isRtlLocale } from "@/i18n";
import { en } from "@/i18n/locales/en";
import { tr } from "@/i18n/locales/tr";
import { ar } from "@/i18n/locales/ar";
import { ru } from "@/i18n/locales/ru";
import { fa } from "@/i18n/locales/fa";
import { LanguageProvider, useLanguage, useTranslation } from "@/hooks/useLanguage";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";

describe("i18n Locales & Structural Parity", () => {
  const locales = [
    { code: "tr", data: tr },
    { code: "ar", data: ar },
    { code: "ru", data: ru },
    { code: "fa", data: fa },
  ];

  it("defines all 5 target languages correctly", () => {
    expect(LOCALES.map((l) => l.code)).toEqual(["en", "tr", "ar", "ru", "fa"]);
  });

  it("correctly identifies RTL locales", () => {
    expect(isRtlLocale("en")).toBe(false);
    expect(isRtlLocale("tr")).toBe(false);
    expect(isRtlLocale("ru")).toBe(false);
    expect(isRtlLocale("ar")).toBe(true);
    expect(isRtlLocale("fa")).toBe(true);
  });

  it("returns proper locale configs", () => {
    expect(getLocaleConfig("ar").dir).toBe("rtl");
    expect(getLocaleConfig("fa").dir).toBe("rtl");
    expect(getLocaleConfig("tr").dir).toBe("ltr");
    expect(getLocaleConfig("ru").dir).toBe("ltr");
    expect(getLocaleConfig("en").dir).toBe("ltr");
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
      </div>
    );
  }

  it("defaults to English when localStorage is empty", () => {
    localStorage.setItem("avrasya_preferred_language", "en");
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
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
      </LanguageProvider>
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
      </LanguageProvider>
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
      </LanguageProvider>
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
      </LanguageProvider>
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

  it("interactive LanguageSwitcher dropdown renders all 5 options", () => {
    localStorage.setItem("avrasya_preferred_language", "en");
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );

    const toggleBtn = screen.getByRole("button", { name: /change language/i });
    expect(toggleBtn).toBeInTheDocument();
    fireEvent.click(toggleBtn);

    expect(screen.getByRole("option", { name: /English/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Türkçe/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /العربية/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Русский/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /فارسی/i })).toBeInTheDocument();
  });
});
