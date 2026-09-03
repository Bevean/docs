/**
 * Pré-renderiza uma página HTML por rota.
 *
 * Por que um script próprio em vez de vite-react-ssg / framework mode:
 * todas as rotas são conhecidas no build (vêm do conteúdo), não há loader e
 * nem servidor. O `<head>` de cada rota é função pura dos metadados, então
 * montá-lo aqui é mais simples e mais confiável que uma lib de head em runtime
 * — que foi justamente onde o vite-react-ssg quebrou com React 19.
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildBreadcrumb } from '../src/content/breadcrumb.ts'
import type { ContentManifest } from '../src/content/content-types.ts'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIST = path.join(ROOT, 'dist')
const DIST_SSR = path.join(ROOT, 'dist-ssr')

export interface PrerenderRoute {
  /** Caminho absoluto da rota, sem barra final. Ex.: "/ajuda/integracoes" */
  url: string
  title: string
  description?: string
  /** URL absoluta da imagem de compartilhamento. */
  image?: string
  /** Blocos JSON-LD já como objeto. */
  jsonLd?: unknown[]
  /** `false` mantém a rota fora do sitemap (404, páginas utilitárias). */
  indexable?: boolean
}

const SITE_URL = process.env.SITE_URL ?? 'https://ajuda.bevean.com'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** `</script>` dentro de JSON-LD fecharia a tag mais cedo. */
function escapeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

function renderHead(route: PrerenderRoute): string {
  const canonical = `${SITE_URL}${route.url}`
  const tags = [
    `<title>${escapeHtml(route.title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:site_name" content="Central de Ajuda Bevean">`,
    `<meta property="og:locale" content="pt_BR">`,
    `<meta property="og:title" content="${escapeHtml(route.title)}">`,
    `<meta property="og:url" content="${escapeHtml(canonical)}">`,
    `<meta name="twitter:card" content="${route.image ? 'summary_large_image' : 'summary'}">`
  ]

  if (route.description) {
    tags.push(
      `<meta name="description" content="${escapeHtml(route.description)}">`,
      `<meta property="og:description" content="${escapeHtml(route.description)}">`
    )
  }
  if (route.image) {
    tags.push(`<meta property="og:image" content="${escapeHtml(route.image)}">`)
  }
  if (route.indexable === false) {
    tags.push(`<meta name="robots" content="noindex">`)
  }
  for (const block of route.jsonLd ?? []) {
    tags.push(`<script type="application/ld+json">${escapeJsonLd(block)}</script>`)
  }

  return tags.join('\n    ')
}

/** Onde o HTML da rota vai parar: sempre `<rota>/index.html`. */
function outputPath(url: string): string {
  const clean = url.replace(/^\/+|\/+$/g, '')
  return clean ? path.join(DIST, clean, 'index.html') : path.join(DIST, 'index.html')
}

export async function prerender(routes: PrerenderRoute[]): Promise<void> {
  const template = await readFile(path.join(DIST, 'index.html'), 'utf8')
  const entry = pathToFileURL(path.join(DIST_SSR, 'entry-server.js')).href
  const { prepare, render } = (await import(entry)) as {
    prepare: (url: string) => Promise<void>
    render: (url: string) => string
  }

  if (!template.includes('<div id="root"></div>')) {
    throw new Error('index.html não tem <div id="root"></div> — o template mudou?')
  }

  for (const route of routes) {
    // O corpo do artigo é um chunk assíncrono; `render` é síncrono.
    await prepare(route.url)
    const appHtml = render(route.url)
    const html = template
      .replace('</head>', `  ${renderHead(route)}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)

    const file = outputPath(route.url)
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, html, 'utf8')
  }

  await writeSitemap(routes)
  await rm(DIST_SSR, { recursive: true, force: true })
  console.log(`[prerender] ${routes.length} páginas geradas em dist/`)
}

async function writeSitemap(routes: PrerenderRoute[]): Promise<void> {
  const urls = routes
    .filter((r) => r.indexable !== false)
    .map((r) => `  <url><loc>${escapeHtml(`${SITE_URL}${r.url}`)}</loc></url>`)
    .join('\n')

  await writeFile(
    path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    'utf8'
  )
  await writeFile(
    path.join(DIST, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
    'utf8'
  )
}

/** Toda rota do site sai do manifest — nada é escrito à mão aqui. */
function routesFromManifest(manifest: ContentManifest): PrerenderRoute[] {
  const SITE_TITLE = 'Central de Ajuda Bevean'
  const home: PrerenderRoute = {
    url: '/ajuda',
    title: 'Central de Ajuda — Bevean',
    description: 'Tutoriais, respostas rápidas e guias sobre a plataforma Bevean.',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_TITLE,
        url: `${SITE_URL}/ajuda`
      }
    ]
  }

  const collections = manifest.collections.map<PrerenderRoute>((c) => ({
    url: c.url,
    title: `${c.title} — ${SITE_TITLE}`,
    description: c.description,
    jsonLd: [breadcrumbLd([{ title: 'Todas as coleções', url: '/ajuda' }, { title: c.title, url: c.url }])]
  }))

  const sections = Object.values(manifest.sections).map<PrerenderRoute>((s) => ({
    url: s.url,
    title: `${s.title} — ${SITE_TITLE}`,
    description: s.description
  }))

  const articles = Object.values(manifest.articles).map<PrerenderRoute>((a) => ({
    url: a.url,
    title: `${a.title} — ${SITE_TITLE}`,
    description: a.subtitle,
    jsonLd: [
      breadcrumbLd(buildBreadcrumb(a, manifest)),
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: a.title,
        description: a.subtitle,
        dateModified: a.updatedAt,
        inLanguage: 'pt-BR',
        publisher: { '@type': 'Organization', name: 'Bevean' }
      }
    ]
  }))

  return [home, ...collections, ...sections, ...articles]
}

function breadcrumbLd(crumbs: { title: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.title,
      item: `${SITE_URL}${c.url}`
    }))
  }
}

/** Slug antigo → caminho atual, no formato `_redirects` (Cloudflare/Netlify). */
async function writeRedirects(manifest: ContentManifest): Promise<void> {
  const lines = Object.entries(manifest.aliases).map(
    ([alias, target]) => `/ajuda/${alias} /ajuda/${target} 301`
  )
  // `/` existe só como porta de entrada; o site vive sob /ajuda.
  lines.unshift('/ /ajuda 302')
  await writeFile(path.join(DIST, '_redirects'), `${lines.join('\n')}\n`, 'utf8')
}

const manifest: ContentManifest = JSON.parse(
  await readFile(path.join(ROOT, 'src', 'content', 'generated', 'manifest.json'), 'utf8')
)

await prerender(routesFromManifest(manifest))
await writeRedirects(manifest)
