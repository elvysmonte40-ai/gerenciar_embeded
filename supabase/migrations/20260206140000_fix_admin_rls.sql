-- Fix RLS: Allow Admins to update profiles in their organization

-- First, drop the restricted policy if it exists (or we can just add a new one, but let's be clean)
-- Actually, keep "Users can update their own profile" for self-service.
-- We will ADD a new policy for Admins.

CREATE POLICY "Admins can update profiles in their organization"
ON public.profiles
FOR UPDATE
USING (
  -- User must be an admin in the same organization as the target profile
  auth.uid() IN (
    SELECT id FROM public.profiles
    WHERE role = 'admin'
    AND organization_id = profiles.organization_id
  )
);
