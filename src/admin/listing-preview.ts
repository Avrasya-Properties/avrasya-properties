import type { Property } from "./demo";
import type { Row } from "./mappers";
import type { PropertyRecord, Price, RecordType, Area } from "@/data/properties";

// Use the same editable fields and source price rules as save_offer's public snapshot.
export function listingPreview(p: Property, raw?: Row): PropertyRecord {
  const source = (raw?.["source_record"] || {}) as Row;
  const details = {
    ...((source["details"] || {}) as Row),
    ...(((raw?.["published_snapshot"] as Row | undefined)?.["details"] || {}) as Row),
  };
  const oldPrice = (source["price"] || {}) as Price;
  const basis = p.priceBasis || "advertised";
  const sourcePrice = !raw || basis === raw["price_basis"] ? oldPrice : ({} as Price);
  const areas: Area[] = [];
  if (p.grossM2 !== null) areas.push({ value_m2: p.grossM2, basis: "gross" });
  if (p.netM2 !== null) areas.push({ value_m2: p.netM2, basis: "net" });
  if (p.areaM2 !== null) areas.push({ value_m2: p.areaM2, basis: "unspecified" });

  const galleryItems = Array.isArray(p.galleryItems) ? p.galleryItems : [];
  const primaryCover =
    galleryItems.find((g) => g.isPrimary)?.url || p.cover || galleryItems[0]?.url || null;
  const galleryImages =
    galleryItems.length > 0
      ? [...new Set([primaryCover || "", ...galleryItems.map((g) => g.url)].filter(Boolean))]
      : p.galleryImages || [];

  const floorPlans = Array.isArray(p.floorPlans) ? p.floorPlans : [];
  const floorPlan = floorPlans[0]?.imageUrl || p.floorPlan || null;

  // Strictly filter out private/internal documents from public PropertyRecord details
  const publicDocuments = Array.isArray(p.documents)
    ? p.documents.filter((d) => d && d.isPublic === true)
    : [];

  return {
    id: p.id,
    ref: p.ref,
    slug: p.slug,
    marketing_title: p.title,
    city: p.city,
    location_label: p.district || null,
    side: p.side || "unknown",
    record_type: p.type.replaceAll(" ", "_") as RecordType,
    mode: p.mode,
    layout_label: p.layout || null,
    bathrooms: p.bathrooms,
    tapu_status: p.tapuStatus || null,
    source_note: p.sourceNote || null,
    price: {
      ...sourcePrice,
      amount: p.amount,
      currency: p.currency,
      ...(p.originalPrice != null ? { previous_advertised_amount: p.originalPrice } : {}),
      ...(p.paymentPlan?.downPaymentAmount != null
        ? { down_payment_amount: p.paymentPlan.downPaymentAmount }
        : {}),
      ...(p.paymentPlan?.downPaymentPercent != null
        ? { down_payment_percent: p.paymentPlan.downPaymentPercent }
        : {}),
      ...(p.paymentPlan?.installmentAmount != null
        ? { installment_amount: p.paymentPlan.installmentAmount }
        : {}),
      ...(p.paymentPlan?.installmentMonths != null
        ? { installment_count: p.paymentPlan.installmentMonths }
        : {}),
      basis:
        p.priceType === "on-request" || p.priceVisibility === "on-request"
          ? "on_request"
          : p.priceType === "from" && basis === "advertised"
            ? "from"
            : basis,
      status: "staff-published",
    },
    areas,
    source_ids: Array.isArray(source["source_ids"]) ? (source["source_ids"] as string[]) : [],
    cover: primaryCover,
    availability: p.availability,
    availability_verified: p.availability === "Available",
    details: {
      ...details,
      project: p.project,
      developer: p.developer || details["developer"] || "",
      neighborhood: p.neighborhood || details["neighborhood"] || "",
      property_category: p.propertyCategory || details["property_category"] || "",
      short_description: p.shortDescription || details["short_description"] || "",
      note: p.description,
      address: p.address || details["address"] || "",
      coordinates: p.coordinates ?? details["coordinates"] ?? null,
      featured: p.featured === true,
      bedrooms: p.bedrooms ?? details["bedrooms"] ?? null,
      living_rooms: p.livingRooms ?? details["living_rooms"] ?? null,
      original_price: p.originalPrice ?? null,
      discounted_price: p.discountedPrice ?? null,
      rental_price: p.rentalPrice ?? null,
      price_per_m2: p.pricePerM2 ?? null,
      price_visibility: p.priceVisibility ?? "show",
      payment_plan: p.paymentPlan ?? details["payment_plan"] ?? {},
      specs: p.specs ?? details["specs"] ?? {},
      completion_status: p.specs?.completionStatus ?? details["completion_status"] ?? "",
      cbi_verified: p.cbiEligible === true,
      claims_requiring_confirmation: Array.isArray(raw?.["claims_requiring_confirmation"])
        ? (raw!["claims_requiring_confirmation"] as string[])
        : [],
      gallery_images: galleryImages,
      gallery_items: galleryItems,
      floor_plan: floorPlan,
      floor_plans: floorPlans,
      documents: publicDocuments,
      virtual_tour_url: p.virtualTourUrl || details["virtual_tour_url"] || "",
      video_url: p.videoUrl || details["video_url"] || "",
      model_3d_url: p.model3dUrl || details["model_3d_url"] || "",
      translations: p.translations ?? details["translations"] ?? {},
      highlights: p.highlights || [],
      created_at: p.createdAt || details["created_at"] || p.updatedAt,
      updated_at: p.updatedAt,
    },
  };
}
