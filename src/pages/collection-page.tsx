import { Link, useParams } from 'react-router'
import { Breadcrumbs } from '@/app/breadcrumbs.tsx'
import { useDocumentMeta } from '@/app/use-document-meta.ts'
import { getCollection, manifest } from '@/content/content-repository.ts'
import type { ArticleMeta } from '@/content/content-types.ts'
import { ArticleList } from './article-list.tsx'
import { NotFoundPage } from './not-found-page.tsx'

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
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Breadcrumbs
        items={[
          { title: 'Todas as coleções', url: '/ajuda' },
          { title: collection.title, url: collection.url }
        ]}
      />

      <header className="mt-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{collection.title}</h1>
        {collection.description && (
          <p className="mt-2 text-[15px] leading-7 text-muted-foreground">{collection.description}</p>
        )}
        <p className="mt-3 text-[13px] font-medium text-primary">
          {collection.articleCount === 0
            ? 'Nenhum artigo publicado ainda'
            : `${collection.articleCount} ${collection.articleCount === 1 ? 'artigo' : 'artigos'}`}
        </p>
      </header>

      {loose.length > 0 && (
        <div className="mt-8">
          <ArticleList articles={loose} />
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
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Link to={section.url} className="hover:text-foreground">
                {section.title}
              </Link>
            </h2>
            <div className="mt-3">
              <ArticleList articles={articles} />
            </div>
          </section>
        )
      })}

      {collection.articleCount === 0 && loose.length === 0 && (
        <div className="mt-8">
          <ArticleList articles={[]} />
        </div>
      )}
    </div>
  )
}
