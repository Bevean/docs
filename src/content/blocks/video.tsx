import type { VideoBlock } from '#schema'
import { defineBlock } from '../block-contract.ts'

const EMBEDS = {
  youtube: (id: string) => `https://www.youtube-nocookie.com/embed/${id}`,
  loom: (id: string) => `https://www.loom.com/embed/${id}`
} as const

export const videoBlock = defineBlock<VideoBlock, VideoBlock>({
  type: 'video',
  label: 'Vídeo',
  buildModel: (block) => block,
  render: (model) => (
    <div
      className="overflow-hidden rounded-lg border border-border bg-muted"
      style={{ aspectRatio: (model.aspect ?? '16:9').replace(':', ' / ') }}
    >
      <iframe
        src={EMBEDS[model.provider](model.videoId)}
        title={model.title}
        loading="lazy"
        allowFullScreen
        allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
        className="size-full"
      />
    </div>
  ),
  toPlainText: (block) => block.title,
  editor: {
    icon: 'video',
    category: 'mídia',
    settings: [
      { id: 'provider', type: 'select', label: 'Origem', default: 'youtube', panelSection: 'content' },
      { id: 'videoId', type: 'text', label: 'ID do vídeo', panelSection: 'content' },
      { id: 'title', type: 'text', label: 'Título', panelSection: 'content' }
    ]
  }
})
