import { useEffect, useRef, useState } from 'react'
import { FileText, Folder, Search } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useSearch, type SearchResult } from './use-search.ts'

const ICONS = { article: FileText, collection: Folder, section: Folder } as const

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const navigate = useNavigate()
  const { status, search } = useSearch(open)
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)

  const results = status === 'ready' ? search(query) : []

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    // showModal dá foco preso e fechamento por Esc sem uma linha de JS.
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  const go = (result: SearchResult) => {
    onClose()
    setQuery('')
    navigate(result.url)
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-label="Buscar na Central de Ajuda"
      className="m-0 w-full max-w-xl rounded-xl border border-border bg-card p-0 text-foreground shadow-lg backdrop:bg-black/40 sm:mx-auto sm:mt-[12vh]"
      onClick={(event) => {
        if (event.target === dialog.current) onClose()
      }}
    >
      <div className="flex items-center gap-3 border-b border-border px-4">
        <Search aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        <input
          autoFocus
          type="search"
          value={query}
          placeholder="Pesquisar artigos…"
          aria-label="Termo de busca"
          className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          onChange={(event) => {
            setQuery(event.target.value)
            // Resetado aqui, e não num efeito sobre `query`: setState dentro de
            // efeito encadeia um render a mais a cada tecla digitada.
            setHighlighted(0)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setHighlighted((h) => Math.min(h + 1, results.length - 1))
            } else if (event.key === 'ArrowUp') {
              event.preventDefault()
              setHighlighted((h) => Math.max(h - 1, 0))
            } else if (event.key === 'Enter' && results[highlighted]) {
              event.preventDefault()
              go(results[highlighted])
            }
          }}
        />
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-2">
        <p aria-live="polite" className="sr-only">
          {query.trim().length < 2
            ? ''
            : `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}`}
        </p>

        {status === 'error' && (
          <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">
            Não foi possível carregar a busca. Recarregue a página.
          </p>
        )}

        {status !== 'error' && query.trim().length < 2 && (
          <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">
            Digite ao menos duas letras para buscar.
          </p>
        )}

        {status === 'ready' && query.trim().length >= 2 && results.length === 0 && (
          <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">
            Nenhum artigo encontrado para “{query.trim()}”.
          </p>
        )}

        <ul>
          {results.map((result, i) => {
            const Icon = ICONS[result.kind]
            return (
              <li key={result.path}>
                <button
                  type="button"
                  onClick={() => go(result)}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left ${
                    i === highlighted ? 'bg-muted' : ''
                  }`}
                >
                  <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium">{result.title}</span>
                    {result.breadcrumb && (
                      <span className="block truncate text-[12px] text-muted-foreground">
                        {result.breadcrumb}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </dialog>
  )
}
