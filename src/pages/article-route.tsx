import { useParams } from 'react-router'
import { ArticlePage } from './article-page.tsx'
import { NotFoundPage } from './not-found-page.tsx'

export function ArticleRoute() {
  const { collection, section, article } = useParams()
  if (!collection || !section || !article) return <NotFoundPage />
  return <ArticlePage path={`${collection}/${section}/${article}`} />
}
