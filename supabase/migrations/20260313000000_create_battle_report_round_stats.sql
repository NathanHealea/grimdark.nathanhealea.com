-- Create battle_report_round_stats table for per-round stat tracking
CREATE TABLE public.battle_report_round_stats (
  id serial PRIMARY KEY,
  battle_report_id uuid NOT NULL REFERENCES public.battle_reports(id) ON DELETE CASCADE,
  round_number integer NOT NULL CHECK (round_number >= 1 AND round_number <= 5),
  attacker_points_earned integer NOT NULL DEFAULT 0 CHECK (attacker_points_earned >= 0),
  attacker_units_lost integer NOT NULL DEFAULT 0 CHECK (attacker_units_lost >= 0),
  attacker_models_lost integer NOT NULL DEFAULT 0 CHECK (attacker_models_lost >= 0),
  defender_points_earned integer NOT NULL DEFAULT 0 CHECK (defender_points_earned >= 0),
  defender_units_lost integer NOT NULL DEFAULT 0 CHECK (defender_units_lost >= 0),
  defender_models_lost integer NOT NULL DEFAULT 0 CHECK (defender_models_lost >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (battle_report_id, round_number)
);

-- Enable RLS
ALTER TABLE public.battle_report_round_stats ENABLE ROW LEVEL SECURITY;

-- SELECT: publicly readable (mirrors battle_reports)
CREATE POLICY "Round stats are publicly readable"
  ON public.battle_report_round_stats
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT: report owner or admin
CREATE POLICY "Report owner or admin can insert round stats"
  ON public.battle_report_round_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.battle_reports br
      WHERE br.id = battle_report_id
        AND (
          br.reported_by = auth.uid()
          OR 'admin' = ANY(public.get_user_roles(auth.uid()))
        )
    )
  );

-- UPDATE: report owner or admin
CREATE POLICY "Report owner or admin can update round stats"
  ON public.battle_report_round_stats
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.battle_reports br
      WHERE br.id = battle_report_id
        AND (
          br.reported_by = auth.uid()
          OR 'admin' = ANY(public.get_user_roles(auth.uid()))
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.battle_reports br
      WHERE br.id = battle_report_id
        AND (
          br.reported_by = auth.uid()
          OR 'admin' = ANY(public.get_user_roles(auth.uid()))
        )
    )
  );

-- DELETE: report owner or admin
CREATE POLICY "Report owner or admin can delete round stats"
  ON public.battle_report_round_stats
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.battle_reports br
      WHERE br.id = battle_report_id
        AND (
          br.reported_by = auth.uid()
          OR 'admin' = ANY(public.get_user_roles(auth.uid()))
        )
    )
  );
