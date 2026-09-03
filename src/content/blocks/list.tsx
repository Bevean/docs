import type { ListBlock } from '#schema'
import { defineBlock } from '../block-contract.ts'
import { inlineToPlainText } from '../inline-normalize.ts'
import { Inline } from '../renderer/inline-renderer.tsx'
import { collectInlineRefs } from '../content-refs.ts'
import type { ContentRef } from '../block-contract.ts'
import type { DocRenderContext } from '../content-types.ts'

function ListView({ block, ctx }: { block: ListBlock; ctx: DocRenderContext }) {
  const Tag = block.style === 'ordered' ? 'ol' : 'ul'
  return (
    <Tag
      className={
        block.style === 'ordered'
          ? 'ml-5 list-decimal space-y-1.5 text-[15px] leading-7 text-foreground/90 marker:text-muted-foreground'
          : 'ml-5 list-disc space-y-1.5 text-[15px] leading-7 text-foreground/90 marker:text-muted-foreground'
      }
    >
      {block.items.map((item, i) => (
        <li key={i}>
          <Inline content={item.content} ctx={ctx} />
          {item.children && (
            <div className="mt-1.5">
              <ListView block={item.children} ctx={ctx} />
            </div>
          )}
        </li>
      ))}
    </Tag>
  )
}

function flatten(block: ListBlock): string[] {
  return block.items.flatMap((item) => [
    inlineToPlainText(item.content),
    ...(item.children ? flatten(item.children) : [])
  ])
}

function collectListRefs(block: ListBlock): ContentRef[] {
  return block.items.flatMap((item) => [
    ...collectInlineRefs(item.content),
    ...(item.children ? collectListRefs(item.children) : [])
  ])
}

export const listBlock = defineBlock<ListBlock, ListBlock>({
  type: 'list',
  label: 'Lista',
  buildModel: (block) => block,
  render: (model, ctx) => <ListView block={model} ctx={ctx} />,
  toPlainText: (block) => flatten(block).join(' '),
  collectRefs: (block) => collectListRefs(block),
  editor: {
    icon: 'list',
    category: 'texto',
    settings: [{ id: 'style', type: 'toggle-group', label: 'Estilo', default: 'bullet', panelSection: 'content' }]
  }
})
