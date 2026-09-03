import { useCallback, useSyncExternalStore } from 'react'
import {
  applyTheme,
  getServerSnapshot,
  getSnapshot,
  subscribe,
  writeTheme,
  type Theme
} from './theme-store.ts'

export type { Theme }

/**
 * O tema mora fora do React (localStorage + prefers-color-scheme), então quem
 * lê é `useSyncExternalStore` — que já resolve o snapshot do servidor e a
 * sincronia entre abas, sem `setState` dentro de efeito.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const setTheme = useCallback((next: Theme) => {
    writeTheme(next)
    applyTheme(next)
  }, [])
  return { theme, setTheme }
}
