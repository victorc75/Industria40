import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ensureProfileAndOrg, getLines, getKpiHistoryForLine, getLatestKpisForLines, getLineKpisFromEnabledMachines, updateOrganizationPlan } from '@/lib/db/queries'
import { DashboardClient } from '@/components/DashboardClient'
import type { PlanId } from '@/lib/types'
import type { KpiHistoryPoint } from '@/lib/types'

const VALID_PLAN_IDS: PlanId[] = ['basic', 'professional', 'enterprise']

export default async function DashboardPage(props: {
  searchParams?: Promise<{ plan?: string }> | { plan?: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard')
  }

  const profileAndOrg = await ensureProfileAndOrg(user.id)
  if (!profileAndOrg) {
    redirect('/auth/complete-registration')
  }

  const { organization } = profileAndOrg

  const rawParams = props.searchParams ?? {}
  const searchParams = typeof (rawParams as Promise<{ plan?: string }>).then === 'function'
    ? await (rawParams as Promise<{ plan?: string }>)
    : (rawParams as { plan?: string })
  const planParam = searchParams?.plan
  if (planParam && VALID_PLAN_IDS.includes(planParam as PlanId)) {
    await updateOrganizationPlan(organization.id, planParam as PlanId)
    redirect('/dashboard')
  }
  const lines = await getLines(organization.id)
  const lineIds = lines.map((l) => l.id)

  const kpiHistoryByLineAndShiftEntries = await Promise.all(
    lines.flatMap((l) =>
      ([1, 2, 3] as const).map(async (shift) => {
        const raw = await getKpiHistoryForLine(l.id, 14, shift)
        const history: KpiHistoryPoint[] = raw.map((s) => ({
          date: s.date,
          oee: Number(s.oee),
          disponibilidad: Number(s.disponibilidad),
          rendimiento: Number(s.rendimiento),
          calidad: Number(s.calidad),
        }))
        return [`${l.id}-${shift}`, history] as const
      })
    )
  )
  const kpiHistoryByLineAndShift: Record<string, KpiHistoryPoint[]> = {}
  kpiHistoryByLineAndShiftEntries.forEach(([key, history]) => { kpiHistoryByLineAndShift[key] = history })

  const latestKpisMap = await getLatestKpisForLines(lineIds)
  const latestKpisByLineId: Record<string, { oee: number; disponibilidad: number; rendimiento: number; calidad: number }> = {}
  latestKpisMap.forEach((v, k) => { latestKpisByLineId[k] = v })

  const lineKpisFromMachinesEntries = await Promise.all(
    lines.map(async (l) => [l.id, await getLineKpisFromEnabledMachines(l.id, l)] as const)
  )
  const lineKpisFromMachinesByLineId: Record<string, { oee: number; disponibilidad: number; rendimiento: number; calidad: number } | null> = {}
  lineKpisFromMachinesEntries.forEach(([id, kpis]) => { lineKpisFromMachinesByLineId[id] = kpis })

  return (
    <DashboardClient
      planId={organization.plan_id as PlanId}
      lines={lines}
      organizationName={organization.name}
      organizationCode={organization.organization_code}
      isOwner={profileAndOrg.profile.role === 'owner'}
      trialEndsAt={organization.trial_ends_at ?? undefined}
      kpiHistoryByLineAndShift={kpiHistoryByLineAndShift}
      latestKpisByLineId={latestKpisByLineId}
      lineKpisFromMachinesByLineId={lineKpisFromMachinesByLineId}
    />
  )
}
