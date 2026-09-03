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

const files = await fg('assets/*.js', { cwd: DIST, absolute: true })
const failures: string[] = []

for (const file of files) {
  const source = await readFile(file, 'utf8')
  const found = ZOD_MARKERS.filter((marker) => source.includes(marker))
  if (found.length > 0) {
    failures.push(`${path.basename(file)}: zod vazou para o bundle (${found.join(', ')})`)
  }
}

const { gzipSync } = await import('node:zlib')
let totalGzip = 0
for (const file of files) {
  totalGzip += gzipSync(await readFile(file)).byteLength
}
const totalKb = totalGzip / 1024

if (totalKb > JS_BUDGET_GZIP_KB) {
  failures.push(`JS em ${totalKb.toFixed(1)} KB gzip, acima do orçamento de ${JS_BUDGET_GZIP_KB} KB`)
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`✖ ${failure}`)
  process.exit(1)
}

console.log(`✔ bundle ok — ${files.length} chunk(s), ${totalKb.toFixed(1)} KB gzip, sem zod`)
