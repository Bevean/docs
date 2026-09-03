import type { Block, BlockType } from '#schema'
import type { ErasedBlockContract } from '../block-contract.ts'
import { paragraphBlock } from './paragraph.tsx'
import { headingBlock } from './heading.tsx'
import { listBlock } from './list.tsx'
import { stepsBlock } from './steps.tsx'
import { calloutBlock } from './callout.tsx'
import { imageBlock } from './image.tsx'
import { videoBlock } from './video.tsx'
import { codeBlock } from './code.tsx'
import { tableBlock } from './table.tsx'
import { faqBlock } from './faq.tsx'
import { linkCardsBlock } from './link-cards.tsx'
import { dividerBlock } from './divider.tsx'

/**
 * Registry de blocos, no molde do `modulesData` do editor de e-mail.
 *
 * O `satisfies Record<BlockType, ...>` é a trava: adicionar um tipo à união
 * `Block` sem registrar o contrato aqui quebra a compilação.
 */
export const blocksRegistry = {
  paragraph: paragraphBlock,
  heading: headingBlock,
  list: listBlock,
  steps: stepsBlock,
  callout: calloutBlock,
  image: imageBlock,
  video: videoBlock,
  code: codeBlock,
  table: tableBlock,
  faq: faqBlock,
  linkCards: linkCardsBlock,
  divider: dividerBlock
}

/** Trava 1: todo tipo da união `Block` tem contrato registrado. */
const _coversAllBlockTypes: Record<BlockType, unknown> = blocksRegistry
void _coversAllBlockTypes

/** Trava 2: nenhuma chave registrada fora da união `Block`. */
type AssertNever<T extends never> = T
export type _NoExtraKeys = AssertNever<Exclude<keyof typeof blocksRegistry, BlockType>>

/** Trava 3: a chave do registry bate com o `type` declarado no contrato. */
type _KeysMatchType = {
  [K in keyof typeof blocksRegistry]: (typeof blocksRegistry)[K]['type'] extends K ? true : never
}
export type _KeysOk = AssertNever<Exclude<_KeysMatchType[keyof _KeysMatchType], true>>

/** Nunca explode com bloco desconhecido — mesmo espírito do getModuleContract. */
export function getBlockContract(type: string): ErasedBlockContract | undefined {
  return (blocksRegistry as Record<string, unknown>)[type] as ErasedBlockContract | undefined
}

export function blockToPlainText(block: Block): string {
  return getBlockContract(block.type)?.toPlainText(block) ?? ''
}
