'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Line, Machine } from '@/lib/db/types'
import { updateMachineEnabledAction, updateMachineNameAction, startMachineStateAction, saveMachineProductionAction } from '@/app/dashboard/actions'
import { TRIAL_ENDED_ERROR } from '@/lib/constants'
import { MACHINE_STATE_LABELS, formatDuration, secondsSince } from '@/lib/machineStates'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import type { MachineStateEnum, LineStateEnum } from '@/lib/db/types'

interface MachineWithData {
  machine: Machine
  currentState: MachineStateEnum | null
  currentStateStartedAt: string | null
  frozenState: MachineStateEnum | null
  frozenAccumulatedSeconds: number
  piecesProduced: number
  piecesRejected: number
  oee: number
  disponibilidad: number
  rendimiento: number
  calidad: number
}

interface LineDetailClientProps {
  line: Line
  machinesWithStateAndProduction: MachineWithData[]
  productionDate: string
}

export function LineDetailClient({ line, machinesWithStateAndProduction, productionDate }: LineDetailClientProps) {
  const { t } = useLanguage()
  const lineState = (line.current_line_state ?? 'Parada') as LineStateEnum
  const canEditMachineStates = lineState === 'Produccion'

  const lineTotalProduced = machinesWithStateAndProduction.length > 0
    ? Math.max(...machinesWithStateAndProduction.map((m) => m.piecesProduced))
    : 0
  const lineTotalRejected = machinesWithStateAndProduction.reduce((s, m) => s + m.piecesRejected, 0)

  return (
    <div className="space-y-4">
      {!canEditMachineStates && (
        <p className="text-sm text-amber-400/90">
          {t('lineDetail.notProduction')}
        </p>
      )}
      <p className="text-sm text-slate-400">
        {t('lineDetail.machinesHint')}
      </p>

      <div className="rounded-xl border border-slate-600 bg-slate-800 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-200">{t('lineDetail.lineTotals')}</h3>
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-slate-400">{t('lineDetail.totalProduced')}</p>
            <p className="text-lg font-semibold text-white">{lineTotalProduced}</p>
            <p className="text-xs text-slate-500">{t('lineDetail.totalProducedHint')}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">{t('lineDetail.totalRejected')}</p>
            <p className="text-lg font-semibold text-white">{lineTotalRejected}</p>
            <p className="text-xs text-slate-500">{t('lineDetail.totalRejectedHint')}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {machinesWithStateAndProduction.map((item) => (
          <MachineCard key={item.machine.id} {...item} canEditMachineStates={canEditMachineStates} productionDate={productionDate} />
        ))}
      </div>
    </div>
  )
}

function MachineCard({
  machine,
  currentState,
  currentStateStartedAt,
  frozenState,
  frozenAccumulatedSeconds,
  piecesProduced: initialProduced,
  piecesRejected: initialRejected,
  oee,
  disponibilidad,
  rendimiento,
  calidad,
  canEditMachineStates,
  productionDate,
}: MachineWithData & { canEditMachineStates: boolean; productionDate: string }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [enabled, setEnabled] = useState(machine.enabled)
  const [loading, setLoading] = useState(false)
  const [stateLoading, setStateLoading] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [piecesProduced, setPiecesProduced] = useState(initialProduced)
  const [piecesRejected, setPiecesRejected] = useState(initialRejected)
  const [productionSaving, setProductionSaving] = useState(false)
  const [optimisticState, setOptimisticState] = useState<MachineStateEnum | null>(null)
  const [optimisticStartedAt, setOptimisticStartedAt] = useState<string | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(machine.name?.trim() ?? '')
  const [nameSaving, setNameSaving] = useState(false)
  const inputProducedRef = useRef<HTMLInputElement>(null)
  const inputRejectedRef = useRef<HTMLInputElement>(null)

  const displayName = (machine.name?.trim() || `Máquina ${machine.position}`) as string
  const displayState = optimisticState ?? (canEditMachineStates ? currentState : frozenState) ?? currentState
  const displayStartedAt = optimisticStartedAt ?? currentStateStartedAt
  const isFrozen = !canEditMachineStates && frozenState != null
  const displayDurationSeconds = isFrozen ? frozenAccumulatedSeconds : duration

  useEffect(() => {
    if (isFrozen || !displayStartedAt) return
    setDuration(secondsSince(displayStartedAt))
    const tick = () => setDuration(secondsSince(displayStartedAt))
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isFrozen, displayStartedAt])

  useEffect(() => {
    if (!isFrozen && currentStateStartedAt) setDuration(secondsSince(currentStateStartedAt))
  }, [currentStateStartedAt, isFrozen])

  async function handleToggleEnabled() {
    setLoading(true)
    const result = await updateMachineEnabledAction(machine.id, !enabled)
    setLoading(false)
    if (result.ok) setEnabled(!enabled)
  }

  async function handleStateClick(state: MachineStateEnum) {
    setStateLoading(state)
    setOptimisticState(state)
    const result = await startMachineStateAction(machine.id, state)
    setStateLoading(null)
    if (result.ok) {
      router.refresh()
    } else {
      setOptimisticState(null)
    }
  }

  async function handleSaveProduction(e: React.FormEvent) {
    e.preventDefault()
    setProductionSaving(true)
    const produced = Math.max(0, Math.floor(Number(inputProducedRef.current?.value ?? piecesProduced)) || 0)
    const rejected = Math.max(0, Math.floor(Number(inputRejectedRef.current?.value ?? piecesRejected)) || 0)
    const result = await saveMachineProductionAction({
      machineId: machine.id,
      date: productionDate,
      piecesProduced: produced,
      piecesRejected: rejected,
    })
    setProductionSaving(false)
    if (result.ok) {
      setPiecesProduced(produced)
      setPiecesRejected(rejected)
    } else if (result.error) {
      alert(result.error === TRIAL_ENDED_ERROR ? t('dashboard.trialEndedCannotSave') : result.error)
    }
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = nameValue.trim()
    setNameSaving(true)
    const result = await updateMachineNameAction(machine.id, trimmed || '')
    setNameSaving(false)
    if (result.ok) {
      setEditingName(false)
      router.refresh()
    }
  }

  const states: MachineStateEnum[] = ['en_marcha', 'parada', 'falta_producto', 'emergencia', 'anomalia']

  return (
    <div className={`rounded-xl border p-4 ${enabled ? 'border-slate-600 bg-slate-800' : 'border-slate-700 bg-slate-800/50 opacity-75'}`}>
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          {editingName ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-2">
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                placeholder={`Máquina ${machine.position}`}
                className="min-w-0 flex-1 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm font-semibold text-white placeholder:text-slate-500"
                autoFocus
              />
              <button type="submit" disabled={nameSaving} className="rounded bg-cyan-500 px-2 py-1 text-xs font-medium text-white hover:bg-cyan-600 disabled:opacity-50">
                {nameSaving ? '…' : 'Guardar'}
              </button>
              <button type="button" onClick={() => { setEditingName(false); setNameValue(machine.name?.trim() ?? '') }} className="rounded bg-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-500">
                Cancelar
              </button>
            </form>
          ) : (
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <span className="truncate">{displayName}</span>
              <button
                type="button"
                onClick={() => { setEditingName(true); setNameValue(machine.name?.trim() ?? '') }}
                className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-slate-600 hover:text-white"
                title="Editar nombre"
                aria-label="Editar nombre"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            </h3>
          )}
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleToggleEnabled}
            disabled={loading}
            className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
          />
          Habilitada
        </label>
      </div>

      {enabled && (
        <>
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-slate-400">Estado actual</p>
            <div className="flex flex-wrap gap-1.5">
              {states.map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => handleStateClick(state)}
                  disabled={stateLoading !== null || !canEditMachineStates}
                  title={!canEditMachineStates ? 'Solo se puede cambiar en estado Producción' : undefined}
                  className={`rounded px-2 py-1 text-xs font-medium transition ${
                    displayState === state
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  } disabled:opacity-50`}
                >
                  {stateLoading === state ? '...' : MACHINE_STATE_LABELS[state]}
                </button>
              ))}
            </div>
            {displayState && (
              <p className="mt-2 text-sm text-slate-300">
                {MACHINE_STATE_LABELS[displayState]} desde {formatDuration(displayDurationSeconds)}
                {isFrozen && <span className="ml-1 text-amber-400/90">(congelado)</span>}
              </p>
            )}
          </div>

          <div className="mt-3 grid grid-cols-4 gap-1 text-center text-xs">
            <div className="rounded bg-slate-700/50 p-1">
              <p className="text-slate-400">OEE</p>
              <p className="font-medium text-white">{oee}%</p>
            </div>
            <div className="rounded bg-slate-700/50 p-1">
              <p className="text-slate-400">Disp.</p>
              <p className="font-medium text-white">{disponibilidad}%</p>
            </div>
            <div className="rounded bg-slate-700/50 p-1">
              <p className="text-slate-400">Rend.</p>
              <p className="font-medium text-white">{rendimiento}%</p>
            </div>
            <div className="rounded bg-slate-700/50 p-1">
              <p className="text-slate-400">Cal.</p>
              <p className="font-medium text-white">{calidad}%</p>
            </div>
          </div>

          <form onSubmit={handleSaveProduction} className="mt-4 border-t border-slate-600 pt-4">
            <p className="mb-2 text-xs font-medium text-slate-400">Piezas (hoy)</p>
            <div className="flex gap-2">
              <div>
                <label className="block text-xs text-slate-500">Producidas</label>
                <input
                  ref={inputProducedRef}
                  type="number"
                  min={0}
                  value={piecesProduced}
                  onChange={(e) => {
                    const v = e.target.value
                    setPiecesProduced(v === '' ? 0 : Math.max(0, Math.floor(Number(v)) || 0))
                  }}
                  className="mt-0.5 w-20 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500">Rechazadas</label>
                <input
                  ref={inputRejectedRef}
                  type="number"
                  min={0}
                  value={piecesRejected}
                  onChange={(e) => {
                    const v = e.target.value
                    setPiecesRejected(v === '' ? 0 : Math.max(0, Math.floor(Number(v)) || 0))
                  }}
                  className="mt-0.5 w-20 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={productionSaving}
              className="mt-2 rounded bg-cyan-500 px-2 py-1 text-xs font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
            >
              {productionSaving ? 'Guardando…' : 'Guardar'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
