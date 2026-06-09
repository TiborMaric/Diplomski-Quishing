# Scan API contract

Server endpoint used by the Flutter scanner app (Sprint 4) to look up the
safety verdict of a scanned URL against VirusTotal. The proxy holds the
VirusTotal API key (it never ships in the mobile binary), caches recent
verdicts in Postgres, and returns a colour-coded summary the app renders
directly.

## Endpoint

```
POST https://tvz-nagradna-igra-2026.vercel.app/api/scan
```

Local development:

```
POST http://localhost:3000/api/scan
```

## Headers

| Header         | Required | Notes                                                          |
| -------------- | -------- | -------------------------------------------------------------- |
| `Content-Type` | yes      | `application/json`                                             |
| `X-Scan-Key`   | yes      | Shared secret (`SCAN_PROXY_API_KEY` env var). 401 if missing.  |

The `X-Scan-Key` value is embedded in the mobile binary at build time.
Treat its leak as low severity — worst case someone burns through your
VirusTotal quota; rotate via Vercel env and rebuild the APK.

## Request body

```json
{ "url": "https://example.com/path" }
```

| Field | Type   | Constraints                                              |
| ----- | ------ | -------------------------------------------------------- |
| `url` | string | max 2048 chars, must parse as `http://` or `https://`.   |

## Response body (200)

```json
{
  "verdict": "safe" | "suspicious" | "malicious" | "unknown",
  "stats": {
    "malicious": 0,
    "suspicious": 0,
    "harmless": 50,
    "undetected": 20,
    "timeout": 0
  } | null,
  "fetchedAt": "2026-05-07T10:23:45.123Z",
  "cached": true | false
}
```

| Field        | Type            | Meaning                                                       |
| ------------ | --------------- | ------------------------------------------------------------- |
| `verdict`    | string enum     | Mobile UX uses this directly.                                 |
| `stats`      | object \| null  | Raw VT engine vote counts. `null` if VT was unreachable.      |
| `fetchedAt`  | ISO timestamp   | When the verdict was computed (cache hit or fresh).           |
| `cached`     | bool            | `true` if served from the 24-hour cache.                      |

## Verdict semantics

| Verdict        | Condition on stats                                       | Mobile UX                                          |
| -------------- | -------------------------------------------------------- | -------------------------------------------------- |
| `"safe"`       | `malicious=0 AND suspicious=0 AND harmless>0`            | Green; "Otvori u pregledniku" enabled.             |
| `"suspicious"` | `malicious>=1 OR suspicious>=3`                          | Yellow; require explicit confirmation.             |
| `"malicious"`  | `malicious>=3`                                           | Red; default-block, "Razumijem rizik" required.    |
| `"unknown"`    | VT unreachable, polling timed out, or zero engine votes. | Grey; advise caution but allow the user to open.   |

**`"safe"` does NOT mean "guaranteed safe."** It means no antivirus engine
has flagged the URL. Brand-new phishing URLs almost always start as
`"unknown"` because no engine has had time to rate them.

## Status codes

| Code | Body shape                                  | When                                                      |
| ---- | ------------------------------------------- | --------------------------------------------------------- |
| 200  | `ScanResult`                                | Success (even when verdict is `"unknown"`).               |
| 400  | `{ error, issues? }`                        | Invalid JSON body or invalid URL.                         |
| 401  | `{ error }`                                 | Missing or wrong `X-Scan-Key`.                            |
| 405  | empty body, `Allow: POST` header            | Method other than POST.                                   |

**Notable:** the proxy never returns 500 for VirusTotal failures. VT outages
produce 200 with `verdict: "unknown"` so the mobile app always renders a
result.

## Caching

A Postgres-backed cache prevents repeat calls to VirusTotal:

| Verdict                        | Cache TTL  | Reason                                          |
| ------------------------------ | ---------- | ----------------------------------------------- |
| `safe` / `suspicious` / `malicious` | 24 hours   | Stable verdicts — refresh once per day.    |
| `unknown`                      | 15 minutes | Retry sooner so users get a fresh verdict.      |

Repeated POSTs of the same URL within the TTL return `cached: true` and
burn zero VirusTotal quota.

URL normalisation before hashing/caching:

- whitespace trimmed
- host lowercased (`Google.COM` and `google.com` collide)
- path and query are left case-sensitive

## Examples

### Safe URL

```sh
curl -X POST https://tvz-nagradna-igra-2026.vercel.app/api/scan \
  -H "Content-Type: application/json" \
  -H "X-Scan-Key: <SCAN_PROXY_API_KEY>" \
  -d '{"url":"https://google.com"}'
```

Response (`200`):

```json
{
  "verdict": "safe",
  "stats": { "malicious": 0, "suspicious": 0, "harmless": 75, "undetected": 19, "timeout": 0 },
  "fetchedAt": "2026-05-07T10:23:45.123Z",
  "cached": false
}
```

### Malicious URL (VirusTotal's own test URL)

```sh
curl -X POST https://tvz-nagradna-igra-2026.vercel.app/api/scan \
  -H "Content-Type: application/json" \
  -H "X-Scan-Key: <SCAN_PROXY_API_KEY>" \
  -d '{"url":"http://malware.testing.google.test/testing/malware/"}'
```

Response (`200`):

```json
{
  "verdict": "malicious",
  "stats": { "malicious": 12, "suspicious": 1, "harmless": 45, "undetected": 26, "timeout": 0 },
  "fetchedAt": "2026-05-07T10:23:48.456Z",
  "cached": false
}
```

### Missing / wrong key

```sh
curl -X POST https://tvz-nagradna-igra-2026.vercel.app/api/scan \
  -H "Content-Type: application/json" \
  -H "X-Scan-Key: wrong" \
  -d '{"url":"https://google.com"}'
```

Response (`401`):

```json
{ "error": "Missing or invalid X-Scan-Key header." }
```

### Malformed URL

```sh
curl -X POST https://tvz-nagradna-igra-2026.vercel.app/api/scan \
  -H "Content-Type: application/json" \
  -H "X-Scan-Key: <SCAN_PROXY_API_KEY>" \
  -d '{"url":"not a url"}'
```

Response (`400`):

```json
{
  "error": "Invalid request body.",
  "issues": {
    "url": ["URL must be a parseable http(s):// URL."]
  }
}
```

## Notes for Sprint 4 (Flutter)

- The shared secret `X-Scan-Key` ships inside the APK. Treat that as
  acceptable risk — the blast radius is "someone burns my VT quota," not
  PII access. Rotate via Vercel env + new APK build if it ever leaks.
- Set the Flutter HTTP client timeout to **15 seconds**. The server
  guarantees a response within ~10 seconds, but allow 5 s of network slop.
- The `verdict` field is the mobile UX's source of truth. Don't show
  raw `stats` to non-technical users.
- Cache invalidation: never needed — the proxy handles TTLs.
- Treat any non-200 from the proxy as a recoverable error: show a
  generic "neuspjela provjera" message and let the user retry.
