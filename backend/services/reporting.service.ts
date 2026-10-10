import { getAdminClient } from "../config";
import type { Database } from "../types/database.types";
import { sanitizeCsvCell, formatCsvRow } from "../validators";

export interface DashboardMetrics {
  inventory: {
    totalOffers: number;
    publishedCount: number;
    draftCount: number;
    availabilityBreakdown: Record<string, number>;
  };
  crm: {
    totalContacts: number;
    totalLeads: number;
    leadsByStage: Record<string, number>;
    pendingEnquiries: number;
  };
  transactions: {
    totalDeals: number;
    dealsByStage: Record<string, number>;
    // Strict requirement: Never combine different currencies! Totals are broken down per currency.
    pipelineVolumeByCurrency: Record<string, number>;
    wonVolumeByCurrency: Record<string, number>;
  };
  rentals: {
    activeLeases: number;
    pendingChargesByCurrency: Record<string, number>;
  };
}

export class ReportingService {
  /**
   * Aggregate operational metrics for dashboard overview.
   */
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    const admin = getAdminClient();

    // 1. Inventory stats
    const { data: offers } = await admin
      .from("marketing_offers")
      .select("publication_status, availability");

    const availabilityBreakdown: Record<string, number> = {};
    let publishedCount = 0;
    let draftCount = 0;

    for (const o of offers || []) {
      if (o.publication_status === "Published") publishedCount++;
      if (o.publication_status === "Draft") draftCount++;
      availabilityBreakdown[o.availability] = (availabilityBreakdown[o.availability] || 0) + 1;
    }

    // 2. CRM stats
    const { count: totalContacts } = await admin.from("contacts").select("*", { count: "exact", head: true });
    const { count: pendingEnquiries } = await admin.from("enquiries").select("*", { count: "exact", head: true }).eq("status", "new");
    const { data: leads } = await admin.from("leads").select("stage");

    const leadsByStage: Record<string, number> = {};
    for (const l of leads || []) {
      leadsByStage[l.stage] = (leadsByStage[l.stage] || 0) + 1;
    }

    // 3. Transactions stats
    const { data: deals } = await admin.from("deals").select("stage, agreed_price, currency");

    const dealsByStage: Record<string, number> = {};
    const pipelineVolumeByCurrency: Record<string, number> = { USD: 0, TRY: 0, EUR: 0, GBP: 0 };
    const wonVolumeByCurrency: Record<string, number> = { USD: 0, TRY: 0, EUR: 0, GBP: 0 };

    for (const d of deals || []) {
      dealsByStage[d.stage] = (dealsByStage[d.stage] || 0) + 1;
      const curr = d.currency;
      const price = Number(d.agreed_price) || 0;

      if (d.stage === "completed_won") {
        wonVolumeByCurrency[curr] = (wonVolumeByCurrency[curr] || 0) + price;
      } else if (d.stage !== "cancelled_lost") {
        pipelineVolumeByCurrency[curr] = (pipelineVolumeByCurrency[curr] || 0) + price;
      }
    }

    // 4. Rentals stats
    const { count: activeLeases } = await admin.from("leases").select("*", { count: "exact", head: true }).eq("status", "active");
    const { data: pendingCharges } = await admin.from("rent_charges").select("amount_due, paid_amount, currency").neq("status", "paid");

    const pendingChargesByCurrency: Record<string, number> = { USD: 0, TRY: 0, EUR: 0, GBP: 0 };
    for (const c of pendingCharges || []) {
      const remaining = Number(c.amount_due) - Number(c.paid_amount);
      pendingChargesByCurrency[c.currency] = (pendingChargesByCurrency[c.currency] || 0) + remaining;
    }

    return {
      inventory: {
        totalOffers: offers?.length || 0,
        publishedCount,
        draftCount,
        availabilityBreakdown,
      },
      crm: {
        totalContacts: totalContacts || 0,
        totalLeads: leads?.length || 0,
        leadsByStage,
        pendingEnquiries: pendingEnquiries || 0,
      },
      transactions: {
        totalDeals: deals?.length || 0,
        dealsByStage,
        pipelineVolumeByCurrency,
        wonVolumeByCurrency,
      },
      rentals: {
        activeLeases: activeLeases || 0,
        pendingChargesByCurrency,
      },
    };
  }

  /**
   * Export Contacts to CSV with strict CSV formula injection mitigation.
   */
  static async exportContactsCsv(): Promise<string> {
    const admin = getAdminClient();
    const { data: contacts, error } = await admin
      .from("contacts")
      .select("id, full_name, email, phone, contact_type, preferred_language, cbi_interest, created_at")
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Export failed: ${error.message}`);

    const headers = ["ID", "Full Name", "Email", "Phone", "Type", "Language", "CBI Interest", "Created At"];
    const rows = (contacts || []).map((c) => [
      c.id,
      c.full_name,
      c.email || "",
      c.phone || "",
      c.contact_type,
      c.preferred_language,
      c.cbi_interest ? "Yes" : "No",
      c.created_at,
    ]);

    return [
      formatCsvRow(headers),
      ...rows.map((row) => formatCsvRow(row)),
    ].join("\n");
  }

  /**
   * Export Deals to CSV with strict CSV formula injection mitigation.
   */
  static async exportDealsCsv(): Promise<string> {
    const admin = getAdminClient();
    const { data: deals, error } = await admin
      .from("deals")
      .select("deal_number, title, deal_type, stage, agreed_price, currency, created_at")
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Export failed: ${error.message}`);

    const headers = ["Deal Number", "Title", "Type", "Stage", "Agreed Price", "Currency", "Created At"];
    const rows = (deals || []).map((d) => [
      d.deal_number,
      d.title,
      d.deal_type,
      d.stage,
      d.agreed_price,
      d.currency,
      d.created_at,
    ]);

    return [
      formatCsvRow(headers),
      ...rows.map((row) => formatCsvRow(row)),
    ].join("\n");
  }
}
