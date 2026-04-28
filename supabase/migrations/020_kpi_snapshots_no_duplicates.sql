-- Eliminar duplicados en kpi_snapshots (mesma línea, data e turno).
-- Quédase un único rexistro por (line_id, date, work_shift): o máis recente (created_at) e en empate o de id menor.

DELETE FROM public.kpi_snapshots
WHERE id NOT IN (
  SELECT DISTINCT ON (line_id, date, work_shift) id
  FROM public.kpi_snapshots
  ORDER BY line_id, date, work_shift, created_at DESC NULLS LAST, id ASC
);

-- Asegurar a constraint única (por se faltaba)
ALTER TABLE public.kpi_snapshots
  DROP CONSTRAINT IF EXISTS kpi_snapshots_line_id_date_key;

ALTER TABLE public.kpi_snapshots
  DROP CONSTRAINT IF EXISTS kpi_snapshots_line_id_date_work_shift_key;

ALTER TABLE public.kpi_snapshots
  ADD CONSTRAINT kpi_snapshots_line_id_date_work_shift_key UNIQUE (line_id, date, work_shift);
