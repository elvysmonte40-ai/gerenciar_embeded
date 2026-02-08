-- Add new columns to job_titles table for enhanced job details
ALTER TABLE public.job_titles
ADD COLUMN IF NOT EXISTS work_schedule text,
ADD COLUMN IF NOT EXISTS work_model text CHECK (work_model IN ('Presencial', 'Híbrido', 'Remoto')),
ADD COLUMN IF NOT EXISTS salary_min numeric,
ADD COLUMN IF NOT EXISTS salary_max numeric,
ADD COLUMN IF NOT EXISTS seniority_level text,
ADD COLUMN IF NOT EXISTS cbo_code text,
ADD COLUMN IF NOT EXISTS requirements text;

-- Add comment to the table
COMMENT ON TABLE public.job_titles IS 'Table to store job titles within an organization, including details like schedule, model, salary range, and requirements.';
