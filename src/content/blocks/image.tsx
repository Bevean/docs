import type { ImageBlock } from '#schema'
import { defineBlock } from '../block-contract.ts'
import { inlineToPlainText } from '../inline-normalize.ts'
import { collectInlineRefs } from '../content-refs.ts'
import { Inline } from '../renderer/inline-renderer.tsx'

const FRAMES = {
  none: '',
  shadow: 'rounded-lg border border-border shadow-sm',
  browser: 'rounded-lg border border-border shadow-md'
} as const

export const imageBlock = defineBlock<ImageBlock, ImageBlock & { src: string }>({
  type: 'image',
  label: 'Imagem',
  buildModel: (block, ctx) => ({ ...block, src: ctx.resolveAsset(block.src) }),
  render: (model, ctx) => (
    <figure className="space-y-2">
      <img
        src={model.src}
        alt={model.alt}
        // width/height são obrigatórios no schema e conferidos contra o arquivo:
        // sem eles o layout salta durante o carregamento e o CLS come o LCP.
        width={model.width}
        height={model.height}
        loading="lazy"
        decoding="async"
        className={`h-auto w-full ${FRAMES[model.frame ?? 'shadow']}`}
      />
      {model.caption && (
        <figcaption className="text-[13px] leading-6 text-muted-foreground">
          <Inline content={model.caption} ctx={ctx} />
        </figcaption>
      )}
    </figure>
  ),
  toPlainText: (block) => [block.alt, inlineToPlainText(block.caption)].filter(Boolean).join(' '),
  collectRefs: (block) => [{ kind: 'asset', value: block.src }, ...collectInlineRefs(block.caption)],
  editor: {
    icon: 'image',
    category: 'mídia',
    settings: [
      { id: 'src', type: 'media-picker', label: 'Arquivo', panelSection: 'content' },
      { id: 'alt', type: 'text', label: 'Texto alternativo', panelSection: 'content' },
      { id: 'frame', type: 'select', label: 'Moldura', default: 'shadow', panelSection: 'style' }
    ]
  }
})
