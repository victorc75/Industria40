-- Estado actual de la línea. Solo en "Produccion" se permiten cambios de estado en las máquinas.
alter table public.lines
  add column if not exists current_line_state text not null default 'Produccion'
    check (current_line_state in ('Produccion', 'Parada', 'Descanso programado', 'Mantenimiento', 'Cambio formato'));

alter table public.lines
  add column if not exists line_state_started_at timestamptz not null default now();
