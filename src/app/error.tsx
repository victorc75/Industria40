'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useLanguage()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-md rounded-xl border border-slate-700 bg-slate-800 p-6 text-center">
        <h1 className="text-xl font-bold text-white">{t('error.title')}</h1>
        <p className="mt-2 text-sm text-slate-400">
          {error.message || t('error.message')}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600"
          >
            {t('error.retry')}
          </button>
          <Link
            href="/"
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
          >
            {t('error.goHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
