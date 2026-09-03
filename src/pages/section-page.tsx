import { Breadcrumbs } from '@/app/breadcrumbs.tsx'
import { ContentIconBadge } from '@/app/content-icon.tsx'
import { useDocumentMeta } from '@/app/use-document-meta.ts'
import { getCollection, getSection, manifest } from '@/content/content-repository.ts'
import type { ArticleMeta } from '@/content/content-types.ts'
import { ArticleGrid } from './article-grid.tsx'
import { NotFoundPage } from './not-found-page.tsx'

/**
 * Recebe o caminho pronto em vez de ler `useParams`: quem resolve a ambiguidade
 * entre seção e artigo é a CollectionChildPage, e o nome do parâmetro da rota
 * (`child`) não é o mesmo do conceito.
 */
export function SectionPage({ path }: { path: string }) {
  const section = getSection(path)
  const collection = section ? getCollection(section.collection) : null

  useDocumentMeta(
    section ? `${section.title} — Central de Ajuda Bevean` : 'Central de Ajuda Bevean',
    section?.description
  )

  if (!section || !collection) return <NotFoundPage />

  const articles = section.articles
    .map((p) => manifest.articles[p])
    .filter((a): a is ArticleMeta => Boolean(a))

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Breadcrumbs
        items={[
          { title: 'Todas as coleções', url: '/ajuda' },
          { title: collection.title, url: collection.url },
          { title: section.title, url: section.url }
        ]}
      />

      <header className="mt-6 flex items-start gap-3">
        <ContentIconBadge name={section.icon} className="mt-0.5 size-10" />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{section.title}</h1>
          {section.description && (
            <p className="mt-1.5 text-[15px] leading-7 text-muted-foreground">
              {section.description}
            </p>
          )}
          <p className="mt-2 text-[13px] font-medium text-muted-foreground">
            {articles.length} {articles.length === 1 ? 'artigo' : 'artigos'}
          </p>
        </div>
      </header>

      <div className="mt-8">
        <ArticleGrid articles={articles} />
      </div>
    </div>
  )
}
