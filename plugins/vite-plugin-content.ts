import { execFile } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'
import type { Plugin } from 'vite'

const run = promisify(execFile)
const ROOT = path.resolve(import.meta.dirname, '..')
const CONTENT_DIR = path.join(ROOT, 'content')

/**
 * Regenera o manifest quando o conteúdo muda, em dev.
 *
 * Roda o gerador num processo separado de propósito: importar o registry aqui
 * arrastaria TSX e o alias `#schema` para dentro do bundle da config do Vite,
 * que é montado por um esbuild com resolução própria.
 */
export function contentPlugin(): Plugin {
  let regenerating: Promise<void> | null = null

  const regenerate = async () => {
    try {
      const { stdout, stderr } = await run('npx', ['tsx', 'scripts/content-generate.ts'], { cwd: ROOT })
      if (stdout.trim()) console.log(stdout.trim())
      if (stderr.trim()) console.error(stderr.trim())
    } catch (error) {
      const err = error as { stdout?: string; stderr?: string }
      console.error(`\n[conteúdo] validação falhou:\n${err.stdout ?? ''}${err.stderr ?? ''}`)
    }
  }

  return {
    name: 'bevean-content',
    apply: 'serve',
    configureServer(server) {
      server.watcher.add(CONTENT_DIR)
      server.watcher.on('all', (_event, file) => {
        if (!file.startsWith(CONTENT_DIR) || !file.endsWith('.json')) return
        regenerating ??= regenerate().finally(() => {
          regenerating = null
        })
      })
    }
  }
}
