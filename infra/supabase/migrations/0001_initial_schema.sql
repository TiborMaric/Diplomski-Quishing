-- =====================================================================
-- Quishing thesis — initial schema (Sprint 0, migration 0001)
-- ---------------------------------------------------------------------
-- Run once in the Supabase SQL editor against a fresh project.
--
-- Conventions:
--   * PII is isolated to `form_submissions` only and stored encrypted at
--     rest. The encrypted columns will be dropped by end of October 2026
--     after the thesis defence.
--   * The `anon` role can ONLY insert telemetry; it can never read.
--   * Server-side admin uses the service-role key, which bypasses RLS.
--   * `full_name_hash` is the analysis-safe pseudonym computed in Node:
--       sha256(lower(trim(first)) + '|' + lower(trim(last)) + PROJECT_SALT)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";


-- ---------------------------------------------------------------------
-- 1. scan_events — one row per landing-page visit
-- ---------------------------------------------------------------------
create table if not exists public.scan_events (
  id              uuid        primary key default gen_random_uuid(),
  occurred_at     timestamptz not null    default now(),
  session_token   uuid        not null,
  user_agent_hash text,
  referrer        text,
  reached_form    boolean     not null    default false,
  reached_debrief boolean     not null    default false
);

create index if not exists scan_events_occurred_at_idx
  on public.scan_events (occurred_at);

create index if not exists scan_events_session_token_idx
  on public.scan_events (session_token);


-- ---------------------------------------------------------------------
-- 2. form_submissions — one row per completed form
--    PII lives ONLY here. Encrypted columns deleted October 2026.
-- ---------------------------------------------------------------------
create table if not exists public.form_submissions (
  id             uuid        primary key default gen_random_uuid(),
  submitted_at   timestamptz not null    default now(),
  session_token  uuid        not null,
  full_name_hash text        not null,
  first_name_enc bytea,
  last_name_enc  bytea
);

create index if not exists form_submissions_full_name_hash_idx
  on public.form_submissions (full_name_hash);

create index if not exists form_submissions_submitted_at_idx
  on public.form_submissions (submitted_at);


-- ---------------------------------------------------------------------
-- 3. debrief_interactions — engagement with the educational page
-- ---------------------------------------------------------------------
create table if not exists public.debrief_interactions (
  id            uuid        primary key default gen_random_uuid(),
  occurred_at   timestamptz not null    default now(),
  session_token uuid        not null,
  action        text        not null
    check (action in ('viewed', 'expanded', 'dismissed', 'shared'))
);

create index if not exists debrief_interactions_occurred_at_idx
  on public.debrief_interactions (occurred_at);

create index if not exists debrief_interactions_session_token_idx
  on public.debrief_interactions (session_token);


-- ---------------------------------------------------------------------
-- 4. virustotal_cache — used by Phase 2 scanner app
-- ---------------------------------------------------------------------
create table if not exists public.virustotal_cache (
  url_hash     text        primary key,
  url          text        not null,
  verdict      text        not null
    check (verdict in ('safe', 'suspicious', 'malicious', 'unknown')),
  raw_response jsonb,
  fetched_at   timestamptz not null default now(),
  expires_at   timestamptz not null
);

create index if not exists virustotal_cache_expires_at_idx
  on public.virustotal_cache (expires_at);


-- ---------------------------------------------------------------------
-- 5. funnel_daily — convenience view for the campaign funnel
-- ---------------------------------------------------------------------
create or replace view public.funnel_daily as
select
  date_trunc('day', s.occurred_at)             as day,
  count(*)                                     as scans,
  count(*) filter (where s.reached_form)       as reached_form,
  count(distinct f.id)                         as submissions,
  count(*) filter (where s.reached_debrief)    as reached_debrief
from public.scan_events s
left join public.form_submissions f
  on f.session_token = s.session_token
group by 1
order by 1 desc;


-- ---------------------------------------------------------------------
-- 6. Row-Level Security
-- ---------------------------------------------------------------------
alter table public.scan_events           enable row level security;
alter table public.form_submissions      enable row level security;
alter table public.debrief_interactions  enable row level security;
alter table public.virustotal_cache      enable row level security;

-- Drop any pre-existing policies (idempotent re-runs).
drop policy if exists anon_insert_scan        on public.scan_events;
drop policy if exists anon_insert_submission  on public.form_submissions;
drop policy if exists anon_insert_debrief     on public.debrief_interactions;

-- Anon (browser) clients: insert-only telemetry. No SELECT, UPDATE or DELETE.
create policy anon_insert_scan        on public.scan_events
  for insert to anon with check (true);

create policy anon_insert_submission  on public.form_submissions
  for insert to anon with check (true);

create policy anon_insert_debrief     on public.debrief_interactions
  for insert to anon with check (true);

-- No anon policies on virustotal_cache: only the service-role key (used by
-- the Next.js /api/scan proxy) reads or writes this table. Service role
-- bypasses RLS, so no explicit policies are needed for the server.

-- ---------------------------------------------------------------------
-- End of migration 0001
-- ---------------------------------------------------------------------
