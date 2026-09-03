import type { HeadingBlock } from '#schema'

export type { Block, BlockType, NestedBlock, InlineNode, InlineContent, Mark } from '#schema'
export type {
  ArticleDoc,
  SectionDoc,
  CollectionDoc,
  ParagraphBlock,
  HeadingBlock,
  ListBlock,
  StepsBlock,
  CalloutBlock,
  ImageBlock,
  VideoBlock,
  CodeBlock,
  TableBlock,
  FaqBlock,
  LinkCardsBlock,
  DividerBlock
} from '#schema'

export interface Crumb {
  title: string
  url: string
}

export interface TocEntry {
  level: 2 | 3
  text: string
  anchor: string
}

export interface ArticleMeta {
  /** Caminho de conteúdo: "colecao/secao/artigo". É a identidade do documento. */
  path: string
  url: string
  title: string
  subtitle?: string
  updatedAt: string
  tags: string[]
  collection: string
  section?: string
}

export interface SectionMeta {
  path: string
  url: string
  title: string
  description?: string
  icon?: string
  collection: string
  articles: string[]
}

export interface CollectionMeta {
  path: string
  url: string
  title: string
  description?: string
  icon?: string
  sections: string[]
  articles: string[]
  /** Conta artigos das seções também — nunca escrito à mão. */
  articleCount: number
}

export interface UiPathTarget {
  segments: string[]
  href?: string
}

export type ContentNode =
  | { kind: 'collection'; meta: CollectionMeta }
  | { kind: 'section'; meta: SectionMeta }
  | { kind: 'article'; meta: ArticleMeta }

export interface ContentManifest {
  collections: CollectionMeta[]
  sections: Record<string, SectionMeta>
  articles: Record<string, ArticleMeta>
  featured: string[]
  popular: string[]
  uiMap: Record<string, UiPathTarget>
  /** slug antigo → caminho atual. Vira redirect no build. */
  aliases: Record<string, string>
}

export interface ResolvedRef {
  href: string
  label: string
  exists: boolean
}

/** Contexto passado a todo `buildModel`/`render`. */
export interface DocRenderContext {
  doc: ArticleMeta
  manifest: ContentManifest
  anchors: Map<HeadingBlock, string>
  resolveRef: (ref: string) => ResolvedRef
  resolveAsset: (src: string) => string
  resolveUiPath: (ref: string) => UiPathTarget | null
}
