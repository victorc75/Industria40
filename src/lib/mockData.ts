import type { KpiHistoryPoint, LineKpi } from './types'

/** Hash simple para valores deterministas (evita hydration mismatch servidor/cliente) */
function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

/** Pseudo-random 0..1 determinista a partir de una semilla */
function seeded(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Datos de ejemplo para gráficas (últimos 14 días) - deterministas para mismo lineId/fecha
export function getKpiHistory(lineId: string): KpiHistoryPoint[] {
  const days = 14
  const base = { oee: 72, disponibilidad: 85, rendimiento: 88, calidad: 96 }
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const seed = hash(lineId + dateStr)
    const v = (s: number) => (seeded(seed + s) * 8 - 4)
    return {
      date: dateStr,
      oee: Math.round(Math.max(50, Math.min(95, base.oee + v(1))) * 10) / 10,
      disponibilidad: Math.round(Math.max(70, Math.min(98, base.disponibilidad + v(2))) * 10) / 10,
      rendimiento: Math.round(Math.max(75, Math.min(98, base.rendimiento + v(3))) * 10) / 10,
      calidad: Math.round(Math.max(90, Math.min(100, base.calidad + v(4))) * 10) / 10,
    }
  })
}

export function getLinesKpis(planLines: number): LineKpi[] {
  const count = planLines === -1 ? 6 : Math.min(planLines, 6)
  const names = ['Línea A', 'Línea B', 'Línea C', 'Línea D', 'Línea E', 'Línea F']
  return Array.from({ length: count }, (_, i) => {
    const lineId = `line-${i + 1}`
    const s = hash(lineId)
    const disp = 80 + seeded(s) * 15
    const ren = 82 + seeded(s + 2) * 12
    const cal = 92 + seeded(s + 3) * 6
    const oee = (disp * ren * cal) / 10000
    return {
      lineId,
      lineName: names[i],
      oee: Math.round(oee * 10) / 10,
      disponibilidad: Math.round(disp * 10) / 10,
      rendimiento: Math.round(ren * 10) / 10,
      calidad: Math.round(cal * 10) / 10,
      timestamp: new Date().toISOString(),
    }
  })
}

/** Convierte líneas de la BD en LineKpi con valores de demo (deterministas para evitar hydration error) */
export function getLinesKpisFromLines(
  lines: { id: string; name: string }[]
): LineKpi[] {
  return lines.map((line) => {
    const s = hash(line.id)
    const disp = 80 + seeded(s) * 15
    const ren = 82 + seeded(s + 2) * 12
    const cal = 92 + seeded(s + 3) * 6
    const oee = (disp * ren * cal) / 10000
    return {
      lineId: line.id,
      lineName: line.name,
      oee: Math.round(oee * 10) / 10,
      disponibilidad: Math.round(disp * 10) / 10,
      rendimiento: Math.round(ren * 10) / 10,
      calidad: Math.round(cal * 10) / 10,
      timestamp: new Date().toISOString(),
    }
  })
}
