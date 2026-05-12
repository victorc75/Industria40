'use server'

/**
 * Acciones de servidor relacionadas con el registro post-login.
 *
 * `completeRegistration`: requiere sesión en cookies (p. ej. página
 * `/auth/complete-registration`). La creación justo tras `signUp` en el
 * navegador usa `runCompleteRegistrationRpc` con el cliente browser — ver
 * `register/page.tsx` y `docs/FUNCIONAMIENTO.md` §4.
 */
import { createClient } from '@/lib/supabase/server'
import {
  runCompleteRegistrationRpc,
  type CompleteRegistrationResult,
} from '@/lib/complete-registration-rpc'

export type { CompleteRegistrationResult }

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

  return runCompleteRegistrationRpc(supabase, orgCode, orgName, createNew)
}
