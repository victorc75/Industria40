'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import type { Line } from '@/lib/db/types'
import { saveKpiAction } from '@/app/dashboard/actions'
import { TRIAL_ENDED_ERROR } from '@/lib/constants'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface RegisterKpiFormProps {
  lines: Line[]
}

type WorkShift = 1 | 2 | 3

function calcOee(disponibilidad: number, rendimiento: number, calidad: number): number {
  return Math.round((disponibilidad / 100) * (rendimiento / 100) * (calidad / 100) * 1000) / 10
}

export function RegisterKpiForm({ lines }: RegisterKpiFormProps) {
  const { t } = useLanguage()
  const [lineId, setLineId] = useState(lines[0]?.id ?? '')
  const [workShift, setWorkShift] = useState<WorkShift>(1)
  const [disponibilidad, setDisponibilidad] = useState(85)
  const [rendimiento, setRendimiento] = useState(88)
  const [calidad, setCalidad] = useState(96)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const oee = calcOee(disponibilidad, rendimiento, calidad)
  const today = new Date().toISOString().slice(0, 10)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)
    const formData = new FormData()
    formData.set('lineId', lineId)
    formData.set('workShift', String(workShift))
    formData.set('date', today)
    formData.set('oee', String(oee))
    formData.set('disponibilidad', String(disponibilidad))
    formData.set('rendimiento', String(rendimiento))
    formData.set('calidad', String(calidad))
    const result = await saveKpiAction(formData)
    setLoading(false)
    if (result.ok) {
      setSuccess(true)
    } else {
      setError(result.error)
    }
  }

  if (lines.length === 0) return null

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
      <h2 className="text-lg font-semibold text-white">{t('kpi.title')}</h2>
      <p className="mt-1 text-sm text-slate-400">
        {t('kpi.hint')}
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400">{t('kpi.line')}</label>
          <select
            value={lineId}
            onChange={(e) => setLineId(e.target.value)}
            className="mt-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            {lines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400">{t('kpi.turno')}</label>
          <select
            value={workShift}
            onChange={(e) => setWorkShift(Number(e.target.value) as WorkShift)}
            className="mt-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value={1}>{t('dashboard.turno1')}</option>
            <option value={2}>{t('dashboard.turno2')}</option>
            <option value={3}>{t('dashboard.turno3')}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400">{t('kpi.oeeCalc')}</label>
          <div
            className="mt-1 w-20 rounded-lg border border-slate-600 bg-slate-700/80 px-3 py-2 text-sm text-slate-200"
            title="Disponibilidad × Rendimiento × Calidad"
          >
            {oee.toFixed(1)}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400">{t('kpi.disponibilidad')}</label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={disponibilidad}
            onChange={(e) => setDisponibilidad(Number(e.target.value))}
            className="mt-1 w-20 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400">{t('kpi.rendimiento')}</label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={rendimiento}
            onChange={(e) => setRendimiento(Number(e.target.value))}
            className="mt-1 w-20 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400">{t('kpi.calidad')}</label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={calidad}
            onChange={(e) => setCalidad(Number(e.target.value))}
            className="mt-1 w-20 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {t('kpi.save')}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error === TRIAL_ENDED_ERROR ? t('dashboard.trialEndedCannotSave') : error}</p>
      )}
      {success && (
        <p className="mt-2 text-sm text-cyan-400">{t('kpi.saved')}</p>
      )}
    </div>
  )
}
