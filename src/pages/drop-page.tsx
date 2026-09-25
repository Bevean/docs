import { use } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import type { Block, LinkCardsBlock } from '#schema'
import { useDisplayFont } from '@/app/use-display-font.ts'
import { useDocumentMeta } from '@/app/use-document-meta.ts'
import {
  getArticleDoc,
  getArticleMeta,
  loadArticleDoc
} from '@/content/content-repository.ts'
import { NEWS_SITE_TITLE, NEWS_URL, dropDate } from '@/content/news.ts'
import { createRenderContext } from '@/content/render-context.ts'
import { BlockList } from '@/content/renderer/block-renderer.tsx'
import { longDate } from '@/lib/date.ts'
import { NotFoundPage } from './not-found-page.tsx'

export function DropPage({ path }: { path: string }) {
  const meta = getArticleMeta(path)
  const doc = getArticleDoc(path) ?? (meta ? use(loadArticleDoc(path)) : undefined)

  useDisplayFont()

  useDocumentMeta(
    meta ? `${meta.title} — ${NEWS_SITE_TITLE}` : NEWS_SITE_TITLE,
    doc?.seo?.description ?? meta?.subtitle
  )

  if (!meta || !doc) return <NotFoundPage />

  const body = doc.body as Block[]
  const ctx = createRenderContext(meta, body)

  const last = body.at(-1)
  const closing = last?.type === 'linkCards' ? (last as LinkCardsBlock) : null
  const main = closing ? body.slice(0, -1) : body
  const published = dropDate(meta)

  return (
    <>
      <div className="border-b border-primary/15 bg-primary/8">
        <div className="mx-auto max-w-[860px] px-6 pb-14 pt-8">
          <Link
            to={NEWS_URL}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
          >
            <ArrowLeft aria-hidden className="size-3.5" />
            Todas as novidades
          </Link>

          <p className="mt-7 text-[12px] font-semibold uppercase tracking-[0.1em] text-primary">
            Novidades do produto
            <span aria-hidden> · </span>
            <time dateTime={published}>{longDate(published)}</time>
          </p>

          <h1 className="mt-3.5 font-serif text-[36px] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-[52px]">
            {meta.title}
          </h1>

          {meta.subtitle && (
            <p className="mt-5 max-w-[680px] text-[18px] leading-8 text-muted-foreground">
              {meta.subtitle}
            </p>
          )}

          {meta.tags.length > 0 && (
            <ul className="mt-7 flex flex-wrap gap-2">
              {meta.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-primary/25 bg-background px-3 py-1 text-[12px] font-medium text-primary"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[860px] px-6 py-14">
        <div className="drop-prose">
          <BlockList blocks={main} ctx={ctx} />
        </div>
      </div>

      {closing && (
        <div className="border-t border-border bg-card">
          <div className="mx-auto max-w-[860px] px-6 py-14">
            <h2 className="font-serif text-[28px] font-semibold tracking-tight text-foreground">
              {closing.title ?? 'Como fazer na prática'}
            </h2>
            <p className="mt-2 text-[15px] text-muted-foreground">
              As novidades contam o que mudou. O passo a passo fica na Central de Ajuda.
            </p>
            <div className="mt-7">
              <BlockList blocks={[{ ...closing, title: undefined }] as Block[]} ctx={ctx} />
            </div>

            <p className="mt-10 border-t border-border pt-6 text-[13px] text-muted-foreground">
              Publicado em <time dateTime={published}>{longDate(published)}</time>
              {meta.updatedAt !== published && (
                <>
                  {' · atualizado em '}
                  <time dateTime={meta.updatedAt}>{longDate(meta.updatedAt)}</time>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
