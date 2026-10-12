import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types/database.types";

export const SUPABASE_URL = process.env.SUPABASE_URL || "https://ufcpvjhzitmxgitoaolx.supabase.co";
export const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmY3B2amh6aXRteGdpdG9hb2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NTYxNjMsImV4cCI6MjEwNzIzMjE2M30.QS2B5p-nvyJ0FQy1suepfAp4V1CHS9ljLn8-UqEvBJ4";
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

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
