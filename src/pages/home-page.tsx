import { ArrowRight, BookOpen, Search } from 'lucide-react'
import { Link } from 'react-router'
import { useDocumentMeta } from '@/app/use-document-meta.ts'
import { manifest } from '@/content/content-repository.ts'
import { useOpenSearch } from '@/search/search-context.tsx'

const TITLE = 'Central de Ajuda — Bevean'
const DESCRIPTION = 'Tutoriais, respostas rápidas e guias sobre a plataforma Bevean.'

export function HomePage() {
  useDocumentMeta(TITLE, DESCRIPTION)
  const openSearch = useOpenSearch()

  return (
    <>
      <section className="border-b border-border bg-linear-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Como podemos ajudar você hoje?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-muted-foreground">
            Tutoriais, respostas rápidas e guias sobre a Bevean — tudo em um só lugar.
          </p>

          <button
            type="button"
            onClick={openSearch}
            className="mx-auto mt-7 flex w-full max-w-md items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left text-[14px] text-muted-foreground shadow-sm transition-colors hover:border-primary/40"
          >
            <Search aria-hidden className="size-4 shrink-0" />
            Pesquisar artigos…
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Coleções</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {manifest.collections.map((collection) => (
            <Link
              key={collection.path}
              to={collection.url}
              className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-muted/30"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen aria-hidden className="size-4.5" />
              </span>
              <span className="mt-4 flex items-center gap-1.5 font-semibold text-foreground">
                {collection.title}
                <ArrowRight
                  aria-hidden
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                />
              </span>
              {collection.description && (
                <span className="mt-1.5 text-[13px] leading-6 text-muted-foreground">
                  {collection.description}
                </span>
              )}
              <span className="mt-4 text-[12px] font-medium text-primary">
                {collection.articleCount === 0
                  ? 'Em breve'
                  : `${collection.articleCount} ${collection.articleCount === 1 ? 'artigo' : 'artigos'}`}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
