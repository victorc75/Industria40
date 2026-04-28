import type { MachineStateEnum } from '@/lib/db/types'

export const MACHINE_STATE_LABELS: Record<MachineStateEnum, string> = {
  en_marcha: 'En marcha',
  parada: 'Parada',
  falta_producto: 'Falta producto',
  emergencia: 'Emergencia',
  anomalia: 'Anomalía',
}

export function formatDuration(seconds: number): string {
  const sec = Math.max(0, Math.floor(seconds))
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

/** Segundos desde isoStart hasta ahora. Nunca negativo (evita desfase servidor/cliente). */
export function secondsSince(isoStart: string): number {
  const elapsed = Math.floor((Date.now() - new Date(isoStart).getTime()) / 1000)
  return Math.max(0, elapsed)
}
