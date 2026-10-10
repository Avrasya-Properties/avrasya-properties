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
import { reportLovableError } from "../lib/lovable-error-reporting";
import { MotionRoot } from "@/components/site/Motion";
import { Footer, Header } from "@/components/site/Chrome";
import { Preloader } from "@/components/site/Preloader";

function NotFoundComponent() {
  return (
    <div className="container-site py-24">
      <p className="eyebrow eyebrow-mark">404 · Page not found</p>
      <h1 className="display-hero mt-3">This address isn't on our map.</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">The page may have moved. These are good places to continue:</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/properties" className="btn btn-primary">Offers & projects</Link>
        <Link to="/services" className="btn btn-outline">Services</Link>
        <Link to="/contact" className="btn btn-outline">Contact</Link>
        <Link to="/" className="btn btn-outline">Home</Link>
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
        <button onClick={() => { router.invalidate(); reset(); }} className="btn btn-primary">Try again</button>
        <a href="/" className="btn btn-outline">Go home</a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Avrasya Properties — Istanbul property-investment consultancy" },
      { name: "description", content: "Istanbul-based advisory for international property buyers in Türkiye." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
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
  const isAdmin = useRouterState({ select: (s) => s.location.pathname.startsWith("/admin") });
  if (isAdmin) return <QueryClientProvider client={queryClient}><Outlet /></QueryClientProvider>;
  return (
    <QueryClientProvider client={queryClient}>
      <a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>
      <Preloader />
      <MotionRoot />
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </QueryClientProvider>
  );
}
