import { StrictMode } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './app'
import { ThemeEffect } from './app/theme-effect.tsx'
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

// Páginas pré-renderizadas hidratam; um dev server sem prerender monta do zero.
if (container.hasChildNodes()) {
  hydrateRoot(container, tree)
} else {
  createRoot(container).render(tree)
}
