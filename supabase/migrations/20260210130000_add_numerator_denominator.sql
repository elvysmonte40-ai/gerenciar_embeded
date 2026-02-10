-- Add numerator and denominator columns to indicator_entries table
ALTER TABLE public.indicator_entries
ADD COLUMN numerator decimal(15,2),
ADD COLUMN denominator decimal(15,2);
