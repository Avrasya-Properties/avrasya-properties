import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider, useLanguage } from "@/hooks/useLanguage";
import { ThemeProvider } from "@/hooks/useTheme";
import { tr } from "@/i18n/locales/tr";
import { ar } from "@/i18n/locales/ar";
import { ru } from "@/i18n/locales/ru";
import { fa } from "@/i18n/locales/fa";
import { zh } from "@/i18n/locales/zh";
import { bn } from "@/i18n/locales/bn";
import { DEFAULT_SITE_SETTINGS } from "@/admin/demo";
import { properties } from "@/data/properties";
import { BildoraAboutSection } from "@/components/site/BildoraAboutSection";
import { BildoraServicesTimeline } from "@/components/site/BildoraServicesTimeline";
import { BildoraProjectsShowcase } from "@/components/site/BildoraProjectsShowcase";
import { ServicesProcessTimeline } from "@/components/site/ServicesProcessTimeline";
import { PartnersSection } from "@/components/site/PartnersSection";
import { CaldrenHeroSection } from "@/components/site/CaldrenHeroSection";
import { CaldrenSkyCtaSection } from "@/components/site/CaldrenSkyCtaSection";
import { PropertyCard } from "@/components/site/PropertyCard";
import { AboutPage } from "@/routes/about";
import { ThemeToggle } from "@/components/site/ThemeToggle";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
  useRouterState: ({ select }: { select?: (s: any) => any } = {}) => {
    const state = { location: { pathname: "/", search: {} } };
    return select ? select(state) : state;
  },
  useNavigate: () => vi.fn(),
  Link: ({ to, params, children, onClick, className, "aria-label": ariaLabel, ...rest }: any) => {
    const resolvedHref =
      typeof to === "string" && params?.slug ? to.replace("$slug", params.slug) : to;
    return (
      <a
        href={resolvedHref}
        onClick={(e) => {
          e.preventDefault();
          onClick?.(e);
        }}
        className={className}
        aria-label={ariaLabel}
        {...rest}
      >
        {children}
      </a>
    );
  },
}));

vi.mock("@/lib/supabase", () => ({
  DEMO_MODE: true,
  SUPABASE_URL: "https://mock.supabase.co",
}));

vi.mock("@/admin/store", () => ({
  useSiteSettings: () => ({
    ...DEFAULT_SITE_SETTINGS,
  }),
  useAdminAuth: () => ({ isAuthenticated: false, user: null }),
}));

vi.mock("@/data/live", () => ({
  useCatalogue: () => ({
    properties,
    data: properties,
    isLoading: false,
  }),
  useLiveSettings: () => ({
    ...DEFAULT_SITE_SETTINGS,
  }),
  useLiveRegions: () => [],
  useServices: () => ({
    data: undefined,
    isLoading: false,
  }),
}));

vi.mock("@/components/3d", () => ({
  LazyBuildingCanvas: () => <div data-testid="mock-3d-building" />,
  LazyPassportCanvas: () => <div data-testid="mock-3d-passport" />,
}));

function LocaleSwitchBar() {
  const { setLocale } = useLanguage();
  return (
    <div>
      <button onClick={() => setLocale("tr")}>set-tr</button>
      <button onClick={() => setLocale("ar")}>set-ar</button>
      <button onClick={() => setLocale("fa")}>set-fa</button>
      <button onClick={() => setLocale("ru")}>set-ru</button>
      <button onClick={() => setLocale("zh")}>set-zh</button>
      <button onClick={() => setLocale("bn")}>set-bn</button>
      <button onClick={() => setLocale("en")}>set-en</button>
    </div>
  );
}

function renderWithProviders(ui: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <LanguageProvider>
          <LocaleSwitchBar />
          {ui}
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

function expectHeading(expected: string) {
  const normalized = expected.replace(/\s+/g, " ").trim();
  const headings = screen.getAllByRole("heading");
  const texts = headings.map((h) => h.textContent?.replace(/\s+/g, " ").trim() ?? "");
  const squashed = texts.map((t) => (t || "").replace(/\s+/g, "")).join(" || ");
  expect(squashed).toContain(normalized.replace(/\s+/g, ""));
}

describe("Customer-facing Full Localization Coverage", () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
  });

  it("localizes BildoraAboutSection completely when switching languages", () => {
    localStorage.setItem("avrasya_preferred_language", "tr");
    renderWithProviders(<BildoraAboutSection />);

    expect(screen.getByText(tr.aboutSection.badge)).toBeInTheDocument();
    expectHeading(tr.aboutSection.heading);
    expect(screen.getByText(tr.aboutSection.metrics[0]!.label)).toBeInTheDocument();
    expect(screen.queryByText("About Us")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("set-ar"));
    expect(document.documentElement.dir).toBe("rtl");
    expect(screen.getByText(ar.aboutSection.badge)).toBeInTheDocument();
    expect(screen.getByText(ar.aboutSection.portfolioHeading)).toBeInTheDocument();
  });

  it("localizes CaldrenHeroSection across LTR and RTL locales", () => {
    localStorage.setItem("avrasya_preferred_language", "fa");
    renderWithProviders(<CaldrenHeroSection />);

    expect(document.documentElement.dir).toBe("rtl");
    expect(screen.getByText(fa.heroShowcase.topBar)).toBeInTheDocument();
    expect(screen.getAllByText(fa.heroShowcase.exploreProperties).length).toBeGreaterThan(0);
    expect(screen.getAllByText(fa.heroShowcase.discoverCta).length).toBeGreaterThan(0);
    expect(screen.queryByText("DISCOVER AVRASYA")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("set-zh"));
    expect(document.documentElement.dir).toBe("ltr");
    expect(screen.getAllByText(zh.heroShowcase.exploreProperties).length).toBeGreaterThan(0);
    expect(screen.getAllByText(zh.heroShowcase.discoverCta).length).toBeGreaterThan(0);
  });

  it("localizes BildoraServicesTimeline and ServicesProcessTimeline", () => {
    localStorage.setItem("avrasya_preferred_language", "bn");
    renderWithProviders(
      <>
        <BildoraServicesTimeline showDeliverables={true} showCtaFooter={true} services={[]} />
        <ServicesProcessTimeline showActionButtons={true} />
      </>,
    );

    expect(screen.getByText(bn.servicesUi.valuesBadge)).toBeInTheDocument();
    expectHeading(bn.servicesUi.valuesHeading);
    expect(screen.getByText(bn.servicesUi.scheduleConsultation)).toBeInTheDocument();
    expect(screen.getByText(bn.servicesUi.allServicesBtn)).toBeInTheDocument();
    expect(screen.queryByText("Our Values")).not.toBeInTheDocument();
    expect(screen.queryByText("All Services")).not.toBeInTheDocument();
  });

  it("localizes BildoraProjectsShowcase, PartnersSection, and CaldrenSkyCtaSection", () => {
    localStorage.setItem("avrasya_preferred_language", "ru");
    renderWithProviders(
      <>
        <BildoraProjectsShowcase />
        <PartnersSection />
        <CaldrenSkyCtaSection />
      </>,
    );

    expect(screen.getByText(ru.projectsShowcase.eyebrow)).toBeInTheDocument();
    expectHeading(ru.projectsShowcase.heading);
    expect(screen.getAllByText(ru.projectsShowcase.viewDossier).length).toBeGreaterThan(0);
    expect(screen.getByText(ru.partnersSection.heading)).toBeInTheDocument();
    expect(screen.getByText(ru.heroShowcase.skyCtaPrimary)).toBeInTheDocument();
    expect(screen.queryByText("View Residence Dossier")).not.toBeInTheDocument();
    expect(screen.queryByText("Partners & References")).not.toBeInTheDocument();
  });

  it("localizes AboutPage, PropertyCard, and ThemeToggle in non-English locales", () => {
    localStorage.setItem("avrasya_preferred_language", "tr");
    renderWithProviders(
      <>
        <AboutPage />
        <PropertyCard r={properties[0]!} />
        <ThemeToggle variant="navbar" />
      </>,
    );

    expect(screen.getByText(tr.aboutPageExtra.heroEyebrow)).toBeInTheDocument();
    expect(screen.getByText(tr.aboutPageExtra.coreValuesHeading)).toBeInTheDocument();
    expect(screen.getByText(tr.propertiesExtra.viewResidence)).toBeInTheDocument();
    expect(screen.getByText(tr.chrome.themeLight)).toBeInTheDocument();
    expect(screen.queryByText("View Residence")).not.toBeInTheDocument();
    expect(screen.queryByText("The Avrasya Approach.")).not.toBeInTheDocument();
  });

  it("localizes Header and Footer (Chrome) across LTR and RTL locales", async () => {
    const { Header, Footer } = await import("@/components/site/Chrome");
    const { ar } = await import("@/i18n/locales/ar");
    const { tr } = await import("@/i18n/locales/tr");

    renderWithProviders(
      <>
        <Header />
        <Footer />
      </>,
    );

    fireEvent.click(screen.getByText("set-ar"));
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("ar");
    expect(screen.getAllByText(ar.nav.properties).length).toBeGreaterThan(0);
    expect(screen.getAllByText(ar.nav.citizenship).length).toBeGreaterThan(0);
    expect(screen.getByText(ar.chrome.contactInfoTitle)).toBeInTheDocument();
    expect(screen.getByText(ar.heroShowcase.skyCtaPrimary)).toBeInTheDocument();
    expect(screen.getByText(/Built by Zarif/)).toBeInTheDocument();
    expect(screen.queryByText("Contact Info")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("set-tr"));
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("tr");
    expect(screen.getAllByText(tr.nav.properties).length).toBeGreaterThan(0);
    expect(screen.getByText(tr.chrome.contactInfoTitle)).toBeInTheDocument();
  });

  it("localizes AcquisitionCalculator, Enquiry, and BosphorusNavigator in non-English locales", async () => {
    const { AcquisitionCalculator } = await import("@/components/site/AcquisitionCalculator");
    const { Enquiry } = await import("@/components/site/Enquiry");
    const { BosphorusNavigator } = await import("@/components/site/BosphorusNavigator");
    const { fa } = await import("@/i18n/locales/fa");
    const { zh } = await import("@/i18n/locales/zh");

    renderWithProviders(
      <>
        <AcquisitionCalculator />
        <Enquiry />
        <BosphorusNavigator embedded />
      </>,
    );

    fireEvent.click(screen.getByText("set-fa"));
    expect(document.documentElement.dir).toBe("rtl");
    expect(screen.getByText(fa.calculatorExtra.presetsLabel)).toBeInTheDocument();
    expect(screen.getByText(fa.calculatorExtra.law4721Title)).toBeInTheDocument();
    expect(screen.getByText(fa.enquiryExtra.targetRegionLabel)).toBeInTheDocument();
    expect(screen.getByText(fa.enquiryExtra.reassuranceText)).toBeInTheDocument();
    expect(screen.getByText(fa.bosphorusAndWhyExtra.districtOverview)).toBeInTheDocument();
    expect(screen.queryByText("Presets:")).not.toBeInTheDocument();
    expect(screen.queryByText("Target Region / Destination in Türkiye")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("set-zh"));
    expect(document.documentElement.dir).toBe("ltr");
    expect(screen.getByText(zh.calculatorExtra.presetsLabel)).toBeInTheDocument();
    expect(screen.getByText(zh.enquiryExtra.targetRegionLabel)).toBeInTheDocument();
    expect(screen.getByText(zh.bosphorusAndWhyExtra.districtOverview)).toBeInTheDocument();
  });

  it("localizes PropertyDetails across LTR and RTL locales", async () => {
    const { PropertyDetails } = await import("@/components/site/PropertyDetails");
    const { ar } = await import("@/i18n/locales/ar");

    renderWithProviders(<PropertyDetails r={properties[0]!} preview />);

    fireEvent.click(screen.getByText("set-ar"));
    expect(document.documentElement.dir).toBe("rtl");
    expect(screen.getAllByText(ar.propertyDetail.share).length).toBeGreaterThan(0);
    expect(screen.getAllByText(ar.propertyDetail.save).length).toBeGreaterThan(0);
    expect(
      screen.getByText(ar.propertiesExtra.detail.locationConnectivityEyebrow),
    ).toBeInTheDocument();
    expect(screen.queryByText("Location & Connectivity")).not.toBeInTheDocument();
  });
});
