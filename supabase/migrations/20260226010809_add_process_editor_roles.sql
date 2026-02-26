-- Create the process_editor_roles junction table
CREATE TABLE IF NOT EXISTS public.process_editor_roles (
    process_id UUID REFERENCES public.processes(id) ON DELETE CASCADE,
    organization_role_id UUID REFERENCES public.organization_roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (process_id, organization_role_id)
);

-- Enable RLS
ALTER TABLE public.process_editor_roles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all authenticated users in the organization" 
ON public.process_editor_roles 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" 
ON public.process_editor_roles 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" 
ON public.process_editor_roles 
FOR DELETE 
USING (auth.role() = 'authenticated');
