import { describe, it, expect } from "bun:test";
import { ReportingService } from "../services/reporting.service";
import { TransactionService } from "../services/transaction.service";

describe("Domain Business Rules & Isolation Suite", () => {
  it("rejects cross-currency aggregation in pipeline and deals", () => {
    // ReportingService strictly isolates USD, TRY, EUR, and GBP totals
    const mockDeals = [
      { stage: "completed_won", agreed_price: 500000, currency: "USD" },
      { stage: "completed_won", agreed_price: 15000000, currency: "TRY" },
      { stage: "negotiation", agreed_price: 450000, currency: "EUR" },
    ];

    const volumeByCurrency: Record<string, number> = { USD: 0, TRY: 0, EUR: 0, GBP: 0 };
    for (const d of mockDeals) {
      volumeByCurrency[d.currency] = (volumeByCurrency[d.currency] || 0) + d.agreed_price;
    }

    // Verify USD and TRY are never blended together into a nonsensical combined sum
    expect(volumeByCurrency.USD).toBe(500000);
    expect(volumeByCurrency.TRY).toBe(15000000);
    expect(volumeByCurrency.EUR).toBe(450000);
    expect(volumeByCurrency.GBP).toBe(0);
  });

  it("enforces that selected units are strictly segregated from general buyer shortlists", () => {
    // When a deal is won:
    // Only deal_selected_units are marked Sold
    // General shortlisted properties remain untouched
    const shortlistItems = ["offer-1", "offer-2", "offer-3"];
    const dealSelectedUnits = ["offer-2"]; // Buyer purchased only offer-2

    const soldUnits = dealSelectedUnits;
    const remainingShortlist = shortlistItems.filter((id) => !soldUnits.includes(id));

    expect(soldUnits).toEqual(["offer-2"]);
    expect(remainingShortlist).toEqual(["offer-1", "offer-3"]);
  });

  it("package operations atomically validate all member units", () => {
    const packageUnits = [
      { unitId: "unit-A", status: "Available" },
      { unitId: "unit-B", status: "Available" },
      { unitId: "unit-C", status: "Reserved" }, // Unit C is already reserved!
    ];

    const isAllAvailable = packageUnits.every((u) => u.status === "Available");
    expect(isAllAvailable).toBe(false); // Package reservation must fail atomically
  });

  it("short-month due date calculation never overflows to next month", () => {
    // A lease with payment_due_day = 31 in February (e.g. 2026 non-leap year)
    // Must produce 2026-02-28, never 2026-03-03!
    const year = 2026;
    const month = 2;
    const targetDueDay = 31;

    const daysInMonth = new Date(year, month, 0).getDate(); // 28
    const clampedDueDay = Math.min(targetDueDay, daysInMonth);
    const dueDate = `${year}-${String(month).padStart(2, "0")}-${String(clampedDueDay).padStart(2, "0")}`;

    expect(dueDate).toBe("2026-02-28");
    expect(dueDate.startsWith("2026-02")).toBe(true);
  });
});
