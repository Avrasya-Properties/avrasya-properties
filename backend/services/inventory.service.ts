import { getSupabaseClient, getAdminClient } from "../config";
import type { Database } from "../types/database.types";
import { MarketingOfferSchema } from "../validators";
import { z } from "zod";

export interface OfferFilterOptions {
  district?: string;
  side?: "Europe" | "Asia" | "unknown";
  mode?: "sale" | "rent";
  minPrice?: number;
  maxPrice?: number;
  currency?: "USD" | "TRY" | "EUR" | "GBP";
  layoutLabel?: string;
  cbiEligible?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: "price_asc" | "price_desc" | "newest";
}

export interface SlugLookupResult {
  found: boolean;
  offer?: Database["public"]["Tables"]["marketing_offers"]["Row"];
  redirect?: {
    newSlug: string;
    redirectType: number;
  };
}

export class InventoryService {
  /**
   * Public Catalog: Returns ONLY published offers, strictly honoring RLS and snapshot isolation.
   */
  static async getPublicOffers(options: OfferFilterOptions = {}) {
    const client = getSupabaseClient();
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(50, Math.max(1, options.pageSize || 12));
    const offset = (page - 1) * pageSize;

    let query = client
      .from("marketing_offers")
      .select("id, ref, slug, marketing_title, district, city, side, record_type, mode, layout_label, bathrooms, gross_m2, net_m2, area_m2, amount, currency, price_type, price_basis, expenses_amount, availability, cover_image_path, cbi_eligible, cbi_verified, published_snapshot, published_at", { count: "exact" })
      .eq("publication_status", "Published");

    if (options.district) {
      query = query.ilike("district", `%${options.district}%`);
    }
    if (options.side) {
      query = query.eq("side", options.side);
    }
    if (options.mode) {
      query = query.eq("mode", options.mode);
    }
    if (options.minPrice !== undefined) {
      query = query.gte("amount", options.minPrice);
    }
    if (options.maxPrice !== undefined) {
      query = query.lte("amount", options.maxPrice);
    }
    if (options.currency) {
      query = query.eq("currency", options.currency);
    }
    if (options.cbiEligible !== undefined) {
      query = query.eq("cbi_eligible", options.cbiEligible);
    }

    if (options.sortBy === "price_asc") {
      query = query.order("amount", { ascending: true });
    } else if (options.sortBy === "price_desc") {
      query = query.order("amount", { ascending: false });
    } else {
      query = query.order("published_at", { ascending: false, nullsFirst: false });
    }

    query = query.range(offset, offset + pageSize - 1);

    const { data, count, error } = await query;
    if (error) {
      throw new Error(`Failed to query public offers: ${error.message}`);
    }

    return {
      offers: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }

  /**
   * Look up an offer by slug. If not found among published offers, checks for registered redirects.
   */
  static async getPublicOfferBySlug(slug: string): Promise<SlugLookupResult> {
    const client = getSupabaseClient();

    // 1. Direct match on published offer
    const { data: offer, error: offerError } = await client
      .from("marketing_offers")
      .select(`
        *,
        pricing_options (*),
        offer_amenities (
          amenities (*)
        )
      `)
      .eq("slug", slug)
      .eq("publication_status", "Published")
      .maybeSingle();

    if (offer) {
      return { found: true, offer };
    }

    // 2. Check property_slug_redirects
    const { data: redirect, error: redirectError } = await client
      .from("property_slug_redirects")
      .select("new_slug, redirect_type")
      .eq("old_slug", slug)
      .maybeSingle();

    if (redirect) {
      return {
        found: false,
        redirect: {
          newSlug: redirect.new_slug,
          redirectType: redirect.redirect_type,
        },
      };
    }

    return { found: false };
  }

  /**
   * Admin / Staff: Get offer by ID (draft or published)
   */
  static async getOfferByIdForStaff(offerId: string) {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("marketing_offers")
      .select(`
        *,
        pricing_options (*),
        package_memberships (
          physical_units (*)
        ),
        offer_amenities (
          amenities (*)
        ),
        publication_history (*)
      `)
      .eq("id", offerId)
      .single();

    if (error) throw new Error(`Offer not found: ${error.message}`);
    return data;
  }

  /**
   * Admin / Staff: Create marketing offer in Draft status.
   */
  static async createDraftOffer(input: z.infer<typeof MarketingOfferSchema>, staffUserId: string) {
    const validated = MarketingOfferSchema.parse(input);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("marketing_offers")
      .insert({
        ref: validated.ref,
        slug: validated.slug,
        marketing_title: validated.marketing_title,
        district: validated.district,
        city: validated.city,
        side: validated.side,
        record_type: validated.record_type,
        mode: validated.mode,
        layout_label: validated.layout_label,
        bathrooms: validated.bathrooms,
        gross_m2: validated.gross_m2,
        net_m2: validated.net_m2,
        area_m2: validated.area_m2,
        amount: validated.amount,
        currency: validated.currency,
        price_type: validated.price_type,
        price_basis: validated.price_basis,
        expenses_amount: validated.expenses_amount,
        availability: validated.availability,
        publication_status: "Draft",
        cover_image_path: validated.cover_image_path,
        description: validated.description,
        source_note: validated.source_note,
        claims_requiring_confirmation: validated.claims_requiring_confirmation,
        cbi_eligible: validated.cbi_eligible,
        cbi_verified: validated.cbi_verified,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create marketing offer: ${error.message}`);

    // Audit log
    await admin.from("audit_events").insert({
      actor_user_id: staffUserId,
      entity_type: "marketing_offers",
      entity_id: data.id,
      action: "create_draft",
      after_state: data as any,
    });

    return data;
  }

  /**
   * Admin / Staff: Update an existing draft marketing offer.
   * If slug is modified, records a 301 redirect from old slug to new slug.
   */
  static async updateOffer(offerId: string, updates: Partial<z.infer<typeof MarketingOfferSchema>>, staffUserId: string) {
    const admin = getAdminClient();

    // Fetch existing
    const { data: existing, error: fetchErr } = await admin
      .from("marketing_offers")
      .select("*")
      .eq("id", offerId)
      .single();

    if (fetchErr || !existing) throw new Error(`Offer not found: ${fetchErr?.message}`);

    // Handle slug change redirect tracking
    if (updates.slug && updates.slug !== existing.slug) {
      await admin.from("property_slug_redirects").insert({
        offer_id: offerId,
        old_slug: existing.slug,
        new_slug: updates.slug,
        redirect_type: 301,
      });
    }

    const { data: updated, error: updateErr } = await admin
      .from("marketing_offers")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", offerId)
      .select()
      .single();

    if (updateErr) throw new Error(`Failed to update offer: ${updateErr.message}`);

    // Audit log
    await admin.from("audit_events").insert({
      actor_user_id: staffUserId,
      entity_type: "marketing_offers",
      entity_id: offerId,
      action: "update",
      before_state: existing as any,
      after_state: updated as any,
    });

    return updated;
  }

  /**
   * Atomic Publication via Postgres stored procedure.
   * Atomically snapshots the published state, sets publication_status = 'Published', and logs history.
   */
  static async publishOffer(offerId: string, staffUserId: string, changelog?: string) {
    const admin = getAdminClient();

    const { data, error } = await admin.rpc("publish_offer_atomic", {
      p_offer_id: offerId,
      p_published_by: staffUserId,
      p_changelog: changelog || "Published by staff",
    });

    if (error) {
      throw new Error(`Atomic publication failed: ${error.message}`);
    }

    return data;
  }

  /**
   * Atomic Unpublish via Postgres stored procedure.
   */
  static async unpublishOffer(offerId: string, staffUserId: string, reason?: string) {
    const admin = getAdminClient();

    const { data, error } = await admin.rpc("unpublish_offer", {
      p_offer_id: offerId,
      p_reason: reason || "Unpublished by staff",
    });

    if (error) {
      throw new Error(`Unpublish failed: ${error.message}`);
    }

    return data;
  }

  /**
   * Package Management: Assign physical units to a package marketing offer.
   */
  static async setPackageMembers(packageOfferId: string, unitIds: string[], staffUserId: string) {
    const admin = getAdminClient();

    // Verify package offer
    const { data: offer } = await admin
      .from("marketing_offers")
      .select("id, record_type")
      .eq("id", packageOfferId)
      .single();

    if (!offer || offer.record_type !== "package") {
      throw new Error("Specified offer is not configured as a package record type");
    }

    // Remove old memberships
    await admin.from("package_memberships").delete().eq("package_offer_id", packageOfferId);

    // Insert new memberships
    if (unitIds.length > 0) {
      const rows = unitIds.map((uId, idx) => ({
        package_offer_id: packageOfferId,
        physical_unit_id: uId,
        allocation_percentage: Math.round((100 / unitIds.length) * 100) / 100,
        sort_order: idx,
      }));

      const { error: insertErr } = await admin.from("package_memberships").insert(rows);
      if (insertErr) throw new Error(`Failed to assign package members: ${insertErr.message}`);
    }

    return { packageOfferId, memberCount: unitIds.length };
  }
}
