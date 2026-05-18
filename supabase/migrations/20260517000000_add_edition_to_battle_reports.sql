-- ============================================================
-- Migration: Add edition_id to battle_reports
-- Feature: Battle Report Edition
-- ============================================================

-- 1. Add edition_id (nullable to allow backfill)
alter table public.battle_reports
  add column edition_id integer references public.editions(id);

-- 2. Backfill all existing reports to 10th Edition
update public.battle_reports
   set edition_id = (select id from public.editions where short_name = '10th');

-- 3. Enforce NOT NULL
alter table public.battle_reports
  alter column edition_id set not null;

-- ============================================================
-- Integrity trigger: validate mission and deployment belong to
-- the same edition as the battle report
-- ============================================================

create or replace function public.validate_battle_report_edition()
returns trigger as $$
declare
  m_ed integer;
  d_ed integer;
begin
  if new.mission_id is not null then
    select edition_id into m_ed from public.missions where id = new.mission_id;
    if m_ed is distinct from new.edition_id then
      raise exception 'Mission % does not belong to edition %', new.mission_id, new.edition_id;
    end if;
  end if;

  if new.deployment_id is not null then
    select edition_id into d_ed from public.deployments where id = new.deployment_id;
    if d_ed is distinct from new.edition_id then
      raise exception 'Deployment % does not belong to edition %', new.deployment_id, new.edition_id;
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger validate_battle_report_edition
  before insert or update of edition_id, mission_id, deployment_id on public.battle_reports
  for each row execute function public.validate_battle_report_edition();
