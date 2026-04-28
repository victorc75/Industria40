'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { X } from 'lucide-react'
import type { KpiSnapshot } from '@/lib/db/types'
import type { Line } from '@/lib/db/types'
import { getReportStateTimesAction } from '@/app/dashboard/actions'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { getKpiColor } from '@/lib/kpiColors'
import { GaugeTicks } from '@/components/GaugeTicks'

function getWorkShiftLabels(t: (k: string) => string): Record<1 | 2 | 3, string> {
  return { 1: t('dashboard.turno1'), 2: t('dashboard.turno2'), 3: t('dashboard.turno3') }
}

function getLineStateLabels(t: (k: string) => string): Record<string, string> {
  return {
    Produccion: t('lines.lineState_Produccion'),
    Parada: t('lines.lineState_Parada'),
    'Descanso programado': t('lines.lineState_Descanso programado'),
    Mantenimiento: t('lines.lineState_Mantenimiento'),
    'Cambio formato': t('lines.lineState_Cambio formato'),
  }
}

function getStateLabels(t: (k: string) => string): Record<string, string> {
  return {
    en_marcha: t('report.state_en_marcha'),
    parada: t('report.state_parada'),
    falta_producto: t('report.state_falta_producto'),
    emergencia: t('report.state_emergencia'),
    anomalia: t('report.state_anomalia'),
  }
}

function formatSeconds(sec: number): string {
  if (sec < 60) return `${Math.round(sec)} s`
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  if (m < 60) return s > 0 ? `${m} min ${s} s` : `${m} min`
  const h = Math.floor(m / 60)
  const min = m % 60
  return min > 0 ? `${h} h ${min} min` : `${h} h`
}

interface KpiReportModalProps {
  snapshot: KpiSnapshot
  lineName: string
  onClose: () => void
}

export function KpiReportModal({ snapshot, lineName, onClose }: KpiReportModalProps) {
  const { t } = useLanguage()
  const WORK_SHIFT_LABELS = getWorkShiftLabels(t)
  const STATE_LABELS = getStateLabels(t)
  const LINE_STATE_LABELS = getLineStateLabels(t)
  const [lineStateTimes, setLineStateTimes] = useState<Record<string, number> | null>(null)
  const [stateTimesByMachine, setStateTimesByMachine] = useState<
    { machineId: string; machineName: string; position: number; stateTimes: Record<string, number> }[]
  >([])
  const [machineKpis, setMachineKpis] = useState<
    { machineId: string; oee: number; disponibilidad: number; rendimiento: number; calidad: number }[]
  >([])
  const [production, setProduction] = useState<{
    machineProductions: { machineId: string; machineName: string; position: number; piecesProduced: number; piecesRejected: number }[]
    lineTotalProduced: number
    lineTotalRejected: number
  } | null>(null)
  const [loadingStateTimes, setLoadingStateTimes] = useState(true)

  useEffect(() => {
    let cancelled = false
    getReportStateTimesAction(snapshot.line_id, snapshot.date, snapshot.work_shift).then((res) => {
      if (cancelled) return
      setLoadingStateTimes(false)
      if (res.ok) {
        setLineStateTimes(res.lineStateTimes)
        setStateTimesByMachine(res.stateTimesByMachine ?? [])
        setMachineKpis(res.machineKpis ?? [])
        setProduction(res.production ?? null)
      }
    })
    return () => { cancelled = true }
  }, [snapshot.line_id, snapshot.date, snapshot.work_shift])

  /** Orde dos estados de máquina: marcha, parada, anomalía, falta de producto, emerxencia */
  const STATE_ORDER: (keyof typeof STATE_LABELS)[] = [
    'en_marcha',
    'parada',
    'anomalia',
    'falta_producto',
    'emergencia',
  ]

  /** Orde dos estados de liña nos reportes (Parada non aparece, é transición) */
  const LINE_STATE_ORDER: string[] = [
    'Produccion',
    'Descanso programado',
    'Mantenimiento',
    'Cambio formato',
  ]

  const kpiData = [
    { nameKey: 'report.oee', value: Number(snapshot.oee), rest: 100 - Number(snapshot.oee) },
    { nameKey: 'report.disponibilidad', value: Number(snapshot.disponibilidad), rest: 100 - Number(snapshot.disponibilidad) },
    { nameKey: 'report.rendimiento', value: Number(snapshot.rendimiento), rest: 100 - Number(snapshot.rendimiento) },
    { nameKey: 'report.calidad', value: Number(snapshot.calidad), rest: 100 - Number(snapshot.calidad) },
  ]

  const pieChartsData = kpiData.map((d, i) => ({
    name: t(d.nameKey),
    nameKey: d.nameKey,
    value: d.value,
    rest: d.rest,
    color: getKpiColor(d.value),
  }))

  const totalLineStateSeconds = lineStateTimes
    ? Object.values(lineStateTimes).reduce((a, b) => a + b, 0)
    : 0

  function renderStateTimesTable(
    times: Record<string, number>,
    totalSec: number,
    stateOrder: string[] = STATE_ORDER,
    stateLabels: Record<string, string> = STATE_LABELS
  ) {
    return (
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-600 bg-slate-700">
            <th className="px-3 py-2 font-semibold text-white">{t('report.estado')}</th>
            <th className="px-3 py-2 font-semibold text-white">{t('report.tiempo')}</th>
            <th className="px-3 py-2 font-semibold text-white">%</th>
          </tr>
        </thead>
        <tbody>
          {stateOrder.map((state) => {
            const sec = times[state] ?? 0
            return (
              <tr key={state} className="border-b border-slate-700 text-white">
                <td className="px-3 py-2">{stateLabels[state] ?? state}</td>
                <td className="px-3 py-2">{formatSeconds(sec)}</td>
                <td className="px-3 py-2">
                  {totalSec > 0 ? ((sec / totalSec) * 100).toFixed(1) : 0}%
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  return (
    <div className="report-print-wrapper fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="report-print-content max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-600 bg-slate-800 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-600 pb-4">
          <h2 className="text-lg font-semibold text-white">{t('report.title')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
            aria-label={t('report.closeAria')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm">
          <div className="flex flex-wrap gap-6 text-slate-200">
            <div>
              <span className="text-slate-400">{t('report.line')}</span>{' '}
              <span className="font-medium text-white">{lineName}</span>
            </div>
            <div>
              <span className="text-slate-400">{t('report.turno')}</span>{' '}
              <span className="font-medium text-white">
                {WORK_SHIFT_LABELS[snapshot.work_shift as 1 | 2 | 3] ?? snapshot.work_shift}
              </span>
            </div>
            <div>
              <span className="text-slate-400">{t('report.fecha')}</span>{' '}
              <span className="font-medium text-white">{snapshot.date}</span>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-slate-200">{t('report.kpisPct')}</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 report-print-charts">
              {pieChartsData.map((item) => (
                <div key={item.name} className="flex flex-col items-center report-print-chart-cell">
                  <div className="relative w-full overflow-visible" style={{ height: 138 }}>
                    <ResponsiveContainer width="100%" height={120}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: item.name, value: item.value, fill: item.color },
                            { name: 'Resto', value: item.rest, fill: '#334155' },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="65%"
                          innerRadius={28}
                          outerRadius={44}
                          startAngle={225}
                          endAngle={-45}
                          paddingAngle={2}
                          stroke="none"
                        >
                          <Cell fill={item.color} />
                          <Cell fill="#334155" />
                        </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#e2e8f0',
                        }}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <GaugeTicks outerRadius={44} cyPercent={0.65} chartHeight={120} />
                </div>
                  <span className="text-xs font-medium text-slate-300">{item.name}</span>
                  <span className="text-sm font-semibold text-white">{item.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-slate-200">{t('report.stateTimes')}</h3>
            {loadingStateTimes ? (
              <p className="text-slate-400">{t('report.loading')}</p>
            ) : snapshot.source === 'manual' ? (
              <p className="text-slate-300 font-mono">-----</p>
            ) : (lineStateTimes && totalLineStateSeconds > 0) || stateTimesByMachine.length > 0 ? (
              <div className="space-y-6">
                {/* Tempo por estado de liña (Producción, Parada, etc.) */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-slate-300">{t('report.lineStateTimesSection')}</h4>
                  {lineStateTimes && totalLineStateSeconds > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-slate-600">
                      {renderStateTimesTable(lineStateTimes, totalLineStateSeconds, LINE_STATE_ORDER, LINE_STATE_LABELS)}
                    </div>
                  ) : (
                    <p className="text-slate-400">{t('report.noStateData')}</p>
                  )}
                </div>
                {/* Por máquinas (estados de máquina) */}
                {stateTimesByMachine.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-slate-300">{t('report.byMachines')}</h4>
                    <div className="space-y-4">
                      {stateTimesByMachine.map(({ machineId, machineName, stateTimes: machineTimes }) => {
                        const machineTotal = Object.values(machineTimes).reduce((a, b) => a + b, 0)
                        const kpis = machineKpis.find((k) => k.machineId === machineId)
                        return (
                          <div key={machineId} className="rounded-lg border border-slate-600 overflow-hidden">
                            <div className="bg-slate-700/80 px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                              <span className="font-medium text-white">{machineName}</span>
                              {kpis ? (
                                <span className="text-xs text-slate-300 flex flex-wrap gap-x-3 gap-y-0">
                                  <span>{t('report.oee')}: <strong style={{ color: getKpiColor(kpis.oee) }}>{kpis.oee.toFixed(1)}%</strong></span>
                                  <span>{t('report.disponibilidad')}: <strong style={{ color: getKpiColor(kpis.disponibilidad) }}>{kpis.disponibilidad.toFixed(1)}%</strong></span>
                                  <span>{t('report.rendimiento')}: <strong style={{ color: getKpiColor(kpis.rendimiento) }}>{kpis.rendimiento.toFixed(1)}%</strong></span>
                                  <span>{t('report.calidad')}: <strong style={{ color: getKpiColor(kpis.calidad) }}>{kpis.calidad.toFixed(1)}%</strong></span>
                                </span>
                              ) : null}
                            </div>
                            <div className="overflow-x-auto">
                              {renderStateTimesTable(machineTimes, machineTotal || 1)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400">{t('report.noStateData')}</p>
            )}
          </div>

          <div>
            <h3 className="mb-2 font-medium text-slate-200">{t('report.productionSection')}</h3>
            {production ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-6 rounded-lg border border-slate-600 bg-slate-800/50 p-3">
                  <div>
                    <p className="text-xs text-slate-400">{t('report.lineTotalProduced')}</p>
                    <p className="text-lg font-semibold text-white">{production.lineTotalProduced}</p>
                    <p className="text-xs text-slate-500">{t('lineDetail.totalProducedHint')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{t('report.lineTotalRejected')}</p>
                    <p className="text-lg font-semibold text-white">{production.lineTotalRejected}</p>
                    <p className="text-xs text-slate-500">{t('lineDetail.totalRejectedHint')}</p>
                  </div>
                </div>
                {production.machineProductions.length > 0 && (
                  <div className="overflow-x-auto rounded-lg border border-slate-600">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-600 bg-slate-700">
                          <th className="px-3 py-2 font-semibold text-white">{t('report.machine')}</th>
                          <th className="px-3 py-2 font-semibold text-white">{t('report.piecesProduced')}</th>
                          <th className="px-3 py-2 font-semibold text-white">{t('report.piecesRejected')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {production.machineProductions.map((mp) => (
                          <tr key={mp.machineId} className="border-b border-slate-700 text-white">
                            <td className="px-3 py-2">{mp.machineName}</td>
                            <td className="px-3 py-2">{mp.piecesProduced}</td>
                            <td className="px-3 py-2">{mp.piecesRejected}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-300 font-mono">-----</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
            >
              {t('report.printPdf')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
            >
              {t('report.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
