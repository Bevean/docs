import { useCallback, useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router'
import { SearchDialog } from '@/search/search-dialog.tsx'
import { SearchContext } from '@/search/search-context.tsx'
import { BeveanLogo, BeveanMark } from './logo.tsx'
import { ThemeToggle } from './theme-toggle.tsx'

export function RootLayout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { pathname, hash } = useLocation()
  const openSearch = useCallback(() => setSearchOpen(true), [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA'
      if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !typing)) {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Navegação client-side não move o scroll sozinha; sem isso o leitor cai no
  // meio do artigo novo. Âncora tem prioridade sobre o topo.
  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <SearchContext.Provider value={openSearch}>
      <div className="flex min-h-screen flex-col">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Pular para o conteúdo
        </a>

        <header className="sticky top-0 z-40 h-(--header-height) border-b border-border bg-background/85 backdrop-blur">
          <div className="mx-auto flex h-full max-w-6xl items-center gap-3 px-6">
            <Link to="/ajuda" className="flex items-center gap-2.5">
              <BeveanMark />
              <span className="font-semibold tracking-tight">Central de Ajuda</span>
            </Link>

            <button
              type="button"
              onClick={openSearch}
              className="ml-auto flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-[13px] text-muted-foreground hover:bg-muted/50"
            >
              <Search aria-hidden className="size-3.5" />
              <span className="hidden sm:inline">Pesquisar</span>
              <kbd className="hidden rounded border border-border px-1 font-mono text-[11px] sm:inline">
                ⌘K
              </kbd>
            </button>

            <ThemeToggle />
          </div>
        </header>

        <main id="conteudo" className="flex-1">
          <Outlet />
        </main>

        <footer className="border-t border-border py-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
            <BeveanLogo className="h-5 text-foreground" />
            <p className="text-[13px] text-muted-foreground">
              Central de Ajuda — tutoriais e respostas sobre a plataforma.
            </p>
          </div>
        </footer>

        <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </SearchContext.Provider>
  )
}
