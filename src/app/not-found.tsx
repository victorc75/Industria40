'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function NotFound() {
  const { t } = useLanguage()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-white">404</h1>
        <p className="mt-2 text-slate-400">{t('notFound.title')}</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600"
        >
          {t('notFound.goHome')}
        </Link>
      </div>
    </div>
  )
}
