ALTER TABLE battle_reports
  ADD COLUMN attacker_units_lost integer NOT NULL DEFAULT 0,
  ADD COLUMN attacker_models_lost integer NOT NULL DEFAULT 0,
  ADD COLUMN defender_units_lost integer NOT NULL DEFAULT 0,
  ADD COLUMN defender_models_lost integer NOT NULL DEFAULT 0;
