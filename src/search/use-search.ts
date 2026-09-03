import { useCallback, useEffect, useRef, useState } from 'react'
import type MiniSearch from 'minisearch'
import { SEARCH_INDEX_VERSION, searchOptions, searchQueryOptions } from './search-options.ts'

export interface SearchResult {
  path: string
  url: string
  title: string
  subtitle?: string
  breadcrumb?: string
  kind: 'article' | 'collection' | 'section'
}

type Status = 'idle' | 'loading' | 'ready' | 'error'

/**
 * Carrega o índice sob demanda, na primeira abertura da busca. Não faz sentido
 * cobrar ~7 KB (e crescendo) de quem só veio ler um artigo.
 */
export function useSearch(enabled: boolean) {
  const index = useRef<MiniSearch<SearchResult> | null>(null)
  // O guarda é uma ref, não o próprio `status`: com `status` na lista de
  // dependências, mudar para 'loading' rodaria o cleanup do efeito e cancelaria
  // o carregamento que ele acabou de disparar — a busca ficava presa em
  // 'loading' para sempre.
  const started = useRef(false)
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    if (!enabled || started.current) return
    started.current = true
    let cancelled = false
    setStatus('loading')

    Promise.all([import('minisearch'), fetch('/search-index.json')])
      .then(async ([{ default: MiniSearchClass }, response]) => {
        if (!response.ok) throw new Error(`índice indisponível (${response.status})`)
        const payload = (await response.json()) as { version: number; index: unknown }
        if (payload.version !== SEARCH_INDEX_VERSION) {
          throw new Error('índice de busca desatualizado')
        }
        if (cancelled) return
        index.current = MiniSearchClass.loadJS(
          payload.index as never,
          searchOptions as never
        ) as MiniSearch<SearchResult>
        setStatus('ready')
      })
      .catch((error: unknown) => {
        console.error('[busca]', error)
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [enabled])

  const search = useCallback((query: string): SearchResult[] => {
    const trimmed = query.trim()
    if (!index.current || trimmed.length < 2) return []
    return index.current.search(trimmed, searchQueryOptions as never).slice(0, 8) as never
  }, [])

  return { status, search }
}
