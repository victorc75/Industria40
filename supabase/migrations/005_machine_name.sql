-- Nombre editable por máquina (si es null, se muestra "Máquina {position}")
alter table public.machines
  add column if not exists name text;
