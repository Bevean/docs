import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { App } from './app'
import { ThemeEffect } from './app/theme-effect.tsx'
import { preloadRouteContent } from './content/content-repository.ts'

/**
 * Aquece o cache do conteúdo da rota. `renderToString` é síncrono, então o
 * corpo do artigo tem que estar carregado ANTES — suspender no meio de um
 * render síncrono é erro do React, não espera.
 *
 * Precisa morar aqui, e não no prerender: o bundle SSR tem a sua própria
 * instância do repositório, e é o cache dela que precisa estar quente.
 */
export async function prepare(url: string): Promise<void> {
  await preloadRouteContent(url)
}

/** Renderiza uma rota para HTML. Chamado pelo scripts/prerender.ts, em Node. */
export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <>
        <ThemeEffect />
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </>
    </StrictMode>
  )
}
