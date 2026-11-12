import { ManagedPage } from "@/components/site/ManagedPage";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "@/hooks/useLanguage";
import { type PropertyRecord } from "@/data/properties";
import { MotionRoot } from "@/components/site/Motion";
import { meta } from "@/components/site/TextPage";
import { useCatalogue, loadPublicSettings } from "@/data/live";
import { useSiteSettings } from "@/admin/store";
import {
  allDistricts,
  publicRegions,
  regionForCity,
  sameCity,
  slugifyRegion,
  type Region,
} from "@/data/regions";
import { CaldrenHeroSection } from "@/components/site/CaldrenHeroSection";
import { BildoraAboutSection } from "@/components/site/BildoraAboutSection";
import { ServicesProcessTimeline } from "@/components/site/ServicesProcessTimeline";
import { BildoraProjectsShowcase } from "@/components/site/BildoraProjectsShowcase";
import { RegionShowcase } from "@/components/site/RegionShowcase";
import { PartnersSection } from "@/components/site/PartnersSection";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    try {
      const settings = await context.queryClient.ensureQueryData({
        queryKey: ["site-settings"],
        queryFn: loadPublicSettings,
        staleTime: 60000,
      });
      return { settings };
    } catch {
      return { settings: null };
    }
  },
  head: ({ loaderData }) => {
    const s = loaderData?.settings;
    const title =
      s?.siteTitle?.trim() ||
      "Avrasya Properties — Istanbul Luxury Real Estate & Investment Advisory";
    const desc =
      s?.metaDescription?.trim() ||
      "Istanbul property advisory for international buyers. Explore published property opportunities, independent legal review, and citizenship advisory services.";
    const canonical = s?.siteUrl?.trim() || "https://avrasyaproperties.com";
    const image =
      s?.ogImage?.trim() || "https://avrasyaproperties.com/images/properties/hero-main.jpg";
    const noindex = s?.indexingEnabled === false;
    return meta(title, desc, { canonical, image, noindex });
  },
  component: Home,
});

function Home() {
  const catalogue = useCatalogue();
  return (
    <>
      <HomeCollection
        properties={catalogue.properties}
        loading={catalogue.isPending}
        unavailable={catalogue.isError}
        retry={() => void catalogue.refetch()}
      />
      <MotionRoot />
    </>
  );
}

function HomeCollection({
  properties,
  loading,
  unavailable,
  retry,
}: {
  properties: PropertyRecord[];
  loading: boolean;
  unavailable: boolean;
  retry: () => void;
}) {
  const { t, locale } = useTranslation();
  const EDITORIAL = properties.slice(0, 6);
  const settings = useSiteSettings();
  const rawRegions = publicRegions(settings.regions);
  const propertyCities = Array.from(new Set(properties.map((p) => p.city).filter(Boolean)));
  const extraRegions: Region[] = propertyCities
    .filter((cityName) => !regionForCity(cityName, rawRegions))
    .map((cityName) => ({
      slug: slugifyRegion(cityName),
      name: cityName,
      country: "Türkiye",
      summary: "",
      heroImage: "",
      districts: Array.from(
        new Set(
          properties
            .filter((p) => sameCity(p.city, cityName))
            .map((p) => p.location_label)
            .filter((x): x is string => Boolean(x)),
        ),
      ),
      hasSides: false,
      published: true,
      sortOrder: 99,
      seoTitle: "",
      seoDescription: "",
    }));
  const regions = [...rawRegions, ...extraRegions];
  const derived = Array.from(
    new Set(
      properties
        .map((r) => r.location_label)
        .filter((x): x is string => !!x && x !== "Location to confirm"),
    ),
  );
  const LOCATIONS = allDistricts(regions).length
    ? allDistricts(regions)
    : settings.districts?.length
      ? settings.districts
      : derived;

  return (
    <div data-home-page>
      {/* IMAGE 1 – HERO SECTION (Caldren Architectural Hero) */}
      <CaldrenHeroSection
        settings={settings}
        locale={locale}
        t={t}
        featuredProperty={properties[0]}
      />

      {/* IMAGE 2 – AFTER HERO SECTION (Bildora About Us + 3D Cylinder Ring + 4 Metrics) */}
      <BildoraAboutSection propertyCount={properties.length} districtCount={LOCATIONS.length} />

      <ManagedPage slug="home" secondary>
        {null}
      </ManagedPage>

      {/* HIGHLIGHTED SERVICE SECTION (Transferred from Services Page: Turkish Citizenship in Just 4 steps) */}
      <ServicesProcessTimeline
        sectionTitle="Our Highlighted Service: Turkish Citizenship in Just 4 steps"
        sectionSubtitle={t.services.subtitle}
        showActionButtons={true}
      />

      {/* REGIONS SECTION (Restored: Istanbul, Antalya, Bodrum, Sakarya with sticky interactive photo preview) */}
      <RegionShowcase regions={regions} properties={properties} />

      {/* REFERENCE 3 – SECTION BEFORE THE FOOTER (Bildora Dark Projects Pinned Scroll Showcase) */}
      <div data-home-collection>
        {loading ? (
          <div
            role="status"
            className="container-site py-8 text-center text-sm text-muted-foreground"
          >
            {t.common.loading}
          </div>
        ) : unavailable ? (
          <div role="alert" className="container-site py-8 text-center">
            <p className="text-sm text-foreground">{t.common.error}</p>
            <button onClick={retry} className="btn btn-outline mt-3 text-xs">
              {t.common.retry}
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div
            data-empty-collection
            className="container-site py-6 text-center text-xs text-muted-foreground"
          >
            Curated property listings are being updated.
          </div>
        ) : null}

        <BildoraProjectsShowcase
          properties={properties}
          collectionHeading={
            typeof settings.websiteDesign?.["collectionHeading"] === "string" &&
            settings.websiteDesign["collectionHeading"].trim()
              ? (settings.websiteDesign["collectionHeading"] as string)
              : undefined
          }
        />

        <Link to="/calculator" className="sr-only">
          Investment Calculator
        </Link>
      </div>

      {/* PARTNERS & REFERENCES SECTION (White logos cycling left on primary Avrasya green background) */}
      <PartnersSection partners={settings.partners} />
    </div>
  );
}
