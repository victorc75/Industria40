-- Función que crea organización + perfil + líneas para el usuario actual.
-- Se ejecuta con privilegios elevados (SECURITY DEFINER) para no depender de RLS en los INSERT.
-- La app la llama cuando el usuario no tiene perfil aún.

create or replace function public.create_organization_for_user()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  org_id uuid;
begin
  uid := auth.uid();
  if uid is null then
    return null;
  end if;
  -- Si ya tiene perfil, devolver su organización
  if exists (select 1 from public.profiles where id = uid) then
    return (select organization_id from public.profiles where id = uid limit 1);
  end if;
  -- Crear organización
  insert into public.organizations (name, plan_id, created_by)
  values ('Mi empresa', 'professional', uid)
  returning id into org_id;
  -- Crear perfil
  insert into public.profiles (id, organization_id)
  values (uid, org_id);
  -- Líneas por defecto
  insert into public.lines (organization_id, name)
  values (org_id, 'Línea A'), (org_id, 'Línea B');
  return org_id;
end;
$$;

grant execute on function public.create_organization_for_user() to authenticated;
grant execute on function public.create_organization_for_user() to service_role;
