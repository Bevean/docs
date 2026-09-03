import { createContext, use, type ReactNode } from 'react'
import type { Block } from '#schema'

/**
 * Ponte para blocos que contêm outros blocos (callout, steps, faq).
 *
 * Existe para quebrar o ciclo de import: sem ela teríamos
 * blocos → block-renderer → registry → blocos. Este módulo não importa nada do
 * registry nem dos blocos, então a recursão passa por React, não por ESM.
 */
export type RenderBlocks = (blocks: Block[]) => ReactNode

const RenderBlocksContext = createContext<RenderBlocks | null>(null)

export const NestedBlocksProvider = RenderBlocksContext.Provider

export function NestedBlocks({ blocks }: { blocks: Block[] }) {
  const render = use(RenderBlocksContext)
  if (!render) throw new Error('NestedBlocks usado fora de <BlockList>')
  return <>{render(blocks)}</>
}
