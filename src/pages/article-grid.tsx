import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import type { ArticleMeta } from '@/content/content-types.ts'

/**
 * Grade de duas colunas com o subtítulo limitado a duas linhas.
 *
 * A versão anterior era uma lista de uma coluna com o subtítulo inteiro: doze
 * artigos viravam doze parágrafos e o olho não tinha onde saltar. Aqui o título
 * domina e o subtítulo só desempata.
 */
export function ArticleGrid({ articles }: { articles: ArticleMeta[] }) {
  if (articles.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-[13px] text-muted-foreground">
        Ainda não há artigos publicados aqui. Estamos escrevendo.
      </p>
    )
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {articles.map((article) => (
        <li key={article.path}>
          <Link
            to={article.url}
            className="group flex h-full flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/30"
          >
            <span className="flex items-start justify-between gap-3">
              <span className="text-[15px] font-semibold leading-6 text-foreground">
                {article.title}
              </span>
              <ArrowRight
                aria-hidden
                className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              />
            </span>
            {article.subtitle && (
              <span className="mt-1.5 line-clamp-2 text-[13px] leading-6 text-muted-foreground">
                {article.subtitle}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}
