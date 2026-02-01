-- Create Organizations table
create table organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text check (role in ('admin', 'manager', 'user')) default 'user',
  organization_id uuid references organizations(id),
  updated_at timestamp with time zone,
  
  constraint proper_role check (char_length(role) > 0)
);

-- RLS: Organizations
alter table organizations enable row level security;

create policy "Users can view their own organization"
  on organizations for select
  using (
    id in (
      select organization_id from profiles
      where id = auth.uid()
    )
  );

-- RLS: Profiles
alter table profiles enable row level security;

create policy "Users can view profiles in their organization"
  on profiles for select
  using (
    organization_id in (
      select organization_id from profiles
      where id = auth.uid()
    )
  );

create policy "Users can update their own profile"
  on profiles for update
  using ( id = auth.uid() );

-- Function to handle new user signup (optional, for triggers)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;
-- Trigger is tricky without knowing if org is created first. 
-- For now, manual profile creation or via invite logic is better for B2B.
