-- Rename existing columns for consistency if they exist
ALTER TABLE public.indicator_entries 
RENAME COLUMN numerator TO realized_numerator;

ALTER TABLE public.indicator_entries 
RENAME COLUMN denominator TO realized_denominator;

-- Add new columns for target and budget
ALTER TABLE public.indicator_entries
ADD COLUMN IF NOT EXISTS target_numerator decimal(15,2),
ADD COLUMN IF NOT EXISTS target_denominator decimal(15,2),
ADD COLUMN IF NOT EXISTS budget_numerator decimal(15,2),
ADD COLUMN IF NOT EXISTS budget_denominator decimal(15,2);
