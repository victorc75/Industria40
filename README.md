# Industria40 — SaaS OEE y eficiencia de producción

Aplicación SaaS para controlar la eficiencia de las líneas de producción con KPIs: **OEE**, **Disponibilidad**, **Rendimiento** y **Calidad**.

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

Abre [http://localhost:3000](http://localhost:3000). Desde la landing puedes ir a **Ver dashboard** o elegir un plan; el dashboard respeta el límite de líneas del plan seleccionado.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts (gráficas)
