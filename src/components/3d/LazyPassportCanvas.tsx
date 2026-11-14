import React, { lazy, Suspense, useEffect, useState } from "react";
import { PassportFallbackCard } from "./PassportFallbackCard";

const PassportCanvas = lazy(() => import("./PassportCanvas"));

export interface LazyPassportCanvasProps {
  className?: string;
  interactive?: boolean;
  priority?: boolean;
}

/**
 * Progressive enhancement lazy loader for Turkish Passport 3D WebGL Canvas (Milestone 3).
 * Activates WebGL Three.js across both mobile and desktop displays whenever WebGL is supported
 * and reduced-motion / data-saver are not active.
 */
export function LazyPassportCanvas({
  className = "",
  interactive = true,
  priority = false,
}: LazyPassportCanvasProps) {
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
    return <PassportFallbackCard className={className} interactive={interactive} />;
  }

  return (
    <Suspense fallback={<PassportFallbackCard className={className} interactive={interactive} />}>
      <PassportCanvas className={className} interactive={interactive} priority={priority} />
    </Suspense>
  );
}

export default LazyPassportCanvas;
