import {
  BadgePercent,
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  Database,
  Globe,
  Link as LinkIcon,
  Megaphone,
  MessageCircle,
  Plug,
  Settings,
  Users,
  Workflow,
  Wrench,
  type LucideIcon
} from 'lucide-react'

/**
 * Registry explícito em vez de import dinâmico do lucide inteiro: só entra no
 * bundle o ícone que o conteúdo realmente usa. Nome desconhecido quebra o
 * `content:check`, então o fallback aqui nunca deveria aparecer em produção.
 */
export const CONTENT_ICONS: Record<string, LucideIcon> = {
  'badge-percent': BadgePercent,
  'bar-chart-3': BarChart3,
  'book-open': BookOpen,
  'building-2': Building2,
  'clipboard-list': ClipboardList,
  database: Database,
  globe: Globe,
  link: LinkIcon,
  megaphone: Megaphone,
  'message-circle': MessageCircle,
  plug: Plug,
  settings: Settings,
  users: Users,
  workflow: Workflow,
  wrench: Wrench
}
