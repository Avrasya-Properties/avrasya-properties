import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { DEMO_MODE, publicSupabase } from "@/lib/supabase";
import { properties as source, type PropertyRecord } from "./properties";
import { DEFAULT_SITE_SETTINGS, type Property } from "@/admin/demo";
import { listingPreview } from "@/admin/listing-preview";
import { decodeSettings, type Row } from "@/admin/mappers";
const record = z
  .object({
    slug: z.string(),
    marketing_title: z.string(),
    city: z.string(),
    location_label: z.string().nullable(),
    side: z.string(),
    record_type: z.enum(["unit_offer", "unit_type", "package", "project", "ambiguous_offer"]),
    layout_label: z.string().nullable(),
    price: z
      .object({
        currency: z.enum(["USD", "TRY", "EUR", "GBP"]).nullable(),
        amount: z.number().nullable(),
        basis: z.string(),
        status: z.string(),
      })
      .passthrough(),
    areas: z.array(
      z
        .object({ value_m2: z.number(), basis: z.enum(["gross", "net", "unspecified"]) })
        .passthrough(),
    ),
    source_ids: z.array(z.string()),
    availability_verified: z.boolean(),
    details: z.record(z.unknown()),
  })
  .passthrough();
export async function loadCatalogue(): Promise<PropertyRecord[]> {
  if (DEMO_MODE) {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("avrasya-admin-db-v4");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed?.properties)) {
            const demoProps = parsed.properties as Property[];
            const map = new Map(demoProps.map((p) => [p.slug, p]));
            const sourceSlugs = new Set(source.map((item) => item.slug));
            const mapped = source
              .filter((item) => {
                const dp = map.get(item.slug);
                return dp ? dp.publication === "Published" : true;
              })
              .map((item) => {
                const dp = map.get(item.slug);
                if (!dp) return item;
                const preview = listingPreview(dp, { source_record: item });
                return {
                  ...item,
                  ...preview,
                  price: {
                    ...item.price,
                    ...preview.price,
                    amount: dp.amount !== undefined ? dp.amount : item.price.amount,
                    currency: (dp.currency as any) || item.price.currency,
                  },
                  areas: preview.areas.length > 0 ? preview.areas : item.areas,
                  details: {
                    ...item.details,
                    ...preview.details,
                  },
                };
              });
            const extra = demoProps
              .filter((dp) => dp.publication === "Published" && !sourceSlugs.has(dp.slug))
              .map((dp) => listingPreview(dp));
            return [...mapped, ...extra];
          }
        }
      } catch {
        /* intentionally ignored */
      }
    }
    return source;
  }
  const { data, error } = await publicSupabase.rpc("published_catalogue");
  if (error)
    throw new Error("The property catalogue is unavailable. Please contact our advisory team.");
  // One malformed row must never blank the whole catalogue: keep valid rows, skip bad ones.
  if (!Array.isArray(data))
    throw new Error("The property catalogue is unavailable. Please contact our advisory team.");
  const valid: PropertyRecord[] = [];
  for (const row of data) {
    const parsed = record.safeParse(row);
    if (parsed.success) valid.push(parsed.data as unknown as PropertyRecord);
    else if (import.meta.env.DEV)
      console.warn("Skipped malformed catalogue row", parsed.error.issues[0]);
  }
  if (data.length > 0 && valid.length === 0)
    throw new Error("The property catalogue is unavailable. Please contact our advisory team.");
  return valid;
}
export function useCatalogue() {
  const q = useQuery({
    queryKey: ["published-catalogue"],
    queryFn: loadCatalogue,
    staleTime: DEMO_MODE ? 0 : 15000,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });
  return { ...q, properties: q.data || [] };
}
export async function loadPublicSettings() {
  if (DEMO_MODE) {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("avrasya-admin-db-v4");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.siteSettings) return parsed.siteSettings;
        }
      } catch {
        /* intentionally ignored */
      }
    }
    return DEFAULT_SITE_SETTINGS;
  }
  const { data, error } = await publicSupabase
    .from("site_settings")
    .select("*")
    .eq("singleton_key", "default")
    .single();
  if (error) throw error;
  return decodeSettings(data as Row);
}
export function usePublicSettings() {
  const q = useQuery({
    queryKey: ["site-settings"],
    queryFn: loadPublicSettings,
    enabled: !DEMO_MODE,
    staleTime: 15000,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });
  return { ...q, settings: q.data || DEFAULT_SITE_SETTINGS };
}
export async function resolveRedirect(slug: string): Promise<string | null> {
  const { data, error } = await publicSupabase.rpc("published_redirect", { p_slug: slug });
  if (error) throw error;
  return data as string | null;
}

export function useManagedPage(slug: string) {
  return useQuery({
    queryKey: ["website-page", slug],
    queryFn: async () => {
      if (DEMO_MODE) {
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("avrasya_admin_manage_demo_v2");
            if (raw) {
              const parsed = JSON.parse(raw);
              const page = (parsed?.content_pages || []).find((p: any) => p.slug === slug);
              if (page) {
                const sections = (parsed?.content_sections || []).filter(
                  (s: any) => s.page_id === page.id,
                );
                return {
                  published: page.published_status === "Published",
                  title: page.title,
                  meta_description: page.meta_description,
                  sections: sections.map((s: any) => ({
                    title: s.title,
                    content_json: s.content_json,
                  })),
                };
              }
            }
          } catch {
            /* intentionally ignored */
          }
        }
        return null;
      }
      const { data, error } = await publicSupabase.rpc("website_page", { p_slug: slug });
      if (error) throw error;
      return data as {
        published: boolean;
        title?: string;
        meta_description?: string;
        sections?: { title: string | null; content_json: Record<string, unknown> }[];
      } | null;
    },
    staleTime: 15000,
    refetchInterval: 30000,
  });
}

export function usePublishedDocuments() {
  return useQuery({
    queryKey: ["catalogue-documents"],
    queryFn: async () => {
      if (DEMO_MODE) {
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("avrasya_admin_manage_demo_v2");
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed?.catalog_documents))
                return parsed.catalog_documents.filter((d: any) => d.is_published !== false);
            }
          } catch {
            /* intentionally ignored */
          }
        }
        return [
          {
            title: "Avrasya Istanbul Investment & Citizenship Catalog (2026 Edition)",
            storage_path: "/documents/avrasya-investment-catalog-2026.pdf",
            disclaimer: "Confidential institutional memorandum.",
          },
        ];
      }
      const { data, error } = await publicSupabase
        .from("catalog_documents")
        .select("title,storage_path,disclaimer")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as { title: string; storage_path: string; disclaimer: string | null }[];
    },
    staleTime: 15000,
    refetchInterval: 30000,
  });
}

export type ManagedService = {
  id: string;
  title: string;
  category: string | null;
  description: string;
  process_steps: unknown[];
  icon?: string | null;
  cta_label?: string | null;
  cta_link?: string | null;
  slug?: string | null;
  is_published?: boolean;
  sort_order?: number;
};
export type ManagedFaq = { id: string; question: string; answer: string; category: string | null };

export async function getPublishedServices(): Promise<ManagedService[]> {
  if (DEMO_MODE) {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("avrasya_admin_manage_demo_v2");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed?.services)) {
            return parsed.services.filter((s: any) => s.is_published !== false);
          }
        }
      } catch {
        /* intentionally ignored */
      }
    }
    return [
      {
        id: "srv-1",
        title: "Luxury Property Acquisition",
        category: "Advisory",
        description: "Bespoke acquisition advisory for prime Istanbul residential portfolios.",
        process_steps: [
          "Investor Discovery Consultation",
          "Curated Portfolio Shortlist",
          "On-site Private Inspections",
          "Price & Commercial Term Negotiation",
        ],
        icon: "Building",
        cta_label: "Consult an Advisor",
        cta_link: "/contact?topic=acquisition",
      },
      {
        id: "srv-2",
        title: "Turkish Citizenship by Investment ($400,000)",
        category: "Legal & Statutory",
        description:
          "Full legal guidance and turnkey application processing for qualifying Istanbul property under statutory regulations.",
        process_steps: [
          "Statutory Due Diligence & Valuation",
          "Escrow & Title Transfer",
          "Conformity Certificate Issuance",
          "Passport & National ID Delivery",
        ],
        icon: "ShieldCheck",
        cta_label: "Verify Eligibility",
        cta_link: "/citizenship",
      },
      {
        id: "srv-3",
        title: "Independent Legal Due Diligence",
        category: "Legal & Statutory",
        description:
          "Comprehensive title deed (Tapu), zoning clearance, and lien-free audits conducted exclusively by independent Bar-certified Turkish attorneys.",
        process_steps: [
          "Cadastral Register Verification",
          "Municipal Zoning Audit",
          "Encumbrance & Mortgage Check",
          "Independent Legal Opinion Report",
        ],
        icon: "FileCheck2",
        cta_label: "Request Legal Audit",
        cta_link: "/contact?topic=legal",
      },
    ];
  }
  const { data, error } = await publicSupabase
    .from("services")
    .select("id,title,category,description,process_steps,icon,cta_label,cta_link,slug,sort_order")
    .eq("is_published", true)
    .order("sort_order");
  if (error) throw error;
  return data as ManagedService[];
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: () => getPublishedServices(),
    staleTime: 15000,
    refetchInterval: 30000,
  });
}

export function useFaqs() {
  return useQuery({
    queryKey: ["faqs"],
    queryFn: async (): Promise<ManagedFaq[]> => {
      if (DEMO_MODE) {
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("avrasya_admin_manage_demo_v2");
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed?.faqs))
                return parsed.faqs.filter((f: any) => f.is_published !== false);
            }
          } catch {
            /* intentionally ignored */
          }
        }
        return [
          {
            id: "faq-1",
            question: "What is the statutory threshold for Turkish Citizenship by Investment?",
            answer:
              "The statutory threshold under Article 20 of the Regulation on Implementation of the Turkish Citizenship Law is $400,000 USD (or equivalent foreign currency converted via DAB). The property must carry a 3-year no-sale annotation on the Tapu.",
            category: "Citizenship",
          },
          {
            id: "faq-2",
            question: "Can foreign nationals purchase freehold real estate in Türkiye?",
            answer:
              "Yes. Property acquisitions in Türkiye are 100% freehold (Mülkiyet) and protected by constitutional property rights. Foreign buyers receive an official government title deed (Tapu Senedi).",
            category: "Ownership & Legal",
          },
          {
            id: "faq-3",
            question: "What are the standard closing costs when acquiring property in Istanbul?",
            answer:
              "Standard statutory closing costs comprise: 4% Title Deed (Tapu) conveyance duty, official valuation report, revolving capital fund fee, and notary fees.",
            category: "Financial",
          },
        ];
      }
      const { data, error } = await publicSupabase
        .from("faqs")
        .select("id,question,answer,category")
        .eq("is_published", true)
        .order("sort_order");
      if (error) throw error;
      return data as { id: string; question: string; answer: string; category: string }[];
    },
    staleTime: 15000,
    refetchInterval: 30000,
  });
}
