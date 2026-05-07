# Sprint 1 — Manual QA Checklist

End-to-end check that the campaign flow records the four expected DB writes.

## Prerequisites

1. Supabase project exists and the SQL editor has been run, in order:
   - `infra/supabase/migrations/0001_initial_schema.sql`
   - `infra/supabase/migrations/0002_session_uniqueness.sql`
2. `campaign-web/.env.local` is populated with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PROJECT_SALT` (≥ 16 chars; `openssl rand -base64 32` is good)
3. Dev server running:

   ```sh
   cd campaign-web
   npm install
   npm run dev
   ```

## Click path

Open http://localhost:3000 in a **fresh incognito/private window** so the
session cookie is brand new.

| #  | Step                                  | Expected page-side result                                                                                       |
| -- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1  | Open `/`                              | Croatian landing page, prize cards visible. DevTools → Application → Cookies shows `qsh_session = <uuid>`.      |
| 2  | Press F5 (refresh `/`)                | No visual change. **No** new row in `scan_events` (ON CONFLICT works).                                          |
| 3  | Click the CTA → `/form`               | Form page renders.                                                                                              |
| 4  | Submit empty form                     | Inline Croatian error under each field (`Unos je prekratak…`).                                                  |
| 5  | Submit "Marko123" / "Marić"           | Inline error on first field (`Dozvoljena su samo slova…`).                                                      |
| 6  | Submit "Marko" / "Marić"              | Redirected to `/debrief`. Browser URL is `/debrief`.                                                            |
| 7  | Press the browser back button         | Back to `/form` — **not** a re-submission (303 redirect prevents POST replay).                                  |

## Verify in the Supabase SQL editor

After step 6, run:

```sql
-- Should show exactly one row, with reached_form = true and reached_debrief = true.
select session_token, reached_form, reached_debrief, occurred_at
from public.scan_events
order by occurred_at desc
limit 5;

-- Should show exactly one submission with non-null hash and non-null encrypted blobs.
select id, session_token, full_name_hash,
       octet_length(first_name_enc) as first_len,
       octet_length(last_name_enc)  as last_len,
       submitted_at
from public.form_submissions
order by submitted_at desc
limit 5;

-- Should show one 'viewed' row matching the session_token.
select session_token, action, occurred_at
from public.debrief_interactions
order by occurred_at desc
limit 5;

-- Funnel sanity check.
select * from public.funnel_daily;
```

**Acceptance:** today's `funnel_daily` row reads
`scans=1, reached_form=1, submissions=1, reached_debrief=1`.

## Honeypot test

In a second incognito window, open `/form`, then in DevTools console run:

```js
const f = document.forms[0];
f.querySelector('[name="tvrtka"]').value = 'spam';
f.requestSubmit();
```

Expected: redirected to `/debrief`. **No** new row in `form_submissions`
for this session_token (only the `scan_events` row + a debrief view).

## Round-trip the encryption

In a Node REPL with `.env.local` loaded (or via a one-off script), confirm:

```ts
import { decryptString } from "@/lib/crypto";
// Read first_name_enc / last_name_enc from a fresh row, pass them in:
console.log(decryptString(firstNameEncFromDb)); // → "Marko"
console.log(decryptString(lastNameEncFromDb));  // → "Marić"
```

If `decryptString` throws "Unsupported state or unable to authenticate
data", the salt has changed since the row was inserted. Roll back the test
rows or rotate the salt.

## When you're done

Delete the test rows so the live campaign starts from a clean state:

```sql
delete from public.debrief_interactions;
delete from public.form_submissions;
delete from public.scan_events;
```
