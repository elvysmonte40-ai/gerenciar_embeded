-- Add department_id to sectors table
ALTER TABLE public.sectors
ADD COLUMN department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL;

-- Update RLS policies if necessary (usually not needed for simple foreign keys if the referenced table is readable)
-- The existing policies on sectors cover read/write access based on organization_id.
