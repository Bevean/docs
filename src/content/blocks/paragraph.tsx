import type { InlineNode, ParagraphBlock } from '#schema'
import { defineBlock } from '../block-contract.ts'
import { inlineToPlainText, normalizeInline } from '../inline-normalize.ts'
import { collectInlineRefs } from '../content-refs.ts'
import { Inline } from '../renderer/inline-renderer.tsx'

interface ParagraphModel {
  content: InlineNode[]
}

export const paragraphBlock = defineBlock<ParagraphBlock, ParagraphModel>({
  type: 'paragraph',
  label: 'Parágrafo',
  buildModel: (block) => ({ content: normalizeInline(block.content) }),
  render: (model, ctx) => (
    <p className="text-[15px] leading-7 text-foreground/90">
      <Inline content={model.content} ctx={ctx} />
    </p>
  ),
  toPlainText: (block) => inlineToPlainText(block.content),
  collectRefs: (block) => collectInlineRefs(block.content),
  editor: {
    icon: 'text',
    category: 'texto',
    settings: [{ id: 'content', type: 'richtext', label: 'Texto', panelSection: 'content' }]
  }
})
