import { useEffect, useState } from "react";
import { IstanbulSkyline } from "./IstanbulSkyline";

export function Preloader() {
  const [percent, setPercent] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){setDismissed(true);return;}
    // Only show on fresh page load or first visit of session
    try {
      if (sessionStorage.getItem("avr_preloader_seen")) {
        setDismissed(true);
        return;
      }
    } catch {
      /* ignore */
    }

    const duration = 1400; // 1.4s smooth luxury timing
    const startTime = performance.now();
    let animId=0;
    const timers:ReturnType<typeof setTimeout>[]=[];

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Precision cubic-out easing curve
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.floor(eased * 100);
      setPercent(val);

      if (progress < 1) {
        animId=requestAnimationFrame(update);
      } else {
        setPercent(100);
        timers.push(setTimeout(() => setIsDone(true), 200));
        timers.push(setTimeout(() => {
          setDismissed(true);
          try {
            sessionStorage.setItem("avr_preloader_seen", "1");
          } catch {
            /* ignore */
          }
        }, 900));
      }
    };

    animId = requestAnimationFrame(update);
    return () => {cancelAnimationFrame(animId);timers.forEach(clearTimeout);};
  }, []);

  if (dismissed) return null;

  return (
    <div
      aria-hidden="true"
      className={`avrasya-preloader fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B2228] transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
        isDone ? "-translate-y-full opacity-90 pointer-events-none" : "translate-y-0 opacity-100"
      }`}
      style={{
        backgroundColor: "#0B2228",
        backgroundImage:
          "radial-gradient(ellipse at 50% 40%, #133942 0%, #0B2228 65%, #07171B 100%)",
      }}
    >
      {/* Centerpiece Stage: Crisp White Logo & Refined Gold Loading */}
      <div
        className={`relative z-10 flex w-full max-w-4xl flex-col items-center px-6 transition-all duration-600 ease-out ${
          isDone ? "scale-98 opacity-0 -translate-y-6" : "scale-100 opacity-100 translate-y-0"
        }`}
      >
        {/* Refined Luxury Vector Logo */}
        <div className="relative w-full flex justify-center py-4">
          <img
            src="/images/avrasya-logo-pure-white.svg"
            alt="Avrasya Properties Group"
            className="w-[58vw] max-w-sm md:max-w-md lg:max-w-[420px] h-auto max-h-[14vh] object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
          />
        </div>

        {/* Minimal Precision Hairline Gold Progress Bar */}
        <div className="relative mt-8 md:mt-10 h-[1.5px] w-64 md:w-80 overflow-hidden rounded-full bg-white/10 shadow-[0_0_8px_rgba(0,0,0,0.3)]">
          <div
            className="h-full bg-gradient-to-r from-[#B78C4D] via-[#E5C378] to-[#D4AF37] transition-all duration-75 ease-out shadow-[0_0_12px_rgba(212,175,55,0.7)]"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Minimal Gold Progress Numeral (Zero AI labels below) */}
        <div className="mt-5 flex items-baseline gap-1 text-[#D4AF37]">
          <span className="font-sans text-2xl md:text-3xl font-light tracking-wider tabular-nums">
            {percent}
          </span>
          <span className="text-[10px] md:text-xs font-normal tracking-widest text-[#B78C4D] uppercase">
            %
          </span>
        </div>
      </div>

      {/* Authentic Istanbul Architectural Skyline covering the bottom edge-to-edge */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 w-full overflow-hidden select-none flex flex-col items-center justify-end">
        <div className="w-full flex justify-center items-end">
          <IstanbulSkyline opacity={1} className="w-full" />
        </div>
      </div>
    </div>
  );
}
