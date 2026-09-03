import { useEffect } from 'react'

/**
 * Atualiza title/description em navegação client-side.
 *
 * O primeiro paint já vem correto do prerender; isso cobre só o que acontece
 * depois, quando o usuário navega sem recarregar.
 */
export function useDocumentMeta(title: string, description?: string): void {
  useEffect(() => {
    document.title = title
    if (!description) return
    const tag = document.querySelector('meta[name="description"]')
    if (tag) tag.setAttribute('content', description)
  }, [title, description])
}
