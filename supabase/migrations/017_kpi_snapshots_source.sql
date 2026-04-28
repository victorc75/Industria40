-- Orixe do rexistro de KPIs: manual (formulario) ou auto (cron/guardar e reiniciar)
alter table public.kpi_snapshots
  add column if not exists source text not null default 'auto' check (source in ('manual', 'auto'));

comment on column public.kpi_snapshots.source is 'manual = rexistro manual; auto = calculado/cron ou guardar e reiniciar';
