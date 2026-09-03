import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import type { LinkCardsBlock } from '#schema'
import { defineBlock } from '../block-contract.ts'

export const linkCardsBlock = defineBlock<LinkCardsBlock, LinkCardsBlock>({
  type: 'linkCards',
  label: 'Cartões de link',
  buildModel: (block) => block,
  render: (model, ctx) => (
    <div className="space-y-3">
      {model.title && <p className="text-[15px] font-semibold text-foreground">{model.title}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {model.items.map((item, i) => {
          const target = ctx.resolveRef(item.ref)
          if (!target.exists) return null
          return (
            <Link
              key={i}
              to={target.href}
              className="group flex items-start justify-between gap-3 rounded-lg border border-border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <span className="min-w-0">
                <span className="block text-[15px] font-medium text-foreground">{target.label}</span>
                {item.description && (
                  <span className="mt-1 block text-[13px] leading-6 text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </span>
              <ArrowRight
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          )
        })}
      </div>
    </div>
  ),
  toPlainText: (block) =>
    [block.title ?? '', ...block.items.map((i) => i.description ?? '')].filter(Boolean).join(' '),
  collectRefs: (block) => block.items.map((i) => ({ kind: 'doc' as const, value: i.ref })),
  editor: { icon: 'layout-grid', category: 'estrutura', settings: [] }
})
