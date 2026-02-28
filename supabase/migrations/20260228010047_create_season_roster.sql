-- Season roster join table (profiles enrolled in a season with their army)
CREATE TABLE public.season_roster (
  season_id integer NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  faction_id uuid NOT NULL REFERENCES public.factions(id),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (season_id, profile_id)
);

-- Enable RLS
ALTER TABLE public.season_roster ENABLE ROW LEVEL SECURITY;

-- Anyone can read the roster (public data)
CREATE POLICY "Season roster is publicly readable"
  ON public.season_roster
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Members can add themselves to published seasons
CREATE POLICY "Members can join published seasons"
  ON public.season_roster
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Must be adding own profile
    profile_id = (
      SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    -- Season must be published
    AND EXISTS (
      SELECT 1 FROM public.seasons s
      WHERE s.id = season_id AND s.status = 'published'
    )
  );

-- Members can update their own faction
CREATE POLICY "Members can update own roster entry"
  ON public.season_roster
  FOR UPDATE
  TO authenticated
  USING (
    profile_id = (
      SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    profile_id = (
      SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
  );

-- Members can remove themselves
CREATE POLICY "Members can leave a season"
  ON public.season_roster
  FOR DELETE
  TO authenticated
  USING (
    profile_id = (
      SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
  );

-- Admins and organizers can manage all roster entries
CREATE POLICY "Admins and organizers can insert roster entries"
  ON public.season_roster
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'organizer')
    )
  );

CREATE POLICY "Admins and organizers can update roster entries"
  ON public.season_roster
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'organizer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'organizer')
    )
  );

CREATE POLICY "Admins and organizers can delete roster entries"
  ON public.season_roster
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'organizer')
    )
  );
