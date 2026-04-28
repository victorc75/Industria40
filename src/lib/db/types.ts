import type { PlanId } from '@/lib/types'

export interface Organization {
  id: string
  name: string
  plan_id: PlanId
  organization_code: string
  created_by: string | null
  created_at: string
  trial_ends_at?: string | null
}

export interface Profile {
  id: string
  organization_id: string
  full_name: string | null
  role: 'owner' | 'member'
  created_at: string
  updated_at: string
}

export type LineStateEnum =
  | 'Produccion'
  | 'Parada'
  | 'Descanso programado'
  | 'Mantenimiento'
  | 'Cambio formato'

export type WorkShift = 1 | 2 | 3

/** Horario en formato HH:mm (ej. "08:00") */
export type TimeHhMm = string

export interface Line {
  id: string
  organization_id: string
  name: string
  machine_count?: number
  work_shift?: WorkShift
  current_line_state?: LineStateEnum
  line_state_started_at?: string
  planned_seconds?: number
  pieces_per_minute?: number
  shift_1_start?: TimeHhMm
  shift_1_end?: TimeHhMm
  shift_2_start?: TimeHhMm
  shift_2_end?: TimeHhMm
  shift_3_start?: TimeHhMm
  shift_3_end?: TimeHhMm
  auto_shift_change?: boolean
  created_at: string
}

export type MachineStateEnum = 'en_marcha' | 'parada' | 'falta_producto' | 'emergencia' | 'anomalia'

export interface Machine {
  id: string
  line_id: string
  position: number
  name: string | null
  enabled: boolean
  frozen_state?: MachineStateEnum | null
  frozen_accumulated_seconds?: number | null
  frozen_at?: string | null
  created_at: string
}

export interface MachineStatePeriod {
  id: string
  machine_id: string
  state: MachineStateEnum
  started_at: string
  ended_at: string | null
}

export interface MachineDailyProduction {
  machine_id: string
  date: string
  pieces_produced: number
  pieces_rejected: number
}

export interface KpiSnapshot {
  id: string
  line_id: string
  date: string // YYYY-MM-DD
  work_shift: WorkShift
  oee: number
  disponibilidad: number
  rendimiento: number
  calidad: number
  created_at: string
  /** 'manual' = rexistro manual; 'auto' = calculado/cron ou guardar e reiniciar */
  source?: 'manual' | 'auto'
}
