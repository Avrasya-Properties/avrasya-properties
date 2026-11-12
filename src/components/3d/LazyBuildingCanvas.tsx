import React, { lazy, Suspense, useEffect, useState } from "react";
import { BuildingFallbackCard } from "./BuildingFallbackCard";

const ArchitecturalBuildingCanvas = lazy(() => import("./ArchitecturalBuildingCanvas"));

export interface LazyBuildingCanvasProps {
  className?: string;
  interactive?: boolean;
  elevationScroll?: boolean;
  priority?: boolean;
}

/**
 * Progressive enhancement lazy loader for Modernist Architectural Building 3D Canvas (Milestone 3).
 * Activates WebGL Three.js on modern desktop displays with mouse/pointer and WebGL capability.
 * Instantly provides high-fidelity CSS 3D BuildingFallbackCard for mobile screens, reduced motion,
 * low-bandwidth environments, or unsupported WebGL contexts.
 */
export function LazyBuildingCanvas({
  className = "",
  interactive = true,
  elevationScroll = true,
  priority = false,
}: LazyBuildingCanvasProps) {
  const [useWebGL, setUseWebGL] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    // Guard against JSDOM test runner crashes
    if (typeof navigator !== "undefined" && navigator.userAgent.includes("jsdom")) {
      return;
    }

    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const allowsMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDataSaver =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ===
      true;

    if (!isDesktop || !isFinePointer || !allowsMotion || isDataSaver) {
      return;
    }

    // Check actual WebGL availability
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl2") || testCanvas.getContext("webgl");
      if (!gl) return;
    } catch {
      return;
    }

    // WebGL capability verified: load Three.js canvas
    let timeoutId: number | undefined;
    if (priority) {
      setUseWebGL(true);
    } else {
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number })
        .requestIdleCallback;
      timeoutId = idle
        ? idle(() => setUseWebGL(true))
        : window.setTimeout(() => setUseWebGL(true), 300);
    }

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [priority]);

  if (!useWebGL) {
    return <BuildingFallbackCard className={className} interactive={interactive} />;
  }

  return (
    <Suspense fallback={<BuildingFallbackCard className={className} interactive={interactive} />}>
      <ArchitecturalBuildingCanvas
        className={className}
        interactive={interactive}
        elevationScroll={elevationScroll}
      />
    </Suspense>
  );
}

export default LazyBuildingCanvas;
