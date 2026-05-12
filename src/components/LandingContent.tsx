'use client'

import Link from 'next/link'
import { Zap, BarChart3, Users, Headphones, Database, Code2, Plug } from 'lucide-react'
import { PLANS } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/LanguageContext'

function planDashboardKey(d: string): string {
  const k: Record<string, string> = {
    'básico': 'basico',
    'avanzado': 'avanzado',
    'personalizado': 'personalizado',
  }
  return `plan.dashboard_${k[d] ?? d}`
}

function planSupportKey(s: string): string {
  if (s.includes('email') || s === 'Soporte por email') return 'plan.support_email'
  if (s.includes('24') || s === 'Soporte 24/7') return 'plan.support_24'
  return 'plan.support_phone'
}

function planApiKey(a: string): string {
  return a?.includes('completa') ? 'plan.api_full' : 'plan.api_basic'
}

export function LandingContent() {
  const { t } = useLanguage()

  return (
    <main>
      <section className="border-b border-slate-800/50 px-4 py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-balance text-center text-4xl font-bold tracking-tight text-white md:text-5xl">
            {t('landing.hero.title')}
            <span className="whitespace-nowrap text-cyan-400">{t('landing.hero.titleHighlight')}</span>
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            {t('landing.hero.subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-lg bg-cyan-500 px-6 py-3 font-medium text-white hover:bg-cyan-600"
            >
              {t('landing.hero.ctaDashboard')}
            </Link>
            <a
              href="#planes"
              className="rounded-lg border border-slate-600 bg-slate-800 px-6 py-3 font-medium text-slate-100 hover:bg-slate-700"
            >
              {t('landing.hero.ctaPlans')}
            </a>
          </div>
        </div>
      </section>

      <section id="planes" className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-white">
            {t('landing.plans.title')}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-300">
            {t('landing.plans.subtitle')}
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-6 transition hover:border-cyan-500/40 ${
                  plan.id === 'professional'
                    ? 'border-cyan-500/60 bg-slate-800 shadow-lg shadow-cyan-500/10'
                    : 'border-slate-700 bg-slate-800/90'
                }`}
              >
                {plan.id === 'professional' && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-3 py-0.5 text-xs font-medium text-white">
                    {t('landing.plans.recommended')}
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    {plan.priceLabel ?? `${plan.price}${plan.currency}`}
                  </span>
                  {!plan.priceLabel && <span className="text-slate-300">{t('landing.plans.perMonth')}</span>}
                </div>
                <h3 className="mt-2 text-lg font-semibold text-white">{plan.name}</h3>
                <ul className="mt-6 space-y-3 text-sm text-slate-200">
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-cyan-400" />
                    {plan.lines === -1
                      ? t('landing.plans.linesUnlimited')
                      : `${plan.lines} ${t('landing.plans.lines')}`}
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-cyan-400" />
                    Dashboard {t(planDashboardKey(plan.dashboard))}
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-cyan-400" />
                    {plan.users === -1
                      ? t('landing.plans.usersUnlimited')
                      : `${plan.users} ${t('landing.plans.users')}`}
                  </li>
                  <li className="flex items-center gap-2">
                    <Headphones className="h-4 w-4 text-cyan-400" />
                    {t(planSupportKey(plan.support))}
                  </li>
                  <li className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-cyan-400" />
                    {plan.storage} {t('landing.plans.storage')}
                  </li>
                  {plan.api && (
                    <li className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-cyan-400" />
                      {t(planApiKey(plan.api))}
                    </li>
                  )}
                  {plan.integrations && (
                    <li className="flex items-center gap-2">
                      <Plug className="h-4 w-4 text-cyan-400" />
                      {t('plan.integrations')}
                    </li>
                  )}
                </ul>
                <Link
                  href={`/dashboard?plan=${plan.id}`}
                  className={`mt-6 block w-full rounded-lg py-2.5 text-center text-sm font-medium transition ${
                    plan.id === 'professional'
                      ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                      : 'border border-slate-600 text-slate-100 hover:bg-slate-700'
                  }`}
                >
                  {t('landing.plans.choose')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-4 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-slate-400">
          {t('landing.footer')}
        </div>
      </footer>
    </main>
  )
}
