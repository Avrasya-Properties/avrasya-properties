import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
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
import { LanguageProvider, useLanguage } from "@/hooks/useLanguage";
import { LOCALES, TRANSLATIONS, type Locale } from "@/i18n";
import { Header, Footer } from "@/components/site/Chrome";
import { CaldrenHeroSection } from "@/components/site/CaldrenHeroSection";
import { BildoraAboutSection } from "@/components/site/BildoraAboutSection";
import { BildoraProjectsShowcase } from "@/components/site/BildoraProjectsShowcase";
import { BildoraServicesTimeline } from "@/components/site/BildoraServicesTimeline";
import { ServicesProcessTimeline } from "@/components/site/ServicesProcessTimeline";
import { RegionShowcase } from "@/components/site/RegionShowcase";
import { PartnersSection } from "@/components/site/PartnersSection";
import { CaldrenLocationsSection } from "@/components/site/CaldrenLocationsSection";
import { CaldrenSkyCtaSection } from "@/components/site/CaldrenSkyCtaSection";
import { AboutPage } from "@/routes/about";
import { ServicesPage } from "@/routes/services";
import { CitizenshipPage } from "@/routes/citizenship";
import { WhyTurkiye } from "@/routes/why-turkiye";
import { ContactPage } from "@/routes/contact";
import { DEFAULT_SITE_SETTINGS } from "@/admin/demo";
import { DEFAULT_REGIONS } from "@/data/regions";
import { properties } from "@/data/properties";

function renderWithRouterAndLanguage(ui: React.ReactNode, initialLocale: Locale = "en") {
  localStorage.setItem("avrasya_preferred_language", initialLocale);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function LanguageToggleControls() {
    const { locale, setLocale } = useLanguage();
    return (
      <div data-testid="test-lang-controls">
        <span data-testid="active-locale">{locale}</span>
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            data-testid={`switch-to-${l.code}`}
            onClick={() => setLocale(l.code)}
          >
            Switch {l.code}
          </button>
        ))}
      </div>
    );
  }

  const rootRoute = createRootRoute({
    component: () => (
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <LanguageToggleControls />
          {ui}
          <Outlet />
        </LanguageProvider>
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
    "/privacy",
    "/terms",
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

describe("Customer-Facing Website — Full 7-Language Localization & Animation Re-Sync", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
  });

  it("1. Header & Footer dynamically translate navigation items, CTAs, pre-footer band, and footer columns across all 7 languages", async () => {
    renderWithRouterAndLanguage(
      <>
        <Header />
        <Footer />
      </>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByTestId("active-locale")).toHaveTextContent("en");
    });

    const nonEnglishLocales: Locale[] = ["tr", "ar", "ru", "fa", "zh", "bn"];
    for (const loc of nonEnglishLocales) {
      fireEvent.click(screen.getByTestId(`switch-to-${loc}`));
      const dict = TRANSLATIONS[loc];

      await waitFor(() => {
        expect(screen.getByTestId("active-locale")).toHaveTextContent(loc);
      });

      // Nav links should be translated into target language
      expect(screen.getAllByText(dict.nav.properties).length).toBeGreaterThan(0);
      expect(screen.getAllByText(dict.nav.services).length).toBeGreaterThan(0);
      expect(screen.getAllByText(dict.nav.citizenship).length).toBeGreaterThan(0);
      expect(screen.getAllByText(dict.nav.about).length).toBeGreaterThan(0);
      expect(screen.getAllByText(dict.nav.contact).length).toBeGreaterThan(0);

      // Footer headings should be translated
      expect(screen.getAllByText(dict.footer.quickLinks).length).toBeGreaterThan(0);
      expect(screen.getAllByText(dict.footer.explore).length).toBeGreaterThan(0);
      expect(screen.getAllByText(dict.footer.contactInfo).length).toBeGreaterThan(0);

      // Built by Zarif tag remains present
      expect(screen.getByText(/Built by Zarif/i)).toBeInTheDocument();
    }
  });

  it("2. CaldrenHeroSection & BildoraAboutSection translate content and re-sync word/char animations when switching languages", async () => {
    const { container } = renderWithRouterAndLanguage(
      <>
        <CaldrenHeroSection
          settings={DEFAULT_SITE_SETTINGS}
          contact={{
            company: DEFAULT_SITE_SETTINGS.companyName,
            phone: DEFAULT_SITE_SETTINGS.phone,
            phoneHref: "tel:+905459248042",
            email: DEFAULT_SITE_SETTINGS.email,
            whatsapp: DEFAULT_SITE_SETTINGS.whatsapp,
            address: DEFAULT_SITE_SETTINGS.officeAddress,
            advisoryHours: DEFAULT_SITE_SETTINGS.advisoryHours,
          }}
        />
        <BildoraAboutSection />
      </>,
      "en",
    );

    await waitFor(() => {
      expect(container.querySelectorAll("[data-hero-word]").length).toBeGreaterThan(0);
    });

    // Switch to Turkish
    fireEvent.click(screen.getByTestId("switch-to-tr"));
    await waitFor(() => {
      expect(screen.getByTestId("active-locale")).toHaveTextContent("tr");
    });

    const heroHeadingTr = container.querySelector('[data-framer-name="Hero"] h1');
    expect(heroHeadingTr?.textContent).not.toContain("Curated Offers & Developments in Istanbul.");
    expect(heroHeadingTr?.textContent).toContain(TRANSLATIONS.tr.home.heroTitle);

    const aboutSection = container.querySelector('[data-framer-name="About us"]');
    expect(aboutSection?.textContent).not.toContain("Architectural Distinction & Enduring Heritage");
    expect(aboutSection?.textContent).toContain(TRANSLATIONS.tr.about.eyebrow);

    // Switch to Arabic (RTL)
    fireEvent.click(screen.getByTestId("switch-to-ar"));
    await waitFor(() => {
      expect(screen.getByTestId("active-locale")).toHaveTextContent("ar");
      expect(document.documentElement.dir).toBe("rtl");
    });

    const heroHeadingAr = container.querySelector('[data-framer-name="Hero"] h1');
    expect(heroHeadingAr?.textContent).toContain(TRANSLATIONS.ar.home.heroTitle);
    const heroWordsAr = container.querySelectorAll("[data-hero-word]");
    expect(heroWordsAr.length).toBeGreaterThan(0);
  });

  it("3. ServicesProcessTimeline & BildoraServicesTimeline translate badges, steps, and CTAs across all 7 languages", async () => {
    const { container } = renderWithRouterAndLanguage(
      <>
        <ServicesProcessTimeline showHomepageHighlightActions={true} />
        <BildoraServicesTimeline />
      </>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByTestId("active-locale")).toHaveTextContent("en");
    });

    for (const loc of ["tr", "ar", "ru", "fa", "zh", "bn"] as Locale[]) {
      fireEvent.click(screen.getByTestId(`switch-to-${loc}`));
      await waitFor(() => {
        expect(screen.getByTestId("active-locale")).toHaveTextContent(loc);
      });

      const dict = TRANSLATIONS[loc];
      // Step 01 title from ServicesProcessTimeline
      expect(screen.getAllByText(dict.services.parts[0]!.steps[0]!.title).length).toBeGreaterThan(
        0,
      );

      // BildoraServicesTimeline should not leave English "Built on Values. Driven by Quality." when locale !== "en"
      expect(container.textContent).not.toContain("Built on Values. Driven by Quality.");
    }
  });

  it("4. RegionShowcase, BildoraProjectsShowcase, PartnersSection, CaldrenLocationsSection, and CaldrenSkyCtaSection localize cleanly", async () => {
    const { container } = renderWithRouterAndLanguage(
      <>
        <RegionShowcase
          regions={DEFAULT_REGIONS}
          properties={properties}
          title={TRANSLATIONS.en.home.regionsTitle}
          subtitle={TRANSLATIONS.en.home.regionsSubtitle}
          eyebrow={TRANSLATIONS.en.home.regionsEyebrow}
        />
        <BildoraProjectsShowcase properties={properties} />
        <PartnersSection partners={DEFAULT_SITE_SETTINGS.partners} />
        <CaldrenLocationsSection />
        <CaldrenSkyCtaSection />
      </>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByTestId("active-locale")).toHaveTextContent("en");
    });

    fireEvent.click(screen.getByTestId("switch-to-ru"));
    await waitFor(() => {
      expect(screen.getByTestId("active-locale")).toHaveTextContent("ru");
    });

    // Should not show default English headings when switched to Russian
    expect(container.textContent).not.toContain("Built with Purpose. Made to Last.");
    expect(container.textContent).not.toContain("References and Partners");
    expect(container.textContent).not.toContain("Let’s find your");
  });

  it("5. Standalone customer pages (/about, /services, /citizenship, /why-turkiye, /contact) localize when switching languages", async () => {
    const { container } = renderWithRouterAndLanguage(
      <>
        <AboutPage />
        <ServicesPage />
        <CitizenshipPage />
        <WhyTurkiye />
        <ContactPage />
      </>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByTestId("active-locale")).toHaveTextContent("en");
    });

    fireEvent.click(screen.getByTestId("switch-to-zh"));
    await waitFor(() => {
      expect(screen.getByTestId("active-locale")).toHaveTextContent("zh");
    });

    // About page should not keep English "More than buildings," when locale is Chinese
    expect(container.textContent).not.toContain("More than buildings,");
    expect(container.textContent).toContain(TRANSLATIONS.zh.citizenship.title);
    expect(container.textContent).toContain(TRANSLATIONS.zh.whyTurkiye.title);
    expect(container.textContent).toContain(TRANSLATIONS.zh.contact.title);
  });
});
