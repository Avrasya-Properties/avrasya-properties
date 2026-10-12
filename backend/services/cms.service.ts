import { getSupabaseClient, getAdminClient } from "../config";
import type { Database } from "../types/database.types";
import {
  SiteSettingsSchema,
  ContentPageSchema,
  type SiteSettingsInput,
  type ContentPageInput,
} from "../validators";

export class CmsService {
  /**
   * Public: Get current site settings (brand, contacts, public preferences).
   */
  static async getPublicSettings() {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("site_settings")
      .select(
        "brand_name, tagline, contact_email, contact_phone, whatsapp_number, office_address, base_currency, maintenance_mode, cbi_min_investment_usd, exchange_rates",
      )
      .eq("id", "default")
      .single();

    if (error) {
      throw new Error(`Failed to load site settings: ${error.message}`);
    }
    return data;
  }

  /**
   * Admin / Staff: Update site settings with audit log.
   */
  static async updateSettings(input: SiteSettingsInput, staffUserId: string) {
    const validated = SiteSettingsSchema.parse(input);
    const admin = getAdminClient();

    const { data: updated, error } = await admin
      .from("site_settings")
      .update({
        brand_name: validated.brandName,
        tagline: validated.tagline || null,
        contact_email: validated.contactEmail,
        contact_phone: validated.contactPhone,
        whatsapp_number: validated.whatsappNumber,
        office_address: validated.officeAddress,
        base_currency: validated.baseCurrency,
        maintenance_mode: validated.maintenanceMode,
        cbi_min_investment_usd: validated.cbiMinInvestmentUsd,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "default")
      .select()
      .single();

    if (error) throw new Error(`Failed to update site settings: ${error.message}`);

    await admin.from("audit_events").insert({
      actor_user_id: staffUserId,
      entity_type: "site_settings",
      entity_id: "default",
      action: "update_settings",
      after_state: updated as any,
    });

    return updated;
  }

  /**
   * Public: Get content page by slug along with its published content sections.
   */
  static async getPageBySlug(slug: string) {
    const client = getSupabaseClient();

    const { data: page, error } = await client
      .from("content_pages")
      .select(
        `
        id,
        slug,
        title,
        meta_title,
        meta_description,
        content_sections (
          id,
          section_key,
          title,
          subtitle,
          content_json,
          sort_order
        )
      `,
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch page: ${error.message}`);
    return page;
  }

  /**
   * Public: List published services (6 phases).
   */
  static async getServices() {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to fetch services: ${error.message}`);
    return data || [];
  }

  /**
   * Public: List published FAQs.
   */
  static async getFaqs(category?: string) {
    const client = getSupabaseClient();
    let query = client
      .from("faqs")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch FAQs: ${error.message}`);
    return data || [];
  }

  /**
   * Public: List catalog documents (e.g. 17-page PDF catalog).
   */
  static async getCatalogDocuments() {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("catalog_documents")
      .select("*")
      .eq("is_public", true)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to fetch catalog documents: ${error.message}`);
    return data || [];
  }

  /**
   * Admin: Generate a signed download URL for private source files or private deal documents.
   * Expires after 60 minutes by default.
   */
  static async getSignedDocumentUrl(
    bucket: "private-source" | "private-documents",
    storagePath: string,
    expiresInSeconds = 3600,
  ) {
    const admin = getAdminClient();
    const { data, error } = await admin.storage
      .from(bucket)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error) {
      throw new Error(`Failed to generate signed document URL: ${error.message}`);
    }

    return {
      signedUrl: data.signedUrl,
      expiresInSeconds,
    };
  }
}
