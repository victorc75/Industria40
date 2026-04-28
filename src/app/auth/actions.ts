'use server'

import { createClient } from '@/lib/supabase/server'

export type CompleteRegistrationResult = { ok: true } | { ok: false; error: string }

/**
 * Crea una nueva organización (con código y nombre) o une al usuario a una existente por código.
 * Respetando límites del plan: Basic 1, Professional 5, Enterprise ilimitados.
 */
export async function completeRegistration(
  orgCode: string,
  orgName: string | null,
  createNew: boolean
): Promise<CompleteRegistrationResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: 'No has iniciado sesión.' }
  }

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
