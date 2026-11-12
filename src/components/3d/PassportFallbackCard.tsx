import React, { useState } from "react";
import { Sparkles, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PassportFallbackCardProps {
  className?: string;
  interactive?: boolean;
}

/**
 * High-Fidelity CSS 3D Fallback Card for Turkish Passport (Milestone 3).
 * Renders when WebGL is unavailable, on mobile/small screens, or when prefers-reduced-motion is active.
 * Employs CSS 3D perspective, burgundy leather texture, hot-stamped gold foil typography,
 * crescent & star insignia, and biometric e-passport chip iconography.
 */
export function PassportFallbackCard({ className, interactive = true }: PassportFallbackCardProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({
      x: -y * 14,
      y: x * 16,
    });
  };

  const handlePointerLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      className={cn("relative mx-auto flex items-center justify-center p-4", className)}
      style={{ perspective: "1000px" }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* 3D Transform Container */}
      <div
        className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[1/1.42] rounded-md transition-transform duration-200 ease-out shadow-2xl select-none"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
        role="img"
        aria-label="Turkish Republic Passport representation with gold foil insignia"
      >
        {/* Drop shadow plane */}
        <div
          className="absolute inset-0 rounded-md bg-black/40 blur-xl transform -translate-z-6 scale-95"
          style={{ transform: "translateZ(-20px)" }}
        />

        {/* Paper block spine edge effect (ivory pages) */}
        <div
          className="absolute top-1 bottom-1 end-0 w-3 rounded-e-xs bg-[#FDFBF7] shadow-inner border-y border-stone-300 dark:border-stone-700"
          style={{
            transform: "translateZ(-4px) translateX(2px)",
            backgroundImage:
              "repeating-linear-gradient(to bottom, #FDFBF7 0px, #FDFBF7 2px, #E5E1D8 3px)",
          }}
        />

        {/* Burgundy Leather Cover */}
        <div
          className="relative h-full w-full rounded-md border border-[#85182e]/50 overflow-hidden flex flex-col items-center justify-between p-6 sm:p-7 text-center shadow-lg"
          style={{
            backgroundColor: "#5E0016",
            backgroundImage:
              "radial-gradient(circle at 50% 30%, rgba(133, 24, 46, 0.85) 0%, rgba(74, 0, 17, 0.98) 75%, rgba(40, 0, 9, 1) 100%)",
            boxShadow:
              "inset 0 1px 2px rgba(255, 215, 0, 0.2), inset 0 -2px 6px rgba(0, 0, 0, 0.6), 0 16px 36px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Subtle micro-grain overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-15 mix-blend-overlay"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 0)",
              backgroundSize: "3px 3px",
            }}
          />

          {/* Spine crease highlight on left side */}
          <div className="pointer-events-none absolute top-0 bottom-0 start-2.5 w-[1.5px] bg-gradient-to-b from-black/40 via-white/15 to-black/50" />

          {/* Top Arc / Header: TÜRKİYE CUMHURİYETİ */}
          <div className="relative z-10 w-full pt-1">
            <span
              className="block font-serif font-bold tracking-[0.22em] text-xs sm:text-sm uppercase text-[#F5D061]"
              style={{
                textShadow: "0 1px 2px rgba(0,0,0,0.8), 0 0 12px rgba(245, 208, 97, 0.4)",
              }}
            >
              TÜRKİYE CUMHURİYETİ
            </span>
            <span
              className="block font-serif tracking-[0.28em] text-[10px] sm:text-[11px] font-medium text-[#ECC755] mt-1 uppercase"
              style={{
                textShadow: "0 1px 2px rgba(0,0,0,0.8)",
              }}
            >
              PASAPORT · PASSPORT
            </span>
          </div>

          {/* Center Insignia: Turkish Crescent and Star (Hilal ve Yıldız) */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center">
            <div
              className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 text-[#F5D061]"
              style={{
                filter:
                  "drop-shadow(0 2px 4px rgba(0,0,0,0.7)) drop-shadow(0 0 14px rgba(245, 208, 97, 0.35))",
              }}
            >
              {/* Crescent & Star SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full fill-current" aria-hidden="true">
                {/* Crescent Moon */}
                <path d="M50 8 C 26.8 8 8 26.8 8 50 C 8 73.2 26.8 92 50 92 C 58.6 92 66.7 89.4 73.4 85 C 57.8 85 45.2 70.8 45.2 50 C 45.2 29.2 57.8 15 73.4 15 C 66.7 10.6 58.6 8 50 8 Z" />
                {/* 5-Pointed Star tilted towards crescent */}
                <polygon points="68,36 71.8,43.8 80.4,45 74.2,51 75.7,59.6 68,55.5 60.3,59.6 61.8,51 55.6,45 64.2,43.8" />
              </svg>
            </div>
            <span
              className="mt-2 text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-[#F5D061]/80"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}
            >
              Law No. 5901 Naturalization
            </span>
          </div>

          {/* Bottom Foil: Biometric e-Passport Chip Symbol */}
          <div className="relative z-10 w-full pb-1 flex flex-col items-center gap-2">
            <div
              className="w-9 h-6 sm:w-10 sm:h-7 rounded-[3px] border-[1.5px] border-[#F5D061] flex items-center justify-center relative overflow-hidden"
              style={{
                boxShadow: "inset 0 0 4px rgba(245, 208, 97, 0.25), 0 1px 3px rgba(0,0,0,0.8)",
              }}
            >
              {/* Central horizontal line */}
              <div className="absolute top-1/2 -translate-y-1/2 start-0 end-0 h-[1.5px] bg-[#F5D061]" />
              {/* Central circle cutout */}
              <div className="relative z-10 w-3 h-3 rounded-full border-[1.5px] border-[#F5D061] bg-[#5E0016]" />
            </div>

            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono tracking-wider text-[#ECC755]/90 uppercase">
              <ShieldCheck className="h-3 w-3 text-[#F5D061]" />
              <span>Biometric Sovereign Naturalization</span>
            </div>
          </div>

          {/* Specular Glint Sheen across cover */}
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(245,208,97,0.1) 40%, transparent 60%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default PassportFallbackCard;
