import type { CodeBlock } from '#schema'
import { defineBlock } from '../block-contract.ts'

export const codeBlock = defineBlock<CodeBlock, CodeBlock>({
  type: 'code',
  label: 'Código',
  buildModel: (block) => block,
  render: (model) => (
    <div className="overflow-hidden rounded-lg border border-border bg-muted/50">
      {model.filename && (
        <div className="border-b border-border px-4 py-2 font-mono text-[12px] text-muted-foreground">
          {model.filename}
        </div>
      )}
      {/* tabIndex torna o bloco alcançável por teclado quando ele rola. */}
      <pre tabIndex={0} className="overflow-x-auto p-4 text-[13px] leading-6">
        <code className={`font-mono language-${model.language ?? 'text'}`}>{model.code}</code>
      </pre>
    </div>
  ),
  toPlainText: (block) => (block.filename ? `${block.filename} ${block.code}` : block.code),
  editor: {
    icon: 'code',
    category: 'estrutura',
    settings: [
      { id: 'code', type: 'code', label: 'Código', panelSection: 'content' },
      { id: 'language', type: 'select', label: 'Linguagem', default: 'text', panelSection: 'content' },
      { id: 'filename', type: 'text', label: 'Nome do arquivo', panelSection: 'content' }
    ]
  }
})
