import type { InlineContent } from '#schema'
import type { ContentRef } from './block-contract.ts'
import { normalizeInline } from './inline-normalize.ts'

/** Extrai as referências de uma sequência inline, para o build validar. */
export function collectInlineRefs(content: InlineContent | undefined): ContentRef[] {
  const refs: ContentRef[] = []

  for (const node of normalizeInline(content)) {
    if (node.type === 'text') {
      for (const mark of node.marks ?? []) {
        if (mark.type === 'docLink') refs.push({ kind: 'doc', value: mark.attrs.ref })
      }
    } else if (node.type === 'uiPath' && node.attrs.ref) {
      refs.push({ kind: 'uiPath', value: node.attrs.ref })
    }
  }

  return refs
}
