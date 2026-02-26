-- Create a security definer function to check if the current user has an editor role for the process
CREATE OR REPLACE FUNCTION public.is_process_editor(_process_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.process_editor_roles per
    JOIN public.profiles prof ON prof.organization_role_id = per.organization_role_id
    WHERE per.process_id = _process_id
    AND prof.id = auth.uid()
  );
END;
$$;

-- 1. PROCESS VERSIONS: Drop the previous policies that didn't include editor roles
DROP POLICY IF EXISTS "View drafts if authorized" ON public.process_versions;
DROP POLICY IF EXISTS "Manage versions" ON public.process_versions;

-- Recreate "View drafts if authorized" 
CREATE POLICY "View drafts if authorized" ON public.process_versions
FOR SELECT USING (
    status IN ('draft', 'awaiting_approval') AND (
        -- Admin
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        OR
        -- Department Member
        EXISTS (
            SELECT 1 FROM public.processes p
            WHERE p.id = process_id
            AND p.department_id::text = (SELECT department FROM public.profiles WHERE id = auth.uid())
        )
        OR
        -- Is an Approver (via secure function to break recursion)
        public.is_process_approver(id)
        OR
        -- Is a Process Editor
        public.is_process_editor(process_id)
    )
);

-- Recreate "Manage versions" 
CREATE POLICY "Manage versions" ON public.process_versions
FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    EXISTS (
        SELECT 1 FROM public.processes p
        WHERE p.id = process_id
        AND p.department_id::text = (SELECT department FROM public.profiles WHERE id = auth.uid())
    )
    OR
    -- Is a Process Editor
    public.is_process_editor(process_id)
);

-- 2. PROCESSES: Drop the previous policy
DROP POLICY IF EXISTS "Manage processes in department" ON public.processes;

-- Recreate "Manage processes" to include editors
CREATE POLICY "Manage processes" ON public.processes
FOR ALL USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    AND (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        OR 
        (department_id IS NOT NULL AND department_id::text = (SELECT department FROM public.profiles WHERE id = auth.uid()))
        OR
        public.is_process_editor(id)
    )
);
