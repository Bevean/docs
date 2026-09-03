import type { ArticleDoc } from '#schema'
import { buildBreadcrumb } from './breadcrumb.ts'
import manifestJson from './generated/manifest.json'
import type {
  ArticleMeta,
  CollectionMeta,
  ContentManifest,
  ContentNode,
  Crumb,
  SectionMeta
} from './content-types.ts'

export const manifest = manifestJson as unknown as ContentManifest

/**
 * Corpos dos artigos, um chunk por artigo.
 *
 * Glob preguiçoso: o corpo de um artigo só desce quando alguém abre aquele
 * artigo. Eager custava ~1,5 KB gzip no bundle inicial por artigo escrito, o
 * que fazia a biblioteca crescer contra o orçamento de JS em vez de contra o
 * disco.
 *
 * O preço é que ler um corpo passou a ser assíncrono, e o prerender é
 * síncrono. Daí a divisão em duas portas: `loadArticleDoc` aquece o cache
 * (assíncrono, chamado antes de renderizar) e `getArticle` lê do cache
 * (síncrono, chamado durante o render). Quem monta uma rota nova precisa
 * passar por `preloadRouteContent` antes de renderizar.
 */
const loaders = import.meta.glob<ArticleDoc>(
  ['/content/pt-BR/**/*.json', '!/content/pt-BR/**/_*.json'],
  { import: 'default' }
)

const loaderByPath = new Map<string, () => Promise<ArticleDoc>>(
  Object.entries(loaders).map(([file, load]) => [
    file.replace('/content/pt-BR/', '').replace(/\.json$/, ''),
    load
  ])
)

const docCache = new Map<string, ArticleDoc>()
const inFlight = new Map<string, Promise<ArticleDoc>>()

/**
 * Carrega o corpo e o guarda no cache. A promessa é memoizada porque `use()`
 * exige a MESMA promessa entre renders — uma nova a cada render suspenderia
 * para sempre.
 */
export function loadArticleDoc(path: string): Promise<ArticleDoc> {
  const cached = docCache.get(path)
  if (cached) return Promise.resolve(cached)

  const existing = inFlight.get(path)
  if (existing) return existing

  const load = loaderByPath.get(path)
  if (!load) return Promise.reject(new Error(`artigo "${path}" não existe`))

  const promise = load()
    .then((doc) => {
      docCache.set(path, doc)
      inFlight.delete(path)
      return doc
    })
    .catch((error: unknown) => {
      // Sem limpar, um chunk que falhou (deploy novo, rede caída) ficaria
      // rejeitado para sempre e nem um reload da rota tentaria de novo.
      inFlight.delete(path)
      throw error
    })

  inFlight.set(path, promise)
  return promise
}

/** Corpo já em cache, ou `undefined`. Não dispara carregamento. */
export function getArticleDoc(path: string): ArticleDoc | undefined {
  return docCache.get(path)
}

export function getArticleMeta(path: string): ArticleMeta | undefined {
  return manifest.articles[path]
}

/** Meta + corpo, ambos síncronos. `null` se o corpo ainda não foi carregado. */
export function getArticle(path: string): { meta: ArticleMeta; doc: ArticleDoc } | null {
  const meta = manifest.articles[path]
  const doc = docCache.get(path)
  return meta && doc ? { meta, doc } : null
}

/** Caminho de conteúdo de uma URL do site. `/ajuda/a/b/c` → `a/b/c`. */
export function contentPathFromUrl(url: string): string | null {
  const pathname = url.split('?')[0].split('#')[0]
  if (!pathname.startsWith('/ajuda')) return null
  return pathname.slice('/ajuda'.length).replace(/^\/+|\/+$/g, '') || null
}

/**
 * Aquece o cache do que a rota vai precisar renderizar de forma síncrona.
 * Chamado pelo prerender antes do `renderToString` e pelo cliente antes do
 * `hydrateRoot` — sem isso o React suspenderia no meio de um render síncrono.
 */
export async function preloadRouteContent(url: string): Promise<void> {
  const path = contentPathFromUrl(url)
  if (!path || !manifest.articles[path]) return
  await loadArticleDoc(path)
}

/**
 * Índice de caminho → nó, reconstruído em memória.
 *
 * Vinha serializado no manifest (`byPath`), onde era uma cópia integral de
 * `collections` + `sections` + `articles`: em JSON não há compartilhamento de
 * referência, então cada meta viajava duas vezes. Aqui as entradas apontam
 * para os mesmos objetos.
 */
const nodesByPath = new Map<string, ContentNode>()
for (const meta of manifest.collections) nodesByPath.set(meta.path, { kind: 'collection', meta })
for (const meta of Object.values(manifest.sections)) nodesByPath.set(meta.path, { kind: 'section', meta })
for (const meta of Object.values(manifest.articles)) nodesByPath.set(meta.path, { kind: 'article', meta })

export function getNode(path: string): ContentNode | null {
  return nodesByPath.get(path) ?? null
}

export function getCollection(slug: string): CollectionMeta | null {
  return manifest.collections.find((c) => c.path === slug) ?? null
}

export function getSection(path: string): SectionMeta | null {
  return manifest.sections[path] ?? null
}

export function getBreadcrumb(meta: ArticleMeta): Crumb[] {
  return buildBreadcrumb(meta, manifest)
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
  const node = nodesByPath.get(target)
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
