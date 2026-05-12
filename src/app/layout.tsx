/**
 * Layout raíz de la aplicación (App Router).
 *
 * Define metadata, fuente Inter (`next/font`), estilos globales, `LanguageProvider`
 * para i18n y un script `beforeInteractive` que mitiga avisos de preload en Chrome
 * (CSS y fuentes). Todas las rutas se renderizan bajo este árbol.
 */
import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'

// Sin <link rel="preload"> de la fuente: evita el aviso de Chrome "preloaded … was not used"
const inter = Inter({ subsets: ['latin'], variable: '--font-sans', preload: false })

export const metadata: Metadata = {
  title: 'Industria40 | OEE y eficiencia de producción',
  description: 'SaaS para control de eficiencia de líneas de producción. OEE, Disponibilidad, Rendimiento y Calidad.',
  icons: { icon: '/favicon.ico' },
}

// 1) layout.css: preload → stylesheet (evita aviso en consola).
// 2) Fuentes .woff2: quitar <link rel="preload" as="font">; la carga sigue vía @font-face del CSS de next/font.
const usePreloadCssScript = `
(function(){
  function apply() {
    try {
      var links = document.querySelectorAll('link[rel="preload"][href*="layout.css"]');
      for (var i = 0; i < links.length; i++) {
        links[i].rel = 'stylesheet';
        if (!links[i].getAttribute('as')) links[i].setAttribute('as', 'style');
      }
      var fonts = document.querySelectorAll('link[rel="preload"][as="font"][href*="/_next/static/media/"]');
      for (var j = 0; j < fonts.length; j++) {
        fonts[j].parentNode && fonts[j].parentNode.removeChild(fonts[j]);
      }
    } catch (e) {}
  }
  apply();
  if (document.readyState !== 'complete') document.addEventListener('DOMContentLoaded', apply);
  try {
    var head = document.head;
    if (head) {
      var mo = new MutationObserver(apply);
      mo.observe(head, { childList: true, subtree: true });
      setTimeout(function() { mo.disconnect(); }, 8000);
    }
  } catch (e2) {}
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
