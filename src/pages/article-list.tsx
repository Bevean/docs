import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import type { ArticleMeta } from '@/content/content-types.ts'

export function ArticleList({ articles }: { articles: ArticleMeta[] }) {
  if (articles.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-[13px] text-muted-foreground">
        Ainda não há artigos publicados aqui. Estamos escrevendo.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border">
      {articles.map((article) => (
        <li key={article.path}>
          <Link
            to={article.url}
            className="group flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
          >
            <span className="min-w-0">
              <span className="block font-medium text-foreground">{article.title}</span>
              {article.subtitle && (
                <span className="mt-1 block text-[13px] leading-6 text-muted-foreground">
                  {article.subtitle}
                </span>
              )}
            </span>
            <ArrowRight
              aria-hidden
              className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}
