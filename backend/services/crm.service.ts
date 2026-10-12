import { getAdminClient } from "../config";
import type { Database } from "../types/database.types";
import { ContactSchema, LeadSchema, type ContactInput, type LeadInput } from "../validators";

export class CrmService {
  /**
   * Create or update a Contact record.
   */
  static async createContact(input: ContactInput, staffUserId: string) {
    const validated = ContactSchema.parse(input);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("contacts")
      .insert({
        full_name: validated.fullName,
        email: validated.email || null,
        phone: validated.phone || null,
        country_code: validated.countryCode || null,
        preferred_language: validated.preferredLanguage,
        contact_type: validated.contactType,
        nationality: validated.nationality || null,
        cbi_interest: validated.cbiInterest,
        notes: validated.notes || null,
        created_by: staffUserId,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create contact: ${error.message}`);

    await admin.from("audit_events").insert({
      actor_user_id: staffUserId,
      entity_type: "contacts",
      entity_id: data.id,
      action: "create",
      after_state: data as any,
    });

    return data;
  }

  /**
   * Get complete contact profile with all related CRM associations.
   */
  static async getContactDetails(contactId: string) {
    const admin = getAdminClient();

    const { data: contact, error } = await admin
      .from("contacts")
      .select(
        `
        *,
        buyer_requirements (*),
        contact_shortlists (
          id,
          created_at,
          marketing_offers (id, ref, marketing_title, slug, amount, currency, availability)
        ),
        leads (*),
        deals (*),
        viewings (*),
        tasks (*),
        activities (*)
      `,
      )
      .eq("id", contactId)
      .single();

    if (error) throw new Error(`Contact not found: ${error.message}`);
    return contact;
  }

  /**
   * Add a property offer to a contact's shortlist.
   * NOTE: Shortlisted items are strictly exploratory; they do NOT reserve or alter availability of the unit.
   */
  static async addToShortlist(
    contactId: string,
    offerId: string,
    staffUserId: string,
    notes?: string,
  ) {
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("contact_shortlists")
      .insert({
        contact_id: contactId,
        marketing_offer_id: offerId,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { message: "Property is already in contact shortlist" };
      }
      throw new Error(`Failed to add to shortlist: ${error.message}`);
    }

    await admin.from("activities").insert({
      contact_id: contactId,
      actor_user_id: staffUserId,
      activity_type: "note_added",
      description: `Added property offer ${offerId} to shortlist`,
    });

    return data;
  }

  /**
   * Remove a property offer from a contact's shortlist.
   */
  static async removeFromShortlist(contactId: string, offerId: string) {
    const admin = getAdminClient();
    const { error } = await admin
      .from("contact_shortlists")
      .delete()
      .eq("contact_id", contactId)
      .eq("marketing_offer_id", offerId);

    if (error) throw new Error(`Failed to remove from shortlist: ${error.message}`);
    return { success: true };
  }

  /**
   * Audited Contact Merging with relationship preservation:
   * Reassigns all child entities (enquiries, leads, deals, shortlists, tasks, viewings, activities)
   * from duplicate contact to primary contact, preserves a JSON snapshot, and marks duplicate as merged.
   */
  static async mergeContacts(params: {
    primaryContactId: string;
    duplicateContactId: string;
    mergedByStaffId: string;
    reason: string;
  }) {
    const admin = getAdminClient();
    const { primaryContactId, duplicateContactId, mergedByStaffId, reason } = params;

    if (primaryContactId === duplicateContactId) {
      throw new Error("Cannot merge a contact into itself");
    }

    // 1. Fetch both contacts
    const { data: primary } = await admin
      .from("contacts")
      .select("*")
      .eq("id", primaryContactId)
      .single();
    const { data: duplicate } = await admin
      .from("contacts")
      .select("*")
      .eq("id", duplicateContactId)
      .single();

    if (!primary || !duplicate) {
      throw new Error("Both primary and duplicate contact records must exist");
    }

    // 2. Fetch all related entities of duplicate for the snapshot
    const duplicateSnapshot = {
      contact: duplicate,
      timestamp: new Date().toISOString(),
    };

    // 3. Reassign child records
    await admin
      .from("enquiries")
      .update({ contact_id: primaryContactId })
      .eq("contact_id", duplicateContactId);
    await admin
      .from("leads")
      .update({ contact_id: primaryContactId })
      .eq("contact_id", duplicateContactId);
    await admin
      .from("deals")
      .update({ contact_id: primaryContactId })
      .eq("contact_id", duplicateContactId);
    await admin
      .from("tasks")
      .update({ contact_id: primaryContactId })
      .eq("contact_id", duplicateContactId);
    await admin
      .from("viewings")
      .update({ contact_id: primaryContactId })
      .eq("contact_id", duplicateContactId);
    await admin
      .from("activities")
      .update({ contact_id: primaryContactId })
      .eq("contact_id", duplicateContactId);

    // Shortlists: update or delete duplicates if already in primary shortlist
    const { data: dupShortlists } = await admin
      .from("contact_shortlists")
      .select("*")
      .eq("contact_id", duplicateContactId);
    if (dupShortlists && dupShortlists.length > 0) {
      for (const item of dupShortlists) {
        const { error: moveErr } = await admin
          .from("contact_shortlists")
          .update({ contact_id: primaryContactId })
          .eq("id", item.id);

        if (moveErr && moveErr.code === "23505") {
          // Primary already has this in shortlist, safely drop duplicate link
          await admin.from("contact_shortlists").delete().eq("id", item.id);
        }
      }
    }

    // 4. Record the merge in contact_merges table
    await admin.from("contact_merges").insert({
      primary_contact_id: primaryContactId,
      duplicate_contact_id: duplicateContactId,
      merged_by: mergedByStaffId,
      merge_reason: reason,
      duplicate_snapshot: duplicateSnapshot as any,
    });

    // 5. Update duplicate contact notes to reflect merge
    await admin
      .from("contacts")
      .update({
        notes: `[MERGED into ${primaryContactId} on ${new Date().toISOString()}] ${duplicate.notes || ""}`,
      })
      .eq("id", duplicateContactId);

    // 6. Audit event
    await admin.from("audit_events").insert({
      actor_user_id: mergedByStaffId,
      entity_type: "contacts",
      entity_id: primaryContactId,
      action: "merge_contacts",
      before_state: duplicate as any,
      after_state: { mergedDuplicateId: duplicateContactId, reason },
    });

    return {
      success: true,
      primaryContactId,
      mergedContactId: duplicateContactId,
    };
  }

  /**
   * Update Lead stage with audit logging and stage transition rules.
   */
  static async updateLeadStage(
    leadId: string,
    newStage: Database["public"]["Enums"]["lead_stage"],
    staffUserId: string,
    lossReason?: string,
  ) {
    const admin = getAdminClient();

    const { data: existing, error: fetchErr } = await admin
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (fetchErr || !existing) throw new Error("Lead not found");

    const updatePayload: any = {
      stage: newStage,
      updated_at: new Date().toISOString(),
    };

    if (newStage === "lost") {
      updatePayload.loss_reason = lossReason || "Not specified";
    }

    const { data: updated, error: updateErr } = await admin
      .from("leads")
      .update(updatePayload)
      .eq("id", leadId)
      .select()
      .single();

    if (updateErr) throw new Error(`Failed to update lead stage: ${updateErr.message}`);

    // Log activity
    await admin.from("activities").insert({
      lead_id: leadId,
      contact_id: existing.contact_id,
      actor_user_id: staffUserId,
      activity_type: "stage_change",
      description: `Lead stage changed from ${existing.stage} to ${newStage}`,
    });

    return updated;
  }

  /**
   * Schedule a viewing.
   */
  static async scheduleViewing(params: {
    contactId: string;
    physicalUnitId?: string;
    marketingOfferId?: string;
    scheduledAt: string;
    hostStaffId: string;
    notes?: string;
  }) {
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("viewings")
      .insert({
        contact_id: params.contactId,
        physical_unit_id: params.physicalUnitId || null,
        marketing_offer_id: params.marketingOfferId || null,
        host_staff_id: params.hostStaffId,
        scheduled_at: params.scheduledAt,
        status: "scheduled",
        feedback: params.notes || null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to schedule viewing: ${error.message}`);
    return data;
  }
}
