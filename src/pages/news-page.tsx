import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { Breadcrumbs } from '@/app/breadcrumbs.tsx'
import { ContentIconBadge } from '@/app/content-icon.tsx'
import { useDocumentMeta } from '@/app/use-document-meta.ts'
import { getCollection } from '@/content/content-repository.ts'
import { NEWS_COLLECTION, dropDate, getDrops } from '@/content/news.ts'
import { longDate } from '@/lib/date.ts'
import { NotFoundPage } from './not-found-page.tsx'

export function NewsPage() {
  const collection = getCollection(NEWS_COLLECTION)
  const drops = getDrops()

  useDocumentMeta(
    collection ? `${collection.title} — Central de Ajuda Bevean` : 'Central de Ajuda Bevean',
    collection?.description
  )

  if (!collection) return <NotFoundPage />

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
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

      {drops.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-border px-4 py-8 text-center text-[13px] text-muted-foreground">
          Nenhuma novidade publicada ainda.
        </p>
      ) : (
        <ol className="mt-8 border-t border-border">
          {drops.map((drop) => (
            <li key={drop.path} className="border-b border-border">
              <Link
                to={drop.url}
                className="group grid gap-1.5 py-6 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-6"
              >
                <time
                  dateTime={dropDate(drop)}
                  className="text-[13px] leading-7 text-muted-foreground"
                >
                  {longDate(dropDate(drop))}
                </time>

                <div className="min-w-0">
                  <h2 className="flex items-start gap-1.5 text-[17px] font-semibold leading-7 text-foreground transition-colors group-hover:text-primary">
                    {drop.title}
                    <ArrowRight
                      aria-hidden
                      className="mt-1.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    />
                  </h2>
                  {drop.subtitle && (
                    <p className="mt-1 text-[14px] leading-7 text-muted-foreground">
                      {drop.subtitle}
                    </p>
                  )}
                  {drop.tags.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {drop.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
