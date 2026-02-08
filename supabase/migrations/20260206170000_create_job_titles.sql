-- Create Job Titles table
CREATE TABLE IF NOT EXISTS public.job_titles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.job_titles ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. Read: Users can view job titles in their organization
CREATE POLICY "Users can view job titles in their organization"
ON public.job_titles FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM public.profiles
        WHERE id = auth.uid()
    )
);

-- 2. Write: Admins can manage job titles
CREATE POLICY "Admins can manage job titles"
ON public.job_titles FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

-- Trigger for updated_at
CREATE TRIGGER update_job_titles_updated_at
BEFORE UPDATE ON public.job_titles
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
