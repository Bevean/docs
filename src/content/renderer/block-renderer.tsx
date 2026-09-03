import { useCallback } from 'react'
import type { Block } from '#schema'
import { getBlockContract } from '../blocks/blocks-registry.ts'
import type { DocRenderContext } from '../content-types.ts'
import { NestedBlocksProvider } from './nested.tsx'

function UnknownBlock({ type }: { type: string }) {
  if (!import.meta.env.DEV) return null
  return (
    <div className="rounded-lg border border-dashed border-destructive/50 bg-destructive/5 p-4 text-[13px] text-destructive">
      Bloco desconhecido: <code className="font-mono">{type}</code>. Registre o contrato em
      <code className="font-mono"> blocks-registry.ts</code>.
    </div>
  )
}

function BlockNode({ block, ctx }: { block: Block; ctx: DocRenderContext }) {
  const contract = getBlockContract(block.type)

  // Um bloco fora do registry quebra o `content:check` antes de chegar aqui.
  // Em produção some em silêncio em vez de derrubar a página inteira.
  if (!contract) return <UnknownBlock type={block.type} />

  return <>{contract.render(contract.buildModel(block, ctx), ctx)}</>
}

function BlockNodes({ blocks, ctx }: { blocks: Block[]; ctx: DocRenderContext }) {
  // key pelo índice é seguro: a lista é estática e nunca reordena em runtime.
  return (
    <>
      {blocks.map((block, i) => (
        <BlockNode key={i} block={block} ctx={ctx} />
      ))}
    </>
  )
}

export function BlockList({ blocks, ctx }: { blocks: Block[]; ctx: DocRenderContext }) {
  const renderNested = useCallback(
    (inner: Block[]) => <BlockNodes blocks={inner} ctx={ctx} />,
    [ctx]
  )

  return (
    <NestedBlocksProvider value={renderNested}>
      <BlockNodes blocks={blocks} ctx={ctx} />
    </NestedBlocksProvider>
  )
}
