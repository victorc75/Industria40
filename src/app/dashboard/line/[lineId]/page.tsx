import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ensureProfileAndOrg, getLines, ensureMachinesForLine, getCurrentMachineState, getMachineDailyProduction, getMachineStatePeriodsForDay } from '@/lib/db/queries'
import { LineDetailClient } from '@/components/LineDetailClient'
import { ArrowLeft } from 'lucide-react'

export default async function LineDetailPage({
  params,
}: {
  params: Promise<{ lineId: string }>
}) {
  const { lineId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard')

  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) redirect('/auth/complete-registration')

  const lines = await getLines(profileAndOrg.organization.id)
  const line = lines.find((l) => l.id === lineId)
  if (!line) redirect('/dashboard')

  const machineCount = Math.min(20, Math.max(1, line.machine_count ?? 1))
  const machines = await ensureMachinesForLine(line.id, machineCount)

  const today = new Date().toISOString().slice(0, 10)
  const machinesWithStateAndProduction = await Promise.all(
    machines.map(async (m) => {
      const [currentState, production, periods] = await Promise.all([
        getCurrentMachineState(m.id),
        getMachineDailyProduction(m.id, today),
        getMachineStatePeriodsForDay(m.id, today),
      ])
      const plannedSeconds = line.planned_seconds ?? 8 * 3600
      const piecesPerMinute = Number(line.pieces_per_minute) || 1
      const dayStart = new Date(today + 'T00:00:00.000Z').getTime()
      const dayEnd = new Date(today + 'T23:59:59.999Z').getTime()
      let timeEnMarcha = 0
      for (const p of periods) {
        const start = Math.max(new Date(p.started_at).getTime(), dayStart)
        const end = Math.min(p.ended_at ? new Date(p.ended_at).getTime() : Date.now(), dayEnd)
        const sec = Math.max(0, (end - start) / 1000)
        if (p.state === 'en_marcha') timeEnMarcha += sec
      }
      const produced = Math.max(0, Math.floor(Number(production?.pieces_produced)) || 0)
      const rejected = Math.max(0, Math.floor(Number(production?.pieces_rejected)) || 0)
      const availability = plannedSeconds > 0 ? Math.min(1, timeEnMarcha / plannedSeconds) : 0
      const quality = produced > 0 ? Math.max(0, (produced - rejected) / produced) : 1
      const theoreticalPieces = (timeEnMarcha / 60) * piecesPerMinute
      const performance = theoreticalPieces > 0 ? Math.min(1, produced / theoreticalPieces) : 1
      const oee = Math.round(availability * performance * quality * 1000) / 10
      const disponibilidad = Math.round(availability * 1000) / 10
      const rendimiento = Math.round(performance * 1000) / 10
      const calidadPct = Math.round(quality * 1000) / 10
      return {
        machine: m,
        currentState: currentState?.state ?? null,
        currentStateStartedAt: currentState?.started_at ?? null,
        frozenState: m.frozen_state ?? null,
        frozenAccumulatedSeconds: m.frozen_accumulated_seconds ?? 0,
        piecesProduced: produced,
        piecesRejected: rejected,
        oee,
        disponibilidad,
        rendimiento,
        calidad: calidadPct,
      }
    })
  )

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <h1 className="text-lg font-semibold text-white">{line.name} — Máquinas</h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <LineDetailClient
          line={line}
          machinesWithStateAndProduction={machinesWithStateAndProduction}
          productionDate={today}
        />
      </main>
    </div>
  )
}
