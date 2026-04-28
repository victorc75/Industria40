/**
 * Cor do KPI segundo o valor: vermello < 75%, laranxa 75–85%, verde >= 85%.
 * Usado na comparativa de liñas e nos reportes (gardar/imprimir).
 */
export function getKpiColor(pct: number): string {
  if (pct >= 85) return '#22c55e' // verde
  if (pct >= 75) return '#f97316' // laranxa
  return '#ef4444' // vermello
}
