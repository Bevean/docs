import type { Block } from '#schema'

/**
 * Percorre o corpo inteiro, incluindo os blocos aninhados em `callout`,
 * `steps` e `faq`.
 *
 * Mora em `src/` e não no script de build porque o sumário passou a ser
 * derivado no cliente: duas cópias do walker significariam um sumário
 * diferente do que o validador viu.
 */
export function walkBlocks(blocks: Block[], visit: (block: Block) => void): void {
  for (const block of blocks) {
    visit(block)
    if (block.type === 'callout') walkBlocks(block.body as Block[], visit)
    else if (block.type === 'steps') {
      for (const step of block.items) if (step.body) walkBlocks(step.body as Block[], visit)
    } else if (block.type === 'faq') {
      for (const item of block.items) walkBlocks(item.answer as Block[], visit)
    }
  }
}
