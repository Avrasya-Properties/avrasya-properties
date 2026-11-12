import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  properties,
  filterProperties,
  getPropertyMedia,
  IMAGE_CATEGORIES,
  PROPERTY_CATEGORIES,
  DEFAULT_AMENITY_CATALOG,
  type PropertyRecord,
  type GalleryItem,
  type FloorPlanItem,
  type PropertyDocumentItem,
} from "@/data/properties";
import { normalizeRegions, defaultRegions } from "@/data/regions";
import { listingPreview } from "@/admin/listing-preview";
import { PropertyDetails } from "@/components/site/PropertyDetails";
import { LanguageProvider } from "@/hooks/useLanguage";
import { DEFAULT_SITE_SETTINGS, type Property } from "@/admin/demo";

let mockPathname = "/properties";
let mockSearch: Record<string, unknown> = {};

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: Record<string, unknown>) => ({
    options,
    useSearch: () => mockSearch,
    useParams: () => ({ id: "prop-1", slug: "rams-park-house-maslak-1-1xs" }),
    fullPath: mockPathname,
  }),
  useNavigate: () => (opts: { search?: unknown }) => {
    if (typeof opts?.search === "function") {
      mockSearch = opts.search(mockSearch);
    } else if (opts?.search && typeof opts.search === "object") {
      mockSearch = opts.search as Record<string, unknown>;
    }
  },
  useRouterState: ({ select }: { select?: (s: unknown) => unknown } = {}) => {
    const state = {
      location: {
        pathname: mockPathname,
        search: mockSearch,
      },
    };
    return select ? select(state) : state;
  },
  Link: ({
    to,
    params,
    children,
    onClick,
    className,
    "aria-label": ariaLabel,
    ...rest
  }: Record<string, unknown>) => {
    const resolvedHref =
      typeof to === "string" && (params as Record<string, string> | undefined)?.["slug"]
        ? to.replace("$slug", (params as Record<string, string>)["slug"]!)
        : typeof to === "string" && (params as Record<string, string> | undefined)?.["id"]
          ? to.replace("$id", (params as Record<string, string>)["id"]!)
          : String(to || "#");
    return (
      <a
        href={resolvedHref}
        onClick={(e) => {
          e.preventDefault();
          (onClick as ((e: React.MouseEvent) => void) | undefined)?.(e);
        }}
        className={className as string}
        aria-label={ariaLabel as string}
        {...rest}
      >
        {children as React.ReactNode}
      </a>
    );
  },
}));

describe("Avrasya Complete Real Estate Inventory, Property, Region & Development System", () => {
  let queryClient: QueryClient;

  function renderWithProviders(ui: React.ReactElement) {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>{ui}</LanguageProvider>
      </QueryClientProvider>,
    );
  }

  beforeEach(() => {
    mockPathname = "/properties";
    mockSearch = {};
    document.body.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
  });

  // =========================================================================
  // 1. Property Classifications, Categories, Image Categories & Amenity Catalog
  // =========================================================================
  describe("1. Property Classifications, Image Categories & Configurable Amenities", () => {
    it("exports comprehensive property categories, 14+ image categories, and default amenity catalog", () => {
      expect(Array.isArray(PROPERTY_CATEGORIES)).toBe(true);
      expect(PROPERTY_CATEGORIES).toEqual(
        expect.arrayContaining([
          "Apartment",
          "Villa",
          "Penthouse",
          "Duplex",
          "Commercial property",
          "Office",
          "Land",
        ]),
      );

      expect(Array.isArray(IMAGE_CATEGORIES)).toBe(true);
      expect(IMAGE_CATEGORIES).toEqual(
        expect.arrayContaining([
          "Exterior",
          "Interior",
          "Living room",
          "Bedroom",
          "Kitchen",
          "Bathroom",
          "Balcony",
          "Terrace",
          "Garden",
          "Swimming pool",
          "Building facilities",
          "Views",
          "Neighborhood",
          "Construction progress",
        ]),
      );

      expect(Array.isArray(DEFAULT_AMENITY_CATALOG)).toBe(true);
      expect(DEFAULT_AMENITY_CATALOG.length).toBeGreaterThanOrEqual(14);
    });
  });

  // =========================================================================
  // 2. Multi-Image Categorized Gallery, Multiple Floor Plans & Document Privacy
  // =========================================================================
  describe("2. Structured Multi-Image Gallery, Multiple Floor Plans & Document Privacy", () => {
    it("migrates legacy single cover + gallery strings into structured GalleryItems and syncs primary cover", () => {
      const sample: Property = {
        id: "test-prop-1",
        ref: "AVR-2001",
        slug: "bosphorus-villa-2001",
        title: "Bosphorus Sovereign Villa",
        shortDescription: "Private waterfront estate in Bebek",
        description: "Full architectural dossier for Bosphorus Sovereign Villa.",
        district: "Beşiktaş",
        neighborhood: "Bebek",
        city: "Istanbul",
        type: "unit offer",
        propertyCategory: "Villa",
        layout: "5+2",
        bedrooms: 5,
        bathrooms: 6,
        livingRooms: 2,
        grossM2: 680,
        netM2: 540,
        areaM2: 850,
        amount: 4250000,
        originalPrice: 4500000,
        discountedPrice: 4250000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        priceBasis: "cash",
        availability: "Available",
        publication: "Published",
        featured: true,
        agentId: "u1",
        cover: "/images/properties/bosphorus-terrace.jpg",
        galleryImages: [
          "/images/properties/istanbul-project-01.jpg",
          "/images/properties/bosphorus-terrace.jpg",
          "/images/properties/master-suite.jpg",
        ],
        galleryItems: [
          {
            id: "img-1",
            url: "/images/properties/istanbul-project-01.jpg",
            category: "Exterior",
            caption: "Southern facade overlooking the strait",
            alt: "Villa exterior",
            isPrimary: false,
            sortOrder: 0,
          },
          {
            id: "img-2",
            url: "/images/properties/bosphorus-terrace.jpg",
            category: "Terrace",
            caption: "Private sunset terrace",
            alt: "Bosphorus terrace",
            isPrimary: true,
            sortOrder: 1,
          },
          {
            id: "img-3",
            url: "/images/properties/master-suite.jpg",
            category: "Bedroom",
            caption: "Primary suite with panoramic glass",
            alt: "Master bedroom",
            isPrimary: false,
            sortOrder: 2,
          },
        ],
        floorPlans: [
          {
            id: "fp-1",
            title: "Ground Floor Reception Layout",
            unitType: "5+2 Villa Ground",
            imageUrl: "/images/properties/gunesli-floorplan.jpg",
            pdfUrl: "/docs/ground-floor.pdf",
            areaM2: 340,
            bedrooms: 1,
            bathrooms: 2,
          },
          {
            id: "fp-2",
            title: "Upper Level Private Suites",
            unitType: "5+2 Villa Upper",
            imageUrl: "/images/properties/gunesli-floorplan.jpg",
            areaM2: 340,
            bedrooms: 4,
            bathrooms: 4,
          },
        ],
        documents: [
          {
            id: "doc-pub-1",
            title: "Architectural Investment Brochure",
            category: "Brochure",
            url: "https://example.com/brochure.pdf",
            fileType: "PDF",
            isPublic: true,
          },
          {
            id: "doc-priv-1",
            title: "Internal Title Deed Encumbrance Check",
            category: "Legal Internal",
            url: "https://example.com/internal-tapu.pdf",
            fileType: "PDF",
            isPublic: false,
          },
        ],
        specs: {
          floorNumber: 1,
          totalFloors: 3,
          balconyOrTerrace: "Panoramic Bosphorus Terrace (120 m²)",
          gardenOrOutdoor: "Private landscaped garden (300 m²)",
          parking: "Private 4-car underground garage",
          furnishingStatus: "Fully Furnished",
          constructionYear: 2025,
          completionStatus: "Ready",
          propertyCondition: "New / Turnkey",
          heatingSystem: "Underfloor Geothermal & VRV",
          buildingAge: 0,
          viewType: "Bosphorus & Sea View",
          orientation: "South-East",
          energyClass: "A+",
        },
        coordinates: { lat: 41.0772, lng: 29.0436 },
        project: "Bebek Waterfront Estates",
        developer: "Avrasya Signature Developments",
        translations: {
          tr: {
            title: "Boğaziçi Egemen Villa",
            shortDescription: "Bebek'te özel yalı dairesi ve villa",
            description: "Boğaziçi Egemen Villa için tam mimari dosya.",
          },
          ar: {
            title: "فيلا البوسفور الملكية",
            shortDescription: "قصر خاص على الواجهة البحرية في بيبيك",
            description: "ملف معماري كامل لفيلا البوسفور الملكية.",
          },
        },
        updatedAt: new Date().toISOString(),
      };

      const record = listingPreview(sample);
      const media = getPropertyMedia(record);

      // Primary image must be the cover
      expect(media.cover).toBe("/images/properties/bosphorus-terrace.jpg");
      expect(media.gallery.length).toBeGreaterThanOrEqual(3);
      expect(media.galleryItems?.length).toBe(3);
      expect(media.galleryItems?.find((g: GalleryItem) => g.isPrimary)?.category).toBe("Terrace");

      // Multiple floor plans must be preserved
      expect(media.floorPlans?.length).toBe(2);
      expect(media.floorPlans?.[0]?.title).toBe("Ground Floor Reception Layout");
      expect(media.floorPlans?.[1]?.title).toBe("Upper Level Private Suites");

      // Private documents must NEVER be exposed in public PropertyRecord details
      const publicDocs = (record.details["documents"] as PropertyDocumentItem[] | undefined) ?? [];
      expect(publicDocs.length).toBe(1);
      expect(publicDocs[0]?.title).toBe("Architectural Investment Brochure");
      expect(publicDocs.some((d) => d.title.includes("Internal Title Deed"))).toBe(false);
    });
  });

  // =========================================================================
  // 3. Hierarchical Locations (Region -> City -> District -> Neighborhood)
  // =========================================================================
  describe("3. Hierarchical Location & Neighborhood Management", () => {
    it("normalizes regions with districtDetails, neighborhoods, gallery, and featured flag", () => {
      const raw = [
        {
          slug: "istanbul",
          name: "Istanbul",
          country: "Türkiye",
          summary: "Bosphorus metropolis",
          heroImage: "/images/properties/hero-main.jpg",
          gallery: ["/images/properties/istanbul-project-01.jpg"],
          featured: true,
          districts: ["Beşiktaş", "Şişli"],
          districtDetails: [
            {
              name: "Beşiktaş",
              description: "Historic Bosphorus shoreline district",
              neighborhoods: ["Bebek", "Etiler", "Levent", "Ortaköy"],
              nearbyFacilities: ["Zorlu Center", "Bebek Marina"],
              transportInfo: "M2 & M6 Metro + Bosphorus Ferry",
              lifestyleInfo: "Waterfront fine dining & marinas",
              coordinates: { lat: 41.0422, lng: 29.0067 },
            },
          ],
          hasSides: true,
          published: true,
          sortOrder: 0,
          seoTitle: "Istanbul Luxury Real Estate",
          seoDescription: "Prime properties in Istanbul",
        },
      ];

      const normalized = normalizeRegions(raw);
      expect(normalized.length).toBe(1);
      expect(normalized[0]?.featured).toBe(true);
      expect(normalized[0]?.gallery?.length).toBe(1);
      expect(normalized[0]?.districtDetails?.[0]?.name).toBe("Beşiktaş");
      expect(normalized[0]?.districtDetails?.[0]?.neighborhoods).toContain("Bebek");
    });
  });

  // =========================================================================
  // 4. Dynamic Search, Multi-Criteria Filtering & 7 Sort Modes
  // =========================================================================
  describe("4. Dynamic Search, Multi-Criteria Filtering & Sorting", () => {
    it("filters by reference ID, neighborhood, development, propertyCategory, minPrice, maxPrice, bedrooms, bathrooms, minArea, maxArea, availability, amenities, and completionStatus, and sorts by area/newest/featured", () => {
      const customCatalogue: PropertyRecord[] = [
        ...properties.slice(0, 2),
        {
          ...properties[0]!,
          id: "custom-villa-1",
          ref: "AVR-9001",
          slug: "bebek-villa-9001",
          marketing_title: "Bebek Waterfront Villa",
          city: "Istanbul",
          location_label: "Beşiktaş",
          side: "Europe",
          record_type: "unit_offer",
          layout_label: "5+2",
          bathrooms: 5,
          availability: "Available",
          availability_verified: true,
          price: {
            currency: "USD",
            amount: 3200000,
            basis: "cash",
            status: "staff-published",
          },
          areas: [{ value_m2: 520, basis: "gross" }],
          source_ids: [],
          details: {
            neighborhood: "Bebek",
            project: "Bebek Marina Estates",
            developer: "Avrasya Signature",
            property_category: "Villa",
            bedrooms: 5,
            completion_status: "Ready",
            featured: true,
            cbi_verified: true,
            highlights: ["Swimming pool", "Bosphorus view", "Private garden"],
            created_at: "2026-11-12T00:00:00.000Z",
          },
        },
      ];

      // Filter by Reference ID
      expect(filterProperties({ q: "AVR-9001" }, customCatalogue).length).toBe(1);

      // Filter by Neighborhood
      expect(filterProperties({ neighborhood: "Bebek" }, customCatalogue).length).toBe(1);

      // Filter by Development / Project
      expect(filterProperties({ project: "Bebek Marina Estates" }, customCatalogue).length).toBe(1);

      // Filter by Property Category
      expect(filterProperties({ category: "Villa" }, customCatalogue).length).toBe(1);

      // Filter by Min/Max Price
      expect(
        filterProperties({ minPrice: 2000000, maxPrice: 4000000 }, customCatalogue).length,
      ).toBe(1);

      // Filter by Bedrooms & Bathrooms
      expect(filterProperties({ bedrooms: 5, bathrooms: 5 }, customCatalogue).length).toBe(1);

      // Filter by Min/Max Area
      expect(filterProperties({ minArea: 400, maxArea: 600 }, customCatalogue).length).toBe(1);

      // Filter by Amenities
      expect(
        filterProperties({ amenities: ["Swimming pool", "Bosphorus view"] }, customCatalogue)
          .length,
      ).toBe(1);

      // Filter by Completion Status
      expect(filterProperties({ completionStatus: "Ready" }, customCatalogue).length).toBe(1);

      // Sort by Area Descending
      const sortedByArea = filterProperties({ sort: "area-desc" }, customCatalogue);
      expect(sortedByArea[0]?.slug).toBe("bebek-villa-9001");

      // Sort by Featured
      const sortedByFeatured = filterProperties({ sort: "featured" }, customCatalogue);
      expect(sortedByFeatured[0]?.slug).toBe("bebek-villa-9001");
    });
  });

  // =========================================================================
  // 5. 14-Section Property Detail Page Experience
  // =========================================================================
  describe("5. Comprehensive 14-Section Property Detail Page", () => {
    it("renders categorized gallery filter pills, multiple floor plans, specifications, public documents, map coordinates, and smart related properties while hiding private documents", () => {
      const sample: Property = {
        id: "detail-prop-1",
        ref: "AVR-777",
        slug: "nisantasi-sovereign-penthouse",
        title: "Nişantaşı Sovereign Penthouse",
        shortDescription: "Duplex sky residence with Bosphorus panorama",
        description: "Architectural penthouse in the heart of Nişantaşı luxury district.",
        district: "Şişli",
        neighborhood: "Nişantaşı",
        city: "Istanbul",
        type: "unit offer",
        propertyCategory: "Penthouse",
        layout: "4+1 Duplex",
        bedrooms: 4,
        bathrooms: 4,
        grossM2: 320,
        netM2: 265,
        areaM2: null,
        amount: 1850000,
        originalPrice: 1990000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        priceBasis: "cash",
        availability: "Available",
        publication: "Published",
        featured: true,
        cbiEligible: true,
        agentId: "u1",
        cover: "/images/properties/ferikoy-duplex.jpg",
        galleryItems: [
          {
            id: "g1",
            url: "/images/properties/ferikoy-duplex.jpg",
            category: "Exterior",
            caption: "Penthouse terrace facade",
            alt: "Penthouse exterior",
            isPrimary: true,
            sortOrder: 0,
          },
          {
            id: "g2",
            url: "/images/properties/master-suite.jpg",
            category: "Bedroom",
            caption: "Master bedroom suite",
            alt: "Master bedroom",
            isPrimary: false,
            sortOrder: 1,
          },
        ],
        floorPlans: [
          {
            id: "fp1",
            title: "Lower Reception Level",
            unitType: "4+1 Lower",
            imageUrl: "/images/properties/gunesli-floorplan.jpg",
            areaM2: 180,
          },
          {
            id: "fp2",
            title: "Upper Penthouse Terrace Level",
            unitType: "4+1 Upper",
            imageUrl: "/images/properties/gunesli-floorplan.jpg",
            areaM2: 140,
          },
        ],
        documents: [
          {
            id: "d1",
            title: "Nişantaşı Penthouse Executive Dossier.pdf",
            category: "Brochure",
            url: "https://example.com/penthouse-dossier.pdf",
            fileType: "PDF",
            isPublic: true,
          },
          {
            id: "d2",
            title: "Private Seller Commission Agreement.pdf",
            category: "Internal",
            url: "https://example.com/private-commission.pdf",
            fileType: "PDF",
            isPublic: false,
          },
        ],
        specs: {
          floorNumber: 18,
          totalFloors: 18,
          furnishingStatus: "Designer Turnkey",
          completionStatus: "Ready",
          heatingSystem: "Underfloor VRV",
          viewType: "Bosphorus & Skyline",
          parking: "2 Underground Spaces",
        },
        coordinates: { lat: 41.0522, lng: 28.9935 },
        project: "Nişantaşı Crown Residences",
        developer: "Avrasya Signature",
        highlights: ["Private Terrace", "Smart Home", "24/7 Security", "Concierge"],
        updatedAt: new Date().toISOString(),
      };

      const record = listingPreview(sample);
      renderWithProviders(<PropertyDetails r={record} preview />);

      // 1. Title, Reference & Breadcrumb Neighborhood
      expect(
        screen.getByRole("heading", { level: 1, name: /Nişantaşı Sovereign Penthouse/i }),
      ).toBeInTheDocument();
      expect(screen.getAllByText(/AVR-777/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Nişantaşı/i).length).toBeGreaterThan(0);

      // 2. Categorized Gallery Filter Tabs
      expect(screen.getByRole("button", { name: /Exterior/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Bedroom/i })).toBeInTheDocument();

      // 3. Multiple Floor Plans
      expect(screen.getByText(/Lower Reception Level/i)).toBeInTheDocument();
      expect(screen.getByText(/Upper Penthouse Terrace Level/i)).toBeInTheDocument();

      // 4. Flexible Specifications
      expect(screen.getByText(/Designer Turnkey/i)).toBeInTheDocument();
      expect(screen.getByText(/Bosphorus & Skyline/i)).toBeInTheDocument();

      // 5. Public Documents visible, Private Documents hidden
      expect(screen.getByText(/Nişantaşı Penthouse Executive Dossier\.pdf/i)).toBeInTheDocument();
      expect(screen.queryByText(/Private Seller Commission Agreement/i)).toBeNull();
    });
  });
});
