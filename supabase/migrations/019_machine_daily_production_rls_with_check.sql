-- Permitir INSERT/UPDATE en machine_daily_production con WITH CHECK explícito
-- (algúns entornos RLS requiren WITH CHECK para que o INSERT permita a fila nova)
drop policy if exists "Users can manage machine_daily_production for own org machines" on public.machine_daily_production;

create policy "Users can manage machine_daily_production for own org machines"
  on public.machine_daily_production
  for all
  using (
    machine_id in (
      select m.id from public.machines m
      join public.lines l on l.id = m.line_id
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  )
  with check (
    machine_id in (
      select m.id from public.machines m
      join public.lines l on l.id = m.line_id
      join public.profiles p on p.organization_id = l.organization_id
      where p.id = auth.uid()
    )
  );
