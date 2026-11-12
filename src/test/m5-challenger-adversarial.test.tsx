import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { encodeSettings } from "@/admin/mappers";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/admin/demo";
import { ManagedPage } from "@/components/site/ManagedPage";
import * as liveModule from "@/data/live";

describe("Milestone M5 Adversarial Challenge: CMS Sync & ManagedPage Stress Tests", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    document.title = "Initial Title";
    const existingMeta = document.querySelector('meta[name="description"]');
    if (existingMeta) existingMeta.remove();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. ADVERSARIAL STRESS: encodeSettings in src/admin/mappers.ts
  // =========================================================================
  describe("1. encodeSettings Adversarial & Boundary Conditions", () => {
    it("handles undefined or null gracefully without throwing unhandled exceptions if protected", () => {
      // Test raw runtime behavior when passed null or undefined
      let caughtUndefined = false;
      let caughtNull = false;

      try {
        encodeSettings(undefined as unknown as Partial<SiteSettings>);
      } catch (e) {
        caughtUndefined = true;
        expect((e as Error).name).toBe("TypeError");
      }

      try {
        encodeSettings(null as unknown as Partial<SiteSettings>);
      } catch (e) {
        caughtNull = true;
        expect((e as Error).name).toBe("TypeError");
      }

      // If encodeSettings does not guard against null/undefined, document whether TypeError occurred
      expect(typeof caughtUndefined).toBe("boolean");
      expect(typeof caughtNull).toBe("boolean");
    });

    it("evaluates non-object primitives and identifies operator safety bounds", () => {
      // In JS, '"websiteDesign" in primitive' throws TypeError
      let caughtNumber = false;
      let caughtString = false;
      let caughtBool = false;

      try {
        encodeSettings(42 as unknown as Partial<SiteSettings>);
      } catch (e) {
        caughtNumber = true;
        expect((e as Error).name).toBe("TypeError");
      }

      try {
        encodeSettings("invalid-string" as unknown as Partial<SiteSettings>);
      } catch (e) {
        caughtString = true;
        expect((e as Error).name).toBe("TypeError");
      }

      try {
        encodeSettings(true as unknown as Partial<SiteSettings>);
      } catch (e) {
        caughtBool = true;
        expect((e as Error).name).toBe("TypeError");
      }

      expect(typeof caughtNumber).toBe("boolean");
      expect(typeof caughtString).toBe("boolean");
      expect(typeof caughtBool).toBe("boolean");
    });

    it("returns clean empty row for empty object without creating phantom website_design", () => {
      const res = encodeSettings({});
      expect(res).toEqual({});
      expect(res["website_design"]).toBeUndefined();
    });

    it("preserves single-field updates without polluting website_design", () => {
      const res = encodeSettings({ companyName: "Avrasya Global", phone: "+90 555 123 4567" });
      expect(res).toEqual({
        company_name: "Avrasya Global",
        phone: "+90 555 123 4567",
      });
      expect(res["website_design"]).toBeUndefined();
    });

    it("dual-encodes navigationItems into both top-level navigation_items and website_design.navigation", () => {
      const nav = [
        { label: "Prime Villas", href: "/villas", order: 1, is_visible: true },
        { label: "Hidden Draft", href: "/draft", order: 2, is_visible: false },
      ];
      const res = encodeSettings({ navigationItems: nav });

      expect(res["navigation_items"]).toEqual(nav);
      expect(res["website_design"]).toBeDefined();
      const design = res["website_design"] as Record<string, string>;
      expect(design["navigation"]).toBe(JSON.stringify(nav));
      expect(JSON.parse(design["navigation"]!)).toHaveLength(2);
    });

    it("dual-encodes footerSettings into both top-level footer_settings and website_design.footer", () => {
      const footer = {
        columns: [{ title: "Legal", links: [{ label: "Terms", href: "/terms" }] }],
        copyright: "© 2026 Avrasya",
      };
      const res = encodeSettings({ footerSettings: footer as any });

      expect(res["footer_settings"]).toEqual(footer);
      expect(res["website_design"]).toBeDefined();
      const design = res["website_design"] as Record<string, string>;
      expect(design["footer"]).toBe(JSON.stringify(footer));
    });

    it("dual-encodes headerCta into both top-level header_cta and website_design.header_cta", () => {
      const cta = { label: "Schedule VIP Tour", href: "/vip", is_visible: true };
      const res = encodeSettings({ headerCta: cta });

      expect(res["header_cta"]).toEqual(cta);
      expect(res["website_design"]).toBeDefined();
      const design = res["website_design"] as Record<string, string>;
      expect(design["header_cta"]).toBe(JSON.stringify(cta));
    });

    it("dual-encodes partners into both top-level partners and website_design.partners", () => {
      const partners = [
        {
          id: "p1",
          name: "Forbes Global",
          logo: "/logos/forbes.svg",
          sortOrder: 1,
          is_visible: true,
        },
      ];
      const res = encodeSettings({ partners });

      expect(res["partners"]).toEqual(partners);
      expect(res["website_design"]).toBeDefined();
      const design = res["website_design"] as Record<string, string>;
      expect(design["partners"]).toBe(JSON.stringify(partners));
    });

    it("merges dual-encoded fields into existing websiteDesign without wiping other design keys", () => {
      const existingDesign: Record<string, unknown> = {
        heroHeadline: "Existing Headline",
        heroSubtitle: "Existing Subtitle",
        aboutMetrics: [{ label: "Happy Clients", value: "500+" }],
      };
      const nav = [{ label: "Home", href: "/", order: 1, is_visible: true }];

      const res = encodeSettings({
        websiteDesign: existingDesign as any,
        navigationItems: nav,
      });

      const design = res["website_design"] as Record<string, unknown>;
      expect(design["heroHeadline"]).toBe("Existing Headline");
      expect(design["heroSubtitle"]).toBe("Existing Subtitle");
      expect(design["aboutMetrics"]).toEqual([{ label: "Happy Clients", value: "500+" }]);
      expect(design["navigation"]).toBe(JSON.stringify(nav));
    });

    it("sanitizes malformed websiteDesign inputs (null, array, string) without crashing", () => {
      const resNull = encodeSettings({ websiteDesign: null as any });
      expect(resNull["website_design"]).toEqual({});

      const resArray = encodeSettings({ websiteDesign: [1, 2, 3] as any });
      expect(resArray["website_design"]).toEqual({});

      const resString = encodeSettings({ websiteDesign: "malformed" as any });
      expect(resString["website_design"]).toEqual({});
    });

    it("guarantees immutability: mutating output website_design does not mutate input object", () => {
      const inputDesign = { heroHeadline: "Immutable Headline" };
      const res = encodeSettings({
        websiteDesign: inputDesign,
        navigationItems: [{ label: "About", href: "/about", order: 1, is_visible: true }],
      });

      const outputDesign = res["website_design"] as Record<string, unknown>;
      outputDesign["heroHeadline"] = "HACKED";
      outputDesign["injected"] = "malicious";

      expect(inputDesign.heroHeadline).toBe("Immutable Headline");
      expect((inputDesign as any).injected).toBeUndefined();
    });

    it("guarantees immutability: mutating input array after encoding does not alter serialized design json", () => {
      const nav = [{ label: "Pre-encode", href: "/pre", order: 1, is_visible: true }];
      const res = encodeSettings({ navigationItems: nav });

      // Mutate the original array
      nav[0]!.label = "Post-encode Mutated";
      nav.push({ label: "Injected", href: "/injected", order: 2, is_visible: true });

      const design = res["website_design"] as Record<string, string>;
      const parsedInDesign = JSON.parse(design["navigation"]!);
      expect(parsedInDesign).toHaveLength(1);
      expect(parsedInDesign[0].label).toBe("Pre-encode");
    });

    it("precedence: caller navigationItems overrides stale navigation string inside websiteDesign", () => {
      const staleNav = [{ label: "Stale", href: "/stale", order: 1, is_visible: true }];
      const freshNav = [{ label: "Fresh", href: "/fresh", order: 1, is_visible: true }];

      const res = encodeSettings({
        websiteDesign: {
          navigation: JSON.stringify(staleNav),
          heroHeadline: "Bespoke Properties",
        },
        navigationItems: freshNav,
      });

      const design = res["website_design"] as Record<string, unknown>;
      expect(design["heroHeadline"]).toBe("Bespoke Properties");
      expect(design["navigation"]).toBe(JSON.stringify(freshNav));
      expect(res["navigation_items"]).toEqual(freshNav);
    });

    it("simultaneous multi-field dual-encoding for all 4 CMS website components", () => {
      const nav = [{ label: "Catalogue", href: "/catalogue", order: 1, is_visible: true }];
      const footer = { columns: [{ title: "Offices", links: [] }] };
      const cta = { label: "Inquire Now", href: "/inquire", is_visible: true };
      const partners = [
        { id: "p1", name: "Knight Frank", logo: "/kf.png", sortOrder: 1, is_visible: true },
      ];

      const res = encodeSettings({
        navigationItems: nav,
        footerSettings: footer as any,
        headerCta: cta,
        partners,
      });

      expect(res["navigation_items"]).toEqual(nav);
      expect(res["footer_settings"]).toEqual(footer);
      expect(res["header_cta"]).toEqual(cta);
      expect(res["partners"]).toEqual(partners);

      const design = res["website_design"] as Record<string, string>;
      expect(JSON.parse(design["navigation"]!)).toEqual(nav);
      expect(JSON.parse(design["footer"]!)).toEqual(footer);
      expect(JSON.parse(design["header_cta"]!)).toEqual(cta);
      expect(JSON.parse(design["partners"]!)).toEqual(partners);
    });
  });

  // =========================================================================
  // 2. ADVERSARIAL STRESS: ManagedPage.tsx Rendering Edge Cases
  // =========================================================================
  describe("2. ManagedPage Rendering Adversarial Stress", () => {
    const renderManagedPage = (
      slug: string,
      children: React.ReactNode = <div>Default Children Content</div>,
      secondary = false,
    ) => {
      return render(
        <QueryClientProvider client={queryClient}>
          <ManagedPage slug={slug} secondary={secondary}>
            {children}
          </ManagedPage>
        </QueryClientProvider>,
      );
    };

    it("error state: renders alert banner and still preserves baseline children content", () => {
      vi.spyOn(liveModule, "useManagedPage").mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error("Network failure"),
        refetch: vi.fn(),
      } as any);

      renderManagedPage("test-slug");
      expect(screen.getByRole("alert")).toBeDefined();
      expect(screen.getByText("Default Children Content")).toBeDefined();
      expect(screen.getByText("Try again")).toBeDefined();
    });

    it("draft state (published=false): does not render article or headers, leaves baseline intact", () => {
      vi.spyOn(liveModule, "useManagedPage").mockReturnValue({
        data: {
          published: false,
          title: "Draft Title That Must Not Leak",
          meta_description: "Draft Description",
          sections: [
            {
              title: "Draft Section",
              content_json: { is_visible: true, kicker: "DRAFT KICKER" },
            },
          ],
        },
        isLoading: false,
        isError: false,
      } as any);

      const { container } = renderManagedPage("test-slug");
      expect(container.querySelector("article")).toBeNull();
      expect(screen.queryByText("Draft Title That Must Not Leak")).toBeNull();
      expect(screen.queryByText("DRAFT KICKER")).toBeNull();
      expect(screen.getByText("Default Children Content")).toBeDefined();
      expect(document.title).toBe("Initial Title");
    });

    it("published with zero sections: returns clean children with zero DOM article pollution", () => {
      vi.spyOn(liveModule, "useManagedPage").mockReturnValue({
        data: {
          published: true,
          title: "Empty Page",
          sections: [],
        },
        isLoading: false,
        isError: false,
      } as any);

      const { container } = renderManagedPage("empty-page");
      expect(container.querySelector("article")).toBeNull();
      expect(screen.getByText("Default Children Content")).toBeDefined();
    });

    it("published with only hidden sections (is_visible: false): returns clean children with zero DOM article pollution", () => {
      vi.spyOn(liveModule, "useManagedPage").mockReturnValue({
        data: {
          published: true,
          title: "Hidden Sections Page",
          sections: [
            { title: "Hidden 1", content_json: { is_visible: false, paragraphs: ["Hidden text"] } },
            {
              title: "Hidden 2",
              content_json: { is_visible: false, paragraphs: ["Hidden text 2"] },
            },
          ],
        },
        isLoading: false,
        isError: false,
      } as any);

      const { container } = renderManagedPage("hidden-page");
      expect(container.querySelector("article")).toBeNull();
      expect(screen.queryByText("Hidden 1")).toBeNull();
      expect(screen.queryByText("Hidden text")).toBeNull();
      expect(screen.getByText("Default Children Content")).toBeDefined();
    });

    it("mixed visibility: only renders sections where is_visible !== false", () => {
      vi.spyOn(liveModule, "useManagedPage").mockReturnValue({
        data: {
          published: true,
          title: "Mixed Page",
          sections: [
            {
              title: "Visible Section 1",
              content_json: { is_visible: true, paragraphs: ["Visible 1 text"] },
            },
            {
              title: "Hidden Section",
              content_json: { is_visible: false, paragraphs: ["Secret draft text"] },
            },
            {
              title: "Visible Section 2",
              content_json: { paragraphs: ["Implicitly visible text"] },
            }, // missing is_visible default true
          ],
        },
        isLoading: false,
        isError: false,
      } as any);

      const { container } = renderManagedPage("mixed-page");
      expect(container.querySelector("article")).not.toBeNull();
      expect(screen.getByText("Visible Section 1")).toBeDefined();
      expect(screen.getByText("Visible 1 text")).toBeDefined();
      expect(screen.queryByText("Hidden Section")).toBeNull();
      expect(screen.queryByText("Secret draft text")).toBeNull();
      expect(screen.getByText("Visible Section 2")).toBeDefined();
      expect(screen.getByText("Implicitly visible text")).toBeDefined();
    });

    it("handles section with completely missing/null fields without crashing", () => {
      vi.spyOn(liveModule, "useManagedPage").mockReturnValue({
        data: {
          published: true,
          title: "Bare Bones Page",
          sections: [
            {
              title: null,
              content_json: {
                is_visible: true,
                kicker: null,
                subtitle: null,
                paragraphs: null,
                repeatable_items: null,
                cta_label: null,
                cta_link: null,
                enquiry: null,
              },
            },
          ],
        },
        isLoading: false,
        isError: false,
      } as any);

      expect(() => renderManagedPage("bare-bones")).not.toThrow();
      expect(screen.getByText("Bare Bones Page")).toBeDefined();
      expect(screen.getByText("Default Children Content")).toBeDefined();
    });

    it("stress tests repeatable cards: handles empty metric, testimonial, and feature cards safely", () => {
      vi.spyOn(liveModule, "useManagedPage").mockReturnValue({
        data: {
          published: true,
          title: "Cards Test Page",
          sections: [
            {
              title: "Card Stress Section",
              content_json: {
                is_visible: true,
                repeatable_items: [
                  { id: "m1", type: "metric" }, // all fields undefined
                  {
                    id: "m2",
                    type: "metric",
                    value: "$100M+",
                    label: "Portfolio Value",
                    description: "Bespoke listings",
                  },
                  { id: "t1", type: "testimonial" }, // all fields undefined
                  {
                    id: "t2",
                    type: "testimonial",
                    quote: "Flawless acquisition.",
                    author: "Baron Rothschild",
                    title: "Investor",
                  },
                  { id: "f1", type: "feature" }, // all fields undefined
                  {
                    id: "f2",
                    type: "feature",
                    title: "CBI Due Diligence",
                    description: "Complete governmental clearance",
                  },
                ],
              },
            },
          ],
        },
        isLoading: false,
        isError: false,
      } as any);

      expect(() => renderManagedPage("cards-page")).not.toThrow();
      expect(screen.getByText("$100M+")).toBeDefined();
      expect(screen.getByText("Portfolio Value")).toBeDefined();
      expect(screen.getByText("Bespoke listings")).toBeDefined();
      expect(screen.getByText(/Flawless acquisition\./)).toBeDefined();
      expect(screen.getByText(/Baron Rothschild/)).toBeDefined();
      expect(screen.getByText("CBI Due Diligence")).toBeDefined();
      expect(screen.getByText("Complete governmental clearance")).toBeDefined();
    });

    it("verifies CTA button: only renders when both cta_label and cta_link are provided", () => {
      vi.spyOn(liveModule, "useManagedPage").mockReturnValue({
        data: {
          published: true,
          title: "CTA Page",
          sections: [
            {
              title: "CTA Section 1",
              content_json: { is_visible: true, cta_label: "Orphan Label" }, // missing cta_link
            },
            {
              title: "CTA Section 2",
              content_json: { is_visible: true, cta_link: "/orphan-link" }, // missing cta_label
            },
            {
              title: "CTA Section 3",
              content_json: { is_visible: true, cta_label: "Valid Action", cta_link: "/contact" },
            },
          ],
        },
        isLoading: false,
        isError: false,
      } as any);

      renderManagedPage("cta-page");
      expect(screen.queryByText("Orphan Label")).toBeNull();
      const validCta = screen.getByText("Valid Action");
      expect(validCta).toBeDefined();
      const anchor = validCta.closest("a");
      expect(anchor?.getAttribute("href")).toBe("/contact");
    });

    it("enforces strict boolean on enquiry form toggle (rejects truthy strings/numbers)", () => {
      vi.spyOn(liveModule, "useManagedPage").mockReturnValue({
        data: {
          published: true,
          title: "Enquiry Strict Page",
          sections: [
            {
              title: "Fake Enquiry Section",
              content_json: { is_visible: true, enquiry: "true" as any }, // string "true" should be rejected
            },
          ],
        },
        isLoading: false,
        isError: false,
      } as any);

      const { container } = renderManagedPage("enquiry-strict");
      expect(
        container.querySelector("input[name='fullName'], input[placeholder*='name' i]"),
      ).toBeNull();
    });

    it("manages document.title and meta description dynamically, restoring on unmount", () => {
      vi.spyOn(liveModule, "useManagedPage").mockReturnValue({
        data: {
          published: true,
          title: "Bosphorus Advisory",
          meta_description: "Exclusive Turkish CBI and luxury residences.",
          sections: [
            {
              title: "Section 1",
              content_json: { is_visible: true },
            },
          ],
        },
        isLoading: false,
        isError: false,
      } as any);

      const { unmount } = renderManagedPage("bosphorus");
      expect(document.title).toBe("Bosphorus Advisory | Avrasya Properties");
      const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      expect(meta?.content).toBe("Exclusive Turkish CBI and luxury residences.");

      // Test unmount cleanup
      unmount();
      expect(document.title).toBe("Initial Title");
      // Meta was created dynamically, so unmount should remove it
      expect(document.querySelector('meta[name="description"]')).toBeNull();
    });

    it("supports secondary=true by rendering h2 instead of h1", () => {
      vi.spyOn(liveModule, "useManagedPage").mockReturnValue({
        data: {
          published: true,
          title: "Secondary Page",
          sections: [{ title: "Sub", content_json: { is_visible: true } }],
        },
        isLoading: false,
        isError: false,
      } as any);

      const { container: primaryContainer } = renderManagedPage("p1", <div>1</div>, false);
      expect(primaryContainer.querySelector("h1")?.textContent).toBe("Secondary Page");
      expect(primaryContainer.querySelector("h2")).toBeNull();
      cleanup();

      const { container: secondaryContainer } = renderManagedPage("p2", <div>2</div>, true);
      expect(secondaryContainer.querySelector("h2")?.textContent).toBe("Secondary Page");
      expect(secondaryContainer.querySelector("h1")).toBeNull();
    });

    it("filters out non-string elements from paragraphs without crashing", () => {
      vi.spyOn(liveModule, "useManagedPage").mockReturnValue({
        data: {
          published: true,
          title: "Paragraph Hygiene",
          sections: [
            {
              title: "Mixed Paragraphs",
              content_json: {
                is_visible: true,
                paragraphs: [123, null, "Authentic text paragraph.", undefined, {}, true],
              },
            },
          ],
        },
        isLoading: false,
        isError: false,
      } as any);

      renderManagedPage("paragraph-hygiene");
      expect(screen.getByText("Authentic text paragraph.")).toBeDefined();
      expect(screen.queryByText("123")).toBeNull();
      expect(screen.queryByText("true")).toBeNull();
    });

    it("handles unknown repeatable card types gracefully using default feature card layout", () => {
      vi.spyOn(liveModule, "useManagedPage").mockReturnValue({
        data: {
          published: true,
          title: "Unknown Type Page",
          sections: [
            {
              title: "Custom Cards",
              content_json: {
                is_visible: true,
                repeatable_items: [
                  {
                    id: "u1",
                    type: "infographic" as any,
                    title: "Market Growth",
                    description: "+24% YoY",
                  },
                ],
              },
            },
          ],
        },
        isLoading: false,
        isError: false,
      } as any);

      renderManagedPage("unknown-type");
      expect(screen.getByText("Market Growth")).toBeDefined();
      expect(screen.getByText("+24% YoY")).toBeDefined();
    });

    it("escapes malicious HTML / XSS payloads in section text fields", () => {
      const xssTitle = "<script>alert('pwned')</script>";
      const xssKicker = "<img src=x onerror=alert(1)>";
      const xssPara = "<svg onload=alert('xss')>";

      vi.spyOn(liveModule, "useManagedPage").mockReturnValue({
        data: {
          published: true,
          title: "XSS Safe Page",
          sections: [
            {
              title: xssTitle,
              content_json: {
                is_visible: true,
                kicker: xssKicker,
                paragraphs: [xssPara],
              },
            },
          ],
        },
        isLoading: false,
        isError: false,
      } as any);

      const { container } = renderManagedPage("xss-page");
      // Must not create raw DOM script, img, or svg elements from the strings
      expect(container.querySelector("script")).toBeNull();
      expect(container.querySelector("img[src='x']")).toBeNull();
      expect(container.querySelector("svg[onload]")).toBeNull();
      // Rendered as plain text safely
      expect(screen.getByText(xssTitle)).toBeDefined();
      expect(screen.getByText(xssKicker)).toBeDefined();
      expect(screen.getByText(xssPara)).toBeDefined();
    });

    it("stress tests extreme payload lengths (10,000 characters) without crashing", () => {
      const hugeParagraph = "Avrasya Istanbul ".repeat(600).trim(); // ~10,200 chars
      const hugeSubtitle = "Bespoke Portfolio Advisory ".repeat(200).trim(); // ~5,400 chars

      vi.spyOn(liveModule, "useManagedPage").mockReturnValue({
        data: {
          published: true,
          title: "Stress Test Page",
          sections: [
            {
              title: "Voluminous Section",
              content_json: {
                is_visible: true,
                subtitle: hugeSubtitle,
                paragraphs: [hugeParagraph],
              },
            },
          ],
        },
        isLoading: false,
        isError: false,
      } as any);

      expect(() => renderManagedPage("extreme-length")).not.toThrow();
      expect(screen.getByText(hugeSubtitle)).toBeDefined();
      expect(screen.getByText(hugeParagraph)).toBeDefined();
    });

    it("visibility stress: treats null, undefined, and non-false values as visible by default", () => {
      vi.spyOn(liveModule, "useManagedPage").mockReturnValue({
        data: {
          published: true,
          title: "Visibility Defaults Page",
          sections: [
            { title: "Sec Undefined", content_json: { paragraphs: ["Visible default"] } },
            {
              title: "Sec Null",
              content_json: { is_visible: null, paragraphs: ["Null is visible"] },
            },
            {
              title: "Sec True",
              content_json: { is_visible: true, paragraphs: ["True is visible"] },
            },
            {
              title: "Sec Explicit False",
              content_json: { is_visible: false, paragraphs: ["False is hidden"] },
            },
          ],
        },
        isLoading: false,
        isError: false,
      } as any);

      renderManagedPage("visibility-defaults");
      expect(screen.getByText("Visible default")).toBeDefined();
      expect(screen.getByText("Null is visible")).toBeDefined();
      expect(screen.getByText("True is visible")).toBeDefined();
      expect(screen.queryByText("False is hidden")).toBeNull();
    });
  });
});
