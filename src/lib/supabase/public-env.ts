/** URL del proyecto (Settings → API / Connect). */
export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined
}

/**
 * Clave pública del cliente: JWT `anon` (legacy) o `sb_publishable_*` (dashboard nuevo).
 * En Vercel puedes definir cualquiera de las dos variables.
 */
export function getSupabasePublishableKey(): string | undefined {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  return anon || publishable || undefined
}
