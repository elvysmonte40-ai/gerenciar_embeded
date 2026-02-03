-- Create table for Organization Settings (Power BI, etc)
create table if not exists public.organization_settings (
  organization_id uuid not null references public.organizations(id) on delete cascade primary key,
  pbi_tenant_id text,
  pbi_client_id text,
  pbi_client_secret text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.organization_settings enable row level security;

-- Policies

-- SELECT: Only admins of the same organization can view settings
create policy "Admins can view their organization settings"
  on public.organization_settings for select
  using (
    organization_id in (
      select organization_id from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- INSERT: Only admins of the same organization can insert
create policy "Admins can insert their organization settings"
  on public.organization_settings for insert
  with check (
    organization_id in (
      select organization_id from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- UPDATE: Only admins of the same organization can update
create policy "Admins can update their organization settings"
  on public.organization_settings for update
  using (
    organization_id in (
      select organization_id from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );
