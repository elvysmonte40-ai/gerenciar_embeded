-- Add schedule_type column to job_titles table
ALTER TABLE public.job_titles 
ADD COLUMN IF NOT EXISTS schedule_type text;

-- Add check constraint for valid schedule types (optional but good for consistency)
-- Common schedule types: 5x2, 6x1, 12x36, 24x48, Plantão, etc.
ALTER TABLE public.job_titles
ADD CONSTRAINT job_titles_schedule_type_check 
CHECK (schedule_type IN ('5x2', '6x1', '12x36', '24x48', 'Outra'));

-- Update comment
COMMENT ON COLUMN public.job_titles.schedule_type IS 'Work schedule type: 5x2, 6x1, 12x36, etc.';
