import { describe, it, expect } from "bun:test";
import { canPerformAction, type StaffProfile } from "../services/auth.service";

describe("Staff Authentication & RBAC Authorization", () => {
  const adminProfile: StaffProfile = {
    id: "00000000-0000-0000-0000-000000000001",
    email: "admin@avrasyaproperties.com",
    name: "Admin User",
    role: "admin",
    is_active: true,
    last_login_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const managerProfile: StaffProfile = {
    id: "00000000-0000-0000-0000-000000000002",
    email: "manager@avrasyaproperties.com",
    name: "Manager User",
    role: "manager",
    is_active: true,
    last_login_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const agentProfile: StaffProfile = {
    id: "00000000-0000-0000-0000-000000000003",
    email: "agent@avrasyaproperties.com",
    name: "Agent User",
    role: "agent",
    is_active: true,
    last_login_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const viewerProfile: StaffProfile = {
    id: "00000000-0000-0000-0000-000000000004",
    email: "viewer@avrasyaproperties.com",
    name: "Viewer User",
    role: "viewer",
    is_active: true,
    last_login_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const inactiveAdmin: StaffProfile = {
    ...adminProfile,
    is_active: false,
  };

  it("grants full permissions to active Administrator", () => {
    expect(canPerformAction(adminProfile, "admin")).toBe(true);
    expect(canPerformAction(adminProfile, "edit-inventory")).toBe(true);
    expect(canPerformAction(adminProfile, "publish")).toBe(true);
    expect(canPerformAction(adminProfile, "edit-crm")).toBe(true);
    expect(canPerformAction(adminProfile, "edit-deals")).toBe(true);
    expect(canPerformAction(adminProfile, "edit-rentals")).toBe(true);
    expect(canPerformAction(adminProfile, "view-reports")).toBe(true);
    expect(canPerformAction(adminProfile, "view-sensitive-documents")).toBe(true);
  });

  it("denies all operations to inactive staff even if admin role", () => {
    expect(canPerformAction(inactiveAdmin, "admin")).toBe(false);
    expect(canPerformAction(inactiveAdmin, "edit-inventory")).toBe(false);
    expect(canPerformAction(inactiveAdmin, "publish")).toBe(false);
    expect(canPerformAction(null, "admin")).toBe(false);
  });

  it("permits Manager business operations but denies administrator user role changes", () => {
    expect(canPerformAction(managerProfile, "admin")).toBe(false); // manager cannot manage admin staff
    expect(canPerformAction(managerProfile, "edit-inventory")).toBe(true);
    expect(canPerformAction(managerProfile, "publish")).toBe(true);
    expect(canPerformAction(managerProfile, "edit-crm")).toBe(true);
    expect(canPerformAction(managerProfile, "edit-deals")).toBe(true);
    expect(canPerformAction(managerProfile, "edit-rentals")).toBe(true);
    expect(canPerformAction(managerProfile, "view-reports")).toBe(true);
    expect(canPerformAction(managerProfile, "view-sensitive-documents")).toBe(true);
  });

  it("restricts Agent from publishing or editing unassigned inventory", () => {
    expect(canPerformAction(agentProfile, "publish")).toBe(false);
    expect(canPerformAction(agentProfile, "admin")).toBe(false);
    // Agent editing unassigned inventory item
    expect(canPerformAction(agentProfile, "edit-inventory", "other-agent-id")).toBe(false);
    // Agent editing their own assigned inventory item
    expect(canPerformAction(agentProfile, "edit-inventory", agentProfile.id)).toBe(true);
  });

  it("denies write actions and sensitive document views to Viewer", () => {
    expect(canPerformAction(viewerProfile, "edit-inventory")).toBe(false);
    expect(canPerformAction(viewerProfile, "publish")).toBe(false);
    expect(canPerformAction(viewerProfile, "edit-crm")).toBe(false);
    expect(canPerformAction(viewerProfile, "edit-deals")).toBe(false);
    expect(canPerformAction(viewerProfile, "view-sensitive-documents")).toBe(false);
  });
});
