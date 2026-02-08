-- Create Departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. Read: Users can view departments in their organization
CREATE POLICY "Users can view departments in their organization"
ON public.departments FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM public.profiles
        WHERE id = auth.uid()
    )
);

-- 2. Write: Admins can manage departments
CREATE POLICY "Admins can manage departments"
ON public.departments FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_departments_updated_at
BEFORE UPDATE ON public.departments
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
