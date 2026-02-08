-- Add email column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Update handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    role, 
    organization_id,
    cpf,
    birth_date,
    job_title,
    department,
    manager_id,
    gender,
    email -- Add email
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
    new.email -- Get email from auth.users
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sync email on update
CREATE OR REPLACE FUNCTION public.sync_email_to_profile()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync email updates from auth.users to profiles
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
AFTER UPDATE OF email ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_email_to_profile();

-- Backfill email for existing users
-- Note: This requires permissions to read auth.users. 
-- If this fails due to permissions, we might need another way or just accept empty emails for old users initially.
DO $$
BEGIN
  UPDATE public.profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id AND p.email IS NULL;
EXCEPTION WHEN OTHERS THEN
  -- Ignore errors if permission denied
  NULL;
END $$;
