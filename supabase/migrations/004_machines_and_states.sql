-- Número de máquinas por línea (1-20), configurable
alter table public.lines
  add column if not exists machine_count integer not null default 1 check (machine_count >= 1 and machine_count <= 20);

-- Máquinas por línea (position 1..machine_count), cada una con habilitada sí/no
create table if not exists public.machines (
  id uuid primary key default gen_random_uuid(),
  line_id uuid not null references public.lines(id) on delete cascade,
  position integer not null check (position >= 1 and position <= 20),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique(line_id, position)
);

create index idx_machines_line on public.machines(line_id);

-- Períodos de tiempo en cada estado (ended_at null = estado actual)
-- state: en_marcha, parada, falta_producto, emergencia, anomalia
create table if not exists public.machine_state_periods (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid not null references public.machines(id) on delete cascade,
  state text not null check (state in ('en_marcha', 'parada', 'falta_producto', 'emergencia', 'anomalia')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  constraint ended_after_started check (ended_at is null or ended_at >= started_at)
);

create index idx_machine_state_periods_machine on public.machine_state_periods(machine_id);
create index idx_machine_state_periods_started on public.machine_state_periods(started_at);

-- Piezas por máquina y día
create table if not exists public.machine_daily_production (
  machine_id uuid not null references public.machines(id) on delete cascade,
  date date not null,
  pieces_produced integer not null default 0 check (pieces_produced >= 0),
  pieces_rejected integer not null default 0 check (pieces_rejected >= 0),
  primary key (machine_id, date)
);

-- RLS machines
alter table public.machines enable row level security;

create policy "Users can view machines of own organization"
  on public.machines for select
  using (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );

create policy "Users can insert machines in own organization lines"
  on public.machines for insert
  with check (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );

create policy "Users can update machines in own organization"
  on public.machines for update
  using (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );

create policy "Users can delete machines in own organization"
  on public.machines for delete
  using (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );

-- RLS machine_state_periods
alter table public.machine_state_periods enable row level security;

create policy "Users can manage machine_state_periods for own org machines"
  on public.machine_state_periods for all
  using (
    machine_id in (
      select m.id from public.machines m
      join public.lines l on l.id = m.line_id
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );

-- RLS machine_daily_production
alter table public.machine_daily_production enable row level security;

create policy "Users can manage machine_daily_production for own org machines"
  on public.machine_daily_production for all
  using (
    machine_id in (
      select m.id from public.machines m
      join public.lines l on l.id = m.line_id
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );
