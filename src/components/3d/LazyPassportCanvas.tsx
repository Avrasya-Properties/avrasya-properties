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
 * Activates WebGL Three.js on modern desktop displays with mouse/pointer and WebGL capability.
 * Instantly provides high-fidelity CSS 3D PassportFallbackCard for mobile screens, reduced motion,
 * low-bandwidth environments, or unsupported WebGL contexts.
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
    return <PassportFallbackCard className={className} interactive={interactive} />;
  }

  return (
    <Suspense fallback={<PassportFallbackCard className={className} interactive={interactive} />}>
      <PassportCanvas className={className} interactive={interactive} priority={priority} />
    </Suspense>
  );
}

export default LazyPassportCanvas;
