import { ChevronDown } from 'lucide-react'
import type { Block, FaqBlock } from '#schema'
import { defineBlock } from '../block-contract.ts'
import { NestedBlocks } from '../renderer/nested.tsx'

/** <details> nativo: abre sem JS, então funciona no HTML pré-renderizado. */
export const faqBlock = defineBlock<FaqBlock, FaqBlock>({
  type: 'faq',
  label: 'Perguntas frequentes',
  buildModel: (block) => block,
  render: (model) => (
    <div className="divide-y divide-border rounded-lg border border-border">
      {model.items.map((item, i) => (
        <details key={i} className="group px-4 py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-foreground">
            {item.question}
            <ChevronDown
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="mt-3 space-y-3">
            <NestedBlocks blocks={item.answer as Block[]} />
          </div>
        </details>
      ))}
    </div>
  ),
  toPlainText: (block) => block.items.map((i) => i.question).join(' '),
  editor: { icon: 'circle-help', category: 'estrutura', settings: [] }
})
