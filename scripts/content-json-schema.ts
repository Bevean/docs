/**
 * Gera JSON Schema a partir dos schemas zod e liga no VS Code.
 *
 * É a principal mitigação do custo de escrever sem markdown: quem redige ganha
 * autocomplete dos blocos e erro sublinhado na hora, em vez de descobrir o
 * problema só quando roda o build.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import { articleZod, collectionZod, contentIndexZod, sectionZod, uiMapZod } from '../schema/content.zod.ts'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, '.vscode', 'schemas')

const SCHEMAS = {
  'article.schema.json': articleZod,
  'collection.schema.json': collectionZod,
  'section.schema.json': sectionZod,
  'index.schema.json': contentIndexZod,
  'ui-map.schema.json': uiMapZod
}

await mkdir(OUT, { recursive: true })

for (const [name, schema] of Object.entries(SCHEMAS)) {
  // `io: 'input'` porque o alvo é o arquivo escrito à mão, onde os campos com
  // default são opcionais — e não o objeto já normalizado.
  const jsonSchema = z.toJSONSchema(schema as never, { io: 'input', unrepresentable: 'any' })
  await writeFile(path.join(OUT, name), JSON.stringify(jsonSchema, null, 2), 'utf8')
}

const settingsPath = path.join(ROOT, '.vscode', 'settings.json')
await writeFile(
  settingsPath,
  JSON.stringify(
    {
      'json.schemas': [
        { fileMatch: ['/content/*/*/*.json', '/content/*/*/*/*.json'], url: './.vscode/schemas/article.schema.json' },
        { fileMatch: ['**/_collection.json'], url: './.vscode/schemas/collection.schema.json' },
        { fileMatch: ['**/_section.json'], url: './.vscode/schemas/section.schema.json' },
        { fileMatch: ['**/content/*/_index.json'], url: './.vscode/schemas/index.schema.json' },
        { fileMatch: ['**/_ui-map.json'], url: './.vscode/schemas/ui-map.schema.json' }
      ]
    },
    null,
    2
  ) + '\n',
  'utf8'
)

console.log(`✔ ${Object.keys(SCHEMAS).length} JSON Schemas gerados em .vscode/schemas/`)
