-- Al salir de Producción se guarda el estado y segundos acumulados de cada máquina (tiempos congelados).
-- Al volver a Producción se reanuda el periodo con ese tiempo.
alter table public.machines
  add column if not exists frozen_state text check (frozen_state is null or frozen_state in ('en_marcha', 'parada', 'falta_producto', 'emergencia', 'anomalia'));

alter table public.machines
  add column if not exists frozen_accumulated_seconds integer;

alter table public.machines
  add column if not exists frozen_at timestamptz;
