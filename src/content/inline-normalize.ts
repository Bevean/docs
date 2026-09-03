import type { InlineContent, InlineNode } from '#schema'

/**
 * Aplica o atalho de autoria: string vira um nó de texto sem marcas.
 * Mesma ideia do `normalizeText` em modules/editor/.../text-model.ts — o tipo
 * do arquivo é permissivo, o tipo do modelo é normalizado.
 */
export function normalizeInline(content: InlineContent | undefined): InlineNode[] {
  if (content === undefined) return []
  if (typeof content === 'string') return [{ type: 'text', text: content }]
  return content
}

/** Texto puro de uma sequência inline — alimenta busca e meta description. */
export function inlineToPlainText(content: InlineContent | undefined): string {
  return normalizeInline(content)
    .map((node) => {
      switch (node.type) {
        case 'text':
          return node.text
        case 'uiPath':
          return node.attrs.segments?.join(' › ') ?? ''
        case 'kbd':
          return node.attrs.keys.join('+')
        case 'hardBreak':
          return ' '
      }
    })
    .join('')
}
