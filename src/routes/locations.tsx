import { ManagedPage } from "@/components/site/ManagedPage";
import { createFileRoute } from "@tanstack/react-router";
import { meta } from "@/components/site/TextPage";
import { useCatalogue } from "@/data/live";
import { CaldrenLocationsSection } from "@/components/site/CaldrenLocationsSection";

export const Route = createFileRoute("/locations")({
  head: () =>
    meta(
      "Prime Türkiye Locations & Investment Regions · Avrasya Properties",
      "Explore Istanbul, Bodrum, Antalya, and Sakarya prime real estate markets, neighborhood metrics, average price/m², and freehold residences.",
      { canonical: "https://avrasyaproperties.com/locations" },
    ),
  component: () => (
    <ManagedPage slug="locations">
      <LocationsPage />
    </ManagedPage>
  ),
});

function LocationsPage() {
  const catalogue = useCatalogue();

  return (
    <div className="min-h-screen bg-background">
      <CaldrenLocationsSection properties={catalogue.properties} />
    </div>
  );
}

export default LocationsPage;
