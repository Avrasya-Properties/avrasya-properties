import { useState, useEffect } from "react";
import type { SupportedCurrency } from "@/data/properties";
import { EXCHANGE_RATES } from "@/data/properties";

const CURRENCY_KEY = "avrasya_preferred_currency";
const SHORTLIST_KEY = "avrasya_saved_shortlist";
const RATES_CACHE_KEY = "avrasya_frankfurter_rates_v1";

export type LiveRates = {
  USD: number;
  EUR: number;
  TRY: number;
  GBP: number;
};

// Default fallback rates in case of offline/network issues
const FALLBACK_RATES: LiveRates = {
  USD: 1,
  EUR: 0.892,
  TRY: 49.17,
  GBP: 0.756,
};

let currentLiveRates: LiveRates = { ...FALLBACK_RATES };
let isLiveFromFrankfurter = false;
let lastSyncedDate = "";

// Global fetcher for Frankfurter Real-Time European Central Bank Rates
async function syncFrankfurterRates() {
  if (typeof window === "undefined") return;
  try {
    // Check cached rates first
    const cached = localStorage.getItem(RATES_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.rates && Date.now() - parsed.timestamp < 3600000) {
        // 1 hour cache
        currentLiveRates = { ...FALLBACK_RATES, ...parsed.rates };
        isLiveFromFrankfurter = true;
        lastSyncedDate = parsed.date || "";
        updatePropertiesExchangeRates(currentLiveRates);
        window.dispatchEvent(new Event("rates-updated"));
      }
    }

    // Fetch live from Frankfurter ECB API
    const res = await fetch("https://api.frankfurter.dev/v1/latest?base=USD").catch(() =>
      fetch("https://api.frankfurter.app/latest?from=USD"),
    );
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.rates) {
      currentLiveRates = {
        USD: 1,
        EUR: data.rates.EUR || FALLBACK_RATES.EUR,
        TRY: data.rates.TRY || FALLBACK_RATES.TRY,
        GBP: data.rates.GBP || FALLBACK_RATES.GBP,
      };
      isLiveFromFrankfurter = true;
      lastSyncedDate = data.date || new Date().toISOString().split("T")[0];

      // Update global module rates
      updatePropertiesExchangeRates(currentLiveRates);

      // Save to localStorage
      localStorage.setItem(
        RATES_CACHE_KEY,
        JSON.stringify({
          rates: currentLiveRates,
          date: lastSyncedDate,
          timestamp: Date.now(),
        }),
      );

      window.dispatchEvent(new Event("rates-updated"));
    }
  } catch {
    // Keep fallback rates if offline
  }
}

function updatePropertiesExchangeRates(rates: LiveRates) {
  if (EXCHANGE_RATES.EUR) EXCHANGE_RATES.EUR.rate = rates.EUR;
  if (EXCHANGE_RATES.TRY) EXCHANGE_RATES.TRY.rate = rates.TRY;
  if (EXCHANGE_RATES.GBP) EXCHANGE_RATES.GBP.rate = rates.GBP;
}

// Kick off fetch on client load
if (typeof window !== "undefined") {
  syncFrankfurterRates();
}

export function useLiveRates() {
  const [rates, setRates] = useState<LiveRates>(currentLiveRates);
  const [isLive, setIsLive] = useState(isLiveFromFrankfurter);
  const [date, setDate] = useState(lastSyncedDate);

  useEffect(() => {
    const handler = () => {
      setRates({ ...currentLiveRates });
      setIsLive(isLiveFromFrankfurter);
      setDate(lastSyncedDate);
    };
    window.addEventListener("rates-updated", handler);
    syncFrankfurterRates();
    return () => window.removeEventListener("rates-updated", handler);
  }, []);

  const convert = (usdAmount: number | null, targetCurrency: SupportedCurrency): string => {
    if (usdAmount == null) return "Price on request";
    const symbols: Record<SupportedCurrency, string> = { USD: "$", EUR: "€", TRY: "₺", GBP: "£" };
    const rate = rates[targetCurrency] || 1;
    const converted = Math.round(usdAmount * rate);
    return `${symbols[targetCurrency]}${converted.toLocaleString("en-US")}`;
  };

  return { rates, isLive, date, convert };
}

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
