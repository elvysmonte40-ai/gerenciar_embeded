-- Helper function to check granular roles via RLS
CREATE OR REPLACE FUNCTION public.has_permission(p_resource text, p_action text)
RETURNS boolean AS $$
DECLARE
    v_is_admin boolean;
    v_org_role_id uuid;
    v_permissions jsonb;
    v_has_perm boolean;
BEGIN
    SELECT (role = 'admin'), organization_role_id
    INTO v_is_admin, v_org_role_id
    FROM public.profiles 
    WHERE id = auth.uid();
    
    IF v_is_admin THEN
        RETURN true;
    END IF;

    IF v_org_role_id IS NULL THEN
        RETURN false;
    END IF;

    SELECT permissions INTO v_permissions
    FROM public.organization_roles
    WHERE id = v_org_role_id;

    IF v_permissions IS NULL THEN
        RETURN false;
    END IF;

    IF p_resource = 'organization' THEN
        v_has_perm := (v_permissions->'organization'->>'manage_settings')::boolean;
    ELSE
        v_has_perm := (v_permissions->p_resource->>p_action)::boolean;
    END IF;

    RETURN COALESCE(v_has_perm, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
