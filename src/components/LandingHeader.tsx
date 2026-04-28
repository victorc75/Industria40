'use client'

import Link from 'next/link'
import { LanguageSelector } from '@/components/LanguageSelector'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export function LandingHeader() {
  const { t } = useLanguage()
  return (
    <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <span className="text-xl font-bold tracking-tight text-white">
          Industria<span className="text-cyan-400">40</span>
        </span>
        <nav className="flex items-center gap-4">
          <LanguageSelector />
          <a href="#planes" className="text-sm text-slate-200 hover:text-white">
            {t('nav.plans')}
          </a>
          <Link
            href="/login"
            className="text-sm text-slate-200 hover:text-white"
          >
            {t('nav.login')}
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600"
          >
            {t('nav.dashboard')}
          </Link>
        </nav>
      </div>
    </header>
  )
}
