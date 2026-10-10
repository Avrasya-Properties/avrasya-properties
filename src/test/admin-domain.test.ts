import { describe, expect, it } from "vitest";
import { contactMatch, exactBudget, istanbulDateTime, validateDealSelection, validateWorkspace } from "@/admin/domain.js";
import type { Deal, Property } from "@/admin/store";

const property = (patch: Partial<Property> = {}): Property => ({
  id: "p1", ref: "AVR-1001", slug: "test-unit", title: "Test unit", district: "Üsküdar", city: "Istanbul",
  type: "unit offer", layout: null, bathrooms: null, grossM2: null, netM2: null, areaM2: null,
  amount: 420000, currency: "USD", mode: "sale", priceType: "fixed", availability: "Available",
  publication: "Draft", agentId: "u1", cover: null, description: "", project: "", updatedAt: "2026-10-10T09:00:00Z", ...patch,
});
const deal = (patch: Partial<Deal> = {}): Deal => ({
  id: "d1", title: "Test agreement", contactId: "c1", propertyIds: ["p1"], agentId: "u1",
  stage: "Offer Accepted", amount: 420000, currency: "USD", expectedClose: null, ...patch,
});

describe("contact identity and budgets", () => {
  it("does not match unrelated contacts with empty details", () => {
    expect(contactMatch({ email: "", phone: "" }, { email: "", phone: "" })).toBe(false);
  });
  it("normalizes email and phone formats", () => {
    expect(contactMatch({ email: " CLIENT@EXAMPLE.TEST ", phone: "" }, { email: "client@example.test", phone: "" })).toBe(true);
    expect(contactMatch({ email: "", phone: "+90 555 010 0001" }, { email: "", phone: "+905550100001" })).toBe(true);
  });
  it.each([["USD 420,000", 420000, "USD"], ["€ 500,000.25", 500000.25, "EUR"], ["TRY 15,000,000", 15000000, "TRY"], ["GBP 250000", 250000, "GBP"]])("reads exact %s", (value, amount, currency) => {
    expect(exactBudget(String(value))).toEqual({ amount, currency });
  });
  it.each(["400–500k", "$400,000–500,000", "420000", "around USD 420,000", "USD 400k", "TRY 1.500.000"])("preserves ambiguous %s as notes", (value) => {
    expect(exactBudget(value)).toBeNull();
  });
});

describe("Istanbul scheduling", () => {
  it("converts wall time independently of the operator browser timezone", () => {
    expect(istanbulDateTime("2026-10-11T10:30")).toBe("2026-10-11T07:30:00.000Z");
  });
  it.each(["2026-02-30T10:30", "2026-10-11", "invalid", "2026-10-11T25:00"])("rejects %s", (value) => {
    expect(() => istanbulDateTime(value)).toThrow();
  });
});

describe("transaction unit validation", () => {
  it("requires actual selected units and a positive agreed amount", () => {
    expect(() => validateDealSelection(deal({ propertyIds: [] }), [property()], [])).toThrow();
    expect(() => validateDealSelection(deal({ amount: null }), [property()], [])).toThrow();
    expect(() => validateDealSelection(deal({ amount: 0 }), [property()], [])).toThrow();
  });
  it("rejects packages, unresolved source claims and unavailable units", () => {
    for (const patch of [{ type: "packaged offer" }, { sourceNote: "Price needs confirmation" }, { availability: "Unknown" as const }, { availability: "Sold" as const }]) {
      expect(() => validateDealSelection(deal(), [property(patch)], [])).toThrow();
    }
  });
  it("rejects duplicate selections and another active reservation", () => {
    expect(() => validateDealSelection(deal({ propertyIds: ["p1", "p1"] }), [property()], [])).toThrow();
    expect(() => validateDealSelection(deal(), [property()], [deal({ id: "d2", stage: "Reserved" })])).toThrow();
  });
  it("returns only purchased units, not unrelated inventory", () => {
    const selected = property();
    expect(validateDealSelection(deal(), [selected, property({ id: "p2" })], [])).toEqual([selected]);
  });
});

describe("backup validation", () => {
  it("rejects unsupported versions and incomplete payloads", () => {
    expect(() => validateWorkspace({ schemaVersion: 99, data: {} })).toThrow(/version/);
    expect(() => validateWorkspace({ properties: [] })).toThrow(/array/);
    expect(() => validateWorkspace(null)).toThrow();
  });
});
