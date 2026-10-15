import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { Locale, LocaleConfig } from "@/i18n";

interface LanguageSwitcherProps {
  variant?: "topbar" | "navbar" | "mobile" | "footer";
  className?: string;
}

export function LanguageSwitcher({ variant = "navbar", className = "" }: LanguageSwitcherProps) {
  const { locale, setLocale, locales, config, isRtl } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Mobile Drawer Selector
  if (variant === "mobile") {
    return (
      <div className={`space-y-2 pt-3 ${className}`}>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {locale === "tr"
            ? "Dil Seçimi"
            : locale === "ar"
              ? "اختيار اللغة"
              : locale === "ru"
                ? "Выбор языка"
                : locale === "fa"
                  ? "انتخاب زبان"
                  : "Select Language"}
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {locales.map((loc) => {
            const active = loc.code === locale;
            return (
              <button
                key={loc.code}
                type="button"
                onClick={() => setLocale(loc.code)}
                className={`flex items-center justify-between gap-2 rounded-xs border px-3 py-2 text-xs font-medium transition-all ${
                  active
                    ? "border-brass bg-brass/15 text-foreground font-semibold shadow-xs"
                    : "border-border/70 bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground hover:border-border"
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className="text-base select-none">{loc.flag}</span>
                  <span className="truncate">{loc.nativeName}</span>
                </span>
                {active && <Check className="h-3 w-3 text-brass shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Topbar Pill Switcher
  if (variant === "topbar") {
    return (
      <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label="Change language"
          className="group flex items-center gap-1.5 rounded border border-on-dark/20 bg-primary/40 px-2 py-0.5 text-[0.68rem] font-semibold text-on-dark-muted transition-all hover:border-brass/70 hover:bg-primary/80 hover:text-on-dark focus-visible:ring-1 focus-visible:ring-brass"
        >
          <span className="select-none text-xs">{config.flag}</span>
          <span className="uppercase tracking-wider font-bold text-on-dark">{config.code}</span>
          <ChevronDown
            className={`h-3 w-3 text-on-dark-muted transition-transform duration-200 group-hover:text-brass ${
              open ? "rotate-180 text-brass" : ""
            }`}
          />
        </button>

        {open && (
          <div
            role="listbox"
            className="absolute top-full z-50 mt-1 min-w-[150px] overflow-hidden rounded-xs border border-brass/30 bg-[#0C1E23]/95 p-1 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-150 ltr:right-0 rtl:left-0"
            style={{ [isRtl ? "left" : "right"]: 0 }}
          >
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-brass/80 border-b border-white/10 mb-1">
              Select Language
            </div>
            {locales.map((loc) => {
              const active = loc.code === locale;
              return (
                <button
                  key={loc.code}
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setLocale(loc.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2.5 rounded px-2.5 py-1.5 text-xs transition-colors ${
                    active
                      ? "bg-brass/20 text-white font-semibold"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm select-none">{loc.flag}</span>
                    <span className="font-medium">{loc.nativeName}</span>
                  </span>
                  {active && <Check className="h-3 w-3 text-brass" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Footer Switcher
  if (variant === "footer") {
    return (
      <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label="Change language"
          className="flex items-center gap-1.5 rounded border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-on-dark-muted hover:border-brass hover:text-on-dark transition-all"
        >
          <Globe className="h-3.5 w-3.5 text-brass" />
          <span className="select-none">{config.flag}</span>
          <span className="font-semibold">{config.nativeName}</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div
            className="absolute bottom-full z-50 mb-1 min-w-[160px] overflow-hidden rounded-xs border border-white/20 bg-[#0C1E23] p-1 shadow-2xl backdrop-blur-xl animate-in fade-in duration-150"
            style={{ [isRtl ? "right" : "left"]: 0 }}
          >
            {locales.map((loc) => {
              const active = loc.code === locale;
              return (
                <button
                  key={loc.code}
                  onClick={() => {
                    setLocale(loc.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded px-2.5 py-1.5 text-xs transition-colors ${
                    active ? "bg-brass/25 text-white font-bold" : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{loc.flag}</span>
                    <span>{loc.nativeName}</span>
                  </span>
                  {active && <Check className="h-3.5 w-3.5 text-brass" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Navbar Switcher (Standard Desktop Header)
  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Change language"
        className="group flex h-10 items-center gap-2 rounded-xs border border-border/80 bg-card/70 px-3 text-xs font-semibold text-foreground backdrop-blur-md transition-all duration-300 hover:border-brass hover:bg-card hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
      >
        <Globe className="h-3.5 w-3.5 text-brass transition-transform duration-300 group-hover:scale-110" />
        <span className="select-none text-sm">{config.flag}</span>
        <span className="uppercase tracking-wider font-bold text-foreground text-[0.72rem]">
          {config.code}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-muted-foreground transition-transform duration-200 group-hover:text-foreground ${
            open ? "rotate-180 text-brass" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-full z-50 mt-2 min-w-[170px] overflow-hidden rounded-xs border border-border/80 bg-card/95 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
          style={{ [isRtl ? "left" : "right"]: 0 }}
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 mb-1">
            Language / Dil / اللغة
          </div>
          {locales.map((loc) => {
            const active = loc.code === locale;
            return (
              <button
                key={loc.code}
                role="option"
                aria-selected={active}
                onClick={() => {
                  setLocale(loc.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2.5 rounded px-2.5 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "bg-brass/15 text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base select-none">{loc.flag}</span>
                  <span className="text-[0.8rem]">{loc.nativeName}</span>
                </span>
                {active && <Check className="h-3.5 w-3.5 text-brass" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
