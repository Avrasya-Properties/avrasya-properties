import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  useRouterState,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { watchWebsiteChanges,PUBLIC_QUERY_KEYS } from "@/lib/website-sync";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { MotionRoot } from "@/components/site/Motion";
import { Footer, Header } from "@/components/site/Chrome";
import { Preloader } from "@/components/site/Preloader";
import {loadCatalogue,loadPublicSettings} from "@/data/live";
import { LanguageProvider } from "@/hooks/useLanguage";
import type { SiteSettings } from "@/admin/demo";
import {DEMO_MODE,SUPABASE_URL} from "@/lib/supabase";

function NotFoundComponent() {
  return (
    <div className="container-site py-24">
      <p className="eyebrow eyebrow-mark">404 · Page not found</p>
      <h1 className="display-hero mt-3">This address isn't on our map.</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        The page may have moved. These are good places to continue:
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/properties" className="btn btn-primary">
          Offers & projects
        </Link>
        <Link to="/services" className="btn btn-outline">
          Services
        </Link>
        <Link to="/contact" className="btn btn-outline">
          Contact
        </Link>
        <Link to="/" className="btn btn-outline">
          Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="container-site py-24">
      <h1 className="headline">This page didn't load</h1>
      <p className="mt-2 text-muted-foreground">Something went wrong on our end.</p>
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="btn btn-primary"
        >
          Try again
        </button>
        <a href="/" className="btn btn-outline">
          Go home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad:async({context,location})=>{
    if(location.pathname.startsWith("/admin"))return;
    // Load critical public data before rendering, then hydrate the same cache.
    // A failed catalogue read is displayed inside the homepage, not as a redirect.
    await Promise.allSettled([
      context.queryClient.ensureQueryData({queryKey:["site-settings"],queryFn:loadPublicSettings,staleTime:15000,retry:false}),
      context.queryClient.ensureQueryData({queryKey:["published-catalogue"],queryFn:loadCatalogue,staleTime:15000,retry:false}),
    ]);
  },
  // Hand the already-fetched public settings to head() so admin SEO switches apply to every public page.
  loader: ({ context, location }) =>
    location.pathname.startsWith("/admin") ? { settings: null } : { settings: context.queryClient.getQueryData<SiteSettings>(["site-settings"]) ?? null },
  head: ({ loaderData }) => ({
    meta: [
      ...(loaderData?.settings?.indexingEnabled === false ? [{ name: "robots", content: "noindex, nofollow" }] : []),
      ...(loaderData?.settings?.googleVerification?.trim() ? [{ name: "google-site-verification", content: loaderData.settings.googleVerification.trim() }] : []),
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Avrasya Properties — Türkiye Luxury Real Estate & Investment Advisory" },
      {
        name: "description",
        content: "Property advisory for international buyers across Türkiye, from Istanbul to the coast. Explore verified properties, independent legal review, and Turkish citizenship by investment.",
      },
      { property: "og:site_name", content: "Avrasya Properties" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Avrasya Properties — Türkiye Luxury Real Estate & Investment Advisory" },
      { property: "og:description", content: "Property advisory for international buyers across Türkiye, from Istanbul to the coast. Explore verified properties, independent legal review, and Turkish citizenship by investment." },
      { property: "og:image", content: "https://avrasyaproperties.com/images/properties/hero-main.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Avrasya Properties — Türkiye Luxury Real Estate & Investment Advisory" },
      { name: "twitter:description", content: "Property advisory for international buyers across Türkiye, from Istanbul to the coast. Explore verified properties, independent legal review, and Turkish citizenship by investment." },
      { name: "twitter:image", content: "https://avrasyaproperties.com/images/properties/hero-main.jpg" },
      { name: "avrasya-data-mode", content: DEMO_MODE?"demo":"live" },
      { name: "avrasya-database", content: new URL(SUPABASE_URL).hostname },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "canonical", href: "https://avrasyaproperties.com" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const jsonLdWebSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Avrasya Properties",
    alternateName: ["Avrasya Real Estate Istanbul", "Avrasya Properties Turkey"],
    url: "https://avrasyaproperties.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://avrasyaproperties.com/properties?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const jsonLdRealEstateAgent = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": "https://avrasyaproperties.com/#organization",
    name: "Avrasya Properties",
    legalName: "Avrasya Properties Group",
    url: "https://avrasyaproperties.com",
    logo: "https://avrasyaproperties.com/favicon.svg",
    image: "https://avrasyaproperties.com/images/properties/hero-main.jpg",
    description: "Premier Istanbul luxury real estate and investment advisory firm assisting international investors with prime residential acquisitions and Turkish Citizenship by Investment.",
    telephone: "+90 545 924 80 42",
    email: "info@avrasyaproperties.com",
    priceRange: "$$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Mimar Sinan Mahallesi, Selam-i Ali Efendi Caddesi, Ara Kafe Yanı No:17",
      addressLocality: "Üsküdar",
      addressRegion: "Istanbul",
      postalCode: "34672",
      addressCountry: "TR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.0264,
      longitude: 29.0153,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:30",
      closes: "18:30",
    },
    sameAs: [
      "https://instagram.com/avrasyaproperties",
      "https://linkedin.com/company/avrasya-properties",
    ],
  };

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdRealEstateAgent) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = path.startsWith("/admin");
  useEffect(
    () =>
      watchWebsiteChanges(() => {
        void queryClient.invalidateQueries({
          predicate: (q: any) => PUBLIC_QUERY_KEYS.has(String(q.queryKey[0])),
        });
        void router.invalidate();
      },{poll:!isAdmin&&!DEMO_MODE}),
    [queryClient, router,isAdmin],
  );
  if (isAdmin)
    return (
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    );
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <a href="#main" className="skip-link sr-only">
          Skip to content
        </a>
        <Preloader />
        {path!=="/"&&<MotionRoot />}
        <Header />
        <main id="main">
          <Outlet />
        </main>
        <Footer />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

