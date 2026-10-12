import { useQuery } from "@tanstack/react-query";
import { useSiteSettings } from "@/admin/store";
import { useState, useEffect,useSyncExternalStore } from "react";
import type { SupportedCurrency } from "@/data/properties";
export type { SupportedCurrency } from "@/data/properties";
import { EXCHANGE_RATES } from "@/data/properties";

const CURRENCY_KEY = "avrasya_preferred_currency";
const SHORTLIST_KEY = "avrasya_saved_shortlist";
const RATES_CACHE_KEY = "avrasya_frankfurter_rates_v1";

export type LiveRates = { USD: number; EUR: number; TRY: number; GBP: number };
export function useLiveRates() {
  const settings = useSiteSettings();
  const manual: LiveRates = {
    USD: 1,
    EUR: settings.exchangeRateEur,
    TRY: settings.exchangeRateTry,
    GBP: settings.exchangeRateGbp,
  };
  const query = useQuery({
    queryKey: ["indicative-fx"],
    enabled: settings.enableFrankfurterSync,
    staleTime: 3600000,
    refetchInterval: 3600000,
    queryFn: async () => {
      const res = await fetch("https://api.frankfurter.dev/v1/latest?base=USD");
      if (!res.ok) throw new Error("Rate provider unavailable");
      const data = await res.json();
      if (
        !["EUR", "TRY", "GBP"].every(
          (key) =>
            typeof data.rates?.[key] === "number" &&
            Number.isFinite(data.rates[key]) &&
            data.rates[key] > 0,
        )
      )
        throw new Error("Invalid provider rates");
      return {
        rates: { USD: 1, EUR: data.rates.EUR, TRY: data.rates.TRY, GBP: data.rates.GBP } as LiveRates,
        date: String(data.date || ""),
      };
    },
  });
  const live = settings.enableFrankfurterSync && !!query.data;
  const rates = live ? query.data!.rates : manual;
  useEffect(() => {
    if (
      EXCHANGE_RATES.EUR.rate === rates.EUR &&
      EXCHANGE_RATES.TRY.rate === rates.TRY &&
      EXCHANGE_RATES.GBP.rate === rates.GBP
    )
      return;
    EXCHANGE_RATES.EUR.rate = rates.EUR;
    EXCHANGE_RATES.TRY.rate = rates.TRY;
    EXCHANGE_RATES.GBP.rate = rates.GBP;
    window.dispatchEvent(new Event("rates-updated"));
  }, [rates.EUR, rates.TRY, rates.GBP]);
  const convert = (amount: number | null, currency: SupportedCurrency) =>
    amount === null
      ? "Price on request"
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        }).format(Math.round(amount * rates[currency]));
  return { rates, isLive: live, date: live ? query.data!.date : "", convert };
}
export function useCurrency(): [SupportedCurrency, (c: SupportedCurrency) => void] {
  useLiveRates();
  const [currency, setCurrencyState] = useState<SupportedCurrency>("USD");
  const [,refreshRates]=useState(0);
  useEffect(()=>{const update=()=>refreshRates(v=>v+1);window.addEventListener("rates-updated",update);return()=>window.removeEventListener("rates-updated",update);},[]);

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
      try{const current = localStorage.getItem(CURRENCY_KEY) as SupportedCurrency;
      if (["USD","EUR","TRY","GBP"].includes(current)) setCurrencyState(current);}catch{}
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

const EMPTY_SHORTLIST:string[]=[];
let shortlistRaw:string|null=null;
let shortlistSnapshot:string[]=EMPTY_SHORTLIST;
function readShortlist(){
 if(typeof window==="undefined")return EMPTY_SHORTLIST;
 try{
  const raw=localStorage.getItem(SHORTLIST_KEY);
  if(raw!==shortlistRaw){shortlistRaw=raw;const value=JSON.parse(raw||"[]");shortlistSnapshot=Array.isArray(value)?[...new Set(value.filter((item):item is string=>typeof item==="string"))]:EMPTY_SHORTLIST;}
 }catch{}
 return shortlistSnapshot;
}
function subscribeShortlist(listener:()=>void){
 const storage=(event:StorageEvent)=>{if(event.key===SHORTLIST_KEY||event.key===null)listener();};
 window.addEventListener("shortlist-change",listener);window.addEventListener("storage",storage);
 return()=>{window.removeEventListener("shortlist-change",listener);window.removeEventListener("storage",storage);};
}
export function useShortlist(): {
  shortlist: string[];
  isSaved: (slug: string) => boolean;
  toggle: (slug: string) => void;
  count: number;
} {
  const shortlist=useSyncExternalStore(subscribeShortlist,readShortlist,()=>EMPTY_SHORTLIST);
  const toggle = (slug: string) => {
    const current=readShortlist(),next=current.includes(slug)?current.filter(item=>item!==slug):[...current,slug];
    shortlistSnapshot=next;
    try{shortlistRaw=JSON.stringify(next);localStorage.setItem(SHORTLIST_KEY,shortlistRaw);}catch{shortlistRaw=null;}
    window.dispatchEvent(new Event("shortlist-change"));
  };

  const isSaved = (slug: string) => shortlist.includes(slug);

  return {
    shortlist,
    isSaved,
    toggle,
    count: shortlist.length,
  };
}
