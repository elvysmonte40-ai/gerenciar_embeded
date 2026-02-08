-- Add created_by column to departments and job_titles
ALTER TABLE public.departments
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id);

ALTER TABLE public.job_titles
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id);

-- Update RLS policies might not be strictly necessary for read/write if the existing organization_id check covers it, 
-- but it's good practice. For now, we trust the organization-based RLS on the table.
