/**
 * Portão do build: JSON inválido não vira site.
 *
 * Roda no `prebuild` e como job próprio no CI, para quem escreve conteúdo ver o
 * erro sem esperar o build inteiro.
 */
import { buildContent } from './content-build.ts'

const { manifest, issues } = await buildContent()

const errors = issues.filter((i) => i.level === 'error')
const warnings = issues.filter((i) => i.level === 'warning')

for (const issue of [...errors, ...warnings]) {
  const tag = issue.level === 'error' ? 'error' : 'warn '
  console.log(`${issue.file}\n  ${tag}  ${issue.code}  ${issue.message}`)
}

const articleCount = Object.keys(manifest.articles).length
const summary = `${manifest.collections.length} coleções, ${Object.keys(manifest.sections).length} seções, ${articleCount} artigos`

if (errors.length) {
  console.error(`\n✖ ${errors.length} erro(s), ${warnings.length} aviso(s) — ${summary}`)
  process.exit(1)
}

console.log(`✔ conteúdo válido — ${summary}${warnings.length ? `, ${warnings.length} aviso(s)` : ''}`)
