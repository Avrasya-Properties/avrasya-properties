import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_PASSWORD, USERS, can, load, login, logout, remove, resetData } from "./demo";

describe("Admin panel RBAC & property deletion fixes", () => {
  beforeEach(() => {
    localStorage.clear();
    login("admin@avrasya.test", DEMO_PASSWORD);
    resetData();
    logout();
  });

  it("aligns delete-inventory permission with manager+ roles only", () => {
    const admin = USERS.find((u) => u.role === "admin")!;
    const manager = USERS.find((u) => u.role === "manager")!;
    const agent = USERS.find((u) => u.role === "agent")!;
    const viewer = USERS.find((u) => u.role === "viewer")!;

    expect(can(null, "delete-inventory")).toBe(false);
    expect(can(viewer, "delete-inventory")).toBe(false);
    expect(can(agent, "delete-inventory")).toBe(false);
    expect(can(manager, "delete-inventory")).toBe(true);
    expect(can(admin, "delete-inventory")).toBe(true);
  });

  it("blocks agent from deleting a property in demo store while allowing manager", () => {
    const firstProp = load().properties[0];
    if (!firstProp) throw new Error("Expected at least one demo property");

    login("agent@avrasya.test", DEMO_PASSWORD);
    expect(() => remove("properties", firstProp.id)).toThrow(/does not permit/i);
    expect(load().properties.some((p) => p.id === firstProp.id)).toBe(true);

    login("manager@avrasya.test", DEMO_PASSWORD);
    remove("properties", firstProp.id);
    expect(load().properties.some((p) => p.id === firstProp.id)).toBe(false);
  });

  it("remote.remove verifies returned rows and triggers websiteChanged on property delete", async () => {
    vi.resetModules();
    const websiteChanged = vi.fn();
    const deleteSelect = vi.fn();

    vi.doMock("@/lib/website-sync", () => ({ websiteChanged }));
    vi.doMock("./inactivity", () => ({
      freshAdminActivity: vi.fn(),
      watchAdminActivity: vi.fn(),
      beginAdminWork: () => () => {},
    }));
    vi.doMock("@/lib/supabase", () => ({
      DEMO_MODE: false,
      supabase: {
        auth: {
          getSession: async () => ({ data: { session: null } }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        },
        from: () => ({
          delete: () => ({
            eq: () => ({
              select: deleteSelect,
            }),
          }),
        }),
      },
    }));

    const remote = await import("./remote");

    // Simulate RLS silent block (0 rows deleted)
    deleteSelect.mockResolvedValueOnce({ data: [], error: null });
    await expect(remote.remove("properties", "prop-1")).rejects.toThrow(
      /could not be deleted|permission/i,
    );
    expect(websiteChanged).not.toHaveBeenCalled();

    // Simulate successful 1-row delete
    websiteChanged.mockClear();
    deleteSelect.mockResolvedValueOnce({ data: [{ id: "prop-1" }], error: null });
    await remote.remove("properties", "prop-1");
    expect(websiteChanged).toHaveBeenCalled();
  });
});
