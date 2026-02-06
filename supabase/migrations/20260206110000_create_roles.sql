-- Create table for Organization Roles (Perfis)
create table if not exists public.organization_roles (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  pbi_roles text, -- Comma separated roles for RLS
  can_export_data boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Roles
alter table public.organization_roles enable row level security;

create policy "Users can view their organization roles"
  on public.organization_roles for select
  using (
    organization_id in (
      select organization_id from public.profiles
      where id = auth.uid()
    )
  );

create policy "Admins can manage organization roles"
  on public.organization_roles for all
  using (
    organization_id in (
      select organization_id from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Create Junction Table for Role <-> Dashboard permissions
create table if not exists public.organization_role_dashboards (
  organization_role_id uuid not null references public.organization_roles(id) on delete cascade,
  dashboard_id uuid not null references public.organization_dashboards(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (organization_role_id, dashboard_id)
);

-- RLS for Junction
alter table public.organization_role_dashboards enable row level security;

create policy "Users can view their role dashboards"
  on public.organization_role_dashboards for select
  using (
    organization_role_id in (
      select id from public.organization_roles
      where organization_id in (
        select organization_id from public.profiles
        where id = auth.uid()
      )
    )
  );

create policy "Admins can manage role dashboards"
  on public.organization_role_dashboards for all
  using (
    organization_role_id in (
      select id from public.organization_roles
      where organization_id in (
          select organization_id from public.profiles
          where id = auth.uid()
          and role = 'admin'
      )
    )
  );

-- Notify schema reload
NOTIFY pgrst, 'reload config';
