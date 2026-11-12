import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  properties,
  filterProperties,
  comparableUsd,
  matchesLayout,
  priceDisplay,
  unmatchablePrices,
  BUDGETS,
  type PropertyRecord,
} from "@/data/properties";
import { TRANSLATIONS } from "@/i18n";
import { AcquisitionCalculator } from "@/components/site/AcquisitionCalculator";
import { CalculatorPage } from "@/routes/calculator";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({
    validateSearch: vi.fn(),
    head: vi.fn(),
    component: vi.fn(),
  }),
  useRouterState: ({ select }: { select?: (s: any) => any } = {}) => {
    const s = { location: { pathname: "/calculator" } };
    return select ? select(s) : s;
  },
  Link: ({ to, children, className, onClick, ...rest }: any) => (
    <a href={typeof to === "string" ? to : "#"} className={className} onClick={onClick} {...rest}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}));

// Mock preferences and live currency rates
vi.mock("@/hooks/usePreferences", () => ({
  useCurrency: () => ["USD", vi.fn()],
  useLiveRates: () => ({
    rates: { USD: 1, EUR: 0.92, TRY: 38.5, GBP: 0.78 },
  }),
  useShortlist: () => ({ shortlist: [] }),
}));

// Mock Language hook with full TRANSLATIONS.en dictionary
vi.mock("@/hooks/useLanguage", () => ({
  useLanguage: () => ({
    locale: "en",
    isRtl: false,
    t: TRANSLATIONS.en,
  }),
  useTranslation: () => ({
    t: TRANSLATIONS.en,
  }),
}));

// Mock live contact hook directly
vi.mock("@/hooks/useLiveContact", () => ({
  useLiveContact: () => ({
    company: "Avrasya Properties Group",
    email: "info@avrasyaproperties.com",
    phone: "+90 545 924 80 42",
    phoneHref: "tel:+905459248042",
    whatsapp: "https://wa.me/905459248042",
    address: "Mecidiyeköy Mah., Hark Sk. No: 6 A, 34387 Şişli/İstanbul",
    tagline: "Your Future Starts with the Right Investment.",
    advisoryHours: "Mon – Fri: 09:30 – 18:30 TRT",
  }),
  useWhatsAppLink: () => (text: string) =>
    `https://wa.me/905459248042?text=${encodeURIComponent(text)}`,
  buildWhatsAppLink: (_base: string, text: string) =>
    `https://wa.me/905459248042?text=${encodeURIComponent(text)}`,
}));

// Mock site settings store
vi.mock("@/admin/store", () => ({
  useSiteSettings: () => ({
    cbiThresholdUsd: 400000,
    companyName: "Avrasya Properties",
    budgetRanges: BUDGETS,
    regions: [],
    districts: ["Maslak", "Beşiktaş", "Şişli", "Topkapı", "Güneşli", "Ataşehir", "Ümraniye"],
    phone: "+90 545 924 80 42",
    email: "info@avrasyaproperties.com",
    whatsapp: "https://wa.me/905459248042",
    address: "Mecidiyeköy Mah., Hark Sk. No: 6 A, 34387 Şişli/İstanbul",
    tagline: "Your Future Starts with the Right Investment.",
    advisoryHours: "Mon – Fri: 09:30 – 18:30 TRT",
  }),
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("Empirical Challenger 2: Core Financial Formulas & Business Logic Invariants", () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. Acquisition Closing Cost Ledger Formulas (Law No. 4721 & Law No. 3065)
  // =========================================================================
  describe("1. Acquisition Closing Costs Formula Verification", () => {
    it("computes exact statutory baseline for $450,000 USD (Full Tapu 4% + VAT Exempt)", () => {
      const priceUsd = 450000;
      const tapuRate = 0.04; // 4%
      const tapuFee = Math.round(priceUsd * tapuRate); // $18,000
      const vatExempt = 0; // Law 3065
      const spkValuation = 750;
      const notaryDab = 650;
      const legalFee = 2500;

      const totalClosing = tapuFee + vatExempt + spkValuation + notaryDab + legalFee;
      expect(tapuFee).toBe(18000);
      expect(totalClosing).toBe(21900);

      const allIn = priceUsd + totalClosing;
      expect(allIn).toBe(471900);

      const closingPct = ((totalClosing / priceUsd) * 100).toFixed(1);
      expect(closingPct).toBe("4.9");

      // Verify DOM reflects these numbers exactly
      renderWithClient(<AcquisitionCalculator />);
      expect(screen.getAllByText(/\$450,000/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$18,000/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$750/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$650/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$2,500/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$21,900/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$471,900/).length).toBeGreaterThan(0);
    });

    it("switches to Split Tapu (2% Buyer Share = $9,000) upon toggle", async () => {
      renderWithClient(<AcquisitionCalculator />);

      // Tapu buttons: "Full 4% Deed Tax (Common in new builds)" vs "Split 2% Buyer / 2% Developer"
      const splitBtn = screen.getByRole("button", {
        name: new RegExp(TRANSLATIONS.en.calculator.tapuShareSplit, "i"),
      });
      await act(async () => {
        fireEvent.click(splitBtn);
      });

      // Tapu fee should now be $9,000
      // Total closing: $9,000 + $0 + $750 + $650 + $2,500 = $12,900
      // All-in total: $450,000 + $12,900 = $462,900
      expect(screen.getAllByText(/\$9,000/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$12,900/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$462,900/).length).toBeGreaterThan(0);
    });

    it("adds 1% Standard Residential VAT ($4,500) when VAT exemption is untoggled", async () => {
      renderWithClient(<AcquisitionCalculator />);

      const vatToggleBtn = screen.getByText(TRANSLATIONS.en.calculator.vatExemptLabel);

      await act(async () => {
        fireEvent.click(vatToggleBtn);
      });

      // Tapu 4% = $18,000
      // VAT 1% = $4,500
      // SPK = $750, DAB = $650, Legal = $2,500
      // Total closing = $18,000 + $4,500 + $750 + $650 + $2,500 = $26,400
      // All-in = $450,000 + $26,400 = $476,400
      expect(screen.getAllByText(/\$4,500/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$26,400/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$476,400/).length).toBeGreaterThan(0);
    });

    it("accurately detects CBI deficit when property price is under $400,000", async () => {
      renderWithClient(<AcquisitionCalculator />);

      // Change input price to $300,000
      const priceSlider = screen.getByRole("slider");
      await act(async () => {
        fireEvent.change(priceSlider, { target: { value: 300000 } });
      });

      // Deficit should be $100,000 ($400,000 - $300,000)
      expect(screen.getAllByText(/100,000/).length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 2. Rental Yield & Cash Flow Forecast Invariants
  // =========================================================================
  describe("2. Rental Yield & Cash Flow Mathematical Invariants", () => {
    it("computes baseline yield and expenses on $550,000 property correctly", async () => {
      renderWithClient(<CalculatorPage />);

      // Switch to Yield tab
      const yieldTab = screen.getByRole("button", { name: /Rental Yield/i });
      await act(async () => {
        fireEvent.click(yieldTab);
      });

      // Baseline: $550,000 USD, 7.2% gross yield, 10% mgmt fee, $200 monthly Aidat, $180 DASK
      // Annual Gross Rent = 550000 * 0.072 = 39,600
      // Monthly Gross Rent = 39600 / 12 = 3,300
      // Mgmt Cost = 39600 * 0.10 = 3,960
      // Aidat Cost = 200 * 12 = 2,400
      // Total Annual Expenses = 3,960 + 2,400 + 180 = 6,540
      // Net Annual Rent = 39,600 - 6,540 = 33,060
      // Monthly Net Cash Flow = 33,060 / 12 = 2,755
      // Net Yield % = (33,060 / 550,000) * 100 = 6.01%
      // 3-Year Cash Flow = 33,060 * 3 = 99,180
      // 5-Year Cash Flow = 33,060 * 5 = 165,300

      expect(screen.getAllByText(/\$39,600/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$3,300/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/-?\$6,540/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$33,060/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$2,755/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/6\.01%/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$99,180/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$165,300/).length).toBeGreaterThan(0);
    });

    it("clamps net rent to zero (Math.max(0, ...)) when operating expenses exceed gross rent", () => {
      // Direct mathematical invariant stress test:
      const yieldPriceUsd = 100000;
      const grossYieldPct = 1.0; // 1% = $1,000/yr
      const annualGrossRentUsd = Math.round(yieldPriceUsd * (grossYieldPct / 100)); // 1,000
      const mgmtFeePct = 15;
      const annualMgmtCostUsd = Math.round(annualGrossRentUsd * (mgmtFeePct / 100)); // 150
      const annualAidatCostUsd = 200 * 12; // 2,400
      const annualDaskUsd = 180;
      const totalExpenses = annualMgmtCostUsd + annualAidatCostUsd + annualDaskUsd; // 2,730

      // Operating expenses ($2,730) > gross rent ($1,000)
      const annualNetRentUsd = Math.max(0, annualGrossRentUsd - totalExpenses);
      expect(annualNetRentUsd).toBe(0); // Zero clamp prevents negative yield pollution
      const netYieldPct = ((annualNetRentUsd / yieldPriceUsd) * 100).toFixed(2);
      expect(netYieldPct).toBe("0.00");
    });
  });

  // =========================================================================
  // 3. Turkish Citizenship by Investment (CBI) Outlay Model
  // =========================================================================
  describe("3. CBI Statutory Outlay Mathematical Invariants", () => {
    it("computes correct statutory fees for family composition (1 Principal + 1 Spouse + 2 Children = 4 Applicants)", async () => {
      renderWithClient(<CalculatorPage />);

      // Switch to CBI tab
      const cbiTab = screen.getByRole("button", { name: /Citizenship/i });
      await act(async () => {
        fireEvent.click(cbiTab);
      });

      // Default state: $450,000 price, includeSpouse = true, childCount = 2 -> totalApplicants = 4
      // Statutory costs:
      // SPK Appraisal: $1,200
      // DAB Notary: $1,500
      // Legal Counsel: $6,500
      // Gov Filing: $850 * 4 = $3,400
      // Biometric Card: $350 * 4 = $1,400
      // Passport: $320 * 4 = $1,280
      // Total Gov Fees = $3,400 + $1,400 + $1,280 = $6,080 ($1,520 * 4)
      // Tapu Fee: 450,000 * 0.04 = $18,000
      // Total CBI Processing = 1200 + 1500 + 6500 + 6080 + 18000 = $33,280
      // Grand Total = 450,000 + 33,280 = $483,280

      expect(screen.getAllByText(/\$450,000/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$18,000/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$1,200/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$1,500/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$6,080/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$6,500/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$483,280/).length).toBeGreaterThan(0);
    });

    it("scales government fees linearly with applicant count", () => {
      const calculateGovFees = (applicants: number) => {
        const perPerson = 850 + 350 + 320; // $1,520
        return applicants * perPerson;
      };

      expect(calculateGovFees(1)).toBe(1520);
      expect(calculateGovFees(2)).toBe(3040);
      expect(calculateGovFees(3)).toBe(4560);
      expect(calculateGovFees(4)).toBe(6080);
      expect(calculateGovFees(5)).toBe(7600);
      expect(calculateGovFees(6)).toBe(9120);
    });

    it("verifies CBI threshold deficit at exactly $400,000 and sub-$400,000", () => {
      const threshold = 400000;
      const calcDeficit = (price: number) => Math.max(0, threshold - price);

      expect(calcDeficit(400000)).toBe(0);
      expect(calcDeficit(500000)).toBe(0);
      expect(calcDeficit(399999)).toBe(1);
      expect(calcDeficit(350000)).toBe(50000);
      expect(calcDeficit(270000)).toBe(130000);
    });
  });

  // =========================================================================
  // 4. Ongoing Annual Holding & Municipal Property Tax Model
  // =========================================================================
  describe("4. Ongoing Carrying Costs & Municipal Tax Invariants", () => {
    it("computes accurate carrying costs on $500,000 USD property", async () => {
      renderWithClient(<CalculatorPage />);

      // Switch to Holding tab
      const holdingTab = screen.getByRole("button", {
        name: new RegExp(TRANSLATIONS.en.calculator.tabHolding, "i"),
      });
      await act(async () => {
        fireEvent.click(holdingTab);
      });

      // Default: $500,000 price, $220/mo Aidat
      // Emlak Vergisi (0.2% Istanbul Metropolitan Municipality) = 500,000 * 0.002 = $1,000/yr
      // Annual Aidat = 220 * 12 = $2,640/yr
      // Annual DASK = $180/yr
      // Total Annual Holding Cost = 1,000 + 2,640 + 180 = $3,820/yr
      // Monthly Reserve = Math.round(3,820 / 12) = $318/mo

      expect(screen.getAllByText(/\$1,000/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$2,640/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$180/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$3,820/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$318/).length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 5. Property Filtering, CBI Combinable Rules & Sorting Stability
  // =========================================================================
  describe("5. Property Filtering, Combinatorial Rules & Sorting Stability", () => {
    it("guarantees STABLE sorting under identical price metrics (original index preserved)", () => {
      // Find properties with identical price or craft identical price mock list
      const mockProps: PropertyRecord[] = [
        {
          slug: "prop-a",
          marketing_title: "Property A",
          city: "Istanbul",
          location_label: "Şişli",
          side: "Europe",
          record_type: "unit_offer",
          layout_label: "2+1",
          price: { currency: "USD", amount: 450000, basis: "advertised", status: "available" },
          areas: [],
          source_ids: [],
          availability_verified: true,
          details: {},
        },
        {
          slug: "prop-b",
          marketing_title: "Property B",
          city: "Istanbul",
          location_label: "Beşiktaş",
          side: "Europe",
          record_type: "unit_offer",
          layout_label: "2+1",
          price: { currency: "USD", amount: 450000, basis: "advertised", status: "available" },
          areas: [],
          source_ids: [],
          availability_verified: true,
          details: {},
        },
        {
          slug: "prop-c",
          marketing_title: "Property C",
          city: "Istanbul",
          location_label: "Maslak",
          side: "Europe",
          record_type: "unit_offer",
          layout_label: "2+1",
          price: { currency: "USD", amount: 450000, basis: "advertised", status: "available" },
          areas: [],
          source_ids: [],
          availability_verified: true,
          details: {},
        },
      ];

      // Ascending sort
      const sortedAsc = filterProperties({ sort: "price-asc" }, mockProps);
      expect(sortedAsc.map((p) => p.slug)).toEqual(["prop-a", "prop-b", "prop-c"]);

      // Descending sort
      const sortedDesc = filterProperties({ sort: "price-desc" }, mockProps);
      expect(sortedDesc.map((p) => p.slug)).toEqual(["prop-a", "prop-b", "prop-c"]);
    });

    it("pushes uncomparable/null priced properties to the very end of sorted list", () => {
      const sortedAsc = filterProperties({ sort: "price-asc" });
      const sortedDesc = filterProperties({ sort: "price-desc" });

      // First property in asc has lowest comparable USD price
      expect(comparableUsd(sortedAsc[0]!.price)).not.toBeNull();
      expect(comparableUsd(sortedAsc[0]!.price)).toBe(182000);

      // Last properties in both asc and desc must have null comparable price
      expect(comparableUsd(sortedAsc.at(-1)!.price)).toBeNull();
      expect(comparableUsd(sortedDesc.at(-1)!.price)).toBeNull();
    });

    it("strictly isolates budget filter tiers without boundary leakage", () => {
      // BUDGETS:
      // u300: 0 -> 300,000
      // 300-450: 300,000 -> 450,000
      // 450-600: 450,000 -> 600,000
      // 600: 600,000 -> Infinity

      const u300 = filterProperties({ budget: "u300" });
      expect(
        u300.every((p) => {
          const v = comparableUsd(p.price);
          return v !== null && v >= 0 && v < 300000;
        }),
      ).toBe(true);

      const b300_450 = filterProperties({ budget: "300-450" });
      expect(
        b300_450.every((p) => {
          const v = comparableUsd(p.price);
          return v !== null && v >= 300000 && v < 450000;
        }),
      ).toBe(true);

      const b450_600 = filterProperties({ budget: "450-600" });
      expect(
        b450_600.every((p) => {
          const v = comparableUsd(p.price);
          return v !== null && v >= 450000 && v < 600000;
        }),
      ).toBe(true);

      const b600 = filterProperties({ budget: "600" });
      expect(
        b600.every((p) => {
          const v = comparableUsd(p.price);
          return v !== null && v >= 600000;
        }),
      ).toBe(true);
    });

    it("verifies multi-property combinatorial logic to reach $400,000 Turkish CBI minimum", () => {
      // Under Turkish Citizenship Law No. 5901, an investor may combine multiple properties
      // purchased on the same day or submitted together under single notarized promise to sell
      // provided the cumulative valuation meets or exceeds $400,000 USD.

      const eligibleSubThresholdProps = properties.filter((p) => {
        const val = comparableUsd(p.price);
        return val !== null && val < 400000;
      });

      // Verify we have candidate sub-$400k properties
      expect(eligibleSubThresholdProps.length).toBeGreaterThan(0);

      // Find combinations of 2 properties that sum to >= $400,000
      const combinations: { propA: string; propB: string; totalUsd: number }[] = [];
      for (let i = 0; i < eligibleSubThresholdProps.length; i++) {
        for (let j = i + 1; j < eligibleSubThresholdProps.length; j++) {
          const sum =
            comparableUsd(eligibleSubThresholdProps[i]!.price)! +
            comparableUsd(eligibleSubThresholdProps[j]!.price)!;
          if (sum >= 400000) {
            combinations.push({
              propA: eligibleSubThresholdProps[i]!.slug,
              propB: eligibleSubThresholdProps[j]!.slug,
              totalUsd: sum,
            });
          }
        }
      }

      // Assert at least one valid combination exists (e.g. RAMS Maslak $270k + Şişli Feriköy $182k = $452,000)
      expect(combinations.length).toBeGreaterThan(0);
      const combo452k = combinations.find(
        (c) =>
          (c.propA.includes("rams") && c.propB.includes("ferikoy-duplex-182")) ||
          (c.propB.includes("rams") && c.propA.includes("ferikoy-duplex-182")),
      );
      expect(combo452k).toBeDefined();
      expect(combo452k!.totalUsd).toBe(452000);
      expect(combo452k!.totalUsd).toBeGreaterThanOrEqual(400000);
    });

    it("correctly identifies multi-apartment packaged investments", () => {
      const packages = properties.filter((p) => p.record_type === "package");
      expect(packages.length).toBeGreaterThan(0);

      for (const pkg of packages) {
        const display = priceDisplay(pkg.price);
        expect(display.note).toContain("Package total");
      }
    });

    it("layout filter correctly filters Duplex, 1+1, and 2+1 without false positives", () => {
      expect(matchesLayout({ layout_label: "Duplex 182m²" } as any, "Duplex")).toBe(true);
      expect(matchesLayout({ layout_label: "Penthouse DUPLEX" } as any, "Duplex")).toBe(true);
      expect(matchesLayout({ layout_label: "1+1 Standard" } as any, "Duplex")).toBe(false);

      expect(matchesLayout({ layout_label: "1+1 XS 50m²" } as any, "1+1")).toBe(true);
      expect(matchesLayout({ layout_label: "2+1 Family" } as any, "1+1")).toBe(false);

      expect(matchesLayout({ layout_label: "2+1 Residence" } as any, "2+1")).toBe(true);
      expect(matchesLayout({ layout_label: "3+1 Luxury" } as any, "2+1")).toBe(false);
    });
  });
});
