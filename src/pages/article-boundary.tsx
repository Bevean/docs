import { Component, Suspense, type ReactNode } from 'react'

/**
 * Fallback do Suspense enquanto o corpo do artigo desce.
 *
 * Na prática ele quase nunca aparece, e isso é bom: a primeira visita chega
 * com o HTML pré-renderizado e o corpo já em cache, e a navegação dentro do
 * site roda como transição — o React mantém a página anterior visível até a
 * nova estar pronta, em vez de piscar um esqueleto (medido com 1,5s de atraso
 * artificial: a página velha ficou, o esqueleto não apareceu).
 *
 * Fica porque todo Suspense precisa de um fallback, e um esqueleto é melhor
 * que uma tela branca se um dia a suspensão acontecer fora de uma transição.
 */
function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando o artigo…</span>
      <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      <div className="mt-8 h-8 w-2/3 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-muted" />
      <div className="mt-10 space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

/**
 * O corpo do artigo agora é um chunk separado, então ele pode falhar sozinho —
 * o caso real é um deploy novo invalidando o hash do arquivo debaixo de quem
 * está navegando. Sem esta barreira, essa falha apagaria o site inteiro em
 * vez de uma página.
 */
class ArticleErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Não foi possível carregar este artigo
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
          Isso costuma acontecer quando a Central de Ajuda é atualizada com a página aberta.
          Recarregar resolve.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-lg bg-primary px-4 py-2 text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Recarregar a página
        </button>
      </div>
    )
  }
}

export function ArticleBoundary({ children }: { children: ReactNode }) {
  return (
    <ArticleErrorBoundary>
      <Suspense fallback={<ArticleSkeleton />}>{children}</Suspense>
    </ArticleErrorBoundary>
  )
}
