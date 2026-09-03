/**
 * Cria o esqueleto de um artigo já ligado na coleção/seção certa.
 *
 * Uso: pnpm content:new ferramentas/cashback
 *      pnpm content:new configuracoes/whatsapp-oficial/conectar-numero
 */
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { CONTENT_ROOT } from './content-build.ts'

const target = process.argv[2]

if (!target || !/^[a-z0-9-]+(\/[a-z0-9-]+){1,2}$/.test(target)) {
  console.error('uso: pnpm content:new <colecao>/<slug> ou <colecao>/<secao>/<slug>')
  process.exit(1)
}

const parts = target.split('/')
const slug = parts.at(-1)!
const parentDir = path.join(CONTENT_ROOT, ...parts.slice(0, -1))
const parentFile = path.join(parentDir, parts.length === 2 ? '_collection.json' : '_section.json')
const articleFile = path.join(parentDir, `${slug}.json`)

if (!existsSync(parentFile)) {
  console.error(`✖ ${path.relative(CONTENT_ROOT, parentFile)} não existe — crie a coleção/seção antes`)
  process.exit(1)
}
if (existsSync(articleFile)) {
  console.error(`✖ ${slug}.json já existe`)
  process.exit(1)
}

const depth = parts.length === 2 ? '../../..' : '../../../..'
const article = {
  $schema: `${depth}/.vscode/schemas/article.schema.json`,
  title: 'Título do artigo',
  subtitle: 'Uma frase dizendo o que a pessoa consegue fazer depois de ler.',
  updatedAt: new Date().toISOString().slice(0, 10),
  tags: [],
  body: [
    { type: 'paragraph', content: 'Comece dizendo para que serve, não como funciona.' },
    { type: 'heading', level: 2, content: 'Primeiro passo' },
    { type: 'paragraph', content: 'Escreva aqui.' }
  ]
}

await writeFile(articleFile, `${JSON.stringify(article, null, 2)}\n`, 'utf8')

// Registrar na ordem explícita do pai — arquivo não listado não aparece no site.
const parent = JSON.parse(await readFile(parentFile, 'utf8')) as { articles?: string[] }
parent.articles = [...(parent.articles ?? []), slug]
await writeFile(parentFile, `${JSON.stringify(parent, null, 2)}\n`, 'utf8')

console.log(`✔ ${path.relative(process.cwd(), articleFile)} criado e registrado em ${path.basename(parentFile)}`)
