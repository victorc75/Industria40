-- Estado por defecto da liña: Parada (non se contabiliza tempo). A produción só conta cando se selecciona explícitamente.
alter table public.lines
  alter column current_line_state set default 'Parada';

-- Opcional: poñer as liñas existentes en Parada para corregir tempos inflados
update public.lines set current_line_state = 'Parada', line_state_started_at = now() where current_line_state = 'Produccion';
