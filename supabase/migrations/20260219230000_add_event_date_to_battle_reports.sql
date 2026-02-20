ALTER TABLE public.battle_reports
  ADD COLUMN event_date date NOT NULL DEFAULT CURRENT_DATE;
