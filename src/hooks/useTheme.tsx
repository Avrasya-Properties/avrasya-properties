import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "avrasya_theme_preference";

interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  isDark: boolean;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") {
      return raw;
    }
  } catch {
    /* ignore storage errors */
  }
  return "system";
}

export function applyResolvedThemeToDom(resolved: ResolvedTheme, animateTransition = false) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  if (animateTransition) {
    root.classList.add("theme-transitioning");
    window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 450);
  }

  if (resolved === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
  }

  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  // Sync stored preference & OS media query immediately on mount without SSR hydration mismatch
  useEffect(() => {
    const initialStored = readStoredTheme();
    const initialSystem = getSystemTheme();
    setThemeState(initialStored);
    setSystemTheme(initialSystem);
    const effectiveResolved = initialStored === "system" ? initialSystem : initialStored;
    applyResolvedThemeToDom(effectiveResolved, false);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyResolvedThemeToDom(resolvedTheme, false);
  }, [resolvedTheme, mounted]);

  // Listen to OS media query & cross-tab storage updates
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleMediaChange);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(handleMediaChange);
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY || e.key === null) {
        setThemeState(readStoredTheme());
      }
    };

    const handleCustomEvent = () => {
      setThemeState(readStoredTheme());
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("avrasya-theme-change", handleCustomEvent);

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", handleMediaChange);
      } else if (typeof mediaQuery.removeListener === "function") {
        mediaQuery.removeListener(handleMediaChange);
      }
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("avrasya-theme-change", handleCustomEvent);
    };
  }, []);

  const setTheme = useCallback((next: ThemePreference) => {
    const nextResolved: ResolvedTheme = next === "system" ? getSystemTheme() : next;
    applyResolvedThemeToDom(nextResolved, true);
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
      window.dispatchEvent(new Event("avrasya-theme-change"));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const currentResolved = theme === "system" ? getSystemTheme() : theme;
    const next: ThemePreference = currentResolved === "dark" ? "light" : "dark";
    setTheme(next);
  }, [theme, setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      isDark: resolvedTheme === "dark",
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;

  // Fallback for components rendered outside ThemeProvider in isolated unit tests
  const fallbackStored = readStoredTheme();
  const fallbackResolved: ResolvedTheme =
    fallbackStored === "system" ? getSystemTheme() : fallbackStored;

  return {
    theme: fallbackStored,
    resolvedTheme: fallbackResolved,
    isDark: fallbackResolved === "dark",
    setTheme: (next: ThemePreference) => {
      const nextResolved = next === "system" ? getSystemTheme() : next;
      applyResolvedThemeToDom(nextResolved, true);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
        window.dispatchEvent(new Event("avrasya-theme-change"));
      } catch {
        /* ignore */
      }
    },
    toggleTheme: () => {
      const current = readStoredTheme();
      const currentRes = current === "system" ? getSystemTheme() : current;
      const next: ThemePreference = currentRes === "dark" ? "light" : "dark";
      applyResolvedThemeToDom(next, true);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
        window.dispatchEvent(new Event("avrasya-theme-change"));
      } catch {
        /* ignore */
      }
    },
  };
}
