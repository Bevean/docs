/**
 * Cria o esqueleto de um artigo já ligado na coleção/seção certa.
 *
 * Uso: pnpm content:new ferramentas/cashback
 *      pnpm content:new configuracoes/whatsapp-oficial/conectar-numero
 */
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
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

// Seção faltando era o único passo manual do fluxo, e o mais fácil de errar: a
// profundidade do `$schema` muda com o aninhamento, e esquecer de registrar no
// pai deixa a seção invisível. O comando cria e registra; o texto fica para o autor.
if (!existsSync(parentFile) && parts.length === 3) {
  await createSection(parts[0], parts[1])
} else if (!existsSync(parentFile)) {
  console.error(
    `✖ a coleção "${parts[0]}" não existe. Crie ${path.relative(CONTENT_ROOT, parentFile)} ` +
      'e registre o slug em content/pt-BR/_index.json.'
  )
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
async function createSection(collectionSlug: string, sectionSlug: string): Promise<void> {
  const collectionFile = path.join(CONTENT_ROOT, collectionSlug, '_collection.json')
  if (!existsSync(collectionFile)) {
    console.error(`✖ a coleção "${collectionSlug}" não existe — crie-a antes da seção`)
    process.exit(1)
  }

  await mkdir(path.join(CONTENT_ROOT, collectionSlug, sectionSlug), { recursive: true })
  await writeFile(
    path.join(CONTENT_ROOT, collectionSlug, sectionSlug, '_section.json'),
    `${JSON.stringify(
      {
        $schema: '../../../../.vscode/schemas/section.schema.json',
        title: 'Título da seção',
        description: 'Uma frase dizendo o que esta seção cobre.',
        articles: []
      },
      null,
      2
    )}\n`,
    'utf8'
  )

  const collection = JSON.parse(await readFile(collectionFile, 'utf8')) as { sections?: string[] }
  collection.sections = [...(collection.sections ?? []), sectionSlug]
  await writeFile(collectionFile, `${JSON.stringify(collection, null, 2)}\n`, 'utf8')

  console.log(`✔ seção "${sectionSlug}" criada e registrada em _collection.json — preencha o título`)
}

const parent = JSON.parse(await readFile(parentFile, 'utf8')) as { articles?: string[] }
parent.articles = [...(parent.articles ?? []), slug]
await writeFile(parentFile, `${JSON.stringify(parent, null, 2)}\n`, 'utf8')

console.log(`✔ ${path.relative(process.cwd(), articleFile)} criado e registrado em ${path.basename(parentFile)}`)
