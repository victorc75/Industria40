import { createClient } from '@/lib/supabase/server'
import type {
  Organization,
  Profile,
  Line,
  KpiSnapshot,
  Machine,
  MachineStatePeriod,
  MachineDailyProduction,
} from './types'
import type { PlanId } from '@/lib/types'
import type { MachineStateEnum, LineStateEnum, WorkShift } from './types'

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error || !data) return null
  return data as Profile
}

export async function getOrganization(orgId: string): Promise<Organization | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()
  if (error || !data) return null
  return data as Organization
}

export async function updateOrganizationPlan(
  organizationId: string,
  planId: PlanId
): Promise<boolean> {
  const supabase = await createClient()
  const updates: { plan_id: PlanId; trial_ends_at?: null } = { plan_id: planId }
  if (planId !== 'basic') updates.trial_ends_at = null
  const { error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', organizationId)
  return !error
}

export async function getLines(organizationId: string): Promise<Line[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('lines')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
  if (error) return []
  return (data ?? []) as Line[]
}

export async function ensureProfileAndOrg(userId: string): Promise<{
  profile: Profile
  organization: Organization
} | null> {
  const profile = await getProfile(userId)
  if (!profile) return null
  const organization = await getOrganization(profile.organization_id)
  if (!organization) return null
  return { profile, organization }
}

export async function createLine(organizationId: string, name: string): Promise<Line | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('lines')
    .insert({ organization_id: organizationId, name })
    .select('*')
    .single()
  if (error || !data) return null
  return data as Line
}

export async function updateLine(lineId: string, name: string): Promise<Line | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('lines')
    .update({ name })
    .eq('id', lineId)
    .select('*')
    .single()
  if (error || !data) return null
  return data as Line
}

export async function updateLinePlannedAndRate(
  lineId: string,
  plannedSeconds: number,
  piecesPerMinute: number
): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('lines')
    .update({ planned_seconds: plannedSeconds, pieces_per_minute: piecesPerMinute })
    .eq('id', lineId)
  return !error
}

export async function updateLineWorkShift(lineId: string, workShift: WorkShift): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase.from('lines').update({ work_shift: workShift }).eq('id', lineId)
  return !error
}

export async function updateLineAutoShiftChange(lineId: string, autoShiftChange: boolean): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase.from('lines').update({ auto_shift_change: autoShiftChange }).eq('id', lineId)
  return !error
}

export async function updateLineShiftTimes(
  lineId: string,
  times: {
    shift_1_start: string
    shift_1_end: string
    shift_2_start: string
    shift_2_end: string
    shift_3_start: string
    shift_3_end: string
  }
): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase.from('lines').update(times).eq('id', lineId)
  return !error
}

export async function setLineState(lineId: string, state: LineStateEnum): Promise<boolean> {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data: lineRow } = await supabase
    .from('lines')
    .select('current_line_state, line_state_started_at')
    .eq('id', lineId)
    .single()
  const previousState = (lineRow?.current_line_state ?? 'Parada') as LineStateEnum
  const startedAt = (lineRow?.line_state_started_at ?? now) as string
  // Parada é estado de transición: non se rexistra período (non se contabiliza tempo)
  if (previousState !== 'Parada') {
    await supabase.from('line_state_periods').insert({
      line_id: lineId,
      state: previousState,
      started_at: startedAt,
      ended_at: now,
    })
  }
  const { error } = await supabase
    .from('lines')
    .update({ current_line_state: state, line_state_started_at: now })
    .eq('id', lineId)
  if (error) return false
  if (previousState === 'Produccion' && state !== 'Produccion') {
    await freezeMachinesForLine(lineId)
  } else if (previousState !== 'Produccion' && state === 'Produccion') {
    await unfreezeMachinesForLine(lineId)
  }
  return true
}

async function freezeMachinesForLine(lineId: string): Promise<void> {
  const machines = await getMachines(lineId)
  const supabase = await createClient()
  const now = new Date()
  for (const m of machines) {
    const current = await getCurrentMachineState(m.id)
    if (!current) continue
    const accumulated = Math.max(0, Math.floor((now.getTime() - new Date(current.started_at).getTime()) / 1000))
    await supabase
      .from('machine_state_periods')
      .update({ ended_at: now.toISOString() })
      .eq('id', current.id)
    await supabase
      .from('machines')
      .update({
        frozen_state: current.state,
        frozen_accumulated_seconds: accumulated,
        frozen_at: now.toISOString(),
      })
      .eq('id', m.id)
  }
}

async function unfreezeMachinesForLine(lineId: string): Promise<void> {
  const machines = await getMachines(lineId)
  const supabase = await createClient()
  const now = new Date()
  for (const m of machines) {
    if (m.frozen_state == null || m.frozen_accumulated_seconds == null) continue
    const startedAt = new Date(now.getTime() - m.frozen_accumulated_seconds * 1000).toISOString()
    await supabase
      .from('machine_state_periods')
      .insert({ machine_id: m.id, state: m.frozen_state, started_at: startedAt })
    await supabase
      .from('machines')
      .update({
        frozen_state: null,
        frozen_accumulated_seconds: null,
        frozen_at: null,
      })
      .eq('id', m.id)
  }
}

export async function deleteLine(lineId: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase.from('lines').delete().eq('id', lineId)
  return !error
}

export async function updateLineMachineCount(lineId: string, machineCount: number): Promise<boolean> {
  const supabase = await createClient()
  const { error: updateErr } = await supabase
    .from('lines')
    .update({ machine_count: machineCount })
    .eq('id', lineId)
  if (updateErr) return false
  const { data: existing } = await supabase
    .from('machines')
    .select('id, position')
    .eq('line_id', lineId)
    .order('position')
  const existingPositions = new Set((existing ?? []).map((m) => m.position))
  for (let pos = 1; pos <= machineCount; pos++) {
    if (!existingPositions.has(pos)) {
      await supabase.from('machines').insert({ line_id: lineId, position: pos, enabled: true })
    }
  }
  if (existing && existing.length > machineCount) {
    await supabase
      .from('machines')
      .delete()
      .eq('line_id', lineId)
      .gt('position', machineCount)
  }
  return true
}

// --- Machines ---

export async function getMachines(lineId: string): Promise<Machine[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .eq('line_id', lineId)
    .order('position')
  if (error) return []
  return (data ?? []) as Machine[]
}

export async function ensureMachinesForLine(lineId: string, machineCount: number): Promise<Machine[]> {
  const supabase = await createClient()
  await supabase.from('lines').update({ machine_count: machineCount }).eq('id', lineId)
  const existing = await getMachines(lineId)
  const existingPositions = new Set(existing.map((m) => m.position))
  for (let pos = 1; pos <= machineCount; pos++) {
    if (!existingPositions.has(pos)) {
      const { data: inserted } = await supabase
        .from('machines')
        .insert({ line_id: lineId, position: pos, enabled: true })
        .select('*')
        .single()
      if (inserted) existing.push(inserted as Machine)
    }
  }
  const toDelete = existing.filter((m) => m.position > machineCount)
  for (const m of toDelete) {
    await supabase.from('machines').delete().eq('id', m.id)
  }
  return getMachines(lineId)
}

export async function updateMachineEnabled(machineId: string, enabled: boolean): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase.from('machines').update({ enabled }).eq('id', machineId)
  return !error
}

export async function updateMachineName(machineId: string, name: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase.from('machines').update({ name: name.trim() || null }).eq('id', machineId)
  return !error
}

export async function startMachineState(machineId: string, state: MachineStateEnum): Promise<MachineStatePeriod | null> {
  const supabase = await createClient()
  const now = new Date()
  const { data: openPeriods } = await supabase
    .from('machine_state_periods')
    .select('id')
    .eq('machine_id', machineId)
    .is('ended_at', null)
  if (openPeriods?.length) {
    for (const row of openPeriods) {
      await supabase
        .from('machine_state_periods')
        .update({ ended_at: now.toISOString() })
        .eq('id', row.id)
    }
  }

  const today = now.toISOString().slice(0, 10)
  const dayStart = new Date(today + 'T00:00:00.000Z').getTime()
  const dayEnd = new Date(today + 'T23:59:59.999Z').getTime()
  const periods = await getMachineStatePeriodsForDay(machineId, today)
  let totalSecondsForState = 0
  for (const p of periods) {
    if (p.state !== state) continue
    const start = Math.max(new Date(p.started_at).getTime(), dayStart)
    const end = Math.min(p.ended_at ? new Date(p.ended_at).getTime() : now.getTime(), dayEnd)
    totalSecondsForState += Math.max(0, Math.floor((end - start) / 1000))
  }

  const startedAt = new Date(now.getTime() - totalSecondsForState * 1000).toISOString()
  const { data: inserted, error } = await supabase
    .from('machine_state_periods')
    .insert({ machine_id: machineId, state, started_at: startedAt })
    .select('*')
    .single()
  if (error || !inserted) return null
  return inserted as MachineStatePeriod
}

export async function getCurrentMachineState(machineId: string): Promise<MachineStatePeriod | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('machine_state_periods')
    .select('*')
    .eq('machine_id', machineId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error || !data) return null
  return data as MachineStatePeriod
}

export async function getMachineStatePeriodsForDay(machineId: string, dateStr: string): Promise<MachineStatePeriod[]> {
  const supabase = await createClient()
  const dayEnd = `${dateStr}T23:59:59.999Z`
  const { data, error } = await supabase
    .from('machine_state_periods')
    .select('*')
    .eq('machine_id', machineId)
    .lte('started_at', dayEnd)
  if (error) return []
  const dayStart = `${dateStr}T00:00:00.000Z`
  return ((data ?? []) as MachineStatePeriod[]).filter(
    (p) => !p.ended_at || p.ended_at >= dayStart
  )
}

/** Tiempos agregados por estado para una lÃ­nea en un dÃ­a (segundos por estado). */
export async function getLineStateTimesForDay(
  lineId: string,
  dateStr: string,
  workShift?: WorkShift
): Promise<Record<MachineStateEnum, number>> {
  if (workShift != null) {
    const byMachine = await getLineStateTimesByMachineForDay(lineId, dateStr, workShift)
    const out: Record<MachineStateEnum, number> = {
      en_marcha: 0,
      parada: 0,
      falta_producto: 0,
      emergencia: 0,
      anomalia: 0,
    }
    for (const row of byMachine) {
      for (const [state, sec] of Object.entries(row.stateTimes)) {
        out[state as MachineStateEnum] = (out[state as MachineStateEnum] ?? 0) + sec
      }
    }
    return out
  }
  const machines = await getMachines(lineId)
  const dayStart = new Date(dateStr + 'T00:00:00.000Z').getTime()
  const dayEnd = new Date(dateStr + 'T23:59:59.999Z').getTime()
  const out: Record<MachineStateEnum, number> = {
    en_marcha: 0,
    parada: 0,
    falta_producto: 0,
    emergencia: 0,
    anomalia: 0,
  }
  for (const m of machines) {
    const periods = await getMachineStatePeriodsForDay(m.id, dateStr)
    for (const p of periods) {
      const start = Math.max(new Date(p.started_at).getTime(), dayStart)
      const end = Math.min(p.ended_at ? new Date(p.ended_at).getTime() : Date.now(), dayEnd)
      const sec = Math.max(0, (end - start) / 1000)
      out[p.state] = (out[p.state] ?? 0) + sec
    }
  }
  return out
}

/** Estados de liña que se contabilizan e aparecen nos reportes (Parada é transición, non se conta). */
const LINE_STATES_REPORTED: LineStateEnum[] = [
  'Produccion',
  'Descanso programado',
  'Mantenimiento',
  'Cambio formato',
]

/** Estados de liña para iterar (inclúe Parada para compatibilidade BD). */
const LINE_STATE_VALUES: LineStateEnum[] = [
  'Produccion',
  'Parada',
  'Descanso programado',
  'Mantenimiento',
  'Cambio formato',
]

/** Tempos que a liña estivo en cada estado de liña (Producción, Descanso, Mantenimiento, Cambio formato). Parada non se conta. */
export async function getLineLineStateTimesForDay(
  lineId: string,
  dateStr: string,
  workShift?: WorkShift
): Promise<Record<LineStateEnum, number>> {
  const defaultTimes = (): Record<string, number> => ({
    Produccion: 0,
    'Descanso programado': 0,
    Mantenimiento: 0,
    'Cambio formato': 0,
  })

  if (workShift != null) {
    const supabase = await createClient()
    const { data: rows, error } = await supabase
      .from('line_line_state_times_snapshot')
      .select('line_state, seconds')
      .eq('line_id', lineId)
      .eq('date', dateStr)
      .eq('work_shift', workShift)
    if (!error && rows && rows.length > 0) {
      const out = defaultTimes()
      for (const r of rows) {
        if (LINE_STATES_REPORTED.includes(r.line_state as LineStateEnum)) {
          out[r.line_state] = Number(r.seconds) || 0
        }
      }
      return out as Record<LineStateEnum, number>
    }
  }

  const supabase = await createClient()
  const dayStart = new Date(dateStr + 'T00:00:00.000Z').getTime()
  const dayEnd = new Date(dateStr + 'T23:59:59.999Z').getTime()
  const now = Date.now()
  const out = defaultTimes()

  const { data: periods } = await supabase
    .from('line_state_periods')
    .select('state, started_at, ended_at')
    .eq('line_id', lineId)
    .lte('started_at', dateStr + 'T23:59:59.999Z')
  for (const p of periods ?? []) {
    if (!p.ended_at) continue
    const start = Math.max(new Date(p.started_at).getTime(), dayStart)
    const end = Math.min(new Date(p.ended_at).getTime(), dayEnd)
    if (end <= start) continue
    const state = p.state as LineStateEnum
    if (LINE_STATES_REPORTED.includes(state)) {
      out[state] = (out[state] ?? 0) + (end - start) / 1000
    }
  }

  const { data: lineRow } = await supabase
    .from('lines')
    .select('current_line_state, line_state_started_at')
    .eq('id', lineId)
    .single()
  const currentState = (lineRow?.current_line_state ?? 'Parada') as LineStateEnum
  const currentStarted = lineRow?.line_state_started_at
  if (currentStarted && LINE_STATES_REPORTED.includes(currentState)) {
    const start = Math.max(new Date(currentStarted).getTime(), dayStart)
    const end = Math.min(now, dayEnd)
    if (end > start) {
      out[currentState] = (out[currentState] ?? 0) + (end - start) / 1000
    }
  }
  return out as Record<LineStateEnum, number>
}

/** Garda na BD o snapshot de tempos por estado de liña (só Producción, Descanso, Mantenimiento, Cambio formato). Parada non se garda. Sobrescribe calquera dato previo para (line_id, date, work_shift). */
export async function insertLineLineStateTimesSnapshot(
  lineId: string,
  dateStr: string,
  workShift: WorkShift,
  times: Record<LineStateEnum, number>
): Promise<boolean> {
  const normalizedDate = typeof dateStr === 'string' && dateStr.length >= 10 ? dateStr.slice(0, 10) : dateStr
  const supabase = await createClient()
  const { error: deleteError } = await supabase
    .from('line_line_state_times_snapshot')
    .delete()
    .eq('line_id', lineId)
    .eq('date', normalizedDate)
    .eq('work_shift', workShift)
  if (deleteError) return false
  const rows: { line_id: string; date: string; work_shift: number; line_state: string; seconds: number }[] = []
  for (const state of LINE_STATES_REPORTED) {
    const sec = times[state] ?? 0
    if (sec > 0) {
      rows.push({
        line_id: lineId,
        date: normalizedDate,
        work_shift: workShift,
        line_state: state,
        seconds: sec,
      })
    }
  }
  if (rows.length === 0) return true
  const { error } = await supabase.from('line_line_state_times_snapshot').insert(rows)
  return !error
}

export async function getLineStateTimesByMachineForDay(
  lineId: string,
  dateStr: string,
  workShift?: WorkShift
): Promise<{ machineId: string; machineName: string; position: number; stateTimes: Record<MachineStateEnum, number> }[]> {
  const machines = await getMachines(lineId)
  const defaultStateTimes = (): Record<MachineStateEnum, number> => ({
    en_marcha: 0,
    parada: 0,
    falta_producto: 0,
    emergencia: 0,
    anomalia: 0,
  })

  if (workShift != null) {
    const supabase = await createClient()
    const { data: rows, error } = await supabase
      .from('line_state_times_snapshot')
      .select('machine_id, state, seconds')
      .eq('line_id', lineId)
      .eq('date', dateStr)
      .eq('work_shift', workShift)
    if (!error && rows && rows.length > 0) {
      const byMachine = new Map<string, Record<MachineStateEnum, number>>()
      for (const m of machines) {
        byMachine.set(m.id, { ...defaultStateTimes() })
      }
      for (const r of rows) {
        const machineId = r.machine_id as string
        const state = r.state as MachineStateEnum
        const sec = Number(r.seconds) || 0
        if (byMachine.has(machineId)) {
          byMachine.get(machineId)![state] = sec
        }
      }
      return machines
        .map((m) => ({
          machineId: m.id,
          machineName: (m.name?.trim() || `MÃ¡quina ${m.position}`) as string,
          position: m.position,
          stateTimes: byMachine.get(m.id) ?? defaultStateTimes(),
        }))
        .sort((a, b) => a.position - b.position)
    }
  }

  const dayStart = new Date(dateStr + 'T00:00:00.000Z').getTime()
  const dayEnd = new Date(dateStr + 'T23:59:59.999Z').getTime()
  const result: { machineId: string; machineName: string; position: number; stateTimes: Record<MachineStateEnum, number> }[] = []
  for (const m of machines) {
    const stateTimes: Record<MachineStateEnum, number> = { ...defaultStateTimes() }
    const periods = await getMachineStatePeriodsForDay(m.id, dateStr)
    for (const p of periods) {
      const start = Math.max(new Date(p.started_at).getTime(), dayStart)
      const end = Math.min(p.ended_at ? new Date(p.ended_at).getTime() : Date.now(), dayEnd)
      const sec = Math.max(0, (end - start) / 1000)
      stateTimes[p.state] = (stateTimes[p.state] ?? 0) + sec
    }
    const machineName = (m.name?.trim() || `MÃ¡quina ${m.position}`) as string
    result.push({ machineId: m.id, machineName, position: m.position, stateTimes })
  }
  return result.sort((a, b) => a.position - b.position)
}

const MACHINE_STATES: MachineStateEnum[] = ['en_marcha', 'parada', 'falta_producto', 'emergencia', 'anomalia']

/** Garda na BD o snapshot de tempos por máquina (ao pulsar "Gardar datos da liña e inicializar a 0"). Sobrescribe calquera dato previo para (line_id, date, work_shift). */
export async function insertLineStateTimesSnapshot(
  lineId: string,
  dateStr: string,
  workShift: WorkShift,
  stateTimesByMachine: { machineId: string; stateTimes: Record<MachineStateEnum, number> }[]
): Promise<boolean> {
  const normalizedDate = typeof dateStr === 'string' && dateStr.length >= 10 ? dateStr.slice(0, 10) : dateStr
  const supabase = await createClient()
  const { error: deleteError } = await supabase
    .from('line_state_times_snapshot')
    .delete()
    .eq('line_id', lineId)
    .eq('date', normalizedDate)
    .eq('work_shift', workShift)
  if (deleteError) return false
  const rows: { line_id: string; date: string; work_shift: number; machine_id: string; state: string; seconds: number }[] = []
  for (const { machineId, stateTimes } of stateTimesByMachine) {
    for (const state of MACHINE_STATES) {
      const sec = stateTimes[state] ?? 0
      if (sec > 0) {
        rows.push({
          line_id: lineId,
          date: normalizedDate,
          work_shift: workShift,
          machine_id: machineId,
          state,
          seconds: sec,
        })
      }
    }
  }
  if (rows.length === 0) return true
  const { error } = await supabase.from('line_state_times_snapshot').insert(rows)
  return !error
}

/** Borra todos los periodos de estado de las mÃ¡quinas de la lÃ­nea para hoy y limpia frozen (inicializar tiempos). */
export async function clearLineStateTimes(lineId: string): Promise<boolean> {
  const machines = await getMachines(lineId)
  if (machines.length === 0) return true
  const today = new Date().toISOString().slice(0, 10)
  const supabase = await createClient()
  for (const m of machines) {
    const periods = await getMachineStatePeriodsForDay(m.id, today)
    for (const p of periods) {
      await supabase.from('machine_state_periods').delete().eq('id', p.id)
    }
    await supabase
      .from('machines')
      .update({ frozen_state: null, frozen_accumulated_seconds: null, frozen_at: null })
      .eq('id', m.id)
  }
  return true
}

/** Pone a 0 producciÃ³n y rechazos de todas las mÃ¡quinas de la lÃ­nea para una fecha. */
export async function zeroLineProductionForDay(lineId: string, dateStr: string): Promise<boolean> {
  const machines = await getMachines(lineId)
  for (const m of machines) {
    const result = await upsertMachineDailyProduction(m.id, dateStr, 0, 0)
    if (!result.ok) return false
  }
  return true
}

/** Reinicia o reloxo do estado da liña (para que o seguinte período comece desde agora). */
export async function resetLineStateStartedAt(lineId: string): Promise<boolean> {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('lines')
    .update({ line_state_started_at: now })
    .eq('id', lineId)
  return !error
}

export async function upsertMachineDailyProduction(
  machineId: string,
  dateStr: string,
  piecesProduced: number,
  piecesRejected: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalizedDate = typeof dateStr === 'string' && dateStr.length >= 10 ? dateStr.slice(0, 10) : dateStr
  const supabase = await createClient()
  const { error } = await supabase.from('machine_daily_production').upsert(
    {
      machine_id: machineId,
      date: normalizedDate,
      pieces_produced: Math.max(0, Math.floor(Number(piecesProduced)) || 0),
      pieces_rejected: Math.max(0, Math.floor(Number(piecesRejected)) || 0),
    },
    { onConflict: 'machine_id,date' }
  )
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function getMachineDailyProduction(
  machineId: string,
  dateStr: string
): Promise<MachineDailyProduction | null> {
  const normalizedDate = typeof dateStr === 'string' && dateStr.length >= 10 ? dateStr.slice(0, 10) : dateStr
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('machine_daily_production')
    .select('*')
    .eq('machine_id', machineId)
    .eq('date', normalizedDate)
    .maybeSingle()
  if (error || !data) return null
  return {
    machine_id: data.machine_id,
    date: typeof data.date === 'string' ? data.date.slice(0, 10) : String(data.date),
    pieces_produced: Math.max(0, Math.floor(Number(data.pieces_produced)) || 0),
    pieces_rejected: Math.max(0, Math.floor(Number(data.pieces_rejected)) || 0),
  } as MachineDailyProduction
}

/** Produción por máquina e totais da liña para a data (reporte). */
export async function getLineProductionForReport(
  lineId: string,
  dateStr: string
): Promise<{
  machineProductions: { machineId: string; machineName: string; position: number; piecesProduced: number; piecesRejected: number }[]
  lineTotalProduced: number
  lineTotalRejected: number
}> {
  const machines = await getMachines(lineId)
  const machineProductions: { machineId: string; machineName: string; position: number; piecesProduced: number; piecesRejected: number }[] = []
  for (const m of machines) {
    const prod = await getMachineDailyProduction(m.id, dateStr)
    const piecesProduced = prod ? Math.max(0, Math.floor(Number(prod.pieces_produced)) || 0) : 0
    const piecesRejected = prod ? Math.max(0, Math.floor(Number(prod.pieces_rejected)) || 0) : 0
    machineProductions.push({
      machineId: m.id,
      machineName: (m.name?.trim() || `Máquina ${m.position}`) as string,
      position: m.position,
      piecesProduced,
      piecesRejected,
    })
  }
  const lineTotalProduced = machineProductions.length > 0
    ? Math.max(...machineProductions.map((p) => p.piecesProduced))
    : 0
  const lineTotalRejected = machineProductions.reduce((s, p) => s + p.piecesRejected, 0)
  return { machineProductions, lineTotalProduced, lineTotalRejected }
}

// --- KPIs desde mÃ¡quinas habilitadas (por lÃ­nea) ---

export async function getLineKpisFromEnabledMachines(
  lineId: string,
  line: { planned_seconds?: number; pieces_per_minute?: number }
): Promise<{ oee: number; disponibilidad: number; rendimiento: number; calidad: number } | null> {
  const machines = (await getMachines(lineId)).filter((m) => m.enabled)
  if (machines.length === 0) return null
  const today = new Date().toISOString().slice(0, 10)
  const plannedSeconds = line.planned_seconds ?? 8 * 3600
  const piecesPerMinute = Number(line.pieces_per_minute) || 1
  const dayStart = new Date(today + 'T00:00:00.000Z').getTime()
  const dayEnd = new Date(today + 'T23:59:59.999Z').getTime()
  const kpis: { oee: number; disponibilidad: number; rendimiento: number; calidad: number }[] = []
  for (const m of machines) {
    const [production, periods] = await Promise.all([
      getMachineDailyProduction(m.id, today),
      getMachineStatePeriodsForDay(m.id, today),
    ])
    let timeEnMarcha = 0
    for (const p of periods) {
      const start = Math.max(new Date(p.started_at).getTime(), dayStart)
      const end = Math.min(p.ended_at ? new Date(p.ended_at).getTime() : Date.now(), dayEnd)
      if (p.state === 'en_marcha') timeEnMarcha += Math.max(0, (end - start) / 1000)
    }
    const produced = production?.pieces_produced ?? 0
    const rejected = production?.pieces_rejected ?? 0
    const availability = plannedSeconds > 0 ? Math.min(1, timeEnMarcha / plannedSeconds) : 0
    const quality = produced > 0 ? Math.max(0, (produced - rejected) / produced) : 1
    const theoreticalPieces = (timeEnMarcha / 60) * piecesPerMinute
    const performance = theoreticalPieces > 0 ? Math.min(1, produced / theoreticalPieces) : 1
    const oee = availability * performance * quality
    kpis.push({
      oee: Math.round(oee * 1000) / 10,
      disponibilidad: Math.round(availability * 1000) / 10,
      rendimiento: Math.round(performance * 1000) / 10,
      calidad: Math.round(quality * 1000) / 10,
    })
  }
  const n = kpis.length
  return {
    oee: Math.round((kpis.reduce((s, k) => s + k.oee, 0) / n) * 10) / 10,
    disponibilidad: Math.round((kpis.reduce((s, k) => s + k.disponibilidad, 0) / n) * 10) / 10,
    rendimiento: Math.round((kpis.reduce((s, k) => s + k.rendimiento, 0) / n) * 10) / 10,
    calidad: Math.round((kpis.reduce((s, k) => s + k.calidad, 0) / n) * 10) / 10,
  }
}

/** KPIs por máquina para unha data (para gardar no snapshot ou mostrar no reporte). */
export async function getMachineKpisForLineDay(
  lineId: string,
  dateStr: string,
  line: { planned_seconds?: number; pieces_per_minute?: number }
): Promise<{ machineId: string; oee: number; disponibilidad: number; rendimiento: number; calidad: number }[]> {
  const machines = (await getMachines(lineId)).filter((m) => m.enabled)
  if (machines.length === 0) return []
  const plannedSeconds = line.planned_seconds ?? 8 * 3600
  const piecesPerMinute = Number(line.pieces_per_minute) || 1
  const dayStart = new Date(dateStr + 'T00:00:00.000Z').getTime()
  const dayEnd = new Date(dateStr + 'T23:59:59.999Z').getTime()
  const now = Date.now()
  const result: { machineId: string; oee: number; disponibilidad: number; rendimiento: number; calidad: number }[] = []
  for (const m of machines) {
    const [production, periods] = await Promise.all([
      getMachineDailyProduction(m.id, dateStr),
      getMachineStatePeriodsForDay(m.id, dateStr),
    ])
    let timeEnMarcha = 0
    for (const p of periods) {
      const start = Math.max(new Date(p.started_at).getTime(), dayStart)
      const end = Math.min(p.ended_at ? new Date(p.ended_at).getTime() : now, dayEnd)
      if (p.state === 'en_marcha') timeEnMarcha += Math.max(0, (end - start) / 1000)
    }
    const produced = production?.pieces_produced ?? 0
    const rejected = production?.pieces_rejected ?? 0
    const availability = plannedSeconds > 0 ? Math.min(1, timeEnMarcha / plannedSeconds) : 0
    const quality = produced > 0 ? Math.max(0, (produced - rejected) / produced) : 1
    const theoreticalPieces = (timeEnMarcha / 60) * piecesPerMinute
    const performance = theoreticalPieces > 0 ? Math.min(1, produced / theoreticalPieces) : 1
    const oee = availability * performance * quality
    result.push({
      machineId: m.id,
      oee: Math.round(oee * 1000) / 10,
      disponibilidad: Math.round(availability * 1000) / 10,
      rendimiento: Math.round(performance * 1000) / 10,
      calidad: Math.round(quality * 1000) / 10,
    })
  }
  return result
}

/** Garda KPIs por máquina no snapshot (ao “Gardar datos da liña e inicializar a 0”). */
export async function insertMachineKpiSnapshot(
  lineId: string,
  dateStr: string,
  workShift: WorkShift,
  machineKpis: { machineId: string; oee: number; disponibilidad: number; rendimiento: number; calidad: number }[]
): Promise<boolean> {
  if (machineKpis.length === 0) return true
  const normalizedDate = typeof dateStr === 'string' && dateStr.length >= 10 ? dateStr.slice(0, 10) : dateStr
  const supabase = await createClient()
  const { error: deleteError } = await supabase.from('machine_kpi_snapshot').delete().eq('line_id', lineId).eq('date', normalizedDate).eq('work_shift', workShift)
  if (deleteError) return false
  const rows = machineKpis.map((k) => ({
    line_id: lineId,
    date: normalizedDate,
    work_shift: workShift,
    machine_id: k.machineId,
    oee: k.oee,
    disponibilidad: k.disponibilidad,
    rendimiento: k.rendimiento,
    calidad: k.calidad,
  }))
  const { error } = await supabase.from('machine_kpi_snapshot').insert(rows)
  return !error
}

/** KPIs por máquina para o reporte: do snapshot se workShift está definido, senón calculados do día. */
export async function getMachineKpisForReport(
  lineId: string,
  dateStr: string,
  workShift: WorkShift | undefined,
  line: { planned_seconds?: number; pieces_per_minute?: number } | null
): Promise<{ machineId: string; oee: number; disponibilidad: number; rendimiento: number; calidad: number }[]> {
  if (workShift != null) {
    const supabase = await createClient()
    const { data: rows, error } = await supabase
      .from('machine_kpi_snapshot')
      .select('machine_id, oee, disponibilidad, rendimiento, calidad')
      .eq('line_id', lineId)
      .eq('date', dateStr)
      .eq('work_shift', workShift)
    if (!error && rows && rows.length > 0) {
      return rows.map((r) => ({
        machineId: r.machine_id as string,
        oee: Number(r.oee),
        disponibilidad: Number(r.disponibilidad),
        rendimiento: Number(r.rendimiento),
        calidad: Number(r.calidad),
      }))
    }
    return []
  }
  if (line) return getMachineKpisForLineDay(lineId, dateStr, line)
  return []
}

// --- KPI Snapshots ---

export async function getKpiHistoryForLine(
  lineId: string,
  days: number = 14,
  workShift?: WorkShift
): Promise<KpiSnapshot[]> {
  const supabase = await createClient()
  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - days)
  const fromStr = fromDate.toISOString().slice(0, 10)
  let q = supabase
    .from('kpi_snapshots')
    .select('*')
    .eq('line_id', lineId)
    .gte('date', fromStr)
  if (workShift != null) q = q.eq('work_shift', workShift)
  const { data, error } = await q.order('date', { ascending: true })
  if (error) return []
  return (data ?? []) as KpiSnapshot[]
}

export async function getLatestKpisForLines(
  lineIds: string[]
): Promise<Map<string, { oee: number; disponibilidad: number; rendimiento: number; calidad: number }>> {
  if (lineIds.length === 0) return new Map()
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('kpi_snapshots')
    .select('line_id, oee, disponibilidad, rendimiento, calidad')
    .in('line_id', lineIds)
    .eq('date', today)
  if (error) return new Map()
  const map = new Map<string, { oee: number; disponibilidad: number; rendimiento: number; calidad: number }>()
  for (const row of data ?? []) {
    map.set(row.line_id, {
      oee: Number(row.oee),
      disponibilidad: Number(row.disponibilidad),
      rendimiento: Number(row.rendimiento),
      calidad: Number(row.calidad),
    })
  }
  return map
}

export async function upsertKpiSnapshot(
  lineId: string,
  date: string,
  oee: number,
  disponibilidad: number,
  rendimiento: number,
  calidad: number,
  workShift: WorkShift = 1,
  source: 'manual' | 'auto' = 'auto'
): Promise<KpiSnapshot | null> {
  const normalizedDate = typeof date === 'string' && date.length >= 10 ? date.slice(0, 10) : date
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('kpi_snapshots')
    .upsert(
      { line_id: lineId, date: normalizedDate, work_shift: workShift, oee, disponibilidad, rendimiento, calidad, source },
      { onConflict: 'line_id,date,work_shift' }
    )
    .select('*')
    .single()
  if (error || !data) return null
  return data as KpiSnapshot
}

export interface KpiSearchFilter {
  lineId?: string
  workShift?: WorkShift
  year: number
  month: number
  day: number
}

export async function getKpiSnapshotsFiltered(filter: KpiSearchFilter): Promise<KpiSnapshot[]> {
  const supabase = await createClient()
  const dateStr = `${filter.year}-${String(filter.month).padStart(2, '0')}-${String(filter.day).padStart(2, '0')}`
  let q = supabase
    .from('kpi_snapshots')
    .select('*')
    .eq('date', dateStr)
  if (filter.lineId) q = q.eq('line_id', filter.lineId)
  if (filter.workShift != null) q = q.eq('work_shift', filter.workShift)
  const { data, error } = await q.order('line_id').order('work_shift')
  if (error) return []
  return (data ?? []) as KpiSnapshot[]
}
