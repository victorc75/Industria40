'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import { runCompleteRegistrationRpc } from '@/lib/complete-registration-rpc'
import { useLanguage } from '@/lib/i18n/LanguageContext'

/**
 * Registro: `signUp` en cliente; si hay sesión inmediata, RPC de organización en el
 * mismo cliente (evita desfase de cookies con Server Actions). Sin sesión (confirmación
 * email), guarda datos de org en `localStorage` y muestra flujo de verificación.
 */
const PENDING_ORG_CODE = 'pending_org_code'
const PENDING_ORG_NAME = 'pending_org_name'
const PENDING_CREATE_NEW = 'pending_create_new'

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgCode, setOrgCode] = useState('')
  const [orgName, setOrgName] = useState('')
  const [createNew, setCreateNew] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback` },
    })
    if (signUpError) {
      setLoading(false)
      setError(signUpError.message)
      return
    }

    // Con sesión: el RPC debe ir con el JWT del navegador. El Server Action a menudo no ve aún las cookies.
    if (data?.session) {
      const result = await runCompleteRegistrationRpc(
        supabase,
        orgCode.trim(),
        orgName.trim() || null,
        createNew
      )
      setLoading(false)
      if (result.ok) {
        router.push('/dashboard')
        router.refresh()
        return
      }
      setError(result.error)
      return
    }

    // Usuario creado pero sin sesión (p. ej. Supabase exige confirmar el correo): guardar org pendiente
    if (data?.user) {
      setLoading(false)
      if (typeof window !== 'undefined') {
        localStorage.setItem(PENDING_ORG_CODE, orgCode.trim())
        localStorage.setItem(PENDING_ORG_NAME, orgName.trim())
        localStorage.setItem(PENDING_CREATE_NEW, createNew ? '1' : '0')
      }
      setSuccess(true)
      router.refresh()
      return
    }

    setLoading(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(PENDING_ORG_CODE, orgCode.trim())
      localStorage.setItem(PENDING_ORG_NAME, orgName.trim())
      localStorage.setItem(PENDING_CREATE_NEW, createNew ? '1' : '0')
    }
    setSuccess(true)
    router.refresh()
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold text-white">{t('register.successTitle')}</h1>
          <p className="mt-2 text-slate-400">
            {t('register.successMessage')} <strong className="text-slate-200">{email}</strong>.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            {t('register.successCode')}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {t('register.spam')}
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600"
          >
            {t('register.goLogin')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> {t('nav.back')}
        </Link>
        <h1 className="text-2xl font-bold text-white">{t('register.title')}</h1>
        <p className="mt-1 text-sm text-slate-400">
          {t('register.subtitle')}
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              {t('register.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="tu@empresa.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              {t('register.password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label htmlFor="orgCode" className="block text-sm font-medium text-slate-300">
              {t('register.orgCode')}
            </label>
            <input
              id="orgCode"
              type="text"
              value={orgCode}
              onChange={(e) => setOrgCode(e.target.value)}
              required
              minLength={4}
              maxLength={32}
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="Ej: miempresa2024"
            />
            <p className="mt-1 text-xs text-slate-500">
              {t('register.orgCodeHint')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="createNew"
              type="checkbox"
              checked={createNew}
              onChange={(e) => setCreateNew(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
            />
            <label htmlFor="createNew" className="text-sm text-slate-300">
              {t('register.createNew')}
            </label>
          </div>
          {createNew && (
            <div>
              <label htmlFor="orgName" className="block text-sm font-medium text-slate-300">
                {t('register.orgName')}
              </label>
              <input
                id="orgName"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder={t('register.orgNamePlaceholder')}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          )}
          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 py-2.5 font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
          >
            {loading ? t('register.submitting') : t('register.submit')}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          {t('register.hasAccount')}
          <Link href="/login" className="text-cyan-400 hover:underline">
            {t('login.title')}
          </Link>
        </p>
      </div>
    </div>
  )
}
