export type PageSlug =
  | "home"
  | "about"
  | "citizenship"
  | "contact"
  | "services"
  | "why-turkiye"
  | "investment-in-turkiye"
  | "investment-catalog"
  | "privacy-policy"
  | "terms"
  | "cookie-policy"
  | "investment-disclaimer";

export type PublishedStatus = "Draft" | "In Review" | "Published" | "Archived";

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  meta_description?: string | undefined;
  published_status: PublishedStatus;
}

export type RepeatableCardType = "metric" | "testimonial" | "feature";

export interface RepeatableCardItem {
  id: string;
  type: RepeatableCardType;
  label?: string | undefined;
  value?: string | undefined;
  description?: string | undefined;
  quote?: string | undefined;
  author?: string | undefined;
  title?: string | undefined;
  avatar?: string | undefined;
  icon?: string | undefined;
}

export interface CmsSectionContent {
  title?: string | undefined;
  subtitle?: string | undefined;
  kicker?: string | undefined;
  paragraphs?: string[] | undefined;
  cta_label?: string | undefined;
  cta_link?: string | undefined;
  cta_style?: ("primary" | "secondary") | undefined;
  background_image?: string | undefined;
  background_overlay?: ("none" | "dark" | "light") | undefined;
  enquiry?: boolean | undefined;
  is_visible?: boolean | undefined;
  repeatable_items?: RepeatableCardItem[] | undefined;
  [key: string]: unknown;
}

export interface CmsSection {
  id: string;
  page_id: string;
  section_key: string;
  title: string;
  sort_order: number;
  is_visible: boolean;
  content_json: CmsSectionContent;
  created_at?: string | undefined;
  updated_at?: string | undefined;
}

export const PUBLIC_PAGES: Array<{ slug: PageSlug; title: string; defaultSections: string[] }> = [
  {
    slug: "home",
    title: "Homepage",
    defaultSections: [
      "hero",
      "about-preview",
      "highlights",
      "services-preview",
      "testimonials",
      "contact-cta",
    ],
  },
  {
    slug: "about",
    title: "About Us",
    defaultSections: ["hero", "heritage", "leadership", "values"],
  },
  {
    slug: "citizenship",
    title: "Citizenship by Investment",
    defaultSections: ["hero", "overview", "statutory-criteria", "process", "faq-preview"],
  },
  {
    slug: "contact",
    title: "Contact & Advisory",
    defaultSections: ["hero", "consultation", "offices", "direct-channels"],
  },
  {
    slug: "services",
    title: "Advisory Services",
    defaultSections: ["hero", "portfolio-services", "legal-desk", "process-timeline"],
  },
  {
    slug: "why-turkiye",
    title: "Why Türkiye & Istanbul",
    defaultSections: ["hero", "lifestyle", "macro-fundamentals", "districts-overview"],
  },
];

export function normalizeSection(raw: Record<string, unknown>): CmsSection {
  const contentObj =
    typeof raw["content_json"] === "object" &&
    raw["content_json"] !== null &&
    !Array.isArray(raw["content_json"])
      ? (raw["content_json"] as Record<string, unknown>)
      : {};

  const paragraphs = Array.isArray(contentObj["paragraphs"])
    ? (contentObj["paragraphs"] as unknown[]).filter((p): p is string => typeof p === "string")
    : typeof raw["content_json"] === "string"
      ? (raw["content_json"] as string)
          .split(/\n\s*\n/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const repeatableItems: RepeatableCardItem[] = Array.isArray(contentObj["repeatable_items"])
    ? (contentObj["repeatable_items"] as RepeatableCardItem[])
    : [];

  const isVisible = raw["is_visible"] !== false && contentObj["is_visible"] !== false;

  return {
    id: String(raw["id"] || `sec-${crypto.randomUUID()}`),
    page_id: String(raw["page_id"] || ""),
    section_key: String(raw["section_key"] || "section"),
    title: String(raw["title"] || contentObj["title"] || "Untitled Section"),
    sort_order: Number.isFinite(Number(raw["sort_order"])) ? Number(raw["sort_order"]) : 0,
    is_visible: isVisible,
    content_json: {
      ...contentObj,
      title: String(contentObj["title"] || raw["title"] || ""),
      subtitle: typeof contentObj["subtitle"] === "string" ? contentObj["subtitle"] : "",
      kicker: typeof contentObj["kicker"] === "string" ? contentObj["kicker"] : "",
      paragraphs,
      cta_label: typeof contentObj["cta_label"] === "string" ? contentObj["cta_label"] : "",
      cta_link: typeof contentObj["cta_link"] === "string" ? contentObj["cta_link"] : "",
      cta_style: contentObj["cta_style"] === "secondary" ? "secondary" : "primary",
      background_image:
        typeof contentObj["background_image"] === "string" ? contentObj["background_image"] : "",
      background_overlay: (contentObj["background_overlay"] as "none" | "dark" | "light") || "dark",
      enquiry: contentObj["enquiry"] === true,
      is_visible: isVisible,
      repeatable_items: repeatableItems,
    },
    created_at: typeof raw["created_at"] === "string" ? raw["created_at"] : undefined,
    updated_at: typeof raw["updated_at"] === "string" ? raw["updated_at"] : undefined,
  };
}

export function serializeSection(section: CmsSection): Record<string, unknown> {
  const content = {
    ...section.content_json,
    title: section.title,
    is_visible: section.is_visible,
  };

  return {
    id: section.id,
    page_id: section.page_id,
    section_key: section.section_key,
    title: section.title,
    sort_order: section.sort_order,
    is_visible: section.is_visible,
    content_json: content,
    _include_enquiry: section.content_json.enquiry === true,
  };
}

export function reorderSections(
  sections: CmsSection[],
  fromIndex: number,
  toIndex: number,
): CmsSection[] {
  if (fromIndex < 0 || fromIndex >= sections.length || toIndex < 0 || toIndex >= sections.length) {
    return sections;
  }
  const cloned = [...sections];
  const [moved] = cloned.splice(fromIndex, 1);
  if (!moved) return sections;
  cloned.splice(toIndex, 0, moved);

  return cloned.map((sec, idx) => ({
    ...sec,
    sort_order: idx + 1,
  }));
}

export function moveSectionUp(sections: CmsSection[], index: number): CmsSection[] {
  if (index <= 0) return sections;
  return reorderSections(sections, index, index - 1);
}

export function moveSectionDown(sections: CmsSection[], index: number): CmsSection[] {
  if (index >= sections.length - 1) return sections;
  return reorderSections(sections, index, index + 1);
}

export function toggleSectionVisibility(sections: CmsSection[], sectionId: string): CmsSection[] {
  return sections.map((sec) => {
    if (sec.id === sectionId) {
      const nextVisible = !sec.is_visible;
      return {
        ...sec,
        is_visible: nextVisible,
        content_json: {
          ...sec.content_json,
          is_visible: nextVisible,
        },
      };
    }
    return sec;
  });
}
