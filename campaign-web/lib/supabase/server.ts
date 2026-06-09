/**
 * Server-only Supabase client (service-role key).
 *
 * IMPORTANT: never import this module from a Client Component or any code
 * that runs in the browser — the service-role key bypasses Row-Level
 * Security and would be a critical leak if it reached the client bundle.
 *
 * Use this client from:
 *   - Route Handlers (`app/api/.../route.ts`)
 *   - Server Actions
 *   - Server Components that need privileged reads
 *
 * NOTE (Sprint 0): stub only. Wired up in Sprint 1.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars."
    );
  }

  cached = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cached;
}
