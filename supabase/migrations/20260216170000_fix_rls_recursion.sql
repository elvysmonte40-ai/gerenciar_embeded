-- Fix infinite recursion in process_versions / process_version_approvers policies

-- 1. Create a SECURITY DEFINER function to check approver status without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_process_approver(_version_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Secure the function
AS $$
BEGIN
  -- Check if currrent user is an approver for the given version
  RETURN EXISTS (
    SELECT 1
    FROM public.process_version_approvers
    WHERE process_version_id = _version_id
    AND user_id = auth.uid()
  );
END;
$$;

-- 2. Drop the problematic policy
DROP POLICY IF EXISTS "View drafts if authorized" ON public.process_versions;

-- 3. Recreate the policy using the security definer function
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
    )
);
