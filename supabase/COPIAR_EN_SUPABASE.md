# Configuración en Supabase (copiar y pegar)

Entra en **Supabase** → tu proyecto → **SQL Editor**. Ejecuta las **cuatro consultas** en este orden (001, 002, 003, 004).

---

## Paso 1: Primera consulta

Crea una **nueva query** y pega todo el contenido del archivo:

**`supabase/migrations/001_initial_schema.sql`**

Luego pulsa **Run** (o Ctrl+Enter).

- Si ves *"relation already exists"* en alguna tabla, es que ya ejecutaste esto antes. En ese caso **solo** ejecuta el Paso 3 más abajo.

---

## Paso 2: Segunda consulta

Crea **otra nueva query** y pega todo el contenido del archivo:

**`supabase/migrations/002_kpi_snapshots.sql`**

Pulsa **Run**.

---

## Paso 3: Tercera consulta (función para crear org/perfil)

Crea **otra nueva query** y pega todo el contenido del archivo:

**`supabase/migrations/003_create_org_function.sql`**

Pulsa **Run**.

---

## Paso 4: Cuarta consulta (máquinas por línea)

Crea **otra nueva query** y pega todo el contenido del archivo:

**`supabase/migrations/004_machines_and_states.sql`**

Pulsa **Run**. Así tendrás tablas para máquinas (hasta 20 por línea), estados (En marcha, Parada, etc.) y piezas producidas/rechazadas.

---

## Si el Paso 1 ya lo habías ejecutado antes

Si en el Paso 1 salían errores de "already exists" (tablas ya creadas), ejecuta esta query en el SQL Editor:

```sql
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
```

---

## Después

Vuelve a la app, **Iniciar sesión** con tu email y contraseña. Deberías entrar al dashboard.
