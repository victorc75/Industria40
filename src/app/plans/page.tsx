import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PlansContent } from '@/components/PlansContent'

export default async function PlansPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/plans')
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <PlansContent />
    </div>
  )
}
