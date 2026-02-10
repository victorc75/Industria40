import Link from 'next/link'
import { Zap, BarChart3, Users, Headphones, Database, Code2, Plug } from 'lucide-react'
import { PLANS } from '@/lib/types'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="text-xl font-bold tracking-tight text-white">
            Industria<span className="text-cyan-400">40</span>
          </span>
          <nav className="flex items-center gap-6">
            <a href="#planes" className="text-sm text-slate-200 hover:text-white">
              Planes
            </a>
            <Link
              href="/dashboard"
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600"
            >
              Ver dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-800/50 px-4 py-20 md:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Controla la eficiencia de tus{' '}
              <span className="text-cyan-400">líneas de producción</span>
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              KPIs en tiempo real: OEE, Disponibilidad, Rendimiento y Calidad. 
              Dashboards y gráficas para tomar mejores decisiones.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/dashboard"
                className="rounded-lg bg-cyan-500 px-6 py-3 font-medium text-white hover:bg-cyan-600"
              >
                Acceder al dashboard
              </Link>
              <a
                href="#planes"
                className="rounded-lg border border-slate-600 bg-slate-800 px-6 py-3 font-medium text-slate-100 hover:bg-slate-700"
              >
                Ver planes
              </a>
            </div>
          </div>
        </section>

        <section id="planes" className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold text-white">
              Planes Industria40
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-slate-300">
              Elige el plan que se adapte al tamaño de tu planta y usuarios.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {PLANS.map((plan, idx) => (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-6 transition hover:border-cyan-500/40 ${
                    plan.id === 'professional'
                      ? 'border-cyan-500/60 bg-slate-800 shadow-lg shadow-cyan-500/10'
                      : 'border-slate-700 bg-slate-800/90'
                  }`}
                >
                  {plan.id === 'professional' && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-3 py-0.5 text-xs font-medium text-white">
                      Recomendado
                    </span>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-300">{plan.currency}/mes</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-white">{plan.name}</h3>
                  <ul className="mt-6 space-y-3 text-sm text-slate-200">
                    <li className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-cyan-400" />
                      {plan.lines === -1 ? 'Liñas ilimitadas' : `${plan.lines} liñas de produción`}
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-cyan-400" />
                      Dashboard {plan.dashboard}
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-cyan-400" />
                      {plan.users === -1 ? 'Usuarios ilimitados' : `${plan.users} usuarios`}
                    </li>
                    <li className="flex items-center gap-2">
                      <Headphones className="h-4 w-4 text-cyan-400" />
                      {plan.support}
                    </li>
                    <li className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-cyan-400" />
                      {plan.storage} almacenamento
                    </li>
                    {plan.api && (
                      <li className="flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-cyan-400" />
                        {plan.api}
                      </li>
                    )}
                    {plan.integrations && (
                      <li className="flex items-center gap-2">
                        <Plug className="h-4 w-4 text-cyan-400" />
                        {plan.integrations}
                      </li>
                    )}
                  </ul>
                  <Link
                    href={`/dashboard?plan=${plan.id}`}
                    className={`mt-6 block w-full rounded-lg py-2.5 text-center text-sm font-medium transition ${
                      plan.id === 'professional'
                        ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                        : 'border border-slate-600 text-slate-100 hover:bg-slate-700'
                    }`}
                  >
                    Elegir plan
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-800 px-4 py-8">
          <div className="mx-auto max-w-6xl text-center text-sm text-slate-400">
            Industria40 — Modelo SaaS. OEE, Disponibilidad, Rendimiento, Calidad.
          </div>
        </footer>
      </main>
    </div>
  )
}
