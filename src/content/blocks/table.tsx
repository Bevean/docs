import type { TableBlock } from '#schema'
import { defineBlock } from '../block-contract.ts'
import { inlineToPlainText } from '../inline-normalize.ts'
import { collectInlineRefs } from '../content-refs.ts'
import { Inline } from '../renderer/inline-renderer.tsx'

const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' } as const

export const tableBlock = defineBlock<TableBlock, TableBlock>({
  type: 'table',
  label: 'Tabela',
  buildModel: (block) => block,
  render: (model, ctx) => (
    // A tabela rola dentro do próprio container; a página nunca rola na horizontal.
    <div tabIndex={0} className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-[14px]">
        {model.caption && (
          <caption className="border-b border-border px-4 py-2 text-left text-[13px] text-muted-foreground">
            {model.caption}
          </caption>
        )}
        {model.head && (
          <thead>
            <tr className="bg-muted/50">
              {model.head.map((cell, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`px-4 py-2.5 font-semibold text-foreground ${ALIGN[cell.align ?? 'left']}`}
                >
                  <Inline content={cell.content} ctx={ctx} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {model.rows.map((row, r) => (
            <tr key={r} className="border-t border-border">
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={`px-4 py-2.5 align-top text-foreground/90 ${ALIGN[cell.align ?? 'left']}`}
                >
                  <Inline content={cell.content} ctx={ctx} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  toPlainText: (block) =>
    [
      block.caption ?? '',
      ...(block.head ?? []).map((c) => inlineToPlainText(c.content)),
      ...block.rows.flatMap((row) => row.map((c) => inlineToPlainText(c.content)))
    ]
      .filter(Boolean)
      .join(' '),
  collectRefs: (block) => [
    ...(block.head ?? []).flatMap((c) => collectInlineRefs(c.content)),
    ...block.rows.flatMap((row) => row.flatMap((c) => collectInlineRefs(c.content)))
  ],
  editor: {
    icon: 'table',
    category: 'estrutura',
    settings: [{ id: 'caption', type: 'text', label: 'Legenda', panelSection: 'content' }]
  }
})
