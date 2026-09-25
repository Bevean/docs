import { manifest } from './content-repository.ts'
import type { ArticleMeta } from './content-types.ts'
import { NEWS_COLLECTION } from './news-collection.ts'

export { NEWS_COLLECTION, NEWS_URL, NEWS_TITLE, NEWS_SITE_TITLE } from './news-collection.ts'

export const dropDate = (meta: ArticleMeta): string => meta.publishedAt ?? meta.updatedAt

export function getDrops(): ArticleMeta[] {
  const collection = manifest.collections.find((c) => c.path === NEWS_COLLECTION)
  if (!collection) return []

  return collection.articles
    .map((path) => manifest.articles[path])
    .filter((a): a is ArticleMeta => Boolean(a))
    .sort((a, b) => dropDate(b).localeCompare(dropDate(a)))
}
