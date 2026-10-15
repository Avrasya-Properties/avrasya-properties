import { useState, useEffect, useCallback, createContext, useContext, useMemo, type ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  TRANSLATIONS,
  getLocaleConfig,
  isRtlLocale,
  type AppTranslations,
  type Locale,
  type LocaleConfig,
} from "@/i18n";

export const LANGUAGE_KEY = "avrasya_preferred_language";

interface LanguageContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  isRtl: boolean;
  config: LocaleConfig;
  locales: LocaleConfig[];
  t: AppTranslations;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY) as Locale;
    if (saved && ["en", "tr", "ar", "ru", "fa"].includes(saved)) {
      return saved;
    }
    // Optional: detect browser language
    const navLang = navigator.language.toLowerCase();
    if (navLang.startsWith("tr")) return "tr";
    if (navLang.startsWith("ar")) return "ar";
    if (navLang.startsWith("ru")) return "ru";
    if (navLang.startsWith("fa")) return "fa";
  } catch {
    /* ignore storage errors */
  }
  return DEFAULT_LOCALE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const applyHtmlAttributes = useCallback((l: Locale) => {
    if (typeof document !== "undefined") {
      const isRtl = isRtlLocale(l);
      document.documentElement.lang = l;
      document.documentElement.dir = isRtl ? "rtl" : "ltr";
      if (isRtl) {
        document.documentElement.classList.add("rtl");
      } else {
        document.documentElement.classList.remove("rtl");
      }
    }
  }, []);

  useEffect(() => {
    applyHtmlAttributes(locale);
  }, [locale, applyHtmlAttributes]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LANGUAGE_KEY && e.newValue) {
        const next = e.newValue as Locale;
        if (["en", "tr", "ar", "ru", "fa"].includes(next)) {
          setLocaleState(next);
        }
      }
    };

    const onCustomChange = () => {
      try {
        const current = localStorage.getItem(LANGUAGE_KEY) as Locale;
        if (["en", "tr", "ar", "ru", "fa"].includes(current)) {
          setLocaleState(current);
        }
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("language-change", onCustomChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("language-change", onCustomChange);
    };
  }, []);

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      setLocaleState(nextLocale);
      applyHtmlAttributes(nextLocale);
      try {
        localStorage.setItem(LANGUAGE_KEY, nextLocale);
        window.dispatchEvent(new Event("language-change"));
      } catch {
        /* ignore */
      }
    },
    [applyHtmlAttributes],
  );

  const isRtl = useMemo(() => isRtlLocale(locale), [locale]);
  const config = useMemo(() => getLocaleConfig(locale), [locale]);
  const t = useMemo(() => TRANSLATIONS[locale] || TRANSLATIONS.en, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      isRtl,
      config,
      locales: LOCALES,
      t,
    }),
    [locale, setLocale, isRtl, config, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Graceful fallback outside provider
    const loc = DEFAULT_LOCALE;
    return {
      locale: loc,
      setLocale: () => {},
      isRtl: false,
      config: getLocaleConfig(loc),
      locales: LOCALES,
      t: TRANSLATIONS.en,
    };
  }
  return ctx;
}

export function useTranslation(): { t: AppTranslations; locale: Locale; isRtl: boolean } {
  const { t, locale, isRtl } = useLanguage();
  return { t, locale, isRtl };
}
