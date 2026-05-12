import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentShiftFromTime } from './getCurrentShiftFromTime'
import type { Line } from '@/lib/db/types'
import type { WorkShift } from '@/lib/db/types'

/**
 * Cron de cambio de turno automático (invocado desde `GET /api/cron/auto-shift`).
 *
 * Lee líneas con `auto_shift_change`, calcula el turno según hora y horarios
 * configurados; si cambia respecto a `work_shift`, guarda/reinicia datos y
 * actualiza el turno. Usa cliente admin (service_role). Ver `docs/FUNCIONAMIENTO.md` §7.
 */
const MACHINE_STATES = ['en_marcha', 'parada', 'falta_producto', 'emergencia', 'anomalia'] as const
const LINE_STATES_REPORTED = ['Produccion', 'Descanso programado', 'Mantenimiento', 'Cambio formato'] as const

export async function runAutoShiftCron(): Promise<{ ok: number; error?: string }> {
  const admin = createAdminClient()
  const { data: lines, error: linesError } = await admin
    .from('lines')
    .select('*')
    .eq('auto_shift_change', true)
  if (linesError || !lines) return { ok: 0, error: linesError?.message }
  const now = new Date()
  let ok = 0
  for (const line of lines as Line[]) {
    const currentShift = getCurrentShiftFromTime(line, now) as WorkShift
    const lineWorkShift = (line.work_shift ?? 1) as WorkShift
    if (currentShift === lineWorkShift) continue
    const success = await runSaveAndResetForLine(admin, line.id, line, lineWorkShift)
    if (success) {
      await admin.from('lines').update({ work_shift: currentShift }).eq('id', line.id)
      ok++
    }
  }
  return { ok }
}

async function runSaveAndResetForLine(
  admin: SupabaseClient,
  lineId: string,
  line: Line,
  workShift: WorkShift
): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10)
  const dayStart = new Date(today + 'T00:00:00.000Z').getTime()
  const dayEnd = new Date(today + 'T23:59:59.999Z').getTime()
  const now = Date.now()

  const { data: machines } = await admin.from('machines').select('*').eq('line_id', lineId).order('position')
  if (!machines?.length) return true

  const enabledMachines = machines.filter((m: { enabled?: boolean }) => m.enabled !== false)
  const plannedSeconds = line.planned_seconds ?? 8 * 3600
  const piecesPerMinute = Number(line.pieces_per_minute) || 1
  const kpis: { oee: number; disponibilidad: number; rendimiento: number; calidad: number }[] = []
  for (const m of enabledMachines) {
    const { data: prod } = await admin.from('machine_daily_production').select('*').eq('machine_id', m.id).eq('date', today).maybeSingle()
    const { data: periods } = await admin.from('machine_state_periods').select('*').eq('machine_id', m.id).lte('started_at', today + 'T23:59:59.999Z')
    const dayStartStr = today + 'T00:00:00.000Z'
    const filtered = (periods ?? []).filter((p: { ended_at: string | null }) => !p.ended_at || p.ended_at >= dayStartStr)
    let timeEnMarcha = 0
    for (const p of filtered) {
      const start = Math.max(new Date(p.started_at).getTime(), dayStart)
      const end = Math.min(p.ended_at ? new Date(p.ended_at).getTime() : now, dayEnd)
      if (p.state === 'en_marcha') timeEnMarcha += Math.max(0, (end - start) / 1000)
    }
    const produced = prod?.pieces_produced ?? 0
    const rejected = prod?.pieces_rejected ?? 0
    const availability = plannedSeconds > 0 ? Math.min(1, timeEnMarcha / plannedSeconds) : 0
    const quality = produced > 0 ? Math.max(0, (produced - rejected) / produced) : 1
    const theoreticalPieces = (timeEnMarcha / 60) * piecesPerMinute
    const performance = theoreticalPieces > 0 ? Math.min(1, produced / theoreticalPieces) : 1
    kpis.push({
      oee: Math.round(availability * performance * quality * 1000) / 10,
      disponibilidad: Math.round(availability * 1000) / 10,
      rendimiento: Math.round(performance * 1000) / 10,
      calidad: Math.round(quality * 1000) / 10,
    })
  }
  const n = kpis.length
  const avgKpis = n
    ? {
        oee: Math.round((kpis.reduce((s, k) => s + k.oee, 0) / n) * 10) / 10,
        disponibilidad: Math.round((kpis.reduce((s, k) => s + k.disponibilidad, 0) / n) * 10) / 10,
        rendimiento: Math.round((kpis.reduce((s, k) => s + k.rendimiento, 0) / n) * 10) / 10,
        calidad: Math.round((kpis.reduce((s, k) => s + k.calidad, 0) / n) * 10) / 10,
      }
    : null
  if (avgKpis) {
    await admin.from('kpi_snapshots').upsert(
      { line_id: lineId, date: today, work_shift: workShift, source: 'auto', ...avgKpis },
      { onConflict: 'line_id,date,work_shift' }
    )
  }

  await admin.from('machine_kpi_snapshot').delete().eq('line_id', lineId).eq('date', today).eq('work_shift', workShift)
  for (let i = 0; i < enabledMachines.length; i++) {
    await admin.from('machine_kpi_snapshot').insert({
      line_id: lineId,
      date: today,
      work_shift: workShift,
      machine_id: enabledMachines[i].id,
      oee: kpis[i].oee,
      disponibilidad: kpis[i].disponibilidad,
      rendimiento: kpis[i].rendimiento,
      calidad: kpis[i].calidad,
    })
  }

  const stateTimesByMachine: { machineId: string; stateTimes: Record<string, number> }[] = []
  for (const m of machines) {
    const stateTimes: Record<string, number> = { en_marcha: 0, parada: 0, falta_producto: 0, emergencia: 0, anomalia: 0 }
    const { data: periods } = await admin.from('machine_state_periods').select('*').eq('machine_id', m.id).lte('started_at', today + 'T23:59:59.999Z')
    const dayStartStr = today + 'T00:00:00.000Z'
    const filtered = (periods ?? []).filter((p: { ended_at: string | null }) => !p.ended_at || p.ended_at >= dayStartStr)
    for (const p of filtered) {
      const start = Math.max(new Date(p.started_at).getTime(), dayStart)
      const end = Math.min(p.ended_at ? new Date(p.ended_at).getTime() : now, dayEnd)
      const sec = Math.max(0, (end - start) / 1000)
      stateTimes[p.state] = (stateTimes[p.state] ?? 0) + sec
    }
    stateTimesByMachine.push({ machineId: m.id, stateTimes })
  }
  await admin.from('line_state_times_snapshot').delete().eq('line_id', lineId).eq('date', today).eq('work_shift', workShift)
  const snapshotRows: { line_id: string; date: string; work_shift: number; machine_id: string; state: string; seconds: number }[] = []
  for (const { machineId, stateTimes } of stateTimesByMachine) {
    for (const state of MACHINE_STATES) {
      const sec = stateTimes[state] ?? 0
      if (sec > 0) snapshotRows.push({ line_id: lineId, date: today, work_shift: workShift, machine_id: machineId, state, seconds: sec })
    }
  }
  if (snapshotRows.length) await admin.from('line_state_times_snapshot').insert(snapshotRows)

  const lineStateTimes: Record<string, number> = { Produccion: 0, 'Descanso programado': 0, Mantenimiento: 0, 'Cambio formato': 0 }
  const { data: linePeriods } = await admin.from('line_state_periods').select('state, started_at, ended_at').eq('line_id', lineId).lte('started_at', today + 'T23:59:59.999Z')
  for (const p of linePeriods ?? []) {
    if (!p.ended_at) continue
    const start = Math.max(new Date(p.started_at).getTime(), dayStart)
    const end = Math.min(new Date(p.ended_at).getTime(), dayEnd)
    if (end <= start) continue
    if (LINE_STATES_REPORTED.includes(p.state)) lineStateTimes[p.state] = (lineStateTimes[p.state] ?? 0) + (end - start) / 1000
  }
  const { data: lineRow } = await admin.from('lines').select('current_line_state, line_state_started_at').eq('id', lineId).single()
  const currentState = lineRow?.current_line_state ?? 'Parada'
  const currentStarted = lineRow?.line_state_started_at
  if (currentStarted && LINE_STATES_REPORTED.includes(currentState)) {
    const start = Math.max(new Date(currentStarted).getTime(), dayStart)
    const end = Math.min(now, dayEnd)
    if (end > start) lineStateTimes[currentState] = (lineStateTimes[currentState] ?? 0) + (end - start) / 1000
  }
  await admin.from('line_line_state_times_snapshot').delete().eq('line_id', lineId).eq('date', today).eq('work_shift', workShift)
  const lineSnapshotRows: { line_id: string; date: string; work_shift: number; line_state: string; seconds: number }[] = []
  for (const state of LINE_STATES_REPORTED) {
    const sec = lineStateTimes[state] ?? 0
    if (sec > 0) lineSnapshotRows.push({ line_id: lineId, date: today, work_shift: workShift, line_state: state, seconds: sec })
  }
  if (lineSnapshotRows.length) await admin.from('line_line_state_times_snapshot').insert(lineSnapshotRows)

  for (const m of machines) {
    const { data: perms } = await admin.from('machine_state_periods').select('id').eq('machine_id', m.id).lte('started_at', today + 'T23:59:59.999Z')
    for (const p of perms ?? []) await admin.from('machine_state_periods').delete().eq('id', p.id)
    await admin.from('machines').update({ frozen_state: null, frozen_accumulated_seconds: null, frozen_at: null }).eq('id', m.id)
    await admin.from('machine_daily_production').upsert(
      { machine_id: m.id, date: today, pieces_produced: 0, pieces_rejected: 0 },
      { onConflict: 'machine_id,date', ignoreDuplicates: true }
    )
  }
  await admin.from('lines').update({ line_state_started_at: new Date().toISOString() }).eq('id', lineId)
  return true
}
