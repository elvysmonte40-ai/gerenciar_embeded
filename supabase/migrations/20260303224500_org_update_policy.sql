-- Enable updates on organizations for their own members (or just admins)
-- Currently, we can check if the user belongs to the org. Ideally only admins should update,
-- but a basic check at least allows updates to pass. Since `has_permission` function exists, we can use it.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update their organization' AND tablename = 'organizations'
    ) THEN
        CREATE POLICY "Admins can update their organization" 
        ON public.organizations FOR UPDATE 
        USING (
            id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
            AND public.has_permission('organization', 'manage_settings')
        );
    END IF;
END $$;
