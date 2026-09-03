import type { Block, HeadingBlock } from '#schema'
import { inlineToPlainText } from './inline-normalize.ts'

/** Slug de âncora: sem acento, sem emoji, kebab-case. */
export function slugifyAnchor(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/**
 * Resolve a âncora de cada heading do documento, de uma vez.
 *
 * É função pura do corpo, não um alocador com estado: o render do React pode
 * rodar duas vezes (StrictMode) e um alocador mutável produziria `-2` na
 * segunda passada, quebrando todo link direto depois da hidratação.
 */
export function computeAnchors(body: Block[]): Map<HeadingBlock, string> {
  const used = new Map<string, number>()
  const result = new Map<HeadingBlock, string>()

  for (const block of body) {
    if (block.type !== 'heading') continue
    const base = block.anchor ?? (slugifyAnchor(inlineToPlainText(block.content)) || 'secao')
    const seen = used.get(base) ?? 0
    used.set(base, seen + 1)
    result.set(block, seen === 0 ? base : `${base}-${seen + 1}`)
  }

  return result
}
