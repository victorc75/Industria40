'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { LineKpi } from '@/lib/types'

interface LinesBarChartProps {
  data: LineKpi[]
  title?: string
}

export function LinesBarChart({ data, title = 'OEE por línea' }: LinesBarChartProps) {
  const chartData = data.map((d) => ({
    nombre: d.lineName,
    OEE: d.oee,
    Disponibilidad: d.disponibilidad,
    Rendimiento: d.rendimiento,
    Calidad: d.calidad,
  }))

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
      <h3 className="mb-4 text-sm font-semibold text-slate-100">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} layout="vertical" barCategoryGap="12%">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis type="number" stroke="#cbd5e1" fontSize={12} tick={{ fill: '#e2e8f0' }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="nombre" stroke="#cbd5e1" fontSize={12} width={80} tick={{ fill: '#e2e8f0' }} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
              }}
              formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} formatter={(value) => <span className="text-slate-100">{value}</span>} />
            <Bar dataKey="OEE" fill="#0ea5e9" radius={[0, 4, 4, 0]} name="OEE" />
            <Bar dataKey="Disponibilidad" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Disponibilidad" />
            <Bar dataKey="Rendimiento" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Rendimiento" />
            <Bar dataKey="Calidad" fill="#10b981" radius={[0, 4, 4, 0]} name="Calidad" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
