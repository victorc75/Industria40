-- Organizaciones (empresas/tenant)
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Mi empresa',
  plan_id text not null default 'professional' check (plan_id in ('basic', 'professional', 'enterprise')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Perfiles: enlaza auth.users con una organización
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Líneas de producción por organización
create table public.lines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index idx_profiles_organization on public.profiles(organization_id);
create index idx_lines_organization on public.lines(organization_id);

-- RLS
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.lines enable row level security;

-- Usuarios solo ven su organización
create policy "Users can view own organization"
  on public.organizations for select
  using (
    id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "Users can update own organization"
  on public.organizations for update
  using (
    id in (select organization_id from public.profiles where id = auth.uid())
  );

-- Crear organización solo si aún no tiene perfil (primer registro)
create policy "Users can insert organization when no profile"
  on public.organizations for insert
  with check (
    created_by = auth.uid()
    and not exists (select 1 from public.profiles where id = auth.uid())
  );

-- Perfiles: solo el propio
create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can insert own profile for own org"
  on public.profiles for insert
  with check (
    id = auth.uid()
    and organization_id in (select id from public.organizations where created_by = auth.uid())
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- Líneas: solo las de la organización del usuario
create policy "Users can view lines of own organization"
  on public.lines for select
  using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "Users can insert lines in own organization"
  on public.lines for insert
  with check (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "Users can update lines in own organization"
  on public.lines for update
  using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "Users can delete lines in own organization"
  on public.lines for delete
  using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

-- Servicio: permitir que el backend cree organización y perfil (con service_role o desde trigger)
-- Para crear org desde la app con el usuario autenticado, el usuario debe poder insertar en organizations.
-- Mejor: hacemos que el usuario pueda insertar UNA organización si no tiene perfil aún (vía function).
-- En la app haremos: 1) insert organization, 2) insert profile con that org. El usuario no puede insertar
-- en organizations directamente por RLS. Así que necesitamos una forma de crear la primera org.
-- Opción A: trigger en auth.users que al insertar crea org + profile (con name por defecto).
-- Opción B: policy "Users can insert organization" that allows insert only when... we can't easily restrict.
-- Opción C: RPC function create_organization_for_new_user() that runs as definer (bypass RLS) and creates org + profile.
-- Opción D: Allow insert on organizations with a check that the inserting user doesn't have a profile yet - but RLS doesn't have "insert only if not exists in other table" easily. We can use a policy with a subquery: with check (not exists (select 1 from profiles where id = auth.uid())). So "Users can insert organization if they have no profile" - but then we need to set the new org's id in the profile. So: 1) insert into organizations returning id, 2) insert into profiles (id, organization_id). For step 1 we need "insert into organizations" allowed. So policy: create policy "Users can insert one organization" on organizations for insert with check (not exists (select 1 from profiles where id = auth.uid())). But then anyone could insert an org - they just can't see others'. And then they insert their profile with that org. So we need: 1) User inserts organization (allowed if no profile). 2) User inserts profile with id=auth.uid(), organization_id=the new org. So we need "Users can insert profile" with check (id = auth.uid() and organization_id in (select id from organizations where ... we don't have a way to link "the org I just created" - we don't have a "created_by" on organizations). Simpler: add created_by uuid references auth.users to organizations. Then RLS: "Users can insert organization if they have no profile and created_by = auth.uid()". And "Users can insert profile with check (id = auth.uid() and organization_id in (select id from organizations where created_by = auth.uid()))". So when creating org we set created_by = auth.uid(). Then insert profile. Let me add created_by to organizations.
</think>
Añadiendo `created_by` a organizations para poder crear org y perfil desde la app con RLS.
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace