-- Add can_export_data column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS can_export_data BOOLEAN DEFAULT FALSE;

-- Update existing profiles (optional, maybe admin should have it by default?)
-- Let's give it to admins by default.
UPDATE public.profiles 
SET can_export_data = TRUE 
WHERE role = 'admin';

-- Update the handle_new_user function to populate permission
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    full_name, 
    organization_id, 
    role,
    status,
    can_export_data
  )
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'organization_id')::uuid,
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    'active',
    coalesce((new.raw_user_meta_data->>'can_export_data')::boolean, false)
  );
  return new;
end;
$$ language plpgsql security definer;

