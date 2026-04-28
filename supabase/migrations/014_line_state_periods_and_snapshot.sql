-- Períodos de estado da liña (cada vez que se cambia o estado rexístrase o período anterior)
create table if not exists public.line_state_periods (
  id uuid primary key default gen_random_uuid(),
  line_id uuid not null references public.lines(id) on delete cascade,
  state text not null check (state in ('Produccion', 'Parada', 'Descanso programado', 'Mantenimiento', 'Cambio formato')),
  started_at timestamptz not null default now(),
  ended_at timestamptz not null,
  constraint ended_after_started check (ended_at >= started_at)
);

create index idx_line_state_periods_line on public.line_state_periods(line_id);
create index idx_line_state_periods_started on public.line_state_periods(started_at);

alter table public.line_state_periods enable row level security;

create policy "Users can view line_state_periods of own organization"
  on public.line_state_periods for select
  using (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );

create policy "Users can insert line_state_periods for own organization lines"
  on public.line_state_periods for insert
  with check (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );

-- Snapshot de tempos por estado de LIÑA ao gardar/reiniciar (Producción, Parada, etc.)
create table if not exists public.line_line_state_times_snapshot (
  line_id uuid not null references public.lines(id) on delete cascade,
  date date not null,
  work_shift integer not null default 1 check (work_shift in (1, 2, 3)),
  line_state text not null check (line_state in ('Produccion', 'Parada', 'Descanso programado', 'Mantenimiento', 'Cambio formato')),
  seconds numeric(12,2) not null default 0 check (seconds >= 0),
  primary key (line_id, date, work_shift, line_state)
);

create index idx_line_line_state_times_snapshot_lookup
  on public.line_line_state_times_snapshot(line_id, date, work_shift);

alter table public.line_line_state_times_snapshot enable row level security;

create policy "Users can view line_line_state_times_snapshot of own organization"
  on public.line_line_state_times_snapshot for select
  using (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );

create policy "Users can insert line_line_state_times_snapshot for own organization lines"
  on public.line_line_state_times_snapshot for insert
  with check (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );

create policy "Users can update line_line_state_times_snapshot for own organization lines"
  on public.line_line_state_times_snapshot for update
  using (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );

create policy "Users can delete line_line_state_times_snapshot for own organization lines"
  on public.line_line_state_times_snapshot for delete
  using (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );
