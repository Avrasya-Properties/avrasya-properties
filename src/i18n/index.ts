import type { AppTranslations, Locale, LocaleConfig } from "./types";
import { en } from "./locales/en";
import { tr } from "./locales/tr";
import { ar } from "./locales/ar";
import { ru } from "./locales/ru";
import { fa } from "./locales/fa";

export * from "./types";

export const LOCALES: LocaleConfig[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", dir: "ltr" },
  { code: "fa", name: "Persian", nativeName: "فارسی", flag: "🇮🇷", dir: "rtl" },
];

export const TRANSLATIONS: Record<Locale, AppTranslations> = {
  en,
  tr,
  ar,
  ru,
  fa,
};

export const DEFAULT_LOCALE: Locale = "en";

export function getLocaleConfig(code: string): LocaleConfig {
  const found = LOCALES.find((l) => l.code === code);
  return found || LOCALES[0]!;
}

export function isRtlLocale(locale: Locale): boolean {
  return locale === "ar" || locale === "fa";
}

/**
 * Access a nested translation string or structure via dot notation: e.g. "nav.properties"
 */
export function getTranslation(locale: Locale, key: string, fallback?: string): any {
  const dict = TRANSLATIONS[locale] || TRANSLATIONS.en;
  const parts = key.split(".");
  let current: any = dict;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      // Fallback to English
      let fallbackCurrent: any = TRANSLATIONS.en;
      for (const fbPart of parts) {
        if (fallbackCurrent && typeof fallbackCurrent === "object" && fbPart in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[fbPart];
        } else {
          return fallback ?? key;
        }
      }
      return fallbackCurrent ?? fallback ?? key;
    }
  }
  return current;
}
