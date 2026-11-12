import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import gsap from "gsap";

interface RouteIdentity {
  top: string;
  main: string;
}

const ROUTE_IDENTITIES: Record<string, RouteIdentity> = {
  "/why-turkiye": { top: "WHY", main: "TÜRKİYE" },
  "/about": { top: "ABOUT", main: "AVRASYA" },
  "/services": { top: "OUR", main: "SERVICES" },
  "/citizenship": { top: "GLOBAL", main: "CITIZENSHIP" },
  "/calculator": { top: "INVESTMENT", main: "CALCULATOR" },
  "/contact": { top: "PRIVATE", main: "OFFICE" },
  "/privacy-policy": { top: "LEGAL", main: "PRIVACY" },
  "/terms": { top: "TERMS OF", main: "SERVICE" },
  "/cookie-policy": { top: "COOKIE", main: "POLICY" },
  "/investment-catalog": { top: "INVESTMENT", main: "PORTFOLIO" },
  "/investment-disclaimer": { top: "LEGAL", main: "DISCLAIMER" },
  "/investment-in-turkiye": { top: "INVESTMENT", main: "TÜRKİYE" },
  "/insights": { top: "MARKET", main: "INSIGHTS" },
  "/faqs": { top: "CLIENT", main: "FAQS" },
};

function deriveFromPath(path: string): RouteIdentity {
  const clean = path.replace(/^\/+|\/+$/g, "").split("/")[0] || "";
  const parts = clean.split("-").filter(Boolean);
  if (parts.length >= 2) {
    return {
      top: parts[0]!.toUpperCase(),
      main: parts.slice(1).join(" ").toUpperCase(),
    };
  }
  return {
    top: "AVRASYA",
    main: clean.toUpperCase() || "PAGE",
  };
}

export interface PageIdentityLineArtProps {
  title?: string;
  subtitle?: string;
  className?: string;
  customTop?: string;
  customMain?: string;
}

export function PageIdentityLineArt({
  title,
  subtitle,
  className,
  customTop,
  customMain,
}: PageIdentityLineArtProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({
    select: (s) => s.location?.pathname || "",
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, x: 25 },
        { opacity: 0.85, x: 0, duration: 1.2, ease: "power2.out" },
      );
    }, containerRef);

    return () => ctx.revert();
  }, [pathname]);

  // Strict exclusions: NEVER render on properties catalog, locations, home, or admin
  if (
    !pathname ||
    pathname === "/" ||
    pathname.startsWith("/properties") ||
    pathname.startsWith("/locations") ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  let identity: RouteIdentity | null = null;

  if (title || customMain) {
    identity = {
      top: (subtitle || customTop || "AVRASYA").toUpperCase(),
      main: (title || customMain || "").toUpperCase(),
    };
  } else if (ROUTE_IDENTITIES[pathname]) {
    identity = ROUTE_IDENTITIES[pathname]!;
  } else {
    identity = deriveFromPath(pathname);
  }

  if (!identity || !identity.main) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-3 right-4 z-0 select-none text-right opacity-95 sm:bottom-5 sm:right-8 md:bottom-6 md:right-12 lg:right-16 ${className || ""}`}
      style={{ userSelect: "none" }}
    >
      <span
        className="mb-1.5 mr-1 block font-mono text-sm font-semibold tracking-[0.3em] uppercase text-[#C5A059]/80 sm:text-base md:text-xl lg:text-2xl"
        style={{
          WebkitTextStroke: "0.5px rgba(197, 160, 89, 0.35)",
        }}
      >
        {identity.top}
      </span>
      <span
        className="pointer-events-none block select-none font-serif text-5xl font-bold tracking-widest uppercase text-white/15 sm:text-7xl md:text-8xl lg:text-[7.5rem]"
        style={{
          WebkitTextStroke: "1.5px rgba(255, 255, 255, 0.28)",
          fontFamily: '"Cormorant Garamond", "Instrument Serif", Georgia, serif',
          lineHeight: 0.92,
        }}
      >
        {identity.main}
      </span>
    </div>
  );
}
