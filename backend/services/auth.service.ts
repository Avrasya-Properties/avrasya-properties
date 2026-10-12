import { getAdminClient } from "../config";
import type { Database } from "../types/database.types";

export type StaffRole = Database["public"]["Enums"]["staff_role"];

export interface StaffProfile {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export type Action =
  | "admin"
  | "edit-inventory"
  | "publish"
  | "edit-crm"
  | "edit-deals"
  | "edit-rentals"
  | "view-reports"
  | "view-sensitive-documents";

export function canPerformAction(
  profile: StaffProfile | null,
  action: Action,
  ownerId?: string,
): boolean {
  if (!profile || !profile.is_active) return false;
  if (profile.role === "admin") return true;

  if (profile.role === "viewer") {
    // Viewer cannot perform write actions or view sensitive documents
    return false;
  }

  if (profile.role === "manager") {
    // Manager cannot perform system administrator user role changes
    return action !== "admin";
  }

  if (profile.role === "agent") {
    switch (action) {
      case "edit-inventory":
        // Agent can update assigned inventory items only
        return ownerId ? ownerId === profile.id : false;
      case "publish":
        // Agent cannot publish directly
        return false;
      case "edit-crm":
      case "edit-deals":
        // Agent can edit assigned CRM / Deals
        return ownerId ? ownerId === profile.id : true;
      case "edit-rentals":
        return ownerId ? ownerId === profile.id : true;
      case "view-reports":
        return true;
      case "view-sensitive-documents":
        return false;
      default:
        return false;
    }
  }

  return false;
}

export class AuthService {
  private client = getAdminClient();

  /**
   * Verifies an authenticated user has an ACTIVE staff profile.
   * Inactive accounts are blocked even if they possess a valid auth token.
   */
  public async verifyActiveStaff(userId: string): Promise<StaffProfile | null> {
    const { data, error } = await this.client
      .from("staff_profiles")
      .select("*")
      .eq("id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) return null;
    return data as StaffProfile;
  }

  /**
   * Safe Initial Administrator Bootstrap.
   * If an active administrator already exists, bootstrap is strictly rejected.
   */
  public async bootstrapInitialAdmin(input: {
    email: string;
    name: string;
    password?: string;
  }): Promise<{ profile: StaffProfile; created: boolean }> {
    // 1. Check if any active admin already exists
    const { data: existingAdmins } = await this.client
      .from("staff_profiles")
      .select("id")
      .eq("role", "admin")
      .eq("is_active", true);

    if (existingAdmins && existingAdmins.length > 0) {
      throw new Error("Initial administrator has already been bootstrapped.");
    }

    // 2. Create Auth User
    const password =
      input.password || "AvrasyaSecureAdmin!" + Math.random().toString(36).slice(2, 8);
    const { data: authUser, error: authError } = await this.client.auth.admin.createUser({
      email: input.email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { name: input.name },
    });

    if (authError || !authUser.user) {
      throw new Error(`Failed to create auth user: ${authError?.message}`);
    }

    // 3. Upsert into authoritative staff_profiles
    const { data: profile, error: profError } = await this.client
      .from("staff_profiles")
      .insert({
        id: authUser.user.id,
        email: input.email.trim().toLowerCase(),
        name: input.name,
        role: "admin",
        is_active: true,
      })
      .select()
      .single();

    if (profError || !profile) {
      throw new Error(`Failed to create staff profile: ${profError?.message}`);
    }

    return { profile: profile as StaffProfile, created: true };
  }

  /**
   * Create staff member with specified role. Only admins can call this.
   */
  public async onboardStaff(
    actorId: string,
    input: {
      email: string;
      name: string;
      role: StaffRole;
      password?: string;
    },
  ): Promise<StaffProfile> {
    const actor = await this.verifyActiveStaff(actorId);
    if (!actor || actor.role !== "admin") {
      throw new Error("Unauthorized: Only administrators can onboard staff.");
    }

    const password = input.password || "AvrasyaStaff!" + Math.random().toString(36).slice(2, 8);
    const { data: authUser, error: authError } = await this.client.auth.admin.createUser({
      email: input.email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { name: input.name },
    });

    if (authError || !authUser.user) {
      throw new Error(`Failed to create auth user: ${authError?.message}`);
    }

    const { data: profile, error: profError } = await this.client
      .from("staff_profiles")
      .insert({
        id: authUser.user.id,
        email: input.email.trim().toLowerCase(),
        name: input.name,
        role: input.role,
        is_active: true,
      })
      .select()
      .single();

    if (profError || !profile) {
      throw new Error(`Failed to create staff profile: ${profError?.message}`);
    }

    return profile as StaffProfile;
  }

  /**
   * Update staff role. Trigger prevents demoting the last active admin.
   */
  public async updateStaffRole(
    actorId: string,
    targetStaffId: string,
    newRole: StaffRole,
  ): Promise<StaffProfile> {
    const actor = await this.verifyActiveStaff(actorId);
    if (!actor || actor.role !== "admin") {
      throw new Error("Unauthorized: Only administrators can modify staff roles.");
    }

    const { data, error } = await this.client
      .from("staff_profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", targetStaffId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update staff role: ${error.message}`);
    }

    return data as StaffProfile;
  }

  /**
   * Deactivate staff account. Trigger prevents deactivating the last active admin.
   */
  public async deactivateStaff(actorId: string, targetStaffId: string): Promise<StaffProfile> {
    const actor = await this.verifyActiveStaff(actorId);
    if (!actor || actor.role !== "admin") {
      throw new Error("Unauthorized: Only administrators can deactivate staff.");
    }

    const { data, error } = await this.client
      .from("staff_profiles")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", targetStaffId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to deactivate staff: ${error.message}`);
    }

    return data as StaffProfile;
  }
}
