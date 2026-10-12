import { describe, it, expect } from "bun:test";
import { sanitizeCsvCell, formatCsvRow, EnquirySchema, LeaseSchema } from "../validators";

describe("Security & Validation Suite", () => {
  describe("CSV Formula Injection Defense", () => {
    it("escapes formula injection vectors starting with '=', '+', '-', '@', tab, and carriage return", () => {
      expect(sanitizeCsvCell("=1+1")).toBe("'=1+1");
      expect(sanitizeCsvCell("+cmd|' /C calc'!A0")).toBe("'+cmd|' /C calc'!A0");
      expect(sanitizeCsvCell("-5*5")).toBe("'-5*5");
      expect(sanitizeCsvCell("@SUM(A1:A10)")).toBe("'@SUM(A1:A10)");
      expect(sanitizeCsvCell("\tDDE_ATTACK")).toBe("'\tDDE_ATTACK");
      expect(sanitizeCsvCell("\rMALICIOUS")).toBe("'\rMALICIOUS");
    });

    it("leaves standard text untouched and escapes quotes", () => {
      expect(sanitizeCsvCell("John Doe")).toBe("John Doe");
      expect(sanitizeCsvCell('Apartment "Luxury"')).toBe('Apartment ""Luxury""');
      expect(sanitizeCsvCell(12345)).toBe("12345");
      expect(sanitizeCsvCell(null)).toBe("");
    });

    it("properly formats a CSV row with sanitized cells", () => {
      const row = ['=DDE("cmd")', "Valid Name", 450000];
      const formatted = formatCsvRow(row);
      expect(formatted).toBe('"\'=DDE(""cmd"")","Valid Name","450000"');
    });
  });

  describe("Enquiry Honeypot & Bot Defense Validation", () => {
    it("accepts valid visitor submissions", () => {
      const valid = {
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+90 555 123 4567",
        topic: "Buying Apartment",
        message: "Interested in Maslak 2+1 project options.",
        website_hp: "", // Human left empty
      };
      const result = EnquirySchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects bot submissions that populate honeypot field", () => {
      const bot = {
        name: "Bot Spammer",
        email: "spambot@example.com",
        phone: "+1 800 555 0199",
        topic: "Buy SEO",
        message: "Buy cheap backlinks now",
        website_hp: "http://spam-link.ru", // Bot filled honeypot!
      };
      const result = EnquirySchema.safeParse(bot);
      expect(result.success).toBe(false);
    });

    it("rejects invalid emails and too short messages", () => {
      const invalid = {
        name: "A", // too short
        email: "not-an-email",
        phone: "123",
        topic: "Hi",
        message: "bad", // too short
      };
      const result = EnquirySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Lease Validation", () => {
    it("rejects leases where end date is before or equal to start date", () => {
      const invalidLease = {
        physicalUnitId: "00000000-0000-0000-0000-000000000001",
        landlordContactId: "00000000-0000-0000-0000-000000000002",
        tenantContactId: "00000000-0000-0000-0000-000000000003",
        startDate: "2026-10-01",
        endDate: "2026-09-01", // Before start date!
        rentAmount: 2500,
        rentCurrency: "USD",
        paymentFrequency: "monthly",
        paymentDueDay: 1,
        depositAmount: 5000,
        depositCurrency: "USD",
      };
      const result = LeaseSchema.safeParse(invalidLease);
      expect(result.success).toBe(false);
    });
  });
});
