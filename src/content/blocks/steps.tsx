import type { Block, StepsBlock } from '#schema'
import { defineBlock } from '../block-contract.ts'
import { inlineToPlainText } from '../inline-normalize.ts'
import { Inline } from '../renderer/inline-renderer.tsx'
import { NestedBlocks } from '../renderer/nested.tsx'
import { collectInlineRefs } from '../content-refs.ts'

/**
 * Os "1️⃣ 2️⃣ 3️⃣" dos artigos atuais. A numeração é apresentação — vem de um
 * contador CSS sobre um <ol> de verdade, nunca de texto dentro do conteúdo.
 */
export const stepsBlock = defineBlock<StepsBlock, StepsBlock>({
  type: 'steps',
  label: 'Passo a passo',
  buildModel: (block) => block,
  render: (model, ctx) => (
    <ol className="space-y-6" start={model.startAt ?? 1}>
      {model.items.map((step, i) => (
        <li key={i} className="relative pl-11">
          <span
            aria-hidden
            className="absolute left-0 top-0 flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
          >
            {(model.startAt ?? 1) + i}
          </span>
          <p className="pt-1 text-[15px] font-semibold leading-7 text-foreground">
            <Inline content={step.title} ctx={ctx} />
          </p>
          {step.body && (
            <div className="mt-2 space-y-3">
              <NestedBlocks blocks={step.body as Block[]} />
            </div>
          )}
        </li>
      ))}
    </ol>
  ),
  toPlainText: (block) => block.items.map((s) => inlineToPlainText(s.title)).join(' '),
  collectRefs: (block) => block.items.flatMap((s) => collectInlineRefs(s.title)),
  editor: {
    icon: 'list-ordered',
    category: 'estrutura',
    settings: [{ id: 'startAt', type: 'number', label: 'Começa em', default: 1, panelSection: 'behavior' }]
  }
})
