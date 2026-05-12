# Funcionamiento de Industria40

Documentación técnica del proyecto: arquitectura, flujos de datos, autenticación, base de datos y operación. Complementa el [README](../README.md) (instalación y pruebas rápidas).

---

## 1. Visión general

**Industria40** es una aplicación **SaaS** (multi-tenant por **organización**) para registrar y visualizar **KPIs de producción** (OEE, disponibilidad, rendimiento, calidad) por **línea** y **turno**, con soporte de **máquinas** por línea, estados, producción diaria y **cambio de turno** manual o automático (cron).

| Capa | Tecnología |
|------|------------|
| Framework | **Next.js 14** (App Router, React Server Components donde aplica) |
| Lenguaje | **TypeScript** |
| Estilos | **Tailwind CSS** |
| Gráficas | **Recharts** |
| Auth + datos | **Supabase** (PostgreSQL + Auth + RLS) |
| i18n | Contexto React + fichero de traducciones (`src/lib/i18n/`) |

El **cliente** nunca accede a la base con credenciales privilegiadas: usa la clave **anon** / **publishable**. La **service_role** solo se usa en el servidor (p. ej. cron), nunca en el navegador.

---

## 2. Estructura del repositorio

```
src/app/                 # Rutas y layouts (App Router)
  page.tsx               # Landing
  layout.tsx             # Raíz: fuentes, idioma, scripts de preload
  login/, register/      # Auth por formulario / cliente Supabase
  dashboard/             # Panel: page.tsx (servidor) + actions.ts (mutaciones)
  auth/                  # callback OAuth/magic link, complete-registration, actions
  api/                   # Route Handlers: login POST, cron GET
  plans/                 # Comparativa de planes

src/components/        # UI reutilizable (dashboard, landing, modales, gráficas)

src/lib/
  supabase/              # Cliente browser, servidor, middleware, env públicas
  db/queries.ts          # Todas las lecturas/escrituras Postgres vía Supabase client
  db/types.ts            # Tipos alineados con tablas
  cron/                  # Lógica del cambio de turno automático
  i18n/                  # LanguageContext + translations
  types.ts, constants.ts # Planes, límites, colores KPI, etc.
  complete-registration-rpc.ts  # RPC crear/unir org (compartido cliente/servidor)

middleware.ts            # Raíz: refresca sesión Supabase en cada petición filtrada

supabase/migrations/     # Esquema SQL versionado (ejecutar en orden en Supabase)
supabase/reset_data.sql  # Vaciar datos de negocio (y opcional Auth)
docs/                    # Esta documentación, PRODUCCION_Y_PLC_S7.md, etc.
```

---

## 3. Autenticación y sesión

### 3.1 Middleware (`middleware.ts` → `src/lib/supabase/middleware.ts`)

- Se ejecuta en **casi todas** las rutas (excluye estáticos, `favicon.ico`, imágenes).
- Crea un cliente Supabase **server** con cookies de la petición y llama a `getUser()`.
- Si la ruta es **`/dashboard/**`** y no hay usuario → redirección a **`/login`** con `?redirect=…`.
- Si la ruta es **`/login`** o **`/register`** y **sí** hay usuario → redirección a **`/dashboard`** (evita ver login estando ya logueado).

Así el dashboard queda **protegido** sin lógica duplicada en cada página.

### 3.2 Login (`POST /api/auth/login`)

- Formulario HTML **POST** clásico (no JSON) hacia **`/api/auth/login`**.
- El Route Handler usa **`@supabase/ssr`** `createServerClient`, `signInWithPassword` y devuelve **303** con **Set-Cookie** de sesión.
- Errores → 303 a **`/login?error=…`** (mensajes legibles; detección de respuestas HTML de Supabase por URL/clave mal configuradas en Vercel).

### 3.3 Cliente Supabase en navegador (`src/lib/supabase/client.ts`)

- **`createBrowserClient`**: sesión en cookies gestionada por la librería; usado en **register**, **complete-registration** y componentes cliente que llaman a Auth o RPC.

### 3.4 Servidor (`src/lib/supabase/server.ts`)

- **`createClient()`** async: lee cookies con `next/headers` y devuelve cliente para **Server Components**, **Server Actions** y **Route Handlers** que necesiten usuario actual.

### 3.5 Variables públicas (`src/lib/supabase/public-env.ts`)

- **`NEXT_PUBLIC_SUPABASE_URL`**: URL del proyecto (sin barra final tras normalizar).
- Clave pública: **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** (JWT `eyJ…`) o **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** (`sb_publishable_…`); la app acepta **cualquiera de las dos** (prioridad anon).

---

## 4. Registro, organizaciones y perfiles

### 4.1 Modelo de datos (resumen)

- **`auth.users`**: identidad Supabase (email, contraseña).
- **`public.organizations`**: empresa (tenant); tiene **`organization_code`** único, plan, trial, etc.
- **`public.profiles`**: un fila por usuario → **`organization_id`** + **`role`** (`owner` | `member`).

Sin fila en **`profiles`**, el usuario está autenticado pero **no puede usar el dashboard** → se redirige a **`/auth/complete-registration`**.

### 4.2 Registro (`src/app/register/page.tsx`)

1. **`signUp`** en el cliente con email/contraseña y `emailRedirectTo` hacia **`/auth/callback`**.
2. Si **`data.session`** existe (p. ej. sin confirmación de email obligatoria):
   - Se llama **`runCompleteRegistrationRpc`** en el **mismo cliente** (no el Server Action inmediato) para evitar que el servidor aún no vea las cookies → error «No has iniciado sesión».
3. Si hay **`user`** pero **no `session`** (confirmación por email):
   - Se guarda código/nombre/org en **`localStorage`** y se muestra pantalla de «revisa tu correo»; después el usuario puede completar org en **`/auth/complete-registration`**.

### 4.3 RPC en Postgres (`supabase/migrations/012_…`)

- **`create_organization_for_user(p_org_code, p_org_name)`** (`SECURITY DEFINER`): usa **`auth.uid()`**; crea organización con código, perfil **owner**, dos líneas por defecto.
- **`join_organization(p_org_code)`**: une al usuario como **member** si el código existe y no se supera el límite del plan.

La lógica de errores duplicada está centralizada en **`src/lib/complete-registration-rpc.ts`**; **`src/app/auth/actions.ts`** solo comprueba sesión en servidor y delega en el mismo helper.

### 4.4 Callback (`src/app/auth/callback/route.ts`)

- Intercambia **`code`** (PKCE / magic link) por sesión con **`exchangeCodeForSession`** y redirige a **`next`** (por defecto `/dashboard`).

---

## 5. Dashboard

### 5.1 Página servidor (`src/app/dashboard/page.tsx`)

1. **`getUser()`**; si no hay usuario → redirect login.
2. **`ensureProfileAndOrg`**; si no hay perfil → redirect **`/auth/complete-registration`**.
3. Opcional: query **`?plan=`** válido actualiza el plan de la organización y redirige a `/dashboard`.
4. Carga **líneas**, **historial KPI** por línea y turno (14 días), **últimos KPI** guardados, **KPIs agregados desde máquinas** habilitadas.
5. Pasa todo a **`DashboardClient`** (componente cliente: UI interactiva, gráficas, formularios).

### 5.2 Server Actions (`src/app/dashboard/actions.ts`)

- Marcadas con **`'use server'`**.
- Patrón habitual: **`createClient()`** → **`getUser()`** → **`ensureProfileAndOrg`** → comprobar plan / trial → llamar funciones de **`queries.ts`** → **`revalidatePath('/dashboard')`** (o ruta de línea).
- Devuelven objetos **`{ ok, error? }`** para que el cliente muestre mensajes sin exponer detalles internos.

### 5.3 KPIs y máquinas

- Los **KPIs manuales** del día se guardan en **`kpi_snapshots`** (por línea, fecha, turno).
- Las **máquinas** tienen estados, periodos, producción diaria; a partir de ellos se calculan KPIs para tarjetas y reportes (**`getLineKpisFromEnabledMachines`**, snapshots, etc.). La lógica detallada está en **`queries.ts`** (comentario de cabecera en ese fichero lista bloques).

### 5.4 Línea detalle (`src/app/dashboard/line/[lineId]/page.tsx` + `LineDetailClient`)

- Vista de una línea: máquinas, estados, producción, KPIs, configuración de turnos y auto-shift.

---

## 6. Capa de datos (`src/lib/db/queries.ts`)

Fichero **único** donde se concentran las operaciones **async** contra Supabase (PostgREST). Está organizado por dominios:

1. **Organización y perfil**: `getProfile`, `getOrganization`, `ensureProfileAndOrg`, `updateOrganizationPlan`.
2. **Líneas**: CRUD, planificado, tasas, turno actual, horarios de turno, auto-shift, estado de línea, borrado en cascada vía DB.
3. **Máquinas**: listado, asegurar N máquinas, nombre, enabled, estados y periodos.
4. **Tiempos por estado** (línea / máquina / snapshots para informes).
5. **Producción diaria** y totales para reportes.
6. **KPIs desde máquinas**, snapshots por máquina, historial, últimos valores, búsqueda filtrada.

Todas usan el cliente **servidor** con RLS: el usuario solo ve filas de su **organización** (políticas definidas en migraciones).

---

## 7. Cambio de turno automático (cron)

- **Endpoint**: `GET /api/cron/auto-shift` con cabecera **`Authorization: Bearer <CRON_SECRET>`** (o similar según implementación en `route.ts`).
- Usa **`SUPABASE_SERVICE_ROLE_KEY`** vía **`src/lib/supabase/admin.ts`** para leer/actualizar líneas sin depender del usuario.
- **`src/lib/cron/runAutoShiftCron.ts`**: para cada línea con **auto-shift** activo, según horarios y hora actual guarda datos, rota turno y resetea contadores según reglas de negocio.

Configuración en producción: **Vercel Cron** + variables de entorno; ver README y `docs/PRODUCCION_Y_PLC_S7.md` si aplica PLC.

---

## 8. Internacionalización (`src/lib/i18n/`)

- **`LanguageContext`**: estado del idioma, función **`t('clave')`**.
- **`translations.ts`**: cadenas ES/GL (y extensible).
- El **`layout`** raíz envuelve la app con el provider para que landing, login y dashboard compartan idioma.

---

## 9. Despliegue (Vercel)

- Build: **`next build`**; variables **`NEXT_PUBLIC_*`** se inyectan en **build time**.
- Tras cambiar URL o claves Supabase → **nuevo deploy**.
- **`next.config.js`**: expone **`NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`** en login para verificar que el deploy corresponde al commit esperado.

---

## 10. Limpieza de datos

- **`supabase/reset_data.sql`**: `TRUNCATE` de tablas **`public`** (empresas, perfiles, líneas, KPIs, máquinas, etc.). Opcional bloque comentado para vaciar **`auth.*`**.
- No elimina el **esquema** ni migraciones.

---

## 11. Diagrama de flujo simplificado (registro → dashboard)

```
[Register] signUp (cliente)
    → session? → runCompleteRegistrationRpc (cliente) → /dashboard
    → solo user? → localStorage pendiente → email → callback → sesión → /dashboard o complete-registration

[Login] POST /api/auth/login → cookies → /dashboard

[Middleware] cada request → refrescar sesión; proteger /dashboard; redirigir login/register si aplica

[Dashboard page] getUser → perfil+org → datos → DashboardClient
```

---

## 12. Dónde ampliar comentarios en código

Además de este documento, los ficheros **puntos de entrada** llevan bloques **`/** … */`** al inicio: `middleware`, `layout`, `queries`, `dashboard/page`, `dashboard/actions`, supabase, auth API, cron, registro y helpers de RPC. Para detalle de un componente concreto, leer el JSX y los tipos en **`src/lib/db/types.ts`**.

Si añades tablas o RPC nuevos: **migración SQL** + políticas RLS + funciones en **`queries.ts`** + Server Actions o Route Handler según corresponda, y actualiza esta documentación en la misma PR.
