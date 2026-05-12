# Industria40 — SaaS OEE y eficiencia de producción

Aplicación SaaS para controlar la eficiencia de las líneas de producción con KPIs: **OEE**, **Disponibilidad**, **Rendimiento** y **Calidad**.

**Documentación técnica (arquitectura, auth, dashboard, cron, base de datos):** [docs/FUNCIONAMIENTO.md](docs/FUNCIONAMIENTO.md).

---

## Cómo iniciar la app (desde el principio)

### 1. Requisitos

- **Node.js** (v18 o superior). Si no lo tienes: [nodejs.org](https://nodejs.org).
- **Cuenta en Supabase** (gratis): [supabase.com](https://supabase.com).

### 2. Abrir el proyecto

- Abre una **terminal** (PowerShell o CMD) y ve a la carpeta del proyecto:
  ```bash
  cd ruta\al\clon\Industria40
  ```
  Por ejemplo: `cd C:\Users\vcosta\Documents\ProyectoDAM\Industria40`

### 3. Instalar dependencias

Solo la primera vez (o cuando cambien las dependencias):

```bash
npm install
```

### 4. Configurar variables de entorno

- En la raíz del proyecto debe existir un archivo **`.env.local`**.
- Si no existe, créalo y añade estas dos variables (sustituye por los valores de tu proyecto en Supabase):

  ```
  NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
  ```
  También puedes usar `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_…`) en lugar de la anon; ver `.env.example`.

- Para **cambio de turno automático** (opcional): añade `SUPABASE_SERVICE_ROLE_KEY` (Settings → API → service_role) y `CRON_SECRET` (un secreto que uses para llamar al endpoint de cron). Ver más abajo "Cambio de turno automático".

- Dónde obtenerlos: en [Supabase](https://supabase.com/dashboard) → tu proyecto → **Settings** → **API Keys** / **Connect** → URL del proyecto y clave **anon** (JWT) o **publishable**.

### 5. Configurar Supabase (Auth y base de datos)

**Autenticación:**

- En Supabase: **Authentication** → **URL Configuration** → **Redirect URLs**.
- Añade: `http://localhost:3000/auth/callback`.
- (Opcional) En **Authentication** → **Providers** → **Email** puedes desactivar "Confirm email" para probar sin correo.

**Base de datos:**

- En Supabase abre **SQL Editor**.
- Ejecuta **en este orden** cada archivo de `supabase/migrations/`:
  1. `001_initial_schema.sql`
  2. `002_kpi_snapshots.sql`
  3. `003_create_org_function.sql`
  4. `004_machines_and_states.sql`
  5. `005_machine_name.sql`
  6. `006_line_states.sql`
  7. `007_machine_frozen_state.sql`
  8. `008_line_planned_and_rate.sql`
  9. `009_work_shift.sql`
  10. `010_line_shift_times.sql`
  11. `011_organization_code_and_role.sql`
  12. `012_org_join_and_create_with_code.sql`
  13. `013_line_state_times_snapshot.sql`
  14. `014_line_state_periods_and_snapshot.sql`
  15. `015_auto_shift_change.sql`
  16. `016_machine_kpi_snapshot.sql`
  17. `017_kpi_snapshots_source.sql`
  18. `018_line_default_parada.sql`
  19. `019_machine_daily_production_rls_with_check.sql`
  20. `020_kpi_snapshots_no_duplicates.sql`
  21. `021_plan_basic_default_trial.sql`
- Si algún archivo da error (por ejemplo “ya existe”), puedes omitirlo si ya lo ejecutaste antes.

### 6. Arrancar la app

En la terminal, dentro de la carpeta del proyecto:

```bash
npm run dev
```

- Espera a que aparezca algo como: **Ready** y **Local: http://localhost:3000**.
- Abre el navegador en: **http://localhost:3000**.

### 7. Probar

- **Página de inicio:** verás la landing y la sección de planes. Puedes hacer clic en **Elegir plan** para ir al dashboard (te pedirá iniciar sesión si no estás logueado).
- **Crear cuenta:** **Iniciar sesión** → **Registrarse** → email, contraseña y **Código de organización** (obligatorio). Si marcas **Crear nueva organización**, serás el primer usuario (owner) y puedes poner nombre de la organización; si no, usa el código que te haya pasado tu empresa para unirte. Los límites por plan: **Basic** 1 usuario, **Professional** 5 usuarios, **Enterprise** ilimitados.
- **Entrar:** **Iniciar sesión** → email y contraseña → **Entrar**. Si es la primera vez y aún no tienes perfil (p. ej. tras confirmar el email), te llevará a **Completar registro** para introducir el código de organización.
- **Dashboard:** en la cabecera, si eres owner verás **Código org: xxx** para compartir con otros usuarios. Líneas de producción, turnos, registro de KPIs, gráficas y buscador.

**Resumen:** `npm install` → configurar `.env.local` y Supabase (Auth + SQL) → `npm run dev` → abrir **http://localhost:3000**.

---

## Cambio de turno automático

En **Configuración** de cada línea hay un selector **Cambio de turno: Manual | Automático**.

- **Manual:** el turno se cambia solo cuando el usuario elige el turno en el dashboard y/o pulsa "Gardar datos da liña e inicializar a 0".
- **Automático:** según a hora configurada nos horarios de turnos (Turno 1: 06:00–14:00, etc.), ao chegar o fin dun turno pódese gardar e pasar ao seguinte de forma automática.

Para que o cambio automático funcione, hai que chamar periodicamente (p. ej. cada 5–10 minutos) o endpoint:

```
GET /api/cron/auto-shift
Authorization: Bearer <CRON_SECRET>
```

Configura en `.env.local`: `CRON_SECRET` e `SUPABASE_SERVICE_ROLE_KEY`. En Vercel podes usar [Cron Jobs](https://vercel.com/docs/cron-jobs) con un `vercel.json`:

```json
{
  "cron": "*/10 * * * *",
  "path": "/api/cron/auto-shift"
}
```

(E en Vercel → Project Settings → Environment Variables engade `CRON_SECRET` e `SUPABASE_SERVICE_ROLE_KEY`.)

Ao gardar (manual ou automático), **reinícianse tamén os tempos de estado da liña** (`line_state_started_at`), de modo que o tempo por estado de liña (Producción, Parada, etc.) empeza a contar de cero para o novo período.

---

## KPIs

- **OEE** (Overall Equipment Effectiveness) = Disponibilidad × Rendimiento × Calidad
- **Disponibilidad**: tiempo de funcionamiento / tiempo planificado
- **Rendimiento**: producción real / capacidad productiva
- **Calidad**: unidades buenas / total producidas

## Planes

| Plan          | Precio   | Líneas | Dashboard   | Usuarios | Soporte   | Almacenamiento |
|---------------|----------|--------|-------------|----------|-----------|----------------|
| Basic         | 199€/mes | 1-2    | Básico      | 1        | Email     | 1 GB           |
| Professional  | 449€/mes | 5      | Avanzado    | 5        | Teléfono  | 10 GB + API    |
| Enterprise    | 899€/mes | Ilimitadas | Personalizado | Ilimitados | 24/7 | 100 GB + API + integraciones |

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Desde la landing puedes ir a **Iniciar sesión** / **Ver dashboard** o elegir un plan. El dashboard requiere estar autenticado y respeta el límite de líneas del plan seleccionado.

### Autenticación (Supabase)

1. Crea un proyecto en [Supabase](https://supabase.com) (gratis).
2. Copia `.env.example` a `.env.local` y rellena:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto (Settings → API).
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: clave anon/public (Settings → API).
3. En Supabase: **Authentication** → **URL Configuration** → **Redirect URLs**, añade:
   - `http://localhost:3000/auth/callback` (desarrollo)
   - `https://tu-dominio.vercel.app/auth/callback` (producción).
4. (Opcional) En **Authentication** → **Providers** → **Email** puedes desactivar "Confirm email" para probar sin confirmación por correo.

### Base de datos (Supabase)

1. En el proyecto Supabase, abre **SQL Editor**.
2. Ejecuta **en orden** todos los ficheros de `supabase/migrations/` (lista numerada en la sección 5 de arriba).
3. Tras las migraciones tendrás tablas `organizations`, `profiles`, `lines`, máquinas, KPIs, RPC de alta de organización, etc., y políticas **RLS**.
4. **Alta de usuario y empresa:** no se crea la organización sola al entrar al dashboard. Hay que **registrarse** con código de organización: crear una nueva (eres *owner*) o unirse con el código de una existente. Ver [docs/FUNCIONAMIENTO.md](docs/FUNCIONAMIENTO.md) §4.
5. En el dashboard: **líneas**, **KPIs**, gráficas, máquinas, turnos y (opcional) cron de cambio de turno.

---

## Cómo probar la app (paso a paso)

### Antes de empezar

1. **Abre una terminal** en la carpeta del proyecto (`Industria40`).
2. **Instala dependencias** (si no lo has hecho):
   ```bash
   npm install
   ```
3. **Comprueba que tienes `.env.local`** con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ver sección Autenticación arriba).
4. **En Supabase**, en **SQL Editor**, ejecuta todas las migraciones en orden (ver sección 5 arriba).

---

### Arrancar la app

1. En la terminal ejecuta:
   ```bash
   npm run dev
   ```
2. Espera a que diga algo como: `Ready in ...` y `Local: http://localhost:3000`.
3. Abre el navegador en: **http://localhost:3000**.

---

### Probar login y dashboard

1. En la página principal haz clic en **Iniciar sesión**.
2. Si no tienes cuenta, **Registrarse**: email, contraseña, **código de organización** (mín. 4 caracteres). Marca **Crear nueva organización** y pon nombre de empresa, o usa un código existente para unirte.
   - Si en Supabase tienes "Confirm email" activado, revisa el correo; luego **Completar registro** si hace falta (`/auth/complete-registration`).
3. **Iniciar sesión** con email y contraseña → **Entrar**.
4. En el **dashboard** verás las líneas creadas por el RPC (p. ej. Línea A y B al crear organización nueva).

---

### Probar la gestión de líneas

1. En el dashboard, baja hasta la sección **Líneas de producción**.
2. **Añadir línea**: haz clic en **Añadir línea**, escribe un nombre (por ejemplo "Línea C") y pulsa **Guardar**. Debe aparecer la nueva línea en la lista.
3. **Editar**: en una línea, haz clic en el icono del **lápiz**, cambia el nombre y pulsa **Guardar**.
4. **Eliminar**: haz clic en el icono de la **papelera**, confirma en el mensaje. La línea desaparece de la lista.
5. Con plan Professional solo puedes tener 5 líneas; si intentas añadir una sexta, verás el mensaje de límite.

---

### Probar el registro de KPIs

1. En el dashboard, baja hasta **Registrar KPIs de hoy**.
2. Elige una **línea** en el desplegable (por ejemplo "Línea A").
3. Cambia los valores de **OEE**, **Disponibilidad**, **Rendimiento** y **Calidad** (entre 0 y 100).
4. Pulsa **Guardar**.
5. Deberías ver el mensaje "KPIs guardados correctamente".
6. La página se actualiza: en la **comparativa por línea** y en las **tarjetas** de arriba deberían aparecer los valores que acabas de guardar (para la línea y fecha de hoy).
7. Si guardas KPIs para la misma línea otro día (cambiando la fecha en la BD o al día siguiente), la gráfica **Evolución de KPIs** irá mostrando ese historial.

---

### Resumen rápido

| Qué quieres hacer        | Dónde / cómo                                      |
|--------------------------|----------------------------------------------------|
| Arrancar la app          | `npm run dev` → http://localhost:3000              |
| Crear cuenta             | Iniciar sesión → Registrarse                      |
| Entrar al dashboard      | Iniciar sesión → Entrar (o "Ver dashboard" logueado) |
| Añadir / editar / borrar líneas | Dashboard → sección "Líneas de producción"   |
| Guardar KPIs del día     | Dashboard → "Registrar KPIs de hoy" → Guardar      |

Si algo falla, revisa: `.env.local`, migraciones SQL completas, redirect `http://localhost:3000/auth/callback` y la guía [docs/FUNCIONAMIENTO.md](docs/FUNCIONAMIENTO.md).

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts (gráficas)
- Supabase (auth + base de datos)