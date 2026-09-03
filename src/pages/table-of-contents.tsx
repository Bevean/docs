import { useEffect, useId, useState } from 'react'
import type { TocEntry } from '@/content/content-types.ts'

export function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState<string | null>(null)
  // O sumário aparece duas vezes (mobile e desktop). Um id fixo duplicaria o
  // id no DOM e deixaria o aria-labelledby ambíguo.
  const headingId = useId()

  useEffect(() => {
    const headings = entries
      .map((entry) => document.getElementById(entry.anchor))
      .filter((el): el is HTMLElement => Boolean(el))
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (records) => {
        const visible = records.filter((r) => r.isIntersecting)
        if (visible.length > 0) setActive(visible[0].target.id)
      },
      // Sem a margem inferior o último título nunca chega a ativar.
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )

    for (const heading of headings) observer.observe(heading)
    return () => observer.disconnect()
  }, [entries])

  return (
    <nav aria-labelledby={headingId}>
      <h2 id={headingId} className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
        Neste artigo
      </h2>
      <ul className="mt-3 space-y-2">
        {entries.map((entry) => (
          <li key={entry.anchor} className={entry.level === 3 ? 'pl-3' : undefined}>
            <a
              href={`#${entry.anchor}`}
              aria-current={active === entry.anchor ? 'location' : undefined}
              className={
                active === entry.anchor
                  ? 'block text-[13px] font-medium leading-6 text-primary'
                  : 'block text-[13px] leading-6 text-muted-foreground hover:text-foreground'
              }
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
