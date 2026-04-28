-- Tiempo planificado del día (segundos) y ritmo teórico (piezas por minuto) para calcular rendimiento.
alter table public.lines
  add column if not exists planned_seconds integer not null default 28800 check (planned_seconds > 0);

alter table public.lines
  add column if not exists pieces_per_minute numeric not null default 1 check (pieces_per_minute > 0);
