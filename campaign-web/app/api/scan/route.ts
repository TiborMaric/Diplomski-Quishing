import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createHash, timingSafeEqual } from "node:crypto";
import { getServiceClient } from "@/lib/supabase/server";
import {
  getExistingAnalysis,
  submitAndPoll,
  verdictFor,
  type ScanResult,
  type Verdict,
  type VTStats,
} from "@/lib/virustotal";

// Vercel Hobby caps function duration at 10 s; the wrapper's polling loop
// is bounded to ~8 s for the worst case.
export const maxDuration = 10;
export const runtime = "nodejs";

const HOURS_TO_MS = 60 * 60 * 1000;
const MINUTES_TO_MS = 60 * 1000;

const CACHE_TTL_KNOWN_MS = 24 * HOURS_TO_MS;
const CACHE_TTL_UNKNOWN_MS = 15 * MINUTES_TO_MS;

const Body = z.object({
  url: z
    .string()
    .max(2048, { message: "URL must be at most 2048 characters." })
    .refine(
      (raw) => {
        try {
          const parsed = new URL(raw);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "URL must be a parseable http(s):// URL." }
    ),
});

/**
 * Normalise an incoming URL so that two scans of "Google.COM" and "google.com"
 * map to the same cache entry. Only the host is lowercased; path and query
 * stay case-sensitive (some sites rely on them).
 */
function normaliseUrl(raw: string): string {
  const u = new URL(raw.trim());
  u.host = u.host.toLowerCase();
  return u.toString();
}

function hashUrl(url: string): string {
  return createHash("sha256").update(url, "utf8").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

function unauthorized(): NextResponse {
  return NextResponse.json(
    { error: "Missing or invalid X-Scan-Key header." },
    { status: 401 }
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Auth — constant-time compare against the shared secret.
  const provided = req.headers.get("x-scan-key");
  const expected = process.env.SCAN_PROXY_API_KEY;
  if (!expected || !provided || !safeEqual(provided, expected)) {
    return unauthorized();
  }

  // 2. Parse + validate body.
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request body.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const url = normaliseUrl(parsed.data.url);
  const urlHash = hashUrl(url);

  const supabase = getServiceClient();

  // 3. Cache lookup — return immediately on hit.
  const { data: cachedRow } = await supabase
    .from("virustotal_cache")
    .select("verdict, raw_response, fetched_at, expires_at")
    .eq("url_hash", urlHash)
    .maybeSingle();

  if (cachedRow && new Date(cachedRow.expires_at) > new Date()) {
    const result: ScanResult = {
      verdict: cachedRow.verdict as Verdict,
      stats: (cachedRow.raw_response as VTStats | null) ?? null,
      fetchedAt: cachedRow.fetched_at,
      cached: true,
    };
    return NextResponse.json(result, { status: 200 });
  }

  // 4. Fresh lookup against VirusTotal. Never propagate upstream errors —
  //    the mobile app must always get a verdict it can render.
  let stats: VTStats | null = null;
  try {
    stats = await getExistingAnalysis(url);
    if (!stats) {
      stats = await submitAndPoll(url);
    }
  } catch (err) {
    console.error("VT lookup failed:", err);
    stats = null;
  }

  const verdict = verdictFor(stats);
  const fetchedAt = new Date().toISOString();

  // 5. Upsert cache with a TTL that depends on whether we got a real answer.
  const ttlMs = verdict === "unknown" ? CACHE_TTL_UNKNOWN_MS : CACHE_TTL_KNOWN_MS;
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();

  const { error: upsertErr } = await supabase.from("virustotal_cache").upsert(
    {
      url_hash: urlHash,
      url,
      verdict,
      raw_response: stats,
      fetched_at: fetchedAt,
      expires_at: expiresAt,
    },
    { onConflict: "url_hash" }
  );
  if (upsertErr) {
    // Cache write failure shouldn't block the response — log and continue.
    console.error("virustotal_cache upsert failed:", upsertErr.message);
  }

  const result: ScanResult = {
    verdict,
    stats,
    fetchedAt,
    cached: false,
  };

  return NextResponse.json(result, { status: 200 });
}
