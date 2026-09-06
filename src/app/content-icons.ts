import {
  BadgePercent,
  BarChart3,
  BookOpen,
  Building2,
  Camera,
  ClipboardList,
  Contact,
  Database,
  Filter,
  Globe,
  Grid3x3,
  Link as LinkIcon,
  Mail,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Plug,
  QrCode,
  Settings,
  Smartphone,
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
  camera: Camera,
  'clipboard-list': ClipboardList,
  contact: Contact,
  database: Database,
  filter: Filter,
  globe: Globe,
  'grid-3x3': Grid3x3,
  link: LinkIcon,
  mail: Mail,
  megaphone: Megaphone,
  'message-circle': MessageCircle,
  'messages-square': MessagesSquare,
  plug: Plug,
  'qr-code': QrCode,
  settings: Settings,
  smartphone: Smartphone,
  users: Users,
  workflow: Workflow,
  wrench: Wrench
}
