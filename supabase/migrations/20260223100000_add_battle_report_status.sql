-- ============================================================
-- Migration: Add draft/published status to battle reports
-- Feature: Battle Report Draft/Published Status
-- ============================================================

-- 1. Add status column (default 'published' so existing reports stay published)
ALTER TABLE public.battle_reports
  ADD COLUMN status text NOT NULL DEFAULT 'published'
  CHECK (status IN ('draft', 'published'));

-- 2. Make draft fields nullable
ALTER TABLE public.battle_reports ALTER COLUMN attacker_id DROP NOT NULL;
ALTER TABLE public.battle_reports ALTER COLUMN attacker_faction_id DROP NOT NULL;
ALTER TABLE public.battle_reports ALTER COLUMN attacker_score DROP NOT NULL;
ALTER TABLE public.battle_reports ALTER COLUMN attacker_outcome DROP NOT NULL;
ALTER TABLE public.battle_reports ALTER COLUMN defender_id DROP NOT NULL;
ALTER TABLE public.battle_reports ALTER COLUMN defender_faction_id DROP NOT NULL;
ALTER TABLE public.battle_reports ALTER COLUMN defender_score DROP NOT NULL;
ALTER TABLE public.battle_reports ALTER COLUMN defender_outcome DROP NOT NULL;
ALTER TABLE public.battle_reports ALTER COLUMN mission_id DROP NOT NULL;
ALTER TABLE public.battle_reports ALTER COLUMN deployment_id DROP NOT NULL;
ALTER TABLE public.battle_reports ALTER COLUMN battle_points_id DROP NOT NULL;
ALTER TABLE public.battle_reports ALTER COLUMN rounds DROP NOT NULL;
ALTER TABLE public.battle_reports ALTER COLUMN event_date DROP NOT NULL;

-- 3. Update attacker_defender_different constraint to allow NULLs
ALTER TABLE public.battle_reports DROP CONSTRAINT attacker_defender_different;
ALTER TABLE public.battle_reports ADD CONSTRAINT attacker_defender_different
  CHECK (attacker_id IS NULL OR defender_id IS NULL OR attacker_id != defender_id);

-- 4. Add constraint ensuring published reports have all required fields
ALTER TABLE public.battle_reports ADD CONSTRAINT published_fields_required
  CHECK (
    status = 'draft' OR (
      attacker_id IS NOT NULL AND attacker_faction_id IS NOT NULL AND
      attacker_score IS NOT NULL AND attacker_outcome IS NOT NULL AND
      defender_id IS NOT NULL AND defender_faction_id IS NOT NULL AND
      defender_score IS NOT NULL AND defender_outcome IS NOT NULL AND
      mission_id IS NOT NULL AND deployment_id IS NOT NULL AND
      battle_points_id IS NOT NULL AND rounds IS NOT NULL AND
      event_date IS NOT NULL
    )
  );

-- 5. Update RLS: public reads only see published, drafts visible to reporter and admins
DROP POLICY "Battle reports are publicly readable" ON public.battle_reports;

CREATE POLICY "Published battle reports are publicly readable"
  ON public.battle_reports FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Reporters can view their own drafts"
  ON public.battle_reports FOR SELECT
  TO authenticated
  USING (
    status = 'draft' AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = reported_by AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all battle reports"
  ON public.battle_reports FOR SELECT
  TO authenticated
  USING ('admin' = ANY(public.get_user_roles(auth.uid())));

-- 6. Update season assignment trigger: only assign when publishing
CREATE OR REPLACE FUNCTION public.assign_battle_report_season()
RETURNS trigger AS $$
BEGIN
  IF new.status = 'published' AND new.season_id IS NULL THEN
    SELECT id INTO new.season_id
      FROM public.seasons
     WHERE is_active = true
     LIMIT 1;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_battle_report_assign_season ON public.battle_reports;
CREATE TRIGGER on_battle_report_assign_season
  BEFORE INSERT OR UPDATE ON public.battle_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_battle_report_season();
