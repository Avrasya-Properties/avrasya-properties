import { publicSupabase } from "./supabase";
import type { PublicEnquiryInput } from "@/admin/demo";

/** How long a visitor waits before we stop and tell them the request may not have arrived. */
export const ENQUIRY_TIMEOUT_MS = 20000;

export type EnquiryErrorKind = "server" | "timeout" | "network" | "unconfirmed" | "input";

/** Carries a machine-readable kind so the form can show a translated, accurate message. */
export class EnquiryError extends Error {
  constructor(message: string, readonly kind: EnquiryErrorKind) {
    super(message);
    this.name = "EnquiryError";
  }
}

/** A receipt means the server saved the enquiry. There is no demo fallback here. */
export async function submitPublicEnquiry(input: PublicEnquiryInput): Promise<{ receipt: string }> {
  if (input.consent !== true) throw new EnquiryError("Please consent to being contacted.", "input");
  if (!input.idempotencyKey) throw new EnquiryError("Please refresh the form and try again.", "input");
  const { data, error } = await publicSupabase.functions.invoke("submit-enquiry", {
    body: {
      name: input.name, email: input.email, phone: input.phone, topic: input.topic,
      budget: input.budget || "", message: input.message, propertySlug: input.propertySlug,
      consent: input.consent, idempotencyKey: input.idempotencyKey, website: input.website || "",
    },
    timeout: ENQUIRY_TIMEOUT_MS,
  });
  if (error) {
    const name = (error as { name?: string }).name || "";
    const context = (error as { context?: unknown }).context;
    // The request never got an HTTP answer: either our timeout fired or the network failed.
    if (name === "FunctionsFetchError" || !(context instanceof Response)) {
      const text = String((context as { name?: string; message?: string } | undefined)?.name || "") + " " + String((context as { message?: string } | undefined)?.message || "") + " " + (error.message || "");
      const timedOut = /abort|timeout|timed out/i.test(text);
      throw new EnquiryError(
        timedOut ? "The connection timed out. Please try again." : "We could not reach our server. Please try again.",
        timedOut ? "timeout" : "network",
      );
    }
    let detail = "We could not save your enquiry. Please try again or contact us directly.";
    try {
      const body = await context.json();
      if (typeof body?.error === "string" && body.error) detail = body.error;
    } catch { /* Keep a useful message for a non-JSON response. */ }
    throw new EnquiryError(detail, "server");
  }
  if (typeof data?.receipt !== "string" || !data.receipt.trim()) {
    throw new EnquiryError("We could not confirm that your enquiry was saved. Please try again.", "unconfirmed");
  }
  return { receipt: data.receipt };
}