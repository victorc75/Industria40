'use client'

import { useState } from 'react'
import { Globe } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { locales, type Locale } from '@/lib/i18n/translations'

export function LanguageSelector() {
  const { locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
        title="Idioma"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Seleccionar idioma"
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="min-w-[4rem] text-left">
          {locales.find((l) => l.value === locale)?.label ?? locale}
        </span>
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="absolute right-0 top-full z-20 mt-1 min-w-[8rem] rounded-lg border border-slate-600 bg-slate-800 py-1 shadow-lg"
          >
            {locales.map((opt) => (
              <li key={opt.value} role="option" aria-selected={locale === opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    setLocale(opt.value as Locale)
                    setOpen(false)
                  }}
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-700 ${
                    locale === opt.value ? 'bg-slate-700/80 text-cyan-300' : 'text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
