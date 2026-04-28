import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Industria40 | OEE y eficiencia de producción',
  description: 'SaaS para control de eficiencia de líneas de producción. OEE, Disponibilidad, Rendimiento y Calidad.',
}

// Convierte preload de layout.css en stylesheet para evitar el aviso "preloaded but not used"
const usePreloadCssScript = `
(function(){
  function apply() {
    try {
      var links = document.querySelectorAll('link[rel="preload"][href*="layout.css"]');
      for (var i = 0; i < links.length; i++) {
        links[i].rel = 'stylesheet';
        if (!links[i].getAttribute('as')) links[i].setAttribute('as', 'style');
      }
    } catch (e) {}
  }
  apply();
  if (document.readyState !== 'complete') document.addEventListener('DOMContentLoaded', apply);
})();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen gradient-mesh`}>
        <Script
          id="use-preload-css"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: usePreloadCssScript }}
        />
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
