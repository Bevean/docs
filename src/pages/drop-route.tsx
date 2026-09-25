import { useParams } from 'react-router'
import { NEWS_COLLECTION } from '@/content/news.ts'
import { DropPage } from './drop-page.tsx'
import { NotFoundPage } from './not-found-page.tsx'

export function DropRoute() {
  const { drop } = useParams()
  if (!drop) return <NotFoundPage />
  return <DropPage path={`${NEWS_COLLECTION}/${drop}`} />
}
