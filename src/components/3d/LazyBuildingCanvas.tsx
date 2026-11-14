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
 * Activates WebGL Three.js across both mobile and desktop displays whenever WebGL is supported
 * and reduced-motion / data-saver are not active.
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

    const allowsMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDataSaver =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ===
      true;

    if (!allowsMotion || isDataSaver) {
      return;
    }

    // Check actual WebGL availability (works on both mobile and desktop GPUs)
    try {
      const testCanvas = document.createElement("canvas");
      const gl =
        testCanvas.getContext("webgl2") ||
        testCanvas.getContext("webgl") ||
        testCanvas.getContext("experimental-webgl");
      if (!gl) return;
    } catch {
      return;
    }

    // WebGL capability verified: activate Three.js canvas smoothly on both mobile and desktop
    setUseWebGL(true);
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
