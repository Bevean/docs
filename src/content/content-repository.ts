import type { ArticleDoc } from '#schema'
import manifestJson from './generated/manifest.json'
import type { ArticleMeta, CollectionMeta, ContentManifest, ContentNode, SectionMeta } from './content-types.ts'

export const manifest = manifestJson as unknown as ContentManifest

/**
 * Corpos dos artigos.
 *
 * Eager por enquanto: o render do prerender é síncrono, e um glob lazy exigiria
 * Suspense com streaming no build. Quando a biblioteca crescer, a troca para
 * chunk por artigo acontece aqui dentro — `getArticle` é a única porta.
 */
const docs = import.meta.glob<ArticleDoc>(
  ['/content/pt-BR/**/*.json', '!/content/pt-BR/**/_*.json'],
  { eager: true, import: 'default' }
)

const byPath = new Map<string, ArticleDoc>(
  Object.entries(docs).map(([file, doc]) => [
    file.replace('/content/pt-BR/', '').replace(/\.json$/, ''),
    doc
  ])
)

export function getArticle(path: string): { meta: ArticleMeta; doc: ArticleDoc } | null {
  const meta = manifest.articles[path]
  const doc = byPath.get(path)
  return meta && doc ? { meta, doc } : null
}

export function getNode(path: string): ContentNode | null {
  return manifest.byPath[path] ?? null
}

export function getCollection(slug: string): CollectionMeta | null {
  return manifest.collections.find((c) => c.path === slug) ?? null
}

export function getSection(path: string): SectionMeta | null {
  return manifest.sections[path] ?? null
}

/** Artigos irmãos, para a barra lateral da página de artigo. */
export function getSiblings(meta: ArticleMeta): { title: string; articles: ArticleMeta[] } | null {
  const parent = meta.section
    ? manifest.sections[meta.section]
    : manifest.collections.find((c) => c.path === meta.collection)
  if (!parent) return null

  const articles = parent.articles
    .map((p) => manifest.articles[p])
    .filter((a): a is ArticleMeta => Boolean(a))

  return articles.length > 1 ? { title: parent.title, articles } : null
}

export function resolveContentRef(ref: string) {
  const [target, anchor] = ref.split('#')
  const node = manifest.byPath[target]
  if (!node) return { href: '', label: ref, exists: false }
  return {
    href: anchor ? `${node.meta.url}#${anchor}` : node.meta.url,
    label: node.meta.title,
    exists: true
  }
}

export function resolveUiPath(ref: string) {
  return manifest.uiMap[ref] ?? null
}
