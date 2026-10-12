import { getAdminClient } from "../config";
import type { Database } from "../types/database.types";
import { DealSchema, ReservationSchema, RecordedPaymentSchema, type DealInput } from "../validators";
import { z } from "zod";

export class TransactionService {
  /**
   * Create a new Deal record.
   */
  static async createDeal(input: DealInput, staffUserId: string) {
    const validated = DealSchema.parse(input);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("deals")
      .insert({
        lead_id: validated.leadId || null,
        contact_id: validated.contactId,
        deal_number: validated.dealNumber,
        title: validated.title,
        deal_type: validated.dealType,
        stage: validated.stage,
        agreed_price: validated.agreedPrice,
        currency: validated.currency,
        assigned_staff_id: validated.assignedStaffId || staffUserId,
        notes: validated.notes || null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create deal: ${error.message}`);

    await admin.from("audit_events").insert({
      actor_user_id: staffUserId,
      entity_type: "deals",
      entity_id: data.id,
      action: "create",
      after_state: data as any,
    });

    return data;
  }

  /**
   * Associate selected units/offers with a Deal.
   * NOTE: Selected units are the actual contract subject, distinct from exploratory shortlists.
   */
  static async addSelectedUnitToDeal(params: {
    dealId: string;
    physicalUnitId?: string;
    marketingOfferId?: string;
    unitPrice: number;
    currency: Database["public"]["Enums"]["currency_code"];
  }) {
    const admin = getAdminClient();

    // Verify deal currency matches unit currency
    const { data: deal } = await admin
      .from("deals")
      .select("currency")
      .eq("id", params.dealId)
      .single();

    if (deal && deal.currency !== params.currency) {
      throw new Error(`Currency mismatch: Deal currency is ${deal.currency}, but unit is priced in ${params.currency}. Cross-currency aggregation in a single deal is rejected.`);
    }

    const { data, error } = await admin
      .from("deal_selected_units")
      .insert({
        deal_id: params.dealId,
        physical_unit_id: params.physicalUnitId || null,
        marketing_offer_id: params.marketingOfferId || null,
        unit_price: params.unitPrice,
        currency: params.currency,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to add selected unit: ${error.message}`);
    return data;
  }

  /**
   * Atomic Reservation creation.
   * Uses Postgres stored procedure with row-level locking to prevent concurrent double-booking.
   */
  static async createReservation(input: z.infer<typeof ReservationSchema>) {
    const validated = ReservationSchema.parse(input);
    const admin = getAdminClient();

    const { data: reservationId, error } = await admin.rpc("create_reservation_atomic", {
      p_deal_id: validated.dealId,
      p_offer_id: validated.offerId || null,
      p_unit_id: validated.unitId || null,
      p_contact_id: validated.contactId,
      p_deposit_amount: validated.depositAmount || null,
      p_deposit_currency: validated.depositCurrency,
      p_duration_hours: validated.durationHours,
    });

    if (error) {
      throw new Error(`Reservation failed: ${error.message}`);
    }

    return { success: true, reservationId };
  }

  /**
   * Atomic Package Reservation.
   * Atomically verifies that ALL member units in the package are available before reserving.
   */
  static async reservePackage(params: {
    dealId: string;
    packageOfferId: string;
    contactId: string;
    depositAmount?: number;
    depositCurrency?: Database["public"]["Enums"]["currency_code"];
    durationHours?: number;
  }) {
    const admin = getAdminClient();

    const { data: reservationId, error } = await admin.rpc("reserve_package_atomic", {
      p_deal_id: params.dealId,
      p_package_offer_id: params.packageOfferId,
      p_contact_id: params.contactId,
      p_deposit_amount: params.depositAmount || null,
      p_deposit_currency: params.depositCurrency || "USD",
      p_duration_hours: params.durationHours || 72,
    });

    if (error) {
      throw new Error(`Package reservation failed: ${error.message}`);
    }

    return { success: true, reservationId };
  }

  /**
   * Complete Deal Win:
   * Calls complete_deal_win() which updates ONLY the deal's selected units to Sold.
   * Contact's general shortlist remains untouched!
   */
  static async completeDeal(dealId: string, staffUserId: string) {
    const admin = getAdminClient();

    const { data, error } = await admin.rpc("complete_deal_win", {
      p_deal_id: dealId,
      p_sold_by: staffUserId,
    });

    if (error) {
      throw new Error(`Failed to complete deal: ${error.message}`);
    }

    return { success: true, result: data };
  }

  /**
   * Record a payment milestone for a deal.
   */
  static async addPaymentMilestone(params: {
    dealId: string;
    name: string;
    amount: number;
    currency: Database["public"]["Enums"]["currency_code"];
    dueDate?: string;
  }) {
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("payment_milestones")
      .insert({
        deal_id: params.dealId,
        milestone_name: params.name,
        amount_due: params.amount,
        currency: params.currency,
        due_date: params.dueDate || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to add payment milestone: ${error.message}`);
    return data;
  }

  /**
   * Record a payment against a deal / milestone with exact currency tracking.
   */
  static async recordPayment(input: z.infer<typeof RecordedPaymentSchema>, staffUserId: string) {
    const validated = RecordedPaymentSchema.parse(input);
    const admin = getAdminClient();

    // Fetch deal currency to verify match
    const { data: deal } = await admin
      .from("deals")
      .select("currency")
      .eq("id", validated.dealId)
      .single();

    if (deal && deal.currency !== validated.currency) {
      throw new Error(`Currency mismatch: Deal currency is ${deal.currency}, payment is in ${validated.currency}`);
    }

    const { data: payment, error } = await admin
      .from("recorded_payments")
      .insert({
        deal_id: validated.dealId,
        milestone_id: validated.milestoneId || null,
        payment_reference: validated.paymentReference,
        amount: validated.amount,
        currency: validated.currency,
        payment_date: validated.paymentDate || new Date().toISOString().split("T")[0],
        payment_method: validated.paymentMethod,
        proof_storage_path: validated.proofStoragePath || null,
        notes: validated.notes || null,
        recorded_by: staffUserId,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to record payment: ${error.message}`);

    // If milestone linked, update milestone status
    if (validated.milestoneId) {
      await admin
        .from("payment_milestones")
        .update({ status: "paid" })
        .eq("id", validated.milestoneId);
    }

    return payment;
  }

  /**
   * Allocate commission to an agent for a deal.
   */
  static async allocateCommission(params: {
    dealId: string;
    staffId: string;
    percentage: number;
    amount: number;
    currency: Database["public"]["Enums"]["currency_code"];
  }) {
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("commission_allocations")
      .insert({
        deal_id: params.dealId,
        staff_id: params.staffId,
        percentage: params.percentage,
        amount: params.amount,
        currency: params.currency,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to allocate commission: ${error.message}`);
    return data;
  }
}
