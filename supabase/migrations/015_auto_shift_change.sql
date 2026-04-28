-- Selector: cambio de turno automático (según hora) ou manual
alter table public.lines
  add column if not exists auto_shift_change boolean not null default false;
