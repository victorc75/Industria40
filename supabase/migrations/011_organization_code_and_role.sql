-- Código de organización (único, requerido) y rol en perfiles.
-- El código lo usa el creador y los que se unen a la organización.

alter table public.organizations
  add column if not exists organization_code text;

-- Códigos únicos para organizaciones existentes
update public.organizations
set organization_code = upper(substring(md5(id::text) from 1 for 8))
where organization_code is null;

alter table public.organizations
  alter column organization_code set not null,
  add constraint organizations_organization_code_key unique (organization_code);

comment on column public.organizations.organization_code is 'Código para unirse a la organización; requerido al crear la org.';

-- Rol en perfiles: owner (creó la org) o member (se unió con código)
alter table public.profiles
  add column if not exists role text not null default 'member'
  check (role in ('owner', 'member'));

update public.profiles p
set role = 'owner'
where exists (
  select 1 from public.organizations o
  where o.id = p.organization_id and o.created_by = p.id
);

comment on column public.profiles.role is 'owner: creó la organización; member: se unió con código.';
