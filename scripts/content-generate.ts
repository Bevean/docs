/**
 * Gera os artefatos que o app consome a partir de `content/`.
 *
 * Escreve um arquivo de verdade em vez de servir um módulo virtual do Vite:
 * o manifest fica inspecionável, o plugin não precisa importar o registry (que
 * é TSX) dentro do bundle da config, e um bug fica fácil de diagnosticar.
 */
import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import MiniSearch from 'minisearch'
import { buildContent, CONTENT_ROOT, PUBLIC_ROOT } from './content-build.ts'
import { SEARCH_INDEX_VERSION, searchOptions } from '../src/search/search-options.ts'
import type { SearchDocument } from './content-build.ts'

const GENERATED_DIR = path.resolve(import.meta.dirname, '..', 'src', 'content', 'generated')

export async function generate({ silent = false } = {}): Promise<number> {
  const { manifest, searchDocuments, issues } = await buildContent()
  const errors = issues.filter((i) => i.level === 'error')

  for (const issue of issues) {
    const line = `${issue.file}\n  ${issue.level === 'error' ? 'error' : 'warn '}  ${issue.code}  ${issue.message}`
    if (issue.level === 'error') console.error(line)
    else if (!silent) console.warn(line)
  }

  if (errors.length) {
    console.error(`\n✖ ${errors.length} erro(s) de conteúdo — manifest não gerado`)
    return 1
  }

  await mkdir(GENERATED_DIR, { recursive: true })
  await writeFile(path.join(GENERATED_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')
  await copyAssets()
  await writeSearchIndex(searchDocuments)

  if (!silent) {
    console.log(
      `✔ manifest gerado — ${manifest.collections.length} coleções, ${Object.keys(manifest.articles).length} artigos`
    )
  }
  return 0
}

/**
 * As imagens ficam junto do artigo (`ferramentas/assets/x.png`) porque é assim
 * que se escreve conteúdo. Servi-las é outro problema: aqui elas são espelhadas
 * em `public/content-assets/`, que é derivado e não entra no git.
 */
const ASSETS_OUT = path.join(PUBLIC_ROOT, 'content-assets')

/**
 * Índice pronto: o cliente só faz `loadJSON`, sem pagar a indexação. Um teto
 * explícito porque índice de busca é o artefato que cresce em silêncio.
 */
const SEARCH_INDEX_LIMIT_BYTES = 1_500_000

async function writeSearchIndex(documents: SearchDocument[]): Promise<void> {
  const index = new MiniSearch(searchOptions as never)
  index.addAll(documents)

  const serialized = JSON.stringify({ version: SEARCH_INDEX_VERSION, index: index.toJSON() })
  if (serialized.length > SEARCH_INDEX_LIMIT_BYTES) {
    throw new Error(
      `índice de busca com ${(serialized.length / 1e6).toFixed(2)} MB, acima do teto de ${SEARCH_INDEX_LIMIT_BYTES / 1e6} MB. ` +
        'Tire o campo `body` do índice ou migre para Pagefind.'
    )
  }

  await mkdir(PUBLIC_ROOT, { recursive: true })
  await writeFile(path.join(PUBLIC_ROOT, 'search-index.json'), serialized, 'utf8')
}

async function copyAssets(): Promise<void> {
  await rm(ASSETS_OUT, { recursive: true, force: true })
  const files = await fg('**/assets/**/*', { cwd: CONTENT_ROOT, onlyFiles: true })
  for (const file of files) {
    const dest = path.join(ASSETS_OUT, file)
    await mkdir(path.dirname(dest), { recursive: true })
    await cp(path.join(CONTENT_ROOT, file), dest)
  }
}

if (import.meta.filename === process.argv[1]) {
  process.exit(await generate())
}
