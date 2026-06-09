/**
 * Thin wrapper around the VirusTotal v3 API.
 *
 * Two endpoints we use:
 *   - GET  /api/v3/urls/{url_id}            existing analysis lookup
 *   - POST /api/v3/urls + poll /analyses/.. submit-new-and-wait
 *
 * url_id is the URL encoded as url-safe base64 with padding stripped.
 *
 * `verdictFor` maps the stats block to one of four colour-coded verdicts
 * the mobile app renders. Pure function, easy to unit-test later.
 */

const VT_BASE = "https://www.virustotal.com/api/v3";

export type VTStats = {
  malicious: number;
  suspicious: number;
  undetected: number;
  harmless: number;
  timeout?: number;
};

export type Verdict = "safe" | "suspicious" | "malicious" | "unknown";

export type ScanResult = {
  verdict: Verdict;
  stats: VTStats | null;
  fetchedAt: string;
  cached: boolean;
};

function getApiKey(): string {
  const key = process.env.VIRUSTOTAL_API_KEY;
  if (!key) {
    throw new Error("VIRUSTOTAL_API_KEY is missing.");
  }
  return key;
}

/**
 * VirusTotal addresses URLs by base64url(url) (RFC 4648 §5) with no
 * trailing padding.
 */
function urlIdFor(url: string): string {
  return Buffer.from(url, "utf8").toString("base64url");
}

/**
 * Maps an analysis stats block to a single coloured verdict.
 *   - malicious   >= 3                                         → "malicious"
 *   - malicious   >= 1  OR  suspicious >= 3                    → "suspicious"
 *   - malicious === 0 AND suspicious === 0 AND harmless > 0    → "safe"
 *   - everything else (incl. null / all zeros)                 → "unknown"
 */
export function verdictFor(stats: VTStats | null): Verdict {
  if (!stats) return "unknown";
  if (stats.malicious >= 3) return "malicious";
  if (stats.malicious >= 1 || stats.suspicious >= 3) return "suspicious";
  if (stats.malicious === 0 && stats.suspicious === 0 && stats.harmless > 0) {
    return "safe";
  }
  return "unknown";
}

/**
 * Look up an existing analysis. Returns the stats block, or null when VT
 * has no record of this URL. Throws on other upstream failures so the
 * caller can decide whether to fall back to a fresh submission.
 */
export async function getExistingAnalysis(url: string): Promise<VTStats | null> {
  const id = urlIdFor(url);
  const res = await fetch(`${VT_BASE}/urls/${id}`, {
    headers: { "x-apikey": getApiKey() },
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`VT getExistingAnalysis HTTP ${res.status}`);
  }

  const json = (await res.json()) as {
    data?: { attributes?: { last_analysis_stats?: VTStats } };
  };
  return json.data?.attributes?.last_analysis_stats ?? null;
}

/**
 * Submit a brand-new URL for analysis, then poll until VT marks it
 * "completed" (max ~8 seconds of polling to stay under Vercel Hobby's
 * 10 s function ceiling). Returns the stats block, or null on timeout.
 */
export async function submitAndPoll(url: string): Promise<VTStats | null> {
  const submitRes = await fetch(`${VT_BASE}/urls`, {
    method: "POST",
    headers: {
      "x-apikey": getApiKey(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ url }).toString(),
    cache: "no-store",
  });

  if (!submitRes.ok) {
    throw new Error(`VT submit HTTP ${submitRes.status}`);
  }

  const submitJson = (await submitRes.json()) as { data?: { id?: string } };
  const analysisId = submitJson.data?.id;
  if (!analysisId) return null;

  // Poll up to 4 times at 2 s intervals = 8 s max.
  for (let attempt = 0; attempt < 4; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const pollRes = await fetch(`${VT_BASE}/analyses/${analysisId}`, {
      headers: { "x-apikey": getApiKey() },
      cache: "no-store",
    });
    if (!pollRes.ok) continue;

    const pollJson = (await pollRes.json()) as {
      data?: { attributes?: { status?: string; stats?: VTStats } };
    };
    const status = pollJson.data?.attributes?.status;
    if (status === "completed") {
      return pollJson.data?.attributes?.stats ?? null;
    }
  }

  return null;
}
