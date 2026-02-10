export type PlanId = 'basic' | 'professional' | 'enterprise'

export interface Plan {
  id: PlanId
  name: string
  price: number
  currency: string
  lines: number // -1 = ilimitadas
  dashboard: 'básico' | 'avanzado' | 'personalizado'
  users: number // -1 = ilimitados
  support: string
  storage: string
  api?: string
  integrations?: string
}

export interface LineKpi {
  lineId: string
  lineName: string
  oee: number      // % 0-100
  disponibilidad: number
  rendimiento: number
  calidad: number
  timestamp: string
}

export interface KpiHistoryPoint {
  date: string
  oee: number
  disponibilidad: number
  rendimiento: number
  calidad: number
}

export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 199,
    currency: '€',
    lines: 2,
    dashboard: 'básico',
    users: 1,
    support: 'Soporte por email',
    storage: '1 GB',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 449,
    currency: '€',
    lines: 5,
    dashboard: 'avanzado',
    users: 5,
    support: 'Soporte telefónico',
    storage: '10 GB',
    api: 'API básica',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 899,
    currency: '€',
    lines: -1,
    dashboard: 'personalizado',
    users: -1,
    support: 'Soporte 24/7',
    storage: '100 GB',
    api: 'API completa',
    integrations: 'Integracións personalizadas',
  },
]
