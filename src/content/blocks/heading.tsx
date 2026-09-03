import type { HeadingBlock, InlineNode } from '#schema'
import { defineBlock } from '../block-contract.ts'
import { inlineToPlainText, normalizeInline } from '../inline-normalize.ts'
import { Inline } from '../renderer/inline-renderer.tsx'
import { collectInlineRefs } from '../content-refs.ts'

interface HeadingModel {
  level: 2 | 3
  content: InlineNode[]
  anchor: string
}

export const headingBlock = defineBlock<HeadingBlock, HeadingModel>({
  type: 'heading',
  label: 'Título',
  buildModel: (block, ctx) => ({
    level: block.level,
    content: normalizeInline(block.content),
    anchor: ctx.anchors.get(block) ?? ''
  }),
  render: (model, ctx) => {
    const Tag = model.level === 2 ? 'h2' : 'h3'
    return (
      <Tag
        id={model.anchor}
        className={
          model.level === 2
            ? 'scroll-mt-[calc(var(--header-height)+1rem)] text-xl font-semibold tracking-tight text-foreground'
            : 'scroll-mt-[calc(var(--header-height)+1rem)] text-base font-semibold tracking-tight text-foreground'
        }
      >
        <Inline content={model.content} ctx={ctx} />
      </Tag>
    )
  },
  toPlainText: (block) => inlineToPlainText(block.content),
  collectRefs: (block) => collectInlineRefs(block.content),
  collectToc: (block, ctx) => [
    {
      level: block.level,
      text: inlineToPlainText(block.content),
      anchor: ctx.anchors.get(block) ?? ''
    }
  ],
  editor: {
    icon: 'heading',
    category: 'texto',
    settings: [
      { id: 'content', type: 'text', label: 'Texto', panelSection: 'content' },
      { id: 'level', type: 'select', label: 'Nível', default: 2, panelSection: 'content' },
      { id: 'icon', type: 'select', label: 'Ícone', panelSection: 'style' }
    ]
  }
})
