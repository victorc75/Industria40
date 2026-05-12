/**
 * Cliente Supabase para Server Components, Server Actions y Route Handlers.
 *
 * Lee/escribe cookies de sesión vía `next/headers`. Si `setAll` falla (p. ej.
 * llamada desde un Server Component sin mutable cookies), el middleware puede
 * volver a sincronizar la sesión en la siguiente petición.
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/public-env'

export async function createClient() {
  const cookieStore = await cookies()
  const url = getSupabaseUrl()
  const key = getSupabasePublishableKey()
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  }

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Llamado desde Server Component; el middleware refresca la sesión
          }
        },
      },
    }
  )
}
