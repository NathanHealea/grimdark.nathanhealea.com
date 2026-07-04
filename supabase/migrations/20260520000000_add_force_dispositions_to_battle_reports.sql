-- ============================================================
-- Migration: Add force dispositions to battle_reports
-- Feature: Battle Report Force Dispositions
-- ============================================================

-- 1. New columns: per-player force disposition + secondary missions mode
alter table public.battle_reports
  add column attacker_force_disposition_id integer references public.force_dispositions(id) on delete restrict,
  add column defender_force_disposition_id integer references public.force_dispositions(id) on delete restrict,
  add column attacker_secondary_mode text check (attacker_secondary_mode in ('tactical', 'fixed')),
  add column defender_secondary_mode text check (defender_secondary_mode in ('tactical', 'fixed'));

-- 2. Dispositions are recorded as a pair — half-set pairs are invalid in every state
alter table public.battle_reports
  add constraint dispositions_both_or_neither
  check ((attacker_force_disposition_id is null) = (defender_force_disposition_id is null));

-- 3. Published reports require either a mission (classic edition) or both
--    dispositions (disposition edition)
alter table public.battle_reports drop constraint published_fields_required;
alter table public.battle_reports add constraint published_fields_required
  check (
    status = 'draft' or (
      attacker_id is not null and attacker_faction_id is not null and
      attacker_score is not null and attacker_outcome is not null and
      defender_id is not null and defender_faction_id is not null and
      defender_score is not null and defender_outcome is not null and
      (mission_id is not null
        or (attacker_force_disposition_id is not null and defender_force_disposition_id is not null)) and
      deployment_id is not null and
      battle_points_id is not null and rounds is not null and
      event_date is not null
    )
  );

-- ============================================================
-- Integrity trigger: dispositions must belong to the report's
-- edition; a mission and dispositions are mutually exclusive
-- ============================================================

create or replace function public.validate_battle_report_edition()
returns trigger as $$
declare
  m_ed integer;
  d_ed integer;
  afd_ed integer;
  dfd_ed integer;
begin
  if new.mission_id is not null
     and (new.attacker_force_disposition_id is not null or new.defender_force_disposition_id is not null) then
    raise exception 'Battle report cannot have both a mission and force dispositions';
  end if;

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

  if new.attacker_force_disposition_id is not null then
    select edition_id into afd_ed from public.force_dispositions where id = new.attacker_force_disposition_id;
    if afd_ed is distinct from new.edition_id then
      raise exception 'Force disposition % does not belong to edition %', new.attacker_force_disposition_id, new.edition_id;
    end if;
  end if;

  if new.defender_force_disposition_id is not null then
    select edition_id into dfd_ed from public.force_dispositions where id = new.defender_force_disposition_id;
    if dfd_ed is distinct from new.edition_id then
      raise exception 'Force disposition % does not belong to edition %', new.defender_force_disposition_id, new.edition_id;
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists validate_battle_report_edition on public.battle_reports;
create trigger validate_battle_report_edition
  before insert or update of edition_id, mission_id, deployment_id,
    attacker_force_disposition_id, defender_force_disposition_id on public.battle_reports
  for each row execute function public.validate_battle_report_edition();
