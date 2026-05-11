-- =============================================================================
-- Limpiar datos de la aplicación (y opcionalmente usuarios de Auth)
-- =============================================================================
-- Ejecutar en Supabase → SQL Editor, como usuario con permisos (rol postgres
-- del proyecto, o la conexión por defecto del editor).
--
-- PASO 1 (recomendado): solo datos de negocio (organizaciones, líneas, KPIs…).
--   No borra cuentas de login: los usuarios siguen existiendo en Auth pero
--   sin organización ni datos en public.
--
-- PASO 2 (opcional): descomentar el bloque «AUTH» al final si también quieres
--   eliminar usuarios de Autenticación (tendrán que registrarse de nuevo).
--   Si alguna línea falla por «relation does not exist», bórrala y reintenta.
--   Alternativa: Authentication → Users → eliminar desde el panel.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PASO 1: tablas public (CASCADE respeta FKs entre ellas)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- PASO 2 (opcional): vaciar Auth — descomenta el bloque siguiente.
-- Orden: primero tablas hijas de auth.users. Si una tabla «no existe», quita esa línea.
-- -----------------------------------------------------------------------------
/*
delete from auth.refresh_tokens;
delete from auth.sessions;
delete from auth.mfa_amr_claims;
delete from auth.mfa_challenges;
delete from auth.mfa_factors;
delete from auth.one_time_tokens;
delete from auth.identities;
delete from auth.users;
*/
