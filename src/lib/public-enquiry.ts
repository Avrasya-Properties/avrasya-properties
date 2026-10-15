import { publicSupabase } from "./supabase";
import type { PublicEnquiryInput } from "@/admin/demo";

/** A receipt means the server saved the enquiry. There is no demo fallback here. */
export async function submitPublicEnquiry(input: PublicEnquiryInput): Promise<{ receipt: string }> {
  if (input.consent !== true) throw new Error("Please consent to being contacted.");
  if (!input.idempotencyKey) throw new Error("Please refresh the form and try again.");
  const { data, error } = await publicSupabase.functions.invoke("submit-enquiry", {
    body: {
      name: input.name, email: input.email, phone: input.phone, topic: input.topic,
      budget: input.budget || "", message: input.message, propertySlug: input.propertySlug,
      consent: input.consent, idempotencyKey: input.idempotencyKey, website: input.website || "",
    },
  });
  if (error) {
    let detail = "We could not save your enquiry. Please try again or contact us directly.";
    try {
      const context = (error as { context?: Response }).context;
      const body = await context?.json();
      if (typeof body?.error === "string" && body.error) detail = body.error;
    } catch { /* Keep a useful message for network errors or a non-JSON response. */ }
    throw new Error(detail);
  }
  if (typeof data?.receipt !== "string" || !data.receipt.trim()) {
    throw new Error("We could not confirm that your enquiry was saved. Please try again.");
  }
  return { receipt: data.receipt };
}
