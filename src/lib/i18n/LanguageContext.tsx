'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { Locale } from '@/lib/i18n/translations'
import { t as tFn } from '@/lib/i18n/translations'

const STORAGE_KEY = 'industria40-locale'

const defaultLocale: Locale = 'es'

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
  if (stored === 'gl' || stored === 'es' || stored === 'en') return stored
  return defaultLocale
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setLocaleState(getStoredLocale())
    setMounted(true)
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLocale)
      document.documentElement.lang = newLocale === 'gl' ? 'gl' : newLocale === 'en' ? 'en' : 'es'
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.lang = locale === 'gl' ? 'gl' : locale === 'en' ? 'en' : 'es'
  }, [mounted, locale])

  const t = useCallback((key: string) => tFn(locale, key), [locale])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    return {
      locale: defaultLocale,
      setLocale: () => {},
      t: (key: string) => key,
    }
  }
  return ctx
}
