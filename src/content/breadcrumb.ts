import type { ArticleMeta, ContentManifest, Crumb } from './content-types.ts'

const HELP_BASE = '/ajuda'

/**
 * Trilha de navegação de um artigo, derivada do manifest.
 *
 * Deixou de ser materializada em cada entrada do manifest porque `collection`
 * e `section` do próprio meta já a determinam — e a versão materializada
 * repetia o título da coleção em todo artigo dela.
 *
 * As páginas de coleção e de seção montam a trilha inline: lá ela tem dois ou
 * três níveis conhecidos e não vale uma indireção.
 */
export function buildBreadcrumb(
  meta: ArticleMeta,
  manifest: Pick<ContentManifest, 'collections' | 'sections'>
): Crumb[] {
  const crumbs: Crumb[] = [{ title: 'Todas as coleções', url: HELP_BASE }]

  const collection = manifest.collections.find((c) => c.path === meta.collection)
  if (collection) crumbs.push({ title: collection.title, url: collection.url })

  const section = meta.section ? manifest.sections[meta.section] : undefined
  if (section) crumbs.push({ title: section.title, url: section.url })

  crumbs.push({ title: meta.title, url: meta.url })
  return crumbs
}
