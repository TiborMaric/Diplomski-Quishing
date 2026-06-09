-- =====================================================================
-- Migration 0002 — scan_events.session_token uniqueness
-- ---------------------------------------------------------------------
-- Sprint 1 treats one row in scan_events as one device journey: inserted
-- on the first landing-page render and progressively flagged as the
-- visitor reaches the form / debrief. ON CONFLICT (session_token) DO
-- NOTHING needs a unique constraint to function.
--
-- The plain index from migration 0001 becomes redundant once the unique
-- constraint adds its own unique index; drop it for cleanliness.
-- =====================================================================

drop index if exists public.scan_events_session_token_idx;

alter table public.scan_events
  drop constraint if exists scan_events_session_token_unique;

alter table public.scan_events
  add constraint scan_events_session_token_unique
  unique (session_token);
