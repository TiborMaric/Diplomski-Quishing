# Quishing — Master's Thesis Project

> **Quishing: Risk Evaluation Through a Research Campaign and Development of Protective Software**
> Author: Tibor Marić · 2026
> Status: Phase 1 (campaign) build in progress · Launch target **13 May 2026**

This monorepo contains the source code, schema, and academic artifacts for a
two-phase Master's thesis on QR-code phishing ("quishing").

## Scope

The project is a **university-approved**, ethically-reviewed research study with
two complementary phases:

1. **Red Team — Campaign Site** (`campaign-web/`)
   A Next.js landing page advertised as a fictitious "University Prize Game"
   ending 13 July 2026. Students who scan a printed QR code arrive at the page,
   optionally enter their first and last name, and are then shown an educational
   debriefing explaining the study and the risks of quishing.

2. **Blue Team — Protective Scanner** (`scanner-app/`)
   A Flutter (Android-only) QR scanner that extracts URLs from scanned codes,
   sends them to a Next.js server-side proxy, which queries the VirusTotal API
   and returns a colour-coded safety verdict before the user opens the link.

## Architecture

```
                    Phase 1 — Campaign                    Phase 2 — Scanner
                    ─────────────────                     ──────────────────

  Printed QR  ──►  campaign-web (Next.js)            Flutter app (mobile_scanner)
                          │                                       │
                          │ Server Action                         │ HTTPS POST {url}
                          ▼                                       ▼
                    Supabase (RLS)                       /api/scan  (Next.js proxy)
                    ├── scan_events                                │
                    ├── form_submissions  (PII)                    ▼
                    └── debrief_interactions                 VirusTotal API
                                                                   │
                                                                   ▼
                                                           Verdict screen
                                                  (Safe / Suspicious / Malicious)
```

## Repository layout

| Path                          | Purpose                                                    |
| ----------------------------- | ---------------------------------------------------------- |
| `campaign-web/`               | Next.js 15 + Tailwind 4 campaign site                      |
| `scanner-app/`                | Flutter Android scanner (build starts after 13 May 2026)   |
| `infra/supabase/migrations/`  | Versioned Postgres SQL — paste into Supabase SQL editor    |
| `shared-docs/thesis/`         | Thesis chapters (~50 pages, Word, written Aug–Oct 2026)    |
| `shared-docs/ethics/`         | Ethics approval, debriefing copy, retention plan           |
| `shared-docs/design/`         | Flow diagrams, poster mocks                                |
| `shared-docs/analysis/`       | Jupyter notebooks and anonymized export CSVs               |

## Running the campaign site locally

The package manager for this repo is **npm** (locked).

```sh
cd campaign-web
cp .env.example .env.local       # populate from your Supabase project
npm install
npm run dev
# → http://localhost:3000
```

You should see the Croatian landing-page stub. Three routes are wired up: `/`,
`/form`, `/debrief`.

## Supabase setup

After creating an empty Supabase project on the free tier:

1. Open the SQL editor in the Supabase dashboard.
2. Paste the contents of [`infra/supabase/migrations/0001_initial_schema.sql`](infra/supabase/migrations/0001_initial_schema.sql).
3. Run. Four tables, the `funnel_daily` view, and RLS policies will be created.
4. Copy the project URL, the `anon` key, and the `service_role` key into
   `campaign-web/.env.local`.

## Ethics summary

- The study is conducted under faculty supervision and follows university
  ethics guidelines for deception research.
- Only first and last name are collected; no email, no IDs, no contact data.
- Names are hashed for analysis and stored encrypted at rest.
- Every submitter is shown an immediate, unconditional educational debriefing
  explaining the deception and the risks of QR phishing.
- The campaign window is fixed (13 May 2026 → 13 July 2026); no data is
  collected outside this window.
- **All personally identifiable data will be permanently deleted by the end of
  October 2026**, after the thesis defence. Only an anonymized aggregate CSV
  approved by the supervisor will be retained for archival.

## Status

| Sprint | Window           | Status              |
| ------ | ---------------- | ------------------- |
| 0      | 6 May            | scaffold            |
| 1      | 7–10 May         | landing + form      |
| 2      | 11–12 May        | pilot + QA          |
| —      | 13 May           | launch              |
| live   | 13 May – 13 Jul  | data collection     |
| —      | 13 Jul           | campaign closes     |
| —      | 14 Jul – 15 Aug  | analysis + scanner  |
| —      | 16 Aug – Oct     | thesis writing      |
| —      | Oct              | defence + data wipe |

## Licence

[MIT](./LICENSE) — applies to source code only. Research data and academic
content are governed by the ethics approval.
