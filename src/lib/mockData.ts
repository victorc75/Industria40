import type { KpiHistoryPoint, LineKpi } from './types'

// Datos de ejemplo para gráficas (últimos 14 días)
export function getKpiHistory(lineId: string): KpiHistoryPoint[] {
  const days = 14
  const base = { oee: 72, disponibilidad: 85, rendimiento: 88, calidad: 96 }
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    const variation = () => Math.random() * 8 - 4
    return {
      date: d.toISOString().slice(0, 10),
      oee: Math.round(Math.max(50, Math.min(95, base.oee + variation())) * 10) / 10,
      disponibilidad: Math.round(Math.max(70, Math.min(98, base.disponibilidad + variation())) * 10) / 10,
      rendimiento: Math.round(Math.max(75, Math.min(98, base.rendimiento + variation())) * 10) / 10,
      calidad: Math.round(Math.max(90, Math.min(100, base.calidad + variation())) * 10) / 10,
    }
  })
}

export function getLinesKpis(planLines: number): LineKpi[] {
  const count = planLines === -1 ? 6 : Math.min(planLines, 6)
  const names = ['Línea A', 'Línea B', 'Línea C', 'Línea D', 'Línea E', 'Línea F']
  return Array.from({ length: count }, (_, i) => {
    const disp = 80 + Math.random() * 15
    const ren = 82 + Math.random() * 12
    const cal = 92 + Math.random() * 6
    const oee = (disp * ren * cal) / 10000
    return {
      lineId: `line-${i + 1}`,
      lineName: names[i],
      oee: Math.round(oee * 10) / 10,
      disponibilidad: Math.round(disp * 10) / 10,
      rendimiento: Math.round(ren * 10) / 10,
      calidad: Math.round(cal * 10) / 10,
      timestamp: new Date().toISOString(),
    }
  })
}
