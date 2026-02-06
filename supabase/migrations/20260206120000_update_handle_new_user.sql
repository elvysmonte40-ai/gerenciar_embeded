-- Update the handle_new_user function to properly populate profiles from metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    full_name, 
    organization_id, 
    role,
    status
  )
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'organization_id')::uuid,
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    'active' -- Default status for invited users
  );
  return new;
end;
$$ language plpgsql security definer;
