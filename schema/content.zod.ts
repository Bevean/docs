import { z } from 'zod'
import { blockZod } from './blocks.zod.ts'

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const slug = z.string().regex(SLUG_RE, 'slug em kebab-case, sem acento').max(60)

/** Caminho de conteúdo, com âncora opcional: "colecao/secao/artigo#ancora". */
const docRef = z.string().regex(
  /^[a-z0-9-]+(?:\/[a-z0-9-]+){0,2}(?:#[a-z0-9-]+)?$/,
  'referência inválida — use "colecao/secao/artigo" ou "colecao/artigo"'
)

export const articleZod = z.object({
  $schema: z.string().optional(),
  title: z.string().min(1).max(120),
  subtitle: z.string().min(1).max(300).optional(),
  status: z.enum(['published', 'draft']).default('published'),
  updatedAt: z.iso.date(),
  tags: z.array(z.string().min(1)).default([]),
  /** Slugs antigos desta página — viram redirect no build. */
  aliases: z.array(z.string().min(1)).default([]),
  seo: z
    .object({
      description: z.string().min(1).max(300).optional(),
      image: z.string().min(1).optional()
    })
    .optional(),
  related: z.array(docRef).max(6).default([]),
  body: z.array(blockZod).min(1)
})

export const sectionZod = z.object({
  $schema: z.string().optional(),
  title: z.string().min(1).max(80),
  description: z.string().min(1).max(300).optional(),
  icon: z.string().min(1).optional(),
  aliases: z.array(z.string().min(1)).default([]),
  /** Ordem explícita. Alfabética estaria semanticamente errada num help center. */
  articles: z.array(slug).min(1, 'seção sem artigo não deve existir')
})

/**
 * Coleção pode estar vazia — é um marcador deliberado de "em breve", e o site
 * mostra estado vazio de verdade no lugar do "0 artigos" seco. Seção vazia, ao
 * contrário, é erro estrutural: ninguém navega para uma gaveta sem nada dentro.
 */
export const collectionZod = sectionZod.omit({ articles: true }).extend({
  sections: z.array(slug).default([]),
  articles: z.array(slug).default([])
})

export const contentIndexZod = z.object({
  $schema: z.string().optional(),
  collections: z.array(slug).min(1),
  featured: z.array(docRef).max(6).default([]),
  popular: z.array(docRef).max(8).default([])
})

export const uiMapZod = z.record(
  z.string().regex(/^[a-z0-9]+(?:[._][a-z0-9]+)*$/),
  z.object({
    segments: z.array(z.string().min(1)).min(1),
    href: z.string().startsWith('/').optional()
  })
)
