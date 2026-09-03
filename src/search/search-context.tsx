import { createContext, use } from 'react'

/**
 * A busca vive uma vez só, no layout. Sem isso a home montava um segundo
 * <dialog> por cima do primeiro — dois índices carregados, dois campos com o
 * mesmo rótulo no DOM.
 */
export const SearchContext = createContext<(() => void) | null>(null)

export function useOpenSearch(): () => void {
  const open = use(SearchContext)
  if (!open) throw new Error('useOpenSearch usado fora do RootLayout')
  return open
}
