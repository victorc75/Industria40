/**
 * Dado unha liña cos horarios de turnos e unha data/hora, devolve o turno actual (1, 2 ou 3).
 * Usa a hora local do servidor. Turnos que cruzan medianoite (p. ej. 22:00–06:00) están soportados.
 */
export function getCurrentShiftFromTime(
  line: {
    shift_1_start?: string
    shift_1_end?: string
    shift_2_start?: string
    shift_2_end?: string
    shift_3_start?: string
    shift_3_end?: string
  },
  now: Date
): 1 | 2 | 3 {
  const mins = now.getHours() * 60 + now.getMinutes()

  function parseHhMm(s: string | undefined, def: number): number {
    if (!s || !/^\d{1,2}:\d{2}$/.test(s)) return def
    const [h, m] = s.split(':').map(Number)
    return (h ?? 0) * 60 + (m ?? 0)
  }

  const s1Start = parseHhMm(line.shift_1_start, 6 * 60)
  const s1End = parseHhMm(line.shift_1_end, 14 * 60)
  const s2Start = parseHhMm(line.shift_2_start, 14 * 60)
  const s2End = parseHhMm(line.shift_2_end, 22 * 60)
  const s3Start = parseHhMm(line.shift_3_start, 22 * 60)
  const s3End = parseHhMm(line.shift_3_end, 6 * 60)

  if (s1Start <= mins && mins < s1End) return 1
  if (s2Start <= mins && mins < s2End) return 2
  if (s3Start > s3End) {
    if (mins >= s3Start || mins < s3End) return 3
  } else {
    if (s3Start <= mins && mins < s3End) return 3
  }
  return 1
}
