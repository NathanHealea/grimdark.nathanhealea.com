ALTER TABLE battle_reports
  ADD COLUMN attacker_tabled boolean NOT NULL DEFAULT false,
  ADD COLUMN defender_tabled boolean NOT NULL DEFAULT false;
