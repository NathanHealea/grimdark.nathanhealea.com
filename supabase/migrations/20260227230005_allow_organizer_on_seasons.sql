-- Update seasons RLS policies to allow organizer role

-- Drop existing admin-only policies
DROP POLICY IF EXISTS "Admins can create seasons" ON seasons;
DROP POLICY IF EXISTS "Admins can update seasons" ON seasons;
DROP POLICY IF EXISTS "Admins can view all seasons" ON seasons;
DROP POLICY IF EXISTS "Admins can delete seasons" ON seasons;

-- Recreate with admin OR organizer access
CREATE POLICY "Admins and organizers can create seasons" ON seasons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'organizer')
    )
  );

CREATE POLICY "Admins and organizers can update seasons" ON seasons
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'organizer')
    )
  );

CREATE POLICY "Admins and organizers can view all seasons" ON seasons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'organizer')
    )
  );

CREATE POLICY "Admins and organizers can delete seasons" ON seasons
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'organizer')
    )
  );
