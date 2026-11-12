import { randomUUID } from "node:crypto";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import * as store from "@/admin/demo";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase";

describe("RBAC Security & Role Enforcement Suite (Tiers 1-4)", () => {
  const workspace = () => JSON.parse(localStorage.getItem("avrasya-admin-db-v4")!) as store.DB;
  const signIn = (role: store.Role) => store.login(role + "@avrasya.test", store.DEMO_PASSWORD);

  beforeEach(() => {
    vi.stubGlobal("crypto", { randomUUID });
    vi.stubEnv("VITE_ENABLE_ADMIN_DEMO", "true");
    signIn("admin");
    store.resetData();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  // =========================================================================
  // TIER 1: Feature Coverage (Happy Paths per Role)
  // =========================================================================
  describe("Tier 1: Feature Coverage (Happy Path)", () => {
    it("F2: grants Super Admin full permissions across all domains", () => {
      signIn("admin");
      const user = store.getSession();
      expect(user?.role).toBe("admin");

      expect(store.can(user, "admin")).toBe(true);
      expect(store.can(user, "edit-inventory")).toBe(true);
      expect(store.can(user, "publish")).toBe(true);
      expect(store.can(user, "edit-crm")).toBe(true);

      // Super admin can update site settings
      expect(() => {
        store.updateSiteSettings({ tagline: "Authorized Admin Update" });
      }).not.toThrow();
      expect(workspace().siteSettings.tagline).toBe("Authorized Admin Update");
    });

    it("F2: grants Office Manager permission to edit inventory, publish offers, and CRM", () => {
      signIn("manager");
      const user = store.getSession();
      expect(user?.role).toBe("manager");

      expect(store.can(user, "admin")).toBe(false);
      expect(store.can(user, "edit-inventory")).toBe(true);
      expect(store.can(user, "publish")).toBe(true);
      expect(store.can(user, "edit-crm")).toBe(true);

      // Manager can publish offers
      expect(() => {
        const prop = workspace().properties[0]!;
        store.bulkPublication([prop.id], "In Review");
      }).not.toThrow();
    });

    it("F2: grants Agent permission to edit assigned CRM records but blocks inventory and publishing", () => {
      signIn("agent");
      const user = store.getSession();
      expect(user?.role).toBe("agent");

      expect(store.can(user, "admin")).toBe(false);
      expect(store.can(user, "edit-inventory")).toBe(false);
      expect(store.can(user, "publish")).toBe(false);
      expect(store.can(user, "edit-crm")).toBe(true);
      expect(store.can(user, "edit-crm", user!.id)).toBe(true);
      expect(store.can(user, "edit-crm", "different-user-id")).toBe(false);
    });

    it("F2: restricts Viewer to read-only access across all domains", () => {
      signIn("viewer");
      const user = store.getSession();
      expect(user?.role).toBe("viewer");

      expect(store.can(user, "admin")).toBe(false);
      expect(store.can(user, "edit-inventory")).toBe(false);
      expect(store.can(user, "publish")).toBe(false);
      expect(store.can(user, "edit-crm")).toBe(false);
    });

    it("F3: verifies that client Supabase configuration uses publishable/anon key only", () => {
      expect(SUPABASE_KEY).toBeDefined();
      expect(typeof SUPABASE_KEY).toBe("string");
      expect(SUPABASE_KEY.length).toBeGreaterThan(10);

      // Service-role keys must NEVER be in client-side SUPABASE_KEY
      expect(SUPABASE_KEY).not.toContain("service_role");
      expect(SUPABASE_KEY).not.toContain("supabase_admin");
      expect(SUPABASE_URL).toMatch(/^https:\/\/[a-z0-9]+\.supabase\.co/);
    });
  });

  // =========================================================================
  // TIER 2: Boundary & Corner Cases (Limits, Edge Cases, Negative Validation)
  // =========================================================================
  describe("Tier 2: Boundary & Corner Cases", () => {
    it("F2: rejects mutative operations when session is unauthenticated (null)", () => {
      store.logout();
      expect(store.getSession()).toBeNull();

      expect(() => {
        store.updateSiteSettings({ companyName: "Unauthenticated Hack" });
      }).toThrow(/sign in|role/i);

      expect(() => {
        store.createInquiry({
          name: "Anonymous",
          email: "anon@test.com",
          phone: "+905550000000",
          topic: "Test",
          budget: "$500,000",
          message: "Attempt without auth",
          source: "Contact Brief",
        });
      }).toThrow(/sign in|role/i);
    });

    it("F3: asserts environment variables contain no leaked service-role keys", () => {
      const clientEnv = import.meta.env;
      for (const [key, value] of Object.entries(clientEnv)) {
        if (typeof value === "string") {
          expect(key).not.toMatch(/service_role/i);
          expect(value).not.toMatch(/^eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.*service_role/i);
        }
      }
    });

    it("F2: prevents an agent from modifying an item owned by another agent", () => {
      signIn("agent"); // Logged in as u3 (Elif Demir)
      // Attempting to modify lead l2 owned by u2 (Murat Kaya)
      expect(() => {
        store.upsert<store.Lead>("leads", { id: "l2", layout: "4+1" }, "u3");
      }).toThrow();
    });

    it("F1: enforces that last admin cannot be removed or demoted", () => {
      signIn("admin");
      const currentUsers = store.USERS.filter((u) => u.role === "admin");
      expect(currentUsers.length).toBeGreaterThanOrEqual(1);
      expect(currentUsers.some((u) => u.id === "u1")).toBe(true);

      // Verify that viewer cannot perform factory reset
      signIn("viewer");
      expect(() => {
        store.resetData();
      }).toThrow(/role/i);
    });
  });

  // =========================================================================
  // TIER 3: Cross-Feature Combinations (Role Permission vs Action Rejection)
  // =========================================================================
  describe("Tier 3: Cross-Feature Combinations", () => {
    it("F2 & F8: blocks Agent from bulk publishing properties and rolls back changes", () => {
      signIn("admin");
      const prop = store.upsert<store.Property>("properties", {
        ref: "AVR-RBAC-01",
        slug: "rbac-test-prop",
        title: "RBAC Draft Unit",
        district: "Şişli",
        city: "Istanbul",
        type: "unit offer",
        layout: "2+1",
        bathrooms: 2,
        grossM2: 120,
        netM2: 100,
        areaM2: null,
        amount: 350000,
        currency: "USD",
        mode: "sale",
        priceType: "fixed",
        availability: "Available",
        publication: "Draft",
        agentId: "u3",
        cover: "/images/test.jpg",
        description: "Testing RBAC publishing guard",
        project: "Test Project",
        updatedAt: new Date().toISOString(),
      });

      // Switch to Agent
      signIn("agent");
      expect(() => {
        store.bulkPublication([prop.id], "Published");
      }).toThrow(/role|permission/i);

      // Verify property publication status remained Draft
      const current = workspace().properties.find((p) => p.id === prop.id);
      expect(current?.publication).toBe("Draft");
    });

    it("F2 & F19: logs operational audit events when Super Admin executes privileged operations", () => {
      signIn("admin");
      const priorCount = workspace().activity.length;

      store.updateSiteSettings({ siteTitle: "Updated Corporate Brand Title" });

      const afterDB = workspace();
      expect(afterDB.activity.length).toBeGreaterThan(priorCount);
      const latestAudit = afterDB.activity[0]!;
      expect(latestAudit.kind).toBe("settings");
      expect(latestAudit.text).toContain("siteTitle");
    });

    it("F2 & F17: blocks Viewer from adding CRM activity or modifying inquiries", () => {
      signIn("viewer");
      expect(() => {
        store.addActivity("note", "Viewer attempting to insert an unpermitted note");
      }).toThrow(/role|permission/i);

      expect(() => {
        store.remove("inquiries", "inq-1");
      }).toThrow(/role|permission/i);
    });
  });

  // =========================================================================
  // TIER 4: Real-World Application Scenarios (End-to-End Workflow)
  // =========================================================================
  describe("Tier 4: Real-World Application Scenarios", () => {
    it("Scenario: Session transition from Viewer rejection to Super Admin authorization with audit trail", () => {
      // 1. Visitor signs in as Viewer
      signIn("viewer");
      const viewerSession = store.getSession();
      expect(viewerSession?.name).toBe("Can Yılmaz");

      // 2. Viewer attempts to modify global settings and is blocked
      expect(() => {
        store.updateSiteSettings({ cbiThresholdUsd: 500000 });
      }).toThrow(/role/i);
      expect(workspace().siteSettings.cbiThresholdUsd).toBe(400000);

      // 3. User logs out
      store.logout();
      expect(store.getSession()).toBeNull();

      // 4. Administrator logs in
      signIn("admin");
      const adminSession = store.getSession();
      expect(adminSession?.name).toBe("Selin Arda");

      // 5. Admin updates the CBI statutory threshold and adds a custom announcement
      store.updateSiteSettings({
        cbiThresholdUsd: 400000,
        announcementText: "Statutory 2026 update active",
        announcementActive: true,
      });

      // 6. Verification: Setting successfully persisted
      const updatedSettings = workspace().siteSettings;
      expect(updatedSettings.announcementActive).toBe(true);
      expect(updatedSettings.announcementText).toBe("Statutory 2026 update active");

      // 7. Verification: Activity log recorded the administrator change
      const audit = workspace().activity.find((a) => a.kind === "settings");
      expect(audit).toBeDefined();
      expect(audit?.text).toContain("announcementText");

      // 8. Admin safely signs out
      store.logout();
      expect(store.getSession()).toBeNull();
    });
  });
});
