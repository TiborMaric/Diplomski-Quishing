# campaign-web

Phase 1 of the Quishing thesis project — a Next.js 15 / Tailwind 4 / Supabase
landing site that hosts the controlled QR phishing simulation.

## Stack

- Next.js 15 (App Router, TypeScript strict mode)
- React 19
- Tailwind CSS 4 (CSS-first config via `@import "tailwindcss";`)
- Supabase JS v2 (anon + service-role separation)
- ESLint 9 (flat config) + Prettier with Tailwind plugin
- Package manager: **npm**

## Local development

```sh
cp .env.example .env.local
# fill in values from your Supabase project + a random PROJECT_SALT
npm install
npm run dev
# → http://localhost:3000
```

Three routes are scaffolded as visual stubs only:

| Route       | Purpose                                                  |
| ----------- | -------------------------------------------------------- |
| `/`         | Landing page with the prize-game hook                    |
| `/form`     | First/last name capture (form is disabled in Sprint 0)   |
| `/debrief`  | Educational debriefing shown after submission            |

## Environment variables

See [`.env.example`](./.env.example). The `SUPABASE_SERVICE_ROLE_KEY` is
**server-only** and must never be imported from a Client Component.

## Project structure

```
campaign-web/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx              # landing
│   ├── form/page.tsx
│   └── debrief/page.tsx
├── components/               # (empty in Sprint 0)
├── lib/
│   ├── i18n.ts               # tiny typed reader for messages/hr.json
│   └── supabase/
│       ├── client.ts         # browser, anon key
│       └── server.ts         # server-only, service-role key
├── messages/
│   └── hr.json               # all UI copy in Croatian
└── …
```

## Status

Sprint 0 — scaffold only. No form logic, no live Supabase calls, no telemetry,
no VirusTotal proxy yet.
