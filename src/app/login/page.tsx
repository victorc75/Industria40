'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

function LoginFormInner() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'
  const errorParam = searchParams.get('error')
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> {t('nav.back')}
        </Link>
        <h1 className="text-2xl font-bold text-white">{t('login.title')}</h1>
        <p className="mt-1 text-sm text-slate-400">
          {t('login.subtitle')}
        </p>
        <form
          action="/api/auth/login"
          method="post"
          className="mt-6 space-y-4"
          onSubmit={() => setLoading(true)}
        >
          <input type="hidden" name="next" value={redirect} />
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              {t('login.email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="tu@empresa.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              {t('login.password')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          {errorParam && (
            <div className="rounded-lg bg-amber-500/10 px-3 py-3 text-sm text-amber-200">
              {errorParam === 'setup' ? (
                <>
                  <p className="font-medium">{t('login.setupTitle')}</p>
                  <p className="mt-1 text-amber-200/90">
                    {t('login.setupMessage')}
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-0.5 text-amber-200/90">
                    <li><code className="rounded bg-black/20 px-1">001_initial_schema.sql</code></li>
                    <li><code className="rounded bg-black/20 px-1">002_kpi_snapshots.sql</code></li>
                    <li><code className="rounded bg-black/20 px-1">003_create_org_function.sql</code></li>
                  </ul>
                  <p className="mt-2 text-amber-200/90">
                    {t('login.setupInFolder')} <code className="rounded bg-black/20 px-1">supabase/migrations/</code> {t('login.setupOfProject')}
                  </p>
                  <p className="mt-2 text-xs text-amber-200/80">
                    {t('login.setupAlterNote')} <code className="break-all rounded bg-black/20 px-1">ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;</code>
                  </p>
                </>
              ) : (
                decodeURIComponent(errorParam)
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 py-2.5 font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
          >
            {loading ? t('login.entering') : t('login.enter')}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          {t('login.noAccount')}
          <Link href="/register" className="text-cyan-400 hover:underline">
            {t('login.registerLink')}
          </Link>
        </p>
        <p className="mt-8 text-center font-mono text-[10px] text-slate-600" title="Comprueba en GitHub que coincide con el último commit desplegado">
          Build{' '}
          {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
            ? process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.slice(0, 7)
            : 'local'}
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        <LoginLoadingFallback />
      </div>
    }>
      <LoginFormInner />
    </Suspense>
  )
}

function LoginLoadingFallback() {
  const { t } = useLanguage()
  return <>{t('login.loading')}</>
}
