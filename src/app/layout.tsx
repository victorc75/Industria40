import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Industria40 | OEE y eficiencia de producción',
  description: 'SaaS para control de eficiencia de líneas de producción. OEE, Disponibilidad, Rendimiento y Calidad.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans antialiased min-h-screen gradient-mesh`}>
        {children}
      </body>
    </html>
  )
}
