-- Turno de trabajo por línea (1, 2, 3)
alter table public.lines
  add column if not exists work_shift integer not null default 1 check (work_shift in (1, 2, 3));

-- KPIs manuales por línea, fecha y turno (hasta 3 registros por línea por día)
alter table public.kpi_snapshots
  add column if not exists work_shift integer not null default 1 check (work_shift in (1, 2, 3));

-- Sustituir unique(line_id, date) por unique(line_id, date, work_shift)
alter table public.kpi_snapshots
  drop constraint if exists kpi_snapshots_line_id_date_key;

alter table public.kpi_snapshots
  add constraint kpi_snapshots_line_id_date_work_shift_key unique (line_id, date, work_shift);

create index if not exists idx_kpi_snapshots_line_date_shift on public.kpi_snapshots(line_id, date desc, work_shift);
