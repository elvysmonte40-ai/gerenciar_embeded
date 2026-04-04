-- Add is_activated column to profiles
-- Only activated accounts (via welcome email) can login or reset password
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_activated boolean DEFAULT false NOT NULL;

-- Activate ALL existing users so they are not blocked
UPDATE public.profiles SET is_activated = true WHERE id IS NOT NULL;

-- Update handle_new_user trigger to set is_activated = false by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, role, organization_id,
    cpf, birth_date, job_title, department,
    manager_id, gender, is_activated
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    (new.raw_user_meta_data->>'organization_id')::uuid,
    new.raw_user_meta_data->>'cpf',
    (new.raw_user_meta_data->>'birth_date')::date,
    new.raw_user_meta_data->>'job_title',
    new.raw_user_meta_data->>'department',
    (new.raw_user_meta_data->>'manager_id')::uuid,
    new.raw_user_meta_data->>'gender',
    false  -- Account created but NOT activated until welcome email is sent
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
