-- Borrar todos os datos da aplicación para reiniciar dende cero.
-- Non borra usuarios de Supabase Auth (auth.users); só os datos das táboas public.
-- Executar con permisos de owner/service_role (p.ex. no SQL Editor do Supabase).

-- CASCADE permite truncar en calquera orde (trunca tamén as táboas que referencian estas).
truncate table
  public.machine_state_periods,
  public.machine_daily_production,
  public.machine_kpi_snapshot,
  public.line_state_times_snapshot,
  public.line_line_state_times_snapshot,
  public.line_state_periods,
  public.kpi_snapshots,
  public.machines,
  public.lines,
  public.profiles,
  public.organizations
restart identity
cascade;

-- Opcional: borrar tamén os usuarios de Autenticación (Supabase Auth).
-- Se queres que os usuarios teñan que rexistrarse de novo, no Dashboard: Authentication > Users,
-- ou descomenta abaixo. Se falla por FK (p.ex. storage.objects), borra antes obxectos en Storage
-- ou usa o Dashboard para eliminar usuarios.
-- delete from auth.identities;
-- delete from auth.users;
