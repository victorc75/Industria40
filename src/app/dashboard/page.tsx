'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, LayoutDashboard } from 'lucide-react'
import { PLANS, type PlanId } from '@/lib/types'
import { getKpiHistory, getLinesKpis } from '@/lib/mockData'
import { KpiCard } from '@/components/KpiCard'
import { OeeChart } from '@/components/OeeChart'
import { LinesBarChart } from '@/components/LinesBarChart'
import { Gauge, Activity, TrendingUp, Award } from 'lucide-react'

function DashboardContent() {
  const searchParams = useSearchParams()
  const planId = (searchParams.get('plan') as PlanId) || 'professional'
  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[1]
  const maxLines = plan.lines === -1 ? 999 : plan.lines

  const history = getKpiHistory('line-1')
  const linesKpis = getLinesKpis(maxLines)
  const latest = history[history.length - 1]
  const avgOee = linesKpis.length ? linesKpis.reduce((s, l) => s + l.oee, 0) / linesKpis.length : 0

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-slate-200 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Inicio
            </Link>
            <span className="text-slate-500">|</span>
            <span className="flex items-center gap-2 text-sm font-medium text-white">
              <LayoutDashboard className="h-4 w-4 text-cyan-400" />
              Dashboard — Plan {plan.name}
            </span>
          </div>
          <span className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-100">
            {plan.lines === -1 ? 'Liñas ilimitadas' : `${linesKpis.length}/${plan.lines} liñas`}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-xl font-bold text-white">Eficiencia de producción</h1>
        <p className="mt-1 text-sm text-slate-300">
          OEE = Disponibilidad × Rendimiento × Calidad
        </p>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="OEE"
            value={latest?.oee ?? avgOee}
            icon={Gauge}
            subtitle="Eficiencia global"
          />
          <KpiCard
            title="Disponibilidad"
            value={latest?.disponibilidad ?? 0}
            icon={Activity}
            subtitle="Tiempo en marcha / planificado"
          />
          <KpiCard
            title="Rendimiento"
            value={latest?.rendimiento ?? 0}
            icon={TrendingUp}
            subtitle="Velocidad real vs teórica"
          />
          <KpiCard
            title="Calidad"
            value={latest?.calidad ?? 0}
            icon={Award}
            subtitle="Unidades buenas / total"
          />
        </section>

        <section className="mt-6">
          <OeeChart data={history} title="Evolución de KPIs (últimos 14 días)" />
        </section>

        <section className="mt-6">
          <LinesBarChart data={linesKpis} title="Comparativa por línea de producción" />
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          Datos de demostración. Plan actual: {plan.name} — {plan.dashboard} · {plan.storage}
        </p>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-slate-300">Cargando...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
