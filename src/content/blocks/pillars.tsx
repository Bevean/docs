import type { CSSProperties } from 'react'
import type { InlineNode, PillarsBlock } from '#schema'
import { defineBlock } from '../block-contract.ts'
import { inlineToPlainText, normalizeInline } from '../inline-normalize.ts'
import { collectInlineRefs } from '../content-refs.ts'
import { Inline } from '../renderer/inline-renderer.tsx'

interface PillarsModel {
  items: { title: string; content: InlineNode[] }[]
}

const pillarColumns = (count: number) => (count === 4 ? 2 : Math.min(count, 3))

export const pillarsBlock = defineBlock<PillarsBlock, PillarsModel>({
  type: 'pillars',
  label: 'Pilares',
  buildModel: (block) => ({
    items: block.items.map((item) => ({
      title: item.title,
      content: normalizeInline(item.content)
    }))
  }),
  render: (model, ctx) => (
    <ul
      className="grid grid-cols-1 gap-3 sm:[grid-template-columns:repeat(var(--pillar-cols),minmax(0,1fr))]"
      style={{ '--pillar-cols': pillarColumns(model.items.length) } as CSSProperties}
    >
      {model.items.map((item, i) => (
        <li key={i} className="rounded-xl border border-border bg-card p-5">
          <p className="text-[15px] font-semibold text-primary">{item.title}</p>
          <p className="mt-1.5 text-[14px] leading-6 text-muted-foreground">
            <Inline content={item.content} ctx={ctx} />
          </p>
        </li>
      ))}
    </ul>
  ),
  toPlainText: (block) =>
    block.items.map((i) => `${i.title} ${inlineToPlainText(i.content)}`).join(' '),
  collectRefs: (block) => block.items.flatMap((i) => collectInlineRefs(i.content)),
  editor: {
    icon: 'columns-3',
    category: 'estrutura',
    settings: [{ id: 'items', type: 'list', label: 'Pilares', panelSection: 'content' }]
  }
})
