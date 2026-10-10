import { getAdminClient } from "../config";
import type { Database } from "../types/database.types";
import { EnquirySchema, type EnquiryInput } from "../validators";

export interface SubmitEnquiryResult {
  success: boolean;
  message: string;
  referenceId?: string;
}

export class EnquiryService {
  /**
   * Rate limiting helper using PostgreSQL table `rate_limit_entries`.
   * Enforces maxRequests per windowSeconds for a given identifier (IP or hash).
   */
  private static async checkRateLimit(key: string, maxRequests = 5, windowSeconds = 300): Promise<boolean> {
    const admin = getAdminClient();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + windowSeconds * 1000).toISOString();

    // Fetch existing record
    const { data: existing } = await admin
      .from("rate_limit_entries")
      .select("id, request_count, reset_at")
      .eq("rate_key", key)
      .maybeSingle();

    if (!existing) {
      await admin.from("rate_limit_entries").insert({
        rate_key: key,
        request_count: 1,
        reset_at: expiresAt,
      });
      return true;
    }

    if (new Date(existing.reset_at) < now) {
      // Expired, reset count
      await admin
        .from("rate_limit_entries")
        .update({
          request_count: 1,
          reset_at: expiresAt,
          updated_at: now.toISOString(),
        })
        .eq("id", existing.id);
      return true;
    }

    if (existing.request_count >= maxRequests) {
      return false; // Rate limit exceeded
    }

    // Increment count
    await admin
      .from("rate_limit_entries")
      .update({
        request_count: existing.request_count + 1,
        updated_at: now.toISOString(),
      })
      .eq("id", existing.id);

    return true;
  }

  /**
   * Public enquiry submission handler with validation, bot detection, rate limiting, and idempotency.
   */
  static async submitPublicEnquiry(
    rawInput: unknown,
    clientIp: string = "unknown-ip"
  ): Promise<SubmitEnquiryResult> {
    // 1. Validate payload
    const parseResult = EnquirySchema.safeParse(rawInput);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0]?.message || "Invalid input";
      throw new Error(`Validation Error: ${firstIssue}`);
    }
    const input = parseResult.data;

    // 2. Honeypot check (Bot detection)
    if (input.website_hp && input.website_hp.length > 0) {
      // Silently accept bots to prevent them figuring out honeypot, but return benign success
      return {
        success: true,
        message: "Thank you for reaching out. Our team will review your enquiry.",
      };
    }

    // 3. Durable rate limiting per IP
    const rateLimitPassed = await this.checkRateLimit(`enquiry:ip:${clientIp}`, 6, 300);
    if (!rateLimitPassed) {
      throw new Error("Too many enquiries submitted from this location. Please wait a few minutes before trying again.");
    }

    const admin = getAdminClient();

    // 4. Idempotency Check
    if (input.idempotencyKey) {
      const { data: existingByKey } = await admin
        .from("enquiries")
        .select("id, status")
        .eq("idempotency_key", input.idempotencyKey)
        .maybeSingle();

      if (existingByKey) {
        return {
          success: true,
          message: "Enquiry already received. Thank you!",
          referenceId: existingByKey.id,
        };
      }
    }

    // 5. Look up matching property offer if slug provided
    let marketingOfferId: string | null = null;
    if (input.propertySlug) {
      const { data: offer } = await admin
        .from("marketing_offers")
        .select("id")
        .eq("slug", input.propertySlug)
        .maybeSingle();
      if (offer) {
        marketingOfferId = offer.id;
      }
    }

    // 6. Check existing contact to link
    const { data: existingContact } = await admin
      .from("contacts")
      .select("id")
      .or(`email.eq.${input.email},phone.eq.${input.phone}`)
      .limit(1)
      .maybeSingle();

    // 7. Insert Enquiry Record
    const { data: enquiry, error: insertError } = await admin
      .from("enquiries")
      .insert({
        name: input.name,
        email: input.email,
        phone: input.phone,
        topic: input.topic,
        budget: input.budget || null,
        message: input.message,
        source: input.source,
        marketing_offer_id: marketingOfferId,
        campaign_params: (input.campaignParams || {}) as any,
        idempotency_key: input.idempotencyKey || null,
        contact_id: existingContact ? existingContact.id : null,
        status: "new",
      })
      .select("id")
      .single();

    if (insertError) {
      throw new Error(`Could not record enquiry: ${insertError.message}`);
    }

    // 8. Create audit event
    await admin.from("audit_events").insert({
      actor_user_id: null, // Public visitor
      entity_type: "enquiries",
      entity_id: enquiry.id,
      action: "public_submission",
      after_state: {
        name: input.name,
        email: input.email,
        topic: input.topic,
        source: input.source,
        marketing_offer_id: marketingOfferId,
      },
    });

    return {
      success: true,
      message: "Your enquiry has been received successfully. A property advisor will contact you shortly.",
      referenceId: enquiry.id,
    };
  }

  /**
   * Staff/Admin: Convert enquiry to lead idempotently via Postgres function.
   */
  static async convertEnquiryToLead(enquiryId: string, assignedStaffId: string | null = null) {
    const admin = getAdminClient();

    const { data: leadId, error } = await admin.rpc("convert_enquiry_to_lead", {
      p_enquiry_id: enquiryId,
      p_assigned_to: assignedStaffId,
    });

    if (error) {
      throw new Error(`Failed to convert enquiry: ${error.message}`);
    }

    return { success: true, leadId };
  }

  /**
   * Staff: List enquiries with filters and status
   */
  static async listEnquiries(status?: Database["public"]["Enums"]["enquiry_status"]) {
    const admin = getAdminClient();
    let query = admin
      .from("enquiries")
      .select(`
        *,
        marketing_offers (id, ref, marketing_title, slug),
        contacts (id, full_name, email, phone)
      `)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list enquiries: ${error.message}`);
    return data || [];
  }
}
