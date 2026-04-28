'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts'
import type { KpiHistoryPoint } from '@/lib/types'

interface OeeChartProps {
  data: KpiHistoryPoint[]
  title?: string
}

const formatDate = (d: string) => {
  const date = new Date(d)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

export function OeeChart({ data, title = 'Evolución KPIs (14 días)' }: OeeChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    fecha: formatDate(d.date),
  }))

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
      {title ? <h3 className="mb-4 text-sm font-semibold text-slate-100">{title}</h3> : null}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="fecha" stroke="#cbd5e1" fontSize={12} tick={{ fill: '#e2e8f0' }} tickLine={false} />
            <YAxis stroke="#cbd5e1" fontSize={12} tick={{ fill: '#e2e8f0' }} tickLine={false} domain={[50, 100]} ticks={[50, 75, 85, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
              }}
              labelStyle={{ color: '#f1f5f9' }}
              formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
              labelFormatter={(label) => `Fecha: ${label}`}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => <span className="text-slate-100">{value}</span>}
            />
            <ReferenceLine y={50} stroke="#64748b" strokeDasharray="2 2" strokeOpacity={0.5} />
            <ReferenceLine y={75} stroke="#94a3b8" strokeDasharray="2 2" strokeOpacity={0.5} />
            <ReferenceLine y={85} stroke="#64748b" strokeDasharray="2 2" strokeOpacity={0.5} />
            <ReferenceLine y={100} stroke="#64748b" strokeDasharray="2 2" strokeOpacity={0.5} />
            <Line type="monotone" dataKey="oee" stroke="#0ea5e9" strokeWidth={2} name="OEE" dot={false} />
            <Line type="monotone" dataKey="disponibilidad" stroke="#8b5cf6" strokeWidth={2} name="Disponibilidad" dot={false} />
            <Line type="monotone" dataKey="rendimiento" stroke="#f59e0b" strokeWidth={2} name="Rendimiento" dot={false} />
            <Line type="monotone" dataKey="calidad" stroke="#10b981" strokeWidth={2} name="Calidad" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
