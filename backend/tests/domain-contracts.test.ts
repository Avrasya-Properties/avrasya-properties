import { describe, it, expect } from "bun:test";
import { MarketingOfferSchema, ContactSchema, LeadSchema, DealSchema, MaintenanceTicketSchema, ReservationSchema } from "../validators";

describe("Backend Domain Contracts & Schemas Suite", () => {
  describe("Marketing Offers Schema", () => {
    it("validates a standard unit offer with explicit currency", () => {
      const validOffer = {
        ref: "AVR-101",
        slug: "sisli-luxury-residence-2-1",
        marketing_title: "Şişli Luxury Residence 2+1",
        district: "Şişli",
        city: "Istanbul",
        side: "Europe" as const,
        record_type: "unit_offer" as const,
        mode: "sale" as const,
        layout_label: "2+1",
        bathrooms: 2,
        gross_m2: 120,
        net_m2: 95,
        area_m2: 120,
        amount: 450000,
        currency: "USD" as const,
        price_type: "fixed" as const,
        price_basis: "cash" as const,
        availability: "Available" as const,
        cover_image_path: "/assets/sisli/cover.jpg",
        description: "High floor luxury residence in central Şişli.",
        claims_requiring_confirmation: [],
        cbi_eligible: true,
        cbi_verified: false,
      };

      const result = MarketingOfferSchema.safeParse(validOffer);
      expect(result.success).toBe(true);
    });

    it("rejects uppercase or invalid characters in slugs", () => {
      const invalid = {
        ref: "AVR-101",
        slug: "Invalid_Slug_With_Upper!", // Invalid slug
        marketing_title: "Invalid",
        district: "Şişli",
      };
      const result = MarketingOfferSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("CRM Contacts & Leads Schema", () => {
    it("validates contact input with phone and email", () => {
      const contact = {
        fullName: "Tariq Al-Mansoor",
        email: "tariq@investor.ae",
        phone: "+971 50 123 4567",
        contactType: "investor" as const,
        cbiInterest: true,
        preferredLanguage: "ar",
      };
      const result = ContactSchema.safeParse(contact);
      expect(result.success).toBe(true);
    });

    it("validates lead input with target budget and currency", () => {
      const lead = {
        contactId: "00000000-0000-0000-0000-000000000001",
        title: "Interested in CBI Qualified Villa",
        stage: "qualified" as const,
        targetBudgetAmount: 600000,
        targetBudgetCurrency: "USD" as const,
      };
      const result = LeadSchema.safeParse(lead);
      expect(result.success).toBe(true);
    });
  });

  describe("Transactions & Reservations Schema", () => {
    it("validates reservation input with duration hours", () => {
      const reservation = {
        dealId: "00000000-0000-0000-0000-000000000001",
        contactId: "00000000-0000-0000-0000-000000000002",
        depositAmount: 5000,
        depositCurrency: "USD" as const,
        durationHours: 72,
      };
      const result = ReservationSchema.safeParse(reservation);
      expect(result.success).toBe(true);
    });

    it("validates deal creation with explicit agreed price and currency", () => {
      const deal = {
        contactId: "00000000-0000-0000-0000-000000000002",
        dealNumber: "DEAL-2026-001",
        title: "Maslak 3+1 Purchase Deal",
        dealType: "sale" as const,
        agreedPrice: 780000,
        currency: "USD" as const,
      };
      const result = DealSchema.safeParse(deal);
      expect(result.success).toBe(true);
    });
  });

  describe("Maintenance Tickets Schema", () => {
    it("validates maintenance ticket with emergency priority and TRY cost currency", () => {
      const ticket = {
        physicalUnitId: "00000000-0000-0000-0000-000000000001",
        title: "HVAC cooling unit malfunction",
        description: "Main condenser unit leaking refrigerant in unit 402.",
        priority: "emergency" as const,
        status: "open" as const,
        costAmount: 12500,
        costCurrency: "TRY" as const,
      };
      const result = MaintenanceTicketSchema.safeParse(ticket);
      expect(result.success).toBe(true);
    });
  });
});
