/**
 * Cliente Supabase para el navegador (componentes `'use client'`).
 *
 * Usa cookies gestionadas por `@supabase/ssr`. Tras `signUp`/`signIn`, la sesión
 * debe estar aquí antes de que un Server Action pueda leerla en el servidor.
 */
import { createBrowserClient } from '@supabase/ssr'
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/public-env'

export function createClient() {
  const url = getSupabaseUrl()
  const key = getSupabasePublishableKey()
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  }
  return createBrowserClient(url, key)
}
