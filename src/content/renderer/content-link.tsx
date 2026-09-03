import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { DocRenderContext } from '../content-types.ts'

export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:no-underline"
    >
      {children}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  )
}

export function DocLink({
  refValue,
  ctx,
  children
}: {
  refValue: string
  ctx: DocRenderContext
  children: ReactNode
}) {
  const target = ctx.resolveRef(refValue)

  // Um ref órfão quebra o build; se chegou aqui em produção, degrade para texto
  // em vez de gerar um link para lugar nenhum.
  if (!target.exists) return <span>{children}</span>

  return (
    <Link to={target.href} className="text-primary underline underline-offset-2 hover:no-underline">
      {children}
    </Link>
  )
}
