/**
 * Landing pública: cabecera y contenido (planes, CTA a login/dashboard).
 */
import { LandingHeader } from '@/components/LandingHeader'
import { LandingContent } from '@/components/LandingContent'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />

      <LandingContent />
    </div>
  )
}
