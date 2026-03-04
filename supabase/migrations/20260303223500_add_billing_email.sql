-- Add billing email field to organizations table
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS billing_email text;
