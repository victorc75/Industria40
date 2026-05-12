/**
 * Middleware global de Next.js.
 *
 * Delega en `updateSession` (Supabase SSR): refresca la sesión en cada petición y
 * aplica reglas de navegación (p. ej. /dashboard solo si hay usuario; /login y
 * /register redirigen al dashboard si ya hay sesión).
 *
 * El `matcher` excluye estáticos de Next, favicon e imágenes para no añadir latencia.
 */
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
