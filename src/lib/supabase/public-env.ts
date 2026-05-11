/** Quita espacios y comillas típicas al pegar en Vercel. */
function trimEnvValue(value: string | undefined): string | undefined {
  if (value == null) return undefined
  let v = value.trim()
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim()
  }
  return v || undefined
}

/** URL del proyecto (Settings → API / Connect). Sin barra final. */
export function getSupabaseUrl(): string | undefined {
  const raw = trimEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL)
  if (!raw) return undefined
  return raw.replace(/\/+$/, '')
}

/**
 * Clave pública del cliente: JWT `anon` (legacy) o `sb_publishable_*` (dashboard nuevo).
 * En Vercel puedes definir cualquiera de las dos variables.
 */
export function getSupabasePublishableKey(): string | undefined {
  const anon = trimEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const publishable = trimEnvValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  return anon || publishable || undefined
}

export function looksLikeSupabaseClientKey(key: string): boolean {
  return key.startsWith('eyJ') || key.startsWith('sb_publishable_')
}
