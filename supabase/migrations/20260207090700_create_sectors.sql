-- Create Sectors table
CREATE TABLE IF NOT EXISTS public.sectors (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. Read: Users can view sectors in their organization
CREATE POLICY "Users can view sectors in their organization"
ON public.sectors FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM public.profiles
        WHERE id = auth.uid()
    )
);

-- 2. Write: Admins can manage sectors
CREATE POLICY "Admins can manage sectors"
ON public.sectors FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

-- Trigger for updated_at
CREATE TRIGGER update_sectors_updated_at
BEFORE UPDATE ON public.sectors
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
