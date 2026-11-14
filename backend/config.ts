import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types/database.types";

export const SUPABASE_URL =
  process.env["SUPABASE_URL"] || "https://ufcpvjhzitmxgitoaolx.supabase.co";
export const SUPABASE_ANON_KEY =
  process.env["SUPABASE_ANON_KEY"] ||
  process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
  "sb_publishable_vmlTaa9tPFNuR3z_ADhOfA_XeH4oHUx";
export const SUPABASE_SERVICE_ROLE_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY"] || "";

export function getPublicClient(): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getAdminClient(): SupabaseClient<Database> {
  const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  return createClient<Database>(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getAuthenticatedClient(accessToken: string): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
