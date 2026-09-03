/**
 * Fonte única do formato do conteúdo.
 *
 * Este diretório é BUILD-ONLY: zod só roda em scripts e testes. O app importa
 * exclusivamente os tipos daqui, com `import type` — que o `verbatimModuleSyntax`
 * apaga na transpilação, mantendo zod fora do bundle. Um lint em eslint.config.mjs
 * e uma checagem no CI garantem isso.
 */
import type { z } from 'zod'
import type { markZod, inlineNodeZod, inlineContentZod } from './inline.zod.ts'
import type {
  paragraphZod,
  headingZod,
  stepsZod,
  calloutZod,
  imageZod,
  videoZod,
  codeZod,
  tableZod,
  faqZod,
  linkCardsZod,
  dividerZod,
  ListInput
} from './blocks.zod.ts'
import type { articleZod, sectionZod, collectionZod, contentIndexZod, uiMapZod } from './content.zod.ts'

export type Mark = z.infer<typeof markZod>
export type InlineNode = z.infer<typeof inlineNodeZod>
export type InlineContent = z.input<typeof inlineContentZod>

export type ParagraphBlock = z.input<typeof paragraphZod>
export type HeadingBlock = z.input<typeof headingZod>
export type ListBlock = ListInput
export type StepsBlock = z.input<typeof stepsZod>
export type CalloutBlock = z.input<typeof calloutZod>
export type ImageBlock = z.input<typeof imageZod>
export type VideoBlock = z.input<typeof videoZod>
export type CodeBlock = z.input<typeof codeZod>
export type TableBlock = z.input<typeof tableZod>
export type FaqBlock = z.input<typeof faqZod>
export type LinkCardsBlock = z.input<typeof linkCardsZod>
export type DividerBlock = z.input<typeof dividerZod>

/**
 * União explícita em vez de `z.input<typeof blockZod>`: o `z.lazy` do bloco
 * recursivo `list` faz o zod perder a inferência e devolver `unknown`.
 * `blocks-registry.ts` tem um `satisfies Record<BlockType, ...>` que quebra a
 * compilação se um tipo entrar aqui e não lá.
 */
export type Block =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | StepsBlock
  | CalloutBlock
  | ImageBlock
  | VideoBlock
  | CodeBlock
  | TableBlock
  | FaqBlock
  | LinkCardsBlock
  | DividerBlock

export type BlockType = Block['type']

/** Blocos que podem aparecer dentro de steps/callout/faq. */
export type NestedBlock =
  | ParagraphBlock
  | ListBlock
  | ImageBlock
  | CodeBlock
  | TableBlock
  | DividerBlock

export type ArticleDoc = z.input<typeof articleZod>
export type SectionDoc = z.input<typeof sectionZod>
export type CollectionDoc = z.input<typeof collectionZod>
export type ContentIndexDoc = z.input<typeof contentIndexZod>
export type UiMapDoc = z.input<typeof uiMapZod>
