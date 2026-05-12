'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardHeader } from '@/components/DashboardHeader'
import { LinesManager } from '@/components/LinesManager'
import { RegisterKpiForm } from '@/components/RegisterKpiForm'
import { DataSearch } from '@/components/DataSearch'
import { PLANS, type PlanId } from '@/lib/types'
import { OeeChart } from '@/components/OeeChart'
import { LinesBarChart } from '@/components/LinesBarChart'
import type { Line } from '@/lib/db/types'
import type { KpiHistoryPoint } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/LanguageContext'

/** Vista interactiva del dashboard: recibe datos ya cargados en `dashboard/page.tsx` (servidor). */
type WorkShift = 1 | 2 | 3

function getWorkShiftLabels(t: (k: string) => string): Record<WorkShift, string> {
  return { 1: t('dashboard.turno1'), 2: t('dashboard.turno2'), 3: t('dashboard.turno3') }
}

interface DashboardClientProps {
  planId: PlanId
  lines: Line[]
  organizationName?: string
  organizationCode?: string
  isOwner?: boolean
  trialEndsAt?: string | null
  kpiHistoryByLineAndShift?: Record<string, KpiHistoryPoint[]>
  latestKpisByLineId?: Record<string, { oee: number; disponibilidad: number; rendimiento: number; calidad: number }>
  lineKpisFromMachinesByLineId?: Record<string, { oee: number; disponibilidad: number; rendimiento: number; calidad: number } | null>
}

export function DashboardClient({
  planId,
  lines,
  organizationName,
  organizationCode,
  isOwner,
  trialEndsAt,
  kpiHistoryByLineAndShift = {},
  latestKpisByLineId = {},
  lineKpisFromMachinesByLineId = {},
}: DashboardClientProps) {
  const { t } = useLanguage()
  const WORK_SHIFT_LABELS = getWorkShiftLabels(t)
  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[0]
  const trialEnded = planId === 'basic' && trialEndsAt && new Date(trialEndsAt) < new Date()
  const firstLineId = lines[0]?.id
  const [chartLineId, setChartLineId] = useState<string | null>(firstLineId ?? null)
  const [chartShift, setChartShift] = useState<WorkShift>(1)
  const history: KpiHistoryPoint[] =
    chartLineId ? (kpiHistoryByLineAndShift[`${chartLineId}-${chartShift}`] ?? []) : []

  const linesForChart = lines.slice(0, plan.lines === -1 ? lines.length : plan.lines)
  const linesKpis = linesForChart.map((l) => {
    const kpis = lineKpisFromMachinesByLineId[l.id]
    return {
      lineId: l.id,
      lineName: l.name,
      oee: kpis?.oee ?? 0,
      disponibilidad: kpis?.disponibilidad ?? 0,
      rendimiento: kpis?.rendimiento ?? 0,
      calidad: kpis?.calidad ?? 0,
      timestamp: new Date().toISOString(),
    }
  })
  const linesLabel =
    plan.lines === -1
      ? `${linesForChart.length} ${t('dashboard.linesCount')}`
      : `${linesForChart.length}/${plan.lines} ${t('dashboard.linesCount')}`

  return (
    <div className="min-h-screen">
      <DashboardHeader
        planName={plan.name}
        linesLabel={linesLabel}
        organizationName={organizationName}
        organizationCode={organizationCode}
        isOwner={isOwner}
      />

      {trialEnded && (
        <div className="mx-auto max-w-7xl px-4 pt-4">
          <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-amber-200">
            <p className="font-medium">{t('dashboard.trialEnded')}</p>
            <p className="mt-1 text-sm text-amber-200/90">{t('dashboard.trialEndedHint')}</p>
            <Link
              href="/plans"
              className="mt-3 inline-block rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-amber-400"
            >
              {t('dashboard.trialUpgrade')}
            </Link>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-xl font-bold text-white">{t('dashboard.efficiency')}</h1>
        <p className="mt-1 text-sm text-slate-300">
          {t('dashboard.oeeFormula')}
        </p>

        <section className="mt-6">
          <LinesManager lines={lines} planId={planId} lineKpisByLineId={lineKpisFromMachinesByLineId} />
        </section>

        <section className="mt-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="text-sm text-slate-300">{t('dashboard.evolutionKpis')}</label>
            <select
              value={chartLineId ?? ''}
              onChange={(e) => setChartLineId(e.target.value || null)}
              className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {lines.length === 0 ? (
                <option value="">{t('dashboard.noLines')}</option>
              ) : (
                lines.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.name}
                  </option>
                ))
              )}
            </select>
            <select
              value={chartShift}
              onChange={(e) => setChartShift(Number(e.target.value) as WorkShift)}
              className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {( [1, 2, 3] as const ).map((s) => (
                <option key={s} value={s}>{WORK_SHIFT_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <OeeChart data={history} title="" />
        </section>

        {planId !== 'basic' && (
          <section className="mt-6">
            <LinesBarChart
              data={linesKpis}
              title={t('dashboard.comparative')}
            />
          </section>
        )}

        <section className="mt-6">
          <RegisterKpiForm lines={lines} />
        </section>

        <section className="mt-6">
          <DataSearch lines={lines} />
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          {t('dashboard.planCurrent')}: {plan.name} — {plan.dashboard} · {plan.storage}
          {lines.length === 0 && ` · ${t('dashboard.addLinesHint')}`}
        </p>
      </main>
    </div>
  )
}
