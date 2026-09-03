import type { Block } from '#schema'
import { computeAnchors } from './anchors.ts'
import type { ArticleMeta, DocRenderContext } from './content-types.ts'
import { manifest, resolveContentRef, resolveUiPath } from './content-repository.ts'

/**
 * Resolve `./assets/x.png` relativo ao artigo para uma URL servível.
 * As imagens ficam ao lado do JSON; o Vite copia `content/` para `public/`
 * através do alias configurado em vite.config.ts.
 */
function resolveAsset(docPath: string, src: string): string {
  if (/^https?:\/\//.test(src)) return src
  const dir = docPath.split('/').slice(0, -1).join('/')
  return `/content-assets/${dir}/${src.replace(/^\.\//, '')}`.replace(/\/+/g, '/')
}

export function createRenderContext(meta: ArticleMeta, body: Block[]): DocRenderContext {
  return {
    doc: meta,
    manifest,
    anchors: computeAnchors(body),
    resolveRef: resolveContentRef,
    resolveAsset: (src) => resolveAsset(meta.path, src),
    resolveUiPath
  }
}
