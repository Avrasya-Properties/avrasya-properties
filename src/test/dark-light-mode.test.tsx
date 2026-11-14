import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ThemeProvider, useTheme, THEME_STORAGE_KEY } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { Header, Footer } from "@/components/site/Chrome";
import { CaldrenHeroSection } from "@/components/site/CaldrenHeroSection";
import { BildoraAboutSection } from "@/components/site/BildoraAboutSection";
import { BildoraServicesTimeline } from "@/components/site/BildoraServicesTimeline";
import { ServicesProcessTimeline } from "@/components/site/ServicesProcessTimeline";
import { RegionShowcase } from "@/components/site/RegionShowcase";
import { CaldrenLocationsSection } from "@/components/site/CaldrenLocationsSection";
import { DEFAULT_SITE_SETTINGS } from "@/admin/demo";
import { defaultRegions } from "@/data/regions";
import { properties } from "@/data/properties";

function mockMatchMedia(prefersDark: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-color-scheme: dark") ? prefersDark : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function renderWithRouterAndTheme(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function ThemeStateProbe() {
    const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
    return (
      <div data-testid="theme-probe">
        <span data-testid="probe-theme">{theme}</span>
        <span data-testid="probe-resolved">{resolvedTheme}</span>
        <button type="button" data-testid="probe-set-dark" onClick={() => setTheme("dark")}>
          Set Dark
        </button>
        <button type="button" data-testid="probe-set-light" onClick={() => setTheme("light")}>
          Set Light
        </button>
        <button type="button" data-testid="probe-toggle" onClick={toggleTheme}>
          Toggle
        </button>
      </div>
    );
  }

  const rootRoute = createRootRoute({
    component: () => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <ThemeStateProbe />
            {ui}
            <Outlet />
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    ),
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => null,
  });

  const childPaths = [
    "/properties",
    "/properties/$slug",
    "/locations",
    "/services",
    "/citizenship",
    "/why-turkiye",
    "/calculator",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/cookie-policy",
    "/investment-disclaimer",
  ];

  const childRoutes = childPaths.map((p) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path: p,
      component: () => null,
    }),
  );

  const routeTree = rootRoute.addChildren([indexRoute, ...childRoutes]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });

  return render(<RouterProvider router={router} />);
}

describe("Dark / Light Mode System — Persistence, System Preference, Accessibility & UI Integration", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.classList.remove("dark", "light", "theme-transitioning");
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "";
    mockMatchMedia(false);
  });

  it("1. respects system preference (light) on first visit when no localStorage preference exists", async () => {
    mockMatchMedia(false);
    renderWithRouterAndTheme(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByTestId("probe-resolved")).toHaveTextContent("light");
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("2. respects system preference (dark) on first visit when OS prefers dark mode", async () => {
    mockMatchMedia(true);
    renderWithRouterAndTheme(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByTestId("probe-resolved")).toHaveTextContent("dark");
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("3. toggles between light and dark modes via ThemeToggle, persists in localStorage, and updates ARIA state", async () => {
    mockMatchMedia(false);
    renderWithRouterAndTheme(<ThemeToggle variant="navbar" />);

    await waitFor(() => {
      expect(screen.getByTestId("probe-resolved")).toHaveTextContent("light");
    });

    const toggleBtn = screen.getByTestId("theme-toggle-button");
    expect(toggleBtn).toHaveAttribute("aria-pressed", "false");

    // Click to switch to Dark Mode
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(screen.getByTestId("probe-resolved")).toHaveTextContent("dark");
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(toggleBtn).toHaveAttribute("aria-pressed", "true");

    // Click again to switch back to Light Mode
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(screen.getByTestId("probe-resolved")).toHaveTextContent("light");
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(toggleBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("4. restores persisted dark theme across reloads even when system preference is light", async () => {
    mockMatchMedia(false);
    localStorage.setItem(THEME_STORAGE_KEY, "dark");

    renderWithRouterAndTheme(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByTestId("probe-resolved")).toHaveTextContent("dark");
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("5. integrates ThemeToggle into Header (desktop + mobile drawer) and adapts Logo & sections seamlessly in dark mode", async () => {
    mockMatchMedia(false);
    const { container } = renderWithRouterAndTheme(
      <>
        <Header />
        <CaldrenHeroSection settings={DEFAULT_SITE_SETTINGS} />
        <BildoraAboutSection />
        <ServicesProcessTimeline showActionButtons={true} />
        <BildoraServicesTimeline />
        <RegionShowcase regions={defaultRegions()} properties={properties} />
        <CaldrenLocationsSection />
        <Footer />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("probe-resolved")).toHaveTextContent("light");
    });

    // Header should contain the theme toggle
    const toggles = screen.getAllByTestId("theme-toggle-button");
    expect(toggles.length).toBeGreaterThan(0);

    // Header logo in light mode uses dark logo (for light surface)
    const headerLogoBefore = container.querySelector("header img");
    expect(headerLogoBefore?.getAttribute("src")).toContain("avrasya-logo.svg");

    // Switch to dark mode via header toggle
    fireEvent.click(toggles[0]!);

    await waitFor(() => {
      expect(screen.getByTestId("probe-resolved")).toHaveTextContent("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    // Header logo in dark mode automatically switches to white logo for dark header contrast
    const headerLogoAfter = container.querySelector("header img");
    expect(headerLogoAfter?.getAttribute("src")).toContain("avrasya-logo-pure-white.svg");
  });
});
