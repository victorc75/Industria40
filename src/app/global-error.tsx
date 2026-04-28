'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-slate-900 font-sans text-white antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="max-w-md rounded-xl border border-slate-700 bg-slate-800 p-6 text-center">
            <h1 className="text-xl font-bold">Error crítico</h1>
            <p className="mt-2 text-sm text-slate-400">
              {error.message || 'Algo ha fallado. Prueba a recargar la página.'}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600"
            >
              Reintentar
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
