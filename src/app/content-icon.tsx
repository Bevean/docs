import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils.ts'
import { CONTENT_ICONS } from './content-icons.ts'

const FALLBACK: LucideIcon = CONTENT_ICONS['book-open']

export function ContentIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && CONTENT_ICONS[name]) || FALLBACK
  return <Icon aria-hidden className={cn('size-4.5', className)} />
}

/** Moldura padrão do ícone: quadrado arredondado com o laranja da marca. */
export function ContentIconBadge({ name, className }: { name?: string; className?: string }) {
  return (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary',
        className
      )}
    >
      <ContentIcon name={name} />
    </span>
  )
}
