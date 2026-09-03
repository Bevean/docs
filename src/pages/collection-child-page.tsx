import { useParams } from 'react-router'
import { getNode } from '@/content/content-repository.ts'
import { ArticlePage } from './article-page.tsx'
import { NotFoundPage } from './not-found-page.tsx'
import { SectionPage } from './section-page.tsx'

/**
 * `/ajuda/:colecao/:x` — `x` pode ser uma seção ou um artigo solto da coleção.
 * Quem desempata é o manifest, não o router. Por isso o build proíbe (R009)
 * uma seção e um artigo com o mesmo slug dentro da mesma coleção.
 */
export function CollectionChildPage() {
  const { collection, child } = useParams()
  const node = collection && child ? getNode(`${collection}/${child}`) : null

  if (!node) return <NotFoundPage />
  if (node.kind === 'section') return <SectionPage />
  if (node.kind === 'article') return <ArticlePage path={node.meta.path} />
  return <NotFoundPage />
}
