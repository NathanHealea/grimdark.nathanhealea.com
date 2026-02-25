-- Add status column to seasons (draft/published)
ALTER TABLE seasons ADD COLUMN status text NOT NULL DEFAULT 'published';
ALTER TABLE seasons ADD CONSTRAINT seasons_status_check CHECK (status IN ('draft', 'published'));

-- If a season is active, it must be published
ALTER TABLE seasons ADD CONSTRAINT active_requires_published
  CHECK (is_active = false OR status = 'published');

-- Replace public read policy with status-aware policies
DROP POLICY IF EXISTS "Seasons are publicly readable" ON seasons;

CREATE POLICY "Published seasons are publicly readable"
  ON seasons FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can view all seasons"
  ON seasons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );
