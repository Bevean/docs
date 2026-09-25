import { manifest } from './content-repository.ts'
import type { ArticleMeta } from './content-types.ts'

export const NEWS_COLLECTION = 'novidades'
export const NEWS_URL = `/ajuda/${NEWS_COLLECTION}`

export const dropDate = (meta: ArticleMeta): string => meta.publishedAt ?? meta.updatedAt

export function getDrops(): ArticleMeta[] {
  const collection = manifest.collections.find((c) => c.path === NEWS_COLLECTION)
  if (!collection) return []

  return collection.articles
    .map((path) => manifest.articles[path])
    .filter((a): a is ArticleMeta => Boolean(a))
    .sort((a, b) => dropDate(b).localeCompare(dropDate(a)))
}
