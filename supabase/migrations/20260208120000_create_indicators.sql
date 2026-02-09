-- Create Enums
create type indicator_direction as enum ('HIGHER_BETTER', 'LOWER_BETTER');
create type indicator_unit as enum ('currency', 'percent', 'number');

-- Create Indicators Table
create table public.indicators (
  id uuid not null default gen_random_uuid() primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete set null,
  title text not null,
  direction indicator_direction not null default 'HIGHER_BETTER',
  unit indicator_unit not null default 'number',
  periodicity text not null default 'monthly',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Indicators
alter table public.indicators enable row level security;

create policy "Users can view indicators in their organization"
  on public.indicators for select
  using (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );

create policy "Users can insert indicators in their organization"
  on public.indicators for insert
  with check (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
    -- Optional: enforce owner_id = auth.uid() if strictly personal, 
    -- but usually we allow creating for others or just require being in the org.
  );

create policy "Users can update their own indicators or admins"
  on public.indicators for update
  using (
    (owner_id = auth.uid()) OR 
    (organization_id in (select organization_id from public.profiles where id = auth.uid() and role = 'admin'))
  );

create policy "Users can delete their own indicators or admins"
  on public.indicators for delete
  using (
    (owner_id = auth.uid()) OR 
    (organization_id in (select organization_id from public.profiles where id = auth.uid() and role = 'admin'))
  );

-- Create Indicator Entries Table
create table public.indicator_entries (
  id uuid not null default gen_random_uuid() primary key,
  indicator_id uuid not null references public.indicators(id) on delete cascade,
  month int not null check (month between 1 and 12),
  year int not null,
  target decimal(15,2), -- Meta
  budget decimal(15,2), -- Orçado
  realized decimal(15,2), -- Realizado
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(indicator_id, month, year)
);

-- RLS for Entries
alter table public.indicator_entries enable row level security;

create policy "Users can view entries of their organization's indicators"
  on public.indicator_entries for select
  using (
    indicator_id in (
      select id from public.indicators
      where organization_id in (
        select organization_id from public.profiles where id = auth.uid()
      )
    )
  );

create policy "Users can insert entries for their organization's indicators"
    on public.indicator_entries for insert
    with check (
        indicator_id in (
            select id from public.indicators
            where organization_id in (
                select organization_id from public.profiles where id = auth.uid()
            )
        )
    );

create policy "Users can update entries for their organization's indicators"
    on public.indicator_entries for update
    using (
        indicator_id in (
            select id from public.indicators
            where organization_id in (
                select organization_id from public.profiles where id = auth.uid()
            )
        )
    );

create policy "Users can delete entries for their organization's indicators"
    on public.indicator_entries for delete
    using (
        indicator_id in (
            select id from public.indicators
            where organization_id in (
                select organization_id from public.profiles where id = auth.uid()
            )
        )
    );

-- Create Indexes
create index idx_indicators_org on public.indicators(organization_id);
create index idx_indicators_owner on public.indicators(owner_id);
create index idx_entries_indicator on public.indicator_entries(indicator_id);
