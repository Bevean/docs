import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { App } from './app'
import { ThemeEffect } from './app/theme-effect.tsx'

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
