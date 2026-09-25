import { useEffect } from 'react'
import { DISPLAY_FONT_HREF } from './display-font.ts'

export function useDisplayFont(): void {
  useEffect(() => {
    if (document.querySelector(`link[href="${DISPLAY_FONT_HREF}"]`)) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = DISPLAY_FONT_HREF
    document.head.append(link)
  }, [])
}
