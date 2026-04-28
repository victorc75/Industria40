'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import { searchKpiSnapshotsAction } from '@/app/dashboard/actions'
import { KpiReportModal } from '@/components/KpiReportModal'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import type { Line } from '@/lib/db/types'
import type { KpiSnapshot } from '@/lib/db/types'

function getWorkShiftLabels(t: (k: string) => string): Record<1 | 2 | 3, string> {
  return { 1: t('dashboard.turno1'), 2: t('dashboard.turno2'), 3: t('dashboard.turno3') }
}

interface DataSearchProps {
  lines: Line[]
}

export function DataSearch({ lines }: DataSearchProps) {
  const { t } = useLanguage()
  const WORK_SHIFT_LABELS = getWorkShiftLabels(t)
  const today = new Date()
  const [lineId, setLineId] = useState<string>('')
  const [workShift, setWorkShift] = useState<string>('') // '' = todos, '1'|'2'|'3'
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [day, setDay] = useState(today.getDate())
  const [results, setResults] = useState<KpiSnapshot[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reportSnapshot, setReportSnapshot] = useState<KpiSnapshot | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResults(null)
    setLoading(true)
    const res = await searchKpiSnapshotsAction({
      lineId: lineId || undefined,
      workShift: workShift === '' ? undefined : Number(workShift),
      year,
      month,
      day,
    })
    setLoading(false)
    if (res.ok) setResults(res.data)
    else setError(res.error)
  }

  const lineById = Object.fromEntries(lines.map((l) => [l.id, l]))

  const inputClass =
    'mt-1 rounded-lg border border-slate-500 bg-slate-700 px-3 py-2 text-sm font-medium text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500'

  return (
    <section className="rounded-xl border border-slate-600 bg-slate-800 p-4 shadow-lg">
      <h2 className="text-lg font-semibold text-white">{t('search.title')}</h2>
      <p className="mt-1 text-sm text-slate-300">
        {t('search.subtitle')}
      </p>
      <form onSubmit={handleSearch} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300">{t('search.line')}</label>
          <select
            value={lineId}
            onChange={(e) => setLineId(e.target.value)}
            className={inputClass}
          >
            <option value="" className="bg-slate-700 text-white">{t('search.all')}</option>
            {lines.map((l) => (
              <option key={l.id} value={l.id} className="bg-slate-700 text-white">{l.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300">{t('search.turno')}</label>
          <select
            value={workShift}
            onChange={(e) => setWorkShift(e.target.value)}
            className={inputClass}
          >
            <option value="" className="bg-slate-700 text-white">{t('search.allTurnos')}</option>
            <option value="1" className="bg-slate-700 text-white">{t('dashboard.turno1')}</option>
            <option value="2" className="bg-slate-700 text-white">{t('dashboard.turno2')}</option>
            <option value="3" className="bg-slate-700 text-white">{t('dashboard.turno3')}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300">{t('search.year')}</label>
          <input
            type="number"
            min={2000}
            max={2100}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300">{t('search.month')}</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className={inputClass}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m} className="bg-slate-700 text-white">{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300">{t('search.day')}</label>
          <input
            type="number"
            min={1}
            max={31}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
        >
          {loading ? t('search.searching') : t('search.search')}
        </button>
      </form>
      {error && <p className="mt-3 text-sm font-medium text-red-400">{error}</p>}
      {results && (
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-600 bg-slate-700/80">
          {results.length === 0 ? (
            <p className="p-4 text-sm text-slate-300">{t('search.noResults')}</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-600 bg-slate-700">
                  <th className="pb-2 pr-4 pt-3 pl-3 font-semibold text-white">{t('search.line')}</th>
                  <th className="pb-2 pr-4 pt-3 font-semibold text-white">{t('search.turno')}</th>
                  <th className="pb-2 pr-4 pt-3 font-semibold text-white">{t('search.fecha')}</th>
                  <th className="pb-2 pr-4 pt-3 font-semibold text-white">OEE %</th>
                  <th className="pb-2 pr-4 pt-3 font-semibold text-white">{t('search.disp')}</th>
                  <th className="pb-2 pr-4 pt-3 font-semibold text-white">{t('search.rend')}</th>
                  <th className="pb-2 pr-4 pt-3 font-semibold text-white">{t('search.calidad')}</th>
                  <th className="pb-2 pt-3 pr-3 font-semibold text-white">{t('search.report')}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row) => (
                  <tr key={row.id} className="border-b border-slate-600 bg-slate-800/50 text-white">
                    <td className="py-2.5 pr-4 pl-3 font-medium">{lineById[row.line_id]?.name ?? row.line_id}</td>
                    <td className="py-2.5 pr-4">{WORK_SHIFT_LABELS[row.work_shift as 1 | 2 | 3] ?? row.work_shift}</td>
                    <td className="py-2.5 pr-4">{row.date}</td>
                    <td className="py-2.5 pr-4">{Number(row.oee).toFixed(1)}</td>
                    <td className="py-2.5 pr-4">{Number(row.disponibilidad).toFixed(1)}</td>
                    <td className="py-2.5 pr-4">{Number(row.rendimiento).toFixed(1)}</td>
                    <td className="py-2.5 pr-4">{Number(row.calidad).toFixed(1)}</td>
                    <td className="py-2.5 pr-3">
                      <button
                        type="button"
                        onClick={() => setReportSnapshot(row)}
                        className="inline-flex items-center gap-1 rounded-lg bg-cyan-600/80 px-2 py-1 text-xs font-medium text-white hover:bg-cyan-500"
                        title={t('search.reportTitle')}
                      >
                        <FileText className="h-3.5 w-3.5" /> {t('search.report')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {reportSnapshot && (
        <KpiReportModal
          snapshot={reportSnapshot}
          lineName={lineById[reportSnapshot.line_id]?.name ?? reportSnapshot.line_id}
          onClose={() => setReportSnapshot(null)}
        />
      )}
    </section>
  )
}
