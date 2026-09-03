import { useParams } from 'react-router'
import { Breadcrumbs } from '@/app/breadcrumbs.tsx'
import { useDocumentMeta } from '@/app/use-document-meta.ts'
import { getCollection, getSection, manifest } from '@/content/content-repository.ts'
import type { ArticleMeta } from '@/content/content-types.ts'
import { ArticleList } from './article-list.tsx'
import { NotFoundPage } from './not-found-page.tsx'

export function SectionPage() {
  const { collection: collectionSlug, section: sectionSlug } = useParams()
  const section = collectionSlug && sectionSlug ? getSection(`${collectionSlug}/${sectionSlug}`) : null
  const collection = collectionSlug ? getCollection(collectionSlug) : null

  useDocumentMeta(
    section ? `${section.title} — Central de Ajuda Bevean` : 'Central de Ajuda Bevean',
    section?.description
  )

  if (!section || !collection) return <NotFoundPage />

  const articles = section.articles
    .map((p) => manifest.articles[p])
    .filter((a): a is ArticleMeta => Boolean(a))

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Breadcrumbs
        items={[
          { title: 'Todas as coleções', url: '/ajuda' },
          { title: collection.title, url: collection.url },
          { title: section.title, url: section.url }
        ]}
      />

      <header className="mt-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{section.title}</h1>
        {section.description && (
          <p className="mt-2 text-[15px] leading-7 text-muted-foreground">{section.description}</p>
        )}
      </header>

      <div className="mt-8">
        <ArticleList articles={articles} />
      </div>
    </div>
  )
}
