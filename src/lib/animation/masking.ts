import { gsap, prefersReducedMotion } from "../gsap";

export interface MaskOptions {
  duration?: number;
  delay?: number;
  ease?: string;
  state?: "reveal" | "hide";
  scrollTrigger?: any;
  paused?: boolean;
  scaleStart?: number;
  scaleEnd?: number;
  xPercentStart?: number;
  xPercentEnd?: number;
  onComplete?: () => void;
}

/**
 * Cinematic Polygon Clipping Mask (animateSlide).
 * Pairs an expanding angled clipping polygon with counter-scaling and counter-translating internal imagery.
 */
export function animateSlide(
  container: HTMLElement,
  image: HTMLElement,
  options: MaskOptions = {},
): gsap.core.Timeline {
  const vars: gsap.TimelineVars = {
    paused: options.paused ?? false,
  };
  if (options.scrollTrigger !== undefined) {
    vars.scrollTrigger = options.scrollTrigger;
  }
  if (options.onComplete) {
    vars.onComplete = options.onComplete;
  }

  const tl = gsap.timeline(vars);

  if (!container || !image) return tl;

  const state = options.state || "reveal";
  const duration = options.duration ?? 1.2;
  const delay = options.delay ?? 0;
  const ease = options.ease ?? "power3.inOut";
  const isReduced = prefersReducedMotion();

  if (isReduced) {
    if (state === "reveal") {
      tl.fromTo(
        [container, image],
        { opacity: 0 },
        { opacity: 1, duration: 0.2, delay, overwrite: "auto" },
      );
    } else {
      tl.fromTo(
        [container, image],
        { opacity: 1 },
        { opacity: 0, duration: 0.2, delay, overwrite: "auto" },
      );
    }
    return tl;
  }

  if (state === "reveal") {
    const scaleStart = options.scaleStart ?? 1.4;
    const scaleEnd = options.scaleEnd ?? 1.0;
    const xStart = options.xPercentStart ?? 20;
    const xEnd = options.xPercentEnd ?? 0;

    // Angular polygon mask wipe
    tl.fromTo(
      container,
      {
        clipPath: "polygon(100% 0%, 100% 0%, 101% 100%, 125% 100%)",
      },
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration,
        delay,
        ease,
        overwrite: "auto",
      },
    );

    // Counter-motion on image: scales down and shifts horizontally into registration
    tl.fromTo(
      image,
      {
        scale: scaleStart,
        xPercent: xStart,
      },
      {
        scale: scaleEnd,
        xPercent: xEnd,
        duration,
        delay,
        ease,
        overwrite: "auto",
      },
      "<",
    );
  } else {
    // Hide state: mask closes to left edge while image scales and shifts out
    const scaleStart = options.scaleStart ?? 1.0;
    const scaleEnd = options.scaleEnd ?? 1.4;
    const xStart = options.xPercentStart ?? 0;
    const xEnd = options.xPercentEnd ?? -20;

    tl.fromTo(
      container,
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      },
      {
        clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
        duration,
        delay,
        ease,
        overwrite: "auto",
      },
    );

    tl.fromTo(
      image,
      {
        scale: scaleStart,
        xPercent: xStart,
      },
      {
        scale: scaleEnd,
        xPercent: xEnd,
        duration,
        delay,
        ease,
        overwrite: "auto",
      },
      "<",
    );
  }

  return tl;
}
