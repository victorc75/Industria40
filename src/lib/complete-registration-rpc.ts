import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Lógica compartida de RPC Postgres para alta de organización o unión por código.
 *
 * Ejecutable con cualquier `SupabaseClient` que lleve JWT de usuario (browser
 * tras signUp, o servidor tras getUser). Los RPC son `SECURITY DEFINER` y usan
 * `auth.uid()` en la base de datos.
 */
export type CompleteRegistrationResult = { ok: true } | { ok: false; error: string }

/**
 * Crea organización o une por código usando el cliente Supabase (JWT en la petición).
 * Útil justo después de signUp en el navegador, cuando las cookies aún no llegan al Server Action.
 */
export async function runCompleteRegistrationRpc(
  supabase: SupabaseClient,
  orgCode: string,
  orgName: string | null,
  createNew: boolean
): Promise<CompleteRegistrationResult> {
  const code = (orgCode || '').trim()
  if (code.length < 4 || code.length > 32) {
    return { ok: false, error: 'El código debe tener entre 4 y 32 caracteres.' }
  }

  if (createNew) {
    const name = (orgName || '').trim() || 'Mi empresa'
    const { data, error } = await supabase.rpc('create_organization_for_user', {
      p_org_code: code,
      p_org_name: name,
    })
    if (error) {
      const msg =
        error.message?.includes('ya existe') || error.code === '23505'
          ? 'Ese código de organización ya existe. Elige otro o únete con ese código.'
          : error.message || 'Error al crear la organización.'
      return { ok: false, error: msg }
    }
    if (!data) return { ok: false, error: 'No se pudo crear la organización.' }
    return { ok: true }
  }

  const { data, error } = await supabase.rpc('join_organization', { p_org_code: code })
  if (error) {
    const msg =
      error.message?.includes('límite') || error.message?.includes('limit')
        ? error.message
        : error.message?.includes('No existe')
          ? 'No hay ninguna organización con ese código. Comprueba el código o marca "Crear nueva organización".'
          : error.message || 'Error al unirte a la organización.'
    return { ok: false, error: msg }
  }
  if (!data) return { ok: false, error: 'No se pudo completar el registro.' }
  return { ok: true }
}
