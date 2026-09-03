import type { ReactNode } from 'react'
import type { Block, BlockType } from '#schema'
import type { DocRenderContext, TocEntry } from './content-types.ts'

export type BlockCategory = 'texto' | 'destaque' | 'mídia' | 'estrutura'

/** Referência que o bloco emite para o build validar (link órfão quebra o build). */
export interface ContentRef {
  kind: 'doc' | 'asset' | 'uiPath'
  value: string
}

/**
 * Descrição declarativa de um campo do bloco, no molde do `ModuleSettings[]`
 * do form-editor. Nada em runtime consome isto: existe para o editor visual da
 * fase futura ser "ligar o painel", não "reescrever os blocos".
 */
export interface BlockSetting {
  id: string
  type: string
  label: string
  default?: unknown
  options?: Record<string, unknown>
  panelSection?: 'content' | 'layout' | 'style' | 'behavior'
  visibleWhen?: { field: string; operator: string; value: unknown }
}

/**
 * Espelha o `EditorModuleContract` de modules/editor/editor.ts, adaptado ao
 * contexto read-only: no lugar de `renderPreview`/`renderEmail`, as saídas
 * derivadas do mesmo modelo são React (tela), texto puro (busca) e sumário.
 */
export interface BlockContract<TBlock extends Block = Block, TModel = unknown> {
  type: TBlock['type']
  label: string
  buildModel: (block: TBlock, ctx: DocRenderContext) => TModel
  render: (model: TModel, ctx: DocRenderContext) => ReactNode
  toPlainText: (block: TBlock) => string
  collectToc?: (block: TBlock, ctx: DocRenderContext) => TocEntry[]
  collectRefs?: (block: TBlock) => ContentRef[]
  editor?: {
    icon: string
    category: BlockCategory
    settings: BlockSetting[]
  }
}

/** Helper para preservar a inferência de TModel ao declarar um contrato. */
export function defineBlock<TBlock extends Block, TModel>(
  contract: BlockContract<TBlock, TModel>
): BlockContract<TBlock, TModel> {
  return contract
}

/**
 * Contrato com os genéricos apagados, para o renderer despachar por `type`.
 *
 * O TypeScript não correlaciona `block.type` com a entrada do registry, então a
 * conversão acontece num ponto só (`getBlockContract`). A segurança de tipo real
 * fica na declaração de cada bloco, via `defineBlock`.
 */
export interface ErasedBlockContract {
  type: BlockType
  label: string
  buildModel: (block: Block, ctx: DocRenderContext) => unknown
  render: (model: unknown, ctx: DocRenderContext) => ReactNode
  toPlainText: (block: Block) => string
  collectToc?: (block: Block, ctx: DocRenderContext) => TocEntry[]
  collectRefs?: (block: Block) => ContentRef[]
  editor?: {
    icon: string
    category: BlockCategory
    settings: BlockSetting[]
  }
}
