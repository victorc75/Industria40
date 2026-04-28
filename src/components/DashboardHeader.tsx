'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, LayoutDashboard, LogOut, UserPlus, Copy, Check } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { LanguageSelector } from '@/components/LanguageSelector'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface DashboardHeaderProps {
  planName: string
  linesLabel: string
  organizationName?: string
  organizationCode?: string
  isOwner?: boolean
}

export function DashboardHeader({
  planName,
  linesLabel,
  organizationName,
  organizationCode,
  isOwner,
}: DashboardHeaderProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function copyCode() {
    if (!organizationCode) return
    await navigator.clipboard.writeText(organizationCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> {t('nav.home')}
          </Link>
          <span className="text-slate-500">|</span>
          <span className="flex items-center gap-2 text-sm font-medium text-white">
            <LayoutDashboard className="h-4 w-4 text-cyan-400" />
            {organizationName ? (
              <>Dashboard — {organizationName}</>
            ) : (
              <>Dashboard — Plan {planName}</>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          {isOwner && organizationCode && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCode((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                title={t('dashboard.inviteUsers')}
              >
                <UserPlus className="h-3.5 w-3.5" /> {t('dashboard.inviteUsers')}
              </button>
              {showCode && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    aria-hidden
                    onClick={() => setShowCode(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 w-64 rounded-lg border border-slate-600 bg-slate-800 p-3 shadow-lg">
                    <p className="text-xs text-slate-400">
                      {t('dashboard.inviteCodeTitle')}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="flex-1 rounded bg-slate-900 px-2 py-1.5 text-sm text-cyan-300">
                        {organizationCode}
                      </code>
                      <button
                        type="button"
                        onClick={copyCode}
                        className="flex items-center gap-1 rounded bg-cyan-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-cyan-500"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? t('dashboard.copied') : t('dashboard.copy')}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <span className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-100">
            {linesLabel}
          </span>
          {user?.email && (
            <span className="hidden text-sm text-slate-400 sm:inline">{user.email}</span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
          >
            <LogOut className="h-3.5 w-3.5" /> {t('nav.logout')}
          </button>
        </div>
      </div>
    </header>
  )
}
