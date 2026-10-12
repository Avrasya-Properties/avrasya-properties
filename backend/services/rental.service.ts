import { getAdminClient } from "../config";
import type { Database } from "../types/database.types";
import { LeaseSchema, MaintenanceTicketSchema, type MaintenanceTicketInput } from "../validators";
import { z } from "zod";

export class RentalService {
  /**
   * Create a new Lease record.
   * DB trigger 'check_overlapping_lease' will reject if an active lease already overlaps on this physical unit.
   */
  static async createLease(input: z.infer<typeof LeaseSchema>, staffUserId: string) {
    const validated = LeaseSchema.parse(input);
    const admin = getAdminClient();

    const { data: lease, error } = await admin
      .from("leases")
      .insert({
        physical_unit_id: validated.physicalUnitId,
        offer_id: validated.offerId || null,
        landlord_contact_id: validated.landlordContactId,
        tenant_contact_id: validated.tenantContactId,
        start_date: validated.startDate,
        end_date: validated.endDate,
        rent_amount: validated.rentAmount,
        rent_currency: validated.rentCurrency,
        payment_frequency: validated.paymentFrequency,
        payment_due_day: validated.paymentDueDay,
        deposit_amount: validated.depositAmount,
        deposit_currency: validated.depositCurrency,
        terms: validated.terms || null,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes("overlapping lease")) {
        throw new Error(
          "Unit already has an active lease covering this period. Overlapping leases are rejected.",
        );
      }
      throw new Error(`Failed to create lease: ${error.message}`);
    }

    // If deposit amount > 0, initialize rental deposit record
    if (validated.depositAmount > 0) {
      await admin.from("rental_deposits").insert({
        lease_id: lease.id,
        amount: validated.depositAmount,
        currency: validated.depositCurrency,
        status: "received",
        received_date: validated.startDate,
        notes: "Initial security deposit upon lease execution",
      });
    }

    // Mark physical unit as rented
    await admin
      .from("physical_units")
      .update({ availability_status: "Rented" })
      .eq("id", validated.physicalUnitId);

    // Audit event
    await admin.from("audit_events").insert({
      actor_user_id: staffUserId,
      entity_type: "leases",
      entity_id: lease.id,
      action: "create_lease",
      after_state: lease as any,
    });

    return lease;
  }

  /**
   * Idempotent rent charge generation for a specific month and year.
   * Calls Postgres stored procedure `generate_rent_charges_for_month`.
   */
  static async generateMonthlyCharges(year: number, month: number) {
    const admin = getAdminClient();

    const { data: generatedCount, error } = await admin.rpc("generate_rent_charges_for_month", {
      p_year: year,
      p_month: month,
    });

    if (error) {
      throw new Error(`Charge generation failed: ${error.message}`);
    }

    return {
      success: true,
      year,
      month,
      chargesGenerated: generatedCount,
    };
  }

  /**
   * Allocate payment to a rent charge.
   * Database trigger prevents cross-currency allocations.
   */
  static async allocateRentPayment(params: {
    chargeId: string;
    amount: number;
    currency: Database["public"]["Enums"]["currency_code"];
    reference: string;
    paidDate?: string;
    staffUserId: string;
  }) {
    const admin = getAdminClient();

    // Fetch charge
    const { data: charge, error: chargeErr } = await admin
      .from("rent_charges")
      .select("*, leases (rent_currency)")
      .eq("id", params.chargeId)
      .single();

    if (chargeErr || !charge) throw new Error("Rent charge not found");

    if (charge.currency !== params.currency) {
      throw new Error(
        `Cross-currency payment rejected: Charge is in ${charge.currency}, but payment is in ${params.currency}`,
      );
    }

    // Insert allocation record
    const { data: allocation, error: allocErr } = await admin
      .from("rent_payment_allocations")
      .insert({
        charge_id: params.chargeId,
        amount_allocated: params.amount,
        allocated_by: params.staffUserId,
        notes: `Ref: ${params.reference}`,
      })
      .select()
      .single();

    if (allocErr) throw new Error(`Payment allocation failed: ${allocErr.message}`);

    // Update charge paid_amount & status
    const newPaidAmount = Number(charge.paid_amount) + Number(params.amount);
    const newStatus = newPaidAmount >= Number(charge.amount_due) ? "paid" : "partial";

    await admin
      .from("rent_charges")
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
        paid_date:
          newPaidAmount >= Number(charge.amount_due)
            ? params.paidDate || new Date().toISOString().split("T")[0]
            : null,
      })
      .eq("id", params.chargeId);

    return {
      success: true,
      allocation,
      newBalanceRemaining: Math.max(0, Number(charge.amount_due) - newPaidAmount),
      status: newStatus,
    };
  }

  /**
   * Maintenance Tickets: Create a maintenance request.
   */
  static async createMaintenanceTicket(input: MaintenanceTicketInput, staffUserId: string) {
    const validated = MaintenanceTicketSchema.parse(input);
    const admin = getAdminClient();

    const { data: ticket, error } = await admin
      .from("maintenance_tickets")
      .insert({
        physical_unit_id: validated.physicalUnitId,
        lease_id: validated.leaseId || null,
        requester_contact_id: validated.requesterContactId || null,
        vendor_id: validated.vendorId || null,
        title: validated.title,
        description: validated.description,
        priority: validated.priority,
        status: validated.status,
        cost_amount: validated.costAmount || null,
        cost_currency: validated.costCurrency,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create maintenance ticket: ${error.message}`);

    await admin.from("audit_events").insert({
      actor_user_id: staffUserId,
      entity_type: "maintenance_tickets",
      entity_id: ticket.id,
      action: "create",
      after_state: ticket as any,
    });

    return ticket;
  }

  /**
   * Update Maintenance Ticket status and costs.
   */
  static async updateMaintenanceTicket(
    ticketId: string,
    updates: {
      status?: Database["public"]["Enums"]["maintenance_status"];
      vendorId?: string;
      costAmount?: number;
      resolutionNotes?: string;
    },
    staffUserId: string,
  ) {
    const admin = getAdminClient();

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };
    if (updates.status) updatePayload.status = updates.status;
    if (updates.vendorId) updatePayload.vendor_id = updates.vendorId;
    if (updates.costAmount !== undefined) updatePayload.cost_amount = updates.costAmount;
    if (updates.resolutionNotes) updatePayload.resolution_notes = updates.resolutionNotes;

    const { data, error } = await admin
      .from("maintenance_tickets")
      .update(updatePayload)
      .eq("id", ticketId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update maintenance ticket: ${error.message}`);
    return data;
  }
}
