# scanner-app

**Phase 2 of the Quishing thesis project.**

This Flutter (Android-only) module is intentionally empty in Sprint 0.
Build starts after the campaign launches on **13 May 2026**, in parallel with
the live data-collection window.

## Planned stack

- Flutter (latest stable) — Android-only
- [`mobile_scanner`](https://pub.dev/packages/mobile_scanner) for QR decoding
- HTTPS calls to the Next.js `/api/scan` proxy in `campaign-web`
- Result screen with colour-coded verdicts: Safe / Suspicious / Malicious / Unknown

## Why a server-side proxy?

The VirusTotal API key must never ship in the mobile app binary. The Flutter
client sends only the scanned URL to the Next.js proxy; the proxy holds the
key, applies caching against `virustotal_cache`, and returns the verdict.
