import { useEffect, useState } from "react";

export function Preloader() {
  const [percent, setPercent] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only show on fresh page load or first visit of session
    try {
      if (sessionStorage.getItem("avr_preloader_seen")) {
        setDismissed(true);
        return;
      }
    } catch {
      /* ignore */
    }

    const duration = 1350; // 1.35s luxury duration
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Refined cubic-out easing curve
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.floor(eased * 100);
      setPercent(val);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setPercent(100);
        setTimeout(() => setIsDone(true), 180); // Brief hold at 100%
        setTimeout(() => {
          setDismissed(true);
          try {
            sessionStorage.setItem("avr_preloader_seen", "1");
          } catch {
            /* ignore */
          }
        }, 950);
      }
    };

    const animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  if (dismissed) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#07080a] transition-transform duration-800 ease-[cubic-bezier(0.77,0,0.175,1)] ${
        isDone ? "-translate-y-full pointer-events-none" : "translate-y-0"
      }`}
    >
      {/* Subtle ambient architectural vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(183,140,77,0.06)_0%,transparent_70%)]" />

      {/* Center Stage: Grand Screen-Covering Logo & Clean Minimal Numerals */}
      <div
        className={`relative z-10 flex w-full max-w-5xl flex-col items-center px-6 transition-all duration-700 ease-out ${
          isDone ? "scale-105 opacity-0 -translate-y-8" : "scale-100 opacity-100 translate-y-0"
        }`}
      >
        {/* Grand High-Impact Logo across the screen */}
        <div className="relative w-full flex justify-center py-4">
          <img
            src="/images/avrasya-logo-white.svg"
            alt="Avrasya Properties"
            className="w-[85vw] max-w-2xl md:max-w-3xl lg:max-w-4xl h-auto max-h-[35vh] object-contain drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] filter brightness-105"
          />
        </div>

        {/* Minimal Precision Hairline Progress Rule */}
        <div className="relative mt-8 md:mt-12 h-[1px] w-56 md:w-80 overflow-hidden bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-brass/50 via-brass to-[#e2c17c] transition-all duration-75 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Pure Minimal Counter Numerals */}
        <div className="mt-4 flex items-baseline gap-1">
          <span className="font-mono text-3xl md:text-4xl font-light tracking-tight text-white/90 tabular-nums">
            {percent}
          </span>
          <span className="font-mono text-xs text-brass font-normal tracking-widest">%</span>
        </div>
      </div>

      {/* Razor-thin bottom golden guide line on curtain exit */}
      <div className="absolute bottom-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-brass to-transparent opacity-60" />
    </div>
  );
}
