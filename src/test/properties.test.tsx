import { describe, expect, it } from "vitest";
import {
  comparableUsd,
  filterProperties,
  getProperty,
  priceDisplay,
  properties,
} from "@/data/properties";

describe("property rules", () => {
  it("has 18 source records and one Oryapark 2+1", () => {
    expect(properties).toHaveLength(18);
    expect(properties.filter((p) => p.slug.startsWith("oryapark-2-1"))).toHaveLength(1);
  });
  it("labels package prices as totals", () => {
    expect(priceDisplay(getProperty("topkapi-two-apartment-package-480")!.price).note).toMatch(
      /Package total/,
    );
  });
  it("excludes TRY, unresolved and on-request prices from budget matching", () => {
    for (const s of [
      "gunesli-2-1-installment",
      "gunesli-400-offer",
      "oryapark-2-1-quote",
      "turkerler-ciftci-towers",
    ])
      expect(comparableUsd(getProperty(s)!.price)).toBeNull();
    expect(
      filterProperties({ budget: "300-450" }).some((r) => r.slug === "gunesli-400-offer"),
    ).toBe(false);
  });
  it("puts unpriced records last when sorting by price", () => {
    const l = filterProperties({ sort: "price-asc" });
    expect(l[0]!.price.amount).toBe(182000);
    expect(comparableUsd(l.at(-1)!.price)).toBeNull();
  });
  it("ground-floor Şişli unit has no delivery date", () => {
    expect(getProperty("sisli-1-1-july-2027-488")!.details.delivery_source ?? null).toBeNull();
    expect(getProperty("sisli-block5-floor2-unit21-497")!.details.delivery_source).toBe(
      "August 2027",
    );
  });
  it("getLiveProperties returns all 18 source records on SSR/default state", () => {
    expect(properties).toHaveLength(18);
    const live = filterProperties({});
    expect(live.length).toBeGreaterThanOrEqual(18);
  });
});
