/**
 * Lê `content/`, valida e produz o manifest.
 *
 * Duas passadas, porque os dois tipos de erro são diferentes:
 *  1. estrutural — cada arquivo contra o zod, isolado;
 *  2. referencial — o grafo inteiro (link órfão, imagem ausente, ordem que não
 *     bate com o disco). Nada disso é expressável em zod.
 */
import { readFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import fg from 'fast-glob'
import { imageSize } from 'image-size'
import { z } from 'zod'
import { articleZod, collectionZod, contentIndexZod, sectionZod, uiMapZod } from '../schema/content.zod.ts'
import type { ArticleDoc, Block, HeadingBlock } from '#schema'
import { computeAnchors } from '../src/content/anchors.ts'
import { blockToPlainText, getBlockContract } from '../src/content/blocks/blocks-registry.ts'
import { CONTENT_ICONS } from '../src/app/content-icons.ts'
import type {
  ArticleMeta,
  CollectionMeta,
  ContentManifest,
  ContentNode,
  Crumb,
  SectionMeta,
  TocEntry
} from '../src/content/content-types.ts'

export const CONTENT_ROOT = path.resolve(import.meta.dirname, '..', 'content', 'pt-BR')
export const PUBLIC_ROOT = path.resolve(import.meta.dirname, '..', 'public')
const HELP_BASE = '/ajuda'

export interface Issue {
  file: string
  code: string
  message: string
  level: 'error' | 'warning'
}

export interface SearchDocument {
  path: string
  url: string
  kind: 'article' | 'collection' | 'section'
  title: string
  subtitle: string
  breadcrumb: string
  headings: string
  tags: string
  body: string
}

export interface BuildResult {
  manifest: ContentManifest
  docs: Map<string, ArticleDoc>
  searchDocuments: SearchDocument[]
  issues: Issue[]
}

const rel = (file: string) => path.relative(path.resolve(import.meta.dirname, '..'), file)

function zodIssues(file: string, code: string, error: z.ZodError): Issue[] {
  return error.issues.map((i) => ({
    file: rel(file),
    code,
    level: 'error' as const,
    message: `${i.path.join('.') || '(raiz)'}: ${i.message}`
  }))
}

async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await readFile(file, 'utf8'))
}

/** Percorre a árvore inteira de blocos, entrando nos aninhados. */
function walkBlocks(blocks: Block[], visit: (block: Block) => void): void {
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

export async function buildContent(): Promise<BuildResult> {
  const issues: Issue[] = []
  const docs = new Map<string, ArticleDoc>()
  const pendingDocRefs: { file: string; docPath: string; body: Block[] }[] = []
  /**
   * Artigos que existem mas não passaram no zod. Sem isso, um único JSON
   * quebrado vira dois erros: o real e um "não existe" em quem aponta pra ele.
   */
  const parseFailed = new Set<string>()
  const collections: CollectionMeta[] = []
  const sections: Record<string, SectionMeta> = {}
  const articles: Record<string, ArticleMeta> = {}
  const byPath: Record<string, ContentNode> = {}
  const aliases: Record<string, string> = {}

  // --- _index.json -----------------------------------------------------------
  const indexFile = path.join(CONTENT_ROOT, '_index.json')
  const indexParsed = contentIndexZod.safeParse(await readJson(indexFile))
  if (!indexParsed.success) {
    return {
      manifest: emptyManifest(),
      docs,
      searchDocuments: [],
      issues: zodIssues(indexFile, 'S001', indexParsed.error)
    }
  }
  const index = indexParsed.data

  // --- _ui-map.json ----------------------------------------------------------
  const uiMapFile = path.join(CONTENT_ROOT, '_ui-map.json')
  let uiMap: ContentManifest['uiMap'] = {}
  if (existsSync(uiMapFile)) {
    const parsed = uiMapZod.safeParse(await readJson(uiMapFile))
    if (parsed.success) uiMap = parsed.data
    else issues.push(...zodIssues(uiMapFile, 'S002', parsed.error))
  }

  const registerAlias = (alias: string, target: string, file: string) => {
    if (aliases[alias] && aliases[alias] !== target) {
      issues.push({ file: rel(file), code: 'R010', level: 'error', message: `alias "${alias}" já aponta para "${aliases[alias]}"` })
      return
    }
    aliases[alias] = target
  }

  // --- coleções, seções e artigos -------------------------------------------
  for (const collectionSlug of index.collections) {
    const collectionDir = path.join(CONTENT_ROOT, collectionSlug)
    const collectionFile = path.join(collectionDir, '_collection.json')

    if (!existsSync(collectionFile)) {
      issues.push({ file: rel(collectionFile), code: 'R008', level: 'error', message: `coleção "${collectionSlug}" está no _index.json mas não existe no disco` })
      continue
    }

    const parsed = collectionZod.safeParse(await readJson(collectionFile))
    if (!parsed.success) {
      issues.push(...zodIssues(collectionFile, 'S003', parsed.error))
      continue
    }
    const collection = parsed.data

    const meta: CollectionMeta = {
      path: collectionSlug,
      url: `${HELP_BASE}/${collectionSlug}`,
      title: collection.title,
      description: collection.description,
      icon: collection.icon,
      sections: collection.sections.map((s) => `${collectionSlug}/${s}`),
      articles: collection.articles.map((a) => `${collectionSlug}/${a}`),
      articleCount: 0
    }
    checkIcon(collection.icon, collectionFile)
    collections.push(meta)
    byPath[collectionSlug] = { kind: 'collection', meta }
    for (const alias of collection.aliases) registerAlias(alias, collectionSlug, collectionFile)

    const crumbs: Crumb[] = [
      { title: 'Todas as coleções', url: HELP_BASE },
      { title: collection.title, url: meta.url }
    ]

    // Slug duplicado entre seção e artigo solto deixa a rota ambígua.
    const claimed = new Set<string>()
    for (const slug of [...collection.sections, ...collection.articles]) {
      if (claimed.has(slug)) {
        issues.push({ file: rel(collectionFile), code: 'R009', level: 'error', message: `slug "${slug}" usado por uma seção e por um artigo na mesma coleção` })
      }
      claimed.add(slug)
    }

    for (const slug of collection.articles) {
      const file = path.join(collectionDir, `${slug}.json`)
      await ingestArticle({ file, collectionSlug, sectionSlug: undefined, slug, crumbs })
    }

    for (const sectionSlug of collection.sections) {
      const sectionDir = path.join(collectionDir, sectionSlug)
      const sectionFile = path.join(sectionDir, '_section.json')

      if (!existsSync(sectionFile)) {
        issues.push({ file: rel(sectionFile), code: 'R008', level: 'error', message: `seção "${sectionSlug}" listada em _collection.json mas não existe no disco` })
        continue
      }

      const sectionParsed = sectionZod.safeParse(await readJson(sectionFile))
      if (!sectionParsed.success) {
        issues.push(...zodIssues(sectionFile, 'S004', sectionParsed.error))
        continue
      }
      const section = sectionParsed.data
      const sectionPath = `${collectionSlug}/${sectionSlug}`

      const sectionMeta: SectionMeta = {
        path: sectionPath,
        url: `${HELP_BASE}/${sectionPath}`,
        title: section.title,
        description: section.description,
        icon: section.icon,
        collection: collectionSlug,
        articles: section.articles.map((a) => `${sectionPath}/${a}`)
      }
      checkIcon(section.icon, sectionFile)
      sections[sectionPath] = sectionMeta
      byPath[sectionPath] = { kind: 'section', meta: sectionMeta }
      for (const alias of section.aliases) registerAlias(alias, sectionPath, sectionFile)

      const sectionCrumbs: Crumb[] = [...crumbs, { title: section.title, url: sectionMeta.url }]
      for (const slug of section.articles) {
        const file = path.join(sectionDir, `${slug}.json`)
        await ingestArticle({ file, collectionSlug, sectionSlug, slug, crumbs: sectionCrumbs })
      }

      await reportOrphans(sectionDir, section.articles, sectionFile)
    }

    await reportOrphans(collectionDir, collection.articles, collectionFile)
    meta.articleCount =
      meta.articles.length +
      meta.sections.reduce((sum, s) => sum + (sections[s]?.articles.length ?? 0), 0)
  }

  async function ingestArticle(args: {
    file: string
    collectionSlug: string
    sectionSlug: string | undefined
    slug: string
    crumbs: Crumb[]
  }): Promise<void> {
    const { file, collectionSlug, sectionSlug, slug, crumbs } = args

    if (!existsSync(file)) {
      issues.push({ file: rel(file), code: 'R008', level: 'error', message: `artigo "${slug}" está listado mas não existe no disco` })
      return
    }

    const docPathOnFailure = [collectionSlug, sectionSlug, slug].filter(Boolean).join('/')
    const parsed = articleZod.safeParse(await readJson(file))
    if (!parsed.success) {
      issues.push(...zodIssues(file, 'S005', parsed.error))
      parseFailed.add(docPathOnFailure)
      return
    }
    const doc = parsed.data as ArticleDoc

    const docPath = docPathOnFailure
    const body = doc.body as Block[]
    const anchors = computeAnchors(body)

    const toc: TocEntry[] = []
    walkBlocks(body, (block) => {
      const contract = getBlockContract(block.type)
      if (!contract) {
        issues.push({ file: rel(file), code: 'S006', level: 'error', message: `bloco "${block.type}" não existe no registry` })
        return
      }
      toc.push(...(contract.collectToc?.(block, buildCtx(anchors)) ?? []))
    })

    if (body.length > 8 && toc.length === 0) {
      issues.push({ file: rel(file), code: 'L008', level: 'warning', message: 'artigo longo sem nenhum heading — o sumário fica vazio' })
    }
    if (new Date(doc.updatedAt) > new Date()) {
      issues.push({ file: rel(file), code: 'L005', level: 'error', message: `updatedAt "${doc.updatedAt}" está no futuro` })
    }

    const meta: ArticleMeta = {
      path: docPath,
      url: `${HELP_BASE}/${docPath}`,
      title: doc.title,
      subtitle: doc.subtitle,
      updatedAt: doc.updatedAt,
      tags: doc.tags ?? [],
      collection: collectionSlug,
      section: sectionSlug ? `${collectionSlug}/${sectionSlug}` : undefined,
      breadcrumb: [...crumbs, { title: doc.title, url: `${HELP_BASE}/${docPath}` }],
      toc
    }

    articles[docPath] = meta
    byPath[docPath] = { kind: 'article', meta }
    docs.set(docPath, doc)
    for (const alias of doc.aliases ?? []) registerAlias(alias, docPath, file)

    await validateRefs(file, docPath, body)
  }

  /**
   * Ícone desconhecido rendereria o fallback em silêncio, e ninguém repara num
   * ícone genérico. Melhor quebrar o build com a lista do que existe.
   */
  function checkIcon(icon: string | undefined, file: string): void {
    if (!icon || icon in CONTENT_ICONS) return
    issues.push({
      file: rel(file),
      code: 'R012',
      level: 'error',
      message: `ícone "${icon}" não existe. Registre-o em src/app/content-icons.ts, ou use um destes: ${Object.keys(CONTENT_ICONS).sort().join(', ')}`
    })
  }

  /** Arquivo no disco que ninguém listou é conteúdo que nunca aparece no site. */
  async function reportOrphans(dir: string, listed: string[], owner: string): Promise<void> {
    const found = await fg('*.json', { cwd: dir, onlyFiles: true })
    for (const name of found) {
      if (name.startsWith('_')) continue
      const slug = name.replace(/\.json$/, '')
      if (!listed.includes(slug)) {
        issues.push({ file: rel(path.join(dir, name)), code: 'R007', level: 'error', message: `artigo "${slug}" não está listado em ${path.basename(owner)} — não apareceria no site` })
      }
    }
  }

  async function validateRefs(file: string, docPath: string, body: Block[]): Promise<void> {
    const articleDir = path.dirname(file)

    walkBlocks(body, (block) => {
      const refs = getBlockContract(block.type)?.collectRefs?.(block) ?? []
      for (const ref of refs) {
        if (ref.kind === 'uiPath' && !uiMap[ref.value]) {
          issues.push({ file: rel(file), code: 'R004', level: 'error', message: `uiPath "${ref.value}" não existe em _ui-map.json` })
        }
        if (ref.kind === 'asset') {
          const asset = path.resolve(articleDir, ref.value)
          if (!existsSync(asset)) {
            issues.push({ file: rel(file), code: 'R005', level: 'error', message: `imagem "${ref.value}" não existe` })
          } else if (block.type === 'image') {
            try {
              const real = imageSize(readFileSync(asset))
              if (real.width !== block.width || real.height !== block.height) {
                issues.push({ file: rel(file), code: 'R006', level: 'error', message: `width/height do bloco (${block.width}×${block.height}) não batem com o arquivo (${real.width}×${real.height})` })
              }
            } catch {
              issues.push({ file: rel(file), code: 'R006', level: 'warning', message: `não foi possível ler as dimensões de "${ref.value}"` })
            }
          }
        }
      }
    })

    // Refs de documento são checadas depois, quando todos os artigos existem.
    pendingDocRefs.push({ file: rel(file), docPath, body })
  }

  const manifest: ContentManifest = {
    collections,
    sections,
    articles,
    byPath,
    featured: index.featured,
    popular: index.popular,
    uiMap,
    aliases
  }

  // Segunda passada: agora o grafo inteiro existe.
  for (const pending of pendingDocRefs) {
    walkBlocks(pending.body, (block) => {
      for (const ref of getBlockContract(block.type)?.collectRefs?.(block) ?? []) {
        if (ref.kind !== 'doc') continue
        const target = ref.value.split('#')[0]
        if (!byPath[target] && !parseFailed.has(target)) {
          issues.push({ file: pending.file, code: 'R001', level: 'error', message: `link interno "${ref.value}" não existe${suggest(target, Object.keys(byPath))}` })
        }
      }
    })
  }

  for (const [docPath, doc] of docs) {
    for (const ref of doc.related ?? []) {
      const target = ref.split('#')[0]
      if (!byPath[target] && !parseFailed.has(target)) {
        issues.push({ file: `${docPath}.json`, code: 'R003', level: 'error', message: `related "${ref}" não existe${suggest(target, Object.keys(byPath))}` })
      }
    }
  }

  for (const ref of [...index.featured, ...index.popular]) {
    if (!byPath[ref.split('#')[0]] && !parseFailed.has(ref.split('#')[0])) {
      issues.push({ file: rel(indexFile), code: 'R003', level: 'error', message: `"${ref}" não existe` })
    }
  }

  for (const [alias, target] of Object.entries(aliases)) {
    if (byPath[alias]) {
      issues.push({ file: rel(indexFile), code: 'R010', level: 'error', message: `alias "${alias}" (→ ${target}) colide com um caminho real` })
    }
  }

  return { manifest, docs, searchDocuments: buildSearchDocuments(manifest, docs), issues }
}

/**
 * O texto indexado sai do `toPlainText` de cada bloco — o mesmo registry que
 * renderiza. Assim busca e tela nunca divergem.
 */
function buildSearchDocuments(
  manifest: ContentManifest,
  docs: Map<string, ArticleDoc>
): SearchDocument[] {
  const documents: SearchDocument[] = []

  for (const collection of manifest.collections) {
    documents.push({
      path: collection.path,
      url: collection.url,
      kind: 'collection',
      title: collection.title,
      subtitle: collection.description ?? '',
      breadcrumb: 'Central de Ajuda',
      headings: '',
      tags: '',
      body: collection.description ?? ''
    })
  }

  for (const section of Object.values(manifest.sections)) {
    documents.push({
      path: section.path,
      url: section.url,
      kind: 'section',
      title: section.title,
      subtitle: section.description ?? '',
      breadcrumb: manifest.byPath[section.collection]?.meta.title ?? '',
      headings: '',
      tags: '',
      body: section.description ?? ''
    })
  }

  for (const [docPath, doc] of docs) {
    const meta = manifest.articles[docPath]
    if (!meta) continue

    const parts: string[] = []
    walkBlocks(doc.body as Block[], (block) => {
      const text = blockToPlainText(block)
      if (text) parts.push(text)
    })

    documents.push({
      path: docPath,
      url: meta.url,
      kind: 'article',
      title: meta.title,
      subtitle: meta.subtitle ?? '',
      breadcrumb: meta.breadcrumb.slice(1, -1).map((c) => c.title).join(' › '),
      headings: meta.toc.map((t) => t.text).join(' '),
      tags: meta.tags.join(' '),
      body: parts.join(' ')
    })
  }

  return documents
}

function buildCtx(anchors: Map<HeadingBlock, string>) {
  // Só `anchors` é consultado por `collectToc`/`collectRefs`; os resolvers ficam
  // inertes de propósito, para um bloco que dependa deles em build falhar alto.
  return {
    anchors,
    resolveRef: () => ({ href: '', label: '', exists: false }),
    resolveAsset: (src: string) => src,
    resolveUiPath: () => null
  } as never
}

function suggest(target: string, candidates: string[]): string {
  const best = candidates
    .map((c) => ({ c, d: distance(target, c) }))
    .filter(({ d }) => d <= Math.max(3, Math.floor(target.length * 0.3)))
    .sort((a, b) => a.d - b.d)[0]
  return best ? ` — você quis dizer "${best.c}"?` : ''
}

function distance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let corner = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const next = Math.min(prev[j] + 1, prev[j - 1] + 1, corner + (a[i - 1] === b[j - 1] ? 0 : 1))
      corner = prev[j]
      prev[j] = next
    }
  }
  return prev[b.length]
}

function emptyManifest(): ContentManifest {
  return {
    collections: [],
    sections: {},
    articles: {},
    byPath: {},
    featured: [],
    popular: [],
    uiMap: {},
    aliases: {}
  }
}
