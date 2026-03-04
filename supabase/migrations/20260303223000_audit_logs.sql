-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    table_name text NOT NULL,
    record_id uuid, -- assuming UUID primary keys
    old_data jsonb,
    new_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Index for querying easily
CREATE INDEX idx_audit_logs_org_id ON public.audit_logs(organization_id);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Allow admins to read audit logs (Security Definer policies or explicit RLS)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view org audit logs" 
ON public.audit_logs FOR SELECT 
USING (
    public.has_permission('organization', 'manage_settings') AND
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);

-- Trigger Function for auto auditing
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS trigger AS $$
DECLARE
    v_user_id uuid;
    v_org_id uuid;
BEGIN
    -- Try to get the user making the change
    v_user_id := auth.uid();
    
    -- For demonstration, if we are auditing 'profiles' vs other tenant tables, we adapt
    -- Usually tenant tables have 'organization_id'
    
    IF TG_OP = 'DELETE' THEN
        -- try to find org id
        BEGIN
            v_org_id := OLD.organization_id;
        EXCEPTION WHEN undefined_column THEN
            v_org_id := NULL;
        END;

        INSERT INTO public.audit_logs (organization_id, user_id, action, table_name, record_id, old_data)
        VALUES (v_org_id, v_user_id, 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD)::jsonb);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        BEGIN
            v_org_id := NEW.organization_id;
        EXCEPTION WHEN undefined_column THEN
            v_org_id := NULL;
        END;

        -- Only log if row changed
        IF row_to_json(OLD)::jsonb != row_to_json(NEW)::jsonb THEN
            INSERT INTO public.audit_logs (organization_id, user_id, action, table_name, record_id, old_data, new_data)
            VALUES (v_org_id, v_user_id, 'UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        BEGIN
            v_org_id := NEW.organization_id;
        EXCEPTION WHEN undefined_column THEN
            v_org_id := NULL;
        END;

        INSERT INTO public.audit_logs (organization_id, user_id, action, table_name, record_id, new_data)
        VALUES (v_org_id, v_user_id, 'INSERT', TG_TABLE_NAME, NEW.id, row_to_json(NEW)::jsonb);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
