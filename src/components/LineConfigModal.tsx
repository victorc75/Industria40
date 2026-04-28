'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import type { Line } from '@/lib/db/types'
import {
  updateLineMachineCountAction,
  updateLinePlannedAndRateAction,
  initLineTimesAction,
  updateLineShiftTimesAction,
  updateLineAutoShiftChangeAction,
} from '@/app/dashboard/actions'
import { TRIAL_ENDED_ERROR } from '@/lib/constants'
import { useLanguage } from '@/lib/i18n/LanguageContext'

function plannedSecondsToHhMm(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function hhMmToPlannedSeconds(value: string): number | null {
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d+):(\d{1,2})$/)
  if (!match) return null
  const h = parseInt(match[1], 10)
  const m = Math.min(59, parseInt(match[2], 10))
  if (h < 0) return null
  return h * 3600 + m * 60
}

interface LineConfigModalProps {
  line: Line
  onClose: () => void
}

export function LineConfigModal({ line, onClose }: LineConfigModalProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [count, setCount] = useState(Math.min(20, Math.max(1, line.machine_count ?? 1)))
  const [plannedHhMm, setPlannedHhMm] = useState(plannedSecondsToHhMm(line.planned_seconds ?? 28800))
  const [piecesPerMin, setPiecesPerMin] = useState(String(line.pieces_per_minute ?? 1))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setCount(Math.min(20, Math.max(1, line.machine_count ?? 1)))
    setPlannedHhMm(plannedSecondsToHhMm(line.planned_seconds ?? 28800))
    setPiecesPerMin(String(line.pieces_per_minute ?? 1))
  }, [line.machine_count, line.planned_seconds, line.pieces_per_minute])
  const [plannedLoading, setPlannedLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(false)
  const [shiftLoading, setShiftLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultShift = (s: string | undefined, def: string) => (s && /^\d{1,2}:\d{2}$/.test(s) ? s : def)
  const [shift1Start, setShift1Start] = useState(defaultShift(line.shift_1_start, '06:00'))
  const [shift2Start, setShift2Start] = useState(defaultShift(line.shift_2_start, '14:00'))
  const [shift3Start, setShift3Start] = useState(defaultShift(line.shift_3_start, '22:00'))

  const [autoShiftChange, setAutoShiftChange] = useState(Boolean(line.auto_shift_change))
  const [autoShiftLoading, setAutoShiftLoading] = useState(false)

  useEffect(() => {
    setShift1Start(defaultShift(line.shift_1_start, '06:00'))
    setShift2Start(defaultShift(line.shift_2_start, '14:00'))
    setShift3Start(defaultShift(line.shift_3_start, '22:00'))
  }, [line.shift_1_start, line.shift_2_start, line.shift_3_start])

  useEffect(() => {
    setAutoShiftChange(Boolean(line.auto_shift_change))
  }, [line.auto_shift_change])

  async function handleAutoShiftChange(value: boolean) {
    setError(null)
    setAutoShiftLoading(true)
    const result = await updateLineAutoShiftChangeAction(line.id, value)
    setAutoShiftLoading(false)
    if (result.ok) {
      setAutoShiftChange(value)
      router.refresh()
    } else setError(result.error === TRIAL_ENDED_ERROR ? t('dashboard.trialEndedCannotSave') : result.error)
  }

  async function handleSaveMachines() {
    setError(null)
    setLoading(true)
    const result = await updateLineMachineCountAction(line.id, count)
    setLoading(false)
    if (result.ok) {
      router.refresh()
      onClose()
    } else setError(result.error === TRIAL_ENDED_ERROR ? t('dashboard.trialEndedCannotSave') : result.error)
  }

  async function handleSavePlanned(e: React.FormEvent) {
    e.preventDefault()
    const plannedSeconds = hhMmToPlannedSeconds(plannedHhMm)
    const rate = Number(piecesPerMin) || 1
    if (plannedSeconds == null || plannedSeconds <= 0 || rate <= 0) return
    setError(null)
    setPlannedLoading(true)
    const result = await updateLinePlannedAndRateAction(line.id, plannedSeconds, rate)
    setPlannedLoading(false)
    if (result.ok) router.refresh()
    else setError(result.error === TRIAL_ENDED_ERROR ? t('dashboard.trialEndedCannotSave') : result.error)
  }

  async function handleSaveShiftTimes(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setShiftLoading(true)
    const result = await updateLineShiftTimesAction(line.id, {
      shift_1_start: shift1Start,
      shift_2_start: shift2Start,
      shift_3_start: shift3Start,
    })
    setShiftLoading(false)
    if (result.ok) router.refresh()
    else setError(result.error === TRIAL_ENDED_ERROR ? t('dashboard.trialEndedCannotSave') : result.error)
  }

  async function handleInitTimes() {
    if (!confirm(t('modal.clearStateTimesConfirm'))) return
    setError(null)
    setInitLoading(true)
    const result = await initLineTimesAction(line.id)
    setInitLoading(false)
    if (result.ok) router.refresh()
    else setError(result.error === TRIAL_ENDED_ERROR ? t('dashboard.trialEndedCannotSave') : result.error)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-slate-600 bg-slate-800 p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{t('modal.configTitle')} — {line.name}</h3>
          <button type="button" onClick={onClose} className="rounded p-1 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm text-slate-400">{t('modal.machinesCount')}</p>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? t('modal.machine') : t('modal.machines')}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSaveShiftTimes} className="space-y-2">
            <p className="text-sm text-slate-400">{t('modal.shiftSchedules')}</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-slate-400">{t('modal.shiftChangeMode')}</span>
              <select
                value={autoShiftChange ? 'auto' : 'manual'}
                onChange={(e) => handleAutoShiftChange(e.target.value === 'auto')}
                disabled={autoShiftLoading}
                className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
              >
                <option value="manual">{t('modal.shiftChangeManual')}</option>
                <option value="auto">{t('modal.shiftChangeAuto')}</option>
              </select>
              {autoShiftLoading && <span className="text-xs text-slate-500">…</span>}
            </div>
            <p className="text-xs text-slate-500">{t('modal.shiftChangeAutoHelp')}</p>
            <p className="text-xs text-slate-500">{t('modal.shiftStartOnlyHelp')}</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-14 text-slate-500">{t('dashboard.turno1')}</span>
                <input
                  type="text"
                  value={shift1Start}
                  onChange={(e) => setShift1Start(e.target.value)}
                  placeholder="06:00"
                  className="w-14 rounded border border-slate-600 bg-slate-700 px-2 py-1 font-mono text-white focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-slate-500">–</span>
                <span className="w-14 font-mono text-slate-400" title={t('modal.shiftEndIsNextStart')}>
                  {shift2Start}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-14 text-slate-500">{t('dashboard.turno2')}</span>
                <input
                  type="text"
                  value={shift2Start}
                  onChange={(e) => setShift2Start(e.target.value)}
                  placeholder="14:00"
                  className="w-14 rounded border border-slate-600 bg-slate-700 px-2 py-1 font-mono text-white focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-slate-500">–</span>
                <span className="w-14 font-mono text-slate-400" title={t('modal.shiftEndIsNextStart')}>
                  {shift3Start}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-14 text-slate-500">{t('dashboard.turno3')}</span>
                <input
                  type="text"
                  value={shift3Start}
                  onChange={(e) => setShift3Start(e.target.value)}
                  placeholder="22:00"
                  className="w-14 rounded border border-slate-600 bg-slate-700 px-2 py-1 font-mono text-white focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-slate-500">–</span>
                <span className="w-14 font-mono text-slate-400" title={t('modal.shiftEndIsNextStart')}>
                  {shift1Start}
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={shiftLoading}
              className="rounded-lg bg-cyan-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
            >
              {shiftLoading ? '…' : t('modal.saveSchedules')}
            </button>
          </form>

          <form onSubmit={handleSavePlanned} className="space-y-2">
            <p className="text-sm text-slate-400">{t('modal.plannedTime')}</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={plannedHhMm}
                onChange={(e) => setPlannedHhMm(e.target.value)}
                placeholder="08:00"
                className="w-20 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 font-mono text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
                title="Horas:minutos"
              />
              <input
                type="number"
                value={piecesPerMin}
                onChange={(e) => setPiecesPerMin(e.target.value)}
                min={0.1}
                step={0.1}
                className="w-24 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                placeholder={t('modal.piecesPerMin')}
              />
              <button
                type="submit"
                disabled={plannedLoading}
                className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
              >
                {plannedLoading ? '…' : t('lines.save')}
              </button>
            </div>
          </form>

          <div>
            <p className="mb-1 text-sm text-slate-400">{t('modal.stateTimesToday')}</p>
            <button
              type="button"
              onClick={handleInitTimes}
              disabled={initLoading}
              className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-600 disabled:opacity-50"
            >
              {initLoading ? '…' : t('modal.initTimes')}
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700">
            {t('modal.close')}
          </button>
          <button
            type="button"
            onClick={handleSaveMachines}
            disabled={loading}
            className="rounded-lg bg-cyan-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
          >
            {loading ? t('lines.saving') : t('modal.saveMachines')}
          </button>
        </div>
      </div>
    </div>
  )
}
