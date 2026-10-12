import { createClient } from "@supabase/supabase-js";
export const DEMO_MODE = import.meta.env["VITE_ENABLE_ADMIN_DEMO"] === "true";
export const SUPABASE_URL = import.meta.env["VITE_SUPABASE_URL"] || "https://ufcpvjhzitmxgitoaolx.supabase.co";
export const SUPABASE_KEY = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || "sb_publishable_vmlTaa9tPFNuR3z_ADhOfA_XeH4oHUx";
// Only publishable credentials belong in frontend code. RLS authorizes each request.
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: typeof window !== "undefined", autoRefreshToken: typeof window !== "undefined", detectSessionInUrl: typeof window !== "undefined" } });
// Public loaders never reuse a visitor's or staff member's session.
export const publicSupabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
