import { useEffect, useLayoutEffect, type DependencyList, type RefObject } from "react";
import { gsap } from "../gsap";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface ScopedContextResult {
  context: gsap.Context;
  revert: () => void;
}

/**
 * Creates a scoped GSAP context on a given container or element.
 * Automatically scopes selectors and provides a clean revert() method.
 */
export function createScopedContext(
  scope: HTMLElement | RefObject<HTMLElement | null> | null | undefined,
  callback: (context: gsap.Context) => void,
): ScopedContextResult {
  const targetScope =
    scope && typeof scope === "object" && "current" in scope
      ? scope.current
      : (scope as HTMLElement | null | undefined);

  const ctx = gsap.context((self) => {
    callback(self);
  }, targetScope ?? undefined);

  return {
    context: ctx,
    revert: () => ctx.revert(),
  };
}

/**
 * React hook for running GSAP animations scoped to a ref container.
 * Automatically calls ctx.revert() on unmount or when dependencies change,
 * preventing memory leaks and orphaned ScrollTrigger instances across route transitions.
 */
export function useScopedGSAP(
  callback: (context: gsap.Context) => void,
  scope?: RefObject<HTMLElement | null> | null,
  deps: DependencyList = [],
): void {
  useIsomorphicLayoutEffect(() => {
    const targetScope = scope && "current" in scope ? scope.current : undefined;
    const ctx = gsap.context((self) => {
      callback(self);
    }, targetScope ?? undefined);

    return () => {
      ctx.revert();
    };
  }, deps);
}
