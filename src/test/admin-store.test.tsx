import { randomUUID } from "node:crypto";
import { act, render, renderHook, fireEvent, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as store from "@/admin/demo";
import { AdminSettingsPage } from "@/routes/admin.settings";
import type { Contact, Deal, Lead, Property, Task, Viewing } from "@/admin/demo";

const workspace = () => JSON.parse(localStorage.getItem("avrasya-admin-db-v4")!) as store.DB;
const signIn = (role: store.Role) => store.login(role + "@avrasya.test", store.DEMO_PASSWORD);
const addUnit = (patch: Partial<Property> = {}) => store.upsert<Property>("properties", {
  ref: "TEST-" + randomUUID(), slug: "test-" + randomUUID(), title: "Test unit", district: "Üsküdar",
  city: "Istanbul", type: "unit offer", layout: null, bathrooms: null, grossM2: null, netM2: null, areaM2: null,
  amount: 420000, currency: "USD", mode: "sale", priceType: "fixed", availability: "Available",
  publication: "Draft", agentId: "u3", cover: "/images/test.jpg", description: "", project: "",
  updatedAt: "2026-10-10T09:00:00Z", ...patch,
});
const addContact = () => store.upsert<Contact>("contacts", {
  name: "Test buyer", kind: "person", email: "buyer@example.test", phone: "", roles: ["buyer"],
  language: "", agentId: "u3", notes: "",
});
const addLead = (contactId: string, shortlist: string[] = []) => store.upsert<Lead>("leads", {
  contactId, source: "Phone", agentId: "u3", districts: "", layout: "", budgetMin: null, budgetMax: null,
  currency: "USD", stage: "Qualified", nextFollowUp: null, shortlist,
});
const prepareDeal = (mode: "sale" | "rent" = "sale") => {
  const purchased = addUnit({ mode }); const alternative = addUnit();
  const contact = addContact(); const lead = addLead(contact.id, [purchased.id, alternative.id]);
  const opportunity = store.convertLead(lead.id);
  store.upsert<Deal>("deals", { id: opportunity.id, propertyIds: [purchased.id], amount: 420000 });
  store.setDealStage(opportunity.id, "Offer Prepared");
  store.setDealStage(opportunity.id, "Offer Accepted");
  return { purchased, alternative, opportunity };
};

beforeEach(() => {
  vi.stubGlobal("crypto", { randomUUID });
  vi.stubEnv("VITE_ENABLE_ADMIN_DEMO", "true");
  signIn("admin"); store.resetData();
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("admin permissions and persistence", () => {
  it("gives React a new snapshot without mutating the old snapshot", () => {
    const { result } = renderHook(() => store.useDB()); const before = result.current;
    const property = before.properties[0]!;
    act(() => { store.upsert<Property>("properties", { id: property.id, description: "Updated description" }); });
    expect(result.current).not.toBe(before);
    expect(result.current.properties.find((p) => p.id === property.id)?.description).toBe("Updated description");
    expect(before.properties.find((p) => p.id === property.id)?.description).toBe(property.description);
  });
  it("blocks viewer settings, backups, imports, reset and manual inquiry entry", () => {
    signIn("viewer");
    for (const action of [() => store.updateSiteSettings({ companyName: "Changed" }), () => store.exportBackup(), () => store.importBackup("{}"), () => store.resetData(), () => store.createInquiry({ name: "Client", email: "", phone: "", topic: "Test", budget: "", message: "Inquiry", source: "Contact Brief" })]) {
      expect(action).toThrow(/role/);
    }
  });
  it("checks the stored owner even if a caller supplies their own ID", () => {
    signIn("agent");
    expect(() => store.upsert<Lead>("leads", { id: "l2", layout: "3+1" }, "u3")).toThrow();
    expect(() => store.upsert<Task>("tasks", { id: "t2", done: true })).toThrow();
    expect(() => store.upsert<Lead>("leads", { id: "l1", agentId: "u2" }, "u3")).toThrow();
    expect(workspace().leads.find((l) => l.id === "l2")?.layout).toBe("1+1");
  });
  it("rolls back in-memory data if browser storage cannot save", () => {
    const { result } = renderHook(() => store.useDB()); const before = result.current;
    const property = before.properties[0]!;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Quota exceeded", "QuotaExceededError"); });
    expect(() => store.upsert<Property>("properties", { id: property.id, description: "Cannot save" })).toThrow(/could not save/);
    expect(result.current.properties.find((p) => p.id === property.id)?.description).toBe(property.description);
  });
  it("validates every selected record before bulk publication", () => {
    const property = workspace().properties[0]!;
    expect(() => store.bulkPublication([property.id, "missing"], "Archived")).toThrow();
    expect(workspace().properties.find((p) => p.id === property.id)?.publication).toBe(property.publication);
  });
  it("validates backups before replacing data and round-trips valid exports", () => {
    const before = workspace();
    expect(() => store.importBackup(JSON.stringify({ ...before, contacts: [] }))).toThrow(/reference/);
    expect(workspace().contacts).toEqual(before.contacts);
    expect(store.importBackup(store.exportBackup())).toBe(true);
    expect(workspace()).toEqual(before);
  });
  it("preserves company settings exactly rather than silently rewriting them", () => {
    store.updateSiteSettings({ registeredEntity: "Client-confirmed entity", email: "info.avrasyaproperties@gmail.com" });
    expect(workspace().siteSettings.registeredEntity).toBe("Client-confirmed entity");
    expect(workspace().siteSettings.email).toBe("info.avrasyaproperties@gmail.com");
  });
  it("does not delete a different inquiry when the requested ID is missing", () => {
    const count = workspace().inquiries.length;
    expect(() => store.remove("inquiries", "missing")).toThrow(/not found/);
    expect(workspace().inquiries).toHaveLength(count);
  });
});

describe("inquiry to opportunity", () => {
  const inquiry = (patch: Partial<store.Inquiry> = {}) => store.createInquiry({
    name: "Test client", email: "", phone: "", topic: "Property advice", budget: "USD 420,000",
    message: "Please send details.", source: "Contact Brief", ...patch,
  });
  it("converts once, keeps explicit currency and maps public slugs to internal IDs", () => {
    const property = workspace().properties[0]!;
    const record = inquiry({ budget: "TRY 15,000,000", propertySlug: property.slug });
    const first = store.convertInquiryToLead(record.id); const second = store.convertInquiryToLead(record.id);
    expect(second.id).toBe(first.id); expect(first.budgetMin).toBeNull();
    expect(first.budgetMax).toBe(15000000); expect(first.currency).toBe("TRY");
    expect(first.shortlist).toEqual([property.id]);
    expect(workspace().leads.filter((lead) => lead.id === first.id)).toHaveLength(1);
    expect(workspace().inquiries.find((q) => q.id === record.id)?.status).toBe("New");
  });
  it("does not merge anonymous contact details or invent a numeric range", () => {
    const first = store.convertInquiryToLead(inquiry({ name: "First client", budget: "$400–500k" }).id);
    const second = store.convertInquiryToLead(inquiry({ name: "Second client" }).id);
    expect(first.contactId).not.toBe(second.contactId);
    expect(first.budgetMin).toBeNull(); expect(first.budgetMax).toBeNull();
    expect(workspace().contacts.find((contact) => contact.id === first.contactId)?.notes).toContain("$400–500k");
  });
  it("requires duplicate review when several contacts match", () => {
    const record = inquiry({ email: "amira.h@example.test" });
    expect(() => store.convertInquiryToLead(record.id)).toThrow(/duplicate review/);
  });
  it("archives instead of deleting and blocks archived conversion", () => {
    const record = inquiry(); store.remove("inquiries", record.id);
    expect(workspace().inquiries.find((q) => q.id === record.id)?.status).toBe("Archived");
    expect(() => store.convertInquiryToLead(record.id)).toThrow(/Restore/);
  });
  it("starts an opportunity with no purchased units and is idempotent", () => {
    const property = addUnit(); const contact = addContact(); const lead = addLead(contact.id, [property.id]);
    const first = store.convertLead(lead.id);
    expect(first.propertyIds).toEqual([]); expect(first.amount).toBeNull();
    expect(store.convertLead(lead.id).id).toBe(first.id);
  });
  it("rejects stage bypasses and invalid viewing dates", () => {
    expect(() => store.upsert<Lead>("leads", { id: "l1", stage: "Converted" })).toThrow(/Convert/);
    expect(() => store.upsert<Viewing>("viewings", { id: "v1", end: "2000-01-01T00:00:00Z" })).toThrow(/follow/);
  });
});

describe("deal transitions", () => {
  it.each(["sale", "rent"] as const)("completes only purchased units for a %s", (mode) => {
    const { purchased, alternative, opportunity } = prepareDeal(mode);
    store.setDealStage(opportunity.id, "Reserved"); store.setDealStage(opportunity.id, "Due Diligence");
    store.setDealStage(opportunity.id, "Contract"); store.setDealStage(opportunity.id, "Won");
    expect(workspace().properties.find((p) => p.id === purchased.id)?.availability).toBe(mode === "rent" ? "Rented" : "Sold");
    expect(workspace().properties.find((p) => p.id === alternative.id)?.availability).toBe("Available");
    expect(() => store.setDealStage(opportunity.id, "Opportunity")).toThrow(/Closed/);
  });
  it("blocks skipped stages and changing a reserved transaction", () => {
    const { opportunity } = prepareDeal();
    expect(() => store.setDealStage(opportunity.id, "Won")).toThrow(/next/);
    store.setDealStage(opportunity.id, "Reserved");
    expect(() => store.upsert<Deal>("deals", { id: opportunity.id, propertyIds: [] })).toThrow(/cannot be edited/);
  });
  it("releases a reservation when marked lost", () => {
    const { purchased, opportunity } = prepareDeal(); store.setDealStage(opportunity.id, "Reserved");
    store.setDealStage(opportunity.id, "Lost");
    expect(workspace().properties.find((p) => p.id === purchased.id)?.availability).toBe("Available");
  });
});

describe("settings form integration", () => {
  it("saves the typed brand field through its actual management form", () => {
    render(<AdminSettingsPage />);
    fireEvent.change(screen.getByLabelText("Brand Name"), { target: { value: "Smoke Test Brand" } });
    fireEvent.click(screen.getByRole("button", { name: "Save website settings" }));
    expect(workspace().siteSettings.companyName).toBe("Smoke Test Brand");
  });
});
