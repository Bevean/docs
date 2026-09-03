import { useEffect } from 'react'
import { applyTheme } from './theme-store.ts'
import { useTheme } from './use-theme.ts'

/**
 * Mantém a classe `.dark` no <html> em sincronia com a escolha.
 *
 * O script inline do index.html já acerta o tema antes da primeira pintura;
 * isto cobre a troca em runtime e a mudança do tema do sistema enquanto a
 * escolha for "seguir o sistema".
 */
export function ThemeEffect() {
  const { theme } = useTheme()

  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  return null
}
