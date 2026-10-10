import { z } from "zod";

// --- Formula Injection Sanitizer ---
// Prevents CSV Formula Injection / DDE attacks in exported CSV files.
// Any cell beginning with '=', '+', '-', '@', '\t', or '\r' is escaped with a leading single quote.
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str.replace(/"/g, '""')}`;
  }
  return str.replace(/"/g, '""');
}

export function formatCsvRow(fields: unknown[]): string {
  return fields.map((f) => `"${sanitizeCsvCell(f)}"`).join(",");
}

// --- Enquiries ---
export const EnquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(120),
  phone: z.string().trim().min(7, "Phone number must be at least 7 characters").max(30),
  topic: z.string().trim().min(2, "Topic is required").max(100),
  budget: z.string().trim().max(100).optional(),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(2000),
  source: z.enum([
    "Website Consultation",
    "WhatsApp Click",
    "Contact Brief",
    "Property Modal",
    "Campaign",
    "Direct",
  ]).default("Website Consultation"),
  propertySlug: z.string().trim().max(100).optional(),
  campaignParams: z.record(z.unknown()).optional(),
  idempotencyKey: z.string().trim().max(100).optional(),
  // Honeypot field for bot detection: must be empty if human
  website_hp: z.string().max(0, "Bot submission rejected").optional(),
});
export type EnquiryInput = z.infer<typeof EnquirySchema>;

// --- Property Publishing & Updating ---
export const MarketingOfferSchema = z.object({
  ref: z.string().trim().min(3).max(50),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  marketing_title: z.string().trim().min(3).max(200),
  district: z.string().trim().min(2).max(100),
  city: z.string().trim().default("Istanbul"),
  side: z.enum(["Europe", "Asia", "unknown"]).optional(),
  record_type: z.enum(["unit_offer", "unit_type", "package", "project", "ambiguous_offer"]).default("unit_offer"),
  mode: z.enum(["sale", "rent"]).default("sale"),
  layout_label: z.string().nullable().optional(),
  bathrooms: z.number().int().min(0).max(20).nullable().optional(),
  gross_m2: z.number().positive().nullable().optional(),
  net_m2: z.number().positive().nullable().optional(),
  area_m2: z.number().positive().nullable().optional(),
  amount: z.number().positive().nullable().optional(),
  currency: z.enum(["USD", "TRY", "EUR", "GBP"]).nullable().optional(),
  price_type: z.enum(["fixed", "from", "on-request"]).default("fixed"),
  price_basis: z.enum([
    "cash", "installment_schedule", "package", "fixed", "from",
    "on_request", "conflicting_starting_prices", "scope_unconfirmed",
    "special_offer", "advertised"
  ]).default("fixed"),
  expenses_amount: z.number().nonnegative().nullable().optional(),
  availability: z.enum(["Available", "Under Offer", "Reserved", "Sold", "Rented", "Off Market", "Unknown"]).default("Unknown"),
  cover_image_path: z.string().nullable().optional(),
  description: z.string().default(""),
  source_note: z.string().optional(),
  claims_requiring_confirmation: z.array(z.string()).default([]),
  cbi_eligible: z.boolean().default(false),
  cbi_verified: z.boolean().default(false),
});

// --- Reservations ---
export const ReservationSchema = z.object({
  dealId: z.string().uuid(),
  offerId: z.string().uuid().optional(),
  unitId: z.string().uuid().optional(),
  contactId: z.string().uuid(),
  depositAmount: z.number().positive().optional(),
  depositCurrency: z.enum(["USD", "TRY", "EUR", "GBP"]).default("USD"),
  durationHours: z.number().int().min(1).max(720).default(72),
});

// --- Leases ---
export const LeaseSchema = z.object({
  physicalUnitId: z.string().uuid(),
  offerId: z.string().uuid().optional(),
  landlordContactId: z.string().uuid(),
  tenantContactId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD"),
  rentAmount: z.number().positive(),
  rentCurrency: z.enum(["USD", "TRY", "EUR", "GBP"]),
  paymentFrequency: z.enum(["monthly", "quarterly", "annual"]).default("monthly"),
  paymentDueDay: z.number().int().min(1).max(31).default(1),
  depositAmount: z.number().nonnegative().default(0),
  depositCurrency: z.enum(["USD", "TRY", "EUR", "GBP"]),
  terms: z.string().optional(),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

// --- Recorded Payments ---
export const RecordedPaymentSchema = z.object({
  dealId: z.string().uuid(),
  milestoneId: z.string().uuid().optional(),
  paymentReference: z.string().trim().min(3).max(100),
  amount: z.number().positive(),
  currency: z.enum(["USD", "TRY", "EUR", "GBP"]),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  paymentMethod: z.enum(["bank_transfer", "card", "cash"]).default("bank_transfer"),
  proofStoragePath: z.string().optional(),
  notes: z.string().optional(),
});

// --- Contacts ---
export const ContactSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(120).nullable().optional(),
  phone: z.string().trim().min(7, "Phone must be at least 7 characters").max(30).nullable().optional(),
  countryCode: z.string().trim().max(10).optional(),
  preferredLanguage: z.string().trim().default("en"),
  contactType: z.enum(["buyer", "investor", "tenant", "landlord", "partner", "vendor"]).default("buyer"),
  nationality: z.string().trim().max(50).nullable().optional(),
  cbiInterest: z.boolean().default(false),
  notes: z.string().optional(),
});
export type ContactInput = z.infer<typeof ContactSchema>;

// --- Leads ---
export const LeadSchema = z.object({
  contactId: z.string().uuid(),
  enquiryId: z.string().uuid().optional(),
  title: z.string().trim().min(3).max(150),
  stage: z.enum(["new", "contacted", "qualified", "viewing_scheduled", "negotiating", "reserved", "won", "lost"]).default("new"),
  qualificationScore: z.number().int().min(1).max(5).default(3),
  assignedStaffId: z.string().uuid().nullable().optional(),
  source: z.string().trim().default("Website Consultation"),
  targetBudgetAmount: z.number().positive().nullable().optional(),
  targetBudgetCurrency: z.enum(["USD", "TRY", "EUR", "GBP"]).default("USD"),
  lossReason: z.string().max(200).optional(),
});
export type LeadInput = z.infer<typeof LeadSchema>;

// --- Deals ---
export const DealSchema = z.object({
  leadId: z.string().uuid().optional(),
  contactId: z.string().uuid(),
  dealNumber: z.string().trim().min(3).max(50),
  title: z.string().trim().min(3).max(150),
  dealType: z.enum(["sale", "rental", "resale"]).default("sale"),
  stage: z.enum(["draft", "negotiation", "reservation_active", "contract_signed", "completed_won", "cancelled_lost"]).default("draft"),
  agreedPrice: z.number().positive(),
  currency: z.enum(["USD", "TRY", "EUR", "GBP"]).default("USD"),
  assignedStaffId: z.string().uuid().nullable().optional(),
  notes: z.string().optional(),
});
export type DealInput = z.infer<typeof DealSchema>;

// --- Maintenance Tickets ---
export const MaintenanceTicketSchema = z.object({
  physicalUnitId: z.string().uuid(),
  leaseId: z.string().uuid().optional(),
  requesterContactId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(5).max(3000),
  priority: z.enum(["low", "medium", "high", "emergency"]).default("medium"),
  status: z.enum(["open", "assigned", "in_progress", "resolved", "closed"]).default("open"),
  costAmount: z.number().nonnegative().optional(),
  costCurrency: z.enum(["USD", "TRY", "EUR", "GBP"]).default("TRY"),
});
export type MaintenanceTicketInput = z.infer<typeof MaintenanceTicketSchema>;

// --- Content Page ---
export const ContentPageSchema = z.object({
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  title: z.string().trim().min(2).max(200),
  metaTitle: z.string().trim().max(100).optional(),
  metaDescription: z.string().trim().max(300).optional(),
  isPublished: z.boolean().default(false),
});
export type ContentPageInput = z.infer<typeof ContentPageSchema>;

// --- Site Settings ---
export const SiteSettingsSchema = z.object({
  brandName: z.string().trim().min(2).max(100),
  tagline: z.string().trim().max(200).optional(),
  contactEmail: z.string().trim().email(),
  contactPhone: z.string().trim().max(30),
  whatsappNumber: z.string().trim().max(30),
  officeAddress: z.string().trim().max(300),
  baseCurrency: z.enum(["USD", "TRY", "EUR", "GBP"]).default("USD"),
  maintenanceMode: z.boolean().default(false),
  cbiMinInvestmentUsd: z.number().positive().default(400000),
});
export type SiteSettingsInput = z.infer<typeof SiteSettingsSchema>;
