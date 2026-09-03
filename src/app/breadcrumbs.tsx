import { Fragment } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import type { Crumb } from '@/content/content-types.ts'

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Trilha de navegação">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground">
        {items.map((crumb, i) => {
          const isLast = i === items.length - 1
          return (
            <Fragment key={crumb.url}>
              {i > 0 && <ChevronRight aria-hidden className="size-3.5 shrink-0" />}
              <li>
                {isLast ? (
                  <span aria-current="page" className="text-foreground">
                    {crumb.title}
                  </span>
                ) : (
                  <Link to={crumb.url} className="hover:text-foreground">
                    {crumb.title}
                  </Link>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
