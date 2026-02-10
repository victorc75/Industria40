'use client'

import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: number
  unit?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
}

export function KpiCard({ title, value, unit = '%', icon: Icon, trend, subtitle }: KpiCardProps) {
  const color =
    value >= 85 ? 'text-emerald-400' : value >= 70 ? 'text-amber-400' : 'text-rose-400'
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-200">{title}</p>
          <p className={`mt-1 text-2xl font-bold tabular-nums ${color}`}>
            {value.toFixed(1)}
            {unit}
          </p>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className="rounded-lg bg-slate-700 p-2">
          <Icon className="h-5 w-5 text-cyan-400" />
        </div>
      </div>
      {trend && (
        <p className="mt-2 text-xs text-slate-400">
          {trend === 'up' && '↑ Respecto al período anterior'}
          {trend === 'down' && '↓ Respecto al período anterior'}
          {trend === 'neutral' && '→ Estable'}
        </p>
      )}
    </div>
  )
}
