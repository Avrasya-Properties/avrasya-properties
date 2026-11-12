import { randomUUID } from "node:crypto";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as store from "@/admin/demo";
import {
  type CmsSection,
  type RepeatableCardItem,
  normalizeSection,
  serializeSection,
  reorderSections,
  moveSectionUp,
  moveSectionDown,
  toggleSectionVisibility,
  PUBLIC_PAGES,
} from "@/admin/cms/types";
import { RepeatableCardsEditor } from "@/admin/cms/RepeatableCardsEditor";
import { UnsavedChangesDialog, useUnsavedChangesGuard } from "@/admin/cms/UnsavedChangesGuard";
import { Header, Footer } from "@/components/site/Chrome";
import * as routeTreeGen from "@/routeTree.gen";

// Mock DEMO_MODE so useSiteSettings() uses demo store consistently during unit tests
vi.mock("@/lib/supabase", () => ({
  DEMO_MODE: true,
  SUPABASE_URL: "https://test.supabase.co",
  SUPABASE_KEY: "test-anon-key",
  supabase: {},
  publicSupabase: {},
}));

// Mock router hooks for testing components outside full RouterProvider while preserving real exports
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    useRouterState: () => "/",
    useRouter: () => null,
    useBlocker: () => ({ status: "idle", proceed: vi.fn(), reset: vi.fn() }),
    Link: ({
      to,
      children,
      ...props
    }: {
      to: string;
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => (
      <a href={typeof to === "string" ? to : "#"} {...props}>
        {children}
      </a>
    ),
  };
});

describe("Milestone M3 Empirical Adversarial Challenge Suite (Challenger 1)", () => {
  const workspace = () => JSON.parse(localStorage.getItem("avrasya-admin-db-v4")!) as store.DB;
  const signIn = (role: store.Role) => store.login(role + "@avrasya.test", store.DEMO_PASSWORD);

  let queryClient: QueryClient;

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  beforeEach(() => {
    vi.stubGlobal("crypto", { randomUUID });
    vi.stubEnv("VITE_ENABLE_ADMIN_DEMO", "true");
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    signIn("admin");
    store.resetData();
    localStorage.removeItem("avrasya_admin_manage_demo_v2");
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  // =========================================================================
  // 1. SECTION REORDERING INVARIANTS & BOUNDARY SAFETY
  // =========================================================================
  describe("1. Section Reordering Invariants & Boundary Safety", () => {
    const makeSection = (id: string, sort_order: number, is_visible = true): CmsSection => ({
      id,
      page_id: "cp-home",
      section_key: `key-${id}`,
      title: `Section ${id}`,
      sort_order,
      is_visible,
      content_json: { title: `Section ${id}`, paragraphs: [] },
    });

    it("invariant: normalizes duplicate and negative sort_orders to strictly contiguous 1-based order", () => {
      // Adversarial input: duplicate sort orders, negative numbers, and zeroes
      const dirtySections: CmsSection[] = [
        makeSection("sec-a", -50),
        makeSection("sec-b", 0),
        makeSection("sec-c", 10),
        makeSection("sec-d", 10), // duplicate
        makeSection("sec-e", -1),
      ];

      // Reorder sec-e (index 4) to index 1
      const reordered = reorderSections(dirtySections, 4, 1);

      expect(reordered).toHaveLength(5);
      // All sort_orders MUST be contiguous positive integers [1, 2, 3, 4, 5]
      const sortOrders = reordered.map((s) => s.sort_order);
      expect(sortOrders).toEqual([1, 2, 3, 4, 5]);

      // Verify correct element positions
      expect(reordered[0]!.id).toBe("sec-a");
      expect(reordered[1]!.id).toBe("sec-e"); // moved to index 1
      expect(reordered[2]!.id).toBe("sec-b");
      expect(reordered[3]!.id).toBe("sec-c");
      expect(reordered[4]!.id).toBe("sec-d");
    });

    it("invariant: reordering in place (fromIndex === toIndex) repairs contaminated sort_orders", () => {
      const dirtySections: CmsSection[] = [
        makeSection("sec-1", 999),
        makeSection("sec-2", -999),
        makeSection("sec-3", 0),
      ];

      const reordered = reorderSections(dirtySections, 0, 0);

      expect(reordered.map((s) => s.sort_order)).toEqual([1, 2, 3]);
      expect(reordered.map((s) => s.id)).toEqual(["sec-1", "sec-2", "sec-3"]);
    });

    it("bounds safety: rejects out-of-bounds fromIndex without mutation or side effects", () => {
      const sections = [makeSection("s1", 1), makeSection("s2", 2)];

      // Negative fromIndex
      const resultNeg = reorderSections(sections, -1, 1);
      expect(resultNeg).toBe(sections);

      // fromIndex >= length
      const resultTooHigh = reorderSections(sections, 5, 0);
      expect(resultTooHigh).toBe(sections);
    });

    it("bounds safety: rejects out-of-bounds toIndex without mutation or side effects", () => {
      const sections = [makeSection("s1", 1), makeSection("s2", 2)];

      // Negative toIndex
      const resultNeg = reorderSections(sections, 0, -5);
      expect(resultNeg).toBe(sections);

      // toIndex >= length
      const resultTooHigh = reorderSections(sections, 0, 10);
      expect(resultTooHigh).toBe(sections);
    });

    it("boundary navigation: moveSectionUp at index 0 and negative index safely returns original array", () => {
      const sections = [makeSection("first", 1), makeSection("second", 2)];

      const movedZero = moveSectionUp(sections, 0);
      expect(movedZero).toBe(sections);
      expect(movedZero[0]!.id).toBe("first");

      const movedNegative = moveSectionUp(sections, -2);
      expect(movedNegative).toBe(sections);
    });

    it("boundary navigation: moveSectionDown at last index and beyond safely returns original array", () => {
      const sections = [makeSection("first", 1), makeSection("second", 2)];

      const movedLast = moveSectionDown(sections, 1);
      expect(movedLast).toBe(sections);
      expect(movedLast[1]!.id).toBe("second");

      const movedBeyond = moveSectionDown(sections, 10);
      expect(movedBeyond).toBe(sections);
    });

    it("handles empty sections array across all reordering helpers without throwing", () => {
      expect(reorderSections([], 0, 0)).toEqual([]);
      expect(moveSectionUp([], 0)).toEqual([]);
      expect(moveSectionDown([], 0)).toEqual([]);
      expect(toggleSectionVisibility([], "any-id")).toEqual([]);
    });

    it("stress generator: maintains contiguous positive 1-based order under 50 randomized permutations", () => {
      const N = 10;
      let current = Array.from({ length: N }, (_, i) =>
        makeSection(`gen-${i}`, Math.floor(Math.random() * 200) - 100),
      );

      for (let run = 0; run < 50; run++) {
        const from = Math.floor(Math.random() * N);
        const to = Math.floor(Math.random() * N);
        current = reorderSections(current, from, to);

        // Assert strictly contiguous [1..N]
        expect(current).toHaveLength(N);
        const orders = current.map((s) => s.sort_order);
        const expected = Array.from({ length: N }, (_, i) => i + 1);
        expect(orders).toEqual(expected);

        // Assert all original elements are preserved (no duplicates or drops)
        const uniqueIds = new Set(current.map((s) => s.id));
        expect(uniqueIds.size).toBe(N);
      }
    });
  });

  // =========================================================================
  // 2. REPEATABLE CARDS VALIDATION & BOUNDARY EDGE CASES
  // =========================================================================
  describe("2. Repeatable Cards Validation & Edge Cases", () => {
    it("rejects whitespace-only label or value when adding a metric card", () => {
      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => { });
      const onChange = vi.fn();

      render(<RepeatableCardsEditor items={[]} onChange={onChange} />);

      // Click + Metric
      const addMetricBtn = screen.getByRole("button", { name: /\+ Metric/i });
      fireEvent.click(addMetricBtn);

      // Type whitespace-only strings
      const valueInput = screen.getByPlaceholderText("$420M+");
      const labelInput = screen.getByPlaceholderText("Portfolio Managed");

      fireEvent.change(valueInput, { target: { value: "    " } });
      fireEvent.change(labelInput, { target: { value: "  \t  " } });

      // Click Apply
      const applyBtn = screen.getByRole("button", { name: /Apply/i });
      fireEvent.click(applyBtn);

      expect(alertMock).toHaveBeenCalledWith("Metric label and value are required.");
      expect(onChange).not.toHaveBeenCalled();
    });

    it("rejects whitespace-only quote or author when adding a testimonial card", () => {
      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => { });
      const onChange = vi.fn();

      render(<RepeatableCardsEditor items={[]} onChange={onChange} />);

      // Click + Testimonial
      const addTestimonialBtn = screen.getByRole("button", { name: /\+ Testimonial/i });
      fireEvent.click(addTestimonialBtn);

      const quoteInput = screen.getByPlaceholderText(/Avrasya guided our family/i);
      const authorInput = screen.getByPlaceholderText("Tariq Al-Mansoor");

      fireEvent.change(quoteInput, { target: { value: "   \n   " } });
      fireEvent.change(authorInput, { target: { value: "    " } });

      const applyBtn = screen.getByRole("button", { name: /Apply/i });
      fireEvent.click(applyBtn);

      expect(alertMock).toHaveBeenCalledWith("Testimonial quote and author are required.");
      expect(onChange).not.toHaveBeenCalled();
    });

    it("rejects whitespace-only title or description when adding a feature card", () => {
      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => { });
      const onChange = vi.fn();

      render(<RepeatableCardsEditor items={[]} onChange={onChange} />);

      // Click + Feature
      const addFeatureBtn = screen.getByRole("button", { name: /\+ Feature/i });
      fireEvent.click(addFeatureBtn);

      const titleInput = screen.getByPlaceholderText("Direct Title Deed Verification");
      const descInput = screen.getByPlaceholderText(/Independent Bar-certified attorneys/i);

      fireEvent.change(titleInput, { target: { value: "  " } });
      fireEvent.change(descInput, { target: { value: "   " } });

      const applyBtn = screen.getByRole("button", { name: /Apply/i });
      fireEvent.click(applyBtn);

      expect(alertMock).toHaveBeenCalledWith("Feature title and description are required.");
      expect(onChange).not.toHaveBeenCalled();
    });

    it("disables boundary reorder buttons (index 0 move up, last index move down)", () => {
      const items: RepeatableCardItem[] = [
        { id: "c1", type: "metric", label: "Metric 1", value: "100" },
        { id: "c2", type: "metric", label: "Metric 2", value: "200" },
      ];
      const onChange = vi.fn();

      render(<RepeatableCardsEditor items={items} onChange={onChange} />);

      const upButtons = screen.getAllByLabelText("Move card up");
      const downButtons = screen.getAllByLabelText("Move card down");

      expect(upButtons).toHaveLength(2);
      expect(downButtons).toHaveLength(2);

      // Index 0 up button MUST be disabled
      expect(upButtons[0]).toBeDisabled();
      // Index 0 down button MUST be enabled
      expect(downButtons[0]).not.toBeDisabled();

      // Index 1 up button MUST be enabled
      expect(upButtons[1]).not.toBeDisabled();
      // Index 1 down button MUST be disabled
      expect(downButtons[1]).toBeDisabled();

      // Clicking disabled button produces NO onChange call
      fireEvent.click(upButtons[0]!);
      expect(onChange).not.toHaveBeenCalled();
    });

    it("renders empty state cleanly when all cards are removed or initial items are empty", () => {
      const onChange = vi.fn();
      const { rerender } = render(<RepeatableCardsEditor items={[]} onChange={onChange} />);

      expect(
        screen.getByText(
          /No repeatable cards in this section\. Add a metric, testimonial, or feature card above\./i,
        ),
      ).toBeInTheDocument();

      // Now pass populated list
      const items: RepeatableCardItem[] = [
        { id: "c1", type: "metric", label: "Metric 1", value: "100" },
      ];
      rerender(<RepeatableCardsEditor items={items} onChange={onChange} />);

      expect(screen.queryByText(/No repeatable cards in this section/i)).not.toBeInTheDocument();
      expect(screen.getByText("100 — Metric 1")).toBeInTheDocument();

      // Confirm mock to allow deletion
      vi.spyOn(window, "confirm").mockReturnValue(true);
      const deleteBtn = screen.getByLabelText("Delete card");
      fireEvent.click(deleteBtn);

      expect(onChange).toHaveBeenCalledWith([]);

      // Rerender with empty result
      rerender(<RepeatableCardsEditor items={[]} onChange={onChange} />);
      expect(
        screen.getByText(
          /No repeatable cards in this section\. Add a metric, testimonial, or feature card above\./i,
        ),
      ).toBeInTheDocument();
    });

    it("stress test: accepts and safely handles oversized (10,000 character) strings without crashing", () => {
      const onChange = vi.fn();
      render(<RepeatableCardsEditor items={[]} onChange={onChange} />);

      fireEvent.click(screen.getByRole("button", { name: /\+ Feature/i }));

      const titleInput = screen.getByPlaceholderText("Direct Title Deed Verification");
      const descInput = screen.getByPlaceholderText(/Independent Bar-certified attorneys/i);

      const hugeTitle = "A".repeat(500);
      const hugeDescription = "B".repeat(10000);

      fireEvent.change(titleInput, { target: { value: hugeTitle } });
      fireEvent.change(descInput, { target: { value: hugeDescription } });

      fireEvent.click(screen.getByRole("button", { name: /Apply/i }));

      expect(onChange).toHaveBeenCalledTimes(1);
      const firstCall = onChange.mock.calls[0];
      expect(firstCall).toBeDefined();
      const saved = firstCall![0] as RepeatableCardItem[];
      expect(saved).toHaveLength(1);
      expect(saved[0]!.title).toBe(hugeTitle);
      expect(saved[0]!.description).toBe(hugeDescription);
    });
  });

  // =========================================================================
  // 3. UNSAVED CHANGES GUARD STRESS TESTING
  // =========================================================================
  describe("3. Unsaved Changes Guard Lifecycle Stress Testing", () => {
    it("attaches beforeunload listener when isDirty=true and cleans up when isDirty=false", () => {
      const addListenerSpy = vi.spyOn(window, "addEventListener");
      const removeListenerSpy = vi.spyOn(window, "removeEventListener");

      // Render with isDirty = false
      const { rerender } = render(<UnsavedChangesDialog isDirty={false} />);
      expect(addListenerSpy).not.toHaveBeenCalledWith("beforeunload", expect.any(Function));

      // Toggle isDirty = true
      rerender(<UnsavedChangesDialog isDirty={true} />);
      expect(addListenerSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));

      // Trigger beforeunload event on window
      const event = new Event("beforeunload", { cancelable: true }) as BeforeUnloadEvent;
      window.dispatchEvent(event);

      // Verify that event was intercepted with unsaved changes prompt
      expect(event.defaultPrevented).toBe(true);

      // Toggle back to isDirty = false
      rerender(<UnsavedChangesDialog isDirty={false} />);
      expect(removeListenerSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
    });

    it("verifies useUnsavedChangesGuard hook lifecycle outside of dialog rendering", () => {
      const addListenerSpy = vi.spyOn(window, "addEventListener");
      const removeListenerSpy = vi.spyOn(window, "removeEventListener");

      function TestHookComponent({ dirty }: { dirty: boolean }) {
        useUnsavedChangesGuard(dirty);
        return <div>Hook active: {String(dirty)}</div>;
      }

      const { rerender, unmount } = render(<TestHookComponent dirty={true} />);
      expect(addListenerSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));

      rerender(<TestHookComponent dirty={false} />);
      expect(removeListenerSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));

      unmount();
    });
  });

  // =========================================================================
  // 4. NAVIGATION & FOOTER DYNAMIC CUSTOMIZATION & NULL-SAFETY
  // =========================================================================
  describe("4. Dynamic Navigation & Footer Management & Null Safety", () => {
    it("excludes navigation items with is_visible: false from public nav while preserving them in store", () => {
      const customNav = [
        { label: "Visible Portfolio", href: "/properties", order: 1, is_visible: true },
        { label: "Hidden Internal VIP", href: "/vip", order: 2, is_visible: false },
        { label: "Visible Services", href: "/services", order: 3, is_visible: true },
      ];

      store.updateSiteSettings({
        navigationItems: customNav,
        websiteDesign: {
          navigation: JSON.stringify(customNav),
        },
      });

      // Verify stored in admin settings
      const settings = workspace().siteSettings;
      expect(settings.navigationItems).toHaveLength(3);
      expect(settings.navigationItems?.find((n) => n.href === "/vip")?.is_visible).toBe(false);

      // Render Header component inside QueryClientProvider
      renderWithProviders(<Header />);

      // The visible items MUST be rendered in navigation
      expect(screen.getByText("Visible Portfolio")).toBeInTheDocument();
      expect(screen.getByText("Visible Services")).toBeInTheDocument();

      // The hidden item MUST NOT be rendered
      expect(screen.queryByText("Hidden Internal VIP")).not.toBeInTheDocument();
    });

    it("handles undefined footerSettings gracefully and falls back to default columns", () => {
      store.updateSiteSettings({
        footerSettings: undefined,
        websiteDesign: {},
      });

      expect(() => renderWithProviders(<Footer />)).not.toThrow();

      // Default quick link column should be rendered
      expect(screen.getAllByText("Quick Link").length).toBeGreaterThanOrEqual(1);
    });

    it("handles empty columns array (footerSettings.columns = []) and falls back to defaults without error", () => {
      store.updateSiteSettings({
        footerSettings: {
          columns: [],
        },
      });

      expect(() => renderWithProviders(<Footer />)).not.toThrow();
      expect(screen.getAllByText("Quick Link").length).toBeGreaterThanOrEqual(1);
    });

    it("handles footer columns with empty links array (col.links = []) without throwing runtime errors", () => {
      store.updateSiteSettings({
        footerSettings: {
          columns: [
            {
              title: "Empty Links Column",
              links: [],
            },
          ],
        },
      });

      expect(() => renderWithProviders(<Footer />)).not.toThrow();
      expect(screen.getByText("Empty Links Column")).toBeInTheDocument();
    });

    it("reveals architectural vulnerability: footer column with undefined links throws TypeError", () => {
      // In adversarial challenge: what if Supabase/CMS delivers a column without a 'links' array?
      store.updateSiteSettings({
        footerSettings: {
          columns: [
            {
              title: "Corrupted Column Without Links Array",
            } as any,
          ],
        },
      });

      // Chrome.tsx line 513 calls col.links.map(...) without optional chaining
      // This test captures and verifies the exact empirical failure mode
      expect(() => renderWithProviders(<Footer />)).toThrow(
        /Cannot read properties of undefined \(reading 'map'\)/,
      );
    });
  });

  // =========================================================================
  // 5. LIVE ROUTE RESOLUTION & ROUTE TREE INTEGRITY
  // =========================================================================
  describe("5. Live Route Resolution & Route Tree Integrity", () => {
      it("resolves /admin/cms through the route tree (no live server needed)", async () => {
        const { createRouter } = await vi.importActual<typeof import("@tanstack/react-router")>(
          "@tanstack/react-router",
        );
        const router = createRouter({
          routeTree: routeTreeGen.routeTree,
          context: { queryClient: new QueryClient() },
        });
        const matches = router.matchRoutes("/admin/cms");
        expect(matches.at(-1)?.routeId).toBe("/admin/cms");
        expect(matches.some((m) => m.routeId === "/admin")).toBe(true);
      });

      it("verifies routeTree.gen.ts exports AdminCmsRoute registered under /admin/cms", () => {
        // Check that AdminCmsRoute is generated and registered
        expect(routeTreeGen.routeTree).toBeDefined();
        expect(typeof routeTreeGen.routeTree).toBe("object");

        // Verify that the route tree stringifies with /admin and child /cms in the structure
        const routeTreeStr = JSON.stringify(routeTreeGen.routeTree);
        expect(routeTreeStr).toContain('"path":"/admin"');
        expect(routeTreeStr).toContain('"path":"/cms"');
      });
    });
  });
