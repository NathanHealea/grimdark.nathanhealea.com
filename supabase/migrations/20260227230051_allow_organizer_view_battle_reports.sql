-- Update battle_reports RLS to allow organizer to view all reports
DROP POLICY IF EXISTS "Admins can view all battle reports" ON battle_reports;

CREATE POLICY "Admins and organizers can view all battle reports" ON battle_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'organizer')
    )
  );
