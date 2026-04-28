'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { LineKpi } from '@/lib/types'
import { getKpiColor } from '@/lib/kpiColors'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { GaugeTicks } from '@/components/GaugeTicks'

interface LinesBarChartProps {
  data: LineKpi[]
  title?: string
}

const KPI_KEYS: (keyof Pick<LineKpi, 'oee' | 'disponibilidad' | 'rendimiento' | 'calidad'>)[] = [
  'oee',
  'disponibilidad',
  'rendimiento',
  'calidad',
]

export function LinesBarChart({ data, title = 'OEE por línea' }: LinesBarChartProps) {
  const { t } = useLanguage()

  const labels: Record<string, string> = {
    oee: t('report.oee'),
    disponibilidad: t('report.disponibilidad'),
    rendimiento: t('report.rendimiento'),
    calidad: t('report.calidad'),
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400">{t('dashboard.noLines')}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
      <h3 className="mb-4 text-sm font-semibold text-slate-100">{title}</h3>
      <div className="space-y-6">
        {data.map((line) => (
          <div key={line.lineId} className="rounded-lg border border-slate-600 bg-slate-800/50 p-3">
            <p className="mb-3 text-sm font-medium text-white">{line.lineName}</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {KPI_KEYS.map((key) => {
                const value = line[key] ?? 0
                const rest = Math.max(0, 100 - value)
                const color = getKpiColor(value)
                const pieData = [
                  { name: labels[key], value, fill: color },
                  { name: 'Resto', value: rest, fill: '#334155' },
                ]
                return (
                  <div key={key} className="flex flex-col items-center relative">
                    <div className="relative w-full overflow-visible" style={{ height: 118 }}>
                      <ResponsiveContainer width="100%" height={100}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="65%"
                            innerRadius={22}
                            outerRadius={38}
                            startAngle={225}
                            endAngle={-45}
                            paddingAngle={2}
                            stroke="none"
                          >
                            <Cell fill={color} />
                            <Cell fill="#334155" />
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              border: '1px solid #334155',
                              borderRadius: '8px',
                              color: '#e2e8f0',
                            }}
                            formatter={(v: number) => [`${v.toFixed(1)}%`, '']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <GaugeTicks outerRadius={38} cyPercent={0.65} chartHeight={100} />
                    </div>
                    <span className="text-xs text-slate-300">{labels[key]}</span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color }}
                                    >
                      {value.toFixed(1)}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
