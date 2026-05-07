/**
 * Browser-side Supabase client (anon key only).
 *
 * Used for client-rendered telemetry events (e.g. logging that the visitor
 * reached the form or scrolled past the debrief). The anon role is restricted
 * by RLS to INSERT-only on telemetry tables — no reads.
 *
 * NOTE (Sprint 0): stub only. Wired up in Sprint 1.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars."
    );
  }

  cached = createClient(url, anonKey, {
    auth: { persistSession: false },
  });
  return cached;
}
