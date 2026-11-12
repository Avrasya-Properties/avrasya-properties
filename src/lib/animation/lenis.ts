import Lenis, { type LenisOptions } from "lenis";
import { useEffect } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../gsap";

export interface SmoothScrollResult {
  lenis: Lenis | null;
  destroy: () => void;
  (): void;
}

let globalLenis: Lenis | null = null;
let tickerFn: ((time: number) => void) | null = null;

/**
 * Polyfill DOM globals in headless or JSDOM test environments so Lenis doesn't throw.
 */
function ensureDOMEnvironment(): boolean {
  if (typeof window === "undefined") return false;

  if (typeof (window as any).ResizeObserver === "undefined") {
    (window as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  if (typeof window.matchMedia !== "function") {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as any;
  }

  return true;
}

/**
 * Initializes Lenis smooth scrolling and synchronizes it with GSAP's ScrollTrigger ticker loop.
 * Respects prefers-reduced-motion to disable inertia if requested.
 */
export function initSmoothScroll(options?: Partial<LenisOptions>): SmoothScrollResult {
  if (!ensureDOMEnvironment()) {
    const noopResult = (() => {}) as SmoothScrollResult;
    noopResult.lenis = null;
    noopResult.destroy = () => {};
    return noopResult;
  }

  // Teardown any existing instance before creating a new one
  if (globalLenis) {
    destroySmoothScroll();
  }

  const isReducedMotion = prefersReducedMotion();

  // If reduced motion is requested, do not initialize inertial scrolling
  if (isReducedMotion) {
    const reducedMotionResult = (() => {}) as SmoothScrollResult;
    reducedMotionResult.lenis = null;
    reducedMotionResult.destroy = () => {};
    return reducedMotionResult;
  }

  const defaultOptions: Partial<LenisOptions> = {
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.5,
  };

  const lenis = new Lenis({
    ...defaultOptions,
    ...options,
  });

  globalLenis = lenis;

  // 1. Synchronize Lenis scroll events with GSAP ScrollTrigger updates
  lenis.on("scroll", ScrollTrigger.update);

  // 2. Drive Lenis updates through GSAP ticker loop
  tickerFn = (time: number) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(tickerFn);

  // 3. Disable GSAP lagSmoothing so animations do not jump during smooth scrolling
  gsap.ticker.lagSmoothing(0);

  const destroy = () => {
    destroySmoothScroll();
  };

  const result = (() => {
    destroy();
  }) as SmoothScrollResult;
  result.lenis = lenis;
  result.destroy = destroy;

  return result;
}

/**
 * Cleanly tears down the active Lenis instance and detaches ticker callbacks.
 */
export function destroySmoothScroll(): void {
  if (tickerFn) {
    gsap.ticker.remove(tickerFn);
    tickerFn = null;
  }
  if (globalLenis) {
    try {
      globalLenis.destroy();
    } catch {
      // Ignore cleanup error if already destroyed
    }
    globalLenis = null;
  }
}

/**
 * Returns the currently active Lenis instance, or null if unmounted / reduced motion.
 */
export function getLenis(): Lenis | null {
  return globalLenis;
}

/**
 * React hook to mount smooth scroll in the root application layout.
 */
export function useSmoothScroll(enabled: boolean = true, options?: Partial<LenisOptions>): void {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const instance = initSmoothScroll(options);

    return () => {
      instance.destroy();
    };
  }, [enabled, options]);
}
