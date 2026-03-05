-- Create required extensions (requires superuser, but supported by Supabase)
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- voors_settings
CREATE TABLE public.voors_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    auto_sync_enabled BOOLEAN DEFAULT false,
    last_sync_at TIMESTAMPTZ,
    auto_created_job_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id)
);

-- voors_field_mapping (Global)
CREATE TABLE public.voors_field_mapping (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voors_key TEXT NOT NULL,
    system_column TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(voors_key)
);

-- Insert initial mapping for some known fields
INSERT INTO public.voors_field_mapping (voors_key, system_column) VALUES
('userFullName', 'name'),
('CPF', 'cpf'),
('email', 'email'),
('departmentName', 'department_id'),
('jobRoleTitle', 'job_title_id'),
('situation', 'status');

-- voors_users_staging
CREATE TABLE public.voors_users_staging (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    processed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending', -- pending, success, error
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voors_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voors_field_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voors_users_staging ENABLE ROW LEVEL SECURITY;

-- Voors Settings RLS Policies
CREATE POLICY "Admins can view their organization voors settings"
    ON public.voors_settings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.organization_id = voors_settings.organization_id
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage their organization voors settings"
    ON public.voors_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.organization_id = voors_settings.organization_id
            AND profiles.role = 'admin'
        )
    );

-- Voors Field Mapping RLS Policies (Global, but viewable by any admin)
CREATE POLICY "Admins can view global mappings"
    ON public.voors_field_mapping FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage global mappings"
    ON public.voors_field_mapping FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Voors Staging RLS Policies
CREATE POLICY "Admins can view staging"
    ON public.voors_users_staging FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.organization_id = voors_users_staging.organization_id
            AND profiles.role = 'admin'
        )
    );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_voors_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_voors_settings_modtime
    BEFORE UPDATE ON public.voors_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_voors_updated_at_column();

CREATE TRIGGER update_voors_field_mapping_modtime
    BEFORE UPDATE ON public.voors_field_mapping
    FOR EACH ROW
    EXECUTE FUNCTION update_voors_updated_at_column();
