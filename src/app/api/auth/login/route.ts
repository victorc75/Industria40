import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
      'No se pudo conectar con Supabase (la respuesta no era JSON). ' +
      'En Vercel → Settings → Environment Variables, revisa NEXT_PUBLIC_SUPABASE_URL (https://…supabase.co) y NEXT_PUBLIC_SUPABASE_ANON_KEY; ' +
      'deben coincidir con Supabase → Settings → API. Tras cambiarlas, vuelve a desplegar.'
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  const origin = request.nextUrl.origin

  if (!supabaseUrl || !supabaseAnonKey) {
    return loginErrorRedirect(
      origin,
      'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno de despliegue (Vercel).'
    )
  }

  let response = NextResponse.redirect(new URL(next, origin), { status: 303 })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
