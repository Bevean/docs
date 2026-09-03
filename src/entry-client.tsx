import { StrictMode } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './app'
import { ThemeEffect } from './app/theme-effect.tsx'
import { preloadRouteContent } from './content/content-repository.ts'
import './globals.css'

const container = document.getElementById('root')
if (!container) throw new Error('#root não encontrado')

const tree = (
  <StrictMode>
    <>
      <ThemeEffect />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </>
  </StrictMode>
)

// O corpo do artigo é um chunk separado, e o primeiro render precisa dele em
// mãos: suspender durante a hidratação descartaria o HTML pré-renderizado e
// trocaria o artigo por um esqueleto na primeira visita.
await preloadRouteContent(window.location.pathname)

// Páginas pré-renderizadas hidratam; um dev server sem prerender monta do zero.
if (container.hasChildNodes()) {
  hydrateRoot(container, tree)
} else {
  createRoot(container).render(tree)
}
