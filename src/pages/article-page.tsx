import { Link } from 'react-router'
import type { Block } from '#schema'
import { Breadcrumbs } from '@/app/breadcrumbs.tsx'
import { useDocumentMeta } from '@/app/use-document-meta.ts'
import { getArticle, getSiblings } from '@/content/content-repository.ts'
import { createRenderContext } from '@/content/render-context.ts'
import { BlockList } from '@/content/renderer/block-renderer.tsx'
import { NotFoundPage } from './not-found-page.tsx'
import { TableOfContents } from './table-of-contents.tsx'

export function ArticlePage({ path }: { path: string }) {
  const article = getArticle(path)

  useDocumentMeta(
    article ? `${article.meta.title} — Central de Ajuda Bevean` : 'Central de Ajuda Bevean',
    article?.doc.seo?.description ?? article?.meta.subtitle
  )

  if (!article) return <NotFoundPage />

  const { meta, doc } = article
  const body = doc.body as Block[]
  const ctx = createRenderContext(meta, body)
  const siblings = getSiblings(meta)

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_240px]">
      <article className="min-w-0">
        <Breadcrumbs items={meta.breadcrumb} />

        <header className="mt-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{meta.title}</h1>
          {meta.subtitle && (
            <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{meta.subtitle}</p>
          )}
        </header>

        {meta.toc.length > 1 && (
          <div className="mt-8 lg:hidden">
            <TableOfContents entries={meta.toc} />
          </div>
        )}

        <div className="mt-8 space-y-5">
          <BlockList blocks={body} ctx={ctx} />
        </div>

        <footer className="mt-12 border-t border-border pt-6 text-[13px] text-muted-foreground">
          Atualizado em{' '}
          <time dateTime={meta.updatedAt}>
            {new Date(`${meta.updatedAt}T12:00:00`).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </time>
        </footer>
      </article>

      <aside className="hidden lg:block">
        <div className="sticky top-[calc(var(--header-height)+1.5rem)] space-y-8">
          {meta.toc.length > 1 && <TableOfContents entries={meta.toc} />}

          {siblings && (
            <nav aria-labelledby="artigos-irmaos">
              <h2
                id="artigos-irmaos"
                className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {siblings.title}
              </h2>
              <ul className="mt-3 space-y-2">
                {siblings.articles.map((sibling) => (
                  <li key={sibling.path}>
                    <Link
                      to={sibling.url}
                      aria-current={sibling.path === meta.path ? 'page' : undefined}
                      className={
                        sibling.path === meta.path
                          ? 'block text-[13px] font-medium leading-6 text-primary'
                          : 'block text-[13px] leading-6 text-muted-foreground hover:text-foreground'
                      }
                    >
                      {sibling.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </aside>
    </div>
  )
}
