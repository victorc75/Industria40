-- Horarios de inicio y fin (HH:mm) para cada uno de los 3 turnos.
alter table public.lines
  add column if not exists shift_1_start text default '06:00' check (shift_1_start ~ '^[0-9]{1,2}:[0-9]{2}$');
alter table public.lines
  add column if not exists shift_1_end text default '14:00' check (shift_1_end ~ '^[0-9]{1,2}:[0-9]{2}$');
alter table public.lines
  add column if not exists shift_2_start text default '14:00' check (shift_2_start ~ '^[0-9]{1,2}:[0-9]{2}$');
alter table public.lines
  add column if not exists shift_2_end text default '22:00' check (shift_2_end ~ '^[0-9]{1,2}:[0-9]{2}$');
alter table public.lines
  add column if not exists shift_3_start text default '22:00' check (shift_3_start ~ '^[0-9]{1,2}:[0-9]{2}$');
alter table public.lines
  add column if not exists shift_3_end text default '06:00' check (shift_3_end ~ '^[0-9]{1,2}:[0-9]{2}$');
