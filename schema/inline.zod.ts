import { z } from 'zod'

/**
 * Nós inline no formato de documento do TipTap/ProseMirror.
 *
 * Não é capricho: o RichText do @pollux/react é TipTap, e o editor visual da
 * fase futura será TipTap também. Qualquer outro formato exigiria um conversor
 * bidirecional com perda entre o arquivo e o editor.
 */
export const markZod = z.discriminatedUnion('type', [
  z.object({ type: z.literal('bold') }),
  z.object({ type: z.literal('italic') }),
  z.object({ type: z.literal('code') }),
  z.object({
    type: z.literal('link'),
    attrs: z.object({ href: z.string().regex(/^https:\/\//, 'link externo precisa ser https://') })
  }),
  z.object({
    type: z.literal('docLink'),
    attrs: z.object({ ref: z.string().min(1) })
  })
])

/** `uiPath` e `kbd` são nós atômicos (widgets), não faixas de texto marcadas. */
export const inlineNodeZod = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    text: z.string().min(1),
    marks: z.array(markZod).optional()
  }),
  z.object({ type: z.literal('hardBreak') }),
  z.object({
    type: z.literal('uiPath'),
    attrs: z
      .object({
        ref: z.string().optional(),
        segments: z.array(z.string().min(1)).min(1).optional()
      })
      .refine((a) => Boolean(a.ref) !== Boolean(a.segments), {
        message: 'uiPath precisa de `ref` (do _ui-map.json) OU `segments`, nunca os dois'
      })
  }),
  z.object({
    type: z.literal('kbd'),
    attrs: z.object({ keys: z.array(z.string().min(1)).min(1) })
  })
])

/**
 * O que o autor escreve. Uma string vira um nó de texto sem marcas.
 *
 * Esse atalho é o que torna a autoria sem markdown viável: sem ele, um
 * parágrafo sem nenhuma ênfase custaria três linhas de JSON. A normalização
 * acontece no `buildModel` de cada bloco, como no editor de e-mail.
 */
export const inlineContentZod = z.union([z.string().min(1), z.array(inlineNodeZod)])
