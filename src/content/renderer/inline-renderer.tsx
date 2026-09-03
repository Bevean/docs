import { Fragment, type ReactNode } from 'react'
import type { InlineContent, InlineNode, Mark } from '#schema'
import type { DocRenderContext } from '../content-types.ts'
import { normalizeInline } from '../inline-normalize.ts'
import { DocLink, ExternalLink } from './content-link.tsx'

/** Aplica as marcas de fora para dentro, na ordem declarada. */
function applyMarks(marks: Mark[] | undefined, ctx: DocRenderContext, node: ReactNode): ReactNode {
  if (!marks?.length) return node

  return marks.reduceRight<ReactNode>((acc, mark) => {
    switch (mark.type) {
      case 'bold':
        return <strong className="font-semibold text-foreground">{acc}</strong>
      case 'italic':
        return <em>{acc}</em>
      case 'code':
        return (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.875em]">{acc}</code>
        )
      case 'link':
        return <ExternalLink href={mark.attrs.href}>{acc}</ExternalLink>
      case 'docLink':
        return (
          <DocLink refValue={mark.attrs.ref} ctx={ctx}>
            {acc}
          </DocLink>
        )
    }
  }, node)
}

function UiPath({ segments }: { segments: string[] }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[0.9em] font-medium text-foreground">
      {segments.map((segment, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span aria-hidden className="text-muted-foreground">
              ›
            </span>
          )}
          <span>{segment}</span>
        </Fragment>
      ))}
    </span>
  )
}

function InlineNodeView({ node, ctx }: { node: InlineNode; ctx: DocRenderContext }) {
  switch (node.type) {
    case 'text':
      return <>{applyMarks(node.marks, ctx, node.text)}</>

    case 'hardBreak':
      return <br />

    case 'kbd':
      return (
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.8em]">
          {node.attrs.keys.join(' + ')}
        </kbd>
      )

    case 'uiPath': {
      const segments = node.attrs.segments ?? ctx.resolveUiPath(node.attrs.ref ?? '')?.segments
      // Ref desconhecida quebra o build; aqui é só o degrade defensivo.
      if (!segments?.length) return null
      return <UiPath segments={segments} />
    }
  }
}

export function Inline({ content, ctx }: { content: InlineContent | undefined; ctx: DocRenderContext }) {
  return (
    <>
      {normalizeInline(content).map((node, i) => (
        <InlineNodeView key={i} node={node} ctx={ctx} />
      ))}
    </>
  )
}
