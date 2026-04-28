'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { completeRegistration } from '@/app/auth/actions'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const PENDING_ORG_CODE = 'pending_org_code'
const PENDING_ORG_NAME = 'pending_org_name'
const PENDING_CREATE_NEW = 'pending_create_new'

export default function CompleteRegistrationPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [orgCode, setOrgCode] = useState('')
  const [orgName, setOrgName] = useState('')
  const [createNew, setCreateNew] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const code = localStorage.getItem(PENDING_ORG_CODE)
    const name = localStorage.getItem(PENDING_ORG_NAME)
    const create = localStorage.getItem(PENDING_CREATE_NEW) === '1'
    if (code) setOrgCode(code)
    if (name) setOrgName(name)
    setCreateNew(create)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await completeRegistration(orgCode, orgName || null, createNew)
    setLoading(false)
    if (result.ok) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(PENDING_ORG_CODE)
        localStorage.removeItem(PENDING_ORG_NAME)
        localStorage.removeItem(PENDING_CREATE_NEW)
      }
      router.push('/dashboard')
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> {t('nav.backShort')}
        </Link>
        <h1 className="text-2xl font-bold text-white">{t('complete.title')}</h1>
        <p className="mt-1 text-sm text-slate-400">
          {t('complete.subtitle')}
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              placeholder="Ej: miempresa2024"
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              {t('complete.orgCodeHint')}
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
              {t('complete.createNew')}
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
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 py-2.5 font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
          >
            {loading ? t('complete.completing') : t('complete.continue')}
          </button>
        </form>
      </div>
    </div>
  )
}
