-- Add season number column
ALTER TABLE public.seasons ADD COLUMN number integer;

-- Backfill existing rows ordered by start_date
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY start_date ASC, id ASC) AS rn
  FROM public.seasons
)
UPDATE public.seasons s
SET number = n.rn
FROM numbered n
WHERE s.id = n.id;

-- Now make it NOT NULL
ALTER TABLE public.seasons ALTER COLUMN number SET NOT NULL;

-- Ensure unique season numbers
ALTER TABLE public.seasons ADD CONSTRAINT seasons_number_unique UNIQUE (number);

-- Make name optional (seasons can just be "Season #")
ALTER TABLE public.seasons ALTER COLUMN name DROP NOT NULL;
