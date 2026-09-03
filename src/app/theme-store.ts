export type Theme = 'system' | 'light' | 'dark'

/** Precisa bater com a chave lida pelo script inline do index.html. */
const STORAGE_KEY = 'bevean-docs-theme'

const listeners = new Set<() => void>()

function read(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  } catch {
    // Navegação privada ou storage bloqueado.
    return 'system'
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  // `storage` cobre a mudança feita em outra aba do mesmo site.
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

export const getSnapshot = read

/**
 * No HTML pré-renderizado ninguém sabe a escolha do leitor. Devolver 'system'
 * aqui é o que evita o mismatch de hidratação: o React usa este snapshot no
 * primeiro render e troca para o real logo depois.
 */
export function getServerSnapshot(): Theme {
  return 'system'
}

export function writeTheme(theme: Theme): void {
  try {
    if (theme === 'system') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Sem storage o tema vale só nesta sessão.
  }
  for (const listener of listeners) listener()
}

export function applyTheme(theme: Theme): void {
  const dark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
}
