import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { useDocumentMeta } from '@/app/use-document-meta.ts'
import { getCollection } from '@/content/content-repository.ts'
import { NEWS_COLLECTION, NEWS_TITLE, dropDate, getDrops } from '@/content/news.ts'
import type { ArticleMeta } from '@/content/content-types.ts'
import { longDate } from '@/lib/date.ts'
import { NotFoundPage } from './not-found-page.tsx'

function Tags({ tags, max }: { tags: string[]; max: number }) {
  if (tags.length === 0) return null
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.slice(0, max).map((tag) => (
        <li
          key={tag}
          className="rounded-full border border-border px-2.5 py-0.5 text-[11.5px] font-medium text-muted-foreground"
        >
          {tag}
        </li>
      ))}
    </ul>
  )
}

function Featured({ drop }: { drop: ArticleMeta }) {
  return (
    <Link
      to={drop.url}
      className="group block rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/40 sm:p-10"
    >
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-[11.5px] font-semibold uppercase tracking-wide text-primary">
          Mais recente
        </span>
        <time dateTime={dropDate(drop)} className="text-[13px] text-muted-foreground">
          {longDate(dropDate(drop))}
        </time>
      </div>

      <h2 className="mt-5 max-w-[700px] font-serif text-[28px] font-semibold leading-[1.18] tracking-tight text-foreground sm:text-[34px]">
        {drop.title}
      </h2>

      {drop.subtitle && (
        <p className="mt-3.5 max-w-[680px] text-[16px] leading-7 text-muted-foreground">
          {drop.subtitle}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Tags tags={drop.tags} max={3} />
        <span className="ml-auto inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary">
          Ler a novidade
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  )
}

export function NewsPage() {
  const collection = getCollection(NEWS_COLLECTION)
  const drops = getDrops()

  useDocumentMeta(NEWS_TITLE, collection?.description)

  if (!collection) return <NotFoundPage />

  const [featured, ...rest] = drops

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-20">
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-primary">
            Novidades do produto
          </p>
          <h1 className="mt-4 font-serif text-[36px] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-[50px]">
            O que mudou na Bevean
          </h1>
          <p className="mx-auto mt-5 max-w-[580px] text-[18px] leading-8 text-muted-foreground">
            Cada entrega contada por inteiro: o que muda, o que você ganha e o que precisa fazer
            para usar.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {!featured ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-[14px] text-muted-foreground">
            Nenhuma novidade publicada ainda.
          </p>
        ) : (
          <>
            <Featured drop={featured} />

            {rest.length > 0 && (
              <ol className="mt-10 border-t border-border">
                {rest.map((drop) => (
                  <li key={drop.path} className="border-b border-border">
                    <Link
                      to={drop.url}
                      className="group grid gap-2 py-7 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-8"
                    >
                      <time
                        dateTime={dropDate(drop)}
                        className="text-[13px] leading-7 text-muted-foreground"
                      >
                        {longDate(dropDate(drop))}
                      </time>

                      <div className="min-w-0">
                        <h2 className="flex items-start gap-2 font-serif text-[22px] font-semibold leading-[1.25] tracking-tight text-foreground transition-colors group-hover:text-primary">
                          {drop.title}
                          <ArrowRight
                            aria-hidden
                            className="mt-1.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                          />
                        </h2>
                        {drop.subtitle && (
                          <p className="mt-2 text-[15px] leading-7 text-muted-foreground">
                            {drop.subtitle}
                          </p>
                        )}
                        <div className="mt-4">
                          <Tags tags={drop.tags} max={3} />
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}

        <div className="mt-12 flex flex-col gap-4 rounded-xl border border-border bg-card p-7 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-semibold text-foreground">
              Procurando como fazer alguma coisa?
            </p>
            <p className="mt-1 text-[14px] leading-6 text-muted-foreground">
              As novidades contam o que mudou. O passo a passo fica na Central de Ajuda.
            </p>
          </div>
          <Link
            to="/ajuda"
            className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-center text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Ver a documentação
          </Link>
        </div>
      </div>
    </>
  )
}
