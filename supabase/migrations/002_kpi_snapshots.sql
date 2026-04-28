-- Snapshot de KPIs por línea y fecha (un registro por línea por día)
create table public.kpi_snapshots (
  id uuid primary key default gen_random_uuid(),
  line_id uuid not null references public.lines(id) on delete cascade,
  date date not null,
  oee numeric(5,2) not null check (oee >= 0 and oee <= 100),
  disponibilidad numeric(5,2) not null check (disponibilidad >= 0 and disponibilidad <= 100),
  rendimiento numeric(5,2) not null check (rendimiento >= 0 and rendimiento <= 100),
  calidad numeric(5,2) not null check (calidad >= 0 and calidad <= 100),
  created_at timestamptz not null default now(),
  unique(line_id, date)
);

create index idx_kpi_snapshots_line_date on public.kpi_snapshots(line_id, date desc);

alter table public.kpi_snapshots enable row level security;

-- Solo ver/insertar/actualizar snapshots de líneas de la organización del usuario
create policy "Users can view kpi_snapshots of own organization"
  on public.kpi_snapshots for select
  using (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );

create policy "Users can insert kpi_snapshots for own organization lines"
  on public.kpi_snapshots for insert
  with check (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );

create policy "Users can update kpi_snapshots for own organization lines"
  on public.kpi_snapshots for update
  using (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );

create policy "Users can delete kpi_snapshots for own organization lines"
  on public.kpi_snapshots for delete
  using (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );
