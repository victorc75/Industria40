import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  looksLikeSupabaseClientKey,
} from '@/lib/supabase/public-env'

/** Comprueba que la URL y la clave apunten al Auth API real (JSON), no a HTML (404, proxy, URL mal). */
async function verifySupabaseAuthReachable(url: string, apiKey: string): Promise<string | null> {
  const healthUrl = `${url}/auth/v1/health`
  try {
    const res = await fetch(healthUrl, {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    })
    const text = await res.text()
    const jsonLike = text.trimStart().startsWith('{')
    if (!jsonLike) {
      return (
        `La URL de Supabase no responde como Auth API (HTTP ${res.status}). ` +
        `Comprueba en Vercel que NEXT_PUBLIC_SUPABASE_URL sea exactamente la de tu proyecto ` +
        `(https://…supabase.co en Supabase → Connect), sin barra al final ni texto extra, ` +
        `y que NEXT_PUBLIC_SUPABASE_ANON_KEY sea la clave anon del mismo proyecto (API Keys → legacy anon). ` +
        `En Vercel, las variables deben estar en el entorno Production y hace falta redeploy.`
      )
    }
    return null
  } catch {
    return (
      'No se alcanzó Supabase (timeout o error de red). Comprueba NEXT_PUBLIC_SUPABASE_URL y el estado del proyecto en el dashboard de Supabase.'
    )
  }
}

function loginErrorRedirect(origin: string, message: string) {
  return NextResponse.redirect(new URL('/login?error=' + encodeURIComponent(message), origin), { status: 303 })
}

/** Supabase client recibió HTML (404, proxy, URL mal) y falló el parseo JSON. */
function isSupabaseHtmlResponseError(message: string): boolean {
  return (
    message.includes('<!DOCTYPE') ||
    message.includes("Unexpected token '<'") ||
    (message.includes('Unexpected token') && message.includes('DOCTYPE'))
  )
}

function mapAuthErrorForUser(message: string): string {
  if (message === 'Invalid login credentials') {
    return 'Email o contraseña incorrectos.'
  }
  if (isSupabaseHtmlResponseError(message)) {
    return (
      'No se pudo conectar con Supabase (el servidor devolvió HTML en lugar de JSON). ' +
      '1) En Vercel, comprueba que NEXT_PUBLIC_SUPABASE_URL sea exactamente la del mismo proyecto (p. ej. https://xxxx.supabase.co en Supabase → Connect). ' +
      '2) Si solo tienes clave sb_publishable_, prueba a añadir también la clave anon (JWT largo) en NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase → Project Settings → API Keys → pestaña «Legacy anon / service_role». ' +
      '3) Redeploy tras guardar variables.'
    )
  }
  return message
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const next = (formData.get('next') as string) || '/dashboard'

  if (!email || !password) {
    return NextResponse.redirect(
      new URL('/login?error=' + encodeURIComponent('Email y contraseña requeridos'), request.url),
      { status: 303 }
    )
  }

  const supabaseUrl = getSupabaseUrl()
  const supabaseKey = getSupabasePublishableKey()
  const origin = request.nextUrl.origin

  if (!supabaseUrl || !supabaseKey) {
    return loginErrorRedirect(
      origin,
      'Faltan variables en Vercel: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY). Actívalas en el entorno Production y haz redeploy.'
    )
  }

  if (!supabaseUrl.startsWith('https://')) {
    return loginErrorRedirect(
      origin,
      'NEXT_PUBLIC_SUPABASE_URL debe empezar por https:// (copia la URL del proyecto desde Supabase → Connect).'
    )
  }

  if (!looksLikeSupabaseClientKey(supabaseKey)) {
    return loginErrorRedirect(
      origin,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY no tiene el formato esperado (debe ser un JWT que empiece por eyJ… o una clave sb_publishable_…). Revisa que no sea la service_role ni un valor corto erróneo.'
    )
  }

  const probeError = await verifySupabaseAuthReachable(supabaseUrl, supabaseKey)
  if (probeError) {
    return loginErrorRedirect(origin, probeError)
  }

  let response = NextResponse.redirect(new URL(next, origin), { status: 303 })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return loginErrorRedirect(origin, mapAuthErrorForUser(error.message))
  }

  return response
}
