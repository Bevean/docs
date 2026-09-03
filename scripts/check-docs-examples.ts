/**
 * Valida os exemplos de JSON do AGENTS.md contra o schema real.
 *
 * O AGENTS.md é a fonte que um agente lê antes de escrever conteúdo. Um exemplo
 * desatualizado ali não é um typo: é uma instrução errada, que vira artigo
 * errado. Como o schema muda mais rápido que a documentação, a única defesa é
 * conferir os dois juntos no mesmo portão.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { blockZod } from '../schema/blocks.zod.ts'

const DOC = path.resolve(import.meta.dirname, '..', 'AGENTS.md')
const source = await readFile(DOC, 'utf8')

const snippets = [...source.matchAll(/```json\n([\s\S]*?)```/g)].map((match, index) => ({
  index,
  raw: match[1],
  // Número da linha, para o erro apontar para um lugar de verdade.
  line: source.slice(0, match.index).split('\n').length
}))

const failures: string[] = []

for (const snippet of snippets) {
  let parsed: unknown
  try {
    parsed = JSON.parse(snippet.raw)
  } catch (error) {
    failures.push(`AGENTS.md:${snippet.line}  JSON malformado — ${(error as Error).message}`)
    continue
  }

  const result = blockZod.safeParse(parsed)
  if (!result.success) {
    const detail = result.error.issues
      .map((issue) => `${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
      .join('; ')
    failures.push(`AGENTS.md:${snippet.line}  ${detail}`)
  }
}

if (snippets.length === 0) {
  console.error('✖ nenhum exemplo json encontrado no AGENTS.md — o formato do doc mudou?')
  process.exit(1)
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`✖ ${failure}`)
  console.error(`\n${failures.length} exemplo(s) do AGENTS.md não batem com o schema.`)
  process.exit(1)
}

console.log(`✔ ${snippets.length} exemplos do AGENTS.md conferem com o schema`)
