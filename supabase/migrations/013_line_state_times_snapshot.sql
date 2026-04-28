-- Snapshot de tempos de estado por máquina ao gardar/reiniciar (para reportes)
-- Unha fila por (liña, data, turno, máquina, estado) con segundos.
create table if not exists public.line_state_times_snapshot (
  line_id uuid not null references public.lines(id) on delete cascade,
  date date not null,
  work_shift integer not null default 1 check (work_shift in (1, 2, 3)),
  machine_id uuid not null references public.machines(id) on delete cascade,
  state text not null check (state in ('en_marcha', 'parada', 'falta_producto', 'emergencia', 'anomalia')),
  seconds numeric(12,2) not null default 0 check (seconds >= 0),
  primary key (line_id, date, work_shift, machine_id, state)
);

create index idx_line_state_times_snapshot_lookup
  on public.line_state_times_snapshot(line_id, date, work_shift);

alter table public.line_state_times_snapshot enable row level security;

create policy "Users can view line_state_times_snapshot of own organization"
  on public.line_state_times_snapshot for select
  using (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );

create policy "Users can insert line_state_times_snapshot for own organization lines"
  on public.line_state_times_snapshot for insert
  with check (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );

create policy "Users can update line_state_times_snapshot for own organization lines"
  on public.line_state_times_snapshot for update
  using (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );

create policy "Users can delete line_state_times_snapshot for own organization lines"
  on public.line_state_times_snapshot for delete
  using (
    line_id in (
      select l.id from public.lines l
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );
