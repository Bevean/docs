import { Link, useParams } from 'react-router'
import { Breadcrumbs } from '@/app/breadcrumbs.tsx'
import { ContentIconBadge } from '@/app/content-icon.tsx'
import { useDocumentMeta } from '@/app/use-document-meta.ts'
import { getCollection, manifest } from '@/content/content-repository.ts'
import type { ArticleMeta } from '@/content/content-types.ts'
import { ArticleGrid } from './article-grid.tsx'
import { NotFoundPage } from './not-found-page.tsx'

const plural = (n: number) => `${n} ${n === 1 ? 'artigo' : 'artigos'}`

export function CollectionPage() {
  const { collection: slug } = useParams()
  const collection = slug ? getCollection(slug) : null

  useDocumentMeta(
    collection ? `${collection.title} — Central de Ajuda Bevean` : 'Central de Ajuda Bevean',
    collection?.description
  )

  if (!collection) return <NotFoundPage />

  const loose = collection.articles
    .map((p) => manifest.articles[p])
    .filter((a): a is ArticleMeta => Boolean(a))

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Breadcrumbs
        items={[
          { title: 'Todas as coleções', url: '/ajuda' },
          { title: collection.title, url: collection.url }
        ]}
      />

      <header className="mt-6 flex items-start gap-3">
        <ContentIconBadge name={collection.icon} className="mt-0.5 size-10" />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{collection.title}</h1>
          {collection.description && (
            <p className="mt-1.5 text-[15px] leading-7 text-muted-foreground">
              {collection.description}
            </p>
          )}
        </div>
      </header>

      {loose.length > 0 && (
        <div className="mt-8">
          <ArticleGrid articles={loose} />
        </div>
      )}

      {collection.sections.map((path) => {
        const section = manifest.sections[path]
        if (!section) return null
        const articles = section.articles
          .map((p) => manifest.articles[p])
          .filter((a): a is ArticleMeta => Boolean(a))

        return (
          <section key={path} className="mt-10">
            {/* O cabeçalho de seção precisa competir com os cartões abaixo dele,
                senão os dois grupos viram um bloco só de doze itens. */}
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <ContentIconBadge name={section.icon} />
              <div className="min-w-0 flex-1">
                <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
                  <Link to={section.url} className="hover:text-primary">
                    {section.title}
                  </Link>
                </h2>
                {section.description && (
                  <p className="mt-0.5 line-clamp-1 text-[13px] text-muted-foreground">
                    {section.description}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-[12px] font-medium text-muted-foreground">
                {plural(articles.length)}
              </span>
            </div>

            <div className="mt-4">
              <ArticleGrid articles={articles} />
            </div>
          </section>
        )
      })}

      {collection.articleCount === 0 && (
        <div className="mt-8">
          <ArticleGrid articles={[]} />
        </div>
      )}
    </div>
  )
}
