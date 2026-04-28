'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  ensureProfileAndOrg,
  getLines,
  createLine as createLineDb,
  updateLine as updateLineDb,
  deleteLine as deleteLineDb,
  updateLineMachineCount as updateLineMachineCountDb,
  setLineState as setLineStateDb,
  updateLinePlannedAndRate as updateLinePlannedAndRateDb,
  updateLineWorkShift as updateLineWorkShiftDb,
  updateLineAutoShiftChange as updateLineAutoShiftChangeDb,
  clearLineStateTimes as clearLineStateTimesDb,
  updateLineShiftTimes as updateLineShiftTimesDb,
  zeroLineProductionForDay as zeroLineProductionForDayDb,
  resetLineStateStartedAt as resetLineStateStartedAtDb,
  updateMachineEnabled as updateMachineEnabledDb,
  updateMachineName as updateMachineNameDb,
  startMachineState as startMachineStateDb,
  upsertMachineDailyProduction as upsertMachineDailyProductionDb,
  getKpiSnapshotsFiltered,
  getLineStateTimesForDay,
  getLineStateTimesByMachineForDay,
  getLineLineStateTimesForDay,
  insertLineLineStateTimesSnapshot,
  getLineKpisFromEnabledMachines,
  getMachineKpisForLineDay,
  insertMachineKpiSnapshot,
  getMachineKpisForReport,
  getLineProductionForReport,
  upsertKpiSnapshot,
  insertLineStateTimesSnapshot,
} from '@/lib/db/queries'
import { PLANS } from '@/lib/types'
import type { MachineStateEnum, LineStateEnum, WorkShift } from '@/lib/db/types'
import { TRIAL_ENDED_ERROR } from '@/lib/constants'

function isTrialEnded(org: { plan_id: string; trial_ends_at?: string | null }): boolean {
  return org.plan_id === 'basic' && !!org.trial_ends_at && new Date(org.trial_ends_at) < new Date()
}

export type LineActionResult =
  | { ok: true }
  | { ok: false; error: string }

export async function createLineAction(formData: FormData): Promise<LineActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }

  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) return { ok: false, error: 'No autorizado' }

  const { organization } = profileAndOrg
  if (isTrialEnded(organization)) return { ok: false, error: TRIAL_ENDED_ERROR }

  const plan = PLANS.find((p) => p.id === organization.plan_id)
  const currentLines = await getLines(organization.id)
  if (plan && plan.lines !== -1 && currentLines.length >= plan.lines) {
    return { ok: false, error: `Límite del plan alcanzado (${plan.lines} líneas).` }
  }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { ok: false, error: 'El nombre es obligatorio' }

  const line = await createLineDb(organization.id, name)
  if (!line) return { ok: false, error: 'No se pudo crear la línea' }

  revalidatePath('/dashboard')
  return { ok: true }
}

export async function updateLineAction(lineId: string, formData: FormData): Promise<LineActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }
  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) return { ok: false, error: 'No autorizado' }
  if (isTrialEnded(profileAndOrg.organization)) return { ok: false, error: TRIAL_ENDED_ERROR }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { ok: false, error: 'El nombre es obligatorio' }

  const updated = await updateLineDb(lineId, name)
  if (!updated) return { ok: false, error: 'No se pudo actualizar la línea' }

  revalidatePath('/dashboard')
  return { ok: true }
}

export async function deleteLineAction(lineId: string): Promise<LineActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }
  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) return { ok: false, error: 'No autorizado' }
  if (isTrialEnded(profileAndOrg.organization)) return { ok: false, error: TRIAL_ENDED_ERROR }

  const deleted = await deleteLineDb(lineId)
  if (!deleted) return { ok: false, error: 'No se pudo eliminar la línea' }

  revalidatePath('/dashboard')
  return { ok: true }
}

export async function saveKpiAction(formData: FormData): Promise<LineActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }
  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) return { ok: false, error: 'No autorizado' }
  if (isTrialEnded(profileAndOrg.organization)) return { ok: false, error: TRIAL_ENDED_ERROR }

  const lineId = formData.get('lineId') as string
  const date = (formData.get('date') as string) || new Date().toISOString().slice(0, 10)
  const workShift = Math.min(3, Math.max(1, Number(formData.get('workShift')) || 1)) as WorkShift
  const disponibilidad = Number(formData.get('disponibilidad'))
  const rendimiento = Number(formData.get('rendimiento'))
  const calidad = Number(formData.get('calidad'))

  if (!lineId || [disponibilidad, rendimiento, calidad].some((n) => n < 0 || n > 100 || isNaN(n))) {
    return { ok: false, error: 'Disponibilidad, Rendimiento y Calidad deben estar entre 0 y 100' }
  }

  const oee = Math.round((disponibilidad / 100) * (rendimiento / 100) * (calidad / 100) * 1000) / 10

  const { upsertKpiSnapshot } = await import('@/lib/db/queries')
  const result = await upsertKpiSnapshot(lineId, date, oee, disponibilidad, rendimiento, calidad, workShift, 'manual')
  if (!result) return { ok: false, error: 'No se pudo guardar' }

  revalidatePath('/dashboard')
  return { ok: true }
}

export async function updateLineWorkShiftAction(lineId: string, workShift: WorkShift): Promise<LineActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }
  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) return { ok: false, error: 'No autorizado' }
  if (isTrialEnded(profileAndOrg.organization)) return { ok: false, error: TRIAL_ENDED_ERROR }

  const ok = await updateLineWorkShiftDb(lineId, workShift)
  if (!ok) return { ok: false, error: 'No se pudo actualizar el turno' }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/line')
  return { ok: true }
}

export async function updateLineAutoShiftChangeAction(lineId: string, autoShiftChange: boolean): Promise<LineActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }
  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) return { ok: false, error: 'No autorizado' }
  if (isTrialEnded(profileAndOrg.organization)) return { ok: false, error: TRIAL_ENDED_ERROR }

  const ok = await updateLineAutoShiftChangeDb(lineId, autoShiftChange)
  if (!ok) return { ok: false, error: 'No se pudo actualizar' }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/line')
  return { ok: true }
}

export async function updateLineMachineCountAction(lineId: string, machineCount: number): Promise<LineActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }
  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) return { ok: false, error: 'No autorizado' }
  if (isTrialEnded(profileAndOrg.organization)) return { ok: false, error: TRIAL_ENDED_ERROR }

  if (machineCount < 1 || machineCount > 20) return { ok: false, error: 'Entre 1 y 20 máquinas' }
  const ok = await updateLineMachineCountDb(lineId, machineCount)
  if (!ok) return { ok: false, error: 'No se pudo actualizar' }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/line/' + lineId)
  return { ok: true }
}

export async function updateMachineEnabledAction(machineId: string, enabled: boolean): Promise<LineActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }
  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) return { ok: false, error: 'No autorizado' }
  if (isTrialEnded(profileAndOrg.organization)) return { ok: false, error: TRIAL_ENDED_ERROR }

  const ok = await updateMachineEnabledDb(machineId, enabled)
  if (!ok) return { ok: false, error: 'No se pudo actualizar' }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/line')
  return { ok: true }
}

export async function updateMachineNameAction(machineId: string, name: string): Promise<LineActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }
  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) return { ok: false, error: 'No autorizado' }
  if (isTrialEnded(profileAndOrg.organization)) return { ok: false, error: TRIAL_ENDED_ERROR }

  const trimmed = name?.trim() ?? ''
  const ok = await updateMachineNameDb(machineId, trimmed || '')
  if (!ok) return { ok: false, error: 'No se pudo actualizar el nombre' }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/line')
  return { ok: true }
}

export async function startMachineStateAction(machineId: string, state: MachineStateEnum): Promise<LineActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }
  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) return { ok: false, error: 'No autorizado' }
  if (isTrialEnded(profileAndOrg.organization)) return { ok: false, error: TRIAL_ENDED_ERROR }

  const result = await startMachineStateDb(machineId, state)
  if (!result) return { ok: false, error: 'No se pudo registrar el estado' }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/line')
  return { ok: true }
}

export async function updateLineStateAction(lineId: string, state: LineStateEnum): Promise<LineActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }
  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) return { ok: false, error: 'No autorizado' }
  if (isTrialEnded(profileAndOrg.organization)) return { ok: false, error: TRIAL_ENDED_ERROR }

  const ok = await setLineStateDb(lineId, state)
  if (!ok) return { ok: false, error: 'No se pudo actualizar el estado' }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/line')
  return { ok: true }
}

export async function updateLinePlannedAndRateAction(
  lineId: string,
  plannedSeconds: number,
  piecesPerMinute: number
): Promise<LineActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }
  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) return { ok: false, error: 'No autorizado' }
  if (isTrialEnded(profileAndOrg.organization)) return { ok: false, error: TRIAL_ENDED_ERROR }

  if (plannedSeconds < 1 || piecesPerMinute <= 0) return { ok: false, error: 'Valores deben ser positivos' }
  const ok = await updateLinePlannedAndRateDb(lineId, plannedSeconds, piecesPerMinute)
  if (!ok) return { ok: false, error: 'No se pudo actualizar' }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/line')
  return { ok: true }
}

export async function clearLineStateTimesAction(lineId: string): Promise<LineActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }
  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) return { ok: false, error: 'No autorizado' }
  if (isTrialEnded(profileAndOrg.organization)) return { ok: false, error: TRIAL_ENDED_ERROR }

  const ok = await clearLineStateTimesDb(lineId)
  if (!ok) return { ok: false, error: 'No se pudieron borrar los tiempos' }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/line')
  return { ok: true }
}

function normalizeHhMm(v: string): string {
  const s = String(v).trim()
  const m = s.match(/^(\d{1,2}):(\d{1,2})$/)
  if (!m) return '00:00'
  const h = Math.min(23, Math.max(0, parseInt(m[1], 10)))
  const min = Math.min(59, Math.max(0, parseInt(m[2], 10)))
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

export async function updateLineShiftTimesAction(
  lineId: string,
  times: {
    shift_1_start: string
    shift_2_start: string
    shift_3_start: string
  }
): Promise<LineActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }
  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) return { ok: false, error: 'No autorizado' }
  const lines = await getLines(profileAndOrg.organization.id)
  if (!lines.some((l) => l.id === lineId)) return { ok: false, error: 'Línea no permitida' }
  if (isTrialEnded(profileAndOrg.organization)) return { ok: false, error: TRIAL_ENDED_ERROR }

  const s1 = normalizeHhMm(times.shift_1_start)
  const s2 = normalizeHhMm(times.shift_2_start)
  const s3 = normalizeHhMm(times.shift_3_start)
  const normalized = {
    shift_1_start: s1,
    shift_1_end: s2,
    shift_2_start: s2,
    shift_2_end: s3,
    shift_3_start: s3,
    shift_3_end: s1,
  }
  const ok = await updateLineShiftTimesDb(lineId, normalized)
  if (!ok) return { ok: false, error: 'No se pudo actualizar' }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/line')
  return { ok: true }
}

/** Guarda os datos da liña (KPIs e snapshots) sen reiniciar tempos nin producción. */
export async function saveLineAndResetAction(lineId: string): Promise<LineActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }
  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) return { ok: false, error: 'No autorizado' }
  const lines = await getLines(profileAndOrg.organization.id)
  const line = lines.find((l) => l.id === lineId)
  if (!line) return { ok: false, error: 'Línea no permitida' }
  if (isTrialEnded(profileAndOrg.organization)) return { ok: false, error: TRIAL_ENDED_ERROR }

  const today = new Date().toISOString().slice(0, 10)
  const workShift = (line.work_shift ?? 1) as WorkShift

  const kpis = await getLineKpisFromEnabledMachines(lineId, line)
  if (kpis) {
    await upsertKpiSnapshot(
      lineId,
      today,
      kpis.oee,
      kpis.disponibilidad,
      kpis.rendimiento,
      kpis.calidad,
      workShift
    )
  }

  const stateTimesByMachine = await getLineStateTimesByMachineForDay(lineId, today)
  await insertLineStateTimesSnapshot(lineId, today, workShift, stateTimesByMachine)

  const lineStateTimes = await getLineLineStateTimesForDay(lineId, today)
  await insertLineLineStateTimesSnapshot(lineId, today, workShift, lineStateTimes)

  const machineKpis = await getMachineKpisForLineDay(lineId, today, line)
  await insertMachineKpiSnapshot(lineId, today, workShift, machineKpis)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/line')
  return { ok: true }
}

/** Reinicia tempos de estado e producción a 0 para hoxe (só desde Configuración / Iniciar tempos). */
export async function initLineTimesAction(lineId: string): Promise<LineActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }
  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) return { ok: false, error: 'No autorizado' }
  const lines = await getLines(profileAndOrg.organization.id)
  if (!lines.some((l) => l.id === lineId)) return { ok: false, error: 'Línea no permitida' }
  if (isTrialEnded(profileAndOrg.organization)) return { ok: false, error: TRIAL_ENDED_ERROR }

  const today = new Date().toISOString().slice(0, 10)
  const cleared = await clearLineStateTimesDb(lineId)
  if (!cleared) return { ok: false, error: 'No se pudieron reiniciar los tiempos' }
  const zeroed = await zeroLineProductionForDayDb(lineId, today)
  if (!zeroed) return { ok: false, error: 'No se pudo poner a 0 la producción' }
  await resetLineStateStartedAtDb(lineId)
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/line')
  return { ok: true }
}

export async function saveMachineProductionAction(payload: {
  machineId: string
  date: string
  piecesProduced: number
  piecesRejected: number
}): Promise<LineActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Non autorizado. Inicia sesión.' }

  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) return { ok: false, error: 'Perfil ou organización incompletos.' }
  if (isTrialEnded(profileAndOrg.organization)) return { ok: false, error: TRIAL_ENDED_ERROR }

  const { machineId, date, piecesProduced: rawProduced, piecesRejected: rawRejected } = payload
  const normalizedDate = typeof date === 'string' && date.length >= 10 ? date.slice(0, 10) : date
  const piecesProduced = Math.max(0, Math.floor(Number(rawProduced)) || 0)
  const piecesRejected = Math.max(0, Math.floor(Number(rawRejected)) || 0)
  if (!machineId) return { ok: false, error: 'Datos non válidos' }

  const lines = await getLines(profileAndOrg.organization.id)
  const { data: machine } = await supabase.from('machines').select('line_id').eq('id', machineId).single()
  const lineIds = new Set(lines.map((l) => l.id))
  if (!machine || !lineIds.has(machine.line_id)) return { ok: false, error: 'Máquina non permitida para esta organización.' }

  const result = await upsertMachineDailyProductionDb(machineId, normalizedDate, piecesProduced, piecesRejected)
  if (!result.ok) return { ok: false, error: result.error }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/line')
  return { ok: true }
}

export type SearchKpiResult =
  | { ok: true; data: Awaited<ReturnType<typeof getKpiSnapshotsFiltered>> }
  | { ok: false; error: string }

export async function searchKpiSnapshotsAction(params: {
  lineId?: string
  workShift?: number
  year: number
  month: number
  day: number
}): Promise<SearchKpiResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }

  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) return { ok: false, error: 'No autorizado' }

  const { organization } = profileAndOrg
  const lines = await getLines(organization.id)
  const lineIds = new Set(lines.map((l) => l.id))
  if (params.lineId && !lineIds.has(params.lineId)) return { ok: false, error: 'Línea no permitida' }

  const workShift = params.workShift != null && params.workShift >= 1 && params.workShift <= 3
    ? (params.workShift as WorkShift)
    : undefined
  const year = Math.min(2100, Math.max(2000, params.year))
  const month = Math.min(12, Math.max(1, params.month))
  const day = Math.min(31, Math.max(1, params.day))

  const data = await getKpiSnapshotsFiltered({
    lineId: params.lineId || undefined,
    workShift,
    year,
    month,
    day,
  })
  return { ok: true, data }
}

export type ReportDataResult =
  | {
      ok: true
      lineStateTimes: Record<string, number>
      stateTimesByMachine: { machineId: string; machineName: string; position: number; stateTimes: Record<string, number> }[]
      machineKpis: { machineId: string; oee: number; disponibilidad: number; rendimiento: number; calidad: number }[]
      production: {
        machineProductions: { machineId: string; machineName: string; position: number; piecesProduced: number; piecesRejected: number }[]
        lineTotalProduced: number
        lineTotalRejected: number
      }
    }
  | { ok: false; error: string }

export async function getReportStateTimesAction(
  lineId: string,
  dateStr: string,
  workShift?: WorkShift
): Promise<ReportDataResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }

  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) return { ok: false, error: 'No autorizado' }

  const lines = await getLines(profileAndOrg.organization.id)
  if (!lines.some((l) => l.id === lineId)) return { ok: false, error: 'Línea no permitida' }
  const line = lines.find((l) => l.id === lineId) ?? null

  const normalizedDate = typeof dateStr === 'string' && dateStr.length >= 10 ? dateStr.slice(0, 10) : dateStr

  const [lineStateTimes, stateTimesByMachine, machineKpis, production] = await Promise.all([
    getLineLineStateTimesForDay(lineId, normalizedDate, workShift),
    getLineStateTimesByMachineForDay(lineId, normalizedDate, workShift),
    getMachineKpisForReport(lineId, normalizedDate, workShift ?? undefined, line),
    getLineProductionForReport(lineId, normalizedDate),
  ])
  return { ok: true, lineStateTimes, stateTimesByMachine, machineKpis, production }
}
