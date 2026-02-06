-- Create table for Organization Menus
create table if not exists public.organization_menus (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  icon_name text, -- Lucide icon name
  icon_url text, -- Custom image URL
  order_index integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.organization_menus enable row level security;

-- Policies for organization_menus
create policy "Users can view their organization menus"
  on public.organization_menus for select
  using (
    organization_id in (
      select organization_id from public.profiles
      where id = auth.uid()
    )
  );

create policy "Admins can insert their organization menus"
  on public.organization_menus for insert
  with check (
    organization_id in (
      select organization_id from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Admins can update their organization menus"
  on public.organization_menus for update
  using (
    organization_id in (
      select organization_id from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Admins can delete their organization menus"
  on public.organization_menus for delete
  using (
    organization_id in (
      select organization_id from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Add menu_id to organization_dashboards
alter table public.organization_dashboards
add column if not exists menu_id uuid references public.organization_menus(id) on delete set null;

-- Create Storage Bucket for Menu Icons
insert into storage.buckets (id, name, public)
values ('menu-icons', 'menu-icons', true)
on conflict (id) do nothing;

-- Storage Policies
-- Note: Assuming storage extension is enabled and policies work standardly
create policy "Menu icons are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'menu-icons' );

create policy "Authenticated users can upload menu icons"
  on storage.objects for insert
  with check ( bucket_id = 'menu-icons' and auth.role() = 'authenticated' );

create policy "Users can update their own menu icons"
  on storage.objects for update
  using ( bucket_id = 'menu-icons' and auth.uid() = owner );

create policy "Users can delete their own menu icons"
  on storage.objects for delete
  using ( bucket_id = 'menu-icons' and auth.uid() = owner );
