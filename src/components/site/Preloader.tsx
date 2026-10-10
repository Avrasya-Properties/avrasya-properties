import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export function Preloader() {
  const [percent, setPercent] = useState(0);
  const [complete, setComplete] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if previously viewed in current tab session
    try {
      if (sessionStorage.getItem("avrasya_intro_seen")) {
        setDismissed(true);
        return;
      }
    } catch {
      /* ignore */
    }

    // Smooth counter animation
    const startTime = performance.now();
    const duration = 1100; // 1.1s luxury duration

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Easing: cubic out
      const eased = 1 - Math.pow(1 - progress, 3);
      setPercent(Math.floor(eased * 100));

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setPercent(100);
        setComplete(true);
        try {
          sessionStorage.setItem("avrasya_intro_seen", "1");
        } catch {
          /* ignore */
        }
        setTimeout(() => setDismissed(true), 650);
      }
    };

    const id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, []);

  const handleSkip = () => {
    setComplete(true);
    setDismissed(true);
    try {
      sessionStorage.setItem("avrasya_intro_seen", "1");
    } catch {
      /* ignore */
    }
  };

  if (dismissed) return null;

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-[#07080a] text-white transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] ${
        complete ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      }`}
      aria-label="Avrasya Properties Loading"
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute h-[32rem] w-[32rem] rounded-full bg-brass/10 blur-[120px] transition-opacity duration-1000" />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Geometric Emblem */}
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-[0_0_50px_rgba(183,140,77,0.15)]">
          <img
            src="/images/avrasya-logo-white.svg"
            alt="Avrasya Properties"
            className="h-10 w-auto object-contain transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brass/20 text-brass">
            <span className="h-1.5 w-1.5 rounded-full bg-brass animate-ping" />
          </div>
        </div>

        {/* Brand Name */}
        <div className="overflow-hidden">
          <h1 className="font-sans text-xl md:text-2xl font-bold tracking-[0.3em] uppercase text-white/95 drop-shadow-sm">
            AVRASYA PROPERTIES
          </h1>
        </div>

        {/* Refined Subtitle */}
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-brass/90">
          Istanbul · Private Client Real Estate
        </p>

        {/* Progress Hairline Beam */}
        <div className="relative mt-8 h-[2px] w-56 md:w-72 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-brass/60 via-brass to-[#d4af37] transition-all duration-75 ease-out shadow-[0_0_12px_rgba(183,140,77,0.8)]"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Percentage Counter */}
        <div className="mt-4 flex items-center gap-2">
          <span className="font-mono text-xs tabular-nums text-white/40 tracking-wider">
            INITIALIZING SECURE DESK
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums text-brass">
            {String(percent).padStart(2, "0")}%
          </span>
        </div>
      </div>

      {/* Top right skip prompt */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleSkip();
        }}
        className="absolute top-6 right-6 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-mono tracking-widest text-white/50 transition-colors hover:border-brass hover:text-white"
      >
        SKIP INTRO
      </button>

      {/* Bottom status badge */}
      <div className="absolute bottom-6 flex items-center gap-2 text-[10px] font-mono tracking-wider text-white/30 uppercase">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span>Bosphorus & European Corridors · Live Connection</span>
      </div>
    </div>
  );
}
