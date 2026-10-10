import { useState, useEffect } from "react";
import type { SupportedCurrency } from "@/data/properties";

const CURRENCY_KEY = "avrasya_preferred_currency";
const SHORTLIST_KEY = "avrasya_saved_shortlist";

export function useCurrency(): [SupportedCurrency, (c: SupportedCurrency) => void] {
  const [currency, setCurrencyState] = useState<SupportedCurrency>("USD");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_KEY) as SupportedCurrency;
      if (saved && ["USD", "EUR", "TRY", "GBP"].includes(saved)) {
        setCurrencyState(saved);
      }
    } catch {
      /* ignore */
    }

    const onStorage = () => {
      const current = localStorage.getItem(CURRENCY_KEY) as SupportedCurrency;
      if (current) setCurrencyState(current);
    };
    window.addEventListener("currency-change", onStorage);
    return () => window.removeEventListener("currency-change", onStorage);
  }, []);

  const setCurrency = (c: SupportedCurrency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(CURRENCY_KEY, c);
      window.dispatchEvent(new Event("currency-change"));
    } catch {
      /* ignore */
    }
  };

  return [currency, setCurrency];
}

export function useShortlist(): {
  shortlist: string[];
  isSaved: (slug: string) => boolean;
  toggle: (slug: string) => void;
  count: number;
} {
  const [shortlist, setShortlist] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SHORTLIST_KEY) || "[]");
      if (Array.isArray(saved)) setShortlist(saved);
    } catch {
      /* ignore */
    }

    const onStorage = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(SHORTLIST_KEY) || "[]");
        if (Array.isArray(saved)) setShortlist(saved);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("shortlist-change", onStorage);
    return () => window.removeEventListener("shortlist-change", onStorage);
  }, []);

  const toggle = (slug: string) => {
    setShortlist((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      try {
        localStorage.setItem(SHORTLIST_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event("shortlist-change"));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const isSaved = (slug: string) => shortlist.includes(slug);

  return {
    shortlist,
    isSaved,
    toggle,
    count: shortlist.length,
  };
}
