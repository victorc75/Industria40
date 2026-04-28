import { NextResponse } from 'next/server'
import { runAutoShiftCron } from '@/lib/cron/runAutoShiftCron'

/**
 * GET /api/cron/auto-shift
 * Debe chamarse con Authorization: Bearer <CRON_SECRET> (p. ej. desde Vercel Cron).
 * Comprueba liñas con cambio de turno automático e, se a hora indica fin de turno, garda e pasa ao seguinte.
 */
export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const result = await runAutoShiftCron()
    return NextResponse.json({ ok: result.ok, error: result.error })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
