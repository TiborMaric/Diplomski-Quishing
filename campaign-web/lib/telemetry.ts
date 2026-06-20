/**
 * Server-only telemetry helpers. Every write goes through the service-role
 * Supabase client (which bypasses RLS).
 *
 * Idempotency:
 *   - recordScan        upserts with ON CONFLICT (session_token) DO NOTHING.
 *   - markReached*      simple UPDATEs that converge on `true`.
 *   - recordDebriefInteraction inserts every time on purpose, so we can
 *     later distinguish first-view from subsequent-view if useful.
 *
 * NEVER import this module from a Client Component — the underlying
 * Supabase client uses the service-role key, which bypasses RLS.
 */

import { createHash } from "node:crypto";
import { getServiceClient } from "@/lib/supabase/server";

export type DebriefAction = "viewed" | "expanded" | "dismissed" | "shared";

export type ScanContext = {
  userAgent: string | null;
  referrer: string | null;
};

function hashUserAgent(ua: string | null): string | null {
  if (!ua) return null;
  return createHash("sha256").update(ua, "utf8").digest("hex");
}

export async function recordScan(
  sessionToken: string,
  ctx: ScanContext
): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase.from("scan_events").upsert(
    {
      session_token: sessionToken,
      user_agent_hash: hashUserAgent(ctx.userAgent),
      referrer: ctx.referrer,
    },
    {
      onConflict: "session_token",
      ignoreDuplicates: true,
    }
  );
  if (error) {
    throw new Error(`recordScan failed: ${error.message}`);
  }
}

export async function markReachedForm(sessionToken: string): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("scan_events")
    .update({ reached_form: true })
    .eq("session_token", sessionToken);
  if (error) {
    throw new Error(`markReachedForm failed: ${error.message}`);
  }
}

export async function markReachedDebrief(sessionToken: string): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("scan_events")
    .update({ reached_debrief: true })
    .eq("session_token", sessionToken);
  if (error) {
    throw new Error(`markReachedDebrief failed: ${error.message}`);
  }
}

export async function markReachedEducation(sessionToken: string): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("scan_events")
    .update({ reached_education: true })
    .eq("session_token", sessionToken);
  if (error) {
    throw new Error(`markReachedEducation failed: ${error.message}`);
  }
}

export async function recordDebriefInteraction(
  sessionToken: string,
  action: DebriefAction
): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase.from("debrief_interactions").insert({
    session_token: sessionToken,
    action,
  });
  if (error) {
    throw new Error(`recordDebriefInteraction failed: ${error.message}`);
  }
}
