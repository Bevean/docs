import { z } from 'zod'
import { inlineContentZod } from './inline.zod.ts'

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const languages = ['json', 'bash', 'http', 'html', 'javascript', 'typescript', 'csv', 'text'] as const
const calloutVariants = ['info', 'tip', 'success', 'warning', 'danger'] as const

/** Emoji no texto de um heading é estrutura disfarçada — use `icon`/`callout`/`steps`. */
const noLeadingEmoji = (value: unknown) => {
  if (typeof value !== 'string') return true
  return !/^\s*\p{Extended_Pictographic}/u.test(value)
}

export const paragraphZod = z.object({
  type: z.literal('paragraph'),
  content: inlineContentZod
})

export const headingZod = z.object({
  type: z.literal('heading'),
  level: z.union([z.literal(2), z.literal(3)]),
  content: inlineContentZod.refine(noLeadingEmoji, {
    message: 'heading não começa com emoji — use `icon`, ou um bloco callout/steps'
  }),
  icon: z.string().min(1).optional(),
  anchor: z.string().regex(slugRe).optional()
})

export const imageZod = z.object({
  type: z.literal('image'),
  src: z.string().min(1),
  alt: z.string().min(1, 'alt vazio: descreva a imagem ou remova o bloco'),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  caption: inlineContentZod.optional(),
  frame: z.enum(['none', 'shadow', 'browser']).default('shadow'),
  zoomable: z.boolean().default(true),
  /** Screenshot de painel envelhece; alimenta o relatório de captura velha. */
  capturedAt: z.iso.date().optional()
})

export const codeZod = z.object({
  type: z.literal('code'),
  language: z.enum(languages).default('text'),
  code: z.string().min(1),
  filename: z.string().min(1).optional()
})

export const videoZod = z.object({
  type: z.literal('video'),
  provider: z.enum(['youtube', 'loom']),
  videoId: z.string().min(1),
  title: z.string().min(1, 'vídeo precisa de título para leitor de tela'),
  aspect: z.enum(['16:9', '4:3']).default('16:9')
})

export const dividerZod = z.object({ type: z.literal('divider') })

const tableCellZod = z.object({
  content: inlineContentZod,
  align: z.enum(['left', 'center', 'right']).optional()
})

export const tableZod = z
  .object({
    type: z.literal('table'),
    caption: z.string().min(1).optional(),
    head: z.array(tableCellZod).min(1).optional(),
    rows: z.array(z.array(tableCellZod).min(1)).min(1)
  })
  .refine(
    (t) => {
      const width = t.head?.length ?? t.rows[0].length
      return t.rows.every((r) => r.length === width)
    },
    { message: 'todas as linhas precisam ter o mesmo número de colunas do cabeçalho' }
  )

// --- blocos recursivos -------------------------------------------------------
// `z.lazy` sem anotação explícita de tipo faz o TypeScript entrar em recursão
// infinita. Os tipos são declarados à mão e o `satisfies` garante que schema e
// tipo não divirjam.

export interface ListItemInput {
  content: z.input<typeof inlineContentZod>
  children?: ListInput
}
export interface ListInput {
  type: 'list'
  style: 'bullet' | 'ordered'
  items: ListItemInput[]
}

// Só o item é lazy. Assim `listZod` continua sendo um ZodObject com literal em
// `type`, e pode entrar no discriminatedUnion — que dá mensagem de erro
// decente ("tipo de bloco desconhecido") em vez de "Invalid input".
const listItemZod: z.ZodType<ListItemInput> = z.lazy(() =>
  z.object({ content: inlineContentZod, children: listZod.optional() })
) as z.ZodType<ListItemInput>

export const listZod = z.object({
  type: z.literal('list'),
  style: z.enum(['bullet', 'ordered']),
  items: z.array(listItemZod).min(1)
})

/** Blocos permitidos dentro de steps/callout/faq. Sem steps dentro de steps. */
export type NestedBlockInput =
  | z.input<typeof paragraphZod>
  | z.input<typeof imageZod>
  | z.input<typeof codeZod>
  | z.input<typeof tableZod>
  | z.input<typeof dividerZod>
  | ListInput

const nestedBodyZod = z
  .array(
    z.discriminatedUnion('type', [paragraphZod, listZod, imageZod, codeZod, tableZod, dividerZod], {
      error: 'tipo de bloco desconhecido aqui dentro — permitidos: paragraph, list, image, code, table, divider'
    })
  )
  .min(1)

export const stepsZod = z.object({
  type: z.literal('steps'),
  startAt: z.number().int().positive().default(1),
  items: z
    .array(z.object({ title: inlineContentZod, body: nestedBodyZod.optional() }))
    .min(2, 'um passo sozinho não é uma sequência — use um parágrafo')
})

export const calloutZod = z.object({
  type: z.literal('callout'),
  variant: z.enum(calloutVariants),
  title: z.string().min(1).optional(),
  body: nestedBodyZod
})

export const faqZod = z.object({
  type: z.literal('faq'),
  items: z.array(z.object({ question: z.string().min(1), answer: nestedBodyZod })).min(1)
})

export const linkCardsZod = z.object({
  type: z.literal('linkCards'),
  title: z.string().min(1).optional(),
  items: z
    .array(
      z.object({
        ref: z.string().min(1),
        description: z.string().min(1).optional(),
        icon: z.string().min(1).optional()
      })
    )
    .min(1)
})

export const BLOCK_TYPES = [
  'paragraph',
  'heading',
  'list',
  'steps',
  'callout',
  'image',
  'video',
  'code',
  'table',
  'faq',
  'linkCards',
  'divider'
] as const

export const blockZod = z.discriminatedUnion(
  'type',
  [
    paragraphZod,
    headingZod,
    listZod,
    stepsZod,
    calloutZod,
    imageZod,
    videoZod,
    codeZod,
    tableZod,
    faqZod,
    linkCardsZod,
    dividerZod
  ],
  { error: `tipo de bloco desconhecido — os válidos são: ${BLOCK_TYPES.join(', ')}` }
)
