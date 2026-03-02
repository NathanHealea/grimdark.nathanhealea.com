-- Add DELETE policy for battle reports (admins and organizers)
CREATE POLICY "Admins and organizers can delete battle reports"
  ON public.battle_reports
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'organizer')
    )
  );
