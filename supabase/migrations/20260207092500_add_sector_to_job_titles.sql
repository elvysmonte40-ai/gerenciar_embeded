-- Add sector_id to job_titles table
ALTER TABLE public.job_titles
ADD COLUMN sector_id uuid REFERENCES public.sectors(id) ON DELETE SET NULL;

-- Update RLS policies if necessary (usually not needed for simple foreign keys if the referenced table is readable)
-- The existing policies on job_titles cover read/write access based on organization_id.
