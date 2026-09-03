import { AlertTriangle, CheckCircle2, Info, Lightbulb, OctagonAlert } from 'lucide-react'
import type { Block, CalloutBlock } from '#schema'
import { defineBlock } from '../block-contract.ts'
import { NestedBlocks } from '../renderer/nested.tsx'

/** ✅ Importante / ⚠️ Limitações / 📌 Visão geral dos artigos atuais, tipados. */
const VARIANTS = {
  info: { Icon: Info, label: 'Informação', box: 'border-sky-500/30 bg-sky-500/5', icon: 'text-sky-600 dark:text-sky-400' },
  tip: { Icon: Lightbulb, label: 'Dica', box: 'border-violet-500/30 bg-violet-500/5', icon: 'text-violet-600 dark:text-violet-400' },
  success: { Icon: CheckCircle2, label: 'Importante', box: 'border-emerald-500/30 bg-emerald-500/5', icon: 'text-emerald-600 dark:text-emerald-400' },
  warning: { Icon: AlertTriangle, label: 'Atenção', box: 'border-amber-500/40 bg-amber-500/5', icon: 'text-amber-600 dark:text-amber-500' },
  danger: { Icon: OctagonAlert, label: 'Cuidado', box: 'border-destructive/35 bg-destructive/5', icon: 'text-destructive' }
} as const

export const calloutBlock = defineBlock<CalloutBlock, CalloutBlock>({
  type: 'callout',
  label: 'Destaque',
  buildModel: (block) => block,
  render: (model) => {
    const { Icon, label, box, icon } = VARIANTS[model.variant]
    return (
      <div role="note" className={`flex gap-3 rounded-lg border p-4 ${box}`}>
        <Icon aria-hidden className={`mt-0.5 size-5 shrink-0 ${icon}`} />
        <div className="min-w-0 flex-1 space-y-2">
          {/* A cor sozinha não informa: o leitor de tela precisa da variante. */}
          <span className="sr-only">{label}: </span>
          {model.title && <p className="text-[15px] font-semibold text-foreground">{model.title}</p>}
          <NestedBlocks blocks={model.body as Block[]} />
        </div>
      </div>
    )
  },
  toPlainText: (block) => block.title ?? '',
  editor: {
    icon: 'info',
    category: 'destaque',
    settings: [
      { id: 'variant', type: 'select', label: 'Tipo', default: 'info', panelSection: 'content' },
      { id: 'title', type: 'text', label: 'Título', panelSection: 'content' }
    ]
  }
})
