import type { Block } from '#schema'
import { getBlockContract } from './blocks/blocks-registry.ts'
import type { DocRenderContext, TocEntry } from './content-types.ts'
import { walkBlocks } from './walk-blocks.ts'

/**
 * Sumário do artigo, derivado do corpo pelos contratos de bloco.
 *
 * Antes vinha materializado no manifest, um campo por artigo — 13 KB de dado
 * que viajava para toda página só para ser usado nesta. Como o corpo já chega
 * na página de artigo (e só nela), o sumário sai dele.
 */
export function buildToc(body: Block[], ctx: DocRenderContext): TocEntry[] {
  const entries: TocEntry[] = []

  walkBlocks(body, (block) => {
    const contract = getBlockContract(block.type)
    entries.push(...(contract?.collectToc?.(block, ctx) ?? []))
  })

  return entries
}
