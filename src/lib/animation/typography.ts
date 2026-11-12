import { gsap, prefersReducedMotion } from "../gsap";

export interface SplitResult {
  chars: HTMLElement[];
  words: HTMLElement[];
  lines: HTMLElement[];
  revert: () => void;
}

export interface SplitOptions {
  type?: "chars" | "words" | "lines" | "words,chars" | "chars,words" | "lines,words";
  charsClass?: string;
  wordsClass?: string;
  linesClass?: string;
  maskLines?: boolean;
}

export interface TypographyAnimationOptions {
  duration?: number;
  delay?: number;
  stagger?: number;
  ease?: string;
  x?: string | number;
  scrollTrigger?: any;
  paused?: boolean;
  onComplete?: () => void;
}

function resolveElements(target: HTMLElement | string): HTMLElement[] {
  if (typeof target === "string") {
    if (typeof document === "undefined") return [];
    return Array.from(document.querySelectorAll<HTMLElement>(target));
  }
  return [target];
}

/**
 * DOM-based SplitText implementation providing character, word, and line splitting
 * with graceful revert capability and React/DOM compatibility.
 */
export function splitText(target: HTMLElement | string, options: SplitOptions = {}): SplitResult {
  const elements = resolveElements(target);
  const chars: HTMLElement[] = [];
  const words: HTMLElement[] = [];
  const lines: HTMLElement[] = [];

  const revertCallbacks: Array<() => void> = [];

  const type = options.type || "words,chars";
  const needChars = type.includes("chars");
  const needWords = type.includes("words") || needChars || type.includes("lines");
  const needLines = type.includes("lines");
  const charsClass = options.charsClass || "split-char";
  const wordsClass = options.wordsClass || "split-word";
  const linesClass = options.linesClass || "split-line";
  const maskLines = options.maskLines ?? needLines;

  elements.forEach((el) => {
    const originalHTML = el.innerHTML;
    revertCallbacks.push(() => {
      el.innerHTML = originalHTML;
    });

    // Extract text content and tokenize words
    const rawText = el.textContent || "";
    const rawWords = rawText.trim().split(/\s+/).filter(Boolean);

    el.innerHTML = "";

    const elementWords: HTMLElement[] = [];

    rawWords.forEach((wordText, wordIndex) => {
      const wordSpan = document.createElement("span");
      wordSpan.className = wordsClass;
      wordSpan.style.display = "inline-block";
      wordSpan.style.whiteSpace = "nowrap";

      if (needChars) {
        const charArray = Array.from(wordText);
        charArray.forEach((ch) => {
          const charSpan = document.createElement("span");
          charSpan.className = charsClass;
          charSpan.textContent = ch;
          charSpan.style.display = "inline-block";
          charSpan.style.willChange = "transform, opacity";
          wordSpan.appendChild(charSpan);
          chars.push(charSpan);
        });
      } else {
        wordSpan.textContent = wordText;
      }

      el.appendChild(wordSpan);
      words.push(wordSpan);
      elementWords.push(wordSpan);

      // Append space between words
      if (wordIndex < rawWords.length - 1) {
        const space = document.createTextNode(" ");
        el.appendChild(space);
      }
    });

    // Line wrapping & masking
    if (needLines && elementWords.length > 0) {
      // Group words into lines based on offsetTop, with fallback for headless/JSDOM
      const lineGroups: HTMLElement[][] = [];
      let currentLine: HTMLElement[] = [];
      let lastTop = -1;

      elementWords.forEach((w) => {
        const top = w.offsetTop;
        if (lastTop === -1 || top === lastTop) {
          currentLine.push(w);
          lastTop = top;
        } else {
          lineGroups.push(currentLine);
          currentLine = [w];
          lastTop = top;
        }
      });
      if (currentLine.length > 0) {
        lineGroups.push(currentLine);
      }

      // In JSDOM / headless test runs, offsetTop might be 0 for all elements
      // If only 1 group formed from many words, group them into single or structured line
      el.innerHTML = "";
      lineGroups.forEach((group) => {
        const lineSpan = document.createElement("span");
        lineSpan.className = linesClass;
        lineSpan.style.display = "inline-block";
        lineSpan.style.willChange = "transform, opacity";

        group.forEach((w, idx) => {
          lineSpan.appendChild(w);
          if (idx < group.length - 1) {
            lineSpan.appendChild(document.createTextNode(" "));
          }
        });

        if (maskLines) {
          const maskSpan = document.createElement("span");
          maskSpan.className = "split-line-mask";
          maskSpan.style.display = "block";
          maskSpan.style.overflow = "hidden";
          maskSpan.appendChild(lineSpan);
          el.appendChild(maskSpan);
        } else {
          el.appendChild(lineSpan);
        }

        lines.push(lineSpan);
      });
    }
  });

  return {
    chars,
    words,
    lines,
    revert: () => {
      revertCallbacks.forEach((fn) => fn());
    },
  };
}

function buildTimelineVars(options: TypographyAnimationOptions): gsap.TimelineVars {
  const vars: gsap.TimelineVars = {
    paused: options.paused ?? false,
  };
  if (options.scrollTrigger !== undefined) {
    vars.scrollTrigger = options.scrollTrigger;
  }
  if (options.onComplete) {
    vars.onComplete = options.onComplete;
  }
  return vars;
}

/**
 * Headings (animateTextH): 3D perspective character flip on Y-axis.
 * Flips characters on the Y-axis from 90deg to 0deg with opacity and subtle upward lift.
 */
export function animateTextH(
  target: HTMLElement | string,
  options: TypographyAnimationOptions = {},
): gsap.core.Timeline {
  const elements = resolveElements(target);
  const tl = gsap.timeline(buildTimelineVars(options));

  if (elements.length === 0) return tl;

  const isReduced = prefersReducedMotion();

  elements.forEach((el, index) => {
    const split = splitText(el, { type: "words,chars" });
    const targetChars = split.chars.length > 0 ? split.chars : [el];

    if (isReduced) {
      tl.fromTo(
        targetChars,
        { opacity: 0 },
        { opacity: 1, duration: 0.1, delay: options.delay ?? 0 },
        index === 0 ? undefined : "<0.1",
      );
    } else {
      targetChars.forEach((c) => {
        c.style.transformStyle = "preserve-3d";
      });
      gsap.set(targetChars, {
        transformPerspective: 800,
      });

      tl.fromTo(
        targetChars,
        {
          opacity: 0,
          yPercent: 50,
          rotateY: 90,
        },
        {
          opacity: 1,
          yPercent: 0,
          rotateY: 0,
          duration: options.duration ?? 1.2,
          delay: options.delay ?? 0,
          stagger: options.stagger ?? 0.04,
          ease: options.ease ?? "power3.out",
          overwrite: "auto",
        },
        index === 0 ? undefined : "<0.1",
      );
    }
  });

  return tl;
}

/**
 * Accent & Brand Names (animateTextA): 3D drop-flip on X-axis with lateral sweep.
 * Drops characters in from rotateX: 90deg with lateral slide into registration.
 */
export function animateTextA(
  target: HTMLElement | string,
  options: TypographyAnimationOptions = {},
): gsap.core.Timeline {
  const elements = resolveElements(target);
  const tl = gsap.timeline(buildTimelineVars(options));

  if (elements.length === 0) return tl;

  const isReduced = prefersReducedMotion();
  const slideX = options.x ?? "10rem";

  elements.forEach((el, index) => {
    const split = splitText(el, { type: "chars" });
    const targetChars = split.chars.length > 0 ? split.chars : [el];

    if (isReduced) {
      tl.fromTo(
        targetChars,
        { opacity: 0 },
        { opacity: 1, duration: 0.1, delay: options.delay ?? 0 },
        index === 0 ? undefined : "<0.1",
      );
    } else {
      targetChars.forEach((c) => {
        c.style.transformStyle = "preserve-3d";
      });
      gsap.set(targetChars, {
        transformPerspective: 800,
        transformOrigin: "center bottom",
      });

      tl.fromTo(
        targetChars,
        {
          opacity: 0,
          rotateX: 90,
          x: slideX,
        },
        {
          opacity: 1,
          rotateX: 0,
          x: 0,
          duration: options.duration ?? 1.2,
          delay: options.delay ?? 0,
          stagger: options.stagger ?? 0.05,
          ease: options.ease ?? "power4.out",
          overwrite: "auto",
        },
        index === 0 ? undefined : "<0.1",
      );
    }
  });

  return tl;
}

/**
 * Paragraphs & Editorial Descriptions (animateTextP): Masked vertical line rise.
 * Each line of copy rises out of an overflow-hidden slot.
 */
export function animateTextP(
  target: HTMLElement | string,
  options: TypographyAnimationOptions = {},
): gsap.core.Timeline {
  const elements = resolveElements(target);
  const tl = gsap.timeline(buildTimelineVars(options));

  if (elements.length === 0) return tl;

  const isReduced = prefersReducedMotion();

  elements.forEach((el, index) => {
    const split = splitText(el, { type: "lines,words", maskLines: true });
    const targetLines = split.lines.length > 0 ? split.lines : [el];

    if (isReduced) {
      tl.fromTo(
        targetLines,
        { opacity: 0 },
        { opacity: 1, duration: 0.1, delay: options.delay ?? 0 },
        index === 0 ? undefined : "<0.1",
      );
    } else {
      tl.fromTo(
        targetLines,
        {
          yPercent: 110,
          opacity: 0,
        },
        {
          yPercent: 0,
          opacity: 1,
          duration: options.duration ?? 1.2,
          delay: options.delay ?? 0,
          stagger: options.stagger ?? 0.1,
          ease: options.ease ?? "power2.out",
          overwrite: "auto",
        },
        index === 0 ? undefined : "<0.1",
      );
    }
  });

  return tl;
}
