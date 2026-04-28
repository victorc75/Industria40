-- Crear organización con código y nombre; unirse a organización con código.
-- Límites por plan: Basic 1 usuario, Professional 5, Enterprise ilimitados.

-- Eliminar la función antigua (sin parámetros)
drop function if exists public.create_organization_for_user();

-- Crear organización + perfil owner + 2 líneas. Código único, requerido.
create or replace function public.create_organization_for_user(
  p_org_code text,
  p_org_name text default 'Mi empresa'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  org_id uuid;
  code_trimmed text;
  name_trimmed text;
begin
  uid := auth.uid();
  if uid is null then
    return null;
  end if;
  if exists (select 1 from public.profiles where id = uid) then
    return (select organization_id from public.profiles where id = uid limit 1);
  end if;

  code_trimmed := trim(lower(p_org_code));
  if length(code_trimmed) < 4 or length(code_trimmed) > 32 then
    raise exception 'El código debe tener entre 4 y 32 caracteres.';
  end if;
  if exists (select 1 from public.organizations where lower(organization_code) = code_trimmed) then
    raise exception 'Ese código de organización ya existe. Usa otro o únete con ese código.';
  end if;

  name_trimmed := coalesce(trim(nullif(p_org_name, '')), 'Mi empresa');

  insert into public.organizations (name, plan_id, created_by, organization_code)
  values (name_trimmed, 'professional', uid, code_trimmed)
  returning id into org_id;

  insert into public.profiles (id, organization_id, role)
  values (uid, org_id, 'owner');

  insert into public.lines (organization_id, name)
  values (org_id, 'Línea A'), (org_id, 'Línea B');

  return org_id;
end;
$$;

-- Unirse a una organización existente con el código. Respeta límites del plan.
create or replace function public.join_organization(p_org_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  org_id uuid;
  org_plan text;
  code_trimmed text;
  member_count bigint;
  max_members int;
begin
  uid := auth.uid();
  if uid is null then
    raise exception 'No autenticado.';
  end if;
  if exists (select 1 from public.profiles where id = uid) then
    return (select organization_id from public.profiles where id = uid limit 1);
  end if;

  code_trimmed := trim(lower(p_org_code));
  if length(code_trimmed) < 4 then
    raise exception 'Código de organización no válido.';
  end if;

  select o.id, o.plan_id
  into org_id, org_plan
  from public.organizations o
  where lower(o.organization_code) = code_trimmed
  limit 1;

  if org_id is null then
    raise exception 'No existe ninguna organización con ese código. Comprueba el código o crea una nueva organización.';
  end if;

  select count(*) into member_count
  from public.profiles
  where organization_id = org_id;

  case org_plan
    when 'basic'    then max_members := 1;
    when 'professional' then max_members := 5;
    when 'enterprise'   then max_members := 2147483647;
    else max_members := 1;
  end case;

  if member_count >= max_members then
    raise exception 'La organización ha alcanzado el límite de usuarios de su plan (Basic: 1, Professional: 5). Pide al administrador que actualice el plan.';
  end if;

  insert into public.profiles (id, organization_id, role)
  values (uid, org_id, 'member');

  return org_id;
end;
$$;

grant execute on function public.create_organization_for_user(text, text) to authenticated;
grant execute on function public.create_organization_for_user(text, text) to service_role;
grant execute on function public.join_organization(text) to authenticated;
grant execute on function public.join_organization(text) to service_role;
