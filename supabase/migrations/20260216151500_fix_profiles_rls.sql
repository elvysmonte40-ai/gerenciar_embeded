-- Fix RLS: Ensure users (and admins) can SELECT profiles in their organization
-- Previous policy might have been restrictive or problematic with recursion

DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;

CREATE POLICY "Users can view profiles in their organization"
ON public.profiles
FOR SELECT
USING (
  organization_id = (
    SELECT organization_id FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1
  )
);
