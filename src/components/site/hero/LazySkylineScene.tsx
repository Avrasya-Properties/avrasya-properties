import { lazy, Suspense, useEffect, useState } from "react";

const SkylineScene = lazy(() => import("./SkylineScene"));

/**
 * Loads three.js only when it will actually help: a wide, hover-capable screen, motion allowed, data-saver
 * off and WebGL present. Phones, reduced-motion users and test environments never download the 3D chunk.
 */
export function LazySkylineScene({ className = "" }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saver = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (!(wide && fine && calm) || saver) return;
    try {
      const canvas = document.createElement("canvas");
      if (!(canvas.getContext("webgl2") || canvas.getContext("webgl"))) return;
    } catch {
      return;
    }
    // Defer past first paint so the 3D chunk never competes with the hero photograph.
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const id = idle ? idle(() => setEnabled(true)) : window.setTimeout(() => setEnabled(true), 600);
    return () => {
      if (!idle) window.clearTimeout(id);
    };
  }, []);

  if (!enabled) return null;
  return (
    <Suspense fallback={null}>
      <SkylineScene className={className} />
    </Suspense>
  );
}