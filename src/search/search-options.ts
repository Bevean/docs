/**
 * Opções compartilhadas pelo build (que monta o índice) e pelo cliente (que o
 * carrega). Qualquer mudança aqui invalida o índice já publicado: suba o
 * SEARCH_INDEX_VERSION junto.
 */
export const SEARCH_INDEX_VERSION = 1

/** Palavras curtas demais para discriminar num corpus em português. */
const STOPWORDS = new Set([
  'a','o','as','os','de','da','do','das','dos','em','no','na','nos','nas','um','uma','uns','umas',
  'para','por','com','sem','que','se','ao','aos','e','ou','the','of','to'
])

export const searchOptions = {
  idField: 'path',
  fields: ['title', 'headings', 'subtitle', 'tags', 'breadcrumb', 'body'],
  storeFields: ['path', 'url', 'title', 'subtitle', 'breadcrumb', 'kind'],
  processTerm: (term: string) => {
    const normalized = term
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
    return normalized.length < 2 || STOPWORDS.has(normalized) ? null : normalized
  }
} as const

export const searchQueryOptions = {
  // Título pesa mais que corpo: quem busca "formulário" quer o artigo de
  // formulários, não a menção de passagem em outro artigo.
  boost: { title: 6, headings: 3, subtitle: 2, tags: 2, breadcrumb: 1.5, body: 1 },
  prefix: true,
  fuzzy: 0.2,
  combineWith: 'AND'
} as const
