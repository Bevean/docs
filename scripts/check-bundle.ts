/**
 * Confere invariantes do bundle publicado.
 *
 * O lint impede o import errado; isto confere o resultado, que é o que importa
 * — inclusive contra uma dependência que arraste zod sem ninguém perceber.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'

const DIST = path.resolve(import.meta.dirname, '..', 'dist')

/** Assinaturas do zod que sobrevivem à minificação. */
const ZOD_MARKERS = ['ZodError', '$ZodError', 'invalid_union_discriminator']
const JS_BUDGET_GZIP_KB = 150

/**
 * O que o navegador baixa para abrir a primeira página: o chunk de entrada e
 * os que o Vite pré-carrega junto com ele.
 *
 * Antes isto somava `assets/*.js`, o que confundia duas coisas diferentes: o
 * custo de abrir o site e o tamanho da biblioteca. Com um chunk por artigo,
 * essa soma cresceria a cada artigo escrito e estouraria o orçamento sem que
 * nenhuma página ficasse mais lenta.
 */
async function initialChunks(): Promise<string[]> {
  const html = await readFile(path.join(DIST, 'index.html'), 'utf8')
  const refs = new Set<string>()

  for (const match of html.matchAll(/<script[^>]+type="module"[^>]+src="([^"]+)"/g)) {
    refs.add(match[1])
  }
  for (const match of html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g)) {
    refs.add(match[1])
  }

  const files = [...refs].filter((ref) => ref.endsWith('.js')).map((ref) => path.join(DIST, ref))

  if (files.length === 0) {
    throw new Error('nenhum chunk de entrada encontrado no index.html — o template mudou?')
  }
  return files
}

const allChunks = await fg('assets/*.js', { cwd: DIST, absolute: true })
const failures: string[] = []

for (const file of allChunks) {
  const source = await readFile(file, 'utf8')
  const found = ZOD_MARKERS.filter((marker) => source.includes(marker))
  if (found.length > 0) {
    failures.push(`${path.basename(file)}: zod vazou para o bundle (${found.join(', ')})`)
  }
}

const { gzipSync } = await import('node:zlib')
const gzipKb = async (files: string[]) => {
  let total = 0
  for (const file of files) total += gzipSync(await readFile(file)).byteLength
  return total / 1024
}

const entry = await initialChunks()
const initialKb = await gzipKb(entry)
const totalKb = await gzipKb(allChunks)

if (initialKb > JS_BUDGET_GZIP_KB) {
  failures.push(
    `carregamento inicial em ${initialKb.toFixed(1)} KB gzip, acima do orçamento de ${JS_BUDGET_GZIP_KB} KB`
  )
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`✖ ${failure}`)
  process.exit(1)
}

const lazy = allChunks.length - entry.length
console.log(
  `✔ bundle ok — inicial ${initialKb.toFixed(1)} KB gzip de ${JS_BUDGET_GZIP_KB} KB ` +
    `(${entry.length} chunk(s)), mais ${lazy} sob demanda somando ${(totalKb - initialKb).toFixed(1)} KB, sem zod`
)
