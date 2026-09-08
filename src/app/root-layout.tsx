import { useCallback, useEffect, useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router'
import { SearchDialog } from '@/search/search-dialog.tsx'
import { SearchContext } from '@/search/search-context.tsx'
import { BeveanLogo, BeveanMark } from './logo.tsx'
import { ThemeToggle } from './theme-toggle.tsx'

// O menu espelha o do ajuda.bevean.com. Só a Central de Ajuda mora aqui; CRM
// Club, Feedbacks, Novidades e Suporte continuam no site antigo, por isso são
// absolutos. Se aquele domínio for desligado, estes quatro links vão junto.
const SITE_ANTIGO = 'https://ajuda.bevean.com'
const NAV = [
  { label: 'CRM Club', href: `${SITE_ANTIGO}/crm-club` },
  { label: 'Feedbacks', href: `${SITE_ANTIGO}/feedbacks` },
  { label: 'Últimas Novidades', href: `${SITE_ANTIGO}/novidades` },
  { label: 'Suporte', href: `${SITE_ANTIGO}/suporte` },
]

export function RootLayout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
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

            <nav aria-label="Seções" className="hidden flex-1 items-center justify-center gap-5 lg:flex">
              <Link
                to="/ajuda"
                aria-current={pathname.startsWith('/ajuda') ? 'page' : undefined}
                className="text-[13px] text-foreground hover:text-primary aria-[current=page]:text-primary"
              >
                Central de Ajuda
              </Link>
              {NAV.map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              ))}
            </nav>

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

            <button
              type="button"
              onClick={() => setMenuOpen(open => !open)}
              aria-expanded={menuOpen}
              aria-controls="menu-secoes"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted/50 lg:hidden"
            >
              {menuOpen ? (
                <X aria-hidden className="size-4" />
              ) : (
                <Menu aria-hidden className="size-4" />
              )}
            </button>
          </div>

          {menuOpen && (
            <nav
              id="menu-secoes"
              aria-label="Seções"
              className="border-b border-border bg-background lg:hidden"
            >
              <div className="mx-auto flex max-w-6xl flex-col px-6 py-2">
                <Link
                  to="/ajuda"
                  onClick={() => setMenuOpen(false)}
                  aria-current={pathname.startsWith('/ajuda') ? 'page' : undefined}
                  className="py-2 text-sm text-foreground aria-[current=page]:text-primary"
                >
                  Central de Ajuda
                </Link>
                {NAV.map(item => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.label}
                    <span className="sr-only"> (abre em nova aba)</span>
                  </a>
                ))}
              </div>
            </nav>
          )}
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
