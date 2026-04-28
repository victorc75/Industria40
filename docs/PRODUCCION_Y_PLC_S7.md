# Dashboard en producción e integración con PLC Siemens S7-1500

## 1. Proyecto final: de localhost a producción

### Cómo estás ahora (desarrollo)
- App en **localhost:3000** (`npm run dev`).
- Supabase en la nube (mismo para desarrollo y producción).
- Usuarios acceden a `http://localhost:3000` y el dashboard lee/escribe en Supabase.

### Cómo sería el proyecto final (producción)

1. **Desplegar la app**
   - **Vercel** (recomendado con Next.js): conectas el repo de GitHub y despliegas. URL tipo `https://industria40.vercel.app` o tu dominio.
   - **Otro hosting**: Railway, Render, VPS (Node.js), etc. La app es un Next.js que se sirve con `npm run build` + `npm start` (o el proceso que use el host).

2. **Qué no cambia**
   - **Supabase**: sigues usando el mismo proyecto (o uno distinto solo para producción). La base de datos y la autenticación son los mismos.
   - **Variables de entorno**: en el panel del host (Vercel, etc.) configuras las mismas: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

3. **Qué sí configuras**
   - En **Supabase** → **Authentication** → **URL Configuration** → **Redirect URLs** añades la URL de producción, por ejemplo:
     - `https://tu-dominio.com/auth/callback`
     - o `https://industria40.vercel.app/auth/callback`
   - Así, al iniciar sesión o registrarse desde la app en producción, Supabase redirige correctamente.

4. **Acceso al dashboard**
   - Los usuarios entran en **https://tu-dominio.com** (o la URL que te asigne el host).
   - Flujo igual: login → dashboard → mismas pantallas, mismas acciones, mismos datos en Supabase.

**Resumen:** En producción la app está en un servidor accesible por URL (internet o red interna); Supabase sigue siendo el backend. Solo cambia la URL de la app y los redirects de Supabase.

---

## 2. Alimentar el dashboard con datos de un PLC Siemens S7-1500

El **S7-1500 no habla HTTP ni se conecta directamente a tu app**. Necesitas un **puente** en la red de la planta que lea datos del PLC y los envíe a tu backend (Supabase o una API de tu proyecto).

### Arquitectura típica

```
┌─────────────────┐         ┌──────────────────────────┐         ┌─────────────────────┐
│  Siemens        │  OPC UA │  Puente / Gateway        │  HTTP   │  Industria40        │
│  S7-1500        │  o S7   │  (PC, IOT2050, Node/Py)  │  POST   │  (API o Supabase)   │
│  (datos OEE,    │ ──────► │  Lee tags del PLC        │ ──────► │  Dashboard          │
│   estados, etc) │         │  Envía KPIs por API      │         │  muestra datos      │
└─────────────────┘         └──────────────────────────┘         └─────────────────────┘
```

### Opciones para leer datos del S7-1500

| Opción | Descripción | Dónde corre |
|--------|-------------|-------------|
| **OPC UA** | El S7-1500 puede actuar como servidor OPC UA. Un cliente OPC UA lee los tags (OEE, disponibilidad, etc.) y los reenvía. | PC con Windows/Linux o gateway (p. ej. Siemens IOT2050) con un cliente OPC UA (Node-RED, Python, C#, etc.). |
| **Snap7 / S7 protocol** | Librería (C, Python, Node.js) que lee/escribe bloques de datos (DB) del PLC por Ethernet. | Un servicio en una PC o en un equipo en la red de planta que tenga acceso al PLC. |
| **Gateway industrial** | Dispositivos tipo Siemens IOT2050, Raspberry Pi + Node-RED, etc. que hablan con el PLC (OPC UA o S7) y exponen REST o MQTT. | En la red de la fábrica; luego ese servicio hace POST a tu API. |

### Flujo de datos hasta el dashboard

1. En el **PLC** expones (por OPC UA o en un DB) los valores que necesitas: p. ej. disponibilidad, rendimiento, calidad (o tiempos para calcularlos), turno, identificador de línea.
2. El **puente** (script o servicio) lee esos valores cada X segundos o minutos.
3. El puente envía los datos a tu backend:
   - **Opción A:** Llamar a una **API de tu proyecto** (por ejemplo `POST /api/plc/kpi`) que valide y escriba en Supabase (tabla `kpi_snapshots`). La API debe estar protegida (p. ej. API key o token) porque no hay sesión de usuario.
   - **Opción B:** Escribir **directamente en Supabase** desde el puente usando la **Service Role Key** (solo desde un entorno seguro; nunca en el front). El puente tendría que conocer `line_id`, fechas, turnos, etc.

La opción A es más segura y recomendable: un único endpoint que recibe los datos del PLC y reutiliza la lógica de negocio (validar, calcular OEE si hace falta, upsert en `kpi_snapshots`).

### Ejemplo: endpoint API para recibir KPIs desde el PLC

En el proyecto se puede añadir una ruta que reciba un JSON con los KPIs y, si la petición lleva una API key válida, guarde en Supabase (misma lógica que el formulario manual).

- **URL:** `POST /api/plc/kpi`
- **Cabecera:** `Authorization: Bearer <API_KEY>` o `x-api-key: <API_KEY>`
- **Body (ejemplo):**
  ```json
  {
    "lineId": "uuid-de-la-linea",
    "date": "2026-02-25",
    "workShift": 1,
    "disponibilidad": 85.2,
    "rendimiento": 92.1,
    "calidad": 98.0
  }
  ```
- **Lógica:** Validar API key (variable de entorno), validar que `lineId` pertenezca a una organización permitida (p. ej. por configuración o por la misma API key), calcular OEE y hacer upsert en `kpi_snapshots`.

El **puente** (Node.js, Python, Node-RED, etc.) en la planta haría algo así:

- Leer del PLC (OPC UA o Snap7) los valores de la línea y turno.
- Cada cierto intervalo, hacer `POST https://tu-dominio.com/api/plc/kpi` con ese JSON y la API key.
- El dashboard ya usa los datos de `kpi_snapshots`, así que las gráficas y el resto de la app se actualizan solas cuando el usuario recarga o cuando haya datos en tiempo cuasi real si añades polling o websockets.

### Resumen práctico

| Pregunta | Respuesta |
|----------|-----------|
| ¿Cómo sería en proyecto final? | App desplegada en una URL (Vercel, etc.); mismo Supabase; solo añadir esa URL en Redirect URLs de Supabase. |
| ¿Cómo alimentar desde S7-1500? | PLC → puente (OPC UA o Snap7 en PC/gateway) → POST a una API de tu app (o a Supabase con service role). |
| ¿Qué hace falta en el proyecto? | Un endpoint tipo `POST /api/plc/kpi` protegido por API key que escriba en `kpi_snapshots` (y opcionalmente validar línea/organización). |

Si quieres, el siguiente paso puede ser esbozar en el repo la ruta `POST /api/plc/kpi` y la validación por API key para que puedas conectar un puente desde el S7-1500.
