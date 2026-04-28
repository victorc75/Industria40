'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Settings, Save, Cpu, Gauge, Activity, TrendingUp, Award, RotateCcw } from 'lucide-react'
import type { Line, LineStateEnum, WorkShift } from '@/lib/db/types'
import { createLineAction, updateLineAction, deleteLineAction, updateLineStateAction, updateLineWorkShiftAction, saveLineAndResetAction, initLineTimesAction } from '@/app/dashboard/actions'
import { TRIAL_ENDED_ERROR } from '@/lib/constants'
import { PLANS, type PlanId } from '@/lib/types'
import { LineConfigModal } from './LineConfigModal'
import { useLanguage } from '@/lib/i18n/LanguageContext'

function kpiColorClass(pct: number): string {
  if (pct < 75) return 'text-red-400'
  if (pct < 85) return 'text-amber-400'
  return 'text-emerald-400'
}

function getLineStateOptions(t: (k: string) => string): { value: LineStateEnum; label: string }[] {
  return [
    { value: 'Produccion', label: t('lines.lineState_Produccion') },
    { value: 'Parada', label: t('lines.lineState_Parada') },
    { value: 'Descanso programado', label: t('lines.lineState_Descanso programado') },
    { value: 'Mantenimiento', label: t('lines.lineState_Mantenimiento') },
    { value: 'Cambio formato', label: t('lines.lineState_Cambio formato') },
  ]
}

function getWorkShiftOptions(t: (k: string) => string): { value: WorkShift; label: string }[] {
  return [
    { value: 1, label: t('dashboard.turno1') },
    { value: 2, label: t('dashboard.turno2') },
    { value: 3, label: t('dashboard.turno3') },
  ]
}

export type LineKpis = { oee: number; disponibilidad: number; rendimiento: number; calidad: number }

interface LinesManagerProps {
  lines: Line[]
  planId: PlanId
  lineKpisByLineId?: Record<string, LineKpis | null>
}

export function LinesManager({ lines, planId, lineKpisByLineId = {} }: LinesManagerProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const LINE_STATE_OPTIONS = getLineStateOptions(t)
  const WORK_SHIFT_OPTIONS = getWorkShiftOptions(t)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [configLine, setConfigLine] = useState<Line | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lineStateLoadingId, setLineStateLoadingId] = useState<string | null>(null)
  const [lineShiftLoadingId, setLineShiftLoadingId] = useState<string | null>(null)
  const [saveLineLoadingId, setSaveLineLoadingId] = useState<string | null>(null)
  const [initTimesLoadingId, setInitTimesLoadingId] = useState<string | null>(null)

  const plan = PLANS.find((p) => p.id === planId)
  const maxLines = plan?.lines === -1 ? Infinity : plan?.lines ?? 0
  const canAdd = lines.length < maxLines

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData()
    formData.set('name', newName.trim())
    const result = await createLineAction(formData)
    setLoading(false)
    if (result.ok) {
      setNewName('')
      setAdding(false)
    } else {
      setError(result.error)
    }
  }

  async function handleUpdate(e: React.FormEvent, lineId: string) {
    e.preventDefault()
    if (!editingId) return
    setError(null)
    setLoading(true)
    const formData = new FormData()
    formData.set('name', editName.trim())
    const result = await updateLineAction(lineId, formData)
    setLoading(false)
    if (result.ok) {
      setEditingId(null)
      setEditName('')
    } else {
      setError(result.error)
    }
  }

  async function handleDelete(lineId: string) {
    if (!confirm(t('lines.deleteConfirm'))) return
    setError(null)
    setLoading(true)
    const result = await deleteLineAction(lineId)
    setLoading(false)
    if (!result.ok) setError(result.error)
  }

  async function handleLineStateChange(lineId: string, newState: LineStateEnum) {
    setLineStateLoadingId(lineId)
    const result = await updateLineStateAction(lineId, newState)
    setLineStateLoadingId(null)
    if (result.ok) router.refresh()
    else setError(result.error === TRIAL_ENDED_ERROR ? t('dashboard.trialEndedCannotSave') : result.error)
  }

  async function handleLineWorkShiftChange(lineId: string, workShift: WorkShift) {
    setLineShiftLoadingId(lineId)
    const result = await updateLineWorkShiftAction(lineId, workShift)
    setLineShiftLoadingId(null)
    if (result.ok) router.refresh()
    else setError(result.error === TRIAL_ENDED_ERROR ? t('dashboard.trialEndedCannotSave') : result.error)
  }

  async function handleSaveLineAndReset(lineId: string) {
    if (!confirm(t('lines.saveResetConfirm'))) return
    setSaveLineLoadingId(lineId)
    const result = await saveLineAndResetAction(lineId)
    setSaveLineLoadingId(null)
    if (result.ok) router.refresh()
    else setError(result.error)
  }

  async function handleInitTimes(lineId: string) {
    if (!confirm(t('modal.clearStateTimesConfirm'))) return
    setError(null)
    setInitTimesLoadingId(lineId)
    const result = await initLineTimesAction(lineId)
    setInitTimesLoadingId(null)
    if (result.ok) router.refresh()
    else setError(result.error)
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{t('dashboard.linesTitle')}</h2>
        {canAdd && !adding && (
          <button
            type="button"
            onClick={() => { setAdding(true); setError(null); }}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-600"
          >
            <Plus className="h-4 w-4" /> {t('dashboard.addLine')}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error === TRIAL_ENDED_ERROR ? t('dashboard.trialEndedCannotSave') : error}
        </p>
      )}

      {adding && (
        <form onSubmit={handleCreate} className="mt-4 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t('lines.namePlaceholder')}
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !newName.trim()}
            className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
          >
            {loading ? t('lines.saving') : t('lines.save')}
          </button>
          <button
            type="button"
            onClick={() => { setAdding(false); setNewName(''); setError(null); }}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
          >
            {t('lines.cancel')}
          </button>
        </form>
      )}

      <ul className="mt-4 space-y-2">
        {lines.length === 0 && !adding && (
          <li className="text-sm text-slate-400">{t('lines.noLines')}</li>
        )}
        {lines.map((line) => (
          <li
            key={line.id}
            className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2"
          >
            {editingId === line.id ? (
              <form
                onSubmit={(e) => handleUpdate(e, line.id)}
                className="flex flex-1 items-center gap-2"
              >
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !editName.trim()}
                  className="rounded bg-cyan-500 px-2 py-1 text-xs text-white hover:bg-cyan-600 disabled:opacity-50"
                >
                  {t('lines.save')}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setEditName(''); }}
                  className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
                >
                  {t('lines.cancel')}
                </button>
              </form>
            ) : (
              <>
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/line/${line.id}`}
                    className="flex items-center gap-1.5 text-sm font-medium text-cyan-400 hover:text-cyan-300"
                  >
                    <Cpu className="h-4 w-4" />
                    {line.name}
                  </Link>
                  <span className="text-xs text-slate-500">
                    {line.machine_count ?? 1} {t('lines.machinesShort')}
                  </span>
                  <select
                    value={(line.current_line_state ?? 'Parada') as LineStateEnum}
                    onChange={(e) => handleLineStateChange(line.id, e.target.value as LineStateEnum)}
                    disabled={lineStateLoadingId === line.id}
                    className="rounded border border-slate-600 bg-slate-700 px-2 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
                    title={t('lines.stateTitle')}
                  >
                    {LINE_STATE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {lineStateLoadingId === line.id && (
                    <span className="text-xs text-slate-500">{t('lines.saving')}</span>
                  )}
                  <select
                    value={(line.work_shift ?? 1) as WorkShift}
                    onChange={(e) => handleLineWorkShiftChange(line.id, Number(e.target.value) as WorkShift)}
                    disabled={lineShiftLoadingId === line.id}
                    className="rounded border border-slate-600 bg-slate-700 px-2 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
                    title={t('lines.shiftTitle')}
                  >
                    {WORK_SHIFT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {lineShiftLoadingId === line.id && (
                    <span className="text-xs text-slate-500">…</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleInitTimes(line.id)}
                    disabled={initTimesLoadingId === line.id}
                    className="flex items-center gap-1 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600 hover:text-white disabled:opacity-50"
                    title={t('modal.initTimes')}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {initTimesLoadingId === line.id ? '…' : t('modal.initTimes')}
                  </button>
                  {lineKpisByLineId[line.id] != null ? (
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { key: 'oee', label: 'OEE', value: lineKpisByLineId[line.id]!.oee, Icon: Gauge },
                        { key: 'disp', label: t('kpi.disp'), value: lineKpisByLineId[line.id]!.disponibilidad, Icon: Activity },
                        { key: 'rend', label: t('kpi.rend'), value: lineKpisByLineId[line.id]!.rendimiento, Icon: TrendingUp },
                        { key: 'cal', label: t('kpi.cal'), value: lineKpisByLineId[line.id]!.calidad, Icon: Award },
                      ].map(({ key, label, value, Icon }) => (
                        <div
                          key={key}
                          title={label}
                          className="flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-700/80 px-2 py-1"
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                          <span className="text-[10px] text-slate-400">{label}</span>
                          <span className={`text-xs font-semibold tabular-nums ${kpiColorClass(value)}`}>
                            {value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">—</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => { setConfigLine(line); setError(null); }}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-600 hover:text-white"
                    title={t('lines.configTitle')}
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveLineAndReset(line.id)}
                    disabled={saveLineLoadingId === line.id}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-600 hover:text-emerald-500 disabled:opacity-50"
                    title={t('lines.saveLineDataTitle')}
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingId(line.id); setEditName(line.name); setError(null); }}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-600 hover:text-white"
                    title={t('lines.editName')}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(line.id)}
                    disabled={loading}
                    className="rounded p-1.5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
                    title={t('lines.delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {configLine && (
        <LineConfigModal
          line={lines.find((l) => l.id === configLine.id) ?? configLine}
          onClose={() => setConfigLine(null)}
        />
      )}
    </div>
  )
}
