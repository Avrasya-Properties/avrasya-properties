import { useEffect, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "../gsap";

export interface MagneticOptions {
  strength?: number;
  innerStrength?: number;
  innerSelector?: string;
  ease?: string;
  duration?: number;
  returnDuration?: number;
  returnEase?: string;
}

export interface RollingHoverOptions {
  stagger?: number;
  duration?: number;
  ease?: string;
}

/**
 * Applies physics-based magnetic cursor attraction to a button or interactive element.
 * Uses gsap.quickTo with spring physics, and supports multi-tiered parallax when an
 * inner child element is present.
 */
export function applyMagneticHover(
  element: HTMLElement,
  options?: number | MagneticOptions,
): () => void {
  if (!element || typeof window === "undefined") return () => {};

  if (prefersReducedMotion()) return () => {};

  // Clean touch / mobile bypass when device has only a coarse pointer and no fine pointer
  const isTouchOnly =
    typeof window !== "undefined" &&
    window.matchMedia?.("(pointer: coarse)").matches === true &&
    window.matchMedia?.("(pointer: fine)").matches === false;

  if (isTouchOnly) return () => {};

  const config: MagneticOptions =
    typeof options === "number" ? { strength: options } : options || {};

  const strength = config.strength ?? 0.3;
  const innerStrength = config.innerStrength ?? strength * 1.5;
  const duration = config.duration ?? 0.4;
  const ease = config.ease ?? "power3.out";
  const returnDuration = config.returnDuration ?? 1.2;
  const returnEase = config.returnEase ?? "elastic.out(1, 0.3)";

  const innerElement: HTMLElement | null = config.innerSelector
    ? element.querySelector<HTMLElement>(config.innerSelector)
    : element.querySelector<HTMLElement>("[data-magnetic-inner]") ||
      (element.firstElementChild as HTMLElement | null);

  let xTo: ReturnType<typeof gsap.quickTo> | null = null;
  let yTo: ReturnType<typeof gsap.quickTo> | null = null;
  let innerXTo: ReturnType<typeof gsap.quickTo> | null = null;
  let innerYTo: ReturnType<typeof gsap.quickTo> | null = null;
  let hasMoved = false;
  let cachedRect: DOMRect | null = null;

  // Eagerly instantiate quickTo setters to establish spring physics targets
  // and satisfy animation engine contracts, while tracking active displacement
  // to avoid redundant unmount resets on un-interacted elements.
  xTo = gsap.quickTo(element, "x", { duration, ease });
  yTo = gsap.quickTo(element, "y", { duration, ease });

  if (innerElement) {
    innerXTo = gsap.quickTo(innerElement, "x", { duration: duration * 1.1, ease });
    innerYTo = gsap.quickTo(innerElement, "y", { duration: duration * 1.1, ease });
  }

  const handleMouseEnter = () => {
    cachedRect = element.getBoundingClientRect();
  };

  const handleMouseMove = (e: MouseEvent) => {
    hasMoved = true;
    const rect = cachedRect || element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rawDx = e.clientX - centerX;
    const rawDy = e.clientY - centerY;
    const dx = Number.isFinite(rawDx) ? Math.max(-120, Math.min(120, rawDx)) : 0;
    const dy = Number.isFinite(rawDy) ? Math.max(-80, Math.min(80, rawDy)) : 0;

    if (xTo && yTo) {
      xTo(dx * strength);
      yTo(dy * strength);
    }

    if (innerXTo && innerYTo) {
      innerXTo(dx * innerStrength);
      innerYTo(dy * innerStrength);
    }
  };

  const handleMouseLeave = () => {
    cachedRect = null;
    if (!hasMoved) return;
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: returnDuration,
      ease: returnEase,
      overwrite: "auto",
    });

    if (innerElement) {
      gsap.to(innerElement, {
        x: 0,
        y: 0,
        duration: returnDuration,
        ease: returnEase,
        overwrite: "auto",
      });
    }
  };

  element.addEventListener("mouseenter", handleMouseEnter);
  element.addEventListener("mousemove", handleMouseMove);
  element.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    element.removeEventListener("mouseenter", handleMouseEnter);
    element.removeEventListener("mousemove", handleMouseMove);
    element.removeEventListener("mouseleave", handleMouseLeave);
    if (hasMoved) {
      gsap.killTweensOf(element);
      if (innerElement) {
        gsap.killTweensOf(innerElement);
        gsap.set(innerElement, { x: 0, y: 0 });
      }
      gsap.set(element, { x: 0, y: 0 });
    }
  };
}

/**
 * React hook to attach magnetic physics to a DOM element via ref.
 */
export function useMagneticHover(
  ref: RefObject<HTMLElement | null>,
  options?: number | MagneticOptions,
): void {
  useEffect(() => {
    if (!ref.current) return;
    const cleanup = applyMagneticHover(ref.current, options);
    return cleanup;
  }, [ref, options]);
}

/**
 * SplitText rolling hover for navigation links / luxury buttons.
 * Clones text layer and performs rolling character transition on hover.
 */
export function applyRollingNavHover(
  element: HTMLElement,
  options: RollingHoverOptions = {},
): () => void {
  if (!element || typeof window === "undefined") return () => {};

  const originalContent = element.innerHTML;
  const text = element.textContent?.trim() || "";

  if (!text) return () => {};

  const duration = options.duration ?? 0.5;
  const ease = options.ease ?? "power3.inOut";
  const stagger = options.stagger ?? 0.02;

  // Prepare dual-layer container
  element.innerHTML = "";
  element.style.position = "relative";
  element.style.display = "inline-block";
  element.style.overflow = "hidden";

  const layerTop = document.createElement("span");
  layerTop.className = "roll-primary";
  layerTop.style.display = "inline-block";
  layerTop.style.whiteSpace = "nowrap";

  const layerBottom = document.createElement("span");
  layerBottom.className = "roll-secondary";
  layerBottom.setAttribute("aria-hidden", "true");
  layerBottom.style.display = "inline-block";
  layerBottom.style.position = "absolute";
  layerBottom.style.top = "100%";
  layerBottom.style.left = "0";
  layerBottom.style.width = "100%";
  layerBottom.style.whiteSpace = "nowrap";

  const topChars: HTMLElement[] = [];
  const bottomChars: HTMLElement[] = [];

  Array.from(text).forEach((char) => {
    const s1 = document.createElement("span");
    s1.textContent = char === " " ? "\u00A0" : char;
    s1.style.display = "inline-block";
    s1.style.willChange = "transform";
    layerTop.appendChild(s1);
    topChars.push(s1);

    const s2 = document.createElement("span");
    s2.textContent = char === " " ? "\u00A0" : char;
    s2.style.display = "inline-block";
    s2.style.willChange = "transform";
    layerBottom.appendChild(s2);
    bottomChars.push(s2);
  });

  element.appendChild(layerTop);
  element.appendChild(layerBottom);

  let isHovered = false;

  const handleMouseEnter = () => {
    if (isHovered) return;
    isHovered = true;

    gsap.to(topChars, {
      yPercent: -100,
      duration,
      ease,
      stagger,
      overwrite: "auto",
    });

    gsap.to(bottomChars, {
      yPercent: -100,
      duration,
      ease,
      stagger,
      overwrite: "auto",
    });
  };

  const handleMouseLeave = () => {
    if (!isHovered) return;
    isHovered = false;

    gsap.to(topChars, {
      yPercent: 0,
      duration,
      ease,
      stagger,
      overwrite: "auto",
    });

    gsap.to(bottomChars, {
      yPercent: 0,
      duration,
      ease,
      stagger,
      overwrite: "auto",
    });
  };

  element.addEventListener("mouseenter", handleMouseEnter);
  element.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    element.removeEventListener("mouseenter", handleMouseEnter);
    element.removeEventListener("mouseleave", handleMouseLeave);
    gsap.killTweensOf(topChars);
    gsap.killTweensOf(bottomChars);
    element.innerHTML = originalContent;
  };
}

/**
 * React hook to attach rolling character hover to a DOM element via ref.
 */
export function useRollingNavHover(
  ref: RefObject<HTMLElement | null>,
  options?: RollingHoverOptions,
): void {
  useEffect(() => {
    if (!ref.current) return;
    const cleanup = applyRollingNavHover(ref.current, options);
    return cleanup;
  }, [ref, options]);
}
