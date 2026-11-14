import React, { useState } from "react";
import { Building2, Key, CheckCircle2, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BuildingFallbackCardProps {
  className?: string;
  interactive?: boolean;
}

/**
 * High-Fidelity CSS 3D Fallback Card for Modernist Architectural Building (Milestone 3).
 * Renders when WebGL is unavailable, on mobile/small screens, or when prefers-reduced-motion is active.
 * Employs CSS 3D perspective layers: travertine cantilevered slabs, glass curtain walls,
 * vertical bronze louvers, warm interior illumination, and title deed status indicators.
 */
export function BuildingFallbackCard({ className, interactive = true }: BuildingFallbackCardProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({
      x: -y * 12,
      y: x * 15,
    });
  };

  const handlePointerLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      className={cn("relative mx-auto flex items-center justify-center p-4", className)}
      style={{ perspective: "1000px", touchAction: "pan-y" }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* 3D Transform Container */}
      <div
        className="relative w-full max-w-[320px] sm:max-w-[380px] aspect-[16/11] rounded-md transition-transform duration-200 ease-out shadow-2xl select-none"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
        role="img"
        aria-label="Modernist Architectural Residence with cantilevered slabs and glass curtain walls"
      >
        {/* Foundation Drop Shadow Plane */}
        <div
          className="absolute inset-0 rounded-md bg-black/50 blur-xl transform -translate-z-6 scale-95"
          style={{ transform: "translateZ(-25px)" }}
        />

        {/* Podium Base: Survey Grid & Travertine Landscaping */}
        <div
          className="relative h-full w-full rounded-md border border-[#C5A059]/30 bg-[#0c1619] overflow-hidden flex flex-col justify-between p-5 text-stone-100 shadow-xl"
          style={{
            backgroundImage: "linear-gradient(135deg, #102127 0%, #0a1418 60%, #070e11 100%)",
          }}
        >
          {/* Architectural Blueprint Survey Grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "linear-gradient(to right, #C5A059 1px, transparent 1px), linear-gradient(to bottom, #C5A059 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Top Header: Architectural Specifications */}
          <div className="relative z-10 flex items-center justify-between border-b border-[#C5A059]/20 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-[#C5A059]/15 text-[#C5A059]">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-[#C5A059]">
                  Architectural Elevation
                </span>
                <span className="block font-display text-xs sm:text-sm font-semibold text-stone-100">
                  Villa & Penthouse Model
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>Tapu Ready</span>
            </div>
          </div>

          {/* Center Volumetric Building Visual (Layered Modernist Elevation) */}
          <div
            className="relative z-10 my-auto py-2 flex flex-col items-center justify-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Upper Penthouse Cantilever Slab (Travertine Fascia) */}
            <div
              className="w-48 sm:w-56 h-3 rounded-[2px] bg-[#E8E4DC] border-b border-[#C5A059] shadow-md flex items-center justify-end px-2"
              style={{
                transform: "translateZ(18px)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
              }}
            >
              <div className="h-1 w-6 rounded-full bg-[#BFA15F]/60" />
            </div>

            {/* Recessed Glazing & Warm Emissive Living Area */}
            <div
              className="w-44 sm:w-52 h-14 bg-gradient-to-r from-[#D1ECF1]/20 via-[#FFE4B5]/30 to-[#D1ECF1]/20 border-x border-[#BFA15F]/40 flex items-center justify-between px-3 relative overflow-hidden backdrop-blur-[1px]"
              style={{ transform: "translateZ(8px)" }}
            >
              {/* Vertical Bronze Louvers (Brise-Soleil) */}
              <div className="flex gap-2.5 h-full py-1">
                <div className="w-[2px] h-full bg-[#BFA15F]/80" />
                <div className="w-[2px] h-full bg-[#BFA15F]/80" />
                <div className="w-[2px] h-full bg-[#BFA15F]/80" />
              </div>

              {/* Interior Warm Illumination Sheen */}
              <div className="w-16 h-8 rounded-full bg-[#FFE4B5]/20 blur-md" />

              {/* Right Louvers */}
              <div className="flex gap-2.5 h-full py-1">
                <div className="w-[2px] h-full bg-[#BFA15F]/80" />
                <div className="w-[2px] h-full bg-[#BFA15F]/80" />
              </div>
            </div>

            {/* Mid-Level Cantilever Slab (Travertine Stone) */}
            <div
              className="w-56 sm:w-64 h-3.5 rounded-[2px] bg-[#E8E4DC] border-b border-[#BFA15F] shadow-lg flex items-center justify-between px-3"
              style={{
                transform: "translateZ(26px)",
                boxShadow: "0 6px 14px rgba(0,0,0,0.5)",
              }}
            >
              <div className="h-1 w-8 rounded-full bg-[#BFA15F]/50" />
              <div className="h-1 w-12 rounded-full bg-[#BFA15F]/50" />
            </div>

            {/* Ground Floor Garden Level with Reflecting Pool Horizon */}
            <div
              className="w-52 sm:w-60 h-10 bg-gradient-to-b from-[#132d36]/80 to-[#0c1f25] border-x border-[#BFA15F]/30 flex items-center justify-around px-4"
              style={{ transform: "translateZ(12px)" }}
            >
              <div className="w-8 h-full border-r border-[#BFA15F]/30 flex items-center justify-center">
                <Key className="h-3.5 w-3.5 text-[#C5A059]" />
              </div>
              <div className="flex-1 px-3 text-center">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#C5A059]/90">
                  Floor-to-Ceiling Glazing · 3.4m Ceiling Height
                </span>
              </div>
            </div>

            {/* Ground Podium & Reflecting Water Pool */}
            <div
              className="w-64 sm:w-72 h-3 rounded-b-sm bg-gradient-to-r from-[#0d3446] via-[#16506a] to-[#0d3446] border-t border-[#C5A059]/40 shadow-xl"
              style={{ transform: "translateZ(4px)" }}
            />
          </div>

          {/* Bottom Card Footer: Material Specs */}
          <div className="relative z-10 flex items-center justify-between border-t border-stone-800 pt-2 text-[10px] font-mono text-stone-400">
            <span className="flex items-center gap-1 text-[#C5A059]">
              <Compass className="h-3 w-3" />
              <span>Travertine & Bronze Louvers</span>
            </span>
            <span className="uppercase tracking-wider text-stone-400">
              Interactive 3D WebGL Ready
            </span>
          </div>

          {/* Specular Diagonal Sheen */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              background:
                "linear-gradient(125deg, rgba(255,255,255,0.3) 0%, rgba(197,160,89,0.1) 40%, transparent 60%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default BuildingFallbackCard;
