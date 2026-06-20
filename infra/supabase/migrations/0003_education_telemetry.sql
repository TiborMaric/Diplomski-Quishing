-- =====================================================================
-- Migration 0003 — track who came back to read the educational page.
-- ---------------------------------------------------------------------
-- Adds a single flag to scan_events. We don't insert a new row; the
-- educational page reuses the existing session_token, so this is just a
-- progression flag like reached_form / reached_debrief.
-- =====================================================================

alter table public.scan_events
  add column if not exists reached_education boolean not null default false;

-- Update the funnel view so the thesis chapter can read the last stage
-- without rewriting it later.
drop view if exists public.funnel_daily;
create view public.funnel_daily as
select
  date_trunc('day', s.occurred_at)               as day,
  count(*)                                       as scans,
  count(*) filter (where s.reached_form)         as reached_form,
  count(distinct f.id)                           as submissions,
  count(*) filter (where s.reached_debrief)      as reached_debrief,
  count(*) filter (where s.reached_education)    as reached_education
from public.scan_events s
left join public.form_submissions f
  on f.session_token = s.session_token
group by 1
order by 1 desc;
