-- Remove is_active in favor of date-based "current" detection
-- A published season is automatically "current" when today falls within its date range

-- Drop constraints that reference is_active
ALTER TABLE seasons DROP CONSTRAINT IF EXISTS active_requires_published;
DROP INDEX IF EXISTS seasons_single_active;

-- Drop the column
ALTER TABLE seasons DROP COLUMN is_active;
