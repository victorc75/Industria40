-- KPIs por máquina no snapshot (ao gardar/reiniciar), para mostralos no reporte
create table if not exists public.machine_kpi_snapshot (
  line_id uuid not null references public.lines(id) on delete cascade,
  date date not null,
  work_shift integer not null default 1 check (work_shift in (1, 2, 3)),
  machine_id uuid not null references public.machines(id) on delete cascade,
  oee numeric(5,2) not null check (oee >= 0 and oee <= 100),
  disponibilidad numeric(5,2) not null check (disponibilidad >= 0 and disponibilidad <= 100),
  rendimiento numeric(5,2) not null check (rendimiento >= 0 and rendimiento <= 100),
  calidad numeric(5,2) not null check (calidad >= 0 and calidad <= 100),
  primary key (line_id, date, work_shift, machine_id)
);

create index idx_machine_kpi_snapshot_lookup
  on public.machine_kpi_snapshot(line_id, date, work_shift);

alter table public.machine_kpi_snapshot enable row level security;

create policy "Users can view machine_kpi_snapshot of own organization"
  on public.machine_kpi_snapshot for select
  using (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );

create policy "Users can insert machine_kpi_snapshot for own organization lines"
  on public.machine_kpi_snapshot for insert
  with check (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );

create policy "Users can update machine_kpi_snapshot for own organization lines"
  on public.machine_kpi_snapshot for update
  using (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );

create policy "Users can delete machine_kpi_snapshot for own organization lines"
  on public.machine_kpi_snapshot for delete
  using (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );
