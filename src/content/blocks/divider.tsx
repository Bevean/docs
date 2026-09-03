import type { DividerBlock } from '#schema'
import { defineBlock } from '../block-contract.ts'

export const dividerBlock = defineBlock<DividerBlock, DividerBlock>({
  type: 'divider',
  label: 'Divisor',
  buildModel: (block) => block,
  render: () => <hr className="border-border" />,
  toPlainText: () => '',
  editor: { icon: 'minus', category: 'estrutura', settings: [] }
})
